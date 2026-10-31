#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox, Geckodriver, or local credentials are unavailable." }));
  process.exit(1);
}

const source = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = source.accounts?.test_admin ?? source;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-122e1-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function waitFor(predicate, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { if (await predicate()) return true; } catch { /* keep polling rendered UI */ }
    await sleep(250);
  }
  return false;
}

async function layoutMetrics() {
  return js(`
    const grid = document.querySelector('.create-grid');
    const cards = Array.from(document.querySelectorAll('.create-grid .create-card'));
    const rects = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    const tops = [...new Set(rects.map((rect) => Math.round(rect.top)))]
      .sort((a, b) => a - b)
      .map((top) => rects.filter((rect) => Math.abs(Math.round(rect.top) - top) <= 1).length);
    const overflow = Array.from(document.querySelectorAll('*')).map((node) => {
      const rect = node.getBoundingClientRect();
      const parent = node.parentElement;
      return { node: node.tagName.toLowerCase(), className: String(node.className || '').slice(0, 80), parent: parent ? parent.tagName.toLowerCase() + '.' + String(parent.className || '').slice(0, 60) : '', left: rect.left, right: rect.right, width: rect.width };
    }).filter((item) => item.width > 0 && (item.left < -1 || item.right > window.innerWidth + 1)).sort((a, b) => b.right - a.right).slice(0, 6);
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      cardCount: cards.length,
      rects,
      rowCounts: tops,
      gridWidth: grid?.getBoundingClientRect().width ?? 0,
      pageWidth: document.documentElement.scrollWidth,
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      overflow,
    };
  `);
}

try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1050, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  check("local login form renders", await waitFor(async () => Boolean(await js("return document.querySelector('form[data-member-login]');"))));
  const loginResult = await asyncJs("const done=arguments[arguments.length-1]; fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({username:arguments[0],password:arguments[1]})}).then((response)=>done({ok:response.ok,status:response.status})).catch((error)=>done({ok:false,error:String(error)}));", account.username, account.password);
  check("authenticated local session succeeds", loginResult?.ok === true, JSON.stringify(loginResult));
  const authState = await asyncJs("const done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then((response)=>done({status:response.status,ok:response.ok})).catch((error)=>done({status:0,error:String(error)}));");
  check("browser session is recognized by the Worker", authState?.status === 200, JSON.stringify(authState));
  await js("localStorage.clear(); sessionStorage.clear();");
  await driver.get(`${base}/studio/`);
  const homeRendered = await waitFor(async () => Boolean(await js("return document.querySelector('.create-grid');")));
  check("Home Create section renders", homeRendered, homeRendered ? "" : JSON.stringify(await js("return {url:location.href,title:document.title,body:(document.body?.innerText||'').slice(0,800),html:(document.documentElement?.outerHTML||'').slice(0,1200)};")));

  const titles = await js("return Array.from(document.querySelectorAll('.create-grid .create-card strong')).map((node)=>node.textContent.trim());");
  check("five production tools are present in the required order", JSON.stringify(titles) === JSON.stringify(["Live stream", "Recording", "On-Air webinar", "Notes", "Teleprompter"]), JSON.stringify(titles));

  const expectedLayouts = [
    { width: 1440, rows: [5], label: "wide desktop" },
    { width: 1000, rows: [3, 2], label: "medium desktop" },
    { width: 760, rows: [2, 2, 1], label: "tablet" },
    { width: 560, rows: [1, 1, 1, 1, 1], label: "mobile" },
  ];
  for (const expected of expectedLayouts) {
    await driver.manage().window().setRect({ width: expected.width, height: 1050, x: 20, y: 20 });
    await sleep(250);
    const metrics = await layoutMetrics();
    const rowShapeMatches = JSON.stringify(metrics.rowCounts) === JSON.stringify(expected.rows);
    const widths = metrics.rects.map((rect) => rect.width);
    const widthSpread = widths.length ? Math.max(...widths) - Math.min(...widths) : Infinity;
    check(`${expected.label} uses the expected balanced row layout`, rowShapeMatches, JSON.stringify({ expected: expected.rows, actual: metrics.rowCounts, viewport: metrics.viewport }));
    check(`${expected.label} has equal card widths within each grid`, widthSpread < 2, JSON.stringify({ widths, widthSpread }));
    check(`${expected.label} has no horizontal page overflow`, metrics.noHorizontalOverflow, JSON.stringify({ pageWidth: metrics.pageWidth, viewport: metrics.viewport.width, overflow: metrics.overflow }));
  }

  await driver.manage().window().setRect({ width: 1440, height: 1050, x: 20, y: 20 });
  const wideMetrics = await layoutMetrics();
  const tops = wideMetrics.rects.map((rect) => rect.top);
  const lefts = wideMetrics.rects.map((rect) => rect.left);
  check("wide desktop cards share one row", tops.every((top) => Math.abs(top - tops[0]) <= 1), JSON.stringify(wideMetrics));
  check("wide desktop cards use available content width", wideMetrics.gridWidth > 0 && lefts[0] >= 0 && wideMetrics.rects.at(-1).right <= wideMetrics.viewport.width + 1, JSON.stringify(wideMetrics));

  console.log(JSON.stringify({ status: results.every((result) => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122E.1", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = results.every((result) => result.passed) ? 0 : 1;
} catch (error) {
  check("Home Create layout acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122E.1", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = 1;
} finally {
  await driver.quit().catch(() => {});
}

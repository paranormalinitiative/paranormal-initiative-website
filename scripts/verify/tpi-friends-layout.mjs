#!/usr/bin/env node

// Browser regression coverage for the Friends workspace layout. It uses a
// disposable Firefox profile and a synthetic member account only. Production
// mode is opt-in and remains read-only.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FRIENDS_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const productionAcceptance = process.env.TPI_FIREFOX_ALLOW_PRODUCTION === "1" && process.env.TPI_FIREFOX_PRODUCTION_QA === "approved";
const accountKey = process.env.TPI_FRIENDS_ACCOUNT || (productionAcceptance ? "production_qa" : "local_member");
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || (productionAcceptance
  ? resolve(root, ".local-dev/qa-studioflow-prod.json")
  : resolve(root, ".local-dev/local-auth-credentials.json"));
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = productionAcceptance ? credentials : credentials?.accounts?.[accountKey];
const localOrigin = /^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base);
const productionOrigin = base === "https://paranormalinitiative.com" && productionAcceptance && accountKey === "production_qa";
if (!localOrigin && !productionOrigin) throw new Error("Friends layout verification requires the approved loopback Worker or guarded synthetic production acceptance.");
for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) throw new Error(`Required verification input is unavailable: ${file}`);
}
if (!account?.username || !account?.password) throw new Error(`Synthetic ${accountKey} account is unavailable.`);

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);
let driver;

async function loginOnOrigin() {
  return driver.executeAsyncScript(`var done=arguments[arguments.length-1], username=arguments[0], password=arguments[1];
    fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username,password:password})})
      .then(function(response){return response.json().catch(function(){return {};}).then(function(body){done({status:response.status,user:body.user||null});});})
      .catch(function(error){done({status:0,error:String(error)});});`, account.username, account.password);
}

async function waitForPage() {
  const started = Date.now();
  let lastState = null;
  while (Date.now() - started < 20_000) {
    const state = await driver.executeScript(`var panel=document.querySelector('.social-panel'), input=document.querySelector('.social-search .member-input');
      return {panel:!!panel,input:!!input,bodyClass:document.body.className};`);
    lastState = state;
    if (state.panel && state.input && state.bodyClass.includes("member-mode")) return;
    await sleep(200);
  }
  throw new Error(`Friends workspace did not finish rendering: ${JSON.stringify({ url: await driver.getCurrentUrl(), state: lastState })}`);
}

async function inspectViewport(width, height, expectedPadding) {
  await driver.manage().window().setRect({ width, height });
  await driver.navigate().refresh();
  await waitForPage();
  return driver.executeScript(`var panel=document.querySelector('.social-panel'), input=document.querySelector('.social-search .member-input'), title=document.querySelector('.member-section-title'), main=document.querySelector('.member-main'), style=getComputedStyle(panel), pr=panel.getBoundingClientRect(), ir=input.getBoundingClientRect(), tr=title.getBoundingClientRect(), mr=main.getBoundingClientRect();
    return {paddingLeft:parseFloat(style.paddingLeft),paddingRight:parseFloat(style.paddingRight),panelLeft:pr.left,panelRight:pr.right,inputLeft:ir.left,titleLeft:tr.left,mainLeft:mr.left,mainRight:mr.right,scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth};`, expectedPadding);
}

try {
  const profile = mkdtempSync(join(tmpdir(), "tpi-friends-layout-firefox-"));
  const options = new firefox.Options().setBinary(firefoxBinary).addArguments("-profile", profile, "-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });
  await driver.get(`${base}/member-login.html`);
  const login = await loginOnOrigin();
  check("Firefox authenticates the synthetic member", login?.status === 200 && Boolean(login?.user), JSON.stringify({ status: login?.status }));
  const sessionCookie = (await driver.manage().getCookies()).find((cookie) => cookie.name === "tpi_session");
  check("Firefox session cookie is scoped to the site", Boolean(sessionCookie) && sessionCookie.path === "/", JSON.stringify({ present: Boolean(sessionCookie), path: sessionCookie?.path || "" }));
  await driver.get(`${base}/friends.html`);

  const desktop = await inspectViewport(1280, 900, 24);
  check("desktop Friends panel keeps its intended 24px interior padding", desktop.paddingLeft === 24 && desktop.paddingRight === 24, JSON.stringify(desktop));
  check("desktop Friends content stays inside the panel padding", desktop.inputLeft >= desktop.panelLeft + 23 && desktop.titleLeft >= desktop.panelLeft + 23, JSON.stringify(desktop));
  check("desktop Friends panel remains inside the member content area", desktop.panelLeft >= desktop.mainLeft && desktop.panelRight <= desktop.mainRight + 1, JSON.stringify(desktop));
  check("desktop Friends has no horizontal overflow", desktop.scrollWidth <= desktop.innerWidth + 1, JSON.stringify(desktop));

  const mobile = await inspectViewport(390, 844, 18);
  check("mobile Friends panel keeps its intended 18px interior padding", mobile.paddingLeft === 18 && mobile.paddingRight === 18, JSON.stringify(mobile));
  check("mobile Friends content stays inside the panel padding", mobile.inputLeft >= mobile.panelLeft + 17 && mobile.titleLeft >= mobile.panelLeft + 17, JSON.stringify(mobile));
  check("mobile Friends has no horizontal overflow", mobile.scrollWidth <= mobile.innerWidth + 1, JSON.stringify(mobile));
} catch (error) {
  check("Friends layout browser acceptance completes", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((item) => !item.passed);
console.log(JSON.stringify({ suite: "TPI-FRIENDS-LAYOUT", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", environment: base, passed: results.length - failed.length, total: results.length, failed }, null, 2));
if (failed.length) process.exit(1);

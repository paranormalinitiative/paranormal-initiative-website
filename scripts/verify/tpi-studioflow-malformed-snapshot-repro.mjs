#!/usr/bin/env node
// TPI-STUDIOFLOW — targeted repro for the malformed browser-local snapshot
// recovery checks (lifecycle suite H3/H4). Prints the exact step at which the
// browser-local Studio switch fails so the repair can target the real cause.
// Read-only against owner data: only synthetic browser-local Studios are used.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_REPRO_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const account = credentials?.accounts?.[accountKey] || (credentials?.username && credentials?.password ? { username: credentials.username, password: credentials.password } : null);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-malformed-repro-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
let driver;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));
const log = (step, detail) => console.log(JSON.stringify({ step, ...detail }));

if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `account ${accountKey} unavailable` }));
  process.exit(1);
}

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out: ${detail}`);
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1100, x: 20, y: 20 });

  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=\"username\"]'),p=f.querySelector('input[name=\"password\"]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}))}); f.requestSubmit();", account.username, account.password);
  await waitFor("authenticated session", async () => (await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(b){return Boolean(b && b.user)})")) === true);

  await driver.get(`${base}/studio/`);
  await js("localStorage.setItem('studioflow.route', JSON.stringify('studio'));");
  await driver.navigate().refresh();
  await sleep(5000);

  // Inject a browser-local Studio whose snapshot record has mismatched identity.
  const malformedId = `broadcast-malformed-${runId}`;
  await js(`var broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');
    broadcasts.push({ id: arguments[0], title: arguments[1], kind: 'recording', createdAt: new Date().toLocaleTimeString() });
    localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts));
    var snapshots = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}');
    snapshots[arguments[0]] = { savedAt: new Date().toISOString(), state: { broadcast: { id: 'wrong-identity', title: 'Corrupt record' } } };
    localStorage.setItem('studioflow.tpiLocalStudioSnapshots.v1', JSON.stringify(snapshots));`, malformedId, `Malformed Repro ${runId}`);
  await sleep(2000);

  log("injected", {
    malformedId,
    broadcasts: await js("return (JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]') || []).map(function(b){return {id:b.id,title:b.title};})"),
    snapshotKeys: await js("return Object.keys(JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}'))")
  });

  // Open the studio selector and inspect the menu before clicking.
  const selector = await driver.findElement(By.css(".tpi-studio-selector"));
  await selector.click();
  await sleep(1200);
  const menuState = await js(`var menu = document.querySelector('.tpi-studio-menu');
    return {
      menuPresent: Boolean(menu),
      menuHidden: menu ? menu.hidden : null,
      buttons: menu ? Array.from(menu.querySelectorAll('button')).map(function(b){return {action:b.dataset.action,broadcastId:b.dataset.broadcastId,workspaceId:b.dataset.workspaceId,text:b.textContent};}) : []
    };`);
  log("menu", menuState);

  const matches = await driver.findElements(By.css(`.tpi-studio-menu button[data-action="open-local"][data-broadcast-id="${malformedId}"]`));
  log("button", { found: matches.length });
  if (!matches.length) throw new Error("malformed-snapshot Studio button not present in menu");

  await matches[0].click();
  await sleep(3500);

  log("after-click", {
    activeBroadcastId: await js("return localStorage.getItem('studioflow.activeBroadcastId')"),
    statusText: await js("return document.querySelector('.tpi-studio-status') ? document.querySelector('.tpi-studio-status').textContent : ''"),
    recovery: await js("return JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.recovery.v1') || 'null')"),
    snapshotKeysAfter: await js("return Object.keys(JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}'))"),
    selectorText: await js("return document.querySelector('.tpi-studio-selector') ? document.querySelector('.tpi-studio-selector').textContent : ''")
  });
} catch (error) {
  log("fatal", { error: safe(error) });
} finally {
  if (driver) await driver.quit().catch(() => {});
}

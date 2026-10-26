#!/usr/bin/env node
// TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 — approved Testing 123 render check.
//
// Renders the EXACT configuration now stored for the owner's Testing 123
// workspace (read-only export of its state_json) through the authenticated
// production StudioFlow interface in a disposable QA workspace, asserting the
// clean four-item default. The QA workspace is archived afterwards.
// Owner Studios are never modified; the state file stays in gitignored
// .local-dev because it contains owner configuration.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_REPRO_BASE_URL || "https://paranormalinitiative.com").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json");
const stateFile = process.env.TPI_TESTING123_STATE_FILE || resolve(repoRoot, ".local-dev/testing123-render-state.json");
const evidenceRoot = process.env.TPI_EVIDENCE_DIR || resolve(repoRoot, "docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/evidence/2026-10-25-emergency-live-repair-001");
const profile = join(mkdtempSync(join(tmpdir(), "tpi-testing123-render-")), "profile");
mkdirSync(profile, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });

if (!existsSync(credentialsFile) || !existsSync(stateFile)) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-TESTING123-RENDER", status: "BLOCKED", reason: !existsSync(stateFile) ? "state export missing" : "QA credentials missing" }));
  process.exit(1);
}
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials?.username && credentials?.password ? { username: credentials.username, password: credentials.password } : null;
const exported = JSON.parse(readFileSync(stateFile, "utf8"));
const state = exported.state_json ? JSON.parse(exported.state_json) : exported;
const runId = Date.now().toString(36);
const localBroadcastId = `studio-testing123-render-${runId}`;
const title = `Testing 123 Render Check ${runId}`;
state.broadcast = { ...state.broadcast, id: localBroadcastId, title };
let driver;

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out: ${detail}`);
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(r){return r.text().then(function(t){var b=null;try{b=t?JSON.parse(t):null}catch(e){b=t}done({status:r.status,body:b})})}).catch(function(e){done({status:0,error:String(e)})});", path, options);
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1100, x: 20, y: 20 });

  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=\"username\"]'),p=f.querySelector('input[name=\"password\"]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}))}); f.requestSubmit();", account.username, account.password);
  await waitFor("authenticated session", async () => (await asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(b){done(Boolean(b&&b.user))}).catch(function(){done(false)})")) === true);

  const created = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ localBroadcastId, title, description: "Disposable QA render check for the Testing 123 remediation.", state }) });
  const workspace = created.body?.workspace;
  check("QA workspace seeded with the exact Testing 123 configuration", created.status === 201 && Boolean(workspace?.id), `HTTP ${created.status}`);
  if (!workspace?.id) throw new Error("QA workspace could not be created.");

  await driver.get(`${base}/studio/`);
  await js("localStorage.clear(); localStorage.setItem('studioflow.tpiActiveStudioId.v1', arguments[0]); localStorage.setItem('studioflow.route', JSON.stringify('studio'));", workspace.id);
  await driver.navigate().refresh();
  await waitFor("StudioFlow application", async () => (await driver.findElements(By.css(".tpi-studio-selector"))).length > 0 && (await driver.findElements(By.css("[data-tpi-scenes-panel]"))).length > 0);
  await waitFor("workspace activation", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspace.id);
  await sleep(1500);

  const ui = await js(`return {
    selectorText: document.querySelector('.tpi-studio-selector') ? document.querySelector('.tpi-studio-selector').textContent : '',
    panelRows: Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return n.getAttribute('data-tpi-scene-panel-item');}),
    panelTitles: Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return (n.querySelector('strong')||n).textContent.trim();}).slice(0, 4),
    localMusicSlots: (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || 'null') || []).length,
    localClipSlots: (JSON.parse(localStorage.getItem('studioflow.videoClipSlots') || 'null') || []).length
  };`);
  check("the exact Testing 123 configuration renders as the clean four-item Studio", JSON.stringify(ui.panelRows) === JSON.stringify(["intro", "scene:scene-1", "scene:scene-2", "outro"]), JSON.stringify(ui));
  check("the rendered Studio carries only clean default media assignments", ui.localMusicSlots === 0 && ui.localClipSlots === 0, JSON.stringify(ui));
  check("the rendered Studio shows the stored Studio identity", ui.selectorText.includes(title), ui.selectorText);
  writeFileSync(join(evidenceRoot, "testing123-clean-state-render.png"), Buffer.from(await driver.takeScreenshot(), "base64"));
} catch (error) {
  check("Testing 123 render check completed", false, safe(error));
  try { writeFileSync(join(evidenceRoot, "testing123-clean-state-render-failure.png"), Buffer.from(await driver.takeScreenshot(), "base64")); } catch {}
} finally {
  try {
    const list = await authenticatedFetch("/api/studio/workspaces");
    const disposables = (list.body?.workspaces || []).filter((w) => String(w.title || "").startsWith("Testing 123 Render Check "));
    for (const disposable of disposables) {
      const removed = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(disposable.id)}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: disposable.version }) });
      check(`cleanup archived disposable QA workspace ${disposable.id}`, removed.status === 200, `HTTP ${removed.status}`);
    }
  } catch (error) {
    check("cleanup of disposable QA workspaces", false, safe(error));
  }
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((r) => !r.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-TESTING123-RENDER", status: failed.length ? "FAIL" : "PASS", base, sourceWorkspace: "a75afc38-c7a6-452d-9460-5d746712d411", evidenceRoot, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));

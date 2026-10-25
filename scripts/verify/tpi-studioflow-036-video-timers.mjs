#!/usr/bin/env node
// TPI-STUDIOFLOW-036 — cinematic Video Timers.
// Exercises the real authenticated workspace API and the real StudioFlow UI
// in an isolated Firefox Developer Edition profile.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_036_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = credentials?.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-036-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const themes = ["classic", "stargate", "alien", "haunted", "spirit", "evp", "itc", "vortex", "ghost"];
const durations = [10, 20, 30, 60];
const runId = Date.now().toString(36);
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);

for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-036", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-036", status: "BLOCKED", reason: "The synthetic test_admin account is unavailable." }));
  process.exit(1);
}

let driver;
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(description, predicate, timeout = 45_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out${detail ? `: ${detail}` : ""}`);
}
async function click(selector) {
  return js("var node=document.querySelector(arguments[0]); if(!node) return false; node.click(); return true;", selector);
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(response){ return response.text().then(function(text){ var body=null; try{body=text ? JSON.parse(text) : null;}catch(error){body=text;} done({status:response.status, body:body}); }); }).catch(function(error){done({status:0,error:String(error)});});", path, options);
}
async function localTimerState() {
  return js("return {theme:(document.querySelector('[data-video-timer-theme].selected')||{}).dataset?.videoTimerTheme || null, duration:(document.querySelector('.countdown-duration-row button.active')||{}).textContent?.trim() || null, grids:document.querySelectorAll('[data-video-timer-theme-grid]').length, cards:document.querySelectorAll('[data-video-timer-theme]').length, sections:document.querySelectorAll('[data-tpi-video-timer-section]').length, rows:document.querySelectorAll('.countdown-duration-row').length};");
}

try {
  const options = new firefox.Options()
    .setBinary(firefoxBinary)
    .setProfile(profile)
    .addArguments("-no-remote", "-new-instance")
    .setPreference("media.autoplay.default", 0)
    .setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1200, x: 20, y: 20 });

  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
  check("isolated Firefox session authenticates", true);

  const title = `TPI-036 Timer Regression ${runId}`;
  const localBroadcastId = `tpi-036-timers-${runId}`;
  const state = {
    broadcast: { id: localBroadcastId, title, description: "Disposable timer regression studio", status: "draft", visibility: "private" },
    settings: { programOrientation: "landscape" },
    configuration: { programOrientation: "landscape", videoTimerTheme: "stargate", videoTimerDuration: 60, videoClipSlots: [], backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} }
  };
  const created = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title, localBroadcastId, state }) });
  const workspaceId = created.body?.workspace?.id;
  check("server creates disposable timer workspace", created.status === 201 && Boolean(workspaceId), `HTTP ${created.status}`);
  if (!workspaceId) throw new Error("Disposable timer workspace was not created.");

  await driver.get(`${base}/studio/`);
  await js("var id=arguments[0], title=arguments[1]; localStorage.setItem('studioflow.tpiActiveStudioId.v1', id); localStorage.setItem('studioflow.activeBroadcastId', JSON.stringify(id)); localStorage.setItem('studioflow.route', JSON.stringify('studio')); localStorage.setItem('studioflow.broadcasts', JSON.stringify([{id:id,title:title,status:'draft',kind:'live'}]));", workspaceId, title);
  await driver.navigate().refresh();
  await waitFor("StudioFlow Video Timers section", async () => (await count('[data-tpi-video-timer-section]')) === 1 && (await count('[data-video-timer-theme]')) === 9);
  try {
    await waitFor("server timer selection hydration", async () => { const stateNow = await localTimerState(); return stateNow.theme === "stargate" && stateNow.duration === "60s"; });
  } catch (error) {
    const diagnostic = await js("return {url:location.href, activeStudio:localStorage.getItem('studioflow.tpiActiveStudioId.v1'), activeBroadcast:localStorage.getItem('studioflow.activeBroadcastId'), timer:arguments[0], body:(document.body&&document.body.innerText||'').slice(0,700)};", await localTimerState());
    throw new Error(`${error.message}; diagnostic=${JSON.stringify(diagnostic)}`);
  }
  check("server-saved timer selection hydrates into StudioFlow", JSON.stringify(await localTimerState()));

  const initial = await localTimerState();
  const rowDetails = await js("return Array.from(document.querySelectorAll('.countdown-duration-row')).map(function(node){var style=getComputedStyle(node); return {visible:style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0, parent:node.parentElement?.className || '', section:node.closest('section')?.dataset?.tpiVideoTimerSection || null, html:node.outerHTML.slice(0,220)};});");
  const visibleRows = rowDetails.filter((row) => row.visible && row.parent === "countdown-duration-row tpi-native-video-timer-controls").length;
  check("exactly nine timer cards, one grid, one visible duration row", initial.cards === 9 && initial.grids === 1 && initial.sections === 1 && visibleRows === 1, JSON.stringify({ ...initial, visibleRows, rowDetails }));
  check("approved timer order is stable", JSON.stringify(await js("return Array.from(document.querySelectorAll('[data-video-timer-theme]')).map(function(node){return node.dataset.videoTimerTheme;});")) === JSON.stringify(themes));

  for (const theme of themes) {
    await click(`[data-video-timer-theme="${theme}"]`);
    await waitFor(`${theme} selection`, async () => (await localTimerState()).theme === theme);
    const selected = await localTimerState();
    check(`${theme} selects independently`, selected.theme === theme && selected.duration === "60s" && selected.cards === 9, JSON.stringify(selected));
  }
  for (const duration of durations) {
    await click(`.countdown-duration-row button:nth-child(${durations.indexOf(duration) + 1})`);
    await waitFor(`${duration}s selection`, async () => (await localTimerState()).duration === `${duration}s`);
    const selected = await localTimerState();
    check(`${duration}s preserves the selected animation`, selected.duration === `${duration}s` && selected.theme === "ghost", JSON.stringify(selected));
  }

  const audioBefore = await count("audio");
  await click('[data-video-timer-theme="vortex"]');
  await click('.countdown-duration-row button:nth-child(2)');
  await click('button[title^="Start the 20s"]');
  await waitFor("timer program output activation", async () => (await count(".program-stage.ring-timer-active .stage-ring-timer")) === 1);
  check("selected timer enters the established program output", await count(".program-stage.ring-timer-active .stage-ring-timer") === 1);
  check("timer activation does not create audio", await count("audio") === audioBefore);
  await sleep(700);
  check("timer remains active after an animation frame window", await count(".program-stage.ring-timer-active .stage-ring-timer") === 1);
  await click(".countdown-stop");
  await waitFor("timer stop", async () => (await count(".program-stage.ring-timer-active")) === 0);
  check("timer restart and stop remain available", await count(".countdown-stop") === 0);

  await sleep(2_000);
  const callbackState = await js("return typeof window.__tpiStudioFlowVideoTimerConfiguration === 'function' ? window.__tpiStudioFlowVideoTimerConfiguration() : null;");
  const saveStatus = await js("return document.querySelector('.tpi-studio-status')?.textContent || '';");
  check("timer changes reach the workspace save callback", callbackState?.theme === "vortex" && callbackState?.duration === 20, JSON.stringify({ callbackState, saveStatus }));
  const saved = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const savedConfig = saved.body?.workspace?.state?.configuration || {};
  check("server round trip preserves selected timer theme", savedConfig.videoTimerTheme === "vortex", JSON.stringify(savedConfig));
  check("server round trip preserves selected timer duration", savedConfig.videoTimerDuration === 20, JSON.stringify(savedConfig));

  await driver.navigate().refresh();
  await waitFor("timer selection after refresh", async () => { const stateNow = await localTimerState(); return stateNow.theme === "vortex" && stateNow.duration === "20s"; });
  check("timer theme and duration survive refresh", JSON.stringify(await localTimerState()));
  check("refresh leaves one timer grid and no duplicate cards", await count('[data-video-timer-theme-grid]') === 1 && await count('[data-video-timer-theme]') === 9);

  const cleanup = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: saved.body?.workspace?.version }) });
  check("disposable timer workspace is archived", cleanup.status === 200, `HTTP ${cleanup.status}`);
} catch (error) {
  check("TPI-036 browser regression completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-036", status: failed.length ? "FAIL" : "PASS", passed: results.length - failed.length, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(failed.length ? 1 : 0);

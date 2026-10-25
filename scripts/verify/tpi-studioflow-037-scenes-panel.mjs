#!/usr/bin/env node
// TPI-STUDIOFLOW-037 — Scenes-panel structure, interaction, persistence, and
// shortcut ownership. Uses a disposable workspace and Firefox Developer Edition.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_037_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = credentials?.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-037-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const results = [];
const runId = Date.now().toString(36);
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);
for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037", status: "BLOCKED", reason: "The synthetic test_admin account is unavailable." }));
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
async function click(selector) { return js("var node=document.querySelector(arguments[0]); if(!node) return false; node.click(); return true;", selector); }
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(response){ return response.text().then(function(text){ var body=null; try{body=text ? JSON.parse(text) : null;}catch(error){body=text;} done({status:response.status, body:body}); }); }).catch(function(error){done({status:0,error:String(error)});});", path, options);
}
try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1200, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
  check("isolated Firefox session authenticates", true);

  const title = `TPI-037 Scenes Panel ${runId}`;
  const localBroadcastId = `tpi-037-scenes-${runId}`;
  const state = { broadcast: { id: localBroadcastId, title, description: "Disposable Scenes panel regression studio", status: "draft", visibility: "private" }, settings: { programOrientation: "landscape" }, configuration: { programOrientation: "landscape", videoTimerTheme: "classic", videoTimerDuration: 20, videoClipSlots: [], scenePanelItems: [], backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} } };
  const created = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title, localBroadcastId, state }) });
  const workspaceId = created.body?.workspace?.id;
  check("server creates disposable Scenes workspace", created.status === 201 && Boolean(workspaceId), `HTTP ${created.status}`);
  if (!workspaceId) throw new Error("Disposable Scenes workspace was not created.");
  await driver.get(`${base}/studio/`);
  await js("var id=arguments[0], title=arguments[1]; localStorage.setItem('studioflow.tpiActiveStudioId.v1', id); localStorage.setItem('studioflow.activeBroadcastId', JSON.stringify(id)); localStorage.setItem('studioflow.route', JSON.stringify('studio')); localStorage.setItem('studioflow.broadcasts', JSON.stringify([{id:id,title:title,status:'draft',kind:'live'}]));", workspaceId, title);
  await driver.navigate().refresh();
  await waitFor("Scenes panel", async () => (await count('[data-tpi-scenes-panel]')) === 1 && (await count('[data-tpi-scene-panel-item]')) >= 4);
  const labels = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item] strong')).map(function(node){return node.textContent.trim();});");
  check("Scenes panel has uniform production items", labels.includes("Intro Video") && labels.includes("Countdown Timer") && labels.includes("Outro Video"), JSON.stringify(labels));
  check("Scenes panel has one item surface per persisted shortcut", await count("[data-tpi-scene-panel-item] button.scene-panel-item-button") === await count("[data-tpi-scene-panel-item]"));
  check("drag handles and context controls are visible", await count(".scene-drag-handle") >= 4 && await count(".scene-item-menu-trigger") >= 4);
  const sceneButtonMetrics = await js("var intro=document.querySelector('[data-tpi-scene-panel-item=\\\"intro\\\"]'), music=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'), add=document.querySelector('.scene-panel-add-button'), sequence=document.querySelector('.scene-panel-rehearsal-button'), a=intro&&intro.getBoundingClientRect(), nodes=[music,add,sequence], rects=nodes.map(function(node){var r=node&&node.getBoundingClientRect(); return r&&{width:Math.round(r.width),height:Math.round(r.height)};}), style=music&&getComputedStyle(music); return {sameSize:rects.every(function(r){return r&&a&&r.width===Math.round(a.width)&&r.height===Math.round(a.height);}), rects:rects, borderStyle:style&&style.borderTopStyle, radius:style&&style.borderTopLeftRadius, primary:music?.querySelector('.tpi-scene-music-primary')?.textContent.trim(), secondary:music?.querySelector('.tpi-scene-music-secondary')?.textContent.trim(), iconColor:music?.querySelector('.tpi-scene-music-icon')&&getComputedStyle(music.querySelector('.tpi-scene-music-icon')).color, musicLabel:music?.getAttribute('aria-label')};");
  check("All Scenes production surfaces use the Intro Video dimensions", sceneButtonMetrics.sameSize, JSON.stringify(sceneButtonMetrics));
  check("Background Music uses a simplified label and accessible assignment details", sceneButtonMetrics.borderStyle === "solid" && sceneButtonMetrics.primary === "Background Music" && sceneButtonMetrics.secondary === "After Intro" && sceneButtonMetrics.iconColor === "rgb(117, 213, 255)" && /no track assigned/i.test(sceneButtonMetrics.musicLabel || ""), JSON.stringify(sceneButtonMetrics));

  await click('[data-tpi-scene-panel-item="timer"] .scene-panel-item-button');
  await waitFor("timer shortcut preview", async () => (await count(".program-stage.ring-timer-active .stage-ring-timer")) === 1);
  check("Countdown Timer shortcut uses the existing timer output", await count(".program-stage.ring-timer-active .stage-ring-timer") === 1);
  await click(".countdown-stop");
  await waitFor("timer preview stop", async () => (await count(".program-stage.ring-timer-active")) === 0);

  await click('[data-tpi-scene-panel-item="intro"] .scene-item-menu-trigger');
  await waitFor("intro context menu", async () => (await count(".scene-item-context-menu")) === 1);
  const menuText = await js("return document.querySelector('.scene-item-context-menu')?.innerText || '';" );
  check("Intro menu exposes only supported actions", /Preview/.test(menuText) && /Configure Opening/.test(menuText) && /Skip Opening/.test(menuText) && !/Duplicate/.test(menuText), menuText);
  await js("var buttons=Array.from(document.querySelectorAll('.scene-item-context-menu button')); var node=buttons.find(function(b){return b.textContent.includes('Skip Opening');}); if(node) node.click();");
  await sleep(3_000);
  const savedAfterSkip = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const configAfterSkip = savedAfterSkip.body?.workspace?.state?.configuration || {};
  const introConfig = Array.isArray(configAfterSkip.scenePanelItems) ? configAfterSkip.scenePanelItems.find((item) => item.id === "intro") : null;
  check("Skip Opening persists through the established workspace API", introConfig?.skipped === true, JSON.stringify(configAfterSkip.scenePanelItems));

  await driver.navigate().refresh();
  await waitFor("Scenes panel after refresh", async () => (await count('[data-tpi-scenes-panel]')) === 1);
  check("skipped opening restores without deleting the item", await count('[data-tpi-scene-panel-item="intro"].skipped') === 1 && await count('[data-tpi-scene-panel-item="intro"]') === 1);
  await click('[data-tpi-scene-panel-item="intro"] .scene-panel-item-button');
  check("skipped opening remains non-playable until included", await count('[data-tpi-scene-panel-item="intro"] .scene-panel-item-button:disabled') === 1);

  const cleanup = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: savedAfterSkip.body?.workspace?.version }) });
  check("disposable Scenes workspace is archived", cleanup.status === 200, `HTTP ${cleanup.status}`);
} catch (error) {
  check("TPI-037 browser regression completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}
const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037", status: failed.length ? "FAIL" : "PASS", passed: results.length - failed.length, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(failed.length ? 1 : 0);

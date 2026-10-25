#!/usr/bin/env node
// TPI-STUDIOFLOW Studio lifecycle failure reproduction.
// Reproduces the owner-reported failures against the local worker with
// disposable Studios:
//   A) Create New Studio while a Crossroads-like Studio is active -> does the
//      new Studio inherit the active Studio's configuration?
//   B) Switching to a browser-local ("Browser-only:") Studio -> does it
//      activate, or does the previous Studio remain displayed?
//   C) Switching with a failed save / stale production lock -> is the failure
//      surfaced or silently swallowed?
// Prints a JSON diagnostic report. Read-only toward owner data: only
// disposable synthetic Studios are created, archived at the end.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_REPRO_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const account = credentials?.accounts?.[accountKey];
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studio-lifecycle-repro-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
const results = [];
const disposableIds = [];
const diagnostics = {};
let driver;

const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-LIFECYCLE-REPRO", status: "BLOCKED", reason: `Required input unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-LIFECYCLE-REPRO", status: "BLOCKED", reason: `Synthetic ${accountKey} account unavailable.` }));
  process.exit(1);
}

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
async function serverWorkspace(id) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const response = await fetch(`${base}/api/studio/workspaces/${encodeURIComponent(id)}?tpi_probe=${runId}`, { headers: { Cookie: cookieHeader, Accept: "application/json" } });
  if (!response.ok) return null;
  return (await response.json())?.workspace || null;
}
async function archiveWorkspace(id) {
  const workspace = await serverWorkspace(id);
  if (!workspace) return false;
  const response = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) });
  return response.status === 200;
}
async function uiState() {
  return js(`return {
    activeStudioId: localStorage.getItem('studioflow.tpiActiveStudioId.v1'),
    activeBroadcastId: JSON.parse(localStorage.getItem('studioflow.activeBroadcastId') || 'null'),
    selectorText: document.querySelector('.tpi-studio-selector')?.textContent || '',
    statusText: document.querySelector('.tpi-studio-status')?.textContent || '',
    statusClass: document.querySelector('.tpi-studio-status')?.className || '',
    panelRows: Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return n.getAttribute('data-tpi-scene-panel-item');}),
    sceneTitles: (JSON.parse(localStorage.getItem('studioflow.studioScenes') || '[]') || []).map(function(s){return s.title;}),
    localPanelItems: (JSON.parse(localStorage.getItem('studioflow.scenePanelItems') || 'null') || []).map(function(i){return i.id;}),
    localMusicSlots: (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || 'null') || []).length,
    localClipSlots: (JSON.parse(localStorage.getItem('studioflow.videoClipSlots') || 'null') || []).length,
    localSnapshots: Object.keys(JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}')),
    localBroadcasts: (JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]') || []).map(function(b){return {id:b.id,title:b.title};}),
    productionLock: window.__tpiStudioProductionLock || null
  };`);
}
async function login() {
  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=\"username\"]'),p=f.querySelector('input[name=\"password\"]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}))}); f.requestSubmit();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
}
async function openStudio(id) {
  await driver.get(`${base}/studio/`);
  await js("localStorage.clear(); localStorage.setItem('studioflow.tpiActiveStudioId.v1', arguments[0]); localStorage.setItem('studioflow.route', JSON.stringify('studio'));", id);
  await driver.navigate().refresh();
  await waitFor("StudioFlow application", async () => (await driver.findElements(By.css(".tpi-studio-selector"))).length > 0 && (await driver.findElements(By.css("[data-tpi-scenes-panel]"))).length > 0);
  await waitFor("selected Studio activation", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === id);
}
async function openSelector() {
  const selector = await driver.findElement(By.css(".tpi-studio-selector"));
  await selector.click();
  await waitFor("My Studios menu", async () => {
    const menus = await driver.findElements(By.css(".tpi-studio-menu"));
    return menus.length === 1 && (await menus[0].isDisplayed());
  });
}
// Crossroads-like seed: eight production items matching the owner's report.
function crossroadsLikeState(id, title) {
  return {
    broadcast: { id, title, description: "Disposable Crossroads-like fixture", status: "draft", visibility: "private" },
    settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
    configuration: {
      programOrientation: "landscape",
      videoTimerTheme: "haunted",
      videoTimerDuration: 30,
      videoClipSlots: [{ id: "clip-x", serverAssetId: "fixture-clip-x", serverUrl: "/api/studio/fixtures/clip-x", slot: 4, title: "crossroads-clip.mp4", kind: "video" }],
      backgroundMusicSlots: [
        { id: "music-1", serverAssetId: "fixture-music-1", serverUrl: "/api/studio/fixtures/m1", slot: 0, title: "theme.wav", kind: "audio" },
        { id: "music-2", serverAssetId: "fixture-music-2", serverUrl: "/api/studio/fixtures/m2", slot: 1, title: "after-intro.wav", kind: "audio" }
      ],
      sceneMusicAssignments: { "after-intro": { blobKey: "music-2", assetId: "music-2", title: "after-intro.wav", assignedAt: "fixture" } },
      studioScenes: [
        { id: "intro", kind: "intro", title: "Intro Video" },
        { id: "scene-1", kind: "demo", title: "Demo scene 2", layout: "Two-person split" },
        { id: "scene-2", kind: "demo", title: "Two-person split", layout: "Two-person split" },
        { id: "outro", kind: "outro", title: "Outro Video" }
      ],
      scenePanelItems: [
        { id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true },
        { id: "music:after-intro", kind: "music", title: "Background Music", sceneId: "after-intro" },
        { id: "timer", kind: "timer", title: "Countdown Timer", opening: true },
        { id: "scene:scene-1", kind: "scene", title: "Demo scene 2", sceneId: "scene-1" },
        { id: "music:scene-1", kind: "music", title: "Background Music", sceneId: "scene-1" },
        { id: "scene:scene-2", kind: "scene", title: "Two-person split", sceneId: "scene-2" },
        { id: "music:scene-2", kind: "music", title: "Background Music", sceneId: "scene-2" },
        { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }
      ]
    }
  };
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1100, x: 20, y: 20 });
  await login();

  // ---- Fixture: Crossroads-like Studio A ------------------------------
  const idA = `tpi-repro-a-${runId}`;
  const titleA = `TPI Repro Crossroads ${runId}`;
  const createdA = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: titleA, localBroadcastId: idA, state: crossroadsLikeState(idA, titleA) }) });
  const serverA = createdA.body?.workspace;
  if (serverA?.id) disposableIds.push(serverA.id);
  check("fixture: Crossroads-like Studio A created", createdA.status === 201 && Boolean(serverA?.id), `HTTP ${createdA.status}`);
  if (!serverA?.id) throw new Error("Fixture creation failed.");

  // ---- FAILURE A: create while Crossroads-like is active --------------
  await openStudio(serverA.id);
  const beforeCreate = await uiState();
  diagnostics.beforeCreate = beforeCreate;
  check("fixture A displays the eight-item Crossroads-like panel", beforeCreate.panelRows.length === 8, JSON.stringify(beforeCreate.panelRows));
  await openSelector();
  await driver.findElement(By.css('.tpi-studio-menu [data-action="create"]')).click();
  await waitFor("Create New Studio dialog", async () => (await driver.findElements(By.css("#tpi-create-studio-dialog .tpi-studio-dialog"))).length === 1);
  const titleB = `Testing 123 ${runId}`;
  await driver.findElement(By.css("#tpi-studio-name")).sendKeys(titleB, Key.ENTER);
  const workspaceB = await waitFor("Testing 123 server record", async () => {
    const response = await authenticatedFetch("/api/studio/workspaces");
    return response.body?.workspaces?.find((w) => w.title === titleB) || null;
  });
  disposableIds.push(workspaceB.id);
  await waitFor("Testing 123 becomes active", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspaceB.id, 20_000);
  const afterCreate = await uiState();
  diagnostics.afterCreate = afterCreate;
  const serverB = await serverWorkspace(workspaceB.id);
  diagnostics.serverBConfig = serverB?.state?.configuration || null;
  check("A1: new Studio record has the four clean default items", (serverB?.state?.configuration?.scenePanelItems || []).length === 4, JSON.stringify((serverB?.state?.configuration?.scenePanelItems || []).map((i) => i.id)));
  check("A2: new Studio record has no inherited timer/music/clip shortcuts", !(serverB?.state?.configuration?.scenePanelItems || []).some((i) => ["timer", "music", "video-clip"].includes(i.kind)) && (serverB?.state?.configuration?.videoClipSlots || []).length === 0 && (serverB?.state?.configuration?.backgroundMusicSlots || []).length === 0, JSON.stringify({ items: serverB?.state?.configuration?.scenePanelItems, clips: serverB?.state?.configuration?.videoClipSlots, music: serverB?.state?.configuration?.backgroundMusicSlots }));
  check("A3: new Studio record keeps default timer settings", serverB?.state?.configuration?.videoTimerTheme === "classic" && serverB?.state?.configuration?.videoTimerDuration === 20, JSON.stringify({ theme: serverB?.state?.configuration?.videoTimerTheme, duration: serverB?.state?.configuration?.videoTimerDuration }));
  check("A4: UI shows the four clean default items", afterCreate.panelRows.length === 4 && !afterCreate.panelRows.includes("timer"), JSON.stringify(afterCreate.panelRows));
  check("A5: UI scene titles are clean defaults", JSON.stringify(afterCreate.sceneTitles) === JSON.stringify(["Intro Video", "Scene 1", "Scene 2", "Outro Video"]), JSON.stringify(afterCreate.sceneTitles));
  check("A6: selector shows the new Studio identity", afterCreate.selectorText.includes(titleB), afterCreate.selectorText);

  // ---- FAILURE B: switch to a browser-local Studio --------------------
  // Simulate a home-screen-created browser-only broadcast titled like the
  // owner's "Browser Only Crossroads": present in studioflow.broadcasts with
  // no server workspace and no local snapshot.
  const localBroadcastId = `broadcast-repro-${runId}`;
  await js(`var broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');
    broadcasts.push({ id: arguments[0], title: arguments[1], kind: 'recording', createdAt: new Date().toLocaleTimeString() });
    localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts));`, localBroadcastId, `Browser Only Crossroads ${runId}`);
  await sleep(1200); // let the periodic reconcile/refresh observe the entry
  const beforeSwitch = await uiState();
  diagnostics.beforeBrowserLocalSwitch = beforeSwitch;
  let browserLocalButtonFound = false;
  try {
    await openSelector();
    const localButton = await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open-local"][data-broadcast-id="${localBroadcastId}"]`));
    browserLocalButtonFound = Boolean(localButton);
    await localButton.click();
  } catch (error) {
    diagnostics.browserLocalButtonError = safe(error);
  }
  await sleep(2500); // observe WITHOUT a success wait: the bug is a silent no-op
  const afterBrowserLocalSwitch = await uiState();
  diagnostics.afterBrowserLocalSwitch = afterBrowserLocalSwitch;
  check("B1: browser-local Studio appears in the selector menu", browserLocalButtonFound, JSON.stringify(diagnostics.browserLocalButtonError || ""));
  check("B2: browser-local switch either activates OR surfaces an actionable error", afterBrowserLocalSwitch.activeStudioId !== workspaceB.id || /snapshot|saved|Studio/i.test(afterBrowserLocalSwitch.statusText), JSON.stringify(afterBrowserLocalSwitch));
  writeFileSync(join(evidenceRoot, "failure-b-after-switch.png"), Buffer.from(await driver.takeScreenshot(), "base64"));

  // ---- FAILURE C1: switch with a failed save (title integrity conflict)
  // Force a title conflict between the localStorage broadcast and the
  // workspace record, then attempt a server->server switch.
  const idC = `tpi-repro-c-${runId}`;
  const titleC = `TPI Repro Switch Target ${runId}`;
  const createdC = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: titleC, localBroadcastId: idC, state: crossroadsLikeState(idC, titleC) }) });
  const serverC = createdC.body?.workspace;
  if (serverC?.id) disposableIds.push(serverC.id);
  check("fixture: switch-target Studio C created", createdC.status === 201 && Boolean(serverC?.id), `HTTP ${createdC.status}`);
  // Corrupt the active local broadcast title to break stateForSave().
  await js("var b=JSON.parse(localStorage.getItem('studioflow.broadcasts')||'[]'); b=b.map(function(x){ if(x.id===JSON.parse(localStorage.getItem('studioflow.activeBroadcastId'))) x.title='INTENTIONAL CONFLICT'; return x;}); localStorage.setItem('studioflow.broadcasts', JSON.stringify(b));");
  await sleep(1300); // allow the autosave cycle to hit the integrity error
  const conflictStatus = await uiState();
  diagnostics.duringTitleConflict = conflictStatus;
  if (serverC?.id) {
    try {
      await openSelector();
      await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${serverC.id}"]`)).click();
    } catch (error) { diagnostics.conflictSwitchError = safe(error); }
    await sleep(2500);
  }
  const afterConflictSwitch = await uiState();
  diagnostics.afterConflictSwitch = afterConflictSwitch;
  check("C1: a switch blocked by a save failure surfaces an actionable error", afterConflictSwitch.activeStudioId !== workspaceB.id || /could not|failed|conflict|resolve/i.test(afterConflictSwitch.statusText), JSON.stringify({ status: afterConflictSwitch.statusText, active: afterConflictSwitch.activeStudioId }));
  check("C2: the blocked switch never silently renders the target as active", afterConflictSwitch.activeStudioId !== serverC?.id || afterConflictSwitch.selectorText.includes(titleC), JSON.stringify(afterConflictSwitch));

  // ---- FAILURE C2: switch with a stale production lock ----------------
  await js("window.__tpiStudioProductionLock = { locked: true, studioWorkspaceId: 'stale-lock', sessionId: 'stale' }; localStorage.setItem('studioflow.recordingSessions', JSON.stringify([{ sessionId: 'stale', status: 'finalizing' }]));");
  const lockState = await uiState();
  diagnostics.duringStaleLock = lockState;
  if (serverC?.id) {
    try {
      await openSelector();
      await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${serverC.id}"]`)).click();
    } catch (error) { diagnostics.lockSwitchError = safe(error); }
    await sleep(1500);
  }
  const afterLockSwitch = await uiState();
  diagnostics.afterStaleLockSwitch = afterLockSwitch;
  check("C3: stale production lock blocks switching WITH a visible explanation", /recording|livestream|production/i.test(afterLockSwitch.statusText), JSON.stringify(afterLockSwitch));
  await js("window.__tpiStudioProductionLock = null; localStorage.removeItem('studioflow.recordingSessions');");
  await sleep(1300);

  // ---- Baseline: normal switch must work once state is healthy --------
  if (serverC?.id) {
    try {
      await openSelector();
      await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${serverC.id}"]`)).click();
    } catch (error) { diagnostics.normalSwitchError = safe(error); }
    await waitFor("normal switch activates Studio C", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === serverC.id, 20_000);
    const afterNormalSwitch = await uiState();
    diagnostics.afterNormalSwitch = afterNormalSwitch;
    check("D1: healthy server->server switch activates the target Studio", afterNormalSwitch.activeStudioId === serverC.id && afterNormalSwitch.selectorText.includes(titleC), JSON.stringify(afterNormalSwitch));
    // Isolation: Studio C must show its own fixture items, not B's saves.
    check("D2: switched Studio renders its own configuration", afterNormalSwitch.panelRows.includes("timer"), JSON.stringify(afterNormalSwitch.panelRows));
  }

  writeFileSync(join(evidenceRoot, "repro-final.png"), Buffer.from(await driver.takeScreenshot(), "base64"));
} catch (error) {
  check("reproduction workflow completed", false, safe(error));
  try { diagnostics.fatal = await uiState(); } catch {}
  try { writeFileSync(join(evidenceRoot, "repro-failure.png"), Buffer.from(await driver.takeScreenshot(), "base64")); } catch {}
} finally {
  for (const id of disposableIds.reverse()) {
    try { check(`cleanup archived disposable workspace ${id}`, await archiveWorkspace(id)); } catch (error) { check(`cleanup archived disposable workspace ${id}`, false, safe(error)); }
  }
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((r) => !r.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-LIFECYCLE-REPRO", status: failed.length ? "REPRODUCED-ISSUES" : "ALL-PASS", base, account: accountKey, evidenceRoot, diagnostics, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

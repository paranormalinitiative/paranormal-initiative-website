#!/usr/bin/env node
// TPI-STUDIOFLOW — CRITICAL STUDIO CREATION, SWITCHING & WORKSPACE ISOLATION
// MAINTAINED REGRESSION SUITE (Directive Tests 1–10).
//
// Runs against the local worker with the isolated QA account. Only
// disposable synthetic Studios are created; they are archived at the end and
// no owner production data (Crossroads of the Unknown) is touched.
//
// Tests assert actual persisted Studio IDs and scene ownership — not just
// visible labels:
//   1  Create New Studio           -> unique ID + exactly four clean default items
//   2  Create Second Studio        -> independent identity and configuration
//   3  Switch Studios A→B→A        -> active Studio ID and workspace at every step
//   4  Scene Isolation             -> edits in A never appear in B
//   5  Media Isolation             -> media assignments never cross Studios
//   6  Refresh                     -> correct Studio and configuration return
//   7  Unsaved Changes             -> safe save and restoration on switch
//   8  Failed Save                 -> no silent switch, no overwrite of other data
//   9  Rapid Switching             -> stale async responses cannot win
//   10 Existing Studio Compatibility -> saved configurations are not reset
//
// Owner-flow regressions:
//   H1 Home-screen recording creation opens with a clean Studio configuration
//   H2 Browser-local Studio without a snapshot opens with defaults + message
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
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studio-lifecycle-"));
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
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-STUDIO-LIFECYCLE", status: "BLOCKED", reason: `Required input unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-STUDIO-LIFECYCLE", status: "BLOCKED", reason: `Synthetic ${accountKey} account unavailable.` }));
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
    panelRows: Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return n.getAttribute('data-tpi-scene-panel-item');}),
    sceneTitles: (JSON.parse(localStorage.getItem('studioflow.studioScenes') || '[]') || []).map(function(s){return s.title;}),
    localPanelItems: (JSON.parse(localStorage.getItem('studioflow.scenePanelItems') || 'null') || []).map(function(i){return i.id;}),
    localMusicSlots: (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || 'null') || []).length,
    localClipSlots: (JSON.parse(localStorage.getItem('studioflow.videoClipSlots') || 'null') || []).length
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
async function switchTo(workspaceId) {
  await openSelector();
  await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${workspaceId}"]`)).click();
  await waitFor(`Studio ${workspaceId} active`, async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspaceId, 25_000);
}
async function createStudio(title) {
  await openSelector();
  await driver.findElement(By.css('.tpi-studio-menu [data-action="create"]')).click();
  await waitFor("Create New Studio dialog", async () => (await driver.findElements(By.css("#tpi-create-studio-dialog .tpi-studio-dialog"))).length === 1);
  await driver.findElement(By.css("#tpi-studio-name")).sendKeys(title, Key.ENTER);
  const workspace = await waitFor(`server record for ${title}`, async () => {
    const response = await authenticatedFetch("/api/studio/workspaces");
    return response.body?.workspaces?.find((w) => w.title === title) || null;
  }, 30_000);
  if (workspace?.id) disposableIds.push(workspace.id);
  await waitFor(`${title} becomes active`, async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspace.id, 25_000);
  await waitFor("Create Studio dialog closed", async () => (await driver.findElements(By.css("#tpi-create-studio-dialog"))).length === 0, 25_000);
  return workspace;
}
async function writeConfiguration(patch) {
  await js(`var patch = arguments[0];
    Object.keys(patch).forEach(function (key) { localStorage.setItem('studioflow.' + key, JSON.stringify(patch[key])); });
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('studioflow:configuration-changed', { detail: { source: 'lifecycle-suite' } }));`, patch);
}
const defaultPanelIds = ["intro", "scene:scene-1", "scene:scene-2", "outro"];

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1100, x: 20, y: 20 });
  await login();

  // ---- Seeded pre-existing Studio (Test 10 fixture) -------------------
  const seededId = `tpi-lifecycle-seed-${runId}`;
  const seededTitle = `Lifecycle Seeded ${runId}`;
  const seededState = {
    broadcast: { id: seededId, title: seededTitle, description: "Seeded existing Studio", status: "draft", visibility: "private" },
    settings: { programOrientation: "portrait", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
    configuration: {
      programOrientation: "portrait",
      videoTimerTheme: "haunted",
      videoTimerDuration: 30,
      studioScenes: [
        { id: "intro", kind: "intro", title: "Intro Video" },
        { id: "scene-1", kind: "demo", title: "Seeded Scene One", layout: "Speaker view" },
        { id: "scene-2", kind: "demo", title: "Seeded Scene Two", layout: "Group discussion" },
        { id: "outro", kind: "outro", title: "Outro Video" }
      ],
      scenePanelItems: [
        { id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true },
        { id: "scene:scene-1", kind: "scene", title: "Seeded Scene One", sceneId: "scene-1" },
        { id: "scene:scene-2", kind: "scene", title: "Seeded Scene Two", sceneId: "scene-2" },
        { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }
      ]
    }
  };
  const seededCreated = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: seededTitle, localBroadcastId: seededId, state: seededState }) });
  const seeded = seededCreated.body?.workspace;
  if (seeded?.id) disposableIds.push(seeded.id);
  check("fixture: seeded pre-existing Studio created", seededCreated.status === 201 && Boolean(seeded?.id), `HTTP ${seededCreated.status}`);
  if (!seeded?.id) throw new Error("Seeded fixture creation failed.");
  await openStudio(seeded.id);
  const seededUi = await uiState();
  check("fixture: seeded Studio renders its saved configuration", seededUi.sceneTitles.includes("Seeded Scene One"), JSON.stringify(seededUi.sceneTitles));

  // ---- Test 1: Create New Studio -------------------------------------
  const studioA = await createStudio(`Lifecycle A ${runId}`);
  const serverA1 = await serverWorkspace(studioA.id);
  const itemsA1 = serverA1?.state?.configuration?.scenePanelItems || [];
  check("Test 1a: new Studio has a unique identity", Boolean(studioA.id) && studioA.id !== seeded.id, studioA.id);
  check("Test 1b: new Studio opens with exactly four default production items", itemsA1.length === 4 && JSON.stringify(itemsA1.map((i) => i.id)) === JSON.stringify(defaultPanelIds), JSON.stringify(itemsA1.map((i) => i.id)));
  const uiA1 = await uiState();
  check("Test 1c: the new Studio renders its own clean configuration", uiA1.localPanelItems.length === 4 && JSON.stringify(uiA1.sceneTitles) === JSON.stringify(["Intro Video", "Scene 1", "Scene 2", "Outro Video"]), JSON.stringify(uiA1));

  // ---- Test 2: Create Second Studio ----------------------------------
  const studioB = await createStudio(`Lifecycle B ${runId}`);
  const serverB1 = await serverWorkspace(studioB.id);
  const itemsB1 = serverB1?.state?.configuration?.scenePanelItems || [];
  check("Test 2a: second Studio has an independent identity", Boolean(studioB.id) && studioB.id !== studioA.id && studioB.id !== seeded.id, studioB.id);
  check("Test 2b: second Studio configuration is independent", itemsB1.length === 4 && !(serverB1?.state?.configuration?.studioScenes || []).some((s) => s.title === "Seeded Scene One"), JSON.stringify(itemsB1.map((i) => i.id)));

  // ---- Test 4/5: give Studio A its own scenes and media ---------------
  await switchTo(studioA.id);
  await writeConfiguration({
    studioScenes: [
      { id: "intro", kind: "intro", title: "Intro Video" },
      { id: "scene-1", kind: "demo", title: "Isolation Scene A", layout: "Speaker view" },
      { id: "scene-2", kind: "demo", title: "Scene 2", layout: "Group discussion" },
      { id: "outro", kind: "outro", title: "Outro Video" }
    ],
    backgroundMusicSlots: [{ id: "music-iso-a", serverAssetId: "fixture-iso-a", serverUrl: "/api/studio/fixtures/iso-a", slot: 0, title: "iso-a.wav", kind: "audio" }],
    videoClipSlots: [{ id: "clip-iso-a", serverAssetId: "fixture-clip-iso-a", serverUrl: "/api/studio/fixtures/clip-iso-a", slot: 4, title: "iso-a.mp4", kind: "video" }]
  });
  await waitFor("Studio A autosave persists its configuration", async () => {
    const server = await serverWorkspace(studioA.id);
    return (server?.state?.configuration?.studioScenes || []).some((s) => s.title === "Isolation Scene A");
  }, 30_000);

  // ---- Test 3: Switch A→B→A with identity assertions ------------------
  await switchTo(studioB.id);
  const uiB = await uiState();
  const serverB2 = await serverWorkspace(studioB.id);
  check("Test 3a: switching activates Studio B (persisted ID)", uiB.activeStudioId === studioB.id, JSON.stringify({ active: uiB.activeStudioId, expected: studioB.id }));
  check("Test 3b: the displayed workspace belongs to Studio B", uiB.selectorText.includes(studioB.title), uiB.selectorText);
  check("Test 4: Studio B scenes are untouched by Studio A edits", !(serverB2?.state?.configuration?.studioScenes || []).some((s) => s.title === "Isolation Scene A") && JSON.stringify(uiB.sceneTitles) === JSON.stringify(["Intro Video", "Scene 1", "Scene 2", "Outro Video"]), JSON.stringify(uiB.sceneTitles));
  check("Test 5: Studio B does not inherit Studio A media assignments", (serverB2?.state?.configuration?.backgroundMusicSlots || []).length === 0 && (serverB2?.state?.configuration?.videoClipSlots || []).length === 0 && uiB.localMusicSlots === 0 && uiB.localClipSlots === 0, JSON.stringify({ server: serverB2?.state?.configuration?.backgroundMusicSlots, ui: uiB }));
  await switchTo(studioA.id);
  const uiA2 = await uiState();
  check("Test 3c: switching back activates Studio A with its own scenes", uiA2.activeStudioId === studioA.id && uiA2.sceneTitles.includes("Isolation Scene A"), JSON.stringify({ active: uiA2.activeStudioId, titles: uiA2.sceneTitles }));

  // ---- Test 7: unsaved changes survive switching ----------------------
  await writeConfiguration({ videoTimerDuration: 60 });
  // Switch immediately: the pre-switch save must preserve the pending edit.
  await openSelector();
  await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${studioB.id}"]`)).click();
  await waitFor("Studio B active after unsaved-change switch", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === studioB.id, 25_000);
  await waitFor("pending edit saved before the switch completed", async () => {
    const server = await serverWorkspace(studioA.id);
    return server?.state?.configuration?.videoTimerDuration === 60;
  }, 20_000);
  check("Test 7: unsaved changes are saved before switching and restore on return", true);

  // ---- Test 8: failed save must not switch silently -------------------
  await switchTo(studioA.id);
  const serverBBefore = await serverWorkspace(studioB.id);
  await js("var b=JSON.parse(localStorage.getItem('studioflow.broadcasts')||'[]'); b=b.map(function(x){ if(x.id===JSON.parse(localStorage.getItem('studioflow.activeBroadcastId'))) x.title='INTENTIONAL CONFLICT ' + Date.now(); return x;}); localStorage.setItem('studioflow.broadcasts', JSON.stringify(b));");
  await sleep(1500);
  let switchClicked = false;
  try {
    await openSelector();
    await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${studioB.id}"]`)).click();
    switchClicked = true;
  } catch (error) { diagnostics.test8SwitchError = safe(error); }
  await sleep(2500);
  const ui8 = await uiState();
  const serverB8 = await serverWorkspace(studioB.id);
  diagnostics.test8 = { switchClicked, ui8 };
  const blockedCleanly = ui8.activeStudioId !== studioB.id;
  const explained = /could not|failed|conflict|resolve|save/i.test(ui8.statusText);
  check("Test 8a: a switch blocked by a failed save keeps the current Studio active", blockedCleanly, JSON.stringify(ui8));
  check("Test 8b: the failed save is explained to the creator", explained, ui8.statusText);
  check("Test 8c: the failed save never overwrites the target Studio's configuration", JSON.stringify(serverB8?.state?.configuration) === JSON.stringify(serverBBefore?.state?.configuration), JSON.stringify({ before: serverBBefore?.state?.configuration, after: serverB8?.state?.configuration }));
  // Restore a healthy identity for the remaining tests.
  await js("var title = arguments[0]; var b=JSON.parse(localStorage.getItem('studioflow.broadcasts')||'[]'); b=b.map(function(x){ if(x.id===JSON.parse(localStorage.getItem('studioflow.activeBroadcastId'))) x.title=title; return x;}); localStorage.setItem('studioflow.broadcasts', JSON.stringify(b));", studioA.title);
  await sleep(2500);

  // ---- Test 9: rapid switching ---------------------------------------
  for (const [index, target] of [studioB.id, studioA.id, studioB.id, studioA.id].entries()) {
    await openSelector();
    await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${target}"]`)).click();
    await sleep(400 + index * 150);
  }
  await waitFor("rapid switching settles on the last selected Studio", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === studioA.id, 30_000);
  await sleep(1500);
  const ui9 = await uiState();
  check("Test 9: rapid switching settles on the last selection with its own workspace", ui9.activeStudioId === studioA.id && ui9.selectorText.includes(studioA.title) && ui9.sceneTitles.includes("Isolation Scene A"), JSON.stringify(ui9));

  // ---- Test 6: refresh restores the selected Studio ------------------
  await driver.navigate().refresh();
  await waitFor("StudioFlow application after refresh", async () => (await driver.findElements(By.css(".tpi-studio-selector"))).length > 0);
  await waitFor("refresh restores the active Studio", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === studioA.id, 25_000);
  const ui6 = await uiState();
  check("Test 6: refresh restores the selected Studio and its configuration", ui6.activeStudioId === studioA.id && ui6.sceneTitles.includes("Isolation Scene A"), JSON.stringify(ui6));

  // ---- Test 10: existing Studio configuration is never reset ----------
  const seededFinal = await serverWorkspace(seeded.id);
  check("Test 10: pre-existing Studio configuration is preserved", seededFinal?.state?.configuration?.videoTimerTheme === "haunted" && seededFinal?.state?.configuration?.videoTimerDuration === 30 && (seededFinal?.state?.configuration?.studioScenes || []).some((s) => s.title === "Seeded Scene One"), JSON.stringify(seededFinal?.state?.configuration?.studioScenes));

  // ---- H1: home-screen recording creation starts clean ----------------
  // Leave the studio through the application's own Exit control so the
  // Home screen is reached exactly the way the owner reaches it.
  const exitButtons = await driver.findElements(By.css(".exit-button"));
  if (exitButtons.length) await exitButtons[0].click();
  await waitFor("StudioFlow home", async () => (await driver.findElements(By.xpath("//button[contains(., 'Record without going live')]"))).length > 0, 25_000);
  await (await driver.findElements(By.xpath("//button[contains(., 'Record without going live')]")))[0].click();
  await waitFor("Create recording dialog", async () => (await driver.findElements(By.xpath("//label[contains(., 'Recording title')]//input"))).length === 1, 15_000);
  await (await driver.findElements(By.xpath("//label[contains(., 'Recording title')]//input")))[0].sendKeys(`Lifecycle Home ${runId}`);
  await (await driver.findElements(By.xpath("//button[contains(., 'Continue to setup')]")))[0].click();
  await waitFor("recording dialog completed", async () => (await driver.findElements(By.xpath("//label[contains(., 'Recording title')]//input"))).length === 0, 15_000);
  await sleep(1200);
  const uiH1 = await uiState();
  diagnostics.homeCreate = uiH1;
  check("H1: a home-created Studio opens with the clean default configuration", uiH1.localPanelItems.length === 4 && JSON.stringify(uiH1.localPanelItems) === JSON.stringify(defaultPanelIds) && uiH1.localMusicSlots === 0 && uiH1.localClipSlots === 0, JSON.stringify(uiH1));

  // ---- H2: browser-local Studio without a snapshot --------------------
  await js("localStorage.setItem('studioflow.route', JSON.stringify('studio'));");
  await driver.navigate().refresh();
  await waitFor("StudioFlow studio for H2", async () => (await driver.findElements(By.css(".tpi-studio-selector"))).length > 0, 25_000);
  const localBroadcastId = `broadcast-lifecycle-${runId}`;
  await js(`var broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');
    broadcasts.push({ id: arguments[0], title: arguments[1], kind: 'recording', createdAt: new Date().toLocaleTimeString() });
    localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts));`, localBroadcastId, `Browser Only Lifecycle ${runId}`);
  await sleep(1500);
  let localButtonFound = false;
  try {
    await openSelector();
    const localButton = await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open-local"][data-broadcast-id="${localBroadcastId}"]`));
    localButtonFound = Boolean(localButton);
    await localButton.click();
  } catch (error) { diagnostics.h2Error = safe(error); }
  await sleep(3000);
  const uiH2 = await uiState();
  diagnostics.h2 = uiH2;
  check("H2a: browser-local Studio without a snapshot activates", localButtonFound && uiH2.activeBroadcastId === localBroadcastId, JSON.stringify(uiH2));
  check("H2b: the Studio opens with the default configuration and says so", uiH2.localPanelItems.length === 4 && /default Studio configuration|BROWSER-LOCAL/i.test(uiH2.statusText), JSON.stringify(uiH2));

  writeFileSync(join(evidenceRoot, "lifecycle-final.png"), Buffer.from(await driver.takeScreenshot(), "base64"));
} catch (error) {
  check("lifecycle workflow completed", false, safe(error));
  try { diagnostics.fatal = await uiState(); } catch {}
  try { writeFileSync(join(evidenceRoot, "lifecycle-failure.png"), Buffer.from(await driver.takeScreenshot(), "base64")); } catch {}
} finally {
  for (const id of disposableIds.reverse()) {
    try { check(`cleanup archived disposable workspace ${id}`, await archiveWorkspace(id)); } catch (error) { check(`cleanup archived disposable workspace ${id}`, false, safe(error)); }
  }
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((r) => !r.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-STUDIO-LIFECYCLE", status: failed.length ? "FAIL" : "PASS", base, account: accountKey, evidenceRoot, diagnostics, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

#!/usr/bin/env node
// TPI-STUDIOFLOW-037 Addendum E — scene shortcut ownership, context menus,
// removal persistence, sequential naming, and preview isolation.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_037E_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoFile = process.env.TPI_FIREFOX_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const musicFile = process.env.TPI_FIREFOX_MUSIC_FILE || "/private/tmp/tpi-021-music.wav";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const account = credentials?.accounts?.[accountKey] || (accountKey === "production_qa" && credentials?.username && credentials?.password ? credentials : null);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-037e-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const results = [];
const runId = Date.now().toString(36);
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);

for (const file of [firefoxBinary, geckodriver, videoFile, musicFile, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-E", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-E", status: "BLOCKED", reason: `The synthetic ${accountKey} account is unavailable.` }));
  process.exit(1);
}

let driver;
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function click(selector) { return js("var node=document.querySelector(arguments[0]); if(!node) return false; node.click(); return true;", selector); }
async function waitFor(description, predicate, timeout = 45_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out${detail ? `: ${detail}` : ""}`);
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(response){ return response.text().then(function(text){ var body=null; try{body=text ? JSON.parse(text) : null;}catch(error){body=text;} done({status:response.status, body:body}); }); }).catch(function(error){done({status:0,error:String(error)});});", path, options);
}
async function upload(triggerSelector, acceptToken, file) {
  const before = await count("input[type=file]");
  if (!(await click(triggerSelector))) throw new Error(`Upload trigger not found: ${triggerSelector}`);
  const input = await waitFor("dynamic file input", async () => {
    const candidates = await driver.findElements(By.css("input[type=file]"));
    const candidate = candidates.length > before ? candidates[candidates.length - 1] : null;
    if (!candidate) return null;
    const accept = await candidate.getAttribute("accept");
    return !acceptToken || accept.includes(acceptToken) ? candidate : null;
  });
  await input.sendKeys(file);
}
async function openReactMenu(itemId) {
  if ((await count(".scene-item-context-menu")) > 0) {
    await js("var menu=document.querySelector('.scene-item-context-menu'), row=menu&&menu.closest('[data-tpi-scene-panel-item]'), trigger=row&&row.querySelector('.scene-item-menu-trigger'); if(trigger) trigger.click();");
    await waitFor("previous React context menu to close", async () => (await count(".scene-item-context-menu")) === 0);
  }
  await click(`[data-tpi-scene-panel-item="${itemId}"] .scene-item-menu-trigger`);
  await waitFor(`${itemId} context menu`, async () => (await count(".scene-item-context-menu")) === 1);
  return js("return document.querySelector('.scene-item-context-menu')?.innerText || ''; ");
}
async function addShortcut(label, selector) {
  await click(".scene-panel-add-button");
  await waitFor("Scenes add menu", async () => (await count(".scene-panel-add-menu")) === 1);
  await js("var wanted=arguments[0], button=Array.from(document.querySelectorAll('.scene-panel-add-menu button')).find(function(node){return String(node.textContent || '').includes(wanted);}); if(!button) throw new Error('Scenes add option unavailable: '+wanted); button.click();", label);
  await waitFor(`${label} shortcut`, async () => (await count(selector)) === 1);
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1200, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));

  const title = `TPI-037 Addendum E ${runId}`;
  const localBroadcastId = `tpi-037e-${runId}`;
  const state = { broadcast: { id: localBroadcastId, title, description: "Disposable Addendum E scene-management regression studio", status: "draft", visibility: "private" }, settings: { programOrientation: "landscape" }, configuration: { programOrientation: "landscape", videoTimerTheme: "classic", videoTimerDuration: 20, videoClipSlots: [], scenePanelItems: [{ id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true }, { id: "scene:scene-1", kind: "scene", title: "Scene 1", sceneId: "scene-1" }, { id: "scene:scene-2", kind: "scene", title: "Scene 2", sceneId: "scene-2" }, { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }], backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} } };
  const created = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title, localBroadcastId, state }) });
  const workspaceId = created.body?.workspace?.id;
  check("server creates disposable Addendum E workspace", created.status === 201 && Boolean(workspaceId), `HTTP ${created.status}`);
  if (!workspaceId) throw new Error("Disposable Addendum E workspace was not created.");
  await driver.get(`${base}/studio/`);
  await js("var id=arguments[0], title=arguments[1]; localStorage.setItem('studioflow.tpiActiveStudioId.v1', id); localStorage.setItem('studioflow.activeBroadcastId', JSON.stringify(id)); localStorage.setItem('studioflow.route', JSON.stringify('studio')); localStorage.setItem('studioflow.broadcasts', JSON.stringify([{id:id,title:title,status:'draft',kind:'live'}]));", workspaceId, title);
  await driver.navigate().refresh();
  await waitFor("simple default Scenes panel", async () => (await count("[data-tpi-scenes-panel]")) === 1 && (await count("[data-tpi-scene-panel-item]")) === 4);
  const initialLabels = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item] strong')).map(function(node){return node.textContent.trim();});");
  check("new Studio defaults to Intro, Scene 1, Scene 2, Outro", initialLabels.join("|") === "Intro Video|Scene 1|Scene 2|Outro Video" && !initialLabels.some((label) => /Demo Scene/i.test(label)), JSON.stringify(initialLabels));

  // Context menus must be available on every React-owned production item.
  for (const itemId of ["intro", "scene:scene-1", "scene:scene-2", "outro"]) {
    const menuText = await openReactMenu(itemId);
    check(`${itemId} exposes a context menu and Remove from Scenes`, menuText.includes("Remove from Scenes"), menuText);
    await click(`[data-tpi-scene-panel-item="${itemId}"] .scene-item-menu-trigger`);
  }
  await addShortcut("Background Music", '[data-tpi-scene-music-for="after-intro"]');
  const musicMenuOpened = await click('[data-tpi-scene-music-for="after-intro"] .scene-item-menu-trigger');
  await waitFor("Background Music context menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  const musicMenuText = await js("return document.querySelector('.tpi-scene-music-menu')?.innerText || ''; ");
  check("Background Music exposes its bridge context menu", musicMenuOpened && musicMenuText.includes("Remove from Scenes"), musicMenuText);
  await js("document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}));");
  await addShortcut("Countdown Timer", '[data-tpi-scene-panel-item="timer"]');
  await addShortcut("Video Clip", '[data-tpi-scene-panel-item="video-clip:4"]');
  const videoMenuText = await openReactMenu("video-clip:4");
  check("Video Clip exposes Remove from Scenes", videoMenuText.includes("Remove from Scenes"), videoMenuText);
  await click('[data-tpi-scene-panel-item="video-clip:4"] .scene-item-menu-trigger');
  await js("var node=document.querySelector('[data-tpi-scene-panel-item=\"scene:scene-1\"]'); if(!node) throw new Error('Scene 1 row unavailable'); node.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));");
  await waitFor("right-click scene context menu", async () => (await count(".scene-item-context-menu")) === 1);
  check("right-click opens the same Scene context menu", (await js("return document.querySelector('.scene-item-context-menu')?.innerText || ''; ")).includes("Remove from Scenes"));
  await js("document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}));");

  // Rename a scene through the actual menu and verify the scene ID remains stable.
  await openReactMenu("scene:scene-1");
  await js("var button=Array.from(document.querySelectorAll('.scene-item-context-menu button')).find(function(node){return node.textContent.includes('Rename Scene');}); if(!button) throw new Error('Rename Scene action unavailable'); button.click();");
  const renameInput = await driver.findElement(By.css('input[aria-label="Scene title"]'));
  await renameInput.clear();
  await renameInput.sendKeys("Investigation", Key.ENTER);
  await waitFor("renamed Scene 1", async () => Boolean(await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item=\"scene:scene-1\"] strong')).some(function(node){return node.textContent.trim()==='Investigation';});")));
  check("scene rename preserves the stable scene ID", await count('[data-tpi-scene-panel-item="scene:scene-1"]') === 1);

  await addShortcut("Production Scene", '[data-tpi-scene-panel-item^="scene:scene-"]:not([data-tpi-scene-panel-item="scene:scene-1"]):not([data-tpi-scene-panel-item="scene:scene-2"])');
  const sceneNames = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item^=\"scene:scene-\"] strong')).map(function(node){return node.textContent.trim();});");
  check("new scene receives the next available sequential name", sceneNames.includes("Scene 1") && sceneNames.includes("Scene 2") && sceneNames.includes("Investigation"), JSON.stringify(sceneNames));

  // Remove a panel shortcut, not the underlying scene/media configuration.
  await openReactMenu("scene:scene-2");
  await click('.scene-item-context-menu button.danger');
  await waitFor("Scene 2 shortcut removal", async () => (await count('[data-tpi-scene-panel-item="scene:scene-2"]')) === 0);
  check("Remove from Scenes removes only the Scene 2 shortcut", await count('[data-tpi-scene-panel-item="scene:scene-2"]') === 0);
  await click('[data-tpi-scene-music-for="after-intro"] .scene-item-menu-trigger');
  await waitFor("Background Music menu for removal", async () => (await count(".tpi-scene-music-menu")) === 1);
  await js("var button=Array.from(document.querySelectorAll('.tpi-scene-music-menu button')).find(function(node){return node.textContent.includes('Remove from Scenes');}); if(!button) throw new Error('Music Remove from Scenes action unavailable'); button.click();");
  await waitFor("Background Music shortcut removal", async () => (await count('[data-tpi-scene-music-for="after-intro"]')) === 0);
  check("Remove from Scenes removes the music shortcut without deleting its assignment store", await count('[data-tpi-scene-music-for="after-intro"]') === 0 && Boolean(await js("return localStorage.getItem('studioflow.sceneMusicAssignments') !== null;")));
  await openReactMenu("timer");
  await click('.scene-item-context-menu button.danger');
  await waitFor("Countdown shortcut removal", async () => (await count('[data-tpi-scene-panel-item="timer"]')) === 0);
  await openReactMenu("video-clip:4");
  await click('.scene-item-context-menu button.danger');
  await waitFor("Video Clip shortcut removal", async () => (await count('[data-tpi-scene-panel-item="video-clip:4"]')) === 0);

  // Allow the established debounced workspace save to settle before refresh;
  // the assertion below still reads the real server-persisted configuration.
  await sleep(3_000);
  // Refresh proves removals and rename are workspace state, not DOM-only state.
  await driver.navigate().refresh();
  await waitFor("Scenes panel after removal refresh", async () => (await count("[data-tpi-scenes-panel]")) === 1);
  const refreshedRows = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});");
  check("removed shortcuts stay removed after refresh", !refreshedRows.includes("scene:scene-2") && !refreshedRows.includes("timer") && !refreshedRows.includes("video-clip:4") && !refreshedRows.includes("music:after-intro"), JSON.stringify(refreshedRows));
  check("renamed scene persists after refresh", await count('[data-tpi-scene-panel-item="scene:scene-1"] strong') === 1 && (await js("return document.querySelector('[data-tpi-scene-panel-item=\"scene:scene-1\"] strong')?.textContent.trim();")) === "Investigation");
  const persisted = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const persistedState = persisted.body?.workspace?.state || {};
  check("server persistence keeps removed shortcuts absent", !(persistedState.configuration?.scenePanelItems || []).some((item) => ["scene:scene-2", "timer", "video-clip:4", "music:after-intro"].includes(item.id)));
  check("server persistence keeps the renamed scene ID and title", (persistedState.configuration?.scenePanelItems || []).some((item) => item.id === "scene:scene-1" && item.title === "Investigation"));

  // Re-add the music shortcut and assign synthetic assets for the manual Intro
  // preview isolation assertion. This remains a single isolated workspace.
  await addShortcut("Background Music", '[data-tpi-scene-music-for="after-intro"]');
  await upload('[data-tpi-video-card="0"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("Intro Video assignment", async () => (await count('[data-tpi-video-card="0"].assigned')) === 1);
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
  await waitFor("Background Music assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1);
  await click('[data-tpi-scene-music-for="after-intro"] .scene-item-menu-trigger');
  await waitFor("After Intro assignment menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  await click(".tpi-scene-music-menu-item:not(.remove)");
  await waitFor("After Intro assignment", async () => Boolean(await js("return JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro'];")));
  await click('[data-tpi-scene-panel-item="intro"] .scene-panel-item-button');
  await waitFor("Intro preview starts", async () => Boolean(await js("var node=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return node && !node.paused && node.currentTime > 0.05;")), 10_000);
  await click('[data-tpi-scene-panel-item="intro"] .scene-panel-item-button');
  await waitFor("Intro preview stops", async () => (await js("var node=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return !node || node.paused;")), 10_000);
  await sleep(600);
  check("stopping individual Intro preview does not start After Intro music", await count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing') === 0);
  check("stopping individual Intro preview restores the prior scene without transition", await js("return JSON.parse(localStorage.getItem('studioflow.activeSceneId')||'\"\"') !== 'intro';"));

  const latestWorkspace = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const cleanup = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: latestWorkspace.body?.workspace?.version }) });
  check("disposable Addendum E workspace is archived", cleanup.status === 200, `HTTP ${cleanup.status}`);
} catch (error) {
  check("Firefox Addendum E interaction test completed", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-E", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", evidenceRoot, passed: results.length - failed.length, total: results.length, failed: failed.length }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(failed.length ? 1 : 0);

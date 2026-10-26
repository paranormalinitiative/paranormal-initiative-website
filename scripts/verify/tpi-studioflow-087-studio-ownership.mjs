#!/usr/bin/env node
// TPI-STUDIOFLOW-087 — INDEPENDENT STUDIOS, STUDIO DASHBOARDS, AND PRODUCTION
// OWNERSHIP. Directive acceptance Tests 1–13.
//
// Runs against the local worker (or authenticated production with the isolated
// QA account) in a disposable Firefox Developer Edition profile with fake media
// devices. Only disposable synthetic Studios, productions, and recordings are
// created; they are deleted at the end and no owner production data is touched.
//
// Assertions use actual persisted Studio IDs and ownership records — not just
// visible labels:
//   1  Homepage       -> each Studio is its own card; homepage and My Studios
//                        resolve the same Studio identities
//   2  Dashboard      -> a Studio dashboard shows only its own content
//   3  Direct Entry   -> Enter Studio opens the Studio's saved configuration
//   4  Switching      -> A -> B -> A keeps configurations independent
//   5  Exit to Home   -> both Studios remain available, last active identified
//   6  Recording      -> a recording made in Studio A is stamped with A's ID
//   7  Isolation      -> the recording never appears under another Studio
//   8  Refresh        -> Studio identity and production ownership persist
//   9  Rename         -> productions stay attached to the same Studio ID
//   10 Archive        -> archive and restore lose no data
//   11 Clean Creation -> four default scenes, no inherited media or productions
//   12 Browser-local  -> browser-only Studios stay visible with snapshots intact
//   13 Preservation   -> pre-existing Studio configurations are never reset
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_087_BASE_URL || process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const productionCredentialsFile = process.env.TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json");
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-087-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
const results = [];
const diagnostics = {};
const disposableTitles = [];
let driver;

const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

function resolveAccount() {
  if (existsSync(credentialsFile)) {
    const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
    const account = credentials?.accounts?.[accountKey] || (credentials?.username && credentials?.password ? credentials : null);
    if (account?.username && account?.password) return account;
  }
  if (existsSync(productionCredentialsFile)) {
    const credentials = JSON.parse(readFileSync(productionCredentialsFile, "utf8"));
    const account = credentials?.accounts?.[accountKey] || (credentials?.username && credentials?.password ? credentials : null);
    if (account?.username && account?.password) return account;
  }
  return null;
}
const account = resolveAccount();

for (const file of [firefoxBinary, geckodriver]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-087-OWNERSHIP", status: "BLOCKED", reason: `Required input unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-087-OWNERSHIP", status: "BLOCKED", reason: `QA account ${accountKey} is unavailable.` }));
  process.exit(1);
}

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(250);
  }
  throw new Error(`${description} timed out: ${detail}`);
}
async function withElement(css, action, timeout = 20_000) {
  const started = Date.now();
  let lastError = "element not present";
  while (Date.now() - started < timeout) {
    try {
      const elements = await driver.findElements(By.css(css));
      if (elements.length) { await action(elements[0]); return true; }
    } catch (error) {
      lastError = safe(error);
      if (!/stale/i.test(lastError)) throw error;
    }
    await sleep(200);
  }
  throw new Error(`${css} interaction timed out: ${lastError}`);
}
async function click(css) { return withElement(css, (element) => element.click()); }
async function clickButtonByText(text, container = "body") {
  return await js(
    "var label = arguments[0], scope = arguments[1]; var nodes = Array.from(document.querySelectorAll(scope + ' button, ' + scope + ' summary')); var target = nodes.find(function (node) { return (node.textContent || '').trim() === label; }); if (!target) return false; target.click(); return true;",
    text,
    container
  );
}
async function buttonExists(text, container = "body") {
  return await js(
    "var label = arguments[0], scope = arguments[1]; return Array.from(document.querySelectorAll(scope + ' button, ' + scope + ' summary')).some(function (node) { return (node.textContent || '').trim() === label; });",
    text,
    container
  );
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(r){return r.text().then(function(t){var b=null;try{b=t?JSON.parse(t):null}catch(e){b=t}done({status:r.status,body:b})})}).catch(function(e){done({status:0,error:String(e)})});", path, options);
}
// Server reads run from Node with the browser session's cookies. Browser-side
// workspace GET responses are a maintained hydration channel (the asset-state
// bridge applies their configuration), so suite polling must never ride them.
async function serverFetch(path, options = {}) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${base}${path}${separator}tpi087=${runId}`, {
    method: options.method || "GET",
    headers: { Cookie: cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}
async function workspaceList(query = "") {
  const response = await serverFetch(`/api/studio/workspaces${query}`);
  return Array.isArray(response.body?.workspaces) ? response.body.workspaces : [];
}
async function workspaceByTitle(title, query = "") {
  return (await workspaceList(query)).find((workspace) => workspace?.title === title) || null;
}
// Full workspace records carry `state`; list responses do not.
async function workspaceById(id) {
  if (!id) return null;
  const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
  return response.body?.workspace || null;
}
async function deleteFixtures() {
  for (const query of ["", "?includeArchived=true", "?includeDeleted=true"]) {
    const list = await workspaceList(query);
    for (const workspace of list) {
      if (!/^TPI-087 /.test(workspace?.title || "")) continue;
      await serverFetch(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}/delete`, {
        method: "POST",
        body: { expectedVersion: workspace.version }
      }).catch(() => undefined);
    }
  }
}
async function uiState() {
  return js(`return {
    activeStudioId: localStorage.getItem('studioflow.tpiActiveStudioId.v1'),
    activeBroadcastId: JSON.parse(localStorage.getItem('studioflow.activeBroadcastId') || 'null'),
    route: JSON.parse(localStorage.getItem('studioflow.route') || '"home"'),
    selectorText: document.querySelector('.tpi-studio-selector')?.textContent || '',
    statusText: document.querySelector('.tpi-studio-status')?.textContent || '',
    sceneTitles: (JSON.parse(localStorage.getItem('studioflow.studioScenes') || '[]') || []).map(function (s) { return s.title; }),
    localPanelItems: (JSON.parse(localStorage.getItem('studioflow.scenePanelItems') || 'null') || []).map(function (i) { return i.id; }),
    localMusicSlots: (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || 'null') || []).length,
    localClipSlots: (JSON.parse(localStorage.getItem('studioflow.videoClipSlots') || 'null') || []).length
  };`);
}
async function writeConfiguration(patch) {
  await js(`var patch = arguments[0];
    Object.keys(patch).forEach(function (key) { localStorage.setItem('studioflow.' + key, JSON.stringify(patch[key])); });
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('studioflow:configuration-changed', { detail: { source: 'tpi-087-suite' } }));`, patch);
}
async function studioCards() {
  return await js(`return Array.from(document.querySelectorAll('.studio-card')).map(function (card) {
    return {
      key: card.className.indexOf(' active') >= 0 ? 'active-card' : '',
      title: (card.querySelector('.studio-card-title strong') || {}).textContent || '',
      notes: Array.from(card.querySelectorAll('.studio-card-title small')).map(function (n) { return n.textContent || ''; }),
      actions: Array.from(card.querySelectorAll('button, summary')).map(function (n) { return (n.textContent || '').trim(); })
    };
  });`);
}
async function cardIndexFor(title) {
  return Number(await js(
    "var wanted = arguments[0]; var cards = Array.from(document.querySelectorAll('.studio-card')); var index = cards.findIndex(function (card) { var strong = card.querySelector('.studio-card-title strong'); return strong && (strong.textContent || '').trim() === wanted; }); return index;",
    title
  ));
}
async function clickCardButton(title, buttonLabel) {
  return await js(
    "var wanted = arguments[0], label = arguments[1]; var cards = Array.from(document.querySelectorAll('.studio-card')); var card = cards.find(function (node) { var strong = node.querySelector('.studio-card-title strong'); return strong && (strong.textContent || '').trim() === wanted; }); if (!card) return false; var buttons = Array.from(card.querySelectorAll('button, summary')); var target = buttons.find(function (node) { return (node.textContent || '').trim() === label; }); if (!target) return false; target.click(); return true;",
    title,
    buttonLabel
  );
}
async function studioMenuTexts() {
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  const texts = await js("return Array.from(document.querySelectorAll('.tpi-studio-menu button')).map(function (node) { return (node.textContent || '').trim(); });");
  await js("document.body.click();");
  await sleep(200);
  return texts;
}
async function goHome() {
  if (await buttonExists("Create new Studio", ".home-page")) return;
  const exit = await driver.findElements(By.css(".exit-button"));
  if (exit.length) {
    await exit[0].click().catch(() => {});
  } else {
    const back = await driver.findElements(By.css(".back-button"));
    if (back.length) await back[0].click().catch(() => {});
    else await clickButtonByText("Back to Home", ".home-page").catch(() => {});
  }
  await waitFor("StudioFlow home", async () => await buttonExists("Create new Studio", ".home-page"), 25_000);
}
async function createStudioViaHome(title) {
  await goHome();
  if (!(await clickButtonByText("Create new Studio", ".home-page"))) throw new Error("Create new Studio control is unavailable on Home");
  await waitFor("Create New Studio dialog", async () => (await count(".modal")) >= 1 && await buttonExists("Create Studio"), 15_000);
  await withElement(".modal label input", (element) => element.sendKeys(title), 15_000);
  if (!(await clickButtonByText("Create Studio"))) throw new Error("Create Studio submit is unavailable");
  const workspace = await waitFor(`server record for ${title}`, async () => await workspaceByTitle(title), 30_000);
  if (workspace?.id) disposableTitles.push(title);
  await waitFor(`${title} becomes the active Studio`, async () => {
    const state = await uiState();
    return state.activeBroadcastId && workspace && (state.activeBroadcastId === workspace.localBroadcastId || state.activeBroadcastId === workspace.id);
  }, 30_000);
  await waitFor("new Studio environment opens", async () => (await count("[data-tpi-scenes-panel]")) > 0, 30_000);
  await waitForCreationSettle();
  return workspace;
}
// Creation activation and the Studio's server hydration overlap briefly; the
// chain ends with the bridge reporting the Studio as saved. Wait for that
// settle point so fixture configuration writes cannot race the hydration.
async function waitForCreationSettle() {
  await waitFor("creation chain to settle", async () => {
    const status = await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';");
    return /PROJECT SAVED/.test(status);
  }, 30_000);
  await sleep(400);
}
// Establishes a scene title and a program orientation as the Studio's saved
// configuration. A transient hydration racing the write is retried; a
// persistent revert still fails.
async function establishSceneTitle(workspaceId, sceneTitle, orientation) {
  const scenes = [
    { id: "intro", kind: "intro", title: "Intro Video" },
    { id: "scene-1", kind: "demo", title: sceneTitle, layout: "Speaker view" },
    { id: "scene-2", kind: "demo", title: "Scene 2", layout: "Group discussion" },
    { id: "outro", kind: "outro", title: "Outro Video" }
  ];
  await waitFor(`configuration "${sceneTitle}" autosaves to its server record`, async () => {
    const localTitle = await js("return (JSON.parse(localStorage.getItem('studioflow.studioScenes') || '[]')[1] || {}).title || '';");
    const localOrientation = await js("var raw = localStorage.getItem('studioflow.programOrientation'); try { var parsed = raw ? JSON.parse(raw) : null; return typeof parsed === 'string' ? parsed : (parsed && parsed.orientation) || ''; } catch (e) { return ''; }");
    if (localTitle !== sceneTitle || localOrientation !== orientation) await writeConfiguration({ studioScenes: scenes, programOrientation: orientation });
    const workspace = await workspaceById(workspaceId);
    const configuration = workspace?.state?.configuration || {};
    return (configuration.studioScenes || []).some((scene) => scene.title === sceneTitle) && configuration.programOrientation === orientation;
  }, 45_000);
}
async function createStudioViaMenu(title) {
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  await click('.tpi-studio-menu [data-action="create"]');
  await waitFor("Create New Studio dialog", async () => (await count("#tpi-create-studio-dialog")) === 1);
  await js("var input = document.querySelector('#tpi-studio-name'); input.value = arguments[0]; input.dispatchEvent(new Event('input', { bubbles: true }));", title);
  await click(".tpi-studio-dialog-submit");
  const workspace = await waitFor(`server record for ${title}`, async () => await workspaceByTitle(title), 30_000);
  if (workspace?.id) disposableTitles.push(title);
  await waitFor(`${title} becomes the active Studio`, async () => {
    const state = await uiState();
    return state.activeBroadcastId && workspace && (state.activeBroadcastId === workspace.localBroadcastId || state.activeBroadcastId === workspace.id);
  }, 30_000);
  await waitFor("Create Studio dialog closed", async () => (await count("#tpi-create-studio-dialog")) === 0, 25_000);
  await waitForCreationSettle();
  return workspace;
}
async function enterStudioFromCard(title) {
  await goHome();
  if (!(await clickCardButton(title, "Enter Studio"))) throw new Error(`Enter Studio is unavailable for ${title}`);
  await waitFor(`${title} studio environment`, async () => (await count("[data-tpi-scenes-panel]")) > 0, 30_000);
  await waitForStudioSettled();
}
// Studio activation and workspace hydration overlap briefly; wait until the
// bridge reports a saved state and the stored configuration is stable so the
// checks that follow read the Studio's settled workspace.
async function waitForStudioSettled() {
  let diagnostic = "";
  const titlesOf = (raw) => {
    try {
      return (JSON.parse(raw || "[]") || []).slice(0, 4).map((scene) => scene && scene.title);
    } catch {
      return ["<unparseable>"];
    }
  };
  await waitFor("Studio workspace to settle", async () => {
    const probe = await js(`var statusNode = document.querySelector('.tpi-studio-status');
      return {
        status: statusNode ? statusNode.textContent : null,
        assetPanelMounted: Boolean(document.querySelector('.asset-panel')),
        active: localStorage.getItem('studioflow.activeBroadcastId') || '',
        activeStudio: localStorage.getItem('studioflow.tpiActiveStudioId.v1') || '',
        productionLock: window.__tpiStudioProductionLock ? JSON.stringify(window.__tpiStudioProductionLock) : 'unset',
        localSessions: localStorage.getItem('studioflow.recordingSessions') || 'unset',
        integrity: window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.integrityReport ? JSON.stringify(window.__tpiStudioWorkspace.integrityReport()) : 'unavailable',
        scenes: localStorage.getItem('studioflow.studioScenes') || ''
      };`);
    await sleep(500);
    const second = await js("return localStorage.getItem('studioflow.studioScenes') || '';");
    const production = await authenticatedFetch("/api/studio/production/active");
    diagnostic = JSON.stringify({
      status: probe.status,
      assetPanelMounted: probe.assetPanelMounted,
      active: probe.active,
      activeStudio: probe.activeStudio,
      productionLock: probe.productionLock,
      localSessions: probe.localSessions,
      integrity: probe.integrity,
      serverProduction: production.body,
      firstTitles: titlesOf(probe.scenes),
      secondTitles: titlesOf(second),
      stable: probe.scenes === second
    });
    return Boolean(probe.status) && probe.scenes === second;
  }, 30_000).catch((error) => {
    throw new Error(`${error.message}; settle state: ${diagnostic}`);
  });
}
async function openDashboard(title) {
  await goHome();
  if (!(await clickCardButton(title, "Open Dashboard"))) throw new Error(`Open Dashboard is unavailable for ${title}`);
  await waitFor(`${title} dashboard`, async () => {
    const heading = await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';");
    return heading === title;
  }, 20_000);
}
async function dashboardSectionText(sectionTitle) {
  return await js(
    "var wanted = arguments[0]; var blocks = Array.from(document.querySelectorAll('.studio-dashboard .broadcast-table')); var headers = Array.from(document.querySelectorAll('.studio-dashboard h2')); var index = headers.findIndex(function (h) { return (h.textContent || '').trim() === wanted; }); return index >= 0 && blocks[index] ? blocks[index].textContent : '';",
    sectionTitle
  );
}
async function activeStudioKey() {
  return await js("var entry = JSON.parse(localStorage.getItem('studioflow.activeBroadcastId') || 'null'); return entry;");
}
async function broadcastRecords() {
  return await js("return JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');");
}
async function libraryRecords() {
  return await js("return JSON.parse(localStorage.getItem('studioflow.libraryItems') || '[]');");
}
async function studioEntriesViaBridge() {
  return await js("return window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.listStudios ? window.__tpiStudioWorkspace.listStudios() : [];");
}
const defaultPanelIds = ["intro", "scene:scene-1", "scene:scene-2", "outro"];

async function recordProgramOnce(recordingTitle) {
  const opened = await click('[data-studio-panel-tab="Recording"]');
  if (!opened) throw new Error("Recording rail is unavailable");
  await waitFor("Recording panel selected", async () => (await count('[data-studio-panel-tab="Recording"].selected')) === 1);
  // A program recording needs a live camera (or screen share). The fake-media
  // profile normally auto-acquires one; if the production-bar camera toggle
  // (2nd button) is still off its danger-active class, click it on.
  await waitFor("camera enabled", async () => {
    const state = await js("var buttons = document.querySelectorAll('.production-bar button'); if (buttons.length < 2) return 'missing'; var camera = buttons[1]; if (camera.className.indexOf('danger-active') >= 0) camera.click(); return camera.className.indexOf('danger-active') < 0 ? 'on' : 'off';");
    return state === "on";
  }, 20_000);
  // Start ONCE and wait; the start chain is async (checkpoint + recorder
  // setup) and a second click while it runs spawns a duplicate recorder that
  // errors the first one out. Retry only after a long quiet gap.
  const controlState = () => js("var cards = Array.from(document.querySelectorAll('.recording-panel .recording-control-card')); var card = cards.find(function (node) { return node.textContent.indexOf('Program recording') >= 0; }); if (!card) return JSON.stringify({ label: '', disabled: null, errors: [] }); var button = card.querySelector('button.wide-action'); return JSON.stringify({ label: button ? button.textContent.trim() : '', disabled: button ? button.disabled : null, errors: Array.from(document.querySelectorAll('.stage-error')).map(function (n) { return (n.textContent || '').trim(); }) });");
  let attempts = 0;
  let startDiagnostic = "";
  await waitFor("recording to start", async () => {
    const raw = await controlState();
    startDiagnostic = raw;
    const state = JSON.parse(raw);
    if (state.label === "Stop recording") return true;
    if (state.errors.length) return false;
    if (state.label === "Record program" && state.disabled === false && attempts < 2) {
      attempts += 1;
      await js("var cards = Array.from(document.querySelectorAll('.recording-panel .recording-control-card')); var card = cards.find(function (node) { return node.textContent.indexOf('Program recording') >= 0; }); if (card) { var button = card.querySelector('button.wide-action'); if (button && !button.disabled) button.click(); }");
      await sleep(8_000);
    }
    return false;
  }, 45_000).catch((error) => { throw new Error(`${error.message}; state: ${startDiagnostic}`); });
  await sleep(1500);
  const beforeStop = JSON.parse(await controlState());
  if (beforeStop.label !== "Stop recording") throw new Error(`Program recording did not stay active before stop: ${JSON.stringify(beforeStop)}`);
  await js("var cards = Array.from(document.querySelectorAll('.recording-panel .recording-control-card')); var card = cards.find(function (node) { return node.textContent.indexOf('Program recording') >= 0; }); card.querySelector('button.wide-action').click();");
  const modalCount = await waitFor("stop confirmation", async () => {
    const n = await count(".modal .delete-button");
    return n >= 1 ? n : false;
  }, 15_000).catch(async (error) => {
    const after = await controlState();
    throw new Error(`${error.message}; after stop click: ${after}`);
  });
  await click(".modal-backdrop .delete-button");
  const item = await waitFor("recording to reach the Library", async () => {
    const items = await libraryRecords();
    return items.find((entry) => entry && entry.title === recordingTitle) || null;
  }, 60_000);
  return item;
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance")
    .setPreference("media.autoplay.default", 0)
    .setPreference("media.autoplay.blocking_policy", 0)
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1100, x: 20, y: 20 });

  // ---- Authenticate ------------------------------------------------------
  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=\"username\"]'),p=f.querySelector('input[name=\"password\"]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}))}); f.requestSubmit();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
  await deleteFixtures();

  // ---- Test 13 fixture: a pre-existing Studio with deliberate settings ----
  const legacyTitle = `TPI-087 Legacy ${runId}`;
  const legacyId = `tpi-087-legacy-${runId}`;
  const legacyConfiguration = {
    programOrientation: "portrait",
    videoTimerTheme: "haunted",
    videoTimerDuration: 30,
    backgroundMusicSlots: [{ id: "music-legacy", serverAssetId: "fixture-legacy", serverUrl: "/api/studio/fixtures/legacy", slot: 0, title: "legacy.wav", kind: "audio" }],
    studioScenes: [
      { id: "intro", kind: "intro", title: "Intro Video" },
      { id: "scene-1", kind: "demo", title: "Legacy Preserved Scene", layout: "Speaker view" },
      { id: "scene-2", kind: "demo", title: "Scene 2", layout: "Group discussion" },
      { id: "outro", kind: "outro", title: "Outro Video" }
    ],
    scenePanelItems: [
      { id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true },
      { id: "scene:scene-1", kind: "scene", title: "Legacy Preserved Scene", sceneId: "scene-1" },
      { id: "scene:scene-2", kind: "scene", title: "Scene 2", sceneId: "scene-2" },
      { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }
    ]
  };
  const legacyState = {
    broadcast: { id: legacyId, title: legacyTitle, description: "Pre-existing Studio fixture", status: "draft", visibility: "private" },
    settings: { programOrientation: "portrait", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
    configuration: legacyConfiguration
  };
  const legacyCreated = await serverFetch("/api/studio/workspaces", { method: "POST", body: { title: legacyTitle, localBroadcastId: legacyId, state: legacyState } });
  const legacy = legacyCreated.body?.workspace;
  check("fixture: pre-existing Studio created", legacyCreated.status === 201 && Boolean(legacy?.id), `HTTP ${legacyCreated.status}`);
  if (!legacy?.id) throw new Error("Legacy fixture creation failed.");
  disposableTitles.push(legacyTitle);

  // ---- Test 11: clean creation through the homepage ----------------------
  await driver.get(`${base}/studio/`);
  await goHome();
  const studioA = await createStudioViaHome(`TPI-087 A ${runId}`);
  const uiA1 = await uiState();
  const keyA = uiA1.activeBroadcastId || studioA.localBroadcastId || studioA.id;
  check("Test 11a: a new Studio opens with exactly four default production items", JSON.stringify(uiA1.localPanelItems) === JSON.stringify(defaultPanelIds), JSON.stringify(uiA1.localPanelItems));
  check("Test 11b: a new Studio inherits no media assignments", uiA1.localMusicSlots === 0 && uiA1.localClipSlots === 0, JSON.stringify({ music: uiA1.localMusicSlots, clips: uiA1.localClipSlots }));
  const recordsAfterA = await broadcastRecords();
  check("Test 11c: a new Studio inherits no productions", !recordsAfterA.some((record) => record && record.studioId === keyA), JSON.stringify(recordsAfterA.filter((r) => r && r.studioId)));
  check("Test 11d: the new Studio opens immediately after creation", uiA1.activeBroadcastId === keyA, JSON.stringify({ active: uiA1.activeBroadcastId, keyA }));

  // Give Studio A its own saved configuration.
  await establishSceneTitle(studioA.id, "TPI-087 Scene A", "portrait");

  // ---- Test 2: Studio dashboard shows only its own content ---------------
  await openDashboard(`TPI-087 A ${runId}`);
  const dashboardLabels = await js("return Array.from(document.querySelectorAll('.studio-dashboard h2')).map(function (h) { return (h.textContent || '').trim(); });");
  check("Test 2a: the Studio dashboard provides its production sections", JSON.stringify(dashboardLabels) === JSON.stringify(["My Productions", "Recordings", "Studio Settings"]), JSON.stringify(dashboardLabels));
  check("Test 2b: the dashboard actions match the approved Studio workflow", await js("return Array.from(document.querySelectorAll('.studio-dashboard-actions button')).map(function (b) { return (b.textContent || '').trim(); });").then((labels) => JSON.stringify(labels) === JSON.stringify(["Enter Studio", "Create Livestream", "Start Recording", "Create Webinar"])), JSON.stringify(await js("return Array.from(document.querySelectorAll('.studio-dashboard-actions button')).map(function (b) { return (b.textContent || '').trim(); });")));

  // ---- Test 3: direct entry opens the Studio's saved configuration -------
  if (!(await clickButtonByText("Enter Studio", ".studio-dashboard"))) throw new Error("Dashboard Enter Studio is unavailable");
  await waitFor("Studio A environment from its dashboard", async () => (await count("[data-tpi-scenes-panel]")) > 0, 30_000);
  await waitForStudioSettled();
  const uiA2 = await uiState();
  check("Test 3: Enter Studio opens the Studio with its own saved configuration", uiA2.activeBroadcastId === keyA && uiA2.sceneTitles.includes("TPI-087 Scene A"), JSON.stringify(uiA2));

  // ---- Studio B through the maintained My Studios creation path ---------
  const studioB = await createStudioViaMenu(`TPI-087 B ${runId}`);
  const uiB1 = await uiState();
  const keyB = uiB1.activeBroadcastId || studioB.localBroadcastId || studioB.id;
  check("Test 11e: My Studios creation is equally clean and independent", uiB1.activeBroadcastId === keyB && JSON.stringify(uiB1.localPanelItems) === JSON.stringify(defaultPanelIds) && !uiB1.sceneTitles.includes("TPI-087 Scene A"), JSON.stringify(uiB1));
  await establishSceneTitle(studioB.id, "TPI-087 Scene B", "landscape");

  // ---- Test 1: homepage cards resolve the same Studio identities --------
  await goHome();
  const cards = await studioCards();
  const cardTitles = cards.map((card) => card.title);
  check("Test 1a: each Studio appears as its own homepage card", cardTitles.includes(`TPI-087 A ${runId}`) && cardTitles.includes(`TPI-087 B ${runId}`) && cardTitles.includes(legacyTitle), JSON.stringify(cardTitles));
  const uniqueCardKeys = await js("return Array.from(document.querySelectorAll('.studio-card')).map(function (card) { var strong = card.querySelector('.studio-card-title strong'); return (strong ? strong.textContent : '').trim(); });");
  check("Test 1b: Studio cards are distinct identities, not production titles", new Set(uniqueCardKeys).size === uniqueCardKeys.length && !uniqueCardKeys.some((title) => title.indexOf("Production") === 0), JSON.stringify(uniqueCardKeys));
  const entryTitles = (await studioEntriesViaBridge()).map((entry) => (entry && entry.title) || "").sort();
  check("Test 1c: the homepage resolves exactly the authorized Studio identities", JSON.stringify([...cardTitles].sort()) === JSON.stringify(entryTitles), JSON.stringify({ cardTitles, entryTitles }));
  const sourceNotes = await js("var wanted = arguments[0]; var card = Array.from(document.querySelectorAll('.studio-card')).find(function (node) { var strong = node.querySelector('.studio-card-title strong'); return strong && (strong.textContent || '').trim() === wanted; }); return card ? Array.from(card.querySelectorAll('.studio-card-title small')).map(function (n) { return (n.textContent || '').trim(); }) : [];", `TPI-087 A ${runId}`);
  check("Test 1d: each card states where the Studio is stored", sourceNotes.some((note) => /account|browser only/i.test(note)), JSON.stringify(sourceNotes));

  // ---- Test 4: switching keeps configurations independent ---------------
  await enterStudioFromCard(`TPI-087 A ${runId}`);
  const uiSwitchA1 = await uiState();
  const menuTexts = await studioMenuTexts();
  check("Test 1e: the My Studios dropdown lists the same identities as the homepage", menuTexts.some((text) => text.indexOf(`TPI-087 A ${runId}`) >= 0) && menuTexts.some((text) => text.indexOf(`TPI-087 B ${runId}`) >= 0) && menuTexts.some((text) => text.indexOf(legacyTitle) >= 0), JSON.stringify(menuTexts));
  await goHome();
  await enterStudioFromCard(`TPI-087 B ${runId}`);
  const uiSwitchB = await uiState();
  await goHome();
  await enterStudioFromCard(`TPI-087 A ${runId}`);
  const uiSwitchA2 = await uiState();
  check("Test 4a: Studio A opens with Studio A's configuration", uiSwitchA1.activeBroadcastId === keyA && uiSwitchA1.sceneTitles.includes("TPI-087 Scene A") && !uiSwitchA1.sceneTitles.includes("TPI-087 Scene B"), JSON.stringify(uiSwitchA1));
  check("Test 4b: Studio B opens with Studio B's configuration", uiSwitchB.activeBroadcastId === keyB && uiSwitchB.sceneTitles.includes("TPI-087 Scene B") && !uiSwitchB.sceneTitles.includes("TPI-087 Scene A"), JSON.stringify(uiSwitchB));
  check("Test 4c: switching back preserves Studio A's configuration", uiSwitchA2.activeBroadcastId === keyA && uiSwitchA2.sceneTitles.includes("TPI-087 Scene A"), JSON.stringify(uiSwitchA2));
  // Orientation is restored per Studio through workspace hydration: a bare
  // scalar workspace orientation must reach the compositor intact.
  await waitFor("Studio A portrait stage", async () => (await count(".program-stage.orientation-portrait")) === 1, 15_000);
  check("Test 4d: Studio A renders its saved portrait orientation", await count(".program-stage.orientation-portrait") === 1);
  await goHome();
  await enterStudioFromCard(`TPI-087 B ${runId}`);
  await waitFor("Studio B landscape stage", async () => (await count(".program-stage")) === 1 && (await count(".program-stage.orientation-portrait")) === 0, 15_000);
  check("Test 4e: Studio B renders its own orientation, not Studio A's", await count(".program-stage") === 1 && await count(".program-stage.orientation-portrait") === 0);
  await goHome();
  await enterStudioFromCard(`TPI-087 A ${runId}`);
  await waitFor("Studio A portrait stage restored", async () => (await count(".program-stage.orientation-portrait")) === 1, 15_000);
  check("Test 4f: switching back restores Studio A's saved orientation", await count(".program-stage.orientation-portrait") === 1);

  // ---- Test 5: exit to Home keeps every Studio available ----------------
  const exitButtons = await driver.findElements(By.css(".exit-button"));
  if (exitButtons.length) await exitButtons[0].click();
  await waitFor("StudioFlow home after exit", async () => await buttonExists("Create new Studio", ".home-page"), 25_000);
  const cardsAfterExit = await studioCards();
  const exitTitles = cardsAfterExit.map((card) => card.title);
  check("Test 5: exit to Home keeps every Studio available and identifies the last active Studio", exitTitles.includes(`TPI-087 A ${runId}`) && exitTitles.includes(`TPI-087 B ${runId}`) && (await js("return document.querySelectorAll('.studio-card.active').length;")) === 1, JSON.stringify(exitTitles));

  // ---- Test 6: a recording belongs to the Studio that produced it -------
  await enterStudioFromCard(`TPI-087 A ${runId}`);
  const recordingItem = await recordProgramOnce(`TPI-087 A ${runId}`);
  check("Test 6a: recording in Studio A completes and reaches the Library", Boolean(recordingItem) && recordingItem.source === "Program", JSON.stringify(recordingItem));
  check("Test 6b: the recording is stamped with Studio A's identity", recordingItem && recordingItem.studioId === keyA, JSON.stringify({ recordedStudioId: recordingItem?.studioId, keyA }));

  // ---- Test 7: productions carry their owning Studio's identity ---------
  await goHome();
  if (!(await clickCardButton(`TPI-087 A ${runId}`, "Open Dashboard"))) throw new Error("Open Dashboard is unavailable");
  await waitFor("Studio A dashboard", async () => (await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';")) === `TPI-087 A ${runId}`, 20_000);
  if (!(await clickButtonByText("Start Recording", ".studio-dashboard"))) throw new Error("Start Recording is unavailable on the dashboard");
  await waitFor("Create recording dialog", async () => (await count(".modal")) >= 1 && (await js("return document.querySelectorAll('select[aria-label=\"Owning Studio\"]').length;")) === 1, 15_000);
  const presetOwner = await js("return document.querySelector('select[aria-label=\"Owning Studio\"]').value;");
  check("Test 7a: dashboard creation preselects that Studio as the owner", presetOwner === keyA, JSON.stringify({ presetOwner, keyA }));
  // Real keystrokes: the modal's title input is React-controlled, so a
  // programmatic value assignment never reaches its state.
  await withElement(".modal label input", (element) => element.sendKeys(`TPI-087 Production ${runId}`), 15_000);
  if (!(await clickButtonByText("Continue to setup", ".modal"))) throw new Error("Continue to setup is unavailable");
  await waitFor("production setup", async () => (await count(".modal")) === 0, 15_000);
  const productionRecord = await waitFor("production record", async () => (await broadcastRecords()).find((record) => record && record.title === `TPI-087 Production ${runId}`) || null, 20_000)
    .catch(async (error) => {
      const titles = (await broadcastRecords()).map((record) => record && record.title);
      throw new Error(`${error.message}; broadcast titles: ${JSON.stringify(titles)}`);
    });
  check("Test 7b: the production records its owning Studio and is not a Studio", Boolean(productionRecord) && productionRecord.studioId === keyA && productionRecord.isProduction === true, JSON.stringify(productionRecord));
  const entriesAfterProduction = await studioEntriesViaBridge();
  check("Test 7c: creating a production never creates another permanent Studio", !entriesAfterProduction.some((entry) => entry && (entry.key === productionRecord?.id || entry.title === `TPI-087 Production ${runId}`)), JSON.stringify(entriesAfterProduction.map((entry) => entry && entry.title)));
  await goHome();
  const homeProductionText = await js("var table = document.querySelector('.home-page .broadcast-table'); return table ? table.textContent : '';");
  const homeCardText = await js("var grid = document.querySelector('.studio-card-grid'); return grid ? grid.textContent : '';");
  check("Test 7d: the homepage lists the production as a production, not a Studio", homeProductionText.includes(`TPI-087 Production ${runId}`) && !homeCardText.includes(`TPI-087 Production ${runId}`), JSON.stringify({ inTable: homeProductionText.includes(`TPI-087 Production ${runId}`), inCards: homeCardText.includes(`TPI-087 Production ${runId}`) }));
  const productionsOnA = await (async () => {
    await clickCardButton(`TPI-087 A ${runId}`, "Manage Productions");
    await waitFor("Studio A dashboard productions", async () => (await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';")) === `TPI-087 A ${runId}`, 20_000);
    return await dashboardSectionText("My Productions");
  })();
  const productionsOnB = await (async () => {
    await goHome();
    await clickCardButton(`TPI-087 B ${runId}`, "Manage Productions");
    await waitFor("Studio B dashboard", async () => (await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';")) === `TPI-087 B ${runId}`, 20_000);
    return await dashboardSectionText("My Productions");
  })();
  const recordingsOnB = await dashboardSectionText("Recordings");
  const recordingsOnA = await (async () => {
    await goHome();
    await clickCardButton(`TPI-087 A ${runId}`, "Manage Productions");
    await waitFor("Studio A dashboard recordings", async () => (await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';")) === `TPI-087 A ${runId}`, 20_000);
    return await dashboardSectionText("Recordings");
  })();
  check("Test 7e: the production appears on its owner's dashboard only", productionsOnA.includes(`TPI-087 Production ${runId}`) && !productionsOnB.includes(`TPI-087 Production ${runId}`), JSON.stringify({ onA: productionsOnA.includes(`TPI-087 Production ${runId}`), onB: productionsOnB.includes(`TPI-087 Production ${runId}`) }));
  check("Test 7f: the recording appears only on its owning Studio's dashboard", recordingsOnA.includes(`TPI-087 A ${runId}`) && !recordingsOnB.includes(`TPI-087 A ${runId}`), JSON.stringify({ onA: recordingsOnA.slice(0, 160), onB: recordingsOnB.slice(0, 160) }));

  // ---- Test 8: refresh preserves identity and ownership -----------------
  await goHome();
  await enterStudioFromCard(`TPI-087 A ${runId}`);
  await driver.navigate().refresh();
  await waitFor("StudioFlow after refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  const refreshed = await uiState();
  const refreshedLibrary = await libraryRecords();
  const refreshedProduction = (await broadcastRecords()).find((record) => record && record.title === `TPI-087 Production ${runId}`);
  check("Test 8a: refresh preserves the active Studio identity", refreshed.activeBroadcastId === keyA, JSON.stringify({ active: refreshed.activeBroadcastId, keyA }));
  check("Test 8b: refresh preserves recording ownership", refreshedLibrary.some((item) => item && item.studioId === keyA), JSON.stringify(refreshedLibrary.map((item) => item && item.studioId)));
  check("Test 8c: production creation and refresh preserve the Studio's own configuration", refreshed.sceneTitles.includes("TPI-087 Scene A"), JSON.stringify(refreshed.sceneTitles));
  check("Test 8c: refresh preserves production ownership", Boolean(refreshedProduction) && refreshedProduction.studioId === keyA, JSON.stringify(refreshedProduction));

  // ---- Test 9: renaming keeps productions attached to the same Studio ---
  await goHome();
  await clickCardButton(`TPI-087 A ${runId}`, "Studio Settings");
  await waitFor("Studio A settings", async () => (await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';")) === `TPI-087 A ${runId}`, 20_000);
  // Real keystrokes again: the rename draft is React-controlled and
  // pre-filled with the current title.
  await withElement(".studio-settings-block input", async (element) => {
    await element.clear();
    await element.sendKeys(`TPI-087 A Renamed ${runId}`);
  }, 15_000);
  if (!(await clickButtonByText("Rename Studio", ".studio-settings-block"))) throw new Error("Rename Studio is unavailable");
  const renamed = await waitFor("renamed Studio record", async () => await workspaceByTitle(`TPI-087 A Renamed ${runId}`), 30_000)
    .catch(async (error) => {
      const titles = (await workspaceList()).map((workspace) => workspace && workspace.title);
      const bridgeMessage = await js("return window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.lastStatusMessage ? JSON.stringify(window.__tpiStudioWorkspace.lastStatusMessage()) : 'unavailable';");
      throw new Error(`${error.message}; bridge message: ${bridgeMessage}; workspace titles: ${JSON.stringify(titles)}`);
    });
  const renamedProduction = (await broadcastRecords()).find((record) => record && record.title === `TPI-087 Production ${runId}`);
  check("Test 9: rename keeps the Studio identity and its productions attached", Boolean(renamed) && renamed.id === studioA.id && renamedProduction && renamedProduction.studioId === keyA && (await libraryRecords()).some((item) => item && item.studioId === keyA), JSON.stringify({ renamedId: renamed?.id, originalId: studioA.id, productionOwner: renamedProduction?.studioId }));

  // ---- Test 10: archive and restore without losing data -----------------
  await goHome();
  await clickCardButton(`TPI-087 B ${runId}`, "Studio Settings");
  await waitFor("Studio B settings", async () => (await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';")) === `TPI-087 B ${runId}`, 20_000);
  await clickButtonByText("Archive Studio", ".studio-settings-block");
  const archivedEntry = await waitFor("Studio B archived", async () => (await studioEntriesViaBridge()).find((entry) => entry && (entry.title === `TPI-087 B ${runId}`) && entry.archived === true) || null, 30_000)
    .catch(async (error) => {
      const bridgeMessage = await js("return window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.lastStatusMessage ? JSON.stringify(window.__tpiStudioWorkspace.lastStatusMessage()) : 'unavailable';");
      const entries = await studioEntriesViaBridge();
      throw new Error(`${error.message}; bridge message: ${bridgeMessage}; entries: ${JSON.stringify(entries.map((entry) => entry && ({ title: entry.title, archived: entry.archived, source: entry.source })))}`);
    });
  check("Test 10a: archiving hides the Studio without deleting its data", Boolean(archivedEntry) && Boolean((await workspaceByTitle(`TPI-087 B ${runId}`, "?includeArchived=true"))), JSON.stringify(archivedEntry));
  await goHome();
  await clickCardButton(`TPI-087 B ${runId}`, "More Actions");
  await waitFor("archived Studio actions", async () => await buttonExists("Restore Archived Studio", ".studio-card"), 15_000);
  await clickCardButton(`TPI-087 B ${runId}`, "Restore Archived Studio");
  const restoredEntry = await waitFor("Studio B restored", async () => {
    const entries = await studioEntriesViaBridge();
    return entries.find((entry) => entry && (entry.title === `TPI-087 B ${runId}`) && entry.archived === false) || null;
  }, 30_000).catch(async (error) => {
    const bridgeMessage = await js("return window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.lastStatusMessage ? JSON.stringify(window.__tpiStudioWorkspace.lastStatusMessage()) : 'unavailable';");
    throw new Error(`${error.message}; bridge message: ${bridgeMessage}`);
  });
  const restoredConfiguration = (await workspaceById(studioB.id))?.state?.configuration || {};
  check("Test 10b: restore returns the Studio with its configuration intact", Boolean(restoredEntry) && (restoredConfiguration.studioScenes || []).some((scene) => scene.title === "TPI-087 Scene B"), JSON.stringify((restoredConfiguration.studioScenes || []).map((scene) => scene.title)));

  // ---- Test 12: browser-local Studios stay visible and protected --------
  const browserOnlyId = `tpi-087-browser-${runId}`;
  await js("var broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]'); broadcasts.push({ id: arguments[0], title: arguments[1], kind: 'recording', createdAt: new Date().toLocaleTimeString() }); localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts)); window.dispatchEvent(new CustomEvent('tpi:studios-updated'));", browserOnlyId, `TPI-087 Browser ${runId}`);
  await waitFor("browser-only Studio card", async () => (await cardIndexFor(`TPI-087 Browser ${runId}`)) >= 0, 20_000);
  const browserCardNotes = await js("var wanted = arguments[0]; var card = Array.from(document.querySelectorAll('.studio-card')).find(function (node) { var strong = node.querySelector('.studio-card-title strong'); return strong && (strong.textContent || '').trim() === wanted; }); return card ? card.textContent : '';", `TPI-087 Browser ${runId}`);
  check("Test 12a: browser-local Studios remain visible on the homepage", browserCardNotes.includes("saved in this browser only"), browserCardNotes.slice(0, 200));
  await enterStudioFromCard(`TPI-087 Browser ${runId}`);
  const browserActive = await activeStudioKey();
  const snapshotWritten = await js("var snapshots = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}'); return Boolean(snapshots[arguments[0]]);", browserOnlyId);
  check("Test 12b: the browser-local Studio activates and keeps its snapshot", browserActive === browserOnlyId && snapshotWritten === true, JSON.stringify({ browserActive, snapshotWritten }));
  await enterStudioFromCard(`TPI-087 B ${runId}`);
  const snapshotPreserved = await js("var snapshots = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}'); return Boolean(snapshots[arguments[0]]);", browserOnlyId);
  check("Test 12c: switching away preserves the browser-local snapshot record", snapshotPreserved === true, JSON.stringify({ snapshotPreserved }));

  // ---- Test 13: pre-existing Studio data is never reset -----------------
  const legacyFinal = await workspaceById(legacy.id);
  const legacyFinalConfiguration = legacyFinal?.state?.configuration || {};
  check("Test 13: a pre-existing Studio keeps its deliberate configuration", legacyFinalConfiguration.videoTimerTheme === "haunted" && legacyFinalConfiguration.videoTimerDuration === 30 && (legacyFinalConfiguration.studioScenes || []).some((scene) => scene.title === "Legacy Preserved Scene") && (legacyFinalConfiguration.backgroundMusicSlots || []).length === 1, JSON.stringify({ scenes: (legacyFinalConfiguration.studioScenes || []).map((scene) => scene.title), theme: legacyFinalConfiguration.videoTimerTheme }));
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
  try { diagnostics.fatal = await uiState(); } catch {}
} finally {
  try { await deleteFixtures(); } catch {}
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-087-OWNERSHIP", status: failed.length ? "FAIL" : "PASS", base, account: accountKey, evidenceRoot, diagnostics, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

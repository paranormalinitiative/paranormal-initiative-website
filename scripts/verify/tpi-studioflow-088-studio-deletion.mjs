#!/usr/bin/env node
// TPI-STUDIOFLOW-088 — PERMANENT STUDIO DELETION AND ARCHIVE MANAGEMENT.
// Directive acceptance Tests 1–10.
//
// Runs against the local worker (or authenticated production with the isolated
// QA account) in a disposable Firefox Developer Edition profile with fake media
// devices. Only disposable synthetic Studios (title prefix "TPI-088 ") are
// created and deleted; no owner production data is touched. Crossroads of the
// Unknown, Testing 123, and every other owner Studio are never modified.
//
// Assertions use actual persisted records — not just visible labels:
//   1  Confirmation -> opening the dialog deletes nothing; it shows the exact
//                       Studio name, productions/recordings counts, media
//                       impact, and a permanent-deletion warning
//   2  Cancel       -> cancelling leaves the Studio completely untouched
//   3  Home         -> deleting removes the Studio from the homepage
//   4  My Studios   -> the deleted Studio disappears from My Studios
//   5  Isolation    -> other Studios keep their own data
//   6  Refresh      -> the deleted Studio does not reappear after refresh
//   7  Active       -> deleting the active Studio lands on a safe destination
//   8  Browser-local-> local deletion damages neither other Studios' snapshots
//                       nor recovery snapshots
//   9  Archive      -> archive and restore still work (archive view)
//   10 Regression   -> the maintained lifecycle and ownership suites stay in
//                       the release gate
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_088_BASE_URL || process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const productionCredentialsFile = process.env.TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json");
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-088-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
const results = [];
const diagnostics = {};
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
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-088-DELETION", status: "BLOCKED", reason: `Required input unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-088-DELETION", status: "BLOCKED", reason: `QA account ${accountKey} is unavailable.` }));
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
// Server reads run from Node with the browser session's cookies.
async function serverFetch(path, options = {}) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${base}${path}${separator}tpi088=${runId}`, {
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
async function workspaceById(id) {
  if (!id) return null;
  const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
  return response.status === 200 ? response.body?.workspace : null;
}
async function workspaceGone(title) {
  for (const query of ["", "?includeArchived=true", "?includeDeleted=true"]) {
    if (await workspaceByTitle(title, query)) return false;
  }
  return true;
}
// Prior runs can leave an active production session when a fatal error quits
// the browser mid-flow; release it so the lock cannot poison this run.
async function releaseStaleProductionSessions() {
  const active = await serverFetch("/api/studio/production/active");
  const sessionId = active.body?.active?.sessionId;
  if (sessionId) await serverFetch("/api/studio/production/stop", { method: "POST", body: { sessionId } }).catch(() => undefined);
}
// Disposable QA fixtures are purged at both ends of the run. Purge retries on
// a concurrent-change conflict with the refreshed version.
async function purgeFixtures() {
  for (const query of ["", "?includeArchived=true", "?includeDeleted=true"]) {
    const list = await workspaceList(query);
    for (const workspace of list) {
      if (!/^TPI-088 /.test(workspace?.title || "")) continue;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const current = (await workspaceList(query)).find((item) => item && item.id === workspace.id);
        if (!current) break;
        const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(current.id)}/purge`, {
          method: "POST",
          body: { expectedVersion: current.version }
        }).catch(() => null);
        if (response && response.status === 200) break;
      }
    }
  }
}
async function uiState() {
  return js(`return {
    activeStudioId: localStorage.getItem('studioflow.tpiActiveStudioId.v1'),
    activeBroadcastId: JSON.parse(localStorage.getItem('studioflow.activeBroadcastId') || 'null'),
    route: JSON.parse(localStorage.getItem('studioflow.route') || '"home"'),
    sceneTitles: (JSON.parse(localStorage.getItem('studioflow.studioScenes') || '[]') || []).map(function (s) { return s.title; }),
    tombstones: JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioDeleted.v1') || '[]')
  };`);
}
async function writeConfiguration(patch) {
  await js(`var patch = arguments[0];
    Object.keys(patch).forEach(function (key) { localStorage.setItem('studioflow.' + key, JSON.stringify(patch[key])); });
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('studioflow:configuration-changed', { detail: { source: 'tpi-088-suite' } }));`, patch);
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
async function studioEntriesViaBridge() {
  return await js("return window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.listStudios ? window.__tpiStudioWorkspace.listStudios() : [];");
}
async function studioMenuTexts() {
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  const texts = await js("return Array.from(document.querySelectorAll('.tpi-studio-menu button')).map(function (node) { return (node.textContent || '').trim(); });");
  await js("document.body.click();");
  await sleep(200);
  return texts;
}
async function broadcastRecords() {
  return await js("return JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');");
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
async function waitForCreationSettle() {
  await waitFor("creation chain to settle", async () => {
    const status = await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';");
    return /PROJECT SAVED/.test(status);
  }, 30_000);
  await sleep(400);
}
async function createStudioViaHome(title) {
  await goHome();
  if (!(await clickButtonByText("Create new Studio", ".home-page"))) throw new Error("Create new Studio control is unavailable on Home");
  await waitFor("Create New Studio dialog", async () => (await count(".modal")) >= 1 && await buttonExists("Create Studio"), 15_000);
  await withElement(".modal label input", (element) => element.sendKeys(title), 15_000);
  if (!(await clickButtonByText("Create Studio"))) throw new Error("Create Studio submit is unavailable");
  const workspace = await waitFor(`server record for ${title}`, async () => await workspaceByTitle(title), 30_000);
  await waitFor(`${title} becomes the active Studio`, async () => {
    const state = await uiState();
    return state.activeBroadcastId && workspace && (state.activeBroadcastId === workspace.localBroadcastId || state.activeBroadcastId === workspace.id);
  }, 30_000);
  await waitFor("new Studio environment opens", async () => (await count("[data-tpi-scenes-panel]")) > 0, 30_000);
  await waitForCreationSettle();
  return workspace;
}
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
async function enterStudioFromCard(title) {
  await goHome();
  if (!(await clickCardButton(title, "Enter Studio"))) throw new Error(`Enter Studio is unavailable for ${title}`);
  await waitFor(`${title} studio environment`, async () => (await count("[data-tpi-scenes-panel]")) > 0, 30_000);
  await sleep(600);
}
async function openDashboard(title) {
  await goHome();
  if (!(await clickCardButton(title, "Open Dashboard"))) throw new Error(`Open Dashboard is unavailable for ${title}`);
  await waitFor(`${title} dashboard`, async () => {
    const heading = await js("var h = document.querySelector('.studio-dashboard h1'); return h ? (h.textContent || '').trim() : '';");
    return heading === title;
  }, 20_000);
}
async function createProductionInStudio(dashboardTitle, productionTitle) {
  // Enter the Studio first: the production-lock gate reserves the active
  // Studio workspace before the dashboard's Start Recording opens its dialog
  // (the established owner workflow starts productions from inside a Studio).
  await enterStudioFromCard(dashboardTitle);
  await waitForCreationSettle();
  await openDashboard(dashboardTitle);
  await sleep(1200);
  if (!(await clickButtonByText("Start Recording", ".studio-dashboard-actions"))) throw new Error("Start Recording is unavailable on the dashboard");
  await waitFor("Create recording dialog", async () => {
    const modals = await count(".modal");
    if (modals >= 1 && await buttonExists("Continue to setup")) return true;
    if (modals >= 1) {
      const text = await js("var m = document.querySelector('.modal'); return m ? (m.textContent || '').slice(0, 200) : '';");
      const lockMessage = await js("var n = document.getElementById('tpi-production-lock-message'); return n ? (n.textContent || '').slice(0, 200) : '';");
      throw new Error(`unexpected modal: ${text} | lock: ${lockMessage}`);
    }
    return false;
  }, 15_000);
  await withElement(".modal label input", (element) => element.sendKeys(productionTitle), 15_000);
  if (!(await clickButtonByText("Continue to setup", ".modal"))) throw new Error("Continue to setup is unavailable");
  await waitFor("production setup", async () => (await count(".modal")) === 0, 15_000);
  return await waitFor("production record", async () => (await broadcastRecords()).find((record) => record && record.title === productionTitle) || null, 20_000);
}
// Opens the card More Actions menu and selects Delete Studio, which must only
// open the confirmation dialog (directive §4: opening the menu never deletes).
async function openDeleteDialog(title) {
  await goHome();
  if (!(await clickCardButton(title, "More Actions"))) throw new Error(`More Actions is unavailable for ${title}`);
  await sleep(200);
  if (!(await clickCardButton(title, "Delete Studio"))) throw new Error(`Delete Studio is unavailable for ${title}`);
  await waitFor("Delete Studio confirmation dialog", async () => (await count(".studio-delete-warning")) === 1, 15_000);
}
async function confirmDeleteDialog(title) {
  const disabledBefore = await js("var button = document.querySelector('.studio-delete-actions .ghost-button'); return button ? button.disabled : null;");
  if (disabledBefore !== false) throw new Error(`Delete Studio permanently should be enabled after typing the name (state: ${disabledBefore})`);
  if (!(await clickButtonByText("Delete Studio permanently", ".modal"))) throw new Error("Delete Studio permanently is unavailable");
  await waitFor("Delete dialog to close", async () => (await count(".studio-delete-warning")) === 0, 15_000);
}
async function typeConfirmationName(title) {
  await withElement(".studio-delete-actions", () => {}, 5_000);
  await withElement(".modal label input", async (element) => {
    await element.clear();
    await element.sendKeys(title);
  }, 15_000);
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
  await releaseStaleProductionSessions();
  await purgeFixtures();

  // ---- Fixtures: one Studio to keep, one Studio to delete ----------------
  const keepTitle = `TPI-088 Keep ${runId}`;
  const killTitle = `TPI-088 Kill ${runId}`;
  const activeTitle = `TPI-088 Active ${runId}`;
  const archTitle = `TPI-088 Arch ${runId}`;
  await driver.get(`${base}/studio/`);
  const studioKeep = await createStudioViaHome(keepTitle);
  await establishSceneTitle(studioKeep.id, "TPI-088 Keep Scene", "landscape");
  const studioKill = await createStudioViaHome(killTitle);
  await establishSceneTitle(studioKill.id, "TPI-088 Kill Scene", "landscape");
  const killProductionTitle = `TPI-088 Kill Production ${runId}`;
  const killProduction = await createProductionInStudio(killTitle, killProductionTitle);
  const killKey = studioKill.localBroadcastId || studioKill.id;
  check("fixture: the to-delete Studio owns its production", Boolean(killProduction) && killProduction.studioId === killKey && killProduction.isProduction === true, JSON.stringify(killProduction));
  const keepProductionTitle = `TPI-088 Keep Production ${runId}`;
  const keepProduction = await createProductionInStudio(keepTitle, keepProductionTitle);
  const keepKey = studioKeep.localBroadcastId || studioKeep.id;

  // ---- Test 1: the confirmation dialog deletes nothing -------------------
  await openDeleteDialog(killTitle);
  const dialogText = await js("var modal = document.querySelector('.modal'); return modal ? modal.textContent : '';");
  check("Test 1a: the dialog shows the exact Studio name", dialogText.includes(killTitle), dialogText.slice(0, 240));
  check("Test 1b: the dialog shows the associated productions count", dialogText.includes("Associated productions: 1"), dialogText.slice(0, 300));
  check("Test 1c: the dialog shows the associated recordings count where available", /Associated recordings: \d+/.test(dialogText), dialogText.slice(0, 300));
  check("Test 1d: the dialog states the media impact", dialogText.includes("Stored media and recordings are NOT deleted"), dialogText.slice(0, 300));
  check("Test 1e: the dialog warns that deletion is permanent", dialogText.includes("permanent"), dialogText.slice(0, 300));
  const disabledInitially = await js("var button = document.querySelector('.studio-delete-actions .ghost-button'); return button ? button.disabled : null;");
  check("Test 1f: permanent deletion stays disabled until the name is typed", disabledInitially === true, String(disabledInitially));
  check("Test 1g: opening the dialog deletes nothing", Boolean(await workspaceByTitle(killTitle)) && (await cardIndexFor(killTitle)) >= 0, "studio vanished while the dialog was open");

  // ---- Test 2: cancel leaves the Studio untouched ------------------------
  await typeConfirmationName("Wrong Name");
  const disabledWithWrongName = await js("var button = document.querySelector('.studio-delete-actions .ghost-button'); return button ? button.disabled : null;");
  check("Test 2a: a mismatched name keeps deletion disabled", disabledWithWrongName === true, String(disabledWithWrongName));
  await typeConfirmationName(killTitle);
  const enabledWithExactName = await js("var button = document.querySelector('.studio-delete-actions .ghost-button'); return button ? button.disabled : null;");
  check("Test 2b: typing the exact Studio name enables deletion", enabledWithExactName === false, String(enabledWithExactName));
  if (!(await clickButtonByText("Cancel", ".modal"))) throw new Error("Cancel is unavailable");
  await waitFor("Delete dialog to close", async () => (await count(".studio-delete-warning")) === 0, 15_000);
  const killAfterCancel = await workspaceByTitle(killTitle);
  const killProductionAfterCancel = (await broadcastRecords()).find((record) => record && record.title === killProductionTitle);
  check("Test 2c: cancelling leaves the Studio completely untouched", Boolean(killAfterCancel) && Boolean(killProductionAfterCancel) && killProductionAfterCancel.studioId === killKey, JSON.stringify({ workspace: Boolean(killAfterCancel), production: killProductionAfterCancel }));

  // ---- Tests 3-6: permanent deletion ------------------------------------
  await openDeleteDialog(killTitle);
  await typeConfirmationName(killTitle);
  await confirmDeleteDialog(killTitle);
  await waitFor("deleted Studio removed from every server listing", async () => await workspaceGone(killTitle), 30_000).catch(async (error) => {
    const bridgeMessage = await js("return window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.lastStatusMessage ? JSON.stringify(window.__tpiStudioWorkspace.lastStatusMessage()) : 'unavailable';").catch(() => "n/a");
    const active = await authenticatedFetch("/api/studio/production/active").catch(() => null);
    throw new Error(`${error.message}; bridge message: ${bridgeMessage}; production: ${JSON.stringify(active && active.body)}`);
  });
  const killById = await workspaceById(studioKill.id);
  check("Test 3a: the deleted Studio disappears from the homepage", (await cardIndexFor(killTitle)) < 0, `card index ${(await cardIndexFor(killTitle))}`);
  check("Test 3b: the deleted Studio record is permanently unreadable", killById === null, JSON.stringify(killById));
  const entriesAfterDelete = await studioEntriesViaBridge();
  check("Test 4a: the deleted Studio disappears from My Studios", !entriesAfterDelete.some((entry) => entry && entry.title === killTitle), JSON.stringify(entriesAfterDelete.map((entry) => entry && entry.title)));
  // The My Studios dropdown lives in the Studio environment's asset panel.
  await enterStudioFromCard(keepTitle);
  const menuTextsAfterDelete = await studioMenuTexts();
  check("Test 4b: the My Studios dropdown no longer lists the deleted Studio", !menuTextsAfterDelete.some((text) => text.indexOf(killTitle) >= 0), JSON.stringify(menuTextsAfterDelete));
  await goHome();
  const keepWorkspaceAfter = await workspaceById(studioKeep.id);
  const keepConfigAfter = keepWorkspaceAfter?.state?.configuration || {};
  const keepProductionAfter = (await broadcastRecords()).find((record) => record && record.title === keepProductionTitle);
  check("Test 5a: other Studios keep their own saved configuration", (keepConfigAfter.studioScenes || []).some((scene) => scene.title === "TPI-088 Keep Scene"), JSON.stringify((keepConfigAfter.studioScenes || []).map((scene) => scene.title)));
  check("Test 5b: other Studios' productions stay attached", Boolean(keepProductionAfter) && keepProductionAfter.studioId === keepKey, JSON.stringify(keepProductionAfter));
  check("Test 5c: the other Studio's card remains", (await cardIndexFor(keepTitle)) >= 0, keepTitle);
  await driver.navigate().refresh();
  await waitFor("StudioFlow after refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  check("Test 6a: the deleted Studio does not reappear after refresh", (await cardIndexFor(killTitle)) < 0 && (await workspaceGone(killTitle)), "deleted Studio reappeared");
  const killProductionFinal = (await broadcastRecords()).find((record) => record && record.title === killProductionTitle);
  check("Test 6b: its productions are preserved but detached", Boolean(killProductionFinal) && !killProductionFinal.studioId, JSON.stringify(killProductionFinal));
  const tombstonesAfter = (await uiState()).tombstones;
  check("Test 6c: the deleted Studio identity is tombstoned against stale-record recreation", Array.isArray(tombstonesAfter) && tombstonesAfter.indexOf(killKey) >= 0, JSON.stringify(tombstonesAfter));

  // ---- Test 7: deleting the active Studio selects a safe destination ----
  const studioActive = await createStudioViaHome(activeTitle);
  const activeKey = studioActive.localBroadcastId || studioActive.id;
  const activeState = await uiState();
  check("fixture: the to-delete Studio is active", activeState.activeBroadcastId === activeKey, JSON.stringify(activeState));
  await goHome();
  await openDeleteDialog(activeTitle);
  await typeConfirmationName(activeTitle);
  await confirmDeleteDialog(activeTitle);
  await waitFor("active Studio deletion completes", async () => await workspaceGone(activeTitle), 30_000);
  const afterActiveDelete = await uiState();
  const onHome = await buttonExists("Create new Studio", ".home-page");
  check("Test 7a: deleting the active Studio lands on a safe destination", onHome === true && afterActiveDelete.activeBroadcastId !== activeKey, JSON.stringify({ onHome, active: afterActiveDelete.activeBroadcastId, activeKey }));
  await enterStudioFromCard(keepTitle);
  check("Test 7b: the application stays operational after active-Studio deletion", (await count("[data-tpi-scenes-panel]")) > 0, "studio environment did not open");

  // ---- Test 8: browser-local deletion protects other snapshots ----------
  const browserA = `tpi-088-browser-a-${runId}`;
  const browserB = `tpi-088-browser-b-${runId}`;
  const browserATitle = `TPI-088 Browser A ${runId}`;
  const browserBTitle = `TPI-088 Browser B ${runId}`;
  await goHome();
  await js(`var a = arguments[0], b = arguments[1], ta = arguments[2], tb = arguments[3];
    var broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');
    broadcasts.push({ id: a, title: ta, kind: 'recording', createdAt: new Date().toLocaleTimeString() });
    broadcasts.push({ id: b, title: tb, kind: 'recording', createdAt: new Date().toLocaleTimeString() });
    localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts));
    var snapshots = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}');
    snapshots[a] = { savedAt: new Date().toISOString(), state: { broadcast: { id: a, title: ta }, configuration: {} } };
    snapshots[b] = { savedAt: new Date().toISOString(), state: { broadcast: { id: b, title: tb }, configuration: {} } };
    localStorage.setItem('studioflow.tpiLocalStudioSnapshots.v1', JSON.stringify(snapshots));
    var recovery = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.recovery.v1') || '{}');
    recovery[a] = { preservedAt: new Date().toISOString(), record: { note: 'recovery-a' } };
    recovery[b] = { preservedAt: new Date().toISOString(), record: { note: 'recovery-b' } };
    localStorage.setItem('studioflow.tpiLocalStudioSnapshots.recovery.v1', JSON.stringify(recovery));
    window.dispatchEvent(new CustomEvent('tpi:studios-updated'));`, browserA, browserB, browserATitle, browserBTitle);
  // Reload so the app's own broadcasts state (not just the bridge catalog)
  // owns the seeded records, exactly as in a real browser session.
  await driver.navigate().refresh();
  await waitFor("StudioFlow after seeding refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  await waitFor("browser-local Studio cards", async () => (await cardIndexFor(browserATitle)) >= 0 && (await cardIndexFor(browserBTitle)) >= 0, 20_000);
  await openDeleteDialog(browserATitle);
  await typeConfirmationName(browserATitle);
  await confirmDeleteDialog(browserATitle);
  await waitFor("browser-local Studio removed", async () => (await cardIndexFor(browserATitle)) < 0, 20_000);
  const localState = await js(`var a = arguments[0], b = arguments[1];
    var snapshots = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}');
    var recovery = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.recovery.v1') || '{}');
    var tombstones = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioDeleted.v1') || '[]');
    return { snapshotA: Boolean(snapshots[a]), snapshotB: Boolean(snapshots[b]), recoveryA: Boolean(recovery[a]), recoveryB: Boolean(recovery[b]), tombstoned: tombstones.indexOf(a) >= 0 };`, browserA, browserB);
  check("Test 8a: browser-local deletion removes the Studio's own listing and configuration", localState.snapshotA === false && localState.tombstoned === true, JSON.stringify(localState));
  check("Test 8b: the other browser-local Studio's snapshot is untouched", localState.snapshotB === true, JSON.stringify(localState));
  check("Test 8c: unrelated recovery snapshots are preserved", localState.recoveryA === true && localState.recoveryB === true, JSON.stringify(localState));
  check("Test 8d: the other browser-local Studio remains listed", (await cardIndexFor(browserBTitle)) >= 0, browserBTitle);
  await driver.navigate().refresh();
  await waitFor("StudioFlow after refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  check("Test 8e: the deleted browser-local Studio does not reappear after refresh", (await cardIndexFor(browserATitle)) < 0 && (await cardIndexFor(browserBTitle)) >= 0, JSON.stringify({ a: await cardIndexFor(browserATitle), b: await cardIndexFor(browserBTitle) }));

  // ---- Test 9: archive and restore still work ---------------------------
  await openDeleteDialog(keepTitle);
  await typeConfirmationName(keepTitle);
  if (!(await clickButtonByText("Cancel", ".modal"))) throw new Error("Cancel is unavailable");
  await waitFor("Delete dialog to close", async () => (await count(".studio-delete-warning")) === 0, 15_000);
  if (!(await clickCardButton(keepTitle, "More Actions"))) throw new Error("More Actions is unavailable");
  await sleep(200);
  if (!(await clickCardButton(keepTitle, "Archive Studio"))) throw new Error("Archive Studio is unavailable");
  await waitFor("archived Studio appears in the Archived Studios view", async () => {
    const section = await js("var node = document.querySelector('.studio-archive-section'); return node ? node.textContent : '';");
    return section.indexOf(keepTitle) >= 0;
  }, 30_000);
  const activeGridText = await js("var grid = document.querySelector('.studio-card-grid'); return grid ? grid.textContent : '';");
  check("Test 9a: archived Studios are excluded from the active listing", activeGridText.indexOf(keepTitle) < 0, activeGridText.slice(0, 200));
  check("Test 9b: the Archived Studios view keeps restore and delete actions", await buttonExists("Restore Archived Studio", ".studio-archive-section") && await buttonExists("Delete Studio", ".studio-archive-section"));
  if (!(await clickCardButton(keepTitle, "Restore Archived Studio"))) throw new Error("Restore Archived Studio is unavailable");
  const restoredEntry = await waitFor("Studio restored", async () => {
    const entries = await studioEntriesViaBridge();
    return entries.find((entry) => entry && entry.title === keepTitle && entry.archived === false) || null;
  }, 30_000);
  const keepConfigFinal = (await workspaceById(studioKeep.id))?.state?.configuration || {};
  check("Test 9c: restore returns the Studio with its configuration intact", Boolean(restoredEntry) && (keepConfigFinal.studioScenes || []).some((scene) => scene.title === "TPI-088 Keep Scene"), JSON.stringify((keepConfigFinal.studioScenes || []).map((scene) => scene.title)));
  // Archived Studios also support permanent deletion with confirmation.
  const studioArch = await createStudioViaHome(archTitle);
  await goHome();
  if (!(await clickCardButton(archTitle, "More Actions"))) throw new Error("More Actions is unavailable");
  await sleep(200);
  if (!(await clickCardButton(archTitle, "Archive Studio"))) throw new Error("Archive Studio is unavailable");
  await waitFor("archived fixture in the Archived Studios view", async () => {
    const section = await js("var node = document.querySelector('.studio-archive-section'); return node ? node.textContent : '';");
    return section.indexOf(archTitle) >= 0;
  }, 30_000);
  if (!(await clickCardButton(archTitle, "Delete Studio"))) throw new Error("Delete Studio is unavailable in the Archived Studios view");
  await waitFor("Delete Studio confirmation dialog", async () => (await count(".studio-delete-warning")) === 1, 15_000);
  await typeConfirmationName(archTitle);
  await confirmDeleteDialog(archTitle);
  await waitFor("archived Studio permanently deleted", async () => await workspaceGone(archTitle), 30_000);
  check("Test 9d: archived Studios can be permanently deleted with confirmation", (await cardIndexFor(archTitle)) < 0 && !(await workspaceById(studioArch.id)), archTitle);

  // ---- Test 10: the maintained regressions stay in the release gate ------
  const releaseScript = readFileSync(resolve(repoRoot, "scripts/tpi-release.mjs"), "utf8");
  check("Test 10a: the release gate still runs the Studio lifecycle regression", /tpi-studioflow-studio-lifecycle\.mjs/.test(releaseScript));
  check("Test 10b: the release gate still runs the Studio ownership regression", /tpi-studioflow-087-studio-ownership\.mjs/.test(releaseScript));
  check("Test 10c: the release gate runs this Studio deletion regression", /tpi-studioflow-088-studio-deletion\.mjs/.test(releaseScript));
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
  try { diagnostics.fatal = await uiState(); } catch {}
} finally {
  // Quit the browser first: its autosave loop can otherwise race fixture
  // purges with workspace version bumps.
  if (driver) await driver.quit().catch(() => {});
  driver = null;
  try { await purgeFixtures(); } catch {}
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-088-DELETION", status: failed.length ? "FAIL" : "PASS", base, account: accountKey, evidenceRoot, diagnostics, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

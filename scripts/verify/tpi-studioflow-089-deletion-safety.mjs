#!/usr/bin/env node
// TPI-STUDIOFLOW-089 — STUDIO DELETION SAFETY AND DATA INTEGRITY.
// Supplemental directive QA scenarios 1–12.
//
// Runs against the local worker (or authenticated production with the isolated
// QA account) in a disposable Firefox Developer Edition profile with fake media
// devices. Only disposable synthetic Studios (title prefix "TPI-089 ") are
// created and deleted; no owner production data is touched. Crossroads of the
// Unknown, Testing 123, and every other owner Studio are never modified.
//
// Directive QA scenarios (§8):
//   1  Cancel deletion
//   2  Delete an empty Studio
//   3  Delete a Studio with recordings (both delete options)
//   4  Delete a Studio with media (exclusive deleted, shared retained)
//   5  Delete a browser-local Studio (other snapshots preserved)
//   6  Delete an archived Studio
//   7  Attempt deletion during an active recording (blocked, reported)
//   8  Attempt deletion from a stale browser tab (conflict reported, nothing deleted)
//   9  Refresh after deletion
//  10  Verify all unrelated Studios remain unchanged
//  11  Verify no deleted Studio is silently recreated (duplicate requests converge)
//  12  Verify the interface accurately reports failures
//
// Plus the §2 pre-deletion inventory disclosure and the §3 two-option /
// additional-confirmation contracts.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_089_BASE_URL || process.env.TPI_088_BASE_URL || process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const productionCredentialsFile = process.env.TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json");
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-089-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
const results = [];
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
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY", status: "BLOCKED", reason: `Required input unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY", status: "BLOCKED", reason: `QA account ${accountKey} is unavailable.` }));
  process.exit(1);
}
// TPI-LOCAL-TO-PRODUCTION-RUNBOOK: production acceptance runs only against the
// dedicated synthetic qa-studioflow-* member account, and only with the
// explicit production-QA approval. Local fixture accounts and owner accounts
// are rejected before launch.
if (!/^http:\/\/(127\.0\.0\.1|localhost)[:\/]/.test(base)) {
  if (process.env.TPI_FIREFOX_PRODUCTION_QA !== "approved") {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY", status: "BLOCKED", reason: "Production acceptance requires TPI_FIREFOX_PRODUCTION_QA=approved." }));
    process.exit(1);
  }
  if (!/^qa-studioflow-/.test(account.username || "")) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY", status: "BLOCKED", reason: "Production acceptance must use the synthetic qa-studioflow-* member account." }));
    process.exit(1);
  }
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
async function dialogText() {
  return await js("var modal = document.querySelector('.modal'); return modal ? modal.textContent : '';");
}
async function confirmButtonState() {
  return await js("var button = document.querySelector('.studio-delete-actions .ghost-button'); return button ? { disabled: button.disabled, label: (button.textContent || '').trim() } : null;");
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(r){return r.text().then(function(t){var b=null;try{b=t?JSON.parse(t):null}catch(e){b=t}done({status:r.status,body:b})})}).catch(function(e){done({status:0,error:String(e)})});", path, options);
}
// Server reads run from Node with the browser session's cookies.
async function serverFetch(path, options = {}) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${base}${path}${separator}tpi089=${runId}`, {
    method: options.method || "GET",
    headers: { Cookie: cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}
async function uploadStudioMedia(workspaceId, name, type, bytes) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), name);
  const response = await fetch(`${base}/api/studio/workspaces/${encodeURIComponent(workspaceId)}/media?tpi089=${runId}`, {
    method: "POST",
    headers: { Cookie: cookieHeader, Accept: "application/json" },
    body: form
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body, assetId: body?.asset?.id || body?.id || null };
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
async function mediaAssetStatus(workspaceId, assetId) {
  const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}/media/${encodeURIComponent(assetId)}`);
  return response.status;
}
// Prior runs can leave an active production session when a fatal error quits
// the browser mid-flow; release it so the lock cannot poison this run.
async function releaseStaleProductionSessions() {
  const active = await serverFetch("/api/studio/production/active");
  const sessionId = active.body?.active?.sessionId;
  if (sessionId) await serverFetch("/api/studio/production/stop", { method: "POST", body: { sessionId } }).catch(() => undefined);
}
// Disposable QA fixtures are purged at both ends of the run with the
// with-contents mode so synthetic media rows and objects are cleaned too.
// Purge retries on a concurrent-change conflict with the refreshed version.
async function purgeFixtures() {
  for (const query of ["", "?includeArchived=true", "?includeDeleted=true"]) {
    const list = await workspaceList(query);
    for (const workspace of list) {
      if (!/^TPI-089 /.test(workspace?.title || "")) continue;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const current = (await workspaceList(query)).find((item) => item && item.id === workspace.id);
        if (!current) break;
        const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(current.id)}/purge`, {
          method: "POST",
          body: { expectedVersion: current.version, mode: "with-contents" }
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
    tombstones: JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioDeleted.v1') || '[]')
  };`);
}
async function writeConfiguration(patch) {
  await js(`var patch = arguments[0];
    Object.keys(patch).forEach(function (key) { localStorage.setItem('studioflow.' + key, JSON.stringify(patch[key])); });
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('studioflow:configuration-changed', { detail: { source: 'tpi-089-suite' } }));`, patch);
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
async function broadcastRecords() {
  return await js("return JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');");
}
async function libraryRecords() {
  return await js("return JSON.parse(localStorage.getItem('studioflow.libraryItems') || '[]');");
}
async function recordingBlobPresent(blobKey) {
  return await asyncJs(`var blobKey = arguments[0], done = arguments[arguments.length - 1];
    if (!window.indexedDB) { done(false); return; }
    var request = indexedDB.open('studioflow-recordings');
    request.onerror = function () { done(false); };
    request.onsuccess = function () {
      var db = request.result;
      if (!db.objectStoreNames.contains('recordingBlobs')) { db.close(); done(false); return; }
      var tx = db.transaction('recordingBlobs', 'readonly');
      var get = tx.objectStore('recordingBlobs').get(blobKey);
      get.onsuccess = function () { db.close(); done(Boolean(get.result)); };
      get.onerror = function () { db.close(); done(false); };
    };`, blobKey);
}
async function seedRecording(studioKey, itemId, title, blobKey) {
  await js(`var studioKey = arguments[0], itemId = arguments[1], title = arguments[2], blobKey = arguments[3];
    var items = JSON.parse(localStorage.getItem('studioflow.libraryItems') || '[]');
    items.push({ id: itemId, studioId: studioKey, title: title, duration: '00:05', source: 'Program', recordingBlobKey: blobKey, completedAt: new Date().toISOString() });
    localStorage.setItem('studioflow.libraryItems', JSON.stringify(items));`, studioKey, itemId, title, blobKey);
  const stored = await asyncJs(`var blobKey = arguments[0], done = arguments[arguments.length - 1];
    if (!window.indexedDB) { done(false); return; }
    var request = indexedDB.open('studioflow-recordings');
    request.onerror = function () { done(false); };
    request.onsuccess = function () {
      var db = request.result;
      var tx = db.transaction('recordingBlobs', 'readwrite');
      tx.objectStore('recordingBlobs').put(new Blob(['synthetic-recording'], { type: 'video/webm' }), blobKey);
      tx.oncomplete = function () { db.close(); done(true); };
      tx.onerror = function () { db.close(); done(false); };
    };`, blobKey);
  return stored === true;
}
async function goHome() {
  // A cold load legitimately routes into the last Studio while the owner has
  // not touched the interface (the activation bridge's documented boot
  // behavior). Real workflows always interact first; mark owner control the
  // same way so the boot activation cannot land late and navigate mid-flow.
  await js("window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));").catch(() => {});
  if (await buttonExists("Create new Studio", ".home-page")) return;
  const started = Date.now();
  let lastDetail = "no exit attempt";
  while (Date.now() - started < 45_000) {
    if (await buttonExists("Create new Studio", ".home-page")) return;
    lastDetail = String(await js(
      "var btn = document.querySelector('.production-bar .exit-button') || document.querySelector('.exit-button'); if (!btn) return 'no-exit-button'; var label = (btn.textContent || '').trim(); btn.click(); return 'clicked ' + label;"
    ).catch((error) => `click-error: ${safe(error)}`));
    const reachedHome = await waitFor("StudioFlow home", async () => await buttonExists("Create new Studio", ".home-page"), 5_000).then(() => true).catch(() => false);
    if (reachedHome) return;
    const back = await driver.findElements(By.css(".back-button"));
    if (back.length) await back[0].click().catch(() => {});
    else await clickButtonByText("Back to Home", "body").catch(() => {});
  }
  throw new Error(`StudioFlow home timed out: ${lastDetail}`);
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
async function catalogDiagnostics() {
  return js(`return {
    cards: Array.from(document.querySelectorAll('.studio-card')).map(function (c) { var t = c.querySelector('.studio-card-title strong'); return t ? (t.textContent || '').trim() : '(untitled)'; }),
    bridgeEntries: (window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.listStudios ? window.__tpiStudioWorkspace.listStudios() : []).map(function (e) { return { key: e.key, title: e.title, source: e.source, archived: e.archived }; }),
    broadcasts: JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]').map(function (b) { return b && { id: b.id, title: b.title, studioId: b.studioId || null, isProduction: b.isProduction === true }; }),
    tombstones: JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioDeleted.v1') || '[]'),
    bridgeStatus: window.__tpiStudioWorkspace && window.__tpiStudioWorkspace.lastStatusMessage ? window.__tpiStudioWorkspace.lastStatusMessage() : null,
    route: JSON.parse(localStorage.getItem('studioflow.route') || '"home"'),
    hasHome: Boolean(document.querySelector('.home-page:not(.studio-dashboard)')),
    hasDashboard: Boolean(document.querySelector('.home-page.studio-dashboard')),
    hasScenesPanel: Boolean(document.querySelector('[data-tpi-scenes-panel]'))
  };`).catch((error) => ({ diagnosticError: safe(error) }));
}
async function openDeleteDialog(title) {
  await goHome();
  // The card grid re-renders around catalog updates (and production latency
  // widens the window). Wait for the Studio's card before touching its menu.
  await waitFor(`Studio card for ${title}`, async () => (await cardIndexFor(title)) >= 0, 30_000).catch(async (error) => {
    throw new Error(`${error.message}; catalog: ${JSON.stringify(await catalogDiagnostics())}`);
  });
  let opened = false;
  let lastError = "";
  for (let attempt = 0; attempt < 4 && !opened; attempt += 1) {
    if (attempt) await sleep(1000);
    if (!(await clickCardButton(title, "More Actions"))) {
      lastError = `More Actions is unavailable for ${title}`;
      continue;
    }
    await sleep(200);
    if (!(await clickCardButton(title, "Delete Studio"))) {
      lastError = `Delete Studio is unavailable for ${title}`;
      continue;
    }
    opened = true;
  }
  if (!opened) {
    const cards = await js("return Array.from(document.querySelectorAll('.studio-card .studio-card-title strong')).map(function (n) { return (n.textContent || '').trim(); });").catch(() => []);
    throw new Error(`${lastError}; visible cards: ${JSON.stringify(cards)}`);
  }
  await waitFor("Delete Studio confirmation dialog", async () => (await count(".studio-delete-warning")) === 1, 15_000);
}
async function waitForInventory() {
  return waitFor("deletion inventory content", async () => {
    const text = await dialogText();
    return text.indexOf("Deletion inventory") >= 0 && /Studio ID:/.test(text) ? text : null;
  }, 20_000);
}
async function typeConfirmationName(title) {
  await withElement(".studio-delete-actions", () => {}, 5_000);
  // The with-contents disclosure makes the dialog taller, and geckodriver
  // refuses to type into an input it cannot scroll into view. Center the
  // input first and retry once; the typed name still arrives as real key
  // events so the dialog's typed-name gate behaves exactly as in the browser.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await withElement(".modal label input", async (element) => {
        await js("var input = document.querySelector('.modal label input'); if (input && input.scrollIntoView) input.scrollIntoView({ block: 'center' });");
        await element.clear();
        await element.sendKeys(title);
      }, 15_000);
      return;
    } catch (error) {
      if (attempt) throw error;
      await sleep(500);
    }
  }
}
async function confirmDeleteDialogWithLabel(title, label) {
  const button = await confirmButtonState();
  if (!button || button.disabled !== false) throw new Error(`${label} should be enabled after the confirmations (state: ${JSON.stringify(button)})`);
  if (!(await clickButtonByText(label, ".modal"))) throw new Error(`${label} is unavailable`);
  await waitFor("Studio deletion outcome", async () => (await count(".studio-delete-warning")) === 0 || (await count(".studio-delete-error")) > 0, 15_000);
  if ((await count(".studio-delete-warning")) !== 0) {
    const detail = await js(
      "var error = document.querySelector('.studio-delete-error'); var status = document.querySelector('.tpi-studio-status'); return { dialogError: error ? (error.textContent || '').trim() : '', bridgeStatus: status ? (status.textContent || '').trim() : '', productionLock: window.__tpiStudioProductionLock || null };"
    ).catch(() => ({}));
    throw new Error(`Delete confirmation failed for ${title}: nothing was deleted. detail=${JSON.stringify(detail)}`);
  }
}
async function confirmDeleteDialog(title) {
  await confirmDeleteDialogWithLabel(title, "Delete Studio permanently");
}
// Full with-contents flow: mode → additional acknowledgement → typed name.
async function deleteWithContents(title) {
  await openDeleteDialog(title);
  const inventoryText = await waitForInventory();
  if (!(await clickButtonByText("Delete Studio and its contents", ".modal"))) throw new Error("Delete Studio and its contents option is unavailable");
  await typeConfirmationName(title);
  const ackLabel = "I understand that this Studio's exclusively owned productions, recordings and media will be permanently deleted";
  if (!(await clickButtonByText(ackLabel, ".modal"))) throw new Error("the additional contents acknowledgement is unavailable");
  await confirmDeleteDialogWithLabel(title, "Delete Studio and its contents permanently");
  return inventoryText;
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-headless", "-no-remote", "-new-instance")
    .setPreference("media.autoplay.default", 0)
    .setPreference("media.autoplay.blocking_policy", 0)
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1100, x: 20, y: 20 });

  // ---- Authenticate ------------------------------------------------------
  // The delegated submit handler is installed by member-login.js at the end of
  // the page: the parser exposes the form before that script executes, and a
  // premature requestSubmit() falls through to a native submit that never
  // creates a session. Gate the submit on the handler's runtime, and retry the
  // whole login step so one slow production load cannot fail the run.
  let authenticated = false;
  let loginDetail = "";
  for (let attempt = 0; attempt < 3 && !authenticated; attempt += 1) {
    await driver.get(`${base}/member-login.html`);
    await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1, 30_000);
    await waitFor("member login handler", async () => await js("return document.readyState !== 'loading' && Boolean(window.TPIApi);"), 30_000);
    await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=\"username\"]'),p=f.querySelector('input[name=\"password\"]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}))}); f.requestSubmit();", account.username, account.password);
    authenticated = await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user), 15_000).then(() => true).catch((error) => { loginDetail = safe(error); return false; });
  }
  if (!authenticated) throw new Error(`authenticated session timed out: ${loginDetail}`);
  await releaseStaleProductionSessions();
  // TPI-104: no purge cleanup; isolated disposable state retained.

  // ---- Fixtures ----------------------------------------------------------
  const keepTitle = `TPI-089 Keep ${runId}`;
  const cancelTitle = `TPI-089 Cancel ${runId}`;
  await driver.get(`${base}/studio/`);
  const studioKeep = await createStudioViaHome(keepTitle);
  await establishSceneTitle(studioKeep.id, "TPI-089 Keep Scene", "landscape");
  const keepKey = studioKeep.localBroadcastId || studioKeep.id;
  await seedRecording(keepKey, `tpi-089-keep-rec-${runId}`, `TPI-089 Keep Recording ${runId}`, `tpi-089-keep-blob-${runId}`);
  // Reload so the app's own library state (not just localStorage) owns the
  // seeded recording — the persistence effect would otherwise write the
  // in-memory array back over the seed.
  await driver.navigate().refresh();
  await waitFor("StudioFlow after seeding refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  const studioCancel = await createStudioViaHome(cancelTitle);
  const cancelKey = studioCancel.localBroadcastId || studioCancel.id;

  // ---- Scenario 1: cancel deletion + §2 inventory disclosure -------------
  await goHome();
  await openDeleteDialog(cancelTitle);
  const inventoryText = await waitForInventory();
  const fullDialog = await dialogText();
  check("Scenario 1a: the dialog shows the exact Studio name", fullDialog.includes(cancelTitle), fullDialog.slice(0, 240));
  check("Scenario 1b: the inventory identifies the immutable Studio ID", /Studio ID: [^\s]+/.test(inventoryText) && inventoryText.includes(String(studioCancel.id)), inventoryText.slice(0, 400));
  check("Scenario 1c: the inventory identifies the storage location", /server-saved Studio|browser-local Studio|browser-local recovery snapshot/.test(inventoryText), inventoryText.slice(0, 400));
  check("Scenario 1d: the inventory lists livestreams, recording sessions, webinars and scheduled productions",
    ["Livestreams:", "Recording sessions:", "Webinars:", "Scheduled productions:", "Saved recordings:", "Studio media:", "Recovery snapshots:"].every((label) => inventoryText.includes(label)),
    inventoryText.slice(0, 500));
  check("Scenario 1e: the dialog offers two distinct delete options", await buttonExists("Delete Studio only", ".modal") && await buttonExists("Delete Studio and its contents", ".modal"));
  check("Scenario 1f: the default option preserves recordings and media", fullDialog.includes("Stored media and recordings are NOT deleted"), fullDialog.slice(0, 300));
  check("Scenario 1g: the dialog warns that deletion is permanent", fullDialog.includes("permanent"), fullDialog.slice(0, 300));
  const disabledInitially = await confirmButtonState();
  check("Scenario 1h: permanent deletion stays disabled until the name is typed", disabledInitially?.disabled === true, JSON.stringify(disabledInitially));
  await typeConfirmationName("Wrong Name");
  check("Scenario 1i: a mismatched name keeps deletion disabled", (await confirmButtonState())?.disabled === true);
  if (!(await clickButtonByText("Cancel", ".modal"))) throw new Error("Cancel is unavailable");
  await waitFor("Delete dialog to close", async () => (await count(".studio-delete-warning")) === 0, 15_000);
  const cancelAfter = await workspaceByTitle(cancelTitle);
  const cancelKeyAfter = cancelAfter?.localBroadcastId || cancelAfter?.id;
  check("Scenario 1j: cancelling leaves the Studio completely untouched", Boolean(cancelAfter) && cancelKeyAfter === cancelKey && (await cardIndexFor(cancelTitle)) >= 0, JSON.stringify({ workspace: Boolean(cancelAfter), key: cancelKeyAfter, card: await cardIndexFor(cancelTitle) }));

  // TPI-104: successful deletion scenarios 2-8/11 are unavailable by design.
  // Replace them with actual UI, bridge, legacy-request and storage preservation.
  const target = await workspaceById(studioCancel.id);
  const uploaded = await uploadStudioMedia(target.id, "tpi-104-protected.png", "image/png", "disposable-media");
  check("TPI-104 fixture: server media uploaded", uploaded.status === 201 && Boolean(uploaded.assetId), JSON.stringify(uploaded));
  const libraryBefore = await libraryRecords();
  for (const mode of ["studio-only", "with-contents"]) {
    await openDeleteDialog(cancelTitle);
    await waitForInventory();
    await typeConfirmationName(cancelTitle);
    if (mode === "with-contents") {
      await clickButtonByText("Delete Studio and its contents", ".modal");
      await clickButtonByText("I understand that this Studio's exclusively owned productions, recordings and media will be permanently deleted", ".modal");
    }
    check(`TPI-104: ${mode} UI remains disabled`, (await confirmButtonState())?.disabled === true);
    check(`TPI-104: ${mode} unavailability explained`, (await dialogText()).includes("Both permanent deletion options are temporarily unavailable"));
    await clickButtonByText("Cancel", ".modal");
    const bridgeError = await asyncJs("var mode=arguments[0],done=arguments[arguments.length-1];window.__tpiStudioWorkspace.deleteStudioByKey(arguments[1],{mode:mode}).then(()=>done('UNSAFE SUCCESS'),e=>done(e.message));", mode, cancelKey);
    check(`TPI-104: ${mode} browser bridge rejects`, /temporarily unavailable/.test(bridgeError), bridgeError);
    const before = (await workspaceList()).find(item => item.id === target.id);
    const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(target.id)}/purge`, { method: "POST", body: { expectedVersion: before.version, mode } });
    check(`TPI-104: legacy ${mode} server request rejected`, response.status === 503 && response.body?.code === "studio_permanent_deletion_unavailable", JSON.stringify(response));
    const retry = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(target.id)}/purge`, { method: "POST", body: { mode } });
    check(`TPI-104: unversioned ${mode} retry also rejected`, retry.status === 503 && retry.body?.ok === false);
    const after = (await workspaceList()).find(item => item.id === target.id);
    check(`TPI-104: ${mode} leaves workspace unchanged`, JSON.stringify(after) === JSON.stringify(before), JSON.stringify({ before, after }));
    check(`TPI-104: ${mode} preserves uploaded media`, await mediaAssetStatus(target.id,uploaded.assetId) === 200);
    check(`TPI-104: ${mode} preserves library metadata`, JSON.stringify(await libraryRecords()) === JSON.stringify(libraryBefore));
    check(`TPI-104: ${mode} preserves unrelated recording blob`, await recordingBlobPresent(`tpi-089-keep-blob-${runId}`));
  }
  await driver.navigate().refresh();
  await waitFor("StudioFlow refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"));
  await goHome();
  check("TPI-104: Studios remain after refresh", await cardIndexFor(keepTitle) >= 0 && await cardIndexFor(cancelTitle) >= 0);
  check("TPI-104: recording ownership survives refresh", (await libraryRecords()).some(item => item.id === `tpi-089-keep-rec-${runId}` && item.studioId === keepKey));
  check("TPI-104: unrelated configuration survives", (await workspaceById(studioKeep.id))?.state?.configuration?.studioScenes?.some(scene => scene.title === "TPI-089 Keep Scene"));

  // ---- Evidence + summary -----------------------------------------------
  const summary = {
    suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY",
    base,
    runId,
    exclusions: ["Successful permanent deletion, scope-convergence and destructive failure scenarios 2-8/11 replaced by disabled-mode UI/bridge/server/storage assertions under TPI-104; underlying purge handler covered separately by 093"],
    checks: results,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = summary.failed === 0 ? 0 : 1;
} catch (error) {
  console.log(JSON.stringify({
    suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY",
    status: "FAILED",
    error: safe(error),
    checks: results
  }, null, 2));
  process.exitCode = 1;
} finally {
  try {
    if (driver) {
      await releaseStaleProductionSessions();
      // TPI-104: no purge cleanup; isolated disposable state retained.
      await driver.quit();
    }
  } catch { /* best-effort cleanup */ }
}

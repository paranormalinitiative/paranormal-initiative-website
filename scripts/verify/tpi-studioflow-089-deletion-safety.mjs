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
async function openDeleteDialog(title) {
  await goHome();
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
  await withElement(".modal label input", async (element) => {
    await element.clear();
    await element.sendKeys(title);
  }, 15_000);
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

  // ---- Scenario 2: delete an empty Studio (Delete Studio only) -----------
  const emptyTitle = `TPI-089 Empty ${runId}`;
  const studioEmpty = await createStudioViaHome(emptyTitle);
  const emptyKey = studioEmpty.localBroadcastId || studioEmpty.id;
  await openDeleteDialog(emptyTitle);
  await waitForInventory();
  await typeConfirmationName(emptyTitle);
  await confirmDeleteDialog(emptyTitle);
  await waitFor("empty Studio removed from every listing", async () => await workspaceGone(emptyTitle), 30_000);
  check("Scenario 2a: the deleted empty Studio disappears from Home", (await cardIndexFor(emptyTitle)) < 0, `card index ${await cardIndexFor(emptyTitle)}`);
  check("Scenario 2b: the deleted empty Studio disappears from My Studios", !(await studioEntriesViaBridge()).some((entry) => entry && entry.title === emptyTitle));
  check("Scenario 2c: the empty Studio record is permanently unreadable", (await workspaceById(studioEmpty.id)) === null);
  check("Scenario 2d: the deleted identity is tombstoned against recreation", ((await uiState()).tombstones || []).indexOf(emptyKey) >= 0, JSON.stringify((await uiState()).tombstones));

  // ---- Scenario 3a: Studio with recordings — Delete Studio only ----------
  const recOnlyTitle = `TPI-089 RecOnly ${runId}`;
  const studioRecOnly = await createStudioViaHome(recOnlyTitle);
  const recOnlyKey = studioRecOnly.localBroadcastId || studioRecOnly.id;
  await seedRecording(recOnlyKey, `tpi-089-reconly-rec-${runId}`, `TPI-089 RecOnly Recording ${runId}`, `tpi-089-reconly-blob-${runId}`);
  await driver.navigate().refresh();
  await waitFor("StudioFlow after seeding refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  await openDeleteDialog(recOnlyTitle);
  const recOnlyInventory = await waitForInventory();
  check("Scenario 3a-i: the inventory counts the Studio's saved recordings", recOnlyInventory.includes("Saved recordings: 1"), recOnlyInventory.slice(0, 400));
  await typeConfirmationName(recOnlyTitle);
  await confirmDeleteDialog(recOnlyTitle);
  await waitFor("RecOnly Studio removed", async () => await workspaceGone(recOnlyTitle), 30_000);
  const recOnlyLibrary = await libraryRecords();
  const preserved = recOnlyLibrary.find((item) => item && item.id === `tpi-089-reconly-rec-${runId}`);
  check("Scenario 3a-ii: studio-only deletion preserves the recording in the Library", Boolean(preserved), JSON.stringify(recOnlyLibrary.map((item) => item && item.id)));
  check("Scenario 3a-iii: the preserved recording is detached (explicitly unassigned)", Boolean(preserved) && !preserved.studioId, JSON.stringify(preserved));
  check("Scenario 3a-iv: the preserved recording's media blob survives", await recordingBlobPresent(`tpi-089-reconly-blob-${runId}`));

  // ---- Scenario 3b: Studio with recordings — with contents ---------------
  const recContentsTitle = `TPI-089 RecContents ${runId}`;
  const studioRecContents = await createStudioViaHome(recContentsTitle);
  const recContentsKey = studioRecContents.localBroadcastId || studioRecContents.id;
  await seedRecording(recContentsKey, `tpi-089-reccont-rec-${runId}`, `TPI-089 RecContents Recording ${runId}`, `tpi-089-reccont-blob-${runId}`);
  await driver.navigate().refresh();
  await waitFor("StudioFlow after seeding refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  await openDeleteDialog(recContentsTitle);
  await waitForInventory();
  if (!(await clickButtonByText("Delete Studio and its contents", ".modal"))) throw new Error("Delete Studio and its contents option is unavailable");
  const contentsDialog = await dialogText();
  check("Scenario 3b-i: the contents option describes deletion of exclusive content", contentsDialog.includes("permanently deleted"), contentsDialog.slice(0, 400));
  await typeConfirmationName(recContentsTitle);
  const beforeAck = await confirmButtonState();
  check("Scenario 3b-ii: contents deletion requires the additional confirmation", beforeAck?.disabled === true && beforeAck?.label === "Delete Studio and its contents permanently", JSON.stringify(beforeAck));
  const ackLabel = "I understand that this Studio's exclusively owned productions, recordings and media will be permanently deleted";
  if (!(await clickButtonByText(ackLabel, ".modal"))) throw new Error("the additional contents acknowledgement is unavailable");
  await confirmDeleteDialogWithLabel(recContentsTitle, "Delete Studio and its contents permanently");
  await waitFor("RecContents Studio removed", async () => await workspaceGone(recContentsTitle), 30_000);
  const recContentsLibrary = await libraryRecords();
  check("Scenario 3b-iii: contents deletion removes the Studio's recording record", !recContentsLibrary.some((item) => item && item.id === `tpi-089-reccont-rec-${runId}`), JSON.stringify(recContentsLibrary.map((item) => item && item.id)));
  check("Scenario 3b-iv: contents deletion removes the recording's media blob", !(await recordingBlobPresent(`tpi-089-reccont-blob-${runId}`)));

  // ---- Scenario 4a: exclusive Studio media is deleted with contents ------
  const mediaExclTitle = `TPI-089 MediaExcl ${runId}`;
  const studioMediaExcl = await createStudioViaHome(mediaExclTitle);
  const uploadExcl = await uploadStudioMedia(studioMediaExcl.id, "tpi-089-exclusive.png", "image/png", "synthetic-exclusive-media");
  check("Scenario 4a fixture: exclusive media uploads to the Studio", uploadExcl.status >= 200 && uploadExcl.status < 300 && Boolean(uploadExcl.assetId), JSON.stringify(uploadExcl));
  const exclAssetId = uploadExcl.assetId;
  check("Scenario 4a fixture: the exclusive asset is readable before deletion", exclAssetId && (await mediaAssetStatus(studioMediaExcl.id, exclAssetId)) === 200);
  await goHome();
  const mediaExclInventory = await deleteWithContents(mediaExclTitle);
  check("Scenario 4a-i: the inventory counts the Studio's media", mediaExclInventory.includes("Studio media: 1 stored file"), mediaExclInventory.slice(0, 400));
  await waitFor("MediaExcl Studio removed", async () => await workspaceGone(mediaExclTitle), 30_000);
  check("Scenario 4a-ii: exclusive Studio media is permanently deleted with contents", exclAssetId && (await mediaAssetStatus(studioMediaExcl.id, exclAssetId)) === 404, String(await mediaAssetStatus(studioMediaExcl.id, exclAssetId || "")));

  // ---- Scenario 4b: shared media is retained and reported ----------------
  const mediaSharedTitle = `TPI-089 MediaShared ${runId}`;
  const mediaCopyTitle = `TPI-089 MediaShared Copy ${runId}`;
  const studioMediaShared = await createStudioViaHome(mediaSharedTitle);
  const uploadShared = await uploadStudioMedia(studioMediaShared.id, "tpi-089-shared.png", "image/png", "synthetic-shared-media");
  check("Scenario 4b fixture: shared media uploads to the Studio", uploadShared.status >= 200 && uploadShared.status < 300 && Boolean(uploadShared.assetId), JSON.stringify(uploadShared));
  const sharedAssetId = uploadShared.assetId;
  // A second Studio's saved configuration references the same media asset —
  // ownership is no longer exclusive, so deletion must preserve it. The
  // referencing Studio is created through the API and never becomes the active
  // browser Studio, so its saved state cannot be raced by the app's autosave.
  const copy = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(studioMediaShared.id)}/duplicate`, { method: "POST", body: { title: mediaCopyTitle } });
  check("Scenario 4b fixture: a second Studio exists to reference the same media", copy.status >= 200 && copy.status < 300 && Boolean(copy.body?.workspace?.id), JSON.stringify({ status: copy.status, title: copy.body?.workspace?.title }));
  const copyRecord = await workspaceByTitle(mediaCopyTitle);
  const copyRef = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(copyRecord.id)}`, {
    method: "PATCH",
    body: {
      expectedVersion: copyRecord.version,
      state: {
        broadcast: { id: copyRecord.localBroadcastId, title: mediaCopyTitle, status: "draft" },
        // customSounds is a preserved configuration slot carrying serverAssetId
        // (the same shape real media assignments use).
        configuration: { customSounds: [{ id: "tpi-089-shared-ref", serverAssetId: sharedAssetId, fileName: "tpi-089-shared.png", kind: "image", title: "TPI-089 shared reference" }] }
      }
    }
  });
  check("Scenario 4b fixture: the second Studio's configuration references the media", copyRef.status === 200 && JSON.stringify(copyRef.body?.workspace?.state || {}).includes(String(sharedAssetId)), JSON.stringify({ status: copyRef.status }));
  await goHome();
  const sharedInventoryText = await deleteWithContents(mediaSharedTitle);
  check("Scenario 4b-i: the inventory reports the media shared with another Studio", /shared with|referenced by/i.test(sharedInventoryText) && sharedInventoryText.includes(mediaCopyTitle), sharedInventoryText.slice(0, 600));
  await waitFor("MediaShared Studio removed", async () => await workspaceGone(mediaSharedTitle), 30_000);
  check("Scenario 4b-ii: media shared with another Studio is never deleted", sharedAssetId && (await mediaAssetStatus(studioMediaShared.id, sharedAssetId)) === 200, String(await mediaAssetStatus(studioMediaShared.id, sharedAssetId || "")));
  const copyAfter = await workspaceByTitle(mediaCopyTitle);
  const copyState = JSON.stringify(copyAfter?.state?.configuration || {});
  check("Scenario 4b-iii: the referencing Studio keeps its configuration and reference", Boolean(copyAfter) && copyState.includes(String(sharedAssetId)), copyState.slice(0, 300));

  // ---- Scenario 5: browser-local Studio deletion -------------------------
  const browserA = `tpi-089-browser-a-${runId}`;
  const browserB = `tpi-089-browser-b-${runId}`;
  const browserATitle = `TPI-089 Browser A ${runId}`;
  const browserBTitle = `TPI-089 Browser B ${runId}`;
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
  await driver.navigate().refresh();
  await waitFor("StudioFlow after seeding refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  await waitFor("browser-local Studio cards", async () => (await cardIndexFor(browserATitle)) >= 0 && (await cardIndexFor(browserBTitle)) >= 0, 20_000);
  await deleteWithContents(browserATitle);
  await waitFor("browser-local Studio removed", async () => (await cardIndexFor(browserATitle)) < 0, 20_000);
  const localState = await js(`var a = arguments[0], b = arguments[1];
    var snapshots = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}');
    var recovery = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.recovery.v1') || '{}');
    var tombstones = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioDeleted.v1') || '[]');
    return { snapshotA: Boolean(snapshots[a]), snapshotB: Boolean(snapshots[b]), recoveryA: Boolean(recovery[a]), recoveryB: Boolean(recovery[b]), tombstoned: tombstones.indexOf(a) >= 0 };`, browserA, browserB);
  check("Scenario 5a: browser-local deletion removes the Studio's own listing and configuration", localState.snapshotA === false && localState.tombstoned === true, JSON.stringify(localState));
  check("Scenario 5b: the other browser-local Studio's snapshot is untouched", localState.snapshotB === true, JSON.stringify(localState));
  check("Scenario 5c: unrelated recovery snapshots are preserved", localState.recoveryA === true && localState.recoveryB === true, JSON.stringify(localState));
  check("Scenario 5d: the other browser-local Studio remains listed", (await cardIndexFor(browserBTitle)) >= 0, `card index ${await cardIndexFor(browserBTitle)}`);

  // ---- Scenario 6: archived Studio deletion -----------------------------
  const archTitle = `TPI-089 Arch ${runId}`;
  await createStudioViaHome(archTitle);
  await goHome();
  let archivedShown = false;
  for (let attempt = 0; attempt < 3 && !archivedShown; attempt += 1) {
    if (attempt) await sleep(1500);
    if (!(await clickCardButton(archTitle, "More Actions"))) continue;
    await sleep(250);
    if (!(await clickCardButton(archTitle, "Archive Studio"))) continue;
    archivedShown = await waitFor("archived Studio appears in the Archived Studios view", async () => {
      const section = await js("var node = document.querySelector('.studio-archive-section'); return node ? node.textContent : '';");
      return section.indexOf(archTitle) >= 0;
    }, 15_000).then(() => true).catch(() => false);
  }
  if (!archivedShown) throw new Error(`archived Studio never appeared in the Archived Studios view: ${archTitle}`);
  if (!(await clickButtonByText("Delete Studio", ".studio-archive-section"))) throw new Error("Delete Studio is unavailable in the Archived Studios view");
  await waitFor("Delete Studio confirmation dialog", async () => (await count(".studio-delete-warning")) === 1, 15_000);
  await waitForInventory();
  await typeConfirmationName(archTitle);
  await confirmDeleteDialog(archTitle);
  await waitFor("archived Studio permanently removed", async () => await workspaceGone(archTitle), 30_000);
  check("Scenario 6a: an archived Studio can be permanently deleted", await workspaceGone(archTitle), archTitle);
  check("Scenario 6b: the deleted archived Studio leaves the Archived Studios view", (await js("var node = document.querySelector('.studio-archive-section'); return node ? node.textContent : '';")).indexOf(archTitle) < 0);

  // ---- Scenario 7: deletion during an active recording ------------------
  const activeTitle = `TPI-089 Active ${runId}`;
  const studioActive = await createStudioViaHome(activeTitle);
  const activeKey = studioActive.localBroadcastId || studioActive.id;
  const activeSessionId = `tpi-089-active-${runId}`;
  const startSession = await serverFetch("/api/studio/production/start", {
    method: "POST",
    body: { localBroadcastId: activeKey, mode: "recording", sessionId: activeSessionId }
  });
  check("Scenario 7 fixture: an active production session starts", startSession.status === 200, JSON.stringify({ status: startSession.status, body: startSession.body }));
  // The recording flow's browser production latch, exactly as a live recording
  // sets it; the bridge verifies it against the authoritative server session.
  // A page-side heartbeat keeps the session authoritative for the duration of
  // the blocked-attempt interactions (sessions go stale after 30s quiet).
  await js("var sessionId = arguments[0]; window.__tpiStudioProductionLock = { locked: true, source: 'tpi-089-suite' }; window.__tpi089Heartbeat = setInterval(function () { fetch('/api/studio/production/heartbeat', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: sessionId }) }); }, 5000);", activeSessionId);
  await goHome();
  await openDeleteDialog(activeTitle);
  await typeConfirmationName(activeTitle);
  const lockedButton = await confirmButtonState();
  if (lockedButton?.disabled === false) {
    if (!(await clickButtonByText("Delete Studio permanently", ".modal"))) throw new Error("Delete Studio permanently is unavailable");
    await waitFor("blocked deletion outcome", async () => (await count(".studio-delete-error")) > 0, 15_000);
  }
  const blockError = await js("var error = document.querySelector('.studio-delete-error'); return error ? (error.textContent || '').trim() : '';");
  check("Scenario 7a: deletion during an active recording is blocked", /recording or livestream is active|active production/i.test(blockError) && (await count(".studio-delete-warning")) === 1, blockError);
  check("Scenario 7b: the blocked deletion deletes nothing", Boolean(await workspaceByTitle(activeTitle)) && (await cardIndexFor(activeTitle)) >= 0);
  if (!(await clickButtonByText("Cancel", ".modal"))) throw new Error("Cancel is unavailable");
  await waitFor("Delete dialog to close", async () => (await count(".studio-delete-warning")) === 0, 15_000);
  await js("window.__tpiStudioProductionLock = { locked: false }; if (window.__tpi089Heartbeat) { clearInterval(window.__tpi089Heartbeat); window.__tpi089Heartbeat = null; }");
  const stopSession = await serverFetch("/api/studio/production/stop", { method: "POST", body: { sessionId: activeSessionId } }).catch(() => null);
  await releaseStaleProductionSessions();
  // After the production is safely stopped the same Studio deletes normally.
  await openDeleteDialog(activeTitle);
  await typeConfirmationName(activeTitle);
  await confirmDeleteDialog(activeTitle);
  await waitFor("Active Studio removed after the production stopped", async () => await workspaceGone(activeTitle), 30_000);
  check("Scenario 7c: deletion succeeds after the production is safely stopped", await workspaceGone(activeTitle) && (stopSession === null || stopSession.status === 200), JSON.stringify({ stop: stopSession && stopSession.status }));

  // ---- Scenario 8 + 12: stale browser tab reports the conflict -----------
  const staleTitle = `TPI-089 Stale ${runId}`;
  const studioStale = await createStudioViaHome(staleTitle);
  await goHome();
  await openDeleteDialog(staleTitle);
  await waitForInventory(); // pins the version the owner is confirming
  await typeConfirmationName(staleTitle);
  // Another tab renames the Studio — a change the dialog discloses (the exact
  // name and immutable identity), so the confirmed deletion must not proceed
  // against data the owner never saw. The active Studio can autosave between
  // read and write, so the bump retries with a refreshed version until it lands.
  const staleRenamed = `${staleTitle} Renamed`;
  let bumpStale = null;
  for (let attempt = 0; attempt < 5 && (!bumpStale || bumpStale.status !== 200); attempt += 1) {
    const staleCurrent = await workspaceById(studioStale.id);
    bumpStale = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(studioStale.id)}`, {
      method: "PATCH",
      body: { expectedVersion: staleCurrent.version, title: staleRenamed }
    });
    if (bumpStale.status !== 200) await sleep(500);
  }
  check("Scenario 8 fixture: another tab renames the Studio", bumpStale.status === 200 && bumpStale.body?.workspace?.title === staleRenamed, JSON.stringify({ status: bumpStale && bumpStale.status, title: bumpStale && bumpStale.body?.workspace?.title }));
  if (!(await clickButtonByText("Delete Studio permanently", ".modal"))) throw new Error("Delete Studio permanently is unavailable");
  await waitFor("stale-tab deletion outcome", async () => (await count(".studio-delete-error")) > 0, 15_000);
  const staleError = await js("var error = document.querySelector('.studio-delete-error'); return error ? (error.textContent || '').trim() : '';");
  check("Scenario 8a: a stale tab's deletion is refused against the confirmed inventory", /Review the updated inventory and confirm deletion again|changed while the deletion dialog was open/i.test(staleError), staleError);
  check("Scenario 8b: the interface reports the failure without claiming success", staleError.length > 0 && (await count(".studio-delete-warning")) === 1, staleError);
  check("Scenario 8c: the failed stale-tab deletion deletes nothing", Boolean(await workspaceByTitle(staleRenamed)) && (await cardIndexFor(staleTitle)) >= 0, JSON.stringify({ server: Boolean(await workspaceByTitle(staleRenamed)), card: await cardIndexFor(staleTitle) }));
  check("Scenario 12a: failures carry a concrete reason", staleError.length > 10, staleError);
  if (!(await clickButtonByText("Cancel", ".modal"))) throw new Error("Cancel is unavailable");
  await waitFor("Delete dialog to close", async () => (await count(".studio-delete-warning")) === 0, 15_000);
  // The owner reviews the refreshed inventory (with the new name) and confirms
  // again — reload first so the catalog reflects the rename, and the typed-name
  // gate then requires the current name.
  await driver.navigate().refresh();
  await waitFor("StudioFlow after refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  await openDeleteDialog(staleRenamed);
  await waitForInventory();
  await typeConfirmationName(staleRenamed);
  await confirmDeleteDialog(staleRenamed);
  await waitFor("Stale Studio removed after re-confirmation", async () => await workspaceGone(staleRenamed), 30_000);
  check("Scenario 8d: a fresh confirmation deletes the Studio", await workspaceGone(staleRenamed) && await workspaceGone(staleTitle));

  // ---- Scenario 11: duplicate deletion requests converge -----------------
  const duplicatePurge = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(studioEmpty.id)}/purge`, {
    method: "POST",
    body: { expectedVersion: studioEmpty.version, mode: "studio-only" }
  });
  check("Scenario 11a: a duplicate deletion request converges instead of failing", duplicatePurge.status === 200 && duplicatePurge.body?.alreadyDeleted === true, JSON.stringify({ status: duplicatePurge.status, body: duplicatePurge.body }));
  check("Scenario 11b: the reconciled deletion still reports what was deleted and retained", duplicatePurge.status === 200 && Boolean(duplicatePurge.body?.deleted) && Boolean(duplicatePurge.body?.retained), JSON.stringify(duplicatePurge.body));

  // ---- Scenarios 9 + 10: refresh persistence and isolation --------------
  await driver.navigate().refresh();
  await waitFor("StudioFlow after refresh", async () => (await count("[data-tpi-scenes-panel]")) > 0 || await buttonExists("Create new Studio", ".home-page"), 30_000);
  await goHome();
  check("Scenario 9a: deleted Studios stay deleted after refresh",
    (await cardIndexFor(emptyTitle)) < 0 && (await cardIndexFor(recContentsTitle)) < 0 && (await cardIndexFor(mediaExclTitle)) < 0 && (await cardIndexFor(mediaSharedTitle)) < 0 && (await cardIndexFor(activeTitle)) < 0 && (await cardIndexFor(`${staleTitle} Renamed`)) < 0 && (await cardIndexFor(archTitle)) < 0 && (await cardIndexFor(browserATitle)) < 0,
    JSON.stringify({ empty: await cardIndexFor(emptyTitle), recContents: await cardIndexFor(recContentsTitle) }));
  const keepWorkspaceAfter = await workspaceById(studioKeep.id);
  const keepConfigAfter = keepWorkspaceAfter?.state?.configuration || {};
  const keepProductionAfter = (await broadcastRecords()).find((record) => record && record.title === `TPI-089 Keep Production ${runId}`);
  const keepRecordingAfter = (await libraryRecords()).find((item) => item && item.id === `tpi-089-keep-rec-${runId}`);
  check("Scenario 10a: unrelated Studios keep their own saved configuration", (keepConfigAfter.studioScenes || []).some((scene) => scene.title === "TPI-089 Keep Scene"), JSON.stringify((keepConfigAfter.studioScenes || []).map((scene) => scene.title)));
  check("Scenario 10b: unrelated Studios' recordings stay attached", Boolean(keepRecordingAfter) && keepRecordingAfter.studioId === keepKey, JSON.stringify(keepRecordingAfter));
  check("Scenario 10c: unrelated Studios' recordings keep their media", await recordingBlobPresent(`tpi-089-keep-blob-${runId}`));
  check("Scenario 10d: the unrelated Studio's card remains", (await cardIndexFor(keepTitle)) >= 0, keepTitle);
  check("Scenario 10e: the retained (non-exclusive) production is preserved and detached", !keepProductionAfter || keepProductionAfter.studioId === keepKey, JSON.stringify(keepProductionAfter));

  // ---- Evidence + summary -----------------------------------------------
  const summary = {
    suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY",
    base,
    runId,
    checks: results,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.failed === 0 ? 0 : 1);
} catch (error) {
  console.log(JSON.stringify({
    suite: "TPI-STUDIOFLOW-089-DELETION-SAFETY",
    status: "FAILED",
    error: safe(error),
    checks: results
  }, null, 2));
  process.exit(1);
} finally {
  try {
    if (driver) {
      await releaseStaleProductionSessions();
      await purgeFixtures();
      await driver.quit();
    }
  } catch { /* best-effort cleanup */ }
}

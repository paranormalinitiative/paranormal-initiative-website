#!/usr/bin/env node

// TPI-STUDIOFLOW-132 — production permanent-deletion regression.
//
// Directive 132 reproduced the owner's production symptom: an existing Studio
// that lives in browser storage (a "browser-only" Studio) is permanently
// undeletable once it has a browser-local recovery snapshot, because the
// deletion inventory reported `storage: "both"` while never loading a server
// inventory. The confirmation dialog then waits forever for "the complete
// safety inventory" and `Delete Studio Permanently` never activates, even with
// the exact Studio name typed.
//
// This suite encodes that exact condition plus the surrounding confirmation
// matrix. It runs against the authoritative local Worker in an isolated
// disposable Firefox Developer Edition profile and only ever creates and
// deletes synthetic `TPI-132 ` Studios. No owner Studio, recording, Note,
// script, scene or media object is touched.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_132_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const credentials = JSON.parse(readFileSync(resolve(repoRoot, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts?.test_admin;
assert(account?.username && account?.password, "test_admin credentials are required");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const runId = Date.now().toString(36);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-132-"));
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const safe = error => (error instanceof Error ? error.message : String(error));
const sleep = ms => new Promise(settle => setTimeout(settle, ms));

let driver;
let serverWorkspaceIds = [];
let localStudioKeys = [];

const js = (script, ...args) => driver.executeScript(script, ...args);
const jsAsync = (script, ...args) => driver.executeAsyncScript(script, ...args);
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); }
    catch (error) { detail = safe(error); }
    await sleep(250);
  }
  throw new Error(`${description} timed out: ${detail}`);
}
async function authenticatedFetch(path, options = {}) {
  return jsAsync(`
    const done = arguments[arguments.length - 1];
    const path = arguments[0], options = arguments[1] || {};
    fetch(path, Object.assign({ credentials: "same-origin" }, options, {
      headers: Object.assign({ "content-type": "application/json" }, options.headers || {})
    })).then(async response => {
      const text = await response.text(); let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      done({ status: response.status, body });
    }).catch(error => done({ status: 0, error: String(error) }));
  `, path, options);
}
async function serverFetch(path, options = {}) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
  const response = await fetch(`${base}${path}${path.includes("?") ? "&" : "?"}tpi132=${runId}`, {
    method: options.method || "GET",
    headers: { Cookie: cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let body = null; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}

async function login() {
  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await waitFor("member login handler", async () => await js("return document.readyState !== 'loading' && Boolean(window.TPIApi);"));
  await js(`const form = document.querySelector('form[data-member-login]');
    const user = form.querySelector('input[name="username"]');
    const pass = form.querySelector('input[name="password"]');
    user.value = arguments[0]; pass.value = arguments[1];
    [user, pass].forEach(input => ['input', 'change'].forEach(type => input.dispatchEvent(new Event(type, { bubbles: true }))));
    form.requestSubmit();`, account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
}

// A browser-only Studio is exactly what the production browser still holds for
// Studios whose server row was removed: a host broadcast record with no
// `studioId`, no matching server workspace, plus an optional browser-local
// recovery snapshot written by the normal save path.
const LOCAL_SNAPSHOT_KEY = "studioflow.tpiLocalStudioSnapshots.v1";
async function seedBrowserLocalStudio(title, options = {}) {
  const key = `tpi-132-local-${runId}-${localStudioKeys.length}`;
  localStudioKeys.push(key);
  await js(`
    const title = arguments[0], key = arguments[1], withSnapshot = arguments[2], snapshotKey = arguments[3];
    const broadcastsRaw = localStorage.getItem('studioflow.broadcasts');
    let broadcasts = [];
    try { broadcasts = broadcastsRaw ? JSON.parse(broadcastsRaw) : []; } catch { broadcasts = []; }
    if (!Array.isArray(broadcasts)) broadcasts = [];
    broadcasts.push({ id: key, kind: 'live', title, description: '', status: 'draft', createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts));
    if (withSnapshot) {
      let snapshots = {};
      try { snapshots = JSON.parse(localStorage.getItem(snapshotKey) || '{}') || {}; } catch { snapshots = {}; }
      snapshots[key] = {
        savedAt: new Date().toISOString(),
        state: {
          broadcast: { id: key, title, description: '', status: 'draft', visibility: 'private' },
          settings: { programOrientation: 'landscape', recordingDestination: 'browser' },
          recording: { localLibraryCount: 0, incompleteSessionCount: 0, storageMode: 'browser' },
          configuration: {
            selectedBackground: 'default',
            activeSceneId: 'scene-1',
            studioScenes: [
              { id: 'scene-1', kind: 'demo', title: 'Scene 1', layout: 'Speaker view' },
              { id: 'scene-2', kind: 'demo', title: 'Scene 2', layout: 'Group discussion' }
            ],
            scenePanelItems: [
              { id: 'scene:scene-1', kind: 'scene', title: 'Scene 1', sceneId: 'scene-1' },
              { id: 'scene:scene-2', kind: 'scene', title: 'Scene 2', sceneId: 'scene-2' }
            ]
          }
        }
      };
      localStorage.setItem(snapshotKey, JSON.stringify(snapshots));
    }
  `, title, key, options.withSnapshot === true, LOCAL_SNAPSHOT_KEY);
  return key;
}

async function createServerWorkspace(title, state) {
  const localBroadcastId = `tpi-132-server-${runId}-${serverWorkspaceIds.length}`;
  const response = await serverFetch("/api/studio/workspaces", {
    method: "POST",
    body: { title, localBroadcastId, state: { broadcast: { id: localBroadcastId, title, status: "draft" }, configuration: {}, ...(state || {}) } }
  });
  assert.equal(response.status, 201, JSON.stringify(response));
  serverWorkspaceIds.push(response.body.workspace.id);
  return response.body.workspace;
}
async function seedServerRecoverySnapshot(workspace) {
  // A real save path writes both a server snapshot and a browser-local one;
  // reproduce the browser-local half so the inventory reports `both`.
  await js(`
    const id = arguments[0], title = arguments[1], snapshotKey = arguments[2];
    let snapshots = {};
    try { snapshots = JSON.parse(localStorage.getItem(snapshotKey) || '{}') || {}; } catch { snapshots = {}; }
    snapshots[id] = { savedAt: new Date().toISOString(), state: { broadcast: { id, title, status: 'draft' }, configuration: { studioScenes: [{ id: 'scene-1', kind: 'demo', title: 'Scene 1' }] } } };
    localStorage.setItem(snapshotKey, JSON.stringify(snapshots));
  `, workspace.localBroadcastId || workspace.id, workspace.title, LOCAL_SNAPSHOT_KEY);
  const snapshot = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}/snapshots`, {
    method: "POST",
    body: { expectedVersion: workspace.version }
  });
  return snapshot;
}
// Remove any synthetic rows an interrupted earlier run left behind so this
// suite never leaves fixtures in the owner's authoritative local Studio list.
async function sweepSyntheticFixtures() {
  const active = await serverFetch("/api/studio/workspaces");
  const archived = await serverFetch("/api/studio/workspaces?includeArchived=true");
  const list = [].concat(active.body?.workspaces || [], archived.body?.workspaces || []);
  for (const workspace of list) {
    if (String(workspace?.title || "").startsWith("TPI-132 ")) await purgeQuietly(workspace.id);
  }
}
async function patchWorkspace(id, patch) {
  const current = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
  assert.equal(current.status, 200, JSON.stringify(current));
  const workspace = current.body.workspace;
  return serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { state: { ...workspace.state, ...patch }, expectedVersion: workspace.version }
  });
}
async function purgeQuietly(id) {
  try {
    const current = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
    if (current.status !== 200 || !current.body?.workspace) return;
    if (["recording", "live", "stopping", "finalizing", "recovery"].includes(current.body.workspace.state?.broadcast?.status)) {
      await patchWorkspace(id, { broadcast: { ...current.body.workspace.state.broadcast, status: "draft" } });
    }
    const latest = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
    if (latest.status === 200 && latest.body?.workspace) {
      await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/purge`, {
        method: "POST",
        body: { mode: "with-contents", expectedVersion: latest.body.workspace.version }
      });
    }
  } catch {
    // Best effort: the assertion result is reported separately.
  }
}

async function clickCardAction(title, action) {
  return js(`const wanted = arguments[0], action = arguments[1];
    const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    });
    if (!card) return false;
    const controls = Array.from(card.querySelectorAll('button, summary'));
    const target = controls.find(node => node.textContent.trim() === action);
    if (!target) return false; target.click(); return true;`, title, action);
}
async function gotoStudioHome() {
  await driver.get(`${base}/studio/`);
  const homeReady = await waitFor("StudioFlow home or selected Studio", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")), 8_000).catch(() => false);
  if (!homeReady) {
    const exited = await js("const button = document.querySelector('.production-bar .exit-button, .exit-button'); if (!button) return false; button.click(); return true;");
    assert(exited, "StudioFlow did not expose a Home navigation control");
  }
  await waitFor("Studio home", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")));
}
async function openDeleteDialog(title, options = {}) {
  await gotoStudioHome();
  // Page-level instrumentation must be installed after navigation, because a
  // reload discards it, and before the dialog mounts, because the inventory
  // request fires on mount.
  if (options.instrument) await options.instrument();
  await waitFor("disposable Studio card", async () => Boolean(await js(`return Array.from(document.querySelectorAll('.studio-card')).some(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === arguments[0];
    });`, title)));
  // Active Studio cards expose Delete Studio under More Actions; archived
  // Studio cards expose it directly in the archive section.
  if (await clickCardAction(title, "More Actions")) {
    await sleep(200);
    assert(await clickCardAction(title, "Delete Studio"), "Delete Studio is unavailable");
  } else {
    assert(await clickCardAction(title, "Delete Studio"), "Delete Studio is unavailable");
  }
  await waitFor("permanent deletion dialog", async () => (await driver.findElements(By.css(".studio-delete-warning"))).length === 1);
  await waitFor("complete deletion inventory", async () => js("const node = document.querySelector('[data-testid=studio-delete-inventory]'); return node && !node.textContent.includes('Preparing the deletion inventory');"));
}
const buttonState = () => js("const button = document.querySelector('[data-testid=studio-delete-submit]'); return button ? { disabled: button.disabled, label: button.textContent.trim() } : null;");
const inventoryText = () => js("return document.querySelector('[data-testid=studio-delete-inventory]')?.textContent || '';");
const dialogStatus = () => js("return Array.from(document.querySelectorAll('.studio-delete-inventory-status')).map(node => node.textContent.trim()).join(' | ');");
async function typeName(title) {
  const input = (await driver.findElements(By.css('[data-testid="studio-delete-confirmation"]')))[0];
  await input.clear();
  await input.sendKeys(title);
}
async function pasteName(title) {
  const input = (await driver.findElements(By.css('[data-testid="studio-delete-confirmation"]')))[0];
  await input.clear();
  execFileSync("pbcopy", [], { input: title });
  await input.click();
  await input.sendKeys(Key.COMMAND, "v");
  await waitFor("pasted Studio name", async () => (await js("return document.querySelector('[data-testid=studio-delete-confirmation]')?.value || '';")) === title, 5_000);
}
async function cancelDialog() {
  await js("document.querySelector('.studio-delete-actions .outline-button').click();");
  await waitFor("cancel closes dialog", async () => !(await js("return Boolean(document.querySelector('.studio-delete-warning'));")));
}
async function clickSubmit() {
  await js("document.querySelector('[data-testid=studio-delete-submit]').click();");
  await waitFor("deletion dialog outcome", async () => !(await js("return Boolean(document.querySelector('.studio-delete-warning'));")) || Boolean(await js("return document.querySelector('.studio-delete-error');")), 20_000);
}
async function inventoryFor(key) {
  return js("return window.__tpiStudioWorkspace.studioDeletionInventory(arguments[0]).then(value => value).catch(error => ({ error: String(error && error.message || error) }));", key);
}
const cardMissing = title => js(`return !Array.from(document.querySelectorAll('.studio-card')).some(node => {
    const strong = node.querySelector('.studio-card-title strong');
    return strong && strong.textContent.trim() === arguments[0];
  });`, title);

async function run() {
  mkdirSync(join(evidenceRoot, "profile"), { recursive: true });
  const options = new firefox.Options()
    .setBinary(firefoxBinary)
    .setProfile(join(evidenceRoot, "profile"))
    .addArguments("-no-remote", "-new-instance")
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options)
    .setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1100, x: 20, y: 20 });
  await login();
  await sweepSyntheticFixtures();

  // ── Scenario 1 — control: browser-only Studio with no recovery snapshot ──
  const controlTitle = `TPI-132 Control ${runId}`;
  const controlKey = await seedBrowserLocalStudio(controlTitle, { withSnapshot: false });
  await driver.get(`${base}/studio/`);
  const controlInventory = await inventoryFor(controlKey);
  check("S1 browser-only Studio without a snapshot reports browser-local storage", controlInventory?.storage === "browser-local", JSON.stringify(controlInventory));
  await openDeleteDialog(controlTitle);
  await typeName(controlTitle);
  const controlButton = await buttonState();
  check("S1 exact name activates Delete Studio Permanently", controlButton?.disabled === false, JSON.stringify(controlButton));
  await cancelDialog();

  // ── Scenario 2 — the production failure condition ────────────────────────
  // Existing browser-only Studio + browser-local recovery snapshot.
  const legacyTitle = `TPI-132 Legacy Snapshot ${runId}`;
  const legacyKey = await seedBrowserLocalStudio(legacyTitle, { withSnapshot: true });
  await driver.get(`${base}/studio/`);
  const legacyInventory = await inventoryFor(legacyKey);
  check("S2 legacy Studio inventory is produced", Boolean(legacyInventory && !legacyInventory.error), JSON.stringify(legacyInventory));
  check("S2 legacy Studio has no server workspace", !legacyInventory?.workspaceId, JSON.stringify(legacyInventory?.workspaceId));
  check("S2 legacy Studio has no server inventory", legacyInventory?.server == null, JSON.stringify(legacyInventory?.server));
  check("S2 legacy Studio recovery snapshot is reported", legacyInventory?.localRecoverySnapshot === true, JSON.stringify(legacyInventory?.localRecoverySnapshot));
  check("S2 legacy Studio is classified as browser-local storage", legacyInventory?.storage === "browser-local", `storage=${JSON.stringify(legacyInventory?.storage)}`);
  await openDeleteDialog(legacyTitle);
  const legacyStatus = await dialogStatus();
  check("S2 the dialog does not demand an impossible server inventory", !/server did not complete/i.test(legacyStatus), legacyStatus);
  check("S2 inventory text describes a browser-local Studio", /browser-local Studio/i.test(await inventoryText()), (await inventoryText()).slice(0, 300));
  await typeName("Wrong name");
  check("S2 an incorrect name keeps deletion disabled", (await buttonState())?.disabled === true);
  await typeName(legacyTitle);
  const legacyButton = await buttonState();
  check("S2 exact typed name activates Delete Studio Permanently", legacyButton?.disabled === false, JSON.stringify(legacyButton));
  check("S2 button label is unchanged", legacyButton?.label === "Delete Studio Permanently", String(legacyButton?.label));
  await clickSubmit();
  check("S2 permanent deletion removes the legacy Studio", await cardMissing(legacyTitle));
  const legacyResidue = await js(`
    const key = arguments[0];
    const broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');
    const snapshots = JSON.parse(localStorage.getItem(arguments[1]) || '{}');
    const tombstones = JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioDeleted.v1') || '[]');
    return { broadcast: broadcasts.some(item => item && item.id === key), snapshot: Boolean(snapshots[key]), tombstone: tombstones.includes(key) };`, legacyKey, LOCAL_SNAPSHOT_KEY);
  check("S2 deletion removes only that Studio's browser record and snapshot", legacyResidue.broadcast === false && legacyResidue.snapshot === false, JSON.stringify(legacyResidue));
  check("S2 deleted Studio is tombstoned so it cannot reappear", legacyResidue.tombstone === true, JSON.stringify(legacyResidue));
  check("S2 the control Studio is untouched", !(await cardMissing(controlTitle)));

  // ── Scenario 3 — server-backed Studio with scenes + recovery snapshots ──
  const serverTitle = `TPI-132 Server Scenes ${runId}`;
  const serverWorkspace = await createServerWorkspace(serverTitle, {
    configuration: {
      studioScenes: [
        { id: "scene-1", kind: "demo", title: "TPI-132 Scene One", layout: "Speaker view" },
        { id: "scene-2", kind: "demo", title: "TPI-132 Scene Two", layout: "Group discussion" }
      ]
    }
  });
  const serverSnapshot = await seedServerRecoverySnapshot(serverWorkspace);
  check("S3 recovery snapshot fixture is accepted by the server", serverSnapshot.status === 200 || serverSnapshot.status === 201, JSON.stringify(serverSnapshot));
  await driver.get(`${base}/studio/`);
  const serverInventory = await inventoryFor(serverWorkspace.localBroadcastId || serverWorkspace.id);
  check("S3 server-backed Studio with snapshots reports both storage scopes", serverInventory?.storage === "both", JSON.stringify(serverInventory?.storage));
  check("S3 server-backed Studio inventory is complete", Boolean(serverInventory?.server) && !serverInventory?.serverUnavailable && !serverInventory?.server?.productionsUnavailable && !serverInventory?.server?.mediaUnavailable && !serverInventory?.server?.snapshotsUnavailable, JSON.stringify(serverInventory?.server));
  await openDeleteDialog(serverTitle);
  await typeName(serverTitle);
  check("S3 exact typed name activates deletion", (await buttonState())?.disabled === false, JSON.stringify(await buttonState()));
  await typeName("wrong");
  await pasteName(serverTitle);
  check("S3 exact pasted name activates deletion", (await buttonState())?.disabled === false, JSON.stringify(await buttonState()));
  await cancelDialog();

  // ── Scenario 4 — archived server-backed Studio ──────────────────────────
  const archivedTitle = `TPI-132 Archived ${runId}`;
  const archivedWorkspace = await createServerWorkspace(archivedTitle, {});
  const archiveResponse = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(archivedWorkspace.id)}/archive`, {
    method: "POST",
    body: { expectedVersion: archivedWorkspace.version }
  });
  check("S4 archive fixture is accepted", archiveResponse.status === 200, JSON.stringify(archiveResponse));
  await driver.get(`${base}/studio/`);
  await openDeleteDialog(archivedTitle);
  await typeName(archivedTitle);
  check("S4 archived Studio activates deletion with the exact name", (await buttonState())?.disabled === false, JSON.stringify(await buttonState()));
  await cancelDialog();

  // ── Scenario 5 — safety-blocked Studio (scheduled production) ───────────
  const guardedTitle = `TPI-132 Guarded ${runId}`;
  const guardedWorkspace = await createServerWorkspace(guardedTitle, {});
  const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const guardPatch = await patchWorkspace(guardedWorkspace.id, { broadcast: { id: guardedWorkspace.localBroadcastId, title: guardedTitle, status: "draft", scheduledAt } });
  check("S5 scheduled-production fixture is established", guardPatch.status === 200, JSON.stringify(guardPatch));
  await driver.get(`${base}/studio/`);
  await openDeleteDialog(guardedTitle);
  const guardStatus = await dialogStatus();
  check("S5 scheduled production explains why deletion is unavailable", /scheduled production/i.test(guardStatus), guardStatus);
  await typeName(guardedTitle);
  check("S5 safety-blocked Studio stays undeletable with the exact name", (await buttonState())?.disabled === true, JSON.stringify(await buttonState()));
  await cancelDialog();

  // ── Scenario 6 — incomplete server inventory must still block ───────────
  const blockedTitle = `TPI-132 Incomplete ${runId}`;
  const blockedWorkspace = await createServerWorkspace(blockedTitle, {});
  await openDeleteDialog(blockedTitle, {
    instrument: () => js(`
      window.__tpi132Fetch = window.fetch;
      window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/deletion-inventory') !== -1) {
          return Promise.resolve(new Response(JSON.stringify({ error: 'diagnostic inventory failure' }), { status: 500, headers: { 'content-type': 'application/json' } }));
        }
        return window.__tpi132Fetch.call(window, input, init);
      };
    `)
  });
  const blockedStatus = await dialogStatus();
  check("S6 incomplete server inventory is disclosed", /server did not complete|unavailable/i.test(blockedStatus), blockedStatus);
  await typeName(blockedTitle);
  check("S6 incomplete server inventory keeps deletion disabled", (await buttonState())?.disabled === true, JSON.stringify(await buttonState()));
  await cancelDialog();
  await js("if (window.__tpi132Fetch) { window.fetch = window.__tpi132Fetch; delete window.__tpi132Fetch; }");

  // ── Cleanup: synthetic fixtures only ───────────────────────────────────
  for (const key of localStudioKeys) {
    if (key === controlKey) continue;
    await js(`
      const key = arguments[0], snapshotKey = arguments[1];
      const broadcasts = JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]');
      localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts.filter(item => !(item && item.id === key))));
      const snapshots = JSON.parse(localStorage.getItem(snapshotKey) || '{}');
      delete snapshots[key];
      localStorage.setItem(snapshotKey, JSON.stringify(snapshots));
    `, key, LOCAL_SNAPSHOT_KEY);
  }
  for (const id of serverWorkspaceIds) await purgeQuietly(id);
  serverWorkspaceIds = [];
}

try {
  await run();
} catch (error) {
  check("suite completed without an exception", false, safe(error));
} finally {
  try { if (driver) await driver.quit(); } catch {}
}
const failed = results.filter(item => !item.passed);
console.log(JSON.stringify({
  suite: "TPI-STUDIOFLOW-132",
  browser: "firefox-developer-edition",
  base,
  runId,
  evidenceRoot,
  passed: results.length - failed.length,
  total: results.length,
  status: failed.length ? "FAIL" : "PASS",
  results
}, null, 2));
if (failed.length) process.exitCode = 1;

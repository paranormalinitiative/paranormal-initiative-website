#!/usr/bin/env node
// TPI-STUDIOFLOW-033 — workspace configuration round-trip.
// The API checks exercise server normalization directly. The Firefox checks
// then use the real StudioFlow controls against two disposable workspaces and
// inspect the saved server state through the authenticated browser session.
import { existsSync, mkdtempSync, mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_033_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoA = process.env.TPI_033_VIDEO_A || "/private/tmp/tpi-020-synthetic-intro.mp4";
const videoB = process.env.TPI_033_VIDEO_B || "/private/tmp/tpi-020-synthetic-outro.mp4";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-033-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);
const runId = Date.now().toString(36);

for (const file of [firefoxBinary, geckodriver, videoA, videoB, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-033", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${base}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 240); }
  return { response, body };
}

function asset(id, blobKey, fileName, kind = "video") {
  return { id, blobKey, fileName, kind, mediaType: kind === "video" ? "video/mp4" : "audio/mpeg", size: 1234, title: fileName };
}
function browserAsset(id, fileName, slot) {
  return { id, slot, fileName, kind: "video", mediaType: "video/mp4", size: 1234, title: fileName };
}

function stateFor({ orientation, slots, musicTitle }) {
  return {
    settings: { programOrientation: orientation },
    configuration: {
      programOrientation: orientation,
      videoClipSlots: slots,
      backgroundMusicSlots: [asset(`music-${musicTitle}`, `music-${musicTitle}`, `${musicTitle}.mp3`, "audio")],
      backgroundMusicLoop: false,
      sceneMusicAssignments: { "after-intro": { blobKey: `music-${musicTitle}`, assetId: `music-${musicTitle}`, title: musicTitle } }
    }
  };
}

async function runApiRoundTrip() {
  const login = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password: account.password }) });
  check("API test account login succeeds", login.response.status === 200, `HTTP ${login.response.status}`);
  if (login.response.status !== 200) return;
  const cookie = (login.response.headers.get("set-cookie") || "").split(";")[0];
  const ids = [];
  try {
    const studioAState = stateFor({ orientation: "portrait", slots: [asset("a-1", "blob-a-1", "studio-a-one.mp4"), asset("a-2", "blob-a-2", "studio-a-two.mp4")], musicTitle: "studio-a-music" });
    const studioBState = stateFor({ orientation: "landscape", slots: [asset("b-1", "blob-b-1", "studio-b-one.mp4")], musicTitle: "studio-b-music" });
    for (const [label, state] of [["A", studioAState], ["B", studioBState]]) {
      const created = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: `TPI-033 API ${label} ${runId}`, localBroadcastId: `tpi-033-api-${label.toLowerCase()}-${runId}`, state }) }, cookie);
      check(`API creates disposable Studio ${label}`, created.response.status === 201, `HTTP ${created.response.status}`);
      if (created.body?.workspace?.id) ids.push({ id: created.body.workspace.id, version: created.body.workspace.version, label });
    }
    const studioA = ids.find(item => item.label === "A");
    const studioB = ids.find(item => item.label === "B");
    if (!studioA || !studioB) return;
    const readA = await request(`/api/studio/workspaces/${encodeURIComponent(studioA.id)}`, {}, cookie);
    const readB = await request(`/api/studio/workspaces/${encodeURIComponent(studioB.id)}`, {}, cookie);
    const configA = readA.body?.workspace?.state?.configuration || {};
    const configB = readB.body?.workspace?.state?.configuration || {};
    check("server preserves videoClipSlots for Studio A", configA.videoClipSlots?.length === 2 && configA.videoClipSlots.map(item => item.blobKey).join(",") === "blob-a-1,blob-a-2", JSON.stringify(configA.videoClipSlots));
    check("server preserves programOrientation for Studio A", configA.programOrientation === "portrait" && readA.body?.workspace?.state?.settings?.programOrientation === "portrait", JSON.stringify({ config: configA.programOrientation, settings: readA.body?.workspace?.state?.settings?.programOrientation }));
    check("server preserves existing Background Music fields", Array.isArray(configA.backgroundMusicSlots) && configA.backgroundMusicLoop === false && configA.sceneMusicAssignments?.["after-intro"]?.blobKey === "music-studio-a-music");
    check("Studio B remains isolated from Studio A", configB.programOrientation === "landscape" && configB.videoClipSlots?.[0]?.blobKey === "blob-b-1" && configB.videoClipSlots?.length === 1, JSON.stringify({ orientation: configB.programOrientation, slots: configB.videoClipSlots }));

    const changedState = stateFor({ orientation: "square", slots: [asset("a-3", "blob-a-3", "studio-a-three.mp4")], musicTitle: "studio-a-updated" });
    const update = await request(`/api/studio/workspaces/${encodeURIComponent(studioA.id)}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: readA.body.workspace.version, state: changedState }) }, cookie);
    check("server accepts a current-version Studio A update", update.response.status === 200, `HTTP ${update.response.status}`);
    const updatedVersion = update.body?.workspace?.version;
    const stale = await request(`/api/studio/workspaces/${encodeURIComponent(studioA.id)}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: readA.body.workspace.version, state: studioAState }) }, cookie);
    check("stale workspace responses remain rejected", stale.response.status === 409, `HTTP ${stale.response.status}`);
    const readUpdated = await request(`/api/studio/workspaces/${encodeURIComponent(studioA.id)}`, {}, cookie);
    check("stale update does not overwrite newer Studio A state", readUpdated.body?.workspace?.version === updatedVersion && readUpdated.body?.workspace?.state?.configuration?.programOrientation === "square" && readUpdated.body?.workspace?.state?.configuration?.videoClipSlots?.[0]?.blobKey === "blob-a-3");

    const invalid = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: `TPI-033 invalid ${runId}`, localBroadcastId: `tpi-033-invalid-${runId}`, state: { settings: { programOrientation: "portrait" }, configuration: { programOrientation: "invalid", videoClipSlots: [null, { nope: true }], backgroundMusicLoop: true } } }) }, cookie);
    check("invalid configuration is normalized through the existing schema", invalid.response.status === 201 && invalid.body?.workspace?.state?.configuration?.programOrientation === "landscape" && Array.isArray(invalid.body?.workspace?.state?.configuration?.videoClipSlots) && invalid.body.workspace.state.configuration.videoClipSlots.length === 1, JSON.stringify(invalid.body?.workspace?.state?.configuration || null));
    if (invalid.body?.workspace?.id) ids.push({ id: invalid.body.workspace.id, version: invalid.body.workspace.version, label: "invalid" });
  } finally {
    for (const item of ids) {
      const current = await request(`/api/studio/workspaces/${encodeURIComponent(item.id)}`, {}, cookie);
      const version = current.body?.workspace?.version;
      if (Number.isInteger(version)) await request(`/api/studio/workspaces/${encodeURIComponent(item.id)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: version }) }, cookie);
    }
  }
}

let driver;
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; } catch {}
    await sleep(200);
  }
  throw new Error(`${description} timed out`);
}
async function click(selector) {
  const elements = await driver.findElements(By.css(selector));
  if (!elements.length) return false;
  await elements[0].click();
  return true;
}
async function upload(selector, path) {
  const before = await count('input[type=file][accept*="video/"]');
  if (!(await click(selector))) throw new Error(`Upload trigger unavailable: ${selector}`);
  const input = await waitFor("dynamic video file input", async () => {
    const elements = await driver.findElements(By.css('input[type=file][accept*="video/"]'));
    return elements.length > before ? elements[elements.length - 1] : null;
  });
  await input.sendKeys(path);
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({ credentials: 'same-origin' }, options, { headers: Object.assign({ 'content-type': 'application/json' }, options.headers || {}) })).then(function(r){ return r.text().then(function(text){ var body=null; try{ body=text ? JSON.parse(text) : null; }catch(e){ body=text; } done({ status:r.status, body:body }); }); }).catch(function(error){ done({ status:0, error:String(error) }); });", path, options);
}
async function browserState(workspaceId, title, orientation, slots) {
  return { broadcast: { id: workspaceId, title, description: "Disposable browser round-trip studio", status: "draft", visibility: "private" }, settings: { programOrientation: orientation }, configuration: { programOrientation: orientation, videoClipSlots: slots, backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} } };
}
async function createBrowserWorkspace(label, orientation, slots) {
  const localBroadcastId = `tpi-033-browser-${label.toLowerCase()}-${runId}`;
  const title = `TPI-033 Browser ${label} ${runId}`;
  const state = await browserState(localBroadcastId, title, orientation, slots);
  return authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title, localBroadcastId, state }) });
}
async function activeStudioId() { return await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1') || ''; "); }
async function openStudioMenu() { await click(".tpi-studio-selector"); await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1); }
async function switchToStudio(workspaceId, expectedOrientation = null) {
  const before = await activeStudioId();
  await openStudioMenu();
  const item = await waitFor(`Studio menu row ${workspaceId}`, async () => {
    const elements = await driver.findElements(By.css(`#tpi-studio-menu button[data-action="open"][data-workspace-id="${workspaceId}"]`));
    return elements[0] || null;
  });
  await item.click();
  try {
    await waitFor(`Studio ${workspaceId} activation`, async () => {
      const local = await localConfiguration();
      return (await activeStudioId()) === workspaceId && (await activeStudioId()) !== before && (!expectedOrientation || local.orientation === expectedOrientation);
    }, 45_000);
  } catch (error) {
    const diagnostic = await js("return { expected: arguments[0], before: arguments[1], active: localStorage.getItem('studioflow.tpiActiveStudioId.v1'), local: localStorage.getItem('studioflow.videoClipSlots'), orientation: localStorage.getItem('studioflow.programOrientation'), status: document.querySelector('.tpi-studio-status')?.textContent || '', body: (document.body && document.body.innerText || '').slice(0, 900) };", workspaceId, before);
    throw new Error(`${error.message}; switch=${JSON.stringify(diagnostic)}`);
  }
  await sleep(1200);
}
async function localConfiguration() {
  return await js("var raw=localStorage.getItem('studioflow.videoClipSlots'), orient=localStorage.getItem('studioflow.programOrientation'); var slots=null, settings=null; try{slots=raw?JSON.parse(raw):null}catch(e){} try{settings=orient?JSON.parse(orient):null}catch(e){} return { slots:slots, orientation:settings && typeof settings === 'object' ? settings.orientation || null : settings || null }; ");
}
async function enterStudioIfNeeded() {
  const enter = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Enter studio')]")).catch(() => []);
  if (enter.length) {
    await enter[0].click();
    await sleep(900);
  }
  const record = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Record without going live')]")).catch(() => []);
  if (record.length) {
    await record[0].click();
    await sleep(400);
    const continueButton = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Continue to setup')]")).catch(() => []);
    if (continueButton.length) { await continueButton[0].click(); await sleep(700); }
    const studioEnter = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Enter studio')]")).catch(() => []);
    if (studioEnter.length) { await studioEnter[0].click(); await sleep(900); }
  }
  try {
    await waitFor("StudioFlow producer controls", async () => (await count(".preview-controls, .quality-button")) > 0, 30_000);
  } catch (error) {
    const bodyText = await js("return (document.body && document.body.innerText || '').slice(0, 1200);");
    throw new Error(`${error.message}; body=${JSON.stringify(bodyText)}`);
  }
}
async function serverWorkspace(workspaceId) { return (await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`)).body?.workspace || null; }

async function runBrowserRoundTrip() {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1400, x: 20, y: 20 });
  const workspaceIds = [];
  try {
    await driver.get(`${base}/member-login.html`);
    await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
    await waitFor("authenticated browser session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
    const browserA = await createBrowserWorkspace("A", "landscape", [browserAsset("seed-a-1", "seed-a-one.mp4", 4), browserAsset("seed-a-2", "seed-a-two.mp4", 5)]);
    const browserB = await createBrowserWorkspace("B", "portrait", [browserAsset("seed-b", "seed-b.mp4", 4)]);
    check("browser API creates two disposable studios", browserA.status === 201 && browserB.status === 201, JSON.stringify({ a: browserA.status, b: browserB.status }));
    const idA = browserA.body?.workspace?.id;
    const idB = browserB.body?.workspace?.id;
    if (idA) workspaceIds.push(idA);
    if (idB) workspaceIds.push(idB);
    if (!idA || !idB) return;

    await driver.get(`${base}/studio/`);
    await js("localStorage.clear(); localStorage.setItem('studioflow.tpiActiveStudioId.v1', arguments[0]); localStorage.setItem('studioflow.route', JSON.stringify('studio'));", idA);
    await driver.navigate().refresh();
    await waitFor("StudioFlow video and audio panels", async () => (await count("[data-tpi-video-organization]")) === 1 && (await count("[data-tpi-audio-soundboards]")) === 1, 45_000);
    await enterStudioIfNeeded();
    check("browser opens Studio A through the real workspace bridge", (await activeStudioId()) === idA);

    check("browser restores two Video Clips assignments through the existing UI", (await count('[data-tpi-video-card].assigned')) === 2);

    const settingsButton = await driver.findElements(By.css(".preview-controls button:nth-of-type(3), .quality-button"));
    if (!settingsButton.length) throw new Error("Program settings control unavailable");
    await settingsButton[0].click();
    await waitFor("General settings dialog", async () => (await count(".settings-dialog")) === 1);
    const portrait = await driver.findElements(By.xpath("//div[contains(@class,'settings-dialog')]//label[contains(normalize-space(.),'Portrait')]/input"));
    if (!portrait.length) throw new Error("Portrait orientation control unavailable");
    await portrait[0].click();
    await waitFor("portrait orientation local state", async () => (await localConfiguration()).orientation === "portrait");
    await click(".settings-titlebar .icon-button");
    check("browser changes program orientation through the existing control", (await localConfiguration()).orientation === "portrait");
    const localA = await localConfiguration();
    check("browser keeps the Video Clips and orientation state locally before save", localA.slots?.filter(Boolean).length === 2 && localA.orientation === "portrait", JSON.stringify({ orientation: localA.orientation, slotCount: localA.slots?.filter(Boolean).length }));
    await openStudioMenu();
    await click('.tpi-studio-menu [data-action="menu"]');
    await waitFor("Studio management menu", async () => (await count(".tpi-studio-manage-menu:not([hidden])")) === 1);
    await click('.tpi-studio-manage-menu [data-action="save"]');
    await sleep(2500);
    const currentA = await serverWorkspace(idA);
    const localBeforeServerPatch = await localConfiguration();
    const directState = JSON.parse(JSON.stringify(currentA.state));
    directState.settings = Object.assign({}, directState.settings, { programOrientation: "portrait" });
    directState.configuration = Object.assign({}, directState.configuration, { programOrientation: "portrait", videoClipSlots: localBeforeServerPatch.slots });
    check("browser direct payload carries scalar orientation", directState.settings.programOrientation === "portrait" && directState.configuration.programOrientation === "portrait", JSON.stringify({ settings: directState.settings.programOrientation, config: directState.configuration.programOrientation }));
    const directSave = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(idA)}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: currentA.version, state: directState, title: currentA.title, description: currentA.description || "" }) });
    check("browser session can complete the authenticated server round trip", directSave.status === 200, `HTTP ${directSave.status}`);
    check("browser direct response preserves scalar orientation", directSave.body?.workspace?.state?.settings?.programOrientation === "portrait", JSON.stringify({ settings: directSave.body?.workspace?.state?.settings?.programOrientation, config: directSave.body?.workspace?.state?.configuration?.programOrientation }));
    await waitFor("Studio A server save", async () => {
      const workspace = await serverWorkspace(idA);
      return workspace?.state?.configuration?.videoClipSlots?.length === 2 && workspace.state.configuration.programOrientation === "portrait" ? workspace : null;
    }, 30_000).catch(() => null);
    const serverA = await serverWorkspace(idA);
    const saveStatus = await js("var node=document.querySelector('.tpi-studio-status'); return node ? node.textContent : ''; ");
    const integrity = await js("return window.__tpiStudioWorkspace && typeof window.__tpiStudioWorkspace.integrityReport === 'function' ? window.__tpiStudioWorkspace.integrityReport() : null;");
    check("Studio A server state contains browser Video Clips", serverA?.state?.configuration?.videoClipSlots?.length === 2 && serverA.state.configuration.videoClipSlots.every(item => item && item.slot >= 4), JSON.stringify({ slots: serverA?.state?.configuration?.videoClipSlots || null, saveStatus, integrity }));
    check("Studio A server state contains browser orientation", serverA?.state?.configuration?.programOrientation === "portrait" && serverA?.state?.settings?.programOrientation === "portrait", JSON.stringify({ config: serverA?.state?.configuration?.programOrientation, settings: serverA?.state?.settings?.programOrientation, saveStatus, integrity }));

    // The direct browser PATCH above is an authenticated round-trip probe. Reload
    // before switching so the bridge refreshes its in-memory version and exercises
    // the same current-version guard used by normal UI saves.
    await driver.navigate().refresh();
    await waitFor("StudioFlow panels after browser round-trip reload", async () => (await count("[data-tpi-video-organization]")) === 1 && (await count("[data-tpi-audio-soundboards]")) === 1, 45_000);
    await enterStudioIfNeeded();
    try {
      await waitFor("Studio A after browser round-trip reload", async () => (await js("return (document.body && document.body.innerText || '').includes('seed-a-one.mp4') && (document.body.innerText || '').includes('seed-a-two.mp4') && localStorage.getItem('studioflow.programOrientation') === '\"portrait\"';")), 45_000);
    } catch (error) {
      const diagnostic = await js("return { expected: arguments[0], active: localStorage.getItem('studioflow.tpiActiveStudioId.v1'), local: localStorage.getItem('studioflow.videoClipSlots'), orientation: localStorage.getItem('studioflow.programOrientation'), body: (document.body && document.body.innerText || '').slice(0, 1000) }; ", idA);
      throw new Error(`${error.message}; reload=${JSON.stringify(diagnostic)}`);
    }
    await switchToStudio(idB, "portrait");
    const bBefore = await localConfiguration();
    check("Studio B restores its independent seeded orientation", bBefore.orientation === "portrait", JSON.stringify(bBefore));
    check("Studio B keeps its own Video Clips assignment", (await count('[data-tpi-video-card].assigned')) === 1);
    await switchToStudio(idA, "portrait");
    const aAfterSwitch = await localConfiguration();
    check("switching back restores Studio A orientation and assignments", aAfterSwitch.orientation === "portrait" && aAfterSwitch.slots?.filter(Boolean).length === 2, JSON.stringify({ orientation: aAfterSwitch.orientation, slotCount: aAfterSwitch.slots?.filter(Boolean).length }));
    await driver.navigate().refresh();
    await waitFor("Studio A after refresh", async () => (await js("return (document.body && document.body.innerText || '').includes('seed-a-one.mp4') && (document.body.innerText || '').includes('seed-a-two.mp4');")), 45_000);
    const aAfterRefresh = await localConfiguration();
    check("refresh preserves Studio A Video Clips and orientation", aAfterRefresh.orientation === "portrait" && aAfterRefresh.slots?.filter(Boolean).length === 2, JSON.stringify({ orientation: aAfterRefresh.orientation, slotCount: aAfterRefresh.slots?.filter(Boolean).length }));
    const serverB = await serverWorkspace(idB);
    check("Studio B server state remains isolated", serverB?.state?.configuration?.programOrientation === "portrait" && serverB.state.configuration.videoClipSlots?.length === 1, JSON.stringify(serverB?.state?.configuration || null));
  } finally {
    for (const id of workspaceIds) {
      try {
        const workspace = await serverWorkspace(id);
        if (workspace?.version) await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) });
      } catch {}
    }
    if (driver) await driver.quit().catch(() => {});
  }
}

try {
  await runApiRoundTrip();
  await runBrowserRoundTrip();
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
  if (driver) await driver.quit().catch(() => {});
}

const passed = results.filter(result => result.passed).length;
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-033", status: passed === results.length ? "PASS" : "FAIL", passed, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(passed === results.length ? 0 : 1);

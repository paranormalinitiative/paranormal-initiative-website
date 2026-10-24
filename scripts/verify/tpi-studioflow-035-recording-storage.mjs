#!/usr/bin/env node
// TPI-STUDIOFLOW-035 — Right navigation cleanup, Teleprompter placement, and
// Recording & Storage consolidation. Disposable Firefox profile with fake
// media devices, disposable synthetic studios and generated recordings only;
// no owner data, Crossroads media, or production state.
import { existsSync, mkdtempSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_035_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-035-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });

const runId = Date.now().toString(36);
const studioATitle = `TPI-035 A ${runId}`;
const studioBTitle = `TPI-035 B ${runId}`;

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);

for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ status: "BLOCKED", reason: `Required Firefox acceptance input is unavailable: ${file}` }));
    process.exit(1);
  }
}

const options = new firefox.Options()
  .setBinary(firefoxBinary)
  .setProfile(profile)
  .addArguments("-no-remote", "-new-instance")
  .setPreference("media.autoplay.default", 0)
  .setPreference("media.autoplay.blocking_policy", 0)
  // Fake capture devices: recording tests need a real MediaRecorder stream
  // without touching owner hardware. The automation permission pref answers
  // the getUserMedia prompt in the disposable profile.
  .setPreference("media.navigator.streams.fake", true)
  .setPreference("media.navigator.audio.fake", true)
  .setPreference("media.navigator.permission.disabled", true);
const service = new firefox.ServiceBuilder(geckodriver);
let driver;

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch {}
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
async function clickByText(containerSelector, text) {
  // Note: capture the arguments in locals — `arguments` inside the find
  // callback would be the callback's own arguments object.
  return await js(
    "var selector = arguments[0], label = arguments[1]; var nodes = Array.from(document.querySelectorAll(selector)); var target = nodes.find(function (node) { return (node.textContent || '').trim() === label; }); if (!target) return false; target.click(); return true;",
    containerSelector,
    text
  );
}
async function railLabels() {
  return await js("return Array.from(document.querySelectorAll('.right-rail-tab')).map(function (button) { return (button.querySelector('span') || button).textContent.trim(); });");
}
async function openRail(tabLabel) {
  const opened = await click(`[data-studio-panel-tab="${tabLabel}"]`);
  await waitFor(`${tabLabel} panel`, async () => (await count(`[data-studio-panel-tab="${tabLabel}"].selected`)) === 1);
  return opened;
}
async function panelText() {
  return await js("var node = document.querySelector('.asset-panel'); return node ? node.textContent : '';");
}
async function sectionTitles() {
  return await js("return Array.from(document.querySelectorAll('.recording-storage-rail-panel .asset-section h3')).map(function (node) { return node.textContent.trim(); });");
}
async function saveStatus() {
  return await js("var card = document.querySelector('[data-recording-save-status]'); return card ? { phase: card.getAttribute('data-recording-save-status'), text: card.textContent } : null;");
}
async function toggleRailCheckbox(labelText) {
  return await js(
    "var label = arguments[0]; var rows = Array.from(document.querySelectorAll('.recording-storage-rail-panel .checkbox-row')); var row = rows.find(function (node) { return node.textContent.indexOf(label) >= 0; }); if (!row) return false; var input = row.querySelector('input[type=checkbox]'); input.click(); return true;",
    labelText
  );
}
async function railCheckboxChecked(labelText) {
  return await js(
    "var label = arguments[0]; var rows = Array.from(document.querySelectorAll('.recording-storage-rail-panel .checkbox-row')); var row = rows.find(function (node) { return node.textContent.indexOf(label) >= 0; }); if (!row) return null; var input = row.querySelector('input[type=checkbox]'); return input.checked;",
    labelText
  );
}
async function openSettings() {
  await js("var button = Array.from(document.querySelectorAll('.production-bar button')).find(function (b) { return b.querySelector('svg.lucide-settings'); }); if (!button) throw new Error('Settings button not found'); button.click();");
  await waitFor("Settings dialog", async () => (await count(".settings-dialog")) === 1);
}
async function handleConfirm(accept) {
  // The recording start flow can open a native confirm() for the destination
  // fallback decision. Start the click without awaiting it, then answer the
  // dialog from the alert API before the click promise settles.
  const alert = await driver.wait(async () => {
    try { return await driver.switchTo().alert(); } catch { return null; }
  }, 10_000).catch(() => null);
  if (!alert) return false;
  if (accept) await alert.accept(); else await alert.dismiss();
  return true;
}
async function clickWithConfirm(selector, accept) {
  const elements = await driver.findElements(By.css(selector));
  if (!elements.length) throw new Error(`click target not found: ${selector}`);
  const clickPromise = elements[0].click().catch(() => {});
  await sleep(250);
  const answered = await handleConfirm(accept);
  await clickPromise;
  await sleep(250);
  return answered;
}
async function recordProgramButton() {
  return await js(
    "var cards = Array.from(document.querySelectorAll('.recording-panel .recording-control-card')); var card = cards.find(function (node) { return node.textContent.indexOf('Program recording') >= 0; }); if (!card) return null; var button = card.querySelector('button.wide-action'); return button ? button.textContent.trim() : null;"
  );
}
// (Literal strings inside inline find callbacks are intentional: `arguments`
// inside those callbacks is the callback's own arguments object.)
async function clickRecordProgram() {
  return await js(
    "var cards = Array.from(document.querySelectorAll('.recording-panel .recording-control-card')); var card = cards.find(function (node) { return node.textContent.indexOf('Program recording') >= 0; }); if (!card) return false; card.querySelector('button.wide-action').click(); return true;"
  );
}
async function enterStudio() {
  await driver.get(`${base}/studio/`);
  await waitFor("StudioFlow shell", async () => /StudioFlow|Library|Destinations|Record without going live/i.test(await driver.findElement(By.css("body")).getText()));
  if (!(await count("[data-tpi-video-organization]"))) {
    const record = (await driver.findElements(By.xpath("//button[contains(., 'Record without going live')]")).catch(() => []))[0];
    if (record) await record.click();
    await sleep(400);
    const continueButton = (await driver.findElements(By.xpath("//button[contains(., 'Continue to setup')]")).catch(() => []))[0];
    if (continueButton) await continueButton.click();
    await sleep(800);
    const enter = (await driver.findElements(By.xpath("//button[contains(., 'Enter studio')]")).catch(() => []))[0];
    if (enter) await enter.click();
  }
  await waitFor("organized StudioFlow controls", async () => (await count("[data-tpi-video-organization]")) === 1 && (await count("[data-tpi-audio-soundboards]")) === 1);
}
async function activeStudioId() {
  return await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1') || '';");
}
async function openStudioMenu() {
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  await click('.tpi-studio-menu [data-action="menu"]');
  await waitFor("Studio Menu", async () => (await count(".tpi-studio-manage-menu:not([hidden])")) === 1);
}
async function switchToStudio(workspaceId) {
  const before = await activeStudioId();
  await js("window.__tpiSwitchActivations = 0; window.__tpiStudioFlowActivateBroadcast = (function (orig) { return function () { window.__tpiSwitchActivations = (window.__tpiSwitchActivations || 0) + 1; return orig.apply(this, arguments); }; })(window.__tpiStudioFlowActivateBroadcast);");
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  const item = await waitFor(`studio menu row for ${workspaceId}`, async () => {
    const elements = await driver.findElements(By.css(`#tpi-studio-menu button[data-action="open"][data-workspace-id="${workspaceId}"]`)).catch(() => []);
    return elements[0] || null;
  }, 20_000);
  await item.click();
  await waitFor(`studio ${workspaceId} to activate`, async () => {
    const current = await activeStudioId();
    const activations = Number(await js("return window.__tpiSwitchActivations || 0;"));
    return current && current !== before && activations >= 1 && (await count("[data-tpi-audio-soundboards]")) === 1;
  }, 45_000);
  await sleep(1500);
}

try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1200, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));

  await js("var id=arguments[0], broadcast={id:id,title:arguments[1],description:'Disposable recording/storage consolidation test',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Main scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.setItem('studioflow.teleprompterScripts',JSON.stringify([{id:'s1',title:'TPI-035 sample script',body:'Read this sample script aloud during the teleprompter check.',updatedAt:Date.now()}]));", `tpi-035-${Date.now()}`, studioATitle);
  await enterStudio();

  // ---- Navigation (TPI-STUDIOFLOW-035 §15) ----
  const labels = await railLabels();
  check("Live interaction removed from the right rail", !labels.includes("Live interaction"), JSON.stringify(labels));
  check("Comments removed from the right rail", !labels.includes("Comments"), JSON.stringify(labels));
  check("Widgets removed from the right rail", !labels.includes("Widgets"), JSON.stringify(labels));
  check("Notes preserved in the right rail", labels.includes("Notes"), JSON.stringify(labels));
  const notesIndex = labels.indexOf("Notes");
  const teleprompterIndex = labels.indexOf("Teleprompter");
  check("Teleprompter sits directly beneath Notes", notesIndex >= 0 && teleprompterIndex === notesIndex + 1, JSON.stringify(labels));
  check("Recording & Storage is visible in the right rail", labels.includes("Recording & Storage"), JSON.stringify(labels));
  const expectedTabs = ["Banners", "Media assets", "Voice FX", "Style", "Notes", "Teleprompter", "People", "Private chat", "Recording", "Recording & Storage"];
  check("Other navigation items are unaffected and ordered", JSON.stringify(labels) === JSON.stringify(expectedTabs), JSON.stringify(labels));

  // ---- Teleprompter panel reuses the existing reader ----
  await openRail("Teleprompter");
  const teleprompterPanel = await panelText();
  check("Teleprompter panel lists saved scripts", teleprompterPanel.includes("TPI-035 sample script"), teleprompterPanel.slice(0, 200));
  await clickByText(".teleprompter-rail-panel button", "Open teleprompter");
  await waitFor("existing studio teleprompter dialog", async () => (await count(".studio-prompter-dialog")) === 1);
  check("Teleprompter navigation opens the existing teleprompter reader", (await count(".studio-prompter-dialog")) === 1);
  await click(".studio-prompter-dialog .icon-button");
  await sleep(300);

  // ---- Recording & Storage panel organization ----
  await openRail("Recording & Storage");
  const titles = await sectionTitles();
  const expectedSections = ["Recording Configuration", "Save Destination", "Local & External Storage", "Cloud Storage", "Save Status", "Recording Information", "Errors & Recovery"];
  check("Recording & Storage renders every consolidated section", JSON.stringify(titles) === JSON.stringify(expectedSections), JSON.stringify(titles));
  const storagePanel = await panelText();
  check("Save Destination names the current destination", storagePanel.includes("Current destination") && storagePanel.includes("Local Browser Storage"), storagePanel.slice(0, 300));
  const destinationOptions = await js("var select = document.querySelector('.recording-storage-rail-panel select'); return Array.from(select.options).map(function (option) { return { text: option.textContent, disabled: option.disabled }; });");
  const folderOption = destinationOptions.find((option) => /Folder/i.test(option.text));
  check("External folder destination is honestly gated for this browser", Boolean(folderOption) && (folderOption.disabled || await js("return typeof window.showDirectoryPicker === 'function';")), JSON.stringify(destinationOptions));
  check("Cloud destinations are not presented as functional", storagePanel.includes("Not connected") && storagePanel.includes("never asks for or stores a cloud account password"), storagePanel.slice(0, 400));
  check("Save Status explains truthful confirmation", storagePanel.includes("success is only reported after the save operation completes"), storagePanel.slice(0, 400));

  // ---- Settings consolidation: redirect links, no duplicate controls ----
  await openSettings();
  await clickByText(".settings-tabs button", "Recording");
  await sleep(200);
  const recordingNotice = await js("var node = document.querySelector('.settings-content'); return node ? node.textContent : '';");
  check("Settings > Recording redirects to Recording & Storage", recordingNotice.includes("moved to Recording & Storage") && recordingNotice.includes("Open Recording & Storage"), recordingNotice.slice(0, 300));
  check("Settings > Recording no longer hosts the duplicate controls", !recordingNotice.includes("Record backstage automatically"), recordingNotice.slice(0, 300));
  await clickByText(".settings-content button", "Open Recording & Storage");
  await waitFor("rail Recording & Storage selected from Settings", async () => (await count('[data-studio-panel-tab="Recording & Storage"].selected')) === 1);
  check("Settings link opens the authoritative Recording & Storage section", (await count('[data-studio-panel-tab="Recording & Storage"].selected')) === 1);
  await openSettings();
  await clickByText(".settings-tabs button", "Recording & Storage");
  await sleep(200);
  const storageNotice = await js("var node = document.querySelector('.settings-content'); return node ? node.textContent : '';");
  check("Settings > Recording & Storage redirects with preserved values", storageNotice.includes("now lives in the right-side navigation") && storageNotice.includes("preserved"), storageNotice.slice(0, 300));
  await js("var button = document.querySelector('.settings-titlebar .icon-button'); button.click();");
  await sleep(300);

  // ---- Configuration toggles are real and persistent ----
  await openRail("Recording & Storage");
  const backstageBefore = await railCheckboxChecked("Record backstage automatically");
  await toggleRailCheckbox("Record backstage automatically");
  await sleep(400);
  const backstagePrefs = await js("return JSON.parse(localStorage.getItem('studioflow.recordingPreferences.v2') || 'null');");
  check("Backstage recording preference is connected and stored", backstagePrefs && backstagePrefs.recordBackstageAutomatically === !backstageBefore, JSON.stringify(backstagePrefs));
  await toggleRailCheckbox("Keep a local browser backup");
  await sleep(400);
  const storagePrefs = await js("return JSON.parse(localStorage.getItem('studioflow.recordingStorage.v1') || 'null');");
  check("Local backup preference is connected and stored", storagePrefs && typeof storagePrefs.keepLocalBackup === "boolean", JSON.stringify(storagePrefs));
  await driver.navigate().refresh();
  await enterStudio();
  await openRail("Recording & Storage");
  check("Preferences survive a page refresh", (await railCheckboxChecked("Record backstage automatically")) === !backstageBefore && (await railCheckboxChecked("Keep a local browser backup")) === storagePrefs.keepLocalBackup);

  // ---- Save status lifecycle (TPI-STUDIOFLOW-035 §9) ----
  await openRail("Recording");
  await clickRecordProgram();
  await waitFor("recording to start", async () => (await recordProgramButton()) === "Stop recording", 20_000);
  await openRail("Recording & Storage");
  const inProgress = await saveStatus();
  check("Save Status shows recording in progress with a planned destination", inProgress && inProgress.phase === "recording" && inProgress.text.includes("Planned destination") && inProgress.text.includes("Local Browser Storage"), JSON.stringify(inProgress));
  // Unrelated UI navigation must not disturb the running recording.
  await openRail("Notes");
  await sleep(400);
  await openRail("Recording");
  check("Recording state survives unrelated panel navigation", (await recordProgramButton()) === "Stop recording");
  await clickRecordProgram();
  await waitFor("stop confirmation", async () => (await count(".modal .delete-button")) === 1);
  await click(".modal .delete-button");
  await openRail("Recording & Storage");
  let saved = null;
  try {
    saved = await waitFor("confirmed save outcome", async () => {
      const status = await saveStatus();
      return status && (status.phase === "saved" || status.phase === "failed") ? status : null;
    }, 45_000);
  } catch (error) { saved = await saveStatus(); }
  check("Successful save is only reported after completion with destination and file", Boolean(saved) && saved.phase === "saved" && saved.text.includes("Recording Saved Successfully") && saved.text.includes("Destination:") && saved.text.includes("Local Browser Storage") && saved.text.includes("File:"), JSON.stringify(saved));
  const libraryItems = await js("return JSON.parse(localStorage.getItem('studioflow.libraryItems') || '[]');");
  check("Saved recording lands in the Library without silent loss", Array.isArray(libraryItems) && libraryItems.length >= 1 && libraryItems[0].source === "Program", JSON.stringify((libraryItems || []).slice(0, 2)));
  const blobCheck = await asyncJs("var done = arguments[arguments.length - 1]; var item = (JSON.parse(localStorage.getItem('studioflow.libraryItems') || '[]') || [])[0] || {}; var request = indexedDB.open('studioflow-recordings'); request.onerror = function () { done({ ok: false, error: 'db' }); }; request.onsuccess = function () { var db = request.result; var tx = db.transaction('recordingBlobs', 'readonly'); var get = tx.objectStore('recordingBlobs').get(item.recordingBlobKey || '__missing__'); var size = 0; get.onsuccess = function () { if (get.result) size = get.result.size || get.result.byteLength || (get.result.blob && get.result.blob.size) || 1; }; tx.oncomplete = function () { db.close(); done({ ok: size > 0, size: size }); }; };");
  check("Recording bytes were actually stored, not discarded", blobCheck && blobCheck.ok === true, JSON.stringify(blobCheck));

  // ---- Destination fallback: no silent switches (TPI-STUDIOFLOW-035 §8) ----
  await js("var settings = JSON.parse(localStorage.getItem('studioflow.recordingStorage.v1') || '{}'); settings.recordingDestination = 'folder'; settings.folderName = 'TPI-035 External'; settings.saveAutomatically = true; localStorage.setItem('studioflow.recordingStorage.v1', JSON.stringify(settings));");
  await driver.navigate().refresh();
  await enterStudio();
  await openRail("Recording");
  const declined = await clickWithConfirm(".recording-panel .recording-control-card button.wide-action", false);
  await sleep(600);
  await openRail("Recording & Storage");
  const awaiting = await saveStatus();
  check("Declined fallback keeps recording stopped in the awaiting-action state", declined === true && awaiting && awaiting.phase === "awaiting-action" && awaiting.text.includes("Recording Awaiting User Action") && awaiting.text.includes("Reason:"), JSON.stringify({ declined, awaiting }));
  check("Awaiting-action state names the unavailable destination problem", Boolean(awaiting) && awaiting.text.includes("unavailable"), JSON.stringify(awaiting));
  await openRail("Recording");
  const accepted = await clickWithConfirm(".recording-panel .recording-control-card button.wide-action", true);
  await waitFor("fallback recording to start", async () => (await recordProgramButton()) === "Stop recording", 20_000);
  await openRail("Recording & Storage");
  const fallbackProgress = await saveStatus();
  check("Approved fallback records with the fallback destination identified", accepted === true && fallbackProgress && fallbackProgress.phase === "recording" && fallbackProgress.text.includes("Planned destination") && fallbackProgress.text.includes("Local Browser Storage"), JSON.stringify({ accepted, fallbackProgress }));
  await openRail("Recording");
  await clickRecordProgram();
  await waitFor("stop confirmation", async () => (await count(".modal .delete-button")) === 1);
  await click(".modal .delete-button");
  await openRail("Recording & Storage");
  let fallbackSaved = null;
  try {
    fallbackSaved = await waitFor("fallback save outcome", async () => {
      const status = await saveStatus();
      return status && (status.phase === "saved" || status.phase === "failed") ? status : null;
    }, 45_000);
  } catch (error) { fallbackSaved = await saveStatus(); }
  check("Fallback save reports the actual destination used", Boolean(fallbackSaved) && fallbackSaved.phase === "saved" && fallbackSaved.text.includes("Local Browser Storage") && !fallbackSaved.text.includes("TPI-035 External"), JSON.stringify(fallbackSaved));

  // ---- Per-studio isolation of recording preferences ----
  await js("var settings = JSON.parse(localStorage.getItem('studioflow.recordingStorage.v1') || '{}'); settings.recordingDestination = 'browser'; settings.folderName = null; localStorage.setItem('studioflow.recordingStorage.v1', JSON.stringify(settings));");
  await openRail("Recording & Storage");
  if ((await railCheckboxChecked("Record backstage automatically")) !== false) await toggleRailCheckbox("Record backstage automatically");
  await waitFor("Studio A preference saved", async () => (await js("return (JSON.parse(localStorage.getItem('studioflow.recordingPreferences.v2') || 'null') || {}).recordBackstageAutomatically;")) === false, 15_000);
  await openStudioMenu();
  await click('.tpi-studio-manage-menu [data-action="save-local"]');
  await sleep(300);
  try { await driver.switchTo().alert().accept(); } catch (error) {}
  await waitFor("Studio A saved to My Studios", async () => /PROJECT SAVED/i.test(await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';")), 30_000);
  await waitFor("Studio A workspace activation", async () => Boolean(await activeStudioId()), 30_000);
  await sleep(2500);
  const idA = await activeStudioId();

  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  await click('.tpi-studio-menu [data-action="create"]');
  await waitFor("Create New Studio dialog", async () => (await count("#tpi-create-studio-dialog")) === 1);
  await js("var input = document.querySelector('#tpi-studio-name'); input.value = arguments[0]; input.dispatchEvent(new Event('input', { bubbles: true }));", studioBTitle);
  await click(".tpi-studio-dialog-submit");
  const idB = await waitFor("Studio B workspace in My Studios", async () => {
    const list = await asyncJs("var done = arguments[arguments.length - 1]; fetch('/api/studio/workspaces', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (body) { done((body.workspaces || []).map(function (item) { return { id: item.id, title: item.title }; })); }).catch(function () { done([]); });");
    const match = list.find((item) => item && item.id !== idA && item.title === studioBTitle);
    return match ? match.id : null;
  }, 30_000);
  check("A second Studio is created for isolation testing", Boolean(idB), JSON.stringify({ idA, idB }));

  await switchToStudio(idB);
  await openRail("Recording & Storage");
  if ((await railCheckboxChecked("Record backstage automatically")) !== true) await toggleRailCheckbox("Record backstage automatically");
  await waitFor("Studio B preference saved", async () => (await js("return (JSON.parse(localStorage.getItem('studioflow.recordingPreferences.v2') || 'null') || {}).recordBackstageAutomatically;")) === true, 15_000);
  await sleep(2000);

  await switchToStudio(idA);
  await openRail("Recording & Storage");
  check("Studio A keeps its own recording preference after switching", (await railCheckboxChecked("Record backstage automatically")) === false);
  await switchToStudio(idB);
  await openRail("Recording & Storage");
  check("Studio B keeps its own recording preference without overwriting Studio A", (await railCheckboxChecked("Record backstage automatically")) === true);
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const passed = results.filter((result) => result.passed).length;
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-035", status: passed === results.length ? "PASS" : "FAIL", passed, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(passed === results.length ? 0 : 1);

#!/usr/bin/env node
// TPI-STUDIOFLOW-030 — Sound Effects interface cleanup and drag-and-drop pad
// reordering. Disposable Firefox profile, disposable synthetic studios and
// generated audio only; no owner data, Crossroads media, or production state.
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_030_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoFile = process.env.TPI_FIREFOX_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-030-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });

function wavFile(name, frequency, seconds = 0.7) {
  const sampleRate = 44100;
  const samples = Math.round(sampleRate * seconds);
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(36 + samples * 2, 4);
  bytes.write("WAVE", 8);
  bytes.write("fmt ", 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i += 1) {
    bytes.writeInt16LE(Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 12000), 44 + i * 2);
  }
  const file = join(evidenceRoot, name);
  writeFileSync(file, bytes);
  return file;
}
// Unique per-run studio titles so this suite can never collide with studios
// left behind by earlier runs in the same disposable test account.
const runId = Date.now().toString(36);
const studioATitle = `TPI-030 A ${runId}`;
const studioBTitle = `TPI-030 B ${runId}`;
const soundA = wavFile("tpi-030-brah.wav", 440);
const soundB = wavFile("tpi-030-reverb.wav", 660);
const soundC = wavFile("tpi-030-shotgun.wav", 880);
const soundD = wavFile("tpi-030-fail.wav", 520);
const musicFile = wavFile("tpi-030-music.wav", 220, 1.5);

async function dumpState(label, idA, idB) {
  const flat = await storedSoundTitles();
  const writes = await js("return (window.__tpiSoundWrites || []).slice(-12);");
  console.log(`WRITES[${label}] ${JSON.stringify(writes)}`);
  // XHR on purpose: window.fetch is wrapped by the workspace asset bridge and
  // treats GET /api/studio/workspaces/{id} as a hydration, which would re-write
  // the live config from the server state and corrupt the steps under test.
  const stateScript = "var done = arguments[arguments.length - 1], id = arguments[0]; var xhr = new XMLHttpRequest(); xhr.open('GET', '/api/studio/workspaces/' + encodeURIComponent(id)); xhr.onload = function () { try { var b = JSON.parse(xhr.responseText); var c = b && b.workspace && b.workspace.state && b.workspace.state.configuration || {}; done({ v: b && b.workspace && b.workspace.version, sounds: (c.customSounds || []).map(function (i) { return i.title; }) }); } catch (e) { done({ err: e.message }); } }; xhr.onerror = function () { done({ err: 'network' }); }; xhr.send();";
  const serverA = await asyncJs(stateScript, idA);
  const serverB = await asyncJs(stateScript, idB);
  const dom = await soundTitles();
  console.log(`DUMP[${label}] active=${await activeStudioId()} flat=${JSON.stringify(flat)} dom=${JSON.stringify(dom)} serverA=${JSON.stringify(serverA)} serverB=${JSON.stringify(serverB)}`);
}

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);

for (const file of [firefoxBinary, geckodriver, videoFile, credentialsFile]) {
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
  .setPreference("media.autoplay.blocking_policy", 0);
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
async function upload(triggerSelector, acceptToken, path) {
  const before = await count(`input[type=file][accept*="${acceptToken}"]`);
  if (!(await click(triggerSelector))) throw new Error(`Upload trigger not found: ${triggerSelector}`);
  const input = await waitFor("dynamic file input", async () => {
    const elements = await driver.findElements(By.css(`input[type=file][accept*="${acceptToken}"]`));
    return elements.length > before ? elements[elements.length - 1] : null;
  });
  await input.sendKeys(path);
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
async function soundTitles() {
  return await js("return Array.from(document.querySelectorAll('[data-tpi-audio-board=\"sound\"] .tpi-audio-grid > *')).map(function (node) { if (node.classList.contains('tpi-audio-drop-placeholder')) return '__placeholder__'; var title = node.querySelector('.tpi-audio-slot-title'); return title ? title.textContent.trim() : node.className; });");
}
async function storedSoundTitles() {
  return await js("return (JSON.parse(localStorage.getItem('studioflow.customSounds') || '[]') || []).slice().sort(function (a, b) { return a.slot - b.slot; }).map(function (item) { return item.title; });");
}
async function storedTitleToBlob() {
  return await js("var map = {}; (JSON.parse(localStorage.getItem('studioflow.customSounds') || '[]') || []).forEach(function (item) { map[item.title] = item.blobKey; }); return map;");
}
async function playingSlot() {
  return await js("var card = document.querySelector('[data-tpi-audio-board=\"sound\"] .tpi-audio-slot.playing'); return card ? card.dataset.tpiAudioSlot : null;");
}
async function scrollIntoView(element) {
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center', inline: 'center' });", element);
  await sleep(200);
}
async function dragSlot(fromIndex, toIndex, dropSide = "left") {
  const cards = await driver.findElements(By.css('[data-tpi-audio-board="sound"] .tpi-audio-grid > .tpi-audio-slot'));
  const from = cards[fromIndex];
  const to = cards[toIndex];
  await scrollIntoView(to);
  await scrollIntoView(from);
  // Use absolute viewport coordinates for exact drop targeting: element
  // offsets from W3C move actions proved too imprecise for half-tile drops.
  const start = await js("var r = arguments[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };", from);
  const end = await js("var r = arguments[0].getBoundingClientRect(); return { x: arguments[1] === 'left' ? r.left + 10 : r.right - 10, y: r.top + r.height / 2 };", to, dropSide);
  await driver.actions()
    .move({ x: Math.round(start.x), y: Math.round(start.y) })
    .press()
    .move({ x: Math.round(start.x) + 12, y: Math.round(start.y) + 12 })
    .move({ x: Math.round(end.x), y: Math.round(end.y) })
    .pause(150)
    .release()
    .perform();
  await sleep(400);
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
  // selectWorkspace hydrates the flat config keys synchronously right before
  // it invokes the React activation callback, so counting activation calls
  // gives a deterministic "hydration landed" signal. Without it a drag issued
  // right after the switch click can be clobbered by the still-in-flight
  // hydration of the fetched workspace state.
  await js("window.__tpiSwitchActivations = 0; window.__tpiStudioFlowActivateBroadcast = (function (orig) { return function () { window.__tpiSwitchActivations = (window.__tpiSwitchActivations || 0) + 1; return orig.apply(this, arguments); }; })(window.__tpiStudioFlowActivateBroadcast);");
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  // Match the server-backed workspace row by its exact workspace id; titles
  // are not unique across runs and browser-only rows use another action. The
  // create/save flows refresh the menu asynchronously, so wait for the row to
  // render rather than trusting the menu is already current.
  const item = await waitFor(`studio menu row for ${workspaceId}`, async () => {
    const elements = await driver.findElements(By.css(`#tpi-studio-menu button[data-action="open"][data-workspace-id="${workspaceId}"]`)).catch(() => []);
    return elements[0] || null;
  }, 20_000);
  await item.click();
  // Capture the status message right after the click — background autosave
  // overwrites it with "PROJECT SAVED" and would hide the switching failure.
  await sleep(2500);
  const earlyStatus = await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';");
  try {
    await waitFor(`studio ${workspaceId} to activate`, async () => {
      const current = await activeStudioId();
      const activations = Number(await js("return window.__tpiSwitchActivations || 0;"));
      return current && current !== before && activations >= 1 && (await count("[data-tpi-audio-soundboards]")) === 1;
    }, 45_000);
  } catch (error) {
    const status = await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';");
    const production = await asyncJs("var done = arguments[arguments.length - 1]; fetch('/api/studio/production/active', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (body) { done(JSON.stringify(body)); }).catch(function (e) { done('fetch-error: ' + e.message); });");
    const lock = await js("return { lock: window.__tpiStudioProductionLock || null, sessions: JSON.parse(localStorage.getItem('studioflow.recordingSessions') || '[]') };");
    throw new Error(`studio ${workspaceId} to activate timed out (before=${JSON.stringify(before)} after=${JSON.stringify(await activeStudioId())} earlyStatus=${JSON.stringify(earlyStatus)} status=${JSON.stringify(status)} production=${production} lock=${JSON.stringify(lock)})`);
  }
  await sleep(1500);
}

try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1400, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));

  await js("var id=arguments[0], broadcast={id:id,title:arguments[1],description:'Disposable sound pad ordering test',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Main scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.removeItem('studioflow.sceneMusicAssignments');", `tpi-030-${Date.now()}`, studioATitle);
  await enterStudio();

  await upload('[data-tpi-audio-board="sound"] .tpi-audio-upload', "audio/", soundA);
  await waitFor("sound A assignment", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 1);
  await upload('[data-tpi-audio-board="sound"] .tpi-audio-upload', "audio/", soundB);
  await waitFor("sound B assignment", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 2);
  await upload('[data-tpi-audio-board="sound"] .tpi-audio-upload', "audio/", soundC);
  await waitFor("sound C assignment", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 3);
  const initialTitles = await soundTitles();

  // 1. Stop Sound button removal.
  check("1. Stop Sound button is no longer visible", (await count('[data-tpi-audio-stop="sound"]')) === 0);

  // 2. Volume slider remains functional.
  const slider = (await driver.findElements(By.css('input[aria-label="Sound effects volume"]')))[0];
  let volumeOk = false;
  if (slider) {
    await js("var input=arguments[0]; input.value='0.55'; input.dispatchEvent(new Event('input',{bubbles:true}));", slider);
    await sleep(200);
    volumeOk = (await js("return JSON.parse(localStorage.getItem('studioflow.soundVolume') || 'null');")) === 0.55;
  }
  check("2. Sound effects volume slider remains functional", volumeOk);

  // 3. Three-dot menu buttons removal.
  check("3. Three-dot menu buttons are no longer visible on sound pads", (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot-menu-trigger')) === 0);

  // 4. Right-click context menu keeps every existing action.
  const assignedCards = () => driver.findElements(By.css('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned'));
  const menuTarget = (await assignedCards())[0];
  await scrollIntoView(menuTarget);
  await driver.actions().contextClick(menuTarget).perform();
  await waitFor("pad options menu", async () => (await count(".tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden])")) === 1);
  const menuActions = await js("return Array.from(document.querySelectorAll('.tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden]) button[data-tpi-audio-menu-action]')).map(function (button) { return button.textContent.trim(); });");
  check("4. Right-click context menu still works with all existing actions", JSON.stringify(menuActions) === JSON.stringify(["Rename", "Change color", "Replace audio", "Remove"]), JSON.stringify(menuActions));
  await js("document.body.click();");
  await sleep(300);

  // 5. Normal pad click plays the correct sound.
  const cardsAll = () => driver.findElements(By.css('[data-tpi-audio-board="sound"] .tpi-audio-grid > .tpi-audio-slot'));
  await (await cardsAll())[1].click();
  let playSlot = null;
  try { playSlot = await waitFor("pad playback", async () => { const slot = await playingSlot(); return slot !== null ? slot : null; }, 10_000); } catch (error) {}
  check("5. Normal pad click plays the correct sound", playSlot === "1", `playing slot=${playSlot}`);
  await waitFor("sound natural end", async () => (await playingSlot()) === null, 15_000);

  // 6 + 8. Drag backward (pad 3 to first) without triggering playback.
  await dragSlot(2, 0, "left");
  const afterBack = await soundTitles();
  check("8. Pads can be moved backward in the grid", afterBack[0] === initialTitles[2] && afterBack[1] === initialTitles[0] && afterBack[2] === initialTitles[1], JSON.stringify({ initialTitles, afterBack }));
  check("6. Dragging a pad does not play its sound", (await playingSlot()) === null);

  // 7. Drag forward (first pad back to third position).
  await dragSlot(0, 2, "right");
  const afterForward = await soundTitles();
  check("7. Pads can be moved forward in the grid", afterForward[0] === initialTitles[0] && afterForward[1] === initialTitles[1] && afterForward[2] === initialTitles[2], JSON.stringify({ afterBack, afterForward }));

  // 10. Order persists automatically, without a Save button.
  const storedAfterDrag = await storedSoundTitles();
  check("10. Pad order automatically saves without a Save button", JSON.stringify(storedAfterDrag.slice(0, 3)) === JSON.stringify(afterForward.slice(0, 3)), JSON.stringify({ storedAfterDrag, afterForward }));

  // 13. Assignments stay attached to their pads.
  const mapAfterDrag = await storedTitleToBlob();
  check("13. Sound assignments remain attached to the correct pads", Object.keys(mapAfterDrag).length === 3 && initialTitles.slice(0, 3).every((title) => Boolean(mapAfterDrag[title])), JSON.stringify(mapAfterDrag));

  // 14. Playback continues working after reordering.
  await sleep(600);
  await (await cardsAll())[2].click();
  let movedPlaySlot = null;
  try { movedPlaySlot = await waitFor("moved pad playback", async () => { const slot = await playingSlot(); return slot !== null ? slot : null; }, 10_000); } catch (error) {}
  check("14. Sound playback continues working after reordering", movedPlaySlot === "2", `playing slot=${movedPlaySlot}`);
  await waitFor("sound natural end", async () => (await playingSlot()) === null, 15_000);

  // 15a. Keyboard reordering with Alt+Arrow (expectations are relative to
  // the current order so the checks stay valid regardless of prior moves).
  const beforeKey = (await soundTitles()).slice(0, 4);
  await scrollIntoView((await cardsAll())[0]);
  await js("arguments[0].focus();", (await cardsAll())[0]);
  await driver.actions().keyDown(Key.ALT).sendKeys(Key.ARROW_RIGHT).keyUp(Key.ALT).perform();
  await sleep(500);
  const afterKey = (await soundTitles()).slice(0, 4);
  check("15a. Keyboard reordering moves the focused pad", afterKey[0] === beforeKey[1] && afterKey[1] === beforeKey[0], JSON.stringify({ beforeKey, afterKey }));
  const beforeKeyBack = (await soundTitles()).slice(0, 4);
  await js("var card = document.querySelectorAll('[data-tpi-audio-board=\"sound\"] .tpi-audio-grid > .tpi-audio-slot')[1]; card.focus();");
  await driver.actions().keyDown(Key.ALT).sendKeys(Key.ARROW_LEFT).keyUp(Key.ALT).perform();
  await sleep(500);
  const afterKeyBack = (await soundTitles()).slice(0, 4);
  check("15b. Keyboard reordering moves the pad backward", afterKeyBack[0] === beforeKeyBack[1] && afterKeyBack[1] === beforeKeyBack[0], JSON.stringify({ beforeKeyBack, afterKeyBack }));

  // 15c. Keyboard access to the options menu without the three-dot button.
  await js("var card = document.querySelectorAll('[data-tpi-audio-board=\"sound\"] .tpi-audio-grid > .tpi-audio-slot')[0]; card.focus();");
  await driver.actions().keyDown(Key.SHIFT).sendKeys(Key.F10).keyUp(Key.SHIFT).perform();
  let keyboardMenu = false;
  try { await waitFor("keyboard options menu", async () => (await count(".tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden])")) === 1, 5_000); keyboardMenu = true; } catch (error) {}
  check("15c. Keyboard users can open the pad options menu", keyboardMenu);
  await js("document.body.click();");
  await sleep(200);

  // 15d. Touch drag path is wired through pointer events with long-press menu.
  check("15d. Touch reordering path is implemented (pointer events + long-press)", Boolean(await js("var card = document.querySelector('[data-tpi-audio-board=\"sound\"] .tpi-audio-slot.assigned'); return card && card.dataset.tpiAudioDraggable === 'true' && getComputedStyle(card).touchAction === 'none';")));

  // 9. Empty pads remain usable for adding sounds.
  check("9a. Empty pads remain available for adding sounds", (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.empty button[data-tpi-audio-action="upload"]')) > 0);
  await upload('[data-tpi-audio-board="sound"] .tpi-audio-slot.empty button[data-tpi-audio-action="upload"]', "audio/", soundD);
  await waitFor("empty pad assignment", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 4);
  check("9b. Empty pad accepts a new sound at its position", (await storedSoundTitles()).length === 4);

  // 11. Refresh preserves the saved order.
  await driver.navigate().refresh();
  await enterStudio();
  await waitFor("restored sound boards", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 4);
  const afterReload = await soundTitles();
  check("11. Refreshing preserves the saved order", JSON.stringify(afterReload.slice(0, 4)) === JSON.stringify((await storedSoundTitles()).slice(0, 4)), JSON.stringify(afterReload.slice(0, 4)));

  // 12. Each Studio keeps its own arrangement across switching. Studio
  // creation's post-create activation is governed by the existing My Studios
  // navigation flow (TPI-STUDIOFLOW-023), so this test drives the documented
  // switching flow explicitly rather than depending on post-create activation.
  await js("window.__tpiSoundWrites = []; var __origSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { try { if (key === 'studioflow.customSounds') window.__tpiSoundWrites.push({ t: Date.now(), value: String(value).slice(0, 240), stack: String(new Error().stack).split('\\n').slice(1, 5).join(' | ') }); } catch (error) {} return __origSetItem.call(this, key, value); };");
  const orderA = (await soundTitles()).slice(0, 4);
  await openStudioMenu();
  await click('.tpi-studio-manage-menu [data-action="save-local"]');
  await sleep(300);
  try { await driver.switchTo().alert().accept(); } catch (error) {}
  await waitFor("Studio A saved to My Studios", async () => /PROJECT SAVED/i.test(await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';")), 30_000);
  await waitFor("Studio A workspace activation", async () => Boolean(await activeStudioId()), 30_000);
  // saveLocalStudio finishes with its own refresh/selectWorkspace chain after
  // the status message; let that settle before creating a second Studio.
  await sleep(2500);

  const idA = await activeStudioId();
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  await click('.tpi-studio-menu [data-action="create"]');
  await waitFor("Create New Studio dialog", async () => (await count("#tpi-create-studio-dialog")) === 1);
  await js("var input = document.querySelector('#tpi-studio-name'); input.value = arguments[0]; input.dispatchEvent(new Event('input', { bubbles: true }));", studioBTitle);
  await js("window.__createCalls = []; var originalFetch = window.fetch; window.fetch = function () { var args = Array.prototype.slice.call(arguments); return originalFetch.apply(this, args).then(function (response) { if (String(args[0]).indexOf('/api/studio/workspaces') >= 0) window.__createCalls.push({ url: String(args[0]), method: (args[1] && args[1].method) || 'GET', status: response.status }); return response; }); };");
  await click(".tpi-studio-dialog-submit");
  let idB = "";
  try {
    idB = await waitFor("Studio B workspace in My Studios", async () => {
      const list = await asyncJs("var done = arguments[arguments.length - 1]; fetch('/api/studio/workspaces', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (body) { done((body.workspaces || []).map(function (item) { return { id: item.id, title: item.title }; })); }).catch(function () { done([]); });");
      const match = list.find((item) => item && item.id !== idA && item.title === studioBTitle);
      return match ? match.id : null;
    }, 30_000);
  } catch (error) {
    const status = await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';");
    const dialogError = await js("var node = document.querySelector('.tpi-studio-dialog-error'); return node ? node.textContent : '';");
    const diag = await js("return { dialogOpen: document.querySelectorAll('#tpi-create-studio-dialog').length, createCalls: window.__createCalls || [] };");
    throw new Error(`Studio B creation timed out (status=${JSON.stringify(status)} dialogError=${JSON.stringify(dialogError)} diag=${JSON.stringify(diag)})`);
  }
  check("12a. A second Studio is created for isolation testing", Boolean(idB), JSON.stringify({ idA, idB }));

  // Give Studio B its own distinct arrangement: drag the last pad to the front.
  await switchToStudio(idB);
  await waitFor("Studio B sound boards", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 4);
  await sleep(800);
  const orderBStart = (await soundTitles()).slice(0, 4);
  await dragSlot(3, 0, "left");
  const orderB = (await soundTitles()).slice(0, 4);
  check("12b. Studio B receives its own pad arrangement", orderB[0] === orderBStart[3] && orderB[1] === orderBStart[0] && JSON.stringify(orderB) !== JSON.stringify(orderA), JSON.stringify({ orderA, orderBStart, orderB }));
  await waitFor("Studio B order saved automatically", async () => JSON.stringify((await storedSoundTitles()).slice(0, 4)) === JSON.stringify(orderB), 15_000);
  await dumpState("after-12b-drag", idA, idB);

  // Switching back restores Studio A's own arrangement, untouched by B.
  await switchToStudio(idA);
  let restoredA = [];
  try {
    restoredA = await waitFor("Studio A arrangement to restore", async () => {
      const titles = (await soundTitles()).slice(0, 4);
      return JSON.stringify(titles) === JSON.stringify(orderA) ? titles : null;
    }, 15_000);
  } catch (error) { restoredA = (await soundTitles()).slice(0, 4); }
  await dumpState("after-12c-switchToA", idA, idB);
  check("12c. Switching back to Studio A restores its own arrangement", JSON.stringify(restoredA) === JSON.stringify(orderA), JSON.stringify({ orderA, restoredA }));

  // Returning to Studio B restores ITS arrangement — proving per-Studio
  // persistence without one Studio's order overwriting another's.
  await switchToStudio(idB);
  let restoredB = [];
  try {
    restoredB = await waitFor("Studio B arrangement to restore", async () => {
      const titles = (await soundTitles()).slice(0, 4);
      return JSON.stringify(titles) === JSON.stringify(orderB) ? titles : null;
    }, 15_000);
  } catch (error) { restoredB = (await soundTitles()).slice(0, 4); }
  await dumpState("after-12d-switchToB", idA, idB);
  check("12d. Studio B keeps its own arrangement without overwriting Studio A", JSON.stringify(restoredB) === JSON.stringify(orderB), JSON.stringify({ orderB, restoredB }));

  // 16. Intro/Outro playback remains functional.
  await upload('[data-tpi-video-card="0"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("Intro Video assignment", async () => (await count('[data-tpi-video-card="0"].assigned')) === 1);
  await click('[data-tpi-scene-id="intro"]');
  let introState = null;
  try {
    introState = await waitFor("Intro Video playback", async () => {
      const state = await js("var v=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return v ? { paused: v.paused, currentTime: v.currentTime } : null;");
      return state && !state.paused && state.currentTime > 0.05 ? state : null;
    }, 10_000);
  } catch (error) {}
  check("16. Intro Video playback remains functional", Boolean(introState));
  await click('[data-tpi-scene-id="intro"]');
  await sleep(400);

  // 17. After Intro Background Music remains functional.
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
  try {
    await waitFor("Background Music assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1);
  } catch (error) {
    const audioStatus = await js("var node = document.querySelector('[data-tpi-audio-status]'); return node ? node.textContent : '';");
    const musicState = await js("return { slotClasses: Array.from(document.querySelectorAll('[data-tpi-audio-board=\"music\"] .tpi-audio-slot')).map(function (n) { return n.className; }), musicSlots: JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || '[]'), legacy: JSON.parse(localStorage.getItem('studioflow.backgroundMusic') || 'null') };");
    throw new Error(`Background Music assignment timed out (audioStatus=${JSON.stringify(audioStatus)} musicState=${JSON.stringify(musicState)})`);
  }
  await click('[data-tpi-scene-music-for="after-intro"]');
  await waitFor("After Intro assignment menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  const musicChoice = (await driver.findElements(By.xpath("//div[contains(@class,'tpi-scene-music-menu')]//button[contains(., 'tpi-030-music')]")))[0];
  if (musicChoice) await musicChoice.click();
  await waitFor("After Intro assignment", async () => Boolean(await js("return JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro'];")));
  await click('[data-tpi-scene-music-for="after-intro"]');
  await sleep(600);
  check("17. After Intro Background Music remains functional", (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing')) === 1);
  await click('[data-tpi-audio-stop="music"]');
  await sleep(300);
  check("18. Music stop control and audio routing remain intact", (await count('[data-tpi-audio-stop="music"]')) === 1);
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const passed = results.filter((result) => result.passed).length;
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-030", status: passed === results.length ? "PASS" : "FAIL", passed, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(passed === results.length ? 0 : 1);

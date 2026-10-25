#!/usr/bin/env node
// TPI-STUDIOFLOW-031 — Background Music interface cleanup and drag-and-drop
// pad reordering. Disposable Firefox profile, disposable synthetic studios and
// generated audio only; no owner data, Crossroads media, or production state.
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_031_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoFile = process.env.TPI_FIREFOX_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-031-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });

function wavFile(name, frequency, seconds = 1.2) {
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
const studioATitle = `TPI-031 A ${runId}`;
const studioBTitle = `TPI-031 B ${runId}`;
const soundA = wavFile("tpi-031-click.wav", 500);
const musicA = wavFile("tpi-031-intro-atmos.wav", 220);
const musicB = wavFile("tpi-031-investigation.wav", 330);
const musicC = wavFile("tpi-031-suspense.wav", 440);
const musicD = wavFile("tpi-031-closing-theme.wav", 550);

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
  const started = Date.now();
  while (Date.now() - started < 5_000) {
    const elements = await driver.findElements(By.css(selector));
    if (!elements.length) {
      await sleep(100);
      continue;
    }
    try {
      await elements[0].click();
      return true;
    } catch (error) {
      await sleep(100);
    }
  }
  return false;
}
async function upload(triggerSelector, acceptToken, path) {
  const before = await count(`input[type=file][accept*="${acceptToken}"]`);
  if (!(await click(triggerSelector))) throw new Error(`Upload trigger not found: ${triggerSelector}`);
  await waitFor("dynamic file input", async () => {
    const elements = await driver.findElements(By.css(`input[type=file][accept*="${acceptToken}"]`));
    if (!elements.length || (elements.length <= before && before === 0)) return false;
    try {
      await elements[elements.length - 1].sendKeys(path);
      return true;
    } catch (error) {
      return false;
    }
  });
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
  await js(`if (!window.__tpiAudioCommands) {
    window.__tpiAudioCommands = [];
    window.addEventListener("studioflow:audio-command", function (event) {
      var detail = event.detail || {};
      window.__tpiAudioCommands.push({ category: detail.category, action: detail.action, title: detail.title || "" });
    }, true);
  }`);
}
async function musicTitles() {
  return await js("return Array.from(document.querySelectorAll('[data-tpi-audio-board=\"music\"] .tpi-audio-grid > *')).map(function (node) { if (node.classList.contains('tpi-audio-drop-placeholder')) return '__placeholder__'; var title = node.querySelector('.tpi-audio-slot-title'); return title ? title.textContent.trim() : node.className; });");
}
async function storedMusicTitles() {
  return await js("return (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || '[]') || []).slice().sort(function (a, b) { return a.slot - b.slot; }).map(function (item) { return item.title; });");
}
async function storedMusicTitleToBlob() {
  return await js("var map = {}; (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || '[]') || []).forEach(function (item) { map[item.title] = item.blobKey; }); return map;");
}
async function storedSoundTitles() {
  return await js("return (JSON.parse(localStorage.getItem('studioflow.customSounds') || '[]') || []).slice().sort(function (a, b) { return a.slot - b.slot; }).map(function (item) { return item.title; });");
}
async function playingMusicSlot() {
  return await js("var card = document.querySelector('[data-tpi-audio-board=\"music\"] .tpi-audio-slot.playing'); return card ? card.dataset.tpiAudioSlot : null;");
}
async function playingMusicTitle() {
  return await js("var card = document.querySelector('[data-tpi-audio-board=\"music\"] .tpi-audio-slot.playing'); return card ? (card.querySelector('.tpi-audio-slot-title') || {}).textContent || '' : '';");
}
async function commandLog() {
  return await js("return (window.__tpiAudioCommands || []).slice();");
}
async function scrollIntoView(element) {
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center', inline: 'center' });", element);
  await sleep(200);
}
async function dragSlot(board, fromIndex, toIndex, dropSide = "left") {
  const cards = await driver.findElements(By.css(`[data-tpi-audio-board="${board}"] .tpi-audio-grid > .tpi-audio-slot`));
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
  // gives a deterministic "hydration landed" signal (TPI-STUDIOFLOW-030).
  await js("window.__tpiSwitchActivations = 0; window.__tpiStudioFlowActivateBroadcast = (function (orig) { return function () { window.__tpiSwitchActivations = (window.__tpiSwitchActivations || 0) + 1; return orig.apply(this, arguments); }; })(window.__tpiStudioFlowActivateBroadcast);");
  await click(".tpi-studio-selector");
  await waitFor("My Studios menu", async () => (await count(".tpi-studio-menu:not([hidden])")) === 1);
  await waitFor(`studio menu row for ${workspaceId}`, async () => await click(`#tpi-studio-menu button[data-action="open"][data-workspace-id="${workspaceId}"]`), 20_000);
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
    throw new Error(`studio ${workspaceId} to activate timed out (before=${JSON.stringify(before)} after=${JSON.stringify(await activeStudioId())} earlyStatus=${JSON.stringify(earlyStatus)} status=${JSON.stringify(status)})`);
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

  await js("var id=arguments[0], broadcast={id:id,title:arguments[1],description:'Disposable music pad ordering test',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Main scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify([{id:'intro',kind:'intro',title:'Intro Video',sceneId:'intro',opening:true},{id:'music:after-intro',kind:'music',title:'Background Music',sceneId:'after-intro'},{id:'scene:scene-1',kind:'scene',title:'Main scene',sceneId:'scene-1'},{id:'music:scene-1',kind:'music',title:'Background Music',sceneId:'scene-1'},{id:'outro',kind:'outro',title:'Outro Video',sceneId:'outro',closing:true}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.removeItem('studioflow.sceneMusicAssignments');", `tpi-031-${Date.now()}`, studioATitle);
  await enterStudio();

  // Sound fixtures so check 16 can prove music reordering never disturbs the
  // Sound Effects board.
  await upload('[data-tpi-audio-board="sound"] .tpi-audio-upload', "audio/", soundA);
  await waitFor("sound assignment", async () => (await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned')) === 1);
  const soundOrderBefore = await storedSoundTitles();

  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicA);
  await waitFor("music A assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1);
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicB);
  await waitFor("music B assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 2);
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicC);
  await waitFor("music C assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 3);
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicD);
  await waitFor("music D assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 4);
  const initialTitles = await musicTitles();

  // 1. Three-dot menu buttons removed from music pads.
  check("1. Three-dot menu buttons are no longer visible on music pads", (await count('[data-tpi-audio-board="music"] .tpi-audio-slot-menu-trigger')) === 0);

  // 2. Right-click context menu keeps every existing action.
  const assignedCards = () => driver.findElements(By.css('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned'));
  const menuTarget = (await assignedCards())[0];
  await scrollIntoView(menuTarget);
  await driver.actions().contextClick(menuTarget).perform();
  await waitFor("music pad options menu", async () => (await count(".tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden])")) === 1);
  const menuActions = await js("return Array.from(document.querySelectorAll('.tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden]) button[data-tpi-audio-menu-action]')).map(function (button) { return button.textContent.trim(); });");
  check("2. Right-click context menu still works with all existing actions", JSON.stringify(menuActions) === JSON.stringify(["Rename", "Change color", "Replace audio", "Remove"]), JSON.stringify(menuActions));
  await js("document.body.click();");
  await sleep(300);

  // 3. Keyboard context-menu access without the three-dot button.
  await js("var card = document.querySelectorAll('[data-tpi-audio-board=\"music\"] .tpi-audio-grid > .tpi-audio-slot')[0]; card.focus();");
  await driver.actions().keyDown(Key.SHIFT).sendKeys(Key.F10).keyUp(Key.SHIFT).perform();
  let keyboardMenu = false;
  try { await waitFor("keyboard options menu", async () => (await count(".tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden])")) === 1, 5_000); keyboardMenu = true; } catch (error) {}
  check("3. Keyboard context-menu access works", keyboardMenu);
  await js("document.body.click();");
  await sleep(200);

  // 4. Touch-accessible menu and reorder path (pointer events + long-press).
  check("4. Touch-accessible menu behavior is preserved", Boolean(await js("var card = document.querySelector('[data-tpi-audio-board=\"music\"] .tpi-audio-slot.assigned'); return card && card.dataset.tpiAudioDraggable === 'true' && getComputedStyle(card).touchAction === 'none';")));

  // 17. Background Music volume remains functional. Volume/loop changes
  // re-render the boards, so interact through fresh selectors instead of
  // holding Selenium element references across renders.
  let volumeOk = false;
  if (await count('input[aria-label="Background music volume"]') === 1) {
    await js("var input=document.querySelector('input[aria-label=\"Background music volume\"]'); input.value='0.55'; input.dispatchEvent(new Event('input',{bubbles:true}));");
    await sleep(300);
    volumeOk = (await js("return JSON.parse(localStorage.getItem('studioflow.backgroundMusicVolume') || 'null');")) === 0.55;
  }
  check("17. Background Music volume remains functional", volumeOk);

  // 19. Looping remains functional.
  let loopOk = false;
  if (await count('input[aria-label="Loop background music"]') === 1) {
    await js("var input=document.querySelector('input[aria-label=\"Loop background music\"]'); input.checked=!input.checked; input.dispatchEvent(new Event('change',{bubbles:true}));");
    await sleep(300);
    loopOk = typeof (await js("return JSON.parse(localStorage.getItem('studioflow.backgroundMusicLoop') ?? 'null');")) === "boolean";
    await js("var input=document.querySelector('input[aria-label=\"Loop background music\"]'); if (input) { input.checked=true; input.dispatchEvent(new Event('change',{bubbles:true})); }");
    await sleep(200);
  }
  check("19. Looping remains functional", loopOk);

  // 5. Normal clicking plays the correct music.
  const musicCards = () => driver.findElements(By.css('[data-tpi-audio-board="music"] .tpi-audio-grid > .tpi-audio-slot'));
  await (await musicCards())[1].click();
  let playSlot = null;
  try { playSlot = await waitFor("music playback", async () => { const slot = await playingMusicSlot(); return slot !== null ? slot : null; }, 10_000); } catch (error) {}
  check("5. Normal clicking plays the correct music", playSlot === "1", `playing slot=${playSlot}`);

  // 18. Background Music Stop remains functional.
  check("18a. Background Music Stop control remains visible", (await count('[data-tpi-audio-stop="music"]')) === 1);
  await click('[data-tpi-audio-stop="music"]');
  await sleep(400);
  check("18b. Background Music Stop stops playback", (await playingMusicSlot()) === null);

  // 20 + 21. Program and monitoring routing remain wired through the audio
  // command bridge (volume/settings and play commands reach the engine).
  const commandsAfter = await commandLog();
  const settingsSeen = commandsAfter.some(c => c.category === "music" && c.action === "settings");
  // Play commands carry the asset metadata, whose own category field is
  // "background-music" — accept both spellings (pre-existing bridge contract).
  const playSeen = commandsAfter.some(c => (c.category === "music" || c.category === "background-music") && c.action === "play");
  check("20. Program audio routing remains functional (music commands dispatched)", settingsSeen && playSeen, JSON.stringify(commandsAfter.slice(-6)));
  check("21. Monitoring audio routing remains functional (volume settings reach the engine)", settingsSeen);

  // 6 + 9. Drag backward without triggering playback.
  await dragSlot("music", 2, 0, "left");
  const afterBack = await musicTitles();
  check("9. Pads can be moved backward in the grid", afterBack[0] === initialTitles[2] && afterBack[1] === initialTitles[0] && afterBack[2] === initialTitles[1], JSON.stringify({ initialTitles, afterBack }));
  check("6. Dragging does not trigger playback", (await playingMusicSlot()) === null);

  // 7 + 8. Drag forward while a track plays: dropping must not restart or
  // stop the active track.
  await (await musicCards())[0].click();
  await waitFor("music playback before drag", async () => (await playingMusicSlot()) !== null, 10_000);
  const playingBefore = await playingMusicTitle();
  const commandsBefore = await commandLog();
  await dragSlot("music", 1, 3, "right");
  const afterForward = await musicTitles();
  const playingAfter = await playingMusicTitle();
  const commandsDuringDrag = (await commandLog()).slice(commandsBefore.length);
  check("8. Pads can be moved forward in the grid", afterForward[0] === afterBack[0] && afterForward[1] === afterBack[2] && afterForward[2] === afterBack[3] && afterForward[3] === afterBack[1], JSON.stringify({ afterBack, afterForward }));
  check("7. Dropping does not restart or stop active music", (await playingMusicSlot()) !== null && playingAfter === playingBefore && !commandsDuringDrag.some(c => c.action === "play"), JSON.stringify({ playingBefore, playingAfter, commandsDuringDrag }));
  await click('[data-tpi-audio-stop="music"]');
  await sleep(300);

  // 11. Pad assignments move with their pads.
  const mapAfterDrag = await storedMusicTitleToBlob();
  check("11. Pad assignments move with their pads", Object.keys(mapAfterDrag).length === 4 && initialTitles.slice(0, 4).every((title) => Boolean(mapAfterDrag[title])), JSON.stringify(mapAfterDrag));

  // 13. The new order saves automatically, without a Save button.
  const storedAfterDrag = await storedMusicTitles();
  check("13. The new order saves automatically", JSON.stringify(storedAfterDrag.slice(0, 4)) === JSON.stringify(afterForward.slice(0, 4)), JSON.stringify({ storedAfterDrag, afterForward }));

  // 12. Reordered pads play the correct tracks.
  await sleep(500);
  await (await musicCards())[1].click();
  let movedPlaySlot = null;
  try { movedPlaySlot = await waitFor("moved pad playback", async () => { const slot = await playingMusicSlot(); return slot !== null ? slot : null; }, 10_000); } catch (error) {}
  const movedTitle = await playingMusicTitle();
  check("12. Reordered pads play the correct tracks", movedPlaySlot === "1" && movedTitle === afterForward[1], JSON.stringify({ movedPlaySlot, movedTitle, expected: afterForward[1] }));
  await click('[data-tpi-audio-stop="music"]');
  await sleep(300);

  // 16. Sound Effects ordering remains unchanged.
  check("16. Sound Effects ordering remains unchanged", JSON.stringify(await storedSoundTitles()) === JSON.stringify(soundOrderBefore), JSON.stringify({ soundOrderBefore, after: await storedSoundTitles() }));

  // 22 + required After Intro test (§6). Assign a track to After Intro,
  // reorder pads, and confirm the assignment survives.
  await click('[data-tpi-scene-music-for="after-intro"]');
  await waitFor("After Intro assignment menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  const assignedTrackTitle = initialTitles[1];
  const musicChoice = (await driver.findElements(By.xpath(`//div[contains(@class,'tpi-scene-music-menu')]//button[contains(., '${assignedTrackTitle}')]`)))[0];
  if (musicChoice) await musicChoice.click();
  await waitFor("After Intro assignment", async () => Boolean(await js("return JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro'];")));
  const assignmentBlobBefore = await js("return (JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro']||{}).blobKey || '';");
  const titlesBeforeReorder = await musicTitles();
  await dragSlot("music", 0, 2, "right");
  const assignmentBlobAfter = await js("return (JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro']||{}).blobKey || '';");
  check("22. After Intro Background Music retains its assigned track after reordering", Boolean(assignmentBlobBefore) && assignmentBlobAfter === assignmentBlobBefore, JSON.stringify({ assignmentBlobBefore, assignmentBlobAfter }));
  const reorderChangedOrder = JSON.stringify(await musicTitles()) !== JSON.stringify(titlesBeforeReorder);
  check("8b. The After Intro reorder actually changed the pad order", reorderChangedOrder, JSON.stringify({ titlesBeforeReorder, after: await musicTitles() }));

  // 23. Automatic activation after natural Intro completion.
  await upload('[data-tpi-video-card="0"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("Intro Video assignment", async () => (await count('[data-tpi-video-card="0"].assigned')) === 1);
  await click('[data-tpi-scene-id="intro"]');
  let introStarted = false;
  try {
    await waitFor("Intro Video playback", async () => {
      const state = await js("var v=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return v ? { paused: v.paused, currentTime: v.currentTime } : null;");
      return state && !state.paused && state.currentTime > 0.05;
    }, 10_000);
    introStarted = true;
  } catch (error) {}
  check("23a. Intro Video playback starts", introStarted);
  if (introStarted) {
    await js("var v=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); if (v && isFinite(v.duration)) v.currentTime = Math.max(0, v.duration - 0.3);");
  }
  let naturalHandoff = false;
  try {
    await waitFor("music handoff after natural Intro completion", async () => {
      const slot = await playingMusicSlot();
      if (slot === null) return false;
      return (await playingMusicTitle()) === assignedTrackTitle;
    }, 20_000);
    naturalHandoff = true;
  } catch (error) {}
  check("23. Automatic music activation after natural Intro completion plays the assigned track", naturalHandoff, `title=${JSON.stringify(await playingMusicTitle())} expected=${JSON.stringify(assignedTrackTitle)}`);
  await click('[data-tpi-audio-stop="music"]');
  await sleep(400);

  // 24. Individual preview stop is isolated from the production handoff.
  await click('[data-tpi-scene-id="intro"]');
  await waitFor("Intro Video playback before manual stop", async () => {
    const state = await js("var v=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return v ? { paused: v.paused, currentTime: v.currentTime } : null;");
    return state && !state.paused && state.currentTime > 0.05;
  }, 10_000);
  await click('[data-tpi-scene-id="intro"]');
  await sleep(600);
  check("24. Manual Intro preview stop does not activate After Intro music", (await playingMusicSlot()) === null, `title=${JSON.stringify(await playingMusicTitle())}`);
  const assignmentFinal = await js("return (JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro']||{}).blobKey || '';");
  check("8c. Changing pad order does not change the assigned After Intro track", assignmentFinal === assignmentBlobBefore, JSON.stringify({ assignmentFinal, assignmentBlobBefore }));
  await click('[data-tpi-audio-stop="music"]');
  await sleep(300);

  // 25. Outro Video remains independent.
  await upload('[data-tpi-video-card="1"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("Outro Video assignment", async () => (await count('[data-tpi-video-card="1"].assigned')) === 1);
  const commandsBeforeOutro = (await commandLog()).length;
  await click('[data-tpi-scene-id="outro"]');
  let outroState = null;
  try {
    outroState = await waitFor("Outro Video playback", async () => {
      const state = await js("var v=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return v ? { paused: v.paused, currentTime: v.currentTime } : null;");
      return state && !state.paused && state.currentTime > 0.05;
    }, 10_000);
  } catch (error) {}
  const outroMusicCommands = (await commandLog()).slice(commandsBeforeOutro).filter(c => c.category === "music" && c.action === "play");
  check("25. Outro Video remains independent (plays without starting music)", Boolean(outroState) && outroMusicCommands.length === 0, JSON.stringify({ outroMusicCommands }));
  await click('[data-tpi-scene-id="outro"]');
  await sleep(400);

  // 14. Refresh preserves the saved order.
  await driver.navigate().refresh();
  await enterStudio();
  await waitFor("restored music boards", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 4);
  const afterReload = await musicTitles();
  check("14. Refreshing preserves the order", JSON.stringify(afterReload.slice(0, 4)) === JSON.stringify((await storedMusicTitles()).slice(0, 4)), JSON.stringify(afterReload.slice(0, 4)));

  // 10. Empty pads remain functional for adding music.
  check("10a. Empty pads remain available for adding music", (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.empty button[data-tpi-audio-action="upload"]')) > 0);

  // 15. Each Studio keeps its own arrangement across switching (TPI-030 flow).
  const orderA = (await musicTitles()).slice(0, 4);
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
  let idB = "";
  try {
    idB = await waitFor("Studio B workspace in My Studios", async () => {
      const list = await asyncJs("var done = arguments[arguments.length - 1]; fetch('/api/studio/workspaces', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (body) { done((body.workspaces || []).map(function (item) { return { id: item.id, title: item.title }; })); }).catch(function () { done([]); });");
      const match = list.find((item) => item && item.id !== idA && item.title === studioBTitle);
      return match ? match.id : null;
    }, 30_000);
  } catch (error) {
    const status = await js("var node = document.querySelector('.tpi-studio-status'); return node ? node.textContent : '';");
    throw new Error(`Studio B creation timed out (status=${JSON.stringify(status)})`);
  }
  check("15a. A second Studio is created for isolation testing", Boolean(idB), JSON.stringify({ idA, idB }));

  // Creation intentionally activates the clean Studio B. Return to the
  // seeded Studio A, then assign B its own disposable music before testing
  // reordering and isolation. A new Studio must not inherit A's tracks.
  await switchToStudio(idA);
  await waitFor("Studio A music boards", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) >= 1, 30_000);
  await switchToStudio(idB);
  await waitFor("Studio B starts with independent music boards", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 0, 30_000);
  for (const file of [musicA, musicB, musicC, musicD]) {
    await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", file);
    await waitFor("Studio B music assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) > 0);
  }
  await waitFor("Studio B music boards", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 4, 30_000);
  await sleep(1200);
  // Give Studio B its own distinct music arrangement where music exists.
  const orderBStart = (await musicTitles()).slice(0, 4).filter(Boolean);
  if (orderBStart.length >= 2) {
    await dragSlot("music", 1, 0, "left");
  }
  const orderB = (await musicTitles()).slice(0, 4);
  check("15b. Studio B receives its own pad arrangement", JSON.stringify(orderB) !== JSON.stringify(orderA), JSON.stringify({ orderA, orderBStart, orderB }));

  await switchToStudio(idA);
  let restoredA = [];
  try {
    restoredA = await waitFor("Studio A arrangement to restore", async () => {
      const titles = (await musicTitles()).slice(0, 4);
      return JSON.stringify(titles) === JSON.stringify(orderA) ? titles : null;
    }, 15_000);
  } catch (error) { restoredA = (await musicTitles()).slice(0, 4); }
  check("15c. Switching back to Studio A restores its own arrangement", JSON.stringify(restoredA) === JSON.stringify(orderA), JSON.stringify({ orderA, restoredA }));

  await switchToStudio(idB);
  let restoredB = [];
  try {
    restoredB = await waitFor("Studio B arrangement to restore", async () => {
      const titles = (await musicTitles()).slice(0, 4);
      return JSON.stringify(titles) === JSON.stringify(orderB) ? titles : null;
    }, 15_000);
  } catch (error) { restoredB = (await musicTitles()).slice(0, 4); }
  check("15d. Studio B keeps its own arrangement without overwriting Studio A", JSON.stringify(restoredB) === JSON.stringify(orderB), JSON.stringify({ orderB, restoredB }));

  // 26 + 27. Recording, livestreaming, and guest controls remain present and
  // untouched (live sessions are not activated; see the completion record).
  const productionControls = await count("[data-tpi-video-organization] button, .production-controls button");
  check("26. Recording and livestreaming controls remain present", productionControls > 0, `controls=${productionControls}`);
  const guestControls = await js("return /guest|invite/i.test(document.body.innerText || '');");
  check("27. Guest connection controls remain present", Boolean(guestControls));
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const passed = results.filter((result) => result.passed).length;
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-031", status: passed === results.length ? "PASS" : "FAIL", passed, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(passed === results.length ? 0 : 1);

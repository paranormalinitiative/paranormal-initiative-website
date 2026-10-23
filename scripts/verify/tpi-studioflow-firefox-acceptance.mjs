#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoFile = process.env.TPI_FIREFOX_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const soundFile = process.env.TPI_FIREFOX_SOUND_FILE || "/private/tmp/tpi-021-sound.wav";
const musicFile = process.env.TPI_FIREFOX_MUSIC_FILE || "/private/tmp/tpi-021-music.wav";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const manualLogin = process.env.TPI_FIREFOX_MANUAL_LOGIN === "1";
const productionTarget = !/^http:\/\/(127\.0\.0\.1|localhost):(8787|8789)$/.test(base);
const productionQa = process.env.TPI_FIREFOX_PRODUCTION_QA === "approved";
const productionCredentialsFile = process.env.TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json");
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || (productionTarget ? "production_qa" : "test_admin");
const credentialPath = productionTarget ? productionCredentialsFile : credentialsFile;
const evidenceRoot = process.env.TPI_FIREFOX_EVIDENCE || mkdtempSync(join(tmpdir(), "tpi-firefox-acceptance-"));
const profile = join(evidenceRoot, "profile");
const downloads = join(evidenceRoot, "downloads");
mkdirSync(profile, { recursive: true });
mkdirSync(downloads, { recursive: true });

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);

function focusIsolatedFirefoxWindow() {
  if (process.platform !== "darwin") return;
  const script = `tell application "Firefox Developer Edition" to activate
tell application "System Events"
  tell process "Firefox Developer Edition"
    set frontmost to true
    set windowCount to count of windows
    repeat with windowIndex from windowCount to 1 by -1
      set candidate to window windowIndex
      try
        set candidateName to name of candidate as text
        -- Firefox may expose a newly launched Selenium window as a blank,
        -- zero-sized native window before it receives its document title.
        -- The newest window is the disposable acceptance window in that
        -- case; size and raise it explicitly so it is visible to the owner.
        if candidateName contains "TPI ISOLATED LIVE ACCEPTANCE" or windowIndex = windowCount then
          set position of candidate to {80, 80}
          set size of candidate to {1280, 1000}
          perform action "AXRaise" of candidate
          exit repeat
        end if
      end try
    end repeat
  end tell
end tell`;
  spawnSync("osascript", ["-e", script], { stdio: "ignore" });
}

if (productionTarget && process.env.TPI_FIREFOX_ALLOW_PRODUCTION !== "1") {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox acceptance defaults to the disposable local Worker only." }));
  process.exit(1);
}
if (productionTarget && !manualLogin && !productionQa) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Production Firefox acceptance requires the explicitly approved synthetic QA credential gate; local credentials are never sent to production." }));
  process.exit(1);
}
for (const file of [firefoxBinary, geckodriver, videoFile, soundFile, musicFile, ...(manualLogin ? [] : [credentialPath])]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ status: "BLOCKED", reason: `Required Firefox acceptance input is unavailable: ${file}` }));
    process.exit(1);
  }
}
const rawCredentials = manualLogin ? {} : JSON.parse(readFileSync(credentialPath, "utf8"));
const credentials = manualLogin
  ? { accounts: {} }
  : rawCredentials.accounts ? rawCredentials : { accounts: { production_qa: rawCredentials } };
const account = credentials.accounts?.[accountKey];
if (!manualLogin && (!account?.username || !account?.password)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `The synthetic ${accountKey} account is unavailable.` }));
  process.exit(1);
}
if (productionTarget && !manualLogin && (!productionQa || !/^qa-studioflow-[a-z0-9-]{0,26}$/.test(account.username))) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Production acceptance may use only an explicitly approved qa-studioflow-* account." }));
  process.exit(1);
}

const studioId = `firefox-acceptance-${Date.now()}`;
const studioTitle = `Firefox Acceptance ${Date.now()}`;
const options = new firefox.Options()
  .setBinary(firefoxBinary)
  .setProfile(profile)
  // Prevent an already-running Firefox Developer Edition session from
  // absorbing this disposable profile into an invisible secondary window.
  .addArguments("-no-remote", "-new-instance")
  .setPreference("browser.download.folderList", 2)
  .setPreference("browser.download.dir", downloads)
  .setPreference("browser.download.useDownloadDir", true)
  .setPreference("browser.download.always_ask_before_handling_new_types", false)
  .setPreference("browser.helperApps.neverAsk.saveToDisk", "application/json,application/octet-stream")
  .setPreference("media.autoplay.default", 0)
  .setPreference("media.autoplay.blocking_policy", 0);
const service = new firefox.ServiceBuilder(geckodriver);
let driver;

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function text(selector) { return String(await js("var node=document.querySelector(arguments[0]); return node ? node.textContent : '';", selector)); }
async function click(selector) { return js("var node=document.querySelector(arguments[0]); if(!node) return false; node.click(); return true;", selector); }
async function clickButton(label) { return js("var label=arguments[0].toLowerCase(); var node=Array.from(document.querySelectorAll('button')).find(function(button){ return (button.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase().indexOf(label)!==-1; }); if(!node) return false; node.click(); return true;", label); }
async function waitFor(description, predicate, timeout = 30_000, interval = 200) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(interval);
  }
  throw new Error(`${description} timed out${detail ? `: ${detail}` : ""}`);
}
async function authenticatedSession() {
  return asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});");
}
async function waitForManualLoginTransition(timeout = 600_000) {
  await waitFor("manual login transition", async () => {
    const url = new URL(await driver.getCurrentUrl());
    const stillOnLogin = /\/member-login(?:\.html)?\/?$/.test(url.pathname);
    const authenticatedCard = await count("[data-authenticated-login-state]:not([hidden])");
    return !stillOnLogin || authenticatedCard === 1;
  }, timeout, 1_000);
  if (!(await authenticatedSession())) throw new Error("The browser left the login form, but the authenticated session could not be confirmed.");
}
async function uploadByDynamicInput(triggerSelector, acceptToken, path) {
  const before = await count(`input[type=file][accept*="${acceptToken}"]`);
  if (!(await click(triggerSelector))) throw new Error(`Upload trigger not found: ${triggerSelector}`);
  const input = await waitFor("dynamic file input", async () => {
    const elements = await driver.findElements(By.css(`input[type=file][accept*="${acceptToken}"]`));
    return elements.length > before ? elements[elements.length - 1] : null;
  });
  await input.sendKeys(path);
}
async function uploadVideoSlot(index, acceptToken, path) {
  const card = `[data-tpi-video-card="${index}"]`;
  if (await count(`${card} [data-tpi-video-action="upload"]`)) {
    return uploadByDynamicInput(`${card} [data-tpi-video-action="upload"]`, acceptToken, path);
  }
  await click(`${card} button[data-tpi-video-menu-toggle]`);
  await waitFor(`video slot ${index} menu`, async () => count(`${card} .tpi-video-card-action-menu:not([hidden])`));
  return uploadByDynamicInput(`${card} [data-tpi-video-action="replace"]`, acceptToken, path);
}
async function enterStudio() {
  let shellError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await driver.get(`${base}/studio/`);
    try {
      await waitFor("StudioFlow shell", async () => {
        const url = new URL(await driver.getCurrentUrl());
        if (/\/member-login(?:\.html)?\/?$/.test(url.pathname)) return false;
        return /StudioFlow|Library|Destinations|Record without going live/i.test(await driver.findElement(By.css("body")).getText());
      }, 8_000, 200);
      shellError = null;
      break;
    } catch (error) {
      const body = await driver.findElement(By.css("body")).getText().catch(() => "");
      const url = new URL(await driver.getCurrentUrl());
      const redirectedToLogin = /\/member-login(?:\.html)?\/?$/.test(url.pathname);
      if ((!redirectedToLogin && body.trim()) || attempt === 4) throw error;
      shellError = error;
      await sleep(750 * attempt);
    }
  }
  if (shellError) throw shellError;
  if (!(await count("[data-tpi-video-organization]"))) {
    await clickButton("Record without going live");
    await sleep(400);
    await clickButton("Continue to setup");
    await sleep(800);
    await clickButton("Enter studio");
    await sleep(1000);
  }
  try {
    await waitFor("organized StudioFlow media controls", async () => (await count("[data-tpi-video-organization]")) === 1 && (await count("[data-tpi-audio-soundboards]")) === 1);
  } catch (error) {
    const video = await count("[data-tpi-video-organization]");
    const audio = await count("[data-tpi-audio-soundboards]");
    throw new Error(`${safe(error)}; video=${video}; audio=${audio}`);
  }
}
async function waitForDownload() {
  return waitFor("portable backup download", async () => {
    const files = readdirSync(downloads).filter(name => name.endsWith("-complete-backup.json") && !name.endsWith(".part"));
    if (!files.length) return null;
    const path = join(downloads, files[0]);
    return statSync(path).size > 0 ? path : null;
  }, 30_000);
}
function verifyArchive(path) {
  const archive = JSON.parse(readFileSync(path, "utf8"));
  if (archive.applicationId !== "tpi-studioflow" || archive.backupType !== "complete-portable-studio" || archive.formatVersion !== 2) throw new Error("Portable archive envelope is invalid.");
  if (archive.manifest?.verificationStatus !== "VERIFIED" || !archive.manifest?.completedAt) throw new Error("Portable archive is not verified.");
  const entries = new Map((archive.media || []).map(entry => [entry.relativePath, entry]));
  for (const asset of archive.manifest.media || []) {
    const entry = entries.get(asset.relativePath);
    if (!entry) throw new Error(`Portable media is missing: ${asset.relativePath}`);
    const bytes = Buffer.from(entry.base64, "base64");
    if (bytes.length !== asset.size || createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error(`Portable media hash failed: ${asset.relativePath}`);
  }
  return archive;
}

try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1000, x: 20, y: 20 });

  await driver.get(`${base}/member-login.html`);
  check("isolated Firefox login page renders", await count('form[data-member-login]') === 1);
  if (manualLogin) {
    // Some macOS Firefox/Selenium combinations expose the Marionette window
    // as a zero-sized native window. Open a regular, explicitly sized popup
    // inside the same disposable profile and attach the test to that window
    // so the owner can always see the login form.
    const initialHandles = await driver.getAllWindowHandles();
    await js("window.open(location.href, 'tpi-live-acceptance-login', 'popup=yes,width=1280,height=1000,left=80,top=80');");
    await sleep(750);
    const popupHandles = await driver.getAllWindowHandles();
    if (popupHandles.length > initialHandles.length) {
      await driver.switchTo().window(popupHandles[popupHandles.length - 1]);
      await waitFor("isolated login popup", async () => await count('form[data-member-login]') === 1, 30_000);
      await driver.manage().window().setRect({ width: 1280, height: 1000, x: 80, y: 80 });
    }
    await js("document.title = 'TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE';");
    // Firefox can finish creating the native window shortly after the
    // document title changes. Raise it more than once so the owner sees the
    // disposable login window even when another Firefox window was focused.
    focusIsolatedFirefoxWindow();
    setTimeout(focusIsolatedFirefoxWindow, 500);
    setTimeout(focusIsolatedFirefoxWindow, 1500);
    console.log(`ACTION REQUIRED: Sign in only in the Firefox window titled \"TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE\". This is a disposable profile (${profile}); other Firefox windows cannot satisfy this acceptance. Acceptance continues automatically after authentication.`);
    // Observe browser-local navigation/DOM state while the owner signs in.
    // Do not poll the production Worker: a prior 200 ms auth loop consumed
    // thousands of requests per acceptance attempt on the Free plan.
    await waitForManualLoginTransition();
    check("manual authentication succeeds in the isolated profile", true);
  } else {
    await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) return false; user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=\"submit\"]').click(); return true;", account.username, account.password);
    await waitFor("authenticated local session", authenticatedSession);
    check(`synthetic ${accountKey} authentication succeeds`, true);
  }

  await js("var id=arguments[0], title=arguments[1]; var broadcast={id:id,title:title,description:'Disposable Firefox acceptance studio',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Disposable scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1'));", studioId, studioTitle);
  await enterStudio();
  check("StudioFlow loads in isolated Firefox", await count("[data-tpi-video-organization]") === 1);
  const panelTargets = [
    ["Live interaction", "Destinations"],
    ["Comments", "Comments"],
    ["Banners", "Banner text"],
    ["Media assets", "Video clips"],
    ["Voice FX", "Voice FX"],
    ["Style", "Logo"],
    ["Widgets", "Widgets"],
    ["Notes", "Notes"],
    ["People", "People"],
    ["Private chat", "Private chat"],
    ["Recording", "Recording"]
  ];
  for (const [label, expected] of panelTargets) {
    const opened = await click(`[data-studio-panel-tab="${label}"]`);
    await waitFor(`${label} panel`, async () => (await text(".asset-panel")).includes(expected));
    check(`${label} panel opens from the right rail`, opened && (await text(".asset-panel")).includes(expected));
  }
  await click('[data-studio-panel-tab="Media assets"]');
  check("eight video cards render", await count("[data-tpi-video-card]") === 8, await count("[data-tpi-video-card]"));
  check("one native video timer and four duration controls render", await count("[data-tpi-video-timer-section]") === 1 && await count("[data-tpi-native-video-timer]") === 1 && await count("[data-tpi-native-video-timer-controls] button") >= 4);
  check("nine Sound Effects slots render", await count('[data-tpi-audio-board="sound"] .tpi-audio-slot') === 9);
  check("nine Background Music slots render", await count('[data-tpi-audio-board="music"] .tpi-audio-slot') === 9);

  await uploadVideoSlot(0, "video/mp4", videoFile);
  await waitFor("Intro Video persistence", async () => (await text('[data-tpi-video-card="0"] .tpi-video-card-file')).includes("tpi-022-video.mp4"));
  await uploadVideoSlot(1, "video/mp4", videoFile);
  await waitFor("Outro Video persistence", async () => (await text('[data-tpi-video-card="1"] .tpi-video-card-file')).includes("tpi-022-video.mp4"));
  check("Intro and Outro assignments are independent", await count('[data-tpi-video-card="0"].assigned') === 1 && await count('[data-tpi-video-card="1"].assigned') === 1);
  await waitFor("Intro visible preview", async () => count('[data-tpi-video-card="0"] img, [data-tpi-video-card="0"] video[data-tpi-preview]:not([hidden])'));
  await waitFor("Outro visible preview", async () => count('[data-tpi-video-card="1"] img, [data-tpi-video-card="1"] video[data-tpi-preview]:not([hidden])'));
  check("Intro and Outro display visible previews", await count('[data-tpi-video-card="0"] img, [data-tpi-video-card="0"] video[data-tpi-preview]:not([hidden])') === 1 && await count('[data-tpi-video-card="1"] img, [data-tpi-video-card="1"] video[data-tpi-preview]:not([hidden])') === 1 && await count('[data-tpi-video-card="0"] .tpi-video-card-fallback, [data-tpi-video-card="1"] .tpi-video-card-fallback') === 0);
  await click('[data-tpi-scene-id="intro"]');
  await waitFor("Intro stage clip is mounted without program engagement", async () => count(".program-stage > video.stage-video"));
  const introStageState = await js("var video=document.querySelector('.program-stage > video.stage-video'); return {paused:!!(video&&video.paused),programActive:JSON.parse(localStorage.getItem('studioflow.programActive')||'false')===true};");
  check("Intro selection does not autoplay before Record or Live", introStageState.paused && !introStageState.programActive, JSON.stringify(introStageState));

  await uploadByDynamicInput('[data-tpi-audio-board="sound"] .tpi-audio-upload', "audio/", soundFile);
  await waitFor("sound assignment", async () => count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned'));
  await uploadByDynamicInput('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
  await waitFor("music assignment", async () => count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned'));
  await click('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned');
  await waitFor("sound playback", async () => count('[data-tpi-audio-board="sound"] .tpi-audio-slot.playing'));
  await click('[data-tpi-audio-stop="sound"]');
  await click('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned');
  await waitFor("music playback", async () => count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing'));
  check("soundboards upload and play independently", true);
  await click('[data-tpi-audio-stop="music"]');

  const audioMenuTriggerCount = await count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned .tpi-audio-slot-menu-trigger');
  check("assigned sound exposes an audio options trigger", audioMenuTriggerCount === 1, `count=${audioMenuTriggerCount}`);
  const audioMenuClicked = await click('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned .tpi-audio-slot-menu-trigger');
  check("audio options trigger opens the menu", audioMenuClicked === true);
  const audioMenuImmediate = await js("var menus=Array.from(document.querySelectorAll('.tpi-audio-slot-menu')); return menus.map(function(menu){return {floating:menu.getAttribute('data-tpi-audio-floating'),hidden:menu.hidden,parent:menu.parentElement&&menu.parentElement.tagName,connected:menu.isConnected};});");
  check("floating audio menu is created in the document", audioMenuImmediate.some(menu => menu.floating === "true" && menu.hidden === false && menu.parent === "BODY" && menu.connected === true), JSON.stringify(audioMenuImmediate));
  await waitFor("floating audio management menu", async () => count('.tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden])'));
  const audioMenuLayout = await js("var menu=document.querySelector('.tpi-audio-slot-menu[data-tpi-audio-floating]:not([hidden])'), rect=menu&&menu.getBoundingClientRect(); return {visible:!!menu,body:!!(menu&&menu.parentElement===document.body),fixed:!!(menu&&getComputedStyle(menu).position==='fixed'),left:rect&&rect.left,right:rect&&rect.right,top:rect&&rect.top,bottom:rect&&rect.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight};");
  check("audio management menu floats above the panel and stays in the viewport", audioMenuLayout.visible && audioMenuLayout.body && audioMenuLayout.fixed && audioMenuLayout.left >= 0 && audioMenuLayout.top >= 0 && audioMenuLayout.right <= audioMenuLayout.viewportWidth + 1 && audioMenuLayout.bottom <= audioMenuLayout.viewportHeight + 1, JSON.stringify(audioMenuLayout));
  await js("document.body.click();");

  check("existing timer controls remain selectable", await click('[data-tpi-native-video-timer-controls] button:first-child') && await count('[data-tpi-video-timer-section]') === 1);

  await click(".tpi-studio-selector");
  const layout = await js("var menu=document.querySelector('.tpi-studio-menu'), status=document.querySelector('.tpi-studio-status'), backup=document.querySelector('.tpi-studio-backup-status'); var rect=function(n){return n&&n.getBoundingClientRect();}, overlap=function(a,b){return !!(a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);}; return {visible:!!(menu&&!menu.hidden),overlap:overlap(rect(menu),rect(status))||overlap(rect(menu),rect(backup)),text:menu?menu.textContent:''};");
  check("My Studios dropdown is readable and does not overlap status", layout.visible && !layout.overlap && layout.text.includes(studioTitle), JSON.stringify(layout));
  await driver.actions().sendKeys("\uE00C").perform();

  await click(".tpi-studio-selector");
  await click('.tpi-studio-menu [data-action="menu"]');
  await waitFor("Studio Menu", async () => count('.tpi-studio-manage-menu:not([hidden])'));
  await click('.tpi-studio-manage-menu [data-action="save"]');
  await waitFor("browser-local save", async () => (await text(".tpi-studio-status")).includes("PROJECT SAVED LOCALLY"));
  check("browser-local save is confirmed before switching", true);

  const backupResult = await asyncJs("var done=arguments[arguments.length-1]; window.__tpiStudioBackup.portableBackupNow().then(function(result){done({ok:true,fileName:result.fileName,mediaCount:result.manifest.media.length,sourceKind:result.manifest.studio.sourceKind});}).catch(function(error){done({ok:false,error:error&&error.message});});");
  check("Firefox complete portable backup completes", backupResult?.ok === true, backupResult?.error || JSON.stringify(backupResult));
  const backupPath = await waitForDownload();
  const archive = verifyArchive(backupPath);
  check("Firefox writes an actual verified backup file", Boolean(backupPath) && archive.manifest.media.length >= 4, `media=${archive.manifest.media.length}`);
  check("portable backup includes Intro, Outro, sound, and music media", ["intro", "outro", "sound", "background-music"].every(role => archive.manifest.media.some(asset => asset.role === role)), JSON.stringify(archive.manifest.media.map(asset => asset.role)));

  await click(".tpi-studio-selector");
  await click('.tpi-studio-menu [data-action="menu"]');
  await waitFor("complete backup restore control", async () => count('.tpi-studio-manage-menu [data-action="restore-complete"]'));
  const restoreInput = await driver.findElement(By.css('[data-action="complete-file"]'));
  await restoreInput.sendKeys(backupPath);
  const alert = await driver.wait(until.alertIsPresent(), 15_000);
  await alert.accept();
  const restored = await waitFor("restore-as-new", async () => js("var broadcasts=JSON.parse(localStorage.getItem('studioflow.broadcasts')||'[]'); var active=JSON.parse(localStorage.getItem('studioflow.activeBroadcastId')||'\"\"'); return broadcasts.length>=2 && active.indexOf('studio-restore-')===0 ? {active:active,count:broadcasts.length} : null;"), 30_000);
  check("restore-as-new creates a separate browser-local studio", restored.count >= 2 && restored.active !== studioId, JSON.stringify(restored));
  const restoredMedia = await asyncJs("var done=arguments[arguments.length-1]; var slots=JSON.parse(localStorage.getItem('studioflow.videoClipSlots')||'[]').filter(Boolean); var sounds=JSON.parse(localStorage.getItem('studioflow.customSounds')||'[]').filter(Boolean); var music=JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots')||'[]').filter(Boolean); var keys=slots.concat(sounds,music).map(function(item){return item.blobKey;}).filter(Boolean); var request=indexedDB.open('studioflow-recordings'); request.onerror=function(){done({ok:false,error:'db'});}; request.onsuccess=function(){var db=request.result,tx=db.transaction('recordingBlobs','readonly'),found=0; keys.forEach(function(key){var get=tx.objectStore('recordingBlobs').get(key); get.onsuccess=function(){if(get.result)found+=1;};}); tx.oncomplete=function(){db.close();done({ok:keys.length>=4&&found===keys.length,keys:keys.length,found:found});};};");
  check("restored media bytes remain available", restoredMedia?.ok === true, JSON.stringify(restoredMedia));

  await clickButton("Library");
  await waitFor("restored library", async () => count("[data-tpi-video-organization]"));
  await click(".tpi-studio-selector");
  const openedOriginal = await js("var title=arguments[0]; var button=Array.from(document.querySelectorAll('.tpi-studio-menu button[data-action=\"open-local\"]')).find(function(node){return (node.textContent||'').includes(title);}); if(!button)return false; button.click(); return true;", studioTitle);
  check("original Studio remains available after restore", openedOriginal === true);
  await waitFor("switch back to original Studio", async () => js("return JSON.parse(localStorage.getItem('studioflow.activeBroadcastId')||'\"\"')===arguments[0];", studioId));
  check("My Studios switching immediately opens the selected Studio", true);
  await driver.navigate().refresh();
  await enterStudio();
  const afterRefresh = await asyncJs("var expected=arguments[0], done=arguments[arguments.length-1]; var id=JSON.parse(localStorage.getItem('studioflow.activeBroadcastId')||'\"\"'), slots=JSON.parse(localStorage.getItem('studioflow.videoClipSlots')||'[]').filter(Boolean), sounds=JSON.parse(localStorage.getItem('studioflow.customSounds')||'[]').filter(Boolean), music=JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots')||'[]').filter(Boolean), keys=slots.concat(sounds,music).map(function(item){return item.blobKey;}).filter(Boolean), request=indexedDB.open('studioflow-recordings'); request.onerror=function(){done({ok:false});}; request.onsuccess=function(){var db=request.result,tx=db.transaction('recordingBlobs','readonly'),found=0; keys.forEach(function(key){var get=tx.objectStore('recordingBlobs').get(key);get.onsuccess=function(){if(get.result)found+=1;};});tx.oncomplete=function(){db.close();done({ok:id===expected&&keys.length>=4&&found===keys.length,id:id,keys:keys.length,found:found});};};", studioId);
  check("studio identity and media persist after reopening", afterRefresh?.ok === true, JSON.stringify(afterRefresh));

  await driver.takeScreenshot().then(data => { writeFileSync(join(evidenceRoot, "firefox-desktop.png"), data, "base64"); });
  await driver.manage().window().setRect({ width: 390, height: 844, x: 20, y: 20 });
  await click(".tpi-studio-selector");
  const narrow = await js("var menu=document.querySelector('.tpi-studio-menu'), rect=menu&&menu.getBoundingClientRect(); return {visible:!!(menu&&!menu.hidden),left:rect&&rect.left,right:rect&&rect.right,width:rect&&rect.width,viewport:innerWidth};");
  check("My Studios remains usable at narrow width", narrow.visible && narrow.left >= 0 && narrow.right <= narrow.viewport + 1, JSON.stringify(narrow));
  await driver.takeScreenshot().then(data => { writeFileSync(join(evidenceRoot, "firefox-narrow.png"), data, "base64"); });
} catch (error) {
  let diagnostic = "";
  if (driver) {
    try { diagnostic = `; url=${await driver.getCurrentUrl()}; body=${(await driver.findElement(By.css("body")).getText()).slice(0, 600)}`; } catch (diagnosticError) { diagnostic = `; diagnostic=${safe(diagnosticError)}`; }
    try { writeFileSync(join(evidenceRoot, "firefox-failure.png"), await driver.takeScreenshot(), "base64"); } catch (screenshotError) {}
  }
  check("Firefox acceptance completed", false, safe(error) + diagnostic);
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", isolation: { profile, downloads, ownerProfileAccessed: false }, evidenceRoot, studioId, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

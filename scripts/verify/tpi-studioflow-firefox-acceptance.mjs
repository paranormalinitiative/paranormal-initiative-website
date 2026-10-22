#!/usr/bin/env node
import { createHash } from "node:crypto";
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
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const productionTarget = !/^http:\/\/(127\.0\.0\.1|localhost):(8787|8789)$/.test(base);
const evidenceRoot = process.env.TPI_FIREFOX_EVIDENCE || mkdtempSync(join(tmpdir(), "tpi-firefox-acceptance-"));
const profile = join(evidenceRoot, "profile");
const downloads = join(evidenceRoot, "downloads");
mkdirSync(profile, { recursive: true });
mkdirSync(downloads, { recursive: true });

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);

if (productionTarget && process.env.TPI_FIREFOX_ALLOW_PRODUCTION !== "1") {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox acceptance defaults to the disposable local Worker only." }));
  process.exit(1);
}
if (productionTarget && !manualLogin) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Production Firefox acceptance requires manual login in the isolated profile; local credentials are never sent to production." }));
  process.exit(1);
}
for (const file of [firefoxBinary, geckodriver, videoFile, soundFile, musicFile, ...(manualLogin ? [] : [credentialsFile])]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ status: "BLOCKED", reason: `Required Firefox acceptance input is unavailable: ${file}` }));
    process.exit(1);
  }
}
const credentials = manualLogin ? { accounts: {} } : JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.[accountKey];
if (!manualLogin && (!account?.username || !account?.password)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `The synthetic ${accountKey} account is unavailable.` }));
  process.exit(1);
}

const studioId = `firefox-acceptance-${Date.now()}`;
const studioTitle = `Firefox Acceptance ${Date.now()}`;
const options = new firefox.Options()
  .setBinary(firefoxBinary)
  .setProfile(profile)
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
  await driver.get(`${base}/studio/`);
  await waitFor("StudioFlow shell", async () => /StudioFlow|Home|Library|Destinations|Record without going live/i.test(await driver.findElement(By.css("body")).getText()));
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
    console.log("ACTION REQUIRED: Sign in to the isolated Firefox Developer Edition window. Acceptance continues automatically after authentication.");
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
  check("nine video cards render", await count("[data-tpi-video-card]") === 9, await count("[data-tpi-video-card]"));
  check("six video timer cards render", await count("[data-tpi-video-timers] .tpi-video-timer-card") === 6, await count("[data-tpi-video-timers] .tpi-video-timer-card"));
  check("nine Sound Effects slots render", await count('[data-tpi-audio-board="sound"] .tpi-audio-slot') === 9);
  check("nine Background Music slots render", await count('[data-tpi-audio-board="music"] .tpi-audio-slot') === 9);

  await uploadVideoSlot(0, "video/mp4", videoFile);
  await waitFor("Intro Video persistence", async () => (await text('[data-tpi-video-card="0"] .tpi-video-card-file')).includes("tpi-022-video.mp4"));
  await uploadVideoSlot(1, "video/mp4", videoFile);
  await waitFor("Outro Video persistence", async () => (await text('[data-tpi-video-card="1"] .tpi-video-card-file')).includes("tpi-022-video.mp4"));
  check("Intro and Outro assignments are independent", await count('[data-tpi-video-card="0"].assigned') === 1 && await count('[data-tpi-video-card="1"].assigned') === 1);
  check("Intro and Outro previews are recognizable or explicitly assigned", await count('[data-tpi-video-card="0"] img, [data-tpi-video-card="0"] .tpi-video-card-fallback') === 1 && await count('[data-tpi-video-card="1"] img, [data-tpi-video-card="1"] .tpi-video-card-fallback') === 1);
  await click('[data-tpi-video-card="0"] [data-tpi-video-action="preview"]');
  await waitFor("Intro preview playback", async () => count('[data-tpi-video-card="0"] video[data-tpi-preview]:not([hidden])'));
  check("Intro preview loads from browser media storage", true);

  await uploadByDynamicInput('[data-tpi-audio-board="sound"] .tpi-audio-upload', "audio/", soundFile);
  await waitFor("sound assignment", async () => count('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned'));
  await uploadByDynamicInput('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
  await waitFor("music assignment", async () => count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned'));
  await click('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned [data-tpi-audio-action="play"]');
  await waitFor("sound playback", async () => count('[data-tpi-audio-board="sound"] .tpi-audio-slot.playing'));
  await click('[data-tpi-audio-stop="sound"]');
  await click('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned [data-tpi-audio-action="play"]');
  await waitFor("music playback", async () => count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing'));
  check("soundboards upload and play independently", true);
  await click('[data-tpi-audio-stop="music"]');

  await click('[data-tpi-video-timers] .tpi-video-timer-card:nth-of-type(1) [data-tpi-video-action="select-timer"]');
  await waitFor("timer selection", async () => count('[data-tpi-video-timers] .tpi-video-timer-card.selected [data-tpi-video-action="start-timer"]'));
  await click('[data-tpi-video-timers] .tpi-video-timer-card.selected [data-tpi-video-action="start-timer"]');
  const timerDiagnostic = () => js("var s=document.querySelector('[data-tpi-timer-status]'); var c=document.querySelector('[data-tpi-video-timers]'); return 'status=' + (s && s.textContent) + ' | selected=' + (c ? c.querySelectorAll('.tpi-video-timer-card.selected').length : 'none') + ' | running=' + (c ? c.querySelectorAll('.tpi-video-timer-card.running').length : 'none') + ' | nativeStart=' + Array.from(document.querySelectorAll('section.asset-section button.background-picker-tile')).some(function(b){return (b.title||'').toLowerCase().indexOf('golden ring countdown')!==-1;}) + ' | presets=' + document.querySelectorAll('.countdown-duration-row button').length;");
  let timerRunning = false;
  for (let i = 0; i < 25 && !timerRunning; i++) { timerRunning = (await count('[data-tpi-video-timers] .tpi-video-timer-card.running')) === 1; if (!timerRunning) await sleep(200); }
  check("existing timer controls start one timer", timerRunning, timerRunning ? "" : await timerDiagnostic());
  await click('[data-tpi-video-timers] .tpi-video-timer-card.running [data-tpi-video-action="stop-timer"]');

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

#!/usr/bin/env node
// TPI-STUDIOFLOW-037 Addendum D — production shortcut playback toggles.
// This uses an isolated Firefox profile and local disposable media. It tests
// the real Scenes panel clicks against the existing playback engines.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_037D_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoFile = process.env.TPI_FIREFOX_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const musicFile = process.env.TPI_FIREFOX_MUSIC_FILE || "/private/tmp/tpi-021-music.wav";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = credentials?.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-037d-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);
for (const file of [firefoxBinary, geckodriver, videoFile, musicFile, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-D", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-D", status: "BLOCKED", reason: "The local synthetic test_admin account is unavailable." }));
  process.exit(1);
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
async function waitFor(description, predicate, timeout = 15_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; } catch {}
    await sleep(200);
  }
  throw new Error(`${description} timed out`);
}
async function click(selector) {
  const elements = await driver.findElements(By.css(selector));
  if (!elements.length) throw new Error(`Click target not found: ${selector}`);
  await elements[0].click();
}
async function upload(triggerSelector, acceptToken, file) {
  const before = (await driver.findElements(By.css("input[type=file]"))).length;
  await click(triggerSelector);
  const input = await waitFor("dynamic file input", async () => {
    const inputs = await driver.findElements(By.css("input[type=file]"));
    const candidate = inputs.length > before ? inputs[inputs.length - 1] : null;
    if (!candidate) return null;
    const accept = await candidate.getAttribute("accept");
    return !acceptToken || accept.includes(acceptToken) ? candidate : null;
  }).catch(async (error) => {
    const diagnostic = await js("return {inputs:document.querySelectorAll('input[type=file]').length, cards:Array.from(document.querySelectorAll('[data-tpi-video-card]')).slice(0,5).map(function(card){return {slot:card.getAttribute('data-tpi-video-card'),text:card.textContent.trim().slice(0,120),html:card.outerHTML.slice(0,240)}}), targets:Array.from(document.querySelectorAll(arguments[0])).length};", triggerSelector);
    throw new Error(`${error.message}; ${JSON.stringify(diagnostic)}`);
  });
  await input.sendKeys(file);
}
async function ensureAssigned(cardSelector, triggerSelector, acceptToken, file) {
  if ((await count(`${cardSelector}.assigned`)) === 0) await upload(triggerSelector, acceptToken, file);
}
async function musicPlaying() { return count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing'); }

try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1000, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));
  await js("var id=arguments[0], broadcast={id:id,title:'TPI-037D Firefox',description:'Disposable Addendum D shortcut test',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Main scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.removeItem('studioflow.sceneMusicAssignments');", `tpi-037d-${Date.now()}`);
  await driver.get(`${base}/studio/`);
  await waitFor("StudioFlow shell", async () => /StudioFlow|Library|Destinations|Record without going live/i.test(await driver.findElement(By.css("body")).getText()));
  const setupEntry = (await driver.findElements(By.xpath("//button[contains(., 'Record without going live')]")).catch(() => []))[0];
  if (setupEntry) await setupEntry.click();
  await sleep(400);
  const setupContinue = (await driver.findElements(By.xpath("//button[contains(., 'Continue to setup')]")).catch(() => []))[0];
  if (setupContinue) await setupContinue.click();
  await sleep(800);
  const studioEntry = (await driver.findElements(By.xpath("//button[contains(., 'Enter studio')]")).catch(() => []))[0];
  if (studioEntry) await studioEntry.click();
  await waitFor("organized StudioFlow controls", async () => (await count("[data-tpi-video-organization]")) === 1 && (await count("[data-tpi-audio-soundboards]")) === 1);
  // The preceding maintained TPI-028/TPI-031 suites provision the synthetic
  // local workspace. Do not upload or overwrite test-account media here. Use
  // the existing assigned Intro blob as a disposable Video Clips slot alias
  // in this isolated profile so this test exercises stage shortcut playback
  // without creating another media record.
  if ((await count('[data-tpi-video-card="0"].assigned')) === 0) {
    await upload('[data-tpi-video-card="0"] [data-tpi-video-action="upload"]', "video/", videoFile);
    await waitFor("synthetic Intro Video assignment", async () => (await count('[data-tpi-video-card="0"].assigned')) === 1);
  }
  if ((await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 0) {
    await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
    await waitFor("synthetic Background Music assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1);
  }
  await js("var slots=JSON.parse(localStorage.getItem('studioflow.videoClipSlots')||'[]'), source=slots.find(function(asset){return asset&&asset.blobKey;}); if(!source) throw new Error('The synthetic Intro Video assignment is unavailable.'); slots[4]=Object.assign({},source,{slot:4,label:'Video 5'}); localStorage.setItem('studioflow.videoClipSlots',JSON.stringify(slots)); window.dispatchEvent(new Event('studioflow:storage-changed')); return true;");
  await waitFor("synthetic Video Clip slot", async () => (await count('[data-tpi-video-card="4"].assigned')) === 1);

  // Assign the existing music asset to After Intro through its real menu.
  await click('[data-tpi-scene-music-for="after-intro"]');
  await waitFor("After Intro music menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  await click(".tpi-scene-music-menu-item:not(.remove)");
  await waitFor("After Intro assignment", async () => Boolean(await js("return JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro'];")));

  // Countdown toggle: play once, stop on the second click.
  await click('[data-tpi-scene-panel-item="timer"] .scene-panel-item-button');
  await waitFor("timer starts", async () => (await count(".program-stage.ring-timer-active")) === 1);
  check("Countdown first click starts playback", await count(".program-stage.ring-timer-active") === 1);
  await click('[data-tpi-scene-panel-item="timer"] .scene-panel-item-button');
  await waitFor("timer stops", async () => (await count(".program-stage.ring-timer-active")) === 0);
  check("Countdown second click stops playback", await count(".program-stage.ring-timer-active") === 0);

  // Background Music toggle uses the existing soundboard engine.
  await click('[data-tpi-scene-music-for="after-intro"]');
  await waitFor("scene music starts", async () => (await musicPlaying()) === 1);
  check("Background Music first click starts playback", await musicPlaying() === 1);
  await click('[data-tpi-scene-music-for="after-intro"]');
  await waitFor("scene music stops", async () => (await musicPlaying()) === 0);
  check("Background Music second click stops playback", await musicPlaying() === 0);

  // Add a real Video Clip shortcut without changing the asset assignment.
  await js("var items=JSON.parse(localStorage.getItem('studioflow.scenePanelItems')||'[]'); if(!items.some(function(item){return item.id==='video-clip:4';})) items.push({id:'video-clip:4',kind:'video-clip',title:'Video Clip',slot:4}); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify(items)); window.dispatchEvent(new Event('studioflow:storage-changed')); return true;");
  await waitFor("Video Clip shortcut", async () => (await count('[data-tpi-scene-panel-item="video-clip:4"]')) === 1);
  await click('[data-tpi-scene-panel-item="video-clip:4"] .scene-panel-item-button');
  await waitFor("Video Clip starts", async () => (await count(".program-stage video.tpi-video-clip-stage-video")) === 1);
  check("Video Clip first click starts playback", await count(".program-stage video.tpi-video-clip-stage-video") === 1 && await count('[data-tpi-video-clip-playing="true"]') === 1);
  await click('[data-tpi-scene-panel-item="video-clip:4"] .scene-panel-item-button');
  await waitFor("Video Clip stops", async () => (await count(".program-stage video.tpi-video-clip-stage-video")) === 0);
  check("Video Clip second click stops playback", await count(".program-stage video.tpi-video-clip-stage-video") === 0);

  // Play Sequence is a rehearsal-only toggle and must cancel its current item.
  await click(".scene-panel-rehearsal-button");
  await waitFor("sequence starts", async () => (await driver.findElement(By.css(".scene-panel-rehearsal-button")).getText()).includes("Stop Sequence"));
  check("Play Sequence starts rehearsal", (await driver.findElement(By.css(".scene-panel-rehearsal-button")).getText()).includes("Stop Sequence"));
  await click(".scene-panel-rehearsal-button");
  await waitFor("sequence stops", async () => (await driver.findElement(By.css(".scene-panel-rehearsal-button")).getText()).includes("Play Sequence"));
  check("Stop Sequence cancels rehearsal media", (await driver.findElement(By.css(".scene-panel-rehearsal-button")).getText()).includes("Play Sequence") && await count(".program-stage.ring-timer-active") === 0 && await count(".program-stage video.tpi-video-clip-stage-video") === 0);

  // Removal only changes the panel shortcut; the assigned Video Clips asset
  // remains present and available in its authoritative media section.
  await click('[data-tpi-scene-panel-item="video-clip:4"] .scene-item-menu-trigger');
  await waitFor("Video Clip context menu", async () => (await count(".scene-item-context-menu")) === 1);
  const menuText = await js("var menu=document.querySelector('.scene-item-context-menu'); return menu ? menu.textContent : ''; ");
  check("Context menu uses Remove from Scenes", menuText.includes("Remove from Scenes"), menuText);
  await click(".scene-item-context-menu button.danger");
  await waitFor("Video Clip shortcut removed", async () => (await count('[data-tpi-scene-panel-item="video-clip:4"]')) === 0);
  check("Removing shortcut preserves the underlying Video Clips asset", await count('[data-tpi-video-card="4"].assigned') === 1);
} catch (error) {
  check("Firefox Addendum D interaction test completed", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-D", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", evidenceRoot, results, passed: results.length - failed.length, total: results.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

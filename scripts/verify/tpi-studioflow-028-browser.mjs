#!/usr/bin/env node
import { existsSync, mkdtempSync, mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_028_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const videoFile = process.env.TPI_FIREFOX_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const musicFile = process.env.TPI_FIREFOX_MUSIC_FILE || "/private/tmp/tpi-021-music.wav";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-028-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);

for (const file of [firefoxBinary, geckodriver, videoFile, musicFile, credentialsFile]) {
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
async function activeSceneId() {
  return await js("return JSON.parse(localStorage.getItem('studioflow.activeSceneId')||'\\\"\\\"');");
}
async function musicPlayingCount() {
  return await count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing');
}
async function stageClipState() {
  return await js("var v=document.querySelector('.program-stage > video.stage-video:not(.tpi-video-clip-stage-video)'); return v ? {src:(v.getAttribute('src')||'').slice(0,5), paused:v.paused, currentTime:Math.round(v.currentTime*100)/100, ended:v.ended, duration:Math.round((v.duration||0)*100)/100} : null;");
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

try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1000, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));
  await js("var id=arguments[0], broadcast={id:id,title:'TPI-028 Firefox',description:'Disposable scene shortcut test',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Main scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify([{id:'intro',kind:'intro',title:'Intro Video',sceneId:'intro',opening:true},{id:'music:after-intro',kind:'music',title:'Background Music',sceneId:'after-intro'},{id:'outro',kind:'outro',title:'Outro Video',sceneId:'outro',closing:true}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.removeItem('studioflow.sceneMusicAssignments');", `tpi-028-${Date.now()}`);
  await enterStudio();

  await upload('[data-tpi-video-card="0"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("Intro Video assignment", async () => (await count('[data-tpi-video-card="0"].assigned')) === 1);
  await upload('[data-tpi-video-card="1"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("Outro Video assignment", async () => (await count('[data-tpi-video-card="1"].assigned')) === 1);
  await upload('[data-tpi-video-card="4"] [data-tpi-video-action="upload"]', "video/", videoFile);
  await waitFor("general Video Clip assignment", async () => (await count('[data-tpi-video-card="4"].assigned')) === 1);
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
  await waitFor("Background Music assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1);

  check("Intro Video shortcut exists", await count('[data-tpi-scene-id="intro"]') === 1);
  check("Outro Video shortcut exists", await count('[data-tpi-scene-id="outro"]') === 1);
  check("After Intro shortcut exists", await count('[data-tpi-scene-music-for="after-intro"]') === 1, `legacy=${await count('[data-tpi-scene-music-for="intro"]')}`);

  const afterIntro = (await driver.findElements(By.css('[data-tpi-scene-music-for="after-intro"]')))[0];
  if (afterIntro) {
    await afterIntro.click();
    await waitFor("After Intro assignment menu", async () => (await count(".tpi-scene-music-menu")) === 1);
    const musicChoice = (await driver.findElements(By.xpath("//div[contains(@class,'tpi-scene-music-menu')]//button[contains(., 'tpi-021-music')]")))[0];
    if (musicChoice) await musicChoice.click();
    await waitFor("After Intro assignment", async () => Boolean(await js("return JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro'];")));
    await afterIntro.click();
    await sleep(500);
    check("After Intro click plays assigned Background Music", await musicPlayingCount() === 1);
    check("After Intro click preserves independent active scene", await activeSceneId() === "scene-1");
  }
  check("After Intro music shortcut never mounts stage video", await count(".program-stage > video.stage-video:not(.tpi-video-clip-stage-video)") === 0);

  // Test A — Intro Video first click starts playback of the Video Clips asset.
  await click('[data-tpi-scene-id="intro"]');
  await waitFor("Intro Video playback", async () => {
    const state = await stageClipState();
    return state && !state.paused && state.currentTime > 0.05;
  }, 10_000);
  const introFirst = await stageClipState();
  check("Intro Video starts playback on first click", Boolean(introFirst) && introFirst.paused === false && introFirst.currentTime > 0.05, JSON.stringify(introFirst));
  check("Intro Video selects only Intro", await activeSceneId() === "intro");
  check("Intro Video resolves the assigned Video Clips asset", Boolean(introFirst?.src) && (await count(".stage-scene-placeholder")) === 0, JSON.stringify(introFirst));
  check("Intro Video does not leave After Intro music playing", await musicPlayingCount() === 0);

  // Test B — second click stops playback and restores the previous scene without
  // activating the After Intro / Background Music shortcut.
  await click('[data-tpi-scene-id="intro"]');
  await waitFor("Intro Video stop", async () => (await activeSceneId()) === "scene-1", 8_000);
  await sleep(300);
  check("Second Intro Video click stops playback", (await stageClipState()) === null || (await stageClipState()).paused === true);
  check("Stopping Intro Video restores the previous production scene", await activeSceneId() === "scene-1");
  check("Stopping an individual Intro preview does not start After Intro music", await musicPlayingCount() === 0);

  // Test C — every subsequent playback restarts at 00:00 and progresses.
  await click('[data-tpi-scene-id="intro"]');
  await waitFor("Intro Video restart", async () => {
    const state = await stageClipState();
    return state && !state.paused;
  }, 10_000);
  const introRestart = await stageClipState();
  check("Intro Video restarts at 00:00", Boolean(introRestart) && introRestart.currentTime <= 0.75, JSON.stringify(introRestart));
  await sleep(700);
  const introAdvanced = await stageClipState();
  check("Intro Video playback progresses", Boolean(introAdvanced) && introAdvanced.currentTime > (introRestart?.currentTime ?? 0), JSON.stringify({ introRestart, introAdvanced }));

  // Addendum A — the After Intro music control is independent of the Intro
  // Video: playing it must not restart, stop, or reset the Intro clip.
  const introBeforeMusic = await stageClipState();
  await click('[data-tpi-scene-music-for="after-intro"]');
  await sleep(500);
  const introAfterMusic = await stageClipState();
  check("After Intro music playback does not restart the Intro Video", Boolean(introBeforeMusic && introAfterMusic) && introAfterMusic.paused === false && introAfterMusic.currentTime >= (introBeforeMusic.currentTime ?? 0), JSON.stringify({ introBeforeMusic, introAfterMusic }));
  check("After Intro music shortcut plays its assigned track without leaving the Intro scene", await musicPlayingCount() === 1 && await activeSceneId() === "intro");
  await click('[data-tpi-audio-stop="music"]');
  await sleep(300);
  check("Stop music leaves the Intro Video running", (await stageClipState())?.paused === false);

  // Test D/E — Outro Video first click plays its own clip; Intro and Outro never overlap.
  await click('[data-tpi-scene-id="outro"]');
  await waitFor("Outro Video playback", async () => {
    const state = await stageClipState();
    return state && !state.paused && state.currentTime > 0.05 && (await activeSceneId()) === "outro";
  }, 10_000);
  const outroFirst = await stageClipState();
  check("Outro Video starts playback on first click", Boolean(outroFirst) && outroFirst.paused === false && outroFirst.currentTime > 0.05, JSON.stringify(outroFirst));
  check("Intro and Outro never overlap on the stage", await count(".program-stage > video.stage-video:not(.tpi-video-clip-stage-video)") === 1);
  check("Outro Video resolves the assigned Video Clips asset", Boolean(outroFirst?.src) && (await count(".stage-scene-placeholder")) === 0, JSON.stringify(outroFirst));
  check("Outro Video does not activate Intro or After Intro", await activeSceneId() === "outro" && await musicPlayingCount() === 0);

  // Test B (Outro) — second click stops and restores.
  await click('[data-tpi-scene-id="outro"]');
  await waitFor("Outro Video stop", async () => (await activeSceneId()) === "scene-1", 8_000);
  await sleep(300);
  check("Second Outro Video click stops playback and restores the previous scene", await activeSceneId() === "scene-1" && ((await stageClipState()) === null || (await stageClipState()).paused === true));
  check("Recording and livestream controls remain independent", await js("var go=document.querySelector('.go-live-button'), rec=document.querySelector('.record-button'); return Boolean(go && rec && go.textContent.trim()==='Go live' && rec.textContent.trim()==='Record');"));

  // Test — natural completion stops, resets, and restores the production scene.
  await click('[data-tpi-scene-id="intro"]');
  await waitFor("Intro Video activation before completion", async () => (await activeSceneId()) === "intro", 8_000);
  await waitFor("Intro Video natural completion", async () => (await activeSceneId()) === "scene-1", 25_000);
  await sleep(300);
  check("Natural completion resets controls and restores the production scene", await activeSceneId() === "scene-1" && ((await stageClipState()) === null || (await stageClipState()).paused === true));
  check("Sol's approved automatic After Intro playback runs when the Intro Video finishes", await musicPlayingCount() === 1);

  // Test — Background Music card playback remains its own independent system.
  const musicCard = (await driver.findElements(By.css('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')))[0];
  await musicCard.click();
  await sleep(400);
  check("Background Music card still plays independently", await musicPlayingCount() === 1);
  check("Background Music has one active playback card", await musicPlayingCount() === 1);

  // Test H — existing Video Clips stage playback remains functional.
  await click('[data-tpi-video-card="4"]');
  await waitFor("general clip stage playback", async () => (await count(".program-stage video.tpi-video-clip-stage-video")) === 1, 8_000);
  check("Existing Video Clips playback remains functional", await count(".program-stage video.tpi-video-clip-stage-video") === 1);

  // Test G — persistence restores the independent assignments after reload.
  const persisted = await js("return {assignments:JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}'), music:JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots')||'[]').filter(Boolean).length};");
  check("After Intro assignment persists independently", Boolean(persisted.assignments?.["after-intro"]) && !persisted.assignments?.intro);
  check("Background Music assignment persists", persisted.music === 1);
  await driver.navigate().refresh();
  await waitFor("scene shortcuts after reload", async () => (await count('[data-tpi-scene-music-for="after-intro"]')) === 1);
  check("After Intro shortcut restores after reload", await count('[data-tpi-scene-music-for="after-intro"]') === 1);
  check("Reload does not auto-start Intro playback", (await activeSceneId()) !== "intro" && (await activeSceneId()) !== "outro");
} catch (error) {
  check("Firefox interaction test completed", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", evidenceRoot, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

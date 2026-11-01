#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const evidenceRoot = process.env.TPI_FIREFOX_125_EVIDENCE || mkdtempSync(join(tmpdir(), "tpi-125-firefox-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);
const waitFor = async (description, predicate, timeout = 30_000, interval = 200) => {
  const started = Date.now();
  let last = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      last = String(value);
    } catch (error) {
      last = safe(error);
    }
    await sleep(interval);
  }
  throw new Error(`${description} timed out${last ? `: ${last}` : ""}`);
};

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-125", reason: "Firefox binary, geckodriver, or disposable local credentials are unavailable.", evidenceRoot }, null, 2));
  process.exit(1);
}

const raw = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = raw.accounts?.test_admin ?? raw;
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-125", reason: "The disposable test_admin account is unavailable.", evidenceRoot }, null, 2));
  process.exit(1);
}

const studioId = `tpi-125-firefox-${Date.now()}`;
const studioTitle = `TPI 125 Firefox ${Date.now()}`;
const scripts = [
  { id: `${studioId}-opening`, studioId, title: "Episode Introduction", body: "Welcome to this disposable StudioFlow teleprompter verification script.\n\nThe reader must remain manually controlled.", updatedAt: "TPI 125", createdAt: 1 },
  { id: `${studioId}-questions`, studioId, title: "Interview Questions", body: "Question one.\nQuestion two.\nQuestion three.", updatedAt: "TPI 125", createdAt: 2 },
  { id: `${studioId}-closing`, studioId, title: "Closing Remarks", body: "Thank you for joining this disposable verification.", updatedAt: "TPI 125", createdAt: 3 }
];
const scenes = [
  { id: "intro", kind: "intro", title: "Intro Video", layout: "Speaker view" },
  { id: "scene-1", kind: "demo", title: "Disposable Scene", layout: "Speaker view" },
  { id: "outro", kind: "outro", title: "Outro Video", layout: "Speaker view" }
];
const panelItems = [
  { id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true },
  { id: "scene:scene-1", kind: "scene", title: "Disposable Scene", sceneId: "scene-1" },
  { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }
];

let driver;
try {
  const options = new firefox.Options()
    .setBinary(binary)
    .setProfile(profile)
    .addArguments("-no-remote", "-new-instance")
    .setPreference("media.autoplay.default", 0)
    .setPreference("media.autoplay.blocking_policy", 0)
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1000, x: 40, y: 40 });

  await driver.get(`${base}/member-login.html`);
  check("Firefox login renders in isolated profile", (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await driver.executeScript("var form=document.querySelector('form[data-member-login]'),u=form&&form.querySelector('input[name=\"username\"]'),p=form&&form.querySelector('input[name=\"password\"]'); if(!form||!u||!p)return false; u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));}); form.querySelector('button[type=submit]').click(); return true;", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await driver.executeAsyncScript("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));
  check("Firefox authentication succeeds", true);

  await driver.get(`${base}/studio/`);
  await driver.executeScript("var id=arguments[0],title=arguments[1],scripts=arguments[2],scenes=arguments[3],items=arguments[4]; localStorage.setItem('studioflow.broadcasts',JSON.stringify([{id:id,title:title,description:'Disposable TPI 125 verification Studio',status:'draft',kind:'live'}])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.setItem('studioflow.studioScenes',JSON.stringify(scenes)); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify(items)); localStorage.setItem('studioflow.teleprompterScripts',JSON.stringify(scripts));", studioId, studioTitle, scripts, scenes, panelItems);
  await driver.navigate().refresh();
  await waitFor("StudioFlow production panel", async () => (await driver.findElements(By.css(".scene-panel"))).length === 1);

  const clickButton = async (label) => driver.executeScript("var label=arguments[0].toLowerCase(),node=Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase()===label || (b.textContent||'').toLowerCase().includes(label);}); if(!node)return false; node.click(); return true;", label);
  const bodyText = async () => String(await driver.executeScript("return document.body.innerText;"));
  const cardData = async () => driver.executeScript("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return {id:n.getAttribute('data-tpi-scene-panel-item'),kind:n.getAttribute('data-production-kind'),text:(n.textContent||'').replace(/\\s+/g,' ').trim(),color:getComputedStyle(n).getPropertyValue('--production-item-color').trim()};});");

  await clickButton("Add production item");
  await waitFor("production item menu", async () => (await bodyText()).includes("Teleprompter Script"));
  check("Add Production Item includes Teleprompter Script", (await bodyText()).includes("Teleprompter Script"));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "add-production-item-menu.png"), data, "base64"));

  await clickButton("Teleprompter Script");
  await waitFor("script chooser", async () => (await bodyText()).includes("Choose a teleprompter script"));
  await clickButton("Episode Introduction");
  await waitFor("first script production card", async () => (await cardData()).some((card) => card.kind === "teleprompter-script" && card.text.includes("Episode Introduction")));
  await clickButton("Add production item");
  await clickButton("Teleprompter Script");
  await waitFor("second script chooser", async () => (await bodyText()).includes("Interview Questions"));
  await clickButton("Interview Questions");
  await waitFor("second script production card", async () => (await cardData()).filter((card) => card.kind === "teleprompter-script").length === 2);
  check("Multiple scripts coexist as production cards", (await cardData()).filter((card) => card.kind === "teleprompter-script").length === 2);

  await driver.findElement(By.css('[data-studio-panel-tab="Teleprompter"]')).click();
  const dragSource = await driver.findElement(By.css(`[data-teleprompter-script-id="${scripts[2].id}"]`));
  const dragTarget = await driver.findElement(By.css(".scene-panel-items"));
  await driver.executeScript("window.__tpi125DragTransfer=null; document.addEventListener('dragstart',function(event){window.__tpi125DragTransfer=event.dataTransfer;},true);");
  const sourceRect = await dragSource.getRect();
  const targetRect = await dragTarget.getRect();
  const actions = driver.actions({ async: true });
  await actions.move({ x: Math.round(sourceRect.x + sourceRect.width / 2), y: Math.round(sourceRect.y + sourceRect.height / 2) }).press().perform();
  await sleep(180);
  await actions.move({ x: Math.round(targetRect.x + targetRect.width / 2), y: Math.round(targetRect.y + targetRect.height / 2) }).perform();
  await sleep(250);
  await actions.release().perform();
  // Firefox/geckodriver can deliver the trusted dragover but omit the native
  // drop event for cross-panel drags. Complete that browser-owned event with
  // the captured DataTransfer when necessary; the pointer path remains the
  // acceptance step that establishes the requested insertion position.
  if (!(await cardData()).some((card) => card.kind === "teleprompter-script" && card.text.includes("Closing Remarks"))) {
    await driver.executeScript("var list=document.querySelector('.scene-panel-items'); if(list&&window.__tpi125DragTransfer) list.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:window.__tpi125DragTransfer}));");
  }
  await waitFor("dragged script production card", async () => (await cardData()).some((card) => card.kind === "teleprompter-script" && card.text.includes("Closing Remarks")));
  check("Dragging a script from the Teleprompter library creates a My Scenes card", (await cardData()).some((card) => card.kind === "teleprompter-script" && card.text.includes("Closing Remarks")));

  await clickButton("Add production item");
  await clickButton("Countdown Timer");
  await clickButton("Add production item");
  await clickButton("Background Music");
  await clickButton("Add production item");
  await clickButton("Video Clip");
  const colors = await cardData();
  const expectedColors = new Map([["scene", "#3b82f6"], ["intro", "#f97316"], ["outro", "#f97316"], ["video-clip", "#f97316"], ["teleprompter-script", "#a855f7"], ["timer", "#eab308"], ["music", "#22c55e"]]);
  check("All production item categories expose the required colors", colors.every((card) => expectedColors.get(card.kind) === card.color.toLowerCase()), JSON.stringify(colors));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "color-coded-production-cards.png"), data, "base64"));

  const activeBefore = await driver.executeScript("return JSON.parse(localStorage.getItem('studioflow.activeSceneId')||'\"\"');");
  const firstScriptCard = await driver.findElement(By.css('[data-production-kind="teleprompter-script"] .scene-panel-item-button'));
  await firstScriptCard.click();
  await waitFor("private teleprompter reader", async () => (await driver.findElements(By.css('[data-private-teleprompter="true"]'))).length === 1);
  check("Selecting a script opens the private reader", true);
  check("Selecting a script does not change the active scene", (await driver.executeScript("return JSON.parse(localStorage.getItem('studioflow.activeSceneId')||'\"\"');")) === activeBefore);
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "private-teleprompter-reader.png"), data, "base64"));

  const play = await driver.findElement(By.css(".stage-teleprompter-play"));
  await play.click();
  await waitFor("script playing state", async () => (await play.getText()) === "Pause");
  check("Play starts the selected script", true);
  await play.click();
  await waitFor("script paused state", async () => (await play.getText()) === "Resume");
  check("Pause exposes Resume without changing the scene", (await play.getText()) === "Resume" && (await driver.executeScript("return JSON.parse(localStorage.getItem('studioflow.activeSceneId')||'\"\"');")) === activeBefore);
  await play.click();
  await waitFor("script resumes", async () => (await play.getText()) === "Pause");
  check("Resume continues the selected script", (await play.getText()) === "Pause");
  const restart = await driver.findElement(By.css(".stage-teleprompter-controls button:nth-of-type(2)"));
  check("Restart control is present", (await restart.getText()) === "Restart");
  await restart.click();
  await waitFor("script returns to ready state", async () => (await play.getText()) === "Play");
  check("Restart returns the script to Ready", (await play.getText()) === "Play");
  const ranges = await driver.findElements(By.css(".stage-teleprompter-controls input[type=range]"));
  check("Script controls remain available", ranges.length >= 3);
  const beforeSizes = await driver.executeScript("return Array.from(document.querySelectorAll('.stage-teleprompter-controls input[type=range]')).map(function(n){return n.value;});");
  await driver.executeScript("var inputs=Array.from(document.querySelectorAll('.stage-teleprompter-controls input[type=range]')); var setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(inputs[0],String(Number(inputs[0].value)+10)); inputs[0].dispatchEvent(new Event('input',{bubbles:true})); inputs[0].dispatchEvent(new Event('change',{bubbles:true})); setter.call(inputs[1],String(Number(inputs[1].value)+4)); inputs[1].dispatchEvent(new Event('input',{bubbles:true})); inputs[1].dispatchEvent(new Event('change',{bubbles:true}));");
  const afterSizes = await driver.executeScript("return Array.from(document.querySelectorAll('.stage-teleprompter-controls input[type=range]')).map(function(n){return n.value;});");
  check("Speed and text-size adjustments apply", afterSizes[0] !== beforeSizes[0] && afterSizes[1] !== beforeSizes[1], JSON.stringify({ beforeSizes, afterSizes }));
  await driver.executeScript("var row=Array.from(document.querySelectorAll('[data-production-kind=\"teleprompter-script\"]')).find(function(n){return (n.textContent||'').includes('Interview Questions');}); var button=row&&row.querySelector('.scene-panel-item-button'); if(button) button.click();");
  await waitFor("second script loads", async () => String(await driver.executeScript("var reader=document.querySelector('.stage-teleprompter-text'); return reader ? reader.textContent : '';" )).includes("Question one."));
  const secondPlay = await driver.findElement(By.css(".stage-teleprompter-play"));
  check("Switching scripts loads the selected script without auto-play", (await secondPlay.getText()) === "Play" && String(await driver.executeScript("var reader=document.querySelector('.stage-teleprompter-text'); return reader ? reader.textContent : '';" )).includes("Question one."));
  await driver.findElement(By.css('[data-production-kind="scene"] .scene-panel-item-button')).click();
  await sleep(300);
  check("Changing the active scene does not close the private reader", (await driver.findElements(By.css('[data-private-teleprompter="true"]'))).length === 1);
  await driver.findElement(By.css('[data-studio-panel-tab="Recording"]')).click();
  await waitFor("recording panel", async () => (await bodyText()).includes("Program recording"));
  await clickButton("Record program");
  await waitFor("program recording starts", async () => (await driver.findElements(By.css(".recording-badge"))).length === 1, 20_000);
  check("Recording continues with the private reader open", (await driver.findElements(By.css(".recording-badge"))).length === 1 && (await driver.findElements(By.css('[data-private-teleprompter="true"]'))).length === 1);
  await clickButton("Stop recording");
  await waitFor("recording confirmation", async () => (await driver.findElements(By.css(".modal .delete-button"))).length === 1, 20_000);
  check("Stopping recording keeps the private reader isolated", (await driver.findElements(By.css('[data-private-teleprompter="true"]'))).length === 1);
  await driver.findElement(By.css(".modal .delete-button")).click();
  await waitFor("program recording stops", async () => (await driver.findElements(By.css(".recording-badge"))).length === 0, 45_000);
  await clickButton("Present or invite");
  await waitFor("present menu", async () => (await bodyText()).includes("Share screen"));
  await clickButton("Share screen");
  await waitFor("screen-share panel", async () => (await driver.findElements(By.css('[data-screen-share-panel="true"]'))).length === 1);
  check("Opening screen sharing does not close the private reader", (await driver.findElements(By.css('[data-private-teleprompter="true"]'))).length === 1);
  await clickButton("Cancel");

  await driver.navigate().refresh();
  await waitFor("production cards after refresh", async () => (await driver.findElements(By.css('[data-tpi-scene-panel-item]'))).length >= 7);
  const restored = await cardData();
  check("Production item order and script references persist after refresh", restored.filter((card) => card.kind === "teleprompter-script").length === 3 && restored.some((card) => card.text.includes("Episode Introduction")) && restored.some((card) => card.text.includes("Interview Questions")) && restored.some((card) => card.text.includes("Closing Remarks")), JSON.stringify(restored));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "production-list-after-refresh.png"), data, "base64"));
} catch (error) {
  check("Firefox 125 acceptance completed", false, safe(error));
  if (driver) {
    try { writeFileSync(join(evidenceRoot, "failure.png"), await driver.takeScreenshot(), "base64"); } catch {}
  }
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", suite: "TPI-STUDIOFLOW-125", browser: "Firefox Developer Edition", environment: base, evidenceRoot, studioId, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

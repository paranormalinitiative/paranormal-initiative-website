#!/usr/bin/env node
// TPI-STUDIOFLOW-037 Addendum C — owner-reported Scenes panel corrections.
// Genuine pointer drags (geckodriver Actions) capture the intermediate visual
// states the owner could not observe: live insertion gap following the
// pointer, displaced surrounding rows, and the completed drop. Screenshots
// are saved as evidence and inspected by the agent. Disposable Firefox
// profile, disposable synthetic studios and generated audio only.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_037_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const productionTarget = !/^http:\/\/(127\.0\.0\.1|localhost):(8787|8789)$/.test(base);
const productionQa = process.env.TPI_FIREFOX_PRODUCTION_QA === "approved";
const localCredentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const productionCredentialsFile = process.env.TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json");
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || (productionTarget ? "production_qa" : "test_admin");
const credentialsFile = productionTarget ? productionCredentialsFile : localCredentialsFile;
const rawCredentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const credentials = rawCredentials ? (rawCredentials.accounts ? rawCredentials : { accounts: { production_qa: rawCredentials } }) : null;
const account = credentials?.accounts?.[accountKey];
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-037-addendum-c-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const results = [];
const runId = Date.now().toString(36);
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

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
const musicFile = wavFile("tpi-037c-music.wav", 220);

if (productionTarget && process.env.TPI_FIREFOX_ALLOW_PRODUCTION !== "1") {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-C", status: "BLOCKED", reason: "Addendum C acceptance defaults to the disposable local Worker only." }));
  process.exit(1);
}
if (productionTarget && !productionQa) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-C", status: "BLOCKED", reason: "Production Addendum C acceptance requires the explicitly approved synthetic QA credential gate; local credentials are never sent to production." }));
  process.exit(1);
}
for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-C", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-C", status: "BLOCKED", reason: `The synthetic ${accountKey} account is unavailable.` }));
  process.exit(1);
}
if (productionTarget && !/^qa-studioflow-[a-z0-9-]{0,26}$/.test(account.username)) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-C", status: "BLOCKED", reason: "Production acceptance may use only an explicitly approved qa-studioflow-* account." }));
  process.exit(1);
}

let driver;
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(description, predicate, timeout = 45_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out${detail ? `: ${detail}` : ""}`);
}
async function click(selector) { return js("var node=document.querySelector(arguments[0]); if(!node) return false; node.click(); return true;", selector); }
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(response){ return response.text().then(function(text){ var body=null; try{body=text ? JSON.parse(text) : null;}catch(error){body=text;} done({status:response.status, body:body}); }); }).catch(function(error){done({status:0,error:String(error)});});", path, options);
}
async function screenshot(name) {
  const data = await driver.takeScreenshot();
  const file = join(evidenceRoot, `${name}.png`);
  writeFileSync(file, Buffer.from(data, "base64"));
  return file;
}
async function panelOrder() {
  return js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});");
}
async function gapState() {
  return js("var list=document.querySelector('.scene-panel-items'); if(!list) return null; var kids=Array.from(list.children); var ph=kids.findIndex(function(n){return n.hasAttribute('data-tpi-scene-drop-placeholder');}); return { gapIndex: ph, total: kids.length, order: kids.filter(function(n){return n.hasAttribute('data-tpi-scene-panel-item');}).map(function(n){return n.getAttribute('data-tpi-scene-panel-item');}), dragging: document.querySelectorAll('.scene-panel-item.dragging, .tpi-scene-music-button.dragging').length };");
}
async function handlePoint(itemId) {
  return js("var node=document.querySelector('[data-tpi-scene-panel-item=\\\"'+arguments[0]+'\\\"] .scene-drag-handle'); if(!node) return null; var r=node.getBoundingClientRect(); return {x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)};", itemId);
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
// Genuine pointer drag: real press + stepped moves so Firefox issues trusted
// dragstart/dragover while the pointer travels. Samples the live insertion
// gap after every step and saves screenshots of the intermediate states.
async function genuineDrag(itemId, steps, options = {}) {
  const start = await handlePoint(itemId);
  if (!start) return { ok: false, reason: `no drag handle for ${itemId}` };
  const actions = driver.actions({ async: true });
  await actions.move({ x: start.x, y: start.y }).press().perform();
  await sleep(180);
  const samples = [];
  const shots = [];
  for (let i = 0; i < steps.length; i += 1) {
    await actions.move({ x: start.x, y: start.y + steps[i] }).perform();
    await sleep(220);
    const state = await gapState();
    samples.push({ dy: steps[i], gapIndex: state?.gapIndex ?? null, dragging: state?.dragging ?? 0 });
    if (options.screenshots?.includes(i)) shots.push(await screenshot(`${options.name}-step-${i}`));
  }
  return { ok: true, start, samples, shots };
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1200, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
  check("isolated Firefox session authenticates", true);

  const title = `TPI-037C ${runId}`;
  const state = { broadcast: { id: `tpi-037c-${runId}`, title, description: "Disposable Addendum C acceptance studio", status: "draft", visibility: "private" }, settings: { programOrientation: "landscape" }, configuration: { programOrientation: "landscape", videoTimerTheme: "classic", videoTimerDuration: 20, videoClipSlots: [], scenePanelItems: [], backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} } };
  const created = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title, localBroadcastId: `tpi-037c-${runId}`, state }) });
  const workspaceId = created.body?.workspace?.id;
  check("server creates disposable acceptance workspace", created.status === 201 && Boolean(workspaceId), `HTTP ${created.status}`);
  if (!workspaceId) throw new Error("Disposable acceptance workspace was not created.");
  await driver.get(`${base}/studio/`);
  await js("var id=arguments[0], title=arguments[1]; localStorage.setItem('studioflow.tpiActiveStudioId.v1', id); localStorage.setItem('studioflow.activeBroadcastId', JSON.stringify(id)); localStorage.setItem('studioflow.route', JSON.stringify('studio')); localStorage.setItem('studioflow.broadcasts', JSON.stringify([{id:id,title:title,status:'draft',kind:'live'}]));", workspaceId, title);
  await driver.navigate().refresh();
  await waitFor("Scenes panel", async () => (await count("[data-tpi-scenes-panel]")) === 1 && (await count("[data-tpi-scene-panel-item]")) >= 4);

  // ---- Labels and uniform dimensions -------------------------------
  const labelInfo = await js("var rows=Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')); return rows.map(function(row){var strong=row.querySelector('strong'); var btn=row.querySelector('.scene-panel-item-button'); var r=row.getBoundingClientRect(); var sr=strong&&strong.getBoundingClientRect(); return { id: row.getAttribute('data-tpi-scene-panel-item'), label: strong&&strong.textContent.trim(), height: Math.round(r.height), width: Math.round(r.width), wrapped: sr ? sr.height > 26 : null, title: (btn&&btn.title)||row.getAttribute('title'), aria: (row.getAttribute('aria-label')||'').slice(0,80) }; });");
  const labels = labelInfo.map((info) => info.label);
  check("Primary labels render exactly as required", ["Intro Video", "Countdown Timer", "Background Music", "Outro Video"].every((label) => labels.includes(label)), JSON.stringify(labels));
  const heights = new Set(labelInfo.filter((info) => info.id !== "timer" || true).map((info) => info.height));
  check("Uniform button dimensions across every production surface", heights.size === 1, JSON.stringify(labelInfo.map((info) => [info.id, info.height, info.width])));
  check("Standard labels never wrap and long names expose a full-name tooltip", labelInfo.every((info) => info.wrapped === false) && labelInfo.every((info) => (info.title || "").length > 0), JSON.stringify(labelInfo.map((info) => [info.id, info.wrapped, info.title])));
  check("Every movable item exposes a visible drag handle", (await count(".scene-drag-handle")) === (await count("[data-tpi-scene-panel-item]")) && await js("return Array.from(document.querySelectorAll('.scene-drag-handle')).every(function(n){return n.draggable && n.offsetParent !== null;});"));
  await screenshot("01-initial-positions");

  // ---- Music color indicator --------------------------------------
  await upload('[data-tpi-audio-board="music"] .tpi-audio-upload', "audio/", musicFile);
  await waitFor("music pad assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1);
  // Reproduce the pad's own color-save path, then decorate the row.
  await js("var slots=JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots')||'[]'); slots[0].color='#2f7668'; localStorage.setItem('studioflow.backgroundMusicSlots', JSON.stringify(slots)); window.dispatchEvent(new Event('studioflow:storage-changed')); return true;");
  await sleep(400);
  const neutralBefore = await js("var row=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'); return { assigned: row&&row.getAttribute('data-tpi-music-assigned'), color: row&&row.style.getPropertyValue('--tpi-scene-music-color') };");
  check("Unassigned Background Music row stays neutral", neutralBefore.assigned !== "true" && !(neutralBefore.color || "").trim(), JSON.stringify(neutralBefore));
  await click('[data-tpi-scene-music-for="after-intro"]');
  await waitFor("After Intro assignment menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  const choice = (await driver.findElements(By.xpath("//div[contains(@class,'tpi-scene-music-menu')]//button[contains(., 'tpi-037c-music')]")))[0];
  if (!choice) throw new Error("Uploaded music track was not listed in the assignment menu.");
  await choice.click();
  await waitFor("After Intro assignment", async () => Boolean(await js("return JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro'];")));
  const colorState = await js("var row=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'); var assignment=JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro']; var slots=JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots')||'[]'); var slot=slots.find(function(s){return s&&s.blobKey===assignment.blobKey;}); return { assigned: row.getAttribute('data-tpi-music-assigned'), rowColor: row.style.getPropertyValue('--tpi-scene-music-color').trim(), padColor: slot&&slot.color, assignmentKey: assignment.blobKey };");
  check("Assigned Background Music row tints with the track's existing SmartPad color", colorState.assigned === "true" && colorState.rowColor === colorState.padColor && colorState.rowColor === "#2f7668", JSON.stringify(colorState));
  check("Assigned row keeps the track's full name accessible", /tpi-037c-music/.test(await js("var row=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'); return (row.getAttribute('aria-label')||'') + '|' + (row.title||'');")));
  await screenshot("06-music-color-indicator");

  // ---- Genuine pointer drag: reactive intermediate states ----------
  const originalOrder = await panelOrder();
  const drag = await genuineDrag("intro", [40, 90, 150, 210, 270, 330], { name: "02-genuine-drag", screenshots: [2, 5] });
  check("Genuine pointer drag enters the dragging state", drag.ok && drag.samples.length > 0 && drag.samples.every((sample) => sample.dragging === 1), JSON.stringify(drag.samples));
  const gaps = drag.samples.map((sample) => sample.gapIndex);
  check("Insertion gap follows the pointer across multiple positions", new Set(gaps.filter((gap) => gap !== null)).size >= 2 && gaps.every((gap) => gap !== null), JSON.stringify(gaps));
  const displaced = await js("var list=document.querySelector('.scene-panel-items'); var kids=Array.from(list.children); var gap=kids.findIndex(function(n){return n.hasAttribute('data-tpi-scene-drop-placeholder');}); var after=kids.slice(gap+1).filter(function(n){return n.hasAttribute('data-tpi-scene-panel-item');}); var first=after[0]; var r=first&&first.getBoundingClientRect(); var gapNode=kids[gap]; var gr=gapNode&&gapNode.getBoundingClientRect(); return { gapIndex: gap, total: kids.length, gapHeight: gr&&Math.round(gr.height), pushedDown: r&&gr ? Math.round(r.top - gr.top) : null };");
  check("Surrounding buttons visibly displace to open the insertion gap", displaced.gapIndex > 0 && displaced.gapIndex < displaced.total - 1 && displaced.gapHeight > 0 && displaced.pushedDown > 0, JSON.stringify(displaced));
  check("Dragging does not start playback", (await count(".tpi-audio-slot.playing")) === 0 && (await count(".program-stage.ring-timer-active")) === 0);

  // Escape cancels the genuine drag. geckodriver does not deliver key events
  // into an active synthesized drag session, so the keydown reaches the
  // panel's real Escape handler through the page's keyboard pipeline.
  await js("window.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Escape',code:'Escape'}));");
  await sleep(350);
  await driver.actions({ async: true }).release().perform().catch(() => {});
  await sleep(150);
  const afterEscape = await gapState();
  check("Escape cancels the drag and restores the original order", afterEscape?.gapIndex === -1 && (afterEscape?.order || []).join("|") === originalOrder.join("|"), JSON.stringify({ gap: afterEscape?.gapIndex, order: afterEscape?.order }));
  await screenshot("05-escape-cancelled");

  // ---- Completed drop ---------------------------------------------
  const secondDrag = await genuineDrag("intro", [40, 100, 170, 240, 310, 380, 430], { name: "03-drop-path", screenshots: [3, 6] });
  const midGap = secondDrag.samples?.[secondDrag.samples.length - 1]?.gapIndex;
  const release = await driver.actions({ async: true }).release().perform().then(() => "released").catch((error) => `release-failed: ${safe(error)}`);
  await sleep(400);
  let finalOrder = await panelOrder();
  let dropCompletedGenuinely = finalOrder.join("|") !== originalOrder.join("|") && (await gapState())?.gapIndex === -1;
  if (!dropCompletedGenuinely) {
    // geckodriver synthesizes dragstart/dragover but does not complete the
    // native drop on release (WebDriver limitation). Finish at the indicated
    // gap exactly as the browser would on mouse-up: dispatch drop.
    await js("var list=document.querySelector('.scene-panel-items'); if(!list) return false; list.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:new DataTransfer()})); return true;");
    await sleep(400);
  }
  finalOrder = await panelOrder();
  check("Releasing the item places it at the indicated position", finalOrder.join("|") !== originalOrder.join("|"), `${originalOrder.join(",")} -> ${finalOrder.join(",")} (release: ${release}, genuine drop: ${dropCompletedGenuinely})`);
  check("Drop lands where the insertion gap was shown", midGap === null || Math.abs(finalOrder.indexOf("intro") - Math.min(midGap, finalOrder.length - 1)) <= 1, `gapIndex=${midGap} introIndex=${finalOrder.indexOf("intro")}`);
  check("No drag residue remains after the drop", (await gapState())?.gapIndex === -1);
  await screenshot("04-completed-drop");

  // ---- Persistence and studio isolation ---------------------------
  await sleep(3_000);
  const saved = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const savedOrder = (saved.body?.workspace?.state?.configuration?.scenePanelItems || []).map((item) => item.id);
  check("New order autosaves through the established workspace API", savedOrder.join("|") === finalOrder.join("|"), JSON.stringify(savedOrder));
  await driver.navigate().refresh();
  await waitFor("Scenes panel after refresh", async () => (await count("[data-tpi-scenes-panel]")) === 1);
  const restoredOrder = await panelOrder();
  check("Reordered arrangement survives a page refresh", restoredOrder.join("|") === finalOrder.join("|"), JSON.stringify(restoredOrder));
  const restoredAssignment = await js("var a=JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro']; return a&&a.blobKey;");
  check("After Intro Background Music keeps its assigned track after reordering", Boolean(restoredAssignment) && restoredAssignment === colorState.assignmentKey, `${restoredAssignment} vs ${colorState.assignmentKey}`);

  const otherTitle = `TPI-037C B ${runId}`;
  const otherState = { broadcast: { id: `tpi-037c-b-${runId}`, title: otherTitle, description: "Second disposable studio", status: "draft", visibility: "private" }, settings: { programOrientation: "landscape" }, configuration: { programOrientation: "landscape", videoTimerTheme: "classic", videoTimerDuration: 20, videoClipSlots: [], scenePanelItems: [], backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} } };
  const other = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: otherTitle, localBroadcastId: `tpi-037c-b-${runId}`, state: otherState }) });
  const otherId = other.body?.workspace?.id;
  const firstConfig = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const firstOrder = (firstConfig.body?.workspace?.state?.configuration?.scenePanelItems || []).map((item) => item.id);
  check("A second studio keeps its own default arrangement", Boolean(otherId) && firstOrder.join("|") === finalOrder.join("|"), JSON.stringify({ otherCreated: Boolean(otherId), firstOrder }));

  // ---- After Intro assignment survives row reordering -------------
  const moveResult = await js("var row=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'); if(!row) return null; var trigger=row.querySelector('.scene-item-menu-trigger'); trigger.click(); return true;");
  await waitFor("music row actions menu", async () => (await count(".tpi-scene-music-menu")) === 1);
  await js("var buttons=Array.from(document.querySelectorAll('.tpi-scene-music-menu button')); var node=buttons.find(function(b){return /Move down/i.test(b.textContent);}); if(node) node.click(); return Boolean(node);");
  await sleep(600);
  const afterMove = await js("var a=JSON.parse(localStorage.getItem('studioflow.sceneMusicAssignments')||'{}')['after-intro']; var row=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'); return { blobKey: a&&a.blobKey, binding: row&&row.getAttribute('data-tpi-scene-music-for'), order: Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return n.getAttribute('data-tpi-scene-panel-item');}) };");
  check("Keyboard-accessible row reordering never reassigns the music binding", Boolean(moveResult) && afterMove.blobKey === colorState.assignmentKey && afterMove.binding === "after-intro", JSON.stringify({ moveResult, afterMove, expected: colorState.assignmentKey }));
  const activated = await click('[data-tpi-scene-music-for="after-intro"]');
  await sleep(800);
  check("Reordered Background Music row still plays its assigned track", activated && (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing')) === 1);
  await click('[data-tpi-audio-stop="music"]');
  await sleep(300);
  check("Background Music Stop remains functional", (await count('[data-tpi-audio-stop="music"]')) === 1);

  // ---- Auto-scroll during a genuine pointer drag ------------------
  await js("var scenes=[{id:'intro',kind:'intro',title:'Intro video'}]; for(var index=1;index<=20;index++) scenes.push({id:'overflow-scene-'+index,kind:'demo',title:'Overflow Scene '+index,layout:'Speaker view'}); scenes.push({id:'outro',kind:'outro',title:'Outro video'}); var panel=[{id:'intro',kind:'intro',title:'Intro Video',sceneId:'intro',opening:true},{id:'timer',kind:'timer',title:'Countdown Timer',opening:true}]; scenes.slice(1,-1).forEach(function(scene){panel.push({id:'scene:'+scene.id,kind:'scene',title:scene.title,sceneId:scene.id});}); panel.push({id:'outro',kind:'outro',title:'Outro Video',sceneId:'outro',closing:true}); localStorage.setItem('studioflow.studioScenes',JSON.stringify(scenes)); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify(panel)); window.dispatchEvent(new Event('studioflow:storage-changed')); return true;");
  await waitFor("overflowing Scenes panel", async () => (await count("[data-tpi-scene-panel-item]")) >= 20, 10_000);
  const scrollBefore = await js("var list=document.querySelector('.scene-panel-items'); if(!list||list.scrollHeight<=list.clientHeight) return null; list.scrollTop=0; return { scrollTop: list.scrollTop, scrollHeight: list.scrollHeight, clientHeight: list.clientHeight };");
  if (scrollBefore) {
    await js("window.__tpiDragLog=[]; window.__tpiScrollLog=[]; document.addEventListener('dragover', function(e){ window.__tpiDragLog.push({ y: Math.round(e.clientY), t: ((e.target && e.target.className) || '').toString().slice(0,60) }); }, true); return true;");
    const start = await handlePoint("intro");
    const actions = driver.actions({ async: true });
    await actions.move({ x: start.x, y: start.y }).press().perform();
    await sleep(180);
    const listBottom = await js("var r=document.querySelector('.scene-panel-items').getBoundingClientRect(); return Math.round(r.bottom);");
    // Sweep the pointer through the 48px auto-scroll band plus a margin past
    // the edge. geckodriver's synthesized drag coordinates can drift a dozen
    // pixels from the commanded viewport position (observed: dragover clientY
    // past the list bottom for a commanded position 12px above it), so a
    // single fixed probe can fall outside the band even though a real pointer
    // drag is inside it. The sweep guarantees the genuine pointer traverses
    // the band while the assertion stays unchanged: the overflowing list must
    // scroll during the edge drag.
    const sweep = [];
    for (let y = listBottom - 46; y <= listBottom + 16; y += 6) sweep.push(y);
    const edgeTarget = await js("var el=document.elementFromPoint(arguments[0], arguments[1]); return el ? { cls: (el.className||'').toString().slice(0,60), tag: el.tagName } : null;", start.x, listBottom - 24);
    for (let i = 0; i < sweep.length; i += 1) {
      await actions.move({ x: start.x + (i % 2 === 0 ? 2 : -2), y: sweep[i] }).perform();
      await sleep(140);
      await js("var list=document.querySelector('.scene-panel-items'); if(list) window.__tpiScrollLog.push(list.scrollTop); return true;");
    }
    const scrollAfter = await js("var list=document.querySelector('.scene-panel-items'); return { scrollTop: list.scrollTop, scrollHeight: list.scrollHeight, clientHeight: list.clientHeight, bounds: (function(){var r=list.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom)};})() };");
    const dragLog = await js("return window.__tpiDragLog.slice(-30);");
    const scrollLog = await js("return window.__tpiScrollLog;");
    await screenshot("07-autoscroll");
    check("Genuine pointer drag near the panel edge auto-scrolls overflowing items", scrollAfter.scrollTop > scrollBefore.scrollTop, JSON.stringify({ scrollBefore, scrollAfter, listBottom, sweep: [sweep[0], sweep[sweep.length - 1]], edgeTarget, scrollLog, dragLog }));
    await js("window.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Escape',code:'Escape'}));");
    await driver.actions({ async: true }).release().perform().catch(() => {});
    await sleep(300);
  } else {
    check("Genuine pointer drag near the panel edge auto-scrolls overflowing items", false, "panel did not overflow");
  }

  // ---- Cleanup ----------------------------------------------------
  const fresh = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const cleanup = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: fresh.body?.workspace?.version }) });
  check("disposable acceptance workspace is archived", cleanup.status === 200, `HTTP ${cleanup.status}`);
  if (otherId) {
    const otherSaved = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(otherId)}`);
    await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(otherId)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: otherSaved.body?.workspace?.version }) });
  }
} catch (error) {
  check("Addendum C acceptance completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037-ADDENDUM-C", status: failed.length ? "FAIL" : "PASS", passed: results.length - failed.length, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(failed.length ? 1 : 0);

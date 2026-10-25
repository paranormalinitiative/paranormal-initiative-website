#!/usr/bin/env node
// TPI-STUDIOFLOW-037 — Scenes-panel structure, interaction, persistence, and
// shortcut ownership. Uses a disposable workspace and Firefox Developer Edition.
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_037_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = credentials?.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-037-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const results = [];
const runId = Date.now().toString(36);
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);
for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037", status: "BLOCKED", reason: "The synthetic test_admin account is unavailable." }));
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
try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1200, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
  check("isolated Firefox session authenticates", true);

  const title = `TPI-037 Scenes Panel ${runId}`;
  const localBroadcastId = `tpi-037-scenes-${runId}`;
  const state = { broadcast: { id: localBroadcastId, title, description: "Disposable Scenes panel regression studio", status: "draft", visibility: "private" }, settings: { programOrientation: "landscape" }, configuration: { programOrientation: "landscape", videoTimerTheme: "classic", videoTimerDuration: 20, videoClipSlots: [], scenePanelItems: [], backgroundMusicSlots: [], backgroundMusicLoop: true, sceneMusicAssignments: {} } };
  const created = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title, localBroadcastId, state }) });
  const workspaceId = created.body?.workspace?.id;
  check("server creates disposable Scenes workspace", created.status === 201 && Boolean(workspaceId), `HTTP ${created.status}`);
  if (!workspaceId) throw new Error("Disposable Scenes workspace was not created.");
  await driver.get(`${base}/studio/`);
  await js("var id=arguments[0], title=arguments[1]; localStorage.setItem('studioflow.tpiActiveStudioId.v1', id); localStorage.setItem('studioflow.activeBroadcastId', JSON.stringify(id)); localStorage.setItem('studioflow.route', JSON.stringify('studio')); localStorage.setItem('studioflow.broadcasts', JSON.stringify([{id:id,title:title,status:'draft',kind:'live'}]));", workspaceId, title);
  await driver.navigate().refresh();
  await waitFor("Scenes panel", async () => (await count('[data-tpi-scenes-panel]')) === 1 && (await count('[data-tpi-scene-panel-item]')) >= 4);
  const labels = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item] strong')).map(function(node){return node.textContent.trim();});");
  check("Scenes panel has uniform production items", labels.includes("Intro Video") && labels.includes("Countdown Timer") && labels.includes("Outro Video"), JSON.stringify(labels));
  check("Scenes panel has one item surface per persisted shortcut", await count("[data-tpi-scene-panel-item] button.scene-panel-item-button") === await count("[data-tpi-scene-panel-item]"));
  check("drag handles and context controls are visible", await count(".scene-drag-handle") >= 4 && await count(".scene-item-menu-trigger") >= 4);
  check("drag handles are the active drag sources", await js("return Array.from(document.querySelectorAll('.scene-drag-handle')).every(function(node){return node.draggable;});"));
  const sceneButtonMetrics = await js("var intro=document.querySelector('[data-tpi-scene-panel-item=\\\"intro\\\"]'), music=document.querySelector('[data-tpi-scene-music-for=\\\"after-intro\\\"]'), add=document.querySelector('.scene-panel-add-button'), sequence=document.querySelector('.scene-panel-rehearsal-button'), a=intro&&intro.getBoundingClientRect(), nodes=[music,add,sequence], rects=nodes.map(function(node){var r=node&&node.getBoundingClientRect(); return r&&{width:Math.round(r.width),height:Math.round(r.height)};}), style=music&&getComputedStyle(music), introStyle=intro&&getComputedStyle(intro), parent=intro&&intro.parentElement, parentStyle=parent&&getComputedStyle(parent); return {sameSize:rects.every(function(r){return r&&a&&r.width===Math.round(a.width)&&r.height===Math.round(a.height);}), rects:rects, introWidth:a&&Math.round(a.width), introCssWidth:introStyle&&introStyle.width, parentWidth:parent&&Math.round(parent.getBoundingClientRect().width), parentCssWidth:parentStyle&&parentStyle.width, parentOverflow:parentStyle&&parentStyle.overflow, borderStyle:style&&style.borderTopStyle, radius:style&&style.borderTopLeftRadius, primary:music?.querySelector('.tpi-scene-music-primary')?.textContent.trim(), secondary:music?.querySelector('.tpi-scene-music-secondary')?.textContent.trim(), iconColor:music?.querySelector('.tpi-scene-music-icon')&&getComputedStyle(music.querySelector('.tpi-scene-music-icon')).color, musicLabel:music?.getAttribute('aria-label')};");
  check("All Scenes production surfaces use the Intro Video dimensions", sceneButtonMetrics.sameSize, JSON.stringify(sceneButtonMetrics));
  check("Background Music uses a simplified label and accessible assignment details", sceneButtonMetrics.borderStyle === "solid" && sceneButtonMetrics.primary === "Background Music" && sceneButtonMetrics.secondary === "After Intro" && sceneButtonMetrics.iconColor === "rgb(117, 213, 255)" && /no track assigned/i.test(sceneButtonMetrics.musicLabel || ""), JSON.stringify(sceneButtonMetrics));

  const originalScenePanelOrder = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});");
  const dispatchDragStart = async (sourceId) => js("var source=document.querySelector('[data-tpi-scene-panel-item=\\\"'+arguments[0]+'\\\"] .scene-drag-handle'); if(!source||typeof DataTransfer==='undefined'||typeof DragEvent==='undefined') return false; var transfer=new DataTransfer(); window.__tpi037DragTransfer=transfer; source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:transfer})); return true;", sourceId);
  const dispatchDragOver = async (targetId) => js("var target=document.querySelector('[data-tpi-scene-panel-item=\\\"'+arguments[0]+'\\\"]'), transfer=window.__tpi037DragTransfer; if(!target||!transfer||typeof DragEvent==='undefined') return false; var rect=target.getBoundingClientRect(); target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,clientX:rect.left+8,clientY:rect.bottom-2,dataTransfer:transfer})); return true;", targetId);
  const sourceId = originalScenePanelOrder[0];
  const targetId = originalScenePanelOrder[originalScenePanelOrder.length - 1];
  const dragStarted = sourceId && targetId && sourceId !== targetId ? await dispatchDragStart(sourceId) : false;
  await sleep(250);
  const dragOverSent = dragStarted ? await dispatchDragOver(targetId) : false;
  await waitFor("live drag insertion placeholder", async () => dragStarted && (await count("[data-tpi-scene-drop-placeholder]")) === 1, 10_000).catch(() => {});
  check("dragging shows a live blue insertion placeholder", dragStarted && dragOverSent && await count("[data-tpi-scene-drop-placeholder]") === 1);
  await js("window.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Escape',code:'Escape'}));");
  await waitFor("drag cancellation", async () => (await count("[data-tpi-scene-drop-placeholder]")) === 0 && (await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});")).join('|') === originalScenePanelOrder.join('|'), 10_000).catch(() => {});
  const canceledOrder = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});");
  check("Escape cancels the drag and restores the original order", canceledOrder.join("|") === originalScenePanelOrder.join("|"));

  const committedDrag = sourceId && targetId && sourceId !== targetId ? await dispatchDragStart(sourceId) : false;
  await sleep(250);
  const committedDragOver = committedDrag ? await dispatchDragOver(targetId) : false;
  await waitFor("second live drag placeholder", async () => committedDrag && (await count("[data-tpi-scene-drop-placeholder]")) === 1, 10_000).catch(() => {});
  await js("var target=document.querySelector('[data-tpi-scene-panel-item=\\\"'+arguments[0]+'\\\"]'), transfer=new DataTransfer(); if(target) target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer})); return Boolean(target);", targetId);
  await waitFor("scene panel reorder", async () => {
    const order = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});");
    return order.join("|") !== originalScenePanelOrder.join("|") && (await count("[data-tpi-scene-drop-placeholder]")) === 0;
  }, 10_000).catch(() => {});
  const reorderedScenePanelOrder = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(node){return node.getAttribute('data-tpi-scene-panel-item');});");
  check("dropping places the item at the indicated position", committedDragOver && reorderedScenePanelOrder.join("|") !== originalScenePanelOrder.join("|"), `${originalScenePanelOrder} -> ${reorderedScenePanelOrder}`);
  check("dragging does not activate timer playback", await count(".program-stage.ring-timer-active .stage-ring-timer") === 0);
  await sleep(3_000);
  const savedAfterReorder = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const savedOrder = Array.isArray(savedAfterReorder.body?.workspace?.state?.configuration?.scenePanelItems)
    ? savedAfterReorder.body.workspace.state.configuration.scenePanelItems.map((item) => item.id)
    : [];
  check("scene reorder autosaves through the workspace API", savedOrder.join("|") === reorderedScenePanelOrder.join("|"), JSON.stringify(savedOrder));

  await js("var scenes=[{id:'intro',kind:'intro',title:'Intro video'}]; for(var index=1;index<=20;index++) scenes.push({id:'overflow-scene-'+index,kind:'demo',title:'Overflow Scene '+index,layout:'Speaker view'}); scenes.push({id:'outro',kind:'outro',title:'Outro video'}); var panel=[{id:'intro',kind:'intro',title:'Intro Video',sceneId:'intro',opening:true},{id:'timer',kind:'timer',title:'Countdown Timer',opening:true}]; scenes.slice(1,-1).forEach(function(scene){panel.push({id:'scene:'+scene.id,kind:'scene',title:scene.title,sceneId:scene.id});}); panel.push({id:'outro',kind:'outro',title:'Outro Video',sceneId:'outro',closing:true}); localStorage.setItem('studioflow.studioScenes',JSON.stringify(scenes)); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify(panel)); window.dispatchEvent(new Event('studioflow:storage-changed')); return panel.length;");
  await waitFor("overflowing Scenes panel", async () => (await count("[data-tpi-scene-panel-item]")) >= 20, 10_000);
  const autoScrollStart = await js("var list=document.querySelector('.scene-panel-items'); if(!list||list.scrollHeight<=list.clientHeight) return {overflow:false}; list.scrollTop=0; var source=document.querySelector('[data-tpi-scene-panel-item] .scene-drag-handle'), transfer=new DataTransfer(); window.__tpi037DragTransfer=transfer; source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:transfer})); return {overflow:true,scrollTop:list.scrollTop};");
  await sleep(250);
  await js("var list=document.querySelector('.scene-panel-items'), target=document.querySelector('[data-tpi-scene-panel-item]:last-of-type'), transfer=window.__tpi037DragTransfer; if(!list||!target||!transfer) return false; var bounds=list.getBoundingClientRect(); target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,clientX:bounds.left+8,clientY:bounds.bottom-4,dataTransfer:transfer})); return true;");
  await sleep(250);
  const autoScrollEnd = await js("var list=document.querySelector('.scene-panel-items'); return list ? {scrollTop:list.scrollTop,scrollHeight:list.scrollHeight,clientHeight:list.clientHeight} : null;");
  check("dragging near the panel edge auto-scrolls overflowing items", autoScrollStart?.overflow === true && autoScrollEnd?.scrollTop > autoScrollStart.scrollTop, JSON.stringify({autoScrollStart, autoScrollEnd}));
  await js("window.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Escape',code:'Escape'}));");

  await click('[data-tpi-scene-panel-item="timer"] .scene-panel-item-button');
  await waitFor("timer shortcut preview", async () => (await count(".program-stage.ring-timer-active .stage-ring-timer")) === 1);
  check("Countdown Timer shortcut uses the existing timer output", await count(".program-stage.ring-timer-active .stage-ring-timer") === 1);
  await click(".countdown-stop");
  await waitFor("timer preview stop", async () => (await count(".program-stage.ring-timer-active")) === 0);

  await click('[data-tpi-scene-panel-item="intro"] .scene-item-menu-trigger');
  await waitFor("intro context menu", async () => (await count(".scene-item-context-menu")) === 1);
  const menuText = await js("return document.querySelector('.scene-item-context-menu')?.innerText || '';" );
  check("Intro menu exposes only supported actions", /Preview/.test(menuText) && /Configure Opening/.test(menuText) && /Skip Opening/.test(menuText) && !/Duplicate/.test(menuText), menuText);
  await js("var buttons=Array.from(document.querySelectorAll('.scene-item-context-menu button')); var node=buttons.find(function(b){return b.textContent.includes('Skip Opening');}); if(node) node.click();");
  await sleep(3_000);
  const savedAfterSkip = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}`);
  const configAfterSkip = savedAfterSkip.body?.workspace?.state?.configuration || {};
  const introConfig = Array.isArray(configAfterSkip.scenePanelItems) ? configAfterSkip.scenePanelItems.find((item) => item.id === "intro") : null;
  check("Skip Opening persists through the established workspace API", introConfig?.skipped === true, JSON.stringify(configAfterSkip.scenePanelItems));

  await driver.navigate().refresh();
  await waitFor("Scenes panel after refresh", async () => (await count('[data-tpi-scenes-panel]')) === 1);
  check("skipped opening restores without deleting the item", await count('[data-tpi-scene-panel-item="intro"].skipped') === 1 && await count('[data-tpi-scene-panel-item="intro"]') === 1);
  await click('[data-tpi-scene-panel-item="intro"] .scene-panel-item-button');
  check("skipped opening remains non-playable until included", await count('[data-tpi-scene-panel-item="intro"] .scene-panel-item-button:disabled') === 1);

  const cleanup = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspaceId)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: savedAfterSkip.body?.workspace?.version }) });
  check("disposable Scenes workspace is archived", cleanup.status === 200, `HTTP ${cleanup.status}`);
} catch (error) {
  check("TPI-037 browser regression completed without a fatal error", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}
const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-037", status: failed.length ? "FAIL" : "PASS", passed: results.length - failed.length, total: results.length, evidenceRoot }, null, 2));
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
process.exit(failed.length ? 1 : 0);

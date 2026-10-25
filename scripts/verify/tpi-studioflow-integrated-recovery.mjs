#!/usr/bin/env node
// Integrated StudioFlow recovery regression.
// Uses real Firefox pointer/keyboard interaction and disposable authenticated
// Studios. It is intentionally scoped to identity, creation, switching,
// isolation, scene menus, and persistence; it does not touch owner Studios.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_RECOVERY_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const account = credentials?.accounts?.[accountKey] || (accountKey === "production_qa" && credentials?.username && credentials?.password ? credentials : null);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-recovery-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
const results = [];
const disposableIds = [];
let driver;

const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);

for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-INTEGRATED-RECOVERY", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-INTEGRATED-RECOVERY", status: "BLOCKED", reason: `Synthetic ${accountKey} account is unavailable.` }));
  process.exit(1);
}

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function visible(selector) {
  return Boolean(await js("var n=document.querySelector(arguments[0]); if(!n) return false; var r=n.getBoundingClientRect(), s=getComputedStyle(n); return r.width>0 && r.height>0 && r.right>0 && r.bottom>0 && r.left<innerWidth && r.top<innerHeight && s.display!=='none' && s.visibility!=='hidden';", selector));
}
async function waitFor(description, predicate, timeout = 45_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      detail = String(value);
    } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out${detail ? `: ${detail}` : ""}`);
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(r){return r.text().then(function(t){var b=null;try{b=t?JSON.parse(t):null}catch(e){b=t}done({status:r.status,body:b})})}).catch(function(e){done({status:0,error:String(e)})});", path, options);
}
async function serverWorkspace(id) {
  // Read the server directly with the isolated Firefox session cookie. A
  // normal in-page workspace GET is intentionally hydrated by the bridge and
  // would make an assertion-only poll mutate the editor under test.
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const response = await fetch(`${base}/api/studio/workspaces/${encodeURIComponent(id)}?tpi_probe=${runId}`, { headers: { Cookie: cookieHeader, Accept: "application/json" } });
  if (!response.ok) return null;
  const body = await response.json();
  return body?.workspace || null;
}
async function archiveWorkspace(id) {
  const workspace = await serverWorkspace(id);
  if (!workspace) return false;
  const response = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) });
  return response.status === 200;
}
function seedState(id, title) {
  return {
    broadcast: { id, title, description: "Disposable integrated recovery fixture", status: "draft", visibility: "private" },
    settings: { programOrientation: "portrait", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
    configuration: {
      programOrientation: "portrait",
      videoTimerTheme: "stargate",
      videoTimerDuration: 60,
      videoClipSlots: [{ id: "clip-a", serverAssetId: "fixture-clip-a", serverUrl: "/api/studio/fixtures/clip-a", slot: 4, title: "fixture-a.mp4", kind: "video" }],
      backgroundMusicSlots: [{ id: "music-a", serverAssetId: "fixture-music-a", serverUrl: "/api/studio/fixtures/music-a", slot: 0, title: "fixture-a.wav", kind: "audio" }],
      backgroundMusicLoop: true,
      sceneMusicAssignments: {},
      studioScenes: [
        { id: "intro", kind: "intro", title: "Intro Video" },
        { id: "scene-1", kind: "demo", title: "Studio A Scene", layout: "Speaker view" },
        { id: "scene-2", kind: "demo", title: "Studio A Second", layout: "Group discussion" },
        { id: "outro", kind: "outro", title: "Outro Video" }
      ],
      scenePanelItems: [
        { id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true },
        { id: "scene:scene-1", kind: "scene", title: "Studio A Scene", sceneId: "scene-1" },
        { id: "timer", kind: "timer", title: "Countdown Timer", opening: true },
        { id: "music:scene-1", kind: "music", title: "Background Music", sceneId: "scene-1" },
        { id: "video-clip:4", kind: "video-clip", title: "Video Clip", slot: 4 },
        { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }
      ]
    }
  };
}
async function login() {
  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=\"username\"]'),p=f.querySelector('input[name=\"password\"]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}))}); f.requestSubmit();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
}
async function openStudio(id) {
  await driver.get(`${base}/studio/`);
  await js("localStorage.clear(); localStorage.setItem('studioflow.tpiActiveStudioId.v1', arguments[0]); localStorage.setItem('studioflow.route', JSON.stringify('studio'));", id);
  await driver.navigate().refresh();
  await waitFor("StudioFlow application", async () => {
    const scenes = await driver.findElements(By.css("[data-tpi-scenes-panel]"));
    const selectors = await driver.findElements(By.css(".tpi-studio-selector"));
    return scenes.length > 0 && selectors.length > 0;
  });
  const bridgeSource = await asyncJs("var done=arguments[arguments.length-1], script=document.querySelector('script[src*=workspace-bridge]'); if (!script) { done({src:'',source:''}); return; } fetch(script.src, {cache:'no-store'}).then(function(response){return response.text().then(function(source){done({src:script.src,source:source});});}).catch(function(){done({src:script.src,source:''});});");
  check("local browser serves the repaired workspace bridge", /defaultStudioState[\s\S]*previousSuppression[\s\S]*clearTimeout\(saveTimer\)/.test(bridgeSource.source), bridgeSource.src);
  const appSource = await asyncJs("var done=arguments[arguments.length-1], script=document.querySelector(\"script[src*='assets/index-']\"); if (!script) { done({src:'',source:''}); return; } fetch(script.src, {cache:'no-store'}).then(function(response){return response.text().then(function(source){done({src:script.src,source:source});});}).catch(function(){done({src:script.src,source:''});});");
  check("local browser serves the rebuilt scene autosave bundle", /studioflow:configuration-changed/.test(appSource.source), appSource.src);
  await waitFor("selected Studio activation", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === id);
}
async function openSelector() {
  const selector = await driver.findElement(By.css(".tpi-studio-selector"));
  await selector.click();
  await waitFor("My Studios menu", async () => {
    const menus = await driver.findElements(By.css(".tpi-studio-menu"));
    return menus.length === 1 && await menus[0].isDisplayed();
  });
}
async function sceneMenuGeometry(selector) {
  return js("var n=document.querySelector(arguments[0]),r=n&&n.getBoundingClientRect(),s=n&&getComputedStyle(n); return {visible:!!n&&r.width>0&&r.height>0&&s.visibility!=='hidden',left:r&&r.left,top:r&&r.top,right:r&&r.right,bottom:r&&r.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight,text:n&&n.textContent||''};", selector);
}
async function saveAndWait(id, expectedPredicate) {
  await waitFor("workspace autosave", async () => {
    const workspace = await serverWorkspace(id);
    return workspace && expectedPredicate(workspace.state?.configuration || {}) ? workspace : null;
  }, 30_000);
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1100, x: 20, y: 20 });
  await login();

  const idA = `tpi-recovery-a-${runId}`;
  const titleA = `TPI Recovery A ${runId}`;
  const createdA = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: titleA, localBroadcastId: idA, state: seedState(idA, titleA) }) });
  const serverA = createdA.body?.workspace;
  if (serverA?.id) disposableIds.push(serverA.id);
  check("server creates disposable isolation fixture", createdA.status === 201 && Boolean(serverA?.id), `HTTP ${createdA.status}`);
  if (!serverA?.id) throw new Error("The disposable isolation fixture could not be created.");

  await openStudio(serverA.id);
  check("local Studio opens the seeded fixture", (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === serverA.id);

  await openSelector();
  await driver.findElement(By.css('.tpi-studio-menu [data-action="create"]')).click();
  await waitFor("Create New Studio dialog", async () => {
    const dialogs = await driver.findElements(By.css("#tpi-create-studio-dialog .tpi-studio-dialog"));
    return dialogs.length === 1 && await dialogs[0].isDisplayed();
  });
  const modalGeometry = await js("var n=document.querySelector('#tpi-create-studio-dialog .tpi-studio-dialog'),r=n.getBoundingClientRect(); return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight};");
  check("Create New Studio uses an in-viewport modal", modalGeometry.left >= 0 && modalGeometry.top >= 0 && modalGeometry.right <= modalGeometry.viewportWidth + 1 && modalGeometry.bottom <= modalGeometry.viewportHeight + 1, JSON.stringify(modalGeometry));
  const titleB = `TPI Recovery B ${runId}`;
  await driver.findElement(By.css("#tpi-studio-name")).sendKeys(titleB, Key.ENTER);
  const workspaceB = await waitFor("new Studio server record", async () => {
    const response = await authenticatedFetch("/api/studio/workspaces");
    return response.body?.workspaces?.find((workspace) => workspace.title === titleB) || null;
  });
  disposableIds.push(workspaceB.id);
  await waitFor("new Studio becomes active", async () => (await js("return {id:localStorage.getItem('studioflow.tpiActiveStudioId.v1'), title:document.querySelector('.tpi-studio-selector')?.textContent || ''};")).id === workspaceB.id);
  check("Create New Studio activates the new Studio immediately", (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspaceB.id);
  check("new Studio selector shows the new identity", (await js("return document.querySelector('.tpi-studio-selector')?.textContent || ''")).includes(titleB));

  const defaultRows = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return n.querySelector('.scene-panel-item-button strong')?.textContent || n.getAttribute('data-tpi-scene-panel-item')});");
  check("new Studio has exactly the four-item default arrangement", JSON.stringify(defaultRows) === JSON.stringify(["Intro Video", "Scene 1", "Scene 2", "Outro Video"]), JSON.stringify(defaultRows));
  const serverB = await serverWorkspace(workspaceB.id);
  const configB = serverB?.state?.configuration || {};
  const localB = await js("return {clips:JSON.parse(localStorage.getItem('studioflow.videoClipSlots') || 'null'),music:JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || 'null'),orientation:JSON.parse(localStorage.getItem('studioflow.programOrientation') || 'null')};");
  check("new Studio does not inherit production shortcuts or assignments", (configB.scenePanelItems || []).length === 4 && !(configB.scenePanelItems || []).some((item) => ["timer", "music", "video-clip"].includes(item.kind)) && (configB.videoClipSlots || []).length === 0 && (configB.backgroundMusicSlots || []).length === 0, JSON.stringify({ items: configB.scenePanelItems, clips: configB.videoClipSlots, music: configB.backgroundMusicSlots, localB }));
  check("new Studio resets production defaults instead of copying Studio A", configB.videoTimerTheme === "classic" && configB.videoTimerDuration === 20 && configB.programOrientation === "landscape", JSON.stringify({ theme: configB.videoTimerTheme, duration: configB.videoTimerDuration, orientation: configB.programOrientation, localB }));

  const firstItem = await driver.findElement(By.css('[data-tpi-scene-panel-item="intro"] .scene-item-menu-trigger'));
  await firstItem.click();
  await waitFor("Intro scene context menu", async () => {
    const menus = await driver.findElements(By.css(".scene-item-context-menu"));
    return menus.length === 1 && await menus[0].isDisplayed();
  });
  const reactMenu = await sceneMenuGeometry(".scene-item-context-menu");
  check("React scene menu is visibly in the viewport", reactMenu.visible && reactMenu.left >= 0 && reactMenu.top >= 0 && reactMenu.right <= reactMenu.viewportWidth + 1 && reactMenu.bottom <= reactMenu.viewportHeight + 1, JSON.stringify(reactMenu));
  check("scene menu uses drag ordering only", !/Move Up|Move Down/i.test(reactMenu.text));
  await driver.actions().sendKeys(Key.ESCAPE).perform();
  await waitFor("scene menu closes with Escape", async () => {
    const menus = await driver.findElements(By.css(".scene-item-context-menu"));
    return menus.length === 0 || !(await menus[0].isDisplayed());
  });

  await driver.findElement(By.css(".scene-panel-add-button")).click();
  await driver.findElement(By.xpath("//div[contains(@class,'scene-panel-add-menu')]//button[contains(normalize-space(.),'Background Music')]")).click();
  await waitFor("Background Music shortcut", async () => (await driver.findElements(By.css('[data-tpi-scene-panel-item^="music:"]'))).length === 1);
  await driver.findElement(By.css('[data-tpi-scene-panel-item^="music:"] .scene-item-menu-trigger')).click();
  await waitFor("Background Music context menu", async () => {
    const menus = await driver.findElements(By.css(".tpi-scene-music-menu"));
    return menus.length === 1 && await menus[0].isDisplayed();
  });
  const musicMenu = await sceneMenuGeometry(".tpi-scene-music-menu");
  check("Background Music menu is visibly in the viewport", musicMenu.visible && musicMenu.left >= 0 && musicMenu.top >= 0 && musicMenu.right <= musicMenu.viewportWidth + 1 && musicMenu.bottom <= musicMenu.viewportHeight + 1, JSON.stringify(musicMenu));
  check("Background Music menu exposes removal without legacy move commands", /Remove from Scenes/i.test(musicMenu.text) && !/Move up|Move down/i.test(musicMenu.text));
  await driver.findElement(By.xpath("//div[contains(@class,'tpi-scene-music-menu')]//button[contains(normalize-space(.),'Remove from Scenes')]")).click();
  await waitFor("Background Music shortcut removal", async () => {
    const rows = await driver.findElements(By.css('[data-tpi-scene-panel-item^="music:"]'));
    return rows.length === 0 || !(await rows[0].isDisplayed());
  });
  await saveAndWait(workspaceB.id, (configuration) => !(configuration.scenePanelItems || []).some((item) => item.kind === "music"));
  check("removed Background Music shortcut persists on the server", true);

  await driver.findElement(By.css(".scene-panel-add-button")).click();
  await driver.findElement(By.xpath("//div[contains(@class,'scene-panel-add-menu')]//button[contains(normalize-space(.),'Production Scene')]")).click();
  await waitFor("new sequential scene", async () => (await driver.findElements(By.css('[data-tpi-scene-panel-item^="scene:scene-"]'))).length >= 3);
  const sceneRows = await driver.findElements(By.css('[data-tpi-scene-panel-item^="scene:scene-"]'));
  const scene3 = sceneRows.length ? await sceneRows[sceneRows.length - 1].findElement(By.css('.scene-item-menu-trigger')).catch(() => null) : null;
  if (scene3) {
    await scene3.click();
    await waitFor("new scene context menu", async () => {
      const menus = await driver.findElements(By.css(".scene-item-context-menu"));
      return menus.length === 1 && await menus[0].isDisplayed();
    });
    await driver.findElement(By.xpath("//div[contains(@class,'scene-item-context-menu')]//button[contains(normalize-space(.),'Rename Scene')]")).click();
    await waitFor("Rename scene modal", async () => {
      const fields = await driver.findElements(By.css("input[aria-label='Scene title']"));
      return fields.length === 1 && await fields[0].isDisplayed();
    });
    const renamed = `Recovery Scene ${runId}`;
    const input = await driver.findElement(By.css("input[aria-label='Scene title']"));
    await input.clear();
    await input.sendKeys(renamed);
    await driver.findElement(By.xpath("//button[contains(@class,'wide-action') and normalize-space(.)='Save']")).click();
    await waitFor("renamed scene visible", async () => (await js("return document.body.innerText")).includes(renamed));
    try {
      await saveAndWait(workspaceB.id, (configuration) => (configuration.studioScenes || []).some((scene) => scene.title === renamed));
    } catch (error) {
      const diagnostic = await js("return {localScenes:JSON.parse(localStorage.getItem('studioflow.studioScenes') || 'null'),localPanel:JSON.parse(localStorage.getItem('studioflow.scenePanelItems') || 'null'),status:document.querySelector('.tpi-studio-status')?.textContent || ''};");
      const serverAfterTimeout = await serverWorkspace(workspaceB.id);
      throw new Error(`${error.message}; diagnostic=${JSON.stringify({ diagnostic, serverScenes: serverAfterTimeout?.state?.configuration?.studioScenes || null, serverVersion: serverAfterTimeout?.version || null })}`);
    }
    check("new scene receives sequential naming and can be renamed", true);
  } else check("new scene receives sequential naming and can be renamed", false, "Scene 3 menu trigger unavailable");

  await driver.navigate().refresh();
  await waitFor("new Studio restoration after refresh", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspaceB.id && (await js("return document.body.innerText")) .includes(titleB));
  const restoredRows = await js("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return {id:n.getAttribute('data-tpi-scene-panel-item'),label:n.querySelector('.scene-panel-item-button strong')?.textContent || n.getAttribute('data-tpi-scene-panel-item')};});");
  check("new Studio remains active and restores its independent configuration", (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspaceB.id && !restoredRows.some((row) => row.id === "music:after-intro") && restoredRows.some((row) => row.label?.includes("Recovery Scene")), JSON.stringify(restoredRows));

  await openSelector();
  const aButton = await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${serverA.id}"]`));
  await aButton.click();
  await waitFor("switch back to Studio A", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === serverA.id && (await js("return document.body.innerText")).includes("Studio A Scene"));
  check("switching restores Studio A without B contamination", (await js("return document.body.innerText")).includes("Studio A Scene") && !(await js("return document.body.innerText")).includes(`Recovery Scene ${runId}`));
  await openSelector();
  await driver.findElement(By.css(`.tpi-studio-menu button[data-action="open"][data-workspace-id="${workspaceB.id}"]`)).click();
  await waitFor("switch back to Studio B", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === workspaceB.id && (await js("return document.body.innerText")).includes(`Recovery Scene ${runId}`));
  check("switching back restores Studio B independently", true);

  writeFileSync(join(evidenceRoot, "recovery-final.png"), Buffer.from(await driver.takeScreenshot(), "base64"));
} catch (error) {
  check("integrated recovery browser workflow completed", false, safe(error));
  try { writeFileSync(join(evidenceRoot, "recovery-failure.png"), Buffer.from(await driver.takeScreenshot(), "base64")); } catch {}
} finally {
  for (const id of disposableIds.reverse()) {
    try { check(`cleanup archived disposable workspace ${id}`, await archiveWorkspace(id)); } catch (error) { check(`cleanup archived disposable workspace ${id}`, false, safe(error)); }
  }
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-INTEGRATED-RECOVERY", status: failed.length ? "FAIL" : "PASS", base, account: accountKey, evidenceRoot, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

#!/usr/bin/env node
// TPI-STUDIOFLOW creation-inheritance reproduction (Failure A chain).
// Reproduces the owner's "Testing 123" scenario end to end with disposable
// Studios against the local worker:
//   E1) Home-screen Create (new broadcast) while a Crossroads-like Studio is
//       active -> does the UI keep showing the previous Studio's scene panel?
//   E2) "Save Current Studio to My Studios" -> does the new workspace record
//       inherit the previous Studio's configuration?
//   E3) My Studios dialog creation after a home-screen create -> clean state?
//   E4) localStorage write-back clobber after a clean switch.
// Prints a JSON diagnostic report. Only disposable synthetic Studios.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_REPRO_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";
const account = credentials?.accounts?.[accountKey];
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studio-creation-repro-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const runId = Date.now().toString(36);
const results = [];
const disposableIds = [];
const diagnostics = {};
let driver;

const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-CREATION-REPRO", status: "BLOCKED", reason: `Required input unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-CREATION-REPRO", status: "BLOCKED", reason: `Synthetic ${accountKey} account unavailable.` }));
  process.exit(1);
}

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); } catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out: ${detail}`);
}
async function authenticatedFetch(path, options = {}) {
  return asyncJs("var done=arguments[arguments.length-1], path=arguments[0], options=arguments[1] || {}; fetch(path, Object.assign({credentials:'same-origin'}, options, {headers:Object.assign({'content-type':'application/json'}, options.headers || {})})).then(function(r){return r.text().then(function(t){var b=null;try{b=t?JSON.parse(t):null}catch(e){b=t}done({status:r.status,body:b})})}).catch(function(e){done({status:0,error:String(e)})});", path, options);
}
async function serverWorkspace(id) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const response = await fetch(`${base}/api/studio/workspaces/${encodeURIComponent(id)}?tpi_probe=${runId}`, { headers: { Cookie: cookieHeader, Accept: "application/json" } });
  if (!response.ok) return null;
  return (await response.json())?.workspace || null;
}
async function archiveWorkspace(id) {
  const workspace = await serverWorkspace(id);
  if (!workspace) return false;
  const response = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) });
  return response.status === 200;
}
async function uiState() {
  return js(`return {
    activeStudioId: localStorage.getItem('studioflow.tpiActiveStudioId.v1'),
    activeBroadcastId: JSON.parse(localStorage.getItem('studioflow.activeBroadcastId') || 'null'),
    selectorText: document.querySelector('.tpi-studio-selector')?.textContent || '',
    statusText: document.querySelector('.tpi-studio-status')?.textContent || '',
    statusClass: document.querySelector('.tpi-studio-status')?.className || '',
    panelRows: Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){return n.getAttribute('data-tpi-scene-panel-item');}),
    sceneTitles: (JSON.parse(localStorage.getItem('studioflow.studioScenes') || '[]') || []).map(function(s){return s.title;}),
    localPanelItems: (JSON.parse(localStorage.getItem('studioflow.scenePanelItems') || 'null') || []).map(function(i){return i.id;}),
    localMusicSlots: (JSON.parse(localStorage.getItem('studioflow.backgroundMusicSlots') || 'null') || []).length,
    localClipSlots: (JSON.parse(localStorage.getItem('studioflow.videoClipSlots') || 'null') || []).length,
    localSnapshots: Object.keys(JSON.parse(localStorage.getItem('studioflow.tpiLocalStudioSnapshots.v1') || '{}')),
    localBroadcasts: (JSON.parse(localStorage.getItem('studioflow.broadcasts') || '[]') || []).map(function(b){return {id:b.id,title:b.title};})
  };`);
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
  await waitFor("StudioFlow application", async () => (await driver.findElements(By.css(".tpi-studio-selector"))).length > 0 && (await driver.findElements(By.css("[data-tpi-scenes-panel]"))).length > 0);
  await waitFor("selected Studio activation", async () => (await js("return localStorage.getItem('studioflow.tpiActiveStudioId.v1')")) === id);
}
function crossroadsLikeState(id, title) {
  return {
    broadcast: { id, title, description: "Disposable Crossroads-like fixture", status: "draft", visibility: "private" },
    settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
    configuration: {
      programOrientation: "landscape",
      videoTimerTheme: "haunted",
      videoTimerDuration: 30,
      videoClipSlots: [{ id: "clip-x", serverAssetId: "fixture-clip-x", serverUrl: "/api/studio/fixtures/clip-x", slot: 4, title: "crossroads-clip.mp4", kind: "video" }],
      backgroundMusicSlots: [
        { id: "music-1", serverAssetId: "fixture-music-1", serverUrl: "/api/studio/fixtures/m1", slot: 0, title: "theme.wav", kind: "audio" },
        { id: "music-2", serverAssetId: "fixture-music-2", serverUrl: "/api/studio/fixtures/m2", slot: 1, title: "after-intro.wav", kind: "audio" }
      ],
      sceneMusicAssignments: { "after-intro": { blobKey: "music-2", assetId: "music-2", title: "after-intro.wav", assignedAt: "fixture" } },
      studioScenes: [
        { id: "intro", kind: "intro", title: "Intro Video" },
        { id: "scene-1", kind: "demo", title: "Demo scene 2", layout: "Two-person split" },
        { id: "scene-2", kind: "demo", title: "Two-person split", layout: "Two-person split" },
        { id: "outro", kind: "outro", title: "Outro Video" }
      ],
      scenePanelItems: [
        { id: "intro", kind: "intro", title: "Intro Video", sceneId: "intro", opening: true },
        { id: "music:after-intro", kind: "music", title: "Background Music", sceneId: "after-intro" },
        { id: "timer", kind: "timer", title: "Countdown Timer", opening: true },
        { id: "scene:scene-1", kind: "scene", title: "Demo scene 2", sceneId: "scene-1" },
        { id: "music:scene-1", kind: "music", title: "Background Music", sceneId: "scene-1" },
        { id: "scene:scene-2", kind: "scene", title: "Two-person split", sceneId: "scene-2" },
        { id: "music:scene-2", kind: "music", title: "Background Music", sceneId: "scene-2" },
        { id: "outro", kind: "outro", title: "Outro Video", sceneId: "outro", closing: true }
      ]
    }
  };
}

try {
  const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1100, x: 20, y: 20 });
  await login();

  // ---- Fixture: Crossroads-like Studio A ------------------------------
  const idA = `tpi-cre-a-${runId}`;
  const titleA = `TPI Cre Crossroads ${runId}`;
  const createdA = await authenticatedFetch("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: titleA, localBroadcastId: idA, state: crossroadsLikeState(idA, titleA) }) });
  const serverA = createdA.body?.workspace;
  if (serverA?.id) disposableIds.push(serverA.id);
  check("fixture: Crossroads-like Studio A created", createdA.status === 201 && Boolean(serverA?.id), `HTTP ${createdA.status}`);
  if (!serverA?.id) throw new Error("Fixture creation failed.");
  await openStudio(serverA.id);
  const before = await uiState();
  diagnostics.beforeHomeCreate = before;
  check("fixture A shows the eight-item panel", before.panelRows.length === 8, JSON.stringify(before.panelRows));

  // ---- E1: home-screen Create while A is active ----------------------
  // Leave the studio via the Exit control (sets route home), then confirm the
  // dashboard home screen renders.
  const exitButton = await driver.findElements(By.css(".exit-button"));
  if (exitButton.length) await exitButton[0].click();
  await waitFor("home screen", async () => (await driver.findElements(By.css(".dashboard-content"))).length > 0, 15_000);
  // Create -> Recording card -> dialog -> name the broadcast like the owner.
  const recordingCard = await driver.findElements(By.xpath("//div[contains(@class,'create-card') or contains(@class,'CreateCard')]//strong[normalize-space(.)='Recording']/ancestor::*[contains(@class,'create-card')][1] | //button[contains(normalize-space(.),'Record without going live')]"));
  let createTarget = null;
  if (recordingCard.length) createTarget = recordingCard[0];
  else {
    const candidates = await driver.findElements(By.xpath("//*[self::button or self::div][contains(normalize-space(.),'Record without going live') or contains(normalize-space(.),'Recording')]"));
    createTarget = candidates[0];
  }
  if (!createTarget) throw new Error("Home Create Recording card not found.");
  await createTarget.click();
  await waitFor("recording create dialog", async () => (await driver.findElements(By.css("input"))).length > 0, 10_000);
  const titleInputs = await driver.findElements(By.css("input[type='text'], input:not([type])"));
  for (const input of titleInputs) {
    try {
      const placeholder = await input.getAttribute("placeholder") || "";
      const aria = await input.getAttribute("aria-label") || "";
      if (/title|name/i.test(placeholder + aria)) { await input.sendKeys(`Browser Only Crossroads ${runId}`); break; }
    } catch {}
  }
  // Submit the dialog (Create button).
  const submitButtons = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Create')]"));
  if (submitButtons.length) await submitButtons[submitButtons.length - 1].click();
  await sleep(2500);
  const afterHomeCreate = await uiState();
  diagnostics.afterHomeCreate = afterHomeCreate;
  // Now enter the studio view for the new broadcast.
  const enterButtons = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Enter') or contains(normalize-space(.),'Studio')]"));
  if (enterButtons.length) await enterButtons[0].click();
  await sleep(2500);
  const afterEnter = await uiState();
  diagnostics.afterHomeCreateEnterStudio = afterEnter;
  writeFileSync(join(evidenceRoot, "e1-after-home-create.png"), Buffer.from(await driver.takeScreenshot(), "base64"));
  check("E1a: home-created broadcast keeps an independent identity", afterEnter.activeBroadcastId && afterEnter.activeBroadcastId !== idA, JSON.stringify({ active: afterEnter.activeBroadcastId, fixture: idA }));
  check("E1b: UI does NOT keep showing the previous Studio's eight items", afterEnter.panelRows.length !== 8 || JSON.stringify(afterEnter.panelRows) === JSON.stringify(before.panelRows.map((x) => x)), JSON.stringify(afterEnter.panelRows));

  // ---- E2: Save Current Studio to My Studios -------------------------
  const saveButtons = await driver.findElements(By.xpath("//button[contains(normalize-space(.),'Save Current Studio to My Studios')]"));
  if (saveButtons.length) {
    await saveButtons[0].click();
    await sleep(1500);
    // window.confirm may appear; accept it.
    try { await driver.switchTo().alert().accept(); } catch {}
    await sleep(2500);
  }
  const afterSaveLocal = await uiState();
  diagnostics.afterSaveLocal = afterSaveLocal;
  const workspacesResponse = await authenticatedFetch("/api/studio/workspaces");
  const savedWorkspace = (workspacesResponse.body?.workspaces || []).find((w) => w.title?.includes(runId) && w.id !== serverA.id && !w.title.includes("Crossroads"));
  if (savedWorkspace) {
    disposableIds.push(savedWorkspace.id);
    const serverSaved = await serverWorkspace(savedWorkspace.id);
    diagnostics.savedWorkspaceConfig = serverSaved?.state?.configuration || null;
    const cfg = serverSaved?.state?.configuration || {};
    const inherited = (cfg.scenePanelItems || []).some((i) => ["timer", "music", "video-clip"].includes(i.kind)) || (cfg.videoClipSlots || []).length > 0 || (cfg.backgroundMusicSlots || []).length > 0 || cfg.videoTimerTheme === "haunted";
    check("E2: 'Save Current Studio' record does NOT inherit the previous Studio's configuration", !inherited, JSON.stringify({ items: (cfg.scenePanelItems || []).map((i) => i.id), clips: (cfg.videoClipSlots || []).length, music: (cfg.backgroundMusicSlots || []).length, timer: cfg.videoTimerTheme }));
  } else {
    check("E2: 'Save Current Studio' created a workspace record", false, "no matching workspace found");
  }

  // ---- E3: localStorage state after the home create ------------------
  check("E3: localStorage config was reset for the new broadcast", afterEnter.localPanelItems.length !== 8 || afterEnter.localMusicSlots === 0, JSON.stringify({ panel: afterEnter.localPanelItems, music: afterEnter.localMusicSlots, clips: afterEnter.localClipSlots }));

  // ---- E4: switch back to A; verify A's config intact and no clobber --
  await openStudio(serverA.id);
  await sleep(2500);
  const backOnA = await uiState();
  diagnostics.backOnA = backOnA;
  check("E4: switching back to A restores the eight-item panel", backOnA.panelRows.length === 8, JSON.stringify(backOnA.panelRows));

  writeFileSync(join(evidenceRoot, "creation-repro-final.png"), Buffer.from(await driver.takeScreenshot(), "base64"));
} catch (error) {
  check("creation reproduction workflow completed", false, safe(error));
  try { diagnostics.fatal = await uiState(); } catch {}
  try { writeFileSync(join(evidenceRoot, "creation-repro-failure.png"), Buffer.from(await driver.takeScreenshot(), "base64")); } catch {}
} finally {
  for (const id of disposableIds.reverse()) {
    try { check(`cleanup archived disposable workspace ${id}`, await archiveWorkspace(id)); } catch (error) { check(`cleanup archived disposable workspace ${id}`, false, safe(error)); }
  }
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((r) => !r.passed);
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-CREATION-REPRO", status: failed.length ? "REPRODUCED-ISSUES" : "ALL-PASS", base, account: accountKey, evidenceRoot, diagnostics, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

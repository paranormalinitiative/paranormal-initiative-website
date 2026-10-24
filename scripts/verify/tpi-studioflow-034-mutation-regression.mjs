#!/usr/bin/env node
// TPI-STUDIOFLOW-034 — settled DOM mutation regression.
// Uses a disposable Firefox profile and browser-local Studio state only.
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_034_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-034-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });

function wavFile() {
  const sampleRate = 44100;
  const samples = sampleRate * 2;
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write("RIFF"); bytes.writeUInt32LE(36 + samples * 2, 4); bytes.write("WAVE", 8);
  bytes.write("fmt ", 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write("data", 36); bytes.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i += 1) bytes.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 220 * i) / sampleRate) * 12000), 44 + i * 2);
  const file = join(evidenceRoot, "tpi-034-playback.wav"); writeFileSync(file, bytes); return file;
}

for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) { console.log(JSON.stringify({ status: "BLOCKED", reason: `Required Firefox input is unavailable: ${file}` })); process.exit(1); }
}

const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
const service = new firefox.ServiceBuilder(geckodriver);
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const safe = error => error instanceof Error ? error.message : String(error);
let driver;

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(description, predicate, timeout = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) { try { const value = await predicate(); if (value) return value; } catch {} await sleep(200); }
  throw new Error(`${description} timed out`);
}
async function login() {
  await driver.get(`${base}/member-login.html`);
  await js("var form=document.querySelector('form[data-member-login]'), user=form&&form.querySelector('input[name=\"username\"]'), password=form&&form.querySelector('input[name=\"password\"]'); if(!form||!user||!password) throw new Error('Member login form unavailable'); user.value=arguments[0]; password.value=arguments[1]; ['input','change'].forEach(function(type){user.dispatchEvent(new Event(type,{bubbles:true}));password.dispatchEvent(new Event(type,{bubbles:true}));}); form.querySelector('button[type=submit]').click();", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await asyncJs("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));
}
async function openLocalStudio(label) {
  const id = `tpi-034-${label}-${Date.now()}`;
  await js("var id=arguments[0], title=arguments[1], broadcast={id:id,title:title,description:'Disposable TPI-034 browser-local Studio',status:'draft',kind:'live'}; localStorage.setItem('studioflow.broadcasts',JSON.stringify([broadcast])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Main scene',layout:'Speaker view'},{id:'scene-2',kind:'demo',title:'Second scene',layout:'Group discussion'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.removeItem('studioflow.sceneMusicAssignments');", id, `TPI-034 ${label}`);
  await driver.get(`${base}/studio/`);
  await waitFor("organized StudioFlow controls", async () => (await count("[data-tpi-video-organization]")) === 1 && (await count("[data-tpi-audio-soundboards]")) === 1);
  await sleep(1500);
  return id;
}
async function installProbe() {
  await js(`(() => {
    const m = { records: 0, callbacks: 0, attributes: 0, childList: 0, addedNodes: 0, removedNodes: 0, redundantHiddenWrites: 0, redundantSetAttributeWrites: 0, redundantStyleWrites: 0, menuChildAdds: 0, menuChildRemovals: 0, fetches: [], storageWrites: 0, attrSignatures: {}, childTargets: {} };
    const key = node => node?.tagName ? node.tagName.toLowerCase() + (node.id ? '#' + node.id : '') + (typeof node.className === 'string' && node.className ? '.' + node.className.split(/\\s+/).slice(0,3).join('.') : '') : 'node';
    const originalSet = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) { if (this.getAttribute(name) === String(value)) m.redundantSetAttributeWrites++; return originalSet.call(this, name, value); };
    const hidden = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidden');
    if (hidden?.set) Object.defineProperty(HTMLElement.prototype, 'hidden', { configurable: true, enumerable: hidden.enumerable, get: hidden.get, set(value) { if (hidden.get.call(this) === Boolean(value)) m.redundantHiddenWrites++; return hidden.set.call(this, value); } });
    const styleSet = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(name, value, priority) { if (this.getPropertyValue(name) === String(value) && this.getPropertyPriority(name) === String(priority || '')) m.redundantStyleWrites++; return styleSet.call(this, name, value, priority); };
    const styleRemove = CSSStyleDeclaration.prototype.removeProperty;
    CSSStyleDeclaration.prototype.removeProperty = function(name) { if (this.getPropertyValue(name)) m.redundantStyleWrites++; return styleRemove.call(this, name); };
    const fetch = window.fetch; window.fetch = function(input, init) { m.fetches.push({ url: typeof input === 'string' ? input : input?.url || '', method: String(init?.method || input?.method || 'GET').toUpperCase() }); return fetch.apply(this, arguments); };
    const setItem = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { m.storageWrites++; return setItem.call(this, k, v); };
    const observer = new MutationObserver(records => { m.callbacks++; m.records += records.length; for (const record of records) { if (record.type === 'attributes') { m.attributes++; const signature = key(record.target) + '|' + record.attributeName; m.attrSignatures[signature] = (m.attrSignatures[signature] || 0) + 1; } else { m.childList++; m.addedNodes += record.addedNodes.length; m.removedNodes += record.removedNodes.length; const target = key(record.target); m.childTargets[target] = (m.childTargets[target] || 0) + record.addedNodes.length + record.removedNodes.length; if (target.includes('tpi-studio-menu')) { m.menuChildAdds += record.addedNodes.length; m.menuChildRemovals += record.removedNodes.length; } } } });
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    window.__tpi034 = { m, reset() { for (const key of ['records','callbacks','attributes','childList','addedNodes','removedNodes','redundantHiddenWrites','redundantSetAttributeWrites','redundantStyleWrites','menuChildAdds','menuChildRemovals','storageWrites']) m[key] = 0; m.fetches = []; m.attrSignatures = {}; m.childTargets = {}; }, snapshot() { return { records: m.records, callbacks: m.callbacks, attributes: m.attributes, childList: m.childList, addedNodes: m.addedNodes, removedNodes: m.removedNodes, unnecessary: m.redundantHiddenWrites + m.redundantSetAttributeWrites + m.redundantStyleWrites + m.addedNodes + m.removedNodes, redundantHiddenWrites: m.redundantHiddenWrites, redundantSetAttributeWrites: m.redundantSetAttributeWrites, redundantStyleWrites: m.redundantStyleWrites, menuChildAdds: m.menuChildAdds, menuChildRemovals: m.menuChildRemovals, storageWrites: m.storageWrites, fetches: m.fetches.slice(), topAttributes: Object.entries(m.attrSignatures).sort((a,b)=>b[1]-a[1]).slice(0,8), topChildTargets: Object.entries(m.childTargets).sort((a,b)=>b[1]-a[1]).slice(0,8) }; } };
  })();`);
}
async function measure(label, seconds, idle = true) {
  await js("window.__tpi034.reset();"); await sleep(seconds * 1000); const metrics = await js("return window.__tpi034.snapshot();");
  results.push({ label, seconds, idle, metrics });
  if (idle && seconds === 5) check(`${label} settled idle window remains below mutation threshold`, metrics.unnecessary < 100, JSON.stringify(metrics));
  return metrics;
}
async function click(selector) { const elements = await driver.findElements(By.css(selector)); if (!elements.length) return false; await elements[0].click(); return true; }
async function uploadAudio(file) {
  const selector = 'input[type=file][accept*="audio/"]';
  const before = await count(selector);
  if (!(await click('[data-tpi-audio-board="music"] .tpi-audio-upload'))) throw new Error("Background Music upload control is unavailable");
  const input = await waitFor("dynamic audio file input", async () => { const elements = await driver.findElements(By.css(selector)); return elements.length > before ? elements.at(-1) : null; });
  await input.sendKeys(file);
  await waitFor("music assignment", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned')) === 1, 15_000).catch(async () => { const status = await js("var n=document.querySelector('[data-tpi-audio-status]'); return n ? n.textContent : ''; "); throw new Error(`music assignment timed out (status=${JSON.stringify(status)})`); });
}

try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1200, x: 20, y: 20 });
  await login();
  await openLocalStudio("existing"); await installProbe(); await sleep(2000);
  check("A. StudioFlow bootstrap route is reachable (current app has no separate idle Home state)", /StudioFlow|Library|Destinations/i.test(await driver.findElement(By.css("body")).getText()));
  await measure("B/C. Existing and fresh disposable Studio idle", 5);
  await measure("B/C. Existing and fresh disposable Studio idle", 30);
  const audioFile = wavFile(); await uploadAudio(audioFile); await sleep(2000);
  await click('[data-studio-panel-tab="Media assets"]'); await sleep(300); await measure("D/E. Sound Effects and Background Music panels idle", 5);
  await click('[data-studio-panel-tab="Background picker"]'); await sleep(300); await measure("Background Picker idle", 5);
  await click('[data-studio-panel-tab="Media assets"]'); await waitFor("Media assets panel", async () => (await count('[data-studio-panel-tab="Media assets"].selected')) === 1); await sleep(300);
  await click('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned'); await waitFor("active music playback", async () => (await count('[data-tpi-audio-board="music"] .tpi-audio-slot.playing')) === 1); await measure("G. Active Background Music playback", 5, false);
  await click('[data-tpi-audio-stop="music"]'); await sleep(500); await measure("H. Idle after playback stops", 5);
  const studioA = await js("return localStorage.getItem('studioflow.activeBroadcastId') || ''; ");
  await openLocalStudio("switch-b"); await installProbe(); await sleep(2000); await measure("F. Second disposable Studio after active-studio switch", 5);
  const studioB = await js("return localStorage.getItem('studioflow.activeBroadcastId') || ''; "); check("F. Active Studio identity changes without server or owner data", studioA !== studioB, JSON.stringify({ studioA, studioB }));
  console.log(JSON.stringify({ status: results.every(item => item.passed !== false) ? "PASS" : "FAIL", evidenceRoot, results }, null, 2));
} catch (error) {
  check("suite completed without a fatal error", false, safe(error));
  console.log(JSON.stringify({ status: "FAIL", evidenceRoot, results }, null, 2));
  process.exitCode = 1;
} finally { if (driver) await driver.quit().catch(() => {}); }

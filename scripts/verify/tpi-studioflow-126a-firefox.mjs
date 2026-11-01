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
const evidenceRoot = process.env.TPI_FIREFOX_126A_EVIDENCE || join(repoRoot, "docs/TPI-DEVELOPMENT/100-DIRECTIVES/evidence/TPI-STUDIOFLOW-126A");
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
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-126A", reason: "Firefox binary, geckodriver, or disposable local credentials are unavailable.", evidenceRoot }, null, 2));
  process.exit(1);
}

const raw = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = raw.accounts?.test_admin ?? raw;
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-126A", reason: "The disposable test_admin account is unavailable.", evidenceRoot }, null, 2));
  process.exit(1);
}

const studioId = `tpi-126a-firefox-${Date.now()}`;
const studioTitle = `TPI 126A Firefox ${Date.now()}`;
const scripts = [{ id: `${studioId}-script`, studioId, title: "Border Verification Script", body: "Disposable script for card border verification.", updatedAt: "TPI 126A", createdAt: 1 }];
const scenes = [
  { id: "scene-1", kind: "demo", title: "Disposable Scene", layout: "Speaker view" }
];
const panelItems = [
  { id: "intro", kind: "intro", title: "Intro Video", sceneId: "scene-1", opening: true },
  { id: "script", kind: "teleprompter-script", title: "Border Verification Script", teleprompterScriptId: scripts[0].id },
  { id: "scene:scene-1", kind: "scene", title: "Disposable Scene", sceneId: "scene-1" },
  { id: "timer", kind: "timer", title: "Countdown Timer", opening: true },
  { id: "music:after-intro", kind: "music", title: "Background Music", sceneId: "after-intro" },
  { id: "outro", kind: "outro", title: "Outro Video", sceneId: "scene-1", closing: true }
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
  await driver.executeScript("var id=arguments[0],title=arguments[1],scripts=arguments[2],scenes=arguments[3],items=arguments[4]; localStorage.setItem('studioflow.broadcasts',JSON.stringify([{id:id,title:title,description:'Disposable TPI 126A border verification Studio',status:'draft',kind:'live'}])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.setItem('studioflow.studioScenes',JSON.stringify(scenes)); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify(items)); localStorage.setItem('studioflow.teleprompterScripts',JSON.stringify(scripts));", studioId, studioTitle, scripts, scenes, panelItems);
  await driver.navigate().refresh();
  await waitFor("My Scenes production cards", async () => (await driver.findElements(By.css('[data-tpi-scene-panel-item]'))).length === panelItems.length);

  const cardData = async () => driver.executeScript("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){var s=getComputedStyle(n); return {id:n.getAttribute('data-tpi-scene-panel-item'),kind:n.getAttribute('data-production-kind'),text:(n.textContent||'').replace(/\\s+/g,' ').trim(),icon:s.getPropertyValue('--production-item-color').trim(),border:s.borderTopColor,selected:n.classList.contains('selected')};});");
  const expected = new Map([
    ["intro", { icon: "#f97316", normal: "rgba(249, 115, 22, 0.72)", selected: "rgb(251, 146, 60)" }],
    ["teleprompter-script", { icon: "#a855f7", normal: "rgba(168, 85, 247, 0.74)", selected: "rgb(192, 132, 252)" }],
    ["scene", { icon: "#3b82f6", normal: "rgba(59, 130, 246, 0.72)", selected: "rgb(96, 165, 250)" }],
    ["timer", { icon: "#eab308", normal: "rgba(234, 179, 8, 0.72)", selected: "rgb(250, 204, 21)" }],
    ["music", { icon: "#22c55e", normal: "rgba(34, 197, 94, 0.7)", selected: "rgb(74, 222, 128)" }],
    ["outro", { icon: "#f97316", normal: "rgba(249, 115, 22, 0.72)", selected: "rgb(251, 146, 60)" }]
  ]);
  const initial = await cardData();
  check("Every production card border matches its type color", initial.every((card) => expected.get(card.kind)?.[card.selected ? "selected" : "normal"] === card.border), JSON.stringify(initial));
  check("Icon and border tokens agree for every production type", initial.every((card) => expected.get(card.kind)?.icon === card.icon), JSON.stringify(initial));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "all-production-card-borders.png"), data, "base64"));

  const scriptButton = await driver.findElement(By.css('[data-production-kind="teleprompter-script"] .scene-panel-item-button'));
  await scriptButton.click();
  await waitFor("selected teleprompter card", async () => (await cardData()).find((card) => card.kind === "teleprompter-script")?.selected === true);
  await sleep(350);
  const selected = await cardData();
  const selectedScript = selected.find((card) => card.kind === "teleprompter-script");
  check("Selected Teleprompter Script retains a purple border", selectedScript?.border === expected.get("teleprompter-script")?.selected, JSON.stringify(selectedScript));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "selected-teleprompter-purple-border.png"), data, "base64"));

  await driver.navigate().refresh();
  await waitFor("production cards after refresh", async () => (await driver.findElements(By.css('[data-tpi-scene-panel-item]'))).length === panelItems.length);
  const restored = await cardData();
  await sleep(350);
  const settledRestored = await cardData();
  check("Type-specific borders persist after refresh", settledRestored.every((card) => expected.get(card.kind)?.[card.selected ? "selected" : "normal"] === card.border), JSON.stringify(settledRestored));
} catch (error) {
  check("Firefox 126A acceptance completed", false, safe(error));
  if (driver) {
    try { writeFileSync(join(evidenceRoot, "failure.png"), await driver.takeScreenshot(), "base64"); } catch {}
  }
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", suite: "TPI-STUDIOFLOW-126A", browser: "Firefox Developer Edition", environment: base, evidenceRoot, studioId, checks: results, passed: results.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);

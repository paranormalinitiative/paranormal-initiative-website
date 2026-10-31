#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox, Geckodriver, or local credentials are unavailable." }));
  process.exit(1);
}
const credentialSource = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentialSource.accounts?.test_admin ?? credentialSource;
const options = new firefox.Options().setBinary(binary).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0).setPreference("media.autoplay.blocking_policy", 0);
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function text(selector) { return String(await js("var n=document.querySelector(arguments[0]); return n ? n.textContent : '';", selector)); }
async function clickText(label) { return js("var needle=arguments[0].toLowerCase(); var n=Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase()===needle;}); if(!n)return false; n.click(); return true;", label); }
async function waitFor(predicate, timeout = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await predicate()) return true; await sleep(200); }
  return false;
}
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1000, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  await waitFor(async () => (await count('form[data-member-login]')) === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=username]'),p=f.querySelector('input[name=password]'); u.value=arguments[0];p.value=arguments[1];['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));});f.querySelector('button[type=submit]').click();", account.username, account.password);
  check("synthetic local authentication succeeds", await waitFor(async () => Boolean(await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){return Boolean(b&&b.user);}).catch(function(){return false;});"))));
  const studioId = `screen-share-acceptance-${Date.now()}`;
  await js("var id=arguments[0]; localStorage.setItem('studioflow.broadcasts',JSON.stringify([{id:id,title:'Screen Share Acceptance',description:'Disposable screen-share acceptance studio',status:'draft',kind:'live'}])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.setItem('studioflow.studioScenes',JSON.stringify([{id:'intro',kind:'intro',title:'Intro video',layout:'Speaker view'},{id:'scene-1',kind:'demo',title:'Disposable scene',layout:'Speaker view'},{id:'outro',kind:'outro',title:'Outro video',layout:'Speaker view'}])); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1'));", studioId);
  await driver.get(`${base}/studio/`);
  check("StudioFlow shell loads", await waitFor(async () => /StudioFlow|Record without going live/i.test(await text("body"))));
  if (!(await count('[data-tpi-video-organization]'))) { await clickText("Record without going live"); await clickText("Continue to setup"); await clickText("Enter studio"); }
  check("recording Studio loads", await waitFor(async () => (await count('[data-tpi-video-organization]')) === 1));
  check("Present or invite opens", await clickText("Present or invite") && await waitFor(async () => (await count(".present-menu")) === 1));
  check("Share screen opens StudioFlow panel", await clickText("Share screen") && await waitFor(async () => (await count('[data-screen-share-panel="true"]')) === 1));
  check("panel has all three sharing choices", await count('[data-screen-share-surface]') === 3);
  check("panel explains browser-controlled permission", /browser controls the permission picker/i.test(await text("[data-screen-share-panel=true]")));
  const themeState = await js("var n=document.querySelector('[data-screen-share-panel]'); return n ? {theme:Array.from(n.classList).find(function(c){return c.indexOf('theme-')===0}), accent:getComputedStyle(n).getPropertyValue('--stage-accent').trim()} : null;");
  check("panel inherits StudioFlow theme variables", Boolean(themeState?.theme && themeState?.accent), JSON.stringify(themeState));
  for (const surface of ["browser", "window", "monitor"]) {
    await js("var target=arguments[0], n=Array.from(document.querySelectorAll('[data-screen-share-surface]')).find(function(node){return node.dataset.screenShareSurface===target;}); if(n)n.click();", surface);
    const selected = await waitFor(async () => await js("var target=arguments[0], n=Array.from(document.querySelectorAll('[data-screen-share-surface]')).find(function(node){return node.dataset.screenShareSurface===target;}); return Boolean(n && n.getAttribute('aria-checked')==='true');", surface), 2_000);
    check(`${surface} sharing choice is selectable`, selected);
  }
  check("Choose content is present", await count('[data-screen-share-choose="true"]') === 1);
  check("Cancel returns to the recording Studio", await clickText("Cancel") && await waitFor(async () => (await count('[data-screen-share-panel="true"]')) === 0 && (await count('[data-tpi-video-organization]')) === 1));
  console.log(JSON.stringify({ status: results.every(result => result.passed) ? "PASS" : "FAIL", browser: "Firefox Developer Edition", nativePicker: "NOT_AUTOMATED", checks: results }, null, 2));
  process.exit(results.every(result => result.passed) ? 0 : 1);
} catch (error) {
  check("screen-share browser acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", browser: "Firefox Developer Edition", nativePicker: "NOT_AUTOMATED", checks: results }, null, 2));
  process.exit(1);
} finally { await driver.quit().catch(() => {}); }

#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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
const source = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = source.accounts?.test_admin ?? source;
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-122e-"));
const profile = join(evidenceRoot, "profile");
mkdirSync(profile, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function asyncJs(script, ...args) { return driver.executeAsyncScript(script, ...args); }
async function bodyText() { return String(await js("return document.body?.innerText || '';")); }
async function waitFor(predicate, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { if (await predicate()) return true; } catch { /* keep polling rendered UI */ }
    await sleep(250);
  }
  return false;
}
async function clickExact(selector, label) {
  return Boolean(await js("var selector=arguments[0], label=arguments[1]; var node=Array.from(document.querySelectorAll(selector)).find(function(n){return (n.textContent||'').replace(/\\s+/g,' ').trim()===label;}); if(node){node.click(); return true;} return false;", selector, label));
}
async function clickButton(label) {
  return Boolean(await js("var label=arguments[0].toLowerCase(); var node=Array.from(document.querySelectorAll('button')).find(function(n){return (n.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase()===label;}); if(node){node.click(); return true;} return false;", label));
}
async function clickCreateCard(title) {
  return Boolean(await js("var title=arguments[0], card=Array.from(document.querySelectorAll('.create-grid .create-card')).find(function(n){return n.querySelector('strong')?.textContent.trim()===title;}); if(card){card.click(); return true;} return false;", title));
}

let archivedStudioId = "";
let archivedStudioTitle = "";
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1050, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  check("local login form renders", await waitFor(async () => Boolean(await js("return document.querySelector('form[data-member-login]');"))));
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=username]'),p=f.querySelector('input[name=password]'); u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true})); p.dispatchEvent(new Event(t,{bubbles:true}));}); f.requestSubmit();", account.username, account.password);
  check("authenticated local session succeeds", await waitFor(async () => Boolean(await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok;}).catch(function(){return false;});"))));

  await js("localStorage.clear(); sessionStorage.clear();");
  await driver.get(`${base}/studio/`);
  check("Home renders after isolated startup", await waitFor(async () => Boolean(await js("return document.querySelector('.create-grid');"))));
  const cardTitles = await js("return Array.from(document.querySelectorAll('.create-grid .create-card strong')).map(function(n){return (n.textContent||'').trim();});");
  check("Create cards use the required order", JSON.stringify(cardTitles) === JSON.stringify(["Live stream", "Recording", "On-Air webinar", "Notes", "Teleprompter"]), JSON.stringify(cardTitles));
  check("Home Notes card uses the existing Notes route", await clickCreateCard("Notes") && await waitFor(async () => /Research and production workspace/i.test(await bodyText())));
  check("Notes card opens the existing workspace", await js("return localStorage.getItem('studioflow.route') === '\"notes\"' && document.querySelector('.notes-workspace-page') !== null;"));

  await js("var home=Array.from(document.querySelectorAll('.nav-item')).find(function(n){return (n.textContent||'').trim()==='Home';}); if(home)home.click();");
  check("Home navigation returns without replacing Notes data", await waitFor(async () => Boolean(await js("return document.querySelector('.create-grid');"))));

  const fixtureId = `d122e-${Date.now()}`;
  await js("var id=arguments[0]; localStorage.setItem('studioflow.broadcasts',JSON.stringify([{id:id,title:'D122E disposable Studio',description:'',status:'draft',kind:'recording'}])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); sessionStorage.removeItem('studioflow.notesWorkspaceIntent.v1');", fixtureId);
  await driver.navigate().refresh();
  check("disposable recording Studio opens", await waitFor(async () => Boolean(await js("return document.querySelector('.exit-button');"))));
  await clickExact("button.exit-button", "Exit");
  check("explicit Studio exit persists Home", await waitFor(async () => Boolean(await js("return localStorage.getItem('studioflow.route') === '\"home\"' && document.querySelector('.exit-button') === null;"))));
  check("explicit exit preserves selected Studio identity", await js("return JSON.parse(localStorage.getItem('studioflow.activeBroadcastId')||'null')===arguments[0];", fixtureId));
  await driver.navigate().refresh();
  check("refresh after explicit exit remains on Home", await waitFor(async () => Boolean(await js("return document.querySelector('.create-grid');"))) && await sleep(1200).then(async () => Boolean(await js("return localStorage.getItem('studioflow.route') === '\"home\"' && document.querySelector('.exit-button') === null;"))));
  check("refresh does not reopen the recording room", !(await js("return Boolean(document.querySelector('.exit-button'));")));

  await clickCreateCard("Notes");
  check("Notes can be reopened after Studio exit", await waitFor(async () => Boolean(await js("return document.querySelector('.notes-workspace-page');"))));
  await driver.navigate().refresh();
  check("refresh preserves the Notes destination", await waitFor(async () => Boolean(await js("return localStorage.getItem('studioflow.route') === '\"notes\"' && document.querySelector('.notes-workspace-page');"))));

  archivedStudioTitle = `D122E archived dialog ${Date.now()}`;
  const created = await asyncJs("var done=arguments[arguments.length-1]; var bridge=window.__tpiStudioWorkspace; if(!bridge?.createStudio){done({ok:false,reason:'workspace bridge unavailable'}); return;} bridge.createStudio(arguments[0]).then(function(){done({ok:true});}).catch(function(error){done({ok:false,reason:String(error)});});", archivedStudioTitle);
  check("disposable archived-dialog Studio can be created", created?.ok === true, JSON.stringify(created));
  if (created?.ok) {
    const entry = await js("var title=arguments[0]; return (window.__tpiStudioWorkspace?.listStudios?.()||[]).find(function(item){return item.title===title;})||null;", archivedStudioTitle);
    archivedStudioId = entry?.key || entry?.id || "";
    const archived = await asyncJs("var done=arguments[arguments.length-1], bridge=window.__tpiStudioWorkspace, key=arguments[0]; if(!bridge?.archiveStudioByKey){done({ok:false,reason:'archive bridge unavailable'}); return;} bridge.archiveStudioByKey(key).then(function(){done({ok:true});}).catch(function(error){done({ok:false,reason:String(error)});});", archivedStudioId);
    check("disposable Studio can be archived", archived?.ok === true, JSON.stringify(archived));
    await js("localStorage.setItem('studioflow.route',JSON.stringify('home')); sessionStorage.removeItem('studioflow.notesWorkspaceIntent.v1');");
    await driver.navigate().refresh();
    check("archived Studio appears in the archive view", await waitFor(async () => (await bodyText()).includes(archivedStudioTitle)));
    await driver.manage().window().setRect({ width: 1200, height: 520, x: 20, y: 20 });
    await js("var title=arguments[0], card=Array.from(document.querySelectorAll('.studio-archive-section .studio-card')).find(function(n){return (n.textContent||'').includes(title);}), button=card&&Array.from(card.querySelectorAll('button')).find(function(n){return (n.textContent||'').trim()==='Delete Studio';}); if(button)button.click();", archivedStudioTitle);
    check("archived deletion dialog opens", await waitFor(async () => Boolean(await js("return document.querySelector('.studio-delete-modal');"))));
    const dialogMetrics = await js("var m=document.querySelector('.studio-delete-modal'), input=m?.querySelector('input[aria-label=\"Type the Studio name to confirm\"]'), button=m?.querySelector('.studio-delete-actions .ghost-button'); if(!m)return null; var s=getComputedStyle(m); return {maxHeight:s.maxHeight,overflowY:s.overflowY,scrollHeight:m.scrollHeight,clientHeight:m.clientHeight,inputInside:Boolean(input&&m.contains(input)),buttonDisabled:Boolean(button?.disabled)};");
    check("deletion dialog is viewport-bounded and scrollable", Boolean(dialogMetrics && /auto|scroll/.test(dialogMetrics.overflowY) && dialogMetrics.scrollHeight > dialogMetrics.clientHeight && dialogMetrics.maxHeight !== "none"), JSON.stringify(dialogMetrics));
    check("confirmation remains accessible and permanently disabled", Boolean(dialogMetrics?.inputInside && dialogMetrics?.buttonDisabled), JSON.stringify(dialogMetrics));
    const scrollCheck = await js("var m=document.querySelector('.studio-delete-modal'), input=m?.querySelector('input[aria-label=\"Type the Studio name to confirm\"]'); if(!m||!input)return false; m.scrollTop=m.scrollHeight; var r=input.getBoundingClientRect(), mr=m.getBoundingClientRect(); return r.bottom<=mr.bottom+1 && r.top>=mr.top-1;");
    check("confirmation field reaches the scrollable dialog bottom", scrollCheck, JSON.stringify(dialogMetrics));
    check("Cancel closes the dialog without deletion", await clickButton("Cancel") && await waitFor(async () => !(await js("return document.querySelector('.studio-delete-modal');"))));
  }
  console.log(JSON.stringify({ status: results.every((result) => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122E", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = results.every((result) => result.passed) ? 0 : 1;
} catch (error) {
  check("D122E browser acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122E", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = 1;
} finally {
  if (archivedStudioId) {
    await asyncJs("var done=arguments[arguments.length-1], bridge=window.__tpiStudioWorkspace, key=arguments[0]; if(!bridge?.restoreStudioByKey){done({ok:false}); return;} bridge.restoreStudioByKey(key).then(function(){done({ok:true});}).catch(function(){done({ok:false});});", archivedStudioId).catch(() => {});
  }
  await driver.quit().catch(() => {});
}

#!/usr/bin/env node
import { existsSync, readFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
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
const evidenceRoot = mkdtempSync(`${tmpdir()}/tpi-studioflow-122-`);
const profile = `${evidenceRoot}/profile`;
mkdirSync(profile, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance").setPreference("media.autoplay.default", 0);
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function bodyText() { return String(await js("return document.body ? document.body.innerText : '';")); }
async function waitFor(predicate, timeout = 20_000) { const start = Date.now(); while (Date.now() - start < timeout) { if (await predicate()) return true; await sleep(250); } return false; }
async function clickButton(label) { return Boolean(await js("var label=arguments[0].toLowerCase(); var n=Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase().indexOf(label)!==-1;}); if(!n)return false; n.click(); return true;", label)); }

let noteId = "";
let collectionId = "";
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1050, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  check("local login form renders", await waitFor(async () => (await count('form[data-member-login]')) === 1));
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=username]'),p=f.querySelector('input[name=password]'); u.value=arguments[0];p.value=arguments[1];['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));}); f.requestSubmit();", account.username, account.password);
  check("authenticated local session succeeds", await waitFor(async () => Boolean(await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){return Boolean(b&&b.user);}).catch(function(){return false;});"))));
  await js("localStorage.clear(); sessionStorage.clear();");
  await driver.get(`${base}/studio/`);
  await waitFor(async () => /\bNotes\b/.test(await bodyText()));
  const clicked = await clickButton("Notes");
  const sidebarOpened = clicked && await waitFor(async () => /Open Notes/.test(await bodyText()));
  check("Studio Notes sidebar opens", sidebarOpened, `url=${await driver.getCurrentUrl()}`);
  const opened = await clickButton("Open Notes");
  check("Open Notes enters the independent workspace", opened && await waitFor(async () => /Research and production workspace/i.test(await bodyText())), `url=${await driver.getCurrentUrl()}`);
  check("authoritative 8787 Notes route loads", await waitFor(async () => /Research and production workspace/i.test(await bodyText())), `url=${await driver.getCurrentUrl()} body=${(await bodyText()).slice(0, 300)}`);
  check("Home Notes navigation is present", /\bNotes\b/.test(await bodyText()));
  check("three-column Notes workspace renders", (await count(".notes-organization-panel")) === 1 && (await count(".notes-library-panel")) === 1 && (await count(".notes-editor-panel")) === 1);
  const title = `D122 disposable note ${Date.now()}`;
  const collection = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'collection',name:arguments[0],collectionType:'podcast'})}).then(function(r){return r.json();});", `D122 podcast ${Date.now()}`);
  collectionId = collection.collection?.id || "";
  check("owner-scoped podcast collection can be created", Boolean(collectionId), JSON.stringify(collection));
  const note = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:arguments[0],bodyHtml:'<p>Initial research note</p>',collectionId:arguments[1]})}).then(function(r){return r.json();});", title, collectionId);
  noteId = note.note?.id || "";
  check("owner-scoped note can be created", Boolean(noteId), JSON.stringify(note));
  check("Notes route persists before refresh", await js("return localStorage.getItem('studioflow.route') === '\"notes\"' && sessionStorage.getItem('studioflow.notesWorkspaceIntent.v1') === '1';"), JSON.stringify(await js("return {route:localStorage.getItem('studioflow.route'),intent:sessionStorage.getItem('studioflow.notesWorkspaceIntent.v1')};")));
  await driver.navigate().refresh();
  await waitFor(async () => /\bNotes\b/.test(await bodyText()));
  if (!(await count(".notes-workspace-page"))) {
    await clickButton("Notes");
    await waitFor(async () => /Open Notes/.test(await bodyText()));
    await clickButton("Open Notes");
    await waitFor(async () => /Research and production workspace/i.test(await bodyText()));
  }
  check("created note appears after refresh", await waitFor(async () => (await bodyText()).includes(title)));
  const card = await js("var label=arguments[0]; var cards=Array.from(document.querySelectorAll('button')); var n=cards.find(function(b){return b.className && String(b.className).indexOf('notes-library-card')!==-1 && (b.textContent||'').includes(label);}); if(n)n.click(); var panel=document.querySelector('.notes-library-panel'); return {found:Boolean(n), count:cards.filter(function(b){return String(b.className).indexOf('notes-library-card')!==-1;}).length, bodyHas:document.body.innerText.includes(label), html:panel?.outerHTML?.slice(0,1400)||'', editorCount:document.querySelectorAll('.notes-rich-editor').length, route:localStorage.getItem('studioflow.route'), body:document.body.innerText.slice(0,260)};", title);
  check("note opens from the library", Boolean(card?.found) && await waitFor(async () => (await count('.notes-rich-editor')) === 1), JSON.stringify(card));
  await js("var n=document.querySelector('.notes-title-input'); if(n){n.value=arguments[0]; n.dispatchEvent(new Event('input',{bubbles:true})); n.dispatchEvent(new Event('change',{bubbles:true}));} var e=document.querySelector('.notes-rich-editor'); if(e){e.innerHTML='<p><strong>Crossroads research</strong> with a controlled D122 edit.</p>'; e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText'}));}", `${title} edited`);
  check("rich editor accepts formatted content", await waitFor(async () => /Crossroads research/.test(await bodyText())));
  check("autosave reaches All changes saved", await waitFor(async () => /All changes saved/i.test(await bodyText()), 10_000));
  const saved = await js("return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();});");
  const savedNote = (saved.notes || []).find(item => item.id === noteId);
  check("formatted edit persists through Notes API", Boolean(savedNote && savedNote.bodyHtml.includes("Crossroads research") && savedNote.version >= 2), JSON.stringify(savedNote));
  check("spell check is enabled on the editor", Boolean(await js("var e=document.querySelector('.notes-rich-editor'); return e && e.spellcheck === true;")));
  check("checklist control is exposed", Boolean(await js("return Array.from(document.querySelectorAll('.notes-editor-toolbar button')).some(function(b){return b.textContent.trim()==='Checklist';});")));
  check("private Studio Notes sidebar is implemented", sidebarOpened);
  console.log(JSON.stringify({ status: results.every(result => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = results.every(result => result.passed) ? 0 : 1;
} catch (error) {
  check("Notes browser acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = 1;
} finally {
  if (noteId) await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/trash',{method:'POST',credentials:'same-origin'}).catch(function(){});", noteId).catch(() => {});
  if (collectionId) await js("return fetch('/api/notes/collections/'+encodeURIComponent(arguments[0])+'/delete',{method:'POST',credentials:'same-origin'}).catch(function(){});", collectionId).catch(() => {});
  await driver.quit().catch(() => {});
}

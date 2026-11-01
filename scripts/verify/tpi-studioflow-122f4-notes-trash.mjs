#!/usr/bin/env node
import { existsSync, readFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const sourceFile = "/Users/toddknipple/Documents/StudioFlow/web-122/src/NotesView.tsx";
const workerFile = resolve(repoRoot, "functions/api/[[path]].js");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
if (![binary, geckodriver, credentialsFile, sourceFile, workerFile].every(existsSync)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-122F.4", reason: "Firefox, Geckodriver, credentials, or source files are unavailable." }));
  process.exit(1);
}
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
if (!account) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-122F.4", reason: "Synthetic test_admin credentials are unavailable." }));
  process.exit(1);
}
const evidenceRoot = mkdtempSync(`${tmpdir()}/tpi-studioflow-122f4-`);
const profile = `${evidenceRoot}/profile`;
mkdirSync(profile, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const results = [];
const check = (name, passed, detail = "") => { const result = { name, passed: Boolean(passed), detail: passed ? "" : String(detail) }; results.push(result); console.error(`${result.passed ? "PASS" : "FAIL"} ${name}${result.detail ? ` — ${result.detail}` : ""}`); };
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function bodyText() { return String(await js("return document.body ? document.body.innerText : '';")); }
async function count(selector) { return Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)); }
async function waitFor(predicate, timeout = 15_000) { const started = Date.now(); while (Date.now() - started < timeout) { if (await predicate()) return true; await sleep(250); } return false; }
async function clickText(text) { return Boolean(await js("var wanted=arguments[0].toLowerCase(); var node=Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase().includes(wanted);}); if(!node)return false; node.click(); return true;", text)); }
async function clickTrash() { return Boolean(await js("var node=Array.from(document.querySelectorAll('button.notes-nav-item')).find(function(b){return (b.textContent||'').trim().toLowerCase()==='trash';}); if(!node)return false; node.click(); return true;")); }
async function clickRestore() { return Boolean(await js("var node=document.querySelector('button.notes-restore-action'); if(!node)return false; node.click(); return true;")); }
async function clickPermanent() { return Boolean(await js("var node=document.querySelector('button.notes-danger-action'); if(!node)return false; node.click(); return true;")); }
async function login() {
  await driver.get(`${base}/member-login.html`);
  await waitFor(async () => (await count('form[data-member-login]')) === 1);
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=username]'),p=f.querySelector('input[name=password]'); u.value=arguments[0];p.value=arguments[1];['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));}); f.requestSubmit();", account.username, account.password);
  return await waitFor(async () => Boolean(await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){return Boolean(b&&b.user);}).catch(function(){return false;});")));
}
async function noteApi(id, method = "GET", path = "") {
  return js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+arguments[1],{method:arguments[2],credentials:'same-origin',headers:{'Content-Type':'application/json'},body:arguments[3]||undefined}).then(async function(r){return {status:r.status,body:await r.json().catch(function(){return {};})};});", id, path, method, arguments[3] || undefined);
}
async function createNote(title, collectionId, bodyHtml = "<p>Disposable Trash test content</p>") {
  return js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:arguments[0],titleMode:'manual',bodyHtml:arguments[1],collectionId:arguments[2]})}).then(function(r){return r.json();});", title, bodyHtml, collectionId);
}
async function setRoute() {
  await js("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('studioflow.route',JSON.stringify('notes')); sessionStorage.setItem('studioflow.notesWorkspaceIntent.v1','1');");
  await driver.get(`${base}/studio/`);
  await waitFor(async () => /Research and production workspace/i.test(await bodyText()));
}
async function selectCard(title) {
  return Boolean(await js("var wanted=arguments[0]; var card=Array.from(document.querySelectorAll('.notes-library-card')).find(function(n){return (n.textContent||'').includes(wanted);}); if(card)card.click(); return Boolean(card);", title));
}
async function trashSelected(title) {
  await selectCard(title);
  const clicked = await js("var b=document.querySelector('button[aria-label=" + JSON.stringify("Move to trash") + "]'); if(!b)b=Array.from(document.querySelectorAll('button')).find(function(n){return n.title==='Move to trash';}); if(b)b.click(); return Boolean(b);");
  return clicked && await waitFor(async () => !((await bodyText()).includes(title) && (await js("return Boolean(document.querySelector('.notes-title-input')?.value===arguments[0]);", title))));
}
const createdIds = [];
let collectionId = "";
let missingFolderId = "";
let restoreNoteId = "";
let permanentNoteId = "";
let cancelNoteId = "";
let missingFolderNoteId = "";
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1050, x: 20, y: 20 });
  check("isolated Firefox login succeeds", await login());
  const collection = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'collection',name:arguments[0],collectionType:'podcast'})}).then(function(r){return r.json();});", `122F4 Trash project ${Date.now()}`);
  collectionId = collection.collection?.id || "";
  check("disposable project container created", Boolean(collectionId), JSON.stringify(collection));
  const restoreNote = await createNote(`122F4 restore ${Date.now()}`, collectionId, "<p>Restore me with formatting</p><p>Second paragraph remains.</p>");
  restoreNoteId = restoreNote.note?.id || ""; createdIds.push(restoreNoteId);
  const update = await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0]),{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:arguments[1],titleMode:'manual',bodyHtml:arguments[2],collectionId:arguments[3],expectedVersion:arguments[4],attachmentIds:[]})}).then(async function(r){return {status:r.status,body:await r.json()};});", restoreNoteId, restoreNote.note.title, "<p><strong>Restore me with formatting</strong></p><p>Second paragraph remains.</p>", collectionId, restoreNote.note.version);
  check("disposable note has a recoverable revision", update.status === 200, JSON.stringify(update));
  const permanentNote = await createNote(`122F4 permanent ${Date.now()}`, collectionId, "<p>Permanent delete candidate</p>");
  permanentNoteId = permanentNote.note?.id || ""; createdIds.push(permanentNoteId);
  const cancelNote = await createNote(`122F4 cancel ${Date.now()}`, collectionId, "<p>Cancel candidate</p>");
  cancelNoteId = cancelNote.note?.id || ""; createdIds.push(cancelNoteId);
  const missingFolder = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'collection',name:arguments[0],collectionType:'folder'})}).then(function(r){return r.json();});", `122F4 deleted folder ${Date.now()}`);
  missingFolderId = missingFolder.collection?.id || "";
  const missingNote = await createNote(`122F4 missing folder ${Date.now()}`, missingFolderId, "<p>Missing folder restore candidate</p>");
  missingFolderNoteId = missingNote.note?.id || ""; createdIds.push(missingFolderNoteId);
  await setRoute();
  check("Trash navigation is present", (await bodyText()).includes("Trash"));
  check("active note moves to Trash from the editor", await trashSelected(restoreNote.note.title));
  check("Trash view shows the deleted note", await clickTrash() && await waitFor(async () => (await bodyText()).includes(restoreNote.note.title)));
  await selectCard(restoreNote.note.title);
  check("trashed note is read-only", await js("var e=document.querySelector('.notes-rich-editor'); return Boolean(e&&e.contentEditable==='false');"));
  check("Trash editor exposes Restore and Delete Permanently", Boolean(await js("return Array.from(document.querySelectorAll('button')).some(function(b){return (b.textContent||'').trim()==='Restore';}) && Array.from(document.querySelectorAll('button')).some(function(b){return (b.textContent||'').includes('Delete permanently');});")));
  check("deleted timestamp is recorded", Boolean(await js("var wantedId=arguments[0]; return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){var n=(b.notes||[]).find(function(x){return x.id===wantedId;}); return Boolean(n&&n.status==='trash'&&n.deletedAt);}).catch(function(){return false;});", restoreNoteId)));
  await clickRestore();
  check("Restore returns note to the active library", await waitFor(async () => Boolean(await js("var wantedId=arguments[0]; return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){var n=(b.notes||[]).find(function(x){return x.id===wantedId;}); return Boolean(n&&n.status==='active');}).catch(function(){return false;});", restoreNoteId))));
  const restored = await js("var wantedId=arguments[0]; return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){return (b.notes||[]).find(function(x){return x.id===wantedId;});});", restoreNoteId);
  check("Restore preserves content and folder association", Boolean(restored?.bodyHtml.includes("Restore me with formatting") && restored.collectionId === collectionId && restored.deletedAt === null), JSON.stringify(restored));
  const revisions = await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/revisions',{credentials:'same-origin'}).then(function(r){return r.json();});", restoreNoteId);
  check("Restore preserves revision history", Array.isArray(revisions.revisions) && revisions.revisions.length >= 2, JSON.stringify(revisions));
  await trashSelected(permanentNote.note.title); await clickTrash(); await waitFor(async () => (await bodyText()).includes(permanentNote.note.title)); await selectCard(permanentNote.note.title);
  await js("window.confirm=function(){return false;};"); await clickPermanent(); await sleep(500);
  const cancelled = await js("var wantedId=arguments[0]; return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){return (b.notes||[]).find(function(x){return x.id===wantedId;});});", permanentNoteId);
  check("canceling permanent deletion preserves the note", cancelled?.status === "trash", JSON.stringify(cancelled));
  await js("window.confirm=function(){return true;};"); await clickPermanent();
  check("confirmed permanent deletion removes only the selected note", await waitFor(async () => Boolean(await js("var wantedId=arguments[0]; return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){return !(b.notes||[]).some(function(x){return x.id===wantedId;});}).catch(function(){return false;});", permanentNoteId))));
  await trashSelected(cancelNote.note.title); await clickTrash(); await waitFor(async () => (await bodyText()).includes(cancelNote.note.title));
  const unauthenticated = await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/permanent-delete',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'DELETE PERMANENTLY'})}).then(async function(r){return {status:r.status,body:await r.json()};});", cancelNoteId);
  check("unauthenticated permanent deletion is rejected", unauthenticated.status === 401, JSON.stringify(unauthenticated));
  await js("return fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'}).then(function(){return true;});");
  check("logged-out Notes access is denied", await js("return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.status===401;});"));
  check("permanent-delete route requires explicit confirmation", await login() && (await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/permanent-delete',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({})}).then(async function(r){return {status:r.status,body:await r.json()};});", cancelNoteId)).status === 400);
  await setRoute();
  await trashSelected(missingNote.note.title); await clickTrash(); await waitFor(async () => (await bodyText()).includes(missingNote.note.title)); await selectCard(missingNote.note.title);
  await js("return fetch('/api/notes/collections/'+encodeURIComponent(arguments[0])+'/delete',{method:'POST',credentials:'same-origin'}).then(function(r){return r.json();});", missingFolderId);
  await driver.navigate().refresh(); await waitFor(async () => /Research and production workspace/i.test(await bodyText())); await clickTrash(); await waitFor(async () => (await bodyText()).includes(missingNote.note.title)); await selectCard(missingNote.note.title); await js("window.confirm=function(){return true;};"); await clickRestore();
  check("restore reports a missing original folder safely", await waitFor(async () => /original folder is no longer available/i.test(await bodyText())));
  const fallback = await js("var wantedId=arguments[0]; return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(b){return (b.notes||[]).find(function(x){return x.id===wantedId;});});", missingFolderNoteId);
  check("missing-folder restore falls back to All Notes", fallback?.status === "active" && fallback.collectionId === null, JSON.stringify(fallback));
  const workerSource = readFileSync(workerFile, "utf8");
  const notesSource = readFileSync(sourceFile, "utf8");
  check("server enforces owner-scoped Trash actions", workerSource.includes("getOwnedNote(env, id, user.id)") && workerSource.includes("status = 'trash'"));
  check("attachment-bearing permanent deletion is fail-safe", workerSource.includes("note_attachment_cleanup_blocked") && workerSource.includes("studio_note_attachments WHERE note_id"));
  check("trashed editor cannot autosave edits", notesSource.includes("selectedNote.status === \"trash\" || !dirtyRef.current") && notesSource.includes("contentEditable={Boolean(selectedNote && !selectedNoteIsTrashed)}"));
  console.log(JSON.stringify({ status: results.every(result => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122F.4", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = results.every(result => result.passed) ? 0 : 1;
} catch (error) {
  check("Trash browser acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122F.4", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = 1;
} finally {
  if (await js("return Boolean(document.cookie);" ).catch(() => false)) await js("return fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(arguments[0])}).catch(function(){});", account).catch(() => {});
  for (const id of createdIds) if (id) await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/trash',{method:'POST',credentials:'same-origin'}).catch(function(){});", id).catch(() => {});
  for (const id of [permanentNoteId, cancelNoteId, missingFolderNoteId, restoreNoteId]) if (id) await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/permanent-delete',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'DELETE PERMANENTLY'})}).catch(function(){});", id).catch(() => {});
  for (const id of [missingFolderId, collectionId]) if (id) await js("return fetch('/api/notes/collections/'+encodeURIComponent(arguments[0])+'/delete',{method:'POST',credentials:'same-origin'}).catch(function(){});", id).catch(() => {});
  await driver.quit().catch(() => {});
}

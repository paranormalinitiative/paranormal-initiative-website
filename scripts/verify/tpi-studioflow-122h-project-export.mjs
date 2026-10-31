#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, mkdirSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
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
const evidenceRoot = mkdtempSync(`${tmpdir()}/tpi-studioflow-122h-`);
const profile = `${evidenceRoot}/profile`;
const downloads = `${evidenceRoot}/downloads`;
mkdirSync(profile, { recursive: true });
mkdirSync(downloads, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance")
  .setPreference("browser.download.folderList", 2)
  .setPreference("browser.download.dir", downloads)
  .setPreference("browser.download.useDownloadDir", true)
  .setPreference("browser.helperApps.neverAsk.saveToDisk", "application/zip,application/octet-stream")
  .setPreference("browser.download.manager.showWhenStarting", false);
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(predicate, timeout = 20_000) { const start = Date.now(); while (Date.now() - start < timeout) { if (await predicate()) return true; await sleep(250); } return false; }
async function bodyText() { return String(await js("return document.body?.innerText || '';")); }
async function clickText(text) { return Boolean(await js("var wanted=arguments[0].toLowerCase(); var item=Array.from(document.querySelectorAll('button,[role=menuitem]')).find(function(node){return (node.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase()===wanted;}); if(item){item.click();return true;} return false;", text)); }
async function clickAria(prefix) { return Boolean(await js("var wanted=arguments[0].toLowerCase(); var item=Array.from(document.querySelectorAll('button,[role=button]')).find(function(node){return (node.getAttribute('aria-label')||'').toLowerCase().startsWith(wanted);}); if(item){item.click();return true;} return false;", prefix)); }

let projectId = "";
let episodeId = "";
let noteId = "";
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1050, x: 20, y: 20 });
  await driver.get(`${base}/member-login.html`);
  check("local login form renders", await waitFor(async () => Boolean(await js("return document.querySelector('form[data-member-login]');"))));
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=username]'),p=f.querySelector('input[name=password]'); u.value=arguments[0];p.value=arguments[1];['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));}); f.requestSubmit();", account.username, account.password);
  check("authenticated local session succeeds", await waitFor(async () => Boolean(await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){return Boolean(b.user);}).catch(function(){return false;});"))));
  const projectName = `D122H export project ${Date.now()}`;
  const project = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'collection',name:arguments[0],collectionType:'podcast'})}).then(function(r){return r.json();});", projectName);
  projectId = project.collection?.id || "";
  check("disposable podcast project created", Boolean(projectId), JSON.stringify(project));
  const episode = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'collection',name:arguments[0],collectionType:'episode',parentId:arguments[1]})}).then(function(r){return r.json();});", "Episode 001 — Export Verification", projectId);
  episodeId = episode.collection?.id || "";
  check("disposable episode is associated with project", Boolean(episodeId && episode.collection?.parentId === projectId), JSON.stringify(episode));
  const note = await js("return fetch('/api/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:arguments[0],titleMode:'manual',bodyHtml:'<p>Offline project export verification.</p><p>This note must remain readable outside StudioFlow.</p>',collectionId:arguments[1]})}).then(function(r){return r.json();});", "Research Export Note", episodeId);
  noteId = note.note?.id || "";
  check("disposable note is associated with episode", Boolean(noteId && note.note?.collectionId === episodeId), JSON.stringify(note));
  await driver.get(`${base}/studio/`);
  await js("localStorage.setItem('studioflow.route',JSON.stringify('notes')); sessionStorage.setItem('studioflow.notesWorkspaceIntent.v1','1');");
  await driver.navigate().refresh();
  if (!(await waitFor(async () => /Research and production workspace/i.test(await bodyText()), 3_000))) {
    await clickAria("Notes");
    if (!(await waitFor(async () => /Open Notes/.test(await bodyText()), 5_000))) await clickText("Notes");
    if (/Open Notes/.test(await bodyText())) await clickText("Open Notes");
  }
  check("Notes workspace loads", await waitFor(async () => /Research and production workspace/i.test(await bodyText())));
  const projectVisibility = await js("return fetch('/api/notes?status=all',{credentials:'same-origin'}).then(async function(r){var text=await r.text(); var body={}; try{body=JSON.parse(text);}catch{} return {status:r.status,body:document.body?.innerText||'',names:(body.collections||[]).map(function(item){return item.name;}),error:body.error||text.slice(0,200)};});");
  check("project appears in organization tree", await waitFor(async () => (await bodyText()).includes(projectName)), JSON.stringify(projectVisibility));
  check("podcast project exposes View Project Files", await clickAria(`Folder actions ${projectName}`) && await waitFor(async () => /View Project Files/.test(await bodyText())));
  check("Project Files dialog opens", await clickText("View Project Files") && await waitFor(async () => /Project Files/.test(await bodyText())));
  check("dialog reports verified project resources", /episodes/.test(await bodyText()) && /notes/.test(await bodyText()) && /ZIP archive/.test(await bodyText()));
  check("Download Project action is available", await clickText("Download Project"));
  const downloadStarted = await waitFor(() => readdirSync(downloads).some((file) => file.endsWith(".zip")), 30_000);
  check("organized ZIP archive downloads", downloadStarted, JSON.stringify(readdirSync(downloads)));
  const zipName = readdirSync(downloads).find((file) => file.endsWith(".zip"));
  if (zipName) {
    const listing = execFileSync("unzip", ["-Z1", `${downloads}/${zipName}`], { encoding: "utf8" });
    check("ZIP contains project manifest", listing.includes("Project Information/project-manifest.json"), listing);
    check("ZIP contains episode metadata", listing.includes("Episode Information/collection.json"), listing);
    check("ZIP contains offline note HTML", listing.includes("Notes/Research Export Note.html"), listing);
    check("ZIP contains no authenticated application URL requirement", !listing.includes("127.0.0.1") && !listing.includes("paranormalinitiative.com"), listing);
    const manifestPath = listing.split("\n").find((line) => line.endsWith("/Project Information/project-manifest.json"));
    const manifest = manifestPath ? execFileSync("unzip", ["-p", `${downloads}/${zipName}`, manifestPath], { encoding: "utf8" }) : "";
    check("manifest records explicit unassociated-resource omissions", /teleprompter scripts/.test(manifest) && /recordings and uploaded media/.test(manifest), manifest);
  }
  console.log(JSON.stringify({ status: results.every((result) => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122H", browser: "Firefox Developer Edition", environment: base, checks: results, downloadedArchive: zipName || null }, null, 2));
  process.exitCode = results.every((result) => result.passed) ? 0 : 1;
} catch (error) {
  check("project export browser acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122H", browser: "Firefox Developer Edition", environment: base, checks: results }, null, 2));
  process.exitCode = 1;
} finally {
  for (const id of [noteId]) if (id) await js("return fetch('/api/notes/'+encodeURIComponent(arguments[0])+'/trash',{method:'POST',credentials:'same-origin'}).catch(function(){});", id).catch(() => {});
  for (const id of [episodeId, projectId]) if (id) await js("return fetch('/api/notes/collections/'+encodeURIComponent(arguments[0])+'/delete',{method:'POST',credentials:'same-origin'}).catch(function(){});", id).catch(() => {});
  await driver.quit().catch(() => {});
}

#!/usr/bin/env node
import { existsSync, readFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const sourceFile = "/Users/toddknipple/Documents/StudioFlow/web-122/src/NotesView.tsx";
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile) || !existsSync(sourceFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox, Geckodriver, credentials, or the isolated Notes source is unavailable." }));
  process.exit(1);
}
const account = JSON.parse(readFileSync(credentialsFile, "utf8")).accounts?.test_admin;
const evidenceRoot = mkdtempSync(`${tmpdir()}/tpi-studioflow-122f-`);
const profile = `${evidenceRoot}/profile`;
mkdirSync(profile, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(predicate, timeout = 20_000) { const start = Date.now(); while (Date.now() - start < timeout) { if (await predicate()) return true; await sleep(250); } return false; }
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.get(`${base}/member-login.html`);
  check("login form renders", await waitFor(async () => Boolean(await js("return document.querySelector('form[data-member-login]');"))));
  await js("var f=document.querySelector('form[data-member-login]'),u=f.querySelector('input[name=username]'),p=f.querySelector('input[name=password]'); u.value=arguments[0];p.value=arguments[1];['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));}); f.requestSubmit();", account.username, account.password);
  check("authenticated local session succeeds", await waitFor(async () => Boolean(await js("return fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){return Boolean(b.user);}).catch(function(){return false;});"))));
  await js("localStorage.setItem('studioflow.route', JSON.stringify('notes')); sessionStorage.setItem('studioflow.notesWorkspaceIntent.v1','1');");
  await driver.get(`${base}/studio/`);
  check("Notes workspace loads on 8787", await waitFor(async () => Boolean(await js("return document.querySelector('.notes-workspace-page');"))));
  check("one connected organization panel is rendered", Number(await js("return document.querySelectorAll('.notes-workspace-grid > .notes-organization-panel').length;")) === 1);
  check("legacy global New Folder control is absent", Number(await js("return document.querySelectorAll('.notes-global-folder-action').length;")) === 0);
  check("collapse control is beside Organize", Boolean(await js("var p=document.querySelector('.notes-organization-panel'); var b=p&&p.querySelector('button[aria-label=\\\"Collapse organization panel\\\"]'); return Boolean(b&&b.closest('.notes-panel-heading'));")));
  check("far-right collapse duplicate is absent", Number(await js("return Array.from(document.querySelectorAll('button[aria-label=\\\"Collapse organization panel\\\"]')).filter(function(b){return !b.closest('.notes-organization-panel');}).length;")) === 0);
  const createLabels = await js("var p=document.querySelector('.notes-organization-create-actions'); return p?Array.from(p.querySelectorAll('button')).map(function(b){return (b.textContent||'').replace(/\\s+/g,' ').trim()}):[];");
  check("project, episode, and folder controls sit under Projects and folders", JSON.stringify(createLabels) === JSON.stringify(["+ New podcast project", "+ New episode", "New Folder"]), JSON.stringify(createLabels));
  check("research reference toolbar control is present", Boolean(await js("return document.querySelector('button[aria-label=\\\"Insert research reference\\\"]');")));
  check("research reference removal command is present in source", readFileSync(sourceFile, "utf8").includes("removeResearchReference"));
  await js("var b=document.querySelector('button[aria-label=\\\"Collapse organization panel\\\"]'); if(b)b.click();");
  check("collapsed organization has an accessible reopen control", await waitFor(async () => Boolean(await js("return document.querySelector('button[aria-label=\\\"Show organization panel\\\"]');"))));
  console.log(JSON.stringify({ status: checks.every(item => item.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122F", browser: "Firefox Developer Edition", environment: base, checks }, null, 2));
  process.exitCode = checks.every(item => item.passed) ? 0 : 1;
} catch (error) {
  check("D122F Notes completion checks", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122F", checks }, null, 2));
  process.exitCode = 1;
} finally {
  await driver.quit().catch(() => {});
}

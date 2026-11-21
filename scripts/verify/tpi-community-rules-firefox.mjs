#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_PROFILE_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const account = JSON.parse(readFileSync(resolve(root, ".local-dev/local-auth-credentials.json"), "utf8")).accounts.local_member;
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("This acceptance is local-only.");
if (![binary, geckodriver].every(existsSync)) throw new Error("Firefox Developer Edition and geckodriver are required.");

const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const wait = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
let driver;
try {
  const profile = mkdtempSync(join(tmpdir(), "tpi-community-rules-firefox-"));
  const options = new firefox.Options().setBinary(binary).addArguments("-profile", profile, "-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });

  await driver.get(`${base}/community-rules.html`);
  await wait(500);
  const publicState = await driver.executeScript("return {title:document.title, rules:Array.from(document.querySelectorAll('.community-rule h3')).filter(function(heading){return /^Rule \\d+/.test(heading.textContent.trim());}).length, agreement:Boolean(document.querySelector('.community-rules-agreement')), settingsHref:document.querySelector('.community-rules-footer-link a')?.getAttribute('href')};");
  check("short Community Rules page renders", publicState.title.includes("Community Rules") && publicState.rules === 10 && publicState.agreement && publicState.settingsHref === "member-dashboard.html#community-rules", JSON.stringify(publicState));

  await driver.get(`${base}/member-login.html`);
  const registrationState = await driver.executeScript("var form=document.querySelector('[data-member-register]'); var input=form?.querySelector('input[name=communityRulesAccepted]'); return {form:Boolean(form),required:Boolean(input?.required),link:input?.closest('label')?.querySelector('a')?.getAttribute('href')};");
  check("registration exposes a required Community Rules acknowledgement", registrationState.form && registrationState.required && registrationState.link === "community-rules.html", JSON.stringify(registrationState));

  const login = await driver.executeAsyncScript(`var done=arguments[arguments.length-1]; fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:arguments[0],password:arguments[1]})}).then(function(response){return response.json().then(function(body){done({status:response.status,user:body.user||null});});}).catch(function(error){done({status:0,error:String(error)});});`, account.username, account.password);
  check("isolated member session authenticates", login?.status === 200 && Boolean(login?.user));

  await driver.get(`${base}/member-home`);
  await wait(700);
  const composerState = await driver.executeScript("var link=document.querySelector('.composer-media-row a[href=\"community-rules.html\"]'); return {memberReady:document.body.classList.contains('member-ready'),text:link?.textContent.trim(),href:link?.getAttribute('href')};");
  check("member composer exposes Community Rules beside media controls", composerState.memberReady && composerState.text.replace(/\s+/g, " ").trim() === "⚖ Community Rules" && composerState.href === "community-rules.html", JSON.stringify(composerState));

  await driver.get(`${base}/member-dashboard.html#community-rules`);
  await wait(800);
  const settingsState = await driver.executeScript("var panel=document.querySelector('[data-settings-panel=community-rules]'); return {visible:Boolean(panel&&!panel.hidden),heading:panel?.querySelector('h2')?.textContent.trim(),rules:Array.from(panel?.querySelectorAll('.community-rule h3')||[]).filter(function(heading){return /^Rule \\d+/.test(heading.textContent.trim());}).length,shortHref:panel?.querySelector('a[href=\"community-rules.html\"]')?.getAttribute('href')};");
  check("Settings opens the full Community Code of Conduct", settingsState.visible && settingsState.heading === "Community Rules & Code of Conduct" && settingsState.rules === 19 && settingsState.shortHref === "community-rules.html", JSON.stringify(settingsState));
} catch (error) {
  check("Firefox Community Rules acceptance completed", false, error instanceof Error ? error.message : String(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter(item => !item.passed);
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", suite: "TPI Community Rules Firefox", environment: base, passed: results.length - failed.length, failed: failed.length, checks: results }, null, 2));
if (failed.length) process.exit(1);

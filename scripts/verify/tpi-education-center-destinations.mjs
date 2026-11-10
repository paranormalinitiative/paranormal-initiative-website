#!/usr/bin/env node

// Browser acceptance for the Education Center subject directory and its clean
// destination routes. Uses a disposable Firefox profile and a synthetic
// member account only.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_EDUCATION_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const productionAcceptance = process.env.TPI_FIREFOX_ALLOW_PRODUCTION === "1" && process.env.TPI_FIREFOX_PRODUCTION_QA === "approved";
const accountKey = process.env.TPI_EDUCATION_ACCOUNT || (productionAcceptance ? "production_qa" : "local_member");
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || (productionAcceptance
  ? resolve(root, ".local-dev/qa-studioflow-prod.json")
  : resolve(root, ".local-dev/local-auth-credentials.json"));
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = productionAcceptance ? credentials : credentials?.accounts?.[accountKey];
const localOrigin = /^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base);
const productionOrigin = base === "https://paranormalinitiative.com" && productionAcceptance && accountKey === "production_qa";
if (!localOrigin && !productionOrigin) throw new Error("Education Center verification requires the approved loopback Worker or guarded synthetic production acceptance.");
for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) throw new Error(`Required verification input is unavailable: ${file}`);
}
if (!account?.username || !account?.password) throw new Error(`Synthetic ${accountKey} account is unavailable.`);

const destinations = [
  "education-area-investigation-science", "education-area-evidence-science-analysis", "education-area-instrumentation-technology",
  "education-area-environmental-research", "education-area-evp-itc-research", "education-area-consciousness-human-experience",
  "education-area-ethics-professional-standards", "education-area-reporting-documentation", "education-area-education-community-development",
  "education-area-technology-development-ai", "education-area-artificial-intelligence", "education-area-historical-cultural-research",
  "investigation-development-series", "ghostology-101", "evp-itc-lessons", "field-articles", "method-exercises", "tpi-videos",
].map((path) => `/${path}`);

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);
let driver;

async function loginOnOrigin() {
  return driver.executeAsyncScript(`var done=arguments[arguments.length-1], username=arguments[0], password=arguments[1];
    fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username,password:password})})
      .then(function(response){return response.json().catch(function(){return {};}).then(function(body){done({status:response.status,user:body.user||null});});})
      .catch(function(error){done({status:0,error:String(error)});});`, account.username, account.password);
}

async function waitForDirectory() {
  const started = Date.now();
  let lastState = null;
  while (Date.now() - started < 20_000) {
    lastState = await driver.executeScript(`var host=document.querySelector('#tpi-education-subject-directory'), cards=document.querySelectorAll('.tpi-education-directory-card');
      return {host:!!host,loaded:host && host.dataset.loaded === 'true',count:cards.length,member:document.body.classList.contains('member-mode')};`);
    if (lastState.host && lastState.loaded && lastState.count === destinations.length && lastState.member) return;
    await sleep(200);
  }
  throw new Error(`Education Center directory did not finish rendering: ${JSON.stringify({ url: await driver.getCurrentUrl(), state: lastState })}`);
}

try {
  const profile = mkdtempSync(join(tmpdir(), "tpi-education-center-firefox-"));
  const options = new firefox.Options().setBinary(firefoxBinary).addArguments("-profile", profile, "-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1000 });
  await driver.get(`${base}/member-login.html`);
  const login = await loginOnOrigin();
  check("Firefox authenticates the synthetic member", login?.status === 200 && Boolean(login?.user), JSON.stringify({ status: login?.status }));
  await driver.get(`${base}/education-center`);
  await waitForDirectory();

  const directory = await driver.executeScript(`return Array.from(document.querySelectorAll('.tpi-education-directory-card')).map(function(card){return {href:new URL(card.getAttribute('href'),location.href).pathname,label:card.querySelector('h3')?.textContent.trim()||''};});`);
  const hrefs = directory.map((item) => item.href);
  check("Education Center renders all 18 Nova subjects", directory.length === destinations.length, JSON.stringify({ count: directory.length }));
  check("Education Center directory links match the Nova catalog", destinations.every((path) => hrefs.includes(path)), JSON.stringify({ missing: destinations.filter((path) => !hrefs.includes(path)) }));
  check("Investigation Science opens at its clean route", directory.find((item) => item.label === "Investigation Science")?.href === "/education-area-investigation-science", JSON.stringify(directory.find((item) => item.label === "Investigation Science")));
  const desktopLayout = await driver.executeScript(`var host=document.querySelector('#tpi-education-subject-directory'), first=document.querySelector('.tpi-education-directory-card');
    var hostRect=host.getBoundingClientRect(), firstRect=first.getBoundingClientRect();
    return {visible:hostRect.width > 0 && hostRect.height > 0, cardWidth:firstRect.width, scrollWidth:document.documentElement.scrollWidth, innerWidth:innerWidth};`);
  check("desktop subject directory is visible and contained", desktopLayout.visible && desktopLayout.scrollWidth <= desktopLayout.innerWidth + 1, JSON.stringify(desktopLayout));

  await driver.manage().window().setRect({ width: 390, height: 844 });
  await driver.get(`${base}/education-center`);
  await waitForDirectory();
  const mobileLayout = await driver.executeScript("return {count:document.querySelectorAll('.tpi-education-directory-card').length,scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth};");
  check("mobile subject directory keeps all subjects without horizontal overflow", mobileLayout.count === destinations.length && mobileLayout.scrollWidth <= mobileLayout.innerWidth + 1, JSON.stringify(mobileLayout));

  for (const path of destinations) {
    await driver.get(`${base}${path}`);
    const current = new URL(await driver.getCurrentUrl());
    const hasDocument = await driver.executeScript("return document.body && document.body.textContent.trim().length > 0;");
    check(`clean route loads: ${path}`, current.pathname === path && hasDocument, JSON.stringify({ path: current.pathname, hasDocument }));
  }
} catch (error) {
  check("Education Center browser acceptance completes", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((item) => !item.passed);
console.log(JSON.stringify({ suite: "TPI-EDUCATION-CENTER-DESTINATIONS", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", environment: base, passed: results.length - failed.length, total: results.length, failed }, null, 2));
if (failed.length) process.exit(1);

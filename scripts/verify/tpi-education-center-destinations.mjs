#!/usr/bin/env node

// Browser acceptance for the Education Center subject directory and its clean
// destination routes. Uses a disposable Firefox profile and a synthetic
// member account only.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
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
    lastState = await driver.executeScript(`var host=document.querySelector('#tpi-education-subject-directory'), shelves=document.querySelectorAll('.edu-accordion-item'), hostRect=host && host.getBoundingClientRect(), firstRect=shelves[0] && shelves[0].getBoundingClientRect(), ghostology=document.querySelector('.member-sidebar [data-nav="ghostology"]');
      return {host:!!host,loaded:host && host.dataset.loaded === 'true',count:shelves.length,member:document.body.classList.contains('member-mode'),ghostology:Boolean(ghostology),visible:Boolean(hostRect && hostRect.width > 0 && hostRect.height > 0 && firstRect && firstRect.width > 0 && firstRect.height > 0)};`);
    if (lastState.host && lastState.loaded && lastState.count === destinations.length && lastState.member && lastState.ghostology && lastState.visible) return;
    await sleep(200);
  }
  throw new Error(`Education Center directory did not finish rendering: ${JSON.stringify({ url: await driver.getCurrentUrl(), state: lastState })}`);
}

async function openRoute(path) {
  try {
    await driver.get(`${base}${path}`);
    return;
  } catch (error) {
    const current = new URL(await driver.getCurrentUrl());
    const ready = await driver.executeScript("return document.readyState !== 'loading' && Boolean(document.body && document.body.textContent.trim());");
    if (current.pathname === path && ready) return;
    throw error;
  }
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
  await driver.get(`${base}/ghostology-101?member=1`);
  await driver.wait(async () => (await driver.findElements(By.css(".member-sidebar"))).length > 0, 20_000);
  await driver.wait(async () => (await driver.findElements(By.css('.member-sidebar [data-nav="education-center"]'))).length > 0, 20_000);
  const ghostologyShell = await driver.executeScript(`return {
    memberMode: document.body.classList.contains('member-mode'),
    sidebar: Boolean(document.querySelector('.member-sidebar')),
    main: Boolean(document.querySelector('.member-main')),
    educationLabel: document.querySelector('.member-sidebar [data-nav="education-center"]')?.textContent.trim() || '',
    theme: document.documentElement.getAttribute('data-theme') || ''
  };`);
  check("Ghostology uses the shared member shell and active theme", ghostologyShell.memberMode && ghostologyShell.sidebar && ghostologyShell.main && ghostologyShell.educationLabel.includes("Education Center") && Boolean(ghostologyShell.theme), JSON.stringify(ghostologyShell));
  await driver.get(`${base}/education-center`);
  await waitForDirectory();
  const ghostologyNav = await driver.executeScript(`var link=document.querySelector('[data-nav="ghostology"]'); return {exists:Boolean(link),label:link?.textContent.trim()||'',href:link ? new URL(link.getAttribute('href'),location.href).pathname + new URL(link.getAttribute('href'),location.href).search : ''};`);
  check("left navigation exposes Ghostology", ghostologyNav.exists && ghostologyNav.label === "👻 Ghostology" && ghostologyNav.href === "/ghostology-101?member=1", JSON.stringify(ghostologyNav));

  const directory = await driver.executeScript(`return Array.from(document.querySelectorAll('.edu-accordion-item')).map(function(item){var card=item.querySelector('.edu-article-card[data-subject-overview="true"]'); return {href:card ? new URL(card.getAttribute('href'),location.href).pathname : '',label:item.querySelector('.edu-accordion-title')?.textContent.trim()||'',articleCount:item.querySelectorAll('.edu-article-card').length};});`);
  const hrefs = directory.map((item) => item.href);
  const structure = await driver.executeScript(`var bodyText=document.body.textContent || '', directorySection=document.querySelector('#tpi-education-subject-directory')?.closest('section');
    return {quickStart:/quick start/i.test(bodyText),moreResources:/more resources/i.test(bodyText),accordionItems:document.querySelectorAll('.edu-accordion-item').length,directoryCards:document.querySelectorAll('.tpi-education-directory-card').length,directorySectionCount:document.querySelectorAll('#tpi-education-subject-directory').length,directorySectionVisible:Boolean(directorySection && directorySection.getBoundingClientRect().width > 0)};`);
  check("Education Center uses 18 compact shelves without duplicate sections", !structure.quickStart && !structure.moreResources && structure.accordionItems === destinations.length && structure.directoryCards === 0 && structure.directorySectionCount === 1 && structure.directorySectionVisible, JSON.stringify(structure));
  check("Education Center renders all 18 Nova subjects", directory.length === destinations.length, JSON.stringify({ count: directory.length }));
  check("Education Center shelves link to all catalog subjects", destinations.every((path) => hrefs.includes(path)), JSON.stringify({ missing: destinations.filter((path) => !hrefs.includes(path)) }));
  check("every subject shelf contains an article list", directory.every((item) => item.articleCount > 0), JSON.stringify({ empty: directory.filter((item) => item.articleCount === 0).map((item) => item.label) }));
  check("Investigation Science opens at its clean route", directory.find((item) => item.label === "Investigation Science")?.href === "/education-area-investigation-science", JSON.stringify(directory.find((item) => item.label === "Investigation Science")));
  const openedShelf = await driver.executeScript(`var item=document.querySelector('.edu-accordion-item'), button=item && item.querySelector('[data-accordion-toggle]'); if (button) button.click(); return {open:Boolean(item && item.classList.contains('is-open')),expanded:button?.getAttribute('aria-expanded'),cards:item?.querySelectorAll('.edu-article-card').length || 0};`);
  check("subject shelves open to their article cards", openedShelf.open && openedShelf.expanded === "true" && openedShelf.cards > 0, JSON.stringify(openedShelf));
  const desktopLayout = await driver.executeScript(`var host=document.querySelector('#tpi-education-subject-directory'), first=document.querySelector('.edu-accordion-item');
    var hostRect=host.getBoundingClientRect(), firstRect=first.getBoundingClientRect();
    return {visible:hostRect.width > 0 && hostRect.height > 0, cardWidth:firstRect.width, scrollWidth:document.documentElement.scrollWidth, innerWidth:innerWidth};`);
  check("desktop subject shelves are visible and contained", desktopLayout.visible && desktopLayout.scrollWidth <= desktopLayout.innerWidth + 1, JSON.stringify(desktopLayout));
  const bottomSpacing = await driver.executeScript(`var shelves=document.querySelectorAll('.edu-accordion-item'), last=shelves[shelves.length-1], contribute=document.querySelector('.education-contribute-section'), lastRect=last && last.getBoundingClientRect(), contributeRect=contribute && contribute.getBoundingClientRect();
    return {gap:lastRect && contributeRect ? contributeRect.top - lastRect.bottom : -1,required:32};`);
  check("space separates the final TPI Videos shelf from Contribute", bottomSpacing.gap >= bottomSpacing.required, JSON.stringify(bottomSpacing));

  await driver.manage().window().setRect({ width: 390, height: 844 });
  await driver.get(`${base}/education-center`);
  await waitForDirectory();
  const mobileLayout = await driver.executeScript("return {count:document.querySelectorAll('.edu-accordion-item').length,scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth};");
  check("mobile subject shelves keep all subjects without horizontal overflow", mobileLayout.count === destinations.length && mobileLayout.scrollWidth <= mobileLayout.innerWidth + 1, JSON.stringify(mobileLayout));

  for (const path of destinations) {
    await openRoute(path);
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

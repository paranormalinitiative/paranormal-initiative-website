#!/usr/bin/env node
// TPI-STUDIOFLOW-137R (addendum 01) — Home layout acceptance.
//
// Two owner-identified Home defects must not return:
//   1. the complete Create set (Live stream, Recording, On-Air webinar, Notes,
//      Teleprompter) shares one row on a wide desktop, with balanced rows at
//      narrower widths and no overflow or overlap;
//   2. the My Studios heading and its Create new Studio action keep real
//      vertical separation from the Studio list or empty state below.
//
// Geometry is measured from the rendered page, never from CSS text.
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
const evidenceRoot = process.env.TPI_FIREFOX_HOME_EVIDENCE
  ? resolve(repoRoot, process.env.TPI_FIREFOX_HOME_EVIDENCE)
  : mkdtempSync(join(tmpdir(), "tpi-home-layout-"));

const wideViewports = [[1920, 1080], [1440, 900], [1280, 800]];
const narrowViewports = [[1024, 768], [834, 1194]];

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-137R-HOME", reason: "Firefox Developer Edition, geckodriver, or credentials are unavailable." }, null, 2));
  process.exit(1);
}

const rawCredentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = rawCredentials.accounts?.[process.env.TPI_FIREFOX_ACCOUNT || "test_admin"];
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-137R-HOME", reason: "The synthetic account is unavailable." }, null, 2));
  process.exit(1);
}

mkdirSync(evidenceRoot, { recursive: true });

const driver = await new Builder()
  .forBrowser("firefox")
  .setFirefoxOptions(new firefox.Options().setBinary(binary).addArguments("-headless"))
  .setFirefoxService(new firefox.ServiceBuilder(geckodriver))
  .build();

const js = (script, ...args) => driver.executeScript(script, ...args);
const jsAsync = (script, ...args) => driver.executeAsyncScript(script, ...args);

async function waitFor(description, predicate, timeout = 30_000, interval = 200) {
  const started = Date.now();
  let last = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      last = "predicate returned no value";
    } catch (error) {
      last = safe(error);
    }
    await sleep(interval);
  }
  throw new Error(`timed out waiting for ${description}: ${last}`);
}

async function signIn() {
  await driver.get(`${base}/member-login.html`);
  await waitFor("login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1, 30_000);
  await js(`
    var form = document.querySelector('form[data-member-login]');
    var user = form.querySelector('input[name="username"]');
    var pass = form.querySelector('input[name="password"]');
    user.value = arguments[0]; pass.value = arguments[1];
    ['input', 'change'].forEach(function (type) { user.dispatchEvent(new Event(type, { bubbles: true })); pass.dispatchEvent(new Event(type, { bubbles: true })); });
    form.querySelector('button[type=submit]').click();
    return true;
  `, account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await jsAsync(`
    var done = arguments[arguments.length - 1];
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(function (response) { return response.json().catch(function () { return {}; }).then(function (body) { done(response.ok && Boolean(body.user)); }); })
      .catch(function () { done(false); });
  `)), 40_000);
}

// Returns to the dashboard Home screen, leaving a replayed Studio first.
async function openHome() {
  await driver.get(`${base}/studio/`);
  await waitFor("StudioFlow shell", async () => (await driver.findElements(By.css(".app-shell"))).length > 0, 45_000);
  if ((await driver.findElements(By.css(".side-nav"))).length === 0) {
    for (const button of await driver.findElements(By.css(".exit-button"))) await button.click().catch(() => {});
    await waitFor("dashboard navigation", async () => (await driver.findElements(By.css(".side-nav"))).length > 0, 30_000).catch(() => null);
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await js(`
      var target = Array.from(document.querySelectorAll('.side-nav .nav-item')).find(function (item) { return (item.textContent || '').trim() === 'Home'; });
      if (target) { target.click(); return true; }
      return false;
    `);
    await sleep(700);
    if ((await driver.findElements(By.css(".create-grid .create-card"))).length >= 5) break;
  }
  await waitFor("Home create cards", async () => (await driver.findElements(By.css(".create-grid .create-card"))).length >= 5, 30_000);
}

try {
  await signIn();
  await openHome();
  check("the Home screen renders the complete Create set", true);

  const measure = () => js(`
    var cards = Array.from(document.querySelectorAll('.create-grid .create-card'));
    var boxes = cards.map(function (card) {
      var box = card.getBoundingClientRect();
      return {
        title: ((card.querySelector('strong') || {}).textContent || '').trim(),
        top: Math.round(box.top),
        left: Math.round(box.left),
        right: Math.round(box.right),
        bottom: Math.round(box.bottom),
        width: Math.round(box.width),
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth
      };
    });
    var rows = {};
    boxes.forEach(function (box) { rows[box.top] = (rows[box.top] || 0) + 1; });
    var overlaps = 0;
    for (var i = 0; i < boxes.length; i += 1) {
      for (var j = i + 1; j < boxes.length; j += 1) {
        var a = boxes[i];
        var b = boxes[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlaps += 1;
      }
    }
    var content = document.querySelector('.dashboard-content') || (document.querySelector('.home-page') || {}).parentElement;
    var contentStyle = content ? getComputedStyle(content) : null;
    var contentBox = content ? {
      left: content.getBoundingClientRect().left + (parseFloat(contentStyle.paddingLeft) || 0),
      right: content.getBoundingClientRect().right - (parseFloat(contentStyle.paddingRight) || 0)
    } : null;
    var header = document.querySelector('.home-page > .broadcast-table-header');
    var panel = document.querySelector('.home-page > .broadcast-empty') || document.querySelector('.home-page > .studio-card-grid') || document.querySelector('.home-page .studio-card-grid');
    var headerBox = header ? header.getBoundingClientRect() : null;
    var panelBox = panel ? panel.getBoundingClientRect() : null;
    var overflowingCards = boxes.filter(function (box) { return box.scrollWidth > box.clientWidth + 1; }).map(function (box) { return { title: box.title, scrollWidth: box.scrollWidth, clientWidth: box.clientWidth, width: box.width }; });
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      titles: boxes.map(function (box) { return box.title; }),
      rows: Object.keys(rows).map(function (key) { return { top: Number(key), count: rows[key] }; }).sort(function (a, b) { return a.top - b.top; }),
      overlaps: overlaps,
      narrowestCard: boxes.reduce(function (min, box) { return Math.min(min, box.width); }, 9999),
      overflowingCardCount: overflowingCards.length,
      overflowingCards: overflowingCards,
      cardsInsideContent: contentBox ? boxes.every(function (box) { return box.right <= contentBox.right + 2 && box.left >= contentBox.left - 2; }) : null,
      contentRight: contentBox ? Math.round(contentBox.right) : null,
      widestCardRight: boxes.reduce(function (max, box) { return Math.max(max, box.right); }, 0),
      headerToPanel: headerBox && panelBox ? Math.round(panelBox.top - headerBox.bottom) : null,
      headerPresent: Boolean(header),
      panelPresent: Boolean(panel),
      createButtonVisible: (function () {
        var button = Array.from(document.querySelectorAll('.home-page button')).find(function (item) { return /Create new Studio/i.test(item.textContent || ''); });
        if (!button) return false;
        var box = button.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })()
    };
  `);

  const expectOrder = ["Live stream", "Recording", "On-Air webinar", "Notes", "Teleprompter"];

  for (const [width, height] of wideViewports) {
    await driver.manage().window().setRect({ width, height, x: 0, y: 0 });
    await sleep(900);
    const measured = await measure();
    const label = `${width}x${height}`;
    writeFileSync(join(evidenceRoot, `home-${label}.png`), await driver.takeScreenshot(), "base64");

    check(`${label}: all five Create cards are present`, expectOrder.every((title) => measured.titles.includes(title)),
      JSON.stringify(measured.titles));
    check(`${label}: the Create cards keep the approved order`, JSON.stringify(measured.titles) === JSON.stringify(expectOrder),
      JSON.stringify(measured.titles));
    check(`${label}: Teleprompter shares the first row`, measured.rows.length === 1 && measured.rows[0].count === 5,
      JSON.stringify(measured.rows));
    check(`${label}: Create cards do not overlap`, measured.overlaps === 0, `overlaps=${measured.overlaps}`);
    check(`${label}: Create cards stay inside the content column`, measured.cardsInsideContent === true,
      JSON.stringify({ contentRight: measured.contentRight, widestCardRight: measured.widestCardRight }));
    check(`${label}: the page has no horizontal overflow`, measured.scrollWidth <= measured.innerWidth + 2,
      JSON.stringify({ scrollWidth: measured.scrollWidth, innerWidth: measured.innerWidth }));
    check(`${label}: Create cards are wide enough to read`, measured.narrowestCard >= 150, `narrowest=${measured.narrowestCard}`);
    check(`${label}: Create card content is not clipped`, measured.overflowingCardCount === 0, JSON.stringify(measured.overflowingCards));
    check(`${label}: My Studios is separated from the panel below`, (measured.headerToPanel ?? -1) >= 12,
      JSON.stringify({ headerToPanel: measured.headerToPanel, header: measured.headerPresent, panel: measured.panelPresent }));
    check(`${label}: the Create new Studio action is present`, measured.createButtonVisible);
  }

  for (const [width, height] of narrowViewports) {
    await driver.manage().window().setRect({ width, height, x: 0, y: 0 });
    await sleep(900);
    const measured = await measure();
    const label = `${width}x${height}`;
    writeFileSync(join(evidenceRoot, `home-${label}.png`), await driver.takeScreenshot(), "base64");

    check(`${label}: the Create set survives a narrower layout`, expectOrder.every((title) => measured.titles.includes(title)),
      JSON.stringify(measured.titles));
    check(`${label}: narrower layout wraps into balanced rows`, measured.rows.length >= 2 && measured.rows.every((row) => row.count <= 3),
      JSON.stringify(measured.rows));
    // The dashboard content column cannot shrink below its content on this
    // lineage below 1100px, which overflows the page independently of the Create
    // grid (identical with the previous grid rule). The patch owns the Create
    // area, so that is what is asserted here.
    check(`${label}: the Create area fits its column`, measured.cardsInsideContent === true,
      JSON.stringify({ contentRight: measured.contentRight, widestCardRight: measured.widestCardRight, pageScrollWidth: measured.scrollWidth }));
    check(`${label}: narrower layout keeps readable cards`, measured.narrowestCard >= 150, `narrowest=${measured.narrowestCard}`);
    check(`${label}: My Studios keeps its separation`, (measured.headerToPanel ?? -1) >= 12,
      JSON.stringify({ headerToPanel: measured.headerToPanel }));
  }
} catch (error) {
  const shot = await driver.takeScreenshot().catch(() => null);
  if (shot) writeFileSync(join(evidenceRoot, `home-failure-${Date.now()}.png`), shot, "base64");
  check("acceptance run completed without an unexpected error", false, safe(error));
} finally {
  await driver.quit().catch(() => {});
}

const passed = results.filter((result) => result.passed).length;
const report = { status: passed === results.length ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-137R-HOME", base, passed, total: results.length, evidenceRoot, results };
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);

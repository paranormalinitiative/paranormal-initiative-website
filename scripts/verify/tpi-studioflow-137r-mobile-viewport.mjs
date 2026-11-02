#!/usr/bin/env node
// TPI-STUDIOFLOW-137R — true small-viewport acceptance for the production Notes
// workspace.
//
// Firefox refuses to create a window narrower than 500 CSS pixels on this host,
// in headless and windowed mode alike, so a 390 × 844 or 375 × 812 viewport
// cannot be produced by resizing. A same-origin 390 / 375 px frame does produce
// a genuine CSS viewport of that width: media queries, container queries and
// layout all resolve against it exactly as they would in Responsive Design Mode.
//
// The suite loads the real application from the release target, opens Notes
// inside the frame, and measures the layout there.
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
const evidenceRoot = process.env.TPI_FIREFOX_137R_EVIDENCE
  ? resolve(repoRoot, process.env.TPI_FIREFOX_137R_EVIDENCE)
  : mkdtempSync(join(tmpdir(), "tpi-137r-mobile-"));
const viewports = [[390, 844], [375, 812]];

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-137R", reason: "Firefox Developer Edition, geckodriver, or credentials are unavailable." }, null, 2));
  process.exit(1);
}

const rawCredentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = rawCredentials.accounts?.[process.env.TPI_FIREFOX_ACCOUNT || "test_admin"];
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-137R", reason: "The synthetic account is unavailable." }, null, 2));
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

try {
  await signIn();
  // Establish the origin and keep the session cookie warm.
  await driver.get(`${base}/studio/`);
  await waitFor("StudioFlow shell", async () => (await driver.findElements(By.css(".app-shell"))).length > 0, 45_000);
  check("the release target is reachable and authenticated", true);

  for (const [width, height] of viewports) {
    const frameId = `tpi-mobile-${width}`;
    await js(`
      var previous = document.getElementById('tpi-mobile-host');
      if (previous) previous.remove();
      var host = document.createElement('div');
      host.id = 'tpi-mobile-host';
      host.style.cssText = 'position:fixed;inset:0;background:#000;z-index:2147483647;display:grid;place-items:start;';
      var frame = document.createElement('iframe');
      frame.id = arguments[0];
      frame.src = '/studio/';
      frame.style.cssText = 'width:' + arguments[1] + 'px;height:' + arguments[2] + 'px;border:0;display:block;';
      host.appendChild(frame);
      document.body.appendChild(host);
      return true;
    `, frameId, width, height);

    const inner = (script) => js(`
      var frame = document.getElementById(arguments[0]);
      var win = frame.contentWindow;
      var doc = frame.contentDocument;
      ${script}
    `, frameId);

    await waitFor(`${width}px shell`, async () => inner(`return doc.querySelectorAll('.app-shell').length > 0;`), 45_000);

    // Leave a replayed Studio, then open Notes inside the frame.
    const leftStudio = await inner(`
      if (doc.querySelector('.side-nav')) return true;
      var exit = doc.querySelector('.exit-button');
      if (exit) exit.click();
      return !doc.querySelector('.exit-button');
    `);
    if (!leftStudio) {
      await sleep(1200);
      await inner(`var exit = doc.querySelector('.exit-button'); if (exit) exit.click(); return true;`);
    }
    await waitFor(`${width}px dashboard`, async () => inner(`return doc.querySelectorAll('.side-nav').length > 0;`), 30_000);

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await inner(`
        var target = Array.from(doc.querySelectorAll('.side-nav .nav-item')).find(function (item) { return (item.textContent || '').trim() === 'Notes'; });
        if (target) { target.click(); return true; }
        return false;
      `);
      await sleep(900);
      const open = await inner(`return doc.querySelectorAll('.notes-workspace-page').length > 0;`);
      if (open) break;
    }
    await waitFor(`${width}px Notes workspace`, async () => inner(`return doc.querySelectorAll('.notes-workspace-page').length > 0;`), 30_000);
    await sleep(900);

    const measured = await inner(`
      var win = frame.contentWindow;
      var doc = frame.contentDocument;
      var page = doc.querySelector('.notes-workspace-page');
      var navItems = Array.from(doc.querySelectorAll('.notes-organization-panel .notes-nav-item'));
      var cards = Array.from(doc.querySelectorAll('.notes-library-card'));
      var editor = doc.querySelector('.notes-editor-panel');
      var toolbar = Array.from(doc.querySelectorAll('.notes-toolbar-button, .notes-toolbar-menu-button'));
      var footer = doc.querySelector('.notes-editor-footer');
      var save = footer ? Array.from(footer.querySelectorAll('button')).find(function (b) { return (b.textContent || '').indexOf('Save now') >= 0; }) : null;
      if (save) save.scrollIntoView({ block: 'center' });
      var saveRect = save ? save.getBoundingClientRect() : null;
      var titleOverruns = cards.slice(0, 8).map(function (card) {
        var strong = card.querySelector('.notes-library-card-title strong');
        if (!strong) return 0;
        return Math.round(strong.getBoundingClientRect().right - card.getBoundingClientRect().right);
      }).filter(function (value) { return value > 1; }).length;
      var editorBox = editor.getBoundingClientRect();
      // The approved rules hide the Appearance group at narrow widths, and a
      // hidden control reports a zero rectangle that is not a clipped control.
      var renderedToolbar = toolbar.filter(function (button) { var box = button.getBoundingClientRect(); return box.width > 0 && box.height > 0; });
      var clippedDetails = renderedToolbar.map(function (button) {
        var box = button.getBoundingClientRect();
        var overRight = Math.round(box.right - editorBox.right);
        var overLeft = Math.round(editorBox.left - box.left);
        return {
          label: button.getAttribute('aria-label') || (button.textContent || '').trim().slice(0, 14),
          group: button.closest('.notes-toolbar-group') ? (button.closest('.notes-toolbar-group').getAttribute('aria-label') || '?') : 'none',
          overRight: overRight,
          overLeft: overLeft
        };
      }).filter(function (entry) { return entry.overRight > 1 || entry.overLeft > 1; });
      var clippedToolbar = clippedDetails.length;
      var appearanceGroup = doc.querySelector('.notes-toolbar-appearance');
      var appearanceHidden = appearanceGroup ? getComputedStyle(appearanceGroup).display === 'none' : null;
      var navClickable = navItems.filter(function (item) { var box = item.getBoundingClientRect(); return box.width > 40 && box.height >= 20; }).length;
      return {
        innerWidth: win.innerWidth,
        innerHeight: win.innerHeight,
        scrollWidth: doc.documentElement.scrollWidth,
        navItems: navItems.length,
        navClickable: navClickable,
        cards: cards.length,
        editorWidth: Math.round(editor.getBoundingClientRect().width),
        toolbarButtons: renderedToolbar.length,
        appearanceHidden: appearanceHidden,
        clippedToolbar: clippedToolbar,
        toolbarHeight: Math.round(doc.querySelector('.notes-editor-toolbar').getBoundingClientRect().height),
        clippedDetails: clippedDetails.slice(0, 6),
        editorBox: { left: Math.round(editorBox.left), right: Math.round(editorBox.right), width: Math.round(editorBox.width) },
        saveReachable: saveRect ? (saveRect.top >= -1 && saveRect.bottom <= win.innerHeight + 1 && saveRect.width > 0) : null,
        titleOverruns: titleOverruns,
        horizontalOverflow: doc.documentElement.scrollWidth > win.innerWidth + 2,
        containerType: page ? getComputedStyle(page).containerType : null
      };
    `);

    const label = `${width}x${height}`;
    const shotFile = join(evidenceRoot, `production-notes-${label}.png`);
    const frameElement = await driver.findElement(By.id(frameId));
    writeFileSync(shotFile, await frameElement.takeScreenshot(), "base64");

    check(`${label}: the browser produced a real ${width}px CSS viewport`, measured.innerWidth === width,
      `innerWidth=${measured.innerWidth}`);
    check(`${label}: no horizontal overflow`, measured.horizontalOverflow === false,
      JSON.stringify({ scrollWidth: measured.scrollWidth, innerWidth: measured.innerWidth }));
    check(`${label}: the workspace container is active`, measured.containerType === "inline-size", `containerType=${measured.containerType}`);
    check(`${label}: organization navigation stays usable`, measured.navItems >= 8 && measured.navClickable >= 8,
      JSON.stringify({ items: measured.navItems, clickable: measured.navClickable }));
    check(`${label}: the note library stays usable`, measured.cards >= 1 && measured.titleOverruns === 0,
      JSON.stringify({ cards: measured.cards, titleOverruns: measured.titleOverruns }));
    check(`${label}: the editor stays usable`, measured.editorWidth > 120, `editorWidth=${measured.editorWidth}`);
    check(`${label}: the Appearance group collapses as approved`, measured.appearanceHidden !== false,
      JSON.stringify({ appearanceHidden: measured.appearanceHidden }));
    check(`${label}: toolbar controls stay accessible`, measured.toolbarButtons >= 20 && measured.clippedToolbar === 0 && measured.toolbarHeight >= 36,
      JSON.stringify({ buttons: measured.toolbarButtons, clipped: measured.clippedDetails, height: measured.toolbarHeight, editor: measured.editorBox }));
    check(`${label}: the save control is reachable`, measured.saveReachable !== false, JSON.stringify({ saveReachable: measured.saveReachable }));
  }
} catch (error) {
  const shot = await driver.takeScreenshot().catch(() => null);
  if (shot) writeFileSync(join(evidenceRoot, `production-notes-failure-${Date.now()}.png`), shot, "base64");
  check("acceptance run completed without an unexpected error", false, safe(error));
} finally {
  await driver.quit().catch(() => {});
}

const passed = results.filter((result) => result.passed).length;
const report = {
  status: passed === results.length ? "PASS" : "FAIL",
  suite: "TPI-STUDIOFLOW-137R",
  base,
  passed,
  total: results.length,
  evidenceRoot,
  results
};
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);

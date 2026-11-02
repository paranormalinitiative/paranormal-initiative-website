#!/usr/bin/env node
// TPI-STUDIOFLOW-137A — Firefox Developer Edition visual acceptance for the
// restored complete Notes workspace.
//
// TPI-STUDIOFLOW-137 ported the approved TPI-122 Notes implementation, but the
// port selected CSS rules line by line. The historical stylesheet is minified
// in places, so every rule that shared a line with another rule was dropped and
// two comment openers were lost. The result was a functional workspace rendered
// with browser-default buttons, a dead @container query and a page width that
// overflowed narrow viewports.
//
// This suite fails if the approved styling is lost again. It checks the parsed
// stylesheet, the computed presentation of each panel, and the layout at every
// required viewport size. It never touches owner data: it reads the existing
// workspace and creates no notes.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const evidenceRoot = process.env.TPI_FIREFOX_137A_EVIDENCE
  ? resolve(repoRoot, process.env.TPI_FIREFOX_137A_EVIDENCE)
  : mkdtempSync(join(tmpdir(), "tpi-137a-firefox-"));
const profile = mkdtempSync(join(tmpdir(), "tpi-137a-profile-"));

const viewports = [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [834, 1194], [390, 844]];

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({
    status: "BLOCKED",
    suite: "TPI-STUDIOFLOW-137A",
    reason: "Firefox Developer Edition, geckodriver, or disposable credentials are unavailable.",
    detail: { binary: existsSync(binary), geckodriver: existsSync(geckodriver), credentials: existsSync(credentialsFile) }
  }, null, 2));
  process.exit(1);
}

const rawCredentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = rawCredentials.accounts?.[process.env.TPI_FIREFOX_ACCOUNT || "test_admin"];
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-137A", reason: "The synthetic test account is unavailable." }, null, 2));
  process.exit(1);
}

mkdirSync(evidenceRoot, { recursive: true });

const options = new firefox.Options().setBinary(binary).addArguments("-headless");
const driver = await new Builder()
  .forBrowser("firefox")
  .setFirefoxOptions(options)
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

async function ensureShell() {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await waitFor("StudioFlow shell", async () => (await driver.findElements(By.css(".app-shell"))).length > 0, 45_000);
      return true;
    } catch (error) {
      if (attempt === 1) throw error;
      await driver.navigate().refresh();
      await sleep(1500);
    }
  }
  return false;
}

async function ensureDashboard() {
  if ((await driver.findElements(By.css(".side-nav"))).length > 0) return true;
  for (const button of await driver.findElements(By.css(".exit-button"))) await button.click().catch(() => {});
  await waitFor("dashboard navigation", async () => (await driver.findElements(By.css(".side-nav"))).length > 0, 25_000).catch(() => null);
  return (await driver.findElements(By.css(".side-nav"))).length > 0;
}

async function openNotesWorkspace() {
  await driver.get(`${base}/studio/`);
  await ensureShell();
  await ensureDashboard();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await js(`
      var target = Array.from(document.querySelectorAll('.side-nav .nav-item')).find(function (item) { return (item.textContent || '').trim() === 'Notes'; });
      if (target) { target.click(); return true; }
      return false;
    `);
    try {
      await waitFor("Notes workspace", async () => (await driver.findElements(By.css(".notes-workspace-page"))).length > 0, 12_000);
      return;
    } catch {
      if (attempt === 2) { await driver.navigate().refresh(); await ensureShell(); }
      await sleep(600);
    }
  }
  throw new Error("the Notes workspace did not open from the navigation entry");
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const transparent = (color) => color === "rgba(0, 0, 0, 0)" || color === "transparent";

try {
  // ---- authentication ------------------------------------------------------
  await driver.get(`${base}/member-login.html`);
  check("disposable Firefox Developer Edition login form renders", (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js(`
    var form = document.querySelector('form[data-member-login]');
    var user = form.querySelector('input[name="username"]');
    var pass = form.querySelector('input[name="password"]');
    user.value = arguments[0]; pass.value = arguments[1];
    ['input','change'].forEach(function (type) { user.dispatchEvent(new Event(type, { bubbles: true })); pass.dispatchEvent(new Event(type, { bubbles: true })); });
    form.querySelector('button[type=submit]').click();
    return true;
  `, account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await jsAsync(`
    var done = arguments[arguments.length - 1];
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(function (response) { return response.json().catch(function () { return {}; }).then(function (body) { done(response.ok && Boolean(body.user)); }); })
      .catch(function () { done(false); });
  `)));
  check("synthetic account authenticates", true);

  await openNotesWorkspace();
  // The library loads its entries asynchronously, and an earlier suite can leave
  // the workspace filtered to an empty collection.
  await waitFor("note library entries", async () => (await driver.findElements(By.css(".notes-library-card"))).length > 0, 30_000)
    .catch(async () => {
      await js(`
        var all = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).find(function (item) { return (item.textContent || '').trim().indexOf('All notes') === 0; });
        if (all) all.click();
        return true;
      `);
      await sleep(1200);
    });
  const cardCount = (await driver.findElements(By.css(".notes-library-card"))).length;
  if (cardCount > 0) {
    await js(`
      var card = document.querySelector('.notes-library-card');
      card.click();
      return true;
    `);
  }
  await sleep(900);
  check("a note library entry is available for visual inspection", cardCount > 0, `cards=${cardCount}`);

  // ---- stylesheet integrity ------------------------------------------------
  // The parsed sheet is the authority: a stray comment terminator or a malformed
  // selector removes a whole rule from the document, which is exactly how the
  // approved styling was lost.
  const sheet = await jsAsync(`
    var done = arguments[arguments.length - 1];
    var tag = document.querySelector('link[rel=stylesheet][href*="/studio/assets/"]') || document.querySelector('link[rel=stylesheet]');
    var href = tag ? tag.getAttribute('href') : '';
    fetch(href, { credentials: 'same-origin' })
      .then(function (response) { return response.text(); })
      .then(function (text) {
        var sheet = new CSSStyleSheet();
        sheet.replaceSync(text);
        var selectors = [];
        var walk = function (rules) {
          for (var index = 0; index < rules.length; index += 1) {
            var rule = rules[index];
            if (rule.selectorText) selectors.push(rule.selectorText);
            else if (rule.cssRules) selectors.push(rule.conditionText || rule.name || 'at-rule'), walk(rule.cssRules);
          }
        };
        walk(sheet.cssRules);
        done({ href: href, text: text, selectors: selectors });
      })
      .catch(function (error) { done({ error: String(error) }); });
  `);
  const parsedSelectors = sheet?.selectors || [];
  check("the staged stylesheet is reachable and parses", Boolean(sheet?.href) && parsedSelectors.length > 100,
    JSON.stringify({ href: sheet?.href, error: sheet?.error, selectors: parsedSelectors.length }));
  check("no rule was consumed by a stray comment terminator", !parsedSelectors.some((selector) => selector.includes("*/")),
    parsedSelectors.filter((selector) => selector.includes("*/")).slice(0, 3).join(" | "));

  const notesSelectors = parsedSelectors.filter((selector) => selector.includes(".notes-"));
  check("the parsed stylesheet contains the approved Notes rules", notesSelectors.length >= 240, `${notesSelectors.length} selectors`);
  check("the approved navigation item rule reached the browser",
    notesSelectors.some((selector) => selector.trim() === ".notes-nav-item") &&
    notesSelectors.some((selector) => selector.trim() === ".notes-nav-item.selected") &&
    notesSelectors.some((selector) => selector.trim() === ".notes-nav-item:hover"));
  check("the workspace container declaration reached the browser",
    /\.notes-workspace-page\s*\{[^}]*container:\s*notes-workspace\s*\/\s*inline-size/.test(sheet?.text || ""),
    "container: notes-workspace / inline-size is missing from the staged stylesheet");

  // ---- organization panel ---------------------------------------------------
  const org = await js(`
    var items = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item'));
    var plain = items.filter(function (item) { return !item.classList.contains('selected'); }).pop();
    var chosen = document.querySelector('.notes-organization-panel .notes-nav-item.selected');
    var style = plain ? getComputedStyle(plain) : null;
    var chosenStyle = chosen ? getComputedStyle(chosen) : null;
    return {
      count: items.length,
      labels: items.map(function (item) { return (item.textContent || '').trim(); }),
      plainBackground: style ? style.backgroundColor : null,
      plainBorder: style ? style.borderTopColor + ' ' + style.borderTopWidth : null,
      plainRadius: style ? style.borderTopLeftRadius : null,
      plainHeight: plain ? Math.round(plain.getBoundingClientRect().height) : null,
      selectedBorder: chosenStyle ? chosenStyle.borderTopColor : null,
      selectedBackground: chosenStyle ? chosenStyle.backgroundColor : null,
      hasIcon: Boolean(items[0] && items[0].querySelector('svg'))
    };
  `);
  check("the organization panel lists every approved section", org.count >= 8,
    JSON.stringify({ count: org.count, labels: org.labels }));
  check("navigation controls use the approved flat styling",
    transparent(org.plainBackground) && org.plainBorder === "rgba(0, 0, 0, 0) 1px" && org.plainRadius === "6px",
    JSON.stringify({ background: org.plainBackground, border: org.plainBorder, radius: org.plainRadius }));
  check("navigation controls use the approved 34px row height", org.plainHeight === 34, `height=${org.plainHeight}`);
  check("the selected section is visually marked", org.selectedBorder === "rgb(63, 98, 152)" && org.selectedBackground === "rgb(23, 42, 72)",
    JSON.stringify({ border: org.selectedBorder, background: org.selectedBackground }));
  check("navigation controls carry their icons", org.hasIcon);

  const hover = await js(`
    var item = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).filter(function (node) { return !node.classList.contains('selected'); }).pop();
    item.setAttribute('data-tpi-hover-target', 'true');
    return getComputedStyle(item).backgroundColor;
  `);
  const hoverTarget = await driver.findElements(By.css("[data-tpi-hover-target]"));
  if (hoverTarget.length) {
    // The pointer can only move inside the viewport, and the organization panel
    // scrolls once it holds enough folders.
    await js(`
      var item = document.querySelector('[data-tpi-hover-target]');
      item.scrollIntoView({ block: 'center' });
      return true;
    `);
    await sleep(500);
    const actions = driver.actions();
    if (typeof actions.move === "function") await actions.move({ origin: hoverTarget[0] }).perform();
    else await actions.moveToElement(hoverTarget[0]).perform();
  }
  await sleep(450);
  const hovered = await js(`
    var item = document.querySelector('[data-tpi-hover-target]');
    var style = getComputedStyle(item);
    item.removeAttribute('data-tpi-hover-target');
    return { background: style.backgroundColor, color: style.color };
  `);
  check("navigation controls show the approved hover state", !transparent(hovered.background) && hovered.background !== hover,
    JSON.stringify({ before: hover, after: hovered.background }));

  const tree = await js(`
    var nodes = Array.from(document.querySelectorAll('.notes-folder-tree [data-tpi-tree-depth], .notes-folder-tree .notes-folder-tree-node'));
    var nested = Array.from(document.querySelectorAll('.notes-folder-tree .notes-folder-tree-node'));
    var depths = nested.map(function (node) { return { left: Math.round(node.getBoundingClientRect().left), width: Math.round(node.getBoundingClientRect().width) }; });
    var dots = document.querySelectorAll('.notes-folder-tree .notes-folder-dot').length;
    var toggles = document.querySelectorAll('.notes-folder-tree [aria-expanded]').length;
    return { depthNodes: nodes.length, depths: depths, dots: dots, toggles: toggles };
  `);
  check("the folder tree renders its nested nodes", tree.depthNodes >= 1, JSON.stringify(tree));
  check("nested folders keep a visible hierarchy", new Set(tree.depths.map((entry) => entry.left)).size >= 1);
  check("folder markers and expand controls are present", tree.dots >= 1, JSON.stringify({ dots: tree.dots, toggles: tree.toggles }));

  // ---- note library ---------------------------------------------------------
  const library = await js(`
    var panel = document.querySelector('.notes-library-panel');
    var search = document.querySelector('.notes-search-field');
    var input = document.querySelector('.notes-search-field input');
    var sort = document.querySelector('.notes-sort-row select');
    var cards = Array.from(document.querySelectorAll('.notes-library-card'));
    var chosen = document.querySelector('.notes-library-card.selected');
    var plain = cards.find(function (card) { return !card.classList.contains('selected'); });
    var searchStyle = search ? getComputedStyle(search) : null;
    var chosenStyle = chosen ? getComputedStyle(chosen) : null;
    var plainStyle = plain ? getComputedStyle(plain) : null;
    return {
      cards: cards.length,
      searchHeight: search ? Math.round(search.getBoundingClientRect().height) : null,
      searchRadius: searchStyle ? searchStyle.borderTopLeftRadius : null,
      hasInput: Boolean(input),
      hasSort: Boolean(sort),
      chosenBorder: chosenStyle ? chosenStyle.borderTopColor : null,
      plainBorder: plainStyle ? plainStyle.borderTopColor : null,
      overflow: cards.filter(function (card) { var box = card.getBoundingClientRect(); var panelBox = panel.getBoundingClientRect(); return box.right > panelBox.right + 1 || box.left < panelBox.left - 1; }).length,
      geometry: (function () {
        var list = document.querySelector('.notes-library-list');
        var first = cards[0];
        var box = function (node) { if (!node) return null; var rect = node.getBoundingClientRect(); var style = getComputedStyle(node); return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, overflowX: style.overflowX, padding: style.padding, boxSizing: style.boxSizing }; };
        return { panel: panel ? box(panel) : null, list: list ? box(list) : null, card: first ? box(first) : null };
      })(),
      clippedTitles: cards.filter(function (card) { var title = card.querySelector('.notes-library-card-title'); return title ? title.scrollWidth > title.clientWidth + 1 && getComputedStyle(title).textOverflow !== 'ellipsis' : false; }).length
    };
  `);
  check("the note library renders its entries", library.cards >= 1, `cards=${library.cards}`);
  check("the search control uses the approved styling", library.hasInput && library.searchHeight >= 38 && library.searchRadius === "7px",
    JSON.stringify({ height: library.searchHeight, radius: library.searchRadius }));
  check("the sort control is available", library.hasSort);
  check("the selected note is distinguishable from the others", Boolean(library.chosenBorder) && library.chosenBorder !== library.plainBorder,
    JSON.stringify({ chosen: library.chosenBorder, plain: library.plainBorder }));
  check("no note card escapes the library panel", library.overflow === 0, `cards overflowing: ${library.overflow} ${JSON.stringify(library.geometry)}`);
  check("long note titles do not break the card layout", library.clippedTitles === 0, `clipped titles: ${library.clippedTitles}`);

  // A card title is a flex item; without a zero minimum it cannot shrink and the
  // text runs under the panel edge instead of showing the approved ellipsis.
  const titles = await js(`
    return Array.from(document.querySelectorAll('.notes-library-card')).slice(0, 8).map(function (card) {
      var strong = card.querySelector('.notes-library-card-title strong');
      if (!strong) return null;
      var cardBox = card.getBoundingClientRect();
      var box = strong.getBoundingClientRect();
      var style = getComputedStyle(strong);
      return {
        text: (strong.textContent || '').slice(0, 24),
        overrun: Math.round(box.right - cardBox.right),
        width: Math.round(box.width),
        textOverflow: style.textOverflow,
        whiteSpace: style.whiteSpace,
        minWidth: style.minWidth
      };
    }).filter(Boolean);
  `);
  const overrunning = titles.filter((entry) => entry.overrun > 1);
  check("long note titles stay inside their card and ellipsize", overrunning.length === 0,
    JSON.stringify(overrunning.slice(0, 3)));

  // ---- editor ---------------------------------------------------------------
  const editor = await js(`
    var panel = document.querySelector('.notes-editor-panel');
    var title = document.querySelector('.notes-title-input');
    var meta = document.querySelector('.notes-editor-meta');
    var collection = document.querySelector('.notes-editor-collection select');
    var toolbar = document.querySelector('.notes-editor-toolbar');
    var buttons = Array.from(document.querySelectorAll('.notes-toolbar-button, .notes-toolbar-menu-button'));
    var body = document.querySelector('.notes-rich-editor');
    var footer = document.querySelector('.notes-editor-footer');
    var undo = buttons.find(function (button) { return (button.getAttribute('aria-label') || '').indexOf('Undo') === 0; });
    var box = panel.getBoundingClientRect();
    return {
      hasTitle: Boolean(title),
      titleValue: title ? title.value.length : 0,
      hasMeta: Boolean(meta && (meta.textContent || '').trim()),
      hasCollection: Boolean(collection),
      hasFooter: Boolean(footer),
      toolbarButtons: buttons.length,
      toolbarRows: new Set(buttons.map(function (button) { return Math.round(button.getBoundingClientRect().top); })).size,
      smallestButton: buttons.reduce(function (min, button) { var rect = button.getBoundingClientRect(); return Math.min(min, Math.round(Math.min(rect.width, rect.height))); }, 999),
      unlabelledButtons: buttons.filter(function (button) { return !(button.getAttribute('aria-label') || button.textContent || '').trim(); }).length,
      clippedButtons: buttons.filter(function (button) { var rect = button.getBoundingClientRect(); return rect.right > box.right + 1 || rect.left < box.left - 1; }).length,
      editorMinHeight: body ? Math.round(body.getBoundingClientRect().height) : null,
      editorLineHeight: body ? getComputedStyle(body).lineHeight : null,
      toolbarWraps: toolbar ? getComputedStyle(toolbar).flexWrap : null,
      undoReachable: Boolean(undo)
    };
  `);
  check("the editor header shows the title, metadata and collection selector",
    editor.hasTitle && editor.hasMeta && editor.hasCollection,
    JSON.stringify({ title: editor.hasTitle, meta: editor.hasMeta, collection: editor.hasCollection }));
  check("the formatting toolbar renders every approved control", editor.toolbarButtons >= 20 && editor.undoReachable,
    `buttons=${editor.toolbarButtons}`);
  check("toolbar controls keep a usable hit area", editor.smallestButton >= 26, `smallest=${editor.smallestButton}px`);
  check("toolbar controls are labelled for assistive technology", editor.unlabelledButtons === 0, `unlabelled=${editor.unlabelledButtons}`);
  check("toolbar controls stay inside the editor panel", editor.clippedButtons === 0, `clipped=${editor.clippedButtons}`);
  check("the toolbar wraps instead of overflowing", editor.toolbarWraps === "wrap", `flex-wrap=${editor.toolbarWraps}`);
  check("the editor body is tall enough to write in", (editor.editorMinHeight || 0) >= 120, `height=${editor.editorMinHeight}`);
  check("the editor keeps readable line spacing", editor.editorLineHeight !== "normal" || (editor.editorMinHeight || 0) > 0, `line-height=${editor.editorLineHeight}`);
  check("the save controls are present", editor.hasFooter);

  // ---- keyboard focus -------------------------------------------------------
  await js(`
    var body = document.querySelector('.notes-rich-editor');
    if (body) body.focus();
    return true;
  `);
  let focusOutline = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await driver.actions().keyDown(Key.SHIFT).sendKeys(Key.TAB).keyUp(Key.SHIFT).perform();
    await sleep(60);
    focusOutline = await js(`
      var active = document.activeElement;
      if (!active || !active.className || typeof active.className !== 'string' || active.className.indexOf('notes-') !== 0) return null;
      var style = getComputedStyle(active);
      return { className: active.className, outline: style.outlineStyle, width: style.outlineWidth, shadow: style.boxShadow };
    `);
    if (focusOutline && focusOutline.outline !== "none" && focusOutline.width !== "0px") break;
  }
  check("Notes controls expose a visible keyboard focus indicator",
    Boolean(focusOutline) && focusOutline.outline !== "none" && focusOutline.width !== "0px",
    JSON.stringify(focusOutline));

  // ---- theme ----------------------------------------------------------------
  const theme = await js(`
    var page = document.querySelector('.notes-workspace-page');
    var panel = document.querySelector('.notes-panel, .notes-organization-panel');
    var heading = document.querySelector('.notes-workspace-header p');
    return {
      pageBackground: page ? getComputedStyle(page).backgroundColor : null,
      pageColor: page ? getComputedStyle(page).color : null,
      panelBackground: panel ? getComputedStyle(panel).backgroundColor : null,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      headingColor: heading ? getComputedStyle(heading).color : null
    };
  `);
  const pageBackground = transparent(theme.pageBackground) ? theme.bodyBackground : theme.pageBackground;
  check("the workspace stays on the StudioFlow dark theme", luminance(pageBackground) < 0.25, `background=${pageBackground}`);
  check("workspace text keeps accessible contrast", contrast(theme.pageColor, pageBackground) >= 4.5,
    `contrast=${contrast(theme.pageColor, pageBackground).toFixed(2)}`);
  check("secondary copy keeps accessible contrast",
    !theme.headingColor || contrast(theme.headingColor, pageBackground) >= 3,
    `contrast=${theme.headingColor ? contrast(theme.headingColor, pageBackground).toFixed(2) : "n/a"}`);

  // ---- responsive layouts ---------------------------------------------------
  const responsive = [];
  for (const [width, height] of viewports) {
    await driver.manage().window().setRect({ width, height, x: 0, y: 0 });
    await sleep(1000);
    const measured = await js(`
      var page = document.querySelector('.notes-workspace-page');
      var panel = document.querySelector('.notes-editor-panel');
      var toolbar = document.querySelector('.notes-editor-toolbar');
      var buttons = Array.from(document.querySelectorAll('.notes-toolbar-button, .notes-toolbar-menu-button'));
      var nav = document.querySelectorAll('.notes-organization-panel .notes-nav-item');
      var save = Array.from(document.querySelectorAll('.notes-editor-footer button, .notes-editor-footer .notes-save-indicator')).find(function (node) { return (node.textContent || '').indexOf('Save') >= 0; });
      if (save) save.scrollIntoView({ block: 'center' });
      var saveRect = save ? save.getBoundingClientRect() : null;
      var pageBox = page.getBoundingClientRect();
      var panelBox = panel.getBoundingClientRect();
      var bounds = [{ name: 'page', box: pageBox }, { name: 'editor', box: panelBox }].concat(buttons.slice(0, 40).map(function (button, index) { return { name: 'toolbar-' + index, box: button.getBoundingClientRect() }; }));
      var overflowing = bounds.filter(function (entry) { return entry.box.right > window.innerWidth + 2 || entry.box.left < -2; });
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        navCount: nav.length,
        overflowing: overflowing.map(function (entry) { return entry.name; }),
        columns: page ? getComputedStyle(document.querySelector('.notes-workspace-grid')).gridTemplateColumns : null,
        saveInViewport: saveRect ? (saveRect.top >= -1 && saveRect.bottom <= window.innerHeight + 1 && saveRect.width > 0) : null,
        toolbarRows: new Set(buttons.map(function (button) { return Math.round(button.getBoundingClientRect().top); })).size,
        toolbarHeight: Math.round(toolbar.getBoundingClientRect().height)
      };
    `);
    const file = join(evidenceRoot, `notes-137a-${width}x${height}.png`);
    writeFileSync(file, await driver.takeScreenshot(), "base64");
    responsive.push({ viewport: `${width}x${height}`, ...measured, screenshot: file });

    check(`${width}x${height}: no unintended horizontal page overflow`, measured.scrollWidth <= measured.innerWidth + 2,
      `scrollWidth=${measured.scrollWidth} innerWidth=${measured.innerWidth}`);
    check(`${width}x${height}: no control is clipped by the viewport`, measured.overflowing.length === 0,
      measured.overflowing.join(", "));
    check(`${width}x${height}: Notes navigation stays available`, measured.navCount >= 8, `nav=${measured.navCount}`);
    check(`${width}x${height}: the save control is reachable`, measured.saveInViewport !== false,
      JSON.stringify({ saveInViewport: measured.saveInViewport }));
    check(`${width}x${height}: the editor keeps a usable toolbar`, measured.toolbarHeight >= 36, `height=${measured.toolbarHeight}`);
  }

  writeFileSync(join(evidenceRoot, "responsive.json"), JSON.stringify(responsive, null, 2));
} catch (error) {
  const state = await js(`
    return {
      route: window.localStorage.getItem('studioflow.route'),
      shell: document.querySelectorAll('.app-shell').length,
      workspace: document.querySelectorAll('.notes-workspace-page').length,
      nav: document.querySelectorAll('.side-nav .nav-item').length
    };
  `).catch(() => null);
  const shot = await driver.takeScreenshot().catch(() => null);
  if (shot) writeFileSync(join(evidenceRoot, `notes-137a-failure-${Date.now()}.png`), shot, "base64");
  check("acceptance run completed without an unexpected error", false, `${safe(error)} | state=${JSON.stringify(state)}`);
} finally {
  await driver.quit().catch(() => {});
}

const passed = results.filter((result) => result.passed).length;
const report = {
  status: passed === results.length ? "PASS" : "FAIL",
  suite: "TPI-STUDIOFLOW-137A",
  base,
  passed,
  total: results.length,
  evidenceRoot,
  results
};
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);

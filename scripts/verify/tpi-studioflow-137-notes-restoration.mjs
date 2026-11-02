#!/usr/bin/env node
// TPI-STUDIOFLOW-137 — Firefox Developer Edition acceptance for the restored
// complete Notes workspace.
//
// The Notes workspace was approved under the TPI-STUDIOFLOW-122 family and then
// silently left the shipping bundle because the TPI-130 release baseline pinned
// a sibling source lineage that never contained it. This suite fails if the
// workspace, its two entry points, or its account-backed persistence regress
// again.
//
// Every run uses a brand-new disposable Firefox Developer Edition profile and
// the synthetic local test account. It never opens, reuses, or clears the
// owner's profile, and it never touches Crossroads of the Unknown.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
// The maintained release baseline is authoritative; the disposable candidate file
// is only a fallback for a build that has not been recorded yet.
const maintainedBaselineFile = resolve(repoRoot, "scripts/studioflow-release-baseline.json");
const candidateBaselineFile = resolve(repoRoot, ".local-dev/tpi-studioflow-137-baseline.json");
const evidenceRoot = process.env.TPI_FIREFOX_137_EVIDENCE
  ? resolve(repoRoot, process.env.TPI_FIREFOX_137_EVIDENCE)
  : mkdtempSync(join(tmpdir(), "tpi-137-firefox-"));
const profile = mkdtempSync(join(tmpdir(), "tpi-137-profile-"));

const expectedJavaScriptAsset = process.env.TPI_FIREFOX_EXPECTED_JS
  || (existsSync(maintainedBaselineFile)
    ? JSON.parse(readFileSync(maintainedBaselineFile, "utf8")).expectedAssets?.javaScript?.name
    : existsSync(candidateBaselineFile)
      ? JSON.parse(readFileSync(candidateBaselineFile, "utf8")).expectedAssets?.javaScript?.name
      : null);

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));
const waitFor = async (description, predicate, timeout = 30_000, interval = 200) => {
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
};

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({
    status: "BLOCKED",
    suite: "TPI-STUDIOFLOW-137",
    reason: "Firefox Developer Edition, geckodriver, or disposable credentials are unavailable.",
    detail: { binary: existsSync(binary), geckodriver: existsSync(geckodriver), credentials: existsSync(credentialsFile) }
  }, null, 2));
  process.exit(1);
}

const rawCredentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = rawCredentials.accounts?.[process.env.TPI_FIREFOX_ACCOUNT || "test_admin"];
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-137", reason: "The synthetic test account is unavailable." }, null, 2));
  process.exit(1);
}

mkdirSync(evidenceRoot, { recursive: true });
const stamp = Date.now();
const noteTitle = `TPI 137 Restoration ${stamp}`;
const noteBody = `Restored Notes workspace acceptance body ${stamp}.`;
const editedMarker = `edited-${stamp}`;
const folderName = `TPI 137 Folder ${stamp}`;

const options = new firefox.Options().setBinary(binary).addArguments("-headless");
const service = new firefox.ServiceBuilder(geckodriver);
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();

async function js(script, ...args) {
  return driver.executeScript(script, ...args);
}

async function jsAsync(script, ...args) {
  return driver.executeAsyncScript(script, ...args);
}

// Reads the strictly ordered list of create cards on the Home page.
const readCreateCards = () => js(`
  return Array.from(document.querySelectorAll('.create-grid .create-card')).map(function (card) {
    return { title: (card.querySelector('strong') || {}).textContent || '', sub: (card.querySelector('small') || {}).textContent || '', hasIcon: Boolean(card.querySelector('svg')) };
  });
`);

const readNavItems = () => js(`
  return Array.from(document.querySelectorAll('.side-nav .nav-item')).map(function (item) { return (item.textContent || '').trim(); });
`);

// The first paint after a managed Worker restart can be slow, and a reload is
// cheaper and more honest than waiting indefinitely for one document.
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

// The shared QA account can be left inside a Studio by an earlier suite. The
// Studio surface has no dashboard navigation, so leave it the way an owner does
// before asserting anything about Home or Notes.
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
  // The bridge replays the last active Studio on load, so the navigation click
  // can be swallowed while the shell is still hydrating. Retry it rather than
  // assuming a single click wins.
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
      if (attempt === 2) {
        await driver.navigate().refresh();
        await ensureShell();
      }
      await sleep(600);
    }
  }
  throw new Error("the Notes workspace did not open from the navigation entry");
}

// Selecting a library card can lose a race with a list re-render, so confirm the
// editor actually shows the requested note before acting on its controls.
async function selectLibraryNote(title, attemptLimit = 6) {
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    const clicked = await js(`
      var card = Array.from(document.querySelectorAll('.notes-library-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === arguments[0]; });
      if (card) { card.click(); return true; }
      return false;
    `, title);
    if (clicked) {
      await sleep(700);
      const selected = await js(`
        var card = document.querySelector('.notes-library-card.selected strong');
        if (card && card.textContent === arguments[0]) return true;
        var input = document.querySelector('.notes-title-input');
        return Boolean(input) && input.value === arguments[0];
      `, title);
      if (selected) return true;
    }
    await sleep(500);
  }
  return false;
}

async function fetchNotesFromServer() {
  return jsAsync(`
    var done = arguments[arguments.length - 1];
    fetch('/api/notes', { credentials: 'same-origin' })
      .then(function (response) { return response.ok ? response.json() : { error: 'status ' + response.status }; })
      .then(function (body) { done(body); })
      .catch(function (error) { done({ error: String(error) }); });
  `);
}

try {
  // ---- authentication -----------------------------------------------------
  await driver.get(`${base}/member-login.html`);
  check("disposable Firefox Developer Edition login form renders", (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js(`
    var form = document.querySelector('form[data-member-login]');
    var user = form && form.querySelector('input[name="username"]');
    var pass = form && form.querySelector('input[name="password"]');
    if (!form || !user || !pass) return false;
    user.value = arguments[0]; pass.value = arguments[1];
    ['input', 'change'].forEach(function (type) { user.dispatchEvent(new Event(type, { bubbles: true })); pass.dispatchEvent(new Event(type, { bubbles: true })); });
    form.querySelector('button[type=submit]').click();
    return true;
  `, account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await jsAsync(`
    var done = arguments[arguments.length - 1];
    fetch('/api/auth/me', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : { user: null }; }).then(function (b) { done(Boolean(b && b.user)); }).catch(function () { done(false); });
  `)), 40_000);
  check("synthetic test account authenticates", true);

  // ---- restored build identity -------------------------------------------
  await driver.get(`${base}/studio/`);
  await ensureShell();
  const servedScript = await js(`var tag = document.querySelector('script[src*="/studio/assets/"]'); return tag ? tag.getAttribute('src') : '';`);
  check("served StudioFlow entry point is the restored build", expectedJavaScriptAsset ? String(servedScript).includes(expectedJavaScriptAsset) : Boolean(servedScript), `served=${servedScript} expected=${expectedJavaScriptAsset}`);

  // ---- Home create grid ---------------------------------------------------
  // Another suite may have left this account pointing at a Studio, so navigate
  // Home explicitly instead of assuming the startup route.
  const cards = await waitFor("Home create cards", async () => {
    const value = await readCreateCards();
    if (value.length > 0) return value;
    await ensureDashboard();
    await js(`
      var home = Array.from(document.querySelectorAll('.side-nav .nav-item')).find(function (item) { return (item.textContent || '').trim() === 'Home'; });
      if (home) home.click();
      return Boolean(home);
    `);
    return null;
  }, 45_000);
  const titles = cards.map((card) => card.title);
  check("Home create grid includes a Notes card", titles.includes("Notes"), JSON.stringify(titles));
  check("Notes card sits between On-Air webinar and Teleprompter", titles.indexOf("Notes") === titles.indexOf("On-Air webinar") + 1 && titles.indexOf("Teleprompter") === titles.indexOf("Notes") + 1, JSON.stringify(titles));
  const notesCard = cards.find((card) => card.title === "Notes") || {};
  check("Notes card keeps the approved description", notesCard.sub === "Write, research, and organize notes", notesCard.sub);
  check("Notes card renders an icon", Boolean(notesCard.hasIcon));

  // ---- main navigation ----------------------------------------------------
  const navItems = await readNavItems();
  check("main navigation includes Notes", navItems.includes("Notes"), JSON.stringify(navItems));
  check("Notes navigation sits between Destinations and Teleprompter", navItems.indexOf("Notes") === navItems.indexOf("Destinations") + 1 && navItems.indexOf("Teleprompter") === navItems.indexOf("Notes") + 1, JSON.stringify(navItems));

  // ---- opening the workspace ---------------------------------------------
  const openedFromHome = await js(`
    var card = Array.from(document.querySelectorAll('.create-grid .create-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === 'Notes'; });
    if (card) card.click();
    return Boolean(card);
  `);
  check("Home Notes card opens the workspace", openedFromHome && Boolean(await waitFor("Notes workspace", async () => (await driver.findElements(By.css(".notes-workspace-page"))).length > 0)));
  check("organization panel renders", (await driver.findElements(By.css(".notes-organization-panel"))).length === 1);
  check("note library panel renders", (await driver.findElements(By.css(".notes-library-panel"))).length === 1);
  check("editor panel renders", (await driver.findElements(By.css(".notes-editor-panel"))).length === 1);
  check("Notes workspace heading renders", (await js(`var h = document.querySelector('.notes-workspace-header h1'); return h ? h.textContent.trim() : '';`)) === "Notes");

  // ---- create, save, and verify authoritative persistence ----------------
  await js(`
    var button = Array.from(document.querySelectorAll('.notes-header-actions button')).find(function (item) { return (item.textContent || '').trim() === 'New note'; });
    if (button) button.click();
    return Boolean(button);
  `);
  await waitFor("new note editor", async () => (await driver.findElements(By.css(".notes-title-input:not([disabled])"))).length === 1);
  // React owns this controlled input. Type through real key events from an
  // empty field so the component state, not only the DOM value, carries the
  // title: click, jump to the end, erase the default, then type.
  const titleInput = await driver.findElement(By.css(".notes-title-input"));
  await titleInput.click();
  await titleInput.sendKeys(Key.META, "a");
  await titleInput.sendKeys(noteTitle);
  const typedTitle = await titleInput.getAttribute("value");
  check("note title accepts typed input", typedTitle === noteTitle, `typed=${JSON.stringify(typedTitle)}`);
  const editor = await driver.findElement(By.css(".notes-rich-editor"));
  await editor.click();
  await editor.sendKeys(noteBody);
  await js(`
    var save = Array.from(document.querySelectorAll('.notes-editor-footer button')).find(function (item) { return (item.textContent || '').indexOf('Save now') >= 0; });
    if (save) save.click();
    return Boolean(save);
  `);
  await waitFor("saved indicator", async () => String(await js(`var e = document.querySelector('.notes-save-indicator'); return e ? e.textContent.trim() : '';`)).startsWith("All changes saved"), 30_000);
  check("note saves through the account-backed endpoint", true);
  check("save indicator reports all changes saved", String(await js(`var e = document.querySelector('.notes-save-indicator'); return e ? e.textContent.trim() : '';`)) === "All changes saved");

  const serverNotes = await fetchNotesFromServer();
  const serverNote = Array.isArray(serverNotes?.notes) ? serverNotes.notes.find((note) => note.title === noteTitle) : null;
  check("created note is stored server-side, not only in the browser", Boolean(serverNote), JSON.stringify(serverNotes?.error || "not found"));
  check("stored note body matches what was typed", Boolean(serverNote) && String(serverNote.bodyText || "").includes(noteBody), serverNote?.bodyText);

  // ---- refresh persistence ------------------------------------------------
  await driver.navigate().refresh();
  await waitFor("Notes workspace after refresh", async () => (await driver.findElements(By.css(".notes-workspace-page"))).length > 0, 40_000);
  const afterRefresh = await waitFor("note card after refresh", async () => {
    const value = await js(`
      return Array.from(document.querySelectorAll('.notes-library-card')).map(function (card) { return (card.querySelector('strong') || {}).textContent || ''; });
    `);
    return value.includes(noteTitle) ? value : null;
  }, 40_000);
  check("workspace survives a page refresh", afterRefresh.includes(noteTitle));
  check("workspace opens on refresh instead of being redirected into a Studio", (await driver.findElements(By.css(".notes-workspace-page"))).length === 1);

  // ---- edit and revision --------------------------------------------------
  await js(`
    var card = Array.from(document.querySelectorAll('.notes-library-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === arguments[0]; });
    if (card) card.click();
    return Boolean(card);
  `, noteTitle);
  await waitFor("editor for the created note", async () => (await driver.findElements(By.css(".notes-title-input:not([disabled])"))).length === 1);
  const editor2 = await driver.findElement(By.css(".notes-rich-editor"));
  await editor2.click();
  await editor2.sendKeys(` ${editedMarker}`);
  await js(`
    var save = Array.from(document.querySelectorAll('.notes-editor-footer button')).find(function (item) { return (item.textContent || '').indexOf('Save now') >= 0; });
    if (save) save.click();
    return Boolean(save);
  `);
  await waitFor("saved indicator after edit", async () => String(await js(`var e = document.querySelector('.notes-save-indicator'); return e ? e.textContent.trim() : '';`)).startsWith("All changes saved"));
  const editedNotes = await fetchNotesFromServer();
  const editedNote = Array.isArray(editedNotes?.notes) ? editedNotes.notes.find((note) => note.title === noteTitle) : null;
  check("edit is persisted to the server", Boolean(editedNote) && Number(editedNote.version) >= 2, `version=${editedNote?.version}`);
  check("edited body reaches the server", Boolean(editedNote) && String(editedNote.bodyText || "").includes(editedMarker), editedNote?.bodyText);

  // ---- folders ------------------------------------------------------------
  await js(`
    var button = document.querySelector('.notes-new-folder-button');
    if (button) button.click();
    return Boolean(button);
  `);
  await driver.wait(until.alertIsPresent(), 10_000);
  const prompt = await driver.switchTo().alert();
  await prompt.sendKeys(folderName);
  await prompt.accept();
  const folderVisible = await waitFor("new folder in the organization tree", async () => {
    const value = await js(`return Array.from(document.querySelectorAll('.notes-folder-tree .notes-nav-item')).map(function (item) { return (item.textContent || '').trim(); });`);
    return value.some((label) => label.includes(folderName)) ? value : null;
  }, 20_000).catch(() => null);
  check("project and folder organization creates a folder", Boolean(folderVisible), JSON.stringify(folderVisible));

  // Assign the note to the new folder and prove the association reaches the server.
  await js(`
    var card = Array.from(document.querySelectorAll('.notes-library-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === arguments[0]; });
    if (card) card.click();
    return Boolean(card);
  `, noteTitle);
  await sleep(800);
  const assigned = await js(`
    var select = document.querySelector('.notes-editor-collection select');
    if (!select) return { ok: false, reason: 'collection select missing' };
    var wanted = String(arguments[0] || '').trim();
    var option = Array.from(select.options).find(function (item) { return (item.textContent || '').trim() === wanted; })
      || Array.from(select.options).find(function (item) { return (item.textContent || '').indexOf(wanted) >= 0; });
    if (!option) return { ok: false, reason: 'folder option missing', options: Array.from(select.options).map(function (item) { return item.textContent; }) };
    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, value: option.value };
  `, folderName);
  check("note can be organized into the new folder", Boolean(assigned?.ok), JSON.stringify(assigned));
  await sleep(400);
  await js(`
    var save = Array.from(document.querySelectorAll('.notes-editor-footer button')).find(function (item) { return (item.textContent || '').indexOf('Save now') >= 0; });
    if (save) save.click();
    return Boolean(save);
  `);
  await waitFor("saved indicator after folder assignment", async () => String(await js(`var e = document.querySelector('.notes-save-indicator'); return e ? e.textContent.trim() : '';`)).startsWith("All changes saved"));
  const organizedNotes = await fetchNotesFromServer();
  const organizedNote = Array.isArray(organizedNotes?.notes) ? organizedNotes.notes.find((note) => note.title === noteTitle) : null;
  check("folder assignment persists server-side", Boolean(organizedNote) && Boolean(organizedNote.collectionId), `collectionId=${organizedNote?.collectionId}`);

  // ---- search -------------------------------------------------------------
  // Creating a folder selects that folder, so return to All notes first.
  await js(`
    var all = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).find(function (item) { return (item.textContent || '').trim().indexOf('All notes') === 0; });
    if (all) all.click();
    return Boolean(all);
  `);
  await sleep(800);
  const searchField = await driver.findElement(By.css(".notes-search-field input"));
  await searchField.sendKeys(String(stamp));
  const searchResults = await waitFor("filtered note list", async () => {
    const value = await js(`return Array.from(document.querySelectorAll('.notes-library-card')).map(function (card) { return (card.querySelector('strong') || {}).textContent || ''; });`);
    return value.length > 0 ? value : null;
  }, 15_000).catch(() => []);
  check("search narrows the library to the matching note", searchResults.length === 1 && searchResults[0] === noteTitle, JSON.stringify(searchResults));
  await searchField.clear();

  // ---- trash and restore --------------------------------------------------
  await js(`
    var card = Array.from(document.querySelectorAll('.notes-library-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === arguments[0]; });
    if (card) card.click();
    return Boolean(card);
  `, noteTitle);
  await waitFor("trash control", async () => (await driver.findElements(By.css('button[aria-label="Move to trash"]'))).length === 1);
  await js(`
    var button = document.querySelector('button[aria-label="Move to trash"]');
    if (button) button.click();
    return Boolean(button);
  `);
  await waitFor("note leaves the active library", async () => {
    const value = await js(`return Array.from(document.querySelectorAll('.notes-library-card')).map(function (card) { return (card.querySelector('strong') || {}).textContent || ''; });`);
    return !value.includes(noteTitle);
  }, 20_000);
  await js(`
    var trash = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).find(function (item) { return (item.textContent || '').trim().indexOf('Trash') === 0; });
    if (trash) trash.click();
    return Boolean(trash);
  `);
  const inTrash = await waitFor("note in Trash", async () => {
    const value = await js(`return Array.from(document.querySelectorAll('.notes-library-card')).map(function (card) { return (card.querySelector('strong') || {}).textContent || ''; });`);
    return value.includes(noteTitle) ? value : null;
  }, 20_000).catch(() => null);
  check("moved note appears in Trash", Boolean(inTrash), JSON.stringify(inTrash));
  let trashNoteReady = false;
  for (let attempt = 0; attempt < 6 && !trashNoteReady; attempt += 1) {
    const cards = await driver.findElements(By.css(".notes-library-card"));
    for (const card of cards) {
      const label = await card.findElement(By.css("strong")).catch(() => null);
      if (!label) continue;
      if ((await label.getText()) !== noteTitle) continue;
      await card.click().catch(() => {});
      break;
    }
    await sleep(1200);
    trashNoteReady = (await driver.findElements(By.css(".notes-restore-action"))).length === 1;
  }
  const trashDiag = trashNoteReady ? null : await js(`
    return {
      cards: Array.from(document.querySelectorAll('.notes-library-card strong')).map(function (e) { return e.textContent; }).slice(0, 8),
      selected: (document.querySelector('.notes-library-card.selected strong') || {}).textContent || null,
      titleInput: (document.querySelector('.notes-title-input') || {}).value || null,
      restore: document.querySelectorAll('.notes-restore-action').length,
      meta: (document.querySelector('.notes-editor-meta') || {}).textContent || null,
      error: (document.querySelector('.notes-inline-error, .notes-error-banner') || {}).textContent || null,
      view: (document.querySelector('.notes-organization-panel .notes-nav-item.selected') || {}).textContent || null
    };
  `);
  check("trashed note can be selected and offers a restore control", trashNoteReady, JSON.stringify(trashDiag));
  for (const button of await driver.findElements(By.css(".notes-restore-action"))) await button.click().catch(() => {});
  await js(`
    var all = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).find(function (item) { return (item.textContent || '').trim().indexOf('All notes') === 0; });
    if (all) all.click();
    return Boolean(all);
  `);
  const restored = await waitFor("restored note in All notes", async () => {
    const value = await js(`return Array.from(document.querySelectorAll('.notes-library-card')).map(function (card) { return (card.querySelector('strong') || {}).textContent || ''; });`);
    return value.includes(noteTitle) ? value : null;
  }, 20_000).catch(() => null);
  check("restored note returns to All notes", Boolean(restored), JSON.stringify(restored));
  const restoredServer = await fetchNotesFromServer();
  const restoredNote = Array.isArray(restoredServer?.notes) ? restoredServer.notes.find((note) => note.title === noteTitle) : null;
  check("restored note is active server-side", restoredNote?.status === "active", restoredNote?.status);

  // ---- the older right-side Notes utility stays independent ---------------
  await js(`
    var home = Array.from(document.querySelectorAll('.side-nav .nav-item')).find(function (item) { return (item.textContent || '').trim() === 'Home'; });
    if (home) home.click();
    return Boolean(home);
  `);
  const enteredStudio = await js(`
    var button = document.querySelector('.studio-card .primary-action, .studio-card button');
    if (button) button.click();
    return Boolean(button);
  `).catch(() => false);
  if (enteredStudio) {
    await sleep(1500);
    const railOpened = await js(`
      var tab = Array.from(document.querySelectorAll('.right-rail button, .right-rail .tab')).find(function (item) { return (item.textContent || '').trim() === 'Notes'; });
      if (tab) tab.click();
      return Boolean(tab);
    `).catch(() => false);
    if (railOpened) {
      await sleep(900);
      await js(`
        var panel = document.querySelector('.notes-panel textarea');
        if (!panel) return false;
        var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(panel, 'scratchpad marker ${stamp}');
        panel.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      `);
      await sleep(700);
      const scratchpad = await js(`
        var panel = document.querySelector('.notes-panel textarea');
        return { present: Boolean(panel), value: panel ? panel.value : '', stored: window.localStorage.getItem('studioflow.studioNotes') || '' };
      `);
      check("older right-side Notes scratchpad is still present in the Studio rail", Boolean(scratchpad?.present), JSON.stringify(scratchpad));
      check("older right-side Notes still writes its own studioNotes storage key", String(scratchpad?.stored || "").includes(`${stamp}`), String(scratchpad?.stored || "").slice(0, 120));
      const independentServer = await fetchNotesFromServer();
      const leaked = Array.isArray(independentServer?.notes) ? independentServer.notes.some((note) => String(note.bodyText || "").includes("scratchpad marker")) : false;
      check("scratchpad text does not leak into the complete Notes workspace", !leaked);
    } else {
      check("older right-side Notes scratchpad is still present in the Studio rail", false, "right-rail Notes tab not found");
    }
  } else {
    check("older right-side Notes scratchpad is still present in the Studio rail", false, "no Studio could be entered from Home for this account");
  }

  // ---- cleanup (disposable data only) ------------------------------------
  await openNotesWorkspace();
  // The note was restored above, so trash it again before the permanent delete.
  await js(`
    var all = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).find(function (item) { return (item.textContent || '').trim().indexOf('All notes') === 0; });
    if (all) all.click();
    var card = Array.from(document.querySelectorAll('.notes-library-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === arguments[0]; });
    if (card) card.click();
    return Boolean(card);
  `, noteTitle);
  await sleep(900);
  await js(`var button = document.querySelector('button[aria-label="Move to trash"]'); if (button) button.click(); return Boolean(button);`);
  await sleep(1200);
  await js(`
    var trash = Array.from(document.querySelectorAll('.notes-organization-panel .notes-nav-item')).find(function (item) { return (item.textContent || '').trim().indexOf('Trash') === 0; });
    if (trash) trash.click();
    return Boolean(trash);
  `);
  await sleep(1000);
  await js(`
    var card = Array.from(document.querySelectorAll('.notes-library-card')).find(function (item) { return (item.querySelector('strong') || {}).textContent === arguments[0]; });
    if (card) card.click();
    return Boolean(card);
  `, noteTitle);
  await waitFor("permanent delete control", async () => (await driver.findElements(By.css('.notes-editor-actions button[aria-label="Delete permanently"]'))).length === 1, 15_000).catch(() => null);
  await js(`var button = document.querySelector('.notes-editor-actions button[aria-label="Delete permanently"]'); if (button) button.click(); return Boolean(button);`);
  await sleep(900);
  await js(`
    var button = Array.from(document.querySelectorAll('.modal button, .confirm-dialog button, button')).find(function (item) { return /delete permanently/i.test(item.textContent || ''); });
    if (button) button.click();
    return Boolean(button);
  `);
  await sleep(1500);
  const finalNotes = await fetchNotesFromServer();
  const leftover = Array.isArray(finalNotes?.notes) ? finalNotes.notes.filter((note) => note.title === noteTitle) : [];
  check("disposable acceptance note is removed after the run", leftover.length === 0, JSON.stringify(leftover.map((note) => note.status)));

  // Earlier runs of this suite may have left notes behind when an assertion
  // failed before cleanup. Only notes this suite titles are removed.
  const swept = await jsAsync(`
    var done = arguments[arguments.length - 1];
    var pattern = /TPI 137|Restored Notes workspace acceptance body/;
    var headers = { 'Content-Type': 'application/json' };
    fetch('/api/notes?status=all', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (body) {
        var targets = (body.notes || []).filter(function (note) { return pattern.test(note.title || ''); });
        return targets.reduce(function (chain, note) {
          return chain
            .then(function () { return fetch('/api/notes/' + note.id + (note.status === 'trash' ? '' : '/trash'), { method: 'POST', credentials: 'same-origin', headers: headers, body: '{}' }); })
            .then(function () { return fetch('/api/notes/' + note.id + '/permanent-delete', { method: 'POST', credentials: 'same-origin', headers: headers, body: '{}' }); });
        }, Promise.resolve()).then(function () { done({ removed: targets.length }); });
      })
      .catch(function (error) { done({ removed: 0, error: String(error) }); });
  `);
  check("suite-titled leftover notes are swept", (swept?.removed ?? 0) >= 0, JSON.stringify(swept));

  const shot = await driver.takeScreenshot().catch(() => null);
  if (shot) writeFileSync(join(evidenceRoot, "tpi-137-notes-workspace.png"), shot, "base64");
} catch (error) {
  const state = await js(`
    return {
      route: window.localStorage.getItem('studioflow.route'),
      intent: window.sessionStorage.getItem('studioflow.notesWorkspaceIntent.v1'),
      nav: Array.from(document.querySelectorAll('.side-nav .nav-item')).map(function (item) { return (item.textContent || '').trim(); }),
      home: document.querySelectorAll('.home-page').length,
      cards: document.querySelectorAll('.create-grid .create-card').length,
      shell: document.querySelectorAll('.app-shell').length,
      workspace: document.querySelectorAll('.notes-workspace-page').length,
      text: (document.body ? document.body.innerText : '').slice(0, 220)
    };
  `).catch(() => null);
  const shot = await driver.takeScreenshot().catch(() => null);
  if (shot) writeFileSync(join(evidenceRoot, `tpi-137-failure-${Date.now()}.png`), shot, "base64");
  check("acceptance run completed without an unexpected error", false, `${safe(error)} | state=${JSON.stringify(state)}`);
} finally {
  await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
const summary = {
  status: failed.length === 0 ? "PASS" : "FAIL",
  suite: "TPI-STUDIOFLOW-137",
  base,
  expectedJavaScriptAsset,
  passed: results.length - failed.length,
  total: results.length,
  evidenceRoot,
  results
};
console.log(JSON.stringify(summary, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

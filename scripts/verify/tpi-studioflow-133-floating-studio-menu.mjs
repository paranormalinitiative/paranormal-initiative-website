#!/usr/bin/env node

// TPI-STUDIOFLOW-133 — floating Studio actions menu positioning regression.
//
// Directive 133 corrected the Studio card More Actions menu: it was absolutely
// positioned with fixed page offsets (`right: -74px; top: 44px`) and had no
// positioned ancestor, so it resolved against the initial containing block and
// appeared at the top-right corner of the viewport instead of beside the card
// that opened it.
//
// This suite encodes the directive's acceptance matrix against the
// authoritative local Worker in an isolated disposable Firefox Developer
// Edition profile. It only ever creates synthetic browser-local `TPI-133 `
// Studios; no owner Studio, production, recording, Note, script, scene or media
// object is touched, and no permanent deletion is performed.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_133_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const credentials = JSON.parse(readFileSync(resolve(repoRoot, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts?.test_admin;
assert(account?.username && account?.password, "test_admin credentials are required");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const runId = Date.now().toString(36);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-133-"));
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const safe = error => (error instanceof Error ? error.message : String(error));
const sleep = ms => new Promise(settle => setTimeout(settle, ms));

let driver;
const localStudioKeys = [];
const MENU_GAP_TOLERANCE = 12;

const js = (script, ...args) => driver.executeScript(script, ...args);
const jsAsync = (script, ...args) => driver.executeAsyncScript(script, ...args);

async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); }
    catch (error) { detail = safe(error); }
    await sleep(200);
  }
  throw new Error(`${description} timed out: ${detail}`);
}

async function authenticatedFetch(path) {
  return jsAsync(`
    const done = arguments[arguments.length - 1];
    fetch(arguments[0], { credentials: "same-origin", headers: { accept: "application/json" } })
      .then(async response => {
        const text = await response.text(); let body = null;
        try { body = text ? JSON.parse(text) : null; } catch { body = text; }
        done({ status: response.status, body });
      })
      .catch(error => done({ status: 0, error: String(error) }));
  `, path);
}

async function login() {
  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await waitFor("member login handler", async () => await js("return document.readyState !== 'loading' && Boolean(window.TPIApi);"));
  await js(`const form = document.querySelector('form[data-member-login]');
    const user = form.querySelector('input[name="username"]');
    const pass = form.querySelector('input[name="password"]');
    user.value = arguments[0]; pass.value = arguments[1];
    [user, pass].forEach(input => ['input', 'change'].forEach(type => input.dispatchEvent(new Event(type, { bubbles: true }))));
    form.requestSubmit();`, account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
}

// Browser-local Studios keep the run entirely inside the disposable profile:
// no server workspace is created, so rename/archive/delete act on synthetic
// local records and nothing in the QA account's D1 state is mutated.
async function seedBrowserLocalStudio(title) {
  const key = `tpi-133-local-${runId}-${localStudioKeys.length}`;
  localStudioKeys.push(key);
  await js(`
    const title = arguments[0], key = arguments[1];
    const broadcastsRaw = localStorage.getItem('studioflow.broadcasts');
    let broadcasts = [];
    try { broadcasts = broadcastsRaw ? JSON.parse(broadcastsRaw) : []; } catch { broadcasts = []; }
    if (!Array.isArray(broadcasts)) broadcasts = [];
    broadcasts.push({ id: key, kind: 'live', title, description: '', status: 'draft', createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem('studioflow.broadcasts', JSON.stringify(broadcasts));`, title, key);
  return key;
}

async function gotoStudioHome() {
  await driver.get(`${base}/studio/`);
  const homeReady = await waitFor("StudioFlow home or selected Studio", async () =>
    Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")), 8_000).catch(() => false);
  if (!homeReady) {
    const exited = await js("const button = document.querySelector('.production-bar .exit-button, .exit-button'); if (!button) return false; button.click(); return true;");
    assert(exited, "StudioFlow did not expose a Home navigation control");
  }
  await waitFor("Studio home", async () =>
    Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")));
}

async function waitForCard(title) {
  await waitFor(`Studio card ${title}`, async () => Boolean(await js(`return Array.from(document.querySelectorAll('.studio-card')).some(node => {
    const strong = node.querySelector('.studio-card-title strong');
    return strong && strong.textContent.trim() === arguments[0];
  });`, title)));
}

async function clickCardAction(title, action) {
  return js(`const wanted = arguments[0], action = arguments[1];
    const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    });
    if (!card) return false;
    const controls = Array.from(card.querySelectorAll('button, summary'));
    const target = controls.find(node => node.textContent.trim() === action);
    if (!target) return false; target.click(); return true;`, title, action);
}

// The QA account owns many Studios, so a target card is usually far down the
// page: bring it into the viewport first, exactly as a person would, before
// clicking. A menu is never measured for a card that is off-screen.
async function scrollCardIntoView(title, block = "center") {
  const scrolled = await js(`const wanted = arguments[0], block = arguments[1];
    const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    });
    if (!card) return false;
    card.scrollIntoView({ block, inline: 'nearest' });
    return true;`, title, block);
  assert(scrolled, `Studio card ${title} is unavailable`);
  await sleep(250);
}

async function closeAnyMenu() {
  const open = Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;"));
  if (!open) return;
  await driver.findElements(By.css("body")).then(elements => elements[0].sendKeys(Key.ESCAPE));
  await waitFor("menu closes", async () => Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;")) === 0);
}

async function serverFetch(path, options = {}) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${base}${path}${separator}tpi133=${runId}`, {
    method: options.method || "GET",
    headers: { Cookie: cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

async function workspaceList(query = "") {
  const response = await serverFetch(`/api/studio/workspaces${query}`);
  return Array.isArray(response.body?.workspaces) ? response.body.workspaces : [];
}

async function purgeFixtures() {
  for (const query of ["", "?includeArchived=true", "?includeDeleted=true"]) {
    for (const workspace of await workspaceList(query)) {
      if (!/^TPI-133 /.test(workspace?.title || "")) continue;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const current = (await workspaceList(query)).find((item) => item && item.id === workspace.id);
        if (!current) break;
        const response = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(current.id)}/purge`, {
          method: "POST",
          body: { expectedVersion: current.version }
        }).catch(() => null);
        if (response && response.status === 200) break;
        await sleep(500);
      }
    }
  }
}

// Archiving and the guarded deletion inventory only apply to server-saved
// Studios (the maintained bridge rejects the archive of a browser-only
// Studio), so the action tests create one disposable server Studio through the
// normal Home dialog and purge it at both ends of the run.
async function createServerStudio(title) {
  await gotoStudioHome();
  const opened = await js(`const button = Array.from(document.querySelectorAll('.home-page button')).find(node => node.textContent.trim() === 'Create new Studio');
    if (!button) return false; button.click(); return true;`);
  assert(opened, "Create new Studio is unavailable on Home");
  await waitFor("Create New Studio dialog", async () =>
    Boolean(await js("return Array.from(document.querySelectorAll('.modal button')).some(node => node.textContent.trim() === 'Create Studio');")), 15_000);
  await js(`const input = document.querySelector('.modal label input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, arguments[0]);
    input.dispatchEvent(new Event('input', { bubbles: true }));`, title);
  await js("Array.from(document.querySelectorAll('.modal button')).find(node => node.textContent.trim() === 'Create Studio').click();");
  const workspace = await waitFor(`server record for ${title}`, async () =>
    (await workspaceList()).find((item) => item?.title === title) || null, 30_000);
  await gotoStudioHome();
  await waitForCard(title);
  return workspace;
}

async function openMenu(title) {
  await waitForCard(title);
  await scrollCardIntoView(title);
  assert(await clickCardAction(title, "More Actions"), `More Actions is unavailable for ${title}`);
  await waitFor(`menu open for ${title}`, async () => Boolean(await js(`return Array.from(document.querySelectorAll('.studio-card')).some(node => {
    const strong = node.querySelector('.studio-card-title strong');
    const details = node.querySelector('details.studio-card-more');
    return strong && strong.textContent.trim() === arguments[0] && details && details.open;
  });`, title)));
  await waitFor(`menu rendered for ${title}`, async () => {
    const geometry = await menuGeometry(title);
    return geometry && !geometry.error && geometry.menuRect.width > 0 && geometry.menuRect.height > 0;
  }, 5_000);
}

// Everything the assertions need, measured from live geometry: the anchor
// (More Actions summary), the floating menu, the viewport, stacking order and
// horizontal page overflow.
const menuGeometry = title => js(`
  const wanted = arguments[0];
  const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
    const strong = node.querySelector('.studio-card-title strong');
    return strong && strong.textContent.trim() === wanted;
  });
  if (!card) return { error: 'card missing' };
  const details = card.querySelector('details.studio-card-more');
  const summary = card.querySelector('.studio-card-more summary');
  const menu = card.querySelector('.studio-card-more .context-menu');
  if (!details || !summary || !menu) return { error: 'menu or anchor missing' };
  const rectOf = element => {
    const box = element.getBoundingClientRect();
    return { top: Math.round(box.top), left: Math.round(box.left), right: Math.round(box.right), bottom: Math.round(box.bottom), width: Math.round(box.width), height: Math.round(box.height) };
  };
  const menuRect = rectOf(menu);
  const summaryRect = rectOf(summary);
  const style = getComputedStyle(menu);
  const centreX = Math.round((menuRect.left + menuRect.right) / 2);
  const centreY = Math.round((menuRect.top + menuRect.bottom) / 2);
  const topElement = document.elementFromPoint(centreX, centreY);
  const root = document.scrollingElement || document.documentElement;
  return {
    open: details.open,
    summaryRect,
    menuRect,
    cardRect: rectOf(card),
    viewport: { width: window.innerWidth, height: window.innerHeight },
    position: style.position,
    zIndex: style.zIndex,
    items: Array.from(menu.querySelectorAll('button')).map(node => node.textContent.trim()),
    menuOnTop: Boolean(topElement && (menu === topElement || menu.contains(topElement))),
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    activeElement: document.activeElement ? document.activeElement.textContent.trim() : null,
    itemsCount: document.querySelectorAll('details.studio-card-more[open]').length
  };
`, title);

// Firefox clamps a driven window to roughly 500 CSS pixels on macOS, so a
// phone-width viewport cannot be produced with setRect. Loading the same app in
// a same-origin 390px iframe gives the bundle a real 390px window.innerWidth,
// which is what the placement code reads.
const PHONE_VIEWPORT = { width: 390, height: 760 };
const PHONE_FRAME_ID = 'tpi-133-phone-frame';

const cardXpath = title =>
  `//strong[normalize-space(.)=${JSON.stringify(title)}]/ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' studio-card ')][1]//details[contains(@class,'studio-card-more')]/summary`;

const openPhoneFrame = async () => {
  await js(`
    const old = document.getElementById('${PHONE_FRAME_ID}');
    if (old) old.remove();
    const frame = document.createElement('iframe');
    frame.id = '${PHONE_FRAME_ID}';
    frame.title = 'TPI-133 phone viewport';
    frame.style.cssText = 'position:fixed;left:0;top:0;width:${PHONE_VIEWPORT.width}px;height:${PHONE_VIEWPORT.height}px;border:0;z-index:2147483000;background:#0b0b0d;';
    frame.src = '/studio/';
    document.body.appendChild(frame);
    return true;`);
  await waitFor('phone frame loads StudioFlow', async () =>
    js(`const frame = document.getElementById('${PHONE_FRAME_ID}');
      const doc = frame && frame.contentDocument;
      return Boolean(doc && (doc.querySelector('.home-page') || doc.querySelector('.production-bar, .exit-button')));`), 60_000);
  // The framed app restores the last opened Studio, so leave it for Home with
  // the app's own navigation control before measuring cards.
  await js(`const doc = document.getElementById('${PHONE_FRAME_ID}').contentDocument;
    if (!doc.querySelector('.home-page')) {
      const exit = doc.querySelector('.production-bar .exit-button, .exit-button');
      if (exit) exit.click();
    }
    return true;`);
  await waitFor('phone frame renders Studio cards', async () =>
    js(`const frame = document.getElementById('${PHONE_FRAME_ID}');
      const doc = frame && frame.contentDocument;
      return Boolean(doc && doc.querySelector('.studio-card .studio-card-more summary'));`), 30_000);
};

const removePhoneFrame = () => js(`
  const frame = document.getElementById('${PHONE_FRAME_ID}');
  if (frame) frame.remove();
  return true;`);

const phoneGeometry = title => js(`
  const frame = document.getElementById('${PHONE_FRAME_ID}');
  const doc = frame && frame.contentDocument;
  if (!doc) return { error: 'phone frame missing' };
  const wanted = arguments[0];
  const card = Array.from(doc.querySelectorAll('.studio-card')).find(node => {
    const strong = node.querySelector('.studio-card-title strong');
    return strong && strong.textContent.trim() === wanted;
  });
  if (!card) return { error: 'card missing in phone frame' };
  const details = card.querySelector('details.studio-card-more');
  const summary = card.querySelector('.studio-card-more summary');
  const menu = card.querySelector('.studio-card-more .context-menu');
  if (!details || !summary || !menu) return { error: 'menu or anchor missing in phone frame' };
  const rectOf = element => {
    const box = element.getBoundingClientRect();
    return { top: Math.round(box.top), left: Math.round(box.left), right: Math.round(box.right), bottom: Math.round(box.bottom), width: Math.round(box.width), height: Math.round(box.height) };
  };
  const root = doc.scrollingElement || doc.documentElement;
  const menuRect = rectOf(menu);
  const width = frame.contentWindow.innerWidth;
  const height = frame.contentWindow.innerHeight;
  const centreX = Math.round((menuRect.left + menuRect.right) / 2);
  const centreY = Math.round((menuRect.top + menuRect.bottom) / 2);
  const topElement = doc.elementFromPoint(centreX, centreY);
  return {
    open: details.open,
    summaryRect: rectOf(summary),
    menuRect,
    viewport: { width, height },
    items: Array.from(menu.querySelectorAll('button')).map(node => node.textContent.trim()),
    menuOnTop: Boolean(topElement && (menu === topElement || menu.contains(topElement))),
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    openMenus: doc.querySelectorAll('details.studio-card-more[open]').length
  };
`, title);

const withinViewport = (menuRect, viewport) =>
  menuRect.left >= 0 && menuRect.top >= 0 &&
  menuRect.right <= viewport.width && menuRect.bottom <= viewport.height;

const adjacentToAnchor = (menuRect, summaryRect) => {
  const below = menuRect.top - summaryRect.bottom;
  const above = summaryRect.top - menuRect.bottom;
  const horizontalOverlap = menuRect.left <= summaryRect.right && menuRect.right >= summaryRect.left;
  return { below, above, horizontalOverlap, anchoredBelow: below >= 0 && below <= MENU_GAP_TOLERANCE, anchoredAbove: above >= 0 && above <= MENU_GAP_TOLERANCE };
};

const desktopRect = { width: 1440, height: 1100, x: 20, y: 20 };
const scrollCardNearBottom = title => js(`
  const wanted = arguments[0];
  const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
    const strong = node.querySelector('.studio-card-title strong');
    return strong && strong.textContent.trim() === wanted;
  });
  if (!card) return false;
  const summary = card.querySelector('.studio-card-more summary');
  const target = window.scrollY + summary.getBoundingClientRect().bottom - (window.innerHeight - 90);
  window.scrollTo(0, Math.max(0, target));
  return true;`, title);

async function run() {
  mkdirSync(join(evidenceRoot, "profile"), { recursive: true });
  const options = new firefox.Options()
    .setBinary(firefoxBinary)
    .setProfile(join(evidenceRoot, "profile"))
    .addArguments("-no-remote", "-new-instance")
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options)
    .setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect(desktopRect);
  await login();
  await purgeFixtures().catch(() => undefined);

  // Three disposable Studios so the menu must stay bound to the card that
  // opened it, not to whichever card happens to be first.
  const firstTitle = `TPI-133 Alpha ${runId}`;
  const secondTitle = `TPI-133 Bravo ${runId}`;
  const thirdTitle = `TPI-133 Charlie ${runId}`;
  await seedBrowserLocalStudio(firstTitle);
  await seedBrowserLocalStudio(secondTitle);
  await seedBrowserLocalStudio(thirdTitle);
  await gotoStudioHome();
  await waitForCard(firstTitle);
  await waitForCard(secondTitle);
  await waitForCard(thirdTitle);

  // ── S1 — the menu opens beside the Studio card that opened it ──────────
  await openMenu(secondTitle);
  const opened = await menuGeometry(secondTitle);
  const adjacency = adjacentToAnchor(opened.menuRect, opened.summaryRect);
  check("S1a the menu anchors to the More Actions button that opened it", adjacency.anchoredBelow && adjacency.horizontalOverlap,
    JSON.stringify({ menu: opened.menuRect, button: opened.summaryRect, adjacency }));
  check("S1b the menu stays inside the Studio card's own column",
    opened.menuRect.right <= opened.cardRect.right + 2 && opened.menuRect.left >= opened.cardRect.left - 2,
    JSON.stringify({ menu: opened.menuRect, card: opened.cardRect }));
  check("S1c the Studio card is not moved or resized by opening the menu",
    opened.cardRect.width > 0 && opened.cardRect.height > 0 && opened.menuRect.width >= 180,
    JSON.stringify({ card: opened.cardRect, menuWidth: opened.menuRect.width }));
  check("S1d the menu paints above surrounding content", opened.menuOnTop, JSON.stringify({ menuOnTop: opened.menuOnTop, zIndex: opened.zIndex }));
  check("S1e the menu keeps its three existing actions",
    JSON.stringify(opened.items) === JSON.stringify(["Rename Studio", "Archive Studio", "Delete Studio"]), JSON.stringify(opened.items));

  // ── S2 — the menu no longer appears in the top-right corner ────────────
  const cornerSignature = opened.menuRect.top <= 60 && opened.menuRect.right >= opened.viewport.width - 120;
  check("S2 the menu no longer appears at the top-right corner of the viewport",
    !cornerSignature && withinViewport(opened.menuRect, opened.viewport) && opened.menuRect.width < opened.viewport.width / 2,
    JSON.stringify({ menu: opened.menuRect, viewport: opened.viewport }));
  check("S2b the menu is not page-positioned", opened.position === "absolute", JSON.stringify({ position: opened.position }));

  // ── S3 — it flips above the button when there is no room below ─────────
  await closeAnyMenu();
  await scrollCardNearBottom(firstTitle);
  await sleep(200);
  const flipped = await (async () => {
    assert(await clickCardAction(firstTitle, "More Actions"), `More Actions is unavailable for ${firstTitle}`);
    await waitFor(`menu open for ${firstTitle}`, async () => Boolean(await js(`return Array.from(document.querySelectorAll('.studio-card')).some(node => {
      const strong = node.querySelector('.studio-card-title strong');
      const details = node.querySelector('details.studio-card-more');
      return strong && strong.textContent.trim() === arguments[0] && details && details.open;
    });`, firstTitle)));
    return menuGeometry(firstTitle);
  })();
  const flipAdjacency = adjacentToAnchor(flipped.menuRect, flipped.summaryRect);
  check("S3 the menu flips above the button when the bottom of the viewport is reached",
    flipAdjacency.anchoredAbove && withinViewport(flipped.menuRect, flipped.viewport),
    JSON.stringify({ menu: flipped.menuRect, button: flipped.summaryRect, viewport: flipped.viewport, flipAdjacency }));
  await closeAnyMenu();

  // ── S4 — it stays inside a phone-width viewport and adds no overflow ──
  await closeAnyMenu();
  await openPhoneFrame();
  const closedOverflow = await js(`const frame = document.getElementById('${PHONE_FRAME_ID}');
    const doc = frame.contentDocument;
    const root = doc.scrollingElement || doc.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, viewport: frame.contentWindow.innerWidth };`);
  check("S4a the phone viewport really is phone width",
    Math.abs(closedOverflow.viewport - PHONE_VIEWPORT.width) <= 20,
    JSON.stringify(closedOverflow));

  const frameElement = await driver.findElement(By.css(`#${PHONE_FRAME_ID}`));
  await driver.switchTo().frame(frameElement);
  const phoneSummary = await driver.findElement(By.xpath(cardXpath(secondTitle)));
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", phoneSummary);
  await sleep(250);
  await phoneSummary.click();
  await driver.switchTo().defaultContent();
  await waitFor('phone-width menu open', async () => {
    const geometry = await phoneGeometry(secondTitle);
    return !geometry.error && geometry.open && geometry.menuRect.width > 0;
  }, 10_000);

  const narrow = await phoneGeometry(secondTitle);
  check("S4b the menu fits inside a phone-width viewport", withinViewport(narrow.menuRect, narrow.viewport),
    JSON.stringify({ menu: narrow.menuRect, viewport: narrow.viewport }));
  check("S4c the menu stays anchored to its button at phone width",
    adjacentToAnchor(narrow.menuRect, narrow.summaryRect).anchoredBelow ||
      adjacentToAnchor(narrow.menuRect, narrow.summaryRect).anchoredAbove,
    JSON.stringify({ menu: narrow.menuRect, button: narrow.summaryRect, adjacency: adjacentToAnchor(narrow.menuRect, narrow.summaryRect) }));
  check("S4d the menu keeps all three actions at phone width", narrow.items.length === 3, JSON.stringify(narrow.items));
  check("S4e the menu paints above the card at phone width", narrow.menuOnTop, JSON.stringify({ menu: narrow.menuRect }));
  check("S4f the menu adds no horizontal page overflow of its own",
    narrow.scrollWidth <= Math.max(closedOverflow.scrollWidth, narrow.clientWidth + 1),
    JSON.stringify({ closed: closedOverflow, openScrollWidth: narrow.scrollWidth, clientWidth: narrow.clientWidth, menu: narrow.menuRect }));
  check("S4g the menu never extends past the right edge of the viewport",
    narrow.menuRect.right <= narrow.viewport.width + 1, JSON.stringify({ menu: narrow.menuRect, viewport: narrow.viewport }));
  check("S4h only one menu is open at phone width", narrow.openMenus === 1, String(narrow.openMenus));
  await removePhoneFrame();
  await sleep(300);

  // ── S5 — the menu follows its card while the page scrolls ──────────────
  await openMenu(secondTitle);
  const beforeScroll = await menuGeometry(secondTitle);
  await js("window.scrollBy(0, 140);");
  await sleep(250);
  const afterScroll = await menuGeometry(secondTitle);
  const scrollAdjacency = adjacentToAnchor(afterScroll.menuRect, afterScroll.summaryRect);
  check("S5 the menu stays attached to its button after scrolling",
    scrollAdjacency.anchoredBelow || scrollAdjacency.anchoredAbove,
    JSON.stringify({ before: beforeScroll.menuRect, after: afterScroll.menuRect, scrollAdjacency }));
  check("S5b the menu remains visible and correct while scrolled", withinViewport(afterScroll.menuRect, afterScroll.viewport),
    JSON.stringify({ menu: afterScroll.menuRect, viewport: afterScroll.viewport }));

  // ── S6 — it recomputes when the viewport changes ───────────────────────
  await driver.manage().window().setRect({ width: 900, height: 700, x: 20, y: 20 });
  await sleep(400);
  const resized = await menuGeometry(secondTitle);
  const resizeAdjacency = adjacentToAnchor(resized.menuRect, resized.summaryRect);
  check("S6 the menu follows the button after a window resize",
    (resizeAdjacency.anchoredBelow || resizeAdjacency.anchoredAbove) && withinViewport(resized.menuRect, resized.viewport),
    JSON.stringify({ menu: resized.menuRect, button: resized.summaryRect, viewport: resized.viewport }));

  // ── S7 — multiple cards: exactly one menu, always the right one ────────
  await driver.manage().window().setRect(desktopRect);
  await sleep(400);
  await closeAnyMenu();
  await scrollCardIntoView(secondTitle);
  assert(await clickCardAction(secondTitle, "More Actions"), `More Actions is unavailable for ${secondTitle}`);
  await sleep(250);
  await openMenu(thirdTitle);
  const multiple = await menuGeometry(thirdTitle);
  const openedMenus = await js("return document.querySelectorAll('details.studio-card-more[open]').length;");
  const thirdAdjacency = adjacentToAnchor(multiple.menuRect, multiple.summaryRect);
  check("S7a opening another card's menu closes the previous one", Number(openedMenus) === 1, `open menus: ${openedMenus}`);
  check("S7b the open menu belongs to the card that was clicked", thirdAdjacency.anchoredBelow && thirdAdjacency.horizontalOverlap,
    JSON.stringify({ menu: multiple.menuRect, button: multiple.summaryRect }));

  // ── S8 — clicking outside closes the menu ──────────────────────────────
  await driver.findElements(By.css(".home-page h1")).then(elements => elements[0].click());
  await waitFor("outside click closes the menu", async () => Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;")) === 0);
  check("S8 clicking outside closes the menu", true);

  // ── S9 — Escape closes the menu ────────────────────────────────────────
  await openMenu(thirdTitle);
  await driver.findElements(By.css("body")).then(elements => elements[0].sendKeys(Key.ESCAPE));
  await waitFor("Escape closes the menu", async () => Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;")) === 0);
  check("S9 Escape closes the menu", true);

  // ── S10 — clicking More Actions again closes the menu ──────────────────
  await openMenu(thirdTitle);
  await clickCardAction(thirdTitle, "More Actions");
  await waitFor("second click closes the menu", async () => Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;")) === 0);
  check("S10 clicking More Actions again closes the menu", true);

  // ── S11 — keyboard navigation and focus indicators ─────────────────────
  await waitForCard(thirdTitle);
  const summaryKeyboard = await js(`const wanted = arguments[0];
    const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    });
    if (!card) return false;
    const summary = card.querySelector('.studio-card-more summary');
    if (!summary) return false;
    summary.focus(); return document.activeElement === summary;`, thirdTitle);
  check("S11a More Actions is focusable", summaryKeyboard, "summary did not take focus");
  await driver.findElements(By.css("summary")).then(async () => {
    await js(`const wanted = arguments[0];
      const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
        const strong = node.querySelector('.studio-card-title strong');
        return strong && strong.textContent.trim() === wanted;
      });
      card.querySelector('.studio-card-more summary').focus();`, thirdTitle);
  });
  const focusedSummary = await driver.findElements(By.css(".studio-card-more summary"));
  const targetSummary = focusedSummary[await js(`const summaries = Array.from(document.querySelectorAll('.studio-card'));
    return summaries.findIndex(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === arguments[0];
    });`, thirdTitle)];
  await targetSummary.sendKeys(Key.ARROW_DOWN);
  await waitFor("arrow key opens the menu with focus inside", async () =>
    Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;")) === 1);
  const firstFocus = await js("return document.activeElement ? document.activeElement.textContent.trim() : null;");
  check("S11b ArrowDown on the button opens the menu and focuses the first action", firstFocus === "Rename Studio", `focused: ${firstFocus}`);
  await driver.findElements(By.css("body")).then(elements => elements[0].sendKeys(Key.ARROW_DOWN));
  const secondFocus = await js("return document.activeElement ? document.activeElement.textContent.trim() : null;");
  check("S11c arrow keys move focus through the actions", secondFocus === "Archive Studio", `focused: ${secondFocus}`);
  const focusOutline = await js(`const active = document.activeElement;
    if (!active) return null;
    const style = getComputedStyle(active);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };`);
  check("S11d the focused action keeps a visible focus indicator",
    Boolean(focusOutline) && focusOutline.outlineStyle !== "none" && parseFloat(focusOutline.outlineWidth) > 0,
    JSON.stringify(focusOutline));
  await driver.findElements(By.css("body")).then(elements => elements[0].sendKeys(Key.ESCAPE));
  await waitFor("Escape from the menu closes it", async () => Number(await js("return document.querySelectorAll('details.studio-card-more[open]').length;")) === 0);
  const returnedFocus = await js("return document.activeElement ? document.activeElement.textContent.trim() : null;");
  check("S11e Escape returns focus to the More Actions button", returnedFocus === "More Actions", `focused: ${returnedFocus}`);

  // ── S12 — Rename Studio still works ────────────────────────────────────
  const renamedTitle = `TPI-133 Alpha Renamed ${runId}`;
  await openMenu(firstTitle);
  await clickCardAction(firstTitle, "Rename Studio");
  const dashboardPrefill = await waitFor("Rename Studio opens the selected Studio's dashboard", async () =>
    js("return document.querySelector('.studio-settings-block input')?.value || '';"), 15_000).catch(() => "");
  check("S12a Rename Studio opens the selected Studio's settings", dashboardPrefill === firstTitle, `prefill: ${dashboardPrefill}`);
  await js(`const input = document.querySelector('.studio-settings-block input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, arguments[0]);
    input.dispatchEvent(new Event('input', { bubbles: true }));`, renamedTitle);
  await js(`const button = Array.from(document.querySelectorAll('.studio-settings-block button')).find(node => node.textContent.trim() === 'Rename Studio'); button.click();`);
  await sleep(800);
  await gotoStudioHome();
  const renameApplied = await waitFor(`renamed Studio card`, async () => Boolean(await js(`return Array.from(document.querySelectorAll('.studio-card')).some(node => {
    const strong = node.querySelector('.studio-card-title strong');
    return strong && strong.textContent.trim() === arguments[0];
  });`, renamedTitle)), 10_000).catch(() => false);
  check("S12b Rename Studio updates the Studio card", renameApplied, `card ${renamedTitle} not found`);

  // ── S13 — Delete Studio opens the guarded confirmation for that Studio ─
  const serverTitle = `TPI-133 Server ${runId}`;
  await createServerStudio(serverTitle);
  await openMenu(serverTitle);
  await clickCardAction(serverTitle, "Delete Studio");
  const dialogStudio = await waitFor("guarded permanent deletion confirmation", async () =>
    js("return document.querySelector('.studio-delete-summary')?.textContent || '';"), 15_000).catch(() => "");
  check("S13a Delete Studio opens the guarded confirmation for the clicked Studio", dialogStudio.includes(serverTitle), dialogStudio.slice(0, 200));
  const submitState = await js(`const button = document.querySelector('[data-testid=studio-delete-submit]');
    return button ? { disabled: button.disabled, label: button.textContent.trim(), confirmationField: Boolean(document.querySelector('[data-testid=studio-delete-confirmation]')), warning: Boolean(document.querySelector('.studio-delete-warning')) } : null;`);
  check("S13b permanent deletion still requires the exact Studio name",
    Boolean(submitState) && submitState.disabled && submitState.confirmationField && submitState.warning && submitState.label === "Delete Studio Permanently",
    JSON.stringify(submitState));
  await js("document.querySelector('.studio-delete-actions .outline-button').click();");
  await waitFor("cancel closes the confirmation", async () => Number(await js("return document.querySelectorAll('.studio-delete-warning').length;")) === 0);
  check("S13c cancelling closes the confirmation without deleting anything", true);

  // ── S14 — Archive Studio still works ──────────────────────────────────
  await openMenu(serverTitle);
  await clickCardAction(serverTitle, "Archive Studio");
  const archived = await waitFor(`archived Studio ${serverTitle}`, async () => Boolean(await js(`const sections = Array.from(document.querySelectorAll('.studio-archive-section'));
    return sections.some(section => Array.from(section.querySelectorAll('.studio-card-title strong')).some(node => node.textContent.trim() === arguments[0]));`, serverTitle)), 20_000).catch(() => false);
  check("S14a Archive Studio moves the card into Archived Studios", archived, `archived card ${serverTitle} not found`);
  const activeGrid = await js("const grid = document.querySelector('.studio-card-grid'); return grid ? grid.textContent : '';");
  check("S14b the archived Studio leaves the active listing", !String(activeGrid).includes(serverTitle), String(activeGrid).slice(0, 160));

  // ── S15 — tablet and phone viewports stay usable ───────────────────────
  const viewports = [{ label: "tablet", width: 820, height: 1180 }, { label: "phone", width: 390, height: 780 }];
  for (const viewport of viewports) {
    await driver.manage().window().setRect({ width: viewport.width, height: viewport.height, x: 20, y: 20 });
    await sleep(400);
    await gotoStudioHome();
    await closeAnyMenu();
    const closedOverflow = await js("const root = document.scrollingElement || document.documentElement; return root.scrollWidth;");
    await scrollCardIntoView(thirdTitle);
    await openMenu(thirdTitle);
    const geometry = await menuGeometry(thirdTitle);
    const usable = withinViewport(geometry.menuRect, geometry.viewport) &&
      (adjacentToAnchor(geometry.menuRect, geometry.summaryRect).anchoredBelow || adjacentToAnchor(geometry.menuRect, geometry.summaryRect).anchoredAbove) &&
      geometry.scrollWidth <= Math.max(Number(closedOverflow), geometry.clientWidth + 1) &&
      geometry.menuRect.width >= 180;
    check(`S15 ${viewport.label} viewport (${viewport.width}×${viewport.height}) keeps the menu anchored, inside the viewport and free of horizontal overflow`,
      usable, JSON.stringify({ menu: geometry.menuRect, button: geometry.summaryRect, viewport: geometry.viewport, scrollWidth: geometry.scrollWidth, closedScrollWidth: closedOverflow, clientWidth: geometry.clientWidth }));
    const itemClicked = await clickCardAction(thirdTitle, "More Actions");
    check(`S15 ${viewport.label} the menu can be closed again with touch-sized controls`, itemClicked, "More Actions is unavailable");
  }

  // ── S16 — positioning work never modifies Studio data ──────────────────
  await driver.manage().window().setRect(desktopRect);
  await sleep(400);
  await gotoStudioHome();
  // Isolate the positioning interactions: the rename, archive and delete-dialog
  // checks above legitimately changed records, so measure only a menu-only
  // sequence (open, close, switch cards, scroll, resize, outside click,
  // Escape) and compare the Studio records across it.
  const recordsBeforePositioning = await js("return localStorage.getItem('studioflow.broadcasts') || '';");
  const inventoryBefore = await js("return window.__tpiStudioWorkspace.studioDeletionInventory(arguments[0]).then(value => JSON.stringify({ storage: value.storage, workspaceId: value.workspaceId, snapshot: Boolean(value.localRecoverySnapshot) })).catch(error => String(error));", thirdTitle);
  await openMenu(thirdTitle);
  await closeAnyMenu();
  await openMenu(firstTitle === thirdTitle ? renamedTitle : thirdTitle);
  await closeAnyMenu();
  await js("window.scrollBy(0, 200);");
  await sleep(150);
  await driver.manage().window().setRect({ width: 1000, height: 820, x: 20, y: 20 });
  await sleep(300);
  await openMenu(thirdTitle);
  await driver.findElements(By.css(".home-page h1")).then(elements => elements[0].click());
  await sleep(200);
  await openMenu(thirdTitle);
  await driver.findElements(By.css("body")).then(elements => elements[0].sendKeys(Key.ESCAPE));
  await sleep(200);
  const recordsAfterPositioning = await js("return localStorage.getItem('studioflow.broadcasts') || '';");
  const inventoryAfter = await js("return window.__tpiStudioWorkspace.studioDeletionInventory(arguments[0]).then(value => JSON.stringify({ storage: value.storage, workspaceId: value.workspaceId, snapshot: Boolean(value.localRecoverySnapshot) })).catch(error => String(error));", thirdTitle);
  check("S16a opening, closing, scrolling and resizing the menu never writes Studio records",
    recordsAfterPositioning === recordsBeforePositioning,
    `records changed (before ${recordsBeforePositioning.length} bytes, after ${recordsAfterPositioning.length} bytes)`);
  check("S16a2 the Studio's server identity and storage classification are unchanged by menu interaction",
    inventoryBefore === inventoryAfter, JSON.stringify({ before: inventoryBefore, after: inventoryAfter }));
  const dataAfter = recordsAfterPositioning;
  const surviving = await js(`return Array.from(document.querySelectorAll('.studio-card-title strong')).map(node => node.textContent.trim())
    .filter(title => title.startsWith('TPI-133 '));`);
  check("S16b every disposable Studio from the run still exists", surviving.includes(renamedTitle) && surviving.includes(thirdTitle),
    JSON.stringify(surviving));
  const ownerStudioTouched = await js(`return Array.from(document.querySelectorAll('.studio-card-title strong'))
    .filter(node => node.textContent.trim() === 'Crossroads of the Unknown').length;`);
  check("S16c the owner's Studio is untouched", Number(ownerStudioTouched) <= 1, `matches: ${ownerStudioTouched}`);

  return { evidenceRoot };
}

try {
  const context = await run();
  const passed = results.filter(result => result.passed).length;
  console.log(JSON.stringify({
    suite: "TPI-STUDIOFLOW-133",
    base,
    passed,
    total: results.length,
    status: passed === results.length ? "PASS" : "FAIL",
    evidenceRoot: context.evidenceRoot,
    results
  }, null, 2));
  if (passed !== results.length) process.exitCode = 1;
} catch (error) {
  console.error(`TPI-STUDIOFLOW-133 suite failed: ${safe(error)}`);
  if (results.length) console.error(JSON.stringify({ passed: results.filter(result => result.passed).length, total: results.length, results }, null, 2));
  process.exitCode = 1;
} finally {
  if (driver) {
    // Disposable server fixtures only: the run never creates or deletes
    // anything belonging to the owner or to another account.
    await purgeFixtures().catch(() => undefined);
    await driver.quit().catch(() => undefined);
  }
}

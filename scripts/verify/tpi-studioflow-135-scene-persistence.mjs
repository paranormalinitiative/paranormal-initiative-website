#!/usr/bin/env node
// TPI-STUDIOFLOW-135 — Scene production item persistence across the
// account-backed workspace.
//
// TPI-134R shipped the restored Scene drag, colors and live-Teleprompter cue,
// then live acceptance found that a dropped Teleprompter script disappeared
// after a reload. The cause was not the reload: the server's
// `normalizeStudioConfiguration` allow-list omitted the `teleprompter-script`
// kind and its `teleprompterScriptId` reference, so an account-backed save
// silently discarded the row even though the browser sent it. The bridge's own
// `normalizeScenePanelItems` dropped it a second time during restore.
//
// This suite is deliberately account-backed. The TPI-134 gate seeds a Studio in
// browser-local storage only, so it can never observe a server-side discard.
// Here the Studio is created through the real dashboard, saved through the real
// workspace API, reloaded with a genuine page load, and inspected through the
// stored snapshot — not through a status badge.
//
// Every run uses a brand-new disposable Firefox Developer Edition profile and
// creates only its own clearly named disposable Studios, which it deletes and
// purges before it finishes. It never opens the owner's Studios, never clears
// the owner's profile, and never touches Crossroads of the Unknown.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const accountKey = process.env.TPI_FIREFOX_ACCOUNT || "test_admin";

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));
const waitFor = async (description, predicate, timeout = 30_000, interval = 250) => {
  const started = Date.now();
  let last = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      last = String(value);
    } catch (error) {
      last = safe(error);
    }
    await sleep(interval);
  }
  throw new Error(`${description} timed out${last ? `: ${last}` : ""}`);
};

if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-135", reason: "Firefox binary, geckodriver, or disposable credentials are unavailable." }, null, 2));
  process.exit(1);
}

const rawCredentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = rawCredentials.accounts?.[accountKey] ?? rawCredentials;
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-135", reason: `The ${accountKey} account is unavailable.` }, null, 2));
  process.exit(1);
}

const stamp = Date.now();
const studioTitle = `TPI 135 Persistence ${stamp}`;
const otherTitle = `TPI 135 Isolation ${stamp}`;
const scriptId = `tpi-135-script-${stamp}`;
// Long body on purpose: the live teleprompter only scrolls content that
// overflows, so a short script could not prove playback.
const scriptBody = `Disposable TPI-135 persistence script.\n${"This line exists so the live teleprompter reader can scroll during verification. ".repeat(40)}`;

let driver;
const created = [];
let failure = null;

const panelRows = () => driver.executeScript(`
  return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function (node) {
    return { id: node.getAttribute('data-tpi-scene-panel-item'), kind: node.getAttribute('data-production-kind'), text: (node.textContent || '').replace(/\\s+/g, ' ').trim() };
  });`);

const storedPanel = () => driver.executeScript(`
  var raw = localStorage.getItem('studioflow.scenePanelItems');
  var items = null; try { items = raw ? JSON.parse(raw) : null; } catch (error) { items = null; }
  return Array.isArray(items) ? items.map(function (item) { return { id: item.id, kind: item.kind, sceneId: item.sceneId || null, teleprompterScriptId: item.teleprompterScriptId || null, title: item.title || null }; }) : null;`);

const api = (path, init = {}) => driver.executeAsyncScript(`
  var path = arguments[0], init = arguments[1], done = arguments[arguments.length - 1];
  fetch(path, Object.assign({ credentials: 'same-origin' }, init)).then(function (response) {
    return response.text().then(function (text) {
      var body = null; try { body = JSON.parse(text); } catch (error) { body = null; }
      done({ status: response.status, body: body });
    });
  }).catch(function (error) { done({ status: 0, error: String(error) }); });`, path, init);

const listWorkspaces = async () => {
  const response = await api("/api/studio/workspaces");
  return (response.body && (response.body.workspaces || [])) || [];
};

const serverWorkspace = async (id) => {
  const response = await api(`/api/studio/workspaces/${encodeURIComponent(id)}`);
  return response.body && response.body.workspace ? response.body.workspace : null;
};

// The bridge saves on its own schedule, so a just-created Studio can still be
// settling its version. Waiting for the stored version to stop moving keeps the
// drop below from racing an in-flight save (which would surface as a conflict).
const settleWorkspace = async (id, timeout = 20_000) => {
  const started = Date.now();
  let previous = null;
  while (Date.now() - started < timeout) {
    const workspace = await serverWorkspace(id);
    const version = workspace ? workspace.version : null;
    if (version !== null && version === previous) return workspace;
    previous = version;
    await sleep(1200);
  }
  return serverWorkspace(id);
};

// Forces the Studio's own Save Project action, exactly as a creator can.
const saveNow = async () => {
  await driver.executeScript("var selector=document.querySelector('.tpi-studio-selector'); if(selector) selector.click(); return Boolean(selector);");
  await sleep(400);
  await driver.executeScript("var save=document.querySelector('.tpi-studio-manage-menu [data-action=\"save\"], .tpi-studio-menu [data-action=\"save\"]'); if(save) save.click(); return Boolean(save);");
  await sleep(2500);
};

const waitForStoredPanel = async (id, predicate, description) => {
  let lastStatus = null;
  try {
    return await waitFor(description, async () => {
      const response = await api(`/api/studio/workspaces/${encodeURIComponent(id)}`);
      lastStatus = response.status;
      const panel = (response.body?.workspace?.state?.configuration?.scenePanelItems) || [];
      return predicate(panel, response.body?.workspace) ? response.body.workspace : false;
    }, 20_000, 1200);
  } catch (error) {
    await saveNow();
    return waitFor(description, async () => {
      const response = await api(`/api/studio/workspaces/${encodeURIComponent(id)}`);
      lastStatus = response.status;
      const panel = (response.body?.workspace?.state?.configuration?.scenePanelItems) || [];
      return predicate(panel, response.body?.workspace) ? response.body.workspace : false;
    }, 45_000, 1200).catch((retryError) => {
      throw new Error(`${safe(retryError)} (last workspace status ${lastStatus})`);
    });
  }
};

// Creates a Studio through the real dashboard dialog, exactly as a creator does.
// The name is typed through the native value setter because a plain assignment
// is ignored by React's controlled input, and the new Studio is identified by
// the id that did not exist before this call rather than by its title.
const createStudio = async (title) => {
  const known = new Set((await listWorkspaces()).map((item) => item.id));
  await driver.executeScript(`
    var open = Array.prototype.slice.call(document.querySelectorAll('button')).filter(function (b) { return /create new studio/i.test((b.textContent || '').trim()); })[0];
    if (open) open.click();
    return Boolean(open);`);
  await waitFor("create Studio dialog", async () => Boolean(await driver.executeScript(`
    var dialog = document.querySelector('#tpi-studio-dialog, .tpi-studio-dialog');
    var inputs = document.querySelectorAll('input:not([type]),input[type="text"]');
    if (dialog && dialog.hidden) return false;
    return inputs.length > 0;`)));
  const typed = await driver.executeScript(`
    var list = document.querySelectorAll('input:not([type]),input[type="text"]');
    var input = list[list.length - 1];
    if (!input) return 'no-input';
    input.focus();
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, arguments[0]);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    var submit = Array.prototype.slice.call(document.querySelectorAll('button')).filter(function (b) { return (b.textContent || '').trim() === 'Create Studio'; })[0];
    if (!submit) return 'no-button';
    submit.click();
    return 'submitted';`, title);
  await waitFor("created Studio editor", async () => Boolean(await driver.executeScript("return Boolean(document.querySelector('[data-tpi-scenes-panel]'));")));
  const workspace = await waitFor("created Studio workspace", async () => {
    const found = (await listWorkspaces()).find((item) => !known.has(item.id));
    return found || false;
  }, 30_000, 1000);
  created.push(workspace.id);
  await settleWorkspace(workspace.id);
  workspace.createdWith = typed;
  return workspace;
};

const openStudioById = async (id) => {
  await driver.executeScript(`
    var selector = document.querySelector('.tpi-studio-selector');
    if (selector) selector.click();
    return true;`);
  await waitFor("Studio menu item", async () => Boolean(await driver.executeScript(`
    return Boolean(document.querySelector('.tpi-studio-menu button[data-workspace-id="' + arguments[0] + '"]'));`, id)));
  await driver.executeScript(`
    var item = document.querySelector('.tpi-studio-menu button[data-workspace-id="' + arguments[0] + '"]');
    if (item) item.click();
    return Boolean(item);`, id);
  await waitFor("Studio switch", async () => Boolean(await driver.executeScript(`
    var active = document.querySelector('.tpi-studio-selector');
    var workspaceId = document.querySelector('.tpi-studio-menu button[data-workspace-id="' + arguments[0] + '"]');
    return Boolean(active) && Boolean(document.querySelector('[data-tpi-scenes-panel]')) && Boolean(workspaceId);`, id)));
  await sleep(1500);
};

// Removes only this run's disposable Studios. The Studio may still be saving
// when cleanup starts, so a version conflict is retried against a fresh read
// instead of leaving a disposable row behind.
const purgeStudio = async (id) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const current = await serverWorkspace(id);
      if (!current || !current.title) return;
      const deleted = await api(`/api/studio/workspaces/${encodeURIComponent(id)}/delete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedVersion: current.version })
      });
      const version = deleted.body && deleted.body.workspace ? deleted.body.workspace.version : null;
      if (deleted.status === 200 && version) {
        const purged = await api(`/api/studio/workspaces/${encodeURIComponent(id)}/purge`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "studio-only", expectedVersion: version })
        });
        if (purged.status === 200 && purged.body && purged.body.purged) return;
      }
    } catch (error) {
      // Fall through to the retry below; cleanup never changes the result.
    }
    await sleep(1200);
  }
};

try {
  const profile = mkdtempSync(join(tmpdir(), "tpi-135-profile-"));
  const options = new firefox.Options()
    .setBinary(binary)
    .setProfile(profile)
    .addArguments("-no-remote", "-new-instance")
    .setPreference("media.autoplay.default", 0)
    .setPreference("media.autoplay.blocking_policy", 0)
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1000, x: 40, y: 40 });

  // ---- 1. Isolated disposable Firefox session -----------------------------
  await driver.get(`${base}/studio/`);
  const login = await driver.executeAsyncScript(`
    var done = arguments[arguments.length - 1];
    fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: arguments[0], password: arguments[1] }) })
      .then(function (response) { done(response.status); })
      .catch(function (error) { done(String(error)); });`, account.username, account.password);
  check("disposable QA account authenticates", login === 200, `login=${login}`);
  await driver.navigate().refresh();
  await waitFor("authenticated StudioFlow dashboard", async () => Boolean(await driver.executeScript("return Boolean(document.querySelector('.tpi-studio-selector')) || Boolean(document.querySelector('.nav-return'));")));
  const sessionUser = await api("/api/auth/me");
  check("authenticated session is the disposable QA account", sessionUser.status === 200 && sessionUser.body?.user?.username === account.username, JSON.stringify({ status: sessionUser.status }));

  // ---- 2. Account-backed Studio A -----------------------------------------
  const studio = await createStudio(studioTitle);
  check("disposable Studio is stored as an account workspace", Boolean(studio && studio.id) && studio.title === studioTitle, JSON.stringify({ id: studio?.id, title: studio?.title, typed: studio?.createdWith }));
  const initialServer = await serverWorkspace(studio.id);
  const initialPanel = initialServer?.state?.configuration?.scenePanelItems || [];
  check("new account workspace starts with its own default Scene panel", initialPanel.length === 4, JSON.stringify(initialPanel.map((item) => item.kind)));

  const studioId = initialServer.state.broadcast.id;
  await driver.executeScript(`
    var list = [];
    try { list = JSON.parse(localStorage.getItem('studioflow.teleprompterScripts') || '[]'); } catch (error) { list = []; }
    list.push({ id: arguments[0], studioId: arguments[1], title: 'TPI 135 Persistence Script', body: arguments[2], updatedAt: 'TPI 135', createdAt: Date.now() });
    localStorage.setItem('studioflow.teleprompterScripts', JSON.stringify(list));
    return list.length;`, scriptId, studioId, scriptBody);
  await driver.navigate().refresh();
  await waitFor("restored Studio editor", async () => Boolean(await driver.executeScript("return Boolean(document.querySelector('[data-tpi-scenes-panel]'));")));
  await driver.executeScript("var tab=document.querySelector('[data-studio-panel-tab=\"Teleprompter\"]'); if (tab) tab.click(); return Boolean(tab);");
  await waitFor("Teleprompter script card", async () => Boolean(await driver.executeScript("return Boolean(document.querySelector('[data-teleprompter-script-id=\"' + arguments[0] + '\"]'));", scriptId)));

  // ---- 3. Add the script to a Scene through the real drop path -------------
  const before = await panelRows();
  check("Scenes panel starts from the Studio's own four rows", before.length === 4, JSON.stringify(before));
  const dropped = await driver.executeScript(`
    var dt = new DataTransfer();
    window.__tpi135Drag = dt;
    var card = document.querySelector('[data-teleprompter-script-id="' + arguments[0] + '"]');
    if (!card) return 'no-card';
    card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
    var panel = document.querySelector('[data-tpi-scenes-panel]');
    var rows = panel.querySelectorAll('[data-tpi-scene-panel-item]');
    var y = rows.length > 1 ? rows[1].getBoundingClientRect().top + 4 : panel.getBoundingClientRect().top + 10;
    panel.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientY: y }));
    return 'ok';`, scriptId);
  await sleep(350);
  await driver.executeScript(`
    var dt = window.__tpi135Drag;
    var panel = document.querySelector('[data-tpi-scenes-panel]');
    var rows = panel.querySelectorAll('[data-tpi-scene-panel-item]');
    var y = rows.length > 1 ? rows[1].getBoundingClientRect().top + 4 : panel.getBoundingClientRect().top + 10;
    panel.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientY: y }));
    return 'ok';`, scriptId);
  await waitFor("dropped Scene script row", async () => (await panelRows()).some((row) => row.kind === "teleprompter-script"));
  check("dropped Teleprompter script appears as a Scene row", dropped === "ok", dropped);

  // ---- 4. The account save must actually store the row --------------------
  const saved = await waitForStoredPanel(
    studio.id,
    (panel) => panel.some((item) => item.kind === "teleprompter-script" && item.teleprompterScriptId === scriptId),
    "account save containing the Scene script"
  );
  const savedPanel = saved.state.configuration.scenePanelItems;
  const savedIndex = savedPanel.findIndex((item) => item.kind === "teleprompter-script");
  check("the server snapshot stores the Scene script with its script reference", savedIndex === 1 && savedPanel[savedIndex].teleprompterScriptId === scriptId, JSON.stringify(savedPanel));
  check("the server snapshot keeps the Scene association and row order", savedPanel.map((item) => item.kind).join(",") === "intro,teleprompter-script,scene,scene,outro", JSON.stringify(savedPanel.map((item) => item.kind)));

  // ---- 5. Genuine reload restores the row ---------------------------------
  await driver.navigate().refresh();
  await waitFor("restored Scenes panel after reload", async () => (await panelRows()).length === 5);
  const restoredRows = await panelRows();
  const restoredPanel = await storedPanel();
  check("the Scene script survives a real browser reload", restoredRows.filter((row) => row.kind === "teleprompter-script").length === 1, JSON.stringify(restoredRows));
  check("the restored row keeps its position in the Scenes panel", restoredRows[1]?.kind === "teleprompter-script", JSON.stringify(restoredRows.map((row) => row.kind)));
  check("the restored row keeps its script identifier", restoredPanel?.[1]?.teleprompterScriptId === scriptId, JSON.stringify(restoredPanel));

  // ---- 6. The restored row still cues the live Teleprompter ---------------
  await driver.executeScript("var row=document.querySelector('[data-production-kind=\"teleprompter-script\"] .scene-panel-item-button'); if(row) row.click(); return Boolean(row);");
  await waitFor("live presenter teleprompter", async () => Boolean(await driver.executeScript("return Boolean(document.querySelector('.stage-teleprompter-reader'));")));
  const opened = await driver.executeScript(`
    var reader = document.querySelector('.stage-teleprompter-reader');
    return {
      scroll: reader ? Math.round(reader.scrollTop) : null,
      text: reader ? (reader.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120) : '',
      dialog: Boolean(document.querySelector('.studio-prompter-dialog')),
      labels: Array.prototype.map.call(document.querySelectorAll('.stage-teleprompter-controls button'), function (b) { return (b.textContent || '').trim(); })
    };`);
  check("the restored row cues the live presenter teleprompter", Boolean(opened.text) && opened.text.includes("Disposable TPI-135"), opened.text);
  check("the restored row does not open the blocking reader dialog", opened.dialog === false, String(opened.dialog));
  check("the restored script starts at the beginning and paused", opened.scroll === 0 && opened.labels[0] === "Play", JSON.stringify({ scroll: opened.scroll, labels: opened.labels }));

  const play = await driver.executeScript("var buttons=document.querySelectorAll('.stage-teleprompter-controls button'); buttons[0].click(); return (buttons[0].textContent||'').trim();");
  const scrolled = await waitFor("teleprompter playback", async () => {
    const value = await driver.executeScript("var reader=document.querySelector('.stage-teleprompter-reader'); return reader ? Math.round(reader.scrollTop) : -1;");
    return value > 0 ? value : false;
  }, 15_000);
  check("Play scrolls the restored script", Boolean(play) && scrolled > 0, JSON.stringify({ play, scroll: scrolled }));
  await driver.executeScript("var buttons=document.querySelectorAll('.stage-teleprompter-controls button'); if((buttons[0].textContent||'').trim()==='Pause') buttons[0].click(); return true;");
  const heldOne = await driver.executeScript("var reader=document.querySelector('.stage-teleprompter-reader'); return reader ? Math.round(reader.scrollTop) : -1;");
  await sleep(1200);
  const heldTwo = await driver.executeScript("var reader=document.querySelector('.stage-teleprompter-reader'); return reader ? Math.round(reader.scrollTop) : -1;");
  check("Pause holds the restored script", heldOne > 0 && Math.abs(heldTwo - heldOne) <= 2, JSON.stringify({ heldOne, heldTwo }));
  await driver.executeScript("var buttons=document.querySelectorAll('.stage-teleprompter-controls button'); buttons[1].click(); return true;");
  await sleep(700);
  const reset = await driver.executeScript(`
    var reader = document.querySelector('.stage-teleprompter-reader');
    var buttons = document.querySelectorAll('.stage-teleprompter-controls button');
    return { scroll: reader ? Math.round(reader.scrollTop) : null, label: buttons.length ? (buttons[0].textContent || '').trim() : null };`);
  check("Reset returns the restored script to the beginning", reset.scroll === 0 && reset.label === "Play", JSON.stringify(reset));
  await driver.executeScript("var buttons=document.querySelectorAll('.stage-teleprompter-controls button'); var hide=Array.prototype.slice.call(buttons).filter(function(b){return (b.textContent||'').trim()==='Hide';})[0]; if(hide) hide.click(); return true;");
  await sleep(600);

  // ---- 7. Studio switching stays isolated --------------------------------
  const other = await createStudio(otherTitle);
  check("second disposable Studio is account-backed", Boolean(other && other.id), JSON.stringify({ id: other?.id }));
  const otherRows = await waitFor("second Studio panel", async () => {
    const rows = await panelRows();
    return rows.length === 4 ? rows : false;
  });
  check("a second Studio does not inherit the first Scene script", otherRows.length === 4, JSON.stringify(otherRows.map((row) => row.kind)));
  const otherServer = await serverWorkspace(other.id);
  const otherPanel = otherServer?.state?.configuration?.scenePanelItems || [];
  check("the second Studio's snapshot carries no foreign Scene row", otherPanel.length === 4 && !otherPanel.some((item) => item.kind === "teleprompter-script"), JSON.stringify(otherPanel.map((item) => item.kind)));

  await openStudioById(studio.id);
  const returnedRows = await waitFor("returning to the first Studio restores its Scene script", async () => {
    const rows = await panelRows();
    return rows.some((row) => row.kind === "teleprompter-script") ? rows : false;
  });
  check("returning to the first Studio restores its Scene script", returnedRows[1]?.kind === "teleprompter-script", JSON.stringify(returnedRows.map((row) => row.kind)));

  // ---- 8. An intentional removal persists --------------------------------
  const removed = await driver.executeScript(`
    window.confirm = function () { return true; };
    var row = document.querySelector('[data-production-kind="teleprompter-script"]');
    if (!row) return 'no-row';
    var trigger = row.querySelector('.scene-item-menu-trigger') || row.querySelector('button[aria-haspopup="menu"]');
    if (!trigger) return 'no-trigger';
    trigger.click();
    return 'opened';`);
  const menuLabels = await waitFor("Scene row context menu", async () => {
    const labels = await driver.executeScript("return Array.prototype.map.call(document.querySelectorAll('.scene-item-context-menu button'), function (b) { return (b.textContent || '').trim(); });");
    return labels.length ? labels : false;
  });
  check("Scene row context menu exposes a removal action", menuLabels.some((label) => /remove|delete/i.test(label)), JSON.stringify(menuLabels));
  await driver.executeScript(`
    var target = Array.prototype.slice.call(document.querySelectorAll('.scene-item-context-menu button')).filter(function (b) { return /remove|delete/i.test((b.textContent || '').trim()); })[0];
    if (target) target.click();
    return Boolean(target);`);
  await waitFor("removed Scene script row", async () => !(await panelRows()).some((row) => row.kind === "teleprompter-script"));
  const removalSaved = await waitForStoredPanel(
    studio.id,
    (panel) => !panel.some((item) => item.kind === "teleprompter-script"),
    "account save without the removed row"
  );
  check("the intentional removal is stored in the account snapshot", (removalSaved.state.configuration.scenePanelItems || []).length === 4, JSON.stringify((removalSaved.state.configuration.scenePanelItems || []).map((item) => item.kind)));
  await driver.navigate().refresh();
  await waitFor("Scenes panel after removal reload", async () => (await panelRows()).length === 4);
  const afterRemoval = await panelRows();
  check("the removed Scene script stays removed after a reload", !afterRemoval.some((row) => row.kind === "teleprompter-script"), JSON.stringify(afterRemoval.map((row) => row.kind)));
  check("an intentional removal is not resurrected from the browser copy", removed !== "no-row" && !(await storedPanel()).some((item) => item.kind === "teleprompter-script"), removed);

  // ---- 9. Older snapshots stay readable and cannot leak rows -------------
  const legacy = await serverWorkspace(studio.id);
  const legacyState = JSON.parse(JSON.stringify(legacy.state));
  // A snapshot written before the Scenes panel was stored: configuration keeps
  // Scenes but has no panel field at all.
  delete legacyState.configuration.scenePanelItems;
  const legacyWrite = await api(`/api/studio/workspaces/${encodeURIComponent(studio.id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: legacy.title, state: legacyState, expectedVersion: legacy.version })
  });
  check("an older snapshot without a stored Scene panel is still accepted", legacyWrite.status === 200, JSON.stringify({ status: legacyWrite.status }));
  await driver.navigate().refresh();
  // An older snapshot has no stored panel, so the server stores an empty list
  // and the panel restores empty. That is deliberate: an empty panel is also a
  // legitimate "every row removed" state, so inventing rows here could
  // resurrect work the creator deleted. The guarantee is that the older
  // snapshot stays readable and never shows another Studio's rows.
  const legacyRows = await waitFor("panel restored from an older snapshot", async () => {
    const rows = await panelRows();
    const ready = await driver.executeScript("return Boolean(document.querySelector('[data-tpi-scenes-panel]'));");
    return ready ? rows : false;
  });
  check("an older snapshot restores without error and without inventing Scene rows", legacyRows.length === 0, JSON.stringify(legacyRows.map((row) => row.kind)));
  check("an older snapshot does not inherit another Studio's Scene rows", !legacyRows.some((row) => row.kind === "teleprompter-script" || row.kind === "timer"), JSON.stringify(legacyRows.map((row) => row.kind)));
  await driver.executeScript("var t=document.querySelector('[data-studio-panel-tab=\"Teleprompter\"]'); if(t) t.click(); return true;");
  await waitFor("Teleprompter script still listed after legacy restore", async () => Boolean(await driver.executeScript("return Boolean(document.querySelector('[data-teleprompter-script-id=\"' + arguments[0] + '\"]'));", scriptId)));
  check("the Studio's scripts remain listed after a legacy restore", true);
} catch (error) {
  failure = safe(error);
  results.push({ name: "suite completed without an unexpected error", passed: false, detail: failure });
} finally {
  if (driver) {
    for (const id of created) await purgeStudio(id);
    try {
      const remaining = (await listWorkspaces()).filter((item) => item.title === studioTitle || item.title === otherTitle);
      if (remaining.length) results.push({ name: "disposable Studios were cleaned up", passed: false, detail: JSON.stringify(remaining.map((item) => item.title)) });
      else results.push({ name: "disposable Studios were cleaned up", passed: true, detail: "" });
    } catch (error) {
      results.push({ name: "disposable Studios were cleaned up", passed: false, detail: safe(error) });
    }
    await driver.quit();
  }
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", suite: "TPI-STUDIOFLOW-135", base, account: account.username, passed: results.length - failed.length, total: results.length, failure, results }, null, 2));
process.exit(failed.length ? 1 : 0);

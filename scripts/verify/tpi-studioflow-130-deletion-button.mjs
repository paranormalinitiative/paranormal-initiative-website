#!/usr/bin/env node

// TPI-STUDIOFLOW-130 — disposable browser acceptance for the permanent
// deletion confirmation. This suite uses isolated Firefox and Chrome profiles,
// creates only synthetic local workspaces, and verifies the visible control
// state before deleting the synthetic workspace through the real UI.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import chrome from "selenium-webdriver/chrome.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_130_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const credentials = JSON.parse(readFileSync(resolve(repoRoot, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts?.test_admin;
assert(account?.username && account?.password, "test_admin credentials are required");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const chromeBinary = process.env.TPI_CHROME_BINARY || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const runId = Date.now().toString(36);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-130-"));
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const safe = error => error instanceof Error ? error.message : String(error);
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
let driver;
let workspaceIds = [];

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try { const value = await predicate(); if (value) return value; detail = String(value); }
    catch (error) { detail = safe(error); }
    await sleep(250);
  }
  throw new Error(`${description} timed out: ${detail}`);
}
async function authenticatedFetch(path, options = {}) {
  return driver.executeAsyncScript(`
    const done = arguments[arguments.length - 1];
    const path = arguments[0], options = arguments[1] || {};
    fetch(path, Object.assign({ credentials: "same-origin" }, options, {
      headers: Object.assign({ "content-type": "application/json" }, options.headers || {})
    })).then(async response => {
      const text = await response.text(); let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      done({ status: response.status, body });
    }).catch(error => done({ status: 0, error: String(error) }));
  `, path, options);
}
async function serverFetch(path, options = {}) {
  const cookies = await driver.manage().getCookies();
  const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
  const response = await fetch(`${base}${path}${path.includes("?") ? "&" : "?"}tpi130=${runId}`, {
    method: options.method || "GET",
    headers: { Cookie: cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let body = null; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}
async function purgeBrowserFixtures() {
  for (const id of workspaceIds) {
    try {
      const current = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
      if (current.status !== 200 || !current.body?.workspace) continue;
      const workspace = current.body.workspace;
      if (workspace.state?.broadcast?.status === "recording" || workspace.state?.broadcast?.status === "live") {
        const reset = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: {
            state: { ...workspace.state, broadcast: { ...workspace.state.broadcast, status: "draft" } },
            expectedVersion: workspace.version
          }
        });
        if (reset.status !== 200) continue;
      }
      const latest = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
      if (latest.status === 200 && latest.body?.workspace) {
        await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/purge`, {
          method: "POST",
          body: { mode: "with-contents", expectedVersion: latest.body.workspace.version }
        });
      }
    } catch {
      // Cleanup is best-effort; the result still reports the browser assertion.
    }
  }
  workspaceIds = [];
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
async function createWorkspace(title, status = "draft") {
  const localId = `tpi-130-${runId}-${workspaceIds.length}`;
  const response = await serverFetch("/api/studio/workspaces", {
    method: "POST",
    body: { title, localBroadcastId: localId, state: { broadcast: { id: localId, title, status }, configuration: {} } }
  });
  assert.equal(response.status, 201, JSON.stringify(response));
  workspaceIds.push(response.body.workspace.id);
  return response.body.workspace;
}
async function clickCardAction(title, action) {
  return await js(`const wanted = arguments[0], action = arguments[1];
    const card = Array.from(document.querySelectorAll('.studio-card')).find(node => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    });
    if (!card) return false;
    const controls = Array.from(card.querySelectorAll('button, summary'));
    const target = controls.find(node => node.textContent.trim() === action);
    if (!target) return false; target.click(); return true;`, title, action);
}
async function openDeleteDialog(title) {
  await driver.get(`${base}/studio/`);
  // A previous create/delete-cancel flow can legitimately restore the selected
  // Studio view on refresh. Return Home through the real navigation control
  // before locating the card; do not mutate route storage in the test.
  const homeReady = await waitFor("StudioFlow home or selected Studio", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")), 8_000).catch(() => false);
  if (!homeReady) {
    const exited = await js("const button = document.querySelector('.production-bar .exit-button, .exit-button'); if (!button) return false; button.click(); return true;");
    assert(exited, "StudioFlow did not expose a Home navigation control");
  }
  await waitFor("Studio home", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")));
  assert(await clickCardAction(title, "More Actions"), "More Actions is unavailable");
  await sleep(200);
  assert(await clickCardAction(title, "Delete Studio"), "Delete Studio is unavailable");
  await waitFor("permanent deletion dialog", async () => (await driver.findElements(By.css(".studio-delete-warning"))).length === 1);
  await waitFor("complete deletion inventory", async () => await js("const node = document.querySelector('[data-testid=studio-delete-inventory]'); return node && !node.textContent.includes('Preparing the deletion inventory');"));
}
async function buttonState() { return await js("const button = document.querySelector('[data-testid=studio-delete-submit]'); return button ? { disabled: button.disabled, label: button.textContent.trim() } : null;"); }
async function confirmationInput() { return (await driver.findElements(By.css('[data-testid="studio-delete-confirmation"]')))[0]; }
async function typeName(title) {
  const input = await confirmationInput();
  await input.clear();
  await input.sendKeys(title);
}
async function pasteName(title) {
  const input = await confirmationInput();
  await input.clear();
  // Selenium's browser clipboard promise is not reliable in headless WebDriver
  // sessions. Use the macOS clipboard service, then issue a real Command-V to
  // the focused input; the resulting input/change events still come from the
  // browser and exercise the same React state path as creator paste.
  execFileSync("pbcopy", [], { input: title });
  await input.click();
  await input.sendKeys(Key.COMMAND, "v");
  await waitFor("pasted Studio name", async () => (await js("return document.querySelector('[data-testid=studio-delete-confirmation]')?.value || '';")) === title, 5_000);
}
async function clickSubmit() {
  await js("document.querySelector('[data-testid=studio-delete-submit]').click();");
  await waitFor("deletion dialog outcome", async () => !(await js("return Boolean(document.querySelector('.studio-delete-warning'));")) || Boolean(await js("return document.querySelector('.studio-delete-error');")), 20_000);
}
async function build(kind, profilePath) {
  if (kind === "firefox") {
    const options = new firefox.Options().setBinary(firefoxBinary).setProfile(profilePath).addArguments("-no-remote", "-new-instance")
      .setPreference("media.navigator.streams.fake", true).setPreference("media.navigator.audio.fake", true)
      .setPreference("media.navigator.permission.disabled", true);
    return new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  }
  const options = new chrome.Options().setBinaryPath(chromeBinary).addArguments("--no-sandbox", "--disable-gpu", `--user-data-dir=${profilePath}`);
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}
async function runBrowser(kind) {
  const profile = join(evidenceRoot, `${kind}-profile`); mkdirSync(profile, { recursive: true });
  driver = await build(kind, profile);
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1100, x: 20, y: 20 });
  await login();
  const title = `TPI-130 Activation ${kind} ${runId}`;
  const active = await createWorkspace(title);
  await openDeleteDialog(title);
  const initial = await buttonState();
  check(`${kind}: exact button label`, initial?.label === "Delete Studio Permanently", JSON.stringify(initial));
  check(`${kind}: inventory starts disabled`, initial?.disabled === true, JSON.stringify(initial));
  await typeName("Wrong name");
  check(`${kind}: incorrect name remains disabled`, (await buttonState())?.disabled === true);
  await typeName(title);
  check(`${kind}: exact typed name enables deletion`, (await buttonState())?.disabled === false, JSON.stringify(await buttonState()));
  await js("document.querySelector('.studio-delete-actions .outline-button').click();");
  await waitFor("cancel closes dialog", async () => !(await js("return Boolean(document.querySelector('.studio-delete-warning'));")));

  await openDeleteDialog(title);
  await pasteName(title);
  const pasted = await buttonState();
  check(`${kind}: exact pasted name enables deletion`, pasted?.disabled === false, JSON.stringify(pasted));
  await clickSubmit();
  const gone = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(active.id)}`);
  check(`${kind}: UI deletion removes only disposable Studio`, gone.status === 404, JSON.stringify(gone));

  const guardedTitle = `TPI-130 Guarded ${kind} ${runId}`;
  const guarded = await createWorkspace(guardedTitle, "recording");
  await openDeleteDialog(guardedTitle);
  await typeName(guardedTitle);
  const guardText = await js("return document.querySelector('.studio-delete-inventory')?.textContent || '';");
  const guardedState = await buttonState();
  check(`${kind}: active-production safety reason is visible`, /recording or livestream is active/i.test(guardText), guardText);
  check(`${kind}: active-production deletion remains disabled`, guardedState?.disabled === true, JSON.stringify(guardedState));
  await js("document.querySelector('.studio-delete-actions .outline-button').click();");
  const reset = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(guarded.id)}`, { method: "PATCH", body: { state: { broadcast: { id: guarded.localBroadcastId, title: guardedTitle, status: "draft" }, configuration: {} }, expectedVersion: (await serverFetch(`/api/studio/workspaces/${encodeURIComponent(guarded.id)}`)).body.workspace.version } });
  check(`${kind}: guarded fixture remains available`, reset.status === 200, JSON.stringify(reset));
  const cleanupCurrent = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(guarded.id)}`);
  const cleanup = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(guarded.id)}/purge`, { method: "POST", body: { mode: "with-contents", expectedVersion: cleanupCurrent.body?.workspace?.version } });
  check(`${kind}: guarded disposable fixture cleanup succeeds`, cleanup.status === 200, JSON.stringify(cleanup));
  await purgeBrowserFixtures();
  await driver.quit(); driver = null;
}

for (const kind of ["firefox", "chrome"]) {
  try { await runBrowser(kind); }
  catch (error) { check(`${kind}: isolated browser acceptance completed`, false, safe(error)); if (driver) await purgeBrowserFixtures().catch(() => {}); if (driver) await driver.quit().catch(() => {}); driver = null; }
}
console.log(JSON.stringify({ suite: "TPI-STUDIOFLOW-130-DELETION-BUTTON", status: results.some(result => !result.passed) ? "FAIL" : "PASS", base, evidenceRoot, checks: results, passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length }, null, 2));

#!/usr/bin/env node

// TPI-STUDIOFLOW-131 — disposable Firefox acceptance for deleting the final
// Studio. This harness uses the real Home screen, deletion dialog, inventory,
// confirmation, refresh, and Create Studio flow. It never deletes a Studio
// that existed before this run.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_131_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const credentialPath = process.env.TPI_131_CREDENTIALS_FILE
  ? resolve(repoRoot, process.env.TPI_131_CREDENTIALS_FILE)
  : resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accountKey = process.env.TPI_131_ACCOUNT || "local_member";
const account = credentials.accounts?.[accountKey] || credentials;
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const runId = Date.now().toString(36);
const evidenceRoot = mkdtempSync(join(tmpdir(), "tpi-studioflow-131-"));
const created = [];
const results = [];
let driver;

const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const safe = (error) => error instanceof Error ? error.message : String(error);
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(description, predicate, timeout = 30_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      detail = String(value);
    } catch (error) {
      detail = safe(error);
    }
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
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const response = await fetch(`${base}${path}${path.includes("?") ? "&" : "?"}tpi131=${runId}`, {
    method: options.method || "GET",
    headers: { Cookie: cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let body = null; try { body = text ? JSON.parse(text) : text; } catch { body = text; }
  return { status: response.status, body };
}

async function login() {
  await driver.get(`${base}/member-login.html`);
  await waitFor("member login form", async () => (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await js(`const form = document.querySelector('form[data-member-login]');
    const user = form.querySelector('input[name="username"]');
    const pass = form.querySelector('input[name="password"]');
    user.value = arguments[0]; pass.value = arguments[1];
    [user, pass].forEach(input => ['input', 'change'].forEach(type => input.dispatchEvent(new Event(type, { bubbles: true }))));
    form.requestSubmit();`, account.username, account.password);
  await waitFor("authenticated session", async () => Boolean((await authenticatedFetch("/api/auth/me")).body?.user));
}

async function createFixture(title, status = "draft") {
  const localId = `tpi-131-${runId}-${created.length}`;
  const response = await serverFetch("/api/studio/workspaces", {
    method: "POST",
    body: { title, localBroadcastId: localId, state: { broadcast: { id: localId, title, status }, configuration: {} } }
  });
  assert.equal(response.status, 201, JSON.stringify(response));
  const workspace = response.body.workspace;
  created.push(workspace.id);
  return workspace;
}

async function home() {
  await driver.get(`${base}/studio/`);
  await waitFor("My Studios home", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('Create new Studio');")));
}

async function card(title) {
  return await js(`const wanted = arguments[0];
    return Array.from(document.querySelectorAll('.studio-card')).find((node) => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    }) || null;`, title);
}

async function clickCardButton(title, label) {
  return await js(`const wanted = arguments[0], label = arguments[1];
    const card = Array.from(document.querySelectorAll('.studio-card')).find((node) => {
      const strong = node.querySelector('.studio-card-title strong');
      return strong && strong.textContent.trim() === wanted;
    });
    if (!card) return false;
    const target = Array.from(card.querySelectorAll('button, summary')).find((node) => node.textContent.trim() === label);
    if (!target) return false;
    target.click(); return true;`, title, label);
}

async function deleteThroughUi(title) {
  await home();
  assert(await clickCardButton(title, "More Actions"), `More Actions unavailable for ${title}`);
  await sleep(150);
  assert(await clickCardButton(title, "Delete Studio"), `Delete Studio unavailable for ${title}`);
  await waitFor("deletion dialog", async () => (await driver.findElements(By.css(".studio-delete-warning"))).length === 1);
  await waitFor("deletion inventory", async () => await js("const node = document.querySelector('[data-testid=studio-delete-inventory]'); return node && !node.textContent.includes('Preparing the deletion inventory');"));
  const input = (await driver.findElements(By.css('[data-testid="studio-delete-confirmation"]')))[0];
  await input.clear();
  await input.sendKeys(title);
  await waitFor("delete button enabled", async () => await js("return document.querySelector('[data-testid=studio-delete-submit]')?.disabled === false;"));
  const button = (await driver.findElements(By.css('[data-testid="studio-delete-submit"]')))[0];
  assert.equal((await button.getText()).trim(), "Delete Studio Permanently");
  await button.click();
  await waitFor("deletion dialog closes", async () => (await driver.findElements(By.css(".studio-delete-warning"))).length === 0);
  await waitFor("deleted card disappears", async () => !(await card(title)));
}

async function createThroughUi(title) {
  await home();
  const create = (await driver.findElements(By.xpath("//button[contains(., 'Create new Studio')]")))[0];
  await create.click();
  await waitFor("create dialog", async () => (await driver.findElements(By.css("#tpi-create-studio-dialog"))).length === 1);
  const input = (await driver.findElements(By.css("#tpi-studio-name")))[0];
  await input.sendKeys(title, Key.ENTER);
  await waitFor("created Studio API record", async () => {
    const list = await authenticatedFetch("/api/studio/workspaces");
    return list.body?.workspaces?.find((workspace) => workspace.title === title) || null;
  });
  await waitFor("create dialog closes", async () => (await driver.findElements(By.css("#tpi-create-studio-dialog"))).length === 0);
  return title;
}

async function archiveThroughUi(title) {
  await home();
  assert(await clickCardButton(title, "More Actions"), `More Actions unavailable for ${title}`);
  await sleep(150);
  assert(await clickCardButton(title, "Archive Studio"), `Archive Studio unavailable for ${title}`);
  await waitFor("archived Studio appears", async () => Boolean(await js(`return Array.from(document.querySelectorAll('.studio-card')).some((node) => node.textContent.includes(arguments[0]));`, title)));
}

async function capture(name) {
  writeFileSync(join(evidenceRoot, name), await driver.takeScreenshot(), "base64");
}

async function cleanupFixtures() {
  for (const id of created) {
    try {
      const current = await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}`);
      if (current.status !== 200 || !current.body?.workspace) continue;
      const workspace = current.body.workspace;
      await serverFetch(`/api/studio/workspaces/${encodeURIComponent(id)}/purge`, {
        method: "POST",
        body: { mode: "with-contents", expectedVersion: workspace.version }
      });
    } catch {
      // Best-effort cleanup only targets IDs created by this run.
    }
  }
}

async function run() {
  assert(account?.username && account?.password, `Synthetic account ${accountKey} is unavailable.`);
  assert(existsSync(firefoxBinary), `Firefox binary unavailable: ${firefoxBinary}`);
  assert(existsSync(geckodriver), `geckodriver unavailable: ${geckodriver}`);
  const profile = mkdtempSync(join(evidenceRoot, "firefox-profile-"));
  const options = new firefox.Options().setBinary(firefoxBinary)
    .setProfile(profile).addArguments("-headless", "-no-remote", "-new-instance")
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1100, x: 20, y: 20 });
  await login();
  const before = await authenticatedFetch("/api/studio/workspaces");
  const existingTitles = (before.body?.workspaces || []).map((workspace) => workspace.title);
  const existing = before.body?.workspaces || [];
  check("disposable account is isolated before testing", existing.length === 0, JSON.stringify(existing.map((workspace) => ({ id: workspace.id, title: workspace.title }))));
  if (process.env.TPI_131_INSPECT_ONLY === "1") {
    const archivedResponse = await authenticatedFetch("/api/studio/workspaces?includeArchived=true");
    check("archived inventory inspected", archivedResponse.status === 200, JSON.stringify(archivedResponse));
    check("all visible records are synthetic", [...existing, ...(archivedResponse.body?.workspaces || [])].every((workspace) => /^TPI-/.test(workspace.title)), JSON.stringify((archivedResponse.body?.workspaces || []).map((workspace) => ({ id: workspace.id, title: workspace.title }))));
    return;
  }
  if (process.env.TPI_131_CLEANUP_SYNTHETIC === "1") {
    const archivedResponse = await authenticatedFetch("/api/studio/workspaces?includeArchived=true");
    const all = [...existing, ...(archivedResponse.body?.workspaces || [])];
    assert(all.every((workspace) => /^TPI-/.test(workspace.title)), `Refusing cleanup: inventory contains a non-synthetic Studio: ${JSON.stringify(all.map((workspace) => ({ id: workspace.id, title: workspace.title })))}`);
    for (const workspace of all) {
      const current = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`);
      if (current.status !== 200 || !current.body?.workspace) continue;
      const record = current.body.workspace;
      if (["recording", "live", "stopping", "finalizing", "recovery"].includes(String(record.state?.broadcast?.status || "").toLowerCase())) {
        const reset = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(record.id)}`, { method: "PATCH", body: JSON.stringify({ state: { ...record.state, broadcast: { ...record.state.broadcast, status: "draft" } }, expectedVersion: record.version }) });
        assert.equal(reset.status, 200, JSON.stringify(reset));
      }
      const latest = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(record.id)}`);
      const purge = await authenticatedFetch(`/api/studio/workspaces/${encodeURIComponent(record.id)}/purge`, { method: "POST", body: JSON.stringify({ mode: "studio-only", expectedVersion: latest.body?.workspace?.version }) });
      assert([200, 404].includes(purge.status), JSON.stringify(purge));
    }
    check("synthetic fixture cleanup completed", true, `${all.length} records inspected`);
    return;
  }
  if (existingTitles.length > 0) throw new Error(`Account ${accountKey} already has Studios; refusing to delete non-test data.`);

  const first = await createFixture(`TPI-131 First ${runId}`);
  const second = await createFixture(`TPI-131 Final Active ${runId}`);
  await deleteThroughUi(first.title);
  const remaining = await authenticatedFetch("/api/studio/workspaces");
  check("deleting one of multiple Studios leaves the other", remaining.body?.workspaces?.some((workspace) => workspace.id === second.id) === true);

  await deleteThroughUi(second.title);
  await capture("zero-studios-after-final-active-delete.png");
  const zero = await authenticatedFetch("/api/studio/workspaces");
  check("final active Studio is deleted server-side", zero.body?.workspaces?.length === 0, JSON.stringify(zero.body));
  check("zero-Studio empty state is visible", /No Studios yet/.test(await js("return document.querySelector('.home-page')?.textContent || '';")));
  await driver.navigate().refresh();
  await waitFor("zero-Studio home after refresh", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('No Studios yet');")));
  check("zero Studios remain after refresh", !(await card(second.title)));

  const recreatedTitle = `TPI-131 Recreated ${runId}`;
  await createThroughUi(recreatedTitle);
  check("new Studio can be created after zero state", Boolean(await card(recreatedTitle)) || /Studio/.test(await js("return document.body.textContent || '';")));
  await home();
  check("new Studio can be opened", await clickCardButton(recreatedTitle, "Enter Studio"));

  // Return home, archive the recreated disposable Studio, then delete that
  // final archived Studio through the same guarded dialog.
  const exit = (await driver.findElements(By.css(".exit-button")))[0];
  if (exit) await exit.click();
  await archiveThroughUi(recreatedTitle);
  await deleteThroughUi(recreatedTitle);
  await capture("zero-studios-after-final-archived-delete.png");
  check("final archived Studio deletion returns to empty state", /No Studios yet/.test(await js("return document.querySelector('.home-page')?.textContent || '';")));
  await driver.navigate().refresh();
  await waitFor("empty state after archived deletion refresh", async () => Boolean(await js("return document.querySelector('.home-page') && document.querySelector('.home-page').textContent.includes('No Studios yet');")));
  check("zero Studios remain after archived deletion refresh", !(await card(recreatedTitle)));
}

try {
  await run();
} catch (error) {
  check("Firefox final-Studio workflow completed", false, safe(error));
} finally {
  await cleanupFixtures().catch(() => undefined);
  if (driver) await driver.quit().catch(() => undefined);
}

const output = {
  suite: "TPI-STUDIOFLOW-131-FINAL-STUDIO",
  status: results.some((result) => !result.passed) ? "FAIL" : "PASS",
  base,
  accountKey,
  evidenceRoot,
  checks: results,
  passed: results.filter((result) => result.passed).length,
  failed: results.filter((result) => !result.passed).length
};
console.log(JSON.stringify(output, null, 2));
if (output.status !== "PASS") process.exitCode = 1;

// TPI-NOVA-004: Nova Edit Documents minimum editor verification.
//
// Runs the real local Worker (workerd via wrangler dev) on a throwaway port and
// a throwaway D1 state directory, then drives the committed /nova/ application
// with Firefox Developer Edition (authoritative) and Chromium (smoke).
//
// The official StudioFlow environment on 127.0.0.1:8787 and its
// .local-dev/state/v3 data are never opened, migrated or contacted. Synthetic
// accounts and sessions exist only inside the disposable state directory.
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { cpSync, mkdtempSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Key, Select, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import { createServer } from "node:net";
function freePort() { return new Promise((resolve, reject) => { const srv = createServer(); srv.unref(); srv.on("error", reject); srv.listen(0, "127.0.0.1", () => { const { port } = srv.address(); srv.close(() => resolve(port)); }); }); }

const repoRoot = resolve(import.meta.dirname, "../..");
const configPath = resolve(repoRoot, "wrangler.local.toml");
const database = "tpi-local-foundation";
// TEMPORARY TEST HARNESS — NOT AUTHORITATIVE TPI DEVELOPMENT SITE. Uses a free ephemeral port unless TPI_NOVA_004_PORT is set.
const port = Number(process.env.TPI_NOVA_004_PORT || (await freePort()));
if (port === 8787) throw new Error("TPI-NOVA-004 verification must not use the official local environment on port 8787");
const base = `http://127.0.0.1:${port}`;
const wrangler = process.env.WRANGLER_BIN || "wrangler";
const wranglerEnv = { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" };
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";

const root = mkdtempSync(join(tmpdir(), "tpi-nova-004-"));
const stateDir = join(root, "state");
const logPath = join(root, "worker.log");
const firefoxProfile = join(root, "firefox-profile");
mkdirSync(stateDir, { recursive: true });
mkdirSync(firefoxProfile, { recursive: true });

// The official local environment stages a copy of the repository into
// .local-dev/assets (311 MB, owner data). The isolated verification instead
// stages only the committed /nova/ package into a throwaway asset directory so
// the Worker's real asset routing, gate and clean-URL fallback are exercised
// without reading or touching the official local asset tree.
const assetsDir = join(root, "assets");
const isolatedConfigPath = join(root, "wrangler.isolated.toml");
cpSync(resolve(repoRoot, "nova"), join(assetsDir, "nova"), { recursive: true });
const isolatedConfig = readFileSync(configPath, "utf8")
  .replace(/^main = "worker\.js"$/m, `main = "${resolve(repoRoot, "worker.js")}"`)
  .replace(/^directory = "\.local-dev\/assets"$/m, `directory = "${assetsDir}"`)
  // The temp config lives outside the repository, so pin the migration
  // directory explicitly instead of relying on the config-relative default.
  .replace(/^\[\[d1_databases\]\]$/m, `[[d1_databases]]\nmigrations_dir = "${resolve(repoRoot, "migrations")}"`);
if (!isolatedConfig.includes(assetsDir)) throw new Error("could not stage the isolated asset directory into the verification config");
writeFileSync(isolatedConfigPath, isolatedConfig, "utf8");

let passed = 0;
const failures = [];
const sectionCounts = new Map();
let currentSection = "startup";

function section(label) {
  currentSection = label;
  sectionCounts.set(label, { passed: 0, failed: 0 });
  console.log(`\n## ${label}`);
}

function check(name, condition, detail = "") {
  const counts = sectionCounts.get(currentSection) || { passed: 0, failed: 0 };
  if (condition) {
    passed += 1;
    counts.passed += 1;
    console.log(`  PASS ${name}`);
  } else {
    counts.failed += 1;
    failures.push(`${currentSection}: ${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
  sectionCounts.set(currentSection, counts);
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runWrangler(args) {
  return spawnSync(wrangler, args, {
    cwd: repoRoot,
    maxBuffer: 64 * 1024 * 1024,
    env: wranglerEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function d1(args) {
  return runWrangler(["d1", "execute", database, "--config", isolatedConfigPath, "--local", "--persist-to", stateDir, ...args]);
}

function query(sql) {
  const result = d1(["--command", sql, "--json"]);
  if (result.status !== 0) throw new Error(`D1 query failed: ${(result.stderr || result.stdout || "").trim()}`);
  return JSON.parse(result.stdout)?.[0]?.results || [];
}

async function api(path, { method = "GET", token, body, origin } = {}) {
  const headers = {};
  if (token) headers.Cookie = `tpi_session=${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && origin !== null) headers.Origin = origin || base;
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 400) };
  }
  return { status: response.status, data, headers: response.headers };
}

function docEnvelope(...blocks) {
  return {
    format: "nova-document",
    version: 1,
    doc: {
      type: "doc",
      content: blocks.length > 0 ? blocks : [{ type: "paragraph", content: [{ type: "text", text: "Nova body" }] }]
    }
  };
}

function plainText(content) {
  const parts = [];
  const walk = node => {
    if (!node || typeof node !== "object") return;
    if (node.type === "text" && typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(content?.doc);
  return parts.join(" ").trim();
}

function normalizedNovaJson(value) {
  if (Array.isArray(value)) return value.map(normalizedNovaJson);
  if (!value || typeof value !== "object") return value;
  const copy = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizedNovaJson(child)]));
  if (copy.attrs && typeof copy.attrs === "object") {
    for (const key of ["textAlign", "indentLeft", "indentRight"]) {
      if (copy.attrs[key] === null || copy.attrs[key] === 0) delete copy.attrs[key];
    }
    if (Object.keys(copy.attrs).length === 0) delete copy.attrs;
  }
  return copy;
}

const USERS = {
  owner: { id: "nova004-owner", username: "nova_004_owner", token: "nova004-session-owner", role: "admin" },
  member: { id: "nova004-member", username: "nova_004_member", token: "nova004-session-member", role: "member" }
};

function applyMigrations() {
  const result = runWrangler([
    "d1", "migrations", "apply", database,
    "--config", isolatedConfigPath,
    "--local",
    "--persist-to", stateDir
  ]);
  if (result.status !== 0) throw new Error(`migration apply failed: ${(result.stderr || result.stdout || "").trim().slice(0, 2000)}`);
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function seedSyntheticAccounts() {
  const seedPath = join(root, "seed.sql");
  writeFileSync(seedPath, Object.values(USERS).map(user => `
    INSERT OR REPLACE INTO contributors (id, username, password_hash, display_name, role, active)
    VALUES (${sqlString(user.id)}, ${sqlString(user.username)}, 'synthetic-not-a-real-password', ${sqlString(`Synthetic Nova ${user.role}`)}, ${sqlString(user.role)}, 1);
    INSERT OR REPLACE INTO sessions (token, contributor_id, expires_at)
    VALUES (${sqlString(user.token)}, ${sqlString(user.id)}, '2030-01-01T00:00:00.000Z');
  `).join("\n"), "utf8");
  const result = d1(["--file", seedPath, "--yes"]);
  if (result.status !== 0) throw new Error(`synthetic seeding failed: ${(result.stderr || result.stdout || "").trim().slice(0, 2000)}`);
}

async function waitForWorker(server) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`worker exited before becoming ready:\n${tailLog()}`);
    try {
      await fetch(`${base}/nova/`, { redirect: "manual" });
      return;
    } catch {
      await new Promise(next => setTimeout(next, 400));
    }
  }
  throw new Error("worker did not become ready within 90s");
}

function tailLog() {
  try {
    return readFileSync(logPath, "utf8").split("\n").slice(-40).join("\n");
  } catch {
    return "";
  }
}

// ------------------------------------------------------------------ build
function checkBuildArtifacts() {
  section("build artifacts");
  const outDir = resolve(repoRoot, "nova");
  const indexPath = join(outDir, "index.html");
  const indexHtml = readFileSync(indexPath, "utf8");
  const assets = readdirSync(join(outDir, "assets"));
  const entry = assets.find(name => /^index-.*\.js$/.test(name));
  const documentsChunk = assets.find(name => /^DocumentsSurface-.*\.js$/.test(name));
  const tiptapChunk = assets.find(name => /^nova-vendor-tiptap-.*\.js$/.test(name));
  const reactChunk = assets.find(name => /^nova-vendor-react-.*\.js$/.test(name));

  check("committed application entry document exists at nova/index.html", indexHtml.includes('id="root"'));
  check("application is served from the /nova/ base", indexHtml.includes("/nova/assets/"), indexHtml.slice(0, 300));
  check("entry chunk is emitted", Boolean(entry));
  check("Documents surface is a separate lazy chunk", Boolean(documentsChunk), assets.join(", "));
  check("TipTap/ProseMirror vendor code is isolated from the entry", Boolean(tiptapChunk), assets.join(", "));
  check("React vendor code is isolated", Boolean(reactChunk));
  if (entry) {
    const entryBytes = statSync(join(outDir, "assets", entry)).size;
    check("entry chunk stays small enough for a future lazy Slides split", entryBytes < 60 * 1024, `${entryBytes} bytes`);
  }
  check("no source maps are published with Nova assets", !assets.some(name => name.endsWith(".map")));
  const assetsIgnore = readFileSync(resolve(repoRoot, ".assetsignore"), "utf8");
  check("Nova application source is excluded from published assets", /^nova-app$/m.test(assetsIgnore) && /^nova-app\/\*\*$/m.test(assetsIgnore));
  check("no Nova document HTML is committed as canonical storage", !readFileSync(resolve(repoRoot, "nova-app/src/documents/DocumentEditor.tsx"), "utf8").includes("innerHTML"));
}

// ------------------------------------------------------------------- gate
async function checkGate() {
  section("worker gate");
  const anonymousEntry = await fetch(`${base}/nova/`, { redirect: "manual" });
  const anonymousBody = await anonymousEntry.text();
  check("signed-out Nova entry is refused", anonymousEntry.status === 403, String(anonymousEntry.status));
  check("signed-out refusal is the Nova gate page, not the application", /Nova Edit/.test(anonymousBody) && !anonymousBody.includes('id="root"'));
  check("signed-out refusal is never cached", /no-store/.test(anonymousEntry.headers.get("cache-control") || ""));

  const memberEntry = await fetch(`${base}/nova/`, { headers: { Cookie: `tpi_session=${USERS.member.token}` } });
  check("account without Creator capability cannot load Nova", memberEntry.status === 403, String(memberEntry.status));

  const indexHtml = readFileSync(resolve(repoRoot, "nova/index.html"), "utf8");
  const assetPath = /\/nova\/(assets\/[^"']+\.js)/.exec(indexHtml)?.[1];
  const anonymousAsset = await fetch(`${base}/nova/${assetPath}`);
  check("signed-out direct asset request is refused", anonymousAsset.status === 403, String(anonymousAsset.status));

  const authedEntry = await fetch(`${base}/nova/`, { headers: { Cookie: `tpi_session=${USERS.owner.token}` } });
  const authedBody = await authedEntry.text();
  check("authorized owner loads the Nova entry document", authedEntry.status === 200 && authedBody.includes('id="root"'), String(authedEntry.status));
  const authedAsset = await fetch(`${base}/nova/${assetPath}`, { headers: { Cookie: `tpi_session=${USERS.owner.token}` } });
  check("authorized owner loads Nova application assets", authedAsset.status === 200 && /javascript/.test(authedAsset.headers.get("content-type") || ""), String(authedAsset.status));
  const cleanUrl = await fetch(`${base}/nova`, { headers: { Cookie: `tpi_session=${USERS.owner.token}` } });
  check("extensionless /nova resolves to the entry document", cleanUrl.status === 200);

  const anonymousApi = await api("/nova/items");
  check("Nova API still requires a session", anonymousApi.status === 401 && anonymousApi.data?.code === "auth_required");
}

// ------------------------------------------------------------ API contract
async function checkApiContract() {
  section("structured storage and versioning");
  const created = await api("/nova/items", {
    method: "POST",
    token: USERS.owner.token,
    body: {
      title: "API contract document",
      content: docEnvelope({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "API heading" }] })
    }
  });
  const item = created.data?.item;
  check("document create stores a nova-document envelope", created.status === 201 && item?.content?.format === "nova-document" && item?.content?.version === 1);
  check("create starts at version 1", item?.version === 1);

  const firstSave = await api(`/nova/items/${item.id}`, {
    method: "PATCH",
    token: USERS.owner.token,
    body: {
      expectedVersion: 1,
      title: "API contract document v2",
      content: docEnvelope(
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Bold in JSON" }] },
        {
          type: "table",
          content: [
            { type: "tableRow", content: [{ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "H1" }] }] }] }
          ]
        }
      )
    }
  });
  check("save increments the version", firstSave.status === 200 && firstSave.data?.item?.version === 2, JSON.stringify(firstSave.data).slice(0, 200));
  check("canonical content stays structured JSON", firstSave.data?.item?.content?.doc?.content?.[0]?.content?.[0]?.marks?.[0]?.type === "bold");

  const staleSave = await api(`/nova/items/${item.id}`, {
    method: "PATCH",
    token: USERS.owner.token,
    body: { expectedVersion: 1, title: "Stale overwrite", content: docEnvelope({ type: "paragraph", content: [{ type: "text", text: "Stale content" }] }) }
  });
  check("stale expectedVersion is rejected with a conflict", staleSave.status === 409 && staleSave.data?.code === "nova_item_conflict");
  check("conflict payload carries the newer server copy", staleSave.data?.item?.version === 2 && staleSave.data?.item?.title === "API contract document v2");
  const afterConflict = await api(`/nova/items/${item.id}`, { token: USERS.owner.token });
  check("conflicting write did not overwrite the server copy", plainText(afterConflict.data?.item?.content) === "Bold in JSON H1");

  const invalidEnvelope = await api(`/nova/items/${item.id}`, {
    method: "PATCH",
    token: USERS.owner.token,
    body: { expectedVersion: 2, content: { format: "text/html", version: 1, doc: { type: "doc" } } }
  });
  check("raw HTML is not an accepted canonical format", invalidEnvelope.status === 400 && invalidEnvelope.data?.code === "invalid_nova_format");

  const revisions = await api(`/nova/items/${item.id}/revisions`, { token: USERS.owner.token });
  check("saves produce revision history", revisions.status === 200 && revisions.data.revisions.length >= 1);
  const oldest = [...revisions.data.revisions].sort((a, b) => a.revisionNumber - b.revisionNumber)[0];
  const restored = await api(`/nova/items/${item.id}/revisions/${oldest.id}/restore`, {
    method: "POST",
    token: USERS.owner.token,
    body: { expectedVersion: 2 }
  });
  check("revision restore creates a new current version", restored.status === 200 && restored.data?.item?.version === 3);
  check("revision restore reports its source revision", restored.data?.restoredFromRevision === oldest.revisionNumber);

  section("collections and lifecycle");
  const folder = await api("/nova/collections", { method: "POST", token: USERS.owner.token, body: { name: "API folder" } });
  check("collection create returns a folder", folder.status === 201 && folder.data?.collection?.name === "API folder");
  const renamed = await api(`/nova/collections/${folder.data.collection.id}`, { method: "PATCH", token: USERS.owner.token, body: { name: "API folder renamed" } });
  check("collection rename persists", renamed.status === 200 && renamed.data?.collection?.name === "API folder renamed");
  const filed = await api(`/nova/items/${item.id}`, {
    method: "PATCH",
    token: USERS.owner.token,
    body: { expectedVersion: 3, collectionId: folder.data.collection.id }
  });
  check("document can be filed into a collection", filed.status === 200 && filed.data?.item?.collectionId === folder.data.collection.id);
  const unfiled = await api(`/nova/items/${item.id}`, { method: "PATCH", token: USERS.owner.token, body: { expectedVersion: 4, collectionId: null } });
  check("document can be moved back to Unfiled", unfiled.status === 200 && unfiled.data?.item?.collectionId === null);

  const version = unfiled.data.item.version;
  const archived = await api(`/nova/items/${item.id}/archive`, { method: "POST", token: USERS.owner.token, body: { expectedVersion: version } });
  check("archive changes status", archived.status === 200 && archived.data?.item?.status === "archived");
  const trashed = await api(`/nova/items/${item.id}/trash`, { method: "POST", token: USERS.owner.token, body: { expectedVersion: archived.data.item.version } });
  check("trash changes status", trashed.status === 200 && trashed.data?.item?.status === "trash");
  const restoredLifecycle = await api(`/nova/items/${item.id}/restore`, { method: "POST", token: USERS.owner.token, body: { expectedVersion: trashed.data.item.version } });
  check("restore returns the document to active", restoredLifecycle.status === 200 && restoredLifecycle.data?.item?.status === "active");

  const unconfirmedDelete = await api(`/nova/items/${item.id}/permanent-delete`, {
    method: "POST",
    token: USERS.owner.token,
    body: { expectedVersion: restoredLifecycle.data.item.version, confirmation: "delete" }
  });
  check("permanent delete requires the explicit confirmation phrase", unconfirmedDelete.status === 400 || unconfirmedDelete.status === 409, String(unconfirmedDelete.status));
  return item.id;
}

// --------------------------------------------------------------- Firefox
const sleep = ms => new Promise(next => setTimeout(next, ms));

function createFirefoxOptions() {
  const options = new firefox.Options()
    .setBinary(firefoxBinary)
    .setProfile(firefoxProfile)
    .addArguments("-no-remote", "-new-instance");
  // The draft-recovery check reloads a page whose editor still holds unsaved
  // edits. Suppressing the unload prompt models a crashed or killed tab, which
  // is exactly the case a recovered local draft protects.
  options.setPreference("dom.disable_beforeunload", true);
  return options;
}

async function buildDriver() {
  const service = new firefox.ServiceBuilder(geckodriver);
  const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(createFirefoxOptions()).setFirefoxService(service).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
  await driver.manage().window().setRect({ width: 1280, height: 1000, x: 20, y: 20 });
  return driver;
}

async function checkFirefox(driver) {
  section("Firefox Developer Edition acceptance");
  const js = (script, ...args) => driver.executeScript(script, ...args);
  const exists = async selector => Number(await js("return document.querySelectorAll(arguments[0]).length;", selector)) > 0;
  const textOf = async selector => js("var el=document.querySelector(arguments[0]); return el ? el.innerText : '';", selector);
  const htmlOf = async selector => js("var el=document.querySelector(arguments[0]); return el ? el.innerHTML : '';", selector);
  const click = async selector => {
    const element = await driver.wait(until.elementLocated(By.css(selector)), 15_000, `missing ${selector}`);
    await driver.wait(until.elementIsVisible(element), 15_000, `hidden ${selector}`);
    await js("arguments[0].scrollIntoView({block:'center', inline:'nearest'});", element);
    await element.click();
  };
  // geckodriver closes an open Nova dialog when sendKeys receives a whole
  // string at once, so text is always delivered one character at a time.
  const sendText = async (element, value) => {
    for (const character of value) await element.sendKeys(character);
  };
  const typeInto = async (selector, value) => {
    const element = await driver.wait(until.elementLocated(By.css(selector)), 15_000, `missing ${selector}`);
    await element.click();
    await element.clear();
    await sendText(element, value);
  };
  const saveState = async () => {
    const status = await driver.findElement(By.css("[data-testid='save-status']"));
    return status.getAttribute("data-save-state");
  };
  const waitForSave = async (state, timeout = 20_000) => {
    await driver.wait(async () => (await saveState()) === state, timeout, `save state did not reach ${state}`);
    return true;
  };
  // Toolbar buttons keep the editor focus (mousedown is prevented on them), so
  // typing after a toolbar command must not re-click the canvas: re-clicking
  // would move the caret and defeat the command under test.
  const typeFocused = async (...parts) => {
    for (const part of parts) {
      if (typeof part === "string") {
        for (const character of part) await driver.actions().sendKeys(character).perform();
      } else {
        await driver.actions().sendKeys(part).perform();
      }
    }
  };
  const appErrors = async () => js("return (window.__novaDiagnostics && window.__novaDiagnostics.errors) || [];");
  const checkNoAppErrors = async label => {
    const errors = await appErrors();
    check(label, Array.isArray(errors) && errors.length === 0, JSON.stringify(errors).slice(0, 400));
  };

  // Sign in with the synthetic session, then open the application.
  await driver.get(`${base}/nova/`);
  check("signed-out browser visit renders the Nova gate", /Nova Edit/.test(await driver.getPageSource()));
  await driver.manage().addCookie({ name: "tpi_session", value: USERS.owner.token, domain: "127.0.0.1", path: "/" });
  await driver.get(`${base}/nova/`);
  await driver.wait(until.elementLocated(By.css("[data-testid='nova-sidebar']")), 20_000, "Nova shell did not load");
  check("Nova shell renders branding and the Documents area", /Nova/.test(await textOf(".nova-brand")), await textOf(".nova-brand"));
  check("document list surface renders", await exists("[data-testid='document-list-panel']"));
  check("Documents loads as a lazy surface without a blocking error", await exists("[data-testid='document-count']") && !(await exists("[data-testid='surface-error']")));
  await checkNoAppErrors("Firefox shell load reported no uncaught application errors");

  // Folders: create, rename, select.
  await click("[data-testid='new-folder']");
  check("folder dialog opens as a Nova dialog", await exists("[data-testid='folder-dialog']"));
  await typeInto("[data-testid='folder-name-input']", "Field Notes");
  await click("[data-testid='folder-submit']");
  await driver.wait(async () => /Field Notes/.test(await textOf("[data-testid='collection-tree']")), 15_000, "folder did not appear");
  check("folder creation appears in the collection tree", /Field Notes/.test(await textOf("[data-testid='collection-tree']")));

  const renameButton = await driver.wait(until.elementLocated(By.css("[aria-label='Rename Field Notes']")), 15_000, "rename control did not appear");
  await js("arguments[0].click();", renameButton);
  await typeInto("[data-testid='folder-name-input']", "Field Notes Archive");
  await click("[data-testid='folder-submit']");
  await driver.wait(async () => /Field Notes Archive/.test(await textOf("[data-testid='collection-tree']")), 15_000, "folder rename did not persist");
  check("folder rename updates the tree", /Field Notes Archive/.test(await textOf("[data-testid='collection-tree']")));

  await click("[data-testid='folder-select'][title='Field Notes Archive']");
  await driver.wait(until.elementLocated(By.css("[data-testid='document-empty']")), 15_000, "folder selection did not filter the list");
  check("folder selection filters the document list", /Field Notes Archive/.test(await textOf(".nova-list-title")));

  // Create a document inside the selected folder.
  await click("[data-testid='new-document']");
  await driver.wait(until.elementLocated(By.css("[data-testid='editor']")), 20_000, "editor did not open");
  const documentId = await js("return decodeURIComponent(location.hash.replace('#/documents/',''));");
  check("New document opens the editor and routes to the document", /^[0-9a-f-]{20,}$/i.test(documentId || ""), String(documentId));
  await typeInto("[data-testid='document-title']", "Nova Acceptance Document");

  // Core editor interaction.
  const prose = await driver.findElement(By.css(".nova-prose"));
  await prose.click();
  await prose.sendKeys("Nova acceptance body");
  check("typing reaches the structured editor", /Nova acceptance body/.test(await textOf(".nova-prose")));

  // Headings, bold, italic, underline on the first paragraph.
  const blockSelect = new Select(await driver.findElement(By.css("[data-testid='block-type']")));
  await blockSelect.selectByValue("h2");
  await driver.wait(async () => (await exists(".nova-prose h2")), 10_000, "heading did not apply");
  check("block control converts a paragraph to a heading", /Nova acceptance body/.test(await textOf(".nova-prose h2")));

  await driver.actions().keyDown(Key.COMMAND).sendKeys("a").keyUp(Key.COMMAND).perform();
  await click("[data-testid='toolbar-bold']");
  await click("[data-testid='toolbar-italic']");
  await click("[data-testid='toolbar-underline']");
  check("bold, italic and underline apply to the selection", (await htmlOf(".nova-prose")).includes("<strong>") && (await htmlOf(".nova-prose")).includes("<em>") && (await htmlOf(".nova-prose")).includes("<u>"));

  // Lists. Arrow keys collapse the whole-document selection left by the mark
  // toggles; typing into a retained selection would replace the heading.
  await typeFocused(Key.ARROW_RIGHT, Key.ARROW_RIGHT, Key.ENTER);
  check("heading survives collapsing the selection", await exists(".nova-prose h2"), (await htmlOf(".nova-prose")).slice(0, 400));
  await click("[data-testid='toolbar-bullet-list']");
  await driver.wait(async () => (await exists(".nova-prose ul")), 10_000, "bulleted list was not toggled");
  await typeFocused("First item", Key.ENTER, "Second item");
  check("bulleted list receives typed items", /First item/.test(await textOf(".nova-prose ul")) && /Second item/.test(await textOf(".nova-prose ul")), (await htmlOf(".nova-prose")).slice(0, 700));

  await typeFocused(Key.ENTER, Key.ENTER);
  await click("[data-testid='toolbar-ordered-list']");
  await driver.wait(async () => (await exists(".nova-prose ol")), 10_000, "numbered list was not toggled");
  await typeFocused("First step", Key.ENTER, "Second step");
  check("numbered list receives typed items", Number(await js("return document.querySelectorAll('.nova-prose ol li').length;")) >= 2);

  // Blockquote and divider.
  await typeFocused(Key.ENTER, Key.ENTER);
  await click("[data-testid='toolbar-blockquote']");
  await typeFocused("Quoted insight");
  check("blockquote wraps typed content", /Quoted insight/.test(await textOf(".nova-prose blockquote")));
  // Exit the quote with an empty paragraph so the quoted block itself stays
  // in the document and can be verified after reload.
  await typeFocused(Key.ENTER, Key.ENTER);
  await click("[data-testid='toolbar-hr']");
  check("horizontal rule is inserted", await exists(".nova-prose hr"));

  // Editable table. Row/column structure is exercised before cell text is
  // typed so the delete-column action cannot remove the typed marker.
  await click("[data-testid='toolbar-table']");
  await driver.wait(async () => (await exists(".nova-prose table")), 10_000, "table was not inserted");
  check("table insert produces a real editable table", Number(await js("return document.querySelectorAll('.nova-prose table tr').length;")) === 3);
  check("inserted table starts with a header row", Number(await js("return document.querySelectorAll('.nova-prose table th').length;")) === 3);
  await click("[data-testid='toolbar-add-row']");
  check("table row can be added", Number(await js("return document.querySelectorAll('.nova-prose table tr').length;")) === 4);
  await click("[data-testid='toolbar-add-column']");
  check("table column can be added", Number(await js("return document.querySelectorAll('.nova-prose table tr:first-child > *').length;")) === 4);
  await click("[data-testid='toolbar-delete-column']");
  check("table column can be removed", Number(await js("return document.querySelectorAll('.nova-prose table tr:first-child > *').length;")) === 3);
  const headerCell = await driver.findElement(By.css(".nova-prose table th"));
  await js("arguments[0].scrollIntoView({block:'center', inline:'nearest'});", headerCell);
  await driver.actions().move({ origin: headerCell }).click().perform();
  await typeFocused("Header cell");
  check("table cells accept typed content", /Header cell/.test(await textOf(".nova-prose table")), (await htmlOf(".nova-prose table")).slice(0, 200));

  // Link dialog (no window.prompt, no window.confirm).
  check("heading survives the surrounding blocks", await exists(".nova-prose h2"), (await htmlOf(".nova-prose")).slice(0, 700));
  const heading = await driver.findElement(By.css(".nova-prose h2"));
  await js("arguments[0].scrollIntoView({block:'center', inline:'nearest'});", heading);
  await driver.actions().move({ origin: heading }).doubleClick().perform();
  check("link workflow has a text selection", String(await js("return window.getSelection().toString();")).length > 2, String(await js("return window.getSelection().toString();")));
  await click("[data-testid='toolbar-link']");
  await typeInto("[data-testid='link-input']", "https://example.com/nova");
  check("link dialog is a Nova dialog", await exists("[data-testid='link-dialog']"));
  await click("[data-testid='link-apply']");
  await driver.wait(async () => (await exists(".nova-prose a[href='https://example.com/nova']")), 10_000, "link was not applied");
  check("link is applied through the Nova dialog", (await htmlOf(".nova-prose")).includes('href="https://example.com/nova"'));

  // Undo / redo.
  await waitForSave("saved");
  const preUndo = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  await click("[data-testid='toolbar-undo']");
  await driver.wait(async () => !(await exists(".nova-prose a[href='https://example.com/nova']")), 10_000, "undo did not revert the link");
  check("undo reverts the last formatting transaction", !(await exists(".nova-prose a[href='https://example.com/nova']")));
  await click("[data-testid='toolbar-redo']");
  await driver.wait(async () => (await exists(".nova-prose a[href='https://example.com/nova']")), 10_000, "redo did not restore the link");
  check("redo restores the reverted transaction", await exists(".nova-prose a[href='https://example.com/nova']"));

  // Autosave.
  await waitForSave("saved");
  const savedItem = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  const savedVersion = savedItem.data.item.version;
  check("autosave persists without an explicit save action", savedVersion >= 2, `v${savedVersion}`);
  const savedContent = savedItem.data.item.content;
  const nodeTypes = JSON.stringify(savedContent);
  check("canonical content is a nova-document JSON envelope", savedContent.format === "nova-document" && savedContent.version === 1);
  check("structured JSON records the heading", /"type":"heading"/.test(nodeTypes), nodeTypes.slice(0, 300));
  check("structured JSON records the lists", /"type":"bulletList"/.test(nodeTypes) && /"type":"orderedList"/.test(nodeTypes), nodeTypes.slice(0, 300));
  check("structured JSON records the table", /"type":"table"/.test(nodeTypes) && /"type":"tableRow"/.test(nodeTypes), nodeTypes.slice(0, 300));
  check("structured JSON records the blockquote and rule", /"type":"blockquote"/.test(nodeTypes) && /"type":"horizontalRule"/.test(nodeTypes), nodeTypes.slice(0, 300));
  check("structured JSON records the link mark", /"type":"link"/.test(nodeTypes) && /example\.com\/nova/.test(nodeTypes), nodeTypes.slice(0, 300));
  check("no HTML string is stored as canonical content", !/<(p|h2|table|strong)>/.test(JSON.stringify(savedContent)));
  check("autosave files the document in the selected folder", Boolean(savedItem.data.item.collectionId));

  // Reload persistence.
  await driver.navigate().refresh();
  await driver.wait(until.elementLocated(By.css(".nova-prose")), 20_000, "editor did not reload");
  await driver.wait(async () => (await exists(".nova-prose table")), 15_000, "table did not survive reload");
  const reloadedHtml = await htmlOf(".nova-prose");
  check("typed text survives reload", /Nova acceptance body/.test(await textOf(".nova-prose")));
  check("bold, italic and underline survive reload", reloadedHtml.includes("<strong>") && reloadedHtml.includes("<em>") && reloadedHtml.includes("<u>"));
  check("heading survives reload", await exists(".nova-prose h2"));
  check("lists survive reload", /Second item/.test(await textOf(".nova-prose ul")) && Number(await js("return document.querySelectorAll('.nova-prose ol li').length;")) >= 2);
  check("blockquote survives reload", /Quoted insight/.test(await textOf(".nova-prose blockquote")), reloadedHtml.slice(0, 900));
  check("table survives reload", /Header cell/.test(await textOf(".nova-prose table")), await textOf(".nova-prose table"));
  check("link survives reload", await exists(".nova-prose a[href='https://example.com/nova']"));
  check("horizontal rule survives reload", await exists(".nova-prose hr"));

  check("reload starts from a saved state", (await saveState()) === "saved", await saveState());

  // Version conflict: a newer server copy must never be overwritten.
  const newerServer = await api(`/nova/items/${documentId}`, {
    method: "PATCH",
    token: USERS.owner.token,
    body: {
      expectedVersion: savedVersion,
      title: "Server-side newer copy",
      content: docEnvelope({ type: "paragraph", content: [{ type: "text", text: "Server newer body" }] })
    }
  });
  check("a newer server copy was simulated for the conflict test", newerServer.status === 200 && newerServer.data?.item?.version === savedVersion + 1);

  const proseForConflict = await driver.findElement(By.css(".nova-prose"));
  await driver.actions().move({ origin: proseForConflict }).click().perform();
  await typeFocused(Key.END, "LOCALMARKER");
  await driver.wait(until.elementLocated(By.css("[data-testid='conflict-banner']")), 20_000, "conflict banner did not appear");
  check("version conflict is surfaced in the editor", await exists("[data-testid='conflict-banner']"));
  check("conflict pauses saving and reports the failure", (await saveState()) === "conflict");
  check("local editor content is preserved after the conflict", /LOCALMARKER/.test(await textOf(".nova-prose")));
  const draftKeys = await js("return Object.keys(localStorage).filter(function(k){return k.indexOf('tpi:nova:draft:v1:')===0;});");
  check("conflicted edits remain in a Nova-namespaced local draft", draftKeys.length >= 1 && draftKeys.every(key => key.startsWith("tpi:nova:draft:v1:")), JSON.stringify(draftKeys));
  const afterConflictWrite = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  check("the newer server copy was not overwritten", afterConflictWrite.data?.item?.version === savedVersion + 1 && plainText(afterConflictWrite.data?.item?.content) === "Server newer body");
  check("no StudioFlow Notes draft namespace is used", !draftKeys.some(key => /notes/i.test(key)));

  // Draft recovery: reload while the conflicted local edits are still unsaved.
  await driver.navigate().refresh();
  await driver.wait(until.elementLocated(By.css("[data-testid='draft-banner']")), 20_000, "draft banner did not appear after reload");
  check("a recovered local draft is offered after reload", await exists("[data-testid='draft-banner']"));
  check("the editor opens on the server copy before recovery", !/LOCALMARKER/.test(await textOf(".nova-prose")));
  await click("[data-testid='restore-draft']");
  await driver.wait(async () => /LOCALMARKER/.test(await textOf(".nova-prose")), 10_000, "draft content was not restored");
  await waitForSave("saved");
  const afterDraftSave = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  check("restoring the draft saves it as the next version", afterDraftSave.data?.item?.version === savedVersion + 2, `v${afterDraftSave.data?.item?.version}`);
  check("restored draft content reached the server", /LOCALMARKER/.test(plainText(afterDraftSave.data?.item?.content)));
  const draftsAfterSave = await js("return Object.keys(localStorage).filter(function(k){return k.indexOf('tpi:nova:draft:v1:')===0;});");
  check("successful save clears the recovery draft", draftsAfterSave.length === 0, JSON.stringify(draftsAfterSave));

  // Revision history and restore.
  await click("[data-testid='toggle-revisions']");
  await driver.wait(until.elementLocated(By.css("[data-testid='revisions-panel']")), 15_000, "revisions panel did not open");
  const revisionRows = Number(await js("return document.querySelectorAll('[data-testid=\"revision-restore\"]').length;"));
  check("revision history lists stored revisions", revisionRows >= 2, String(revisionRows));
  const revisionPayload = await api(`/nova/items/${documentId}/revisions`, { token: USERS.owner.token });
  const oldestRevision = [...revisionPayload.data.revisions].sort((a, b) => a.revisionNumber - b.revisionNumber)[0];
  const versionBeforeRestore = Number((await textOf("[data-testid='document-version']")).replace(/[^0-9]/g, ""));
  const restoreButtons = await driver.findElements(By.css("[data-testid='revision-restore']"));
  await restoreButtons[restoreButtons.length - 1].click();
  await click("[data-testid='revision-confirm']");
  await driver.wait(async () => Number((await textOf("[data-testid='document-version']")).replace(/[^0-9]/g, "")) > versionBeforeRestore, 20_000, "revision restore did not create a new version");
  await waitForSave("saved");
  const afterRestore = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  check("revision restore creates a new current version", afterRestore.data?.item?.version > versionBeforeRestore, `v${afterRestore.data?.item?.version}`);
  check(
    "revision restore applies the stored revision content",
    JSON.stringify(normalizedNovaJson(afterRestore.data?.item?.content)) === JSON.stringify(normalizedNovaJson(oldestRevision.content)),
    JSON.stringify(afterRestore.data?.item?.content).slice(0, 200)
  );
  check("revision restore leaves the editor usable", !(await exists("[data-testid='readonly-banner']")));

  // Folder move from the editor.
  const folderSelect = await driver.findElement(By.css("[data-testid='document-folder']"));
  const folderId = await js(
    "var sel=document.querySelector('[data-testid=\"document-folder\"]');" +
    "var match=Array.prototype.filter.call(sel.options, function(o){return /Field Notes Archive/.test(o.textContent);});" +
    "return match.length ? match[0].value : '';"
  );
  check("the folder appears as a destination in the editor", Boolean(folderId));
  await new Select(folderSelect).selectByValue(folderId);
  await driver.wait(async () => {
    const current = await js("return document.querySelector('[data-testid=\"document-folder\"]').value;");
    return current === folderId;
  }, 15_000, "folder move did not stick");
  const movedItem = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  check("document can be moved into a folder from the editor", movedItem.data?.item?.collectionId === folderId, String(movedItem.data?.item?.collectionId));
  await checkNoAppErrors("Firefox editing session reported no uncaught application errors");

  // Navigation: list, folder filter, open.
  // The conflict and revision checks rewrote the stored title; normalize it so
  // the list assertions match the document the owner actually sees.
  const beforeNavigation = await api(`/nova/items/${documentId}`, { token: USERS.owner.token });
  const normalized = await api(`/nova/items/${documentId}`, {
    method: "PATCH",
    token: USERS.owner.token,
    body: { expectedVersion: beforeNavigation.data.item.version, title: "Nova Acceptance Document" }
  });
  check("document title can be normalized before navigation", normalized.status === 200, String(normalized.status));
  await click("[data-testid='back-to-list']");
  await driver.wait(until.elementLocated(By.css("[data-testid='document-list-panel']")), 15_000, "list did not return");
  await click("[data-testid='folder-select'][title='Field Notes Archive']");
  await driver.wait(async () => Number(await js("return document.querySelectorAll('[data-testid=\"document-row\"]').length;")) >= 1, 15_000, "filed document missing from folder");
  check("filed document appears under its folder", (await textOf("[data-testid='document-row']")).includes("Nova Acceptance Document"));
  check("document list shows title, status and updated time", await exists("[data-testid='document-row'] .nova-status-active") && await exists("[data-testid='document-updated']"));
  await click("[data-testid='document-row']");
  await driver.wait(until.elementLocated(By.css("[data-testid='editor']")), 20_000, "existing document did not open");
  check("existing document opens from the list", /Nova Acceptance Document/.test(await js("return document.querySelector('[data-testid=\"document-title\"]').value;")));

  // Trash and restore.
  await click("[data-testid='trash-document']");
  await driver.wait(until.elementLocated(By.css("[data-testid='document-list-panel']")), 20_000, "trash did not return to the list");
  check("trash removes the document from the active list", !(await js("return Array.from(document.querySelectorAll('[data-testid=\"document-row\"]')).some(function(r){return /Nova Acceptance Document/.test(r.innerText);});")));
  await click("[data-testid='view-trash']");
  await driver.wait(async () => /Nova Acceptance Document/.test(await textOf("[data-testid='document-list-panel']")), 20_000, "trashed document missing from Trash");
  check("trashed document is listed in Trash with its status", await exists(".nova-status-trash"));
  await click("[data-testid='document-row']");
  await driver.wait(until.elementLocated(By.css("[data-testid='readonly-banner']")), 20_000, "trashed document did not open read-only");
  check("trashed document opens read-only", (await saveState()) === "readonly");
  await click("[data-testid='restore-document']");
  await driver.wait(async () => !(await exists("[data-testid='readonly-banner']")), 20_000, "restore did not make the document editable");
  check("restore returns the document to an editable state", !(await exists("[data-testid='readonly-banner']")));

  // Archive and restore from the Archive view.
  await click("[data-testid='archive-document']");
  await driver.wait(async () => (await saveState()) === "readonly", 20_000, "archive did not make the document read-only");
  check("archive moves the document out of active editing", (await saveState()) === "readonly");
  await click("[data-testid='restore-document']");
  await driver.wait(async () => (await saveState()) !== "readonly", 20_000, "archive restore did not return editability");

  // Permanent delete uses the explicit confirmation contract.
  const candidate = await api("/nova/items", {
    method: "POST",
    token: USERS.owner.token,
    body: { title: "Nova delete candidate", content: docEnvelope() }
  });
  const candidateId = candidate.data.item.id;
  await api(`/nova/items/${candidateId}/trash`, { method: "POST", token: USERS.owner.token, body: { expectedVersion: 1 } });
  await driver.get(`${base}/nova/#/documents/${candidateId}`);
  await driver.wait(until.elementLocated(By.css("[data-testid='permanent-delete']")), 20_000, "permanent delete is unavailable for a trashed document");
  await click("[data-testid='permanent-delete']");
  await driver.wait(until.elementLocated(By.css("[data-testid='delete-dialog']")), 10_000, "delete confirmation dialog did not open");
  check("permanent delete requires an explicit Nova dialog", await exists("[data-testid='delete-dialog']") && !/window\.confirm/.test(await htmlOf("[data-testid='delete-dialog']")));
  await typeInto("[data-testid='delete-confirm-input']", "delete");
  await click("[data-testid='delete-confirm']");
  await driver.wait(until.elementLocated(By.css("[data-testid='action-error']")), 10_000, "wrong confirmation was accepted");
  check("delete refuses a confirmation that does not match", await exists("[data-testid='action-error']"));
  const stillPresent = await api(`/nova/items/${candidateId}`, { token: USERS.owner.token });
  check("refused delete leaves the document intact", stillPresent.status === 200);
  await typeInto("[data-testid='delete-confirm-input']", "DELETE PERMANENTLY");
  await click("[data-testid='delete-confirm']");
  await driver.wait(async () => {
    const checkResponse = await fetch(`${base}/api/nova/items/${candidateId}`, { headers: { Cookie: `tpi_session=${USERS.owner.token}` } });
    return checkResponse.status === 404;
  }, 20_000, "confirmed delete did not remove the document");
  check("confirmed permanent delete removes the document", true);

  // Responsive check: tablet width must not cause destructive overflow.
  section("responsive acceptance");
  await driver.manage().window().setRect({ width: 1280, height: 1000 });
  await driver.get(`${base}/nova/`);
  await driver.wait(until.elementLocated(By.css("[data-testid='nova-sidebar']")), 20_000, "shell did not load for responsive check");
  const desktop = await js("return {overflow: document.documentElement.scrollWidth - window.innerWidth, editor: !!document.querySelector('[data-testid=\"editor\"]') || !!document.querySelector('[data-testid=\"document-list-panel\"]')};");
  check("desktop width has no horizontal overflow", desktop.overflow <= 1, JSON.stringify(desktop));
  await driver.manage().window().setRect({ width: 900, height: 900 });
  await sleep(600);
  const tablet = await js("return {overflow: document.documentElement.scrollWidth - window.innerWidth, listVisible: !!document.querySelector('[data-testid=\"document-list-panel\"]'), sidebarVisible: !!document.querySelector('[data-testid=\"nova-sidebar\"]')};");
  check("tablet width has no destructive horizontal overflow", tablet.overflow <= 1, JSON.stringify(tablet));
  check("tablet width keeps list navigation usable", tablet.listVisible && tablet.sidebarVisible);
  await click("[data-testid='document-row']");
  await driver.wait(until.elementLocated(By.css("[data-testid='editor-toolbar']")), 20_000, "editor did not open at tablet width");
  const tabletEditor = await js("return {overflow: document.documentElement.scrollWidth - window.innerWidth, toolbar: !!document.querySelector('[data-testid=\"editor-toolbar\"]'), editable: !!document.querySelector('.nova-prose')};");
  check("editor remains usable at tablet width", tabletEditor.toolbar && tabletEditor.editable && tabletEditor.overflow <= 1, JSON.stringify(tabletEditor));
  await driver.manage().window().setRect({ width: 1280, height: 1000 });

  await checkNoAppErrors("Firefox reported no uncaught application errors across the acceptance run");
}

// -------------------------------------------------------------- Chromium
async function checkChromium() {
  section("Chromium smoke");
  let chromium;
  try {
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch (error) {
    check("Playwright Chromium is available", false, error.message);
    return;
  }
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addCookies([{ name: "tpi_session", value: USERS.owner.token, domain: "127.0.0.1", path: "/" }]);
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  try {
    await page.goto(`${base}/nova/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-testid='nova-sidebar']", { timeout: 20_000 });
    check("Chromium loads the Nova shell", await page.locator(".nova-brand-name").innerText() === "Nova");

    await page.waitForSelector("[data-testid='new-document']", { timeout: 20_000 });
    await page.getByTestId("new-document").click();
    await page.waitForSelector("[data-testid='editor']", { timeout: 20_000 });
    await page.getByTestId("document-title").fill("Chromium Nova document");
    await page.locator(".nova-prose").click();
    await page.keyboard.type("Chromium smoke body");
    await page.getByTestId("toolbar-bold").click();
    await page.waitForSelector("[data-testid='save-status'][data-save-state='saved']", { timeout: 20_000 });
    check("Chromium edits and autosaves", true);

    const documentId = await page.evaluate(() => decodeURIComponent(location.hash.replace("#/documents/", "")));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".nova-prose", { timeout: 20_000 });
    const reloaded = await page.locator(".nova-prose").innerText();
    check("Chromium reload keeps the saved body", /Chromium smoke body/.test(reloaded), reloaded.slice(0, 120));
    check("Chromium keeps the document title", await page.getByTestId("document-title").inputValue() === "Chromium Nova document");

    await page.setViewportSize({ width: 900, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check("Chromium tablet width has no horizontal overflow", overflow <= 1, String(overflow));
    check("Chromium reported no uncaught page errors", pageErrors.length === 0, JSON.stringify(pageErrors).slice(0, 300));

    const consoleErrors = await page.evaluate(() => window.__novaDiagnostics?.errors || []);
    check("Chromium reported no uncaught application errors", consoleErrors.length === 0, JSON.stringify(consoleErrors).slice(0, 300));
    await page.screenshot({ path: join(root, "chromium-nova-editor.png") });
    console.log(`  evidence: ${join(root, "chromium-nova-editor.png")} (document ${documentId})`);
  } finally {
    await context.close();
    await browser.close();
  }
}

// ------------------------------------------------------------------ main
async function main() {
  section("isolated environment");
  check("verification port is not the official 8787 environment", port !== 8787);
  check("verification state is outside the official .local-dev state", !stateDir.includes("/.local-dev/state"));
  applyMigrations();
  seedSyntheticAccounts();
  check("synthetic accounts are seeded into the throwaway state", query("SELECT COUNT(*) AS n FROM sessions WHERE token LIKE 'nova004-session-%';")[0].n === 2);

  const server = spawn(wrangler, [
    "dev",
    "--config", isolatedConfigPath,
    "--local",
    "--ip", "127.0.0.1",
    "--port", String(port),
    "--persist-to", stateDir
  ], {
    cwd: repoRoot,
    env: wranglerEnv,
    stdio: ["ignore", openSync(logPath, "a"), openSync(logPath, "a")]
  });

  let driver = null;
  try {
    await waitForWorker(server);
    check("isolated Worker is serving on the verification port", true);
    checkBuildArtifacts();
    await checkGate();
    await checkApiContract();

    if (!statSync(firefoxBinary, { throwIfNoEntry: false })) {
      check("Firefox Developer Edition is installed", false, firefoxBinary);
    } else if (!statSync(geckodriver, { throwIfNoEntry: false })) {
      check("geckodriver is installed", false, geckodriver);
    } else {
      driver = await buildDriver();
      await checkFirefox(driver);
    }
    await checkChromium();
  } finally {
    if (driver) {
      try {
        await driver.quit();
      } catch {
        // A crashed browser must not mask the real failures.
      }
    }
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await new Promise(next => setTimeout(next, 1500));
      if (server.exitCode === null) server.kill("SIGKILL");
    }
  }

  section("summary");
  for (const [label, counts] of sectionCounts) {
    if (label === "summary") continue;
    console.log(`  ${label}: ${counts.passed} passed, ${counts.failed} failed`);
  }
  console.log(`\n  ${passed} checks passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.log("\n  failures:");
    for (const failure of failures) console.log(`   - ${failure}`);
    console.log(`\n  worker log: ${logPath}`);
  } else if (!process.env.TPI_NOVA_KEEP_STATE) {
    console.log(`  evidence retained: ${root}`);
  }
  process.exitCode = failures.length === 0 ? 0 : 1;
}

await main().catch(error => {
  console.error(`\nTPI-NOVA-004 verification aborted: ${error?.stack || error}`);
  console.error(`worker log: ${logPath}`);
  try {
    console.error(tailLog());
  } catch {
    // ignore
  }
  if (!process.env.TPI_NOVA_KEEP_STATE) {
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
  process.exitCode = 1;
});

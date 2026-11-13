// TPI-NOVA-003: Nova Core storage and API verification.
//
// Runs the real local Worker (workerd via wrangler dev) against a throwaway D1
// state directory and port. The official StudioFlow local environment on
// 127.0.0.1:8787 and its .local-dev/state/v3 data are never opened, migrated or
// contacted. Synthetic owners and sessions are seeded into the throwaway state
// only, so no production fixtures exist anywhere.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, openSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createServer } from "node:net";

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

const repoRoot = resolve(import.meta.dirname, "../..");
const configPath = resolve(repoRoot, "wrangler.local.toml");
const database = "tpi-local-foundation";
const port = Number(process.env.TPI_NOVA_TEST_PORT || (await freePort()));
if (port === 8787) throw new Error("TPI-NOVA-003 verification must not use the official local environment on port 8787");
const base = `http://127.0.0.1:${port}`;
const wrangler = process.env.WRANGLER_BIN || "wrangler";
const wranglerEnv = { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" };

const root = mkdtempSync(join(tmpdir(), "tpi-nova-003-"));
const stateDir = join(root, "state");
const logPath = join(root, "worker.log");
mkdirSync(stateDir, { recursive: true });

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
    env: wranglerEnv,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function d1(args) {
  return runWrangler(["d1", "execute", database, "--config", configPath, "--local", "--persist-to", stateDir, ...args]);
}

function query(sql) {
  const result = d1(["--command", sql, "--json"]);
  if (result.status !== 0) throw new Error(`D1 query failed: ${(result.stderr || result.stdout || "").trim()}`);
  const parsed = JSON.parse(result.stdout);
  return parsed?.[0]?.results || [];
}

function executeSqlFile(sql) {
  const statementPath = join(root, "statement.sql");
  writeFileSync(statementPath, sql, "utf8");
  return d1(["--file", statementPath, "--yes"]);
}

function expectSqlFailure(label, statement) {
  const result = executeSqlFile(statement);
  check(label, result.status !== 0, "statement unexpectedly succeeded against the schema constraints");
}

async function api(path, { method = "GET", token, body, origin, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (token) requestHeaders.Cookie = `tpi_session=${token}`;
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (method !== "GET" && origin !== null) requestHeaders.Origin = origin || base;
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: requestHeaders,
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

function docEnvelope(text = "Nova Core foundation text") {
  return {
    format: "nova-document",
    version: 1,
    doc: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }]
    }
  };
}

function presentationEnvelope(label = "Slide one") {
  return {
    format: "nova-presentation",
    version: 1,
    presentation: {
      width: 1920,
      height: 1080,
      slides: [{ id: "slide-1", background: "#0b0b0b", elements: [{ type: "text", text: label }] }]
    }
  };
}

const id = prefix => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const USERS = {
  a: { id: "nova003-owner-a", username: "nova_003_owner_a", token: "nova003-session-a", role: "admin" },
  b: { id: "nova003-owner-b", username: "nova_003_owner_b", token: "nova003-session-b", role: "admin" },
  member: { id: "nova003-member", username: "nova_003_member", token: "nova003-session-member", role: "member" }
};

function applyMigrations() {
  const result = runWrangler([
    "d1", "migrations", "apply", database,
    "--config", configPath,
    "--local",
    "--persist-to", stateDir
  ]);
  if (result.status !== 0) {
    throw new Error(`migration apply failed: ${(result.stderr || result.stdout || "").trim().slice(0, 2000)}`);
  }
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function seedSyntheticAccounts() {
  const seedPath = join(root, "seed.sql");
  const rows = Object.values(USERS).map(user => `
    INSERT OR REPLACE INTO contributors (id, username, password_hash, display_name, role, active)
    VALUES (${sqlString(user.id)}, ${sqlString(user.username)}, 'synthetic-not-a-real-password', ${sqlString(`Synthetic Nova ${user.role}`)}, ${sqlString(user.role)}, 1);
    INSERT OR REPLACE INTO sessions (token, contributor_id, expires_at)
    VALUES (${sqlString(user.token)}, ${sqlString(user.id)}, '2030-01-01T00:00:00.000Z');
  `).join("\n");
  writeFileSync(seedPath, rows, "utf8");
  const result = d1(["--file", seedPath, "--yes"]);
  if (result.status !== 0) {
    throw new Error(`synthetic seeding failed: ${(result.stderr || result.stdout || "").trim().slice(0, 2000)}`);
  }
}

async function waitForWorker(server) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("worker exited before becoming ready");
    try {
      await fetch(`${base}/api/nova/items`, { headers: { Cookie: `tpi_session=${USERS.a.token}` } });
      return;
    } catch {
      await new Promise(resolveWait => setTimeout(resolveWait, 400));
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

async function run() {
  section("isolated environment");
  check("verification port is not the official 8787 environment", port !== 8787);
  check("verification state is outside the official .local-dev state", !stateDir.includes("/.local-dev/state"));
  const migrationOutput = applyMigrations();
  check("migrations applied to the throwaway local D1", /0059_nova_core\.sql/.test(migrationOutput), migrationOutput.slice(0, 300));
  seedSyntheticAccounts();
  check("synthetic accounts seeded into the throwaway state", query("SELECT COUNT(*) AS n FROM sessions WHERE token LIKE 'nova003-session-%';")[0].n === 3);

  const server = spawn(wrangler, [
    "dev",
    "--config", configPath,
    "--local",
    "--ip", "127.0.0.1",
    "--port", String(port),
    "--inspector-port", "0",
    "--persist-to", stateDir
  ], {
    cwd: repoRoot,
    env: wranglerEnv,
    stdio: ["ignore", openSync(logPath, "a"), openSync(logPath, "a")]
  });

  try {
    await waitForWorker(server);
    await exercise(server);
  } finally {
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await new Promise(resolveWait => setTimeout(resolveWait, 1200));
      if (server.exitCode === null) server.kill("SIGKILL");
    }
  }
}

async function exercise(server) {
  // ---------------------------------------------------------------- schema
  section("schema");
  const tables = new Set(query("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'nova_%';").map(row => row.name));
  for (const table of ["nova_collections", "nova_items", "nova_revisions"]) {
    check(`table ${table} exists`, tables.has(table));
  }
  const indexes = new Set(query("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_nova_%';").map(row => row.name));
  for (const index of [
    "idx_nova_collections_owner_parent",
    "idx_nova_items_owner_status_updated",
    "idx_nova_items_owner_type_status_updated",
    "idx_nova_items_owner_collection_status",
    "idx_nova_items_owner_title",
    "idx_nova_revisions_item_number",
    "idx_nova_revisions_owner_created"
  ]) {
    check(`index ${index} exists`, indexes.has(index));
  }
  check("Nova tables are foreign-key linked to contributors", query("SELECT COUNT(*) AS n FROM pragma_foreign_key_list('nova_items') WHERE \"table\" = 'contributors';")[0].n >= 1);

  const baseItemInsert = (overrides = {}) => {
    const row = {
      id: id("schema-item"),
      owner_id: USERS.a.id,
      type: "'nova-document'",
      title: "'Schema check'",
      content_json: "'{\"format\":\"nova-document\",\"version\":1,\"doc\":{\"content\":[]}}'",
      content_bytes: 54,
      version: 1,
      status: "'active'",
      ...overrides
    };
    return `INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version, status)
      VALUES (${sqlString(row.id)}, ${sqlString(row.owner_id)}, ${row.type}, ${row.title}, ${row.content_json}, ${row.content_bytes}, ${row.version}, ${row.status});`;
  };
  expectSqlFailure("CHECK rejects an unknown Nova type", baseItemInsert({ type: "'nova-spreadsheet'" }));
  expectSqlFailure("CHECK rejects an unknown Nova status", baseItemInsert({ status: "'draft'" }));
  expectSqlFailure("CHECK rejects a non-positive record version", baseItemInsert({ version: 0 }));
  expectSqlFailure("uniqueness prevents rewriting a revision in place", `
    INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes)
      VALUES ('schema-rev-item', ${sqlString(USERS.a.id)}, 'nova-document', 'Rev', '{"format":"nova-document","version":1,"doc":{"content":[]}}', 54);
    INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, content_json, content_bytes)
      VALUES ('schema-rev-1', 'schema-rev-item', ${sqlString(USERS.a.id)}, 1, 'Rev', '{"format":"nova-document","version":1,"doc":{"content":[]}}', 54);
    INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, content_json, content_bytes)
      VALUES ('schema-rev-2', 'schema-rev-item', ${sqlString(USERS.a.id)}, 1, 'Rev', '{"format":"nova-document","version":1,"doc":{"content":[]}}', 54);
  `);
  executeSqlFile(`DELETE FROM nova_revisions WHERE item_id = 'schema-rev-item'; DELETE FROM nova_items WHERE id = 'schema-rev-item';`);
  executeSqlFile(`
    INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes)
      VALUES ('schema-cascade-item', ${sqlString(USERS.a.id)}, 'nova-document', 'Cascade', '{"format":"nova-document","version":1,"doc":{"content":[]}}', 54);
    INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, content_json, content_bytes)
      VALUES ('schema-cascade-rev', 'schema-cascade-item', ${sqlString(USERS.a.id)}, 1, 'Cascade', '{"format":"nova-document","version":1,"doc":{"content":[]}}', 54);
    DELETE FROM nova_items WHERE id = 'schema-cascade-item';
  `);
  check("revisions cascade with their Nova item", query("SELECT COUNT(*) AS n FROM nova_revisions WHERE item_id = 'schema-cascade-item';")[0].n === 0);

  // ------------------------------------------------------------- security
  section("authentication and ownership");
  const anonymous = await api("/nova/items");
  check("unauthenticated listing is rejected", anonymous.status === 401 && anonymous.data?.code === "auth_required");
  const memberCall = await api("/nova/items", { token: USERS.member.token });
  check("account without Creator capability is rejected", memberCall.status === 403 && memberCall.data?.code === "access_denied");
  const crossOrigin = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    origin: "https://cross-origin.example",
    body: { content: docEnvelope() }
  });
  check("cross-origin mutation is rejected", crossOrigin.status === 403 && crossOrigin.data?.code === "cross_origin_forbidden");

  const created = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    body: { title: "Owner A document", content: docEnvelope("Owned by A"), ownerId: USERS.b.id }
  });
  check("document create returns 201", created.status === 201, JSON.stringify(created.data).slice(0, 300));
  const docId = created.data?.item?.id;
  check("create ignores a client-supplied ownerId", created.data?.item?.title === "Owner A document");
  check("responses are private and not cached", /private/.test(created.headers.get("cache-control") || "") && /no-store/.test(created.headers.get("cache-control") || ""));
  const foreignFetch = await api(`/nova/items/${docId}`, { token: USERS.b.token });
  check("another owner cannot fetch the item by ID", foreignFetch.status === 404);
  const foreignUpdate = await api(`/nova/items/${docId}`, {
    method: "PATCH",
    token: USERS.b.token,
    body: { expectedVersion: 1, title: "Hijacked" }
  });
  check("another owner cannot update the item", foreignUpdate.status === 404);
  const foreignTrash = await api(`/nova/items/${docId}/trash`, { method: "POST", token: USERS.b.token, body: { expectedVersion: 1 } });
  check("another owner cannot trash the item", foreignTrash.status === 404);
  const foreignDelete = await api(`/nova/items/${docId}/permanent-delete`, {
    method: "POST",
    token: USERS.b.token,
    body: { expectedVersion: 1, confirmation: "DELETE PERMANENTLY" }
  });
  check("another owner cannot permanently delete the item", foreignDelete.status === 404);
  const foreignRevisions = await api(`/nova/items/${docId}/revisions`, { token: USERS.b.token });
  check("another owner cannot list revisions", foreignRevisions.status === 404);
  const foreignList = await api("/nova/items?status=all&limit=200", { token: USERS.b.token });
  check("another owner's listing never includes the item", Array.isArray(foreignList.data?.items) && !foreignList.data.items.some(item => item.id === docId));

  // ------------------------------------------------------------ documents
  section("document lifecycle");
  const fetched = await api(`/nova/items/${docId}`, { token: USERS.a.token });
  check("document fetch returns the stored envelope", fetched.status === 200 && fetched.data?.item?.content?.doc?.content?.[0]?.content?.[0]?.text === "Owned by A");
  check("document records format version separately from record version", fetched.data?.item?.formatVersion === 1 && fetched.data?.item?.version === 1);

  const titleOnly = await api(`/nova/items/${docId}`, {
    method: "PATCH",
    token: USERS.a.token,
    body: { expectedVersion: 1, title: "Renamed document" }
  });
  check("metadata update bumps the record version", titleOnly.status === 200 && titleOnly.data?.item?.version === 2, JSON.stringify(titleOnly.data).slice(0, 300));
  check("metadata-only update does not create a content revision", query(`SELECT COUNT(*) AS n FROM nova_revisions WHERE item_id = ${sqlString(docId)};`)[0].n === 1);

  const contentUpdate = await api(`/nova/items/${docId}`, {
    method: "PATCH",
    token: USERS.a.token,
    body: { expectedVersion: 2, content: docEnvelope("Updated body") }
  });
  check("content update succeeds with the current version", contentUpdate.status === 200 && contentUpdate.data?.item?.version === 3);
  check("content update records a revision for the new version", query(`SELECT COUNT(*) AS n FROM nova_revisions WHERE item_id = ${sqlString(docId)};`)[0].n === 2);

  const stale = await api(`/nova/items/${docId}`, {
    method: "PATCH",
    token: USERS.a.token,
    body: { expectedVersion: 1, content: docEnvelope("Stale overwrite") }
  });
  check("stale expectedVersion is rejected with a conflict", stale.status === 409 && stale.data?.code === "nova_item_conflict");
  check("conflict response reports the current version", stale.data?.item?.version === 3);
  const afterConflict = await api(`/nova/items/${docId}`, { token: USERS.a.token });
  check("rejected write never overwrites newer content", afterConflict.data?.item?.content?.doc?.content?.[0]?.content?.[0]?.text === "Updated body");

  const missingVersion = await api(`/nova/items/${docId}`, { method: "PATCH", token: USERS.a.token, body: { title: "No version" } });
  check("mutations without expectedVersion are rejected", missingVersion.status === 400 && missingVersion.data?.code === "expected_version_required");

  const wrongType = await api(`/nova/items/${docId}`, {
    method: "PATCH",
    token: USERS.a.token,
    body: { expectedVersion: 3, content: presentationEnvelope() }
  });
  check("an item cannot silently change Nova type", wrongType.status === 400 && wrongType.data?.code === "nova_type_mismatch");

  section("validation");
  const badFormat = await api("/nova/items", { method: "POST", token: USERS.a.token, body: { content: { format: "nova-html", version: 1, doc: {} } } });
  check("malformed format is rejected", badFormat.status === 400 && badFormat.data?.code === "invalid_nova_format");
  const badVersion = await api("/nova/items", { method: "POST", token: USERS.a.token, body: { content: { ...docEnvelope(), version: 2 } } });
  check("unsupported format version is rejected", badVersion.status === 400 && badVersion.data?.code === "unsupported_nova_format_version");
  const badShape = await api("/nova/items", { method: "POST", token: USERS.a.token, body: { content: { format: "nova-document", version: 1, doc: "html" } } });
  check("wrong envelope shape is rejected", badShape.status === 400 && badShape.data?.code === "invalid_nova_shape");
  const missingContent = await api("/nova/items", { method: "POST", token: USERS.a.token, body: { title: "No content" } });
  check("missing content is rejected", missingContent.status === 400 && missingContent.data?.code === "nova_content_required");
  const oversized = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    body: { content: docEnvelope("x".repeat(600 * 1024)) }
  });
  check("oversized document content is rejected", oversized.status === 413 && oversized.data?.code === "nova_content_too_large", JSON.stringify(oversized.data).slice(0, 200));
  const oversizedRequest = await fetch(`${base}/api/nova/items`, {
    method: "POST",
    headers: { Cookie: `tpi_session=${USERS.a.token}`, Origin: base, "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Huge", padding: "y".repeat(1200 * 1024) })
  });
  check("oversized request bodies are rejected", oversizedRequest.status === 413);
  const badJson = await fetch(`${base}/api/nova/items`, {
    method: "POST",
    headers: { Cookie: `tpi_session=${USERS.a.token}`, Origin: base, "Content-Type": "application/json" },
    body: "{not json"
  });
  check("invalid JSON is rejected", badJson.status === 400);

  section("listing and filters");
  const listed = await api("/nova/items?type=nova-document&status=active&limit=50", { token: USERS.a.token });
  check("owner listing returns the document", listed.status === 200 && listed.data?.items?.some(item => item.id === docId));
  check("listing never returns content payloads", listed.data?.items?.every(item => item.content === undefined));
  const searched = await api("/nova/items?search=Renamed", { token: USERS.a.token });
  check("title search matches the owned item", searched.data?.items?.length === 1 && searched.data.items[0].id === docId);
  const badFilter = await api("/nova/items?type=nova-spreadsheet", { token: USERS.a.token });
  check("invalid list filter is rejected", badFilter.status === 400 && badFilter.data?.code === "invalid_filter");

  const trashed = await api(`/nova/items/${docId}/trash`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 3 } });
  check("trash moves the item to Trash", trashed.status === 200 && trashed.data?.item?.status === "trash");
  check("trash records a deletion timestamp", Boolean(trashed.data?.item?.deletedAt));
  const trashEdit = await api(`/nova/items/${docId}`, { method: "PATCH", token: USERS.a.token, body: { expectedVersion: 4, title: "Edit in trash" } });
  check("trashed items are read-only", trashEdit.status === 409 && trashEdit.data?.code === "nova_item_in_trash");
  const trashList = await api("/nova/items?status=trash", { token: USERS.a.token });
  check("trash filter lists the item", trashList.data?.items?.some(item => item.id === docId));
  const restored = await api(`/nova/items/${docId}/restore`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 4 } });
  check("restore returns the item to active", restored.status === 200 && restored.data?.item?.status === "active" && !restored.data?.item?.deletedAt);

  const archived = await api(`/nova/items/${docId}/archive`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 5 } });
  check("archive marks the item archived", archived.status === 200 && archived.data?.item?.status === "archived");
  const archivedList = await api("/nova/items?status=archived", { token: USERS.a.token });
  check("archive filter lists the item", archivedList.data?.items?.some(item => item.id === docId));
  const unarchived = await api(`/nova/items/${docId}/restore`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 6 } });
  check("restore unarchives the item", unarchived.status === 200 && unarchived.data?.item?.status === "active");

  const prematureDelete = await api(`/nova/items/${docId}/permanent-delete`, {
    method: "POST",
    token: USERS.a.token,
    body: { expectedVersion: 7, confirmation: "DELETE PERMANENTLY" }
  });
  check("permanent delete requires the item to be in Trash", prematureDelete.status === 409 && prematureDelete.data?.code === "nova_item_not_in_trash");
  await api(`/nova/items/${docId}/trash`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 7 } });
  const noConfirmation = await api(`/nova/items/${docId}/permanent-delete`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 8 } });
  check("permanent delete requires explicit confirmation", noConfirmation.status === 400 && noConfirmation.data?.code === "confirmation_required");
  const deleted = await api(`/nova/items/${docId}/permanent-delete`, {
    method: "POST",
    token: USERS.a.token,
    body: { expectedVersion: 8, confirmation: "DELETE PERMANENTLY" }
  });
  check("permanent delete removes the item", deleted.status === 200 && deleted.data?.ok === true);
  check("permanently deleted items are gone", (await api(`/nova/items/${docId}`, { token: USERS.a.token })).status === 404);
  check("permanently deleted items leave no revisions", query(`SELECT COUNT(*) AS n FROM nova_revisions WHERE item_id = ${sqlString(docId)};`)[0].n === 0);

  // --------------------------------------------------------- presentations
  section("presentation lifecycle");
  const presCreate = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    body: { title: "Deck one", content: presentationEnvelope("Opening slide") }
  });
  check("presentation create returns 201", presCreate.status === 201, JSON.stringify(presCreate.data).slice(0, 300));
  const presId = presCreate.data?.item?.id;
  check("presentation identity is nova-presentation", presCreate.data?.item?.type === "nova-presentation");
  check("presentation stores slides as structured JSON", presCreate.data?.item?.content?.presentation?.slides?.length === 1);
  const presUpdate = await api(`/nova/items/${presId}`, {
    method: "PATCH",
    token: USERS.a.token,
    body: { expectedVersion: 1, content: { ...presentationEnvelope("Second slide"), presentation: { ...presentationEnvelope().presentation, slides: [{ id: "slide-1", elements: [] }, { id: "slide-2", elements: [] }] } } }
  });
  check("presentation content update succeeds", presUpdate.status === 200 && presUpdate.data?.item?.version === 2 && presUpdate.data?.item?.content?.presentation?.slides?.length === 2);
  const presStale = await api(`/nova/items/${presId}`, { method: "PATCH", token: USERS.a.token, body: { expectedVersion: 1, content: presentationEnvelope("Stale") } });
  check("presentation version conflicts are rejected", presStale.status === 409 && presStale.data?.code === "nova_item_conflict");
  const presTrash = await api(`/nova/items/${presId}/trash`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 2 } });
  check("presentation trash succeeds", presTrash.status === 200 && presTrash.data?.item?.status === "trash");
  const presRestore = await api(`/nova/items/${presId}/restore`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 3 } });
  check("presentation restore succeeds", presRestore.status === 200 && presRestore.data?.item?.status === "active");
  await api(`/nova/items/${presId}/trash`, { method: "POST", token: USERS.a.token, body: { expectedVersion: 4 } });
  const presDelete = await api(`/nova/items/${presId}/permanent-delete`, {
    method: "POST",
    token: USERS.a.token,
    body: { expectedVersion: 5, confirmation: "DELETE PERMANENTLY" }
  });
  check("presentation permanent delete succeeds", presDelete.status === 200 && presDelete.data?.ok === true);

  // ------------------------------------------------------------ collections
  section("collections");
  const rootCollection = await api("/nova/collections", { method: "POST", token: USERS.a.token, body: { name: "Nova Root" } });
  check("collection create returns 201", rootCollection.status === 201);
  const rootId = rootCollection.data?.collection?.id;
  const childCollection = await api("/nova/collections", { method: "POST", token: USERS.a.token, body: { name: "Nova Child", parentId: rootId } });
  check("nested collection stores its parent", childCollection.status === 201 && childCollection.data?.collection?.parentId === rootId);
  const childId = childCollection.data?.collection?.id;
  const grandchild = await api("/nova/collections", { method: "POST", token: USERS.a.token, body: { name: "Nova Grandchild", parentId: childId } });
  const grandchildId = grandchild.data?.collection?.id;
  check("three-level nesting is supported", grandchild.status === 201 && grandchild.data?.collection?.parentId === childId);

  const renamed = await api(`/nova/collections/${childId}`, { method: "PATCH", token: USERS.a.token, body: { name: "Nova Child Renamed" } });
  check("collection rename succeeds", renamed.status === 200 && renamed.data?.collection?.name === "Nova Child Renamed");
  const moved = await api(`/nova/collections/${childId}`, { method: "PATCH", token: USERS.a.token, body: { parentId: null } });
  check("collection can move to the root", moved.status === 200 && moved.data?.collection?.parentId === null);
  await api(`/nova/collections/${childId}`, { method: "PATCH", token: USERS.a.token, body: { parentId: rootId } });
  const cycle = await api(`/nova/collections/${rootId}`, { method: "PATCH", token: USERS.a.token, body: { parentId: grandchildId } });
  check("collection cycles are rejected", cycle.status === 400 && cycle.data?.code === "invalid_collection_parent");
  const foreignParent = await api("/nova/collections", { method: "POST", token: USERS.b.token, body: { name: "B child", parentId: rootId } });
  check("cannot nest under another owner's collection", foreignParent.status === 400 && foreignParent.data?.code === "invalid_collection_parent");
  const foreignCollectionUpdate = await api(`/nova/collections/${rootId}`, { method: "PATCH", token: USERS.b.token, body: { name: "Hijacked" } });
  check("another owner cannot rename a collection", foreignCollectionUpdate.status === 404);

  const filed = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    body: { title: "Filed document", collectionId: childId, content: docEnvelope("Filed") }
  });
  check("item can be created inside a collection", filed.status === 201 && filed.data?.item?.collectionId === childId);
  const collectionList = await api("/nova/collections", { token: USERS.a.token });
  const childRow = collectionList.data?.collections?.find(collection => collection.id === childId);
  check("collection listing reports active item counts", childRow?.itemCount === 1);
  const foreignCollectionList = await api("/nova/collections", { token: USERS.b.token });
  check("collection listing is owner-scoped", Array.isArray(foreignCollectionList.data?.collections) && !foreignCollectionList.data.collections.some(collection => collection.id === rootId));
  const collectionFilter = await api(`/nova/items?collectionId=${encodeURIComponent(childId)}`, { token: USERS.a.token });
  check("collection filter lists only its items", collectionFilter.data?.items?.length === 1 && collectionFilter.data.items[0].id === filed.data?.item?.id);

  const deletedCollection = await api(`/nova/collections/${childId}/delete`, { method: "POST", token: USERS.a.token });
  check("collection delete preserves its items", deletedCollection.status === 200 && deletedCollection.data?.itemsPreserved === true);
  const unfiledItem = await api(`/nova/items/${filed.data?.item?.id}`, { token: USERS.a.token });
  check("items from a deleted collection return to Unfiled", unfiledItem.status === 200 && unfiledItem.data?.item?.collectionId === null);
  const reparented = await api("/nova/collections", { token: USERS.a.token });
  const grandchildRow = reparented.data?.collections?.find(collection => collection.id === grandchildId);
  check("children of a deleted collection move to its parent", grandchildRow?.parentId === rootId);
  const foreignCollectionDelete = await api(`/nova/collections/${rootId}/delete`, { method: "POST", token: USERS.b.token });
  check("another owner cannot delete a collection", foreignCollectionDelete.status === 404);

  // -------------------------------------------------------------- revisions
  section("revisions");
  const revItem = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    body: { title: "Revision document", content: docEnvelope("Revision one") }
  });
  const revItemId = revItem.data?.item?.id;
  for (let index = 2; index <= 6; index += 1) {
    await api(`/nova/items/${revItemId}`, {
      method: "PATCH",
      token: USERS.a.token,
      body: { expectedVersion: index - 1, content: docEnvelope(`Revision ${index}`) }
    });
  }
  const revisionList = await api(`/nova/items/${revItemId}/revisions`, { token: USERS.a.token });
  check("revision list includes every content version", revisionList.status === 200 && revisionList.data?.revisions?.length === 6);
  check("revision list is newest first", revisionList.data?.revisions?.[0]?.revisionNumber === 6);
  check("revision list carries content snapshots", revisionList.data?.revisions?.[5]?.content?.doc?.content?.[0]?.content?.[0]?.text === "Revision one");
  const revisionOneId = revisionList.data?.revisions?.find(revision => revision.revisionNumber === 1)?.id;

  const restoredRevision = await api(`/nova/items/${revItemId}/revisions/${revisionOneId}/restore`, {
    method: "POST",
    token: USERS.a.token,
    body: { expectedVersion: 6 }
  });
  check("revision restore creates a new current version", restoredRevision.status === 200 && restoredRevision.data?.item?.version === 7);
  check("revision restore returns the historical content", restoredRevision.data?.item?.content?.doc?.content?.[0]?.content?.[0]?.text === "Revision one");
  check("revision restore records its provenance", restoredRevision.data?.restoredFromRevision === 1);
  const historyAfterRestore = await api(`/nova/items/${revItemId}/revisions`, { token: USERS.a.token });
  check("revision restore preserves prior history", historyAfterRestore.data?.revisions?.length === 7);
  check("restored snapshot is a new revision, not a rewrite", historyAfterRestore.data?.revisions?.[0]?.revisionNumber === 7 && historyAfterRestore.data?.revisions?.[0]?.restoredFromRevision === 1);
  const foreignRevision = await api(`/nova/items/${revItemId}/revisions`, { token: USERS.b.token });
  check("another owner cannot read or restore revisions", foreignRevision.status === 404);

  const boundedItem = await api("/nova/items", {
    method: "POST",
    token: USERS.a.token,
    body: { title: "Bounded revisions", content: docEnvelope("Bound 0") }
  });
  const boundedId = boundedItem.data?.item?.id;
  let boundedVersion = 1;
  for (let index = 1; index <= 55; index += 1) {
    const response = await api(`/nova/items/${boundedId}`, {
      method: "PATCH",
      token: USERS.a.token,
      body: { expectedVersion: boundedVersion, content: docEnvelope(`Bound ${index}`) }
    });
    if (response.status !== 200) {
      check(`retention update ${index} succeeded`, false, JSON.stringify(response.data).slice(0, 200));
      break;
    }
    boundedVersion = response.data.item.version;
  }
  const boundedRevisions = await api(`/nova/items/${boundedId}/revisions`, { token: USERS.a.token });
  const boundedCount = boundedRevisions.data?.revisions?.length;
  check("revision retention is bounded to 50", boundedCount === 50, `found ${boundedCount}`);
  check("retention drops the oldest revisions first", boundedRevisions.data?.revisions?.at(-1)?.revisionNumber === boundedVersion - 49, `oldest ${boundedRevisions.data?.revisions?.at(-1)?.revisionNumber}, latest ${boundedVersion}`);
  check("retention limit is advertised to clients", boundedRevisions.data?.retention === 50);

  section("cleanup and isolation");
  check("official local environment was never used for verification", port !== 8787 && !stateDir.includes(".local-dev/state"));
  check("verification Worker is still healthy after the suite", server.exitCode === null);
}

try {
  await run();
} catch (error) {
  failures.push(`harness: ${error.message}`);
  console.error("\nHARNESS FAILURE:", error.message);
  if (error.message.includes("worker") || error.message.includes("migration")) {
    console.error("\n--- worker log tail ---\n" + tailLog());
  }
} finally {
  const total = [...sectionCounts.values()].reduce((sum, counts) => sum + counts.passed + counts.failed, 0);
  console.log(`\n# TPI-NOVA-003 Nova Core verification`);
  for (const [label, counts] of sectionCounts.entries()) {
    console.log(`  ${label}: ${counts.passed} passed, ${counts.failed} failed`);
  }
  console.log(`\nassertions: ${total} — passed: ${passed} — failed: ${failures.length}`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const failure of failures) console.log(`  - ${failure}`);
    console.log(`\nThrowaway state retained for inspection: ${root}`);
    process.exitCode = 1;
  } else {
    console.log("\nresult: PASS — Nova Core storage and API verified against the isolated local Worker");
    rmSync(root, { recursive: true, force: true });
  }
}

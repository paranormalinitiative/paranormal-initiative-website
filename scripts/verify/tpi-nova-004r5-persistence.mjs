// TPI-NOVA-004R5: article-linked Nova persistence verification.
//
// Runs the real local Worker (workerd via wrangler dev) against a throwaway D1
// state directory and port. The official StudioFlow environment on 127.0.0.1:8787
// and its .local-dev/state data are never opened, migrated or contacted.
// Synthetic accounts and sessions are seeded into the throwaway state only.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, openSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createServer } from "node:net";
function freePort() { return new Promise((resolve, reject) => { const srv = createServer(); srv.unref(); srv.on("error", reject); srv.listen(0, "127.0.0.1", () => { const { port } = srv.address(); srv.close(() => resolve(port)); }); }); }

const repoRoot = resolve(import.meta.dirname, "../..");
const configPath = resolve(repoRoot, "wrangler.local.toml");
const database = "tpi-local-foundation";
// TEMPORARY TEST HARNESS — NOT AUTHORITATIVE TPI DEVELOPMENT SITE. Uses a free ephemeral port unless TPI_NOVA_TEST_PORT is set.
const port = Number(process.env.TPI_NOVA_TEST_PORT || (await freePort()));
if (port === 8787) throw new Error("TPI-NOVA-004R5 verification must not use the official local environment on port 8787");
const base = `http://127.0.0.1:${port}`;
const wrangler = process.env.WRANGLER_BIN || "wrangler";
const wranglerEnv = { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" };

const root = mkdtempSync(join(tmpdir(), "tpi-nova-004r5-"));
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

function executeSql(sql) {
  const statementPath = join(root, `statement-${Math.random().toString(36).slice(2, 8)}.sql`);
  writeFileSync(statementPath, sql, "utf8");
  return d1(["--file", statementPath, "--yes"]);
}

async function api(path, { method = "GET", token, body, origin, headers = {} } = {}) {
  const requestHeaders = { Connection: "close", ...headers };
  if (token) requestHeaders.Cookie = `tpi_session=${token}`;
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (method !== "GET" && origin !== null) requestHeaders.Origin = origin || base;
  let response;
  try {
    response = await fetch(`${base}/api${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    throw new Error(`request ${method} ${path} failed: ${error.cause?.code || error.cause?.message || error.message}`);
  }
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 400) };
  }
  return { status: response.status, data };
}

const id = prefix => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

// Contributor = `contributor` role (CAPABILITY.CONTRIBUTOR, no Creator entitlement).
// Owner A/B are contributors; member has neither capability.
const USERS = {
  a: { id: "nova004r5-owner-a", username: "nova_004r5_owner_a", token: "nova004r5-session-a", role: "contributor" },
  b: { id: "nova004r5-owner-b", username: "nova_004r5_owner_b", token: "nova004r5-session-b", role: "contributor" },
  member: { id: "nova004r5-member", username: "nova_004r5_member", token: "nova004r5-session-member", role: "member" },
  studio: { id: "nova004r5-studio", username: "nova_004r5_studio", token: "nova004r5-session-studio", role: "admin" }
};

function applyMigrations() {
  const result = runWrangler(["d1", "migrations", "apply", database, "--config", configPath, "--local", "--persist-to", stateDir]);
  if (result.status !== 0) {
    throw new Error(`migration apply failed: ${(result.stderr || result.stdout || "").trim().slice(0, 2000)}`);
  }
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function seedSyntheticAccounts() {
  const seedPath = join(root, "seed.sql");
  const rows = Object.values(USERS).map(user => `
    INSERT OR REPLACE INTO contributors (id, username, password_hash, display_name, role, active)
    VALUES (${sqlString(user.id)}, ${sqlString(user.username)}, 'synthetic-not-a-real-password', ${sqlString(`Synthetic 004R5 ${user.role}`)}, ${sqlString(user.role)}, 1);
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
      await fetch(`${base}/api/articles/reactions?pageId=ready`);
      return;
    } catch {
      await new Promise(resolveWait => setTimeout(resolveWait, 400));
    }
  }
  throw new Error("worker did not become ready within 90s");
}

async function run() {
  section("isolated environment");
  check("verification port is not the official 8787 environment", port !== 8787);
  check("verification state is outside the official .local-dev state", !stateDir.includes("/.local-dev/state"));
  const migrationOutput = applyMigrations();
  check("migrations applied to the throwaway local D1", /0060_article_nova_link\.sql/.test(migrationOutput) || /0059_nova_core\.sql/.test(migrationOutput), migrationOutput.slice(0, 300));
  seedSyntheticAccounts();
  check("synthetic accounts seeded into the throwaway state", query("SELECT COUNT(*) AS n FROM sessions WHERE token LIKE 'nova004r5-session-%';")[0].n === 4);

  const server = spawn(wrangler, [
    "dev", "--config", configPath, "--local", "--ip", "127.0.0.1", "--port", String(port), "--persist-to", stateDir
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

// @@SECTION_MARKER@@ — exercise() and later sections are appended here in parts.

async function exercise(server) {
  // ------------------------------------------------------------ access
  section("contributor access");
  const articleA = id("nova004r5-article-a");
  const articleB = id("nova004r5-article-b");
  const insertArticle = (articleId, owner, body) => executeSql(`
    INSERT INTO articles (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by, updated_at)
    VALUES (${sqlString(articleId)}, 'education', ${sqlString(`published-article.html?id=${articleId}`)}, 'Synthetic 004R5 article', '', 'Research Paper', 'Synthetic', '', ${sqlString(body)}, '', '', 'published', ${sqlString(owner)}, CURRENT_TIMESTAMP);
  `);
  check("synthetic article A seeded", insertArticle(articleA, USERS.a.id, "<h2>Heading</h2><p>Hello <strong>bold</strong> <em>italic</em></p>").status === 0);
  check("synthetic article B seeded", insertArticle(articleB, USERS.b.id, "<p>B body</p>").status === 0);

  const anonymous = await api(`/articles/${articleA}/nova`, { method: "POST", body: {} });
  check("anonymous convert is rejected with 401", anonymous.status === 401, `status ${anonymous.status}`);
  const memberConvert = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.member.token, body: {} });
  check("member without Contributor capability is refused", memberConvert.status === 403, `status ${memberConvert.status}`);
  const crossOrigin = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.a.token, origin: "https://evil.example", body: {} });
  check("Contributor cross-origin link is refused by the same-origin guard", crossOrigin.status === 403 || crossOrigin.status === 422, `status ${crossOrigin.status}`);

  const standaloneMember = await api("/nova/items", { token: USERS.a.token });
  check("Contributor (no Creator entitlement) is still refused on standalone /api/nova/items", standaloneMember.status === 403, `status ${standaloneMember.status}`);
  const standaloneAnon = await api("/nova/items");
  check("anonymous standalone /api/nova/items is refused", standaloneAnon.status === 401, `status ${standaloneAnon.status}`);

  // --------------------------------------------------- conversion refusals
  section("conversion refusals");
  const noPayload = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.a.token, body: {} });
  check("non-empty legacy article without a converted document returns 422 nova_conversion_required", noPayload.status === 422 && noPayload.data.code === "nova_conversion_required", `status ${noPayload.status} ${JSON.stringify(noPayload.data).slice(0, 160)}`);
  const emptyDoc = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.a.token, body: { content: { format: "nova-document", version: 1, doc: { type: "doc", content: [{ type: "paragraph" }] } } } });
  check("non-empty legacy article with an empty structured document returns 422 nova_conversion_empty", emptyDoc.status === 422 && emptyDoc.data.code === "nova_conversion_empty", `status ${emptyDoc.status} ${JSON.stringify(emptyDoc.data).slice(0, 160)}`);
  const linkedAfterRefusals = query(`SELECT nova_item_id FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  check("refused conversions leave article A unlinked", linkedAfterRefusals && linkedAfterRefusals.nova_item_id === null);

  // ------------------------------------------------------------ ownership
  section("ownership");
  const structured = {
    format: "nova-document",
    version: 1,
    doc: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Heading" }] },
        { type: "paragraph", content: [
          { type: "text", text: "Hello " },
          { type: "text", text: "bold", marks: [{ type: "bold" }] },
          { type: "text", text: " " },
          { type: "text", text: "italic", marks: [{ type: "italic" }] },
          { type: "text", text: " " },
          { type: "text", text: "link", marks: [{ type: "link", attrs: { href: "https://example.com/" } }] }
        ] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bullet one" }] }] }] },
        { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Ordered one" }] }] }] },
        { type: "table", content: [{ type: "tableRow", content: [
          { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Cell head" }] }] },
          { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Cell body" }] }] }
        ] }] }
      ]
    }
  };
  const convertA = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.a.token, body: { content: structured } });
  check("owner A converts article A (201)", convertA.status === 201 && typeof convertA.data.novaItemId === "string", `status ${convertA.status}`);
  const itemA = convertA.data.novaItemId;

  const bRead = await api(`/articles/${articleA}/nova/item`, { token: USERS.b.token });
  check("User B cannot read A's Nova document", bRead.status === 403 && !JSON.stringify(bRead.data).includes("Heading"), `status ${bRead.status}`);
  const bUpdate = await api(`/articles/${articleA}/nova/item`, { method: "PUT", token: USERS.b.token, body: { expectedVersion: 1, content: structured } });
  check("User B cannot update A's Nova document", bUpdate.status === 403, `status ${bUpdate.status}`);
  const bConvert = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.b.token, body: { content: structured } });
  check("User B cannot convert or relink article A", bConvert.status === 403, `status ${bConvert.status}`);

  const foreignItemId = id("nova004r5-foreign-item");
  check("seeded a foreign Nova item owned by User B", executeSql(`INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version, status) VALUES (${sqlString(foreignItemId)}, ${sqlString(USERS.b.id)}, 'nova-document', 'Foreign', '{"format":"nova-document","version":1,"doc":{"type":"doc","content":[]}}', 60, 1, 'active');`).status === 0);
  const crossLink = await api(`/articles/${articleB}/nova`, { method: "POST", token: USERS.a.token, body: { novaItemId: foreignItemId, content: structured } });
  check("A cannot link B's foreign item to article B via a crafted novaItemId", crossLink.status === 403 && crossLink.data.novaItemId === undefined, `status ${crossLink.status}`);
  const articleBAfter = query(`SELECT nova_item_id, created_by FROM articles WHERE id = ${sqlString(articleB)};`)[0];
  check("article B remains unlinked and owned by B", articleBAfter.nova_item_id === null && articleBAfter.created_by === USERS.b.id);
  const foreignAfter = query(`SELECT owner_id, version FROM nova_items WHERE id = ${sqlString(foreignItemId)};`)[0];
  check("B's foreign Nova item is unchanged and still owned by B", foreignAfter.owner_id === USERS.b.id && foreignAfter.version === 1);
  const articleAAfter = query(`SELECT nova_item_id FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  check("article A still links to its own item after foreign attempts", articleAAfter.nova_item_id === itemA);

  // ------------------------------------------------------------ conversion
  section("conversion fidelity");
  const storedA = JSON.parse(query(`SELECT content_json FROM nova_items WHERE id = ${sqlString(itemA)};`)[0].content_json);
  const blocks = storedA.doc.content;
  const types = blocks.map(b => b.type);
  check("heading block persisted as structured JSON", blocks[0].type === "heading" && blocks[0].attrs?.level === 2);
  check("paragraph persisted as structured JSON", types.includes("paragraph"));
  const paragraph = blocks.find(b => b.type === "paragraph" && b.content?.some(t => t.marks));
  check("bold mark persisted on a text node", !!paragraph && paragraph.content.some(t => t.text === "bold" && t.marks?.some(m => m.type === "bold")));
  check("italic mark persisted on a text node", !!paragraph && paragraph.content.some(t => t.text === "italic" && t.marks?.some(m => m.type === "italic")));
  check("link mark persisted with href", !!paragraph && paragraph.content.some(t => t.marks?.some(m => m.type === "link" && m.attrs?.href === "https://example.com/")));
  check("bullet list persisted as a list node", types.includes("bulletList"));
  check("ordered list persisted as a list node", types.includes("orderedList"));
  check("table persisted as a table node with rows and cells", types.includes("table") && blocks.find(b => b.type === "table").content[0].type === "tableRow");

  const legacyA = query(`SELECT body_html, article_html, title, author, destination, article_type, href, status, created_by FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  check("conversion leaves legacy body_html and article_html unchanged", legacyA.body_html === "<h2>Heading</h2><p>Hello <strong>bold</strong> <em>italic</em></p>" && legacyA.article_html === "");
  check("conversion leaves legacy title, author, destination, article_type, href, status and created_by unchanged", legacyA.title === "Synthetic 004R5 article" && legacyA.author === "Synthetic" && legacyA.destination === "education" && legacyA.article_type === "Research Paper" && legacyA.href === `published-article.html?id=${articleA}` && legacyA.status === "published" && legacyA.created_by === USERS.a.id);

  // ------------------------------------------------------------ duplicate link
  section("duplicate link and blank article");
  const duplicate = await api(`/articles/${articleA}/nova`, { method: "POST", token: USERS.a.token, body: { content: structured }, headers: { Connection: "close" } });
  check("duplicate link returns the existing item without creating another", duplicate.status === 200 && duplicate.data.novaItemId === itemA, `status ${duplicate.status}`);
  const itemCount = query(`SELECT COUNT(*) AS n FROM nova_items WHERE owner_id = ${sqlString(USERS.a.id)};`)[0].n;
  check("exactly one Nova item exists for owner A after the duplicate call", itemCount === 1, `count ${itemCount}`);

  const blankArticle = id("nova004r5-article-blank");
  check("seeded an intentionally blank article", executeSql(`INSERT INTO articles (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by, updated_at) VALUES (${sqlString(blankArticle)}, 'education', '', 'Untitled Content', '', 'Research Paper', '', '', '', '', '', 'draft', ${sqlString(USERS.a.id)}, CURRENT_TIMESTAMP);`).status === 0);
  const blankEmpty = { format: "nova-document", version: 1, doc: { type: "doc", content: [{ type: "paragraph" }] } };
  const blank = await api(`/articles/${blankArticle}/nova`, { method: "POST", token: USERS.a.token, body: { content: blankEmpty } });
  check("new intentionally blank article links with a blank Nova document", blank.status === 201 && typeof blank.data.novaItemId === "string", `status ${blank.status}`);
  const blankItemId = blank.data.novaItemId;
  const blankSave = await api(`/articles/${blankArticle}/nova/item`, { method: "PUT", token: USERS.a.token, body: { expectedVersion: 1, content: structured } });
  check("blank article's Nova document can later autosave content", blankSave.status === 200 && blankSave.data.item?.version === 2, `status ${blankSave.status} ${JSON.stringify(blankSave.data).slice(0, 160)}`);

  // ------------------------------------------------------------ version conflict
  section("expectedVersion conflict");
  const newer = { ...structured, doc: { ...structured.doc, content: [...structured.doc.content, { type: "paragraph", content: [{ type: "text", text: "Editor A newer text" }] }] } };
  const editorA = await api(`/articles/${articleA}/nova/item`, { method: "PUT", token: USERS.a.token, body: { expectedVersion: 1, content: newer } });
  check("editor A saves at version 1 and advances to version 2", editorA.status === 200 && editorA.data.item?.version === 2, `status ${editorA.status}`);
  const stale = { ...structured, doc: { ...structured.doc, content: [{ type: "paragraph", content: [{ type: "text", text: "Editor B stale text" }] }] } };
  const editorB = await api(`/articles/${articleA}/nova/item`, { method: "PUT", token: USERS.a.token, body: { expectedVersion: 1, content: stale } });
  check("editor B's stale save returns 409 and is not written", editorB.status === 409, `status ${editorB.status}`);
  const afterConflict = JSON.parse(query(`SELECT content_json, version FROM nova_items WHERE id = ${sqlString(itemA)};`)[0].content_json);
  const conflictVersion = query(`SELECT version FROM nova_items WHERE id = ${sqlString(itemA)};`)[0].version;
  check("newer server version is preserved after the stale save", conflictVersion === 2 && JSON.stringify(afterConflict).includes("Editor A newer text") && !JSON.stringify(afterConflict).includes("Editor B stale text"));

  // ------------------------------------------------------------ revisions
  section("revisions");
  const studioItem = await api("/nova/items", { method: "POST", token: USERS.studio.token, body: { title: "Synthetic 004R5 studio item", type: "nova-document", content: structured } });
  check("Studio-entitled owner creates a standalone Nova item", studioItem.status === 201 || studioItem.status === 200, `status ${studioItem.status}`);
  const sItemId = studioItem.data.item?.id ?? studioItem.data.id;
  const sSave = await api(`/nova/items/${sItemId}`, { method: "PUT", token: USERS.studio.token, body: { expectedVersion: 1, content: newer } });
  check("Studio owner saves the item to create a revision", sSave.status === 200, `status ${sSave.status}`);
  const revisions = await api(`/nova/items/${sItemId}/revisions`, { token: USERS.studio.token });
  check("revision history is recorded in nova_revisions", revisions.status === 200 && (revisions.data.revisions?.length ?? revisions.data.items?.length ?? 0) >= 1, `status ${revisions.status}`);
  const revRows = query(`SELECT COUNT(*) AS n FROM nova_revisions WHERE item_id = ${sqlString(sItemId)};`)[0].n;
  check("revisions live in nova_revisions, not admin_audit_logs", revRows >= 1);
  const legacyBeforeRestore = query(`SELECT title, author, destination, article_type, href, status, created_by FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  const revList = revisions.data.revisions ?? revisions.data.items ?? [];
  const revId = revList[0]?.id;
  const restore = await api(`/nova/items/${sItemId}/revisions/${revId}/restore`, { method: "POST", token: USERS.studio.token, body: { expectedVersion: 2 } });
  check("restore creates a new current version", restore.status === 200 && (restore.data.item?.version ?? restore.data.version) === 3, `status ${restore.status}`);
  const legacyAfterRestore = query(`SELECT title, author, destination, article_type, href, status, created_by FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  check("restore leaves article metadata unchanged", JSON.stringify(legacyBeforeRestore) === JSON.stringify(legacyAfterRestore));

  // ------------------------------------------------------------ archive / trash separation
  section("archive, trash and article delete");
  const archive = await api(`/nova/items/${sItemId}/archive`, { method: "POST", token: USERS.studio.token, body: { expectedVersion: 3 } });
  check("archiving the Nova item succeeds", archive.status === 200, `status ${archive.status}`);
  const articleAfterArchive = query(`SELECT status, nova_item_id FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  check("archiving the Nova item does not change article status", articleAfterArchive.status === legacyAfterRestore.status);
  const trash = await api(`/nova/items/${sItemId}/trash`, { method: "POST", token: USERS.studio.token, body: { expectedVersion: 4 } });
  check("trashing the Nova item succeeds", trash.status === 200, `status ${trash.status}`);
  const articleAfterTrash = query(`SELECT status, nova_item_id FROM articles WHERE id = ${sqlString(articleA)};`)[0];
  check("trashing the Nova item keeps the article and its publication status", articleAfterTrash.status === legacyAfterRestore.status && articleAfterTrash.nova_item_id === itemA);
  const del = await api(`/articles/${articleA}`, { method: "DELETE", token: USERS.a.token });
  check("deleting the article succeeds", del.status === 200 || del.status === 204, `status ${del.status}`);
  const itemAfterDelete = query(`SELECT COUNT(*) AS n FROM nova_items WHERE id = ${sqlString(itemA)};`)[0].n;
  check("article delete does not permanently delete the Nova item", itemAfterDelete === 1);

  // ------------------------------------------- genuinely linked lifecycle
  // The `studio` synthetic user has role admin, which legacyRoleCapabilities maps
  // to BOTH CREATOR and CONTRIBUTOR. It passes the real Contributor gate on article
  // routes and the real Studio gate on standalone /nova routes.
  section("linked item lifecycle (dual-entitled owner)");
  const articleL = id("nova004r5-article-linked");
  check("linked-lifecycle article seeded", insertArticle(articleL, USERS.studio.id, "<h2>Linked</h2><p>Linked body</p>").status === 0);
  const articleLBefore = query(`SELECT status, destination, href, body_html, article_html, nova_item_id FROM articles WHERE id = ${sqlString(articleL)};`)[0];
  const linkedConvert = await api(`/articles/${articleL}/nova`, { method: "POST", token: USERS.studio.token, body: { content: { format: "nova-document", version: 1, doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Linked body" }] }] } } } });
  check("dual-entitled owner links the article to a Nova item", linkedConvert.status === 201 || linkedConvert.status === 200, `status ${linkedConvert.status}`);
  const itemL = linkedConvert.data && linkedConvert.data.novaItemId;
  const linkedRow = query(`SELECT nova_item_id FROM articles WHERE id = ${sqlString(articleL)};`)[0];
  check("articles.nova_item_id equals the linked item", !!itemL && linkedRow.nova_item_id === itemL);

  const lRead = await api(`/nova/items/${itemL}`, { token: USERS.studio.token });
  const lVersion = lRead.data && lRead.data.item ? lRead.data.item.version : null;
  const lArchiveRes = await api(`/nova/items/${itemL}/archive`, { method: "POST", token: USERS.studio.token, body: { expectedVersion: lVersion } });
  check("linked item archives through the normal Nova Core route", lArchiveRes.status === 200, `status ${lArchiveRes.status}`);
  const afterLArchive = query(`SELECT status, destination, href, body_html, article_html, nova_item_id FROM articles WHERE id = ${sqlString(articleL)};`)[0];
  check("archiving the linked item leaves article status, destination, href and bodies unchanged",
    afterLArchive.status === articleLBefore.status && afterLArchive.destination === articleLBefore.destination && afterLArchive.href === articleLBefore.href && afterLArchive.body_html === articleLBefore.body_html && afterLArchive.article_html === articleLBefore.article_html);
  check("archiving the linked item keeps the link to the same item", afterLArchive.nova_item_id === itemL);

  const lTrash = await api(`/nova/items/${itemL}/trash`, { method: "POST", token: USERS.studio.token, body: { expectedVersion: lVersion + 1 } });
  check("linked item moves to trash", lTrash.status === 200, `status ${lTrash.status}`);
  const afterLTrash = query(`SELECT status, nova_item_id FROM articles WHERE id = ${sqlString(articleL)};`)[0];
  check("trashing the linked item keeps the article present, status unchanged and link not reassigned", afterLTrash.status === articleLBefore.status && afterLTrash.nova_item_id === itemL);
  const lReadTrash = await api(`/nova/items/${itemL}`, { token: USERS.studio.token });
  check("a linked item in trash is still readable so the editor can recover it", lReadTrash.status === 200, `status ${lReadTrash.status}`);

  const lRestore = await api(`/nova/items/${itemL}/restore`, { method: "POST", token: USERS.studio.token, body: { expectedVersion: lVersion + 2 } });
  check("linked item restores", lRestore.status === 200, `status ${lRestore.status}`);
  const lLoad = await api(`/articles/${articleL}/nova/item`, { token: USERS.studio.token });
  check("restored linked item loads through the article route with the same id", lLoad.status === 200 && lLoad.data && lLoad.data.item && lLoad.data.item.id === itemL, `status ${lLoad.status}`);
  const afterLRestore = query(`SELECT status, destination, href, body_html, article_html, nova_item_id FROM articles WHERE id = ${sqlString(articleL)};`)[0];
  check("restoring the linked item leaves article metadata and bodies untouched", afterLRestore.status === articleLBefore.status && afterLRestore.destination === articleLBefore.destination && afterLRestore.href === articleLBefore.href && afterLRestore.body_html === articleLBefore.body_html && afterLRestore.article_html === articleLBefore.article_html && afterLRestore.nova_item_id === itemL);

  const lDel = await api(`/articles/${articleL}`, { method: "DELETE", token: USERS.studio.token });
  check("deleting the linked article succeeds", lDel.status === 200 || lDel.status === 204, `status ${lDel.status}`);
  const lItemAfterDelete = query(`SELECT COUNT(*) AS n FROM nova_items WHERE id = ${sqlString(itemL)};`)[0].n;
  check("deleting the linked article keeps its Nova item", lItemAfterDelete === 1);
}

run()
  .catch(error => {
    failures.push(`fatal: ${error.message}`);
    console.log(`  FAIL fatal — ${error.message}`);
  })
  .finally(() => {
    console.log(`\nTPI-NOVA-004R5 persistence: ${passed} passed, ${failures.length} failed`);
    if (failures.length) console.log(failures.map(f => `  - ${f}`).join("\n"));
    if (failures.length) {
      try { console.log(`worker log tail:\n${readFileSync(logPath, "utf8").split("\n").slice(-25).join("\n").slice(-3000)}`); } catch {}
    }
    try { rmSync(root, { recursive: true, force: true }); } catch {}
    process.exitCode = failures.length ? 1 : 0;
  });

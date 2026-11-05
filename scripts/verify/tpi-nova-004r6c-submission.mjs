// TPI-NOVA-004R6C verifier: Contributor submission, withdrawal, locking and resubmission.
// Runs the real Worker router (functions/api/[[path]].js) and the real Nova lock
// against a throwaway in-memory SQLite database that has the real 0061 migration
// applied. No shared local D1 state is touched and no real article is used.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import { onRequest } from "../../functions/api/[[path]].js";
import { updateNovaItemForOwner } from "../../lib/nova.js";
import { CAPABILITY, legacyRoleCapabilities } from "../../lib/membership-entitlements.js";
import { validateTransition, isNovaLocked } from "../../lib/editorial-workflow.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let passed = 0;
let failed = 0;
const pending = [];
function check(name, fn) {
  pending.push(
    Promise.resolve()
      .then(fn)
      .then(() => { passed += 1; console.log(`PASS ${name}`); })
      .catch(error => { failed += 1; console.log(`FAIL ${name}: ${error.message}`); })
  );
}

// ---- Throwaway database ----
const sqlite = new DatabaseSync(":memory:");
sqlite.exec(`
  CREATE TABLE contributors (id TEXT PRIMARY KEY, username TEXT, role TEXT, active INTEGER DEFAULT 1, notification_prefs TEXT NOT NULL DEFAULT '{}');
  CREATE TABLE sessions (token TEXT PRIMARY KEY, contributor_id TEXT, expires_at TEXT);
  CREATE TABLE member_notifications (
    id TEXT PRIMARY KEY, contributor_id TEXT, title TEXT, body TEXT, action_href TEXT, type TEXT, created_by TEXT,
    read_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE nova_items (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'nova-document',
    title TEXT NOT NULL DEFAULT 'Untitled', collection_id TEXT, trash_collection_id TEXT,
    format_version INTEGER NOT NULL DEFAULT 1, template_key TEXT, source_kind TEXT, source_ref TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1, deleted_at TEXT, content_json TEXT NOT NULL DEFAULT '{}',
    content_bytes INTEGER NOT NULL DEFAULT 16
  );
  CREATE TABLE articles (
    id TEXT PRIMARY KEY, created_by TEXT, status TEXT NOT NULL DEFAULT 'draft',
    destination TEXT NOT NULL DEFAULT 'education', article_type TEXT DEFAULT 'Research Paper',
    nova_item_id TEXT, title TEXT DEFAULT '', body_html TEXT DEFAULT '', article_html TEXT DEFAULT '',
    href TEXT DEFAULT '', subtitle TEXT DEFAULT '', author TEXT DEFAULT '', source TEXT DEFAULT '',
    labels TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT
  );
`);
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0061_article_editorial_workflow.sql"), "utf8"));

// Minimal D1 surface over node:sqlite, matching prepare().bind().first/all/run and batch().
function d1() {
  return {
    prepare(sql) {
      const stmt = {
        _sql: sql,
        _params: [],
        bind(...values) { stmt._params = values; return stmt; },
        async first() { return sqlite.prepare(sql).get(...stmt._params) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...stmt._params) }; },
        async run() { const r = sqlite.prepare(sql).run(...stmt._params); return { meta: { changes: Number(r.changes) } }; },
      };
      return stmt;
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) {
          out.push(sqlite.prepare(s._sql).run(...s._params));
        }
        sqlite.exec("COMMIT");
        return out;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
const env = { TPI_DB: d1() };

// ---- Synthetic actors and sessions ----
const OWNER = "contrib-a";
const OTHER = "contrib-b";
const REVIEWER_ID = "reviewer-r";
sqlite.exec(`
  INSERT INTO contributors (id, username, role) VALUES ('${OWNER}', 'alice', 'contributor');
  INSERT INTO contributors (id, username, role) VALUES ('${OTHER}', 'bob', 'contributor');
  INSERT INTO contributors (id, username, role) VALUES ('${REVIEWER_ID}', 'rev', 'contributor');
  INSERT INTO sessions VALUES ('tok-a', '${OWNER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-b', '${OTHER}', '2099-01-01T00:00:00Z');
`);

function req(method, path, token, payload) {
  const headers = new Headers();
  if (token) headers.set("cookie", `tpi_session=${token}`);
  headers.set("origin", "http://127.0.0.1:8787");
  headers.set("content-type", "application/json");
  const body = method === "GET" ? undefined : JSON.stringify(payload ?? {});
  return new Request(`http://127.0.0.1:8787/api${path}`, { method, headers, body });
}
async function call(method, path, token, payload) {
  const routePath = path.replace(/^\//, "").split("/");
  const res = await onRequest({ request: req(method, path, token, payload), env, params: { path: routePath } });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

// Synthetic records: one owned Nova item and one legacy article for OWNER.
let counter = 0;
function seedArticle({ editorial = "legacy", status = "draft", novaVersion = 1, destination = "education", novaItemId = null, ownerId = OWNER } = {}) {
  counter += 1;
  const articleId = `art-${counter}`;
  const itemId = novaItemId || `nova-${counter}`;
  sqlite.prepare("INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version) VALUES (?, ?, 'nova-document', 'Synthetic', '{\"type\":\"doc\"}', 16, ?)").run(itemId, ownerId, novaVersion);
  sqlite.prepare("INSERT INTO articles (id, created_by, status, destination, nova_item_id) VALUES (?, ?, ?, ?, ?)").run(articleId, OWNER, status, destination, itemId);
  if (editorial !== "legacy") {
    sqlite.prepare("UPDATE articles SET editorial_status = ? WHERE id = ?").run(editorial, articleId);
  }
  return { articleId, itemId };
}
const submissionsFor = id => sqlite.prepare("SELECT * FROM article_editorial_submissions WHERE article_id = ? ORDER BY created_at, id").all(id);
const eventsFor = id => sqlite.prepare("SELECT event_type, from_state, to_state FROM article_editorial_events WHERE article_id = ? ORDER BY rowid").all(id);
const stateOf = id => sqlite.prepare("SELECT editorial_status, status FROM articles WHERE id = ?").get(id);

// Real Nova writes: the owner's update path, used for lock tests.
async function novaWrite(itemId, ownerId = OWNER) {
  const user = sqlite.prepare("SELECT id, username, role FROM contributors WHERE id = ?").get(ownerId);
  const nova = sqlite.prepare("SELECT version FROM nova_items WHERE id = ?").get(itemId);
  const res = await updateNovaItemForOwner(env, user, itemId, { expectedVersion: nova.version, title: "Synthetic" });
  const body = await res.json();
  return { status: res.status, code: body.code, ok: res.status < 400 };
}

// ---- Tests ----
check("pure: validateTransition refuses reviewer start from submitted by a contributor", () => {
  const r = validateTransition({ from: "submitted", to: "in_review", actorId: "x", capabilities: ["contributor"], isOwner: true });
  assert.equal(r.ok, false);
});
check("pure: isNovaLocked covers submitted, in_review, approved only", () => {
  assert.equal(isNovaLocked("submitted"), true);
  assert.equal(isNovaLocked("in_review"), true);
  assert.equal(isNovaLocked("approved"), true);
  assert.equal(isNovaLocked("draft"), false);
  assert.equal(isNovaLocked("changes_requested"), false);
  assert.equal(isNovaLocked("legacy"), false);
});
check("admin role grants no editorial review capability", () => {
  assert.equal(legacyRoleCapabilities("admin").includes(CAPABILITY.EDITORIAL_REVIEW), false);
});

check("legacy submit enrolls and submits with two events", async () => {
  const { articleId } = seedArticle();
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a");
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.equal(stateOf(articleId).editorial_status, "submitted");
  assert.deepEqual(eventsFor(articleId).map(e => e.event_type), ["entered_workflow", "submitted"]);
  assert.equal(submissionsFor(articleId).length, 1);
});
check("draft submit creates one round with server-pinned Nova version", async () => {
  const { articleId } = seedArticle({ editorial: "draft", novaVersion: 7 });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a");
  assert.equal(res.status, 201);
  const [round] = submissionsFor(articleId);
  assert.equal(round.submitted_nova_version, 7);
  assert.equal(round.outcome, "open");
  assert.equal(round.submitted_destination, "education");
});
check("stale client-supplied version is ignored; server version used", async () => {
  const { articleId } = seedArticle({ editorial: "draft", novaVersion: 3 });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a", { submittedNovaVersion: 99, version: 99 });
  assert.equal(res.status, 201);
  assert.equal(submissionsFor(articleId)[0].submitted_nova_version, 3);
});
check("submit refused from illegal state (submitted)", async () => {
  const { articleId } = seedArticle({ editorial: "submitted" });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a");
  assert.equal(res.status, 409);
});
check("foreign Nova ownership refused on submit", async () => {
  sqlite.exec("INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version) VALUES ('foreign-nova', 'someone-else', 'nova-document', 'Foreign', '{\"type\":\"doc\"}', 16, 1)");
  const articleId = "art-foreign";
  sqlite.prepare("INSERT INTO articles (id, created_by, status, destination, nova_item_id) VALUES (?, ?, 'draft', 'education', 'foreign-nova')").run(articleId, OWNER);
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a");
  assert.equal(res.status, 404);
  assert.equal(submissionsFor(articleId).length, 0);
});
check("cross-owner submit refused and leaves no trace", async () => {
  const { articleId } = seedArticle({ editorial: "draft" });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-b");
  assert.equal(res.status, 403);
  assert.equal(stateOf(articleId).editorial_status, "draft");
  assert.equal(submissionsFor(articleId).length, 0);
});
check("cross-owner withdraw refused", async () => {
  const { articleId } = seedArticle({ editorial: "draft" });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  const res = await call("POST", `/articles/${articleId}/submission/withdraw`, "tok-b");
  assert.equal(res.status, 403);
  assert.equal(stateOf(articleId).editorial_status, "submitted");
});
check("submitted withdrawal returns to draft, keeps round and events", async () => {
  const { articleId } = seedArticle({ editorial: "draft" });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  const res = await call("POST", `/articles/${articleId}/submission/withdraw`, "tok-a");
  assert.equal(res.status, 200);
  assert.equal(stateOf(articleId).editorial_status, "draft");
  assert.equal(submissionsFor(articleId)[0].outcome, "withdrawn");
  assert.deepEqual(eventsFor(articleId).map(e => e.event_type), ["submitted", "withdrawn"]);
});
check("withdrawal after review started is refused", async () => {
  const { articleId } = seedArticle({ editorial: "draft" });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  sqlite.prepare("UPDATE articles SET editorial_status = 'in_review' WHERE id = ?").run(articleId);
  const res = await call("POST", `/articles/${articleId}/submission/withdraw`, "tok-a");
  assert.equal(res.status, 409);
  assert.equal(stateOf(articleId).editorial_status, "in_review");
});
check("submitted lock: owner Nova write refused", async () => {
  const { articleId, itemId } = seedArticle({ editorial: "draft" });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  const r = await novaWrite(itemId);
  assert.equal(r.code, "nova_locked_for_review");
});
check("in_review lock: owner Nova write refused", async () => {
  const { articleId, itemId } = seedArticle({ editorial: "draft" });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  sqlite.prepare("UPDATE articles SET editorial_status = 'in_review' WHERE id = ?").run(articleId);
  const r = await novaWrite(itemId);
  assert.equal(r.code, "nova_locked_for_review");
});
check("approved lock: owner Nova write refused", async () => {
  const { articleId, itemId } = seedArticle({ editorial: "draft" });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  sqlite.prepare("UPDATE articles SET editorial_status = 'approved' WHERE id = ?").run(articleId);
  const r = await novaWrite(itemId);
  assert.equal(r.code, "nova_locked_for_review");
});
check("draft and changes_requested allow owner Nova write", async () => {
  const draft = seedArticle({ editorial: "draft" });
  const changes = seedArticle({ editorial: "changes_requested" });
  assert.equal((await novaWrite(draft.itemId)).ok, true);
  assert.equal((await novaWrite(changes.itemId)).ok, true);
});
check("cross-owner Nova write refused", async () => {
  const { itemId } = seedArticle({ editorial: "draft" });
  const r = await novaWrite(itemId, OTHER);
  assert.equal(r.status, 404);
});
check("enrolled article refuses direct publish through article write", async () => {
  const { articleId } = seedArticle({ editorial: "draft" });
  const res = await call("POST", "/articles", "tok-a", { id: articleId, status: "published", title: "Synthetic Title", destination: "education" });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  assert.equal(stateOf(articleId).status, "draft");
});
check("legacy article direct publish preserved", async () => {
  const { articleId } = seedArticle({ editorial: "legacy" });
  const res = await call("POST", "/articles", "tok-a", { id: articleId, status: "published", title: "Synthetic Title", destination: "education" });
  assert.equal(res.status, 200);
  assert.equal(stateOf(articleId).status, "published");
});
check("submitted revision of a published article keeps it published", async () => {
  const { articleId } = seedArticle({ editorial: "draft", status: "published" });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a");
  assert.equal(res.status, 201);
  assert.equal(stateOf(articleId).status, "published");
});
check("resubmission from changes_requested keeps prior round and pins new version", async () => {
  const { articleId, itemId } = seedArticle({ editorial: "draft", novaVersion: 2 });
  await call("POST", `/articles/${articleId}/submission`, "tok-a");
  sqlite.prepare("UPDATE articles SET editorial_status = 'in_review' WHERE id = ?").run(articleId);
  sqlite.prepare("UPDATE article_editorial_submissions SET review_started_at = CURRENT_TIMESTAMP WHERE article_id = ?").run(articleId);
  sqlite.prepare("UPDATE articles SET editorial_status = 'changes_requested' WHERE id = ?").run(articleId);
  sqlite.prepare("UPDATE article_editorial_submissions SET outcome = 'open' WHERE article_id = ?").run(articleId);
  sqlite.prepare("UPDATE nova_items SET version = 5 WHERE id = ?").run(itemId);
  const res = await call("POST", `/articles/${articleId}/submission/resubmit`, "tok-a");
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const rounds = submissionsFor(articleId);
  assert.equal(rounds.length, 2);
  assert.equal(rounds[0].outcome, "superseded");
  assert.equal(rounds[1].submitted_nova_version, 5);
  assert.equal(stateOf(articleId).editorial_status, "submitted");
});
check("resubmit refused unless changes_requested", async () => {
  const { articleId } = seedArticle({ editorial: "draft" });
  const res = await call("POST", `/articles/${articleId}/submission/resubmit`, "tok-a");
  assert.equal(res.status, 409);
});
check("contributor cannot route itself to changes_requested", async () => {
  const r = validateTransition({ from: "in_review", to: "changes_requested", actorId: OWNER, capabilities: ["contributor"], isOwner: true, note: "x" });
  assert.equal(r.ok, false);
});

Promise.all(pending).then(() => {
  console.log(`\nTPI-NOVA-004R6C submission verifier: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});

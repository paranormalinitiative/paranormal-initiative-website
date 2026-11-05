// TPI-NOVA-004R6D verifier: Editorial Review Queue, reviewer actions, changes
// requested, feedback and approval.
//
// It runs the real Worker router (functions/api/[[path]].js), the real
// lib/editorial-workflow.js engine and the real Nova lock against a throwaway
// in-memory SQLite database with the real 0061 migration applied. No shared local
// D1 state is read or written, and no real article, account or Studio is used.
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
  CREATE TABLE contributors (id TEXT PRIMARY KEY, username TEXT, display_name TEXT NOT NULL DEFAULT '', role TEXT, active INTEGER DEFAULT 1, notification_prefs TEXT NOT NULL DEFAULT '{}');
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
  CREATE TABLE nova_revisions (
    id TEXT PRIMARY KEY, item_id TEXT NOT NULL, owner_id TEXT NOT NULL,
    revision_number INTEGER NOT NULL, title TEXT NOT NULL, format_version INTEGER NOT NULL,
    content_json TEXT NOT NULL, content_bytes INTEGER NOT NULL, restored_from_revision INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE articles (
    id TEXT PRIMARY KEY, created_by TEXT, status TEXT NOT NULL DEFAULT 'draft',
    destination TEXT NOT NULL DEFAULT 'education', article_type TEXT DEFAULT 'Research Paper',
    nova_item_id TEXT, title TEXT DEFAULT '', body_html TEXT DEFAULT '', article_html TEXT DEFAULT '',
    href TEXT DEFAULT '', subtitle TEXT DEFAULT '', author TEXT DEFAULT '', source TEXT DEFAULT '',
    labels TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT
  );
`);
// The capability ledger comes from the real migrations, so the verifier proves
// an EDITORIAL_REVIEW grant is actually storable and still cannot smuggle in an
// unknown capability.
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0058_founding_membership_entitlements.sql"), "utf8"));
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0062_editorial_capabilities.sql"), "utf8"));
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
          const result = sqlite.prepare(s._sql).run(...s._params);
          out.push({ meta: { changes: Number(result.changes) }, results: [] });
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

// ---- Synthetic actors ----
// Reviewer authority comes only from an active EDITORIAL_REVIEW entitlement row;
// no role or membership grants it. The ordinary admin deliberately has none.
const OWNER = "contrib-a";
const OTHER = "contrib-b";
const REVIEWER = "reviewer-r";
const REVIEWER2 = "reviewer-r2";
const PUBLISHER = "publisher-p";
const ADMIN = "admin-a";
const SELF_REVIEWER = "contrib-self";
sqlite.exec(`
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${OWNER}', 'alice', 'Alice Contributor', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${OTHER}', 'bob', 'Bob Contributor', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${REVIEWER}', 'rev', 'Rae Reviewer', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${REVIEWER2}', 'rev2', 'Robin Reviewer', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${PUBLISHER}', 'pub', 'Pat Publisher', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${ADMIN}', 'admin', 'Avery Admin', 'admin');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${SELF_REVIEWER}', 'selfrev', 'Sam Submitter', 'contributor');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-r', '${REVIEWER}', 'editorial_review', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-r2', '${REVIEWER2}', 'editorial_review', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-p', '${PUBLISHER}', 'editorial_publish', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-self', '${SELF_REVIEWER}', 'editorial_review', 'admin_grant', 'active');
  INSERT INTO sessions VALUES ('tok-a', '${OWNER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-b', '${OTHER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-rev', '${REVIEWER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-rev2', '${REVIEWER2}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-pub', '${PUBLISHER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-admin', '${ADMIN}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-self', '${SELF_REVIEWER}', '2099-01-01T00:00:00Z');
`);

// Query strings stay on the URL so handlers read them through the Request, the
// way the real Worker receives them; route matching only sees the pathname.
function splitPath(path) {
  const [pathname, search = ""] = path.split("?");
  return { pathname, search };
}
function req(method, path, token, payload) {
  const headers = new Headers();
  if (token) headers.set("cookie", `tpi_session=${token}`);
  headers.set("origin", "http://127.0.0.1:8787");
  headers.set("content-type", "application/json");
  const body = method === "GET" ? undefined : JSON.stringify(payload ?? {});
  return new Request(`http://127.0.0.1:8787/api${path}`, { method, headers, body });
}
async function call(method, path, token, payload) {
  const routePath = splitPath(path).pathname.replace(/^\//, "").split("/");
  const res = await onRequest({ request: req(method, path, token, payload), env, params: { path: routePath } });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

// ---- Synthetic content ----
function docText(marker) {
  return JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: marker }] }] });
}
let counter = 0;
function seedArticle({
  editorial = "legacy",
  status = "draft",
  novaVersion = 1,
  destination = "education",
  articleType = "Research Paper",
  title = null,
  ownerId = OWNER,
} = {}) {
  counter += 1;
  const articleId = `art-${counter}`;
  const itemId = `nova-${counter}`;
  const articleTitle = title || `Synthetic Article ${counter}`;
  sqlite.prepare("INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version) VALUES (?, ?, 'nova-document', ?, ?, 16, ?)")
    .run(itemId, ownerId, articleTitle, docText(`working-version-${novaVersion}`), novaVersion);
  sqlite.prepare("INSERT INTO articles (id, created_by, status, destination, article_type, nova_item_id, title, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(articleId, ownerId, status, destination, articleType, itemId, articleTitle, "Alice Contributor");
  if (editorial !== "legacy") {
    sqlite.prepare("UPDATE articles SET editorial_status = ? WHERE id = ?").run(editorial, articleId);
  }
  return { articleId, itemId, title: articleTitle };
}
function addRevision(itemId, ownerId, revisionNumber, marker) {
  sqlite.prepare("INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, format_version, content_json, content_bytes) VALUES (?, ?, ?, ?, 'Synthetic Article', 1, ?, 16)")
    .run(`${itemId}-rev-${revisionNumber}`, itemId, ownerId, revisionNumber, docText(marker));
}
const submissionsFor = id => sqlite.prepare("SELECT * FROM article_editorial_submissions WHERE article_id = ? ORDER BY created_at, rowid").all(id);
// TPI Video can never be enrolled through the API, so fixtures that prove the
// queue and detail exclude it seed the enrolled row directly.
function seedEnrolledVideo() {
  const seeded = seedArticle({ editorial: "submitted", articleType: "TPI Video", destination: "tpi-videos.html", title: "TPI Video Submission" });
  sqlite.prepare("INSERT INTO article_editorial_submissions (id, article_id, nova_item_id, submitted_by, submitted_at, submitted_nova_version, submitted_destination, submitted_article_type, outcome, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, 'tpi-videos.html', 'TPI Video', 'open', ?, ?)")
    .run(`sub-${seeded.articleId}`, seeded.articleId, seeded.itemId, OWNER, new Date().toISOString(), new Date().toISOString(), new Date().toISOString());
  return seeded;
}
const eventsFor = id => sqlite.prepare("SELECT event_type, note, visible_to_contributor, actor_id, nova_version FROM article_editorial_events WHERE article_id = ? ORDER BY rowid").all(id);
const stateOf = id => sqlite.prepare("SELECT editorial_status, status, destination, article_type FROM articles WHERE id = ?").get(id);

async function submitAs(token, articleId, opts) {
  const res = await call("POST", `/articles/${articleId}/submission`, token, opts);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res;
}
// A submitted round ready for review, owned by OWNER at `novaVersion`.
async function submittedArticle(opts = {}) {
  const seeded = seedArticle({ editorial: "draft", ...opts });
  await submitAs("tok-a", seeded.articleId);
  return seeded;
}
async function novaWrite(itemId, ownerId = OWNER) {
  const user = sqlite.prepare("SELECT id, username, role FROM contributors WHERE id = ?").get(ownerId);
  const nova = sqlite.prepare("SELECT version FROM nova_items WHERE id = ?").get(itemId);
  const res = await updateNovaItemForOwner(env, user, itemId, { expectedVersion: nova.version, title: "Synthetic Article" });
  const body = await res.json();
  return { status: res.status, code: body.code, ok: res.status < 400 };
}
const detailPath = id => `/editorial/submissions/${id}`;

// ---- §4 capability model ----
check("pure: ordinary admin role holds no editorial review capability", () => {
  assert.equal(legacyRoleCapabilities("admin").includes(CAPABILITY.EDITORIAL_REVIEW), false);
  assert.equal(legacyRoleCapabilities("owner").includes(CAPABILITY.EDITORIAL_REVIEW), false);
});
check("pure: contributor capability cannot drive a reviewer transition", () => {
  const r = validateTransition({ from: "submitted", to: "in_review", actorId: OWNER, capabilities: [CAPABILITY.CONTRIBUTOR], isOwner: true });
  assert.equal(r.ok, false);
  assert.equal(r.code, "editorial_review_required");
});
check("pure: approving is not an editorial-publish action and keeps approved locked", () => {
  const review = validateTransition({ from: "in_review", to: "approved", actorId: REVIEWER, capabilities: [CAPABILITY.EDITORIAL_REVIEW], submitterId: OWNER });
  assert.equal(review.ok, true);
  assert.equal(isNovaLocked("approved"), true);
});

// ---- §5/§23 queue read authority ----
check("editorial capability is granted only through the entitlement ledger", () => {
  const granted = sqlite.prepare("SELECT capability, source_type FROM member_entitlements WHERE contributor_id = ? AND capability = 'editorial_review' AND state = 'active'").all(REVIEWER);
  assert.equal(granted.length, 1);
  assert.equal(granted[0].source_type, "admin_grant");
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM member_entitlements WHERE contributor_id = ? AND capability LIKE 'editorial%'").get(ADMIN).n, 0);
  assert.throws(() => sqlite.prepare("INSERT INTO member_entitlements (id, contributor_id, capability, source_type, source_id) VALUES ('bad-grant', ?, 'superuser', 'admin_grant', 'x')").run(ADMIN), /CHECK/);
});

check("unauthenticated queue read is refused", async () => {
  const res = await call("GET", "/editorial/queue");
  assert.equal(res.status, 401);
});
check("Contributor cannot read the review queue", async () => {
  const res = await call("GET", "/editorial/queue", "tok-a");
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_review_required");
});
check("ordinary Admin without the capability cannot read the review queue", async () => {
  const res = await call("GET", "/editorial/queue", "tok-admin");
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_review_required");
});
check("EDITORIAL_PUBLISH alone does not grant review queue access", async () => {
  const res = await call("GET", "/editorial/queue", "tok-pub");
  assert.equal(res.status, 403);
});
check("reviewer can read the review queue", async () => {
  const res = await call("GET", "/editorial/queue", "tok-rev");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.submissions));
});

// ---- §5/§6/§29/§30 queue content ----
const queueIds = async (token = "tok-rev", filter = null) => {
  const res = await call("GET", `/editorial/queue${filter ? `?status=${filter}` : ""}`, token);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  return res.body.submissions;
};
check("queue includes a submitted article with review context", async () => {
  const { articleId } = await submittedArticle({ title: "Queue Context Article", novaVersion: 3 });
  const rows = await queueIds();
  const row = rows.find(item => item.articleId === articleId);
  assert.ok(row, "submitted article missing from the queue");
  assert.equal(row.title, "Queue Context Article");
  assert.equal(row.contributorName, "Alice Contributor");
  assert.equal(row.contributorUsername, "alice");
  assert.equal(row.articleType, "Research Paper");
  assert.equal(row.destination, "education");
  assert.equal(row.editorialStatus, "submitted");
  assert.equal(row.submittedNovaVersion, 3);
  assert.ok(row.submittedAt, "submittedAt missing");
  assert.equal(row.round, 1);
  assert.ok(row.submissionId, "submissionId missing");
});
check("queue includes an in_progress review", async () => {
  const { articleId } = await submittedArticle();
  const started = await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  assert.equal(started.status, 200, JSON.stringify(started.body));
  const rows = await queueIds();
  assert.equal(rows.find(item => item.articleId === articleId).editorialStatus, "in_review");
});
check("queue excludes legacy articles that were never enrolled", async () => {
  const { articleId } = seedArticle({ editorial: "legacy" });
  const rows = await queueIds();
  assert.equal(rows.some(item => item.articleId === articleId), false);
});
check("queue excludes TPI Video", async () => {
  const { articleId } = seedEnrolledVideo();
  const rows = await queueIds();
  assert.equal(rows.some(item => item.articleId === articleId), false);
});
check("queue excludes already-published rows from the active list", async () => {
  const { articleId } = await submittedArticle({ status: "published" });
  const rows = await queueIds();
  assert.equal(rows.some(item => item.articleId === articleId), false);
});
check("queue filters split changes_requested and approved out of the active list", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Please expand the methods section." });
  const active = await queueIds("tok-rev", "active");
  const changes = await queueIds("tok-rev", "changes_requested");
  assert.equal(active.some(item => item.articleId === articleId), false);
  assert.ok(changes.some(item => item.articleId === articleId));
  const bad = await call("GET", "/editorial/queue?status=nonsense", "tok-rev");
  assert.equal(bad.status, 400);
});

// ---- §7/§8/§9/§23 review detail ----
check("review detail renders the exact pinned submitted version, not the current one", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 2 });
  addRevision(itemId, OWNER, 1, "VERSION ONE BODY");
  addRevision(itemId, OWNER, 2, "VERSION TWO BODY");
  // The working document moved on after submission.
  sqlite.prepare("UPDATE nova_items SET version = 6, content_json = ? WHERE id = ?").run(docText("LATER WORKING BODY"), itemId);
  addRevision(itemId, OWNER, 6, "LATER WORKING BODY");
  const res = await call("GET", detailPath(articleId), "tok-rev");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.pinned.version, 2);
  assert.equal(res.body.pinned.unavailable, undefined);
  assert.match(JSON.stringify(res.body.pinned.content), /VERSION TWO BODY/);
  assert.doesNotMatch(JSON.stringify(res.body.pinned.content), /LATER WORKING BODY/);
  assert.equal(res.body.currentSubmission.submittedNovaVersion, 2);
  assert.equal(res.body.currentSubmission.round, 1);
  assert.equal(res.body.article.title.length > 0, true);
});
check("review detail fails closed when the pinned version cannot be resolved", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 4 });
  // No revision covers version 4 and the live item has moved past it, so the
  // pinned document cannot be reconstructed and the review fails closed.
  sqlite.prepare("UPDATE nova_items SET version = 9, content_json = ? WHERE id = ?").run(docText("LATER WORKING BODY"), itemId);
  const res = await call("GET", detailPath(articleId), "tok-rev");
  assert.equal(res.status, 200);
  assert.equal(res.body.pinned.unavailable, true);
  assert.equal(res.body.pinned.code, "submitted_version_unavailable");
  assert.equal(res.body.pinned.content, null);
});
check("TPI Video review detail is not applicable", async () => {
  const { articleId } = seedEnrolledVideo();
  const res = await call("GET", detailPath(articleId), "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_not_applicable");
});
check("Contributor cannot read private review detail", async () => {
  const { articleId } = await submittedArticle();
  const res = await call("GET", detailPath(articleId), "tok-a");
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_review_required");
});

// ---- §10/§11 start review and ownership ----
check("Start Review moves submitted to in_review and records the reviewer", async () => {
  const { articleId } = await submittedArticle();
  const res = await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.editorialStatus, "in_review");
  const [round] = submissionsFor(articleId);
  assert.equal(round.reviewer_id, REVIEWER);
  assert.ok(round.review_started_at);
  assert.equal(round.outcome, "open");
  const events = eventsFor(articleId);
  assert.equal(events.filter(e => e.event_type === "review_started").length, 1);
});
check("a second reviewer cannot silently take an owned review", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev2");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "review_owned_by_another_reviewer");
  assert.equal(submissionsFor(articleId)[0].reviewer_id, REVIEWER);
});
check("Start Review cannot be repeated on an already-open review by its owner", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(stateOf(articleId).editorial_status, "in_review");
});
check("Contributor withdrawal is refused once review has started", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/articles/${articleId}/submission/withdraw`, "tok-a");
  assert.equal(res.status, 409);
  assert.equal(stateOf(articleId).editorial_status, "in_review");
  assert.equal(submissionsFor(articleId)[0].outcome, "open");
});

// ---- §12/§13 request changes and feedback ----
check("Request Changes without a note is refused", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const empty = await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "   " });
  assert.equal(empty.status, 422);
  assert.equal(empty.body.code, "note_required");
  assert.equal(stateOf(articleId).editorial_status, "in_review");
});
check("Request Changes before review starts is refused", async () => {
  const { articleId } = await submittedArticle();
  const res = await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Too early." });
  assert.equal(res.status, 409);
  assert.equal(stateOf(articleId).editorial_status, "submitted");
});
check("Request Changes records the feedback on the submission round", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Add sources for the claim on page 2." });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.editorialStatus, "changes_requested");
  const [round] = submissionsFor(articleId);
  const feedback = eventsFor(articleId).find(e => e.event_type === "changes_requested");
  assert.equal(feedback.note, "Add sources for the claim on page 2.");
  assert.equal(feedback.visible_to_contributor, 1);
  assert.equal(feedback.actor_id, REVIEWER);
  // The note lives in the editorial workflow, never in the article body.
  assert.equal(sqlite.prepare("SELECT body_html, article_html FROM articles WHERE id = ?").get(articleId).body_html, "");
  assert.equal(round.reviewer_id, REVIEWER);
});
check("another reviewer cannot request changes on an owned review", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev2", { note: "Hijack attempt." });
  assert.equal(res.status, 409);
  assert.equal(stateOf(articleId).editorial_status, "in_review");
});

// ---- §14/§15 contributor visibility and editing ----
check("Contributor sees Changes Requested with the reviewer note and timestamp", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Please clarify the conclusion." });
  const list = await call("GET", "/contributors/me/articles", "tok-a");
  assert.equal(list.status, 200, JSON.stringify(list.body));
  const row = list.body.articles.find(item => item.id === articleId);
  assert.equal(row.editorialStatus, "changes_requested");
  assert.equal(row.reviewFeedback, "Please clarify the conclusion.");
  assert.ok(row.reviewFeedbackAt, "feedback timestamp missing");
  assert.equal(row.locked, false);
  // Reviewer identity is private; only the workflow state and note are exposed.
  assert.equal("reviewerName" in row, false);
  assert.equal("reviewerId" in row, false);
});
check("Contributor feedback is hidden outside changes_requested", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "First pass note." });
  // R6C resubmission has its own route; the plain submission route refuses while
  // a round is still open.
  const resubmitted = await call("POST", `/articles/${articleId}/submission/resubmit`, "tok-a");
  assert.equal(resubmitted.status, 201, JSON.stringify(resubmitted.body));
  const list = await call("GET", "/contributors/me/articles", "tok-a");
  const row = list.body.articles.find(item => item.id === articleId);
  assert.equal(row.editorialStatus, "submitted");
  assert.equal(row.reviewFeedback, null);
  // The historical note is retained, not deleted.
  assert.equal(eventsFor(articleId).some(e => e.note === "First pass note."), true);
});
check("Contributor editor is unlocked while changes are requested", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 2 });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Remove the duplicate section." });
  const write = await novaWrite(itemId);
  assert.equal(write.ok, true, JSON.stringify(write));
  assert.equal(write.code, undefined);
});

// ---- §16 resubmission rounds ----
check("resubmit keeps the prior round and its feedback, and pins the new version", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 2 });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Tighten the introduction." });
  await novaWrite(itemId);
  sqlite.prepare("UPDATE nova_items SET version = 5 WHERE id = ?").run(itemId);
  const res = await call("POST", `/articles/${articleId}/submission/resubmit`, "tok-a");
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.equal(res.body.editorialStatus, "submitted");
  const rounds = submissionsFor(articleId);
  assert.equal(rounds.length, 2);
  assert.equal(rounds[0].outcome, "superseded");
  assert.equal(rounds[0].submitted_nova_version, 2);
  assert.equal(rounds[1].outcome, "open");
  assert.equal(rounds[1].submitted_nova_version, 5);
  assert.equal(rounds[1].submitted_by, OWNER);
  const feedback = eventsFor(articleId).find(e => e.event_type === "changes_requested");
  assert.equal(feedback.note, "Tighten the introduction.");
});
check("the new round re-enters the queue at round 2 with the new pinned version", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 2 });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Round one note." });
  await novaWrite(itemId);
  sqlite.prepare("UPDATE nova_items SET version = 5 WHERE id = ?").run(itemId);
  const resubmitted = await call("POST", `/articles/${articleId}/submission/resubmit`, "tok-a");
  assert.equal(resubmitted.status, 201, JSON.stringify(resubmitted.body));
  const rows = await queueIds("tok-rev", "active");
  const row = rows.find(item => item.articleId === articleId);
  assert.ok(row, "resubmitted round missing from the queue");
  assert.equal(row.round, 2);
  assert.equal(row.submittedNovaVersion, 5);
  assert.equal(row.reviewerId, null);
  const detail = await call("GET", detailPath(articleId), "tok-rev");
  assert.equal(detail.body.history.length, 2);
  assert.equal(detail.body.history[0].feedback.length, 1);
  assert.equal(detail.body.history[0].feedback[0].note, "Round one note.");
});

// ---- §17/§18 approval ----
check("Approve completes the transaction and records the approver", async () => {
  const { articleId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.editorialStatus, "approved");
  const [round] = submissionsFor(articleId);
  assert.equal(round.approved_by, REVIEWER);
  assert.ok(round.approved_at);
  assert.equal(round.outcome, "open");
  const approvedEvent = eventsFor(articleId).find(e => e.event_type === "approved");
  assert.ok(approvedEvent, "approval event missing");
  assert.equal(approvedEvent.actor_id, REVIEWER);
});
check("approved_nova_version pins the reviewed version, not a later working version", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 4 });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const [round] = submissionsFor(articleId);
  assert.equal(round.submitted_nova_version, 4);
  assert.equal(round.approved_nova_version, 4);
  assert.equal(round.approved_nova_version, round.submitted_nova_version);
  // A later edit to the working document cannot move the approved version.
  sqlite.prepare("UPDATE nova_items SET version = 9 WHERE id = ?").run(itemId);
  assert.equal(submissionsFor(articleId)[0].approved_nova_version, 4);
});
check("approval never changes articles.status (no publication)", async () => {
  const draft = await submittedArticle({ status: "draft" });
  await call("POST", `/editorial/submissions/${draft.articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${draft.articleId}/approve`, "tok-rev");
  assert.equal(stateOf(draft.articleId).status, "draft");

  const published = await submittedArticle({ status: "published" });
  await call("POST", `/editorial/submissions/${published.articleId}/start-review`, "tok-rev");
  const res = await call("POST", `/editorial/submissions/${published.articleId}/approve`, "tok-rev");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(stateOf(published.articleId).status, "published");
  // The public listing still serves the published snapshot unchanged.
  const listing = await call("GET", `/articles?destination=education`, null);
  assert.equal(listing.status, 200);
  assert.ok(listing.body.articles.every(article => article.status === "published"));
});

// ---- §19 approved contributor state ----
check("approved Contributor document stays locked", async () => {
  const { articleId, itemId } = await submittedArticle();
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  const write = await novaWrite(itemId);
  assert.equal(write.code, "nova_locked_for_review");
  const withdraw = await call("POST", `/articles/${articleId}/submission/withdraw`, "tok-a");
  assert.equal(withdraw.status, 409);
  const resubmit = await call("POST", `/articles/${articleId}/submission/resubmit`, "tok-a");
  assert.equal(resubmit.status, 409);
  const list = await call("GET", "/contributors/me/articles", "tok-a");
  const row = list.body.articles.find(item => item.id === articleId);
  assert.equal(row.editorialStatus, "approved");
  assert.equal(row.locked, true);
  assert.equal(row.reviewFeedback, null);
});

// ---- §20/§21 self-approval and cross-account ----
check("a submitter holding EDITORIAL_REVIEW cannot approve their own submission", async () => {
  const seeded = seedArticle({ editorial: "draft", ownerId: SELF_REVIEWER });
  await submitAs("tok-self", seeded.articleId);
  const start = await call("POST", `/editorial/submissions/${seeded.articleId}/start-review`, "tok-self");
  assert.equal(start.status, 403);
  assert.equal(start.body.code, "self_review_refused");
  // Even after another reviewer starts it, the submitter cannot approve.
  sqlite.prepare("UPDATE article_editorial_submissions SET reviewer_id = ?, review_started_at = CURRENT_TIMESTAMP WHERE article_id = ?").run(REVIEWER, seeded.articleId);
  sqlite.prepare("UPDATE articles SET editorial_status = 'in_review' WHERE id = ?").run(seeded.articleId);
  const approve = await call("POST", `/editorial/submissions/${seeded.articleId}/approve`, "tok-self");
  assert.equal(approve.status, 403);
  assert.equal(approve.body.code, "self_review_refused");
  assert.equal(submissionsFor(seeded.articleId)[0].approved_by, null);
});
check("Contributor B cannot drive review actions on another contributor's article", async () => {
  const { articleId } = await submittedArticle();
  for (const action of ["start-review", "request-changes", "approve"]) {
    const res = await call("POST", `/editorial/submissions/${articleId}/${action}`, "tok-b", { note: "Forged note." });
    assert.equal(res.status, 403, `${action} should be refused`);
    assert.equal(res.body.code, "editorial_review_required");
  }
  assert.equal(stateOf(articleId).editorial_status, "submitted");
  assert.equal(submissionsFor(articleId)[0].reviewer_id, null);
  assert.equal(eventsFor(articleId).some(e => e.note === "Forged note."), false);
});
check("unauthenticated review mutations are refused", async () => {
  const { articleId } = await submittedArticle();
  for (const action of ["start-review", "request-changes", "approve"]) {
    const res = await call("POST", `/editorial/submissions/${articleId}/${action}`, null, { note: "anonymous" });
    assert.equal(res.status, 401, `${action} should require authentication`);
  }
  assert.equal(stateOf(articleId).editorial_status, "submitted");
});
check("ordinary Admin cannot review even though it can reach other admin APIs", async () => {
  const { articleId } = await submittedArticle();
  const start = await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-admin");
  assert.equal(start.status, 403);
  assert.equal(start.body.code, "editorial_review_required");
  const approve = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-admin");
  assert.equal(approve.status, 403);
});

// ---- §27/§28 approval integrity ----
check("approval is refused when reviewed metadata changed after submission", async () => {
  const { articleId } = await submittedArticle({ destination: "education" });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  sqlite.prepare("UPDATE articles SET destination = 'research' WHERE id = ?").run(articleId);
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "reviewed_metadata_changed");
  assert.deepEqual(res.body.fields, ["destination"]);
  assert.equal(stateOf(articleId).editorial_status, "in_review");
  assert.equal(submissionsFor(articleId)[0].approved_by, null);
});
check("approval is refused when the article type changed after submission", async () => {
  const { articleId } = await submittedArticle({ articleType: "Research Paper" });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  sqlite.prepare("UPDATE articles SET article_type = 'Field Report' WHERE id = ?").run(articleId);
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "reviewed_metadata_changed");
});
check("approval is refused when the Nova version drifted past the reviewed version", async () => {
  const { articleId, itemId } = await submittedArticle({ novaVersion: 4 });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  sqlite.prepare("UPDATE nova_items SET version = 5 WHERE id = ?").run(itemId);
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "stale_version");
  assert.equal(stateOf(articleId).editorial_status, "in_review");
  assert.equal(submissionsFor(articleId)[0].approved_nova_version, null);
});
check("approval is refused before review started", async () => {
  const { articleId } = await submittedArticle();
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(stateOf(articleId).editorial_status, "submitted");
});
check("approval is refused for an article without an open submission", async () => {
  const { articleId } = seedArticle({ editorial: "in_review" });
  const res = await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "no_open_submission");
});

// ---- §30 TPI Video ----
check("TPI Video enrollment continues to return editorial_workflow_not_applicable", async () => {
  const { articleId } = seedArticle({ editorial: "legacy", articleType: "TPI Video", destination: "tpi-videos.html" });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a");
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_not_applicable");
  assert.equal(stateOf(articleId).editorial_status, "legacy");
});

// ---- §23 no public exposure of unpublished submissions ----
check("public article listing never exposes unreviewed or approved drafts", async () => {
  const submitted = await submittedArticle({ title: "Not Public Yet" });
  const approved = await submittedArticle({ title: "Approved Not Published" });
  await call("POST", `/editorial/submissions/${approved.articleId}/start-review`, "tok-rev");
  await call("POST", `/editorial/submissions/${approved.articleId}/approve`, "tok-rev");
  const res = await call("GET", "/articles?destination=education", null);
  assert.equal(res.status, 200);
  const titles = res.body.articles.map(article => article.title);
  assert.equal(titles.includes(submitted.title), false);
  assert.equal(titles.includes(approved.title), false);
  assert.equal(stateOf(submitted.articleId).status, "draft");
  assert.equal(stateOf(approved.articleId).status, "draft");
});

Promise.all(pending).then(() => {
  console.log(`\nTPI-NOVA-004R6D review verifier: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});

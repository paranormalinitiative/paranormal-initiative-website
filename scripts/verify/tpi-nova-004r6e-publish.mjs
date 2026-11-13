// TPI-NOVA-004R6E verifier: authorized publication of an approved, pinned Nova
// version into the existing Education Center article snapshot.
//
// It runs the real Worker router (functions/api/[[path]].js), the real
// lib/editorial-workflow.js engine, the real lib/nova-document-html.js renderer
// and the real Nova pinning against a throwaway in-memory SQLite database with
// the real 0058/0061/0062 migrations applied. No shared local D1 state is read
// or written, and no real article, account or Studio is used.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import vm from "node:vm";
import { onRequest } from "../../functions/api/[[path]].js";
import { CAPABILITY, legacyRoleCapabilities } from "../../lib/membership-entitlements.js";
import { validatePublication, isNovaLocked, hasEditorialPublish } from "../../lib/editorial-workflow.js";
import { novaDocToHtml, buildPublicationSnapshot } from "../../lib/nova-document-html.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let passed = 0;
let failed = 0;
const queue = [];
// Checks run in declaration order so a state assertion can never observe another
// check's article. A failure is recorded and the suite continues.
function check(name, fn) {
  queue.push({ name, fn });
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
  CREATE TABLE admin_audit_logs (
    id TEXT PRIMARY KEY, actor_id TEXT, actor_username TEXT, actor_role TEXT, action TEXT,
    target_type TEXT, target_id TEXT, metadata_json TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0058_founding_membership_entitlements.sql"), "utf8"));
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0062_editorial_capabilities.sql"), "utf8"));
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0061_article_editorial_workflow.sql"), "utf8"));
sqlite.exec(readFileSync(resolve(repoRoot, "migrations/0064_article_publication_metadata.sql"), "utf8"));

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
// Publication authority comes only from an active editorial_publish entitlement.
// The ordinary admin, a reviewer and a contributor deliberately hold none.
const OWNER = "contrib-a";
const OTHER = "contrib-b";
const REVIEWER = "reviewer-r";
const REVIEWER2 = "reviewer-r2";
const PUBLISHER = "publisher-p";
const PUBLISHER2 = "publisher-p2";
const ADMIN = "admin-a";
const SELF = "contrib-self-publisher";
sqlite.exec(`
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${OWNER}', 'alice', 'Alice Contributor', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${OTHER}', 'bob', 'Bob Contributor', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${REVIEWER}', 'rev', 'Rae Reviewer', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${REVIEWER2}', 'rev2', 'Robin Reviewer', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${PUBLISHER}', 'pub', 'Pat Publisher', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${PUBLISHER2}', 'pub2', 'Parker Publisher', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${ADMIN}', 'admin', 'Avery Admin', 'admin');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${SELF}', 'selfpub', 'Sam Submitter', 'contributor');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-r', '${REVIEWER}', 'editorial_review', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-r2', '${REVIEWER2}', 'editorial_review', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-p', '${PUBLISHER}', 'editorial_publish', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-p2', '${PUBLISHER2}', 'editorial_publish', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-self-pub', '${SELF}', 'editorial_publish', 'admin_grant', 'active');
  INSERT INTO sessions VALUES ('tok-a', '${OWNER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-b', '${OTHER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-rev', '${REVIEWER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-rev2', '${REVIEWER2}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-pub', '${PUBLISHER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-pub2', '${PUBLISHER2}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-admin', '${ADMIN}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-self', '${SELF}', '2099-01-01T00:00:00Z');
`);

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
  href = null,
  bodyHtml = "",
  contentJson = null,
} = {}) {
  counter += 1;
  const articleId = `art-${counter}`;
  const itemId = `nova-${counter}`;
  const articleTitle = title || `Synthetic Article ${counter}`;
  sqlite.prepare("INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version) VALUES (?, ?, 'nova-document', ?, ?, 16, ?)")
    .run(itemId, ownerId, articleTitle, contentJson || docText(`working-version-${novaVersion}`), novaVersion);
  sqlite.prepare("INSERT INTO articles (id, created_by, status, destination, article_type, nova_item_id, title, author, href, body_html) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(articleId, ownerId, status, destination, articleType, itemId, articleTitle, "Alice Contributor", href || `published-article.html?id=${articleId}`, bodyHtml);
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
const eventsFor = id => sqlite.prepare("SELECT event_type, note, visible_to_contributor, actor_id, nova_version FROM article_editorial_events WHERE article_id = ? ORDER BY rowid").all(id);
const articleOf = id => sqlite.prepare("SELECT * FROM articles WHERE id = ?").get(id);
const notificationsFor = title => sqlite.prepare("SELECT contributor_id, action_href, type FROM member_notifications WHERE title = ?").all(title);

async function submitAs(token, articleId) {
  const res = await call("POST", `/articles/${articleId}/submission`, token, {});
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res;
}
async function submittedArticle(opts = {}) {
  const seeded = seedArticle({ editorial: "draft", ...opts });
  await submitAs("tok-a", seeded.articleId);
  return seeded;
}
// A submitted round that a Reviewer has approved. This is the exact state the
// Publisher queue exposes.
async function approvedArticle(opts = {}) {
  const seeded = await submittedArticle(opts);
  const started = await call("POST", `/editorial/submissions/${seeded.articleId}/start-review`, "tok-rev");
  assert.equal(started.status, 200, JSON.stringify(started.body));
  const approved = await call("POST", `/editorial/submissions/${seeded.articleId}/approve`, "tok-rev");
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  return seeded;
}
const publishAs = (token, articleId, payload) => call("POST", `/editorial/articles/${articleId}/publish`, token, payload);
const detailOf = (token, articleId) => call("GET", `/editorial/articles/${articleId}/publication`, token);
const publicationsOf = token => call("GET", "/editorial/publications", token);

// ---- §3 authority model ----
check("pure: ordinary admin role holds no editorial publish capability", () => {
  assert.equal(legacyRoleCapabilities("admin").includes(CAPABILITY.EDITORIAL_PUBLISH), false);
  assert.equal(legacyRoleCapabilities("owner").includes(CAPABILITY.EDITORIAL_PUBLISH), false);
  assert.equal(hasEditorialPublish([CAPABILITY.CONTRIBUTOR, CAPABILITY.CREATOR, CAPABILITY.EDITORIAL_REVIEW]), false);
});
check("pure: publication primitive requires EDITORIAL_PUBLISH, not review or ownership", () => {
  const base = { actorId: PUBLISHER, submitterId: OWNER, editorialStatus: "approved", currentNovaVersion: 2, destination: "education", articleType: "Research Paper", submission: { outcome: "open", approved_nova_version: 2, submitted_destination: "education", submitted_article_type: "Research Paper" } };
  assert.equal(validatePublication({ ...base, capabilities: [CAPABILITY.CONTRIBUTOR, CAPABILITY.CREATOR] }).code, "editorial_publish_required");
  assert.equal(validatePublication({ ...base, capabilities: [CAPABILITY.EDITORIAL_REVIEW] }).code, "editorial_publish_required");
  assert.equal(validatePublication({ ...base, capabilities: [CAPABILITY.EDITORIAL_PUBLISH] }).ok, true);
});
check("pure: review and publish capabilities remain distinct grants", () => {
  const review = sqlite.prepare("SELECT capability FROM member_entitlements WHERE contributor_id = ? AND state = 'active'").all(REVIEWER).map(row => row.capability);
  const publish = sqlite.prepare("SELECT capability FROM member_entitlements WHERE contributor_id = ? AND state = 'active'").all(PUBLISHER).map(row => row.capability);
  assert.deepEqual(review, ["editorial_review"]);
  assert.deepEqual(publish, ["editorial_publish"]);
});

// ---- §5 Publisher queue read authority ----
check("unauthenticated publication queue read is refused", async () => {
  const res = await publicationsOf(null);
  assert.equal(res.status, 401);
});
check("Contributor cannot read the publication queue", async () => {
  const res = await publicationsOf("tok-a");
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
});
check("ordinary Admin without the capability cannot read the publication queue", async () => {
  const res = await publicationsOf("tok-admin");
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
});
check("Reviewer without Publisher cannot read the publication queue", async () => {
  const res = await publicationsOf("tok-rev");
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
});
check("Publisher reads the approved publication queue with the review context", async () => {
  const { articleId } = await approvedArticle({ title: "Publisher Queue Article", novaVersion: 3, destination: "education" });
  const res = await publicationsOf("tok-pub");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const row = res.body.submissions.find(item => item.articleId === articleId);
  assert.ok(row, "approved article missing from the publication queue");
  assert.equal(row.title, "Publisher Queue Article");
  assert.equal(row.contributorName, "Alice Contributor");
  assert.equal(row.contributorUsername, "alice");
  assert.equal(row.articleType, "Research Paper");
  assert.equal(row.destination, "education");
  assert.equal(row.editorialStatus, "approved");
  assert.equal(row.publicationStatus, "draft");
  assert.equal(row.round, 1);
  assert.equal(row.submittedNovaVersion, 3);
  assert.equal(row.approvedNovaVersion, 3);
  assert.equal(row.approvedBy, REVIEWER);
  assert.equal(row.approverName, "Rae Reviewer");
  assert.ok(row.approvedAt, "approvedAt missing");
  assert.ok(row.submissionId, "submissionId missing");
});
check("publication queue lists only approved rounds that carry an approved version", async () => {
  const submitted = await submittedArticle({ title: "Not Yet Approved Article" });
  const approved = await approvedArticle({ title: "Approved Queue Member" });
  const res = await publicationsOf("tok-pub");
  assert.equal(res.status, 200);
  const ids = res.body.submissions.map(item => item.articleId);
  assert.equal(ids.includes(submitted.articleId), false);
  assert.equal(ids.includes(approved.articleId), true);
});
check("TPI Video is rejected by the submission route and excluded from publication", async () => {
  const seeded = seedArticle({ editorial: "approved", title: "Video Queue Article", articleType: "TPI Video", destination: "tpi-videos.html" });
  // Even a row that somehow reached the approved state is not a publication
  // candidate: TPI Video keeps its specialized path.
  const now = new Date().toISOString();
  sqlite.prepare("INSERT INTO article_editorial_submissions (id, article_id, nova_item_id, submitted_by, submitted_at, submitted_nova_version, approved_by, approved_at, approved_nova_version, submitted_destination, submitted_article_type, outcome, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 1, 'tpi-videos.html', 'TPI Video', 'open', ?, ?)")
    .run(`sub-${seeded.articleId}`, seeded.articleId, seeded.itemId, OWNER, now, REVIEWER, now, now, now);
  const res = await publicationsOf("tok-pub");
  assert.equal(res.status, 200);
  assert.equal(res.body.submissions.some(item => item.articleId === seeded.articleId), false);
  const detail = await detailOf("tok-pub", seeded.articleId);
  assert.equal(detail.status, 409);
  assert.equal(detail.body.code, "editorial_workflow_not_applicable");
  const publish = await publishAs("tok-pub", seeded.articleId);
  assert.equal(publish.status, 409);
  assert.equal(publish.body.code, "editorial_workflow_not_applicable");
  assert.equal(articleOf(seeded.articleId).status, "draft");
});

// ---- §22 exact-version read-only detail ----
check("publication detail returns the pinned approved version and is publishable", async () => {
  const { articleId, itemId } = await approvedArticle({ title: "Pinned Detail Article", novaVersion: 2 });
  addRevision(itemId, OWNER, 1, "PINNED ROUND ONE");
  addRevision(itemId, OWNER, 2, "PINNED ROUND TWO");
  const res = await detailOf("tok-pub", articleId);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.publishable, true);
  assert.equal(res.body.blocked, null);
  assert.equal(res.body.pinned.version, 2);
  assert.equal(res.body.pinned.source, "revision");
  assert.match(JSON.stringify(res.body.pinned.content), /PINNED ROUND TWO/);
  assert.equal(res.body.submission.approvedNovaVersion, 2);
  assert.equal(res.body.destinationMatches, true);
  assert.equal(res.body.articleTypeMatches, true);
  assert.equal(res.body.article.publicationStatus, "draft");
});
check("publication detail refuses an article that is not approved", async () => {
  const { articleId } = await submittedArticle({ title: "Detail Not Approved" });
  const res = await detailOf("tok-pub", articleId);
  assert.equal(res.status, 200);
  assert.equal(res.body.publishable, false);
  assert.equal(res.body.blocked.code, "not_approved");
  assert.equal(res.body.pinned.unavailable, true);
});
check("publication detail is not readable by a Contributor", async () => {
  const { articleId } = await approvedArticle({ title: "Detail Contributor Refusal" });
  const res = await detailOf("tok-a", articleId);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
});
check("publication detail of an unknown article is a 404", async () => {
  const res = await detailOf("tok-pub", "missing-article");
  assert.equal(res.status, 404);
});

// ---- §3/§19 publish route authority ----
check("unauthenticated publish is refused", async () => {
  const { articleId } = await approvedArticle({ title: "Unauthenticated Publish" });
  const res = await publishAs(null, articleId);
  assert.equal(res.status, 401);
  assert.equal(articleOf(articleId).status, "draft");
});
check("Contributor publish attempt is refused", async () => {
  const { articleId } = await approvedArticle({ title: "Contributor Publish Attempt" });
  const res = await publishAs("tok-a", articleId);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
  assert.equal(articleOf(articleId).status, "draft");
});
check("ordinary Admin publish attempt is refused", async () => {
  const { articleId } = await approvedArticle({ title: "Admin Publish Attempt" });
  const res = await publishAs("tok-admin", articleId);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
  assert.equal(articleOf(articleId).status, "draft");
});
check("Reviewer without Publisher publish attempt is refused", async () => {
  const { articleId } = await approvedArticle({ title: "Reviewer Publish Attempt" });
  const res = await publishAs("tok-rev", articleId);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
  assert.equal(articleOf(articleId).status, "draft");
});
check("publish refuses a cross-account contributor", async () => {
  const { articleId } = await approvedArticle({ title: "Cross Account Publish" });
  const res = await publishAs("tok-b", articleId);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "editorial_publish_required");
  assert.equal(articleOf(articleId).status, "draft");
});

// ---- §6/§7 exact approved version ----
check("publish writes the pinned approved revision, not the current Nova item content", async () => {
  const { articleId, itemId } = await approvedArticle({ title: "Pinned Publish Article", novaVersion: 2 });
  // Every Nova save keeps a revision; the published bytes must come from the
  // pinned revision for the approved version, never from the working item.
  addRevision(itemId, OWNER, 2, "APPROVED PINNED BODY");
  sqlite.prepare("UPDATE nova_items SET content_json = ? WHERE id = ?").run(docText("UNREVIEWED WORKING BODY"), itemId);
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const article = articleOf(articleId);
  assert.match(article.body_html, /APPROVED PINNED BODY/);
  assert.doesNotMatch(article.body_html, /UNREVIEWED WORKING BODY/);
  assert.equal(res.body.approvedNovaVersion, 2);
});
check("publish refuses rather than substituting a newer Nova version for the approved one", async () => {
  const { articleId, itemId } = await approvedArticle({ title: "Stale Approved Version", novaVersion: 4 });
  addRevision(itemId, OWNER, 4, "APPROVED VERSION FOUR");
  addRevision(itemId, OWNER, 5, "NEWER VERSION FIVE");
  // The Contributor kept editing after approval: the item is now version 5.
  sqlite.prepare("UPDATE nova_items SET version = 5, content_json = ? WHERE id = ?").run(docText("NEWER VERSION FIVE"), itemId);
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "stale_version");
  const article = articleOf(articleId);
  assert.equal(article.status, "draft");
  assert.equal(article.body_html, "");
  assert.equal(submissionsFor(articleId)[0].published_at, null);
});
check("publish refuses when the approved version cannot be reconstructed exactly", async () => {
  const { articleId, itemId } = await approvedArticle({ title: "Unreconstructable Approved Version", novaVersion: 2 });
  // The approved version has no pinned revision and the working item has moved
  // on, so the reviewed bytes no longer exist. There is no fallback.
  sqlite.prepare("UPDATE nova_items SET version = 3, content_json = ? WHERE id = ?").run(docText("WORKING VERSION THREE"), itemId);
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "approved_version_unavailable");
  assert.equal(articleOf(articleId).status, "draft");
  assert.equal(articleOf(articleId).body_html, "");
});
check("publish refuses an approved version with no publishable content", async () => {
  const { articleId } = await approvedArticle({ title: "Empty Approved Document", status: "published", bodyHtml: "<p>LIVE PREVIOUS SNAPSHOT</p>", contentJson: JSON.stringify({ type: "doc", content: [] }) });
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "approved_document_empty");
  const article = articleOf(articleId);
  assert.equal(article.body_html, "<p>LIVE PREVIOUS SNAPSHOT</p>");
  assert.equal(article.status, "published");
});

// ---- §7 refusals on submission state ----
check("publish refuses an article that is not in the approved editorial state", async () => {
  const { articleId } = await submittedArticle({ title: "Not Approved Publish" });
  await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev");
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "not_approved");
  assert.equal(articleOf(articleId).status, "draft");
  const detail = await detailOf("tok-pub", articleId);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.publishable, false);
  assert.equal(detail.body.blocked.code, "not_approved");
});
check("publish refuses an approved article with no open submission", async () => {
  const seeded = seedArticle({ editorial: "approved", title: "Approved Without Submission" });
  const res = await publishAs("tok-pub", seeded.articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "no_open_submission");
  assert.equal(articleOf(seeded.articleId).status, "draft");
});
check("publish refuses an open submission that was never approved", async () => {
  const seeded = seedArticle({ editorial: "approved", title: "Approved State Without Approved Round" });
  const now = new Date().toISOString();
  sqlite.prepare("INSERT INTO article_editorial_submissions (id, article_id, nova_item_id, submitted_by, submitted_at, submitted_nova_version, submitted_destination, submitted_article_type, outcome, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, 'education', 'Research Paper', 'open', ?, ?)")
    .run(`sub-${seeded.articleId}`, seeded.articleId, seeded.itemId, OWNER, now, now, now);
  const res = await publishAs("tok-pub", seeded.articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "no_approved_submission");
  assert.equal(articleOf(seeded.articleId).status, "draft");
});
check("publish refuses when the reviewed destination changed after approval", async () => {
  const { articleId } = await approvedArticle({ title: "Metadata Drift Destination", destination: "education" });
  sqlite.prepare("UPDATE articles SET destination = 'research' WHERE id = ?").run(articleId);
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "reviewed_metadata_changed");
  assert.deepEqual(res.body.fields, ["destination"]);
  assert.equal(articleOf(articleId).status, "draft");
  assert.equal(articleOf(articleId).body_html, "");
});
check("publish refuses when the reviewed article type changed after approval", async () => {
  const { articleId } = await approvedArticle({ title: "Metadata Drift Type", articleType: "Research Paper" });
  sqlite.prepare("UPDATE articles SET article_type = 'Field Report' WHERE id = ?").run(articleId);
  const res = await publishAs("tok-pub", articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "reviewed_metadata_changed");
  assert.deepEqual(res.body.fields, ["article_type"]);
  assert.equal(articleOf(articleId).status, "draft");
});
check("a Publisher cannot publish their own submission", async () => {
  const seeded = seedArticle({ editorial: "draft", title: "Self Publication Article", ownerId: SELF });
  await submitAs("tok-self", seeded.articleId);
  await call("POST", `/editorial/submissions/${seeded.articleId}/start-review`, "tok-rev");
  const approved = await call("POST", `/editorial/submissions/${seeded.articleId}/approve`, "tok-rev");
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  const res = await publishAs("tok-self", seeded.articleId);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "self_publication_refused");
  assert.equal(articleOf(seeded.articleId).status, "draft");
  // A different Publisher may publish the same round.
  const other = await publishAs("tok-pub2", seeded.articleId);
  assert.equal(other.status, 200, JSON.stringify(other.body));
  assert.equal(submissionsFor(seeded.articleId)[0].published_by, PUBLISHER2);
});

// ---- §9 no client-supplied publication body ----
check("crafted bodyHtml is refused and publishes nothing", async () => {
  const { articleId } = await approvedArticle({ title: "Crafted Body Article" });
  const res = await publishAs("tok-pub", articleId, { bodyHtml: "<p>CRAFTED BODY</p>" });
  assert.equal(res.status, 422);
  assert.equal(res.body.code, "publication_payload_refused");
  assert.deepEqual(res.body.fields, ["bodyHtml"]);
  const article = articleOf(articleId);
  assert.equal(article.status, "draft");
  assert.equal(article.body_html, "");
  assert.equal(submissionsFor(articleId)[0].published_at, null);
});
check("crafted article_html is refused", async () => {
  const { articleId } = await approvedArticle({ title: "Crafted Article Html" });
  const res = await publishAs("tok-pub", articleId, { article_html: "<!DOCTYPE html><html><body>CRAFTED</body></html>" });
  assert.equal(res.status, 422);
  assert.equal(res.body.code, "publication_payload_refused");
  assert.deepEqual(res.body.fields, ["article_html"]);
  assert.equal(articleOf(articleId).status, "draft");
});
check("crafted publication state fields are refused", async () => {
  const { articleId } = await approvedArticle({ title: "Crafted State Article" });
  const res = await publishAs("tok-pub", articleId, { status: "published", approvedNovaVersion: 9, publishedBy: PUBLISHER, publishedAt: "2020-01-01T00:00:00Z" });
  assert.equal(res.status, 422);
  assert.equal(res.body.code, "publication_payload_refused");
  assert.deepEqual(res.body.fields.sort(), ["approvedNovaVersion", "publishedAt", "publishedBy", "status"]);
  const article = articleOf(articleId);
  assert.equal(article.status, "draft");
  assert.equal(submissionsFor(articleId)[0].published_at, null);
});

// ---- §10/§12/§14/§15 first publication ----
const firstPublished = await approvedArticle({ title: "First Publication Article", novaVersion: 2, destination: "education", articleType: "Research Paper", href: "published-article.html?id=first-publication", bodyHtml: "" });
addRevision(firstPublished.itemId, OWNER, 2, "FIRST PUBLISHED BODY TEXT");
const firstPublish = await publishAs("tok-pub", firstPublished.articleId);

check("an approved draft article publishes through the Publisher action", () => {
  assert.equal(firstPublish.status, 200, JSON.stringify(firstPublish.body));
  assert.equal(firstPublish.body.published, true);
  assert.equal(firstPublish.body.publicationStatus, "published");
  assert.equal(firstPublish.body.editorialStatus, "approved");
  assert.equal(firstPublish.body.approvedNovaVersion, 2);
  assert.equal(firstPublish.body.publishedBy, PUBLISHER);
  assert.ok(firstPublish.body.publishedAt, "publishedAt missing from the result");
});
check("the publication snapshot is generated on the server from the approved document", () => {
  const article = articleOf(firstPublished.articleId);
  assert.equal(article.status, "published");
  assert.match(article.body_html, /FIRST PUBLISHED BODY TEXT/);
  assert.match(article.article_html, /<h1>First Publication Article<\/h1>/);
  assert.match(article.article_html, /FIRST PUBLISHED BODY TEXT/);
  assert.match(article.article_html, /Research Library/);
});
check("publication preserves the article identity, URL, destination, type and owner", () => {
  const article = articleOf(firstPublished.articleId);
  assert.equal(article.id, firstPublished.articleId);
  assert.equal(article.href, "published-article.html?id=first-publication");
  assert.equal(article.destination, "education");
  assert.equal(article.article_type, "Research Paper");
  assert.equal(article.created_by, OWNER);
  assert.equal(article.nova_item_id, firstPublished.itemId);
});
check("publication metadata is recorded on the exact approved submission", () => {
  const [submission] = submissionsFor(firstPublished.articleId);
  assert.equal(submission.outcome, "published");
  assert.equal(submission.published_by, PUBLISHER);
  assert.ok(submission.published_at, "published_at missing");
  assert.equal(submission.submitted_by, OWNER);
  assert.equal(submission.submitted_nova_version, 2);
  assert.equal(submission.approved_nova_version, 2);
  assert.equal(submission.approved_by, REVIEWER);
  assert.ok(submission.approved_at, "approved_at was lost");
});
check("publication appends one publication event naming the Publisher and version", () => {
  const events = eventsFor(firstPublished.articleId);
  const publishedEvents = events.filter(event => event.event_type === "published");
  assert.equal(publishedEvents.length, 1);
  assert.equal(publishedEvents[0].actor_id, PUBLISHER);
  assert.equal(publishedEvents[0].nova_version, 2);
  assert.equal(publishedEvents[0].visible_to_contributor, 1);
});
check("publication keeps editorial_status approved and does not open a new round", () => {
  assert.equal(articleOf(firstPublished.articleId).editorial_status, "approved");
  assert.equal(isNovaLocked("approved"), true);
  assert.equal(submissionsFor(firstPublished.articleId).filter(row => row.outcome === "open").length, 0);
});
check("the Contributor read model reports the published state, not awaiting publication", async () => {
  const res = await call("GET", "/contributors/me/articles", "tok-a");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const row = res.body.articles.find(article => article.id === firstPublished.articleId);
  assert.ok(row, "published article missing from the contributor list");
  assert.equal(row.status, "published");
  assert.equal(row.editorialStatus, "approved");
  assert.ok(row.publishedAt, "publishedAt missing from the contributor read model");
  assert.equal(row.locked, true);
});
check("review history is retained after publication", () => {
  const events = eventsFor(firstPublished.articleId).map(event => event.event_type);
  assert.deepEqual(events, ["submitted", "review_started", "approved", "published"]);
  const [submission] = submissionsFor(firstPublished.articleId);
  assert.ok(submission.review_started_at, "review_started_at was lost");
  assert.ok(submission.submitted_at, "submitted_at was lost");
});
check("the same approved round cannot be published twice", async () => {
  const res = await publishAs("tok-pub", firstPublished.articleId);
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "no_open_submission");
  assert.equal(eventsFor(firstPublished.articleId).filter(event => event.event_type === "published").length, 1);
});

// ---- §30 notification semantics ----
check("first publication sends one education notification and never to the submitter", () => {
  const rows = notificationsFor(`New educational content: ${firstPublished.title}`);
  const expectedRecipients = sqlite.prepare("SELECT COUNT(*) AS n FROM contributors WHERE active = 1 AND id != ?").get(OWNER).n;
  assert.equal(rows.length, expectedRecipients);
  assert.equal(rows.some(row => row.contributor_id === OWNER), false);
  assert.equal(rows.some(row => row.contributor_id === OTHER), true);
  assert.equal(new Set(rows.map(row => row.contributor_id)).size, rows.length);
  assert.equal(rows.every(row => row.type === "education"), true);
  assert.equal(rows.every(row => row.action_href === "published-article.html?id=first-publication"), true);
});

// ---- §11 already-published revision replacement ----
const liveArticle = await approvedArticle({
  title: "Live Snapshot Replacement",
  novaVersion: 2,
  status: "published",
  bodyHtml: "<p>OLD PUBLIC SNAPSHOT</p>",
  href: "published-article.html?id=live-replacement"
});
addRevision(liveArticle.itemId, OWNER, 2, "APPROVED REPLACEMENT BODY");
const liveBefore = await detailOf("tok-pub", liveArticle.articleId);
// Captured before the publication call below, so the check can prove the live
// snapshot was untouched while the approved revision was queued.
const liveBodyBefore = articleOf(liveArticle.articleId).body_html;
check("an approved revision leaves the existing public snapshot live until publication", () => {
  assert.equal(liveBefore.status, 200, JSON.stringify(liveBefore.body));
  assert.equal(liveBefore.body.publishable, true);
  assert.equal(liveBefore.body.article.publicationStatus, "published");
  assert.equal(liveBefore.body.article.publicBodyBytes, "<p>OLD PUBLIC SNAPSHOT</p>".length);
  assert.equal(liveBodyBefore, "<p>OLD PUBLIC SNAPSHOT</p>");
  assert.equal(liveBefore.body.pinned.version, 2);
  assert.match(JSON.stringify(liveBefore.body.pinned.content), /APPROVED REPLACEMENT BODY/);
});
const replacement = await publishAs("tok-pub", liveArticle.articleId);
check("publication replaces the live snapshot and preserves the public URL", () => {
  assert.equal(replacement.status, 200, JSON.stringify(replacement.body));
  const article = articleOf(liveArticle.articleId);
  assert.equal(article.status, "published");
  assert.match(article.body_html, /APPROVED REPLACEMENT BODY/);
  assert.doesNotMatch(article.body_html, /OLD PUBLIC SNAPSHOT/);
  assert.equal(article.href, "published-article.html?id=live-replacement");
  assert.equal(article.id, liveArticle.articleId);
  assert.equal(article.created_by, OWNER);
});
check("a replacement publication does not create a duplicate publication notification", () => {
  assert.equal(notificationsFor(`New educational content: ${liveArticle.title}`).length, 0);
});

// ---- §20 atomic publication ----
check("publication is atomic when the event write fails", async () => {
  const seeded = await approvedArticle({ title: "Atomic Publication Article" });
  sqlite.exec(`CREATE TRIGGER r6e_atomic_guard BEFORE INSERT ON article_editorial_events WHEN NEW.event_type = 'published' BEGIN SELECT RAISE(ABORT, 'r6e simulated event failure'); END;`);
  let response = null;
  let threw = false;
  try {
    response = await publishAs("tok-pub", seeded.articleId);
  } catch (error) {
    threw = true;
  }
  sqlite.exec("DROP TRIGGER r6e_atomic_guard");
  assert.ok(threw || response.status >= 500, `expected a failed publication, got ${response?.status}`);
  const article = articleOf(seeded.articleId);
  assert.equal(article.status, "draft");
  assert.equal(article.body_html, "");
  const [submission] = submissionsFor(seeded.articleId);
  assert.equal(submission.published_at, null);
  assert.equal(submission.outcome, "open");
  assert.equal(eventsFor(seeded.articleId).filter(event => event.event_type === "published").length, 0);
  // The rollback left the round publishable again.
  const retry = await publishAs("tok-pub", seeded.articleId);
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
});

// ---- §24 public snapshot proof ----
check("the public article API exposes the new snapshot", async () => {
  const res = await call("GET", "/articles", null);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const row = res.body.articles.find(article => article.id === firstPublished.articleId);
  assert.ok(row, "published article missing from the public listing");
  assert.equal(row.status, "published");
  assert.match(row.bodyHtml, /FIRST PUBLISHED BODY TEXT/);
  assert.match(row.articleHtml, /FIRST PUBLISHED BODY TEXT/);
});
check("destination filtering exposes the new snapshot", async () => {
  const res = await call("GET", "/articles?destination=education", null);
  assert.equal(res.status, 200);
  assert.ok(res.body.articles.some(article => article.id === firstPublished.articleId));
  const other = await call("GET", "/articles?destination=research", null);
  assert.equal(other.status, 200);
  assert.equal(other.body.articles.some(article => article.id === firstPublished.articleId), false);
});
check("an approved but unpublished article never appears in the public listing", async () => {
  const { articleId, title } = await approvedArticle({ title: "Approved But Not Public" });
  const res = await call("GET", "/articles", null);
  assert.equal(res.status, 200);
  assert.equal(res.body.articles.some(article => article.id === articleId), false);
  assert.equal(articleOf(articleId).status, "draft");
  assert.equal(JSON.stringify(res.body).includes(title), false);
});

// ---- §25 approval alone does not publish ----
check("approval alone still does not publish", async () => {
  const { articleId } = await approvedArticle({ title: "Approval Is Not Publication" });
  const article = articleOf(articleId);
  assert.equal(article.status, "draft");
  assert.equal(article.body_html, "");
  assert.equal(article.article_html, "");
  assert.equal(eventsFor(articleId).some(event => event.event_type === "published"), false);
});

// ---- §26/§27/§28/§29 Admin and legacy bypass ----
check("the legacy direct Admin article update is refused for an enrolled article", async () => {
  const { articleId } = await approvedArticle({ title: "Admin Update Bypass Attempt" });
  const res = await call("PUT", `/admin/articles/${articleId}`, "tok-admin", { bodyHtml: "<p>UNREVIEWED REPLACEMENT</p>", articleHtml: "<html>UNREVIEWED</html>" });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  const article = articleOf(articleId);
  assert.equal(article.body_html, "");
  assert.equal(article.status, "draft");
});
check("the legacy direct Admin status change is refused for an enrolled article", async () => {
  const { articleId } = await approvedArticle({ title: "Admin Status Bypass Attempt" });
  const res = await call("POST", `/admin/articles/${articleId}/status`, "tok-admin", { status: "published" });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  assert.equal(articleOf(articleId).status, "draft");
  assert.equal(articleOf(articleId).body_html, "");
});
check("the legacy direct Admin status change is refused for an enrolled published article", async () => {
  const { articleId } = await approvedArticle({ title: "Admin Unpublish Bypass Attempt", status: "published", bodyHtml: "<p>LIVE SNAPSHOT</p>" });
  const res = await call("POST", `/admin/articles/${articleId}/status`, "tok-admin", { status: "draft" });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  const article = articleOf(articleId);
  assert.equal(article.status, "published");
  assert.equal(article.body_html, "<p>LIVE SNAPSHOT</p>");
});
check("limited Admin can remove an Education article from public view while preserving Nova and audit history", async () => {
  const seeded = await approvedArticle({ title: "Admin Moderation Removal" });
  const res = await call("DELETE", `/admin/articles/${seeded.articleId}`, "tok-admin");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.removedFromPublic, true);
  assert.equal(res.body.editorialHistoryPreserved, true);
  assert.equal(articleOf(seeded.articleId).status, "deleted");
  assert.ok(sqlite.prepare("SELECT id FROM nova_items WHERE id = ?").get(seeded.itemId));
  assert.equal(submissionsFor(seeded.articleId).length, 1);
  assert.equal(eventsFor(seeded.articleId).some(event => event.event_type === "approved"), true);
  assert.equal(sqlite.prepare("SELECT action FROM admin_audit_logs WHERE target_id = ?").get(seeded.articleId)?.action, "article.moderation_removed");
  const adminQueue = await call("GET", "/admin/articles?status=deleted", "tok-admin");
  assert.equal(adminQueue.status, 200);
  assert.ok(adminQueue.body.articles.some(article => article.id === seeded.articleId));
  const publisherQueue = await publicationsOf("tok-pub");
  assert.equal(publisherQueue.body.submissions.some(article => article.articleId === seeded.articleId), false);
  const publisherDetail = await detailOf("tok-pub", seeded.articleId);
  assert.equal(publisherDetail.status, 409);
  assert.equal(publisherDetail.body.code, "article_moderation_removed");
  const publicList = await call("GET", "/articles", null);
  assert.equal(publicList.status, 200);
  assert.equal(publicList.body.articles.some(article => article.id === seeded.articleId), false);
  const publish = await publishAs("tok-pub", seeded.articleId);
  assert.equal(publish.status, 409);
  assert.equal(publish.body.code, "article_moderation_removed");
  assert.equal(articleOf(seeded.articleId).status, "deleted");
  assert.equal(submissionsFor(seeded.articleId)[0].outcome, "open");
});
check("limited Admin moderation can remove restricted Ghostology content without receiving authoring rights", async () => {
  const seeded = seedArticle({ editorial: "legacy", title: "Admin Removed Ghostology", destination: "ghostology-101.html", articleType: "Ghostology", status: "published" });
  const res = await call("DELETE", `/admin/articles/${seeded.articleId}`, "tok-admin");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(articleOf(seeded.articleId).status, "deleted");
  const attemptedPublish = await call("POST", `/admin/articles/${seeded.articleId}/status`, "tok-admin", { status: "published" });
  assert.equal(attemptedPublish.status, 403);
  assert.equal(attemptedPublish.body.code, "education_leadership_required");
});
check("ordinary Contributors cannot use the Admin moderation removal route", async () => {
  const seeded = seedArticle({ editorial: "legacy", title: "Contributor Cannot Moderate" });
  const res = await call("DELETE", `/admin/articles/${seeded.articleId}`, "tok-a");
  assert.equal(res.status, 403);
  assert.equal(articleOf(seeded.articleId).status, "draft");
});
check("a moderation-removed legacy article cannot be republished from its status control", async () => {
  const seeded = seedArticle({ editorial: "legacy", title: "Removed Legacy Article" });
  const removed = await call("DELETE", `/admin/articles/${seeded.articleId}`, "tok-admin");
  assert.equal(removed.status, 200);
  const publish = await call("POST", `/admin/articles/${seeded.articleId}/status`, "tok-admin", { status: "published" });
  assert.equal(publish.status, 409);
  assert.equal(publish.body.code, "article_moderation_removed");
  assert.equal(articleOf(seeded.articleId).status, "deleted");
});
check("legacy articles keep their existing direct Admin publication path", async () => {
  const seeded = seedArticle({ editorial: "legacy", title: "Legacy Admin Article", href: "published-article.html?id=legacy-admin" });
  const status = await call("POST", `/admin/articles/${seeded.articleId}/status`, "tok-admin", { status: "published" });
  assert.equal(status.status, 200, JSON.stringify(status.body));
  assert.equal(articleOf(seeded.articleId).status, "published");
  const update = await call("PUT", `/admin/articles/${seeded.articleId}`, "tok-admin", { title: "Legacy Admin Article", bodyHtml: "<p>LEGACY BODY</p>", articleHtml: "<html>LEGACY</html>", destination: "education" });
  assert.equal(update.status, 200, JSON.stringify(update.body));
  assert.equal(articleOf(seeded.articleId).body_html, "<p>LEGACY BODY</p>");
});
check("an enrolled Contributor still cannot publish through the direct article write", async () => {
  const { articleId } = await approvedArticle({ title: "Contributor Direct Publish Attempt" });
  const res = await call("POST", "/articles", "tok-a", { id: articleId, status: "published", title: "Contributor Direct Publish Attempt", destination: "education", bodyHtml: "<p>DIRECT</p>", articleHtml: "<html>DIRECT</html>" });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  const article = articleOf(articleId);
  assert.equal(article.status, "draft");
  assert.equal(article.body_html, "");
});
check("ordinary Admin and Publisher roles cannot manage TPI Video content", async () => {
  const seeded = seedArticle({ editorial: "legacy", title: "TPI Video Legacy", articleType: "TPI Video", destination: "tpi-videos.html" });
  const res = await call("POST", `/admin/articles/${seeded.articleId}/status`, "tok-admin", { status: "published" });
  assert.equal(res.status, 403, JSON.stringify(res.body));
  assert.equal(res.body.code, "education_leadership_required");
  assert.equal(articleOf(seeded.articleId).status, "draft");
  const publish = await publishAs("tok-pub", seeded.articleId);
  assert.equal(publish.status, 409, JSON.stringify(publish.body));
  assert.equal(publish.body.code, "editorial_workflow_not_applicable");
  assert.equal(articleOf(seeded.articleId).status, "draft");
});

// ---- §8 renderer authority ----
check("the server publication renderer is byte-identical to the browser Nova renderer", () => {
  const doc = {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Findings" }] },
      { type: "paragraph", content: [
        { type: "text", text: "Plain " },
        { type: "text", text: "bold", marks: [{ type: "bold" }] },
        { type: "text", text: " and " },
        { type: "text", text: "linked", marks: [{ type: "link", attrs: { href: "https://example.org/report" } }] },
        { type: "hardBreak" },
        { type: "text", text: "tail" }
      ] },
      { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "one" }] }] }] },
      { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "two" }] }] }] },
      { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "quote" }] }] },
      { type: "horizontalRule" },
      { type: "table", content: [{ type: "tableRow", content: [{ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "H" }] }] }] }] }
    ]
  };
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(resolve(repoRoot, "content-editor-nova-convert.js"), "utf8"), sandbox);
  const browserHtml = sandbox.window.TPINovaConvert.novaDocToHtml(doc);
  assert.equal(novaDocToHtml(doc), browserHtml);
  const snapshot = buildPublicationSnapshot({ doc, title: "Renderer Parity", articleType: "Research Paper", destination: "education" });
  assert.equal(snapshot.bodyHtml, browserHtml);
  assert.equal(snapshot.bodyBytes, new TextEncoder().encode(browserHtml).length);
});
check("publication HTML escapes Contributor text instead of executing it", async () => {
  const hostile = `<script>alert("r6e")</script> & <img src=x onerror=alert(1)>`;
  const seeded = await approvedArticle({
    title: "Escaped Publication Article",
    contentJson: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: hostile }] }] })
  });
  const res = await publishAs("tok-pub", seeded.articleId);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const article = articleOf(seeded.articleId);
  assert.doesNotMatch(article.body_html, /<script>/);
  assert.doesNotMatch(article.body_html, /<img src=x/);
  assert.match(article.body_html, /&lt;script&gt;/);
  assert.match(article.body_html, /&amp; &lt;img src=x onerror=alert\(1\)&gt;/);
});

// ---- §21/§23 UI contract ----
check("the Administration Center Publisher action uses explicit Publish Approved Version wording", () => {
  const app = readFileSync(resolve(repoRoot, "admin-center-app/src/app.tsx"), "utf8");
  assert.match(app, /Publish Approved Version/);
  assert.match(app, /"Publishing…" : "Publish Approved Version"/);
  assert.match(app, /I have reviewed this exact approved version/);
  assert.match(app, /editorialPublish/);
  assert.match(app, /\/publish`/);
  assert.doesNotMatch(app, /bodyHtml:/);
});
check("the Contributor workspace shows a published indication", () => {
  const editor = readFileSync(resolve(repoRoot, "paper-editor.js"), "utf8");
  assert.match(editor, /Published — Live in the Education Center/);
  assert.match(editor, /isPublished/);
});

// ---- Run ----
for (const item of queue) {
  try {
    await item.fn();
    passed += 1;
    console.log(`PASS ${item.name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${item.name}: ${error.message}`);
  }
}
console.log(`\nTPI-NOVA-004R6E publication verifier: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

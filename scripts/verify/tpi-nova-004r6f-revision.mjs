// TPI-NOVA-004R6F verifier: published revision lifecycle and legacy containment.
//
// Runs the real Worker router (functions/api/[[path]].js), the real
// lib/editorial-workflow.js engine, the real Nova update path (lib/nova.js) and
// the real migrations 0058, 0062, 0061 and 0063 against a throwaway in-memory
// SQLite database. No local D1 state, real article, account or Studio is used.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import { onRequest } from "../../functions/api/[[path]].js";
import { updateNovaItemForOwner } from "../../lib/nova.js";
import { canStartRevision, TRANSITIONS, validateTransition } from "../../lib/editorial-workflow.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let passed = 0;
let failed = 0;
const queue = [];
// Checks run in declaration order so one check never observes another's article.
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
for (const file of [
  "migrations/0058_founding_membership_entitlements.sql",
  "migrations/0062_editorial_capabilities.sql",
  "migrations/0061_article_editorial_workflow.sql",
  "migrations/0063_editorial_revision_started.sql",
]) {
  sqlite.exec(readFileSync(resolve(repoRoot, file), "utf8"));
}

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
const OWNER = "contrib-a";
const OTHER = "contrib-b";
const REVIEWER = "reviewer-r";
const PUBLISHER = "publisher-p";
const ADMIN = "admin-a";
sqlite.exec(`
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${OWNER}', 'alice', 'Alice Contributor', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${OTHER}', 'bob', 'Bob Contributor', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${REVIEWER}', 'rev', 'Rae Reviewer', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${PUBLISHER}', 'pub', 'Pat Publisher', 'contributor');
  INSERT INTO contributors (id, username, display_name, role) VALUES ('${ADMIN}', 'admin', 'Avery Admin', 'admin');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-r', '${REVIEWER}', 'editorial_review', 'admin_grant', 'active');
  INSERT INTO member_entitlements (id, contributor_id, capability, source_type, state) VALUES ('ent-p', '${PUBLISHER}', 'editorial_publish', 'admin_grant', 'active');
  INSERT INTO sessions VALUES ('tok-a', '${OWNER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-b', '${OTHER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-rev', '${REVIEWER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-pub', '${PUBLISHER}', '2099-01-01T00:00:00Z');
  INSERT INTO sessions VALUES ('tok-admin', '${ADMIN}', '2099-01-01T00:00:00Z');
`);

// ---- HTTP helper: drives the real Worker router ----
async function call(method, path, token, payload) {
  const headers = new Headers();
  if (token) headers.set("cookie", `tpi_session=${token}`);
  headers.set("origin", "http://127.0.0.1:8787");
  headers.set("content-type", "application/json");
  const body = method === "GET" ? undefined : JSON.stringify(payload ?? {});
  const request = new Request(`http://127.0.0.1:8787/api${path}`, { method, headers, body });
  const routePath = path.split("?")[0].replace(/^\//, "").split("/");
  const res = await onRequest({ request, env, params: { path: routePath } });
  const text = await res.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: res.status, body: parsed };
}

// ---- Check runner ----
async function run() {
  for (const { name, fn } of queue) {
    try {
      await fn();
      passed += 1;
      console.log(`PASS ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL ${name}\n  ${error.message.split("\n").join("\n  ")}`);
    }
  }
  console.log(`\nTPI-NOVA-004R6F verifier: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed) process.exitCode = 1;
}

// ---- Synthetic content ----
let counter = 0;
function docText(marker) {
  return JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: marker }] }] });
}
function novaEnvelope(marker) {
  return { format: "nova-document", version: 1, doc: JSON.parse(docText(marker)) };
}
function seedArticle({ editorial = "legacy", status = "draft", title = null, ownerId = OWNER } = {}) {
  counter += 1;
  const articleId = `art-${counter}`;
  const itemId = `nova-${counter}`;
  const articleTitle = title || `Synthetic Article ${counter}`;
  sqlite.prepare("INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version) VALUES (?, ?, 'nova-document', ?, ?, 16, 1)")
    .run(itemId, ownerId, articleTitle, docText("working-v1"));
  sqlite.prepare("INSERT INTO articles (id, created_by, status, nova_item_id, title, author, href) VALUES (?, ?, ?, ?, ?, 'Alice Contributor', ?)")
    .run(articleId, ownerId, status, itemId, articleTitle, `published-article.html?id=${articleId}`);
  if (editorial !== "legacy") {
    sqlite.prepare("UPDATE articles SET editorial_status = ? WHERE id = ?").run(editorial, articleId);
  }
  return { articleId, itemId, title: articleTitle };
}
const articleOf = id => sqlite.prepare("SELECT * FROM articles WHERE id = ?").get(id);
const submissionsFor = id => sqlite.prepare("SELECT * FROM article_editorial_submissions WHERE article_id = ? ORDER BY created_at, rowid").all(id);
const eventsFor = id => sqlite.prepare("SELECT event_type, actor_id FROM article_editorial_events WHERE article_id = ? ORDER BY rowid").all(id);

// Submit, review and approve a round so it sits at approved, awaiting publication.
async function approvedArticle(opts = {}) {
  const seeded = seedArticle({ editorial: "draft", ...opts });
  const submitted = await call("POST", `/articles/${seeded.articleId}/submission`, "tok-a", {});
  assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
  assert.equal(submitted.body.editorialStatus, "submitted");
  const started = await call("POST", `/editorial/submissions/${seeded.articleId}/start-review`, "tok-rev");
  assert.equal(started.status, 200, JSON.stringify(started.body));
  const approved = await call("POST", `/editorial/submissions/${seeded.articleId}/approve`, "tok-rev");
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  return seeded;
}

const publishAs = (token, articleId, payload) => call("POST", `/editorial/articles/${articleId}/publish`, token, payload);
const startRevision = (token, articleId) => call("POST", `/articles/${articleId}/revision/start`, token, {});
const readModel = token => call("GET", "/contributors/me/articles", token);

// A fully published article: the exact starting point R6F must reopen.
async function publishedArticle(opts = {}) {
  const seeded = await approvedArticle(opts);
  const published = await publishAs("tok-pub", seeded.articleId, {});
  assert.equal(published.status, 200, JSON.stringify(published.body));
  assert.equal(articleOf(seeded.articleId).status, "published");
  assert.equal(articleOf(seeded.articleId).editorial_status, "approved");
  return seeded;
}

// ==== CHECKS ====
check("submission creates a single open round and moves the article to submitted", async () => {
  const { articleId } = await approvedArticle();
  const rounds = submissionsFor(articleId);
  assert.equal(rounds.length, 1);
  // Approval keeps the round open and pins the approved Nova version; only
  // publication closes it. This is the state Start New Revision must refuse.
  assert.equal(rounds[0].outcome, "open");
  assert.equal(rounds[0].approved_nova_version, 1);
  assert.equal(rounds[0].submitted_nova_version, 1);
  assert.equal(articleOf(articleId).editorial_status, "approved");
});

check("approved but unpublished article cannot start a revision", async () => {
  const { articleId } = await approvedArticle();
  const res = await startRevision("tok-a", articleId);
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.equal(articleOf(articleId).editorial_status, "approved");
  assert.equal(articleOf(articleId).status, "draft");
});

check("published approved article can start a revision", async () => {
  const { articleId } = await publishedArticle();
  const res = await startRevision("tok-a", articleId);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.editorialStatus, "draft");
  // Public status is returned explicitly so the UI never has to infer it.
  assert.equal(res.body.publicationStatus, "published");
  assert.equal(articleOf(articleId).editorial_status, "draft");
});

check("pure: approved -> draft is a controlled revision_started transition only", () => {
  assert.equal(TRANSITIONS["approved>draft"].event, "revision_started");
  const owner = validateTransition({ from: "approved", to: "draft", actorId: OWNER, capabilities: ["contributor"], isOwner: true });
  assert.equal(owner.ok, true, JSON.stringify(owner));
  assert.equal(owner.event, "revision_started");
  const stranger = validateTransition({ from: "approved", to: "draft", actorId: OTHER, capabilities: ["contributor"], isOwner: false });
  assert.equal(stranger.ok, false);
  assert.equal(stranger.code, "not_owner");
  const reviewer = validateTransition({ from: "approved", to: "draft", actorId: REVIEWER, capabilities: ["editorial_review"], isOwner: false });
  assert.equal(reviewer.ok, false);
  // No other route out of approved exists besides publication.
  assert.equal(TRANSITIONS["approved>submitted"], undefined);
  assert.equal(TRANSITIONS["approved>in_review"], undefined);
});

check("pure: canStartRevision refuses a publication that has not completed", () => {
  const base = { articleStatus: "published", editorialStatus: "approved", publishedNovaVersion: 3, currentNovaVersion: 3, openSubmissions: 0 };
  assert.equal(canStartRevision(base).ok, true);
  assert.equal(canStartRevision({ ...base, articleStatus: "draft" }).code, "not_published");
  assert.equal(canStartRevision({ ...base, editorialStatus: "submitted" }).code, "not_approved_state");
  assert.equal(canStartRevision({ ...base, publishedNovaVersion: null }).code, "no_published_round");
  assert.equal(canStartRevision({ ...base, openSubmissions: 1 }).code, "submission_already_open");
  assert.equal(canStartRevision({ ...base, currentNovaVersion: 4 }).code, "nova_version_inconsistent");
});

check("non-owner cannot start a revision", async () => {
  const { articleId } = await publishedArticle();
  const res = await startRevision("tok-b", articleId);
  assert.ok([403, 404].includes(res.status), JSON.stringify(res.body));
  assert.equal(articleOf(articleId).editorial_status, "approved");
});

check("stale Nova version is refused and the article stays approved", async () => {
  const { articleId, itemId } = await publishedArticle();
  // The working document moved on after publication, so the current Nova version
  // no longer matches the version the Publisher approved.
  sqlite.prepare("UPDATE nova_items SET version = 7 WHERE id = ?").run(itemId);
  const res = await startRevision("tok-a", articleId);
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.equal(articleOf(articleId).editorial_status, "approved");
});

check("the working document is locked while the article is published and approved", async () => {
  const { itemId } = await publishedArticle();
  const res = await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 1, content: novaEnvelope("blocked-edit") });
  assert.equal(res.status, 409, await res.text());
  assert.equal(sqlite.prepare("SELECT version FROM nova_items WHERE id = ?").get(itemId).version, 1);
});

check("starting a revision appends a revision_started event and keeps the article published", async () => {
  const { articleId } = await publishedArticle();
  const before = eventsFor(articleId).length;
  const res = await startRevision("tok-a", articleId);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const events = eventsFor(articleId);
  assert.equal(events.length, before + 1);
  assert.equal(events.at(-1).event_type, "revision_started");
  assert.equal(events.at(-1).actor_id, OWNER);
  const article = articleOf(articleId);
  assert.equal(article.status, "published");
  assert.equal(article.editorial_status, "draft");
  // Earlier history is never rewritten.
  assert.ok(events.some(e => e.event_type === "published"));
  assert.ok(events.some(e => e.event_type === "approved"));
});

check("a never-published draft article cannot start a revision", async () => {
  const seeded = seedArticle({ editorial: "draft", status: "draft" });
  const res = await startRevision("tok-a", seeded.articleId);
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.equal(res.body.code, "revision_refused");
  assert.equal(articleOf(seeded.articleId).editorial_status, "draft");
});

check("a reviewer never gains the owner's Start New Revision action", async () => {
  const { articleId } = await publishedArticle();
  const res = await startRevision("tok-rev", articleId);
  assert.ok([403, 404].includes(res.status), JSON.stringify(res.body));
  assert.equal(articleOf(articleId).editorial_status, "approved");
});

check("the revision_started event is visible to the Contributor", async () => {
  const { articleId } = await publishedArticle();
  await startRevision("tok-a", articleId);
  const row = sqlite.prepare("SELECT visible_to_contributor, from_state, to_state, nova_version FROM article_editorial_events WHERE article_id = ? AND event_type = 'revision_started'").get(articleId);
  assert.equal(row.visible_to_contributor, 1);
  assert.equal(row.from_state, "approved");
  assert.equal(row.to_state, "draft");
  assert.equal(row.nova_version, 1);
});

check("changes requested on a revision keeps the old public version live", async () => {
  const { articleId, itemId } = await publishedArticle();
  const v1 = articleOf(articleId).body_html;
  await startRevision("tok-a", articleId);
  await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 1, content: novaEnvelope("revision-two") });
  assert.equal((await call("POST", `/articles/${articleId}/submission`, "tok-a", {})).status, 201);
  assert.equal((await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev")).status, 200);
  const changes = await call("POST", `/editorial/submissions/${articleId}/request-changes`, "tok-rev", { note: "Please expand the findings." });
  assert.equal(changes.status, 200, JSON.stringify(changes.body));
  assert.equal(articleOf(articleId).editorial_status, "changes_requested");
  assert.equal(articleOf(articleId).status, "published");
  assert.equal(articleOf(articleId).body_html, v1);
  // The Contributor can now edit the revision again.
  const edited = await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 2, content: novaEnvelope("revision-three") });
  assert.equal(edited.status, 200, await edited.text());
});

check("starting a revision leaves the public snapshot and URL untouched", async () => {
  const { articleId } = await publishedArticle();
  const before = articleOf(articleId);
  const res = await startRevision("tok-a", articleId);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const after = articleOf(articleId);
  assert.equal(after.body_html, before.body_html);
  assert.equal(after.article_html, before.article_html);
  assert.equal(after.href, before.href);
  assert.equal(after.destination, before.destination);
  assert.equal(after.title, before.title);
  assert.ok(after.body_html.length > 0, "the published snapshot must still be live");
  // The published round is retained and still identifies what is live.
  const published = submissionsFor(articleId).filter(s => s.outcome === "published");
  assert.equal(published.length, 1);
  assert.equal(published[0].approved_nova_version, 1);
});

check("editing after a revision starts advances the version and not the public snapshot", async () => {
  const { articleId, itemId } = await publishedArticle();
  const snapshot = articleOf(articleId).body_html;
  assert.equal((await startRevision("tok-a", articleId)).status, 200);
  const edited = await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 1, content: novaEnvelope("revision-two") });
  assert.equal(edited.status, 200, await edited.text());
  const item = sqlite.prepare("SELECT version, content_json FROM nova_items WHERE id = ?").get(itemId);
  assert.equal(item.version, 2);
  assert.match(item.content_json, /revision-two/);
  const article = articleOf(articleId);
  assert.equal(article.status, "published");
  assert.equal(article.editorial_status, "draft");
  assert.equal(article.body_html, snapshot);
});

check("a revision resubmits as a new round pinned to the new Nova version", async () => {
  const { articleId, itemId } = await publishedArticle();
  await startRevision("tok-a", articleId);
  await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 1, content: novaEnvelope("revision-two") });
  const res = await call("POST", `/articles/${articleId}/submission`, "tok-a", {});
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.equal(res.body.editorialStatus, "submitted");
  const rounds = submissionsFor(articleId);
  assert.equal(rounds.length, 2);
  assert.equal(rounds[0].outcome, "published");
  assert.equal(rounds[0].approved_nova_version, 1);
  assert.equal(rounds[1].outcome, "open");
  assert.equal(rounds[1].submitted_nova_version, 2);
  assert.equal(articleOf(articleId).status, "published");
});

check("v2 replaces v1 only on Publisher action and keeps the same article identity", async () => {
  const { articleId, itemId, title } = await publishedArticle();
  const v1 = articleOf(articleId);
  await startRevision("tok-a", articleId);
  await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 1, content: novaEnvelope("revision-two") });
  assert.equal((await call("POST", `/articles/${articleId}/submission`, "tok-a", {})).status, 201);
  assert.equal((await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev")).status, 200);
  // Still live v1 while the revision is approved but unpublished.
  assert.equal((await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev")).status, 200);
  assert.equal(articleOf(articleId).body_html, v1.body_html);
  assert.equal(articleOf(articleId).status, "published");
  const published = await publishAs("tok-pub", articleId, {});
  assert.equal(published.status, 200, JSON.stringify(published.body));
  const v2 = articleOf(articleId);
  assert.notEqual(v2.body_html, v1.body_html);
  assert.match(v2.body_html, /revision-two/);
  assert.equal(v2.id, v1.id);
  assert.equal(v2.href, v1.href);
  assert.equal(v2.title, title);
  assert.equal(v2.created_by, OWNER);
  assert.equal(v2.status, "published");
  const rounds = submissionsFor(articleId);
  assert.equal(rounds.length, 2);
  assert.deepEqual(rounds.map(r => r.outcome), ["published", "published"]);
  assert.deepEqual(rounds.map(r => r.approved_nova_version), [1, 2]);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM articles WHERE nova_item_id = ?").get(itemId).n, 1);
});

check("a second revision cycle is supported without duplicating anything", async () => {
  const { articleId, itemId } = await publishedArticle();
  for (const version of [2, 3]) {
    const started = await startRevision("tok-a", articleId);
    assert.equal(started.status, 200, JSON.stringify(started.body));
    const edited = await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: version - 1, content: novaEnvelope(`revision-${version}`) });
    assert.equal(edited.status, 200, await edited.text());
    assert.equal((await call("POST", `/articles/${articleId}/submission`, "tok-a", {})).status, 201);
    assert.equal((await call("POST", `/editorial/submissions/${articleId}/start-review`, "tok-rev")).status, 200);
    assert.equal((await call("POST", `/editorial/submissions/${articleId}/approve`, "tok-rev")).status, 200);
    const published = await publishAs("tok-pub", articleId, {});
    assert.equal(published.status, 200, JSON.stringify(published.body));
    assert.match(articleOf(articleId).body_html, new RegExp(`revision-${version}`));
  }
  const rounds = submissionsFor(articleId);
  assert.equal(rounds.length, 3);
  assert.equal(rounds.filter(r => r.outcome === "published").length, 3);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM articles WHERE nova_item_id = ?").get(itemId).n, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM nova_items WHERE id = ?").get(itemId).n, 1);
  assert.equal(articleOf(articleId).status, "published");
  // A third cycle can still begin from the freshly published state.
  assert.equal((await startRevision("tok-a", articleId)).status, 200);
});

// ---- Legacy containment ----
check("a new normal article is created workflow-native", async () => {
  const id = `new-normal-${++counter}`;
  const res = await call("POST", "/articles", "tok-a", { id, title: "Workflow Native Article", destination: "education", articleType: "Research Paper", bodyHtml: "<p>x</p>" });
  assert.ok([200, 201].includes(res.status), JSON.stringify(res.body));
  const article = articleOf(id);
  assert.equal(article.editorial_status, "draft");
  assert.equal(article.status, "draft");
});

check("a new normal article cannot be directly published through create/update", async () => {
  const id = `new-published-${++counter}`;
  const res = await call("POST", "/articles", "tok-a", { id, title: "Trying To Publish", destination: "education", status: "published" });
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  assert.equal(articleOf(id), undefined);
});

check("a grandfathered legacy article keeps direct-publish compatibility", async () => {
  const seeded = seedArticle({ editorial: "legacy", status: "draft" });
  const res = await call("POST", "/articles", "tok-a", { id: seeded.articleId, title: seeded.title, destination: "education", status: "published", bodyHtml: "<p>legacy</p>" });
  assert.ok([200, 201].includes(res.status), JSON.stringify(res.body));
  const article = articleOf(seeded.articleId);
  assert.equal(article.status, "published");
  assert.equal(article.editorial_status, "legacy");
});

check("an enrolled legacy article cannot return to direct publish", async () => {
  const seeded = seedArticle({ editorial: "legacy", status: "draft" });
  // Enrolment happens through Submit for Review, which is one-way.
  const submitted = await call("POST", `/articles/${seeded.articleId}/submission`, "tok-a", {});
  assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
  assert.equal(articleOf(seeded.articleId).editorial_status, "submitted");
  const res = await call("POST", "/articles", "tok-a", { id: seeded.articleId, title: seeded.title, destination: "education", status: "published" });
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.equal(res.body.code, "editorial_workflow_publish_refused");
  assert.equal(articleOf(seeded.articleId).status, "draft");
  const events = eventsFor(seeded.articleId).map(e => e.event_type);
  assert.ok(events.includes("entered_workflow"));
});

check("an admin without editorial_publish cannot publish enrolled content", async () => {
  const { articleId } = await approvedArticle();
  const res = await publishAs("tok-admin", articleId, {});
  assert.equal(res.status, 403, JSON.stringify(res.body));
  assert.equal(res.body.code, "editorial_publish_required");
  assert.equal(articleOf(articleId).status, "draft");
  // The Contributor cannot self-publish through the same route either.
  const self = await publishAs("tok-a", articleId, {});
  assert.ok([403, 409].includes(self.status), JSON.stringify(self.body));
  assert.equal(articleOf(articleId).status, "draft");
});

check("TPI Video keeps its separate publish path and never joins the workflow", async () => {
  counter += 1;
  const id = `video-${counter}`;
  sqlite.prepare("INSERT INTO articles (id, created_by, status, destination, article_type, title, author, href) VALUES (?, ?, 'draft', 'tpi-videos.html', 'TPI Video', 'Synthetic Video', 'Alice Contributor', ?)")
    .run(id, OWNER, `published-article.html?id=${id}`);
  const submitted = await call("POST", `/articles/${id}/submission`, "tok-a", {});
  assert.equal(submitted.status, 409, JSON.stringify(submitted.body));
  assert.equal(submitted.body.code, "editorial_workflow_not_applicable");
  const direct = await call("POST", "/articles", "tok-a", { id, title: "Synthetic Video", destination: "tpi-videos.html", articleType: "TPI Video", status: "published" });
  assert.ok([200, 201].includes(direct.status), JSON.stringify(direct.body));
  assert.equal(articleOf(id).status, "published");
});

check("the contributor read model exposes publication and Start New Revision availability", async () => {
  const { articleId } = await publishedArticle();
  const before = await readModel("tok-a");
  assert.equal(before.status, 200, JSON.stringify(before.body));
  const row = before.body.articles.find(a => a.id === articleId);
  assert.equal(row.publicationStatus, "published");
  assert.equal(row.canStartRevision, true);
  assert.equal(row.publishedNovaVersion, 1);
  await startRevision("tok-a", articleId);
  const after = await readModel("tok-a");
  const rowAfter = after.body.articles.find(a => a.id === articleId);
  assert.equal(rowAfter.publicationStatus, "published");
  assert.equal(rowAfter.canStartRevision, false);
});

check("Nova retention never trims a version pinned by editorial history", async () => {
  counter += 1;
  const itemId = `nova-retention-${counter}`;
  const articleId = `art-retention-${counter}`;
  sqlite.prepare("INSERT INTO nova_items (id, owner_id, type, title, content_json, content_bytes, version) VALUES (?, ?, 'nova-document', 'Retention', ?, 16, 60)")
    .run(itemId, OWNER, docText("retention"));
  sqlite.prepare("INSERT INTO articles (id, created_by, status, nova_item_id, title, author, href) VALUES (?, ?, 'published', ?, 'Retention', 'Alice Contributor', ?)")
    .run(articleId, OWNER, itemId, `published-article.html?id=${articleId}`);
  for (let n = 1; n <= 60; n += 1) {
    sqlite.prepare("INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, format_version, content_json, content_bytes) VALUES (?, ?, ?, ?, 'Retention', 1, ?, 16)")
      .run(`${itemId}-${n}`, itemId, OWNER, n, docText(`rev-${n}`));
  }
  // Editorial history pins versions 1 and 5. Version 1 is what published.
  sqlite.prepare("INSERT INTO article_editorial_submissions (id, article_id, nova_item_id, submitted_by, submitted_at, submitted_nova_version, submitted_destination, submitted_article_type, outcome, created_at, updated_at) VALUES ('sub-ret-1', ?, ?, ?, '2026-01-01T00:00:00Z', 1, 'education', 'Research Paper', 'published', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')")
    .run(articleId, itemId, OWNER);
  sqlite.prepare("INSERT INTO article_editorial_submissions (id, article_id, nova_item_id, submitted_by, submitted_at, submitted_nova_version, approved_nova_version, submitted_destination, submitted_article_type, outcome, created_at, updated_at) VALUES ('sub-ret-2', ?, ?, ?, '2026-01-02T00:00:00Z', 5, 5, 'education', 'Research Paper', 'withdrawn', '2026-01-02T00:00:00Z', '2026-01-02T00:00:00Z')")
    .run(articleId, itemId, OWNER);
  // A normal edit advances to 61 and triggers the ordinary 50-revision trim.
  const edited = await updateNovaItemForOwner(env, { id: OWNER }, itemId, { expectedVersion: 60, content: novaEnvelope("retention-next") });
  assert.equal(edited.status, 200, await edited.text());
  const remaining = sqlite.prepare("SELECT revision_number FROM nova_revisions WHERE item_id = ? ORDER BY revision_number").all(itemId).map(r => r.revision_number);
  assert.ok(remaining.includes(1), "the published version must survive retention");
  assert.ok(remaining.includes(5), "an approved version must survive retention");
  assert.ok(remaining.includes(61));
  assert.ok(!remaining.includes(2), "unpinned old revisions are still trimmed");
});

// (added below)

await run();

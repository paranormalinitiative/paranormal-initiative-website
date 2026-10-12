import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { onRequest } from "../../functions/api/[[path]].js";

const db = new DatabaseSync(":memory:");
db.exec(`
  CREATE TABLE contributors (
    id TEXT PRIMARY KEY, username TEXT NOT NULL, password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE sessions (token TEXT PRIMARY KEY, contributor_id TEXT NOT NULL, expires_at TEXT NOT NULL);
  CREATE TABLE community_categories (id TEXT PRIMARY KEY, title TEXT NOT NULL);
  CREATE TABLE community_posts (
    id TEXT PRIMARY KEY, category_id TEXT NOT NULL, author_id TEXT, title TEXT NOT NULL,
    body TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE community_comments (
    id TEXT PRIMARY KEY, post_id TEXT NOT NULL, author_id TEXT, body TEXT NOT NULL,
    status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE community_reactions (
    id TEXT PRIMARY KEY, target_type TEXT NOT NULL, target_id TEXT NOT NULL,
    contributor_id TEXT, reaction TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE tpi_videos (id TEXT PRIMARY KEY, title TEXT NOT NULL);
  CREATE TABLE video_reports (
    id TEXT PRIMARY KEY, video_id TEXT NOT NULL, contributor_id TEXT, reason TEXT NOT NULL,
    details TEXT DEFAULT '', status TEXT NOT NULL, created_at TEXT NOT NULL,
    reviewed_at TEXT, reviewed_by TEXT
  );
  CREATE TABLE messenger_reports (
    id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, reported_contributor_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL, reason TEXT NOT NULL, details TEXT, status TEXT NOT NULL,
    created_at TEXT NOT NULL, reviewed_at TEXT, reviewed_by TEXT
  );
  CREATE TABLE admin_audit_logs (
    id TEXT PRIMARY KEY, actor_id TEXT, actor_username TEXT NOT NULL, actor_role TEXT NOT NULL,
    action TEXT NOT NULL, target_type TEXT, target_id TEXT, metadata_json TEXT, created_at TEXT NOT NULL
  );
  INSERT INTO contributors VALUES
    ('admin-id', 'admin', 'unused', 'Admin Tester', 'admin', 1),
    ('member-id', 'member', 'unused', 'Member Tester', 'member', 1);
  INSERT INTO sessions VALUES ('admin-session', 'admin-id', '2099-01-01'), ('member-session', 'member-id', '2099-01-01');
  INSERT INTO community_categories VALUES ('general', 'General');
  INSERT INTO community_posts VALUES ('post-1', 'general', 'member-id', 'Night Investigation', 'Parent post body.', 'visible', '2026-10-10T10:00:00', '2026-10-10T10:00:00');
  INSERT INTO community_comments VALUES ('comment-1', 'post-1', 'admin-id', 'Real comment body.', 'visible', '2026-10-10T11:00:00', '2026-10-10T11:00:00');
  INSERT INTO community_reactions VALUES ('reaction-1', 'comment', 'comment-1', 'member-id', 'helpful', '2026-10-10T12:00:00');
  INSERT INTO tpi_videos VALUES ('video-1', 'Published test video');
  INSERT INTO video_reports VALUES ('video-report-1', 'video-1', 'member-id', 'Inaccurate description', 'details withheld from queue', 'open', '2026-10-11T12:00:00', NULL, NULL);
  INSERT INTO admin_audit_logs VALUES ('audit-1', 'admin-id', 'admin', 'admin', 'report.reviewed', 'video_report', 'video-report-1', '{"reason":"checked metadata"}', '2026-10-11T13:00:00');
`);

const env = {
  TPI_DB: {
    prepare(sql) {
      return { bind(...args) {
        return {
          async first() { return db.prepare(sql).get(...args) || null; },
          async all() { return { results: db.prepare(sql).all(...args) }; },
          async run() { return db.prepare(sql).run(...args); }
        };
      }};
    }
  }
};

async function call(path, session) {
  const headers = new Headers();
  if (session) headers.set("Cookie", `tpi_session=${session}`);
  return onRequest({
    request: new Request(`http://admin-contract.test/api${path}`, { headers }),
    env,
    params: { path: path.split("?")[0].slice(1).split("/") }
  });
}

assert.equal((await call("/admin/community/comments/comment-1", null)).status, 403);
const comments = await call("/admin/community/comments?author=admin&sort=created&direction=asc", "admin-session");
assert.equal(comments.status, 200);
const commentsBody = await comments.json();
assert.equal(commentsBody.comments[0].id, "comment-1");
assert.equal(commentsBody.filters.author, "admin");
assert.equal(commentsBody.filters.direction, "asc");

const commentDetail = await call("/admin/community/comments/comment-1", "admin-session");
assert.equal(commentDetail.status, 200);
const commentDetailBody = await commentDetail.json();
assert.equal(commentDetailBody.comment.body, "Real comment body.");
assert.equal(commentDetailBody.comment.postTitle, "Night Investigation");
assert.equal(commentDetailBody.reactions[0].reaction, "helpful");
assert.equal(commentDetailBody.repliesAvailable, false);
assert.equal(commentDetailBody.reportsAvailable, false);

const reports = await call("/admin/reports?type=video&sort=created&direction=asc", "admin-session");
assert.equal(reports.status, 200);
const reportsBody = await reports.json();
assert.equal(reportsBody.reports[0].id, "video-report-1");
assert.equal(reportsBody.filters.type, "video");

const reportDetail = await call("/admin/reports/video/video-report-1", "admin-session");
assert.equal(reportDetail.status, 200);
const reportDetailBody = await reportDetail.json();
assert.equal(reportDetailBody.report.contentLabel, "Published test video");
assert.equal(reportDetailBody.history[0].action, "report.reviewed");
assert.equal(reportDetailBody.privateEvidence, false);

console.log("PASS Comments/reports contract: unauthorized detail denied; admin comment filters/detail preserve parent-post, reaction, reply, and report boundaries; supported video report list/detail returns metadata and audit history.");

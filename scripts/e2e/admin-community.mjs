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
  INSERT INTO contributors VALUES
    ('admin-id', 'admin', 'unused', 'Admin Tester', 'admin', 1),
    ('member-id', 'member', 'unused', 'Member Tester', 'member', 1);
  INSERT INTO sessions VALUES ('admin-session', 'admin-id', '2099-01-01'), ('member-session', 'member-id', '2099-01-01');
  INSERT INTO community_categories VALUES ('general', 'General');
  INSERT INTO community_posts VALUES ('post-1', 'general', 'member-id', 'Night Investigation', 'Real post body for detail verification.', 'visible', '2026-10-10T10:00:00', '2026-10-10T10:00:00');
  INSERT INTO community_comments VALUES ('comment-1', 'post-1', 'admin-id', 'A real associated comment.', 'visible', '2026-10-10T11:00:00', '2026-10-10T11:00:00');
  INSERT INTO community_reactions VALUES ('reaction-1', 'post', 'post-1', 'admin-id', 'insightful', '2026-10-10T12:00:00');
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
    request: new Request(`http://community-admin.test/api${path}`, { headers }),
    env,
    params: { path: path.split("?")[0].slice(1).split("/") }
  });
}

assert.equal((await call("/admin/community/posts/post-1", null)).status, 403);
assert.equal((await call("/admin/community/posts/post-1", "member-session")).status, 403);

const list = await call("/admin/community/posts?author=member&sort=created&direction=asc", "admin-session");
assert.equal(list.status, 200);
const listBody = await list.json();
assert.equal(listBody.posts[0].id, "post-1");
assert.equal(listBody.filters.author, "member");
assert.equal(listBody.filters.direction, "asc");

const detail = await call("/admin/community/posts/post-1", "admin-session");
assert.equal(detail.status, 200);
const detailBody = await detail.json();
assert.equal(detailBody.post.body, "Real post body for detail verification.");
assert.equal(detailBody.comments[0].id, "comment-1");
assert.equal(detailBody.reactions[0].reaction, "insightful");
assert.equal(detailBody.reportsAvailable, false);
assert.match(detailBody.reportsNote, /separate/);

console.log("PASS Community admin contract: anonymous/member denied; admin author filter and sort work; protected post detail returns post, comments, reactions, and explicit unsupported-report boundary.");

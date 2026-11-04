// TPI-NOVA-004R2: regression coverage for Content Editor article ownership.
// Drives the real Pages Function router against an in-memory D1 stand-in.
import { onRequest } from "../../functions/api/[[path]].js";

const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });

function createFakeDb() {
  const sessions = new Map([
    ["token-a", "user-a"],
    ["token-b", "user-b"],
    ["token-admin", "user-admin"]
  ]);
  const contributors = new Map([
    ["user-a", { id: "user-a", username: "alice", display_name: "Alice", role: "contributor", active: 1 }],
    ["user-b", { id: "user-b", username: "bob", display_name: "Bob", role: "contributor", active: 1 }],
    ["user-admin", { id: "user-admin", username: "owner", display_name: "Owner", role: "owner", active: 1 }]
  ]);
  const articles = new Map();
  let clock = 0;
  const now = () => `2026-11-04 00:00:${String(++clock).padStart(2, "0")}`;

  const prepare = sql => {
    const statement = {
      bind(...args) {
        statement.args = args;
        return statement;
      },
      async first() {
        if (/FROM sessions s/.test(sql)) {
          const userId = sessions.get(statement.args[0]);
          return userId ? { ...contributors.get(userId) } : null;
        }
        if (/SELECT status, created_by FROM articles/.test(sql)) {
          const row = articles.get(statement.args[0]);
          return row ? { status: row.status, created_by: row.created_by } : null;
        }
        if (/SELECT \* FROM articles WHERE id/.test(sql)) {
          return articles.get(statement.args[0]) ? { ...articles.get(statement.args[0]) } : null;
        }
        if (/FROM articles WHERE id/.test(sql)) {
          return articles.get(statement.args[0]) ? { ...articles.get(statement.args[0]) } : null;
        }
        if (/FROM admin_audit_logs/.test(sql) || /INSERT INTO admin_audit_logs/.test(sql)) return null;
        return null;
      },
      async all() {
        return { results: [] };
      },
      async run() {
        if (/^\s*INSERT INTO articles/.test(sql)) {
          const [id, destination, href, title, subtitle, articleType, author, source, bodyHtml, articleHtml, labels, status, createdBy] = statement.args;
          const existing = articles.get(id);
          if (!existing) {
            articles.set(id, { id, destination, href, title, subtitle, article_type: articleType, author, source, body_html: bodyHtml, article_html: articleHtml, labels, status, created_by: createdBy, updated_at: now() });
            return { meta: { changes: 1 } };
          }
          // Mirrors the production ON CONFLICT ... DO UPDATE ... WHERE created_by = excluded.created_by.
          if (existing.created_by !== createdBy) return { meta: { changes: 0 } };
          Object.assign(existing, {
            destination, href, title, subtitle, article_type: articleType, author, source,
            body_html: bodyHtml, article_html: articleHtml, labels, status, updated_at: now()
          });
          return { meta: { changes: 1 } };
        }
        if (/^\s*UPDATE articles/.test(sql)) {
          const [destination, href, title, subtitle, articleType, author, source, bodyHtml, articleHtml, labels, id, expected] = statement.args;
          const row = articles.get(id);
          if (!row || row.updated_at !== expected) return { meta: { changes: 0 } };
          Object.assign(row, { destination, href, title, subtitle, article_type: articleType, author, source, body_html: bodyHtml, article_html: articleHtml, labels, updated_at: now() });
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      }
    };
    return statement;
  };

  return { DB: { prepare }, articles, sessions };
}

function makeEnv(db) {
  return { TPI_DB: db.DB };
}

function request(method, path, token, body) {
  const headers = { "Content-Type": "application/json", Origin: "https://example.test" };
  if (token) headers.Cookie = `tpi_session=${token}`;
  return new Request(`https://example.test/api/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

async function call(env, method, path, token, body) {
  const req = request(method, path, token, body);
  const res = await onRequest({ request: req, env, params: { path: path.split("/") } });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, json };
}

const draftPayload = (overrides = {}) => ({
  id: "article-a",
  status: "draft",
  destination: "field-articles.html",
  title: "Alice draft",
  subtitle: "Sub",
  contributionType: "Field Article",
  author: "Alice",
  bodyHtml: "<p>Original body</p>",
  articleHtml: "<article>Original</article>",
  ...overrides
});

const publishPayload = (overrides = {}) => draftPayload({ status: "published", title: "Alice published", ...overrides });

const snapshot = row => JSON.stringify({
  title: row.title, body: row.body_html, article: row.article_html, destination: row.destination,
  status: row.status, created_by: row.created_by, href: row.href, article_type: row.article_type
});

async function main() {
  // Legitimate create by User A.
  {
    const db = createFakeDb();
    const env = makeEnv(db);
    const created = await call(env, "POST", "articles", "token-a", draftPayload());
    check("legitimate contributor can create a new article", created.status === 200 && db.articles.get("article-a")?.created_by === "user-a", `status ${created.status}`);
  }

  // Legitimate owner update: autosave, title/body, destination, type, publish.
  {
    const db = createFakeDb();
    const env = makeEnv(db);
    await call(env, "POST", "articles", "token-a", draftPayload());
    const autosave = await call(env, "POST", "articles", "token-a", draftPayload({ title: "Alice revised", bodyHtml: "<p>Edited</p>" }));
    check("owner autosave of an existing draft succeeds", autosave.status === 200 && db.articles.get("article-a").title === "Alice revised");
    const retarget = await call(env, "POST", "articles", "token-a", draftPayload({ destination: "ghostology-101.html", contributionType: "Research Note" }));
    const row = db.articles.get("article-a");
    check("owner can change destination and contribution type", retarget.status === 200 && row.destination === "ghostology-101.html" && row.article_type === "Research Note");
    const publish = await call(env, "POST", "articles", "token-a", publishPayload());
    check("owner can publish under the legacy workflow", publish.status === 200 && db.articles.get("article-a").status === "published");
    check("owner publish keeps created_by unchanged", db.articles.get("article-a").created_by === "user-a");
  }

  // Foreign-ID overwrite: User B submits User A's id.
  {
    const db = createFakeDb();
    const env = makeEnv(db);
    await call(env, "POST", "articles", "token-a", draftPayload());
    const before = snapshot(db.articles.get("article-a"));

    const draftAttack = await call(env, "POST", "articles", "token-b", draftPayload({ title: "Hijacked draft", bodyHtml: "<p>Owned by Bob</p>", destination: "tpi-videos.html" }));
    check("foreign draft overwrite is rejected", draftAttack.status === 403, `status ${draftAttack.status}`);
    check("foreign draft overwrite leaves article A unchanged", snapshot(db.articles.get("article-a")) === before);
    check("foreign draft overwrite preserves created_by", db.articles.get("article-a").created_by === "user-a");

    const publishAttack = await call(env, "POST", "articles", "token-b", publishPayload({ title: "Hijacked published", bodyHtml: "<p>Bob publish</p>" }));
    check("foreign publish overwrite is rejected", publishAttack.status === 403, `status ${publishAttack.status}`);
    check("foreign publish overwrite leaves article A unchanged", snapshot(db.articles.get("article-a")) === before);
    check("foreign publish overwrite preserves status and created_by", db.articles.get("article-a").status === "draft" && db.articles.get("article-a").created_by === "user-a");
  }

  // Administrator management remains functional, separate from contributor ownership.
  {
    const db = createFakeDb();
    const env = makeEnv(db);
    await call(env, "POST", "articles", "token-a", draftPayload());
    const admin = await call(env, "GET", "admin/articles", "token-admin");
    check("administrator article list still works", admin.status === 200 && Array.isArray(admin.json?.articles), `status ${admin.status}`);
    const adminUpdate = await call(env, "POST", "admin/articles/article-a", "token-admin", { bodyHtml: "<p>Admin fix</p>" });
    check("administrator update route is not blocked by contributor rules", adminUpdate.status !== 403, `status ${adminUpdate.status}`);
  }

  // Unauthenticated writes are still rejected.
  {
    const db = createFakeDb();
    const env = makeEnv(db);
    const anon = await call(env, "POST", "articles", null, draftPayload());
    check("unauthenticated create is rejected", anon.status === 401, `status ${anon.status}`);
  }

  const failed = checks.filter(item => !item.ok);
  console.log(JSON.stringify({ passed: checks.length - failed.length, failed: failed.length, checks }, null, 2));
  if (failed.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

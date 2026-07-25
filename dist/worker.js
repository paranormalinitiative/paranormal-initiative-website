var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// functions/api/[[path]].js
var SESSION_COOKIE = "tpi_session";
async function onRequest(context) {
  const { request, env, params } = context;
  const routePath = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const path = `/${routePath}`;
  if (!env.TPI_DB) {
    return json({ error: "D1 database binding TPI_DB is not configured." }, 500);
  }
  try {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method === "GET" && path === "/auth/me") return handleMe(request, env);
    if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env);
    if (request.method === "POST" && path === "/auth/logout") return handleLogout();
    if (request.method === "POST" && path === "/owner/bootstrap") return handleOwnerBootstrap(request, env);
    if (request.method === "GET" && path === "/invites") return requireAdmin(request, env, (user) => handleListInvites(env, user));
    if (request.method === "POST" && path === "/invites") return requireAdmin(request, env, (user) => handleCreateInvite(request, env, user));
    if (request.method === "POST" && path === "/invites/check") return handleCheckInvite(request, env);
    if (request.method === "POST" && path === "/contributors/register") return handleRegister(request, env);
    if (request.method === "POST" && path === "/contributors/me/profile") return requireContributor(request, env, (user) => handleUpdateProfile(request, env, user));
    if (request.method === "GET" && path === "/contributors/me/articles") return requireContributor(request, env, (user) => handleContributorArticles(env, user));
    if (request.method === "GET" && path === "/contributors/profile") return handlePublicContributorProfile(request, env);
    if (request.method === "POST" && path === "/uploads/profile-photo") return requireContributor(request, env, (user) => handleProfilePhotoUpload(request, env, user));
    if (request.method === "POST" && path === "/uploads/article-media") return requireContributor(request, env, (user) => handleArticleMediaUpload(request, env, user));
    if (request.method === "GET" && path.startsWith("/media/")) return handleMediaRequest(path, env);
    if (request.method === "GET" && path === "/articles") return handleListArticles(request, env);
    if (request.method === "POST" && path === "/articles") return requireContributor(request, env, (user) => handleCreateArticle(request, env, user));
    if (request.method === "GET" && path === "/comments") return handleListComments(request, env);
    if (request.method === "POST" && path === "/comments") return handleCreateComment(request, env);
    return json({ error: "Not found." }, 404);
  } catch (error) {
    return json({ error: error.message || "Request failed." }, 500);
  }
}
__name(onRequest, "onRequest");
async function handleOwnerBootstrap(request, env) {
  const data = await readJson(request);
  if (!env.TPI_OWNER_SETUP_KEY || data.setupKey !== env.TPI_OWNER_SETUP_KEY) {
    return json({ error: "Owner setup key did not match." }, 403);
  }
  const username = clean(data.username || "tpi-owner");
  const password = String(data.password || "");
  if (!username || !password) return json({ error: "Username and password are required." }, 400);
  const user = await getUserByUsername(env, username);
  const payload = [
    user?.id || crypto.randomUUID(),
    username,
    await hashPassword(password),
    clean(data.displayName || "Todd Wayne"),
    clean(data.title || "Site Owner / Administrator"),
    "owner",
    clean(data.correspondence || "paranormalinitiative@yahoo.com"),
    clean(data.affiliation || "The Paranormal Initiative - Applied Paranormal Research and Studies"),
    clean(data.organization || "Somerset Paranormal Research Society"),
    clean(data.website || ""),
    clean(data.bio || ""),
    clean(data.photoUrl || "")
  ];
  await env.TPI_DB.prepare(`
    INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, bio, photo_url, comment_signature_enabled, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      display_name = excluded.display_name,
      title = excluded.title,
      role = 'owner',
      correspondence = excluded.correspondence,
      affiliation = excluded.affiliation,
      organization = excluded.organization,
      website = excluded.website,
      bio = excluded.bio,
      photo_url = excluded.photo_url,
      active = 1
  `).bind(...payload).run();
  return json({ ok: true });
}
__name(handleOwnerBootstrap, "handleOwnerBootstrap");
async function handleLogin(request, env) {
  const data = await readJson(request);
  const username = clean(data.username);
  const password = String(data.password || "");
  const user = await getUserByUsername(env, username);
  if (!user || !user.active || user.password_hash !== await hashPassword(password)) {
    return json({ error: "Username or password did not match." }, 401);
  }
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1e3 * 60 * 60 * 24 * 14).toISOString();
  await env.TPI_DB.prepare("INSERT INTO sessions (token, contributor_id, expires_at) VALUES (?, ?, ?)").bind(token, user.id, expires).run();
  return json({ user: publicUser(user) }, 200, {
    "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}`
  });
}
__name(handleLogin, "handleLogin");
async function handleLogout() {
  return json({ ok: true }, 200, {
    "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  });
}
__name(handleLogout, "handleLogout");
async function handleMe(request, env) {
  const user = await getSessionUser(request, env);
  return json({ user: user ? publicUser(user) : null });
}
__name(handleMe, "handleMe");
async function handleCreateInvite(request, env, user) {
  const data = await readJson(request);
  const code = clean(data.code || makeInviteCode());
  const role = ["owner", "admin", "contributor"].includes(data.role) ? data.role : "contributor";
  if (!code) return json({ error: "Invite code is required." }, 400);
  await env.TPI_DB.prepare("INSERT INTO invite_codes (code, role, created_by) VALUES (?, ?, ?)").bind(code, role, user.id).run();
  return json({ invite: { code, role, used: false } });
}
__name(handleCreateInvite, "handleCreateInvite");
async function handleListInvites(env) {
  const { results } = await env.TPI_DB.prepare("SELECT code, role, used, used_by, used_at, created_at FROM invite_codes ORDER BY created_at DESC").all();
  return json({ invites: results });
}
__name(handleListInvites, "handleListInvites");
async function handleCheckInvite(request, env) {
  const data = await readJson(request);
  const invite = await getOpenInvite(env, clean(data.code));
  if (!invite) return json({ error: "Invite code was not found or has already been used." }, 404);
  return json({ invite: { code: invite.code, role: invite.role } });
}
__name(handleCheckInvite, "handleCheckInvite");
async function handleRegister(request, env) {
  const data = await readJson(request);
  const invite = await getOpenInvite(env, clean(data.inviteCode));
  if (!invite) return json({ error: "Invite code was not found or has already been used." }, 404);
  const username = clean(data.username);
  const password = String(data.password || "");
  if (!username || !password || !clean(data.displayName)) {
    return json({ error: "Display name, username, and password are required." }, 400);
  }
  if (await getUserByUsername(env, username)) return json({ error: "That username already exists." }, 409);
  const id = crypto.randomUUID();
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`
      INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, bio, photo_url, comment_signature_enabled, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      id,
      username,
      await hashPassword(password),
      clean(data.displayName),
      clean(data.title),
      invite.role,
      clean(data.correspondence),
      clean(data.affiliation),
      clean(data.organization),
      clean(data.website),
      clean(data.bio),
      clean(data.photoUrl),
      data.commentSignatureEnabled === false ? 0 : 1
    ),
    env.TPI_DB.prepare("UPDATE invite_codes SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP WHERE code = ?").bind(username, invite.code)
  ]);
  return json({ ok: true });
}
__name(handleRegister, "handleRegister");
async function handleUpdateProfile(request, env, user) {
  const data = await readJson(request);
  await env.TPI_DB.prepare(`
    UPDATE contributors SET
      display_name = ?,
      title = ?,
      correspondence = ?,
      affiliation = ?,
      organization = ?,
      website = ?,
      bio = ?,
      photo_url = ?,
      comment_signature_enabled = ?
    WHERE id = ?
  `).bind(
    clean(data.displayName || user.display_name),
    clean(data.title).slice(0, 160),
    clean(data.correspondence),
    clean(data.affiliation),
    clean(data.organization),
    clean(data.website),
    clean(data.bio),
    clean(data.photoUrl),
    data.commentSignatureEnabled === false ? 0 : 1,
    user.id
  ).run();
  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ user: publicUser(updated) });
}
__name(handleUpdateProfile, "handleUpdateProfile");
async function handleProfilePhotoUpload(request, env, user) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const upload = await readUploadFile(request);
  if (!upload) return json({ error: "Choose a profile photo to upload." }, 400);
  if (!upload.type.startsWith("image/")) return json({ error: "Profile photo must be an image file." }, 400);
  const key = makeMediaKey("profiles", user.username, upload.name, upload.type);
  await env.TPI_MEDIA.put(key, upload.body, {
    httpMetadata: { contentType: upload.type },
    customMetadata: { contributorId: user.id, purpose: "profile-photo" }
  });
  const url = `/api/media/${key}`;
  await env.TPI_DB.prepare("UPDATE contributors SET photo_url = ? WHERE id = ?").bind(url, user.id).run();
  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ url, key, user: publicUser(updated) });
}
__name(handleProfilePhotoUpload, "handleProfilePhotoUpload");
async function handleArticleMediaUpload(request, env, user) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const upload = await readUploadFile(request);
  if (!upload) return json({ error: "Choose a media file to upload." }, 400);
  const allowed = [
    "image/",
    "video/",
    "audio/",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];
  if (!allowed.some((prefix) => upload.type === prefix || upload.type.startsWith(prefix))) {
    return json({ error: "That file type is not allowed for article media." }, 400);
  }
  const key = makeMediaKey("articles", user.username, upload.name, upload.type);
  await env.TPI_MEDIA.put(key, upload.body, {
    httpMetadata: { contentType: upload.type },
    customMetadata: { contributorId: user.id, purpose: "article-media" }
  });
  return json({ url: `/api/media/${key}`, key, contentType: upload.type, name: upload.name });
}
__name(handleArticleMediaUpload, "handleArticleMediaUpload");
async function handleMediaRequest(path, env) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const key = decodeURIComponent(path.replace(/^\/media\//, ""));
  if (!key || key.includes("..")) return json({ error: "Media key is invalid." }, 400);
  const object = await env.TPI_MEDIA.get(key);
  if (!object) return json({ error: "Media file not found." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'none'");
  return new Response(object.body, { headers });
}
__name(handleMediaRequest, "handleMediaRequest");
async function handleCreateArticle(request, env, user) {
  const data = await readJson(request);
  const id = clean(data.id || crypto.randomUUID());
  await env.TPI_DB.prepare(`
    INSERT INTO articles (id, destination, href, title, subtitle, author, source, body_html, article_html, labels, status, created_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      destination = excluded.destination,
      href = excluded.href,
      title = excluded.title,
      subtitle = excluded.subtitle,
      author = excluded.author,
      source = excluded.source,
      body_html = excluded.body_html,
      article_html = excluded.article_html,
      labels = excluded.labels,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    clean(data.destination),
    clean(data.href),
    clean(data.title || "Untitled Research Paper"),
    clean(data.subtitle),
    clean(data.author),
    clean(data.source),
    String(data.bodyHtml || ""),
    String(data.articleHtml || ""),
    clean(data.labels),
    data.status === "published" ? "published" : "draft",
    user.id
  ).run();
  return json({ article: { id, href: data.href, destination: data.destination, title: data.title, subtitle: data.subtitle } });
}
__name(handleCreateArticle, "handleCreateArticle");
async function handleListArticles(request, env) {
  const url = new URL(request.url);
  const destination = url.searchParams.get("destination");
  const stmt = destination ? env.TPI_DB.prepare("SELECT id, destination, href, title, subtitle, author, source, body_html AS bodyHtml, article_html AS articleHtml, labels, status, created_at AS createdAt FROM articles WHERE destination = ? AND status = 'published' ORDER BY created_at DESC").bind(destination) : env.TPI_DB.prepare("SELECT id, destination, href, title, subtitle, author, source, body_html AS bodyHtml, article_html AS articleHtml, labels, status, created_at AS createdAt FROM articles WHERE status = 'published' ORDER BY created_at DESC");
  const { results } = await stmt.all();
  return json({ articles: results });
}
__name(handleListArticles, "handleListArticles");
async function handleContributorArticles(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, destination, href, title, subtitle, author, source, body_html AS bodyHtml, article_html AS articleHtml, labels, status, created_at AS createdAt
    FROM articles
    WHERE created_by = ?
    ORDER BY created_at DESC
  `).bind(user.id).all();
  return json({ articles: results });
}
__name(handleContributorArticles, "handleContributorArticles");
async function handlePublicContributorProfile(request, env) {
  const username = clean(new URL(request.url).searchParams.get("username"));
  const user = await getUserByUsername(env, username);
  if (!user || !user.active) return json({ error: "Contributor profile not found." }, 404);
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, href, title, subtitle, destination, status, created_at AS createdAt
    FROM articles
    WHERE created_by = ? AND status = 'published'
    ORDER BY created_at DESC
  `).bind(user.id).all();
  return json({ profile: publicUser(user), articles: results });
}
__name(handlePublicContributorProfile, "handlePublicContributorProfile");
async function handleListComments(request, env) {
  const pageId = new URL(request.url).searchParams.get("pageId");
  if (!pageId) return json({ error: "pageId is required." }, 400);
  const { results } = await env.TPI_DB.prepare("SELECT id, parent_id AS parentId, name, author_title AS authorTitle, text, created_at AS createdAt FROM comments WHERE page_id = ? AND status = 'approved' ORDER BY created_at ASC").bind(pageId).all();
  const comments = results.filter((row) => !row.parentId).map((row) => ({ ...row, replies: results.filter((reply) => reply.parentId === row.id) }));
  return json({ comments });
}
__name(handleListComments, "handleListComments");
async function handleCreateComment(request, env) {
  const data = await readJson(request);
  const user = await getSessionUser(request, env);
  const id = crypto.randomUUID();
  const pageId = clean(data.pageId);
  const text = clean(data.text);
  if (!pageId || !text) return json({ error: "pageId and text are required." }, 400);
  const useContributor = Boolean(user && data.useContributorProfile !== false);
  await env.TPI_DB.prepare(`
    INSERT INTO comments (id, page_id, parent_id, name, author_title, text, contributor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    pageId,
    clean(data.parentId),
    useContributor ? user.display_name : clean(data.name),
    useContributor ? user.title || user.role : clean(data.authorTitle),
    text,
    useContributor ? user.id : null
  ).run();
  return json({ ok: true, id });
}
__name(handleCreateComment, "handleCreateComment");
async function requireContributor(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "Contributor login required." }, 401);
  return handler(user);
}
__name(requireContributor, "requireContributor");
async function requireAdmin(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user || !["owner", "admin"].includes(user.role)) return json({ error: "Owner or admin access required." }, 403);
  return handler(user);
}
__name(requireAdmin, "requireAdmin");
async function getSessionUser(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const user = await env.TPI_DB.prepare(`
    SELECT c.* FROM sessions s
    JOIN contributors c ON c.id = s.contributor_id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP AND c.active = 1
  `).bind(token).first();
  return user || null;
}
__name(getSessionUser, "getSessionUser");
async function getUserByUsername(env, username) {
  if (!username) return null;
  return env.TPI_DB.prepare("SELECT * FROM contributors WHERE username = ?").bind(username).first();
}
__name(getUserByUsername, "getUserByUsername");
async function getOpenInvite(env, code) {
  if (!code) return null;
  return env.TPI_DB.prepare("SELECT * FROM invite_codes WHERE code = ? AND used = 0").bind(code).first();
}
__name(getOpenInvite, "getOpenInvite");
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}
__name(readJson, "readJson");
async function readUploadFile(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") return null;
  return {
    name: clean(file.name || "upload"),
    type: clean(file.type || "application/octet-stream"),
    body: await file.arrayBuffer()
  };
}
__name(readUploadFile, "readUploadFile");
function clean(value) {
  return String(value || "").trim();
}
__name(clean, "clean");
function makeInviteCode() {
  return `TPI-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
__name(makeInviteCode, "makeInviteCode");
function makeMediaKey(area, username, filename, contentType) {
  const safeArea = clean(area).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "media";
  const safeUser = clean(username).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "contributor";
  const safeName = clean(filename).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-") || "upload";
  const ext = extensionFromNameOrType(safeName, contentType);
  const baseName = safeName.replace(/\.[a-z0-9]+$/, "").slice(0, 80) || "upload";
  const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return `${safeArea}/${safeUser}/${day}/${crypto.randomUUID()}-${baseName}${ext}`;
}
__name(makeMediaKey, "makeMediaKey");
function extensionFromNameOrType(filename, contentType) {
  const match = filename.match(/(\.[a-z0-9]{2,8})$/);
  if (match) return match[1];
  const type = clean(contentType);
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "video/mp4") return ".mp4";
  if (type === "audio/mpeg") return ".mp3";
  if (type === "audio/wav") return ".wav";
  if (type === "application/pdf") return ".pdf";
  if (type === "text/plain") return ".txt";
  return "";
}
__name(extensionFromNameOrType, "extensionFromNameOrType");
function publicUser(user) {
  return {
    username: user.username,
    displayName: user.display_name,
    title: user.title,
    role: user.role,
    correspondence: user.correspondence,
    affiliation: user.affiliation,
    organization: user.organization,
    website: user.website,
    bio: user.bio,
    photoUrl: user.photo_url,
    commentSignatureEnabled: Boolean(user.comment_signature_enabled)
  };
}
__name(publicUser, "publicUser");
function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}
__name(getCookie, "getCookie");
function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra
  };
}
__name(corsHeaders, "corsHeaders");
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...headers
    }
  });
}
__name(json, "json");

// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
      const apiPath = url.pathname.replace(/^\/api\/?/, "");
      return onRequest({
        request,
        env,
        ctx,
        params: {
          path: apiPath
        }
      });
    }
    return new Response("Not found", { status: 404 });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map

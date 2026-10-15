import { readFileSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV021_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const memberCredentialPath = process.env.TPI_DEV021_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-021/credentials.json";
const memberCredentials = JSON.parse(readFileSync(memberCredentialPath, "utf8"));
const memberAccounts = Object.fromEntries(memberCredentials.accounts.map(account => [account.username, account]));
const priorCredentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const priorCredentials = JSON.parse(readFileSync(priorCredentialPath, "utf8"));
const priorAccounts = Object.fromEntries(priorCredentials.accounts.map(account => [account.username, account]));

const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const elapsedMs = Math.round(performance.now() - started);
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 200); }
  return { response, body, elapsedMs, bytes: Buffer.byteLength(text) };
}

async function login(account) {
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password: account.password }) });
  const setCookie = result.response.headers.get("set-cookie") || "";
  return { ...result, cookie: setCookie.split(";")[0] };
}

function expectStatus(name, result, expected) {
  record(name, result.response.status === expected, `HTTP ${result.response.status}; expected ${expected}`);
}

function expectAnyStatus(name, result, expected) {
  record(name, expected.includes(result.response.status), `HTTP ${result.response.status}; expected ${expected.join("/")}`);
}

const publicPages = [
  "/", "/about.html", "/education-center.html", "/repository.html",
  "/haunted-location-directory/index.html", "/standards.html", "/events.html",
  "/tpi-videos.html", "/reels.html", "/community-home.html", "/search.html",
  "/member-login.html", "/early-access.html", "/advisory-board.html"
];
for (const path of publicPages) {
  const result = await request(path);
  if (result.response.status === 307) {
    const location = result.response.headers.get("location") || "";
    record(`public route ${path} canonical redirect`, Boolean(location), `location=${location || "missing"}`);
    const canonical = await request(location || path);
    expectStatus(`public route ${path} canonical target`, canonical, 200);
    record(`public route ${path} has content`, canonical.bytes > 500, `${canonical.bytes} bytes`);
  } else {
    expectStatus(`public route ${path}`, result, 200);
    record(`public route ${path} has content`, result.bytes > 500, `${result.bytes} bytes`);
  }
}

for (const path of ["/member-home", "/admin-center-preview/", "/studio/"]) {
  const result = await request(path);
  expectAnyStatus(`anonymous protected page ${path}`, result, [401, 403, 307]);
}

for (const path of [
  "/api/articles?limit=5", "/api/events?limit=5", "/api/teams?limit=5",
  "/api/teams/counts", "/api/tpi-videos?limit=5", "/api/videos?limit=5",
  "/api/community/categories", "/api/community/posts?limit=5", "/api/feed?limit=5",
  "/api/news?limit=5", "/api/contributors"
]) {
  const result = await request(path);
  expectStatus(`public API ${path}`, result, 200);
}

for (const path of ["/api/members/directory", "/api/conversations", "/api/notifications", "/api/me/pulse", "/api/admin/overview"]) {
  const result = await request(path);
  expectAnyStatus(`anonymous protected API ${path}`, result, [401, 403]);
}

const memberA = await login(memberAccounts["tpi-dev021-a"]);
const memberB = await login(memberAccounts["tpi-dev021-b"]);
expectStatus("member A login", memberA, 200);
expectStatus("member B login", memberB, 200);
const cookieA = memberA.cookie;
const cookieB = memberB.cookie;

const wrongPassword = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: "tpi-dev021-a", password: `${memberAccounts["tpi-dev021-a"].password}-invalid` }) });
expectStatus("invalid password rejected", wrongPassword, 401);

for (const path of [
  "/api/auth/me", "/api/members/directory", "/api/me/personalization", "/api/me/blocked-users",
  "/api/notifications", "/api/notifications/unread-count", "/api/notifications/preferences",
  "/api/conversations", "/api/conversations/unread-count", "/api/me/pulse", "/api/feed/user?username=tpi-dev021-a",
  "/api/community/categories", "/api/community/posts?limit=5"
]) {
  const result = await request(path, {}, cookieA);
  expectStatus(`member A read ${path}`, result, 200);
}

const authBefore = await request("/api/auth/me", {}, cookieA);
const originalUser = authBefore.body?.user || {};
const profileUpdate = await request("/api/contributors/me/profile", {
  method: "POST",
  body: JSON.stringify({
    displayName: originalUser.displayName,
    title: originalUser.title || "Synthetic audit member",
    correspondence: originalUser.correspondence,
    contactName: originalUser.contactName || originalUser.displayName,
    phone: originalUser.phone || "",
    addressLine1: originalUser.addressLine1 || "",
    addressLine2: originalUser.addressLine2 || "",
    city: originalUser.city || "",
    state: originalUser.state || "",
    postalCode: originalUser.postalCode || "",
    affiliation: originalUser.affiliation || "",
    organization: originalUser.organization || "TPI-DEV-021 synthetic audit fixture",
    website: originalUser.website || "https://example.invalid/tpi-dev-021",
    bio: "TPI-DEV-021 temporary profile persistence check.",
    photoUrl: originalUser.photoUrl || "",
    commentSignatureEnabled: originalUser.commentSignatureEnabled !== false,
    chatColor: originalUser.chatColor || "#a855f7"
  })
}, cookieA);
expectStatus("member profile update", profileUpdate, 200);
const authAfterProfile = await request("/api/auth/me", {}, cookieA);
record("member profile update persisted", authAfterProfile.body?.user?.bio === "TPI-DEV-021 temporary profile persistence check.", "bio read from session");
const profileRestore = await request("/api/contributors/me/profile", {
  method: "POST",
  body: JSON.stringify({
    displayName: originalUser.displayName,
    title: originalUser.title || "Synthetic audit member",
    correspondence: originalUser.correspondence,
    contactName: originalUser.contactName || originalUser.displayName,
    phone: originalUser.phone || "",
    addressLine1: originalUser.addressLine1 || "",
    addressLine2: originalUser.addressLine2 || "",
    city: originalUser.city || "",
    state: originalUser.state || "",
    postalCode: originalUser.postalCode || "",
    affiliation: originalUser.affiliation || "",
    organization: originalUser.organization || "TPI-DEV-021 synthetic audit fixture",
    website: originalUser.website || "https://example.invalid/tpi-dev-021",
    bio: originalUser.bio || "",
    photoUrl: originalUser.photoUrl || "",
    commentSignatureEnabled: originalUser.commentSignatureEnabled !== false,
    chatColor: originalUser.chatColor || "#a855f7"
  })
}, cookieA);
expectStatus("member profile restoration", profileRestore, 200);
const publicProfile = await request("/api/contributors/profile?username=tpi-dev021-a");
expectStatus("public member profile", publicProfile, 200);
record("public profile excludes private correspondence", !Object.prototype.hasOwnProperty.call(publicProfile.body?.profile || {}, "correspondence"), "private field absent");

const originalPrefs = await request("/api/notifications/preferences", {}, cookieA);
const prefs = Object.fromEntries((originalPrefs.body?.categories || []).map(category => [category.key, category.enabled]));
const changedPrefs = { ...prefs, posts: false };
const prefsUpdate = await request("/api/notifications/preferences", { method: "POST", body: JSON.stringify({ prefs: changedPrefs }) }, cookieA);
expectStatus("notification preferences update", prefsUpdate, 200);
const prefsRead = await request("/api/notifications/preferences", {}, cookieA);
record("notification preference persisted", prefsRead.body?.categories?.some(category => category.key === "posts" && category.enabled === false), "posts preference disabled");
const prefsRestore = await request("/api/notifications/preferences", { method: "POST", body: JSON.stringify({ prefs }) }, cookieA);
expectStatus("notification preferences restoration", prefsRestore, 200);

const post = await request("/api/community/posts", {
  method: "POST",
  body: JSON.stringify({ categoryId: "general", title: "[TPI-DEV-021] Synthetic integration post", body: "Development-only community integration fixture." })
}, cookieA);
expectStatus("community post creation", post, 200);
const postId = post.body?.postId || post.body?.post?.id;
record("community post id returned", Boolean(postId), "post identifier present");
const postUpdate = await request(`/api/community/posts/${encodeURIComponent(postId)}`, { method: "PUT", body: JSON.stringify({ title: "[TPI-DEV-021] Synthetic integration post updated", body: "Updated development-only community fixture." }) }, cookieA);
expectStatus("community post owner update", postUpdate, 200);
const unauthorizedPostUpdate = await request(`/api/community/posts/${encodeURIComponent(postId)}`, { method: "PUT", body: JSON.stringify({ title: "unauthorized" }) }, cookieB);
expectStatus("community post cross-account update denied", unauthorizedPostUpdate, 403);
const comment = await request(`/api/community/posts/${encodeURIComponent(postId)}/comments`, { method: "POST", body: JSON.stringify({ body: "Synthetic comment from member B." }) }, cookieB);
expectStatus("community comment creation", comment, 200);
const commentId = comment.body?.comment?.id;
const reaction = await request(`/api/community/posts/${encodeURIComponent(postId)}/reactions`, { method: "POST", body: JSON.stringify({ reaction: "like" }) }, cookieB);
expectStatus("community reaction add", reaction, 200);
const reactionRemove = await request(`/api/community/posts/${encodeURIComponent(postId)}/reactions`, { method: "POST", body: JSON.stringify({ reaction: "like" }) }, cookieB);
expectStatus("community reaction toggle off", reactionRemove, 200);
const comments = await request(`/api/community/posts/${encodeURIComponent(postId)}/comments`, {}, cookieA);
expectStatus("community comments read", comments, 200);
record("community comment visible to participants", comments.body?.comments?.some(item => item.id === commentId), "comment present");
const commentDelete = await request(`/api/community/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" }, cookieB);
expectStatus("community comment owner delete", commentDelete, 200);
const postDelete = await request(`/api/community/posts/${encodeURIComponent(postId)}`, { method: "DELETE" }, cookieA);
expectStatus("community post owner delete", postDelete, 200);

const conversation = await request("/api/conversations", { method: "POST", body: JSON.stringify({ direct: true, usernames: ["tpi-dev021-b"] }) }, cookieA);
expectAnyStatus("direct conversation creation or reuse", conversation, [200, 201]);
const conversationId = conversation.body?.conversation?.id;
record("conversation id returned", Boolean(conversationId), "conversation identifier present");
const message = await request(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, { method: "POST", body: JSON.stringify({ body: "TPI-DEV-021 synthetic message." }) }, cookieA);
expectStatus("message send", message, 201);
const messageId = message.body?.message?.id;
const recipientMessages = await request(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {}, cookieB);
expectStatus("recipient message read", recipientMessages, 200);
record("recipient sees sent message", recipientMessages.body?.messages?.some(item => item.id === messageId), "message present");
const unauthorizedMessageEdit = await request(`/api/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`, { method: "PUT", body: JSON.stringify({ body: "unauthorized edit" }) }, cookieB);
expectStatus("recipient cannot edit sender message", unauthorizedMessageEdit, 403);
const messageEdit = await request(`/api/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`, { method: "PUT", body: JSON.stringify({ body: "TPI-DEV-021 edited message." }) }, cookieA);
expectStatus("sender message edit", messageEdit, 200);
const markRead = await request(`/api/conversations/${encodeURIComponent(conversationId)}/read`, { method: "POST", body: JSON.stringify({}) }, cookieB);
expectStatus("recipient mark conversation read", markRead, 200);
const messageDelete = await request(`/api/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`, { method: "DELETE" }, cookieA);
expectStatus("sender message delete", messageDelete, 200);
const thirdParty = priorAccounts["tpi-dev014-member"] ? await login(priorAccounts["tpi-dev014-member"]) : null;
if (thirdParty) {
  const isolatedConversation = await request(`/api/conversations/${encodeURIComponent(conversationId)}`, {}, thirdParty.cookie);
  expectStatus("nonparticipant conversation isolation", isolatedConversation, 404);
} else {
  record("nonparticipant conversation isolation", false, "prior TPI-DEV-014 member credential unavailable");
}

const eventCreateAsMember = await request("/api/events", { method: "POST", body: JSON.stringify({ title: "[TPI-DEV-021] should be denied" }) }, cookieA);
expectAnyStatus("member cannot use admin event creation", eventCreateAsMember, [401, 403]);
const studioAsMember = await request("/studio/", {}, cookieA);
expectStatus("non-entitled member Studio boundary", studioAsMember, 403);
const studioRoomAsMember = await request("/api/studio/rooms", { method: "POST", body: JSON.stringify({ title: "should not create" }) }, cookieA);
expectStatus("non-entitled member Studio API boundary", studioRoomAsMember, 403);

const performanceTargets = ["/api/community/posts?limit=20", "/api/articles?limit=20", "/api/events?limit=20", "/api/tpi-videos?limit=20"];
for (const path of performanceTargets) {
  const result = await request(path);
  expectStatus(`performance probe ${path}`, result, 200);
  record(`performance probe ${path} under 5s`, result.elapsedMs < 5000, `${result.elapsedMs}ms`);
}

for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = results.filter(result => !result.ok);
console.log(JSON.stringify({ baseUrl, checks: results.length, passed: results.length - failed.length, failed: failed.length, fixtureNamespace: "tpi-dev021-*" }));
if (failed.length) process.exit(1);

#!/usr/bin/env node

// Bounded localhost-only API verification for TPI-OPS-010.
// It uses only the fictional accounts and fixtures created by the local-only
// setup scripts. It never contacts a hosted Worker or prints credentials.
import { existsSync, readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  throw new Error("TPI-OPS-010 QA requires the approved loopback origin http://127.0.0.1:8787");
}
const credentialPath = ".local-dev/local-auth-credentials.json";
if (!existsSync(credentialPath)) throw new Error("local authentication fixtures are missing");
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const checks = [];

function check(name, condition, detail = "") {
  if (!condition) throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  checks.push(name);
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    ...options,
    headers: { ...(options.headers || {}) },
  });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* HTML or empty body */ }
  return { response, body, text };
}

function cookieFrom(response) {
  const setCookie = response.headers.get("set-cookie") || "";
  return setCookie.match(/tpi_session=([^;]*)/)?.[1] || "";
}

function authHeaders(session) {
  return { Cookie: `tpi_session=${session.token}` };
}

async function login(key) {
  const account = credentials.accounts[key];
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: account.username, password: account.password }),
  });
  check(`${key} login`, result.response.status === 200 && Boolean(result.body?.user));
  const token = cookieFrom(result.response);
  check(`${key} session cookie`, Boolean(token));
  return { token, user: result.body.user };
}

const anonymous = await request("/api/auth/me");
check("anonymous auth/me", anonymous.response.status === 200 && anonymous.body?.user === null);
const anonymousCommunityWrite = await request("/api/community/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ categoryId: "general", title: "unauthorized", body: "should not be written" }),
});
check("anonymous community write denied", anonymousCommunityWrite.response.status === 401);

const admin = await login("local_admin");
const contributor = await login("local_contributor");
const member = await login("local_member");

for (const [key, session] of [["local_admin", admin], ["local_contributor", contributor], ["local_member", member]]) {
  const me = await request("/api/auth/me", { headers: authHeaders(session) });
  check(`${key} session resolves`, me.response.status === 200 && me.body?.user?.username === credentials.accounts[key].username);
}

// Community Feed: read, write, ownership, comments, reactions, and soft delete.
const categories = await request("/api/community/categories");
check("community categories available", categories.response.status === 200 && categories.body?.categories?.some(category => category.id === "general"));
const posts = await request("/api/community/posts?limit=50", { headers: authHeaders(member) });
check("community posts available", posts.response.status === 200 && posts.body?.posts?.some(post => post.id === "local-ops010-post"));
const generatedPost = await request("/api/community/posts", {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ categoryId: "general", title: "OPS-010 generated local post", body: "Temporary fictional service-test post." }),
});
check("member can create community post", generatedPost.response.status === 200 && Boolean(generatedPost.body?.postId));
const generatedPostId = generatedPost.body?.postId;
const crossAccountEdit = await request(`/api/community/posts/${encodeURIComponent(generatedPostId)}`, {
  method: "PUT",
  headers: { ...authHeaders(contributor), "Content-Type": "application/json" },
  body: JSON.stringify({ title: "unauthorized edit", body: "should be rejected" }),
});
check("non-owner community edit denied", crossAccountEdit.response.status === 403);
const comment = await request(`/api/community/posts/${encodeURIComponent(generatedPostId)}/comments`, {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ body: "Temporary fictional service-test comment." }),
});
check("member can comment", comment.response.status === 200 && Boolean(comment.body?.comment?.id));
const generatedCommentId = comment.body?.comment?.id;
const reaction = await request(`/api/community/posts/${encodeURIComponent(generatedPostId)}/reactions`, {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ reaction: "like" }),
});
check("member can react", reaction.response.status === 200 && reaction.body?.userReaction === "like");
const removedReaction = await request(`/api/community/posts/${encodeURIComponent(generatedPostId)}/reactions`, {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ reaction: "like" }),
});
check("member can remove reaction", removedReaction.response.status === 200 && removedReaction.body?.userReaction === null);
const removedComment = await request(`/api/community/comments/${encodeURIComponent(generatedCommentId)}`, {
  method: "DELETE",
  headers: authHeaders(member),
});
check("comment owner can soft-delete", removedComment.response.status === 200 && removedComment.body?.deleted === true);
const updatedPost = await request(`/api/community/posts/${encodeURIComponent(generatedPostId)}`, {
  method: "PUT",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ title: "OPS-010 updated local post", body: "Temporary fictional service-test post updated." }),
});
check("post owner can update", updatedPost.response.status === 200 && updatedPost.body?.ok === true);
const deletedPost = await request(`/api/community/posts/${encodeURIComponent(generatedPostId)}`, {
  method: "DELETE",
  headers: authHeaders(member),
});
check("post owner can soft-delete", deletedPost.response.status === 200 && deletedPost.body?.deleted === true);

// Messenger: participant reads/messages/read-state and non-participant isolation.
const conversations = await request("/api/conversations", { headers: authHeaders(member) });
check("member conversation list available", conversations.response.status === 200 && conversations.body?.conversations?.some(row => row.id === "local-ops010-conversation"));
const messages = await request("/api/conversations/local-ops010-conversation/messages", { headers: authHeaders(member) });
check("member can read seeded messages", messages.response.status === 200 && messages.body?.messages?.some(row => row.id === "local-ops010-message"));
const newMessage = await request("/api/conversations/local-ops010-conversation/messages", {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ body: "Temporary fictional local service-test message." }),
});
check("participant can send message", newMessage.response.status === 201 && Boolean(newMessage.body?.message?.id));
const newMessageId = newMessage.body?.message?.id;
const removedMessage = await request(`/api/conversations/local-ops010-conversation/messages/${encodeURIComponent(newMessageId)}`, {
  method: "DELETE",
  headers: authHeaders(member),
});
check("message owner can soft-delete", removedMessage.response.status === 200 && removedMessage.body?.retained === true);
const readState = await request("/api/conversations/local-ops010-conversation/read", {
  method: "POST",
  headers: authHeaders(member),
});
check("participant can persist read state", readState.response.status === 200 && readState.body?.ok === true);
const preferences = await request("/api/conversations/local-ops010-conversation/preferences", {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ theme: "midnight", quickEmoji: "👻", readReceiptsEnabled: true }),
});
check("participant can persist conversation preferences", preferences.response.status === 200 && preferences.body?.ok === true);
const hidden = await request("/api/conversations/local-ops010-conversation/hide", { method: "POST", headers: authHeaders(member) });
check("participant can hide conversation", hidden.response.status === 200 && hidden.body?.ok === true);
const unhidden = await request("/api/conversations/local-ops010-conversation/unhide", { method: "POST", headers: authHeaders(member) });
check("participant can unhide conversation", unhidden.response.status === 200 && unhidden.body?.ok === true);
const privateDenied = await request("/api/conversations/local-ops010-private-conversation/messages", { headers: authHeaders(member) });
check("non-participant cannot read private conversation", privateDenied.response.status === 404);
const privateParticipant = await request("/api/conversations/local-ops010-private-conversation/messages", { headers: authHeaders(contributor) });
check("participant can read private conversation", privateParticipant.response.status === 200 && privateParticipant.body?.messages?.some(row => row.id === "local-ops010-private-message"));

// Notifications, preferences, member directory, and personalization.
const notifications = await request("/api/notifications", { headers: authHeaders(member) });
check("member notifications available", notifications.response.status === 200 && notifications.body?.notifications?.some(row => row.id === "local-ops010-notification-unread"));
const unread = await request("/api/notifications/unread-count", { headers: authHeaders(member) });
check("notification unread count available", unread.response.status === 200 && Number(unread.body?.unreadCount) >= 1);
const marked = await request("/api/notifications/local-ops010-notification-unread/read", { method: "POST", headers: authHeaders(member) });
check("member can mark notification read", marked.response.status === 200 && marked.body?.ok === true);
const notificationPrefs = await request("/api/notifications/preferences", { headers: authHeaders(member) });
check("notification preferences available", notificationPrefs.response.status === 200 && notificationPrefs.body?.categories?.length === 6);
const savedPrefs = await request("/api/notifications/preferences", {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ prefs: { admin: true, posts: true, education: true, videos: true, photos: true, chat: true } }),
});
check("member notification preferences save", savedPrefs.response.status === 200 && savedPrefs.body?.onCount === 6);
const directory = await request("/api/members/directory", { headers: authHeaders(member) });
check("member directory available", directory.response.status === 200 && directory.body?.members?.some(row => row.username === "local_contributor"));
const personalization = await request("/api/me/personalization", { headers: authHeaders(member) });
check("member personalization available", personalization.response.status === 200 && personalization.body?.style?.highlight === "theme");
const savedPersonalization = await request("/api/me/personalization", {
  method: "POST",
  headers: { ...authHeaders(member), "Content-Type": "application/json" },
  body: JSON.stringify({ highlight: "cryptid", font: "default" }),
});
check("member personalization save", savedPersonalization.response.status === 200 && savedPersonalization.body?.style?.highlight === "cryptid");

// Navigation/authentication smoke checks remain local and non-destructive.
const root = await request("/", { headers: authHeaders(member) });
check("authenticated root returns member home", root.response.status >= 300 && root.response.status < 400 && (root.response.headers.get("location") || "").endsWith("/member-home"));
const memberHome = await request("/member-home", { headers: authHeaders(member) });
check("member home remains available", memberHome.response.status === 200 && memberHome.text.includes("TPI"));

console.log(JSON.stringify({
  status: "PASSED",
  origin: base,
  checksPassed: checks.length,
  checks,
  fictionalWrites: true,
  remoteRequests: 0,
  credentialsPrinted: false,
}));

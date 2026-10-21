#!/usr/bin/env node

// Bounded loopback-only member dashboard verification for TPI-OPS-011.
// All assertions use fictional OPS-009/OPS-010/OPS-011 local data.
import { existsSync, readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  throw new Error("TPI-OPS-011 QA requires the approved loopback origin http://127.0.0.1:8787");
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
  try { body = JSON.parse(text); } catch { /* HTML response */ }
  return { response, body, text };
}

function cookieFrom(response) {
  return (response.headers.get("set-cookie") || "").match(/tpi_session=([^;]*)/)?.[1] || "";
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

function authHeaders(session) {
  return { Cookie: `tpi_session=${session.token}` };
}

const anonymousHome = await request("/member-home");
check("anonymous member-home document is available", anonymousHome.response.status === 200 && anonymousHome.text.includes("member-home-layout"));
const anonymousAuth = await request("/api/auth/me");
check("anonymous auth state is empty", anonymousAuth.response.status === 200 && anonymousAuth.body?.user === null);
const anonymousNotifications = await request("/api/notifications");
check("anonymous notifications API is protected", anonymousNotifications.response.status === 401);
const anonymousConversations = await request("/api/conversations");
check("anonymous Messenger API is protected", anonymousConversations.response.status === 401);
const publicHome = await request("/");
check("public home remains available", publicHome.response.status === 200 && publicHome.text.includes("TPI"));
check("public local banner remains visible", publicHome.text.toLowerCase().includes("local"));

const member = await login("local_member");
const contributor = await login("local_contributor");
const me = await request("/api/auth/me", { headers: authHeaders(member) });
check("member identity is correct", me.response.status === 200 && me.body?.user?.username === credentials.accounts.local_member.username);

const memberHome = await request("/member-home", { headers: authHeaders(member) });
check("authenticated member-home returns 200", memberHome.response.status === 200 && memberHome.text.includes("member-home-layout"));
check("member-home contains community section", memberHome.text.includes("Community") || memberHome.text.includes("community"));
check("member-home contains events section", memberHome.text.includes("data-events-body"));
check("member-home contains news section", memberHome.text.includes("data-news-body"));
check("member-home contains video section", memberHome.text.includes("data-video-body"));

const events = await request("/api/events?limit=100", { headers: authHeaders(member) });
check("events API is available", events.response.status === 200 && events.body?.events?.some(event => event.external_id === "local-ops011-event"));
const news = await request("/api/news?limit=12", { headers: authHeaders(member) });
check("news API is available", news.response.status === 200 && news.body?.news?.some(item => item.title === "Local OPS-011 Synthetic Headline"));
const videos = await request("/api/videos?limit=6", { headers: authHeaders(member) });
check("scraped videos API is available", videos.response.status === 200 && videos.body?.videos?.some(video => video.title === "Local OPS-011 Synthetic Video Listing"));
const articles = await request("/api/articles", { headers: authHeaders(member) });
check("articles API is available", articles.response.status === 200 && articles.body?.articles?.some(article => article.id === "local-ops011-article" && article.contributionType === "Research Paper"));
const feed = await request("/api/feed?limit=50&offset=0", { headers: authHeaders(member) });
check("member feed API is available", feed.response.status === 200 && feed.body?.items?.some(item => item.id === "local-ops010-post"));
check("member feed includes TPI video model", feed.body?.items?.some(item => item.id === "local-ops011-tpi-video"));
check("member feed includes classified article", feed.body?.items?.some(item => item.id === "local-ops011-article" && item.contributionType === "Research Paper"));
const pulse = await request("/api/me/pulse", { headers: authHeaders(member) });
check("member pulse API is available", pulse.response.status === 200 && pulse.body?.pulse && typeof pulse.body.pulse.posts === "number");

const community = await request("/api/community/posts?limit=50", { headers: authHeaders(member) });
check("Community Feed remains available", community.response.status === 200 && community.body?.posts?.some(post => post.id === "local-ops010-post"));
const messenger = await request("/api/conversations", { headers: authHeaders(member) });
check("Messenger remains available", messenger.response.status === 200 && messenger.body?.conversations?.some(row => row.id === "local-ops010-conversation"));
const notifications = await request("/api/notifications", { headers: authHeaders(member) });
check("Notifications remain available", notifications.response.status === 200 && Array.isArray(notifications.body?.notifications));
const directory = await request("/api/members/directory", { headers: authHeaders(member) });
check("member directory remains available", directory.response.status === 200 && directory.body?.members?.some(row => row.username === "local_contributor"));
const personalization = await request("/api/me/personalization", { headers: authHeaders(member) });
check("member personalization remains available", personalization.response.status === 200 && personalization.body?.style);

// Contributor access uses the same dashboard content APIs without creating data.
const contributorMe = await request("/api/auth/me", { headers: authHeaders(contributor) });
check("contributor identity is correct", contributorMe.response.status === 200 && contributorMe.body?.user?.username === credentials.accounts.local_contributor.username);
const contributorArticles = await request("/api/articles", { headers: authHeaders(contributor) });
check("contributor can read article listings", contributorArticles.response.status === 200);

// Empty-state and invalid-filter behavior must return safe JSON, not 500s.
const emptyEvents = await request("/api/events?category=ops011-no-such-category", { headers: authHeaders(member) });
check("events empty filter is safe", emptyEvents.response.status === 200 && Array.isArray(emptyEvents.body?.events) && emptyEvents.body.events.length === 0);
const emptyNews = await request("/api/news?category=ops011-no-such-category", { headers: authHeaders(member) });
check("news empty filter is safe", emptyNews.response.status === 200 && Array.isArray(emptyNews.body?.news) && emptyNews.body.news.length === 0);
const emptyVideos = await request("/api/videos?category=ops011-no-such-category", { headers: authHeaders(member) });
check("video empty filter is safe", emptyVideos.response.status === 200 && Array.isArray(emptyVideos.body?.videos) && emptyVideos.body.videos.length === 0);
const emptyArticles = await request("/api/articles?destination=ops011-no-such-destination", { headers: authHeaders(member) });
check("article empty filter is safe", emptyArticles.response.status === 200 && Array.isArray(emptyArticles.body?.articles) && emptyArticles.body.articles.length === 0);

const logout = await request("/api/auth/logout", { method: "POST", headers: authHeaders(member) });
check("member logout succeeds", logout.response.status === 200 && logout.body?.ok === true);
const replay = await request("/api/auth/me", { headers: authHeaders(member) });
check("logout invalidates local session", replay.response.status === 200 && replay.body?.user === null);

console.log(JSON.stringify({
  status: "PASSED",
  origin: base,
  checksPassed: checks.length,
  checks,
  remoteRequests: 0,
  credentialsPrinted: false,
}));

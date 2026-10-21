import { readFileSync } from "node:fs";
import { createRequestBudget } from "./request-budget.mjs";

const baseUrl = (process.env.TPI_DEV020_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const requestBudget = createRequestBudget({ baseUrl, label: "TPI-DEV-020 acceptance QA" });
const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accounts = Object.fromEntries(credentials.accounts.map(account => [account.username, account]));
const adminAccount = accounts["tpi-dev014-admin"];
const ownerAccount = accounts["tpi-dev014-owner"];
if (!adminAccount || !ownerAccount) throw new Error("TPI-DEV-014 admin and owner credentials are required.");

const ids = {
  post: "tpi-dev020-post-001",
  comment: "tpi-dev020-comment-001",
  article: "tpi-dev020-article-001",
  notification: "tpi-dev020-notification-001",
  approveTeam: "tpi-dev020-team-approve-001",
  rejectTeam: "tpi-dev020-team-reject-001",
  approveClaim: "tpi-dev020-claim-approve-001",
  rejectClaim: "tpi-dev020-claim-reject-001"
};

const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await requestBudget.fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 160); }
  return { response, body };
}

async function login(account) {
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password: account.password }) });
  const setCookie = result.response.headers.get("set-cookie") || "";
  return { ...result, cookie: setCookie.split(";")[0] };
}

function expectStatus(name, result, expected) {
  const actual = result.response.status;
  record(name, actual === expected, `HTTP ${actual}; expected ${expected}`);
}

function expectStatusOrAlreadyPersisted(name, result) {
  const actual = result.response.status;
  record(name, actual === 200 || actual === 409, `HTTP ${actual}; accepted 200 or repeat-safe 409; persisted history is checked separately`);
}

const adminLogin = await login(adminAccount);
expectStatus("admin fixture login", adminLogin, 200);
const adminCookie = adminLogin.cookie;
const ownerLogin = await login(ownerAccount);
expectStatus("owner fixture login", ownerLogin, 200);
const ownerCookie = ownerLogin.cookie;

for (const path of [
  "/api/admin/overview?range=30d",
  "/api/admin/analytics?range=30d",
  "/api/admin/settings",
  "/api/admin/channels",
  "/api/admin/roles",
  "/api/admin/restrictions",
  "/api/admin/events",
  "/api/admin/creator-partnership",
  "/api/admin/creator-studio/entitlements",
  "/api/admin/teams?search=tpi-dev020",
  "/api/admin/teams/claims?status=pending",
  "/api/admin/community/posts/tpi-dev020-post-001",
  "/api/admin/community/comments/tpi-dev020-comment-001",
  "/api/admin/articles/tpi-dev020-article-001",
  "/api/admin/notifications/tpi-dev020-notification-001"
]) {
  const result = await request(path, {}, adminCookie);
  expectStatus(`admin read ${path}`, result, 200);
}

const overview = await request("/api/admin/overview?range=30d", {}, adminCookie);
record("admin overview returns structured dashboard data", Boolean(overview.body && typeof overview.body === "object"), "structured response");

const articleDetail = await request(`/api/admin/articles/${ids.article}`, {}, adminCookie);
const originalTitle = articleDetail.body?.article?.title;
const originalUpdatedAt = articleDetail.body?.article?.updatedAt;
const updatedTitle = "[TPI-DEV-020] Synthetic acceptance article — persisted";
const articleUpdate = await request(`/api/admin/articles/${ids.article}`, {
  method: "PUT",
  body: JSON.stringify({
    expectedUpdatedAt: originalUpdatedAt,
    title: updatedTitle,
    destination: articleDetail.body?.article?.destination,
    bodyHtml: articleDetail.body?.article?.bodyHtml,
    href: articleDetail.body?.article?.href,
    subtitle: articleDetail.body?.article?.subtitle,
    contributionType: articleDetail.body?.article?.contributionType,
    author: articleDetail.body?.article?.author,
    source: articleDetail.body?.article?.source,
    articleHtml: articleDetail.body?.article?.articleHtml,
    labels: articleDetail.body?.article?.labels
  })
}, adminCookie);
expectStatus("synthetic article update", articleUpdate, 200);
const articleAfterUpdate = await request(`/api/admin/articles/${ids.article}`, {}, adminCookie);
record("synthetic article update persisted", articleAfterUpdate.body?.article?.title === updatedTitle, `title=${articleAfterUpdate.body?.article?.title || "missing"}`);
const staleArticle = await request(`/api/admin/articles/${ids.article}`, {
  method: "PUT",
  body: JSON.stringify({ expectedUpdatedAt: "1900-01-01 00:00:00", title: "stale write", destination: "tpi-dev020-fixture", bodyHtml: "<p>stale</p>" })
}, adminCookie);
expectStatus("article stale-write protection", staleArticle, 409);
const restoreArticle = await request(`/api/admin/articles/${ids.article}`, {
  method: "PUT",
  body: JSON.stringify({
    expectedUpdatedAt: articleAfterUpdate.body?.article?.updatedAt,
    title: originalTitle,
    destination: articleAfterUpdate.body?.article?.destination,
    bodyHtml: articleAfterUpdate.body?.article?.bodyHtml,
    href: articleAfterUpdate.body?.article?.href,
    subtitle: articleAfterUpdate.body?.article?.subtitle,
    contributionType: articleAfterUpdate.body?.article?.contributionType,
    author: articleAfterUpdate.body?.article?.author,
    source: articleAfterUpdate.body?.article?.source,
    articleHtml: articleAfterUpdate.body?.article?.articleHtml,
    labels: articleAfterUpdate.body?.article?.labels
  })
}, adminCookie);
expectStatus("synthetic article restoration", restoreArticle, 200);

const notificationRead = await request(`/api/admin/notifications/${ids.notification}/read`, { method: "POST" }, adminCookie);
expectStatus("owner notification read mutation", notificationRead, 200);
const notificationReadDetail = await request(`/api/admin/notifications/${ids.notification}`, {}, adminCookie);
record("notification read state persisted", Boolean(notificationReadDetail.body?.notification?.readAt), "readAt present");
const notificationUnread = await request(`/api/admin/notifications/${ids.notification}/unread`, { method: "POST" }, adminCookie);
expectStatus("owner notification unread mutation", notificationUnread, 200);
const notificationUnreadDetail = await request(`/api/admin/notifications/${ids.notification}`, {}, adminCookie);
record("notification unread state persisted", !notificationUnreadDetail.body?.notification?.readAt, "readAt cleared");

const verification = await request(`/api/teams/${ids.approveTeam}/verification`, {
  method: "POST",
  body: JSON.stringify({
    status: "ACTIVE",
    evidenceUrl: "https://example.invalid/tpi-dev020-approve",
    evidenceType: "synthetic",
    evidenceDescription: "TPI-DEV-020 additive acceptance fixture.",
    lastApparentActivity: "2026-10-14",
    confidence: "high",
    notes: "Development-only persistence test."
  })
}, adminCookie);
expectStatus("team verification event mutation", verification, 201);
const teamHistory = await request(`/api/admin/teams/${ids.approveTeam}/history`, {}, adminCookie);
record("team verification event persisted", teamHistory.body?.verificationEvents?.some(event => event.status === "ACTIVE" && event.evidenceType === "synthetic"), "history event present");

const claimApproval = await request(`/api/admin/teams/claims/${ids.approveClaim}/approve`, { method: "POST", body: JSON.stringify({ reviewNotes: "TPI-DEV-020 synthetic approval." }) }, adminCookie);
expectStatusOrAlreadyPersisted("team claim approval mutation", claimApproval);
const claimRejection = await request(`/api/admin/teams/claims/${ids.rejectClaim}/reject`, { method: "POST", body: JSON.stringify({ reviewNotes: "TPI-DEV-020 synthetic rejection." }) }, adminCookie);
expectStatusOrAlreadyPersisted("team claim rejection mutation", claimRejection);
const approvedTeamHistory = await request(`/api/admin/teams/${ids.approveTeam}/history`, {}, adminCookie);
const rejectedTeamHistory = await request(`/api/admin/teams/${ids.rejectTeam}/history`, {}, adminCookie);
record("approved claim persisted", approvedTeamHistory.body?.claims?.some(claim => claim.id === ids.approveClaim && claim.status === "approved"), "approved claim present");
record("rejected claim persisted", rejectedTeamHistory.body?.claims?.some(claim => claim.id === ids.rejectClaim && claim.status === "rejected"), "rejected claim present");

const hidePost = await request(`/api/admin/community/posts/${ids.post}/status`, { method: "POST", body: JSON.stringify({ status: "hidden" }) }, adminCookie);
expectStatus("community post hide mutation", hidePost, 200);
const hiddenPost = await request(`/api/admin/community/posts/${ids.post}`, {}, adminCookie);
record("community post hidden state persisted", hiddenPost.body?.post?.status === "hidden", `status=${hiddenPost.body?.post?.status || "missing"}`);
const restorePost = await request(`/api/admin/community/posts/${ids.post}/status`, { method: "POST", body: JSON.stringify({ status: "visible" }) }, adminCookie);
expectStatus("community post restoration", restorePost, 200);

const applications = await request("/api/admin/founding-50/applications?status=all&pageSize=100", {}, adminCookie);
expectStatus("creator application list", applications, 200);
let application = applications.body?.applications?.find(row => row.username === "tpi-dev020-creator");
if (!application) {
  const created = await request("/api/admin/founding-50/applications", {
    method: "POST",
    body: JSON.stringify({
      accountUsername: "tpi-dev020-creator",
      contactEmail: "tpi-dev020-creator@example.invalid",
      websiteUrl: "https://example.invalid/tpi-dev-020",
      socialChannels: ["https://example.invalid/tpi-dev-020/social"],
      creatorDescription: "Development-only synthetic application.",
      administrativeNotes: "TPI-DEV-020 acceptance fixture; do not activate."
    })
  }, adminCookie);
  expectStatus("creator application creation", created, 201);
  application = created.body?.application;
}
if (application?.status === "pending") {
  const review = await request(`/api/admin/founding-50/applications/${encodeURIComponent(application.id)}/status`, {
    method: "POST",
    body: JSON.stringify({ status: "rejected", notes: "TPI-DEV-020 synthetic review; no activation." })
  }, adminCookie);
  expectStatus("creator application review", review, 200);
}
const reviewedApplications = await request("/api/admin/founding-50/applications?status=all&pageSize=100", {}, adminCookie);
record("creator application review persisted", reviewedApplications.body?.applications?.some(row => row.username === "tpi-dev020-creator" && row.status === "rejected"), "rejected synthetic application present");

const gate = await request("/api/admin/founding-50", {}, ownerCookie);
expectStatus("Founding 50 program read", gate, 200);
const allocation = await request("/api/admin/founding-50/allocate", {
  method: "POST",
  body: JSON.stringify({ username: "tpi-dev020-creator", notes: "TPI-DEV-020 gate test; must remain blocked." })
}, ownerCookie);
expectStatus("Founding 50 activation remains fail-closed", allocation, 423);

for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = results.filter(result => !result.ok);
console.log(JSON.stringify({ baseUrl, checks: results.length, passed: results.length - failed.length, failed: failed.length, fixtureNamespace: "tpi-dev020-*" }));
if (failed.length) process.exit(1);

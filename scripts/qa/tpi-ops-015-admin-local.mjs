#!/usr/bin/env node

// TPI-OPS-015 local administrator and role-boundary verification.
// Read-only except for login/session creation; credentials never print.
import { readFileSync, statSync } from "node:fs";

const base = (process.env.TPI_OPS015_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "OPS-015 requires the approved loopback Worker origin" }));
  process.exit(0);
}

const credentialsPath = process.env.TPI_OPS015_CREDENTIALS_FILE || ".local-dev/local-auth-credentials.json";
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const safe = value => String(value || "").replace(/https?:\/\/[^\s]+/g, "[url]").replace(/password|token|secret|api[_-]?key/gi, "[redacted]");

let credentials;
try {
  if ((statSync(credentialsPath).mode & 0o777) !== 0o600) throw new Error("credential file permissions must be 0600");
  credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `local credential store unavailable: ${safe(error?.message)}` }));
  process.exit(0);
}

const accounts = credentials.accounts || {};
const cookies = {};

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${base}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 500); }
  return { response, body, text };
}

async function login(key) {
  const account = accounts[key];
  if (!account?.username || !account?.password) {
    check(`${key} synthetic identity is available`, false, "missing local fixture identity");
    return "";
  }
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: account.username, password: account.password })
  });
  const setCookie = result.response.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  cookies[key] = cookie;
  check(`${key} login`, result.response.status === 200 && Boolean(cookie), `HTTP ${result.response.status}`);
  return cookie;
}

const admin = await login("local_admin");
const contributor = await login("local_contributor");
const member = await login("local_member");

for (const [key, expectedRole] of [["local_admin", "admin"], ["local_contributor", "contributor"], ["local_member", "member"]]) {
  const result = await request("/api/auth/me", {}, cookies[key]);
  check(`${key} role is ${expectedRole}`, result.response.status === 200 && result.body?.user?.role === expectedRole, `HTTP ${result.response.status}; role=${result.body?.user?.role || "missing"}`);
}

const adminPages = [
  "/admin-panel",
  "/admin-center-preview/",
  "/admin-advanced-settings",
  "/admin-events",
  "/teams/admin"
];
for (const path of adminPages) {
  const result = await request(path, {}, admin);
  check(`administrator page ${path}`, result.response.status === 200 && /TPI|Administration|Admin/i.test(result.text), `HTTP ${result.response.status}`);
  check(`administrator page ${path} uses local runtime`, /data-tpi-local-request-guard/i.test(result.text), "local browser request guard present");
}

for (const path of ["/admin-panel", "/admin-center-preview/", "/admin-advanced-settings", "/admin-events", "/teams/admin"]) {
  for (const [key, cookie] of [["member", member], ["contributor", contributor]]) {
    const result = await request(path, {}, cookie);
    check(`${key} denied administrator page ${path}`, result.response.status === 403, `HTTP ${result.response.status}`);
  }
}

const adminReadPaths = [
  "/api/admin/overview?range=30d",
  "/api/admin/analytics?range=30d",
  "/api/admin/audit-logs?page=1&limit=25",
  "/api/admin/founding-50",
  "/api/admin/founding-50/applications?status=all&pageSize=25",
  "/api/admin/creator-partnership",
  "/api/admin/creator-studio/entitlements",
  "/api/invites",
  "/api/admin/contributors",
  "/api/admin/members",
  "/api/admin/community/posts?page=1&limit=25",
  "/api/admin/community/comments?page=1&limit=25",
  "/api/admin/comments?page=1&limit=25",
  "/api/admin/articles?page=1&limit=25",
  "/api/admin/reports?page=1&limit=25",
  "/api/admin/notifications?page=1&limit=25",
  "/api/admin/channels",
  "/api/admin/roles",
  "/api/admin/restrictions",
  "/api/admin/events?page=1&limit=25",
  "/api/admin/settings",
  "/api/admin/scraper-runs?page=1&limit=25",
  "/api/admin/teams?page=1&limit=25",
  "/api/admin/teams/claims?status=pending&page=1&limit=25"
];
for (const path of adminReadPaths) {
  const result = await request(path, {}, admin);
  check(`administrator read ${path}`, result.response.status === 200, `HTTP ${result.response.status}`);
}

for (const path of ["/api/admin/overview?range=30d", "/api/admin/members", "/api/admin/settings", "/api/admin/teams?page=1&limit=25"]) {
  for (const [key, cookie] of [["member", member], ["contributor", contributor]]) {
    const result = await request(path, {}, cookie);
    check(`${key} denied administrator API ${path}`, result.response.status === 403, `HTTP ${result.response.status}`);
  }
}

for (const [key, cookie] of [["local_admin", admin], ["local_contributor", contributor]]) {
  const result = await request("/paper-editor", {}, cookie);
  check(`${key} contributor page access`, result.response.status === 200, `HTTP ${result.response.status}`);
}
const memberContributorPage = await request("/paper-editor", {}, member);
check("local_member denied contributor page", memberContributorPage.response.status === 403, `HTTP ${memberContributorPage.response.status}`);

const publicHome = await request("/");
check("public home remains locally available", publicHome.response.status === 200, `HTTP ${publicHome.response.status}`);

const failed = checks.filter(item => !item.ok);
for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0, credentialsPrinted: false }));
if (failed.length) process.exit(1);


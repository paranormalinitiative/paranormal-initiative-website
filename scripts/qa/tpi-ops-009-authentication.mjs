#!/usr/bin/env node

// Bounded localhost-only authentication verification for TPI-OPS-009.
// This script never contacts a hosted Worker and never prints credentials.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { sessionCookieAttributes } from "../../lib/auth.js";
import { hashPassword } from "../local-credential-reset.mjs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
const credentialPath = ".local-dev/local-auth-credentials.json";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  throw new Error("TPI-OPS-009 QA requires the approved loopback origin http://127.0.0.1:8787");
}
if (!existsSync(credentialPath)) throw new Error("local authentication fixtures are missing; run scripts/local-auth-fixtures.mjs --local-only");
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));

function filesUnder(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory()) files.push(...filesUnder(path));
    else if (entry.isFile() && /\.sqlite(?:3)?$/.test(entry.name)) files.push(path);
  }
  return files;
}

function findPersistentAuthDatabase() {
  const explicit = process.env.TPI_LOCAL_D1_SQLITE_PATH || "";
  if (explicit) return explicit;
  const root = ".local-dev/state/v3/d1";
  for (const candidate of filesUnder(root)) {
    try {
      const row = execFileSync("sqlite3", [candidate, "SELECT username FROM contributors WHERE username='local_admin' LIMIT 1;"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (row === "local_admin") return candidate;
    } catch { /* metadata databases and unrelated D1 files are ignored */ }
  }
  throw new Error("persistent local_admin D1 database was not found under .local-dev/state; no account was changed");
}

const databasePath = findPersistentAuthDatabase();

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
  try { body = JSON.parse(text); } catch (error) { /* non-JSON page */ }
  return { response, body, text };
}

check("local cookie policy is HTTP loopback only", !sessionCookieAttributes(
  new Request("http://127.0.0.1:8787/api/auth/login"),
  { TPI_ENV: "local", TPI_LOCAL_ONLY: "1" },
  60
).includes("Secure"));
check("hosted cookie policy remains Secure", sessionCookieAttributes(
  new Request("https://example.test/api/auth/login"),
  { TPI_ENV: "development", TPI_LOCAL_ONLY: "0" },
  60
).includes("Secure"));
check("forwarded host cannot grant local cookie policy", sessionCookieAttributes(
  new Request("http://198.51.100.10:8787/api/auth/login", { headers: { "X-Forwarded-Host": "127.0.0.1:8787" } }),
  { TPI_ENV: "local", TPI_LOCAL_ONLY: "1" },
  60
).includes("Secure"));

check("synthetic credentials are stored with owner-only permissions", (statSync(credentialPath).mode & 0o777) === 0o600);
check("development Worker config remains isolated from production", (() => {
  const config = readFileSync("wrangler.local.toml", "utf8");
  return config.includes('name = "tpi-local"')
    && config.includes('database_name = "tpi-local-foundation"')
    && !config.includes("tpi_contributor_portal_dev")
    && !config.includes('database_name = "tpi_contributor_portal"');
})());
const row = execFileSync("sqlite3", [databasePath, "SELECT password_hash || '|' || role || '|' || active FROM contributors WHERE username='local_admin' LIMIT 1;"], { encoding: "utf8" }).trim().split("|");
check("persistent local_admin row matches protected credential store", row.length === 3
  && row[0] === hashPassword(credentials.accounts.local_admin.password)
  && row[1] === "admin"
  && row[2] === "1");

function cookieFrom(response) {
  const setCookie = response.headers.get("set-cookie") || "";
  const match = setCookie.match(/tpi_session=([^;]*)/);
  return match?.[1] || "";
}

async function login(key) {
  const account = credentials.accounts[key];
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: account.username, password: account.password }),
  });
  const setCookie = result.response.headers.get("set-cookie") || "";
  check(`${key} login`, result.response.status === 200 && Boolean(result.body?.user));
  check(`${key} loopback cookie`, setCookie.includes("HttpOnly") && setCookie.includes("SameSite=Lax") && setCookie.includes("Path=/") && !setCookie.includes("Secure"));
  return { token: cookieFrom(result.response), user: result.body.user };
}

const anonymous = await request("/api/auth/me");
check("anonymous auth/me status", anonymous.response.status === 200);
check("anonymous auth/me is null", anonymous.body?.user === null);

const homepage = await request("/");
check("local homepage status", homepage.response.status === 200);
check("local browser request guard", homepage.text.includes("data-tpi-local-request-guard"));

const admin = await login("local_admin");
const contributor = await login("local_contributor");
const member = await login("local_member");

for (const [key, session] of [["local_admin", admin], ["local_contributor", contributor], ["local_member", member]]) {
  const me = await request("/api/auth/me", { headers: { Cookie: `tpi_session=${session.token}` } });
  check(`${key} auth/me`, me.response.status === 200 && me.body?.user?.username === credentials.accounts[key].username && me.body?.user?.role === key.replace("local_", ""));
}

// /admin/overview is an existing protected read-only route whose optional
// metric sources fail closed when a fresh local schema does not contain them.
const adminRoute = await request("/api/admin/overview", { headers: { Cookie: `tpi_session=${admin.token}` } });
check("administrator read-only authorization", adminRoute.response.status === 200);
const contributorRoute = await request("/api/admin/overview", { headers: { Cookie: `tpi_session=${contributor.token}` } });
check("contributor denied administrator route", contributorRoute.response.status === 403);
const memberRoute = await request("/api/admin/overview", { headers: { Cookie: `tpi_session=${member.token}` } });
check("member denied administrator route", memberRoute.response.status === 403);

const invalid = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: credentials.accounts.local_member.username, password: "invalid-local-password" }),
});
check("invalid credentials rejected", invalid.response.status === 401);

const wrongAdminPassword = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: credentials.accounts.local_admin.username, password: "invalid-local-admin-password" }),
});
check("incorrect administrator password is rejected", wrongAdminPassword.response.status === 401);

const disabled = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: credentials.accounts.local_disabled.username, password: credentials.accounts.local_disabled.password }),
});
check("disabled account rejected", disabled.response.status === 401);

const expired = await request("/api/auth/me", { headers: { Cookie: `tpi_session=${credentials.expiredSessionToken}` } });
check("expired session rejected", expired.response.status === 200 && expired.body?.user === null);

const logout = await request("/api/auth/logout", {
  method: "POST",
  headers: { Cookie: `tpi_session=${admin.token}` },
});
const logoutCookie = logout.response.headers.get("set-cookie") || "";
check("logout status", logout.response.status === 200 && logout.body?.ok === true);
check("logout clears loopback cookie", logoutCookie.includes("Max-Age=0") && !logoutCookie.includes("Secure"));
const replay = await request("/api/auth/me", { headers: { Cookie: `tpi_session=${admin.token}` } });
check("logout invalidates local session", replay.response.status === 200 && replay.body?.user === null);

// The logout checks above invalidate the admin session, so re-authenticate
// before exercising the protected administrator pages.
const adminAgain = await login("local_admin");
const adminRoutes = ["/admin-panel", "/studio/"];
for (const path of adminRoutes) {
  const result = await request(path, { headers: { Cookie: `tpi_session=${adminAgain.token}` } });
  check(`local_admin can access ${path}`, result.response.status === 200 && result.text.length > 0);
}
const anonymousAdminRoute = await request("/admin-panel");
check("anonymous Administration Center remains protected", anonymousAdminRoute.response.status === 403);

const contributorPage = await request("/", { headers: { Cookie: `tpi_session=${contributor.token}` } });
check("authenticated local root navigation", contributorPage.response.status >= 300 && contributorPage.response.status < 400 && (contributorPage.response.headers.get("location") || "").endsWith("/member-home"));
const memberHome = await request("/member-home", { headers: { Cookie: `tpi_session=${contributor.token}` } });
check("authenticated local member home remains available", memberHome.response.status === 200 && memberHome.text.includes("TPI"));

// Verify all synthetic local users can sign out without altering passwords or roles.
for (const [key, session] of [["local_contributor", contributor], ["local_member", member]]) {
  const result = await request("/api/auth/logout", { method: "POST", headers: { Cookie: `tpi_session=${session.token}` } });
  check(`${key} logout succeeds`, result.response.status === 200);
}

console.log(JSON.stringify({
  status: "PASSED",
  origin: base,
  checksPassed: checks.length,
  checks,
  remoteRequests: 0,
  credentialsPrinted: false,
}));

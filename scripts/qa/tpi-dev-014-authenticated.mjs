import { readFileSync } from "node:fs";
import { createRequestBudget } from "./request-budget.mjs";

const baseUrl = (process.env.TPI_DEV014_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const requestBudget = createRequestBudget({ baseUrl, label: "TPI-DEV-014 authenticated QA" });
const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accounts = Object.fromEntries(credentials.accounts.map(account => [account.username, account]));

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

async function login(account, password = account.password) {
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password }) });
  const setCookie = result.response.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  return { ...result, cookie };
}

function expectStatus(name, actual, expected) {
  record(name, actual === expected, `HTTP ${actual}; expected ${expected}`);
}

const anonymousAdmin = await request("/api/admin/overview");
expectStatus("anonymous admin API denied", anonymousAdmin.response.status, 403);
const anonymousStudio = await request("/studio/");
expectStatus("anonymous Creator Studio route denied", anonymousStudio.response.status, 403);

for (const [username, expectedRole] of Object.entries({
  "tpi-dev014-member": "member",
  "tpi-dev014-contributor": "contributor",
  "tpi-dev014-admin": "admin",
  "tpi-dev014-owner": "owner",
  "tpi-dev014-creator": "member",
  "tpi-dev014-revoked": "member"
})) {
  const account = accounts[username];
  if (!account) throw new Error(`Missing credential fixture for ${username}`);
  const invalid = await login(account, `${account.password}-invalid`);
  expectStatus(`${username} rejects invalid password`, invalid.response.status, 401);
  const loggedIn = await login(account);
  expectStatus(`${username} real login`, loggedIn.response.status, 200);
  const me = await request("/api/auth/me", {}, loggedIn.cookie);
  expectStatus(`${username} session introspection`, me.response.status, 200);
  record(`${username} role`, me.body?.user?.role === expectedRole, `role=${me.body?.user?.role || "missing"}; expected ${expectedRole}`);
  const admin = await request("/api/admin/overview", {}, loggedIn.cookie);
  expectStatus(`${username} admin boundary`, admin.response.status, ["admin", "owner"].includes(expectedRole) ? 200 : 403);
  const contributor = await request("/api/contributors/me/articles", {}, loggedIn.cookie);
  expectStatus(`${username} contributor boundary`, contributor.response.status, ["contributor", "admin", "owner"].includes(expectedRole) ? 200 : 403);
  const studio = await request("/studio/", {}, loggedIn.cookie);
  expectStatus(`${username} Creator Studio route before entitlement`, studio.response.status, ["admin", "owner"].includes(expectedRole) ? 200 : 403);
  const adminPreview = await request("/admin-center-preview/", {}, loggedIn.cookie);
  expectStatus(`${username} Administration Center preview boundary`, adminPreview.response.status, ["admin", "owner"].includes(expectedRole) ? 200 : 403);
  const legacyAdmin = await request("/admin-panel.html", {}, loggedIn.cookie);
  const expectedLegacy = ["admin", "owner"].includes(expectedRole) ? [200, 307] : [403];
  record(`${username} legacy admin page boundary`, expectedLegacy.includes(legacyAdmin.response.status), `HTTP ${legacyAdmin.response.status}; expected ${expectedLegacy.join(" or ")}`);
}

const member = await login(accounts["tpi-dev014-member"]);
const unauthorizedApplication = await request("/api/admin/founding-50/applications", {
  method: "POST",
  body: JSON.stringify({ accountUsername: "tpi-dev014-creator", contactEmail: "tpi-dev014@example.invalid" })
}, member.cookie);
expectStatus("member cannot create admin-linked application", unauthorizedApplication.response.status, 403);

for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = results.filter(result => !result.ok);
console.log(JSON.stringify({ baseUrl, checks: results.length, passed: results.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);

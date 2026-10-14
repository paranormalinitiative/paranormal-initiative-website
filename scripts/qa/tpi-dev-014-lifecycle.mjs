import { readFileSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV014_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accounts = Object.fromEntries(credentials.accounts.map(account => [account.username, account]));
const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 160); }
  return { response, body };
}

async function login(username) {
  const account = accounts[username];
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password: account.password }) });
  return { ...result, cookie: (result.response.headers.get("set-cookie") || "").split(";")[0] };
}

function expectStatus(name, response, expected) {
  record(name, response.status === expected, `HTTP ${response.status}; expected ${expected}`);
}

const owner = await login("tpi-dev014-owner");
const admin = await login("tpi-dev014-admin");
const member = await login("tpi-dev014-member");
const creator = await login("tpi-dev014-creator");
const revoked = await login("tpi-dev014-revoked");

for (const [label, result] of [["owner", owner], ["admin", admin], ["member", member], ["creator", creator], ["revoked", revoked]]) {
  expectStatus(`${label} lifecycle login`, result.response, 200);
}

const creatorBefore = await request("/studio/", {}, creator.cookie);
expectStatus("creator Studio denied before entitlement", creatorBefore.response, 403);

const invalidAccount = await request("/api/admin/founding-50/applications", {
  method: "POST", body: JSON.stringify({ accountUsername: "tpi-dev014-no-such-account" })
}, admin.cookie);
expectStatus("invalid application account rejected", invalidAccount.response, 400);

const invalidUrl = await request("/api/admin/founding-50/applications", {
  method: "POST", body: JSON.stringify({ accountUsername: "tpi-dev014-creator", websiteUrl: "not-a-url" })
}, admin.cookie);
expectStatus("invalid application URL rejected", invalidUrl.response, 400);

const rejectedCreate = await request("/api/admin/founding-50/applications", {
  method: "POST",
  body: JSON.stringify({ accountUsername: "tpi-dev014-rejected", contactEmail: "tpi-dev014-rejected@example.invalid", websiteUrl: "https://example.invalid/rejected", socialChannels: ["https://example.invalid/social"], videoChannels: ["https://example.invalid/video"], creatorDescription: "Synthetic rejected application.", administrativeNotes: "TPI-DEV-014 rejection path." })
}, admin.cookie);
expectStatus("rejected-path application created", rejectedCreate.response, 201);
const rejectedApplicationId = rejectedCreate.body?.application?.id;
record("rejected-path application id returned", Boolean(rejectedApplicationId));

const rejectedStatus = await request(`/api/admin/founding-50/applications/${encodeURIComponent(rejectedApplicationId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "rejected", notes: "Synthetic negative-path rejection." })
}, admin.cookie);
expectStatus("administrator can reject application", rejectedStatus.response, 200);

const unauthorizedReview = await request(`/api/admin/founding-50/applications/${encodeURIComponent(rejectedApplicationId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "approved" })
}, member.cookie);
expectStatus("member cannot review application", unauthorizedReview.response, 403);

const rejectedAllocate = await request("/api/admin/founding-50/allocate", {
  method: "POST", body: JSON.stringify({ username: "tpi-dev014-rejected", applicationId: rejectedApplicationId })
}, owner.cookie);
expectStatus("rejected application cannot be allocated", rejectedAllocate.response, 409);

const revokedCreate = await request("/api/admin/founding-50/applications", {
  method: "POST",
  body: JSON.stringify({ accountUsername: "tpi-dev014-revoked", contactEmail: "tpi-dev014-revoked@example.invalid", websiteUrl: "https://example.invalid/revoked", creatorDescription: "Synthetic status-transition application." })
}, admin.cookie);
expectStatus("status-transition application created", revokedCreate.response, 201);
const revokedApplicationId = revokedCreate.body?.application?.id;
const revokedApprove = await request(`/api/admin/founding-50/applications/${encodeURIComponent(revokedApplicationId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "approved", notes: "Synthetic approval for lifecycle verification." })
}, admin.cookie);
expectStatus("administrator can approve application", revokedApprove.response, 200);

const adminAllocate = await request("/api/admin/founding-50/allocate", {
  method: "POST", body: JSON.stringify({ username: "tpi-dev014-revoked", applicationId: revokedApplicationId })
}, admin.cookie);
expectStatus("administrator cannot activate Founding 50 membership", adminAllocate.response, 403);
const revokedAllocate = await request("/api/admin/founding-50/allocate", {
  method: "POST", body: JSON.stringify({ username: "tpi-dev014-revoked", applicationId: revokedApplicationId, notes: "TPI-DEV-014 synthetic activation." })
}, owner.cookie);
expectStatus("owner can activate approved synthetic membership", revokedAllocate.response, 201);
const revokedMembershipId = revokedAllocate.body?.membership?.id;
record("activation returns membership and slot", Boolean(revokedMembershipId && revokedAllocate.body?.membership?.slot));

const creatorAfterActivation = await login("tpi-dev014-revoked");
const studioActive = await request("/studio/", {}, creatorAfterActivation.cookie);
expectStatus("activated creator can load Creator Studio", studioActive.response, 200);
const meActive = await request("/api/auth/me", {}, creatorAfterActivation.cookie);
record("activated creator session exposes server-derived access", meActive.body?.user?.creatorStudioAccess === true, `creatorStudioAccess=${meActive.body?.user?.creatorStudioAccess}`);

const revokeDenied = await request(`/api/admin/founding-50/memberships/${encodeURIComponent(revokedMembershipId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "revoked", notes: "Synthetic revocation test." })
}, admin.cookie);
expectStatus("administrator cannot revoke membership", revokeDenied.response, 403);
const revoke = await request(`/api/admin/founding-50/memberships/${encodeURIComponent(revokedMembershipId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "revoked", notes: "Synthetic revocation test." })
}, owner.cookie);
expectStatus("owner can revoke membership", revoke.response, 200);
const studioRevoked = await request("/studio/", {}, creatorAfterActivation.cookie);
expectStatus("revoked creator loses Creator Studio route", studioRevoked.response, 403);
const reactivate = await request(`/api/admin/founding-50/memberships/${encodeURIComponent(revokedMembershipId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "active", notes: "Synthetic reactivation test." })
}, owner.cookie);
expectStatus("owner can reactivate membership", reactivate.response, 200);
const studioReactivated = await request("/studio/", {}, creatorAfterActivation.cookie);
expectStatus("reactivated creator regains Creator Studio route", studioReactivated.response, 200);
const revokeFinal = await request(`/api/admin/founding-50/memberships/${encodeURIComponent(revokedMembershipId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "revoked", notes: "Leave synthetic fixture revoked after test." })
}, owner.cookie);
expectStatus("owner can leave synthetic fixture revoked", revokeFinal.response, 200);

const creatorCreate = await request("/api/admin/founding-50/applications", {
  method: "POST",
  body: JSON.stringify({ accountUsername: "tpi-dev014-creator", contactEmail: "tpi-dev014-creator@example.invalid", websiteUrl: "https://example.invalid/creator", socialChannels: ["https://example.invalid/facebook"], videoChannels: ["https://example.invalid/video"], creatorDescription: "Synthetic creator candidate.", administrativeNotes: "TPI-DEV-014 capacity and duplicate path." })
}, admin.cookie);
expectStatus("creator application created", creatorCreate.response, 201);
const creatorApplicationId = creatorCreate.body?.application?.id;
const duplicateCreate = await request("/api/admin/founding-50/applications", {
  method: "POST", body: JSON.stringify({ accountUsername: "tpi-dev014-creator" })
}, admin.cookie);
expectStatus("duplicate pending application rejected", duplicateCreate.response, 409);
const creatorApprove = await request(`/api/admin/founding-50/applications/${encodeURIComponent(creatorApplicationId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "approved", notes: "Synthetic approval for capacity test." })
}, admin.cookie);
expectStatus("creator application approved", creatorApprove.response, 200);

const contenderCreate = await request("/api/admin/founding-50/applications", {
  method: "POST", body: JSON.stringify({ accountUsername: "tpi-dev014-contender", contactEmail: "tpi-dev014-contender@example.invalid", creatorDescription: "Synthetic concurrent capacity candidate." })
}, admin.cookie);
expectStatus("contender application created", contenderCreate.response, 201);
const contenderApplicationId = contenderCreate.body?.application?.id;
const contenderApprove = await request(`/api/admin/founding-50/applications/${encodeURIComponent(contenderApplicationId)}/status`, {
  method: "POST", body: JSON.stringify({ status: "approved", notes: "Synthetic approval for concurrent capacity test." })
}, admin.cookie);
expectStatus("contender application approved", contenderApprove.response, 200);

const audit = await request("/api/admin/audit-logs?action=founding50&limit=100", {}, owner.cookie);
expectStatus("founding50 audit history is readable by owner", audit.response, 200);
record("audit history contains lifecycle actions", (audit.body?.logs || []).some(row => String(row.action || "").includes("founding50")));

for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = results.filter(result => !result.ok);
console.log(JSON.stringify({ baseUrl, checks: results.length, passed: results.length - failed.length, failed: failed.length, revokedMembershipId, creatorApplicationId, contenderApplicationId }));
if (failed.length) process.exit(1);

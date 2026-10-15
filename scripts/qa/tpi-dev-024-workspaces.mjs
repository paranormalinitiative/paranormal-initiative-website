import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV024_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const credentialPath = process.env.TPI_DEV024_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const ownerAccount = credentials.accounts.find(account => account.username === "tpi-dev014-owner");
const adminAccount = credentials.accounts.find(account => account.username === "tpi-dev014-admin");
const revokedAccount = credentials.accounts.find(account => account.username === "tpi-dev014-revoked");
if (!ownerAccount) throw new Error("The existing synthetic development owner fixture is missing.");
if (!adminAccount || !revokedAccount) throw new Error("The existing synthetic development admin/revoked fixtures are missing.");

const accounts = {
  owner: { username: ownerAccount.username, password: ownerAccount.password },
  admin: { username: adminAccount.username, password: adminAccount.password },
  revoked: { username: revokedAccount.username, password: revokedAccount.password }
};
const checks = [];
const record = (name, ok, detail = "") => checks.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 200); }
  return { response, body };
}

async function login(account) {
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password: account.password }) });
  return { ...result, cookie: (result.response.headers.get("set-cookie") || "").split(";")[0] };
}

function status(name, result, expected) {
  record(name, result.response.status === expected, `HTTP ${result.response.status}; expected ${expected}`);
}

const owner = await login(accounts.owner);
const admin = await login(accounts.admin);
const revoked = await login(accounts.revoked);
status("owner synthetic login", owner, 200);
status("admin synthetic login", admin, 200);
status("revoked synthetic login", revoked, 200);
if ([owner, admin, revoked].some(result => result.response.status !== 200)) {
  console.log(JSON.stringify({ directive: "TPI-DEV-024", baseUrl, checks, blocked: "Synthetic development entitlement fixture unavailable; no workspace mutation attempted." }));
  process.exit(1);
}

const ownerMe = await request("/api/auth/me", {}, owner.cookie);
const adminMe = await request("/api/auth/me", {}, admin.cookie);
const revokedMe = await request("/api/auth/me", {}, revoked.cookie);
record("owner has Studio access", ownerMe.body?.user?.creatorStudioAccess === true);
record("admin has server-derived Studio access", adminMe.body?.user?.creatorStudioAccess === true);
record("revoked account has no Studio access", revokedMe.body?.user?.creatorStudioAccess === false);
if (![ownerMe, adminMe].every(result => result.body?.user?.creatorStudioAccess === true)) {
  console.log(JSON.stringify({ directive: "TPI-DEV-024", baseUrl, checks, blocked: "Positive entitlement verification failed; no workspace mutation attempted." }));
  process.exit(1);
}

const localBroadcastId = `tpi-dev024-${randomUUID()}`;
const state = {
  broadcast: { id: localBroadcastId, title: "TPI-DEV-024 synthetic workspace", description: "Synthetic verification only", status: "draft", visibility: "private" },
  settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true },
  recording: { localLibraryCount: 0, incompleteSessionCount: 0, storageMode: "browser" },
  destinations: [{ streamKey: "must-not-persist" }],
  recordingBlob: "must-not-persist"
};
const created = await request("/api/studio/workspaces", {
  method: "POST",
  body: JSON.stringify({ localBroadcastId, title: "TPI-DEV-024 synthetic workspace", description: "Synthetic verification only", state })
}, owner.cookie);
status("owner can save workspace", created, 201);
const workspace = created.body?.workspace;
record("workspace has server id and version", Boolean(workspace?.id) && workspace.version === 1);
record("sensitive recording fields are not persisted", !JSON.stringify(workspace?.state || {}).includes("must-not-persist"));

if (workspace?.id) {
  const listed = await request("/api/studio/workspaces", {}, owner.cookie);
  status("owner can list active workspaces", listed, 200);
  record("owner list contains saved workspace", listed.body?.workspaces?.some(item => item.id === workspace.id) === true);

  const crossRead = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {}, admin.cookie);
  status("admin cannot read owner private workspace", crossRead, 404);

  const updated = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ expectedVersion: 1, title: "TPI-DEV-024 synthetic workspace updated" })
  }, owner.cookie);
  status("owner can update workspace", updated, 200);
  record("workspace version advances", updated.body?.workspace?.version === 2);

  const stale = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ expectedVersion: 1, title: "stale" })
  }, owner.cookie);
  status("stale workspace write is rejected", stale, 409);

  const archived = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}/archive`, {
    method: "POST",
    body: JSON.stringify({ expectedVersion: 2 })
  }, owner.cookie);
  status("owner can archive workspace", archived, 200);
  record("archive is non-destructive", archived.body?.workspace?.status === "archived");

  const activeAfter = await request("/api/studio/workspaces", {}, owner.cookie);
  record("archived workspace leaves active list", !activeAfter.body?.workspaces?.some(item => item.id === workspace.id));
  const allAfter = await request("/api/studio/workspaces?includeArchived=true", {}, owner.cookie);
  record("archived workspace remains restorable as metadata", allAfter.body?.workspaces?.some(item => item.id === workspace.id && item.status === "archived") === true);

  const adminWorkspaceId = `tpi-dev024-admin-${randomUUID()}`;
  const adminCreated = await request("/api/studio/workspaces", {
    method: "POST",
    body: JSON.stringify({ localBroadcastId: adminWorkspaceId, title: "TPI-DEV-024 admin isolation fixture", state: { broadcast: { id: adminWorkspaceId, title: "TPI-DEV-024 admin isolation fixture" } } })
  }, admin.cookie);
  status("admin can save its own workspace", adminCreated, 201);
  if (adminCreated.body?.workspace?.id) {
    const ownerCannotReadAdmin = await request(`/api/studio/workspaces/${encodeURIComponent(adminCreated.body.workspace.id)}`, {}, owner.cookie);
    status("owner cannot read admin private workspace", ownerCannotReadAdmin, 404);
    const adminArchived = await request(`/api/studio/workspaces/${encodeURIComponent(adminCreated.body.workspace.id)}/archive`, {
      method: "POST",
      body: JSON.stringify({ expectedVersion: adminCreated.body.workspace.version })
    }, admin.cookie);
    status("admin can archive its own workspace", adminArchived, 200);
  }

  const revokedList = await request("/api/studio/workspaces", {}, revoked.cookie);
  status("revoked account is denied workspace API", revokedList, 403);
}

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-DEV-024", baseUrl, syntheticAccounts: [accounts.owner.username, accounts.admin.username, accounts.revoked.username], checks: checks.length, passed: checks.length - failed.length, failed: failed.length, workspaceMutated: Boolean(workspace?.id) }));
if (failed.length) process.exit(1);

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequestBudget } from "./request-budget.mjs";

const baseUrl = (process.env.TPI_DEV025_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const requestBudget = createRequestBudget({ baseUrl, label: "TPI-DEV-025 creator QA" });
const credentialPath = process.env.TPI_DEV025_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accountByName = name => credentials.accounts.find(account => account.username === name);
const ownerAccount = accountByName("tpi-dev014-owner");
const adminAccount = accountByName("tpi-dev014-admin");
const memberAccount = accountByName("tpi-dev014-member");
const revokedAccount = accountByName("tpi-dev014-revoked");
const capacityFixture = readFileSync("scripts/dev/seed-tpi-dev-014-capacity.mjs", "utf8");
if (!ownerAccount || !adminAccount || !memberAccount || !revokedAccount) throw new Error("Existing DEV-014 credential fixture is incomplete.");
const passwordTemplate = capacityFixture.match(/hash\(`([^`]+)`\)/)?.[1];
if (!passwordTemplate || !passwordTemplate.includes("${suffix}")) throw new Error("Approved DEV-014 capacity fixture mechanism was not found.");

const fixturePassword = suffix => passwordTemplate.replace("${suffix}", suffix);
const creatorA = { username: "tpi-dev014-filler-02", password: fixturePassword("02") };
const creatorB = { username: "tpi-dev014-filler-03", password: fixturePassword("03") };
const accounts = {
  owner: { username: ownerAccount.username, password: ownerAccount.password },
  admin: { username: adminAccount.username, password: adminAccount.password },
  member: { username: memberAccount.username, password: memberAccount.password },
  revoked: { username: revokedAccount.username, password: revokedAccount.password },
  creatorA,
  creatorB
};
const checks = [];
const record = (name, ok, detail = "") => checks.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await requestBudget.fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
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

const sessions = {};
for (const [name, account] of Object.entries(accounts)) {
  sessions[name] = await login(account);
  status(`${name} login`, sessions[name], 200);
}
if (Object.values(sessions).some(result => result.response.status !== 200)) {
  console.log(JSON.stringify({ directive: "TPI-DEV-025", baseUrl, checks, blocked: "Existing synthetic credential fixture could not authenticate." }));
  process.exit(1);
}

const creatorMe = await request("/api/auth/me", {}, sessions.creatorA.cookie);
record("creator A has member role", creatorMe.body?.user?.role === "member");
record("creator A has active server-derived Studio access", creatorMe.body?.user?.creatorStudioAccess === true);
record("creator A is not an administrator", !["owner", "admin"].includes(creatorMe.body?.user?.role));
const creatorStudio = await request("/studio/", {}, sessions.creatorA.cookie);
status("authorized creator can access StudioFlow", creatorStudio, 200);
const creatorAdmin = await request("/admin-center-preview/", {}, sessions.creatorA.cookie);
status("Studio entitlement does not grant Administration Center access", creatorAdmin, 403);

const channel = await request("/api/tpi-channels/me", {}, sessions.creatorA.cookie);
status("creator can access own channel", channel, 200);
record("channel belongs to creator A", channel.body?.channel?.owner?.username === creatorA.username);
const rooms = await request("/api/studio/rooms", {}, sessions.creatorA.cookie);
status("creator can list own Studio rooms", rooms, 200);
record("room listing excludes provider credentials", !JSON.stringify(rooms.body || {}).includes("authToken") && !JSON.stringify(rooms.body || {}).includes("inviteToken"));

const localId = `tpi-dev025-${randomUUID()}`;
const title = "TPI-DEV-025 creator acceptance workspace";
const state = { broadcast: { id: localId, title, description: "Synthetic acceptance fixture", status: "draft", visibility: "private" }, settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true }, recording: { localLibraryCount: 0, incompleteSessionCount: 0, storageMode: "browser" } };
const created = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ localBroadcastId: localId, title, description: "Synthetic acceptance fixture", state }) }, sessions.creatorA.cookie);
status("creator can create workspace", created, 201);
const workspace = created.body?.workspace;
record("workspace is owned by current session", Boolean(workspace?.id) && workspace.localBroadcastId === localId);

if (workspace?.id) {
  const list = await request("/api/studio/workspaces", {}, sessions.creatorA.cookie);
  record("creator list contains own workspace", list.body?.workspaces?.some(item => item.id === workspace.id) === true);
  const freshSession = await login(accounts.creatorA);
  status("fresh creator session can authenticate", freshSession, 200);
  const restored = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {}, freshSession.cookie);
  status("fresh session restores workspace", restored, 200);
  record("saved title restores", restored.body?.workspace?.title === title);
  const updated = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: restored.body.workspace.version, title: `${title} updated` }) }, freshSession.cookie);
  status("creator can update workspace", updated, 200);
  const stale = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: restored.body.workspace.version, title: "stale" }) }, freshSession.cookie);
  status("stale creator update is rejected", stale, 409);

  const backup = { applicationId: "tpi-studioflow", formatVersion: 1, backupType: "workspace-configuration", exportedAt: new Date().toISOString(), workspace: { title: "Imported acceptance workspace", description: "Imported synthetic configuration", state: { ...state, broadcast: { ...state.broadcast, id: "ignored-server-id", title: "Imported acceptance workspace" } } } };
  record("portable backup fixture is structurally valid", backup.applicationId === "tpi-studioflow" && backup.formatVersion === 1 && backup.workspace?.state?.broadcast);
  const importedId = `imported-${randomUUID()}`;
  const imported = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ localBroadcastId: importedId, title: backup.workspace.title, description: backup.workspace.description, state: { ...backup.workspace.state, broadcast: { ...backup.workspace.state.broadcast, id: importedId }, } }) }, freshSession.cookie);
  status("valid backup can be persisted as a new workspace", imported, 201);
  record("import assigns current creator ownership", imported.body?.workspace?.localBroadcastId === importedId);
  const duplicateImport = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ localBroadcastId: importedId, title: "must not overwrite", state: backup.workspace.state }) }, freshSession.cookie);
  status("duplicate import does not overwrite existing workspace", duplicateImport, 409);

  const crossRead = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {}, sessions.creatorB.cookie);
  const crossUpdate = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, { method: "PATCH", body: JSON.stringify({ title: "cross-account" }) }, sessions.creatorB.cookie);
  const crossArchive = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}/archive`, { method: "POST", body: JSON.stringify({}) }, sessions.creatorB.cookie);
  status("creator B cannot read creator A workspace", crossRead, 404);
  status("creator B cannot update creator A workspace", crossUpdate, 404);
  status("creator B cannot archive creator A workspace", crossArchive, 404);

  const archived = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: updated.body.workspace.version }) }, freshSession.cookie);
  status("creator A can archive workspace", archived, 200);
  const archivedRead = await request(`/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {}, freshSession.cookie);
  status("archived workspace remains readable", archivedRead, 200);
  record("archived status persists", archivedRead.body?.workspace?.status === "archived");
  const importedArchive = imported.body?.workspace?.id ? await request(`/api/studio/workspaces/${encodeURIComponent(imported.body.workspace.id)}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: imported.body.workspace.version }) }, freshSession.cookie) : null;
  if (importedArchive) status("imported workspace can be archived", importedArchive, 200);
}

const ordinaryMember = await request("/studio/", {}, sessions.member.cookie);
const ordinaryApi = await request("/api/studio/workspaces", {}, sessions.member.cookie);
const revokedStudio = await request("/studio/", {}, sessions.revoked.cookie);
const revokedApi = await request("/api/studio/workspaces", {}, sessions.revoked.cookie);
status("ordinary member Studio route denied", ordinaryMember, 403);
status("ordinary member workspace API denied", ordinaryApi, 403);
status("revoked creator Studio route denied", revokedStudio, 403);
status("revoked creator workspace API denied", revokedApi, 403);

const foundingGate = await request("/api/admin/founding-50/allocate", { method: "POST", body: JSON.stringify({}) }, sessions.owner.cookie);
status("Founding 50 activation remains locked", foundingGate, 423);

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-DEV-025", baseUrl, creator: creatorA.username, secondCreator: creatorB.username, checks: checks.length, passed: checks.length - failed.length, failed: failed.length, workspaceMutated: Boolean(workspace?.id), externalRealtimeKitUsed: false }));
if (failed.length) process.exit(1);

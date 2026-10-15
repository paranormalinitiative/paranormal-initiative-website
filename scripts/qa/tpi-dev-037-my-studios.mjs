import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV037_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const credentialPath = process.env.TPI_DEV037_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accountByName = name => credentials.accounts.find(account => account.username === name);
const owner = accountByName("tpi-dev014-owner");
const member = accountByName("tpi-dev014-member");
const revoked = accountByName("tpi-dev014-revoked");
const fixture = readFileSync("scripts/dev/seed-tpi-dev-014-capacity.mjs", "utf8");
const passwordTemplate = fixture.match(/hash\(`([^`]+)`\)/)?.[1];
const creatorA = { username: "tpi-dev014-filler-02", password: passwordTemplate.replace("${suffix}", "02") };
const creatorB = { username: "tpi-dev014-filler-03", password: passwordTemplate.replace("${suffix}", "03") };
if (!owner || !member || !revoked || !passwordTemplate) throw new Error("Existing DEV-014 credential fixture is incomplete.");
const checks = [];
const record = (name, ok, detail = "") => checks.push({ name, ok, detail });
async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const raw = await response.text(); let body = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = raw.slice(0, 200); }
  return { response, body };
}
async function login(account) {
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password: account.password }) });
  return { ...result, cookie: (result.response.headers.get("set-cookie") || "").split(";")[0] };
}
function expect(name, result, status) { record(name, result.response.status === status, `HTTP ${result.response.status}; expected ${status}`); }
const sessions = { owner: await login(owner), creatorA: await login(creatorA), creatorB: await login(creatorB), member: await login(member), revoked: await login(revoked) };
for (const [name, result] of Object.entries(sessions)) expect(`${name} login`, result, 200);
if (Object.values(sessions).some(result => result.response.status !== 200)) {
  console.log(JSON.stringify({ directive: "TPI-DEV-037", baseUrl, blocked: "Synthetic development credentials could not authenticate.", checks })); process.exit(1);
}
const cookie = sessions.creatorA.cookie;
const makeState = (id, title, status = "draft", scheduledAt = null) => ({ broadcast: { id, title, description: "Synthetic DEV-037 fixture", status, visibility: "private", scheduledAt }, settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true }, recording: { localLibraryCount: 0, incompleteSessionCount: 0, storageMode: "browser" }, configuration: { selectedBackground: "default", styleSettings: { accentColor: "#1266e3" } } });
const created = [];
async function create(title, status = "draft", scheduledAt = null) {
  const id = `tpi-dev037-${randomUUID()}`;
  const result = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ localBroadcastId: id, title, state: makeState(id, title, status, scheduledAt) }) }, cookie);
  expect(`create ${title}`, result, 201); if (result.body?.workspace) created.push(result.body.workspace); return result;
}
const first = await create("DEV-037 Number One");
const second = await create("DEV-037 Number Two");
record("first and second Studios receive unique positive numbers", Number(first.body?.workspace?.studioNumber) > 0 && Number(second.body?.workspace?.studioNumber) > 0 && first.body.workspace.studioNumber !== second.body.workspace.studioNumber);
const renamed = first.body?.workspace ? await request(`/api/studio/workspaces/${first.body.workspace.id}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: first.body.workspace.version, title: "DEV-037 Renamed" }) }, cookie) : null;
if (renamed) { expect("rename Studio", renamed, 200); record("rename preserves permanent Studio number", renamed.body?.workspace?.studioNumber === first.body.workspace.studioNumber); }
const duplicate = first.body?.workspace ? await request(`/api/studio/workspaces/${first.body.workspace.id}/duplicate`, { method: "POST", body: JSON.stringify({}) }, cookie) : null;
if (duplicate) { expect("duplicate Studio", duplicate, 201); if (duplicate.body?.workspace) created.push(duplicate.body.workspace); record("duplicate receives a new number and draft state", duplicate.body?.workspace?.studioNumber > first.body.workspace.studioNumber && duplicate.body?.workspace?.state?.broadcast?.status === "draft"); }
const crossRead = first.body?.workspace ? await request(`/api/studio/workspaces/${first.body.workspace.id}`, {}, sessions.creatorB.cookie) : null;
if (crossRead) expect("cross-account read is denied", crossRead, 404);
const deleted = second.body?.workspace ? await request(`/api/studio/workspaces/${second.body.workspace.id}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: second.body.workspace.version }) }, cookie) : null;
if (deleted) { expect("soft-delete Studio", deleted, 200); record("delete preserves the Studio number and marks deleted", deleted.body?.workspace?.deletedAt && deleted.body?.workspace?.studioNumber === second.body.workspace.studioNumber); }
const activeList = await request("/api/studio/workspaces", {}, cookie); expect("active list excludes deleted Studio", activeList, 200); record("deleted Studio is absent from active list", !activeList.body?.workspaces?.some(item => item.id === second.body?.workspace?.id));
const deletedList = await request("/api/studio/workspaces?includeDeleted=true", {}, cookie); expect("deleted list is owner-scoped", deletedList, 200); record("deleted Studio appears in recovery list", deletedList.body?.workspaces?.some(item => item.id === second.body?.workspace?.id));
const restored = deleted.body?.workspace ? await request(`/api/studio/workspaces/${deleted.body.workspace.id}/restore`, { method: "POST", body: JSON.stringify({ expectedVersion: deleted.body.workspace.version }) }, cookie) : null;
if (restored) { expect("restore Studio", restored, 200); record("restore preserves permanent Studio number", restored.body?.workspace?.studioNumber === second.body.workspace.studioNumber && restored.body?.workspace?.deletedAt === null); }
const concurrent = await Promise.all([1, 2, 3].map(index => create(`DEV-037 Concurrent ${index}`)));
const numbers = concurrent.map(result => result.body?.workspace?.studioNumber).filter(Number.isInteger);
record("concurrent allocation returns unique numbers", numbers.length === 3 && new Set(numbers).size === 3);
const activeFixture = await create("DEV-037 Active Guard", "live");
const activeDelete = activeFixture.body?.workspace ? await request(`/api/studio/workspaces/${activeFixture.body.workspace.id}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: activeFixture.body.workspace.version }) }, cookie) : null;
if (activeDelete) expect("active production deletion is blocked", activeDelete, 409);
const future = new Date(Date.now() + 86400000).toISOString();
const scheduledFixture = await create("DEV-037 Scheduled Guard", "upcoming", future);
const scheduledDelete = scheduledFixture.body?.workspace ? await request(`/api/studio/workspaces/${scheduledFixture.body.workspace.id}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: scheduledFixture.body.workspace.version }) }, cookie) : null;
if (scheduledDelete) expect("scheduled production deletion is blocked", scheduledDelete, 409);
const denied = await request("/api/studio/workspaces", {}, sessions.member.cookie); expect("ordinary member is denied", denied, 403);
const revokedResult = await request("/api/studio/workspaces", {}, sessions.revoked.cookie); expect("revoked creator is denied", revokedResult, 403);
const invalid = await request("/api/studio/workspaces", { method: "POST", body: JSON.stringify({ title: "" }) }, cookie); expect("empty Studio title is rejected", invalid, 400);
// Archive synthetic fixtures rather than deleting their rows or recordings.
for (const workspace of created) {
  const current = await request(`/api/studio/workspaces/${workspace.id}`, {}, cookie);
  if (current.response.status === 200 && current.body?.workspace?.status === "active" && !current.body.workspace.deletedAt) await request(`/api/studio/workspaces/${workspace.id}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: current.body.workspace.version }) }, cookie);
}
for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-DEV-037", baseUrl, checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRealtimeKitUsed: false }));
if (failed.length) process.exit(1);

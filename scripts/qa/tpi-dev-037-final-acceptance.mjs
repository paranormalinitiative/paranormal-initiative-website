import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequestBudget } from "./request-budget.mjs";

const baseUrl = (process.env.TPI_DEV037_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const requestBudget = createRequestBudget({ baseUrl, label: "TPI-DEV-037 final acceptance QA" });
const credentialPath = process.env.TPI_DEV037_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const fixture = readFileSync("scripts/dev/seed-tpi-dev-014-capacity.mjs", "utf8");
const passwordTemplate = fixture.match(/hash\(`([^`]+)`\)/)?.[1];
const account = username => credentials.accounts.find(item => item.username === username);
const creatorA = { username: "tpi-dev014-filler-02", password: passwordTemplate.replace("${suffix}", "02") };
const creatorB = { username: "tpi-dev014-filler-03", password: passwordTemplate.replace("${suffix}", "03") };
if (!passwordTemplate) throw new Error("Existing DEV-014 creator password fixture is incomplete.");

const checks = [];
const created = [];
const record = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await requestBudget.fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const raw = await response.text();
  let body = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = raw.slice(0, 240); }
  return { response, body };
}

async function login(credentialsForAccount) {
  const result = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: credentialsForAccount.username, password: credentialsForAccount.password })
  });
  return { ...result, cookie: (result.response.headers.get("set-cookie") || "").split(";")[0] };
}

function expectStatus(name, result, expected) {
  record(name, result.response.status === expected, `HTTP ${result.response.status}; expected ${expected}`);
}

const sessions = {
  creatorA: await login(creatorA),
  creatorB: await login(creatorB)
};
for (const [name, result] of Object.entries(sessions)) expectStatus(`${name} login`, result, 200);
if (Object.values(sessions).some(result => result.response.status !== 200)) {
  console.log(JSON.stringify({ directive: "TPI-DEV-037-FINAL-ACCEPTANCE", baseUrl, blocked: "Synthetic development creators could not authenticate.", checks }));
  process.exit(1);
}

const cookieA = sessions.creatorA.cookie;
const cookieB = sessions.creatorB.cookie;
const stateFor = (id, title, accentColor, scheduledAt = null, status = "draft") => ({
  broadcast: {
    id,
    title,
    description: "Synthetic DEV-037 final-acceptance fixture",
    status,
    visibility: "private",
    scheduledAt,
    tpiSync: { broadcastId: "should-not-survive-duplicate", revision: 3, syncState: "synced" }
  },
  settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
  recording: { localLibraryCount: 4, incompleteSessionCount: 1, storageMode: "browser" },
  configuration: {
    selectedBackground: `synthetic-${accentColor.slice(1)}`,
    styleSettings: { accentColor, fontFamily: "theme", showLogo: true },
    studioScenes: [{ id: "scene-1", kind: "camera", title: "Synthetic Scene", layout: "Speaker view" }],
    privateToken: "must-not-be-persisted"
  }
});

async function create(title, accentColor) {
  const id = `tpi-dev037-final-${randomUUID()}`;
  const result = await request("/api/studio/workspaces", {
    method: "POST",
    body: JSON.stringify({ localBroadcastId: id, title, state: stateFor(id, title, accentColor) })
  }, cookieA);
  expectStatus(`create ${title}`, result, 201);
  if (result.body?.workspace) created.push(result.body.workspace.id);
  return result;
}

const first = await create("DEV-037 Final Studio One", "#aa1122");
const second = await create("DEV-037 Final Studio Two", "#22aa44");
const firstWorkspace = first.body?.workspace;
const secondWorkspace = second.body?.workspace;
record("two isolated Studios receive distinct permanent numbers", firstWorkspace && secondWorkspace && firstWorkspace.studioNumber !== secondWorkspace.studioNumber && firstWorkspace.studioNumber > 0 && secondWorkspace.studioNumber > 0);
record("server allow-list excludes unsupported private state", firstWorkspace && !JSON.stringify(firstWorkspace.state).includes("must-not-be-persisted"));

const listA = await request("/api/studio/workspaces", {}, cookieA);
expectStatus("active Studio list loads", listA, 200);
record("active list contains both new Studios", listA.body?.workspaces?.some(item => item.id === firstWorkspace?.id) && listA.body?.workspaces?.some(item => item.id === secondWorkspace?.id));

const firstSaved = firstWorkspace ? await request(`/api/studio/workspaces/${firstWorkspace.id}`, {
  method: "PATCH",
  body: JSON.stringify({ expectedVersion: firstWorkspace.version, title: "DEV-037 Saved Studio One", state: stateFor(firstWorkspace.localBroadcastId, "DEV-037 Saved Studio One", "#1122aa") })
}, cookieA) : null;
expectStatus("supported configuration save succeeds", firstSaved, 200);
const secondSaved = secondWorkspace ? await request(`/api/studio/workspaces/${secondWorkspace.id}`, {
  method: "PATCH",
  body: JSON.stringify({ expectedVersion: secondWorkspace.version, title: "DEV-037 Saved Studio Two", state: stateFor(secondWorkspace.localBroadcastId, "DEV-037 Saved Studio Two", "#aa22cc") })
}, cookieA) : null;
expectStatus("second configuration save succeeds", secondSaved, 200);

const restoredFirst = firstWorkspace ? await request(`/api/studio/workspaces/${firstWorkspace.id}`, {}, cookieA) : null;
const restoredSecond = secondWorkspace ? await request(`/api/studio/workspaces/${secondWorkspace.id}`, {}, cookieA) : null;
expectStatus("refresh restoration loads first Studio", restoredFirst, 200);
expectStatus("refresh restoration loads second Studio", restoredSecond, 200);
record("configuration remains isolated after save and refresh", restoredFirst?.body?.workspace?.state?.configuration?.styleSettings?.accentColor === "#1122aa" && restoredSecond?.body?.workspace?.state?.configuration?.styleSettings?.accentColor === "#aa22cc");
record("recording state remains local metadata only", restoredFirst?.body?.workspace?.state?.recording?.storageMode === "browser" && restoredFirst?.body?.workspace?.state?.recording?.localLibraryCount === 4);

const currentFirst = restoredFirst?.body?.workspace;
const failedSave = currentFirst ? await request(`/api/studio/workspaces/${currentFirst.id}`, {
  method: "PATCH",
  body: JSON.stringify({ expectedVersion: currentFirst.version, title: "" })
}, cookieA) : null;
expectStatus("invalid save reports a retryable validation failure", failedSave, 400);
const retrySave = currentFirst ? await request(`/api/studio/workspaces/${currentFirst.id}`, {
  method: "PATCH",
  body: JSON.stringify({ expectedVersion: currentFirst.version, title: "DEV-037 Retry-Saved Studio" })
}, cookieA) : null;
expectStatus("valid retry after failed save succeeds", retrySave, 200);

const concurrencyBase = retrySave?.body?.workspace;
const concurrent = concurrencyBase ? await Promise.all([
  request(`/api/studio/workspaces/${concurrencyBase.id}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: concurrencyBase.version, description: "Concurrent winner A" }) }, cookieA),
  request(`/api/studio/workspaces/${concurrencyBase.id}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: concurrencyBase.version, description: "Concurrent winner B" }) }, cookieA)
]) : [];
record("concurrent save protection permits one winner", concurrent.filter(result => result.response.status === 200).length === 1 && concurrent.filter(result => result.response.status === 409).length === 1);
const afterConcurrent = concurrencyBase ? await request(`/api/studio/workspaces/${concurrencyBase.id}`, {}, cookieA) : null;
record("concurrent save leaves one coherent persisted version", afterConcurrent?.response.status === 200 && ["Concurrent winner A", "Concurrent winner B"].includes(afterConcurrent.body?.workspace?.description) && afterConcurrent.body.workspace.version === concurrencyBase.version + 1);

const duplicate = concurrencyBase ? await request(`/api/studio/workspaces/${concurrencyBase.id}/duplicate`, { method: "POST", body: JSON.stringify({ title: "DEV-037 Duplicate Studio" }) }, cookieA) : null;
expectStatus("duplicate Studio succeeds", duplicate, 201);
if (duplicate?.body?.workspace) created.push(duplicate.body.workspace.id);
record("duplicate gets a new number and draft state", duplicate?.body?.workspace?.studioNumber > 0 && duplicate.body.workspace.studioNumber !== concurrencyBase?.studioNumber && duplicate.body.workspace.state?.broadcast?.status === "draft");
record("duplicate clears schedule and external sync state", duplicate?.body?.workspace?.state?.broadcast?.scheduledAt === null && duplicate.body.workspace.state.broadcast.tpiSync === null);
record("duplicate preserves local recording metadata without uploading files", duplicate?.body?.workspace?.state?.recording?.storageMode === "browser" && duplicate.body.workspace.state.recording.localLibraryCount === 4);

const deleted = secondWorkspace ? await request(`/api/studio/workspaces/${secondWorkspace.id}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: secondSaved.body.workspace.version }) }, cookieA) : null;
expectStatus("soft delete succeeds", deleted, 200);
const activeAfterDelete = await request("/api/studio/workspaces", {}, cookieA);
const deletedAfterDelete = await request("/api/studio/workspaces?includeDeleted=true", {}, cookieA);
record("deleted Studio is excluded from active list", !activeAfterDelete.body?.workspaces?.some(item => item.id === secondWorkspace?.id));
record("deleted Studio is available for recovery", deletedAfterDelete.body?.workspaces?.some(item => item.id === secondWorkspace?.id && item.deletedAt));
const restored = deleted?.body?.workspace ? await request(`/api/studio/workspaces/${secondWorkspace.id}/restore`, { method: "POST", body: JSON.stringify({ expectedVersion: deleted.body.workspace.version }) }, cookieA) : null;
expectStatus("deleted Studio restores", restored, 200);
record("restore preserves Studio number and saved configuration", restored?.body?.workspace?.studioNumber === secondWorkspace?.studioNumber && restored.body.workspace.state?.configuration?.styleSettings?.accentColor === "#aa22cc");

const activeFixture = await create("DEV-037 Active Production Guard", "#991111");
const activeWorkspace = activeFixture.body?.workspace;
if (activeWorkspace) {
  const live = await request(`/api/studio/workspaces/${activeWorkspace.id}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: activeWorkspace.version, state: stateFor(activeWorkspace.localBroadcastId, activeWorkspace.title, "#991111", null, "live") }) }, cookieA);
  const blockedDelete = await request(`/api/studio/workspaces/${activeWorkspace.id}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: live.body?.workspace?.version }) }, cookieA);
  expectStatus("active livestream deletion is blocked", blockedDelete, 409);
  record("active livestream guard has explicit code", blockedDelete.body?.code === "studio_production_active");
}

const future = new Date(Date.now() + 86400000).toISOString();
const scheduledFixture = await create("DEV-037 Scheduled Production Guard", "#119999");
const scheduledWorkspace = scheduledFixture.body?.workspace;
if (scheduledWorkspace) {
  const scheduled = await request(`/api/studio/workspaces/${scheduledWorkspace.id}`, { method: "PATCH", body: JSON.stringify({ expectedVersion: scheduledWorkspace.version, state: stateFor(scheduledWorkspace.localBroadcastId, scheduledWorkspace.title, "#119999", future, "upcoming") }) }, cookieA);
  const blockedDelete = await request(`/api/studio/workspaces/${scheduledWorkspace.id}/delete`, { method: "POST", body: JSON.stringify({ expectedVersion: scheduled.body?.workspace?.version }) }, cookieA);
  expectStatus("scheduled production deletion is blocked", blockedDelete, 409);
  record("scheduled deletion guard has explicit code", blockedDelete.body?.code === "studio_scheduled_production");
}

const crossAccountList = await request("/api/studio/workspaces", {}, cookieB);
expectStatus("second account can authenticate without Studio access to first account", crossAccountList, 200);
record("second account sees no first-account Studios", !crossAccountList.body?.workspaces?.some(item => created.includes(item.id)));
const crossAccountRead = firstWorkspace ? await request(`/api/studio/workspaces/${firstWorkspace.id}`, {}, cookieB) : null;
expectStatus("cross-account workspace read is denied", crossAccountRead, 404);
const crossAccountWrite = firstWorkspace ? await request(`/api/studio/workspaces/${firstWorkspace.id}`, { method: "PATCH", body: JSON.stringify({ title: "cross-account mutation" }) }, cookieB) : null;
expectStatus("cross-account workspace write is denied", crossAccountWrite, 404);

// Archive synthetic rows so the test leaves no active fixtures and never touches recordings.
for (const id of created) {
  const current = await request(`/api/studio/workspaces/${id}`, {}, cookieA);
  if (current.response.status !== 200) continue;
  const workspace = current.body?.workspace;
  if (workspace?.deletedAt) {
    const recovered = await request(`/api/studio/workspaces/${id}/restore`, { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) }, cookieA);
    if (recovered.response.status === 200) {
      await request(`/api/studio/workspaces/${id}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: recovered.body.workspace.version }) }, cookieA);
    }
  } else if (workspace?.status === "active") {
    await request(`/api/studio/workspaces/${id}/archive`, { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) }, cookieA);
  }
}

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-DEV-037-FINAL-ACCEPTANCE", baseUrl, checks: checks.length, passed: checks.length - failed.length, failed: failed.length, syntheticRowsArchived: created.length }));
if (failed.length) process.exit(1);

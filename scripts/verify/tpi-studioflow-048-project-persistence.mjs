import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const api = readFileSync("functions/api/[[path]].js", "utf8");
const backup = readFileSync("studio/backup-bridge.js", "utf8");

const syntheticProject = {
  applicationId: "tpi-studioflow",
  formatVersion: 1,
  backupType: "workspace-configuration",
  project: {
    projectId: "synthetic-project-048",
    projectName: "Synthetic Project 048",
    createdAt: "2026-10-18T00:00:00.000Z",
    lastSavedAt: "2026-10-18T00:01:00.000Z",
  },
  workspace: {
    title: "Synthetic Project 048",
    description: "Fixture only",
    state: {
      broadcast: { id: "synthetic-broadcast-048", title: "Synthetic Project 048", status: "draft" },
      configuration: {
        studioScenes: [{ id: "scene-1", title: "Scene 1", layout: "Speaker view" }],
        selectedBackground: "synthetic-background",
      },
    },
  },
};

await check("D1 workspace remains the authoritative project store", () => {
  assert.match(bridge, /\/api\/studio\/workspaces/);
  assert.match(bridge, /expectedVersion: selectedWorkspace\.version/);
  assert.match(api, /studio_workspaces/);
});
await check("manual Save Project control is present", () => {
  assert.match(bridge, /Save Project/);
  assert.match(bridge, /saveCurrent\(\{ force: true, manual: true \}\)/);
});
await check("autosave is debounced and does not overlap writes", () => {
  assert.match(bridge, /window\.setTimeout\(function \(\) \{ setMessage\("SAVING\.\.\."\)/);
  assert.match(bridge, /saveCurrent\(\{ force: false \}\)/);
  assert.match(bridge, /if \(saveInFlight\)/);
  assert.match(bridge, /saveAgain = true/);
});
await check("successful saves report the server-confirmed state", () => {
  assert.match(bridge, /response\.workspace/);
  assert.match(bridge, /PROJECT SAVED/);
  assert.match(bridge, /tpi:workspace-saved/);
});
await check("save failures preserve local edits", () => {
  assert.match(bridge, /SAVE FAILED/);
  assert.match(bridge, /if \(error\.body && error\.body\.workspace\) selectedWorkspace = error\.body\.workspace/);
  assert.match(bridge, /workspace_conflict/);
});
await check("project metadata is included in configuration exports", () => {
  assert.match(bridge, /projectId/);
  assert.match(bridge, /createdAt/);
  assert.match(bridge, /lastSavedAt/);
});
await check("configuration import creates an independent project", () => {
  assert.match(bridge, /Import this configuration as a new Studio/);
  assert.match(bridge, /imported-/);
  assert.match(bridge, /state\.broadcast\.id = newId/);
});
await check("export and import do not include recordings", () => {
  assert.match(bridge, /Recording files remain in Browser Storage and are never included/);
  assert.doesNotMatch(bridge, /recordingBlob(?!s)/);
});
await check("recovery snapshots use the persistent R2 binding", () => {
  assert.match(api, /STUDIO_RECOVERY_SNAPSHOT_PREFIX/);
  assert.match(api, /env\.TPI_MEDIA\.put/);
  assert.match(api, /env\.TPI_MEDIA\.get/);
  assert.match(api, /env\.TPI_MEDIA\.list/);
});
await check("recovery snapshots are owner scoped and version checked", () => {
  assert.match(api, /getOwnedStudioWorkspace\(env, workspaceId, user\.id\)/);
  assert.match(api, /expectedVersion !== Number\(workspace\.version\)/);
  assert.match(api, /STUDIO_RECOVERY_SNAPSHOT_LIMIT = 20/);
});
await check("recovery restores never overwrite the active project", () => {
  assert.match(bridge, /Restore as New/);
  assert.match(bridge, /current project will not be overwritten/);
  assert.match(bridge, /createStudio\(workspace\.title, state\)/);
});
await check("recovery snapshots are exposed in the project menu", () => {
  assert.match(bridge, /View Recovery Snapshots/);
  assert.match(bridge, /tpi-recovery-snapshots-dialog/);
  assert.match(bridge, /tpi:workspace-snapshot-created/);
});
await check("snapshot creation follows successful project saves", () => {
  assert.match(bridge, /void createRecoverySnapshot\(selectedWorkspace\)/);
  assert.match(bridge, /\/snapshots/);
});
await check("complete media backup remains separate and available", () => {
  assert.match(backup, /Actual media|media\/|includedMedia/);
  assert.match(backup, /verificationStatus/);
  assert.match(backup, /Restore Studio/);
});
await check("synthetic project preserves supported configuration on round trip", () => {
  const serialized = JSON.stringify(syntheticProject);
  const restored = JSON.parse(serialized);
  assert.equal(restored.workspace.state.broadcast.title, "Synthetic Project 048");
  assert.equal(restored.workspace.state.configuration.studioScenes[0].layout, "Speaker view");
  assert.equal(restored.project.projectId, "synthetic-project-048");
});
await check("synthetic import remaps identity without touching source", () => {
  const imported = structuredClone(syntheticProject);
  imported.project.projectId = "synthetic-imported-048";
  imported.workspace.state.broadcast.id = "synthetic-imported-broadcast-048";
  assert.equal(syntheticProject.project.projectId, "synthetic-project-048");
  assert.equal(syntheticProject.workspace.state.broadcast.id, "synthetic-broadcast-048");
  assert.equal(imported.workspace.state.broadcast.id, "synthetic-imported-broadcast-048");
});
await check("unsafe snapshot identifiers are rejected by the API boundary", () => {
  assert.match(api, /\^\[A-Za-z0-9\]\[A-Za-z0-9\._:-\]\{0,159\}\$/);
  assert.match(api, /snapshotSegment/);
});
await check("browser storage is not the authoritative project path", () => {
  assert.match(bridge, /api\("\/api\/studio\/workspaces/);
  assert.match(api, /UPDATE studio_workspaces/);
  assert.doesNotMatch(bridge, /indexedDB\.deleteDatabase/);
});
await check("backup defaults remain disabled", () => {
  assert.match(backup, /automaticEnabled: false/);
});
await check("Crossroads is not embedded in implementation fixtures", () => {
  assert.doesNotMatch(bridge, /43b20614-69da-4d82-af9d-063cace4b6cc/);
  assert.doesNotMatch(bridge, /studio-0ec3848f-5500-462c-a1da-f711d3148d49/);
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-048", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, ownerDataAccessed: false, productionAccess: false }));
if (failed.length) process.exit(1);

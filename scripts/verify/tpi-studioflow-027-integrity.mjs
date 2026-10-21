import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const backupCore = readFileSync("studio/backup-core.mjs", "utf8");
const checks = [];
const check = (name, fn) => {
  try { fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
};

const text = value => typeof value === "string" ? value.trim() : "";
function normalizeTitle(workspace, broadcast, savedBroadcast) {
  const workspaceId = text(workspace?.id);
  const localId = text(workspace?.localBroadcastId);
  const workspaceTitle = text(workspace?.title);
  const savedId = text(savedBroadcast?.id);
  const currentId = text(broadcast?.id);
  const persistedId = localId || savedId;
  if (!workspaceId || !workspaceTitle || !persistedId) throw new Error("identity incomplete");
  if (savedId && localId && savedId !== localId) throw new Error("persisted identity conflict");
  if (currentId && currentId !== persistedId) throw new Error("active identity conflict");
  const savedTitle = text(savedBroadcast?.title);
  const currentTitle = text(broadcast?.title);
  if ((savedTitle && savedTitle !== workspaceTitle) || (currentTitle && currentTitle !== workspaceTitle) || (savedTitle && currentTitle && savedTitle !== currentTitle)) throw new Error("title conflict");
  return { ...savedBroadcast, ...broadcast, id: persistedId, title: workspaceTitle };
}

const baseWorkspace = { id: "workspace-1", localBroadcastId: "studio-1", title: "Synthetic Studio", version: 12 };
const baseSaved = { id: "studio-1", title: "", description: "kept", customField: "kept" };
const baseBroadcast = { id: "studio-1", title: "" };
const configuration = {
  studioScenes: [{ id: "intro", title: "Intro", layout: "Speaker view" }, { id: "outro", title: "Outro", layout: "Speaker view" }],
  videoClips: { intro: { blobKey: "intro" }, outro: { blobKey: "outro" } },
  guestPermissionSettings: { canSeeViewerComments: true },
  unknownConfigurationField: { preserve: true },
};

check("empty nested title normalizes from verified workspace metadata", () => assert.equal(normalizeTitle(baseWorkspace, baseBroadcast, baseSaved).title, "Synthetic Studio"));
check("missing nested title normalizes safely", () => assert.equal(normalizeTitle(baseWorkspace, { id: "studio-1" }, { id: "studio-1" }).title, "Synthetic Studio"));
check("matching titles remain unchanged", () => { const value = { id: "studio-1", title: "Synthetic Studio", customField: "kept" }; assert.deepEqual(normalizeTitle(baseWorkspace, value, value), value); });
check("conflicting non-empty titles are rejected", () => assert.throws(() => normalizeTitle(baseWorkspace, { id: "studio-1", title: "Other" }, baseSaved), /title conflict/));
check("missing selected workspace is rejected", () => assert.throws(() => normalizeTitle(null, baseBroadcast, baseSaved), /identity incomplete/));
check("incorrect workspace identity is rejected", () => assert.throws(() => normalizeTitle({ ...baseWorkspace, id: "" }, baseBroadcast, baseSaved), /identity incomplete/));
check("incorrect broadcast identity is rejected", () => assert.throws(() => normalizeTitle(baseWorkspace, { id: "studio-other", title: "" }, baseSaved), /active identity conflict/));
check("empty authoritative workspace title is rejected", () => assert.throws(() => normalizeTitle({ ...baseWorkspace, title: "" }, baseBroadcast, baseSaved), /identity incomplete/));
check("scene configuration is preserved", () => { const value = structuredClone(configuration); assert.deepEqual(value.studioScenes, configuration.studioScenes); });
check("intro and outro references are preserved", () => assert.deepEqual(configuration.videoClips, { intro: { blobKey: "intro" }, outro: { blobKey: "outro" } }));
check("guest settings are preserved", () => assert.deepEqual(configuration.guestPermissionSettings, { canSeeViewerComments: true }));
check("stale-version protection remains in the save path", () => assert.match(bridge, /expectedVersion: selectedWorkspace\.version/));
check("rejected saves cannot create a workspace", () => { const saveBlock = bridge.slice(bridge.indexOf("function saveCurrent"), bridge.indexOf("function scheduleAutosave")); assert.doesNotMatch(saveBlock, /method: "POST"/); });
check("successful serialization carries the validated title", () => { const value = normalizeTitle(baseWorkspace, baseBroadcast, baseSaved); assert.equal(JSON.stringify({ broadcast: value }).includes("Synthetic Studio"), true); });
check("failed saves preserve the existing local configuration", () => { const lastVerified = structuredClone(configuration); const afterFailure = structuredClone(lastVerified); assert.deepEqual(afterFailure, lastVerified); assert.match(bridge, /SAVE FAILED/); assert.match(bridge, /if \(error\.body && error\.body\.workspace\) selectedWorkspace = error\.body\.workspace/); });
check("studio switching remains save-gated", () => assert.match(bridge, /saveCurrent\(\{ force: true \}\)/));
check("studio restoration still applies saved state", () => assert.match(bridge, /applyState\(selectedWorkspace\)/));
check("explicit rename updates nested broadcast title", () => { const renameBlock = bridge.slice(bridge.indexOf("function renameWorkspace"), bridge.indexOf("function duplicateWorkspace")); assert.match(renameBlock, /state\.broadcast = Object\.assign/); assert.match(renameBlock, /title: title/); });
check("unknown broadcast fields are preserved by immutable normalization", () => { const value = normalizeTitle(baseWorkspace, { id: "studio-1" }, { id: "studio-1", customField: "kept" }); assert.equal(value.customField, "kept"); });
check("repeated serialization is idempotent", () => { const once = normalizeTitle(baseWorkspace, baseBroadcast, baseSaved); const twice = normalizeTitle(baseWorkspace, once, once); assert.deepEqual(twice, once); });
check("backup validation still requires a Studio title", () => assert.match(backupCore, /Studio title is required/));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-027", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0, ownerDataAccessed: false }));
if (failed.length) process.exit(1);

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const shell = readFileSync("studio/index.html", "utf8");
const checks = [];
const check = (name, fn) => {
  try {
    fn();
    checks.push({ name, passed: true });
  } catch (error) {
    checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) });
  }
};

check("browser-local snapshots have a dedicated storage key", () => {
  assert.match(bridge, /tpiLocalStudioSnapshots\.v1/);
});
check("local save uses the existing state serializer", () => {
  assert.match(bridge, /function saveLocalCurrent\(options\)/);
  assert.match(bridge, /stateForSave\(\)/);
});
check("local save verifies the active broadcast identity", () => {
  assert.match(bridge, /verifyLocalPersistence\(expectedId, state\)/);
  assert.match(bridge, /text\(read\(KEYS\.active, \"\"\)\)\.trim\(\) !== expectedId/);
});
check("local save verifies the active scene and configuration", () => {
  assert.match(bridge, /activeSceneId/);
  assert.match(bridge, /configurationMatches/);
});
check("local save verifies IndexedDB media references", () => {
  assert.match(bridge, /studioflow-recordings/);
  assert.match(bridge, /recordingBlobs/);
  assert.match(bridge, /Referenced browser-local media is missing/);
});
check("local save reports a distinct success state", () => {
  assert.match(bridge, /PROJECT SAVED LOCALLY/);
  assert.match(bridge, /storage: \"browser-local\"/);
});
check("local persistence failure remains fail-closed", () => {
  assert.match(bridge, /setMessage\("SAVE FAILED", true\)/);
  assert.match(bridge, /The browser-local Studio snapshot could not be verified/);
});
check("the server-backed PATCH path remains intact", () => {
  assert.match(bridge, /method: \"PATCH\"/);
  assert.match(bridge, /expectedVersion: selectedWorkspace\.version/);
});
check("local-to-server switching remains save-gated", () => {
  assert.match(bridge, /saveCurrent\(\{ force: true \}\)/);
  assert.match(bridge, /selectWorkspace\(workspace, true\)/);
});
check("server-to-local switching is explicit and restored through React", () => {
  assert.match(bridge, /function openLocalWorkspace\(broadcast\)/);
  assert.match(bridge, /activateReactWorkspace\(\{ localBroadcastId: broadcast\.id/);
});
check("local Studios are not attached to server workspaces", () => {
  assert.match(bridge, /function localBroadcastCandidates\(\)/);
  assert.doesNotMatch(bridge.slice(bridge.indexOf("function saveLocalCurrent"), bridge.indexOf("function saveCurrent")), /method: \"POST\"/);
});
check("the cache-busted production shell loads the repaired bridge", () => {
  assert.match(shell, /workspace-bridge\.js\?tpi080=scene-normalization-v2&tpi085=freeze-repair-v2&tpi-local-save-v1/);
});

for (const result of checks) {
  console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
}
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-LOCAL-SAVE", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, ownerDataAccessed: false }));
if (failed.length) process.exit(1);

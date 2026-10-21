import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const backup = readFileSync("studio/backup-bridge.js", "utf8");
const api = readFileSync("functions/api/[[path]].js", "utf8");
const docsIndex = readFileSync("docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md", "utf8");

const syntheticVersions = { saved: 12, exported: 12, changed: 13 };

await check("server-backed saving remains authoritative", () => {
  assert.match(bridge, /\/api\/studio\/workspaces/);
  assert.match(bridge, /expectedVersion: selectedWorkspace\.version/);
});
await check("save status uses the required persistence states", () => {
  ["UNSAVED CHANGES", "SAVING\.\.\.", "PROJECT SAVED", "SAVE FAILED"].forEach((state) => assert.match(bridge, new RegExp(state)));
  assert.match(bridge, /response\.workspace/);
});
await check("autosave remains debounced and serialized", () => {
  assert.match(bridge, /window\.setTimeout\(function \(\) \{ setMessage\("SAVING\.\.\."\)/);
  assert.match(bridge, /if \(saveInFlight\)/);
  assert.match(bridge, /saveAgain = true/);
});
await check("portable backup states distinguish prepared, current, outdated, and failed", () => {
  ["NO PORTABLE BACKUP", "BACKUP CURRENT", "BACKUP OUTDATED", "BACKUP FAILED", "BACKUP PREPARED — CONFIRM FILE SAVED"].forEach((state) => assert.match(bridge, new RegExp(state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
  assert.match(bridge, /confirmedVersion/);
  assert.match(bridge, /preparedVersion/);
});
await check("portable status becomes outdated after a newer server version", () => {
  assert.equal(syntheticVersions.changed > syntheticVersions.exported, true);
  assert.match(bridge, /Number\(state\.confirmedVersion\) < version/);
  assert.match(bridge, /markBackupOutdated\(selectedWorkspace\)/);
  assert.match(bridge, /setMessage\("UNSAVED CHANGES"\); if \(selectedWorkspace\) \{ var portable = portableState/);
});
await check("configuration export is a portable browser download", () => {
  assert.match(bridge, /Export Project/);
  assert.match(bridge, /tpi-studioflow-.*-project-backup\.json/);
  assert.match(bridge, /BACKUP PREPARED — CONFIRM FILE SAVED/);
  assert.match(bridge, /Confirm Portable Backup Saved/);
});
await check("complete project backup uses the existing verified media writer", () => {
  assert.match(bridge, /window\.__tpiStudioBackup/);
  assert.match(bridge, /backupNow\(\{ force: true \}\)/);
  assert.match(backup, /includedMedia/);
  assert.match(backup, /verificationStatus/);
  assert.match(backup, /tpi:portable-backup-verified/);
});
await check("complete backup records the server configuration version only after verification", () => {
  assert.match(bridge, /result\.manifest\.configurationVersion/);
  assert.match(backup, /verify\(dest, published, complete, true\)/);
  assert.match(backup, /writeFile\(root \+ "\/CURRENT\.json"/);
});
await check("portable export preserves project identity metadata and avoids recordings", () => {
  assert.match(bridge, /projectId/);
  assert.match(bridge, /createdAt/);
  assert.match(bridge, /lastSavedAt/);
  assert.match(bridge, /Recording files remain in Browser Storage and are never included/);
  assert.doesNotMatch(bridge, /recordingBlob(?!s)/);
});
await check("import remains independent and rejects protected ownership fields", () => {
  assert.match(bridge, /Import this configuration as a new Studio/);
  assert.match(bridge, /imported-/);
  assert.match(bridge, /Protected server ownership fields are not accepted/);
});
await check("R2 recovery snapshots remain distinct from portable backups", () => {
  assert.match(bridge, /View Recovery Snapshots/);
  assert.match(bridge, /Snapshots are server-backed configuration copies/);
  assert.match(api, /STUDIO_RECOVERY_SNAPSHOT/);
});
await check("documentation and directive index identify the portable backup work", () => {
  assert.match(docsIndex, /TPI-STUDIOFLOW-049/);
});

const failed = checks.filter((item) => !item.passed);
for (const item of checks) console.log(`${item.passed ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
console.log(`TPI-STUDIOFLOW-049 focused results: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exitCode = 1;

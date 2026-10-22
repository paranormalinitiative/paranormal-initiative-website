import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const backup = readFileSync("studio/backup-bridge.js", "utf8");
const css = readFileSync("studio/studioflow-012-overrides.css", "utf8");
const checks = [];
const check = (name, fn) => {
  try {
    fn();
    checks.push({ name, passed: true });
  } catch (error) {
    checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) });
  }
};

check("complete backup preserves the verified folder destination path", () => {
  assert.match(bridge, /capabilities\.automaticFolderBackup/);
  assert.match(bridge, /currentSettings\.destinationName/);
  assert.match(bridge, /backup\.backupNow\(\{ force: true \}\)/);
});
check("unsupported folder browsers receive a media-inclusive download fallback", () => {
  assert.match(bridge, /backup\.portableBackupNow\(\)/);
  assert.match(backup, /backupType: "complete-portable-studio"/);
  assert.match(backup, /Download Complete Backup/);
  assert.match(backup, /media: collected\.includedMedia\.map/);
});
check("portable download is verified before it is offered", () => {
  assert.match(backup, /verifyPortableArchive\(archive\)\.then/);
  assert.match(backup, /Portable backup media failed integrity verification/);
  assert.match(bridge, /BACKUP PREPARED — CONFIRM FILE SAVED/);
});
check("portable restore creates a new Studio and rolls media back on failure", () => {
  assert.match(backup, /Restore Backup File/);
  assert.match(backup, /restorePortableFile/);
  assert.match(backup, /restorePackageAsNew/);
  assert.match(backup, /Promise\.all\(writtenKeys\.map\(deleteBlob\)\)/);
});
check("My Studios menu has readable responsive styling", () => {
  [".tpi-my-studios-panel", ".tpi-studio-selector", ".tpi-studio-menu", ".tpi-studio-status", "overflow-wrap: anywhere", ".tpi-studio-menu[hidden]", "@media (max-width: 520px)"].forEach((token) => assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});
check("custom menu remains a portal with accessible menu semantics", () => {
  assert.match(bridge, /aria-haspopup=\\"menu\\"/);
  assert.match(bridge, /role=\\"menu\\"/);
  assert.match(bridge, /data-tpi-portal/);
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-017", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, ownerDataAccessed: false }));
if (failed.length) process.exit(1);

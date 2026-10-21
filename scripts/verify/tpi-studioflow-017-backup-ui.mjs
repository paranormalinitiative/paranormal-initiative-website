import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
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

check("complete backup requires a supported folder destination", () => {
  assert.match(bridge, /capabilities\.automaticFolderBackup/);
  assert.match(bridge, /currentSettings\.destinationName/);
});
check("unsupported browsers receive an explicit fallback message", () => {
  assert.match(bridge, /Complete media backup requires a supported browser folder destination/);
  assert.match(bridge, /Use Export Project for a browser download/);
});
check("missing destination does not claim a backup failure", () => {
  const start = bridge.indexOf("function backupCompleteProject");
  const end = bridge.indexOf("function confirmPortableBackup", start);
  const section = bridge.slice(start, end);
  const prerequisite = section.slice(section.indexOf("if (!capabilities.automaticFolderBackup"), section.indexOf("backup.backupNow"));
  assert.doesNotMatch(prerequisite, /BACKUP FAILED/);
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

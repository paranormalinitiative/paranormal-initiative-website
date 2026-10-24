import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const assetBridge = readFileSync("studio/workspace-asset-state-bridge.js", "utf8");
const html = readFileSync("studio/index.html", "utf8");

const checks = [];
function check(name, passed) { checks.push({ name, passed: Boolean(passed) }); }

check("workspace reconciliation contains no page reload call", !bridge.includes("window.location.reload()"));
check("workspace selection applies state in place", bridge.includes("applyState(selectedWorkspace)") && bridge.includes("render();"));
check("refresh normalizes route state without navigating", bridge.includes('localStorage.setItem(KEYS.route, JSON.stringify("studio"))') && !bridge.includes("window.location.reload"));
check(
  "save responses do not navigate the document",
  bridge.includes("tpi:workspace-saved") && !bridge.includes("location.href"),
);
check("asset persistence does not reload after applying configuration", assetBridge.includes("applyConfiguration(body.workspace.state.configuration, keyGuard)") && !assetBridge.includes("location.reload"));
check("asset staging does not inject a browser reload", html.includes("workspace-asset-state-bridge.js") && !assetBridge.includes("window.location.reload"));
check("autosave remains guarded against overlapping requests", bridge.includes("if (saveInFlight)") && bridge.includes("saveAgain = true"));
check("workspace switching remains save-gated", bridge.includes("if (!saved) { setMessage(\"The current Studio could not be saved."));
check("production lock still prevents unsafe switching", bridge.includes("function canChangeStudio()") && bridge.includes("productionLock()"));
check("no reload workaround was added to cache-busting", !bridge.includes("cache-bust") || !bridge.includes("location.reload"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-050", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, ownerDataAccessed: false, productionAccess: false }));
if (failed.length) process.exit(1);

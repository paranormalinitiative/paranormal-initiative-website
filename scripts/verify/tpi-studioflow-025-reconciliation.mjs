import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const reconciliationStart = bridge.indexOf("function activeWorkspaceCandidate");
const reconciliationEnd = bridge.indexOf("function selectorLabel", reconciliationStart);
const reconciliationSource = bridge.slice(reconciliationStart, reconciliationEnd);
const checks = [
  ["reconciliation uses the persisted broadcast identity", bridge.includes("text(savedBroadcast.id) === text(hostBroadcast.id)") && bridge.includes("persistedId = localId || savedId")],
  ["reconciliation requires a matching Studio title", bridge.includes("sameTitle(hostBroadcast.title, savedBroadcast.title || workspace.title)")],
  ["ambiguous or unmatched broadcasts remain unbound", bridge.includes("return matches.length === 1 ? matches[0] : null") && bridge.includes("selectedWorkspace = null; workspace = { title: hostBroadcast.title }")],
  ["active reconciliation is preferred during workspace refresh", bridge.includes("reconciledWorkspace = activeWorkspaceCandidate()") && bridge.includes("selectedWorkspace = reconciledWorkspace || (!hostHasIdentity ?")],
  ["reconciliation does not create a workspace", reconciliationStart >= 0 && reconciliationEnd > reconciliationStart && !reconciliationSource.includes("method: \"POST\"")],
  ["restoration preserves the persisted broadcast ID", bridge.includes("var broadcastId = text(broadcast.id) || text(saved.localBroadcastId) || text(saved.id)") && bridge.includes("localStorage.setItem(KEYS.active, JSON.stringify(restored.id))")],
  ["saving validates and preserves the selected workspace broadcast identity", bridge.includes("normalizeBroadcastTitle(selectedWorkspace, broadcast, savedBroadcast)") && bridge.includes("normalized.id = persistedId")],
  ["saving remains guarded by a resolved selected workspace or verified local identity", bridge.includes("if (!selectedWorkspace) return saveLocalCurrent(options)") && bridge.includes("expectedVersion: selectedWorkspace.version") && bridge.includes("verifyLocalPersistence(expectedId, state)")],
  ["deletion uses the supported archive endpoint", bridge.includes("/delete") && bridge.includes("expectedVersion: workspace.version")],
  ["deletion acts only on the selected workspace", bridge.includes("deleteWorkspace(selectedWorkspace)")],
  ["Crossroads is not hardcoded into reconciliation", !bridge.includes("Crossroads of the Unknown")],
];

for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
const failed = checks.filter(([, passed]) => !passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-025", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exitCode = 1;

import { readFileSync } from "node:fs";

// The original TPI-023 title-only selector was superseded by the explicit
// My Studios dropdown contract completed in the later StudioFlow releases.
// Keep this regression focused on the same active-broadcast reconciliation
// behavior while asserting the current entry-point and accessible label.
const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const shell = readFileSync("studio/index.html", "utf8");
const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

check("the shell references the current cache-busted workspace bridge", shell.includes("workspace-bridge.js?tpi080=scene-normalization-v2&tpi085=freeze-repair-v2&tpi-local-save-v1"));
check("the active host broadcast takes precedence over a stale remembered Studio", bridge.includes("text(read(KEYS.active, \"\"))") && bridge.includes("hostWorkspace") && bridge.includes("localStorage.setItem(KEYS.activeStudio, hostWorkspace.id)"));
check("the active broadcast ID uses the app's JSON storage format", bridge.includes("function activeBroadcast() { var id = text(read(KEYS.active, \"\"))") && bridge.includes("function activeWorkspaceCandidate()") && bridge.includes("text(savedBroadcast.id) === text(hostBroadcast.id)"));
check("an unpersisted host broadcast is shown without binding saves to a different Studio", bridge.includes("hostBroadcast = activeBroadcast()") && bridge.includes("selectedWorkspace = null") && bridge.includes("localStorage.removeItem(KEYS.activeStudio)"));
check("the selector derives its label from the active workspace title", bridge.includes("function selectorLabel(workspace)") && bridge.includes("text(workspace && workspace.title).trim()"));
check("the selector renders the current My Studios label", bridge.includes("selector.textContent = selectorButtonText(selectedWorkspace)"));
check("the selector updates its accessible name with the active label", bridge.includes("selector.setAttribute(\"aria-label\", \"My Studios — select studio: \" + activeLabel)"));
check("the generic fallback is used only without a valid title", bridge.includes('return title || "My Studios"'));
check("the active workspace remains sourced from remembered server workspaces", bridge.includes("rememberedWorkspace = workspaces.find(function (item) { return item.id === remembered; }) || null") && bridge.includes("reconciledWorkspace = activeWorkspaceCandidate()") && bridge.includes("selectedWorkspace = reconciledWorkspace || (!hostHasIdentity ?"));
check("switching updates the active workspace before re-render", bridge.includes("selectedWorkspace = workspace; localStorage.setItem(KEYS.activeStudio, workspace.id); render();"));
check("the loaded workspace name is applied after the workspace request resolves", bridge.includes("var hydrated = body.workspace || workspace; selectedWorkspace = hydrated; hydrateWorkspace(hydrated);") && bridge.includes("activateReactWorkspace(hydrated)"));
check("the selector reconciles after host broadcast hydration", bridge.includes("function render()") && bridge.includes("selector.textContent = selectorButtonText(selectedWorkspace)"));
check("the existing Studio list labels and selection behavior remain intact", bridge.includes('button(selectedLabel(workspace), "open")') && bridge.includes('action === "open"') && bridge.includes("openWorkspace(workspace)"));
check("no owner Studio name is hardcoded", !bridge.includes("Crossroads of the Unknown") && !bridge.includes("How to Ghost Hunt") && !bridge.includes("TPI Learning Test"));
check("an unmatched active broadcast is shown without creating a duplicate workspace", bridge.includes("function localBroadcastCandidates()") && bridge.includes("Browser-only:") && bridge.includes("This Studio is saved in this browser only") && bridge.includes("Save Current Studio to My Studios"));
check("an unmatched active broadcast cannot silently select a remembered workspace", bridge.includes("hostHasIdentity") && bridge.includes("reconciledWorkspace || (!hostHasIdentity ?"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-023", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exit(1);

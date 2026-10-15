import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const repo = process.cwd();
const studio = read(`${repo}/studio/index.html`);
const navigationBridge = read(`${repo}/studio/navigation-bridge.js`);
const workspaceBridge = read(`${repo}/studio/workspace-bridge.js`);
const api = read(`${repo}/functions/api/[[path]].js`);
const worker = read(`${repo}/worker.js`);
const sidebar = read(`${repo}/member-sidebar.html`);
const memberHome = read(`${repo}/member-home.html`);
const explore = read(`${repo}/explore.html`);
const exploreJs = read(`${repo}/explore.js`);
const checks = [];
const check = (name, passed) => checks.push({ name, passed });

check("StudioFlow loads the navigation compatibility bridge", studio.includes('/studio/navigation-bridge.js'));
check("StudioFlow return control targets canonical member homepage", navigationBridge.includes('var MEMBER_HOME = "/member-home.html"'));
check("return navigation is environment-relative", navigationBridge.includes('setAttribute("href", MEMBER_HOME)') && !navigationBridge.includes("paranormalinitiative.com"));
check("canonical member homepage is present in existing member navigation", sidebar.includes('href="member-home.html"') && memberHome.includes('data-member-content'));
check("legacy explore is not in the normal member sidebar", !sidebar.includes('href="explore.html"') && !sidebar.includes('href="/explore"'));
check("explore remains the working Community Feed surface", explore.includes('data-explore-feed') && exploreJs.includes('communityFeed(40, 0)'));
check("workspace errors distinguish auth, permission, missing, schema, backend, and network cases", [
  "auth_required", "access_denied", "workspace_not_found", "workspace_schema_unsupported",
  "workspace_backend_unavailable", "network_failure"
].every((code) => workspaceBridge.includes(code) || api.includes(code)));
check("workspace saves only report success after an OK API response", workspaceBridge.includes('request.then(function () {') && workspaceBridge.includes('setMessage(existing ? "Workspace saved."'));
check("workspace controls explain configuration versus recordings", workspaceBridge.includes("Configuration only.") && workspaceBridge.includes("Recording files remain in Browser Storage") && workspaceBridge.includes("never included in workspace saves"));
check("workspace import rejects protected ownership fields", workspaceBridge.includes("Protected server ownership fields are not accepted in backups."));
check("workspace API returns explicit schema/backend failures", api.includes("studioWorkspaceStorageFailure") && api.includes("workspace_schema_unsupported") && api.includes("workspace_backend_unavailable"));
check("workspace API remains owner-scoped", api.includes("WHERE id = ? AND owner_id = ?") && api.includes("WHERE owner_id = ?"));
check("workspace archive remains non-destructive", api.includes("status = 'archived'") && !workspaceBridge.includes("deleteDatabase") && !workspaceBridge.includes("indexedDB.deleteDatabase"));
check("StudioFlow recording storage remains local", workspaceBridge.includes("recordingDestination") && !workspaceBridge.includes("/api/uploads"));
check("Creator Studio route remains server-gated", worker.includes('url.pathname === "/studio"') && worker.includes("hasCreatorStudioAccess"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(`TPI-DEV-033 offline checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);

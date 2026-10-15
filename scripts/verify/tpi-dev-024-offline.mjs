import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/[[path]].js", "utf8");
const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const studio = readFileSync("studio/index.html", "utf8");
const migration = readFileSync("migrations/0051_studioflow_workspaces.sql", "utf8");
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok, detail });

check("workspace migration is additive", /CREATE TABLE IF NOT EXISTS studio_workspaces/.test(migration) && !/DROP TABLE|DELETE FROM|ALTER TABLE .* DROP/i.test(migration));
check("workspace migration is owner-scoped", /owner_id TEXT NOT NULL REFERENCES contributors\(id\)/.test(migration) && /UNIQUE\(owner_id, local_broadcast_id\)/.test(migration));
check("workspace state has bounded allow-list", api.includes("STUDIO_WORKSPACE_MAX_STATE_BYTES") && api.includes("normalizeStudioWorkspaceState") && api.includes("Workspace state is too large to save."));
const workspaceStateSection = api.slice(api.indexOf("function normalizeStudioWorkspaceState"), api.indexOf("function parseBroadcastSchedule"));
check("workspace state excludes recording blobs and secrets", !workspaceStateSection.includes("streamKey") && !workspaceStateSection.includes("authToken") && !workspaceStateSection.includes("recordingBlob") && !workspaceStateSection.includes("fileHandle"));
check("studio routes require server-side Studio access", api.includes('path === "/studio/workspaces"') && api.includes("requireStudioAccess(request, env, user => handleListStudioWorkspaces") && api.includes("requireStudioAccess(request, env, user => handleCreateStudioWorkspace"));
check("workspace reads are exact-owner scoped", api.includes("WHERE id = ? AND owner_id = ?") && api.includes("getOwnedStudioWorkspace(env, id, user.id)"));
check("workspace mutations reject cross-origin requests", api.includes("Cross-origin workspace mutations are not allowed.") && api.includes("sameOriginMutationAllowed(request)"));
check("workspace saves use optimistic version checks", api.includes("expectedVersion") && api.includes("version = version + 1") && api.includes('code: "conflict"'));
check("archive is non-destructive", api.includes("status = 'archived'") && !api.includes("DELETE FROM studio_workspaces"));
check("recording bridge does not upload or delete recordings", bridge.includes("Recording files stay in Browser Storage") && !bridge.includes("/api/uploads") && !bridge.includes("deleteDatabase") && !bridge.includes("indexedDB.deleteDatabase"));
check("bridge only appears for server-derived Studio access", bridge.includes("/api/auth/me") && bridge.includes("creatorStudioAccess === true"));
check("bridge provides save restore archive actions", bridge.includes("Save current") && bridge.includes("openWorkspace") && bridge.includes("archiveWorkspace"));
check("bridge is loaded by StudioFlow shell", studio.includes('/studio/workspace-bridge.js'));

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-DEV-024", checks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);

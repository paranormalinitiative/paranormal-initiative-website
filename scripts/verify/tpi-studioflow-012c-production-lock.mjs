import { readFileSync } from "node:fs";

const read = file => readFileSync(file, "utf8");
const api = read("functions/api/[[path]].js");
const migration = read("migrations/0053_studioflow_creator_production_lock.sql");
const bridge = read("studio/production-lock-bridge.js");
const workspaceBridge = read("studio/workspace-bridge.js");
const shell = read("studio/index.html");
const checks = [];
const check = (name, ok) => checks.push({ name, ok: Boolean(ok) });

check("additive migration creates one creator production row", migration.includes("CREATE TABLE IF NOT EXISTS studio_production_sessions") && migration.includes("creator_id TEXT PRIMARY KEY") && !/DROP TABLE|DELETE FROM/i.test(migration));
check("production session is tied to a stable Studio workspace", migration.includes("studio_workspace_id TEXT NOT NULL REFERENCES studio_workspaces(id)") && migration.includes("ON DELETE RESTRICT"));
check("scheduled broadcasts retain their Studio reference", migration.includes("ALTER TABLE live_broadcasts ADD COLUMN studio_workspace_id") && api.includes("studioWorkspaceId: row.studio_workspace_id"));
check("room livestream sessions retain their lock session", migration.includes("ALTER TABLE studio_rooms ADD COLUMN production_session_id"));
check("the server exposes start heartbeat stop and active-lock routes", api.includes('path === "/studio/production/start"') && api.includes('path === "/studio/production/heartbeat"') && api.includes('path === "/studio/production/stop"') && api.includes('path === "/studio/production/active"'));
check("starting production reserves before external room dispatch", api.indexOf("reserveCreatorProduction(env") < api.indexOf("realtimeKitRequest(env, \"/recordings\""));
check("failed external room starts release the reservation", api.includes('status: "abandoned"') && api.includes("releaseCreatorProduction(env, { creatorId: user.id, sessionId: productionSessionId"));
check("the required conflict wording is preserved", api.includes("Another studio is currently in production.\\n\\nFinish your active session before starting a production in this studio."));
check("concurrent starts are serialized by creator uniqueness", api.includes("ON CONFLICT(creator_id) DO UPDATE SET") && api.includes("studio_production_sessions.status <> 'active'") && api.includes("session_id = excluded.session_id"));
check("production stops release only the matching creator session", api.includes("WHERE creator_id = ? AND session_id = ? AND status = 'active'") && api.includes("releaseCreatorProduction"));
check("switching checks the authoritative active-session endpoint", workspaceBridge.includes("/api/studio/production/active") && workspaceBridge.includes("Studio switching is paused until the active session can be checked."));
check("local recording uses the authoritative lock before the existing recorder click", bridge.includes("installClickGate") && bridge.includes("event.stopImmediatePropagation()") && bridge.includes("/api/studio/production/start"));
check("local recording heartbeats and does not release on pagehide", bridge.includes("/api/studio/production/heartbeat") && bridge.includes("Do not release here"));
check("recording bytes remain in browser storage", bridge.includes("recording-checkpoint") || (bridge.includes("IndexedDB") && !bridge.includes("/api/uploads")));
check("the production lock bridge is loaded by StudioFlow", shell.includes("/studio/production-lock-bridge.js"));
check("no external provider or streaming request is added by the bridge", !/https?:\/\//i.test(bridge) && !bridge.includes("Tavily") && !bridge.includes("RealtimeKit"));

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-012-ADDENDUM-C", checks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);

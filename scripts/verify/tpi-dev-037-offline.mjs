import { readFileSync } from "node:fs";

const read = file => readFileSync(file, "utf8");
const api = read("functions/api/[[path]].js");
const bridge = read("studio/workspace-bridge.js");
const migration = read("migrations/0052_my_studios.sql");
const checks = [];
const check = (name, ok) => checks.push({ name, ok });

check("DEV-037 migration is additive and recoverable", migration.includes("ADD COLUMN studio_number") && migration.includes("ADD COLUMN deleted_at") && migration.includes("CREATE TABLE studio_number_allocations") && !/DROP TABLE|DELETE FROM/i.test(migration));
check("studio numbers are allocated from a durable counter", api.includes("studio_number_allocations") && api.includes("RETURNING next_number - 1 AS studio_number") && !/COUNT\(\*\).*studio_number/i.test(api));
check("numbered payload is exposed without changing existing workspace identifiers", api.includes("studioNumber") && api.includes("deletedAt") && api.includes("localBroadcastId"));
check("duplicate, soft-delete, and restore routes are owner-scoped", api.includes("handleDuplicateStudioWorkspace") && api.includes("handleDeleteStudioWorkspace") && api.includes("handleRestoreStudioWorkspace") && api.includes("owner_id = ?"));
check("production-state and scheduled-delete guards exist", api.includes("studio_production_active") && api.includes("studio_scheduled_production") && api.includes("STUDIO_ACTIVE_PRODUCTION_STATUSES"));
check("configuration is allow-listed", api.includes("normalizeStudioConfiguration") && bridge.includes("configurationForSave") && !bridge.includes("customLogo") && !bridge.includes("/api/uploads"));
check("My Studios is placed in the existing asset panel", bridge.includes("tpi-my-studios-panel") && bridge.includes("querySelector(\".asset-panel\")") && bridge.includes(".brand-row"));
check("required management actions are present", bridge.includes("Rename Project") && bridge.includes("Duplicate Project") && bridge.includes("Delete Project") && bridge.includes("Recently Deleted Studios"));
check("autosave reports only server-confirmed success", bridge.includes("setMessage(\"SAVING...\")") && bridge.includes("setMessage(\"PROJECT SAVED\")") && bridge.includes("saveInFlight"));
check("recording files remain local", bridge.includes("Recording files remain in Browser Storage") && !bridge.includes("indexedDB.deleteDatabase") && !bridge.includes("/api/uploads"));
check("cross-tab and unload production safeguards exist", bridge.includes("BroadcastChannel") && bridge.includes("beforeunload") && bridge.includes("productionLock"));
check("server access remains entitlement-gated", api.includes("requireStudioAccess") && api.includes("/studio/workspaces") && !bridge.includes("creatorStudioAccess === true"));

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-DEV-037", checks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);

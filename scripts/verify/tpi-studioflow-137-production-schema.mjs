#!/usr/bin/env node
// TPI-STUDIOFLOW-137 — production schema readiness for the Notes workspace.
//
// The complete Notes workspace needs the studio_note_* tables. This check is
// read-only and safe to run at any time; the guarded production release runs it
// before deploying and refuses to ship an interface that could not persist.
//
// Exit status: 0 when every required table exists, 1 when any is missing.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const wrangler = process.env.TPI_WRANGLER_BIN || "/opt/homebrew/bin/wrangler";
const database = process.env.TPI_PRODUCTION_DATABASE || "tpi_contributor_portal";
const baseline = JSON.parse(readFileSync(join(repoRoot, "scripts", "studioflow-release-baseline.json"), "utf8"));
const requirement = baseline.productionSchemaRequirements;

if (!requirement?.requiredTables?.length) {
  console.log(JSON.stringify({ status: "PASS", reason: "the approved source declares no production schema requirement" }, null, 2));
  process.exit(0);
}

const list = requirement.requiredTables.map((name) => `'${name}'`).join(",");
const raw = execFileSync(wrangler, [
  "d1", "execute", database, "--remote", "--json",
  "--command", `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${list});`,
], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const parsed = JSON.parse(raw);
const present = new Set((parsed?.[0]?.results || []).map((row) => row.name));
const missing = requirement.requiredTables.filter((name) => !present.has(name));
const applied = requirement.requiredTables.filter((name) => present.has(name));

console.log(JSON.stringify({
  status: missing.length === 0 ? "PASS" : "BLOCKED",
  database,
  requiredTables: requirement.requiredTables,
  presentTables: applied,
  missingTables: missing,
  pendingMigrations: missing.length === 0 ? [] : requirement.migrations,
  reason: missing.length === 0
    ? "the production schema satisfies the approved source"
    : `${requirement.reason} Apply ${requirement.migrations.join(", ")} under an authorized migration release before deploying.`,
}, null, 2));

process.exit(missing.length === 0 ? 0 : 1);

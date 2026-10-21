#!/usr/bin/env node

// Synthetic-only verification for TPI-STUDIOFLOW-036A. This creates a fresh
// temporary Wrangler D1 database and never reads or writes the shared local DB.
import { createHash, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const wrangler = process.env.WRANGLER_BIN || "/opt/homebrew/bin/wrangler";
const tempRoot = mkdtempSync("/private/tmp/tpi-036a-reset-");
const statePath = resolve(tempRoot, "state");
const configPath = resolve(tempRoot, "wrangler.toml");
const database = "tpi-036a-synthetic";

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function hashPassword(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function executeSql(sql) {
  const path = resolve(tempRoot, `statement-${randomBytes(8).toString("hex")}.sql`);
  writeFileSync(path, sql, { mode: 0o600, flag: "wx" });
  try {
    execFileSync(wrangler, [
      "d1", "execute", database,
      "--config", configPath,
      "--local",
      "--persist-to", statePath,
      "--file", path,
      "--yes",
    ], {
      cwd: repoRoot,
      env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_DISABLE_OUTBOUND: "1" },
      stdio: ["ignore", "ignore", "ignore"],
    });
  } finally {
    try { unlinkSync(path); } catch {}
  }
}

function query(sql) {
  const output = execFileSync(wrangler, [
    "d1", "execute", database,
    "--config", configPath,
    "--local",
    "--persist-to", statePath,
    "--command", sql,
    "--json",
  ], {
    cwd: repoRoot,
    env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_DISABLE_OUTBOUND: "1" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return JSON.parse(output)?.[0]?.results || [];
}

const config = `name = "tpi-036a-synthetic"\nmain = "worker.js"\ncompatibility_date = "2026-07-15"\n[vars]\nTPI_ENV = "local"\nTPI_LOCAL_ONLY = "1"\n[[d1_databases]]\nbinding = "TPI_DB"\ndatabase_name = "${database}"\ndatabase_id = "00000000-0000-4000-8000-000000000036"\n`;
writeFileSync(configPath, config, { mode: 0o600, flag: "wx" });

try {
  executeSql(`
CREATE TABLE contributors (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  title TEXT,
  role TEXT NOT NULL,
  correspondence TEXT,
  affiliation TEXT,
  organization TEXT,
  website TEXT,
  comment_signature_enabled INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
INSERT INTO contributors (id, username, password_hash, role, active)
VALUES ('synthetic-owner', 'old-owner', 'old-hash', 'owner', 1);
INSERT INTO sessions (token, contributor_id, expires_at)
VALUES ('synthetic-session', 'synthetic-owner', '2099-01-01T00:00:00Z');
`);

  const source = readFileSync(resolve(repoRoot, "scripts/reset-local-master-admin.mjs"), "utf8");
  if (/\bBEGIN\b|\bCOMMIT\b/.test(source)) throw new Error("reset helper still contains explicit SQL transaction statements");
  if (!source.includes('"--file", tempPath') || !source.includes('flag: "wx"') || !source.includes("unlinkSync(tempPath)")) {
    throw new Error("reset helper is missing protected temporary-file handling");
  }

  const syntheticPassword = "synthetic-password-never-printed";
  executeSql(`
INSERT INTO contributors (id, username, password_hash, display_name, title, role, active)
VALUES ('synthetic-owner', 'new-owner', ${sqlString(hashPassword(syntheticPassword))}, 'Local Master Administrator', 'Founder / Director', 'owner', 1)
ON CONFLICT(id) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash, role = 'owner', active = 1;
DELETE FROM sessions WHERE contributor_id = 'synthetic-owner';
`);

  const updated = query("SELECT username, role, active, (SELECT COUNT(*) FROM sessions WHERE contributor_id = 'synthetic-owner') AS session_count FROM contributors WHERE id = 'synthetic-owner';")[0];
  if (updated?.username !== "new-owner" || updated?.role !== "owner" || Number(updated?.active) !== 1 || Number(updated?.session_count) !== 0) {
    throw new Error("synthetic successful batch postcondition failed");
  }

  let failed = false;
  try {
    executeSql(`
INSERT INTO contributors (id, username, password_hash, role, active)
VALUES ('synthetic-owner', 'must-not-persist', 'must-not-persist', 'owner', 1)
ON CONFLICT(id) DO UPDATE SET username = excluded.username;
INSERT INTO table_that_does_not_exist (value) VALUES ('forced failure');
`);
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("synthetic failure case unexpectedly succeeded");
  const preserved = query("SELECT username FROM contributors WHERE id = 'synthetic-owner';")[0];
  if (preserved?.username !== "new-owner") throw new Error("failed D1 batch partially applied");

  console.log(JSON.stringify({
    status: "PASSED",
    database,
    checksPassed: 5,
    checks: [
      "no explicit SQL transaction statements",
      "temporary SQL is exclusive and removed",
      "synthetic credential batch applied",
      "synthetic postconditions verified",
      "failed synthetic batch preserved prior account",
    ],
    credentialsPrinted: false,
    sharedDevelopmentDatabaseTouched: false,
  }));
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

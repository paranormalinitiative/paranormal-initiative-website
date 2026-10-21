#!/usr/bin/env node

// Synthetic-only verification for TPI-STUDIOFLOW-039. It creates a fresh
// temporary Wrangler D1 database and never reads or writes shared local D1.
import { createHash, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildTargetPasswordResetSql, hashPassword, isEligibleTargetAccount } from "../local-credential-reset.mjs";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const wrangler = process.env.WRANGLER_BIN || "/opt/homebrew/bin/wrangler";
const tempRoot = mkdtempSync("/private/tmp/tpi-039-reset-");
const statePath = resolve(tempRoot, "state");
const configPath = resolve(tempRoot, "wrangler.toml");
const database = "tpi-039-synthetic";
const oldAdminPassword = "old-synthetic-password";
const newAdminPassword = "new-synthetic-password";
const otherPassword = "other-synthetic-password";

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
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

function check(name, condition) {
  if (!condition) throw new Error(`${name} failed`);
  return name;
}

const config = `name = "tpi-039-synthetic"\nmain = "worker.js"\ncompatibility_date = "2026-07-15"\n[vars]\nTPI_ENV = "local"\nTPI_LOCAL_ONLY = "1"\n[[d1_databases]]\nbinding = "TPI_DB"\ndatabase_name = "${database}"\ndatabase_id = "00000000-0000-4000-8000-000000000039"\n`;
writeFileSync(configPath, config, { mode: 0o600, flag: "wx" });

try {
  // The reset utility is intentionally interactive and is not imported; inspect
  // its source below without executing it.
  const source = await (await import("node:fs/promises")).readFile(resolve(repoRoot, "scripts/reset-local-master-admin.mjs"), "utf8");
  const checks = [
    check("target flag exists", source.includes("--target-username")),
    check("target account uses existing hash mechanism", source.includes("buildTargetPasswordResetSql") && source.includes("hashPassword")),
    check("confirmation is required", source.includes("password !== confirmation")),
    check("temporary SQL uses exclusive creation", source.includes('flag: "wx"')),
    check("temporary SQL is cleaned on failure", source.includes("finally") && source.includes("unlinkSync(tempPath)")),
    check("no explicit SQL transaction statements", !/\b(BEGIN|COMMIT|SAVEPOINT)\b/.test(source)),
    check("target eligibility preserves role", isEligibleTargetAccount({ username: "local_admin", role: "admin", active: 1 }, "local_admin")),
    check("wrong username is rejected", !isEligibleTargetAccount({ username: "local_admin", role: "admin", active: 1 }, "other")),
    check("inactive account is rejected", !isEligibleTargetAccount({ username: "local_admin", role: "admin", active: 0 }, "local_admin")),
    check("member account is rejected", !isEligibleTargetAccount({ username: "local_admin", role: "member", active: 1 }, "local_admin")),
  ];

  executeSql(`
CREATE TABLE contributors (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, display_name TEXT, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE sessions (token TEXT PRIMARY KEY, contributor_id TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE studio_workspaces (id TEXT PRIMARY KEY, title TEXT NOT NULL, version INTEGER NOT NULL);
INSERT INTO contributors VALUES ('synthetic-admin', 'local_admin', ${sqlString(hashPassword(oldAdminPassword))}, 'Synthetic Admin', 'admin', 1);
INSERT INTO contributors VALUES ('synthetic-other', 'other_account', ${sqlString(hashPassword(otherPassword))}, 'Other Account', 'member', 1);
INSERT INTO sessions VALUES ('admin-session', 'synthetic-admin', '2099-01-01T00:00:00Z');
INSERT INTO sessions VALUES ('other-session', 'synthetic-other', '2099-01-01T00:00:00Z');
INSERT INTO studio_workspaces VALUES ('synthetic-studio', 'Synthetic Studio', 7);
`);

  const beforeOther = query("SELECT id, username, password_hash, role, active FROM contributors WHERE id = 'synthetic-other';")[0];
  const beforeStudio = query("SELECT id, title, version FROM studio_workspaces WHERE id = 'synthetic-studio';")[0];
  executeSql(buildTargetPasswordResetSql({ accountId: "synthetic-admin", username: "local_admin", password: newAdminPassword }));

  const target = query("SELECT id, username, password_hash, role, active FROM contributors WHERE id = 'synthetic-admin';")[0];
  const other = query("SELECT id, username, password_hash, role, active FROM contributors WHERE id = 'synthetic-other';")[0];
  const sessions = query("SELECT token, contributor_id FROM sessions ORDER BY token;");
  const studio = query("SELECT id, title, version FROM studio_workspaces WHERE id = 'synthetic-studio';")[0];

  checks.push(
    check("existing account can be targeted", target?.username === "local_admin"),
    check("exactly one credential is updated", target?.password_hash === hashPassword(newAdminPassword) && other?.password_hash === beforeOther.password_hash),
    check("account ID remains unchanged", target?.id === "synthetic-admin"),
    check("account role remains unchanged", target?.role === "admin" && Number(target.active) === 1),
    check("other accounts remain unchanged", JSON.stringify(other) === JSON.stringify(beforeOther)),
    check("target sessions are invalidated only", sessions.length === 1 && sessions[0].token === "other-session"),
    check("Studio records remain unchanged", JSON.stringify(studio) === JSON.stringify(beforeStudio)),
  );

  let failed = false;
  try {
    executeSql(`UPDATE contributors SET password_hash = ${sqlString(hashPassword("must-not-persist"))} WHERE id = 'synthetic-admin'; INSERT INTO missing_table VALUES ('forced failure');`);
  } catch {
    failed = true;
  }
  const preserved = query("SELECT password_hash, username, role FROM contributors WHERE id = 'synthetic-admin';")[0];
  checks.push(
    check("failed batch is rejected", failed),
    check("failed batch preserves prior credential", preserved?.password_hash === hashPassword(newAdminPassword) && preserved?.username === "local_admin" && preserved?.role === "admin"),
  );

  console.log(JSON.stringify({
    status: "PASSED",
    database,
    checksPassed: checks.length,
    checks,
    credentialsPrinted: false,
    sharedDevelopmentDatabaseTouched: false,
    ownerStudioTouched: false,
  }));
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

#!/usr/bin/env node

// Create repeatable synthetic authentication identities in the isolated
// Wrangler D1 database. This script is intentionally local-only and refuses
// to operate without the explicit opt-in flag and local configuration.
import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { hashPassword, sqlString } from "./local-credential-reset.mjs";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const localDir = resolve(repoRoot, ".local-dev");
function localOverridePath(environmentName, defaultPath) {
  const path = resolve(process.env[environmentName] || defaultPath);
  const fromLocalRoot = relative(localDir, path);
  if (isAbsolute(fromLocalRoot) || fromLocalRoot === ".." || fromLocalRoot.startsWith(`..${sep}`)) {
    fail(`${environmentName} must remain inside the gitignored .local-dev directory`);
  }
  return path;
}

const stateDir = localOverridePath("TPI_LOCAL_AUTH_FIXTURE_STATE", resolve(localDir, "state"));
const credentialPath = localOverridePath("TPI_LOCAL_AUTH_CREDENTIALS_FILE", resolve(localDir, "local-auth-credentials.json"));
const sqlPath = localOverridePath("TPI_LOCAL_AUTH_SQL_FILE", resolve(localDir, "local-auth-fixtures.sql"));
const configPath = resolve(repoRoot, "wrangler.local.toml");
const database = "tpi-local-foundation";
const expiredSessionToken = "local-ops009-expired-session";

function fail(message) {
  console.error(`Local authentication fixtures aborted: ${message}`);
  process.exit(1);
}

if (!process.argv.includes("--local-only")) {
  fail("pass --local-only to confirm that only the isolated local D1 may be changed");
}
if (!existsSync(configPath)) fail("wrangler.local.toml is missing");
const config = readFileSync(configPath, "utf8");
for (const required of [
  'name = "tpi-local"',
  'TPI_ENV = "local"',
  'TPI_LOCAL_ONLY = "1"',
  'database_name = "tpi-local-foundation"',
  'bucket_name = "tpi-local-media"',
]) {
  if (!config.includes(required)) fail(`required local setting is missing: ${required}`);
}
for (const forbidden of [
  "theparanormalinitiative-dev",
  "tpi_contributor_portal_dev",
  "theparanormalinitiative\"",
  "tpi_contributor_portal\"",
  "tpi-contributor-media-dev",
  "tpi-contributor-media\"",
  "paranormalinitiative.com",
]) {
  if (config.includes(forbidden)) fail(`remote or production value found: ${forbidden}`);
}

mkdirSync(localDir, { recursive: true });
mkdirSync(stateDir, { recursive: true });
mkdirSync(resolve(credentialPath, ".."), { recursive: true, mode: 0o700 });
mkdirSync(resolve(sqlPath, ".."), { recursive: true, mode: 0o700 });

function generatedPassword() {
  return randomBytes(24).toString("base64url");
}

const accountDefinitions = [
  { key: "local_admin", id: "local-ops009-admin", username: "local_admin", displayName: "Local Administrator", title: "Local Test Administrator", role: "admin", active: 1 },
  { key: "test_admin", id: "local-ops028-test-admin", username: "tpi_test_admin", displayName: "Synthetic Test Administrator", title: "Local Automated Test Administrator", role: "admin", active: 1 },
  { key: "local_contributor", id: "local-ops009-contributor", username: "local_contributor", displayName: "Local Contributor", title: "Local Test Contributor", role: "contributor", active: 1 },
  { key: "local_member", id: "local-ops009-member", username: "local_member", displayName: "Local Member", title: "Local Test Member", role: "member", active: 1 },
  { key: "local_disabled", id: "local-ops009-disabled", username: "local_disabled", displayName: "Local Disabled Account", title: "Local Test Disabled", role: "member", active: 0 },
];

function executeLocal(args, file = "") {
  const wrangler = process.env.WRANGLER_BIN || "wrangler";
  const command = ["d1", "execute", database, "--config", configPath, "--local", "--persist-to", stateDir];
  command.push(...(file ? ["--file", file] : args), "--yes");
  const result = spawnSync(wrangler, command, {
    cwd: repoRoot,
    env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail(`local D1 command failed with exit code ${result.status}: ${(result.stderr || "").trim()}`);
  return result.stdout || "";
}

function localQuery(sql) {
  const output = executeLocal(["--command", sql, "--json"]);
  try { return JSON.parse(output)?.[0]?.results || []; }
  catch { fail("local D1 returned an unreadable query result; no credentials were changed"); }
}

// Apply the one idempotent auth schema before inspecting accounts. This is
// isolated to the named persistent local D1 and never resets its data.
executeLocal([], resolve(repoRoot, "migrations/0001_contributor_portal.sql"));
const existingFixtureRows = localQuery(`SELECT username FROM contributors WHERE username IN (${accountDefinitions.map(account => sqlString(account.username)).join(", ")});`);
const existingFixtureUsernames = new Set(existingFixtureRows.map(row => row.username));

let credentials = null;
if (existsSync(credentialPath)) {
  try {
    credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
  } catch (error) {
    fail("the local credential file is not valid JSON; it was preserved. Use the documented owner-only account recovery procedure");
  }
}
if (credentials && (typeof credentials.accounts !== "object" || !credentials.accounts)) {
  fail("the local credential file has an unexpected shape; it was preserved. Use the documented owner-only account recovery procedure");
}
if (!credentials) {
  if (existingFixtureUsernames.size) {
    fail("local fixture accounts already exist but their protected credential file is missing; refusing to rotate passwords. Use the documented owner-only account recovery procedure");
  }
  credentials = {
    version: 1,
    purpose: "TPI-OPS-009 local synthetic authentication only",
    accounts: {},
    expiredSessionToken,
  };
}
for (const account of accountDefinitions) {
  const existing = credentials.accounts[account.key];
  if (existing && existing.username !== account.username) {
    fail(`the local ${account.key} credential entry has an unexpected username; it was not changed`);
  }
  if (!existing?.password) {
    if (existingFixtureUsernames.has(account.username)) {
      fail(`the local ${account.key} account exists but its stored credential is missing; refusing to rotate it`);
    }
    credentials.accounts[account.key] = { username: account.username, password: generatedPassword() };
  }
}
credentials.version = credentials.version || 1;
credentials.purpose = credentials.purpose || "TPI-OPS-009 local synthetic authentication only";
credentials.expiredSessionToken = expiredSessionToken;
writeFileSync(credentialPath, `${JSON.stringify(credentials, null, 2)}\n`, { mode: 0o600 });
chmodSync(credentialPath, 0o600);

const fixtureSql = `-- Generated by scripts/local-auth-fixtures.mjs; local-only and gitignored.
${accountDefinitions.map(account => {
  const password = credentials.accounts[account.key].password;
  return `INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, comment_signature_enabled, active)
SELECT ${sqlString(account.id)}, ${sqlString(account.username)}, ${sqlString(hashPassword(password))}, ${sqlString(account.displayName)}, ${sqlString(account.title)}, ${sqlString(account.role)}, ${sqlString(`${account.username}@example.test`)}, ${sqlString("TPI local synthetic fixture")}, ${sqlString("TPI local")}, ${sqlString("")}, 1, ${account.active}
WHERE NOT EXISTS (SELECT 1 FROM contributors WHERE username = ${sqlString(account.username)});`;
}).join("\n")}
-- Test fixtures may refresh only this namespaced, deliberately expired marker.
DELETE FROM sessions WHERE token = ${sqlString(expiredSessionToken)};
INSERT INTO sessions (token, contributor_id, expires_at)
SELECT ${sqlString(expiredSessionToken)}, id, '2000-01-01T00:00:00Z'
FROM contributors WHERE username = 'local_member' LIMIT 1;
`;
writeFileSync(sqlPath, fixtureSql, { mode: 0o600 });
chmodSync(sqlPath, 0o600);

executeLocal([], sqlPath);
if (existsSync(credentialPath)) {
  chmodSync(credentialPath, 0o600);
}
console.log(JSON.stringify({
  status: "READY",
  database,
  accounts: accountDefinitions.map(account => ({ key: account.key, username: account.username, role: account.role, active: Boolean(account.active) })),
  credentialPath: ".local-dev/local-auth-credentials.json",
  expiredSessionFixture: true,
  existingCredentialsPreserved: true,
}));

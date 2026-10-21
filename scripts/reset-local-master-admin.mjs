#!/usr/bin/env node

// TPI-STUDIOFLOW-036: owner-operated local credential rotation.
// Plaintext passwords are read from a TTY, hashed in memory, and never written
// to command arguments, logs, Git-tracked files, or browser storage.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import {
  buildTargetPasswordResetSql,
  hashPassword,
  isEligibleTargetAccount,
  sqlString,
} from "./local-credential-reset.mjs";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const configPath = resolve(repoRoot, "wrangler.local.toml");
const statePath = resolve(repoRoot, ".local-dev/state");
const tempDir = resolve(repoRoot, ".local-dev/credential-reset");
const database = "tpi-local-foundation";
const wrangler = process.env.WRANGLER_BIN || "/opt/homebrew/bin/wrangler";

function fail(message) {
  console.error(`Local master credential reset aborted: ${message}`);
  process.exitCode = 2;
}

function assertLocalOnly() {
  if (process.env.TPI_LOCAL_OWNER_CONTROL !== "1") throw new Error("run with TPI_LOCAL_OWNER_CONTROL=1 from the owner terminal");
  if (!existsSync(configPath)) throw new Error("wrangler.local.toml is missing");
  const config = readFileSync(configPath, "utf8");
  for (const required of ['name = "tpi-local"', 'TPI_ENV = "local"', 'TPI_LOCAL_ONLY = "1"', 'database_name = "tpi-local-foundation"', 'bucket_name = "tpi-local-media"']) {
    if (!config.includes(required)) throw new Error(`required local setting is missing: ${required}`);
  }
  for (const forbidden of ["theparanormalinitiative-dev", "tpi_contributor_portal_dev", "paranormalinitiative.com", "remote = true"]) {
    if (config.includes(forbidden)) throw new Error(`production or remote value found: ${forbidden}`);
  }
}

function d1Json(command) {
  const output = execFileSync(wrangler, [
    "d1", "execute", database,
    "--config", configPath,
    "--local",
    "--persist-to", statePath,
    "--command", command,
    "--json",
  ], {
    cwd: repoRoot,
    env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_DISABLE_OUTBOUND: "1" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(output);
}

function firstResult(rows) {
  return rows?.[0]?.results?.[0] || null;
}

function promptLine(label) {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolveResult => readline.question(label, answer => {
    readline.close();
    resolveResult(answer.trim());
  }));
}

function promptSecret(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("a real interactive Terminal is required for password entry");
  return new Promise(resolveResult => {
    const input = process.stdin;
    let value = "";
    process.stdout.write(label);
    input.setRawMode(true);
    input.resume();
    const onData = chunk => {
      for (const char of String(chunk)) {
        if (char === "\u0003") {
          input.setRawMode(false);
          input.off("data", onData);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (char === "\r" || char === "\n") {
          input.setRawMode(false);
          input.off("data", onData);
          process.stdout.write("\n");
          resolveResult(value);
          return;
        }
        if (char === "\u007f") value = value.slice(0, -1);
        else if (char >= " ") value += char;
      }
    };
    input.on("data", onData);
  });
}

function parseTargetUsername() {
  const args = process.argv.slice(2);
  let targetUsername = null;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--target-username") {
      targetUsername = args[index + 1];
      index += 1;
    } else if (argument.startsWith("--target-username=")) {
      targetUsername = argument.slice("--target-username=".length);
    } else {
      throw new Error(`unsupported option: ${argument}`);
    }
    if (!targetUsername) throw new Error("--target-username requires an exact username");
    if (index < args.length - 1 && args[index + 1].startsWith("--target-username")) {
      throw new Error("--target-username may be provided only once");
    }
  }
  return targetUsername;
}

function validateUsername(username) {
  if (!username || /\s/.test(username) || !/^[A-Za-z0-9._!#$%&'*+/=?^`{|}~-]+$/.test(username)) {
    throw new Error("username is invalid; use letters, numbers, dashes, underscores, periods, or symbols without spaces");
  }
}

async function promptNewPassword(label = "New password") {
  const password = await promptSecret(`${label}: `);
  if (password.length < 12) throw new Error("password must be at least 12 characters");
  const confirmation = await promptSecret("Confirm password: ");
  if (password !== confirmation) throw new Error("password confirmation did not match");
  return password;
}

function executeSensitiveBatch(statement) {
  mkdirSync(tempDir, { recursive: true, mode: 0o700 });
  const tempPath = resolve(tempDir, `credential-reset-${process.pid}.sql`);
  writeFileSync(tempPath, statement, { mode: 0o600, flag: "wx" });
  try {
    execFileSync(wrangler, [
      "d1", "execute", database,
      "--config", configPath,
      "--local",
      "--persist-to", statePath,
      "--file", tempPath,
      "--yes",
    ], {
      cwd: repoRoot,
      env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_DISABLE_OUTBOUND: "1" },
      stdio: ["ignore", "ignore", "pipe"],
    });
  } finally {
    try { unlinkSync(tempPath); } catch {}
  }
}

async function resetExistingAccount(targetUsername) {
  validateUsername(targetUsername);
  const account = firstResult(d1Json(`SELECT id, username, role, active FROM contributors WHERE username = ${sqlString(targetUsername)} LIMIT 1;`));
  if (!account) throw new Error(`no local account exists with username ${targetUsername}`);
  if (!isEligibleTargetAccount(account, targetUsername)) {
    throw new Error("target account must be an active local administrator or owner; no credential was changed");
  }

  const accountCountBefore = Number(firstResult(d1Json("SELECT COUNT(*) AS account_count FROM contributors;"))?.account_count || 0);
  const password = await promptNewPassword("New local account password");
  executeSensitiveBatch(buildTargetPasswordResetSql({ accountId: account.id, username: targetUsername, password }));
  const expectedHash = hashPassword(password);
  const verified = firstResult(d1Json(`SELECT id, username, role, active, password_hash = ${sqlString(expectedHash)} AS password_matches, (SELECT COUNT(*) FROM sessions WHERE contributor_id = ${sqlString(account.id)}) AS session_count FROM contributors WHERE id = ${sqlString(account.id)} AND username = ${sqlString(targetUsername)} LIMIT 1;`));
  const accountCountAfter = Number(firstResult(d1Json("SELECT COUNT(*) AS account_count FROM contributors;"))?.account_count || 0);
  if (!verified || verified.id !== account.id || verified.username !== targetUsername || verified.role !== account.role || Number(verified.active) !== Number(account.active) || Number(verified.password_matches) !== 1 || Number(verified.session_count) !== 0 || accountCountAfter !== accountCountBefore) {
    throw new Error("targeted local account postcondition verification failed; no success was reported");
  }
  console.log(`Local account password reset: ${targetUsername} (role preserved: ${account.role}).`);
  console.log("Password configured but not displayed. Existing sessions for this account were invalidated.");
}

async function main() {
  assertLocalOnly();
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("run from an interactive owner Terminal; no password was read");

  const targetUsername = parseTargetUsername();
  if (targetUsername) {
    console.log("TPI local account password reset");
    console.log("Local D1 only. The password will not be echoed or stored in plaintext.\n");
    await resetExistingAccount(targetUsername);
    return;
  }

  console.log("TPI local master administrator reset");
  console.log("Local D1 only. The password will not be echoed or stored in plaintext.\n");
  const username = await promptLine("New master username: ");
  if (!username || /\s/.test(username) || !/^[A-Za-z0-9._!#$%&'*+/=?^`{|}~-]+$/.test(username)) {
    throw new Error("username is invalid; use letters, numbers, dashes, underscores, periods, or symbols without spaces");
  }
  const password = await promptNewPassword("New master password");

  const existingOwner = firstResult(d1Json("SELECT id, username FROM contributors WHERE role = 'owner' ORDER BY created_at LIMIT 1;"));
  const existingUsername = firstResult(d1Json(`SELECT id, username FROM contributors WHERE username = ${sqlString(username)} LIMIT 1;`));
  if (existingUsername && existingUsername.id !== existingOwner?.id) throw new Error("that username is already assigned to another local account");

  const ownerId = existingOwner?.id || "local-master-owner";
  // Wrangler D1 executes a --file batch atomically. Explicit SQL transaction
  // statements are rejected by local workerd, so keep the two DML statements
  // in one D1 batch and let the D1 execution layer provide the transaction.
  const statement = `
INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, comment_signature_enabled, active)
VALUES (${sqlString(ownerId)}, ${sqlString(username)}, ${sqlString(hashPassword(password))}, 'Local Master Administrator', 'Founder / Director', 'owner', '', 'The Paranormal Initiative', 'StudioFlow Local Development', '', 1, 1)
ON CONFLICT(id) DO UPDATE SET
  username = excluded.username,
  password_hash = excluded.password_hash,
  role = 'owner',
  active = 1;
DELETE FROM sessions WHERE contributor_id = ${sqlString(ownerId)};
`;

  executeSensitiveBatch(statement);
  const verifiedOwner = firstResult(d1Json(`SELECT id, username, role, active, (SELECT COUNT(*) FROM sessions WHERE contributor_id = ${sqlString(ownerId)}) AS session_count FROM contributors WHERE id = ${sqlString(ownerId)} LIMIT 1;`));
  if (!verifiedOwner || verifiedOwner.username !== username || verifiedOwner.role !== "owner" || Number(verifiedOwner.active) !== 1 || Number(verifiedOwner.session_count) !== 0) {
    throw new Error("local D1 postcondition verification failed; no success was reported");
  }
  console.log(`Local master administrator configured: ${username}`);
  console.log("Password configured but not displayed. Existing sessions for this owner were invalidated.");
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : "credential reset failed");
}

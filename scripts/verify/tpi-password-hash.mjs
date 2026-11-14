#!/usr/bin/env node

// Synthetic-only password storage regression. No local or production D1 is
// opened; the login upgrade path uses an in-memory Worker-style mock.
import { onRequest } from "../../functions/api/[[path]].js";
import { hashPassword, isLegacyPasswordHash, legacyPasswordHash, verifyPassword } from "../../lib/passwords.js";

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`FAIL: ${name}`);
  checks.push(name);
}

const password = "synthetic-password-123";
const modernHash = await hashPassword(password);
const legacyHash = await legacyPasswordHash(password);
check("new password hashes use the salted PBKDF2 format", modernHash.startsWith("pbkdf2-sha256$120000$") && !isLegacyPasswordHash(modernHash));
check("new password hash verifies", await verifyPassword(password, modernHash));
check("new password hash rejects a different password", !(await verifyPassword("wrong-password", modernHash)));
check("legacy SHA-256 hashes remain recognizable", isLegacyPasswordHash(legacyHash));
check("legacy password hashes remain verifiable", await verifyPassword(password, legacyHash));
check("legacy password hashes reject a different password", !(await verifyPassword("wrong-password", legacyHash)));

const calls = [];
const legacyUser = {
  id: "synthetic-legacy-user",
  username: "synthetic-legacy",
  password_hash: legacyHash,
  display_name: "Synthetic Legacy User",
  role: "member",
  active: 1,
  correspondence: "synthetic-legacy@example.invalid",
  comment_signature_enabled: 1,
};
const db = {
  prepare(sql) {
    return {
      bind(...args) {
        return {
          async first() {
            if (sql.includes("SELECT * FROM contributors WHERE lower(username) = lower(?)")) return legacyUser;
            return null;
          },
          async run() {
            calls.push({ sql, args });
            return { success: true };
          },
        };
      },
    };
  },
};

const response = await onRequest({
  request: new Request("http://127.0.0.1:8789/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: legacyUser.username, password }),
  }),
  env: { TPI_DB: db, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" },
  params: { path: ["auth", "login"] },
});
const body = await response.json();
const upgrade = calls.find(call => call.sql.includes("UPDATE contributors SET password_hash"));
const session = calls.find(call => call.sql.includes("INSERT INTO sessions"));
check("legacy account can still log in", response.status === 200 && body.user?.username === legacyUser.username);
check("successful legacy login attempts a guarded hash upgrade", Boolean(upgrade) && upgrade.args[1] === legacyUser.id && upgrade.args[2] === legacyHash && typeof upgrade.args[0] === "string" && upgrade.args[0].startsWith("pbkdf2-sha256$"));
check("successful login still creates a session", Boolean(session) && session.args[1] === legacyUser.id);

console.log(JSON.stringify({ status: "PASSED", checksPassed: checks.length, checks, credentialsPrinted: false, sharedDatabaseTouched: false }));

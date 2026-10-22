#!/usr/bin/env node
// TPI-OPS-033: synthetic StudioFlow QA accounts.
// Independent of Founding 50: no membership, allocation or Founding 50 gate is
// read or written. Disabled unless TPI_QA_PROVISIONING=approved is set by the
// owner. Only accounts whose username starts with QA_PREFIX can be touched.
// Runs as a local CLI through Wrangler; there is no Worker endpoint.
import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { hashPassword, sqlString } from "../local-credential-reset.mjs";

export const QA_PREFIX = "qa-studioflow-";
const ENTITLEMENT = "creator_studio_lifetime";
const DATABASE = "tpi_contributor_portal";

export function validQaUsername(username) {
  return typeof username === "string"
    && username.startsWith(QA_PREFIX)
    && /^[a-z0-9-]{14,40}$/.test(username);
}

export function buildSql(action, username, passwordHash, id) {
  const u = sqlString(username);
  const guard = `(SELECT id FROM contributors WHERE username = ${u} AND role = 'member')`;
  if (action === "create") {
    return `INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, comment_signature_enabled, active)
SELECT ${sqlString(id)}, ${u}, ${sqlString(passwordHash)}, 'Synthetic StudioFlow QA', 'QA', 'member', '', 'TPI QA', 'TPI QA', '', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM contributors WHERE username = ${u});
INSERT INTO admin_audit_logs (id, actor_id, actor_username, actor_role, action, target_type, target_id, metadata_json)
VALUES (${sqlString(id + "-audit")}, NULL, 'owner-cli', 'owner', 'qa_account.created', 'qa_account', ${u}, '{}');`;
  }
  if (action === "grant") {
    return `INSERT INTO creator_studio_entitlements (id, contributor_id, source_membership_id, entitlement_code, entitlement_state, granted_by)
SELECT ${sqlString(id)}, ${guard}, NULL, '${ENTITLEMENT}', 'active', NULL
WHERE ${guard} IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM creator_studio_entitlements WHERE contributor_id = ${guard});
UPDATE creator_studio_entitlements SET entitlement_state = 'active', revoked_at = NULL, updated_at = CURRENT_TIMESTAMP
WHERE contributor_id = ${guard} AND source_membership_id IS NULL;
INSERT INTO admin_audit_logs (id, actor_id, actor_username, actor_role, action, target_type, target_id, metadata_json)
VALUES (${sqlString(id + "-audit")}, NULL, 'owner-cli', 'owner', 'qa_account.granted', 'qa_account', ${u}, '{}');`;
  }
  if (action === "revoke" || action === "disable") {
    const change = action === "disable"
      ? `UPDATE contributors SET active = 0 WHERE username = ${u} AND role = 'member';`
      : "";
    return `UPDATE creator_studio_entitlements SET entitlement_state = 'revoked', revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE contributor_id = ${guard} AND source_membership_id IS NULL;
${change}
DELETE FROM sessions WHERE contributor_id = ${guard};
INSERT INTO admin_audit_logs (id, actor_id, actor_username, actor_role, action, target_type, target_id, metadata_json)
VALUES (${sqlString(id + "-audit")}, NULL, 'owner-cli', 'owner', ${sqlString("qa_account." + action + "d")}, 'qa_account', ${u}, '{}');`;
  }
  throw new Error(`Unknown action: ${action}`);
}

function selectedTarget() {
  const target = process.env.TPI_QA_D1_TARGET;
  if (target !== "local" && target !== "remote") {
    throw new Error("TPI_QA_D1_TARGET must be explicitly set to local or remote.");
  }
  if (target === "remote" && process.env.TPI_QA_PRODUCTION_D1 !== "approved") {
    throw new Error("Remote QA account changes require TPI_QA_PRODUCTION_D1=approved.");
  }
  return target;
}

function runD1(sql) {
  const target = selectedTarget();
  const dir = resolve(process.cwd(), ".local-dev");
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `qa-${Date.now()}.sql`);
  writeFileSync(file, sql, { mode: 0o600 });
  const result = spawnSync(process.env.WRANGLER_BIN || "npx", [
    ...(process.env.WRANGLER_BIN ? [] : ["--yes", "wrangler@4.149.0"]),
    "d1", "execute", DATABASE,
    ...(target === "local"
      ? ["--config", "wrangler.local.toml", "--local", "--persist-to", resolve(tmpdir(), "tpi-qa-account-cli")]
      : ["--remote"]),
    "--file", file, "--yes",
  ], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`D1 command failed with exit code ${result.status}`);
}

function main() {
  if (process.env.TPI_QA_PROVISIONING !== "approved") {
    console.error("QA provisioning is disabled. The owner must set TPI_QA_PROVISIONING=approved.");
    process.exit(2);
  }
  const [action, username] = process.argv.slice(2);
  if (!["create", "grant", "revoke", "disable"].includes(action) || !validQaUsername(username)) {
    console.error(`Usage: create|grant|revoke|disable ${QA_PREFIX}<name>`);
    process.exit(2);
  }
  const id = `qa-${Date.now()}-${randomBytes(4).toString("hex")}`;
  if (action === "create") {
    const password = randomBytes(24).toString("base64url");
    const credPath = resolve(process.cwd(), ".local-dev", `${username}.json`);
    const temporaryCredentialPath = `${credPath}.${process.pid}.tmp`;
    mkdirSync(resolve(credPath, ".."), { recursive: true });
    // The final credential path is never replaced. Keep the generated secret
    // temporary until D1 confirms the account mutation, then publish it with a
    // same-volume atomic rename. Failed commands remove only their own temp.
    writeFileSync(temporaryCredentialPath, JSON.stringify({ username, password }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
    try {
      if (existsSync(credPath)) throw new Error(`refusing to replace existing credential file: .local-dev/${username}.json`);
      runD1(buildSql(action, username, hashPassword(password), id));
      renameSync(temporaryCredentialPath, credPath);
      chmodSync(credPath, 0o600);
    } catch (error) {
      try { unlinkSync(temporaryCredentialPath); } catch { /* best effort */ }
      throw error;
    }
    console.log(JSON.stringify({ status: "created", username, credentialFile: `.local-dev/${username}.json` }));
    return;
  }
  runD1(buildSql(action, username, "", id));
  console.log(JSON.stringify({ status: `${action}d`, username }));
}

if (import.meta.url === `file://${process.argv[1]}`) main();

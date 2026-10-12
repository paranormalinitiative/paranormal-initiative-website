import { randomUUID, createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const ownerPassword = process.env.TPI_DEV_OWNER_PASSWORD;
const memberPassword = process.env.TPI_DEV_MEMBER_PASSWORD;
if (!ownerPassword || !memberPassword) {
  throw new Error("Set TPI_DEV_OWNER_PASSWORD and TPI_DEV_MEMBER_PASSWORD in the calling environment.");
}
if (ownerPassword.length < 16 || memberPassword.length < 16) {
  throw new Error("Development passwords must be at least 16 characters.");
}

const hash = value => createHash("sha256").update(value).digest("hex");
const sqlValue = value => `'${String(value).replaceAll("'", "''")}'`;
const ownerId = randomUUID();
const memberId = randomUUID();
const sql = `
INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, comment_signature_enabled, active)
VALUES (${sqlValue(ownerId)}, 'tpi-dev-owner', ${sqlValue(hash(ownerPassword))}, 'TPI Development Owner', 'Development Owner', 'owner', 'tpi-dev-owner@example.invalid', 1, 1)
ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, role = 'owner', active = 1;
INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, comment_signature_enabled, active)
VALUES (${sqlValue(memberId)}, 'tpi-dev-member', ${sqlValue(hash(memberPassword))}, 'TPI Development Member', 'Development Member', 'member', 'tpi-dev-member@example.invalid', 1, 1)
ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, role = 'member', active = 1;
`;

const tempDir = mkdtempSync(join(tmpdir(), "tpi-dev-seed-"));
const sqlPath = join(tempDir, "accounts.sql");
try {
  writeFileSync(sqlPath, sql, { mode: 0o600 });
  execFileSync("npx", ["wrangler", "d1", "execute", "TPI_DB", "--remote", "--config", "wrangler.dev.toml", "--file", sqlPath], { stdio: "inherit" });
  console.log(JSON.stringify({ ok: true, accounts: ["tpi-dev-owner", "tpi-dev-member"], database: "tpi_contributor_portal_dev" }));
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

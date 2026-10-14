import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const owner = credentials.accounts.find(account => account.username === "tpi-dev014-owner");
if (!owner) throw new Error("The TPI-DEV-014 synthetic owner fixture is missing.");
const hash = value => createHash("sha256").update(value).digest("hex");
const sqlValue = value => `'${String(value).replaceAll("'", "''")}'`;
const filler = [];
for (let slot = 2; slot <= 49; slot += 1) {
  const suffix = String(slot).padStart(2, "0");
  const username = `tpi-dev014-filler-${suffix}`;
  filler.push({ username, contributorId: randomUUID(), membershipId: randomUUID(), entitlementId: randomUUID(), historyId: randomUUID(), passwordHash: hash(`TPI-DEV-014-filler-${suffix}`), slot });
}
const sql = filler.map(account => `
INSERT OR IGNORE INTO contributors
  (id, username, password_hash, display_name, title, role, correspondence, organization, website, bio, comment_signature_enabled, active)
VALUES (${sqlValue(account.contributorId)}, ${sqlValue(account.username)}, ${sqlValue(account.passwordHash)}, ${sqlValue(account.username)}, 'TPI-DEV-014 capacity filler', 'member', ${sqlValue(`${account.username}@example.invalid`)}, 'TPI-DEV-014 synthetic capacity fixture', 'https://example.invalid/tpi-dev-014', 'Synthetic capacity fixture; not a real account.', 1, 1);
INSERT OR IGNORE INTO creator_partnership_memberships
  (id, contributor_id, membership_type, membership_state, entitlement_code, founding50_slot, awarded_at, awarded_by, notes)
VALUES (${sqlValue(account.membershipId)}, ${sqlValue(account.contributorId)}, 'founding50', 'active', 'creator_studio_lifetime', ${account.slot}, CURRENT_TIMESTAMP, (SELECT id FROM contributors WHERE username = 'tpi-dev014-owner'), 'TPI-DEV-014 capacity fixture');
INSERT OR IGNORE INTO founding50_allocations
  (slot_number, membership_id, contributor_id, allocated_by)
VALUES (${account.slot}, ${sqlValue(account.membershipId)}, ${sqlValue(account.contributorId)}, (SELECT id FROM contributors WHERE username = 'tpi-dev014-owner'));
INSERT OR IGNORE INTO creator_studio_entitlements
  (id, contributor_id, source_membership_id, entitlement_code, entitlement_state, granted_by)
VALUES (${sqlValue(account.entitlementId)}, ${sqlValue(account.contributorId)}, ${sqlValue(account.membershipId)}, 'creator_studio_lifetime', 'active', (SELECT id FROM contributors WHERE username = 'tpi-dev014-owner'));
INSERT OR IGNORE INTO creator_partnership_membership_history
  (id, membership_id, contributor_id, from_state, to_state, action, notes, actor_id)
VALUES (${sqlValue(account.historyId)}, ${sqlValue(account.membershipId)}, ${sqlValue(account.contributorId)}, NULL, 'active', 'founding50_capacity_fixture', 'TPI-DEV-014 capacity fixture', (SELECT id FROM contributors WHERE username = 'tpi-dev014-owner'));
`).join("\n");
const tempDir = mkdtempSync(join(tmpdir(), "tpi-dev014-capacity-"));
const sqlPath = join(tempDir, "capacity.sql");
try {
  writeFileSync(sqlPath, sql, { mode: 0o600 });
  execFileSync("/opt/homebrew/bin/wrangler", ["d1", "execute", "tpi_contributor_portal_dev", "--remote", "--config", "wrangler.dev.toml", "--file", sqlPath], { stdio: "inherit" });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
console.log(JSON.stringify({ ok: true, directive: "TPI-DEV-014", slotsSeeded: filler.length, range: "2-49" }));

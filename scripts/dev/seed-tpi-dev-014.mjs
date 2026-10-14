import { createHash, randomUUID, randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const repoRoot = process.cwd();
const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentialDir = join(credentialPath, "..");
mkdirSync(credentialDir, { recursive: true, mode: 0o700 });
chmodSync(credentialDir, 0o700);

const accounts = [
  ["member", "member"],
  ["contributor", "contributor"],
  ["admin", "admin"],
  ["owner", "owner"],
  ["creator", "member"],
  ["revoked", "member"],
  ["contender", "member"],
  ["rejected", "member"]
];
const hash = value => createHash("sha256").update(value).digest("hex");
const sqlValue = value => `'${String(value).replaceAll("'", "''")}'`;
const makePassword = () => `TPI-DEV-014-${randomBytes(30).toString("base64url")}`;

let credentials;
if (existsSync(credentialPath)) {
  credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
  if (credentials?.directive !== "TPI-DEV-014" || !Array.isArray(credentials.accounts)) {
    throw new Error("The existing TPI-DEV-014 credential file has an unexpected shape.");
  }
  const existing = new Set(credentials.accounts.map(account => account.username));
  for (const [suffix, role] of accounts) {
    const username = `tpi-dev014-${suffix}`;
    if (!existing.has(username)) credentials.accounts.push({ id: randomUUID(), username, password: makePassword(), role });
  }
  writeFileSync(credentialPath, JSON.stringify(credentials, null, 2) + "\n", { mode: 0o600 });
  chmodSync(credentialPath, 0o600);
} else {
  credentials = {
    directive: "TPI-DEV-014",
    environment: "development-only",
    createdAt: new Date().toISOString(),
    accounts: accounts.map(([suffix, role]) => ({
      id: randomUUID(),
      username: `tpi-dev014-${suffix}`,
      password: makePassword(),
      role
    }))
  };
  writeFileSync(credentialPath, JSON.stringify(credentials, null, 2) + "\n", { mode: 0o600 });
  chmodSync(credentialPath, 0o600);
}

const expected = new Map(accounts.map(([suffix, role]) => [`tpi-dev014-${suffix}`, role]));
for (const account of credentials.accounts) {
  if (!expected.has(account.username) || !account.password || !account.id) throw new Error("Credential file is missing a required synthetic account.");
  if (account.role !== expected.get(account.username)) throw new Error(`Unexpected role in synthetic credential file for ${account.username}.`);
}

const sql = credentials.accounts.map(account => `
INSERT INTO contributors
  (id, username, password_hash, display_name, title, role, correspondence, organization, website, bio, comment_signature_enabled, active)
VALUES
  (${sqlValue(account.id)}, ${sqlValue(account.username)}, ${sqlValue(hash(account.password))}, ${sqlValue(`TPI-DEV-014 ${account.role} fixture`)}, ${sqlValue(`TPI-DEV-014 ${account.role}`)}, ${sqlValue(account.role)}, ${sqlValue(`${account.username}@example.invalid`)}, 'TPI-DEV-014 synthetic test fixture', 'https://example.invalid/tpi-dev-014', ${sqlValue(`Synthetic development-only account for TPI-DEV-014; ${account.role} role.`)}, 1, 1)
ON CONFLICT(username) DO UPDATE SET
  password_hash = excluded.password_hash,
  display_name = excluded.display_name,
  title = excluded.title,
  role = excluded.role,
  correspondence = excluded.correspondence,
  organization = excluded.organization,
  website = excluded.website,
  bio = excluded.bio,
  active = 1;
`).join("\n");

const tempDir = mkdtempSync(join(tmpdir(), "tpi-dev014-seed-"));
const sqlPath = join(tempDir, "fixtures.sql");
try {
  writeFileSync(sqlPath, sql, { mode: 0o600 });
  execFileSync("/opt/homebrew/bin/wrangler", [
    "d1", "execute", "tpi_contributor_portal_dev", "--remote",
    "--config", join(repoRoot, "wrangler.dev.toml"), "--file", sqlPath
  ], { stdio: "inherit", cwd: repoRoot });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log(JSON.stringify({
  ok: true,
  directive: "TPI-DEV-014",
  database: "tpi_contributor_portal_dev",
  credentialFile: credentialPath,
  accounts: credentials.accounts.map(({ username, role }) => ({ username, role }))
}));

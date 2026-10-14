import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const repoRoot = process.cwd();
const credentialPath = process.env.TPI_DEV021_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-021/credentials.json";
const credentialDir = join(credentialPath, "..");
mkdirSync(credentialDir, { recursive: true, mode: 0o700 });
chmodSync(credentialDir, 0o700);

const accountSpecs = [
  ["a", "TPI-DEV-021 Member A"],
  ["b", "TPI-DEV-021 Member B"]
];
const makePassword = suffix => `TPI-DEV-021-${suffix}-${randomBytes(30).toString("base64url")}`;
const hash = value => createHash("sha256").update(value).digest("hex");
const sqlValue = value => `'${String(value).replaceAll("'", "''")}'`;

let credentials;
if (existsSync(credentialPath)) {
  credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
  if (credentials?.directive !== "TPI-DEV-021" || !Array.isArray(credentials.accounts)) {
    throw new Error("The existing TPI-DEV-021 credential file has an unexpected shape.");
  }
  const existing = new Set(credentials.accounts.map(account => account.username));
  for (const [suffix] of accountSpecs) {
    const username = `tpi-dev021-${suffix}`;
    if (!existing.has(username)) credentials.accounts.push({ id: randomUUID(), username, password: makePassword(suffix), role: "member" });
  }
  writeFileSync(credentialPath, JSON.stringify(credentials, null, 2) + "\n", { mode: 0o600 });
} else {
  credentials = {
    directive: "TPI-DEV-021",
    environment: "development-only",
    createdAt: new Date().toISOString(),
    accounts: accountSpecs.map(([suffix]) => ({
      id: randomUUID(),
      username: `tpi-dev021-${suffix}`,
      password: makePassword(suffix),
      role: "member"
    }))
  };
  writeFileSync(credentialPath, JSON.stringify(credentials, null, 2) + "\n", { mode: 0o600 });
}
chmodSync(credentialPath, 0o600);

const sql = credentials.accounts.map(account => `
INSERT INTO contributors
  (id, username, password_hash, display_name, title, role, correspondence, organization, website, bio, comment_signature_enabled, active)
VALUES
  (${sqlValue(account.id)}, ${sqlValue(account.username)}, ${sqlValue(hash(account.password))}, ${sqlValue(account.username)}, 'Synthetic audit member', ${sqlValue(account.role)}, ${sqlValue(`${account.username}@example.invalid`)}, 'TPI-DEV-021 synthetic audit fixture', 'https://example.invalid/tpi-dev-021', ${sqlValue("Development-only cross-system audit fixture." )}, 1, 1)
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

const tempDir = mkdtempSync(join(tmpdir(), "tpi-dev021-seed-"));
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
  directive: "TPI-DEV-021",
  database: "tpi_contributor_portal_dev",
  credentials: "CONFIGURED_0600",
  accounts: credentials.accounts.map(({ username, role }) => ({ username, role }))
}));

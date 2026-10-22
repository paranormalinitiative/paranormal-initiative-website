import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";

const repoRoot = process.cwd();
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const branch = git(["branch", "--show-current"]);
const changedFiles = git(["status", "--porcelain=v1", "--untracked-files=all"])
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3));
if (branch !== "codex/tpi-development") throw new Error(`Production promotion requires codex/tpi-development; current branch is ${branch || "detached"}`);
if (changedFiles.length) throw new Error(`Production promotion aborted because the working tree is not clean: ${changedFiles.join(", ")}`);
const sourceCommit = git(["rev-parse", "HEAD"]);
const remoteLine = git(["ls-remote", "origin", `refs/heads/${branch}`]);
const remoteCommit = remoteLine.split(/\s+/)[0] || "";
if (sourceCommit !== remoteCommit) throw new Error(`Production promotion requires exact GitHub parity; local ${sourceCommit} does not match origin/${branch} ${remoteCommit || "missing"}`);

const configSource = readFileSync(join(repoRoot, "wrangler.toml"), "utf8");
for (const required of ['name = "theparanormalinitiative"', 'database_name = "tpi_contributor_portal"', 'bucket_name = "tpi-contributor-media"']) {
  if (!configSource.includes(required)) throw new Error(`Production configuration mismatch: ${required}`);
}
for (const forbidden of ["theparanormalinitiative-dev", "tpi_contributor_portal_dev", "tpi-contributor-media-dev", "paranormalsomerset.workers.dev"]) {
  if (configSource.includes(forbidden)) throw new Error(`Development value found in production configuration: ${forbidden}`);
}

const stage = mkdtempSync(join(tmpdir(), "tpi-production-assets-"));
const configDir = mkdtempSync(join(tmpdir(), "tpi-production-config-"));
const excludedDirectories = new Set([".git", ".wrangler", "node_modules", "backups", "data", "docs", "migrations", "scripts", "lib", "functions", "admin-center-app"]);
const excludedFiles = new Set([".dev.vars", ".env", "wrangler.toml", "wrangler.dev.toml", "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"]);
const filter = (source) => {
  const rel = relative(repoRoot, source);
  if (!rel) return true;
  const parts = rel.split(sep);
  if (excludedDirectories.has(parts[0])) return false;
  const base = parts.at(-1);
  if (excludedFiles.has(base) || base.startsWith(".env.")) return false;
  if (parts.some((part) => part === ".git" || part === ".wrangler")) return false;
  return true;
};

try {
  cpSync(repoRoot, stage, { recursive: true, filter });
  // Keep one source of truth for shared includes while avoiding the
  // standalone clean-URL rewrite that affects footer.html/member-sidebar.html.
  cpSync(join(stage, "footer.html"), join(stage, "footer.txt"));
  cpSync(join(stage, "member-sidebar.html"), join(stage, "member-sidebar.txt"));
  const sourceBranch = branch;
  const adminRoot = join(stage, "admin-center-preview");
  const adminFiles = readdirSync(adminRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "release.json")
    .map((entry) => join(adminRoot, entry.name))
    .concat(readdirSync(join(adminRoot, "assets"), { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => join(adminRoot, "assets", entry.name)));
  const adminManifest = adminFiles.map((file) => ({ path: relative(stage, file), bytes: statSync(file).size, sha256: createHash("sha256").update(readFileSync(file)).digest("hex") }));
  writeFileSync(join(adminRoot, "release.json"), JSON.stringify({ schemaVersion: 1, application: "tpi-administration-center", environment: "production", worker: "theparanormalinitiative", sourceCommit, sourceBranch, generatedAt: new Date().toISOString(), files: adminManifest }, null, 2) + "\n", { mode: 0o644 });
  const config = configSource.replace('main = "worker.js"', `main = "${join(repoRoot, "worker.js")}"`).replace('directory = "."', `directory = "${stage}"`);
  const configPath = join(configDir, "wrangler.toml");
  writeFileSync(configPath, config, { mode: 0o600 });
  console.log(JSON.stringify({ worker: "theparanormalinitiative", sourceCommit, sourceBranch, excludedDirectories: [...excludedDirectories], stagedAssets: adminManifest }, null, 2));
  const wranglerCommand = process.env.TPI_WRANGLER_BIN || "npx";
  const wranglerArgs = process.env.TPI_WRANGLER_BIN ? ["deploy", "--config", configPath, ...process.argv.slice(2)] : ["wrangler@4.149.0", "deploy", "--config", configPath, ...process.argv.slice(2)];
  execFileSync(wranglerCommand, wranglerArgs, { stdio: "inherit" });
} finally {
  rmSync(stage, { recursive: true, force: true });
  rmSync(configDir, { recursive: true, force: true });
}

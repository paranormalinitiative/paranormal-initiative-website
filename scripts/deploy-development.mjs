import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";

const repoRoot = process.cwd();
execFileSync(process.execPath, [join(repoRoot, "scripts/verify-development-config.mjs"), "--deployment"], { stdio: "inherit" });
const stage = mkdtempSync(join(tmpdir(), "tpi-dev-assets-"));
const configDir = mkdtempSync(join(tmpdir(), "tpi-dev-config-"));
const excludedDirectories = new Set([
  ".git", ".wrangler", "node_modules", "backups", "data", "docs",
  "migrations", "scripts", "admin-center-app",
]);
const excludedFiles = new Set([
  ".dev.vars", ".env", "wrangler.toml", "wrangler.dev.toml",
  "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
]);

const filter = source => {
  const rel = relative(repoRoot, source);
  if (!rel) return true;
  const parts = rel.split(sep);
  if (excludedDirectories.has(parts[0])) return false;
  const base = parts.at(-1);
  if (excludedFiles.has(base) || base.startsWith(".env.")) return false;
  if (parts.some(part => part === ".git" || part === ".wrangler")) return false;
  return true;
};

try {
  cpSync(repoRoot, stage, { recursive: true, filter });
  const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const sourceBranch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  mkdirSync(join(stage, ".well-known"), { recursive: true });
  writeFileSync(join(stage, ".well-known", "tpi-development-provenance.json"), JSON.stringify({
    environment: "development",
    worker: "theparanormalinitiative-dev",
    sourceCommit,
    sourceBranch,
    generatedAt: new Date().toISOString()
  }, null, 2) + "\n", { mode: 0o644 });
  const config = readFileSync(join(repoRoot, "wrangler.dev.toml"), "utf8")
    .replace('main = "worker.js"', `main = "${join(repoRoot, "worker.js")}"`)
    .replace('directory = "."', `directory = "${stage}"`);
  const configPath = join(configDir, "wrangler.dev.toml");
  writeFileSync(configPath, config, { mode: 0o600 });
  console.log(`Staged sanitized development assets in ${stage}`);
  execFileSync("npx", ["wrangler@4.149.0", "deploy", "--config", configPath, ...process.argv.slice(2)], { stdio: "inherit" });
} finally {
  rmSync(stage, { recursive: true, force: true });
  rmSync(configDir, { recursive: true, force: true });
}

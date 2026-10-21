import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { stageStudioAssets } from "./stage-local-studio-assets.mjs";

const repoRoot = process.cwd();
const stage = join(repoRoot, ".local-dev/assets");
const excludedDirectories = new Set([
  ".git", ".wrangler", ".local-dev", "node_modules", "backups", "data", "docs",
  "migrations", "scripts", "lib", "functions", "admin-center-app",
]);
const excludedFiles = new Set([
  ".dev.vars", ".env", "wrangler.toml", "wrangler.dev.toml", "wrangler.local.toml",
  "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
]);

const filter = source => {
  const rel = relative(repoRoot, source);
  if (!rel) return true;
  const parts = rel.split(sep);
  if (excludedDirectories.has(parts[0])) return false;
  const base = parts.at(-1);
  if (excludedFiles.has(base) || base.startsWith(".env.")) return false;
  if (parts.some(part => part === ".git" || part === ".wrangler" || part === ".local-dev")) return false;
  return true;
};

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
for (const entry of readdirSync(repoRoot, { withFileTypes: true })) {
  const source = join(repoRoot, entry.name);
  if (!filter(source)) continue;
  cpSync(source, join(stage, entry.name), { recursive: true, filter });
}

// The generated StudioFlow bundle names are not guaranteed to change when
// local source edits are promoted into this static package. Add deterministic
// content versions to the staged HTML so browsers request a new URL only when
// the actual JavaScript or CSS bytes changed. This is local staging only; the
// tracked source HTML remains portable and production behavior is unchanged.
stageStudioAssets({ repoRoot, stage });

// These shared includes are resolved by the deployed asset package and are
// intentionally kept in the same form for local Worker asset parity.
for (const name of ["footer.html", "member-sidebar.html"]) {
  const source = join(stage, name);
  if (statSync(source, { throwIfNoEntry: false })) cpSync(source, join(stage, name.replace(/\.html$/, ".txt")));
}

const files = [];
const walk = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else files.push(relative(stage, path));
  }
};
walk(stage);
console.log(JSON.stringify({ stage, files: files.length }));

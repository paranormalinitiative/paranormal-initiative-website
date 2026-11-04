import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stageStudioAssets } from "./stage-local-studio-assets.mjs";

// TPI-LOCALDEV-006C: a directory that must never be staged is rejected at any
// depth, not only as the first path segment. Application folders such as
// `nova-app/` legitimately contain their own installed dependencies, and those
// copies must never be served or counted as site assets.
const neverStagedSegments = new Set(["node_modules", ".git", ".wrangler", ".local-dev"]);

// These names are only excluded as top-level repository folders. Nested
// occurrences are pre-existing staged content with no documented rule to the
// contrary, so generalizing this set would silently remove served assets.
const excludedTopLevelDirectories = new Set([
  ".git", ".wrangler", ".local-dev", "node_modules", "backups", "data", "docs",
  "migrations", "scripts", "lib", "functions", "admin-center-app",
]);
const excludedFiles = new Set([
  ".DS_Store", ".dev.vars", ".env", "wrangler.toml", "wrangler.dev.toml", "wrangler.local.toml",
  "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
]);
const sharedIncludes = ["footer.html", "member-sidebar.html"];

// TPI-LOCALDEV-006C: the documented local asset baseline is hundreds of files
// (OPS-008 recorded 532; the corrected development tree stages roughly 760). An
// abnormal explosion, such as restaging installed dependencies, produced more
// than 11,000 files and made Wrangler's `workerd` fail with `spawn EBADF`. This
// ceiling is deliberately far above normal growth so ordinary asset additions
// never trip it, while a runaway copy fails with an actionable message instead
// of reaching the Worker. Override with TPI_LOCAL_ASSET_LIMIT for a deliberate,
// documented larger tree.
export const DEFAULT_ASSET_FILE_LIMIT = 4000;

export function assetFileLimit(env = process.env) {
  const override = Number.parseInt(env.TPI_LOCAL_ASSET_LIMIT ?? "", 10);
  return Number.isInteger(override) && override > 0 ? override : DEFAULT_ASSET_FILE_LIMIT;
}

export function createStagingFilter(repoRoot) {
  return source => {
    const rel = relative(repoRoot, source);
    if (!rel) return true;
    const parts = rel.split(sep);
    if (excludedTopLevelDirectories.has(parts[0])) return false;
    if (parts.some(part => neverStagedSegments.has(part))) return false;
    const base = parts.at(-1);
    if (excludedFiles.has(base) || base.startsWith(".env.")) return false;
    return true;
  };
}

// TPI-LOCALDEV-006C: refresh one already-served path in place. Local builds
// promote new files without an owner service restart, while the same exclusion
// rules apply, so a promoted build can never restage installed dependencies,
// local state, or repository internals.
export function syncStagedPaths({ repoRoot = process.cwd(), relativePaths = [] } = {}) {
  const stage = join(repoRoot, ".local-dev/assets");
  const filter = createStagingFilter(repoRoot);
  const synced = [];
  for (const entry of relativePaths) {
    const segments = entry.split(/[\\/]/).filter(Boolean);
    if (!segments.length) continue;
    const source = join(repoRoot, ...segments);
    const target = join(stage, ...segments);
    // A path excluded from staging is never copied, even when it changed.
    if (!filter(source)) continue;
    const stats = statSync(source, { throwIfNoEntry: false });
    if (!stats) {
      rmSync(target, { recursive: true, force: true });
      synced.push({ path: segments.join("/"), action: "removed" });
      continue;
    }
    if (stats.isDirectory()) {
      rmSync(target, { recursive: true, force: true });
      cpSync(source, target, { recursive: true, filter });
    } else {
      mkdirSync(dirname(target), { recursive: true });
      cpSync(source, target, { filter });
      if (segments.length === 1 && sharedIncludes.includes(segments[0])) {
        cpSync(source, join(stage, segments[0].replace(/\.html$/, ".txt")));
      }
    }
    synced.push({ path: segments.join("/"), action: "synced" });
  }
  return { stage, synced };
}

export function stageLocalAssets({ repoRoot = process.cwd(), env = process.env } = {}) {
  const stage = join(repoRoot, ".local-dev/assets");
  const filter = createStagingFilter(repoRoot);
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
  for (const name of sharedIncludes) {
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

  const limit = assetFileLimit(env);
  if (files.length > limit) {
    const error = new Error([
      `Local asset staging aborted: ${files.length} files exceeded the safety ceiling of ${limit}.`,
      "The documented local baseline is hundreds of files (OPS-008: 532). A count this high",
      "usually means installed dependencies or repository internals were copied into static assets.",
      "Confirm that no `node_modules` path is staged, then rerun `node scripts/stage-local-assets.mjs`.",
      `If the larger tree is intentional, set TPI_LOCAL_ASSET_LIMIT above ${files.length}.`,
    ].join("\n"));
    error.code = "TPI_ASSET_LIMIT_EXCEEDED";
    throw error;
  }

  return { stage, files: files.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    console.log(JSON.stringify(stageLocalAssets()));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Local asset staging failed.");
    process.exit(1);
  }
}

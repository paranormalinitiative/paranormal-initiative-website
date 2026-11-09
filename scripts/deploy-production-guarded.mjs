import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import {
  CANDIDATE_ASSETS_DIRECTORY,
  CANDIDATE_CONFIGURATION_DIRECTORY,
  CANDIDATE_WORKER_DIRECTORY,
  describeCertification,
  prepareCandidateDirectory,
  verifyCertification,
} from "./release-certification.mjs";

// TPI-OPS-005 — production promotion of one exact candidate.
//
// Three modes:
//
//   (no mode flag)          Legacy: copy a disposable staging tree, deploy it,
//                           delete it. Retained so nothing depends on the new
//                           path before it has been exercised.
//   --stage-out <dir>       Build the immutable candidate into <dir> and keep
//                           it. Requires --dry-run: this mode never deploys.
//   --candidate <dir>       Deploy exactly the certified bytes already in <dir>.
//                           Nothing is copied and nothing is rebuilt, so the
//                           uploaded bytes are byte-identical to the certified
//                           bytes, and every hash is re-proven before upload.

const repoRoot = process.cwd();
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();

function takeOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a directory path`);
  process.argv.splice(index, 2);
  return value;
}

const stageOutFlag = takeOption("--stage-out");
const candidateFlag = takeOption("--candidate");
const wranglerPassthroughArgs = process.argv.slice(2);
const dryRun = wranglerPassthroughArgs.includes("--dry-run");
if (stageOutFlag && !dryRun) throw new Error("--stage-out requires --dry-run; building a candidate must never deploy");
if (stageOutFlag && candidateFlag) throw new Error("--stage-out and --candidate are mutually exclusive");

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

const stagingStarted = performance.now();
const createdTemporaryDirectories = [];
const temporary = (prefix) => {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  createdTemporaryDirectories.push(directory);
  return directory;
};

// TPI-OPS-004: `.local-dev` is the owner's disposable local runtime state (local
// D1/R2 under .local-dev/state, staged assets, worktrees, logs and the protected
// QA credential files). `.assetsignore` already excludes it from the published
// asset manifest, so copying it uploaded nothing and published nothing - it only
// forced every dry-run and deployment to copy and hash ~32k extra files (~2.1 GB)
// before Wrangler discarded them. Excluding it here changes no published byte.
const excludedDirectories = new Set([".git", ".wrangler", ".local-dev", "node_modules", "backups", "data", "docs", "migrations", "scripts", "lib", "functions", "admin-center-app"]);
// `.DS_Store` is excluded here for the same reason as `.local-dev`: `.assetsignore`
// already refuses to publish it, and it is untracked Finder metadata, so copying
// it would only certify a byte that is never deployed and let a stray Finder
// touch invalidate an otherwise valid certification.
const excludedFiles = new Set([".dev.vars", ".env", ".DS_Store", "wrangler.toml", "wrangler.dev.toml", "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"]);
// Badge masters remain repository sources and are not published. The approved
// leadership distinction feature publishes only optimized Society / Leadership
// derivatives; excluding the masters here keeps the certified candidate and its
// digest equal to what is uploaded without carrying source art through staging.
const unpublishedAssetPrefixes = [
  `assets${sep}founding-memberships${sep}masters${sep}`,
  `assets${sep}society-leadership${sep}masters${sep}`,
];

const filter = (source) => {
  const rel = relative(repoRoot, source);
  if (!rel) return true;
  const parts = rel.split(sep);
  if (excludedDirectories.has(parts[0])) return false;
  const base = parts.at(-1);
  if (excludedFiles.has(base) || base.startsWith(".env.")) return false;
  if (base.toLowerCase().endsWith(".md")) return false;
  if (unpublishedAssetPrefixes.some((prefix) => `${rel}${sep}`.startsWith(prefix))) return false;
  // `node_modules` is excluded at any depth, like `.git` and `.wrangler`. The
  // top-level entry above only covers the root package; nested dependency trees
  // (`nova-app/node_modules`, `experiments/nova-spike/node_modules`) escaped it
  // and put ~11.2k staged files back into a copy that publishes neither: both
  // parent directories are already fully ignored by `.assetsignore`. Excluding
  // them changes no published byte and restores the published-asset-size bound
  // the release staging guard enforces.
  if (parts.some((part) => part === ".git" || part === ".wrangler" || part === "node_modules")) return false;
  return true;
};

let candidateRoot;
let certification = null;
let stagedCopyMs = 0;

try {
  if (candidateFlag) {
    // Deploy the certified candidate exactly as certified. No copy, no rebuild.
    candidateRoot = resolve(candidateFlag);
    certification = verifyCertification({ repoRoot, candidateRoot });
    console.log(JSON.stringify({
      mode: "CERTIFIED_CANDIDATE",
      verified: describeCertification(certification.manifest),
      verifiedCounts: certification.counts,
    }, null, 2));
  } else {
    candidateRoot = stageOutFlag ? resolve(stageOutFlag) : temporary("tpi-production-assets-");
    prepareCandidateDirectory(candidateRoot);
    const assetsRoot = join(candidateRoot, CANDIDATE_ASSETS_DIRECTORY);
    // The certified candidate lives inside the repository (`.local-dev`), so the
    // whole-tree copy would be a copy into its own subdirectory, which cpSync
    // refuses. Copying the filtered top-level entries produces the identical
    // asset set and cannot recurse into the candidate itself.
    for (const entry of readdirSync(repoRoot, { withFileTypes: true })) {
      const source = join(repoRoot, entry.name);
      if (!filter(source)) continue;
      cpSync(source, join(assetsRoot, entry.name), { recursive: true, filter });
    }
    // Keep one source of truth for shared includes while avoiding the
    // standalone clean-URL rewrite that affects footer.html/member-sidebar.html.
    cpSync(join(assetsRoot, "footer.html"), join(assetsRoot, "footer.txt"));
    cpSync(join(assetsRoot, "member-sidebar.html"), join(assetsRoot, "member-sidebar.txt"));
    // The Worker module and its relative imports are deployable bytes too. They
    // are copied into the candidate so the deployed Worker cannot change after
    // certification, and so `main` no longer points into the live worktree.
    const workerRoot = join(candidateRoot, CANDIDATE_WORKER_DIRECTORY);
    const workerFilter = (source) => !source.endsWith(`${sep}.DS_Store`);
    cpSync(join(repoRoot, "worker.js"), join(workerRoot, "worker.js"));
    cpSync(join(repoRoot, "lib"), join(workerRoot, "lib"), { recursive: true, filter: workerFilter });
    cpSync(join(repoRoot, "functions"), join(workerRoot, "functions"), { recursive: true, filter: workerFilter });
    mkdirSync(join(candidateRoot, CANDIDATE_CONFIGURATION_DIRECTORY), { recursive: true });
    cpSync(join(repoRoot, "wrangler.toml"), join(candidateRoot, CANDIDATE_CONFIGURATION_DIRECTORY, "wrangler.toml"));

    const sourceBranch = branch;
    const adminRoot = join(assetsRoot, "admin-center-preview");
    const adminFiles = readdirSync(adminRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name !== "release.json")
      .map((entry) => join(adminRoot, entry.name))
      .concat(readdirSync(join(adminRoot, "assets"), { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => join(adminRoot, "assets", entry.name)));
    const adminManifest = adminFiles.map((file) => ({ path: relative(assetsRoot, file), bytes: statSync(file).size, sha256: createHash("sha256").update(readFileSync(file)).digest("hex") }));
    writeFileSync(join(adminRoot, "release.json"), JSON.stringify({ schemaVersion: 1, application: "tpi-administration-center", environment: "production", worker: "theparanormalinitiative", sourceCommit, sourceBranch, generatedAt: new Date().toISOString(), files: adminManifest }, null, 2) + "\n", { mode: 0o644 });
    stagedCopyMs = Math.round(performance.now() - stagingStarted);
  }

  const configurationPath = join(candidateRoot, CANDIDATE_CONFIGURATION_DIRECTORY, "wrangler.toml");
  const configurationBytes = readFileSync(configurationPath, "utf8");
  const configDir = temporary("tpi-production-config-");
  const config = configurationBytes
    .replace('main = "worker.js"', `main = "${join(candidateRoot, CANDIDATE_WORKER_DIRECTORY, "worker.js")}"`)
    .replace('directory = "."', `directory = "${join(candidateRoot, CANDIDATE_ASSETS_DIRECTORY)}"`);
  const configPath = join(configDir, "wrangler.toml");
  writeFileSync(configPath, config, { mode: 0o600 });
  const stagedAt = performance.now();
  console.log(JSON.stringify({ worker: "theparanormalinitiative", sourceCommit, sourceBranch: branch, mode: candidateFlag ? "certified-candidate" : stageOutFlag ? "stage-only" : "legacy-staging", candidateRoot, excludedDirectories: [...excludedDirectories] }, null, 2));
  const wranglerCommand = process.env.TPI_WRANGLER_BIN || "npx";
  const wranglerArgs = process.env.TPI_WRANGLER_BIN ? ["deploy", "--config", configPath, ...wranglerPassthroughArgs] : ["wrangler@4.149.0", "deploy", "--config", configPath, ...wranglerPassthroughArgs];
  const wranglerStarted = performance.now();
  execFileSync(wranglerCommand, wranglerArgs, { stdio: "inherit" });
  // TPI-OPS-004: separate TPI's own staging cost from Wrangler/Cloudflare's
  // upload and activation cost. The interval below is the whole Wrangler
  // deploy invocation; Wrangler reports its own upload/trigger sub-timings.
  const wranglerFinished = performance.now();
  console.log(JSON.stringify({
    timings: {
      stagingCopyAndManifestMs: candidateFlag ? 0 : stagedCopyMs,
      wranglerDeployProcessMs: Math.round(wranglerFinished - wranglerStarted),
    },
  }, null, 2));
} finally {
  // A certified or stage-out candidate is the release artifact and must survive.
  if (!stageOutFlag && !candidateFlag) {
    for (const directory of [candidateRoot, ...createdTemporaryDirectories].filter(Boolean)) rmSync(directory, { recursive: true, force: true });
  } else {
    for (const directory of createdTemporaryDirectories) rmSync(directory, { recursive: true, force: true });
  }
}

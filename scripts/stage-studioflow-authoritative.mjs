#!/usr/bin/env node

/**
 * Build the approved StudioFlow source commit in an isolated, provenance-checked
 * worktree and stage it into the website repository without discarding the
 * repository's maintained TPI bridge layer.
 *
 * Source provenance (TPI-STUDIOFLOW-107):
 *
 * - The release source identity is recorded in
 *   scripts/studioflow-release-baseline.json: an explicit source repository and
 *   an exact approved source commit. The workflow builds exactly that commit.
 *   An explicit --source-repo / --source-commit / --source-worktree statement is
 *   accepted only when it matches the recorded identity; anything else is
 *   rejected. There is no flag that bypasses these checks.
 * - Builds never read the developer's working tree. The build inputs are the
 *   tracked files of the approved commit, taken from either a disposable
 *   detached git worktree of that commit or a provided worktree that is proven
 *   clean and pinned at that commit. Dirty worktrees, missing commits,
 *   unexpected commits, foreign worktrees and unauthorized source paths are
 *   rejected before anything is built.
 * - The approved source is built twice in clean conditions and both artifact
 *   trees must be identical. The generated JavaScript and CSS are then compared
 *   against the recorded known-good production asset hashes; any difference is
 *   reported exactly and never repaired by editing application code.
 * - Default mode is verification-only. It rebuilds the approved source and
 *   compares the result against the staged website assets, and it never writes
 *   to studio/, the entry point, Worker configuration, development source or
 *   release commits. Pass --apply to copy the verified generated application
 *   files into ./studio; that explicit request is the only way to stage.
 *   Existing unreferenced files are intentionally retained so this command
 *   cannot silently remove worktree artifacts.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const maintainedBaselinePath = path.join(repoRoot, "scripts", "studioflow-release-baseline.json");
const defaultStageTarget = path.join(repoRoot, "studio");

const buildExcludedPaths = new Set(["node_modules", "dist", ".git"]);

const maintainedBridgeFiles = [
  "workspace-asset-state-bridge.js",
  "brand-heading-bridge.js",
  "production-lock-bridge.js",
  "workspace-bridge.js",
  "video-playback-reset-bridge.js",
  "video-clip-management-bridge.js",
  "audio-soundboard-bridge.js",
  "backup-bridge.js",
  "backup-core.mjs",
  "navigation-bridge.js",
  "studioflow-012-overrides.css"
];

const bridgeTags = [
  '<script src="/studio/workspace-asset-state-bridge.js?tpi080=scene-normalization-v2" defer></script>',
  '<script src="/studio/production-lock-bridge.js" defer></script>',
  '<script src="/studio/workspace-bridge.js?tpi080=scene-normalization-v2&tpi085=freeze-repair-v2&tpi-local-save-v1&tpi-portable-media=v1&tpi034=dom-stability-v1&tpi-recovery=preserve-v1&tpi087=studio-management-v2" defer></script>',
  '<script src="/studio/brand-heading-bridge.js?tpi074=legacy-brand-suppression-v1&tpi085=freeze-repair-v1" defer></script>',
  '<script src="/studio/video-playback-reset-bridge.js?tpi031=video-overlay-v2" defer></script>',
  '<script src="/studio/video-clip-management-bridge.js?tpi020=clip-management-v1&tpi022=video-organization-v13&tpi-panels=exclusive-v3&tpi034=dom-stability-v1&tpi037=scenes-panel-v1" defer></script>',
  '<script src="/studio/audio-soundboard-bridge.js?tpi021=soundboards-v8&tpi017=smart-pads&tpi-volume=v1&tpi-scene-music=v4&tpi-panels=exclusive-v3&tpi034=dom-stability-v1&tpi037=scenes-panel-uniformity-v2" defer></script>',
  '<script src="/studio/backup-bridge.js?tpi032=restore-v2-local-broadcast&tpi-portable-media=v1" defer></script>'
];

function reject(message) {
  throw new Error(`SOURCE IDENTITY REJECTED — ${message}`);
}

function assertExists(target, label) {
  if (!fs.existsSync(target)) {
    throw new Error(`${label} does not exist: ${target}`);
  }
}

function copyIfPresent(source, target, options = {}) {
  if (!fs.existsSync(source)) return false;
  fs.cpSync(source, target, { recursive: true, ...options });
  return true;
}

function listFiles(root) {
  const result = [];
  const visit = (current, relative = "") => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryRelative = relative ? path.join(relative, entry.name) : entry.name;
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(entryPath, entryRelative);
      else if (entry.isFile()) result.push(entryRelative);
    }
  };
  visit(root);
  return result.sort();
}

function digestFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function digestTree(root) {
  return Object.fromEntries(
    listFiles(root).map((relative) => [relative, digestFile(path.join(root, relative))])
  );
}

function sameDigestTree(left, right) {
  return JSON.stringify(digestTree(left)) === JSON.stringify(digestTree(right));
}

function runGit(cwd, args, label) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  } catch (error) {
    throw new Error(`${label} (git ${args.join(" ")} failed: ${error.message})`);
  }
}

/* ------------------------------------------------------------------ */
/* Explicit source identity and authorization surfaces                  */
/* ------------------------------------------------------------------ */

function parseArguments(argv) {
  const options = {
    mode: "verify-only",
    sourceRepo: null,
    sourceCommit: null,
    sourceWorktree: null,
    baselinePath: maintainedBaselinePath,
    stageTarget: defaultStageTarget
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (next === undefined) throw new Error(`${argument} requires a value`);
      index += 1;
      return next;
    };
    if (argument === "--apply") options.mode = "apply";
    else if (argument === "--verify-only") options.mode = "verify-only";
    else if (argument === "--source-repo") options.sourceRepo = value();
    else if (argument === "--source-commit") options.sourceCommit = value();
    else if (argument === "--source-worktree") options.sourceWorktree = value();
    else if (argument === "--baseline") options.baselinePath = value();
    else if (argument === "--stage-target") options.stageTarget = value();
    else throw new Error(`unknown argument: ${argument} (this workflow has no bypass flags)`);
  }
  return options;
}

function canonicalizeExisting(target, label) {
  try {
    return fs.realpathSync(path.resolve(target));
  } catch {
    reject(`${label} does not exist: ${target}`);
  }
}

function isRepoControlledPath(target, allowedExact) {
  const resolved = path.resolve(target);
  if (allowedExact.some((exact) => resolved === exact)) return true;
  const localRoot = path.join(repoRoot, ".local-dev");
  return resolved === localRoot || resolved.startsWith(`${localRoot}${path.sep}`);
}

function assertAuthorizationSurfaces(options) {
  if (!isRepoControlledPath(options.baselinePath, [maintainedBaselinePath])) {
    reject(`unauthorized baseline path: ${options.baselinePath} (only the maintained baseline or .local-dev fixtures may be used)`);
  }
  if (!isRepoControlledPath(options.stageTarget, [defaultStageTarget])) {
    reject(`unauthorized stage target: ${options.stageTarget} (only ./studio or .local-dev fixtures may be used)`);
  }
}

function loadBaseline(baselinePath) {
  assertExists(baselinePath, "release baseline");
  let baseline;
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  } catch (error) {
    reject(`invalid release baseline: ${error.message}`);
  }
  const commit = String(baseline?.source?.approvedCommit ?? "").toLowerCase();
  const repository = baseline?.source?.repository;
  const assets = baseline?.expectedAssets ?? {};
  const assetEntries = ["javaScript", "css"];
  const valid =
    baseline?.schemaVersion === 1 &&
    typeof repository === "string" &&
    repository.length > 0 &&
    /^[0-9a-f]{40}$/.test(commit) &&
    assetEntries.every((key) =>
      typeof assets[key]?.name === "string" &&
      /^[0-9a-f]{64}$/.test(String(assets[key]?.sha256 ?? "").toLowerCase())
    );
  if (!valid) {
    reject("invalid release baseline: schemaVersion, source.repository, a full source.approvedCommit and expectedAssets javaScript/css name+sha256 are required");
  }
  return {
    path: baselinePath,
    repository,
    approvedCommit: commit,
    expectedAssets: {
      javaScript: { name: assets.javaScript.name, sha256: assets.javaScript.sha256.toLowerCase() },
      css: { name: assets.css.name, sha256: assets.css.sha256.toLowerCase() }
    }
  };
}

function resolveSourceRepository(options, baseline) {
  let approved;
  try {
    approved = fs.realpathSync(baseline.repository);
  } catch {
    reject(`the approved source repository does not exist: ${baseline.repository}`);
  }
  if (options.sourceRepo) {
    let requested;
    try {
      requested = fs.realpathSync(path.resolve(options.sourceRepo));
    } catch {
      reject(`unauthorized source path: ${options.sourceRepo} does not exist`);
    }
    if (requested !== approved) {
      reject(`unauthorized source path: ${requested} is not the approved source repository ${approved}`);
    }
  }
  runGit(approved, ["rev-parse", "--git-dir"], `the approved source repository is not a git repository: ${approved}`);
  return approved;
}

function resolveApprovedCommit(repository, options, baseline) {
  const approvedCommit = baseline.approvedCommit;
  let resolved;
  try {
    resolved = runGit(repository, ["rev-parse", "--verify", `${approvedCommit}^{commit}`], "missing source commit");
  } catch {
    reject(`missing source commit: ${approvedCommit} is not available in the approved source repository`);
  }
  if (resolved !== approvedCommit) {
    reject(`the approved source commit did not resolve to itself: ${approvedCommit}`);
  }
  if (options.sourceCommit) {
    let stated;
    try {
      stated = runGit(repository, ["rev-parse", "--verify", `${options.sourceCommit}^{commit}`], "missing source commit");
    } catch {
      reject(`missing source commit: the explicitly stated source commit ${options.sourceCommit} is not available in the approved source repository`);
    }
    if (stated !== approvedCommit) {
      reject(`unexpected source commit: this workflow builds only the baseline-approved source commit ${approvedCommit}, not ${stated}`);
    }
  }
  return approvedCommit;
}

function gitCommonDir(target) {
  return fs.realpathSync(path.resolve(target, runGit(target, ["rev-parse", "--git-common-dir"], "git metadata unavailable")));
}

function assertCleanWorktree(worktree, approvedCommit) {
  const head = runGit(worktree, ["rev-parse", "HEAD"], "source worktree has no HEAD");
  if (head !== approvedCommit) {
    reject(`source worktree is not at the approved source commit: HEAD is ${head}, approved is ${approvedCommit}`);
  }
  const status = runGit(worktree, ["status", "--porcelain"], "source worktree status unavailable");
  if (status) {
    const changed = status.split("\n").slice(0, 5).join("; ");
    reject(`dirty source worktree: ${worktree} contains unfinished changes (${changed})`);
  }
}

function assertStudioFlowSourceTree(worktree) {
  for (const required of ["index.html", "package.json", "vite.config.ts", "src"]) {
    if (!fs.existsSync(path.join(worktree, required))) {
      reject(`unauthorized source tree: ${worktree} is missing ${required}`);
    }
  }
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(worktree, "package.json"), "utf8"));
  } catch (error) {
    reject(`unauthorized source tree: unreadable package.json (${error.message})`);
  }
  if (!pkg?.scripts?.build) {
    reject("unauthorized source tree: package.json has no build script");
  }
}

function resolveSourceWorktree(repository, approvedCommit, options) {
  if (options.sourceWorktree) {
    let worktree;
    try {
      worktree = fs.realpathSync(path.resolve(options.sourceWorktree));
    } catch {
      reject(`unauthorized source worktree: ${options.sourceWorktree} does not exist`);
    }
    if (!fs.statSync(worktree).isDirectory()) {
      reject(`unauthorized source worktree: ${worktree} is not a directory`);
    }
    if (gitCommonDir(worktree) !== gitCommonDir(repository)) {
      reject(`unauthorized source worktree: ${worktree} is not a worktree of the approved source repository`);
    }
    assertCleanWorktree(worktree, approvedCommit);
    assertStudioFlowSourceTree(worktree);
    return {
      root: worktree,
      origin: "provided-worktree",
      disposable: false,
      temporaryRoot: null
    };
  }
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tpi-studioflow-source-"));
  const worktree = path.join(temporaryRoot, "worktree");
  try {
    runGit(repository, ["worktree", "add", "--detach", worktree, approvedCommit], "could not create the isolated source worktree");
  } catch (error) {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
  assertCleanWorktree(worktree, approvedCommit);
  assertStudioFlowSourceTree(worktree);
  return {
    root: worktree,
    origin: "disposable-detached-worktree",
    disposable: true,
    temporaryRoot,
    repository
  };
}

/* ------------------------------------------------------------------ */
/* Build the approved source twice in clean conditions                  */
/* ------------------------------------------------------------------ */

function trackedFiles(worktree) {
  const listed = runGit(worktree, ["ls-files", "-z"], "could not list the approved source files");
  return listed.split("\0").filter(Boolean);
}

function copyApprovedInputs(worktree, files, targetRoot) {
  for (const relative of files) {
    const top = relative.split(path.sep)[0];
    if (buildExcludedPaths.has(top)) continue;
    const source = path.join(worktree, relative);
    const target = path.join(targetRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function prepareBuildRoots(worktree, files, temporaryRoots) {
  const rootA = fs.mkdtempSync(path.join(os.tmpdir(), "tpi-studioflow-build-"));
  const rootB = fs.mkdtempSync(path.join(os.tmpdir(), "tpi-studioflow-build-"));
  temporaryRoots.push(rootA, rootB);
  copyApprovedInputs(worktree, files, rootA);
  copyApprovedInputs(worktree, files, rootB);

  const hasLockfile = files.includes("package-lock.json");
  const providedNodeModules = path.join(worktree, "node_modules");
  let dependencyInstall = "no-dependency-install-required";
  if (
    hasLockfile &&
    fs.existsSync(providedNodeModules) &&
    digestFile(path.join(worktree, "package-lock.json")) === digestFile(path.join(rootA, "package-lock.json"))
  ) {
    dependencyInstall = "reused-provided-worktree-node_modules";
    fs.symlinkSync(providedNodeModules, path.join(rootA, "node_modules"), "dir");
    fs.symlinkSync(providedNodeModules, path.join(rootB, "node_modules"), "dir");
  } else if (hasLockfile) {
    dependencyInstall = "npm-ci-from-approved-lockfile";
    execFileSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: rootA, stdio: "inherit" });
    fs.symlinkSync(path.join(rootA, "node_modules"), path.join(rootB, "node_modules"), "dir");
  }
  return { rootA, rootB, dependencyInstall };
}

function runBuild(buildRoot) {
  const outputRoot = path.join(buildRoot, "dist");
  execFileSync("npm", ["run", "build", "--", "--outDir", outputRoot, "--emptyOutDir"], {
    cwd: buildRoot,
    stdio: "inherit"
  });
  return outputRoot;
}

/* ------------------------------------------------------------------ */
/* Integration candidate and comparisons                                */
/* ------------------------------------------------------------------ */

function extractThemeBridge(currentIndexHtml) {
  const match = currentIndexHtml.match(/<script>\s*\/\* TPI site-theme bridge:[\s\S]*?<\/script>/);
  if (!match) {
    throw new Error("The maintained TPI site-theme bridge was not found in the staged studio/index.html");
  }
  return match[0];
}

function extractMaintainedExternalScripts(currentIndexHtml) {
  return [...currentIndexHtml.matchAll(/<script\s+src="https?:\/\/[^"]+"[^>]*><\/script>/g)]
    .map((match) => match[0]);
}

function mergeEntryPoint(generatedIndexHtml, maintainedIndexHtml) {
  const generatedModule = generatedIndexHtml.match(
    /<script type="module" crossorigin src="[^"]+"><\/script>/
  );
  if (!generatedModule) throw new Error("Generated StudioFlow index.html has no module entry point");

  const generatedCss = generatedIndexHtml.match(
    /<link rel="stylesheet" crossorigin href="[^"]+">/
  );
  if (!generatedCss) throw new Error("Generated StudioFlow index.html has no stylesheet entry point");

  const themeBridge = extractThemeBridge(maintainedIndexHtml);
  const integrations = [
    ...extractMaintainedExternalScripts(maintainedIndexHtml)
      .filter((tag) => !generatedIndexHtml.includes(tag)),
    themeBridge,
    ...bridgeTags,
    generatedModule[0],
    '<script src="/studio/navigation-bridge.js" defer></script>'
  ].join("\n    ");

  let merged = generatedIndexHtml.replace(generatedModule[0], integrations);
  merged = merged.replace(
    generatedCss[0],
    `${generatedCss[0]}\n    <link rel="stylesheet" href="/studio/studioflow-012-overrides.css?tpi022=video-organization-v12&tpi-panels=exclusive-v3&tpi037=scenes-panel-uniformity-v2">`
  );
  return merged;
}

function createIntegratedCandidate(generatedRoot, stageTarget, temporaryRoots) {
  const candidateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tpi-studioflow-integrated-"));
  temporaryRoots.push(candidateRoot);
  fs.cpSync(generatedRoot, candidateRoot, { recursive: true });

  const maintainedIndexPath = path.join(stageTarget, "index.html");
  assertExists(maintainedIndexPath, "maintained StudioFlow entry point (stage target index.html)");
  const mergedIndex = mergeEntryPoint(
    fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8"),
    fs.readFileSync(maintainedIndexPath, "utf8")
  );
  fs.writeFileSync(path.join(candidateRoot, "index.html"), mergedIndex);

  for (const file of maintainedBridgeFiles) {
    const source = path.join(stageTarget, file);
    assertExists(source, `maintained TPI integration file ${file}`);
    fs.cpSync(source, path.join(candidateRoot, file));
  }

  const stagedIndex = fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8");
  if (stagedIndex.includes("index-j2x9m9vI.js") || stagedIndex.includes("index-DXjilBOR.css")) {
    throw new Error("Integrated entry point still references obsolete website bundle assets");
  }
  if (!stagedIndex.includes("workspace-bridge.js?tpi080=scene-normalization-v2&tpi085=freeze-repair-v2&tpi-local-save-v1&tpi-portable-media=v1&tpi034=dom-stability-v1&tpi-recovery=preserve-v1&tpi087=studio-management-v2")) {
    throw new Error("Integrated entry point is missing the workspace bridge");
  }
  if (!stagedIndex.includes("backup-bridge.js?tpi032=restore-v2-local-broadcast&tpi-portable-media=v1")) {
    throw new Error("Integrated entry point is missing the backup bridge");
  }
  if (!stagedIndex.includes("video-clip-management-bridge.js?tpi020=clip-management-v1&tpi022=video-organization-v13&tpi-panels=exclusive-v3&tpi034=dom-stability-v1&tpi037=scenes-panel-v1")) {
    throw new Error("Integrated entry point is missing the video clip management bridge");
  }
  if (!stagedIndex.includes("audio-soundboard-bridge.js?tpi021=soundboards-v8&tpi017=smart-pads&tpi-volume=v1&tpi-scene-music=v4&tpi-panels=exclusive-v3&tpi034=dom-stability-v1&tpi037=scenes-panel-uniformity-v2")) {
    throw new Error("Integrated entry point is missing the audio soundboard bridge");
  }

  return candidateRoot;
}

function verifyGeneratedFiles(candidateRoot, generatedRoot) {
  for (const relative of listFiles(generatedRoot)) {
    const generated = path.join(generatedRoot, relative);
    const candidate = path.join(candidateRoot, relative);
    if (relative === "index.html") continue;
    if (!fs.existsSync(candidate) || digestFile(generated) !== digestFile(candidate)) {
      throw new Error(`Generated asset mismatch in integrated candidate: ${relative}`);
    }
  }
}

function compareStagedAssets(candidateRoot, stageTarget) {
  const mismatches = [];
  const candidateFiles = listFiles(candidateRoot);
  for (const relative of candidateFiles) {
    const candidate = path.join(candidateRoot, relative);
    const staged = path.join(stageTarget, relative);
    if (!fs.existsSync(staged)) {
      mismatches.push({ file: relative, reason: "missing from the staged website assets" });
      continue;
    }
    if (digestFile(candidate) !== digestFile(staged)) {
      mismatches.push({ file: relative, reason: `digest mismatch (approved ${digestFile(candidate)}, staged ${digestFile(staged)})` });
    }
  }
  return { matches: mismatches.length === 0, checkedFiles: candidateFiles.length, mismatches };
}

function stageCandidate(candidateRoot, stageTarget) {
  for (const relative of listFiles(candidateRoot)) {
    const source = path.join(candidateRoot, relative);
    const target = path.join(stageTarget, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function generatedAssetIdentity(generatedRoot) {
  const generatedIndex = fs.readFileSync(path.join(generatedRoot, "index.html"), "utf8");
  const jsReference = generatedIndex.match(/src="(\/studio\/assets\/[^"]+\.js)"/);
  const cssReference = generatedIndex.match(/href="(\/studio\/assets\/[^"]+\.css)"/);
  if (!jsReference || !cssReference) {
    throw new Error("Generated entry point does not reference /studio/assets JavaScript and CSS");
  }
  const identityFor = (reference) => {
    const relative = reference.replace(/^\/studio\//, "");
    const resolved = path.join(generatedRoot, relative);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Generated asset referenced by the entry point is missing from the build output: ${reference}`);
    }
    return { name: path.basename(reference), sha256: digestFile(resolved) };
  };
  return {
    javaScript: identityFor(jsReference[1]),
    css: identityFor(cssReference[1])
  };
}

function compareBaseline(generatedAssets, expectedAssets) {
  const differences = [];
  for (const key of ["javaScript", "css"]) {
    if (generatedAssets[key].name !== expectedAssets[key].name) {
      differences.push(`${key} name: built ${generatedAssets[key].name}, recorded ${expectedAssets[key].name}`);
    }
    if (generatedAssets[key].sha256 !== expectedAssets[key].sha256) {
      differences.push(`${key} sha256: built ${generatedAssets[key].sha256}, recorded ${expectedAssets[key].sha256}`);
    }
  }
  return { matches: differences.length === 0, differences };
}

/* ------------------------------------------------------------------ */

function main() {
  const options = parseArguments(process.argv.slice(2));
  options.baselinePath = canonicalizeExisting(options.baselinePath, "release baseline");
  options.stageTarget = canonicalizeExisting(options.stageTarget, "stage target");
  assertAuthorizationSurfaces(options);
  const baseline = loadBaseline(options.baselinePath);
  const repository = resolveSourceRepository(options, baseline);
  const approvedCommit = resolveApprovedCommit(repository, options, baseline);
  const stageTarget = options.stageTarget;
  assertExists(stageTarget, "stage target directory");

  const temporaryRoots = [];
  let sourceWorktree;
  try {
    sourceWorktree = resolveSourceWorktree(repository, approvedCommit, options);
    if (sourceWorktree.temporaryRoot) temporaryRoots.push(sourceWorktree.temporaryRoot);

    const files = trackedFiles(sourceWorktree.root);
    const buildEnv = prepareBuildRoots(sourceWorktree.root, files, temporaryRoots);
    const requestBudget = path.join(buildEnv.rootA, "scripts", "check-request-budget.mjs");
    if (fs.existsSync(requestBudget)) {
      execFileSync(process.execPath, [requestBudget], { cwd: buildEnv.rootA, stdio: "inherit" });
    }
    const outputA = runBuild(buildEnv.rootA);
    const outputB = runBuild(buildEnv.rootB);
    const reproducible = sameDigestTree(outputA, outputB);
    if (!reproducible) throw new Error("Two builds of the approved source produced different artifacts");

    const generatedAssets = generatedAssetIdentity(outputA);
    const baselineComparison = compareBaseline(generatedAssets, baseline.expectedAssets);
    if (!baselineComparison.matches) {
      throw new Error(`the approved source does not reproduce the recorded production assets: ${baselineComparison.differences.join("; ")}`);
    }

    const candidateRoot = createIntegratedCandidate(outputA, stageTarget, temporaryRoots);
    verifyGeneratedFiles(candidateRoot, outputA);

    const stagedBefore = compareStagedAssets(candidateRoot, stageTarget);
    const applied = options.mode === "apply";
    if (applied) {
      stageCandidate(candidateRoot, stageTarget);
    }
    const stagedAfter = compareStagedAssets(candidateRoot, stageTarget);
    if (!applied && !stagedAfter.matches) {
      const detail = stagedAfter.mismatches
        .map((entry) => `${entry.file}: ${entry.reason}`)
        .join("; ");
      throw new Error(`staged website assets do not match the approved build output: ${detail}`);
    }
    if (applied && !stagedAfter.matches) {
      throw new Error("staging completed but the staged website assets still do not match the approved build output");
    }

    const generatedFiles = listFiles(outputA);
    const candidateFiles = listFiles(candidateRoot);
    const generatedIndex = fs.readFileSync(path.join(outputA, "index.html"), "utf8");

    console.log(JSON.stringify({
      status: applied ? "STAGED" : "VERIFIED",
      mode: options.mode,
      sourceIdentity: {
        repository,
        approvedCommit,
        resolvedCommit: approvedCommit,
        sourceWorktree: sourceWorktree.root,
        sourceWorktreeOrigin: sourceWorktree.origin,
        sourceWorktreeClean: true,
        buildInputsAreTrackedFilesOfApprovedCommit: true
      },
      dependencyInstall: buildEnv.dependencyInstall,
      generatedFiles: generatedFiles.length,
      integratedFiles: candidateFiles.length,
      generatedJavaScript: generatedIndex.match(/src="(\/studio\/assets\/[^"]+\.js)"/)?.[1] ?? null,
      generatedCss: generatedIndex.match(/href="(\/studio\/assets\/[^"]+\.css)"/)?.[1] ?? null,
      generatedAssetHashes: {
        javaScript: generatedAssets.javaScript.sha256,
        css: generatedAssets.css.sha256
      },
      baselineComparison: {
        expectedJavaScriptName: baseline.expectedAssets.javaScript.name,
        expectedJavaScriptSha256: baseline.expectedAssets.javaScript.sha256,
        expectedCssName: baseline.expectedAssets.css.name,
        expectedCssSha256: baseline.expectedAssets.css.sha256,
        matches: baselineComparison.matches
      },
      stagedAssetsComparison: {
        matches: stagedAfter.matches,
        checkedFiles: stagedAfter.checkedFiles,
        mismatchesBeforeRun: stagedBefore.mismatches.length
      },
      integratedEntryPointSha256: digestFile(path.join(candidateRoot, "index.html")),
      generatedAssetsMatchIntegratedCandidate: true,
      reproducibleBuilds: reproducible,
      obsoleteBundleReferences: {
        oldJavaScript: fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8").includes("index-j2x9m9vI.js"),
        oldCss: fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8").includes("index-DXjilBOR.css")
      },
      preservedBridgeFiles: maintainedBridgeFiles,
      applied
    }, null, 2));
  } finally {
    if (sourceWorktree?.disposable && sourceWorktree.temporaryRoot) {
      try {
        runGit(sourceWorktree.repository, ["worktree", "remove", "--force", sourceWorktree.root], "worktree cleanup");
        runGit(sourceWorktree.repository, ["worktree", "prune"], "worktree prune");
      } catch {
        // Best-effort cleanup of the disposable worktree registration.
      }
    }
    for (const temporaryRoot of temporaryRoots) {
      fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`StudioFlow authoritative staging failed: ${error.message}`);
  process.exitCode = 1;
}

#!/usr/bin/env node

/**
 * TPI-STUDIOFLOW-107 source-provenance regression suite.
 *
 * Exercises the corrected stage-studioflow-authoritative.mjs workflow with
 * disposable fixture repositories and the real approved release baseline:
 *
 *  1. Approved clean source commit — PASS
 *  2. Dirty source worktree — REJECT
 *  3. Incorrect source commit — REJECT
 *  4. Missing source commit — REJECT
 *  5. Unauthorized source path — REJECT
 *  6. Source path pointing to mixed development — REJECT
 *  7. Verify-only leaves staged assets unchanged
 *  8. Apply mode requires explicit authorization
 *  9. Two clean builds produce identical outputs
 * 10. Approved source reproduces the known-good production assets
 * 11. Incorrect staged asset hashes are detected
 * 12. Existing release guards remain functional
 */

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..", "..");
const stagingScript = path.join(repoRoot, "scripts", "stage-studioflow-authoritative.mjs");
const stagingSource = fs.readFileSync(stagingScript, "utf8");
const maintainedBaseline = path.join(repoRoot, "scripts", "studioflow-release-baseline.json");
const fixtureRoot = path.join(repoRoot, ".local-dev", "tmp", "directive-107");
const mixedDevelopmentTree = "/Users/toddknipple/Documents/StudioFlow/web";

const knownGoodJavaScript = "4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557";
const knownGoodCss = "8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69";
const approvedSourceCommit = "6b9c3c4b6b40f0496012e5d718d32d75e149dcf6";

const FIXTURE_JS = "console.log(\"tpi-107 fixture application\");\n";
const FIXTURE_CSS = "body { font-family: sans-serif; }\n";
const fixtureJsName = `index-${crypto.createHash("sha256").update(FIXTURE_JS).digest("hex").slice(0, 8)}.js`;
const fixtureCssName = `index-${crypto.createHash("sha256").update(FIXTURE_CSS).digest("hex").slice(0, 8)}.css`;

const BUILD_MJS = [
  "import { createHash } from \"node:crypto\";",
  "import fs from \"node:fs\";",
  "import path from \"node:path\";",
  "const outIndex = process.argv.indexOf(\"--outDir\");",
  "if (outIndex < 0) throw new Error(\"--outDir is required\");",
  "const outDir = process.argv[outIndex + 1];",
  `const js = ${JSON.stringify(FIXTURE_JS)};`,
  `const css = ${JSON.stringify(FIXTURE_CSS)};`,
  "const jsName = \"index-\" + createHash(\"sha256\").update(js).digest(\"hex\").slice(0, 8) + \".js\";",
  "const cssName = \"index-\" + createHash(\"sha256\").update(css).digest(\"hex\").slice(0, 8) + \".css\";",
  "fs.mkdirSync(path.join(outDir, \"assets\"), { recursive: true });",
  "fs.writeFileSync(path.join(outDir, \"assets\", jsName), js);",
  "fs.writeFileSync(path.join(outDir, \"assets\", cssName), css);",
  "const html = \"<!doctype html>\\n<html>\\n  <head>\\n    <link rel=\\\"stylesheet\\\" crossorigin href=\\\"/studio/assets/\" + cssName + \"\\\">\\n  </head>\\n  <body>\\n    <div id=\\\"root\\\"></div>\\n    <script type=\\\"module\\\" crossorigin src=\\\"/studio/assets/\" + jsName + \"\\\"></script>\\n  </body>\\n</html>\\n\";",
  "fs.writeFileSync(path.join(outDir, \"index.html\"), html);"
].join("\n");

function git(cwd, ...args) {
  return execFileSync(
    "git",
    ["-c", "user.name=TPI 107 Fixture", "-c", "user.email=fixture@local", ...args],
    { cwd, encoding: "utf8" }
  ).trim();
}

function commitFixture(directory, message) {
  git(directory, "add", "-A");
  git(directory, "commit", "-q", "-m", message);
  return git(directory, "rev-parse", "HEAD");
}

function makeFixtureRepo(name) {
  const directory = path.join(fixtureRoot, name);
  fs.mkdirSync(path.join(directory, "src"), { recursive: true });
  fs.writeFileSync(path.join(directory, "package.json"), `${JSON.stringify({
    name: "studioflow-provenance-fixture",
    private: true,
    type: "module",
    scripts: { build: "node build.mjs" }
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(directory, "build.mjs"), `${BUILD_MJS}\n`);
  fs.writeFileSync(path.join(directory, "index.html"), "<!doctype html>\n<html><head><title>fixture</title></head><body><div id=\"root\"></div></body></html>\n");
  fs.writeFileSync(path.join(directory, "vite.config.ts"), "export default {};\n");
  fs.writeFileSync(path.join(directory, "src", "main.js"), "export const fixture = true;\n");
  git(directory, "init", "-q");
  const first = commitFixture(directory, "fixture: approved source state");
  fs.writeFileSync(path.join(directory, "src", "later.js"), "export const later = true;\n");
  const second = commitFixture(directory, "fixture: later unrelated development");
  return { directory, approvedCommit: first, laterCommit: second };
}

function makeFixtureBaseline(name, { repository, approvedCommit, jsName, cssName, jsSha, cssSha }) {
  const baselinePath = path.join(fixtureRoot, `${name}-baseline.json`);
  fs.writeFileSync(baselinePath, `${JSON.stringify({
    schemaVersion: 1,
    recordedDirective: "TPI-STUDIOFLOW-107-fixture",
    source: { repository, approvedCommit },
    expectedAssets: {
      javaScript: { name: jsName, sha256: jsSha },
      css: { name: cssName, sha256: cssSha }
    }
  }, null, 2)}\n`);
  return baselinePath;
}

function makeFixtureStageTarget(name) {
  const stageTarget = path.join(fixtureRoot, `${name}-stage`);
  fs.mkdirSync(stageTarget, { recursive: true });
  fs.writeFileSync(path.join(stageTarget, "index.html"),
    "<!doctype html>\n<html><head><script>/* TPI site-theme bridge: fixture */</script></head><body></body></html>\n");
  for (const bridge of [
    "workspace-asset-state-bridge.js", "brand-heading-bridge.js", "production-lock-bridge.js",
    "workspace-bridge.js", "video-playback-reset-bridge.js", "video-clip-management-bridge.js",
    "audio-soundboard-bridge.js", "backup-bridge.js", "backup-core.mjs", "navigation-bridge.js",
    "studioflow-012-overrides.css"
  ]) {
    fs.writeFileSync(path.join(stageTarget, bridge), "// maintained TPI bridge fixture stub\n");
  }
  return stageTarget;
}

function digestTreeString(root) {
  const entries = [];
  const visit = (current, relative = "") => {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryRelative = relative ? path.join(relative, entry.name) : entry.name;
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(entryPath, entryRelative);
      else if (entry.isFile()) {
        entries.push(`${entryRelative}:${crypto.createHash("sha256").update(fs.readFileSync(entryPath)).digest("hex")}`);
      }
    }
  };
  visit(root);
  return JSON.stringify(entries.sort());
}

function runStaging(args) {
  const result = spawnSync(process.execPath, [stagingScript, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  return { status: result.status, stdout: result.stdout || "", stderr: result.stderr || "" };
}

function parseSummary(result) {
  const marker = result.stdout.lastIndexOf('{\n  "status"');
  assert.ok(marker >= 0, `expected a JSON summary in the staging output:\n${result.stdout.slice(-2000)}`);
  return JSON.parse(result.stdout.slice(marker));
}

const checks = [];
function check(name, run) {
  try {
    run();
    checks.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    checks.push({ name, passed: false, detail: error.message });
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

fs.rmSync(fixtureRoot, { recursive: true, force: true });
fs.mkdirSync(fixtureRoot, { recursive: true });

/* ---------------- disposable fixtures ---------------- */

const fixture = makeFixtureRepo("main");
const fixtureBaseline = makeFixtureBaseline("main", {
  repository: fixture.directory,
  approvedCommit: fixture.approvedCommit,
  jsName: fixtureJsName,
  cssName: fixtureCssName,
  jsSha: crypto.createHash("sha256").update(FIXTURE_JS).digest("hex"),
  cssSha: crypto.createHash("sha256").update(FIXTURE_CSS).digest("hex")
});
const stageTarget = makeFixtureStageTarget("main");
const baselineArgs = ["--baseline", fixtureBaseline, "--stage-target", stageTarget];

const virginDigest = digestTreeString(stageTarget);
const unstagedRun = runStaging([...baselineArgs, "--verify-only"]);

check("verify-only reports staged mismatch without staging anything", () => {
  assert.notEqual(unstagedRun.status, 0, "verify-only on an unstaged target must fail its staged comparison");
  assert.match(`${unstagedRun.stderr}${unstagedRun.stdout}`, /staged website assets do not match the approved build output/);
  assert.equal(fs.existsSync(path.join(stageTarget, "assets")), false, "verify-only must not create staged assets");
  assert.equal(digestTreeString(stageTarget), virginDigest, "verify-only must leave the stage target byte-identical");
});

const unauthorizedApplyRun = runStaging([...baselineArgs, "--apply", "--source-commit", fixture.laterCommit]);

check("apply with a non-approved source commit is rejected before staging", () => {
  assert.notEqual(unauthorizedApplyRun.status, 0);
  assert.match(`${unauthorizedApplyRun.stderr}${unauthorizedApplyRun.stdout}`, /unexpected source commit/);
  assert.equal(digestTreeString(stageTarget), virginDigest, "a rejected apply must leave the stage target byte-identical");
});

const applyRun = runStaging([...baselineArgs, "--apply"]);

check("apply with the approved identity stages the verified build", () => {
  assert.equal(applyRun.status, 0, applyRun.stderr);
  const summary = parseSummary(applyRun);
  assert.equal(summary.status, "STAGED");
  assert.equal(summary.applied, true);
  assert.equal(summary.sourceIdentity.resolvedCommit, fixture.approvedCommit);
  assert.equal(summary.baselineComparison.matches, true);
  assert.equal(fs.existsSync(path.join(stageTarget, "assets", fixtureJsName)), true);
  assert.equal(fs.existsSync(path.join(stageTarget, "assets", fixtureCssName)), true);
});

const stagedDigest = digestTreeString(stageTarget);
const approvedRun = runStaging([...baselineArgs, "--verify-only"]);

check("approved clean source commit verifies PASS and is identified exactly", () => {
  assert.equal(approvedRun.status, 0, approvedRun.stderr);
  const summary = parseSummary(approvedRun);
  assert.equal(summary.status, "VERIFIED");
  assert.equal(summary.sourceIdentity.approvedCommit, fixture.approvedCommit);
  assert.equal(summary.sourceIdentity.resolvedCommit, fixture.approvedCommit);
  assert.equal(summary.sourceIdentity.sourceWorktreeClean, true);
  assert.equal(summary.sourceIdentity.buildInputsAreTrackedFilesOfApprovedCommit, true);
  assert.equal(summary.stagedAssetsComparison.matches, true);
});

check("verify-only leaves staged assets unchanged", () => {
  assert.equal(digestTreeString(stageTarget), stagedDigest, "verify-only must leave the staged assets byte-identical");
});

check("two clean builds produce identical outputs", () => {
  assert.equal(parseSummary(approvedRun).reproducibleBuilds, true);
});

const tamperedAsset = path.join(stageTarget, "assets", fixtureJsName);
const originalAsset = fs.readFileSync(tamperedAsset);
fs.appendFileSync(tamperedAsset, "\n// tampered\n");
const tamperedRun = runStaging([...baselineArgs, "--verify-only"]);

check("incorrect staged asset hashes are detected", () => {
  assert.notEqual(tamperedRun.status, 0, "a tampered staged asset must fail verification");
  assert.match(`${tamperedRun.stderr}${tamperedRun.stdout}`, /staged website assets do not match the approved build output/);
  assert.match(`${tamperedRun.stderr}${tamperedRun.stdout}`, new RegExp(fixtureJsName));
});

fs.writeFileSync(tamperedAsset, originalAsset);

check("staged comparison recovers after the tampered asset is restored", () => {
  const restored = runStaging([...baselineArgs, "--verify-only"]);
  assert.equal(restored.status, 0, restored.stderr);
  assert.equal(parseSummary(restored).stagedAssetsComparison.matches, true);
});

const wrongCommitRun = runStaging([...baselineArgs, "--verify-only", "--source-commit", fixture.laterCommit]);
check("incorrect source commit is rejected", () => {
  assert.notEqual(wrongCommitRun.status, 0);
  assert.match(`${wrongCommitRun.stderr}${wrongCommitRun.stdout}`, /unexpected source commit/);
});

const missingCommitRun = runStaging([...baselineArgs, "--verify-only", "--source-commit", "0".repeat(40)]);
check("missing source commit is rejected", () => {
  assert.notEqual(missingCommitRun.status, 0);
  assert.match(`${missingCommitRun.stderr}${missingCommitRun.stdout}`, /missing source commit/);
});

/* ---------------- dirty source worktree ---------------- */

const dirtyFixture = makeFixtureRepo("dirty");
fs.writeFileSync(path.join(dirtyFixture.directory, "src", "main.js"), "export const fixture = true; // unfinished edit\n");
const dirtyBaseline = makeFixtureBaseline("dirty", {
  repository: dirtyFixture.directory,
  approvedCommit: dirtyFixture.laterCommit,
  jsName: fixtureJsName,
  cssName: fixtureCssName,
  jsSha: crypto.createHash("sha256").update(FIXTURE_JS).digest("hex"),
  cssSha: crypto.createHash("sha256").update(FIXTURE_CSS).digest("hex")
});
const dirtyRun = runStaging([
  "--baseline", dirtyBaseline,
  "--stage-target", makeFixtureStageTarget("dirty"),
  "--verify-only",
  "--source-worktree", dirtyFixture.directory
]);
check("dirty source worktree is rejected", () => {
  assert.notEqual(dirtyRun.status, 0);
  assert.match(`${dirtyRun.stderr}${dirtyRun.stdout}`, /dirty source worktree/);
});

/* ---------------- unauthorized and mixed-development sources ---------------- */

const unauthorizedPathRun = runStaging(["--verify-only", "--source-repo", repoRoot]);
check("unauthorized source path is rejected", () => {
  assert.notEqual(unauthorizedPathRun.status, 0);
  assert.match(`${unauthorizedPathRun.stderr}${unauthorizedPathRun.stdout}`, /unauthorized source path/);
});

const outsideSurface = fs.mkdtempSync(path.join(os.tmpdir(), "tpi107-outside-surface-"));
const unauthorizedStageRun = runStaging(["--verify-only", "--stage-target", outsideSurface]);
check("unauthorized staging surfaces are rejected", () => {
  assert.notEqual(unauthorizedStageRun.status, 0);
  assert.match(`${unauthorizedStageRun.stderr}${unauthorizedStageRun.stdout}`, /unauthorized stage target/);
});
fs.rmSync(outsideSurface, { recursive: true, force: true });

const mixedTreeHead = git(mixedDevelopmentTree, "rev-parse", "HEAD");
const mixedWrongCommitRun = runStaging(["--verify-only", "--source-worktree", mixedDevelopmentTree]);
check("the mixed development tree cannot be a source worktree (wrong commit)", () => {
  assert.notEqual(mixedWrongCommitRun.status, 0);
  assert.match(`${mixedWrongCommitRun.stderr}${mixedWrongCommitRun.stdout}`, /source worktree is not at the approved source commit/);
});

const mixedDirtyState = git(mixedDevelopmentTree, "status", "--porcelain");
const mixedBaseline = makeFixtureBaseline("mixed", {
  repository: mixedDevelopmentTree,
  approvedCommit: mixedTreeHead,
  jsName: fixtureJsName,
  cssName: fixtureCssName,
  jsSha: crypto.createHash("sha256").update(FIXTURE_JS).digest("hex"),
  cssSha: crypto.createHash("sha256").update(FIXTURE_CSS).digest("hex")
});
const mixedRun = runStaging([
  "--baseline", mixedBaseline,
  "--stage-target", makeFixtureStageTarget("mixed"),
  "--verify-only",
  "--source-worktree", mixedDevelopmentTree
]);
check("the mixed development tree cannot be built even when its commit is requested", () => {
  assert.notEqual(mixedRun.status, 0, "the mixed development tree must never build");
  if (mixedDirtyState) {
    assert.match(`${mixedRun.stderr}${mixedRun.stdout}`, /dirty source worktree/);
  }
});

/* ---------------- real approved baseline ---------------- */

const studioDigestBefore = digestTreeString(path.join(repoRoot, "studio"));
const realRun = runStaging(["--verify-only"]);
const studioDigestAfter = digestTreeString(path.join(repoRoot, "studio"));

check("approved source reproduces the known-good production assets", () => {
  assert.equal(realRun.status, 0, realRun.stderr);
  const summary = parseSummary(realRun);
  assert.equal(summary.status, "VERIFIED");
  assert.equal(summary.sourceIdentity.repository, fs.realpathSync(mixedDevelopmentTree));
  assert.equal(summary.sourceIdentity.resolvedCommit, approvedSourceCommit);
  assert.equal(summary.sourceIdentity.sourceWorktreeClean, true);
  assert.equal(summary.baselineComparison.matches, true, JSON.stringify(summary.baselineComparison));
  assert.equal(summary.generatedAssetHashes.javaScript, knownGoodJavaScript);
  assert.equal(summary.generatedAssetHashes.css, knownGoodCss);
  assert.equal(summary.reproducibleBuilds, true);
  assert.equal(summary.stagedAssetsComparison.matches, true);
  assert.equal(summary.applied, false);
});

check("verify-only leaves the real staged studio/ assets unchanged", () => {
  assert.equal(studioDigestAfter, studioDigestBefore);
});

/* ---------------- existing release guards ---------------- */

check("existing release-safety contract still passes", () => {
  const result = spawnSync("npm", ["run", "verify:release-safety"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

check("existing source-reconciliation regression still passes", () => {
  const result = spawnSync(process.execPath, ["scripts/verify/tpi-studioflow-055-source-reconciliation.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

check("the staging workflow preserves maintained guards and adds no bypass flags", () => {
  assert.match(stagingSource, /maintainedBridgeFiles/);
  assert.match(stagingSource, /bridgeTags/);
  assert.match(stagingSource, /check-request-budget\.mjs/);
  assert.match(stagingSource, /video-clip-management-bridge\.js\?tpi020=clip-management-v1/);
  assert.match(stagingSource, /unknown argument/);
  const parsedFlags = [...stagingSource.matchAll(/argument === "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(
    [...new Set(parsedFlags)].sort(),
    ["--apply", "--baseline", "--source-commit", "--source-repo", "--source-worktree", "--stage-target", "--verify-only"],
    "the staging workflow must accept only the documented source-identity and mode flags"
  );
  assert.doesNotMatch(stagingSource, /--allow-dirty|--allow-unapproved|--skip-source/);
});

const failed = checks.filter((result) => !result.passed);
for (const result of failed) console.log(`FAILED DETAIL ${result.name}: ${result.detail}`);
console.log(JSON.stringify({
  directive: "TPI-STUDIOFLOW-107",
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  externalRequests: 0
}, null, 2));
if (failed.length) process.exit(1);

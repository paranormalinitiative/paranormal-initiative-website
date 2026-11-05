#!/usr/bin/env node

// TPI-OPS-005 — fail-closed certification regression suite.
//
// Every assertion builds a real throwaway Git repository with a real bare
// remote, certifies a real candidate, and then proves that one specific change
// is refused with one specific reason code. Nothing here touches production:
// no Cloudflare call, no network, no port, no `.local-dev` of the real
// repository. It finishes in seconds, so it runs inside the release preflight.
//
// Exit status: 0 when every expected refusal happens, 1 otherwise.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync, appendFileSync, unlinkSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  approvedStudioflowCommit,
  buildManifest,
  collectSourceIdentity,
  computeManifestDigest,
  certificationPath,
  prepareCandidateDirectory,
  readCertification,
  verifyCertification,
  writeCertification,
} from "../release-certification.mjs";
import { classifyReleaseTier } from "../release-tier.mjs";

const BRANCH = "codex/tpi-development";
const results = [];
let failures = 0;

function record(name, status, detail) {
  results.push({ assertion: name, status, detail });
  if (status !== "PASS") failures += 1;
  console.log(`${status === "PASS" ? "PASS" : "FAIL"}  ${name}${detail && status !== "PASS" ? `\n        ${detail}` : ""}`);
}
function expectRefusal(name, expectedCode, action) {
  try {
    action();
    record(name, "FAIL", `expected refusal ${expectedCode} but the action was accepted`);
  } catch (error) {
    if (error?.code === expectedCode) record(name, "PASS");
    else record(name, "FAIL", `expected ${expectedCode}, received ${error?.code || "no code"}: ${error?.message || error}`);
  }
}
function expectAccepted(name, action) {
  try {
    action();
    record(name, "PASS");
  } catch (error) {
    record(name, "FAIL", `expected acceptance but refused with ${error?.code || "no code"}: ${error?.message || error}`);
  }
}

const sandbox = mkdtempSync(join(tmpdir(), "tpi-ops005-"));
const repo = join(sandbox, "repo");
const remote = join(sandbox, "remote.git");
const candidateRoot = join(repo, ".local-dev", "release-candidate");

const gitCwdFirst = (cwd, args) => git(args, cwd);
function git(args, cwd = repo) {
  return execFileSync("git", ["-c", "user.email=ops005@tpi.invalid", "-c", "user.name=TPI OPS-005", ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function writeFile(relPath, content) {
  const absolute = join(repo, relPath);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content);
}
function commit(message) {
  git(["add", "-A"]);
  git(["commit", "-m", message]);
  git(["push", "origin", `HEAD:refs/heads/${BRANCH}`]);
  return git(["rev-parse", "HEAD"]);
}

// ---------------------------------------------------------------------------
// A real repository with a real remote, shaped like the maintained one.
// ---------------------------------------------------------------------------
mkdirSync(repo, { recursive: true });
git(["init", "--bare", remote], sandbox);
git(["init"], repo);
git(["remote", "add", "origin", remote]);
git(["checkout", "-b", BRANCH]);

writeFile("worker.js", [
  'import { onRequest } from "./functions/api/[[path]].js";',
  'import { getSessionUser } from "./lib/auth.js";',
  "export default { fetch() { return new Response('ok'); }, getSessionUser, onRequest };",
  "",
].join("\n"));
writeFile("lib/auth.js", "export function getSessionUser() { return null; }\n");
writeFile("functions/api/[[path]].js", "export function onRequest() { return new Response('api'); }\n");
writeFile("wrangler.toml", [
  'name = "theparanormalinitiative"',
  'main = "worker.js"',
  'compatibility_date = "2026-07-18"',
  "[assets]",
  'directory = "."',
  'binding = "ASSETS"',
  "",
].join("\n"));
writeFile("package.json", JSON.stringify({ name: "ops005-fixture", private: true }, null, 2) + "\n");
writeFile("package-lock.json", JSON.stringify({ lockfileVersion: 3, packages: {} }, null, 2) + "\n");
writeFile(".assetsignore", ".local-dev/\n");
writeFile("scripts/tpi-release.mjs", "// fixture release entry\n");
writeFile("scripts/deploy-production-guarded.mjs", "// fixture deploy guard\n");
writeFile("scripts/release-certification.mjs", "// fixture certification library\n");
writeFile("scripts/release-tier.mjs", "// fixture tier classifier\n");
writeFile("index.html", "<!doctype html><title>TPI</title>\n");
writeFile("styles.css", ":root { --tpi: #222; }\n");
writeFile("studio/index.html", "<!doctype html><title>Studio</title>\n");
writeFile(".gitignore", ".local-dev/\n");

// StudioFlow provenance fixture: an approved StudioFlow repository whose commit
// produced the staged bundle, and a baseline pinning that commit and bundle.
const sfFixture = join(sandbox, "studioflow-approved");
mkdirSync(sfFixture, { recursive: true });
execFileSync("git", ["init", "-q", sfFixture]);
writeFileSync(join(sfFixture, "app.txt"), "approved\n");
execFileSync("git", ["-C", sfFixture, "add", "-A"]);
execFileSync("git", ["-c", "user.email=ops005@tpi.invalid", "-c", "user.name=TPI OPS-005", "-C", sfFixture, "commit", "-q", "-m", "approved"]);
const sfApproved = execFileSync("git", ["-C", sfFixture, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const sfJs = "console.log('approved bundle');\n";
const sfCss = ".approved{color:#000}\n";
writeFile("studio/assets/index-approved.js", sfJs);
writeFile("studio/assets/index-approved.css", sfCss);
writeFile("studio/index.html", '<script src="./assets/index-approved.js"></script><link href="./assets/index-approved.css">');
writeFile("scripts/studioflow-release-baseline.json", JSON.stringify({
  productionSchemaRequirements: { requiredTables: ["studio_notes"] },
  source: { approvedCommit: sfApproved },
  expectedAssets: {
    javaScript: { name: "index-approved.js", sha256: createHash("sha256").update(sfJs).digest("hex") },
    css: { name: "index-approved.css", sha256: createHash("sha256").update(sfCss).digest("hex") },
  },
}, null, 2) + "\n");

const baseCommit = commit("fixture release base");
console.log(`fixture repository: ${repo}\ntier base commit:   ${baseCommit}\n`);

const TIER = { level: 1, label: "FULL / HIGH RISK", reasons: ["fixture"], baseCommit, baseSource: "explicit", requiredGateSet: "full" };

/** Stage a candidate from the current repository state and certify it. */
function stageAndCertify() {
  prepareCandidateDirectory(candidateRoot);
  cpSync(join(repo, "worker.js"), join(candidateRoot, "worker", "worker.js"));
  cpSync(join(repo, "lib"), join(candidateRoot, "worker", "lib"), { recursive: true });
  cpSync(join(repo, "functions"), join(candidateRoot, "worker", "functions"), { recursive: true });
  cpSync(join(repo, "wrangler.toml"), join(candidateRoot, "source", "wrangler.toml"));
  for (const name of ["index.html", "styles.css"]) cpSync(join(repo, name), join(candidateRoot, "assets", name));
  mkdirSync(join(candidateRoot, "assets", "studio"), { recursive: true });
  cpSync(join(repo, "studio/index.html"), join(candidateRoot, "assets", "studio", "index.html"));
  const source = collectSourceIdentity(repo, { branch: BRANCH, studioFlowRoot: sfFixture });
  const manifest = buildManifest({
    candidateRoot,
    source,
    tier: TIER,
    gates: [{ name: "fixture gate", status: "pass", durationMs: 1 }],
    schema: { database: "tpi_contributor_portal", requiredTables: ["studio_notes"], migrations: [] },
    build: { command: "fixture", nodeVersion: process.version, candidateRoot: ".local-dev/release-candidate", assetsDirectory: "assets", workerDirectory: "worker" },
    certificationMs: 1,
  });
  writeCertification(candidateRoot, manifest);
  return manifest;
}
const verify = () => verifyCertification({ repoRoot: repo, candidateRoot, studioFlowRoot: sfFixture });

let manifest = stageAndCertify();

// ---------------------------------------------------------------------------
// 1. A valid candidate certifies and verifies.
// ---------------------------------------------------------------------------
expectAccepted("valid candidate verifies", verify);
record(
  "certification records every deployable file",
  manifest.deployable.assets.length === 3 && manifest.deployable.worker.length === 3 && manifest.deployable.configuration.length === 1 ? "PASS" : "FAIL",
  `assets=${manifest.deployable.assets.length} worker=${manifest.deployable.worker.length} configuration=${manifest.deployable.configuration.length}`,
);
record(
  "certification status is CERTIFIED with a sealed digest",
  manifest.status === "CERTIFIED" && /^[0-9a-f]{64}$/.test(manifest.manifestDigest) ? "PASS" : "FAIL",
  `status=${manifest.status} digest=${manifest.manifestDigest}`,
);

// Verification is normally called without an explicit StudioFlow root, so it
// must resolve the same lockfile certification used. Reading the raw parameter
// instead refused a valid certification, so this is a permanent assertion.
{
  const previous = process.env.STUDIOFLOW_ROOT;
  process.env.STUDIOFLOW_ROOT = repo;
  try {
    expectAccepted("verification resolves the StudioFlow root the way certification did", () => verifyCertification({ repoRoot: repo, candidateRoot, studioFlowRoot: sfFixture }));
  } finally {
    if (previous === undefined) delete process.env.STUDIOFLOW_ROOT;
    else process.env.STUDIOFLOW_ROOT = previous;
  }
}

// ---------------------------------------------------------------------------
// 2. Canonical digest is deterministic across key order.
// ---------------------------------------------------------------------------
const reordered = Object.fromEntries(Object.entries(manifest).reverse());
record("manifest digest is canonical and key-order independent", computeManifestDigest(manifest) === computeManifestDigest(reordered) ? "PASS" : "FAIL");

// ---------------------------------------------------------------------------
// 3. Deployable bytes are bound to the certification.
// ---------------------------------------------------------------------------
const assetFile = join(candidateRoot, "assets", "styles.css");
const originalCss = readFileSync(assetFile, "utf8");

appendFileSync(assetFile, "/* tampered */\n");
expectRefusal("modified certified CSS asset is refused", "ASSET_MUTATED", verify);
writeFileSync(assetFile, originalCss);
expectAccepted("restoring the exact CSS bytes restores certification", verify);

const jsAsset = join(candidateRoot, "assets", "studio", "index.html");
const originalHtml = readFileSync(jsAsset, "utf8");
appendFileSync(jsAsset, "<!-- tampered -->\n");
expectRefusal("modified certified HTML is refused", "ASSET_MUTATED", verify);
writeFileSync(jsAsset, originalHtml);

const extraFile = join(candidateRoot, "assets", "unmanifested.css");
writeFileSync(extraFile, "body { color: red; }\n");
expectRefusal("extra unmanifested deployable file is refused", "ASSET_EXTRA", verify);
unlinkSync(extraFile);
expectAccepted("removing the unmanifested file restores certification", verify);

renameSync(assetFile, `${assetFile}.hidden`);
expectRefusal("missing candidate file is refused", "ASSET_MISSING", verify);
renameSync(`${assetFile}.hidden`, assetFile);
expectAccepted("restoring the missing file restores certification", verify);

const workerFile = join(candidateRoot, "worker", "lib", "auth.js");
const originalWorker = readFileSync(workerFile, "utf8");
writeFileSync(workerFile, "export function getSessionUser() { return { admin: true }; }\n");
expectRefusal("modified certified Worker source is refused", "WORKER_SOURCE_MUTATED", verify);
writeFileSync(workerFile, originalWorker);

const configFile = join(candidateRoot, "source", "wrangler.toml");
const originalConfig = readFileSync(configFile, "utf8");
writeFileSync(configFile, originalConfig.replace("theparanormalinitiative", "theparanormalinitiative-dev"));
expectRefusal("modified certified release configuration is refused", "CONFIGURATION_MUTATED", verify);
writeFileSync(configFile, originalConfig);
expectAccepted("restoring the exact configuration restores certification", verify);

// ---------------------------------------------------------------------------
// 4. The manifest itself cannot be edited.
// ---------------------------------------------------------------------------
function reSeal(mutate) {
  const parsed = readCertification(candidateRoot).manifest;
  mutate(parsed);
  parsed.manifestDigest = computeManifestDigest(parsed);
  writeCertification(candidateRoot, parsed);
}
function rawEdit(mutate) {
  const parsed = readCertification(candidateRoot).manifest;
  mutate(parsed);
  writeCertification(candidateRoot, parsed);
}

// Each destructive manifest edit starts from a freshly certified candidate so
// one tamper cannot contaminate the next assertion.
const freshManifest = () => { const next = stageAndCertify(); expectAccepted("candidate re-certifies before the next tamper", verify); return next; };

rawEdit((parsed) => { parsed.manifestDigest = "0".repeat(64); });
expectRefusal("wrong manifest digest is refused", "MANIFEST_DIGEST_MISMATCH", verify);

freshManifest();
rawEdit((parsed) => { parsed.status = "DRAFT"; });
expectRefusal("a manifest that is not CERTIFIED is refused", "NOT_CERTIFIED", verify);

freshManifest();
rawEdit((parsed) => { delete parsed.deployable; });
expectRefusal("a manifest with a missing required field is refused", "MISSING_FIELD", verify);

freshManifest();
rawEdit((parsed) => { parsed.schemaVersion = 99; });
expectRefusal("an unsupported manifest schema version is refused", "UNSUPPORTED_SCHEMA", verify);

// A re-sealed manifest can only pass if the file hashes still agree with it.
freshManifest();
reSeal((parsed) => { parsed.deployable.assets[0].sha256 = "f".repeat(64); });
expectRefusal("re-sealed manifest with a wrong asset hash is refused", "ASSET_MUTATED", verify);

manifest = freshManifest();

// ---------------------------------------------------------------------------
// 5. Source identity is bound to the certification.
// ---------------------------------------------------------------------------
writeFileSync(join(repo, "notes.md"), "fixture\n");
expectRefusal("a dirty tracked tree is refused", "DIRTY_TREE", verify);
unlinkSync(join(repo, "notes.md"));

writeFileSync(join(repo, ".local-dev", "scratch.txt"), "ignored local state\n");
expectAccepted("ignored .local-dev state does not invalidate certification", verify);
unlinkSync(join(repo, ".local-dev", "scratch.txt"));

git(["checkout", "-b", "scratch-branch"]);
expectRefusal("a wrong branch is refused", "BRANCH_MISMATCH", verify);
git(["checkout", BRANCH]);

const toolingPath = join(repo, "scripts", "release-certification.mjs");
const originalTooling = readFileSync(toolingPath, "utf8");
writeFileSync(toolingPath, originalTooling + "// release tooling changed\n");
expectRefusal("release tooling modification requires recertification", "DIRTY_TREE", verify);
writeFileSync(toolingPath, originalTooling);
expectAccepted("restoring the exact release tooling restores certification", verify);

const driftCommit = (() => {
  writeFileSync(toolingPath, originalTooling + "// released tooling change\n");
  const sha = commit("change release tooling");
  writeFileSync(toolingPath, originalTooling);
  git(["checkout", "--", "scripts/release-certification.mjs"]);
  return sha;
})();
expectRefusal("source drift after certification is refused", "SOURCE_COMMIT_MISMATCH", verify);

// Simulate a manifest that claims the new commit but still carries the old
// tooling hashes: the exact tamper the tooling hash exists to catch.
{
  prepareCandidateDirectory(candidateRoot);
  stageAndCertify();
  const parsed = readCertification(candidateRoot).manifest;
  parsed.source.websiteCommit = driftCommit;
  parsed.source.remoteCommit = driftCommit;
  parsed.source.releaseTooling = manifest.source.releaseTooling;
  parsed.manifestDigest = computeManifestDigest(parsed);
  writeCertification(candidateRoot, parsed);
  expectRefusal("release tooling change with source identity rewritten is refused", "RELEASE_TOOLING_MISMATCH", verify);
}

// Restore a consistent state: revert the drift commit on the remote and locally.
git(["reset", "--hard", baseCommit]);
git(["push", "--force", "origin", `HEAD:refs/heads/${BRANCH}`]);
git(["fetch", "origin"]);
manifest = stageAndCertify();
expectAccepted("certification verifies after the source is restored", verify);

// Remote ahead, local unchanged => parity loss only.
const otherClone = join(sandbox, "other");
execFileSync("git", ["clone", "--branch", BRANCH, remote, otherClone], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
execFileSync("git", ["-c", "user.email=ops005@tpi.invalid", "-c", "user.name=TPI OPS-005", "commit", "--allow-empty", "-m", "remote only"], { cwd: otherClone, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
execFileSync("git", ["push", "origin", `HEAD:refs/heads/${BRANCH}`], { cwd: otherClone, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
expectRefusal("upstream/GitHub parity loss is refused", "REMOTE_PARITY_MISMATCH", verify);
execFileSync("git", ["push", "--force", "origin", `${baseCommit}:refs/heads/${BRANCH}`], { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
expectAccepted("certification verifies once parity is exact again", verify);

// ---------------------------------------------------------------------------
// 6. A dependency lock change requires recertification.
// ---------------------------------------------------------------------------
writeFileSync(join(repo, "package-lock.json"), JSON.stringify({ lockfileVersion: 3, packages: { injected: {} } }, null, 2) + "\n");
commit("dependency lock change");
expectRefusal("dependency-lock modification requires recertification", "SOURCE_COMMIT_MISMATCH", verify);
git(["reset", "--hard", baseCommit]);
git(["push", "--force", "origin", `HEAD:refs/heads/${BRANCH}`]);
manifest = stageAndCertify();
expectAccepted("certification verifies after the lockfile is restored", verify);

// ---------------------------------------------------------------------------
// 7. Release tiers fail closed and cannot be lowered by request.
// ---------------------------------------------------------------------------
const head = git(["rev-parse", "HEAD"]);
expectRefusal(
  "requesting a lower tier than the diff allows is refused",
  "TIER_DOWNGRADE_REFUSED",
  () => {
    writeFileSync(join(repo, "worker.js"), readFileSync(join(repo, "worker.js"), "utf8") + "// behaviour change\n");
    commit("protected change");
    try {
      classifyReleaseTier({ repoRoot: repo, head: git(["rev-parse", "HEAD"]), explicitBase: baseCommit, requestedTier: 3 });
    } finally {
      git(["reset", "--hard", baseCommit]);
      git(["push", "--force", "origin", `HEAD:refs/heads/${BRANCH}`]);
    }
  },
);

function tierFor(changeDescription, applyChange) {
  applyChange();
  const sha = commit(changeDescription);
  try {
    return classifyReleaseTier({ repoRoot: repo, head: sha, explicitBase: baseCommit });
  } finally {
    git(["reset", "--hard", baseCommit]);
    git(["push", "--force", "origin", `HEAD:refs/heads/${BRANCH}`]);
  }
}

const protectedTier = tierFor("worker.js change", () => writeFileSync(join(repo, "worker.js"), readFileSync(join(repo, "worker.js"), "utf8") + "// x\n"));
record(`protected application change classifies as Tier 1 (got ${protectedTier.level})`, protectedTier.level === 1 ? "PASS" : "FAIL", JSON.stringify(protectedTier.reasons));

const toolingTier = tierFor("release tooling change", () => writeFileSync(join(repo, "scripts", "tpi-release.mjs"), "// changed\n"));
record(`release-tooling change classifies as Tier 1 (got ${toolingTier.level})`, toolingTier.level === 1 ? "PASS" : "FAIL", JSON.stringify(toolingTier.reasons));

const cssTier = tierFor("stylesheet-only change", () => writeFileSync(join(repo, "styles.css"), ":root { --tpi: #333; }\n"));
record(`stylesheet-only change with identical JavaScript classifies as Tier 3 (got ${cssTier.level})`, cssTier.level === 3 ? "PASS" : "FAIL", JSON.stringify(cssTier.reasons));

const htmlTier = tierFor("presentation plus HTML change", () => {
  writeFileSync(join(repo, "styles.css"), ":root { --tpi: #444; }\n");
  writeFileSync(join(repo, "studio/index.html"), "<!doctype html><title>Studio 2</title>\n");
});
record(`a change that also touches HTML escalates to Tier 2 (got ${htmlTier.level})`, htmlTier.level === 2 ? "PASS" : "FAIL", JSON.stringify(htmlTier.reasons));

const ambiguousTier = classifyReleaseTier({ repoRoot: repo, head, explicitBase: "0000000000000000000000000000000000000000" });
record(`an unresolvable classification base escalates to Tier 1 (got ${ambiguousTier.level})`, ambiguousTier.level === 1 ? "PASS" : "FAIL", JSON.stringify(ambiguousTier.reasons));

// ---------------------------------------------------------------------------
// StudioFlow provenance (TPI-NOVA-004R6D0D). The certified StudioFlow source is
// the baseline's approved commit, never the working copy's HEAD, and a staged
// bundle that does not match the baseline must refuse the seal.
// ---------------------------------------------------------------------------
const approvedSfCommit = sfApproved;
const baselineFile = join(repo, "scripts", "studioflow-release-baseline.json");
const pristineBaseline = readFileSync(baselineFile, "utf8");
const pristineStaged = { js: readFileSync(join(repo, "studio/assets/index-approved.js"), "utf8"), css: readFileSync(join(repo, "studio/assets/index-approved.css"), "utf8") };

// A dirty, unrelated StudioFlow working copy whose HEAD is a different commit.
writeFileSync(join(sfFixture, "app.txt"), "dirty unrelated work\n");
execFileSync("git", ["-C", sfFixture, "add", "-A"]);
execFileSync("git", ["-c", "user.email=ops005@tpi.invalid", "-c", "user.name=TPI OPS-005", "-C", sfFixture, "commit", "-q", "-m", "unrelated working copy"]);
const unrelatedHead = execFileSync("git", ["-C", sfFixture, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
record("fixture working-copy HEAD differs from the approved commit", unrelatedHead !== approvedSfCommit ? "PASS" : "FAIL");

const provenanceSource = collectSourceIdentity(repo, { branch: BRANCH, studioFlowRoot: sfFixture });
record(
  "certified provenance records the baseline approved commit, not the working-copy HEAD",
  provenanceSource.studioflowCommit === approvedSfCommit && provenanceSource.studioflowWorkingTreeHead === unrelatedHead ? "PASS" : "FAIL",
  `studioflowCommit=${provenanceSource.studioflowCommit} workingTreeHead=${provenanceSource.studioflowWorkingTreeHead}`,
);

expectRefusal("a staged JavaScript bundle that differs from the baseline is refused", "STUDIOFLOW_ASSET_MISMATCH", () => {
  writeFileSync(join(repo, "studio/assets/index-approved.js"), "console.log('tampered');\n");
  try { approvedStudioflowCommit(repo, sfFixture, gitCwdFirst); } finally { writeFileSync(join(repo, "studio/assets/index-approved.js"), pristineStaged.js); }
});
expectRefusal("a staged CSS bundle that differs from the baseline is refused", "STUDIOFLOW_ASSET_MISMATCH", () => {
  writeFileSync(join(repo, "studio/assets/index-approved.css"), ".tampered{}\n");
  try { approvedStudioflowCommit(repo, sfFixture, gitCwdFirst); } finally { writeFileSync(join(repo, "studio/assets/index-approved.css"), pristineStaged.css); }
});
expectRefusal("an approved commit absent from the StudioFlow repository is refused", "STUDIOFLOW_COMMIT_UNAVAILABLE", () => {
  writeFileSync(baselineFile, pristineBaseline.replace(approvedSfCommit, "1111111111111111111111111111111111111111"));
  try { approvedStudioflowCommit(repo, sfFixture, gitCwdFirst); } finally { writeFileSync(baselineFile, pristineBaseline); }
});
expectAccepted("matching baseline assets and approved commit are accepted", () => {
  if (approvedStudioflowCommit(repo, sfFixture, gitCwdFirst) !== approvedSfCommit) throw new Error("approved commit not returned");
});

// ---------------------------------------------------------------------------
rmSync(sandbox, { recursive: true, force: true });

const summary = { status: failures === 0 ? "PASS" : "FAIL", assertions: results.length, failed: failures, results };
console.log("\n" + JSON.stringify(summary, null, 2));
process.exit(failures === 0 ? 0 : 1);

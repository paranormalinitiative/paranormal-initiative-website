#!/usr/bin/env node

// TPI-OPS-005 — certified immutable release candidate library.
//
// The release guarantee is: the bytes Cloudflare receives are exactly the bytes
// that passed certification. This module is the single source of truth for that
// proof. It never deploys, never writes outside the candidate directory, and
// never touches the network.
//
// Certification binds three kinds of evidence to one release ID:
//
//   1. source identity   - website commit, branch, GitHub parity, StudioFlow
//                          commit, dependency locks, release tooling bytes;
//   2. deployable bytes  - SHA-256 for every static asset, every Worker source
//                          file and the release configuration;
//   3. gate results      - the exact gates that passed against those bytes.
//
// A certification file is only ever produced after every gate passed. Anything
// that cannot be proven refuses with a stable reason code so callers, tests and
// operators can tell exactly which property was lost.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";

export const SCHEMA_VERSION = 1;
export const CANDIDATE_DIRECTORY = join(".local-dev", "release-candidate");
export const CERTIFICATION_FILENAME = "release-certification.json";
export const CANDIDATE_ASSETS_DIRECTORY = "assets";
export const CANDIDATE_WORKER_DIRECTORY = "worker";
export const CANDIDATE_CONFIGURATION_DIRECTORY = "source";

// Files whose bytes define how a release is produced. A change to any of them
// invalidates every existing certification: the release system protects itself
// (TPI-OPS-005 section 23).
const RELEASE_TOOLING_FILES = [
  "scripts/tpi-release.mjs",
  "scripts/deploy-production-guarded.mjs",
  "scripts/release-certification.mjs",
  "scripts/release-tier.mjs",
  "scripts/studioflow-release-baseline.json",
  "package.json",
  ".assetsignore",
];
const RELEASE_CONFIGURATION_FILES = ["wrangler.toml"];
const DEPENDENCY_LOCK_FILES = ["package-lock.json"];

export class CertificationError extends Error {
  constructor(code, message, detail = {}) {
    super(`${code}: ${message}`);
    this.name = "CertificationError";
    this.code = code;
    this.reason = message;
    this.detail = detail;
  }
}
function refuse(code, message, detail) {
  throw new CertificationError(code, message, detail);
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
export function sha256File(path) {
  return sha256(readFileSync(path));
}

/** Sorted, symlink-free list of regular files below `root`, relative to it. */
export function listFiles(root) {
  if (!existsSync(root)) refuse("MISSING_DIRECTORY", `directory is missing: ${root}`, { root });
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      // A symlink cannot be hashed into a stable manifest and could make the
      // deployed bytes differ from the certified bytes, so it always refuses.
      if (lstatSync(path).isSymbolicLink()) refuse("SYMLINK_IN_CANDIDATE", `symbolic link is not allowed in a candidate: ${relative(root, path)}`, { path });
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(relative(root, path).split(sep).join("/"));
    }
  };
  visit(root);
  return files.sort();
}

/** Deterministic byte+hash manifest for an entire tree. */
export function hashTree(root) {
  return listFiles(root).map((path) => {
    const absolute = join(root, path);
    return { path, bytes: statSync(absolute).size, sha256: sha256File(absolute) };
  });
}

/** Deterministic JSON: object keys sorted, array order preserved. */
export function canonicalize(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const sorted = {};
  for (const key of Object.keys(value).sort()) sorted[key] = canonicalize(value[key]);
  return sorted;
}
export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

/**
 * Digest of the certification content itself.
 * The digest field is excluded so the manifest can carry its own proof.
 */
export function computeManifestDigest(manifest) {
  const { manifestDigest: _ignored, ...body } = manifest;
  return sha256(Buffer.from(canonicalJson(body), "utf8"));
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }).trim();
}

/** Hash a fixed file list, recording each file so a diff names the changed tool. */
export function hashFileList(repoRoot, paths) {
  const present = [];
  const missing = [];
  for (const path of paths) {
    const absolute = join(repoRoot, path);
    if (!existsSync(absolute)) missing.push(path);
    else present.push({ path, bytes: statSync(absolute).size, sha256: sha256File(absolute) });
  }
  return { files: present, missing, sha256: sha256(Buffer.from(present.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"), "utf8")) };
}

/** Everything the release must re-prove immediately before deploying. */
export function collectSourceIdentity(repoRoot, { branch, studioFlowRoot, gitRunner = git } = {}) {
  const websiteCommit = gitRunner(repoRoot, ["rev-parse", "HEAD"]);
  const currentBranch = branch || gitRunner(repoRoot, ["branch", "--show-current"]);
  const status = gitRunner(repoRoot, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const remote = (gitRunner(repoRoot, ["ls-remote", "origin", `refs/heads/${currentBranch}`]).split(/\s+/)[0] || "");
  const studioflowRoot = studioFlowRoot || process.env.STUDIOFLOW_ROOT || "/Users/toddknipple/Documents/StudioFlow/web";
  let studioflowCommit = null;
  try {
    studioflowCommit = existsSync(join(studioflowRoot, ".git")) ? gitRunner(studioflowRoot, ["rev-parse", "HEAD"]) : null;
  } catch {
    studioflowCommit = null;
  }
  return {
    websiteCommit,
    branch: currentBranch,
    cleanTree: status === "",
    changedFiles: status ? status.split("\n").filter(Boolean).map((line) => line.slice(3)) : [],
    remoteCommit: remote,
    remoteParity: remote && remote === websiteCommit ? "exact" : remote ? "diverged" : "missing",
    studioflowCommit,
    dependencyLock: hashFileList(repoRoot, DEPENDENCY_LOCK_FILES),
    studioflowLock: studioFlowRoot ? hashFileList(studioflowRoot, ["package-lock.json"]) : null,
    releaseTooling: hashFileList(repoRoot, RELEASE_TOOLING_FILES),
    releaseConfiguration: hashFileList(repoRoot, RELEASE_CONFIGURATION_FILES),
  };
}

/**
 * Survives `git status` noise that cannot affect a release.
 * The candidate directory and release state live in `.local-dev`, which is
 * ignored and never published, so they must not invalidate a certification.
 */
export function protectedChangedFiles(changedFiles) {
  return changedFiles.filter((path) => !/^(?:\.local-dev|\.wrangler|node_modules)\//.test(path));
}

/** Deterministic release ID: source commit plus deployable content. */
export function computeReleaseId(sourceCommit, deployable) {
  const contentSha = sha256(Buffer.from(canonicalJson(deployable), "utf8"));
  return `rel-${sourceCommit.slice(0, 12)}-${contentSha.slice(0, 12)}`;
}

export function certificationPath(candidateRoot) {
  return join(candidateRoot, CERTIFICATION_FILENAME);
}

/** Reset a candidate directory so no stale byte from a previous build survives. */
export function prepareCandidateDirectory(candidateRoot) {
  rmSync(candidateRoot, { recursive: true, force: true });
  for (const directory of [CANDIDATE_ASSETS_DIRECTORY, CANDIDATE_WORKER_DIRECTORY, CANDIDATE_CONFIGURATION_DIRECTORY]) {
    mkdirSync(join(candidateRoot, directory), { recursive: true });
  }
  return candidateRoot;
}

/**
 * Build the immutable manifest for a staged candidate and record the gates.
 * Refuses unless every recorded gate passed.
 */
export function buildManifest({ candidateRoot, source, tier, gates, schema, build, certificationMs }) {
  const failed = gates.filter((gate) => gate.status !== "pass");
  if (failed.length) refuse("GATES_NOT_PASSED", `certification requires every gate to pass; failed: ${failed.map((gate) => gate.name).join(", ")}`, { failed });
  const assets = hashTree(join(candidateRoot, CANDIDATE_ASSETS_DIRECTORY));
  const worker = hashTree(join(candidateRoot, CANDIDATE_WORKER_DIRECTORY));
  const configuration = hashTree(join(candidateRoot, CANDIDATE_CONFIGURATION_DIRECTORY));
  if (!assets.length) refuse("EMPTY_CANDIDATE", "candidate contains no deployable assets");
  if (!worker.some((entry) => entry.path === "worker.js")) refuse("MISSING_WORKER_ENTRY", "candidate does not contain worker.js");
  if (!configuration.some((entry) => entry.path === "wrangler.toml")) refuse("MISSING_RELEASE_CONFIGURATION", "candidate does not contain the release configuration");
  const deployable = { assets, worker, configuration };
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    releaseId: computeReleaseId(source.websiteCommit, deployable),
    status: "CERTIFIED",
    tier,
    certifiedAt: new Date().toISOString(),
    certificationMs,
    source,
    build,
    deployable,
    gates,
    schema,
  };
  manifest.manifestDigest = computeManifestDigest(manifest);
  return manifest;
}

export function writeCertification(candidateRoot, manifest) {
  const path = certificationPath(candidateRoot);
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o644 });
  return path;
}

export function readCertification(candidateRoot) {
  const path = certificationPath(candidateRoot);
  if (!existsSync(path)) refuse("MISSING_CERTIFICATION", `no certification exists at ${path}; run npm run release:certify`);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    refuse("MALFORMED_CERTIFICATION", `certification is not valid JSON: ${error.message}`);
  }
  return { manifest: parsed, path };
}

const REQUIRED_SOURCE_FIELDS = ["websiteCommit", "branch", "remoteParity", "dependencyLock", "releaseTooling", "releaseConfiguration"];
const REQUIRED_BUILD_FIELDS = ["command", "nodeVersion", "candidateRoot"];
const REQUIRED_DEPLOYABLE_FIELDS = ["assets", "worker", "configuration"];

function compareTree(candidateRoot, directory, expected, codePrefix) {
  const actual = hashTree(join(candidateRoot, directory));
  const expectedByPath = new Map(expected.map((entry) => [entry.path, entry]));
  const actualByPath = new Map(actual.map((entry) => [entry.path, entry]));
  const missing = [...expectedByPath.keys()].filter((path) => !actualByPath.has(path));
  const extra = [...actualByPath.keys()].filter((path) => !expectedByPath.has(path));
  const mutated = [];
  for (const [path, entry] of expectedByPath) {
    const found = actualByPath.get(path);
    if (found && (found.sha256 !== entry.sha256 || found.bytes !== entry.bytes)) mutated.push({ path, expected: entry.sha256, actual: found.sha256 });
  }
  if (missing.length) refuse(`${codePrefix}_MISSING`, `certified file is missing from the candidate: ${missing.join(", ")}`, { missing });
  if (extra.length) refuse(`${codePrefix}_EXTRA`, `candidate contains a file that was never certified: ${extra.join(", ")}`, { extra });
  if (mutated.length) refuse(`${codePrefix}_MUTATED`, `certified file bytes changed: ${mutated.map((entry) => entry.path).join(", ")}`, { mutated });
  return actual.length;
}

/**
 * Verify a certification against the candidate and the current source state.
 *
 * Every property is re-proven here. Nothing is inferred from a timestamp. If
 * any property cannot be established the release refuses.
 */
export function verifyCertification({ repoRoot, candidateRoot, gitRunner = git, studioFlowRoot = null }) {
  const { manifest, path } = readCertification(candidateRoot);
  const problems = [];

  if (manifest.schemaVersion !== SCHEMA_VERSION) refuse("UNSUPPORTED_SCHEMA", `certification schemaVersion ${manifest.schemaVersion} is not supported (expected ${SCHEMA_VERSION})`);
  if (manifest.status !== "CERTIFIED") refuse("NOT_CERTIFIED", `certification status is ${manifest.status}, not CERTIFIED`);
  for (const field of ["releaseId", "tier", "certifiedAt", "source", "build", "deployable", "gates", "schema", "manifestDigest"]) {
    if (manifest[field] === undefined || manifest[field] === null) problems.push(field);
  }
  for (const field of REQUIRED_SOURCE_FIELDS) if (manifest.source?.[field] === undefined) problems.push(`source.${field}`);
  for (const field of REQUIRED_BUILD_FIELDS) if (manifest.build?.[field] === undefined) problems.push(`build.${field}`);
  for (const field of REQUIRED_DEPLOYABLE_FIELDS) if (!Array.isArray(manifest.deployable?.[field])) problems.push(`deployable.${field}`);
  if (problems.length) refuse("MISSING_FIELD", `certification is missing required fields: ${problems.join(", ")}`, { problems });

  const recomputed = computeManifestDigest(manifest);
  if (recomputed !== manifest.manifestDigest) {
    refuse("MANIFEST_DIGEST_MISMATCH", `certification digest does not match its content (recorded ${manifest.manifestDigest}, computed ${recomputed})`, { recorded: manifest.manifestDigest, computed: recomputed });
  }

  // --- deployable bytes -----------------------------------------------------
  const assetCount = compareTree(candidateRoot, CANDIDATE_ASSETS_DIRECTORY, manifest.deployable.assets, "ASSET");
  const workerCount = compareTree(candidateRoot, CANDIDATE_WORKER_DIRECTORY, manifest.deployable.worker, "WORKER_SOURCE");
  const configurationCount = compareTree(candidateRoot, CANDIDATE_CONFIGURATION_DIRECTORY, manifest.deployable.configuration, "CONFIGURATION");

  // --- source identity ------------------------------------------------------
  // Read the real branch, never the certified one: forcing it would make the
  // branch check unable to fail.
  const current = collectSourceIdentity(repoRoot, { gitRunner, studioFlowRoot });
  if (current.websiteCommit !== manifest.source.websiteCommit) {
    refuse("SOURCE_COMMIT_MISMATCH", `certified candidate was built from ${manifest.source.websiteCommit} but the repository is at ${current.websiteCommit}; recertify`, { certified: manifest.source.websiteCommit, current: current.websiteCommit });
  }
  if (current.branch !== manifest.source.branch) {
    refuse("BRANCH_MISMATCH", `certified branch is ${manifest.source.branch} but the repository is on ${current.branch}`, { certified: manifest.source.branch, current: current.branch });
  }
  const dirty = protectedChangedFiles(current.changedFiles);
  if (dirty.length) refuse("DIRTY_TREE", `working tree is not clean: ${dirty.join(", ")}`, { changedFiles: dirty });
  if (current.remoteParity !== "exact") {
    refuse("REMOTE_PARITY_MISMATCH", `local HEAD ${current.websiteCommit} does not match origin/${manifest.source.branch} ${current.remoteCommit || "missing"}`, { local: current.websiteCommit, remote: current.remoteCommit });
  }
  if ((current.studioflowCommit || null) !== (manifest.source.studioflowCommit || null)) {
    refuse("STUDIOFLOW_HEAD_MISMATCH", `certified StudioFlow source is ${manifest.source.studioflowCommit || "unavailable"} but the working copy is ${current.studioflowCommit || "unavailable"}; recertify`, { certified: manifest.source.studioflowCommit, current: current.studioflowCommit });
  }
  if (JSON.stringify(current.dependencyLock.files) !== JSON.stringify(manifest.source.dependencyLock.files)) {
    refuse("DEPENDENCY_LOCK_MISMATCH", "dependency lockfiles changed since certification; recertify", { certified: manifest.source.dependencyLock.sha256, current: current.dependencyLock.sha256 });
  }
  if (JSON.stringify(current.studioflowLock?.files || []) !== JSON.stringify(manifest.source.studioflowLock?.files || [])) {
    refuse("STUDIOFLOW_LOCK_MISMATCH", "StudioFlow dependency lockfiles changed since certification; recertify", { certified: manifest.source.studioflowLock?.sha256, current: current.studioflowLock?.sha256 });
  }
  if (JSON.stringify(current.releaseTooling.files) !== JSON.stringify(manifest.source.releaseTooling.files)) {
    const changed = compareFileLists(manifest.source.releaseTooling.files, current.releaseTooling.files);
    refuse("RELEASE_TOOLING_MISMATCH", `release tooling changed since certification (${changed.join(", ")}); recertify`, { changed });
  }
  if (JSON.stringify(current.releaseConfiguration.files) !== JSON.stringify(manifest.source.releaseConfiguration.files)) {
    const changed = compareFileLists(manifest.source.releaseConfiguration.files, current.releaseConfiguration.files);
    refuse("RELEASE_CONFIGURATION_MISMATCH", `release configuration changed since certification (${changed.join(", ")}); recertify`, { changed });
  }
  if (!manifest.schema || !Array.isArray(manifest.schema.requiredTables)) {
    refuse("SCHEMA_CONTRACT_MISMATCH", "certification does not record a production schema contract");
  }

  return {
    manifest,
    path,
    counts: { assets: assetCount, workerSource: workerCount, configuration: configurationCount },
    releaseId: manifest.releaseId,
    tier: manifest.tier,
  };
}

export function compareFileLists(left, right) {
  const leftByPath = new Map(left.map((entry) => [entry.path, entry.sha256]));
  const rightByPath = new Map(right.map((entry) => [entry.path, entry.sha256]));
  const changed = [];
  for (const [path, digest] of leftByPath) {
    if (rightByPath.get(path) !== digest) changed.push(path);
  }
  for (const path of rightByPath.keys()) if (!leftByPath.has(path)) changed.push(path);
  return [...new Set(changed)].sort();
}

/** Human-readable summary used by both the certifier and the deployer. */
export function describeCertification(manifest) {
  const assets = manifest.deployable.assets;
  const bytes = assets.reduce((sum, entry) => sum + entry.bytes, 0);
  return {
    releaseId: manifest.releaseId,
    status: manifest.status,
    tier: manifest.tier?.level ? `Tier ${manifest.tier.level} — ${manifest.tier.label}` : manifest.tier,
    sourceCommit: manifest.source.websiteCommit,
    studioflowCommit: manifest.source.studioflowCommit,
    certifiedAt: manifest.certifiedAt,
    deployableAssets: assets.length,
    deployableAssetBytes: bytes,
    workerSourceFiles: manifest.deployable.worker.length,
    gatesPassed: manifest.gates.length,
    manifestDigest: manifest.manifestDigest,
    candidateRoot: manifest.build.candidateRoot,
  };
}

export function resolveCandidateRoot(repoRoot) {
  return resolve(repoRoot, CANDIDATE_DIRECTORY);
}

export { RELEASE_TOOLING_FILES, RELEASE_CONFIGURATION_FILES, DEPENDENCY_LOCK_FILES };

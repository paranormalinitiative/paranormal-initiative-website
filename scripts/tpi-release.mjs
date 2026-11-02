#!/usr/bin/env node

// TPI permanent local-to-production release workflow.
//
// Modes:
//   auth-lifecycle  Verify local_admin before/after a managed Worker restart
//                   and StudioFlow rebuild, then run isolated Firefox acceptance.
//   certify         Run every release gate once, stage one immutable candidate,
//                   and write a cryptographically bound certification for it.
//   preflight       Alias for `certify`, kept because the maintained runbook and
//                   older records name it. It now certifies; it no longer leaves
//                   production to repeat the same suite.
//   deploy          Verify the existing certification and deploy those exact
//                   bytes, run live smoke and isolated Firefox acceptance, and
//                   roll back on failure. It does not recertify.
//
// TPI-OPS-005: the release is proven once. `deploy` reuses a certification only
// when every immutable property still matches - source commit, branch, GitHub
// parity, StudioFlow source, dependency locks, release tooling, release
// configuration, the manifest digest and every deployable file hash. Anything
// that cannot be re-proven refuses and requires `npm run release:certify`.
//
// Deployment requires TPI_PRODUCTION_DEPLOY=approved. No migration command is
// present in this workflow and the disposable E2E service cannot use port 8787
// or .local-dev/state.

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  buildManifest,
  collectSourceIdentity,
  computeManifestDigest,
  describeCertification,
  prepareCandidateDirectory,
  resolveCandidateRoot,
  verifyCertification,
  writeCertification,
} from "./release-certification.mjs";
import { classifyReleaseTier, previousCertifiedCommit } from "./release-tier.mjs";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const studioFlowRoot = process.env.STUDIOFLOW_ROOT || "/Users/toddknipple/Documents/StudioFlow/web";
const wrangler = process.env.TPI_WRANGLER_BIN || "/opt/homebrew/bin/wrangler";
const branch = "codex/tpi-development";
const worker = "theparanormalinitiative";
const mode = process.argv[2] || "preflight";
const releaseDryRun = process.argv.includes("--dry-run");
const timingsMode = mode === "deploy" && releaseDryRun ? "deploy-dry-run" : mode;
const releaseStatePath = resolve(repoRoot, ".local-dev/release-preflight.json");
const releaseTimingsPath = resolve(repoRoot, `.local-dev/release-timings-${timingsMode}.json`);
const deploymentRecordPath = resolve(repoRoot, ".local-dev/release-deployment.json");
// The immutable candidate: one staged, hashed, certified release artifact.
const candidateRoot = resolveCandidateRoot(repoRoot);
const gateRecords = [];

// TPI-OPS-004 release timing instrumentation.
//
// Every phase is measured with a monotonic clock. Each entry's `elapsedMs` is
// the interval since the previous entry, so the entries sum to the workflow
// total and no time is silently unattributed. This is measurement only: it
// changes no gate, no assertion, no order and no pass/fail decision, and it
// writes nothing outside ignored `.local-dev` state. Timing must never be able
// to fail a release, so all recording is best-effort.
const releaseStartedAt = performance.now();
const timeline = [];
let lastMarkAt = releaseStartedAt;
let currentStage = "startup";

function stamp(ms) {
  const totalSeconds = Math.max(0, ms) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}
function mark(name, detail = {}) {
  const now = performance.now();
  const elapsedMs = Math.round(now - lastMarkAt);
  lastMarkAt = now;
  const entry = { stage: currentStage, phase: name, elapsedMs, startedAtMs: Math.round(now - releaseStartedAt - elapsedMs), ...detail };
  timeline.push(entry);
  console.log(`   [${stamp(now - releaseStartedAt)}] +${stamp(elapsedMs)}  ${name}`);
  return entry;
}
function writeTimings(status) {
  const totalMs = Math.round(performance.now() - releaseStartedAt);
  const cloudflareMs = timeline.filter(entry => entry.bucket === "cloudflare").reduce((sum, entry) => sum + entry.elapsedMs, 0);
  const browserMs = timeline.filter(entry => entry.browser === true).reduce((sum, entry) => sum + entry.elapsedMs, 0);
  const gatesMs = timeline.filter(entry => entry.kind === "gate").reduce((sum, entry) => sum + entry.elapsedMs, 0);
  const summary = { mode, status, totalMs, total: stamp(totalMs), gateMs: gatesMs, browserGateMs: browserMs, cloudflareMs, phases: timeline };
  try {
    mkdirSync(resolve(releaseTimingsPath, ".."), { recursive: true });
    writeFileSync(releaseTimingsPath, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  } catch { /* timing must never fail a release */ }
  const width = Math.max(12, ...timeline.map(entry => entry.phase.length));
  console.log(`\n== Release timing summary (${mode}: ${status}) ==`);
  console.log(`${"phase".padEnd(width)}  ${"duration".padStart(9)}  ${"at".padStart(9)}`);
  for (const entry of timeline) console.log(`${entry.phase.padEnd(width)}  ${stamp(entry.elapsedMs).padStart(9)}  ${stamp(entry.startedAtMs).padStart(9)}`);
  console.log(`${"TOTAL".padEnd(width)}  ${stamp(totalMs).padStart(9)}`);
  console.log(`machine-readable: ${relative(repoRoot, releaseTimingsPath)}`);
  return summary;
}

function fail(message) { throw new Error(message); }
function output(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}
function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const gateStarted = performance.now();
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    stdio: "inherit",
    maxBuffer: 64 * 1024 * 1024,
  });
  // Every `run` call is a release gate. The certification records exactly the
  // gates that passed against the certified bytes, so the operator can see what
  // a reused certification actually covers.
  const record = { name: label, status: result.error ? "error" : result.status === 0 ? "pass" : "fail", durationMs: Math.round(performance.now() - gateStarted) };
  gateRecords.push(record);
  if (result.error) {
    mark(label, { kind: "gate", status: "error", ...(options.timing || {}) });
    fail(`${label}: ${result.error.message}`);
  }
  mark(label, { kind: "gate", status: result.status === 0 ? "pass" : "fail", ...(options.timing || {}) });
  if (result.status !== 0) fail(`${label}: exit ${result.status}`);
}
function hashFile(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function filesUnder(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
function localAdminFingerprint() {
  const credentialPath = resolve(repoRoot, ".local-dev/local-auth-credentials.json");
  if (!existsSync(credentialPath) || (statSync(credentialPath).mode & 0o777) !== 0o600) fail("protected local credential file is missing or not mode 0600");
  for (const candidate of filesUnder(resolve(repoRoot, ".local-dev/state/v3/d1")).filter(path => /\.sqlite(?:3)?$/.test(path))) {
    try {
      const row = output("sqlite3", [candidate, "SELECT password_hash || '|' || role || '|' || active FROM contributors WHERE username='local_admin' LIMIT 1;"]);
      if (row) return { credentialSha256: hashFile(credentialPath), databaseRowSha256: createHash("sha256").update(row).digest("hex") };
    } catch { /* skip metadata and unrelated SQLite files */ }
  }
  fail("persistent local_admin row was not found; no database was changed");
}
async function waitFor(url, timeoutMs = 30_000, acceptedStatuses = null) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const status = (await fetch(url)).status;
      if (acceptedStatuses ? acceptedStatuses.includes(status) : status < 500) return;
    } catch { /* retry */ }
    await new Promise(resolvePromise => setTimeout(resolvePromise, 250));
  }
  fail(`timed out waiting for ${url}`);
}
async function waitForLocalReleaseSurfaces() {
  await waitFor("http://127.0.0.1:8787/", 30_000, [200]);
  await waitFor("http://127.0.0.1:8787/studio/", 30_000, [200, 401, 403]);
  mark("Local Worker surfaces ready after restart");
}
async function runLocalAuthCheck(label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      run(label, process.execPath, ["scripts/qa/tpi-ops-009-authentication.mjs"]);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 3) throw error;
      console.warn(`${label} was attempted before the local Worker was ready; retrying (${attempt}/2).`);
      await waitForLocalReleaseSurfaces();
      await new Promise(resolvePromise => setTimeout(resolvePromise, 750 * attempt));
    }
  }
  throw lastError;
}
function assertGitReleaseState() {
  if (output("git", ["branch", "--show-current"]) !== branch) fail(`release branch must be ${branch}`);
  const status = output("git", ["status", "--porcelain=v1", "--untracked-files=all"]);
  if (status) fail(`working tree is not clean:\n${status}`);
  const head = output("git", ["rev-parse", "HEAD"]);
  const remoteLine = output("git", ["ls-remote", "origin", `refs/heads/${branch}`]);
  const remote = remoteLine.split(/\s+/)[0] || "";
  if (head !== remote) fail(`local HEAD ${head} does not match origin/${branch} ${remote || "missing"}`);
  return head;
}
function activeProductionVersion() {
  const deployments = output(wrangler, ["deployments", "list", "--name", worker]);
  const versions = [...deployments.matchAll(/Version\(s\):\s+\(100%\)\s+([0-9a-f-]{36})/g)].map(match => match[1]);
  if (!versions.length) fail("Cloudflare did not return an active 100% Worker version");
  return versions.at(-1);
}
function ensureCloudflareAccess(rollbackVersion) {
  const identity = output(wrangler, ["whoami"]);
  if (!identity.includes("221ea5479876fd303ddc87002b9e892d")) fail("Wrangler is not authenticated to the approved Cloudflare account");
  const versions = output(wrangler, ["versions", "list", "--name", worker]);
  if (!versions.includes(rollbackVersion)) fail(`rollback version ${rollbackVersion} is not available`);
  const help = output(wrangler, ["rollback", "--help"]);
  if (!help.includes("version-id") || !help.includes("--name")) fail("Wrangler rollback command is unavailable");
}
function startIsolatedE2E() {
  run("Stop prior disposable E2E service", "bash", ["scripts/e2e/isolated-launchagent.sh", "stop"]);
  run("Clean disposable E2E state", process.execPath, ["scripts/e2e/isolated-worker.mjs", "clean"]);
  run("Start disposable E2E service", "bash", ["scripts/e2e/isolated-launchagent.sh", "start"]);
}
function stopIsolatedE2E() {
  try { spawnSync("bash", ["scripts/e2e/isolated-launchagent.sh", "stop"], { cwd: repoRoot, stdio: "inherit" }); } catch { /* best effort */ }
}
async function verifyAuthLifecycle() {
  const before = localAdminFingerprint();
  await runLocalAuthCheck("local_admin authentication before restart");
  run("Managed local Worker restart", process.execPath, ["scripts/local-dev-service.mjs", "restart"], { env: { TPI_LOCAL_OWNER_CONTROL: "1" } });
  await waitForLocalReleaseSurfaces();
  await runLocalAuthCheck("local_admin authentication after restart");
  run("StudioFlow production build", "npm", ["run", "build"], { cwd: studioFlowRoot });
  await waitForLocalReleaseSurfaces();
  await runLocalAuthCheck("local_admin authentication after StudioFlow rebuild");
  const after = localAdminFingerprint();
  if (JSON.stringify(before) !== JSON.stringify(after)) fail("local_admin credential or database fingerprint changed during restart/build verification");
  run("Firefox Developer Edition local_admin acceptance", process.execPath, ["scripts/verify/tpi-studioflow-firefox-acceptance.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "local_admin", TPI_FIREFOX_BASE_URL: "http://127.0.0.1:8787" },
    timing: { bucket: "certification", browser: true },
  });
  console.log("Local administrator lifecycle: PASS (credential preserved, restart/build/login/browser verified).");
}
async function preflight() {
  currentStage = "preflight";
  const preflightStarted = performance.now();
  const sourceCommit = assertGitReleaseState();
  mark("Git clean-tree, branch and GitHub parity verification", { bucket: "certification" });
  // TPI-OPS-005 section 21: the tier is computed from the real diff and can be
  // raised by request but never lowered. Ambiguity escalates to Tier 1.
  const tier = classifyReleaseTier({
    repoRoot,
    head: sourceCommit,
    certifiedCommit: previousCertifiedCommit(candidateRoot),
    requestedTier: process.env.TPI_RELEASE_TIER ?? null,
  });
  mark(`Release tier classification (Tier ${tier.level} — ${tier.label})`, { bucket: "certification", tier: tier.level });
  console.log(`   tier base: ${tier.baseCommit || "unresolved"} (${tier.baseSource}) — ${tier.reasons.join("; ")}`);
  run("Release workflow safety contract", process.execPath, ["scripts/verify/tpi-release-safety.mjs"], { timing: { bucket: "certification" } });
  // TPI-OPS-004: the production staging copy must stay within the published
  // asset set. Copying discarded local runtime state made every dry-run and
  // deployment walk ~32k files (~2.1 GB) that `.assetsignore` then threw away,
  // and it made iteration artifacts look like release candidates.
  run("Release staging guard", process.execPath, ["scripts/verify/tpi-ops-004-release-staging-guard.mjs"], { timing: { bucket: "staging" } });
  // TPI-OPS-005: prove the certification system itself fails closed before any
  // release is certified by it. Runs in a throwaway repository, touches nothing.
  run("Certification fail-closed regression", process.execPath, ["scripts/verify/tpi-ops-005-certification.mjs"], { timing: { bucket: "certification" } });
  // Build the complete local asset tree before restarting Wrangler. Replacing
  // the watched directory after startup can leave Miniflare serving the new
  // HTML with an old asset manifest, which presents as a blank StudioFlow page.
  run("Stage local assets", process.execPath, ["scripts/stage-local-assets.mjs"], { timing: { bucket: "staging" } });
  await verifyAuthLifecycle();
  const adminBefore = localAdminFingerprint();
  mark("Persistent local_admin fingerprint (before isolated E2E)", { bucket: "certification" });
    await runLocalAuthCheck("Persistent development authentication");
  startIsolatedE2E();
  try {
    await waitFor("http://127.0.0.1:8789/api/community/categories");
    run("Complete isolated QA and API E2E", process.execPath, ["scripts/qa/run-qa.mjs", "--e2e", "--studioflow-root", studioFlowRoot, "--production-smoke"], {
      env: { TPI_E2E_ISOLATED: "1", TPI_WRANGLER_BIN: wrangler, WRANGLER_BIN: wrangler },
    });
  } finally {
    stopIsolatedE2E();
  }
  if (JSON.stringify(adminBefore) !== JSON.stringify(localAdminFingerprint())) fail("isolated E2E changed the persistent development administrator");
  run("Firefox Developer Edition release acceptance", process.execPath, ["scripts/verify/tpi-studioflow-firefox-acceptance.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin", TPI_FIREFOX_BASE_URL: "http://127.0.0.1:8787" },
    timing: { bucket: "certification", browser: true },
  });
  // Studio Management lifecycle regression (Directive Tests 1-10 plus owner
  // workflow checks H1-H2). Required in the maintained release verification so
  // a Studio creation, switching, isolation, or persistence regression blocks
  // the release instead of reaching production (TPI-STUDIOFLOW-OWNER-VERIFICATION-001 §11).
  run("Studio Management lifecycle regression", process.execPath, ["scripts/verify/tpi-studioflow-studio-lifecycle.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Studio ownership and dashboard regression (TPI-STUDIOFLOW-087 Directive
  // Tests 1-13): homepage Studio cards, per-Studio dashboards, production
  // ownership, rename/archive/restore, and existing-data preservation. A
  // regression here blocks the release (TPI-STUDIOFLOW-087 §13).
  run("Studio ownership and dashboard regression", process.execPath, ["scripts/verify/tpi-studioflow-087-studio-ownership.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Studio deletion and archive management regression (TPI-STUDIOFLOW-088
  // Directive Tests 1-10): typed-name delete confirmation, permanent deletion
  // with tombstoning, active-Studio deletion safety, browser-local deletion
  // with snapshot preservation, and the Archived Studios view. A regression
  // here blocks the release (TPI-STUDIOFLOW-088 §8).
  run("Studio deletion and archive management regression", process.execPath, ["scripts/verify/tpi-studioflow-088-studio-deletion.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Studio deletion safety and data integrity regression (TPI-STUDIOFLOW-089
  // supplemental QA scenarios 1-12): pre-deletion inventory disclosure, the two
  // distinct delete options with the added contents confirmation, shared-data
  // retention, active-recording blocking, stale-tab conflict reporting, and
  // duplicate-deletion convergence. A regression here blocks the release
  // (TPI-STUDIOFLOW-089 §8).
  run("Studio deletion safety and data integrity regression", process.execPath, ["scripts/verify/tpi-studioflow-089-deletion-safety.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Floating Studio actions menu positioning regression (TPI-STUDIOFLOW-133):
  // the More Actions menu must anchor to the card that opened it, flip above
  // when the viewport bottom is reached, stay inside the viewport on tablet and
  // phone widths, close on outside click/Escape/repeat click, stay keyboard
  // reachable, and never modify Studio records. A regression here blocks the
  // release (TPI-STUDIOFLOW-133 §8).
  run("Floating Studio actions menu positioning regression", process.execPath, ["scripts/verify/tpi-studioflow-133-floating-studio-menu.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Production-item colors and Teleprompter-to-Scenes drag-and-drop regression
  // (TPI-STUDIOFLOW-134): the approved orange video, purple Teleprompter, blue
  // Scene, yellow Timer, and green Music colors must drive each card border,
  // tint, icon, selected state, and dragging state; a Teleprompter script must
  // drag into My Scenes, highlight a valid drop target, assign, and persist. A
  // regression here blocks the release (TPI-STUDIOFLOW-125/126A/134).
  run("Production item colors and Teleprompter scene drag regression", process.execPath, ["scripts/verify/tpi-studioflow-134-firefox.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Scene production item persistence regression (TPI-STUDIOFLOW-135): a Scene
  // script must survive an account-backed save and a real browser reload. The
  // TPI-134 gate seeds browser-local state only, so it cannot see a server-side
  // discard; this suite creates its own disposable account-backed Studios,
  // inspects the stored snapshot, and purges them afterwards. A regression here
  // blocks the release (TPI-STUDIOFLOW-135 §10).
  run("Scene production item persistence regression", process.execPath, ["scripts/verify/tpi-studioflow-135-scene-persistence.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Complete Notes workspace restoration acceptance (TPI-STUDIOFLOW-137): the
  // approved Notes workspace must be reachable from both entry points, must
  // persist through the account-backed endpoint across a refresh, and must
  // coexist with the older right-side scratchpad. A regression here blocks the
  // release, because losing the workspace again is the defect being prevented
  // (TPI-STUDIOFLOW-136/137).
  run("Complete Notes workspace restoration acceptance", process.execPath, ["scripts/verify/tpi-studioflow-137-notes-restoration.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Complete Notes workspace visual acceptance (TPI-STUDIOFLOW-137A): the port at
  // TPI-137 shipped the workspace with the approved CSS silently missing, so the
  // interface rendered with browser-default controls, a dead @container query and
  // a page that overflowed narrow viewports. A release must present the approved
  // styling at every required viewport size.
  run("Complete Notes workspace visual acceptance", process.execPath, ["scripts/verify/tpi-studioflow-137a-notes-visual.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // Home layout acceptance (TPI-STUDIOFLOW-137R addendum 01): the complete Create
  // set must stay on one row at desktop widths and My Studios must keep its
  // separation from the list below. Both were owner-reported regressions.
  run("Home layout acceptance", process.execPath, ["scripts/verify/tpi-studioflow-137r-home-layout.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  // True small-viewport acceptance: a same-origin 390/375px frame gives a real
  // CSS viewport that this host's minimum window width cannot produce.
  run("True mobile viewport acceptance", process.execPath, ["scripts/verify/tpi-studioflow-137r-mobile-viewport.mjs"], {
    env: { TPI_FIREFOX_ACCOUNT: "test_admin" },
    timing: { bucket: "certification", browser: true },
  });
  run("Authoritative StudioFlow staging verification", process.execPath, ["scripts/stage-studioflow-authoritative.mjs"]);
  // Approved-feature continuity and release-lineage guard (TPI-STUDIOFLOW-137):
  // a new approved commit must descend from the previous one and must still
  // contain the approved Notes entry points and bundle markers. This is the
  // check that would have failed at TPI-STUDIOFLOW-130 instead of silently
  // removing the workspace from production.
  run("Approved feature continuity and release lineage guard", process.execPath, ["scripts/verify/tpi-studioflow-137-notes-continuity.mjs"]);
  const finalSourceCommit = assertGitReleaseState();
  if (finalSourceCommit !== sourceCommit) fail("release source commit changed during preflight");
  mark("Post-staging Git cleanliness and parity recheck", { bucket: "certification" });
  const rollbackVersion = activeProductionVersion();
  ensureCloudflareAccess(rollbackVersion);
  mark("Cloudflare account, active version and rollback-version prechecks", { bucket: "cloudflare-account" });
  // TPI-OPS-005: stage the release candidate exactly once and prove that it
  // bundles. This directory - never a rebuild - is what production uploads.
  prepareCandidateDirectory(candidateRoot);
  run("Stage immutable release candidate and Wrangler dry-run", process.execPath, ["scripts/deploy-production-guarded.mjs", "--stage-out", candidateRoot, "--dry-run"], { env: { TPI_WRANGLER_BIN: wrangler }, timing: { bucket: "staging" } });
  mark("Release candidate staged", { bucket: "staging" });

  const certificationStarted = performance.now();
  const certifiedSource = collectSourceIdentity(repoRoot, { branch, studioFlowRoot });
  // Staging a candidate must never change the release source. If it did, the
  // certification would describe a state that no longer exists.
  if (!certifiedSource.cleanTree) fail(`working tree changed during certification: ${certifiedSource.changedFiles.join(", ")}`);
  const studioflowBaseline = JSON.parse(readFileSync(resolve(repoRoot, "scripts/studioflow-release-baseline.json"), "utf8"));
  const schemaRequirement = studioflowBaseline.productionSchemaRequirements || { requiredTables: [] };
  const manifest = buildManifest({
    candidateRoot,
    source: certifiedSource,
    tier: { level: tier.level, label: tier.label, reasons: tier.reasons, baseCommit: tier.baseCommit, baseSource: tier.baseSource, requiredGateSet: tier.requiredGateSet },
    gates: gateRecords.slice(),
    schema: {
      database: "tpi_contributor_portal",
      requiredTables: schemaRequirement.requiredTables,
      migrations: schemaRequirement.migrations || [],
      reason: schemaRequirement.reason || null,
    },
    build: {
      command: mode === "preflight" ? "npm run release:preflight" : "npm run release:certify",
      nodeVersion: process.version,
      candidateRoot: relative(repoRoot, candidateRoot),
      assetsDirectory: "assets",
      workerDirectory: "worker",
    },
    certificationMs: 0,
  });
  // Record the real certification cost, then re-seal the digest so the
  // manifest remains self-consistent.
  manifest.certificationMs = Math.round(performance.now() - certificationStarted);
  manifest.manifestDigest = computeManifestDigest(manifest);
  mark("Hash deployable bytes and seal certification digest", { bucket: "certification" });

  writeCertification(candidateRoot, manifest);
  mark("Write certification manifest", { bucket: "certification" });
  mkdirSync(resolve(releaseStatePath, ".."), { recursive: true });
  writeFileSync(releaseStatePath, `${JSON.stringify({ schemaVersion: 1, sourceCommit, branch, worker, rollbackVersion, releaseId: manifest.releaseId, manifestDigest: manifest.manifestDigest, tier: tier.level, verifiedAt: new Date().toISOString() }, null, 2)}\n`, { mode: 0o600 });
  mark("Write certification release state", { bucket: "staging" });
  mark("Certification complete", { bucket: "certification", preflightMs: Math.round(performance.now() - preflightStarted) });

  const summary = describeCertification(manifest);
  console.log("\n== CERTIFIED RELEASE CANDIDATE ==");
  for (const [key, value] of Object.entries(summary)) console.log(`   ${key.padEnd(22)} ${value}`);
  console.log(`\nCERTIFIED RELEASE CANDIDATE: ${manifest.releaseId}`);
  console.log(`This exact candidate may now be deployed without recertification, provided no protected input changes.`);
  console.log(`   next: TPI_PRODUCTION_DEPLOY=approved npm run release:production`);
  console.log(JSON.stringify({ status: "CERTIFIED", readyForProduction: true, releaseId: manifest.releaseId, sourceCommit, tier: tier.level, worker, rollbackVersion, manifestDigest: manifest.manifestDigest, certificationPath: relative(repoRoot, resolve(candidateRoot, "release-certification.json")), releaseStatePath: ".local-dev/release-preflight.json" }, null, 2));
  return { sourceCommit, rollbackVersion, manifest };
}
async function deploy() {
  currentStage = "deployment";
  if (process.env.TPI_PRODUCTION_DEPLOY !== "approved") fail("deployment requires TPI_PRODUCTION_DEPLOY=approved");
  mark("Production deploy authorization guard", { bucket: "production" });
  // TPI-OPS-005: re-prove the certification instead of repeating the full
  // suite. Every immutable property is checked here, and any doubt refuses.
  let verified;
  try {
    verified = verifyCertification({ repoRoot, candidateRoot });
  } catch (error) {
    fail(`certified release candidate cannot be deployed: ${error instanceof Error ? error.message : error}`);
  }
  const manifest = verified.manifest;
  const release = { sourceCommit: manifest.source.websiteCommit, rollbackVersion: null };
  mark("Certified candidate verification (manifest digest, every deployable hash, source identity)", { bucket: "production" });
  console.log(`\nReusing valid certification ${manifest.releaseId}.`);
  console.log(`   The full certification suite will not run again: ${manifest.gates.length} certified gates already cover these exact bytes.`);
  console.log(`   Tier ${manifest.tier.level} — ${manifest.tier.label}`);
  // A certification records the schema contract it expects; the live database
  // must still satisfy it immediately before deployment (section 36).
  const studioflowBaseline = JSON.parse(readFileSync(resolve(repoRoot, "scripts/studioflow-release-baseline.json"), "utf8"));
  const liveRequirement = studioflowBaseline.productionSchemaRequirements?.requiredTables || [];
  if (JSON.stringify(liveRequirement) !== JSON.stringify(manifest.schema.requiredTables)) {
    fail("the approved production schema contract changed since certification; run npm run release:certify");
  }
  // TPI-STUDIOFLOW-137: a release that depends on database schema must refuse to
  // deploy while that schema is absent. Deploying the Notes workspace before its
  // tables exist would serve an interface that cannot save anything, so this gate
  // fails closed and names the migrations that must be authorized and applied.
  run("Production schema readiness (live, read-only)", process.execPath, ["scripts/verify/tpi-studioflow-137-production-schema.mjs"], { env: { TPI_WRANGLER_BIN: wrangler }, timing: { bucket: "production" } });
  // Rollback metadata is live production state and is captured now, not reused
  // from certification (section 37).
  release.rollbackVersion = activeProductionVersion();
  ensureCloudflareAccess(release.rollbackVersion);
  mark("Capture production Worker identity and rollback target", { bucket: "production" });
  if (assertGitReleaseState() !== release.sourceCommit) fail("release source changed after certification");
  mark("Final Git and GitHub parity recheck before upload", { bucket: "production" });
  // Authorized dry run: proves the reusable path end to end without uploading.
  // It stops before the Cloudflare call, so it can never deploy or report
  // production acceptance as complete.
  if (releaseDryRun) {
    mark("Certified deployment preparation complete (dry run, nothing uploaded)", { bucket: "production" });
    console.log("\n== CERTIFIED DEPLOYMENT DRY RUN ==");
    console.log(`   certification reused:        ${manifest.releaseId}`);
    console.log(`   deployable assets verified:  ${verified.counts.assets}`);
    console.log(`   worker source files verified:${verified.counts.workerSource}`);
    console.log(`   rollback target captured:    ${release.rollbackVersion}`);
    console.log("   no upload performed; production acceptance not run");
    console.log(JSON.stringify({ status: "DEPLOYMENT_DRY_RUN_READY", recertified: false, uploaded: false, productionAcceptance: "not_run", releaseId: manifest.releaseId, sourceCommit: release.sourceCommit, verifiedAssets: verified.counts.assets, verifiedWorkerSourceFiles: verified.counts.workerSource, rollbackVersion: release.rollbackVersion }, null, 2));
    return { sourceCommit: release.sourceCommit, rollbackVersion: release.rollbackVersion, manifest, dryRun: true };
  }
  let deployedVersion = "";
  try {
    const result = spawnSync(process.execPath, ["scripts/deploy-production-guarded.mjs", "--candidate", candidateRoot], {
      cwd: repoRoot,
      env: { ...process.env, TPI_WRANGLER_BIN: wrangler },
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    mark("Deploy certified candidate (Wrangler upload and activation)", { bucket: "cloudflare" });
    if (result.error || result.status !== 0) fail(`guarded deployment failed${result.error ? `: ${result.error.message}` : ""}`);
    deployedVersion = (result.stdout || "").match(/Current Version ID:\s*([0-9a-f-]{36})/)?.[1] || "";
    if (!deployedVersion) fail("deployment completed without a readable Worker version ID");
    run("Live anonymous production smoke", process.execPath, ["scripts/qa/production-smoke.mjs"], { timing: { bucket: "production" } });
    run("Live isolated Firefox Developer Edition acceptance", process.execPath, ["scripts/verify/tpi-studioflow-firefox-acceptance.mjs"], {
      env: {
        TPI_FIREFOX_BASE_URL: "https://paranormalinitiative.com",
        TPI_FIREFOX_ALLOW_PRODUCTION: "1",
        TPI_FIREFOX_PRODUCTION_QA: "approved",
        TPI_FIREFOX_ACCOUNT: "production_qa",
        TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE: resolve(repoRoot, ".local-dev/qa-studioflow-prod.json"),
      },
      timing: { bucket: "production", browser: true },
    });
    if (activeProductionVersion() !== deployedVersion) fail("new Worker version is not receiving 100% traffic");
    mark("Confirm new Worker version holds 100% traffic", { bucket: "production" });
    writeFileSync(deploymentRecordPath, `${JSON.stringify({ schemaVersion: 1, releaseId: manifest.releaseId, manifestDigest: manifest.manifestDigest, sourceCommit: release.sourceCommit, worker, deployedVersion, rollbackVersion: release.rollbackVersion, deployedAt: new Date().toISOString() }, null, 2)}\n`, { mode: 0o600 });
    console.log(JSON.stringify({ status: "DEPLOYED_AND_VERIFIED", releaseId: manifest.releaseId, sourceCommit: release.sourceCommit, worker, deployedVersion, rollbackVersion: release.rollbackVersion, recertified: false }, null, 2));
  } catch (error) {
    console.error(`Production acceptance failed: ${error instanceof Error ? error.message : error}`);
    console.error(`Rolling back ${worker} to ${release.rollbackVersion}.`);
    run("Guarded Worker rollback", wrangler, ["rollback", release.rollbackVersion, "--name", worker, "--yes", "--message", `Automated rollback after failed acceptance of ${deployedVersion || release.sourceCommit}`], { timing: { bucket: "production" } });
    if (activeProductionVersion() !== release.rollbackVersion) fail(`rollback did not restore ${release.rollbackVersion}`);
    throw error;
  }
}

try {
  if (mode === "auth-lifecycle") { currentStage = "auth-lifecycle"; await verifyAuthLifecycle(); }
  else if (mode === "preflight" || mode === "certify") await preflight();
  else if (mode === "deploy") await deploy();
  else fail("usage: node scripts/tpi-release.mjs auth-lifecycle|certify|preflight|deploy");
  writeTimings("completed");
} catch (error) {
  console.error(`TPI release workflow failed: ${error instanceof Error ? error.message : error}`);
  try { writeTimings("failed"); } catch { /* timing must never mask the release failure */ }
  process.exitCode = 1;
}

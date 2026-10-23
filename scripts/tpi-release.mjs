#!/usr/bin/env node

// TPI permanent local-to-production release workflow.
//
// Modes:
//   auth-lifecycle  Verify local_admin before/after a managed Worker restart
//                   and StudioFlow rebuild, then run isolated Firefox acceptance.
//   preflight       Run clean-Git, isolated E2E, Firefox, build, Cloudflare,
//                   manifest, smoke, dry-run and rollback-readiness gates.
//   deploy          Repeat preflight, deploy the exact clean commit, run live
//                   smoke and isolated Firefox acceptance, and roll back on fail.
//
// Deployment requires TPI_PRODUCTION_DEPLOY=approved. No migration command is
// present in this workflow and the disposable E2E service cannot use port 8787
// or .local-dev/state.

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const studioFlowRoot = process.env.STUDIOFLOW_ROOT || "/Users/toddknipple/Documents/StudioFlow/web";
const wrangler = process.env.TPI_WRANGLER_BIN || "/opt/homebrew/bin/wrangler";
const branch = "codex/tpi-development";
const worker = "theparanormalinitiative";
const mode = process.argv[2] || "preflight";
const releaseStatePath = resolve(repoRoot, ".local-dev/release-preflight.json");

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
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    stdio: "inherit",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) fail(`${label}: ${result.error.message}`);
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
  });
  console.log("Local administrator lifecycle: PASS (credential preserved, restart/build/login/browser verified).");
}
async function preflight() {
  const sourceCommit = assertGitReleaseState();
  run("Release workflow safety contract", process.execPath, ["scripts/verify/tpi-release-safety.mjs"]);
  // Build the complete local asset tree before restarting Wrangler. Replacing
  // the watched directory after startup can leave Miniflare serving the new
  // HTML with an old asset manifest, which presents as a blank StudioFlow page.
  run("Stage local assets", process.execPath, ["scripts/stage-local-assets.mjs"]);
  await verifyAuthLifecycle();
  const adminBefore = localAdminFingerprint();
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
  });
  run("Authoritative StudioFlow staging verification", process.execPath, ["scripts/stage-studioflow-authoritative.mjs"]);
  const finalSourceCommit = assertGitReleaseState();
  if (finalSourceCommit !== sourceCommit) fail("release source commit changed during preflight");
  const rollbackVersion = activeProductionVersion();
  ensureCloudflareAccess(rollbackVersion);
  run("Guarded Wrangler dry-run", process.execPath, ["scripts/deploy-production-guarded.mjs", "--dry-run"], { env: { TPI_WRANGLER_BIN: wrangler } });
  mkdirSync(resolve(releaseStatePath, ".."), { recursive: true });
  writeFileSync(releaseStatePath, `${JSON.stringify({ schemaVersion: 1, sourceCommit, branch, worker, rollbackVersion, verifiedAt: new Date().toISOString() }, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ status: "READY", sourceCommit, worker, rollbackVersion, releaseStatePath: ".local-dev/release-preflight.json" }, null, 2));
  return { sourceCommit, rollbackVersion };
}
async function deploy() {
  if (process.env.TPI_PRODUCTION_DEPLOY !== "approved") fail("deployment requires TPI_PRODUCTION_DEPLOY=approved");
  const release = await preflight();
  if (assertGitReleaseState() !== release.sourceCommit) fail("release source changed after preflight");
  let deployedVersion = "";
  try {
    const result = spawnSync(process.execPath, ["scripts/deploy-production-guarded.mjs"], {
      cwd: repoRoot,
      env: { ...process.env, TPI_WRANGLER_BIN: wrangler },
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    if (result.error || result.status !== 0) fail(`guarded deployment failed${result.error ? `: ${result.error.message}` : ""}`);
    deployedVersion = (result.stdout || "").match(/Current Version ID:\s*([0-9a-f-]{36})/)?.[1] || "";
    if (!deployedVersion) fail("deployment completed without a readable Worker version ID");
    run("Live anonymous production smoke", process.execPath, ["scripts/qa/production-smoke.mjs"]);
    run("Live isolated Firefox Developer Edition acceptance", process.execPath, ["scripts/verify/tpi-studioflow-firefox-acceptance.mjs"], {
      env: {
        TPI_FIREFOX_BASE_URL: "https://paranormalinitiative.com",
        TPI_FIREFOX_ALLOW_PRODUCTION: "1",
        TPI_FIREFOX_PRODUCTION_QA: "approved",
        TPI_FIREFOX_ACCOUNT: "production_qa",
        TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE: resolve(repoRoot, ".local-dev/qa-studioflow-prod.json"),
      },
    });
    if (activeProductionVersion() !== deployedVersion) fail("new Worker version is not receiving 100% traffic");
    console.log(JSON.stringify({ status: "DEPLOYED_AND_VERIFIED", sourceCommit: release.sourceCommit, worker, deployedVersion, rollbackVersion: release.rollbackVersion }, null, 2));
  } catch (error) {
    console.error(`Production acceptance failed: ${error instanceof Error ? error.message : error}`);
    console.error(`Rolling back ${worker} to ${release.rollbackVersion}.`);
    run("Guarded Worker rollback", wrangler, ["rollback", release.rollbackVersion, "--name", worker, "--yes", "--message", `Automated rollback after failed acceptance of ${deployedVersion || release.sourceCommit}`]);
    if (activeProductionVersion() !== release.rollbackVersion) fail(`rollback did not restore ${release.rollbackVersion}`);
    throw error;
  }
}

try {
  if (mode === "auth-lifecycle") await verifyAuthLifecycle();
  else if (mode === "preflight") await preflight();
  else if (mode === "deploy") await deploy();
  else fail("usage: node scripts/tpi-release.mjs auth-lifecycle|preflight|deploy");
} catch (error) {
  console.error(`TPI release workflow failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}

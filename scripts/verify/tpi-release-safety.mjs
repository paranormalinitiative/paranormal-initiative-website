#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const runbook = read("docs/TPI-DEVELOPMENT/TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md");
const release = read("scripts/tpi-release.mjs");
const deployGuard = read("scripts/deploy-production-guarded.mjs");
const agents = read("AGENTS.md");
const packageSource = read("package.json");
const studioflowStage = read("scripts/stage-studioflow-authoritative.mjs");
const qaRunner = read("scripts/qa/run-qa.mjs");
const firefoxAcceptance = read("scripts/verify/tpi-studioflow-firefox-acceptance.mjs");
const isolatedWorker = read("scripts/e2e/isolated-worker.mjs");
const isolatedApiE2E = read("scripts/e2e/api-e2e.sh");

const checks = [];
function check(name, assertion) {
  assertion();
  checks.push(name);
}

check("agents must read the release runbook", () => {
  assert.match(agents, /TPI-LOCAL-TO-PRODUCTION-RUNBOOK\.md/);
});
check("runbook uses the canonical repository and branch", () => {
  assert.match(runbook, /\/Users\/toddknipple\/Documents\/GitHub\/paranormal-initiative-website/);
  assert.match(runbook, /codex\/tpi-development/);
});
check("runbook includes secure local_admin access and recovery", () => {
  assert.match(runbook, /show-local-admin-credentials\.sh/);
  assert.match(runbook, /--restore-protected-local-admin/);
});
check("runbook requires commit, push, preflight and guarded deployment", () => {
  assert.match(runbook, /git commit/);
  assert.match(runbook, /git push origin codex\/tpi-development/);
  assert.match(runbook, /npm run release:preflight/);
  assert.match(runbook, /TPI_PRODUCTION_DEPLOY=approved npm run release:production/);
});
check("release preflight includes the full local_admin lifecycle", () => {
  assert.match(release, /await verifyAuthLifecycle\(\)/);
});
check("release preflight blocks legacy Admin and password recovery regressions", () => {
  assert.match(release, /Legacy Admin session and staff-role regression/);
  assert.match(release, /tpi-staff-roles\.mjs/);
  assert.match(release, /tpi-password-recovery\.mjs/);
  assert.match(release, /tpi-password-recovery-browser\.mjs/);
});
check("release preflight blocks Community YouTube preview regressions", () => {
  assert.match(release, /Community YouTube preview and in-feed playback/);
  assert.match(release, /verify:community-youtube-preview/);
  const pkg = JSON.parse(packageSource);
  assert.equal(
    pkg.scripts["verify:community-youtube-preview"],
    "node scripts/qa/tpi-link-preview-regression.mjs && node scripts/verify/tpi-community-youtube-preview-browser.mjs",
  );
});
check("release preflight runs the Studio Management lifecycle regression", () => {
  assert.match(release, /tpi-studioflow-studio-lifecycle\.mjs/);
});
check("release preflight runs the Studio ownership and dashboard regression", () => {
  assert.match(release, /tpi-studioflow-087-studio-ownership\.mjs/);
});
check("release preflight runs the Studio deletion and archive regression", () => {
  assert.match(release, /tpi-studioflow-088-studio-deletion\.mjs/);
});
check("release preflight runs the Studio deletion safety and data integrity regression", () => {
  assert.match(release, /tpi-studioflow-089-deletion-safety\.mjs/);
});
check("local assets are staged before the managed Worker lifecycle", () => {
  const stage = release.indexOf('run("Stage local assets"');
  const lifecycle = release.indexOf("await verifyAuthLifecycle()");
  assert.ok(stage >= 0 && lifecycle > stage);
  assert.equal(release.indexOf('run("Stage local assets"', stage + 1), -1);
});
check("local release readiness rejects transient missing homepage responses", () => {
  assert.match(release, /waitFor\("http:\/\/127\.0\.0\.1:8787\/", 30_000, \[200\]\)/);
  assert.match(release, /waitFor\("http:\/\/127\.0\.0\.1:8787\/studio\/", 30_000, \[200, 401, 403\]\)/);
});
check("release rechecks exact Git state after staging and verification", () => {
  assert.match(release, /const finalSourceCommit = assertGitReleaseState\(\)/);
});
check("direct deployment guard rejects every uncommitted file", () => {
  assert.match(deployGuard, /if \(changedFiles\.length\)/);
  assert.doesNotMatch(deployGuard, /documentationOnly/);
  assert.doesNotMatch(deployGuard, /safeLocalState/);
});
check("direct deployment guard requires exact GitHub parity", () => {
  assert.match(deployGuard, /ls-remote/);
  assert.match(deployGuard, /Production promotion requires exact GitHub parity/);
});
check("deployment package excludes Markdown documentation", () => {
  assert.ok(deployGuard.includes('endsWith(".md")'));
});
check("production Firefox login waits locally and confirms auth once", () => {
  assert.match(firefoxAcceptance, /waitForManualLoginTransition/);
  assert.match(firefoxAcceptance, /await authenticatedSession\(\)/);
  assert.match(firefoxAcceptance, /TPI ISOLATED LIVE ACCEPTANCE/);
  assert.match(firefoxAcceptance, /other Firefox windows cannot satisfy this acceptance/);
  assert.doesNotMatch(firefoxAcceptance, /waitFor\(\"authenticated isolated session\"/);
});
check("production Firefox release acceptance uses the synthetic QA account", () => {
  assert.match(release, /TPI_FIREFOX_PRODUCTION_QA: "approved"/);
  assert.match(release, /TPI_FIREFOX_ACCOUNT: "production_qa"/);
  assert.match(release, /qa-studioflow-prod\.json/);
  assert.doesNotMatch(release, /TPI_FIREFOX_MANUAL_LOGIN: "1"/);
});
check("Firefox acceptance retries only a transient empty StudioFlow shell", () => {
  assert.match(firefoxAcceptance, /for \(let attempt = 1; attempt <= 4; attempt \+= 1\)/);
  assert.match(firefoxAcceptance, /redirectedToLogin/);
  assert.match(firefoxAcceptance, /if \(\(!redirectedToLogin && body\.trim\(\)\) \|\| attempt === 4\) throw error/);
});
check("StudioFlow staging preserves maintained media bridges", () => {
  assert.match(studioflowStage, /video-clip-management-bridge\.js\?tpi020=clip-management-v1&tpi022=video-organization-v13&tpi-panels=exclusive-v3&tpi034=dom-stability-v1/);
  assert.match(studioflowStage, /audio-soundboard-bridge\.js\?tpi021=soundboards-v8&tpi017=smart-pads&tpi-volume=v1&tpi-scene-music=v4&tpi-panels=exclusive-v3&tpi034=dom-stability-v1/);
  assert.match(studioflowStage, /studioflow-012-overrides\.css\?tpi022=video-organization-v12&tpi-panels=exclusive-v3/);
  assert.match(studioflowStage, /check-request-budget\.mjs/);
});
check("complete QA runs the StudioFlow request-budget guard", () => {
  assert.match(qaRunner, /StudioFlow production request-budget guard/);
  assert.match(qaRunner, /check:request-budget/);
});
check("isolated E2E applies migrations through one ordered disposable D1 operation", () => {
  assert.match(isolatedWorker, /migrations_dir =/);
  assert.match(isolatedApiE2E, /d1 migrations apply TPI_DB/);
  assert.doesNotMatch(isolatedApiE2E, /migration_passed=/);
});
// TPI-OPS-005: certification reuse must never replace a safety property. These
// assertions fail if the fast path ever stops verifying the exact certified
// bytes, if deployment ever falls back to repeating certification silently, or
// if the candidate directory ever becomes a tracked/published path.
check("production deployment requires explicit authorization before any gate", () => {
  assert.match(release, /if \(process\.env\.TPI_PRODUCTION_DEPLOY !== "approved"\) fail/);
  const authorization = release.indexOf('if (process.env.TPI_PRODUCTION_DEPLOY !== "approved")');
  const verification = release.indexOf("verifyCertification({ repoRoot, candidateRoot })");
  assert.ok(authorization >= 0 && verification > authorization);
});
check("production deployment verifies the certification instead of recertifying", () => {
  // The only caller of preflight() may be the mode dispatch, so deployment can
  // never fall back to repeating the full certification suite.
  assert.equal((release.match(/await preflight\(\)/g) || []).length, 1);
  assert.match(release, /else if \(mode === "preflight" \|\| mode === "certify"\) await preflight\(\);/);
  assert.match(release, /verifyCertification\(\{ repoRoot, candidateRoot \}\)/);
});
check("production deployment deploys the certified candidate directory", () => {
  assert.match(release, /"--candidate", candidateRoot/);
});
check("candidate staging can never deploy", () => {
  assert.match(deployGuard, /if \(stageOutFlag && !dryRun\) throw new Error\(["'`]--stage-out requires --dry-run/);
});
check("the release candidate directory is untracked local state", () => {
  assert.match(read(".gitignore"), /^\.local-dev\/$/m);
  assert.match(release, /CANDIDATE_DIRECTORY|resolveCandidateRoot/);
});
check("certification regression suite is wired into the package", () => {
  const pkg = JSON.parse(packageSource);
  assert.equal(pkg.scripts["release:certify"], "node scripts/tpi-release.mjs certify");
  assert.equal(pkg.scripts["verify:release-certification"], "node scripts/verify/tpi-ops-005-certification.mjs");
});
check("package exposes credential and safety commands", () => {
  const pkg = JSON.parse(packageSource);
  assert.equal(pkg.scripts["local:credentials"], "zsh scripts/show-local-admin-credentials.sh");
  assert.equal(pkg.scripts["verify:release-safety"], "node scripts/verify/tpi-release-safety.mjs");
});

console.log(JSON.stringify({ status: "PASSED", checksPassed: checks.length, checks }, null, 2));

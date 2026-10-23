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
  assert.match(studioflowStage, /video-clip-management-bridge\.js\?tpi020=clip-management-v1&tpi022=video-organization-v13&tpi-panels=exclusive-v3/);
  assert.match(studioflowStage, /audio-soundboard-bridge\.js\?tpi021=soundboards-v5&tpi017=smart-pads&tpi-volume=v1&tpi-scene-music=v4&tpi-panels=exclusive-v3/);
  assert.match(studioflowStage, /studioflow-012-overrides\.css\?tpi022=video-organization-v10&tpi-panels=exclusive-v3/);
  assert.match(studioflowStage, /check-request-budget\.mjs/);
});
check("complete QA runs the StudioFlow request-budget guard", () => {
  assert.match(qaRunner, /StudioFlow production request-budget guard/);
  assert.match(qaRunner, /check:request-budget/);
});
check("package exposes credential and safety commands", () => {
  const pkg = JSON.parse(packageSource);
  assert.equal(pkg.scripts["local:credentials"], "zsh scripts/show-local-admin-credentials.sh");
  assert.equal(pkg.scripts["verify:release-safety"], "node scripts/verify/tpi-release-safety.mjs");
});

console.log(JSON.stringify({ status: "PASSED", checksPassed: checks.length, checks }, null, 2));

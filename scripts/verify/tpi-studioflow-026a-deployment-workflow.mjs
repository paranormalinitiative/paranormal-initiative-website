#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { buildSql, validQaUsername } from "../qa/tpi-ops-033-qa-accounts.mjs";

const e2e = readFileSync("scripts/e2e/api-e2e.sh", "utf8");
const release = readFileSync("scripts/tpi-release.mjs", "utf8");
const localDev = readFileSync("scripts/local-dev.mjs", "utf8");
const firefox = readFileSync("scripts/verify/tpi-studioflow-firefox-acceptance.mjs", "utf8");
const qaAccounts = readFileSync("scripts/qa/tpi-ops-033-qa-accounts.mjs", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

const checks = [];
function check(name, callback) { callback(); checks.push(name); }

check("owner development D1 cannot be reused by API E2E", () => {
  assert.match(e2e, /TPI_E2E_REUSE_LOCAL is permanently disabled/);
  assert.doesNotMatch(e2e, /--persist-to \.local-dev\/state/);
  const result = spawnSync("bash", ["scripts/e2e/api-e2e.sh"], {
    env: { ...process.env, TPI_E2E_REUSE_LOCAL: "1" }, encoding: "utf8",
  });
  assert.equal(result.status, 2);
  assert.match(`${result.stdout}${result.stderr}`, /Tests may not seed the owner's persistent \.local-dev database/);
});

check("release workflow uses isolated E2E and Firefox Developer Edition", () => {
  assert.match(release, /TPI_E2E_ISOLATED: "1"/);
  assert.match(release, /tpi-studioflow-firefox-acceptance\.mjs/);
  assert.match(release, /TPI_FIREFOX_MANUAL_LOGIN: "1"/);
  assert.match(release, /TPI_FIREFOX_ACCOUNT: "local_admin"/);
});

check("release workflow has guarded dry-run and automatic rollback", () => {
  assert.match(release, /deploy-production-guarded\.mjs", "--dry-run"/);
  assert.match(release, /wrangler, \["rollback", release\.rollbackVersion/);
  assert.match(release, /TPI_PRODUCTION_DEPLOY !== "approved"/);
  assert.doesNotMatch(release, /d1 execute|migrations\//);
});

check("local service ownership has sandbox-safe process proof", () => {
  assert.match(localDev, /function processInfo\(pid\)/);
  assert.match(localDev, /childInfo\?\.parentPid === state\.launcherPid/);
  assert.match(localDev, /commandProof \|\| lsofProof/);
});

check("production Firefox cannot receive local fixture credentials", () => {
  assert.match(firefox, /productionTarget && !manualLogin/);
  assert.match(firefox, /local credentials are never sent to production/);
});

check("synthetic production QA account tool is double-gated", () => {
  assert.match(qaAccounts, /TPI_QA_PROVISIONING !== "approved"/);
  assert.match(qaAccounts, /TPI_QA_PRODUCTION_D1 !== "approved"/);
  assert.match(qaAccounts, /TPI_QA_D1_TARGET must be explicitly set/);
  assert.equal(validQaUsername("qa-studioflow-release"), true);
  assert.equal(validQaUsername("local_admin"), false);
  assert.match(buildSql("disable", "qa-studioflow-release", "", "qa-test"), /DELETE FROM sessions/);
});

check("package exposes one maintained workflow", () => {
  assert.equal(pkg.scripts["verify:local-auth-lifecycle"], "node scripts/tpi-release.mjs auth-lifecycle");
  assert.equal(pkg.scripts["release:preflight"], "node scripts/tpi-release.mjs preflight");
  assert.equal(pkg.scripts["release:production"], "node scripts/tpi-release.mjs deploy");
});

console.log(JSON.stringify({ status: "PASSED", checksPassed: checks.length, checks }, null, 2));

#!/usr/bin/env node

/**
 * TPI-QA-001 reusable quality gate.
 *
 * This runner orchestrates existing project checks. It does not deploy, mutate
 * production, create credentials, or replace the product's functional suites.
 * Use --e2e for the local D1 multi-user API suite and --studioflow-root for
 * the separate StudioFlow workspace checks.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("../..", import.meta.url).pathname);
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback = "") => {
  const index = args.indexOf(flag);
  return index >= 0 ? (args[index + 1] || fallback) : fallback;
};
const e2e = has("--e2e");
const productionSmoke = has("--production-smoke");
const studioflowRoot = value("--studioflow-root", process.env.STUDIOFLOW_ROOT || "");
const reportPath = value("--report", "");
const results = [];

function run(name, command, commandArgs, options = {}) {
  const started = Date.now();
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || root,
    encoding: "utf8",
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: 32 * 1024 * 1024
  });
  const durationMs = Date.now() - started;
  const status = result.error ? "FAIL" : result.status === 0 ? "PASS" : "FAIL";
  const detail = result.error?.message || (result.status === 0 ? "completed" : `exit ${result.status}`);
  results.push({ name, status, durationMs, command: [command, ...commandArgs].join(" "), detail });
  console.log(`${status.padEnd(4)} ${name} (${durationMs}ms) — ${detail}`);
  if (result.status !== 0 && result.stdout) console.log(result.stdout.slice(-4000));
  if (result.status !== 0 && result.stderr) console.error(result.stderr.slice(-4000));
  return result.status === 0;
}

console.log(`TPI-QA-001 local quality gate — ${new Date().toISOString()}`);
console.log(`Repository: ${root}`);

const nodeChecks = [
  "worker.js",
  "functions/api/[[path]].js",
  "api-client.js",
  "includes.js",
  "member-shell.js",
  "scripts/studioflow-release-dry-run.mjs"
].filter((path) => existsSync(resolve(root, path)));
for (const path of nodeChecks) run(`Node syntax: ${path}`, process.execPath, ["--check", path]);
run("Bash syntax: existing E2E and migration checks", "bash", ["-n", "scripts/e2e/api-e2e.sh", "scripts/e2e/verify-0010-equivalence.sh"]);
run("TPI-OPS-002 traffic protection regression", process.execPath, ["scripts/qa/tpi-ops-002-traffic-protection.mjs"]);
run("TPI-OPS-007 local foundation guard regression", process.execPath, ["scripts/qa/tpi-ops-007-local-foundation.mjs"]);

if (e2e) {
  run(
    "TPI local multi-user API E2E (scrapers disabled)",
    "bash",
    ["scripts/e2e/api-e2e.sh", value("--port", "8791")],
    { env: { TPI_E2E_LIVE_SCRAPERS: "0" } }
  );
} else {
  results.push({ name: "TPI local multi-user API E2E", status: "BLOCKED", detail: "not requested; pass --e2e" });
  console.log("BLOCKED TPI local multi-user API E2E — not requested; pass --e2e");
}

if (studioflowRoot) {
  const resolvedStudioFlow = resolve(studioflowRoot);
  if (existsSync(resolve(resolvedStudioFlow, "package.json"))) {
    run("StudioFlow production build", "npm", ["run", "build"], { cwd: resolvedStudioFlow });
    run("StudioFlow production request-budget guard", "npm", ["run", "check:request-budget"], { cwd: resolvedStudioFlow });
    run("StudioFlow room-server syntax", "npm", ["run", "check:room"], { cwd: resolvedStudioFlow });
    run("StudioFlow RTMP bridge syntax", "npm", ["run", "check:rtmp"], { cwd: resolvedStudioFlow });
  } else {
    results.push({ name: "StudioFlow workspace checks", status: "BLOCKED", detail: `package.json not found at ${resolvedStudioFlow}` });
    console.log(`BLOCKED StudioFlow workspace checks — package.json not found at ${resolvedStudioFlow}`);
  }
} else {
  results.push({ name: "StudioFlow workspace checks", status: "BLOCKED", detail: "not requested; pass --studioflow-root or set STUDIOFLOW_ROOT" });
  console.log("BLOCKED StudioFlow workspace checks — not requested; pass --studioflow-root or set STUDIOFLOW_ROOT");
}

if (productionSmoke) {
  run("Read-only production smoke checks", process.execPath, ["scripts/qa/production-smoke.mjs", ...args.filter((arg, index) => arg === "--base" || index > 0 && args[index - 1] === "--base")]);
} else {
  results.push({ name: "Read-only production smoke checks", status: "BLOCKED", detail: "not requested; pass --production-smoke" });
  console.log("BLOCKED Read-only production smoke checks — not requested; pass --production-smoke");
}

const failed = results.filter((result) => result.status === "FAIL");
const output = {
  generatedAt: new Date().toISOString(),
  repository: root,
  options: { e2e, productionSmoke, studioflowRoot: studioflowRoot || null },
  results,
  summary: {
    pass: results.filter((result) => result.status === "PASS").length,
    fail: failed.length,
    blocked: results.filter((result) => result.status === "BLOCKED").length,
    overall: failed.length ? "FAIL" : "PASS_WITH_EXPLICIT_BLOCKERS"
  }
};
if (reportPath) {
  const absoluteReport = resolve(root, reportPath);
  mkdirSync(dirname(absoluteReport), { recursive: true });
  writeFileSync(absoluteReport, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Report written: ${absoluteReport}`);
}
process.exitCode = failed.length ? 1 : 0;

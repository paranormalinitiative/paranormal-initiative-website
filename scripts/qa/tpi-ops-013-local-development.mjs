#!/usr/bin/env node

// Offline/local-control checks for TPI-OPS-013. This suite never contacts a
// hosted TPI Worker, a public service, or the StudioFlow room server.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const run = (args) => spawnSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" });

const launcher = readFileSync(resolve(repoRoot, "scripts/local-dev.mjs"), "utf8");
const config = readFileSync(resolve(repoRoot, "wrangler.local.toml"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));

check("local config binds only to loopback", config.includes('ip = "127.0.0.1"') && config.includes("port = 8787"));
check("local outbound guard is enabled", config.includes('TPI_DISABLE_OUTBOUND = "1"'));
check("local D1 and R2 names are isolated", config.includes('tpi-local-foundation') && config.includes('tpi-local-media'));
check("launcher has status and stop commands", launcher.includes('command === "status"') && launcher.includes('command === "stop"'));
check("launcher records ownership metadata", launcher.includes("local-worker.json") && launcher.includes("launcherPid") && launcher.includes("childPid"));
check("launcher refuses unverified port occupants", launcher.includes("occupied by a process that is not verified as TPI-owned"));
check("launcher does not target StudioFlow port", !launcher.includes("kill(8788") && launcher.includes("8788 was not touched"));
check("root local command scripts are present", packageJson.scripts?.["dev:local"] === "node scripts/local-dev.mjs" && packageJson.scripts?.["dev:local:status"] && packageJson.scripts?.["dev:local:stop"]);
check("local auth fixture remains ignored and permissioned", existsSync(resolve(repoRoot, ".local-dev/local-auth-credentials.json")));

const status = run([resolve(repoRoot, "scripts/local-dev.mjs"), "status"]);
check("status command exits successfully", status.status === 0, status.stderr.trim());
check("status identifies the canonical worker address", /127\.0\.0\.1:8787/.test(status.stdout));
check("status identifies local persistence", /\.local-dev\/state/.test(status.stdout));
check("status does not print credential material", !/password|TAVILY_API_KEY|session_token/i.test(status.stdout));

for (const target of [
  "scripts/local-dev.mjs",
  "scripts/qa/tpi-ops-013-local-development.mjs",
  "scripts/stage-local-assets.mjs",
]) {
  const result = spawnSync(process.execPath, ["--check", target], { cwd: repoRoot, encoding: "utf8" });
  check(`syntax: ${target}`, result.status === 0, result.stderr.trim());
}

for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
const failed = checks.filter(item => !item.ok);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);

#!/usr/bin/env node

// Local-only OPS-014 service checks. This suite never deploys, imports, or
// contacts a hosted TPI Worker. It does not stop or restart the owner service.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const run = (args) => spawnSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" });
const launcher = readFileSync(resolve(repoRoot, "scripts/local-dev.mjs"), "utf8");
const service = readFileSync(resolve(repoRoot, "scripts/local-dev-service.mjs"), "utf8");
const plistPath = resolve(process.env.HOME || "", "Library/LaunchAgents/com.tpi.local-development.plist");
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const config = readFileSync(resolve(repoRoot, "wrangler.local.toml"), "utf8");
const currentNodeRealpath = realpathSync(process.execPath);
const installedNodeRealpath = existsSync("/opt/homebrew/bin/node") ? realpathSync("/opt/homebrew/bin/node") : "";

check("service script syntax is present", service.includes("com.tpi.local-development") && service.includes("TPI_LOCAL_SERVICE_MANAGED"));
check("service uses the existing local launcher", service.includes("scripts/local-dev.mjs") && !service.includes("wrangler dev"));
check("service binds through local configuration", config.includes('ip = "127.0.0.1"') && config.includes("port = 8787"));
check("service requires explicit owner control", service.includes("TPI_LOCAL_OWNER_CONTROL") && service.includes("Owner control is required"));
check("owner-managed Worker cannot be stopped by generic control", launcher.includes("state.serviceManaged") && launcher.includes("owner-managed TPI service"));
check("restart throttle and launch-at-login are configured", service.includes("<key>RunAtLoad</key><true/>") && service.includes("<key>ThrottleInterval</key><integer>10</integer>"));
check("service does not target StudioFlow", !service.includes("kill(8788") && !service.includes("bootout.*8788"));
check("bounded local logging is implemented", service.includes("maxLogBytes") && service.includes("rotateLog"));
check("owner command scripts exist", ["dev:local:service:install", "dev:local:service:start", "dev:local:service:stop", "dev:local:service:restart", "dev:local:service:status", "dev:local:service:uninstall"].every(key => typeof packageJson.scripts?.[key] === "string"));
check("Finder launcher is loopback-only", readFileSync(resolve(repoRoot, "TPI Local Development.command"), "utf8").includes("http://127.0.0.1:8787/"));

check("LaunchAgent plist is installed", existsSync(plistPath));
if (existsSync(plistPath)) {
  const plist = readFileSync(plistPath, "utf8");
  check("installed plist has the expected label", plist.includes("com.tpi.local-development"));
  check("installed plist points to this repository", plist.includes(repoRoot));
  check("installed plist uses the current absolute Node executable", plist.includes(process.execPath) || (installedNodeRealpath && installedNodeRealpath === currentNodeRealpath && plist.includes("/opt/homebrew/bin/node")));
  check("installed plist is loopback/local-only", plist.includes('TPI_LOCAL_ONLY</key><string>1') && plist.includes('TPI_DISABLE_OUTBOUND</key><string>1'));
  check("installed plist has no hosted TPI target", !/paranormalinitiative\.com|workers\.dev|tpi_contributor_portal_dev|tpi-contributor-media-dev/.test(plist));
}

const status = run([resolve(repoRoot, "scripts/local-dev-service.mjs"), "status"]);
check("service status command exits successfully", status.status === 0, status.stderr.trim());
check("service status reports loaded", /Loaded: YES/.test(status.stdout));
check("service status does not print secrets", !/password|session|token|api[_-]?key/i.test(status.stdout));

try {
  const listeners = execFileSync("lsof", ["-nP", "-iTCP:8788", "-sTCP:LISTEN"], { encoding: "utf8" });
  check("StudioFlow 8788 remains listening", /127\.0\.0\.1:8788/.test(listeners));
} catch {
  check("StudioFlow 8788 remains listening", false, "listener not detected");
}

for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
const failed = checks.filter(item => !item.ok);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, serviceMutated: false }));
if (failed.length) process.exit(1);

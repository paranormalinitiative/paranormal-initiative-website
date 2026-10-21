#!/usr/bin/env node

// TPI-STUDIOFLOW-034: read-only startup and local Worker verification.
// This script never changes launchd state, browser storage, or Studio data.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { request } from "node:http";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const label = "com.tpi.local-development";
const plistPath = resolve(homedir(), "Library/LaunchAgents", `${label}.plist`);
const serviceSource = readFileSync(resolve(repoRoot, "scripts/local-dev-service.mjs"), "utf8");
const launcherSource = readFileSync(resolve(repoRoot, "scripts/local-dev.mjs"), "utf8");
const configSource = readFileSync(resolve(repoRoot, "wrangler.local.toml"), "utf8");
const checks = [];

function check(name, condition, detail) {
  checks.push({ name, pass: Boolean(condition), detail });
}

function launchdPrint() {
  try {
    return execFileSync("launchctl", ["print", `gui/${process.getuid()}/${label}`], { encoding: "utf8" });
  } catch {
    return "";
  }
}

function httpStatus(pathname) {
  return new Promise(resolveResult => {
    const client = request({ host: "127.0.0.1", port: 8787, path: pathname, method: "GET", timeout: 1500 }, response => {
      response.resume();
      response.once("end", () => resolveResult(response.statusCode || 0));
    });
    client.once("timeout", () => { client.destroy(); resolveResult(0); });
    client.once("error", () => resolveResult(0));
    client.end();
  });
}

check("LaunchAgent plist exists", existsSync(plistPath), plistPath);
const plist = existsSync(plistPath) ? readFileSync(plistPath, "utf8") : "";
check("RunAtLoad enabled", /<key>RunAtLoad<\/key>\s*<true\/>/.test(plist), "RunAtLoad=true");
check("KeepAlive enabled", /<key>KeepAlive<\/key>\s*<true\/>/.test(plist), "KeepAlive=true");
check("Stable Node path", /<string>\/opt\/homebrew\/bin\/node<\/string>/.test(plist), "LaunchAgent does not pin a Cellar version");
check("Local working directory", plist.includes(`<string>${repoRoot}</string>`), repoRoot);
check("Local-only environment", configSource.includes('TPI_LOCAL_ONLY = "1"') && configSource.includes('TPI_DISABLE_OUTBOUND = "1"'), "loopback/local-only configuration");
check("Readiness watchdog present", launcherSource.includes("readinessMonitor") && launcherSource.includes("readiness was lost"), "launcher exits for launchd recovery when 8787 readiness is lost");
check("LaunchAgent is loaded and running", /state = running/.test(launchdPrint()), "launchctl print reports running");

const status = await httpStatus("/");
const studioStatus = await httpStatus("/studio/");
check("Worker accepts loopback HTTP", status > 0 && status < 500, `GET / returned ${status || "no response"}`);
check("Studio route reaches local access boundary", studioStatus > 0 && studioStatus < 500, `GET /studio/ returned ${studioStatus || "no response"}`);

const passed = checks.filter(item => item.pass).length;
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} — ${item.name}: ${item.detail}`);
console.log(`TPI-STUDIOFLOW-034 startup checks: ${passed}/${checks.length}`);
if (passed !== checks.length) process.exitCode = 1;

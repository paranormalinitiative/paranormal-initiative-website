#!/usr/bin/env node

// TPI-OPS-014: user-level macOS LaunchAgent control and bounded local logging.
// This file never deploys, contacts hosted TPI, or controls port 8788.
import { execFileSync, spawn } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { request } from "node:http";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Keep the LaunchAgent independent of Homebrew's versioned Cellar path. The
// stable prefix survives normal Node upgrades; fall back to the current
// executable only when neither supported Homebrew prefix is available.
const nodePath = [
  "/opt/homebrew/bin/node",
  "/usr/local/bin/node",
  process.execPath,
].find(candidate => existsSync(candidate)) || process.execPath;
const localLauncher = resolve(repoRoot, "scripts/local-dev.mjs");
const label = "com.tpi.local-development";
const home = process.env.HOME || "";
const launchAgentsDir = resolve(home, "Library/LaunchAgents");
const plistPath = resolve(launchAgentsDir, `${label}.plist`);
const localRoot = resolve(repoRoot, ".local-dev");
const logDir = resolve(localRoot, "logs");
const serviceLogPath = resolve(logDir, "local-development.log");
const launchdStdoutPath = resolve(logDir, "launchagent.stdout.log");
const launchdStderrPath = resolve(logDir, "launchagent.stderr.log");
const workerPort = 8787;
const maxLogBytes = 2 * 1024 * 1024;

function fail(message, code = 1) {
  console.error(message);
  process.exitCode = code;
}

function ownerControlRequired() {
  if (process.env.TPI_LOCAL_OWNER_CONTROL === "1") return true;
  fail("Owner control is required for this service operation. Run it from the owner terminal with TPI_LOCAL_OWNER_CONTROL=1.", 2);
  return false;
}

function uid() {
  const value = typeof process.getuid === "function" ? process.getuid() : 0;
  if (!value) throw new Error("macOS user UID is unavailable");
  return String(value);
}

function domain() {
  return `gui/${uid()}`;
}

function launchctl(args, allowFailure = false) {
  try {
    return execFileSync("launchctl", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    if (allowFailure) return "";
    const detail = error?.stderr?.toString?.().trim() || error?.message || "launchctl failed";
    throw new Error(detail);
  }
}

function serviceTarget() {
  return `${domain()}/${label}`;
}

async function waitForUnloaded(timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!loaded()) return true;
    await new Promise(resolveResult => setTimeout(resolveResult, 250));
  }
  return !loaded();
}

function installed() {
  return existsSync(plistPath);
}

function loaded() {
  try {
    launchctl(["print", serviceTarget()]);
    return true;
  } catch {
    return false;
  }
}

function validateLocalConfig() {
  const configPath = resolve(repoRoot, "wrangler.local.toml");
  const envPath = resolve(repoRoot, "scripts/local-dev.env");
  if (!existsSync(configPath) || !existsSync(envPath)) throw new Error("local config or secret-free env file is missing");
  const config = readFileSync(configPath, "utf8");
  for (const required of [
    'name = "tpi-local"',
    'TPI_ENV = "local"',
    'TPI_LOCAL_ONLY = "1"',
    'TPI_DISABLE_OUTBOUND = "1"',
    'ip = "127.0.0.1"',
    'port = 8787',
    'database_name = "tpi-local-foundation"',
    'bucket_name = "tpi-local-media"',
  ]) if (!config.includes(required)) throw new Error(`required local setting is missing: ${required}`);
  for (const forbidden of ["theparanormalinitiative-dev", "tpi_contributor_portal_dev", "tpi-contributor-media-dev", "paranormalinitiative.com", "remote = true", "crons ="])
    if (config.includes(forbidden)) throw new Error(`remote/production value found: ${forbidden}`);
}

function xml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function plistContents() {
  const pathValue = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${xml(label)}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(nodePath)}</string>
    <string>${xml(resolve(repoRoot, "scripts/local-dev-service.mjs"))}</string>
    <string>run</string>
  </array>
  <key>WorkingDirectory</key><string>${xml(repoRoot)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>${xml(pathValue)}</string>
    <key>WRANGLER_BIN</key><string>/opt/homebrew/bin/wrangler</string>
    <key>TPI_ENV</key><string>local</string>
    <key>TPI_LOCAL_ONLY</key><string>1</string>
    <key>TPI_DISABLE_OUTBOUND</key><string>1</string>
    <key>TPI_LOCAL_SERVICE_MANAGED</key><string>1</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>ProcessType</key><string>Interactive</string>
  <key>ExitTimeOut</key><integer>10</integer>
  <key>StandardOutPath</key><string>${xml(launchdStdoutPath)}</string>
  <key>StandardErrorPath</key><string>${xml(launchdStderrPath)}</string>
</dict>
</plist>
`;
}

function isOwnedPlist() {
  if (!installed()) return false;
  const contents = readFileSync(plistPath, "utf8");
  return contents.includes(`<key>Label</key><string>${label}</string>`)
    && contents.includes(xml(repoRoot))
    && contents.includes(xml(resolve(repoRoot, "scripts/local-dev-service.mjs")));
}

function rotateLog(path) {
  try {
    if (statSync(path).size > maxLogBytes) {
      const rotated = `${path}.1`;
      try { unlinkSync(rotated); } catch (error) { if (error?.code !== "ENOENT") throw error; }
      renameSync(path, rotated);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function log(message) {
  mkdirSync(logDir, { recursive: true });
  rotateLog(serviceLogPath);
  appendFileSync(serviceLogPath, `[${new Date().toISOString()}] ${message}\n`, { mode: 0o600 });
}

function workerReachable() {
  return new Promise(resolveResult => {
    const client = request({ host: "127.0.0.1", port: workerPort, path: "/", method: "GET", timeout: 700 }, response => {
      response.resume();
      response.once("end", () => resolveResult(response.statusCode >= 200 && response.statusCode < 500));
    });
    client.once("timeout", () => { client.destroy(); resolveResult(false); });
    client.once("error", () => resolveResult(false));
    client.end();
  });
}

async function waitForWorker(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await workerReachable()) return true;
    await new Promise(resolveResult => setTimeout(resolveResult, 250));
  }
  return false;
}

function writePlist() {
  validateLocalConfig();
  mkdirSync(launchAgentsDir, { recursive: true });
  mkdirSync(logDir, { recursive: true });
  if (installed() && !isOwnedPlist()) throw new Error(`refusing to replace unrelated LaunchAgent at ${plistPath}`);
  writeFileSync(plistPath, plistContents(), { mode: 0o600 });
}

async function install() {
  if (!ownerControlRequired()) return;
  writePlist();
  if (loaded()) launchctl(["bootout", serviceTarget()], true);
  if (!(await waitForUnloaded())) throw new Error("existing LaunchAgent did not finish unloading within the owner-controlled timeout");
  launchctl(["bootstrap", domain(), plistPath]);
  console.log(`Installed and started ${label}.`);
}

async function start() {
  if (!ownerControlRequired()) return;
  if (!installed()) {
    writePlist();
  } else if (!isOwnedPlist()) {
    fail(`Refusing to use unrelated LaunchAgent at ${plistPath}`, 2);
    return;
  }
  if (loaded()) {
    try {
      launchctl(["kickstart", "-k", serviceTarget()]);
    } catch (error) {
      // A stop/start race can make the label disappear between the
      // status check and kickstart. Re-check before surfacing an error.
      if (loaded()) throw error;
      launchctl(["bootstrap", domain(), plistPath]);
    }
  } else {
    launchctl(["bootstrap", domain(), plistPath]);
  }
  console.log(`Started ${label}.`);
}

async function stop() {
  if (!ownerControlRequired()) return;
  if (!installed() || !isOwnedPlist()) {
    console.log("TPI LaunchAgent is not installed; nothing was stopped.");
    return;
  }
  if (loaded()) launchctl(["bootout", serviceTarget()]);
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const serviceLoaded = loaded();
    const workerRunning = await workerReachable();
    if (!serviceLoaded && !workerRunning) break;
    await new Promise(resolveResult => setTimeout(resolveResult, 250));
  }
  if (loaded() || await workerReachable()) {
    throw new Error("local service did not stop within the owner-controlled timeout");
  }
  console.log(`Stopped ${label}; automatic restart is disabled until the owner starts it again.`);
}

async function restart() {
  if (!ownerControlRequired()) return;
  await stop();
  if (process.exitCode) return;
  await start();
}

function status() {
  console.log("TPI — LOCAL DEVELOPMENT SERVICE STATUS");
  console.log(`Label: ${label}`);
  console.log(`Plist: ${plistPath}`);
  console.log(`Installed: ${installed() && isOwnedPlist() ? "YES" : "NO / NOT VERIFIED"}`);
  console.log(`Loaded: ${loaded() ? "YES" : "NO"}`);
  console.log(`Worker: ${loaded() ? "launchd-managed; use local-dev status for HTTP readiness" : "not launchd-loaded"}`);
  console.log(`Logs: ${logDir}`);
  console.log(`Owner controls required: yes (TPI_LOCAL_OWNER_CONTROL=1)`);
}

async function uninstall() {
  if (!ownerControlRequired()) return;
  if (!installed()) {
    console.log("TPI LaunchAgent is not installed.");
    return;
  }
  if (!isOwnedPlist()) {
    fail(`Refusing to remove unrelated LaunchAgent at ${plistPath}`, 2);
    return;
  }
  if (loaded()) launchctl(["bootout", serviceTarget()]);
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline && await workerReachable()) await new Promise(resolveResult => setTimeout(resolveResult, 250));
  unlinkSync(plistPath);
  console.log(`Uninstalled ${label}; local logs and D1/R2 state were preserved.`);
}

async function runService() {
  validateLocalConfig();
  mkdirSync(logDir, { recursive: true });
  log("service process starting");
  const child = spawn(nodePath, [localLauncher], {
    cwd: repoRoot,
    env: { ...process.env, TPI_LOCAL_SERVICE_MANAGED: "1", TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_DISABLE_OUTBOUND: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const record = prefix => chunk => {
    const text = String(chunk).replaceAll(/(?:password|token|secret|api[_-]?key)\s*[:=]\s*[^\s]+/gi, "[redacted]");
    for (const line of text.split(/\r?\n/).filter(Boolean)) log(`${prefix} ${line}`);
  };
  child.stdout.on("data", record("stdout"));
  child.stderr.on("data", record("stderr"));
  let stopping = false;
  const forward = signal => {
    if (stopping) return;
    stopping = true;
    log(`service shutdown requested: ${signal}`);
    child.kill(signal);
  };
  process.on("SIGTERM", () => forward("SIGTERM"));
  process.on("SIGINT", () => forward("SIGINT"));
  child.on("error", error => {
    log(`unexpected launcher error: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    log(`service process exited code=${code ?? "null"} signal=${signal ?? "none"}${stopping ? " intentional=true" : " unexpected=true"}`);
    process.exit(signal ? 0 : (code ?? 0));
  });
}

const command = process.argv[2] || "status";
try {
  if (command === "run") await runService();
  else if (command === "install") await install();
  else if (command === "start") await start();
  else if (command === "stop") await stop();
  else if (command === "restart") await restart();
  else if (command === "status") status();
  else if (command === "uninstall") await uninstall();
  else if (command === "wait") console.log((await waitForWorker()) ? "TPI local Worker is ready." : "TPI local Worker did not become ready.");
  else fail(`Unknown service command: ${command}`);
} catch (error) {
  fail(error instanceof Error ? error.message : "local service operation failed", 2);
}

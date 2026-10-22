#!/usr/bin/env node

import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  watch,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(repoRoot, "wrangler.local.toml");
const envFilePath = resolve(repoRoot, "scripts/local-dev.env");
const localRoot = resolve(repoRoot, ".local-dev");
const persistPath = resolve(localRoot, "state");
const logPath = resolve(localRoot, "wrangler.log");
const workerStatePath = resolve(localRoot, "local-worker.json");
const workerPort = 8787;
const studioFlowPort = 8788;
const studioAssetWatchTargets = [
  // The entry point is the source of truth for hashed bundle names. Watch the
  // complete two StudioFlow directories so a newly generated filename is
  // staged without another hard-coded bundle-name edit.
  { directory: resolve(repoRoot, "studio") },
  { directory: resolve(repoRoot, "studio/assets") },
];

function fail(message, code = 1) {
  console.error(message);
  process.exitCode = code;
}

function localConfigurationError() {
  if (!existsSync(configPath) || !existsSync(envFilePath)) {
    return "the explicit local config or secret-free env file is missing";
  }

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
  ]) {
    if (!config.includes(required)) return `required local setting is missing: ${required}`;
  }

  for (const forbidden of [
    "theparanormalinitiative-dev",
    "theparanormalinitiative\"",
    "tpi_contributor_portal_dev",
    "tpi_contributor_portal\"",
    "tpi-contributor-media-dev",
    "tpi-contributor-media\"",
    "paranormalinitiative.com",
    "crons =",
    "remote = true",
  ]) {
    if (config.includes(forbidden)) return `remote/production value found: ${forbidden}`;
  }
  return "";
}

function readWorkerState() {
  try {
    const state = JSON.parse(readFileSync(workerStatePath, "utf8"));
    return state && typeof state === "object" ? state : null;
  } catch {
    return null;
  }
}

function writeWorkerState(state) {
  mkdirSync(localRoot, { recursive: true });
  const temporaryPath = `${workerStatePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporaryPath, workerStatePath);
}

function watchStudioAssets() {
  const watchers = [];
  let debounceTimer = null;
  let staging = false;
  let queued = false;

  const stageNow = () => {
    if (staging) {
      queued = true;
      return;
    }
    staging = true;
    const result = spawnSync(process.execPath, [resolve(repoRoot, "scripts/stage-local-studio-assets.mjs")], {
      cwd: repoRoot,
      env: { ...process.env },
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.error(`StudioFlow asset restaging failed: ${(result.stderr || result.stdout || "unknown error").trim()}`);
    } else if (result.stdout) {
      console.log(`Restaged StudioFlow assets: ${result.stdout.trim()}`);
    }
    staging = false;
    if (queued) {
      queued = false;
      stageNow();
    }
  };

  const schedule = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(stageNow, 300);
  };

  for (const { directory } of studioAssetWatchTargets) {
    try {
      watchers.push(watch(directory, { persistent: false }, () => schedule()));
    } catch (error) {
      console.error(`StudioFlow asset watcher could not monitor ${directory}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    for (const watcher of watchers) watcher.close();
  };
}

function clearWorkerState(expectedChildPid = null) {
  const state = readWorkerState();
  if (!state || (expectedChildPid !== null && state.childPid !== expectedChildPid)) return;
  try { unlinkSync(workerStatePath); } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

function processCommand(pid) {
  if (!processAlive(pid)) return "";
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "command="], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function processInfo(pid) {
  if (!processAlive(pid)) return null;
  try {
    const output = execFileSync("lsof", ["-nP", "-p", String(pid), "-a", "-d", "cwd,txt", "-FpcRfn"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const info = { pid: null, parentPid: null, command: "", cwd: "" };
    let descriptor = "";
    for (const line of output.split("\n")) {
      if (line.startsWith("p")) info.pid = Number(line.slice(1));
      else if (line.startsWith("R")) info.parentPid = Number(line.slice(1));
      else if (line.startsWith("c")) info.command = line.slice(1);
      else if (line.startsWith("f")) descriptor = line.slice(1);
      else if (line.startsWith("n") && descriptor === "cwd") info.cwd = line.slice(1);
    }
    return info.pid === pid ? info : null;
  } catch {
    return null;
  }
}

function listenersForPort(port) {
  try {
    const output = execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fpct"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const listeners = [];
    let current = null;
    for (const line of output.split("\n")) {
      if (line.startsWith("p")) {
        if (current) listeners.push(current);
        current = { pid: Number(line.slice(1)) };
      } else if (current && line.startsWith("c")) current.command = line.slice(1);
      else if (current && line.startsWith("t")) current.type = line.slice(1);
    }
    if (current) listeners.push(current);
    return listeners.filter(item => Number.isInteger(item.pid));
  } catch {
    return [];
  }
}

function portReachable(port) {
  return new Promise(resolveResult => {
    const socket = createConnection({ host: "127.0.0.1", port });
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolveResult(value);
    };
    socket.setTimeout(300);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function isTpiLauncherCommand(command) {
  return Boolean(command) && command.includes("scripts/local-dev.mjs");
}

function isWranglerCommand(command) {
  return Boolean(command) && (command.includes("wrangler") || command.includes(configPath));
}

function ownedWorkerState(state) {
  if (!state || state.port !== workerPort) return false;
  const launcherCommand = processCommand(state.launcherPid);
  const childCommand = processCommand(state.childPid);
  const launcherInfo = processInfo(state.launcherPid);
  const childInfo = processInfo(state.childPid);
  const commandProof = isTpiLauncherCommand(launcherCommand) && isWranglerCommand(childCommand);
  // Some managed/sandboxed macOS processes deny `ps` while still allowing
  // read-only `lsof` process metadata. The parent relationship plus both
  // working directories gives an equivalent ownership proof without turning
  // a healthy LaunchAgent into a false "OCCUPIED" state.
  const lsofProof = launcherInfo?.cwd === repoRoot
    && childInfo?.cwd === repoRoot
    && childInfo?.parentPid === state.launcherPid
    && launcherInfo?.command === "node"
    && childInfo?.command === "node";
  return processAlive(state.launcherPid)
    && processAlive(state.childPid)
    && (commandProof || lsofProof)
    && state.configPath === configPath;
}

function gitValue(args) {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unavailable";
  }
}

function printStatus() {
  const state = readWorkerState();
  const listeners = listenersForPort(workerPort);
  const roomListeners = listenersForPort(studioFlowPort);
  const owned = ownedWorkerState(state);
  const workerReachable = listeners.length > 0;
  let workerStatus = "STOPPED";
  if (workerReachable && owned) workerStatus = "RUNNING (TPI launcher-owned)";
  else if (workerReachable) workerStatus = "OCCUPIED (not verified as TPI-owned)";
  else if (state && (processAlive(state.launcherPid) || processAlive(state.childPid))) workerStatus = "STARTING/UNREACHABLE";
  else if (state) workerStatus = "STOPPED (stale launcher state)";

  console.log("TPI — LOCAL DEVELOPMENT STATUS");
  console.log(`Worker: ${workerStatus}`);
  console.log("Address: http://127.0.0.1:8787/ (canonical; localhost:8787 is equivalent for anonymous local access)");
  console.log(`Port: ${workerPort}`);
  console.log(`D1 persistence: ${resolve(persistPath, "v3/d1")}`);
  console.log(`R2 persistence: ${resolve(persistPath, "v3/r2")}`);
  console.log(`StudioFlow room server: ${roomListeners.length ? "RUNNING" : "STOPPED/NOT DETECTED"} at 127.0.0.1:${studioFlowPort}`);
  console.log("Environment: local-only; loopback-bound; outbound services blocked");
  console.log(`Repository branch: ${gitValue(["branch", "--show-current"])}`);
  console.log(`Repository HEAD: ${gitValue(["rev-parse", "--short", "HEAD"])}`);
  if (state) {
    console.log(`Launcher state: ${workerStatePath}`);
    console.log(`Launcher PID: ${state.launcherPid ?? "unknown"}`);
    console.log(`Worker process PID: ${state.childPid ?? "unknown"}`);
  }
  if (listeners.length) console.log(`8787 listeners: ${listeners.map(item => `${item.command || "process"}(${item.pid})`).join(", ")}`);
  if (roomListeners.length) console.log(`8788 listeners: ${roomListeners.map(item => `${item.command || "process"}(${item.pid})`).join(", ")}`);
}

async function stopWorker() {
  const state = readWorkerState();
  if (!state) {
    console.log("TPI local Worker is not launcher-owned; nothing was stopped.");
    return;
  }
  if (state.serviceManaged && process.env.TPI_LOCAL_OWNER_CONTROL !== "1") {
    fail("Refusing to stop the owner-managed TPI service from the generic Worker control. Use the explicit owner service command.", 2);
    return;
  }
  const listeners = listenersForPort(workerPort);
  if (!ownedWorkerState(state)) {
    if (!listeners.length && !processAlive(state.launcherPid) && !processAlive(state.childPid)) {
      clearWorkerState();
      console.log("Removed stale TPI launcher state; no local Worker process was running.");
      return;
    }
    fail("Refusing to stop 8787: launcher ownership could not be verified. No process was signaled.", 2);
    return;
  }

  try {
    process.kill(state.childPid, "SIGTERM");
  } catch (error) {
    fail(`Unable to stop the launcher-owned Worker: ${error instanceof Error ? error.message : "unknown error"}`);
    return;
  }

  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (!processAlive(state.childPid) && !(await portReachable(workerPort))) {
      clearWorkerState(state.childPid);
      console.log("TPI local Worker stopped cleanly; 8788 was not touched.");
      return;
    }
    await new Promise(resolveResult => setTimeout(resolveResult, 250));
  }
  fail("TPI local Worker received SIGTERM but did not release 8787 within 10 seconds; no broader kill was attempted.", 2);
}

async function startWorker() {
  const configError = localConfigurationError();
  if (configError) {
    fail(`Local development aborted: ${configError}`);
    return;
  }

  const state = readWorkerState();
  const listeners = listenersForPort(workerPort);
  if (listeners.length || await portReachable(workerPort)) {
    if (ownedWorkerState(state)) {
      console.log("TPI local Worker is already running under the local launcher; no duplicate was started.");
      printStatus();
      return;
    }
    fail(`Local development aborted: 127.0.0.1:${workerPort} is occupied by a process that is not verified as TPI-owned. No process was stopped.`, 2);
    return;
  }

  mkdirSync(persistPath, { recursive: true });
  const stage = spawnSync(process.execPath, [resolve(repoRoot, "scripts/stage-local-assets.mjs")], {
    cwd: repoRoot,
    env: { ...process.env },
    encoding: "utf8",
  });
  if (stage.status !== 0) {
    fail(stage.stderr || "Local asset staging failed.");
    return;
  }
  if (stage.stdout) process.stdout.write(`Staged local assets: ${stage.stdout.trim()}\n`);

  console.log("TPI — LOCAL DEVELOPMENT");
  console.log("Address: http://127.0.0.1:8787/ (human-friendly: http://localhost:8787/)");
  console.log("D1/R2: local simulations only");
  console.log("Outbound external services: blocked");
  console.log("StudioFlow room server: preserved separately at 127.0.0.1:8788");

  const wrangler = process.env.WRANGLER_BIN || "wrangler";
  const child = spawn(wrangler, [
    "dev",
    "--config", configPath,
    "--env-file", envFilePath,
    "--local",
    "--persist-to", persistPath,
    "--ip", "127.0.0.1",
    "--port", "8787",
    "--inspector-port", "0",
  ], {
    cwd: repoRoot,
    env: {
      ...process.env,
      TPI_ENV: "local",
      TPI_LOCAL_ONLY: "1",
      TPI_DISABLE_OUTBOUND: "1",
      WRANGLER_LOG: "info",
      WRANGLER_LOG_PATH: logPath,
    },
    stdio: "inherit",
  });

  if (!child.pid) {
    fail("Local development aborted: Wrangler did not provide a process ID.");
    return;
  }

  writeWorkerState({
    schemaVersion: 1,
    launcherPid: process.pid,
    childPid: child.pid,
    port: workerPort,
    configPath,
    persistPath,
    serviceManaged: process.env.TPI_LOCAL_SERVICE_MANAGED === "1",
    startedAt: new Date().toISOString(),
  });

  let shuttingDown = false;
  let parentMonitor = null;
  let readinessMonitor = null;
  const closeAssetWatcher = watchStudioAssets();
  let readinessSeen = false;
  let readinessCheckInFlight = false;
  const readinessDeadline = Date.now() + 30_000;
  const shutdown = signal => {
    if (shuttingDown) return;
    shuttingDown = true;
    closeAssetWatcher();
    if (readinessMonitor) clearInterval(readinessMonitor);
    if (!child.killed) child.kill(signal);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  child.on("error", error => {
    if (parentMonitor) clearInterval(parentMonitor);
    if (readinessMonitor) clearInterval(readinessMonitor);
    closeAssetWatcher();
    clearWorkerState(child.pid);
    fail(`Local Wrangler failed to start: ${error instanceof Error ? error.message : "unknown error"}`);
  });
  child.on("exit", (code, signal) => {
    if (parentMonitor) clearInterval(parentMonitor);
    if (readinessMonitor) clearInterval(readinessMonitor);
    closeAssetWatcher();
    clearWorkerState(child.pid);
    if (signal) process.exit(0);
    process.exit(code ?? 0);
  });
  // Wrangler can remain alive after its workerd child loses the listening
  // socket. In that state launchd sees a healthy parent and cannot recover the
  // Worker. Convert the loss of the 8787 readiness condition into a bounded
  // launcher exit so the existing LaunchAgent KeepAlive policy can restart
  // the complete local service. The initial grace period avoids killing a
  // normal cold start while still handling a permanently failed startup.
  readinessMonitor = setInterval(async () => {
    if (shuttingDown || readinessCheckInFlight) return;
    readinessCheckInFlight = true;
    const reachable = await portReachable(workerPort);
    readinessCheckInFlight = false;
    if (reachable) {
      readinessSeen = true;
      return;
    }
    const startupExpired = !readinessSeen && Date.now() >= readinessDeadline;
    const runtimeLost = readinessSeen;
    if (startupExpired || runtimeLost) {
      console.error(runtimeLost
        ? "Local Worker readiness was lost; exiting the launcher for launchd recovery."
        : "Local Worker did not become ready within 30 seconds; exiting for launchd recovery.");
      shutdown("SIGTERM");
    }
  }, 1000);
  readinessMonitor.unref();
  if (process.env.TPI_LOCAL_SERVICE_MANAGED === "1") {
    const serviceParentPid = process.ppid;
    parentMonitor = setInterval(() => {
      if (process.ppid !== serviceParentPid) {
        shutdown("SIGTERM");
      }
    }, 1000);
    parentMonitor.unref();
  }
}

const command = process.argv[2] || "start";
if (command === "status") printStatus();
else if (command === "stop") await stopWorker();
else if (command === "start") await startWorker();
else {
  fail(`Unknown local development command: ${command}. Use start, status, or stop.`);
}

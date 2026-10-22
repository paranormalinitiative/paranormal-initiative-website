#!/usr/bin/env node
// TPI-OPS-029: isolated, disposable Worker for E2E tests.
// Mirrors scripts/local-dev.mjs but never reads or writes .local-dev/state,
// never uses port 8787, and never reseeds the owner's data.
//
//   node scripts/e2e/isolated-worker.mjs start   # foreground; run under a LaunchAgent or background
//   node scripts/e2e/isolated-worker.mjs clean   # delete the /tmp test root (only ours)
import { spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const isolatedPort = 8789;
export const testRoot = resolve(tmpdir(), "tpi-isolated-e2e");
export const testStatePath = resolve(testRoot, "state");
export const testConfigPath = resolve(testRoot, "wrangler.isolated.toml");
const testAssetsPath = resolve(testRoot, "assets");
const testLogPath = resolve(testRoot, "wrangler.log");
const ownerPaths = [resolve(repoRoot, ".local-dev"), "8787"];
const sourceAssets = resolve(repoRoot, ".local-dev/assets");

function assertIsolated() {
  // Hard guards: the test root must be under the temp dir and must not
  // contain or be contained by the owner's development state.
  for (const path of [testRoot, testStatePath, testConfigPath]) {
    if (!path.startsWith(tmpdir())) throw new Error(`refusing non-temp path: ${path}`);
    if (path.startsWith(resolve(repoRoot, ".local-dev"))) throw new Error(`refusing owner path: ${path}`);
  }
  if (isolatedPort === 8787) throw new Error("refusing owner port 8787");
}

function buildConfig() {
  const source = readFileSync(resolve(repoRoot, "wrangler.local.toml"), "utf8");
  const config = source
    .replace('name = "tpi-local"', 'name = "tpi-isolated-e2e"')
    // The config lives in the temp root, so resolve the entry point against the repo.
    .replace('main = "worker.js"', `main = "${resolve(repoRoot, "worker.js")}"`)
    .replace('TPI_LOCAL_ORIGIN = "http://127.0.0.1:8787"', `TPI_LOCAL_ORIGIN = "http://127.0.0.1:${isolatedPort}"`)
    .replace("port = 8787", `port = ${isolatedPort}`)
    .replace('directory = ".local-dev/assets"', `directory = "${testAssetsPath}"`)
    .replace('database_id = "00000000-0000-4000-8000-000000000007"', 'database_id = "00000000-0000-4000-8000-00000000e2e7"')
    .replace('preview_database_id = "tpi-local-foundation"', 'preview_database_id = "tpi-isolated-e2e-foundation"')
    .replace('database_name = "tpi-local-foundation"', 'database_name = "tpi-isolated-e2e-foundation"')
    .replace('bucket_name = "tpi-local-media"', 'bucket_name = "tpi-isolated-e2e-media"');
  for (const forbidden of ["theparanormalinitiative-dev", "tpi_contributor_portal_dev", "paranormalinitiative.com", "remote = true", "crons ="]) {
    if (config.includes(forbidden)) throw new Error(`remote/production value in test config: ${forbidden}`);
  }
  if (!config.includes(`port = ${isolatedPort}`)) throw new Error("test config did not switch to the isolated port");
  return config;
}

function prepare() {
  assertIsolated();
  mkdirSync(testStatePath, { recursive: true });
  if (!existsSync(sourceAssets)) throw new Error("owner staged assets missing; run scripts/stage-local-studio-assets.mjs first");
  // Copy assets (read-only source) so the test Worker can never write to owner assets.
  rmSync(testAssetsPath, { recursive: true, force: true });
  cpSync(sourceAssets, testAssetsPath, { recursive: true });
  writeFileSync(testConfigPath, buildConfig(), { mode: 0o600 });
  return { configPath: testConfigPath, statePath: testStatePath, port: isolatedPort, ownerPaths };
}

function start() {
  const { configPath, statePath, port } = prepare();
  const wrangler = process.env.WRANGLER_BIN || "wrangler";
  const child = spawn(wrangler, [
    "dev",
    "--config", configPath,
    "--env-file", resolve(repoRoot, "scripts/local-dev.env"),
    "--local",
    "--persist-to", statePath,
    "--ip", "127.0.0.1",
    "--port", String(port),
    "--inspector-port", "0",
  ], {
    cwd: repoRoot,
    env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_DISABLE_OUTBOUND: "1", WRANGLER_LOG: "info", WRANGLER_LOG_PATH: testLogPath },
    stdio: "inherit",
  });
  child.on("exit", code => process.exit(code ?? 0));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
}

const command = process.argv[2] || "start";
if (command === "start") start();
else if (command === "clean") {
  assertIsolated();
  rmSync(testRoot, { recursive: true, force: true });
  console.log(`removed ${testRoot}`);
} else {
  console.error(`unknown command: ${command}`);
  process.exitCode = 2;
}

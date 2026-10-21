#!/usr/bin/env node

// Put one deterministic synthetic thumbnail into the isolated local R2 bucket.
// This script never targets hosted storage and does not create or upload video
// recordings.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const configPath = resolve(repoRoot, "wrangler.local.toml");
const stateDir = resolve(repoRoot, ".local-dev/state");
const fixturePath = resolve(repoRoot, "scripts/fixtures/ops012-thumbnail.svg");

function fail(message) {
  console.error(`Local media fixtures aborted: ${message}`);
  process.exit(1);
}

if (!process.argv.includes("--local-only")) fail("pass --local-only to confirm isolated local R2 execution");
if (!existsSync(configPath) || !existsSync(stateDir) || !existsSync(fixturePath)) fail("local configuration, state, or synthetic thumbnail is missing");
const config = readFileSync(configPath, "utf8");
for (const required of [
  'name = "tpi-local"',
  'TPI_ENV = "local"',
  'TPI_LOCAL_ONLY = "1"',
  'bucket_name = "tpi-local-media"',
]) {
  if (!config.includes(required)) fail(`required local setting is missing: ${required}`);
}
for (const forbidden of [
  "theparanormalinitiative-dev",
  "tpi_contributor_media_dev",
  "tpi-contributor-media-dev",
  "paranormalinitiative.com",
  "tpi-contributor-media\"",
]) {
  if (config.includes(forbidden)) fail(`remote or production value found: ${forbidden}`);
}

const wrangler = process.env.WRANGLER_BIN || "wrangler";
const result = spawnSync(wrangler, [
  "r2", "object", "put", "tpi-local-media/ops012/thumbnail.svg",
  "--config", configPath,
  "--local",
  "--persist-to", stateDir,
  "--file", fixturePath,
  "--content-type", "image/svg+xml",
  "--force",
], {
  cwd: repoRoot,
  env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" },
  stdio: "inherit",
});
if (result.error) fail(result.error.message);
if (result.status !== 0) fail(`local R2 command failed with exit code ${result.status}`);

console.log(JSON.stringify({
  status: "READY",
  bucket: "tpi-local-media",
  key: "ops012/thumbnail.svg",
  contentType: "image/svg+xml",
  fixtureBytes: readFileSync(fixturePath).length,
  fictionalOnly: true,
  recordingsUploaded: false,
}));

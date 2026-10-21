import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { localTargetAllowed } from "../../lib/local-request-guard.js";

const config = readFileSync(new URL("../../wrangler.local.toml", import.meta.url), "utf8");
const launcher = readFileSync(new URL("../local-dev.mjs", import.meta.url), "utf8");
const staging = readFileSync(new URL("../stage-local-assets.mjs", import.meta.url), "utf8");
const envFile = readFileSync(new URL("../local-dev.env", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

const checks = [];
const check = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`PASS ${name}`);
};

check("local config selects the local Worker identity", () => {
  assert.match(config, /name = "tpi-local"/);
  assert.match(config, /TPI_ENV = "local"/);
  assert.match(config, /TPI_LOCAL_ONLY = "1"/);
});

check("local config binds loopback and disables cron", () => {
  assert.match(config, /ip = "127\.0\.0\.1"/);
  assert.match(config, /port = 8787/);
  assert.doesNotMatch(config, /crons\s*=/);
});

check("local assets use a sanitized staging directory", () => {
  assert.match(config, /directory = "\.local-dev\/assets"/);
  assert.match(launcher, /stage-local-assets\.mjs/);
  for (const forbidden of ["node_modules", "\.dev\.vars", "docs", "functions", "lib"]) {
    assert.match(staging, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

check("local config contains no hosted or production resources", () => {
  for (const forbidden of [
    "theparanormalinitiative-dev",
    "tpi_contributor_portal_dev",
    "tpi-contributor-media-dev",
    "paranormalinitiative.com",
    "remote = true",
  ]) assert.doesNotMatch(config, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

check("local D1 and R2 bindings are present", () => {
  assert.match(config, /database_name = "tpi-local-foundation"/);
  assert.match(config, /bucket_name = "tpi-local-media"/);
});

check("launcher selects local mode and isolated persistence", () => {
  assert.match(launcher, /wrangler\.local\.toml/);
  assert.match(launcher, /scripts\/local-dev\.env/);
  assert.match(launcher, /"--env-file", envFilePath/);
  assert.match(launcher, /"--local"/);
  assert.match(launcher, /"--persist-to", persistPath/);
  assert.match(launcher, /"--ip", "127\.0\.0\.1"/);
  assert.match(launcher, /"--port", "8787"/);
});

check("local env file is secret-free and outbound-disabled", () => {
  assert.match(envFile, /TPI_DISABLE_OUTBOUND=1/);
  assert.doesNotMatch(envFile, /\b(?:RESEND|REALTIME|API_KEY|TOKEN|PASSWORD)=/i);
});

const localEnv = { TPI_ENV: "local", TPI_LOCAL_ONLY: "1", TPI_LOCAL_ORIGIN: "http://127.0.0.1:8787" };
check("local request guard allows same-origin and room-server targets", () => {
  assert.equal(localTargetAllowed(localEnv, "/api/auth/me"), true);
  assert.equal(localTargetAllowed(localEnv, "http://127.0.0.1:8788/api/rooms/test"), true);
});

check("local request guard blocks TPI remote and arbitrary external targets", () => {
  assert.equal(localTargetAllowed(localEnv, "https://paranormalinitiative.com/api/auth/me"), false);
  assert.equal(localTargetAllowed(localEnv, "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/api/auth/me"), false);
  assert.equal(localTargetAllowed(localEnv, "https://example.com/"), false);
});

check("Worker retains the local browser guard without a visual banner", () => {
  assert.match(worker, /TPI_ENV === "local"/);
  assert.match(worker, /data-tpi-local-request-guard/);
  assert.doesNotMatch(worker, /data-tpi-local-development-environment/);
  assert.doesNotMatch(worker, /TPI — LOCAL DEVELOPMENT/);
});

console.log(JSON.stringify({ status: "PASSED", checks: checks.length }));

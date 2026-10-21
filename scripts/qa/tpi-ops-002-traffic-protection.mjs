#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequestBudget } from "./request-budget.mjs";

const root = new URL("../../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const checks = [];
function check(name, callback) {
  callback();
  checks.push(name);
  console.log(`PASS ${name}`);
}

const shell = read("member-shell.js");
const video = read("tpi-video.html");
const bridge = read("studio/workspace-bridge.js");
const devConfig = read("wrangler.dev.toml");
const prodConfig = read("wrangler.toml");

check("guest notification polling is authenticated-only", () => {
  assert.match(shell, /if \(!user\.guest\) \{\s*setupNotificationBadge\(\);\s*startNotificationBadgePolling\(\);/);
});
check("notification polling pauses in hidden tabs", () => {
  assert.match(shell, /notificationBadgeTimer = window\.setInterval\(function\(\) \{\s*if \(!document\.hidden\) setupNotificationBadge\(\);/);
});
check("messenger polling pauses in hidden tabs", () => {
  assert.match(shell, /if \(document\.hidden\) \{\s*stopActiveSync\(\);\s*stopListSync\(\);\s*stopPresenceHeartbeat\(\);/);
});
check("messenger list and presence requests cannot overlap", () => {
  assert.match(shell, /conversationListSyncInFlight/);
  assert.match(shell, /presenceHeartbeatInFlight/);
});
check("live comments pause and deduplicate in hidden tabs", () => {
  assert.match(video, /!document\.hidden && liveCommentsVideoId === videoId/);
  assert.match(video, /if \(liveCommentsInFlight\) return;/);
});
check("StudioFlow autosave remains fingerprint-gated", () => {
  assert.match(bridge, /current && current !== lastSavedFingerprint/);
});
check("development has no scheduled cron trigger", () => {
  assert.match(devConfig, /TPI_DISABLE_OUTBOUND = "1"/);
  assert.doesNotMatch(devConfig, /\[triggers\]/);
});
check("production six-hour scraper cron remains enabled", () => {
  assert.match(prodConfig, /crons = \["0 \*\/6 \* \* \*"\]/);
});

const originalOptIn = process.env.TPI_ALLOW_EXTERNAL_DEV_REQUESTS;
delete process.env.TPI_ALLOW_EXTERNAL_DEV_REQUESTS;
check("external development targets require explicit opt-in", () => {
  assert.throws(
    () => createRequestBudget({ baseUrl: "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev" }),
    error => error?.code === "EXTERNAL_REQUEST_OPT_IN_REQUIRED"
  );
});
if (originalOptIn === undefined) delete process.env.TPI_ALLOW_EXTERNAL_DEV_REQUESTS;
else process.env.TPI_ALLOW_EXTERNAL_DEV_REQUESTS = originalOptIn;

check("local request budget reserves and stops at its ceiling", () => {
  const budget = createRequestBudget({ baseUrl: "http://127.0.0.1:8791", maxRequests: 2, maxConcurrency: 1 });
  assert.equal(budget.reserveBrowserRequest("http://127.0.0.1:8791/a"), true);
  assert.equal(budget.reserveBrowserRequest("http://127.0.0.1:8791/b"), true);
  assert.equal(budget.reserveBrowserRequest("http://127.0.0.1:8791/c"), false);
  assert.deepEqual(budget.summary().requestsRemaining, 0);
});

const boundedScripts = [
  "scripts/qa/tpi-dev-014-authenticated.mjs",
  "scripts/qa/tpi-dev-014-capacity.mjs",
  "scripts/qa/tpi-dev-014-gate-off.mjs",
  "scripts/qa/tpi-dev-014-inactive.mjs",
  "scripts/qa/tpi-dev-014-lifecycle.mjs",
  "scripts/qa/tpi-dev-020-acceptance.mjs",
  "scripts/qa/tpi-dev-021-integration.mjs",
  "scripts/qa/tpi-dev-022-media-search-studio-events.mjs",
  "scripts/qa/tpi-dev-024-workspaces.mjs",
  "scripts/qa/tpi-dev-025-creator-acceptance.mjs",
  "scripts/qa/tpi-dev-037-my-studios.mjs",
  "scripts/qa/tpi-dev-037-final-acceptance.mjs"
];
check("development API QA scripts use the shared request budget", () => {
  for (const path of boundedScripts) {
    const source = read(path);
    assert.match(source, /createRequestBudget/);
    assert.match(source, /requestBudget\.fetch/);
  }
});

console.log(JSON.stringify({ status: "PASSED", checks: checks.length }));

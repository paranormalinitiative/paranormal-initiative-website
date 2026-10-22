import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { BackupValidationError, collectStudioBackup, normalizeStudioForBackup } from "../../studio/backup-core.mjs";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const hash = async value => createHash("sha256").update(Buffer.from(value)).digest("hex");
const noMedia = async () => null;
const studio = (overrides = {}) => ({
  sourceKind: "server-workspace",
  id: "synthetic-workspace-026",
  workspaceId: "synthetic-workspace-026",
  localBroadcastId: "synthetic-broadcast-026",
  studioNumber: 1,
  title: "Synthetic Studio 026",
  version: 3,
  broadcast: { id: "synthetic-broadcast-026", title: "", status: "draft" },
  configuration: { studioScenes: [{ id: "intro", title: "Intro", kind: "intro", layout: "full" }] },
  ...overrides,
});

await check("empty nested broadcast title is backfilled from the authoritative workspace title", () => {
  const snapshot = normalizeStudioForBackup(studio());
  assert.equal(snapshot.broadcast.title, "Synthetic Studio 026");
  assert.equal(snapshot.title, "Synthetic Studio 026");
});

await check("matching nested title is preserved", () => {
  const snapshot = normalizeStudioForBackup(studio({ broadcast: { id: "synthetic-broadcast-026", title: "Synthetic Studio 026" } }));
  assert.equal(snapshot.broadcast.title, "Synthetic Studio 026");
});

await check("conflicting nested title is rejected rather than silently chosen", () => {
  assert.throws(() => normalizeStudioForBackup(studio({ broadcast: { id: "synthetic-broadcast-026", title: "Other Title" } })), BackupValidationError);
});

await check("conflicting broadcast identity is rejected", () => {
  assert.throws(() => normalizeStudioForBackup(studio({ broadcast: { id: "synthetic-other", title: "" } })), BackupValidationError);
});

await check("collection keeps scenes and configuration while completing the title", async () => {
  const collected = await collectStudioBackup({ studio: studio(), mediaResolver: noMedia, hash, now: "2026-10-22T00:00:00.000Z" });
  assert.equal(collected.snapshot.broadcast.title, "Synthetic Studio 026");
  assert.equal(collected.snapshot.configuration.studioScenes.length, 1);
  assert.equal(collected.missingRequired.length, 0);
});

await check("bridge exposes a read-only integrity report and flags empty nested titles without writing", () => {
  const bridge = readFileSync(new URL("../../studio/workspace-bridge.js", import.meta.url), "utf8");
  assert.ok(bridge.includes("function integrityReport(workspace)"));
  assert.ok(bridge.includes('"nested-title-empty"'));
  assert.ok(bridge.includes("integrityReport: function ()"));
});

const failed = checks.filter(item => !item.passed);
console.log(JSON.stringify({ passed: failed.length === 0, total: checks.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;

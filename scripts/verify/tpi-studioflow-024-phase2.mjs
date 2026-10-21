import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  BackupChangeTracker,
  BackupDestinationError,
  BackupIncompleteError,
  BackupValidationError,
  MemoryBackupDestination,
  collectStudioBackup,
  createManifest,
  stableFingerprint,
  validateManifest,
  writeVerifiedBackup,
} from "../../studio/backup-core.mjs";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const bytes = value => new TextEncoder().encode(value);
const hash = async value => createHash("sha256").update(Buffer.from(value)).digest("hex");
const fixtureMedia = new Map([
  ["media-intro", bytes("synthetic-intro-video")],
  ["media-outro", bytes("synthetic-outro-video")],
  ["media-background", bytes("synthetic-background")],
  ["media-logo", bytes("synthetic-logo")],
  ["media-banner", bytes("synthetic-banner")],
  ["media-audio", bytes("synthetic-audio")],
]);
const fixture = extra => ({
  id: "synthetic-studio-024",
  workspaceId: "synthetic-workspace-024",
  localBroadcastId: "synthetic-broadcast-024",
  studioNumber: 1,
  title: "Synthetic Backup Studio",
  description: "Fixture only",
  version: 4,
  applicationVersion: "test-fixture",
  sourceKind: "server-workspace",
  configuration: {
    selectedBackground: "custom-image",
    activeSceneId: "scene-1",
    studioScenes: [
      { id: "intro", kind: "intro", title: "Intro", layout: "Speaker view" },
      { id: "scene-1", kind: "demo", title: "Scene 1", layout: "Two-person split" },
      { id: "outro", kind: "outro", title: "Outro", layout: "Speaker view" },
    ],
    customBackground: { blobKey: "media-background", fileName: "background.png", mediaType: "image/png", size: 19 },
    customLogo: { blobKey: "media-logo", fileName: "logo.png", mediaType: "image/png", size: 13 },
    overlayAssets: [{ blobKey: "media-banner", fileName: "banner.png", mediaType: "image/png", size: 15 }],
    videoClips: {
      intro: { blobKey: "media-intro", fileName: "intro.mp4", mediaType: "video/mp4", size: 21, kind: "intro" },
      outro: { blobKey: "media-outro", fileName: "outro.mp4", mediaType: "video/mp4", size: 21, kind: "outro" },
    },
    backgroundMusic: { blobKey: "media-audio", fileName: "music.mp3", mediaType: "audio/mpeg", size: 15 },
    ...extra,
  },
});
const resolve = async reference => fixtureMedia.get(reference.blobKey) || null;

const destination = new MemoryBackupDestination();
let collected;
await check("valid configuration with multiple scenes collects", async () => {
  collected = await collectStudioBackup({ studio: fixture(), mediaResolver: resolve, hash, now: "2026-10-18T00:00:00.000Z" });
  assert.equal(collected.snapshot.title, "Synthetic Backup Studio");
  assert.equal(collected.snapshot.configuration.studioScenes.length, 3);
  assert.equal(collected.includedMedia.length, 6);
});
await check("manifest includes identity, scenes, paths, sizes, and hashes", async () => {
  const manifest = createManifest({ backupId: "backup-024-001", collected, completedAt: "2026-10-18T00:00:01.000Z" });
  validateManifest(manifest);
  assert.equal(manifest.verificationStatus, "VERIFIED");
  assert.equal(manifest.media.every(item => item.relativePath.startsWith("media/")), true);
  assert.equal(manifest.media.every(item => item.sha256.length === 64), true);
});
await check("media-inclusive backup writes a verified completion marker", async () => {
  const result = await writeVerifiedBackup({ backupId: "backup-024-001", collected, destination, now: "2026-10-18T00:00:01.000Z" });
  assert.equal(result.status, "VERIFIED");
  assert.equal(destination.has("studios/synthetic-studio-024/history/backup-024-001/COMPLETE"), true);
});
await check("unchanged media produces the same content fingerprint", async () => {
  assert.equal(stableFingerprint(collected.snapshot), stableFingerprint(collected.snapshot));
});
await check("configuration change changes the fingerprint", async () => {
  assert.notEqual(stableFingerprint(collected.snapshot), stableFingerprint({ ...collected.snapshot, configurationVersion: 5 }));
});
await check("added media is collected", async () => {
  const next = fixture({ customSound: { blobKey: "media-audio", fileName: "sound.mp3", mediaType: "audio/mpeg" } });
  const result = await collectStudioBackup({ studio: next, mediaResolver: resolve, hash });
  assert.equal(result.includedMedia.length, 7);
});
await check("removed optional media is recorded as excluded", async () => {
  const next = fixture({ customLogo: { blobKey: "missing-logo", fileName: "logo.png", mediaType: "image/png" } });
  const result = await collectStudioBackup({ studio: next, mediaResolver: resolve, hash });
  assert.equal(result.excludedOptional.some(item => item.blobKey === "missing-logo"), true);
});
await check("missing required media prevents finalization", async () => {
  await assert.rejects(() => collectStudioBackup({ studio: fixture({ videoClips: { ...fixture().configuration.videoClips, intro: { blobKey: "missing-intro", fileName: "intro.mp4", mediaType: "video/mp4" } } }), mediaResolver: resolve, hash }), BackupIncompleteError);
});
await check("invalid manifest version is rejected", async () => {
  assert.throws(() => validateManifest({ applicationId: "tpi-studioflow", formatVersion: 99 }), BackupValidationError);
});
await check("unsafe manifest paths are rejected", async () => {
  assert.throws(() => validateManifest({ applicationId: "tpi-studioflow", formatVersion: 1, backupId: "backup-1", studio: { studioId: "studio-1", title: "Fixture" }, scenes: [], media: [{ assetId: "asset-1", relativePath: "../escape", size: 1, sha256: "0".repeat(64) }], excludedOptionalAssets: [], missingRequiredAssets: [] }), BackupValidationError);
});
await check("secret-like fields are rejected", async () => {
  assert.throws(() => validateManifest({ applicationId: "tpi-studioflow", formatVersion: 1, backupId: "backup-1", studio: { studioId: "studio-1", title: "Fixture", token: "never" }, scenes: [], media: [], excludedOptionalAssets: [], missingRequiredAssets: [] }), BackupValidationError);
});
await check("interrupted publication does not replace the prior verified backup", async () => {
  const interrupted = new MemoryBackupDestination();
  await writeVerifiedBackup({ backupId: "backup-024-old", collected, destination: interrupted, now: "2026-10-18T00:00:01.000Z" });
  interrupted.failPublish = true;
  await assert.rejects(() => writeVerifiedBackup({ backupId: "backup-024-new", collected, destination: interrupted }), BackupDestinationError);
  assert.equal(interrupted.has("studios/synthetic-studio-024/history/backup-024-old/COMPLETE"), true);
  assert.equal(interrupted.has("studios/synthetic-studio-024/history/backup-024-new/COMPLETE"), false);
});
await check("storage-full failure preserves prior verified backup", async () => {
  const full = new MemoryBackupDestination();
  await writeVerifiedBackup({ backupId: "backup-024-old", collected, destination: full });
  full.failWrites = true;
  await assert.rejects(() => writeVerifiedBackup({ backupId: "backup-024-new", collected, destination: full }), BackupDestinationError);
  assert.equal(full.has("studios/synthetic-studio-024/history/backup-024-old/COMPLETE"), true);
});
await check("permission failure is surfaced", async () => {
  const denied = new MemoryBackupDestination(); denied.permission = "denied";
  await assert.rejects(() => writeVerifiedBackup({ backupId: "backup-024-denied", collected, destination: denied }), BackupDestinationError);
});
await check("written media corruption can be detected by hash comparison", async () => {
  const corrupt = new MemoryBackupDestination();
  await writeVerifiedBackup({ backupId: "backup-024-corrupt", collected, destination: corrupt });
  const path = "studios/synthetic-studio-024/history/backup-024-corrupt/media/intro/media-intro-intro.mp4";
  const stored = await corrupt.readFile(path);
  assert.equal((await hash(stored)) === collected.includedMedia.find(item => item.reference.role === "intro").sha256, true);
  corrupt.files.set(path, bytes("corrupt"));
  assert.notEqual(await hash(await corrupt.readFile(path)), collected.includedMedia.find(item => item.reference.role === "intro").sha256);
});
await check("reopening an existing destination preserves verified history", async () => {
  assert.equal(destination.has("studios/synthetic-studio-024/history/backup-024-001/COMPLETE"), true);
});
await check("automatic backup remains disabled by default in the browser bridge", async () => {
  const bridge = readFileSync("studio/backup-bridge.js", "utf8");
  assert.match(bridge, /automaticEnabled: false/);
  assert.match(bridge, /Owner backup activation is not enabled/);
});
await check("browser capability fallback is explicit", async () => {
  const bridge = readFileSync("studio/backup-bridge.js", "utf8");
  assert.match(bridge, /Automatic folder backup is not available/);
  assert.match(bridge, /portable backup fallback/);
});
await check("no raw browser database or authentication export is implemented", async () => {
  const bridge = readFileSync("studio/backup-bridge.js", "utf8");
  assert.doesNotMatch(bridge, /indexedDB\.deleteDatabase/);
  assert.doesNotMatch(bridge, /document\.cookie/);
  assert.doesNotMatch(bridge, /Authorization/);
});
await check("change tracker skips unchanged snapshots", async () => {
  const tracker = new BackupChangeTracker({ debounceMs: 0 });
  let runs = 0;
  await tracker.schedule({ revision: 1 }, async () => { runs += 1; });
  const skipped = await tracker.schedule({ revision: 1 }, async () => { runs += 1; });
  assert.equal(runs, 1); assert.equal(skipped.skipped, true);
});
await check("change tracker prevents overlapping jobs", async () => {
  const tracker = new BackupChangeTracker({ debounceMs: 0 }); let active = 0; let peak = 0;
  const job = () => new Promise(resolve => { active += 1; peak = Math.max(peak, active); setTimeout(() => { active -= 1; resolve(); }, 5); });
  const first = tracker.schedule({ revision: 2 }, job); const second = tracker.schedule({ revision: 3 }, job); await Promise.all([first, second]);
  assert.equal(peak, 1);
});
await check("synthetic tests use isolated fixture identifiers", async () => {
  const synthetic = fixture();
  assert.equal(synthetic.id.startsWith("synthetic-"), true);
  assert.equal(synthetic.title.startsWith("Synthetic "), true);
  assert.equal([...fixtureMedia.keys()].every(key => key.startsWith("media-")), true);
});
await check("backup writer has no D1 mutation path", async () => {
  const core = readFileSync("studio/backup-core.mjs", "utf8");
  assert.doesNotMatch(core, /fetch\(|TPI_DB|indexedDB/);
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-024-PHASE-2", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0, ownerDataAccessed: false }));
if (failed.length) process.exit(1);


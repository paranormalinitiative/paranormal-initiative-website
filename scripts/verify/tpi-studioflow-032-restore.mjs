import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  BackupIncompleteError,
  BackupValidationError,
  MemoryBackupDestination,
  collectStudioBackup,
  createManifest,
  prepareRestoredStudio,
  validateManifest,
  writeVerifiedBackup,
} from "../../studio/backup-core.mjs";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const hash = async value => createHash("sha256").update(Buffer.from(value)).digest("hex");
const media = new Map([
  ["restore-intro", new TextEncoder().encode("synthetic intro video")],
  ["restore-outro", new TextEncoder().encode("synthetic outro video")],
  ["restore-background", new TextEncoder().encode("synthetic background video")],
  ["restore-logo", new TextEncoder().encode("synthetic logo")],
  ["restore-banner", new TextEncoder().encode("synthetic banner")],
  ["restore-audio", new TextEncoder().encode("synthetic audio")],
]);
const fixture = {
  id: "restore-source-workspace",
  workspaceId: "restore-source-workspace",
  localBroadcastId: "studio-restore-source",
  title: "Synthetic Restore Source",
  description: "Synthetic restore fixture",
  version: 12,
  applicationVersion: "synthetic-test",
  sourceKind: "server-workspace",
  broadcast: { id: "studio-restore-source", title: "Synthetic Restore Source", description: "Synthetic restore fixture", tpiSync: { broadcastId: "studio-restore-source", revision: 12 } },
  settings: { programOrientation: "landscape", saveAutomatically: true },
  recording: { storageMode: "browser", localLibraryCount: 0 },
  configuration: {
    activeSceneId: "scene-2",
    selectedBackground: "custom-image",
    studioScenes: [
      { id: "intro", kind: "intro", title: "Intro", layout: "Speaker view" },
      { id: "scene-1", kind: "standard", title: "Main", layout: "Group discussion" },
      { id: "scene-2", kind: "standard", title: "Interview", layout: "Media presentation" },
      { id: "outro", kind: "outro", title: "Outro", layout: "Speaker view" },
    ],
    customBackground: { id: "background-1", blobKey: "restore-background", fileName: "background.mp4", mediaType: "video/mp4" },
    customLogo: { id: "logo-1", blobKey: "restore-logo", fileName: "logo.png", mediaType: "image/png" },
    overlayAssets: [{ id: "banner-1", blobKey: "restore-banner", fileName: "banner.png", mediaType: "image/png" }],
    videoClips: {
      intro: { id: "intro-1", blobKey: "restore-intro", fileName: "intro.mp4", mediaType: "video/mp4" },
      outro: { id: "outro-1", blobKey: "restore-outro", fileName: "outro.mp4", mediaType: "video/mp4" },
    },
    backgroundMusic: { id: "audio-1", blobKey: "restore-audio", fileName: "music.mp3", mediaType: "audio/mpeg" },
    unknownFutureField: { preserve: true },
  },
};
const resolveMedia = async reference => media.get(reference.blobKey) || null;
const destination = new MemoryBackupDestination();
const collected = await collectStudioBackup({ studio: fixture, mediaResolver: resolveMedia, hash, now: "2026-10-18T00:00:00.000Z" });
const written = await writeVerifiedBackup({ backupId: "restore-source-backup-1", collected, destination, hash, now: "2026-10-18T00:00:01.000Z" });
const manifest = createManifest({ backupId: written.backupId, collected, completedAt: "2026-10-18T00:00:01.000Z" });
const mediaFiles = new Map();
for (const asset of manifest.media) mediaFiles.set(asset.relativePath, await destination.readFile(`studios/${fixture.id}/history/${written.backupId}/${asset.relativePath}`));
const studioJson = JSON.parse(new TextDecoder().decode(await destination.readFile(`studios/${fixture.id}/history/${written.backupId}/studio.json`)));

await check("verified package is accepted for restore", async () => {
  assert.equal(validateManifest(manifest), true);
  const restored = await prepareRestoredStudio({ manifest, studio: studioJson, mediaFiles, newWorkspaceId: "restore-new-workspace", newBroadcastId: "studio-restore-new", hash });
  assert.equal(restored.title, "Synthetic Restore Source");
  assert.equal(restored.state.broadcast.id, "studio-restore-new");
});

await check("restore generates new workspace and broadcast identities", async () => {
  const restored = await prepareRestoredStudio({ manifest, studio: studioJson, mediaFiles, newWorkspaceId: "restore-new-workspace-2", newBroadcastId: "studio-restore-new-2", hash });
  assert.equal(restored.workspaceId, "restore-new-workspace-2");
  assert.equal(restored.broadcastId, "studio-restore-new-2");
  assert.notEqual(restored.state.broadcast.id, fixture.broadcast.id);
  assert.equal(restored.state.broadcast.tpiSync, undefined);
});

await check("configuration, scenes, settings, and unknown fields are preserved", async () => {
  const restored = await prepareRestoredStudio({ manifest, studio: studioJson, mediaFiles, newWorkspaceId: "restore-new-workspace-3", newBroadcastId: "studio-restore-new-3", hash });
  assert.deepEqual(restored.state.configuration.studioScenes, fixture.configuration.studioScenes);
  assert.equal(restored.state.configuration.unknownFutureField.preserve, true);
  assert.deepEqual(restored.state.settings, fixture.settings);
  assert.deepEqual(restored.state.recording, fixture.recording);
});

await check("media bytes verify and references remap without overwriting source keys", async () => {
  const restored = await prepareRestoredStudio({ manifest, studio: studioJson, mediaFiles, newWorkspaceId: "restore-new-workspace-4", newBroadcastId: "studio-restore-new-4", hash });
  const newKeys = manifest.media.map(asset => restored.media.find(item => item.assetId === asset.assetId).blobKey);
  assert.equal(new Set(newKeys).size, manifest.media.length);
  assert.equal(restored.state.configuration.videoClips.intro.blobKey, restored.media.find(item => item.assetId === "intro-1").blobKey);
  assert.equal(restored.media.every(item => item.bytes.byteLength === item.size), true);
  assert.equal(restored.state.configuration.customLogo.blobKey.startsWith("restored-studio-restore-new-4-"), true);
});

await check("corrupt media is rejected before restore", async () => {
  const corrupt = new Map(mediaFiles);
  corrupt.set(manifest.media[0].relativePath, new TextEncoder().encode("corrupt"));
  await assert.rejects(() => prepareRestoredStudio({ manifest, studio: studioJson, mediaFiles: corrupt, newWorkspaceId: "restore-corrupt-workspace", newBroadcastId: "studio-restore-corrupt", hash }), BackupValidationError);
});

await check("missing required media is rejected before restore", async () => {
  const missing = new Map(mediaFiles);
  missing.delete(manifest.media[0].relativePath);
  await assert.rejects(() => prepareRestoredStudio({ manifest, studio: studioJson, mediaFiles: missing, newWorkspaceId: "restore-missing-workspace", newBroadcastId: "studio-restore-missing", hash }), BackupIncompleteError);
});

await check("staged or unsupported backups are rejected", async () => {
  await assert.rejects(() => prepareRestoredStudio({ manifest: { ...manifest, verificationStatus: "STAGED" }, studio: studioJson, mediaFiles, newWorkspaceId: "restore-staged-workspace", newBroadcastId: "studio-restore-staged", hash }), BackupValidationError);
  await assert.rejects(() => prepareRestoredStudio({ manifest: { ...manifest, formatVersion: 99 }, studio: studioJson, mediaFiles, newWorkspaceId: "restore-version-workspace", newBroadcastId: "studio-restore-version", hash }), BackupValidationError);
});

await check("restore source keeps recordings out of media collection", async () => {
  assert.equal(manifest.media.some(asset => asset.role === "recording"), false);
  assert.equal(studioJson.recording.storageMode, "browser");
});

await check("browser restore is guarded against duplicate clicks and owner overwrite", async () => {
  const source = await readFile("studio/backup-bridge.js", "utf8");
  assert.match(source, /if \(restoreInFlight\) return restoreInFlight/);
  assert.match(source, /Restore .* as a new Studio/);
  assert.match(source, /restoreFromBackup: true/);
  assert.match(source, /newBroadcastId = "studio-restore-/);
  assert.match(source, /window\.showDirectoryPicker\(\{ id: "studioflow-restore", mode: "read" \}\)/);
});

await check("restored create requests preserve backup configuration", async () => {
  const source = await readFile("studio/workspace-asset-state-bridge.js", "utf8");
  assert.match(source, /restoringFromBackup/);
  assert.match(source, /parsedBody\.restoreFromBackup === true/);
  assert.match(source, /parsedBody\.state\.configuration/);
  assert.match(source, /if \(!restoringFromBackup\) applyConfiguration/);
});

await check("successful restore opens the new Studio through the existing workspace bridge", async () => {
  const source = await readFile("studio/backup-bridge.js", "utf8");
  assert.match(source, /tpi:studio-restored/);
  assert.match(source, /restoreLocalStudioFromBackup/);
  assert.match(source, /sourceKind === "local-broadcast"/);
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-032", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, ownerDataAccessed: false, externalRequests: 0 }));
if (failed.length) process.exit(1);

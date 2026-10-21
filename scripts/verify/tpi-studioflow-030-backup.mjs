import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  BackupChangeTracker,
  BackupDestinationError,
  BackupIncompleteError,
  BackupValidationError,
  collectStudioBackup,
  createManifest,
  validateManifest,
  verifyWrittenBackup,
  writeVerifiedBackup,
} from "../../studio/backup-core.mjs";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const root = await mkdtemp(join(tmpdir(), "tpi-studioflow-030-"));
const bytes = value => new TextEncoder().encode(value);
const hash = async value => createHash("sha256").update(Buffer.from(value)).digest("hex");
const media = new Map([
  ["synthetic-intro", bytes("synthetic intro video bytes")],
  ["synthetic-outro", bytes("synthetic outro video bytes")],
  ["synthetic-background", bytes("synthetic background bytes")],
  ["synthetic-logo", bytes("synthetic logo bytes")],
  ["synthetic-audio", bytes("synthetic audio bytes")],
]);
const fixture = (id, title, extra = {}) => ({
  id, workspaceId: id + "-workspace", localBroadcastId: id + "-broadcast", title, description: "Synthetic fixture only", version: 7, applicationVersion: "synthetic-test", sourceKind: "server-workspace",
  broadcast: { id: id + "-broadcast", title },
  configuration: {
    selectedBackground: "custom-image",
    activeSceneId: "scene-1",
    studioScenes: [{ id: "intro", kind: "intro", title: "Intro", layout: "Speaker view" }, { id: "scene-1", kind: "standard", title: "Scene 1", layout: "Group discussion" }, { id: "outro", kind: "outro", title: "Outro", layout: "Speaker view" }],
    customBackground: { blobKey: "synthetic-background", fileName: "background.png", mediaType: "image/png" },
    customLogo: { blobKey: "synthetic-logo", fileName: "logo.png", mediaType: "image/png" },
    videoClips: { intro: { blobKey: "synthetic-intro", fileName: "intro.mp4", mediaType: "video/mp4" }, outro: { blobKey: "synthetic-outro", fileName: "outro.mp4", mediaType: "video/mp4" } },
    backgroundMusic: { blobKey: "synthetic-audio", fileName: "music.mp3", mediaType: "audio/mpeg" },
    unknownFutureField: { keep: true },
    ...extra,
  },
});
const resolveMedia = async reference => media.get(reference.blobKey) || null;

class FsDestination {
  constructor(base) { this.base = resolve(base); this.failWrites = false; this.failPublish = false; }
  path(value) { const target = resolve(this.base, value); if (target !== this.base && !target.startsWith(this.base + "/")) throw new Error("unsafe test path"); return target; }
  async writeFile(path, data) { if (this.failWrites) throw new BackupDestinationError("Synthetic destination write failed.", "DESTINATION_FULL"); const target = this.path(path); await mkdir(resolve(target, ".."), { recursive: true }); await writeFile(target, Buffer.from(data)); }
  async readFile(path) { try { return new Uint8Array(await readFile(this.path(path))); } catch (error) { if (error.code === "ENOENT") return null; throw error; } }
  async publish(staging, published) { if (this.failPublish) throw new BackupDestinationError("Synthetic publication interrupted.", "PUBLISH_INTERRUPTED"); await cp(this.path(staging), this.path(published), { recursive: true }); }
}

const destination = new FsDestination(root);
const studioA = fixture("synthetic-studio-a", "Synthetic Studio A");
const studioB = fixture("synthetic-studio-b", "Synthetic Studio B");
let collectedA;
await check("collects complete synthetic configuration and media", async () => {
  collectedA = await collectStudioBackup({ studio: studioA, mediaResolver: resolveMedia, hash, now: "2026-10-18T00:00:00.000Z" });
  assert.equal(collectedA.includedMedia.length, 5);
  assert.equal(collectedA.snapshot.configuration.unknownFutureField.keep, true);
  assert.equal(collectedA.snapshot.broadcast.title, "Synthetic Studio A");
});
await check("manifest validates identity, scenes, media sizes, and hashes", async () => {
  const manifest = createManifest({ backupId: "backup-synthetic-a-1", collected: collectedA, completedAt: "2026-10-18T00:00:01.000Z" });
  assert.equal(validateManifest(manifest), true);
  assert.equal(manifest.media.length, 5);
  assert.equal(manifest.media.every(item => item.sha256.length === 64), true);
});
await check("real filesystem backup writes and reads back verified bytes", async () => {
  const result = await writeVerifiedBackup({ backupId: "backup-synthetic-a-1", collected: collectedA, destination, hash, now: "2026-10-18T00:00:01.000Z" });
  assert.equal(result.status, "VERIFIED");
  const stored = await destination.readFile("studios/synthetic-studio-a/history/backup-synthetic-a-1/media/intro/synthetic-intro-intro.mp4");
  assert.deepEqual(Array.from(stored), Array.from(media.get("synthetic-intro")));
  assert.ok(await destination.readFile("studios/synthetic-studio-a/history/CURRENT.json"));
});
await check("backup completion marker and manifest are readable", async () => {
  const manifest = JSON.parse(new TextDecoder().decode(await destination.readFile("studios/synthetic-studio-a/history/backup-synthetic-a-1/manifest.json")));
  assert.equal(manifest.verificationStatus, "VERIFIED");
  assert.equal((await destination.readFile("studios/synthetic-studio-a/history/backup-synthetic-a-1/COMPLETE")) !== null, true);
  assert.equal((await verifyWrittenBackup({ destination, path: "studios/synthetic-studio-a/history/backup-synthetic-a-1", manifest, requireComplete: true, hash })).verified, true);
});
await check("missing required media blocks finalization", async () => {
  const missing = fixture("synthetic-missing", "Synthetic Missing", { videoClips: { intro: { blobKey: "missing", fileName: "intro.mp4", mediaType: "video/mp4" }, outro: { blobKey: "synthetic-outro", fileName: "outro.mp4", mediaType: "video/mp4" } } });
  await assert.rejects(() => collectStudioBackup({ studio: missing, mediaResolver: resolveMedia, hash }), BackupIncompleteError);
});
await check("invalid manifests and unsafe paths are rejected", async () => {
  assert.throws(() => validateManifest({ applicationId: "tpi-studioflow", formatVersion: 99 }), BackupValidationError);
  const invalid = { applicationId: "tpi-studioflow", formatVersion: 1, backupId: "backup-invalid", studio: { studioId: "synthetic", title: "Synthetic" }, scenes: [], media: [{ assetId: "asset", relativePath: "../escape", size: 1, sha256: "0".repeat(64) }], excludedOptionalAssets: [], missingRequiredAssets: [] };
  assert.throws(() => validateManifest(invalid), BackupValidationError);
});
await check("unchanged backup snapshots are skipped by change detection", async () => {
  const tracker = new BackupChangeTracker({ debounceMs: 0 }); let runs = 0;
  await tracker.schedule(collectedA.snapshot, async () => { runs += 1; });
  const result = await tracker.schedule(collectedA.snapshot, async () => { runs += 1; });
  assert.equal(runs, 1); assert.equal(result.skipped, true);
});
await check("configuration and media changes produce new fingerprints", async () => {
  const changed = await collectStudioBackup({ studio: fixture("synthetic-studio-a", "Synthetic Studio A", { sceneRevision: 2 }), mediaResolver: resolveMedia, hash });
  assert.notDeepEqual(collectedA.snapshot.configuration, changed.snapshot.configuration);
  const mediaChanged = new Map(media); mediaChanged.set("synthetic-intro", bytes("new synthetic intro bytes"));
  const next = await collectStudioBackup({ studio: studioA, mediaResolver: async ref => mediaChanged.get(ref.blobKey) || null, hash });
  assert.notEqual(collectedA.includedMedia.find(item => item.reference.role === "intro").sha256, next.includedMedia.find(item => item.reference.role === "intro").sha256);
});
await check("interrupted writes preserve the previous verified backup", async () => {
  const before = await destination.readFile("studios/synthetic-studio-a/history/CURRENT.json");
  destination.failPublish = true;
  await assert.rejects(() => writeVerifiedBackup({ backupId: "backup-synthetic-a-failed", collected: collectedA, destination, hash }), BackupDestinationError);
  destination.failPublish = false;
  assert.deepEqual(await destination.readFile("studios/synthetic-studio-a/history/CURRENT.json"), before);
});
await check("write failures preserve the previous verified backup", async () => {
  const before = await destination.readFile("studios/synthetic-studio-a/history/CURRENT.json");
  destination.failWrites = true;
  await assert.rejects(() => writeVerifiedBackup({ backupId: "backup-synthetic-a-full", collected: collectedA, destination, hash }), BackupDestinationError);
  destination.failWrites = false;
  assert.deepEqual(await destination.readFile("studios/synthetic-studio-a/history/CURRENT.json"), before);
});
await check("corrupted written media fails read-back verification", async () => {
  const path = destination.path("studios/synthetic-studio-a/history/backup-synthetic-a-1/media/intro/synthetic-intro-intro.mp4");
  await writeFile(path, Buffer.from("corrupt"));
  const manifest = JSON.parse(new TextDecoder().decode(await destination.readFile("studios/synthetic-studio-a/history/backup-synthetic-a-1/manifest.json")));
  await assert.rejects(() => verifyWrittenBackup({ destination, path: "studios/synthetic-studio-a/history/backup-synthetic-a-1", manifest, requireComplete: true, hash }), BackupDestinationError);
  await writeFile(path, Buffer.from(media.get("synthetic-intro")));
});
await check("multiple Studios remain isolated", async () => {
  const collectedB = await collectStudioBackup({ studio: studioB, mediaResolver: resolveMedia, hash });
  await writeVerifiedBackup({ backupId: "backup-synthetic-b-1", collected: collectedB, destination, hash });
  assert.ok(await destination.readFile("studios/synthetic-studio-a/history/CURRENT.json"));
  assert.ok(await destination.readFile("studios/synthetic-studio-b/history/CURRENT.json"));
  assert.equal(JSON.parse(new TextDecoder().decode(await destination.readFile("studios/synthetic-studio-b/history/backup-synthetic-b-1/studio.json"))).title, "Synthetic Studio B");
});
await check("backup writer has no network or D1 mutation path", async () => {
  const source = await readFile("studio/backup-core.mjs", "utf8");
  assert.doesNotMatch(source, /fetch\(|indexedDB|TPI_DB/);
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-030", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, syntheticRoot: root, ownerDataAccessed: false, externalRequests: 0 }));
if (failed.length) { await rm(root, { recursive: true, force: true }); process.exit(1); }

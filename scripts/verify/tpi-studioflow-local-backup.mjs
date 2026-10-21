import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  MemoryBackupDestination,
  collectStudioBackup,
  createManifest,
  validateManifest,
  writeVerifiedBackup,
} from "../../studio/backup-core.mjs";

const bytes = value => new TextEncoder().encode(value);
const hash = async value => createHash("sha256").update(Buffer.from(value)).digest("hex");
const media = new Map([
  ["local-intro", bytes("local intro")],
  ["local-outro", bytes("local outro")],
  ["local-motion", bytes("local motion background")],
]);
const studio = {
  id: "broadcast-local-disposable",
  workspaceId: null,
  localBroadcastId: "broadcast-local-disposable",
  sourceKind: "local-broadcast",
  title: "Disposable Local Studio",
  description: "Synthetic local-broadcast fixture",
  version: null,
  broadcast: { id: "broadcast-local-disposable", title: "Disposable Local Studio" },
  settings: { recordingDestination: "browser" },
  recording: { storageMode: "browser" },
  configuration: {
    activeSceneId: "scene-1",
    selectedBackground: "custom-video",
    studioScenes: [{ id: "scene-1", kind: "standard", title: "Scene 1", layout: "Speaker view" }],
    customBackground: { id: "motion-1", blobKey: "local-motion", fileName: "motion.mp4", mediaType: "video/mp4" },
    videoClips: {
      intro: { id: "intro-1", blobKey: "local-intro", fileName: "intro.mp4", mediaType: "video/mp4" },
      outro: { id: "outro-1", blobKey: "local-outro", fileName: "outro.mp4", mediaType: "video/mp4" },
    },
  },
};

const collected = await collectStudioBackup({ studio, mediaResolver: async reference => media.get(reference.blobKey) || null, hash, now: "2026-10-21T00:00:00.000Z" });
assert.equal(collected.snapshot.sourceKind, "local-broadcast");
assert.equal(collected.snapshot.workspaceId, null);
assert.equal(collected.snapshot.studioId, "broadcast-local-disposable");
assert.equal(collected.includedMedia.length, 3);

const destination = new MemoryBackupDestination();
const written = await writeVerifiedBackup({ backupId: "backup-local-disposable-1", collected, destination, hash, now: "2026-10-21T00:00:01.000Z" });
const manifest = createManifest({ backupId: written.backupId, collected, completedAt: "2026-10-21T00:00:01.000Z" });
assert.equal(validateManifest(manifest), true);
assert.equal(manifest.studio.sourceKind, "local-broadcast");
assert.equal(manifest.studio.workspaceId, null);
assert.equal(manifest.verificationStatus, "VERIFIED");
const storedManifest = JSON.parse(new TextDecoder().decode(await destination.readFile("studios/broadcast-local-disposable/history/backup-local-disposable-1/manifest.json")));
assert.equal(storedManifest.studio.sourceKind, "local-broadcast");
assert.equal((await destination.readFile("studios/broadcast-local-disposable/history/backup-local-disposable-1/COMPLETE")) !== null, true);

const bridgeSource = await readFile(new URL("../../studio/backup-bridge.js", import.meta.url), "utf8");
const workspaceBridgeSource = await readFile(new URL("../../studio/workspace-bridge.js", import.meta.url), "utf8");
assert.match(bridgeSource, /sourceKind === "local-broadcast"/);
assert.match(bridgeSource, /Active Studio identity could not be verified for backup/);
assert.doesNotMatch(bridgeSource, /\|\| list\[0\]/);
assert.match(workspaceBridgeSource, /currentForBackup: currentStudioForBackup/);
assert.match(workspaceBridgeSource, /restoreLocalStudioFromBackup/);

console.log(JSON.stringify({ passed: true, checks: ["local-broadcast collection", "media-inclusive verified write", "local restore bridge present", "unsafe arbitrary workspace fallback removed"] }, null, 2));

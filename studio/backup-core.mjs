/* TPI-STUDIOFLOW-024 Phase 2.
 * Pure backup model, validation, collection, change detection, and test
 * destination primitives. Browser and filesystem APIs stay in backup-bridge.js.
 */

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_APPLICATION_ID = "tpi-studioflow";
export const BACKUP_STATUS = Object.freeze({
  NOT_CONFIGURED: "NOT_CONFIGURED",
  CONNECTED: "CONNECTED",
  UNAVAILABLE: "UNAVAILABLE",
  PERMISSION_REQUIRED: "PERMISSION_REQUIRED",
  FULL: "FULL",
  ERROR: "ERROR",
});

const SECRET_KEY = /(password|secret|token|cookie|authorization|api[-_]?key|credential|session)/i;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/;

export class BackupIncompleteError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "BackupIncompleteError";
    this.code = "BACKUP_INCOMPLETE";
    this.details = details;
  }
}

export class BackupValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "BackupValidationError";
    this.code = "BACKUP_INVALID";
    this.details = details;
  }
}

export class BackupDestinationError extends Error {
  constructor(message, code = "DESTINATION_ERROR") {
    super(message);
    this.name = "BackupDestinationError";
    this.code = code;
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function text(value) {
  return typeof value === "string" ? value : "";
}

function safeId(value, label) {
  const result = text(value).trim();
  if (!SAFE_ID.test(result)) throw new BackupValidationError(`${label} is invalid.`);
  return result;
}

function safeRelativePath(value) {
  const path = text(value);
  if (!path || path.startsWith("/") || path.includes("\\") || path.split("/").includes("..") || /^[A-Za-z]:/.test(path)) {
    throw new BackupValidationError("Backup path is not a safe relative path.", { path });
  }
  return path;
}

function walkSecrets(value, path = "") {
  if (Array.isArray(value)) value.forEach((item, index) => walkSecrets(item, `${path}[${index}]`));
  else if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      if (SECRET_KEY.test(key)) throw new BackupValidationError(`Secret-like field is not allowed: ${path ? `${path}.` : ""}${key}`);
      walkSecrets(item, `${path ? `${path}.` : ""}${key}`);
    });
  }
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (!isObject(value)) return JSON.stringify(value);
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
}

export function stableFingerprint(value) {
  return stable(value);
}

function asBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof Blob !== "undefined" && value instanceof Blob) return value.arrayBuffer().then(buffer => new Uint8Array(buffer));
  if (typeof value === "string") return new TextEncoder().encode(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  throw new TypeError("Backup media resolver must return bytes or a Blob.");
}

export async function sha256Hex(value) {
  const bytes = await asBytes(value);
  if (!globalThis.crypto?.subtle) throw new BackupDestinationError("SHA-256 is unavailable in this runtime.", "HASH_UNAVAILABLE");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function safeFileName(value, fallback) {
  const cleaned = text(value).trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
  return cleaned || fallback;
}

function mediaReference(configuration, role, value, required, index = 0) {
  if (!isObject(value) || !text(value.blobKey).trim()) return null;
  const blobKey = text(value.blobKey).trim();
  const fileName = safeFileName(value.fileName, `${role}-${index + 1}`);
  const extension = fileName.includes(".") ? "" : text(value.mediaType).split("/").at(-1) ? `.${text(value.mediaType).split("/").at(-1)}` : "";
  return {
    assetId: text(value.id).trim() || `${role}-${index + 1}`,
    blobKey,
    role,
    required,
    fileName: fileName + extension,
    mediaType: text(value.mediaType) || "application/octet-stream",
    declaredSize: Number.isFinite(Number(value.size)) ? Number(value.size) : null,
    title: text(value.title) || fileName,
    uploadedAt: text(value.uploadedAt) || null,
    source: configuration,
  };
}

export function collectMediaReferences(configuration = {}) {
  const references = [];
  const push = (role, value, required, index = 0) => {
    const reference = mediaReference(configuration, role, value, required, index);
    if (reference) references.push(reference);
  };
  const customBackgroundSelected = typeof configuration.selectedBackground === "string" && configuration.selectedBackground.toLowerCase().startsWith("custom");
  push("background", configuration.customBackground, customBackgroundSelected);
  push("logo", configuration.customLogo, false);
  (Array.isArray(configuration.overlayAssets) ? configuration.overlayAssets : []).forEach((asset, index) => push("overlay", asset, false, index));
  ["intro", "outro"].forEach(role => push(role, configuration.videoClips?.[role], true));
  push("background-music", configuration.backgroundMusic, false);
  push("sound", configuration.customSound, false);
  (Array.isArray(configuration.customSounds) ? configuration.customSounds : []).forEach((asset, index) => push("sound", asset, false, index));
  return references;
}

function sanitizeConfiguration(configuration = {}) {
  // Preserve unknown valid configuration fields so a backup remains forward
  // compatible with newer StudioFlow settings. Secret-like fields are still
  // rejected recursively below rather than silently dropped.
  const output = clone(configuration);
  walkSecrets(output);
  return output;
}

export function normalizeStudioForBackup(studio) {
  if (!isObject(studio)) throw new BackupValidationError("Studio data must be an object.");
  const studioId = safeId(studio.id || studio.workspaceId || studio.localBroadcastId, "Studio identifier");
  const title = text(studio.title || studio.name).trim();
  if (!title) throw new BackupValidationError("Studio title is required.");
  const sourceKind = studio.sourceKind === "local-broadcast" ? "local-broadcast" : "server-workspace";
  const snapshot = {
    sourceKind,
    studioId,
    workspaceId: sourceKind === "server-workspace" ? text(studio.workspaceId || studio.id) || null : null,
    localBroadcastId: text(studio.localBroadcastId || studio.broadcast?.id) || null,
    studioNumber: Number.isInteger(studio.studioNumber) ? studio.studioNumber : null,
    title,
    description: text(studio.description),
    configurationVersion: Number.isInteger(studio.version) ? studio.version : null,
    applicationVersion: text(studio.applicationVersion) || null,
    broadcast: isObject(studio.broadcast) ? clone(studio.broadcast) : null,
    settings: isObject(studio.settings) ? clone(studio.settings) : null,
    recording: isObject(studio.recording) ? clone(studio.recording) : null,
    configuration: sanitizeConfiguration(studio.configuration || {}),
  };
  walkSecrets(snapshot);
  return snapshot;
}

export async function collectStudioBackup({ studio, mediaResolver, hash = sha256Hex, now = new Date().toISOString(), applicationVersion = "unknown" }) {
  const snapshot = normalizeStudioForBackup({ ...studio, applicationVersion: studio.applicationVersion || applicationVersion });
  const references = collectMediaReferences(snapshot.configuration);
  const includedMedia = [];
  const missingRequired = [];
  const excludedOptional = [];
  const resolver = typeof mediaResolver === "function" ? mediaResolver : async () => null;

  for (const reference of references) {
    const resolved = await resolver(reference);
    if (resolved == null) {
      (reference.required ? missingRequired : excludedOptional).push({ assetId: reference.assetId, blobKey: reference.blobKey, role: reference.role, reason: "MEDIA_UNAVAILABLE" });
      continue;
    }
    const bytes = await asBytes(resolved);
    const safeRole = safeFileName(reference.role, "asset");
    const fileName = `${safeRole}/${safeFileName(reference.blobKey, reference.assetId)}-${safeFileName(reference.fileName, "asset")}`;
    includedMedia.push({ reference, bytes, relativePath: `media/${fileName}`, size: bytes.byteLength, sha256: await hash(bytes) });
  }

  if (missingRequired.length) {
    throw new BackupIncompleteError("Required Studio media could not be resolved; the backup was not finalized.", { missingRequired, excludedOptional });
  }
  return { snapshot, includedMedia, missingRequired, excludedOptional, createdAt: now };
}

export function createManifest({ backupId, collected, completedAt = null }) {
  const manifest = {
    applicationId: BACKUP_APPLICATION_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    backupId: safeId(backupId, "Backup identifier"),
    studio: {
      sourceKind: collected.snapshot.sourceKind,
      studioId: collected.snapshot.studioId,
      workspaceId: collected.snapshot.workspaceId,
      localBroadcastId: collected.snapshot.localBroadcastId,
      studioNumber: collected.snapshot.studioNumber,
      title: collected.snapshot.title,
    },
    configurationVersion: collected.snapshot.configurationVersion,
    applicationVersion: collected.snapshot.applicationVersion,
    broadcast: collected.snapshot.broadcast,
    createdAt: collected.createdAt,
    completedAt,
    scenes: (Array.isArray(collected.snapshot.configuration.studioScenes) ? collected.snapshot.configuration.studioScenes : []).map(scene => ({
      id: text(scene?.id), title: text(scene?.title), kind: text(scene?.kind), layout: text(scene?.layout),
    })),
    media: collected.includedMedia.map(item => ({
      assetId: item.reference.assetId,
      role: item.reference.role,
      blobKey: item.reference.blobKey,
      relativePath: item.relativePath,
      fileName: item.reference.fileName,
      mediaType: item.reference.mediaType,
      size: item.size,
      sha256: item.sha256,
    })),
    excludedOptionalAssets: collected.excludedOptional,
    missingRequiredAssets: collected.missingRequired,
    verificationStatus: completedAt ? "VERIFIED" : "STAGED",
  };
  validateManifest(manifest);
  return manifest;
}

export function validateManifest(manifest) {
  if (!isObject(manifest)) throw new BackupValidationError("Manifest must be an object.");
  if (manifest.applicationId !== BACKUP_APPLICATION_ID) throw new BackupValidationError("Unsupported backup application.");
  if (manifest.formatVersion !== BACKUP_FORMAT_VERSION) throw new BackupValidationError("Unsupported backup manifest version.");
  safeId(manifest.backupId, "Backup identifier");
  if (!isObject(manifest.studio)) throw new BackupValidationError("Manifest Studio identity is missing.");
  safeId(manifest.studio.studioId, "Manifest Studio identifier");
  if (!text(manifest.studio.title).trim()) throw new BackupValidationError("Manifest Studio title is missing.");
  if (!Array.isArray(manifest.scenes) || !Array.isArray(manifest.media) || !Array.isArray(manifest.excludedOptionalAssets) || !Array.isArray(manifest.missingRequiredAssets)) throw new BackupValidationError("Manifest collections are invalid.");
  if (manifest.broadcast !== null && manifest.broadcast !== undefined && !isObject(manifest.broadcast)) throw new BackupValidationError("Manifest broadcast metadata is invalid.");
  const paths = new Set();
  manifest.media.forEach(asset => {
    safeId(asset.assetId, "Media asset identifier");
    safeRelativePath(asset.relativePath);
    if (paths.has(asset.relativePath)) throw new BackupValidationError("Manifest contains duplicate media paths.");
    paths.add(asset.relativePath);
    if (!/^\d+$/.test(String(asset.size)) || !/^[a-f0-9]{64}$/.test(text(asset.sha256))) throw new BackupValidationError("Manifest media integrity fields are invalid.");
  });
  walkSecrets(manifest);
  return true;
}

function remapBlobKeys(value, mediaMap) {
  if (Array.isArray(value)) return value.map(item => remapBlobKeys(item, mediaMap));
  if (!isObject(value)) return value;
  const output = {};
  Object.entries(value).forEach(([key, item]) => {
    output[key] = key === "blobKey" && mediaMap.has(text(item)) ? mediaMap.get(text(item)) : remapBlobKeys(item, mediaMap);
  });
  return output;
}

function mediaFile(mediaFiles, path) {
  if (mediaFiles instanceof Map) return mediaFiles.get(path);
  return mediaFiles && mediaFiles[path];
}

export async function prepareRestoredStudio({ manifest, studio, mediaFiles, newWorkspaceId, newBroadcastId, hash = sha256Hex }) {
  validateManifest(manifest);
  if (manifest.verificationStatus !== "VERIFIED" || !text(manifest.completedAt).trim()) {
    throw new BackupValidationError("Only a completed, verified backup can be restored.");
  }
  if (!isObject(studio) || !isObject(studio.configuration)) throw new BackupValidationError("Backup Studio configuration is missing.");
  const sourceId = safeId(studio.studioId || studio.workspaceId, "Backup Studio identifier");
  if (sourceId !== manifest.studio.studioId) throw new BackupValidationError("Backup Studio identity does not match its manifest.");
  if (text(studio.title).trim() !== text(manifest.studio.title).trim()) throw new BackupValidationError("Backup Studio title does not match its manifest.");
  if (manifest.missingRequiredAssets.length) throw new BackupIncompleteError("The backup is missing required media assets.", { missingRequired: manifest.missingRequiredAssets });
  const workspaceId = safeId(newWorkspaceId, "Restored workspace identifier");
  const broadcastId = safeId(newBroadcastId, "Restored broadcast identifier");
  const mediaMap = new Map();
  const restoredMedia = [];
  const seenPaths = new Set();
  for (const [index, asset] of manifest.media.entries()) {
    if (seenPaths.has(asset.relativePath)) throw new BackupValidationError("Backup contains duplicate media paths.");
    seenPaths.add(asset.relativePath);
    const source = mediaFile(mediaFiles, asset.relativePath);
    if (source == null) throw new BackupIncompleteError(`Required backup media is missing: ${asset.relativePath}`, { asset });
    const assetBytes = await asBytes(source);
    if (assetBytes.byteLength !== asset.size || await hash(assetBytes) !== asset.sha256) {
      throw new BackupValidationError(`Backup media failed integrity verification: ${asset.relativePath}`, { asset });
    }
    const restoredBlobKey = `restored-${safeFileName(broadcastId, "studio")}-${safeFileName(asset.assetId, `asset-${index + 1}`)}-${index + 1}`;
    mediaMap.set(asset.blobKey, restoredBlobKey);
    restoredMedia.push({ ...clone(asset), blobKey: restoredBlobKey, bytes: new Uint8Array(assetBytes) });
  }
  const broadcast = clone(studio.broadcast || manifest.broadcast || {});
  broadcast.id = broadcastId;
  broadcast.title = manifest.studio.title;
  delete broadcast.tpiSync;
  const state = {
    broadcast,
    settings: isObject(studio.settings) ? clone(studio.settings) : {},
    recording: isObject(studio.recording) ? clone(studio.recording) : {},
    configuration: remapBlobKeys(sanitizeConfiguration(studio.configuration), mediaMap),
  };
  walkSecrets(state);
  return {
    workspaceId,
    broadcastId,
    title: manifest.studio.title,
    description: text(studio.description),
    state,
    media: restoredMedia,
    sourceStudioId: sourceId,
  };
}

export async function verifyWrittenBackup({ destination, path, manifest, requireComplete = false, hash = sha256Hex }) {
  if (!destination || typeof destination.readFile !== "function") throw new BackupDestinationError("Backup destination cannot read back files.", "READBACK_UNAVAILABLE");
  validateManifest(manifest);
  const manifestBytes = await destination.readFile(`${path}/manifest.json`);
  if (!manifestBytes) throw new BackupDestinationError("Written manifest could not be read back.", "READBACK_MISSING");
  const storedManifest = JSON.parse(new TextDecoder().decode(manifestBytes));
  validateManifest(storedManifest);
  if (storedManifest.backupId !== manifest.backupId || storedManifest.verificationStatus !== manifest.verificationStatus) throw new BackupDestinationError("Written manifest does not match the verified manifest.", "READBACK_MISMATCH");
  const studioBytes = await destination.readFile(`${path}/studio.json`);
  if (!studioBytes) throw new BackupDestinationError("Written Studio configuration could not be read back.", "READBACK_MISSING");
  JSON.parse(new TextDecoder().decode(studioBytes));
  for (const asset of manifest.media) {
    const bytes = await destination.readFile(`${path}/${asset.relativePath}`);
    if (!bytes || bytes.byteLength !== asset.size || await hash(bytes) !== asset.sha256) throw new BackupDestinationError(`Written media failed verification: ${asset.relativePath}`, "HASH_MISMATCH");
  }
  if (requireComplete) {
    const marker = await destination.readFile(`${path}/COMPLETE`);
    if (!marker) throw new BackupDestinationError("Backup completion marker is missing.", "COMPLETION_MARKER_MISSING");
  }
  return { verified: true, backupId: manifest.backupId, mediaCount: manifest.media.length };
}

export async function writeVerifiedBackup({ backupId, collected, destination, applicationVersion = "unknown", now = new Date().toISOString() }) {
  if (!destination || typeof destination.writeFile !== "function" || typeof destination.publish !== "function") throw new BackupDestinationError("A staged backup destination is required.", "DESTINATION_UNAVAILABLE");
  const safeBackupId = safeId(backupId, "Backup identifier");
  const root = `studios/${collected.snapshot.studioId}/history`;
  const staging = `${root}/${safeBackupId}.staging`;
  const published = `${root}/${safeBackupId}`;
  const stagedManifest = createManifest({ backupId: safeBackupId, collected, completedAt: null });
  try {
    await destination.writeFile(`${staging}/studio.json`, `${JSON.stringify(collected.snapshot, null, 2)}\n`, "application/json");
    for (const media of collected.includedMedia) await destination.writeFile(`${staging}/${media.relativePath}`, media.bytes, media.reference.mediaType);
    await destination.writeFile(`${staging}/manifest.json`, `${JSON.stringify(stagedManifest, null, 2)}\n`, "application/json");
    await destination.publish(staging, published);
    const completed = createManifest({ backupId: safeBackupId, collected, completedAt: now });
    await destination.writeFile(`${published}/manifest.json`, `${JSON.stringify(completed, null, 2)}\n`, "application/json");
    await verifyWrittenBackup({ destination, path: published, manifest: completed });
    await destination.writeFile(`${published}/COMPLETE`, `${safeBackupId}\n`, "text/plain");
    await verifyWrittenBackup({ destination, path: published, manifest: completed, requireComplete: true });
    await destination.writeFile(`${root}/CURRENT.json`, `${JSON.stringify({ backupId: safeBackupId, manifestPath: `${published}/manifest.json`, verifiedAt: now }, null, 2)}\n`, "application/json");
    return { backupId: safeBackupId, manifest: completed, path: published, status: "VERIFIED", verification: { mediaCount: completed.media.length } };
  } catch (error) {
    if (error instanceof BackupDestinationError) throw error;
    throw new BackupDestinationError(error instanceof Error ? error.message : "Backup destination write failed.", "DESTINATION_WRITE_FAILED");
  }
}

export class BackupChangeTracker {
  constructor({ debounceMs = 700 } = {}) {
    this.debounceMs = debounceMs;
    this.lastSuccessfulFingerprint = "";
    this.inFlight = null;
    this.timer = null;
    this.pending = null;
  }

  hasChanges(snapshot) {
    const fingerprint = stableFingerprint(snapshot);
    return { changed: fingerprint !== this.lastSuccessfulFingerprint, fingerprint };
  }

  markSuccessful(fingerprint) {
    this.lastSuccessfulFingerprint = fingerprint;
  }

  schedule(snapshot, job) {
    const { changed, fingerprint } = this.hasChanges(snapshot);
    if (!changed) return Promise.resolve({ skipped: true, reason: "UNCHANGED", fingerprint });
    if (this.inFlight) return this.inFlight;
    if (this.pending) {
      this.pending.fingerprint = fingerprint;
      this.pending.job = job;
      return this.pending.promise;
    }
    return new Promise((resolve, reject) => {
      const pending = { fingerprint, job, resolve, reject, promise: null };
      pending.promise = new Promise((nextResolve, nextReject) => {
        pending.resolve = nextResolve;
        pending.reject = nextReject;
      });
      this.pending = pending;
      this.timer = setTimeout(() => {
        this.timer = null;
        const current = this.pending;
        this.pending = null;
        this.inFlight = Promise.resolve().then(current.job).then(result => {
          this.markSuccessful(current.fingerprint);
          return { skipped: false, fingerprint: current.fingerprint, result };
        }).finally(() => { this.inFlight = null; });
        this.inFlight.then(current.resolve, current.reject);
      }, this.debounceMs);
      pending.promise.then(resolve, reject);
    });
  }
}

export class MemoryBackupDestination {
  constructor() {
    this.files = new Map();
    this.failWrites = false;
    this.failPublish = false;
    this.permission = "granted";
  }

  async writeFile(path, data) {
    if (this.permission !== "granted") throw new BackupDestinationError("Destination permission is unavailable.", "PERMISSION_DENIED");
    if (this.failWrites) throw new BackupDestinationError("Synthetic destination is full or unwritable.", "DESTINATION_FULL");
    const bytes = await asBytes(data);
    this.files.set(safeRelativePath(path), new Uint8Array(bytes));
  }

  async publish(staging, published) {
    if (this.failPublish) throw new BackupDestinationError("Synthetic publish was interrupted.", "PUBLISH_INTERRUPTED");
    const prefix = `${staging}/`;
    const entries = [...this.files.entries()].filter(([path]) => path.startsWith(prefix));
    entries.forEach(([path, data]) => { this.files.set(`${published}/${path.slice(prefix.length)}`, new Uint8Array(data)); });
  }

  async readFile(path) {
    const bytes = this.files.get(safeRelativePath(path));
    return bytes ? new Uint8Array(bytes) : null;
  }

  has(path) {
    return this.files.has(path);
  }
}


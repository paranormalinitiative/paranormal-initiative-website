# TPI-STUDIOFLOW-032 — Backup & Recovery

## Scope

This directive completes the local development Backup & Recovery path without
activating backups for the protected Crossroads of the Unknown Studio. The
implementation is local-first and does not require Cloudflare R2, paid cloud
storage, or a production endpoint.

## Implemented architecture

- `studio/backup-core.mjs` is the versioned, testable package core. It
  validates Studio identity, titles, manifest version, media paths, sizes, and
  SHA-256 hashes. Unknown configuration fields are retained through the
  allow-listed application-level serialization.
- `studio/backup-bridge.js` is the browser adapter. It uses the File System
  Access API when the browser exposes a secure-context directory picker, stores
  the directory handle in the dedicated `studioflow-backups` IndexedDB
  database, and keeps settings scoped by Studio workspace ID.
- `studio/workspace-asset-state-bridge.js` preserves a restore package's
  configuration during the supported workspace-create request instead of
  merging the current owner's browser-local asset state into it.
- `studio/workspace-bridge.js` opens a successfully restored Studio through the
  existing active-workspace path. Restore is always create-as-new; it does not
  overwrite Crossroads or any existing workspace.

Automatic backups remain off by default. A destination is never selected by
the application and no owner destination was configured during this directive.
Normal Studio autosave remains independent from backup status.

## Package format

Each verified package is staged under a Studio-specific history path and
contains:

```text
studios/<workspace-id>/history/<backup-id>/
  studio.json
  manifest.json
  media/<role>/<safe-file-name>
  COMPLETE
studios/<workspace-id>/history/CURRENT.json
```

The manifest records format version, backup ID, workspace and broadcast
identity, Studio title, source configuration version, scenes, media metadata,
relative paths, sizes, hashes, optional exclusions, and completion status.
The completion marker is written only after read-back verification. Failed or
interrupted staging cannot become the current verified package, and the last
verified package is preserved.

## Supported media and recording boundary

The collector resolves supported Studio media references from the existing
`studioflow-recordings` `recordingBlobs` object store and writes the actual
bytes, not only references. Intro, outro, custom backgrounds (including
custom video backgrounds), logos, overlays/banners, background music, and
custom sounds are represented when their application references resolve to a
Blob. Required intro/outro and selected custom-background assets block
finalization when unavailable; optional assets are recorded as exclusions.

Recording metadata is preserved as configuration metadata, but recording byte
backup is intentionally excluded from this directive. Recording-library byte
backup needs a separate large-file/retention design and must not be implied by
a verified Studio backup.

## Automatic backup and destination handling

Meaningful confirmed workspace-save and storage-change events schedule a
debounced backup. A single in-flight operation is allowed, identical verified
fingerprints are skipped, and the actual collected workspace ID scopes the
fingerprint, status, and history. Folder permission loss, disconnection, and
write/read-back failures produce a failed or unavailable status while normal
Studio autosave continues.

Opera/Chromium folder access requires an explicit user gesture and may require
permission renewal after browser restart. The application never silently
redirects to another destination. Unsupported mobile/tablet contexts are
identified as unavailable for unattended folder backup; a portable package
export remains the appropriate future fallback.

## Restore workflow

Restore is initiated by an explicit `Restore Studio` action and a user-selected
backup folder. The package must contain a verified manifest, `COMPLETE`, valid
relative paths, a matching `studio.json`, and media whose size and SHA-256
hashes all verify. The restore path then:

1. Creates new workspace and broadcast identities.
2. Remaps backed-up media Blob keys to new local Blob keys.
3. Preserves supported configuration, scenes, settings, recording metadata,
   and unknown valid fields.
4. Creates the new workspace through the supported local development API.
5. Dispatches the existing workspace-restored event so the new Studio opens.
6. Removes newly written restore blobs if workspace creation fails.

Corrupt, incomplete, unsupported, unsafe, or missing-media packages are
rejected before a workspace is created. Repeated restore clicks are guarded by
an in-flight lock. Original backups and the currently active Studio are not
modified.

## Opera verification boundary

Opera is confirmed on `http://127.0.0.1:8787/studio/` with Crossroads of the
Unknown active, its scenes and existing media references visible, and the room
bridge connected. The current visible panel is the production Media assets
panel; the source-integrated Backup & Recovery card is injected into the
application's `.settings-panel` surfaces. No real folder was selected, no
filesystem permission was requested, no restore was initiated, and Crossroads
automatic backups remain off. Therefore browser-level folder permission and
restore acceptance remain pending rather than being represented as passed.

## Verification evidence

- TPI-032 synthetic backup/restore checks: **11/11 passed**.
- TPI-030 backup checks: **13/13 passed**.
- TPI-031 overlay checks: **12/12 passed**.
- TPI-017 checks: **14/14 passed**.
- TPI-023 checks: **14/14 passed**.
- TPI-025 checks: **11/11 passed**.
- TPI-027 checks: **21/21 passed**.
- TPI-024 Phase 2 checks: **23/23 passed**.
- Combined listed checks: **119/119 passed**.
- JavaScript syntax checks: passed for the modified bridge/core files.
- `git diff --check`: passed after the final source edits.

No production resource was accessed. No D1 reset or migration was run. No
owner media was exported, no owner backup destination was configured, and no
commit or push was performed.

## Owner activation procedure after separate review

In Opera, open the Studio settings surface, choose a dedicated backup folder,
confirm that the status changes to connected, and leave Automatic Backups off
until the destination is intentionally reviewed. Use `Backup Now` for an
initial verified package, confirm the history/status result, then explicitly
enable Automatic Backups for that Studio. Use `Reconnect Folder` after a
permission or external-drive interruption. Restore is selected from a verified
backup folder and always creates a new Studio; it is not a replacement workflow.


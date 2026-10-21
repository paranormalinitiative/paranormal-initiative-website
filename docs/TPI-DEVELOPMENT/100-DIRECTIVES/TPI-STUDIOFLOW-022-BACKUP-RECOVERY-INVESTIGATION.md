# TPI-STUDIOFLOW-022 — Development Studio Backup and Recovery Investigation

## Directive status

**Investigation complete / backup implementation deferred.** This directive was
limited to read-only architecture inspection and documentation. No backup was
created, no Studio was exported or restored, and no browser storage or database
record was changed.

## Scope and safety boundary

- Canonical repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Authoritative browser: Opera Air
- Local StudioFlow origin: `http://127.0.0.1:8787/studio/`
- Local Worker: port `8787`
- Room server: port `8788`
- Production: not accessed
- Temporary guest gateway: left untouched

The investigation did not clear Opera storage, enumerate private browser profile
files, copy cookies, export D1, copy R2, run migrations, restart services, or
invoke StudioFlow import/export controls. The Codex browser remains an isolated
synthetic-testing surface and was not treated as the owner's workspace.

## Executive summary

StudioFlow currently has a split persistence model:

1. Authenticated Studio identity, configuration snapshots, scenes, guest
   settings, ownership, versioning, archive state, and asset metadata are shared
   through the local Worker and the local development D1 database.
2. Browser-local state remains origin/profile-specific. LocalStorage mirrors
   active Studio and UI preferences, while IndexedDB holds uploaded media bytes,
   recordings, recording checkpoints, avatar bytes, and file-system handles.
3. The existing Studio configuration JSON backup is useful for configuration
   recovery, but it is not a complete media backup. Its asset entries contain
   browser-local `blobKey` references; the referenced bytes are not included in
   the JSON package.

Therefore a reliable future recovery system must be an application-level,
versioned package that combines validated Studio configuration with a separately
manifested media pack. Copying an Opera profile or browser database is not a
safe replacement: it risks credentials and private session state, is browser-
version-specific, and does not provide a clear non-destructive restore model.

## Current storage architecture

### Server-side local D1 source of truth

The relevant source and migrations are:

- `migrations/0051_studioflow_workspaces.sql`
- `migrations/0052_my_studios.sql`
- `migrations/0053_studioflow_creator_production_lock.sql`
- `functions/api/[[path]].js`
- `studio/workspace-bridge.js`
- `studio/workspace-asset-state-bridge.js`

The local Worker exposes owner-scoped workspace routes:

- `GET`/`POST` `/api/studio/workspaces`
- `GET`/`PUT`/`PATCH` `/api/studio/workspaces/:id`
- duplicate, archive, delete, and restore workspace actions
- `/api/studio/production/*` for production-session coordination

`studio_workspaces` stores:

| Data | Storage | Notes |
| --- | --- | --- |
| Studio identifier | `studio_workspaces.id` | Server-generated identifier |
| Owner relationship | `owner_id` | Foreign key to `contributors`, enforced by owner-scoped handlers |
| Channel/room relationships | `channel_id`, `room_id` | Nullable foreign keys |
| Local broadcast identity | `local_broadcast_id` | Unique within an owner |
| Studio name | `title` | Returned as the Studio display title |
| Description | `description` | Server-persisted metadata |
| Workspace type/status | `workspace_type`, `status` | Active/archived state is server-side |
| Studio number | `studio_number` | Added by migration 0052; unique per owner |
| Soft deletion | `deleted_at` | Recovery metadata; deletion is not an asset backup |
| Configuration snapshot | `state_json` | Normalized allow-listed Studio state |
| Optimistic version | `version` | Prevents stale concurrent saves |
| Activity timestamps | `last_opened_at`, `created_at`, `updated_at` | Useful for backup ordering and restore preview |

`studio_number_allocations` maintains the next per-owner My Studios number.
The production-session tables added by migration 0053 protect the creator-level
production lock. A backup must not treat active production sessions, lock
heartbeats, or session identifiers as portable Studio configuration.

The normalized `state_json` allow-list currently covers the supported Studio
configuration, including selected background, active scene, logo visibility and
placement, style/widget/general settings, guest permissions, normalized custom
background/logo metadata, overlays, intro/outro video metadata, music and sound
metadata, scenes and scene layouts, and the banner ticker. It is capped at
32,768 bytes by the server. The normalized asset entries include fields such as
asset ID, `blobKey`, file name, kind, media type, size, title, and upload time.
These are references and metadata, not the media bytes themselves.

Workspace reads update `last_opened_at`; writes are authenticated, owner-scoped,
validated, and version-aware. Archive/delete/restore are state transitions, not
a complete backup or media-deletion mechanism.

### Browser-local localStorage

The inspected StudioFlow bridge and bundle use origin/profile-scoped
localStorage for the following categories:

- active Studio and broadcast IDs
- cached workspace metadata
- mirrored Studio configuration and scene selections
- branding and asset references
- guest settings
- recording preferences and storage preference
- camera/microphone and display preferences
- route and last-active-Studio state
- recording/library summaries
- teleprompter and other UI preferences

Known keys include `studioflow.tpiActiveStudioId.v1`,
`studioflow.tpiWorkspaceCache.v2`, `studioflow.activeBroadcastId`,
`studioflow.broadcasts`, `studioflow.recordingPreferences.v2`,
`studioflow.recordingStorage.v1`, `studioflow.route`,
`studioflow.selectedBackground`, `studioflow.activeSceneId`,
`studioflow.customBackground`, `studioflow.customLogo`,
`studioflow.overlayAssets`, `studioflow.videoClips`,
`studioflow.studioScenes`, `studioflow.recordingSessions`, and
`studioflow.libraryItems`. Additional compiled-bundle preference keys include
audio processing, camera resolution, microphone volume, and resolution-badge
preferences.

LocalStorage is not the authoritative server workspace database. It is essential
for restoring a browser's current UI context and local media references, but it
cannot safely be copied between Opera and the Codex browser as a substitute for
an application-level backup.

No localStorage contents were read, cleared, or exported from Opera during this
investigation.

### Session storage, cookies, and ephemeral coordination

No StudioFlow `sessionStorage` use was found in the inspected bridge/bundle
paths. The local authentication implementation uses the `tpi_session` cookie
for the local origin. That cookie is a credential and must never be included in
a portable Studio backup.

`BroadcastChannel("tpi-studio-production")` coordinates ephemeral tab/session
state for production locking. It is not durable Studio data and must not be
backed up as configuration.

### IndexedDB and media bytes

The compiled StudioFlow bundle opens these browser-local databases:

#### `studioflow-recordings`, version 3

Object stores:

- `recordingBlobs`: Blob values used by local recordings and local media lookup
- `recordingChunks`: interrupted-recording chunks
- `recordingSessions`: recording recovery checkpoints and session metadata
- `storageHandles`: browser file-system handles for selected storage locations
- `libraryFileHandles`: browser file-system handles for library files

The source-level `Cr(blobKey)` lookup reads `recordingBlobs` and returns a Blob;
the application then creates an object URL for playback. This confirms that
uploaded intro/outro video, logo, overlay, background, audio, and similar local
media bytes are not stored in D1 merely because the D1 state includes an asset
reference.

#### `studioflow-avatars`, version 1

The `avatarImages` store holds the local avatar Blob under `user-avatar`.

#### Browser file-system handles

Folder recording and file-backed library behavior can depend on the persisted
`storageHandles` and `libraryFileHandles` entries plus the continued existence
and permission of the selected local folder or external drive. A handle is not
the file contents and is not a portable backup.

No evidence in the current StudioFlow upload/recovery path shows intro/outro
media being written to D1 or R2. TPI has R2 bindings for other application
features, but that does not make R2 a StudioFlow media backup for the current
local browser path.

## Shared versus Opera-specific data

| Data | Shared through local Worker/D1 | Opera-specific | Recovery consequence |
| --- | --- | --- | --- |
| Studio name/ID/number | Yes | No | Can be restored from server data if the owner is authorized |
| Normalized Studio state/scenes | Yes | Mirrored locally | D1 is authoritative; local state may be stale/cache-only |
| Guest settings | Yes, when part of workspace state | UI mirrors may exist | Restore server state, then rehydrate UI |
| Asset metadata and `blobKey` | Yes, in workspace state | Local references are profile-scoped | Metadata without matching blobs is incomplete |
| Uploaded media bytes | No | Yes, IndexedDB | Must be included in a future media pack or separately recovered |
| Recording blobs/chunks/checkpoints | No | Yes, IndexedDB | Browser/profile loss can remove recovery data |
| Storage/file handles | No | Yes | Reauthorization may be required after restore |
| Last-active Studio/UI route | No | Yes | Safe to reconstruct; not a server backup requirement |
| Auth cookie/session token | No | Yes | Never export; require a new login |
| Production lock/tab channel | No | Transient | Never restore as persistent Studio state |

## Data-loss risk assessment

This assessment is architecture-based and was not validated by destructive
testing.

| Event | Risk | Potential impact |
| --- | --- | --- |
| Clear Opera localStorage and IndexedDB | CRITICAL | Local media bytes, recordings, checkpoints, avatars, handles, preferences, and local references can be lost while D1 metadata remains |
| Reset or replace local development D1 | CRITICAL | Studio names, ownership, state, scenes, guest settings, archive state, and version history become unavailable |
| Change origin/port/protocol | CRITICAL | New origin receives separate storage and cookie scope; the app may appear empty and local media references will not resolve |
| Replace compiled StudioFlow assets incompatibly | HIGH | Existing local state may no longer be readable or may render without matching media/recovery behavior |
| Remove local media directory or external drive | HIGH | File-backed recordings/assets become unavailable even when metadata remains |
| Switch from Opera to another browser | HIGH | Shared D1 Studios may be visible after login, but Opera-local media, recordings, handles, and preferences are not present |
| Change branch or development bindings | HIGH | The app may point at a different schema, D1, R2, asset build, or origin; data may be inaccessible without being physically deleted |
| Browser crash or interrupted save | HIGH | Latest unsaved UI state or in-flight media/recovery checkpoint can be incomplete; versioned D1 writes reduce but do not eliminate this risk |
| Partial D1 corruption | HIGH to CRITICAL | Affected rows or relationships may be unreadable; scope depends on the damaged database structures |
| Failed development migration | HIGH | Schema/API mismatch can block reads or writes; existing data may remain but be operationally unavailable |
| Accidental Studio deletion | MEDIUM | Current deletion is recoverable through server soft-delete/restore, but local media is not guaranteed to be restored with the row |
| Rebuilding/restarting Worker with same bindings | LOW | Temporary interruption; normally no data loss if local state and bindings remain unchanged |
| Restarting room server on 8788 | LOW for persisted data / MEDIUM for active session | Room state is in-memory and active guests/session state can be interrupted |
| Normal browser reload | LOW | Rehydrates from server/local storage; transient playback state should not be treated as backup data |

## Backup option comparison

### A. Local development D1 backup

**Feasible, but not executed.** A future implementation should use the current
Cloudflare/Wrangler-supported D1 export mechanism for the explicitly selected
development database, or the documented file-backed local-state mechanism for
the local foundation. The exact installed Wrangler version, local state path,
and export command must be verified at implementation time. The production
configuration must never be used by a development backup command.

The export should be read-only with respect to the running application and
stored outside the repository in a permission-restricted backup directory.
The backup must record the database binding, schema/migration state, creation
time, and checksum. No export was started under TPI-STUDIOFLOW-022.

### B. Individual Studio configuration export

**Feasible at the configuration level.** Existing StudioFlow workspace backup
logic uses an application-level envelope similar to:

```json
{
  "applicationId": "tpi-studioflow",
  "formatVersion": 1,
  "backupType": "workspace-configuration",
  "exportedAt": "<timestamp>",
  "workspace": {
    "title": "<studio title>",
    "description": "<description>",
    "state": "<normalized state>"
  }
}
```

This is safer than copying browser internals and can support a portable,
non-destructive restore. It currently does not contain media bytes; it preserves
references such as `blobKey`, which are only useful when the corresponding
browser-local media is also present. No export was invoked during this
investigation.

### C. Media backup

**Feasible only if the application explicitly reads and packages the permitted
media blobs.** A future media pack should use application-level reads from the
StudioFlow media store, not a raw Opera profile copy. It should include a
manifest with asset ID, logical kind, MIME type, file name, size, upload time,
source reference, backup media ID, and SHA-256. Missing blobs must be reported
before a backup is marked complete.

Recording files, interrupted chunks, avatars, and user-selected folder files
should be separate categories so a configuration restore cannot imply that a
recording backup exists.

### D. Browser-specific data

**Do not use raw browser-profile backup as the primary strategy.** Browser
databases contain credentials, sessions, unrelated browsing data, browser
version-specific structures, and private handles. A future application-level
export should include only supported Studio data and should require a fresh
authentication after restore. Local UI preferences can be re-created or
included as explicitly allow-listed non-secret fields.

## Recommended backup architecture

Use a versioned package stored outside the repository, for example:

```text
tpi-studioflow-backup-<timestamp>/
  manifest.json
  workspace.json
  studios/
    <studio-id>.json
  media/
    <sha256>.<extension>
  media-manifest.json
  d1/
    development-export.sql
  validation-report.json
  README.txt
```

The package should be generated from Opera through a guarded application-level
flow, with D1 backup selected separately and explicitly. It should never include
passwords, `tpi_session`, API keys, provider tokens, stream keys, cookies,
session IDs, active production locks, or unrelated browser profile data.

### Proposed individual Studio format

Each Studio file should include:

- application ID and format version
- export timestamp and source origin label
- Studio ID, number, title, description, and non-secret status
- normalized configuration state
- scene IDs, titles, ordering, kinds, and layouts
- guest permission settings
- asset metadata and stable backup media IDs
- source workspace version and timestamps
- schema/migration compatibility metadata

It should omit owner credentials, authentication cookies, production-session
tokens, active locks, and unrelated Studios. An individual restore should default
to creating a new owned Studio or staging a diff, not overwriting the selected
Studio.

### Proposed full-workspace format

The full package should contain the individual Studio files plus a workspace
manifest, D1 schema/migration metadata, media manifest, checksum report, and
compatibility report. Archived/deleted Studios should be included only when the
owner explicitly selects them for recovery. Active production sessions should
be excluded as transient state.

## Integrity requirements

Before a backup is considered valid, the future validator should confirm:

1. The package application ID and format version are supported.
2. JSON is parseable and contains only allow-listed fields.
3. Studio IDs are unique and cross-references are resolvable.
4. Scene order has no duplicate or missing scene references.
5. Every asset reference maps to a media-manifest entry.
6. Every media entry has size, MIME type, category, and SHA-256.
7. Actual media bytes match the manifest hash and declared size.
8. Missing or unreadable blobs are listed and make completeness fail.
9. D1 schema/migration metadata is recorded and compatible.
10. Newer destination versions are detected before restore.
11. Secrets and credential-like fields are absent.
12. The package itself has a top-level checksum/signature or equivalent
    tamper-evident record.

The validator must distinguish `COMPLETE`, `COMPLETE_WITH_MISSING_MEDIA`,
`INCOMPATIBLE`, `CORRUPT`, and `NOT_VALIDATED`; it must not label a metadata-only
package as a complete Studio backup.

## Proposed recovery workflow

1. Select a backup and run a read-only integrity/compatibility check.
2. Show the Studios, scenes, media, versions, and missing references found.
3. Produce a diff against the current owner-scoped development state.
4. Refuse silent overwrite of a newer destination version.
5. Stage media into the application-owned browser store or a selected safe
   destination, checking hashes before making references active.
6. Restore an individual Studio as a new copy by default; require an explicit
   conflict decision for replacement.
7. Restore configuration through the authenticated workspace API so owner
   isolation and validation remain active.
8. Rehydrate local preferences only after the server and media references pass
   validation.
9. Revalidate all scene and asset references.
10. Write a restore report and offer rollback for staged changes.

Full development restore should first create a new isolated recovery namespace or
staging set. It should never automatically replace the current workspace. Scene
recovery should support a single scene diff. Media recovery should identify the
exact missing asset and show its checksum before replacement.

## Security requirements

- Store backup directories outside Git with restrictive local permissions.
- Do not include passwords, cookies, session tokens, API keys, stream keys, or
  provider credentials.
- Require fresh authentication after restore.
- Keep backup and restore endpoints authenticated and owner-scoped.
- Validate every imported field against the same allow-list as normal saves.
- Reject unrecognized fields rather than silently persisting them.
- Require explicit conflict confirmation before replacing newer state.
- Do not upload backups to external services automatically.
- Keep media and configuration manifests together so missing bytes are visible.
- Log backup/restore metadata without logging private media content or secrets.

## Recommended interface location

The existing My Studios management menu is the best entry point for an
individual Studio export because it is already scoped to the selected Studio.
A dedicated Backup & Recovery screen reachable from that menu would be clearer
for full-workspace backups, manifest validation, restore preview, and recovery
history. The existing Export Studio Configuration action should remain the
configuration-level path until a media-inclusive package is deliberately
implemented.

No interface changes were made by TPI-STUDIOFLOW-022.

## Future implementation phases

1. Define and offline-validate the versioned manifest schema.
2. Add a read-only individual Studio package export in Opera.
3. Add application-level media manifest/export with hash validation.
4. Add an explicitly development-scoped D1 export command and validation.
5. Add restore preview and version/conflict comparison.
6. Add non-destructive individual Studio restore as a new copy.
7. Add full-workspace staging and recovery.
8. Run owner-approved Opera backup/recovery drills using synthetic copies.

## Remaining unknowns

- The exact local D1 state-file/export location and installed Wrangler export
  syntax require verification during a future implementation task.
- The current media lookup store is identified as `recordingBlobs`, but a future
  exporter must define which blob keys belong to which Studio before copying.
- Opera-specific file-system handle behavior across browser restart and OS
  permission changes needs owner-approved testing.
- IndexedDB quotas and large-media package limits need measurement.
- The current export allow-list and compiled bundle contain additional browser
  preferences; a future schema review must decide which are portable.
- Backup scope for archived/deleted Studios and scheduled-show data needs an
  explicit product decision.
- No remote/production storage was inspected, and no claim is made about its
  backup state.

## Recommended next directive

Authorize a development-only, non-destructive per-Studio export package and
manifest validator in Opera. It should create a local package without automatic
restore or D1 export first. After that package is validated, separately authorize
the media pack and explicit local development D1 backup workflow.


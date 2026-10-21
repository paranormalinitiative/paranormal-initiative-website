# TPI-STUDIOFLOW-024 — Local Backup Architecture

## Phase 1 status (historical)

**CONDITIONALLY COMPLETE — INVESTIGATION AND DOCUMENTATION ONLY.**

## Phase 2 implementation status

**CONDITIONALLY COMPLETE — BACKUP INTEGRATION VERIFIED WITH SYNTHETIC MEDIA AND
FILESYSTEM TESTS; OWNER ACTIVATION, OPERA FOLDER PERMISSION, AND RESTORE
DEFERRED.**

Phase 2 adds a pure, source-kind-aware backup engine and a guarded browser
adapter. Automatic backups remain off by default. The adapter does not request
filesystem permission during page load, does not export owner data, and keeps
the Backup Now, history, and restore controls unavailable until a separately
authorized activation flow exists.

The implementation is intentionally split into a testable core and a browser
adapter:

- `studio/backup-core.mjs` defines the versioned manifest, allow-listed Studio
  snapshot, media collection contract, SHA-256 verification, staged publication,
  completion marker, retained history, destination errors, and debounced change
  tracker.
- `studio/backup-bridge.js` detects secure-context/browser capabilities, requests
  a directory only from an explicit Choose Folder action, stores only the
  selected directory handle in its dedicated IndexedDB store, resolves supported
  media bytes from `studioflow-recordings.recordingBlobs`, and provides guarded
  manual/automatic status workflows. Its filesystem writer uses completion
  markers because the browser File System Access API does not provide a
  portable atomic directory rename.
- `scripts/verify/tpi-studioflow-024-phase2.mjs` exercises synthetic-only media,
  configuration, failure, integrity, change-detection, and safety fixtures.
- `scripts/verify/tpi-studioflow-030-backup.mjs` exercises actual temporary
  filesystem writes/readback, media-byte hashes, interruption, corruption,
  duplicate prevention, and multi-Studio isolation.

The collector supports both `server-workspace` and `local-broadcast` source
kinds and refuses to finalize a complete package when required media cannot be
resolved. Recordings, authentication state, browser profiles, cookies, tokens,
and unrelated browser storage are excluded. Actual owner folder selection,
media collection, automatic enablement, and restore were not performed.

This phase mapped the existing StudioFlow persistence boundary and designed a
future local-first backup system. It did not create a backup, export D1, export
Studio data, copy media, request a folder permission, restore anything, or
change an existing Studio.

Evidence labels used below:

- **CONFIRMED** — observed in source, the read-only local D1 snapshot, or the
  existing Opera runtime observation.
- **INFERRED** — directly derived from confirmed implementation behavior but
  not separately exercised in this phase.
- **PROPOSED** — design for a future implementation; not implemented.
- **NOT VERIFIED** — deliberately not inspected because it would require
  browser-private storage access, a new permission, owner-data export, or a
  platform/device test.

## Scope and safety boundary

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Development origin: `http://127.0.0.1:8787/studio/`
- Local Worker: port `8787`
- StudioFlow room server: port `8788`
- Guest gateway: port `8789`
- Primary live development browser: Opera Air
- Production: not accessed

No service was restarted. No database migration, database write, browser
storage change, filesystem permission request, Studio change, media copy, or
backup-folder creation was performed.

## Phase A — Crossroads of the Unknown persistence map

### Current Opera-visible state

**CONFIRMED from a read-only Opera accessibility observation:** Opera was on
`http://127.0.0.1:8787/studio/?tpi018c=ready` and displayed:

- Active selector: `Crossroads of the Unknown`.
- Intro asset: `COTU INTRO.mp4`.
- Outro asset: `CR Outro.mp4`.
- Background asset: `CR Main Motion Loop` / `CR Main Motion Loop.mp4`.
- Studio logo: `StudioFlow`.
- Four scenes: Intro video, Two-person split, Demo scene 2, and Outro video.
- Room bridge: connected; zero guests and zero signals at observation time.

The observation was read-only. No selector, scene, asset, recording, or
production control was activated.

### Historical/current workspace distinction

**CONFIRMED historical evidence:** TPI-STUDIOFLOW-023 documented Crossroads as
a local broadcast without a matching server-backed workspace row at that time.
That historical result must remain unchanged.

**CONFIRMED current read-only snapshot:** the current local D1 database now
contains a matching active workspace:

| Field | Current value |
| --- | --- |
| Table | `studio_workspaces` |
| Workspace title | `Crossroads of the Unknown` |
| Studio number | `10` |
| Workspace ID | `43b20614-69da-4d82-af9d-063cace4b6cc` |
| Owner scope | `local-ops009-admin` |
| Local broadcast ID | `studio-0ec3848f-5500-462c-a1da-f711d3148d49` |
| Status | `active` |
| Version | `139` |
| State size | `2,349` bytes |
| Last observed update | `2026-10-18T07:01:59.481Z` |

The database snapshot was read through the local SQLite file under
`.local-dev/state/v3/d1/miniflare-D1DatabaseObject/`; no SQL write was issued.
The cause and exact transition from the TPI-023 historical state were not
established in this phase. A future backup must therefore support both
`local-broadcast` and `server-workspace` records and must not assume that a
visible Studio always has a D1 row.

### Crossroads configuration mapping

**CONFIRMED from the current D1 state snapshot:**

- Broadcast metadata is in `state_json.broadcast`; its broadcast ID is
  `broadcast-1792273732742` and its title is Crossroads of the Unknown.
- Recording settings are in `state_json.settings`; the current destination is
  browser storage.
- The normalized configuration is in `state_json.configuration`.
- Four scene records are in `configuration.studioScenes`, including their IDs,
  kinds, titles, and layouts.
- The intro and outro records are in `configuration.videoClips`.
- The background record is in `configuration.customBackground`.
- Asset references contain `blobKey`, file name, media type, size, title, and
  upload time metadata. The current state does not contain the media bytes.
- The current configuration had no overlay entries and no custom logo metadata
  in the D1 snapshot. This does not prove that Opera has no other local-only
  cached item; Opera storage was not read.

Current media metadata observed in the D1 snapshot:

| Role | File/title metadata | Size | Stored as |
| --- | --- | ---: | --- |
| Intro | `COTU INTRO.mp4` / Intro video | 113,626,263 bytes | `blobKey: media-video-intro` |
| Outro | `CR Outro.mp4` / Outro video | 73,269,786 bytes | `blobKey: media-video-outro` |
| Background | `CR Main Motion Loop.mp4` / CR Main Motion Loop | 4,538,917 bytes | `blobKey: media-custom-background` |

These are metadata findings only. No media bytes were opened, hashed, copied,
or exported.

## Phase B — Existing storage architecture

### Development D1

**CONFIRMED** from migrations `0051`, `0052`, and `0053`, the local schema, and
`functions/api/[[path]].js`:

- `studio_workspaces` stores owner-scoped Studio identity, local broadcast ID,
  title, description, workspace type, active/archived state, Studio number,
  soft-delete timestamp, bounded normalized `state_json`, optimistic `version`,
  and timestamps.
- `studio_number_allocations` assigns per-owner Studio numbers.
- `state_json` is allow-listed and size-bounded by the API. It stores
  configuration and asset metadata, not browser-local Blob contents.
- Workspace reads and writes are owner-scoped and version-aware. Mutations use
  same-origin checks and expected-version conflict protection.
- `studio_production_sessions`, `live_broadcasts`, rooms, guests, and signals
  support production coordination. Active production locks are transient
  operational state and must not be restored as Studio backup data.
- D1 is shared across authenticated browsers that use the same local origin
  and owner account. A D1 backup alone is not a complete Studio media backup.

Relevant source references:

- `migrations/0051_studioflow_workspaces.sql`
- `migrations/0052_my_studios.sql`
- `migrations/0053_studioflow_creator_production_lock.sql`
- `functions/api/[[path]].js` workspace handlers and state normalizer
- `studio/workspace-bridge.js`
- `studio/workspace-asset-state-bridge.js`

### localStorage

**CONFIRMED from the bridge and compiled application bundle:** StudioFlow uses
origin/profile-scoped localStorage for active context, local broadcast records,
workspace cache, configuration mirrors, preferences, recording summaries, and
route state.

Known StudioFlow keys include:

- `studioflow.activeBroadcastId`
- `studioflow.broadcasts`
- `studioflow.tpiActiveStudioId.v1`
- `studioflow.tpiWorkspaceCache.v2`
- `studioflow.route`
- `studioflow.activeSceneId`
- `studioflow.studioScenes`
- `studioflow.selectedBackground`
- `studioflow.customBackground`
- `studioflow.customLogo`
- `studioflow.logoPlacement`
- `studioflow.showLogo`
- `studioflow.overlayAssets`
- `studioflow.activeOverlayId`
- `studioflow.videoClips`
- `studioflow.backgroundMusic`
- `studioflow.backgroundMusicVolume`
- `studioflow.customSound`
- `studioflow.customSounds`
- `studioflow.soundVolume`
- `studioflow.recordingPreferences.v2`
- `studioflow.recordingStorage.v1`
- `studioflow.recordingSessions`
- `studioflow.libraryItems`
- `studioflow.guestPermissionSettings`
- `studioflow.programOrientation`
- `studioflow.bannerScrollTicker`

The workspace bridge uses localStorage to rehydrate the active browser context
and to assemble the allow-listed state sent to D1. The server workspace remains
the authoritative shared record where a matching workspace exists. Local
broadcasts and UI preferences can exist without a server row.

Opera localStorage values were not read, exported, cleared, or changed.

### IndexedDB

**CONFIRMED from the compiled StudioFlow bundle:**

`studioflow-recordings`, version 3, contains:

- `recordingBlobs` — Blob values used for local media lookup and recordings.
- `recordingChunks` — interrupted-recording chunks.
- `recordingSessions` — recording metadata and recovery checkpoints.
- `storageHandles` — persisted file-system handles for selected storage.
- `libraryFileHandles` — persisted handles for file-backed library items.

`studioflow-avatars`, version 1, contains the `avatarImages` store for the
local avatar Blob.

The application reads media by `blobKey` and creates object URLs for playback.
An object URL is a temporary runtime address, not a portable backup reference.
The handle stores are permissions/references, not copies of folder contents.

Opera IndexedDB was not opened, enumerated, exported, or changed.

### Cookies, session storage, and transient channels

**CONFIRMED from source inspection:** no StudioFlow backup material should
include the local authentication cookie (`tpi_session`). No relevant
StudioFlow `sessionStorage` path was found in the inspected bridge/bundle.
`BroadcastChannel("tpi-studio-production")` coordinates ephemeral production
lock state and is not durable Studio configuration.

### File handles and local files

**CONFIRMED from the bundle:** the recording settings path detects
`showDirectoryPicker()` and uses `FileSystemDirectoryHandle`-style read/write
behavior when exposed. Handles are persisted in IndexedDB. Completed files can
also use `showSaveFilePicker()`, the Web Share API, or a download fallback.

**CONFIRMED from local configuration:** local development has simulated D1/R2
persistence under `.local-dev/state/`. `wrangler.local.toml` defines local D1
and an `TPI_MEDIA` local R2 binding. The generic application has authenticated
R2 media routes, but the current StudioFlow asset bridge explicitly preserves
browser-local Blob media and does not upload those StudioFlow assets through an
`/api/uploads` path.

**NOT VERIFIED:** whether any specific Crossroads object also exists in a local
R2 bucket. The source evidence does not establish that current StudioFlow
intro/outro/background bytes are in R2, and no R2 listing was performed.

## Data shared versus browser-specific

| Data | Shared through local Worker/D1 | Browser/profile-specific | Backup implication |
| --- | --- | --- | --- |
| Studio identity, title, number, ownership | Yes, for server workspaces | No | Include workspace identity and source kind |
| Normalized scenes and layouts | Yes, when saved to workspace | Local mirror may be stale | Include server version and local-only fallback |
| Guest settings | Yes, when in `state_json` | UI mirror may exist | Restore only allow-listed settings |
| Asset metadata and `blobKey` | Yes, when saved | Blob resolution is local | Metadata alone is incomplete |
| Uploaded Studio media bytes | No evidence of D1 storage | Yes, IndexedDB/browser storage | Future package must read and verify bytes |
| Recording blobs/chunks/checkpoints | No | Yes, IndexedDB or selected folder | Separate opt-in recording backup |
| File-system handles | No | Yes | Reauthorization required after restore |
| Active Studio/route/preferences | No | Yes | Reconstructable convenience state |
| Auth cookies/tokens | No | Yes | Never portable; require fresh login |
| Production lock/session/channel | No | Transient | Never restore as saved Studio state |

## Risk assessment

This is a non-destructive architecture assessment; no risk was tested by
clearing or replacing data.

| Event | Risk | Affected data |
| --- | --- | --- |
| Clear Opera localStorage and IndexedDB | CRITICAL | Local media, recordings, recovery checkpoints, handles, preferences, references |
| Reset/replace development D1 | CRITICAL | Server Studio identity, scenes, ownership, state, versions, archive state |
| Change localhost origin/port/protocol | CRITICAL | New storage/cookie scope; local blobs may no longer resolve |
| Replace compiled assets incompatibly | HIGH | Rehydration, media references, and recovery behavior |
| Remove local media directory/external drive | HIGH | File-backed assets or recordings |
| Switch browsers | HIGH | Shared D1 may remain visible, but Opera-local media and handles do not follow |
| Change branch/bindings | HIGH | Different schema, D1, R2, or asset build may make data unavailable |
| Browser crash/interrupted save | HIGH | Latest unsaved state or recovery checkpoint |
| Partial D1 corruption | HIGH–CRITICAL | Scope depends on affected tables/rows |
| Failed migration | HIGH | Schema/API mismatch and operational unavailability |
| Accidental Studio delete | MEDIUM | Soft restore may recover row, not necessarily local media |
| Same-binding Worker restart | LOW persisted / MEDIUM active session | Temporary interruption; room session may be affected if independently restarted |
| Normal reload | LOW | Transient playback state only; not a backup |

## Phase C–K — Proposed backup architecture

### Recommended model: hybrid package plus selected destination

**PROPOSED:** use an application-level hybrid backup package:

1. Read the authenticated server workspace when present.
2. Read the local broadcast/configuration mirror when no matching workspace
   exists.
3. Resolve each allow-listed media reference through StudioFlow's supported
   browser-local media API.
4. Write a versioned configuration and media package to a user-selected
   destination.
5. Keep recordings separate and opt-in because they are large and have
   different recovery semantics.

This avoids requiring Cloudflare R2, paid cloud storage, or a particular vendor.
A user-selected Mac folder can be a normal folder, external drive, USB volume,
iCloud Drive folder, Dropbox-synchronized folder, or Google Drive-synchronized
folder. The application should treat those as local folders; provider-specific
OAuth/API integrations are not required for Phase 1 and are not implemented.

### Proposed package layout

```text
StudioFlow Backups/
  Crossroads of the Unknown/
    Current/
      manifest.json
      studio.json
      Scenes/
      Images/
      Videos/
      Audio/
    History/
      Backup-Version-001/
  Other Studio/
  Backup Settings/
```

The physical layout remains a future design choice. A package/archive fallback
should be supported for mobile and browsers that cannot write a directory.

### Change detection and automatic backup

**PROPOSED:** normal Studio autosave remains independent. After a successful
save, a debounced backup worker compares:

- server workspace ID and version;
- local broadcast ID and a canonical configuration fingerprint;
- last-modified timestamps where available;
- asset IDs/blob keys and sizes;
- SHA-256 only for new or changed media bytes.

Unchanged Studio configuration and unchanged media should not be rewritten.
Backups should be serialized per Studio and per destination so a stale backup
cannot overwrite a newer one.

### Destination unavailable behavior

**PROPOSED:** destination states are `NOT_CONFIGURED`, `CONNECTED`,
`UNAVAILABLE`, `PERMISSION_REQUIRED`, `FULL`, and `ERROR`.

When a destination cannot be written:

- do not report success;
- preserve the last verified package;
- continue ordinary Studio autosave;
- show the reason and last successful backup;
- offer `Reconnect Folder`, `Choose New Location`, and `Remind Me Later`;
- resume only after a fresh destination check;
- never silently redirect or delete the old verified package.

### Manifest and integrity design

**PROPOSED manifest fields:**

- `applicationId` and backup format version;
- package creation time and application version;
- configuration schema/migration version;
- source kind: `server-workspace` or `local-broadcast`;
- workspace ID, local broadcast ID, Studio number, title, and owner scope
  label without credentials;
- included scenes, order, layouts, and configuration checksum;
- included assets with logical role, relative path, MIME type, size, and
  SHA-256;
- missing/excluded assets and explicit reason;
- completion state and validation report;
- optional recording-pack reference, never implied by a Studio backup.

The package should be staged in a temporary sibling, write media first, verify
size/hash, write the manifest last, and publish a completion marker only after
all required entries validate. A failed or interrupted write must leave the
previous `Current` package intact. History should be retained according to a
user-selected count or age policy.

### Restore design

**PROPOSED:** restore is read-only until explicit confirmation:

1. Select a package.
2. Validate format, schema compatibility, file hashes, asset references, and
   secret exclusion.
3. Preview Studio title, source kind, version, scenes, media, and missing data.
4. Compare with current owner-scoped data and detect newer destination versions.
5. Restore as a new Studio by default.
6. Stage media, verify hashes, then reconnect references.
7. Rehydrate configuration through authenticated workspace APIs.
8. Verify the restored Studio before activation.
9. Preserve the original unless explicit replacement is approved.

Scene recovery should support a scene-level diff. Full development restore
should use a separate staging namespace before any activation.

### Security and privacy

Backups must exclude cookies, session tokens, passwords, API keys, stream keys,
production locks, room-session tokens, browser profiles, history, unrelated
localStorage/IndexedDB, and private environment secrets. File names and
descriptions should be treated as user data. Restore must reject malformed
manifests, path traversal, unexpected file types, oversized files, duplicate
IDs, and unresolved references.

## Browser and device capability assessment

| Platform | Current source evidence | Phase 1 conclusion |
| --- | --- | --- |
| Opera / Chromium desktop | Bundle detects `showDirectoryPicker`, `showSaveFilePicker`, IndexedDB handles, and share/download fallbacks | **PROPOSED primary automatic-folder target; runtime permission/capability test not performed** |
| Other Chromium desktop | Same feature family is conditionally detected | **Likely same architecture; must be tested per browser/version** |
| Safari macOS | No StudioFlow-specific runtime test in this phase | **Manual package/download fallback required until capability is verified** |
| Firefox desktop | No StudioFlow-specific runtime test in this phase | **Manual package/download fallback required until capability is verified** |
| iPadOS Safari / iPhone Safari | Bundle explicitly presents browser-managed storage and Save-to-Files/share/download behavior; it does not claim direct folder recording | **Manual export/share/package path; unattended folder backup not claimed** |
| Android browser/tablet | Bundle detects Android and describes browser-managed storage plus download/share fallback | **Manual export/share/package path; browser-dependent folder support not claimed** |
| iCloud/Dropbox/Google Drive folders | Can be treated as user-selected local folders when mounted and exposed by the browser | **No provider API or subscription required; availability depends on local sync client and browser permission** |

The exact current Opera values for `window.showDirectoryPicker`, permission
state, quota, and handle restoration were not queried because this phase must
not request new permissions or inspect browser-private storage. A future
implementation must surface capability state without claiming support from a
static browser label alone.

## Proposed user interface

Place future controls under `StudioFlow → Settings → Backup & Recovery`:

- Backup location and `Choose Folder`.
- Automatic Backups On/Off.
- Status: Not Configured, Connected, Unavailable, Permission Required, Full,
  or Error.
- Last Successful Backup and Pending Changes.
- `Backup Now`, `Reconnect Folder`, `Choose New Location`, `View Backup History`,
  and `Restore Studio`.

The interface must show whether the current browser supports automatic folder
writes or only manual package export. On mobile, it must not present an
unattended-folder promise when the available workflow is Share/Files/download.

## Recommended future implementation sequence

1. Define and test a secret-free manifest/schema validator with fixtures.
2. Add a read-only per-Studio export preview supporting both source kinds.
3. Implement media resolution and byte/hash verification without changing the
   existing Studio save path.
4. Implement a staged local package writer for Opera/Chromium desktop.
5. Add destination availability, retry, history, and atomic completion markers.
6. Add manual package export/share fallback for Safari, iPhone, iPad, and
   Android.
7. Add non-destructive restore-as-new with preview and conflict detection.
8. Add optional, separately labeled recording backup.
9. Add full development D1 export only through a guarded owner-authorized
   maintenance flow; never combine it implicitly with ordinary Studio backup.
10. Validate in Opera with synthetic fixtures before any owner-data export is
    authorized.

## Unresolved questions

- When and how the Crossroads local broadcast became a matching D1 workspace;
  the prior TPI-023 historical state and current snapshot differ.
- Exact ownership mapping for every `blobKey`, especially when the same browser
  media store serves multiple Studios.
- Whether any Crossroads media bytes also exist in the local R2 simulation;
  no R2 listing was performed.
- Exact Wrangler/local D1 export syntax and validation of the correct binding.
- Opera permission renewal, storage quota, and file-handle survival after a
  browser restart.
- Safe browser APIs for writing large media packages without blocking the UI.
- Retention defaults and whether recording backups should be opt-in per Studio.
- Whether native iOS/Android integration is eventually needed for reliable
  background or large-file backup behavior.

## Verification record

- Source and migration inspection: **PASSED**.
- Read-only current D1 schema/row/state inspection: **PASSED**.
- Read-only Opera page observation: **PASSED**.
- Browser-private localStorage/IndexedDB enumeration: **NOT PERFORMED**.
- Folder permission request: **NOT PERFORMED**.
- Backup creation/export/media copy: **NOT PERFORMED**.
- Restore/destructive test: **NOT PERFORMED**.
- Production access: **NONE**.
- Service restart/deployment: **NONE**.

## Conclusion

The existing architecture can support a reliable local-first backup system, but
the system must be application-level and source-kind aware. A JSON configuration
download is not a complete backup because it omits browser-local media bytes.
The first implementation should target Opera/Chromium desktop with a
user-selected local directory, preserve a portable package/share fallback for
mobile and unsupported browsers, and make complete status conditional on
manifest-verified media inclusion.

Phase 1 implementation was deferred to the authorized Phase 2 directive. The
Phase 2 implementation status and limits are recorded at the top of this
document and in the Phase 2 completion report.

## Phase 4 verification note — TPI-STUDIOFLOW-033

An isolated real Opera workflow has now verified native folder selection and
edit permission, real six-asset filesystem writes, manifest/completion-marker
read-back, SHA-256 verification, debounced automatic backup, no-change
deduplication, and restore-as-new with remapped media keys. The verification
used only a synthetic Opera fixture and a dedicated Desktop test folder. It did
not activate Crossroads backups or export owner data. Empty-D1 disaster
recovery, physical cross-device recovery, mobile unattended folder writes, and
recording-byte backup remain outside the verified boundary.

## Phase 3 implementation note — TPI-STUDIOFLOW-032

The local implementation now includes a verified restore-as-new path. Format-1
packages are validated before use, required media is hash-checked, Blob keys
are remapped into the restored Studio, and the restored workspace is created
through the existing local workspace API without overwriting an existing
Studio. Backup settings are scoped by workspace ID and automatic backups remain
off by default. Browser-level Opera folder permission, owner activation,
recording-byte backup, and mobile unattended folder writes remain explicitly
unverified or deferred; see the TPI-STUDIOFLOW-032 directive and result.

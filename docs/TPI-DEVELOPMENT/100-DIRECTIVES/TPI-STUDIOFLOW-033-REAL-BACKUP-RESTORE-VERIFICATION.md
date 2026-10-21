# TPI-STUDIOFLOW-033 — Real Opera Backup & Restore Verification

Status: **CONDITIONALLY COMPLETE — REAL SYNTHETIC OPERA WORKFLOW VERIFIED**

Environment: local development only. The protected Crossroads workspace was
not selected for backup, restored, or modified.

## Scope and isolation

The browser test used a dedicated Opera tab at a separate local origin:

`http://127.0.0.1:8790/studio/assets/tpi033-real-test.html`

Port 8790 served the repository statically for the browser fixture. The page
used an in-memory workspace API, synthetic localStorage, and a synthetic
IndexedDB adapter. It never contacted the StudioFlow Worker API or the owner
workspace. The actual filesystem destination was:

`/Users/toddknipple/Desktop/TPI-033 Opera Backup Test`

The owner Opera StudioFlow tab remained separate. Crossroads automatic backups
remained off and no permanent owner destination was configured.

## Runtime and implementation findings

The local Worker was available on port 8787 after the authorized local restart
sequence; room and guest services were not intentionally restarted. The local
fixture-serving configuration preserves exact HTML fixture paths, and the
Worker asset responder now returns a fresh response after inspecting an HTML
body rather than reusing an already-consumed response body.

During browser verification two narrowly scoped defects were found and fixed:

1. The backup bridge mutation observer updated its own status text, causing a
   self-sustaining mutation loop in the Opera fixture. The observer now only
   discovers backup hosts; status updates remain explicit.
2. Restore media collection passed the accumulator object as a rejection
   handler to `Promise.then`, leaving the media map undefined. The reducer now
   starts with `Promise.resolve({})`, preserving all verified media bytes.

## Real Opera folder workflow

Opera opened the native folder picker, selected the dedicated synthetic
`TPI-033 Opera Backup Test` folder, and granted the site edit permission. The
Backup & Recovery card showed the selected destination and `CONNECTED`, with
automatic backups still off until explicitly enabled.

## Real backup write and read-back

Using the actual Opera UI, `Backup Now` produced a versioned package containing:

- `manifest.json` with `verificationStatus: VERIFIED`;
- `studio.json` with the synthetic workspace, broadcast, scenes, and settings;
- six actual media files: intro, outro, background video, logo, banner, and
  background audio;
- `COMPLETE` and `CURRENT.json` markers.

The package was independently read from disk. All six recorded sizes and
SHA-256 hashes matched the bytes in the destination. The package belonged to
`tpi033-source-workspace` and did not contain Crossroads identifiers.

## Automatic backup verification

Automatic backups were enabled only for the synthetic fixture. A scene change
scheduled a debounced backup, which reached `BACKUP COMPLETE` and `Pending
Changes: NO`. Waiting without changes did not create another version. The
synthetic fixture was not used to enable owner backups.

## Real Opera restore-as-new

The actual Restore Studio control opened the native folder picker. The verified
synthetic package was selected and restored through the browser workflow. The
in-memory API observed a new workspace ID and a new broadcast ID, with
`restoreFromBackup: true`, title `TPI-033 Backup Test`, and the restored state
posted through the existing workspace creation path. The original synthetic
fixture remained unchanged. The restored media was written under remapped Blob
keys by the restore bridge.

## Recovery boundaries

This verifies browser-driven folder selection, permission, real package writing,
read-back, hash verification, automatic scheduling, and restore-as-new in an
isolated Opera environment. It does not prove recovery after loss of the
shared development D1 database, because the fixture deliberately used an
in-memory API instead of resetting or replacing the shared D1 binding.

No second physical computer was available; physical cross-device testing is
pending. Recording bytes remain excluded from ordinary Studio backups; the
recording architecture is browser-local and requires a separately labeled
recording backup phase. Mobile background folder writes and retention cleanup
remain deferred.

## Verification record

- TPI-033 focused checks: 10/10.
- TPI-032 restore checks: 11/11.
- TPI-030 backup checks: 13/13.
- TPI-031 overlay checks: 12/12.
- TPI-027 integrity checks: 21/21.
- TPI-025 reconciliation checks: 11/11.
- TPI-024 Phase 2 checks: 23/23.
- TPI-023 navigation checks: 14/14.
- TPI-017 switching checks: 14/14.
- JavaScript syntax checks: passed.
- Inline fixture syntax checks: passed.
- `git diff --check`: passed.

No production endpoint was accessed. No D1 migration or reset occurred. No
owner storage, media, recording, Studio, or Crossroads configuration was
modified. No commit or push was performed.


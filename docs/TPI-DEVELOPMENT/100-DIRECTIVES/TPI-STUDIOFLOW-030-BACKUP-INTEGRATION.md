# TPI-STUDIOFLOW-030 — Automatic Backup Integration

## Scope

This directive implements and verifies the local-first backup integration for
development StudioFlow. It does not activate backups for Crossroads of the
Unknown, select an owner destination, export owner media, or implement Studio
restore.

## Implemented architecture

- `studio/backup-core.mjs` is the testable backup model. It preserves unknown
  configuration fields, records workspace/broadcast identity, collects actual
  media bytes, writes staged versioned packages, writes a completion marker,
  and reads back configuration and media before reporting verification.
- `studio/backup-bridge.js` is the browser adapter. It uses the File System
  Access API only from explicit user actions, persists only the selected
  directory handle in its dedicated IndexedDB store, resolves Studio media
  from `studioflow-recordings.recordingBlobs`, and keeps automatic backups off
  until a user selects a folder and enables the toggle.
- `studio/workspace-bridge.js` emits `tpi:workspace-saved` only after the
  supported workspace PATCH succeeds. Automatic backup scheduling listens for
  that event and remains independent from normal Studio autosave.

## Package and integrity behavior

Each verified package is written below a stable Studio identity:

`studios/<workspace-id>/history/<backup-id>/`

The package contains `studio.json`, `manifest.json`, media files under
`media/`, and `COMPLETE`. `CURRENT.json` is written only after read-back
verification. Backup IDs are unique; prior verified versions are not deleted.
The manifest records format version, workspace/broadcast identity, title,
configuration version, scenes, media paths, MIME types, byte sizes, SHA-256
hashes, optional exclusions, and verification status.

Required media that cannot be resolved stops finalization. Corrupt read-back
media, invalid manifests, interrupted publication, permission failures, and
write failures are reported without replacing the previous `CURRENT.json`.
Recordings remain excluded by default. Authentication state, cookies, tokens,
browser profiles, and unrelated browser storage are excluded.

## Automatic backup rules

Automatic backups require both an explicitly selected destination and the
explicit Automatic Backups toggle. The default is OFF. A successful Studio
save schedules a debounced backup; unchanged configuration and media are
skipped, overlapping jobs are coalesced, and a backup in progress does not
interrupt production. Backup success is recorded only after destination
read-back verification.

## Browser and recovery boundaries

Desktop Chromium browsers on a secure context can use the folder adapter after
an explicit user gesture. Permission loss is surfaced as a reconnection state;
the adapter does not silently redirect to another folder. Mobile/tablet
fallback export and full Studio restore remain deferred. A verified backup
package is recovery-ready for future tooling but is not itself a restore
operation.

## Safety boundary

Opera remains the authoritative development browser. During TPI-030 testing,
no owner folder was selected, no Crossroads media was read or exported, and
automatic backup remained OFF. Testing uses synthetic configurations/media and
an isolated temporary filesystem destination.


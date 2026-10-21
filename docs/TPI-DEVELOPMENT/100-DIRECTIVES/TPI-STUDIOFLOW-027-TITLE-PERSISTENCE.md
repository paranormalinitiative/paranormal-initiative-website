# TPI-STUDIOFLOW-027 — Studio Title Persistence and Configuration Protection

Status: TARGETED IMPLEMENTATION COMPLETE / OWNER DATA REPAIR DEFERRED

## Scope

This directive corrects the application save serializer only. It does not
repair the existing Crossroads row. Local development source and synthetic
fixtures were used; Opera was not refreshed and no owner save was issued.

Protected workspace: `43b20614-69da-4d82-af9d-063cace4b6cc`.

## Root cause

TPI-STUDIOFLOW-025 correctly preserved the persisted broadcast ID, but its
save path only merged that ID into the current broadcast object. When the
selected workspace contained a broadcast object with an empty title, the
serializer could continue sending an empty nested title even though the
workspace metadata title was valid. The API requires the top-level workspace
title but currently accepts an empty nested `broadcast.title`, so the defect
survived normalization.

## Correction

`studio/workspace-bridge.js` now contains a focused
`normalizeBroadcastTitle()` function. Before a save it:

- Requires a verified selected workspace, non-empty workspace title, and
  persisted broadcast identity.
- Requires the saved broadcast ID and active local broadcast ID to agree with
  the workspace `localBroadcastId`.
- Fills an empty or missing nested title from the verified workspace title.
- Preserves matching titles.
- Rejects conflicting non-empty titles with a clear integrity error.
- Rejects missing or conflicting identities without creating a workspace or
  issuing a save request.
- Returns a new broadcast object and does not mutate the source objects.

`saveCurrent()` reports the integrity error and returns without a PATCH. The
existing expected-version protection, in-flight save serialization, production
lock, and save-success-after-server-response behavior remain intact.

The existing explicit rename workflow now updates both workspace metadata and
the nested broadcast title in one supported version-checked PATCH, then
hydrates the local broadcast mirror. Authorized renames therefore remain
supported without being mistaken for accidental conflicts.

## Configuration protection

The correction changes only the title field and broadcast identity validation.
It does not rebuild the configuration envelope or remove scenes, layouts,
media references, guest settings, recording preferences, or unknown broadcast
fields. It does not change D1 normalization, backup storage, production
locking, switching architecture, or visible StudioFlow design.

## Backup compatibility

The existing backup foundation still requires a non-empty Studio title and
includes the validated Studio identity/title in its manifest snapshot. The
correction makes future workspace-derived state title-complete before a save,
while the backup collector remains responsible for rejecting missing required
media. Automatic backups remain off, no owner backup was created, and no
filesystem permission was requested.

## Synthetic test coverage

The isolated test suite covers empty and missing titles, matching titles,
conflicting titles, missing/incorrect workspace identity, incorrect broadcast
identity, empty authoritative titles, preservation of scenes/media/guest
fields, stale versions, rejected saves, successful serialization, failed-save
preservation, switching, restoration, explicit renaming, unknown fields, and
idempotence.

## Owner repair plan — not executed

The current read-only reference remains:

- Workspace ID: `43b20614-69da-4d82-af9d-063cace4b6cc`
- Workspace version: `152`
- Metadata title: `Crossroads of the Unknown`
- Nested field: `state_json.broadcast.title = ""`
- Broadcast ID: `studio-0ec3848f-5500-462c-a1da-f711d3148d49`
- Expected repair value: `Crossroads of the Unknown`

After separate owner authorization, the safest repair is to use the existing
same-origin workspace PATCH mechanism with `expectedVersion: 152`, submitting
the complete current workspace state with only
`state.broadcast.title` changed to the verified metadata title. Before that
write, create a protected local recovery snapshot of the complete row and
verify the workspace/broadcast IDs. If the version has changed, or any title
or identity conflict is found, stop without writing. After a successful
response, verify the returned version, both title fields, all scene/media
references, and the unchanged workspace ID. No direct D1 UPDATE should be
used. This plan has not been executed.

## Safety result

No owner workspace, Opera storage, D1 record, media, recording, production
resource, or public environment was modified. No deployment, migration,
service restart, commit, or push occurred.

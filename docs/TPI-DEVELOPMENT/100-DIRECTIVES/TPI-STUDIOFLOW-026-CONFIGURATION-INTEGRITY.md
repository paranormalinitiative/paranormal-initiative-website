# TPI-STUDIOFLOW-026 — Crossroads Configuration Integrity and Save Verification

Status: COMPLETE. Persistence-integrity defect fixed and verified locally (026 integrity check 6/6, Firefox acceptance 23/23, Chromium 020/021/022/030 passing). Not deployed; no owner data was changed.

## Scope and safety boundary

This directive was run against local development only. The protected Studio is
Crossroads of the Unknown, workspace
`43b20614-69da-4d82-af9d-063cace4b6cc`. No Opera refresh, browser-storage
change, D1 write, migration, owner save, media export, service restart,
deployment, commit, or push was performed.

## Runtime evidence

- Opera remains on `http://127.0.0.1:8787/studio/?tpi018c=ready`.
- The local listeners remained present: `workerd` on 8787 and `node` listeners
  on 8788 and 8789. No service was restarted.
- `studio/index.html` loads
  `/studio/workspace-bridge.js?tpi023=active-title-v2` and
  `/studio/backup-bridge.js?tpi024=phase2`.
- The repository bridge and the staged local runtime bridge have identical
  SHA-256 values: `84eac84db41691a3488119b5cce5397d9d17cef6a46120db7df29aadeea94f06`.
- The bridge contains the TPI-025 identity matching, selected-workspace save
  precedence, TPI-023 active-title logic, and versioned save guard.

## Current workspace identity

Read-only SQLite inspection of the active local D1 file showed:

| Field | Current value |
|---|---|
| Workspace ID | `43b20614-69da-4d82-af9d-063cace4b6cc` |
| Studio number | `10` |
| Workspace title | `Crossroads of the Unknown` |
| Owner | `local-ops009-admin` |
| Status | `active` |
| Deleted at | `NULL` |
| Workspace version | `152` |
| `local_broadcast_id` | `studio-0ec3848f-5500-462c-a1da-f711d3148d49` |
| `state_json.broadcast.id` | `studio-0ec3848f-5500-462c-a1da-f711d3148d49` |
| `state_json.broadcast.title` | empty string |
| Broadcast status | `draft` |
| State JSON | valid JSON, 2,344 bytes |

The local broadcast identity is now consistent across the workspace metadata
and saved state. There is one active Crossroads row and no duplicate
`local_broadcast_id`. Studios 8 and 9 remain archived; no additional records
were archived by this investigation.

## Empty broadcast title finding

The empty nested title is not a D1 schema error: the API requires the
top-level workspace `title`, while `normalizeStudioWorkspaceState()` currently
accepts an empty nested `broadcast.title`. The selector therefore correctly
uses the workspace metadata title, and reconciliation can fall back to that
metadata title when the nested value is empty.

The empty nested value is nevertheless a confirmed persistence-integrity
defect/risk. In `stateForSave()`, when a selected workspace already contains a
saved broadcast ID, the bridge preserves that ID with `Object.assign()` but
does not backfill an empty saved title from `selectedWorkspace.title`. The
subsequent PATCH can therefore preserve an empty nested title while the
top-level workspace title remains correct. This explains the earlier split
between a correct visible Studio name and incomplete saved broadcast state.

This is not evidence that the owner’s scenes or media were deleted. It is a
state-completeness problem that can affect future saves, switching diagnostics,
and backup collection if a collector treats the nested broadcast object as
complete without validating the top-level metadata relationship.

## Configuration integrity

The current Crossroads state is valid JSON and contains the expected normalized
configuration envelope:

- Four scenes: `intro`, `scene-1`, `scene-2`, and `outro`.
- Active scene: `scene-1`.
- Intro reference: `media-video-intro`, `COTU INTRO.mp4`, declared size
  113,626,263 bytes.
- Outro reference: `media-video-outro`, `CR Outro.mp4`, declared size
  73,269,786 bytes.
- Background reference: `media-custom-background`, `CR Main Motion Loop.mp4`,
  declared size 4,538,917 bytes.
- Logo reference: absent in the D1 configuration snapshot.
- Overlay list: empty.
- Background audio and custom sounds: absent/empty.
- Guest permissions: normalized and present.
- Scene layouts and titles are present for all four scenes.

The D1 state stores metadata references, not media bytes. The source bridge and
backup collector both treat media references as browser-local metadata; actual
recording and media bytes remain outside the D1 workspace snapshot. This
inspection did not read, copy, export, or modify any media bytes.

The missing logo/overlay/audio values are reported as absent in the current
saved D1 snapshot, not classified as corruption: the storage model allows
optional assets, and the owner-visible browser state was not refreshed or
mutated to prove whether a browser-local value exists outside the snapshot.

## Save and reconciliation semantics

The current implementation:

1. Resolves the active workspace by matching local broadcast ID, persisted
   broadcast ID, or workspace ID, together with a non-empty title match.
2. Gives the reconciled workspace priority during refresh.
3. Preserves the selected workspace’s persisted broadcast ID over stale local
   broadcast identity during saves.
4. Blocks save when there is no resolved `selectedWorkspace`.
5. Uses `expectedVersion` and rejects stale writes with a workspace conflict.
6. Blocks switching when a current save fails or an active production lock is
   present.
7. Uses a unique `(owner_id, local_broadcast_id)` database constraint to avoid
   duplicate server workspaces.

The correction from TPI-025 is therefore present and working for identity
resolution. It does not fully solve nested-title completeness. A complete
owner-data save test was not authorized and was not performed.

## Backup readiness

Crossroads is identifiable by a stable workspace ID, local broadcast ID, and
active D1 record, so the backup collector can select the correct workspace.
However, backup activation is not ready for this Studio until the collector
validates the relationship between workspace metadata and nested broadcast
state. It must not report a complete backup while a required identity/title
field is inconsistent, and it must preserve the top-level title as the
authoritative fallback without silently rewriting owner data.

## Recommended follow-up

No correction was implemented. A separately authorized implementation should:

1. Treat the workspace metadata title as the authoritative fallback when the
   nested broadcast title is empty.
2. Serialize a complete nested broadcast identity/title pair on future saves.
3. Reject conflicting non-empty titles rather than silently choosing one.
4. Add a read-only integrity report before any owner-data repair write.
5. Extend backup validation to distinguish optional absent assets from required
   identity/state inconsistencies.
6. Preserve the last verified workspace state and use expected-version checks.

Do not clear Opera storage, recreate Crossroads, reset D1, or repair the row
without separate owner authorization.

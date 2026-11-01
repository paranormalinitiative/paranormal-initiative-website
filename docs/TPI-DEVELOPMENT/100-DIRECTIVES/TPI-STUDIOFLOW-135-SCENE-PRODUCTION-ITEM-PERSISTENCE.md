# TPI-STUDIOFLOW-135 — Scene Production Item Persistence & Account Synchronization

Date: 2026-11-01
Priority: High — production defect correction
Parent release: TPI-STUDIOFLOW-134R (Worker `4de115db`, 2026-11-01T22:37:19Z)
Environment: local Cloudflare Worker, `http://127.0.0.1:8787/studio/`, plus the
isolated disposable Worker for account-backed engineering verification
Production deployment: **NOT AUTHORIZED — production is unchanged at
`4de115db-6537-41b5-9bf7-ae99cb0e20fc`.**

## A. Root cause

Two independent allow-lists both omitted the `teleprompter-script` production
kind and its script reference, so a Scene script was discarded twice — on the
way into the account and again on the way back out.

1. **Server, at save.** `normalizeStudioConfiguration()` in
   `functions/api/[[path]].js` rebuilds every workspace state field before it is
   stored. Its Scene panel allow-list was exactly
   `intro`, `timer`, `scene`, `music`, `video-clip`, `outro`, so an item whose
   kind was `teleprompter-script` was dropped from the array. The rebuilt item
   object also had no field for `teleprompterScriptId`, so even an allowed kind
   would have lost the link to its script. Every workspace save, create,
   duplicate, import and recovery snapshot passes through this function.
2. **Bridge, at restore.** `normalizeScenePanelItems()` in
   `studio/workspace-bridge.js` runs on every write of
   `studioflow.scenePanelItems`, including the write performed by `applyState()`
   when a workspace is hydrated. It carried the same six-kind allow-list and the
   same eight-field object, so it stripped the row (or its reference) a second
   time. This is why a correctly stored row could still disappear from the
   browser.

Measured on the isolated account-backed Worker before the correction: the
browser's save request (`PATCH /api/studio/workspaces/<id>`) carried five rows
including the new `teleprompter-script` item, and the stored workspace returned
four. The reload then correctly restored the four stored rows — the reload was
never at fault, and the "PROJECT SAVED" badge was accurate about the request,
not about the row.

The TPI-134 Firefox gate could not see this because it seeds a Studio in
browser-local storage only: there is no server snapshot to discard the row, and
no second normalizer pass through `applyState`. That gap is now covered
explicitly.

### Other Scene item types

The audit required by §2 covered every supported kind. `intro`, `timer`,
`scene`, `music`, `video-clip` and `outro` round-trip losslessly through both
normalizers today because their complete serialized shape is exactly the eight
common fields the normalizers emit (`id`, `kind`, `title`, `sceneId`, `slot`,
`skipped`, `opening`, `closing`) — `music` rows are keyed by `music:<sceneId>`
and validated against their Scene, and `video-clip` rows require a `slot`.
`teleprompter-script` was the only kind with an additional persisted reference.
The client caps the panel at 100 rows and ids at 120 characters; the server
mirrors both, and now mirrors the client's rule that a script row without a
script reference is invalid.

## B. Correction

- **Server** (`functions/api/[[path]].js`): `teleprompter-script` added to the
  Scene panel allow-list; `teleprompterScriptId` is trimmed to 160 characters,
  required for that kind, and written back on the normalized row. No other field,
  limit or validation changed.
- **Bridge** (`studio/workspace-bridge.js`): the kind list is now a named
  constant including `teleprompter-script`; the normalizer preserves
  `teleprompterScriptId` and rejects script rows without one.
- **Bridge stale-snapshot guard** (`applyState`): when a snapshot it is
  hydrating has no stored `scenePanelItems` at all, that Studio is given its own
  default panel (`Intro Video`, one row per Scene, `Outro Video`) instead of
  leaving the previously open Studio's rows in browser storage. Account
  workspaces always store the array, so this path covers browser-local snapshots
  and restored backups that predate the stored panel.

No schema change and no migration: the panel lives inside the existing
`studio_workspaces.state_json` JSON payload, so compatibility is a normalization
change, not a data change.

## C. Data safety

- No Studio was created outside the tests' own disposable records, and none was
  deleted, recreated, renamed or reset. The new gate creates its own clearly
  named account-backed Studios and deletes and purges exactly those records
  before it finishes (it asserts the active list no longer contains them).
- No D1, R2, membership, credential or recording data was touched; the server
  change is a pure normalization allow-list extension.
- Existing saved Studios keep their current rows: the change only adds a kind and
  a field, never removes or reorders what was already stored.
- Studio isolation is unchanged and now tested directly: the second Studio's
  snapshot contains none of the first Studio's rows, and an older snapshot
  restores without inheriting another Studio's rows.
- Crossroads of the Unknown was never opened.

## D. Verification

New maintained suite:
`scripts/verify/tpi-studioflow-135-scene-persistence.mjs`
(`npm run verify:studioflow-135-scene-persistence`), wired into
`release:preflight`. It is account-backed by construction: it authenticates,
creates disposable Studios through the real dashboard dialog, drops a script
through the real drag path, waits for the real workspace save, inspects the
**stored snapshot**, performs a genuine page reload, exercises the live
Teleprompter, switches Studios, removes an item, replays a legacy snapshot, and
purges its own records.

| Run | Result |
| --- | --- |
| Isolated disposable Worker (`127.0.0.1:8789`, `e2e_owner`) | **PASSED 30/30** |
| Authoritative local Worker (`127.0.0.1:8787`, `test_admin`) | **PASSED 30/30** |

Covered by the 30 checks: authentication; a new Studio owns its default panel;
the dropped script exists in the UI; the stored snapshot contains it with the
same `teleprompterScriptId` at the same position; a real reload restores it with
its identifier and order intact; the restored row cues the live presenter
Teleprompter with the correct script, no blocking dialog, at the start and
paused; Play scrolls, Pause holds, Reset returns to the start; a second Studio
does not inherit the row and its snapshot has none of it; switching back restores
it; an intentional removal is stored and survives a reload; a legacy snapshot
without a panel is still accepted, restores without error, invents no rows and
leaks none; and both disposable Studios are cleaned up.

Adjacent maintained suites on the authoritative Worker after the change:

| Suite | Result |
| --- | --- |
| TPI-STUDIOFLOW-134 Firefox acceptance | **PASS** (43/43) |
| TPI-STUDIOFLOW-133 floating actions menu | **PASS 44/44** |
| TPI-STUDIOFLOW-037 Scenes panel | **PASS 20/20** |
| `verify:release-safety` | **PASSED** (21 checks) |
| TPI-STUDIOFLOW-107 source provenance | **PASS** |
| Guarded `release:preflight` | see the status record |

Pre-existing, not caused by this change and deliberately not "fixed" here:

- `verify:studioflow-035-recording-storage` still asserts the unreleased
  `codex/studioflow-122-notes` private reader.
- `scripts/verify/tpi-studioflow-048-project-persistence.mjs` reports 18/20; both
  failures reproduce identically on an untouched `HEAD` worktree (they assert
  older bridge source strings for autosave debouncing and recording export
  references). The suite is not part of the maintained preflight set.
- `scripts/verify/tpi-studioflow-033-workspace-roundtrip.mjs` reports BLOCKED
  without its synthetic media fixture (`/tmp/tpi-020-synthetic-intro.mp4`); the
  preflight path supplies it.

## E. Compatibility

- **Older account snapshots.** A workspace saved before this change still loads.
  If it predates the stored panel entirely, the server stores an empty panel and
  the Studio opens with an empty Scenes panel. That is deliberate and explicit:
  an empty panel is also a legitimate "every row removed" state, so inventing
  rows there could resurrect a creator's deletion. Nothing is discarded, the
  Studio remains editable, and no other Studio's rows appear.
- **Browser-local Studios.** Unchanged: the panel is written and read through the
  same keys and the same normalizer, which now simply also accepts the script
  kind. Browser-local snapshots and restored backups that omit the panel receive
  that Studio's own default panel rather than the previously open Studio's rows.
- **Deletion vs stale data.** The application still cannot distinguish "a
  snapshot that predates the field" from "a creator removed every row" at the
  storage layer, because both are an empty array. Resolution is explicit and
  safe: the stored value wins, an empty stored panel stays empty, and rows are
  never merged back in. A stale snapshot can therefore never resurrect a row the
  creator removed; the cost is that a pre-panel snapshot opens with an empty
  panel instead of a guessed one.

## F. Source control

Website repository, branch `codex/tpi-development`. Changed: `functions/api/[[path]].js`,
`studio/workspace-bridge.js`, `scripts/tpi-release.mjs`, `package.json`, and the
new `scripts/verify/tpi-studioflow-135-scene-persistence.mjs`, plus this record
and the maintained documentation. Commits and parity are recorded in
`TPI-CURRENT-DEVELOPMENT-STATUS.md`.

Release baseline is unchanged: the React bundle was not modified, so
`studio/assets/index-D9yljEwa.js` (`e317fc07…`) and
`studio/assets/index-D6ZhUVW1.css` (`1baa338c…`) still match
`scripts/studioflow-release-baseline.json`. Only the unbundled
`workspace-bridge.js` changed, and `stageStudioAssets()` restages it into
`.local-dev/assets` for the local Worker.

## G. Production status

Production is unchanged: Worker `4de115db-6537-41b5-9bf7-ae99cb0e20fc` at 100%
still runs the pre-fix code. This directive authorized investigation,
implementation and local verification only; no deployment, database change,
authentication change or production record was performed.

## H. Outstanding issues and risks

- The fix is local only until a separate owner-approved release directive. The
  live defect found in TPI-134R therefore remains visible on production.
- The maintained gate creates and purges disposable Studios in whatever account
  `TPI_FIREFOX_ACCOUNT` names. In preflight that is the synthetic `test_admin`
  account on the local Worker; it never runs against production.
- The bridge cannot tell a pre-panel snapshot from an emptied panel (§E); the
  chosen resolution is explicit and non-destructive but means such a Studio opens
  with an empty Scenes panel.
- Unrelated, still open: the lineage loss (Notes, podcast export, folder sync,
  recording-audio work, private stage reader) and the TPI-035 test discrepancy.

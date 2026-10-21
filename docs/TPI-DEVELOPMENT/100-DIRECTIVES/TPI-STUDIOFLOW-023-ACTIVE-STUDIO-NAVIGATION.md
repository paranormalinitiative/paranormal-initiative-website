# TPI-STUDIOFLOW-023 — Active Studio Name in Navigation

## Directive status

**COMPLETE / OPERA VERIFIED / LOCAL DEVELOPMENT ONLY.** This was a targeted UI
correction. Existing Studio data, switching, autosave, restoration, scenes,
media, and permissions were preserved.

## Root cause

`studio/workspace-bridge.js` used `selectedLabel(selectedWorkspace)` for both
the dropdown's primary button and the items inside the Studio list. That helper
intentionally formats list entries as `Studio <number>: <title>`. The primary
button therefore did not represent the active Studio title as the owner
requested, and its empty-state text was `Select a Studio` rather than the
approved generic `My Studios` fallback.

The active Studio itself was already authoritative and correctly maintained by
the existing TPI-STUDIOFLOW-017 bridge flow:

- `selectedWorkspace` is resolved from the owner-scoped workspace list.
- `studioflow.tpiActiveStudioId.v1` remembers the selected workspace.
- `openWorkspace()` preserves the existing production check and save-before-
  switch sequence.
- `selectWorkspace()` updates the active ID and renders the selected record.
- `refresh()` revalidates the remembered ID against the current server list.

No second active-Studio state was introduced. The bridge now also understands
the app's JSON-encoded active-broadcast storage format and does not attach a
local-only host broadcast to an unrelated server-backed test workspace.

## Implementation

Added a narrow `selectorLabel(workspace)` helper. It returns the current
workspace's trimmed `title`, or `My Studios` only when no valid title is
resolved. `render()` now derives the primary button text from that helper and
updates its accessible label at the same time:

```text
<active Studio title> ▾
```

The existing `selectedLabel()` helper remains in use for the list items, so
Studio numbers and the established list presentation are preserved. Switching,
autosave, production-lock checks, route restoration, scene isolation, and media
references were not refactored.

## Expected behavior

- Active `Crossroads of the Unknown` → `Crossroads of the Unknown ▾`
- Active `How to Ghost Hunt` → `How to Ghost Hunt ▾`
- Active `TPI Learning Test` → `TPI Learning Test ▾`
- No valid active Studio → `My Studios ▾`
- Remembered Studio deleted/unavailable → existing fallback behavior remains

Studio names are not hardcoded.

## Browser verification

Opera Air remains the authoritative development browser. Its existing
StudioFlow tab was refreshed without touching unrelated tabs. The development
HTML now references `/studio/workspace-bridge.js?tpi023=active-title-v2`, so
Opera loaded the bridge with a fresh `200 OK` without clearing browser cache,
storage, cookies, or sessions. The exact visible selector label was
`Crossroads of the Unknown ▾`, and the accessibility label was
`Select Studio: Crossroads of the Unknown`.

The underlying cause also included a storage-format mismatch: the main app
stores `studioflow.activeBroadcastId` as JSON, while the bridge previously read
it as a raw string. The bridge now parses that value, reconciles after app
hydration, and avoids saving a local-only host broadcast into the unrelated
synthetic server workspace. Earlier authorized refreshes did produce existing
autosave PATCH requests; no intentional Studio, scene, media, or setting change
was made.

The isolated Codex browser was inspected separately. It showed the existing
StudioFlow interface and the generic `My Studios` fallback while no valid active
workspace was available in that isolated session. This confirms the fallback
path, but it is not evidence about the owner's Opera Studio title.

No Opera storage was cleared, and cookies, Studio records, and media were not
manually changed. The bridge reconciled its own active-Studio key as part of
the runtime state correction.

## Tests

- TPI-023 focused offline checks: **14/14 passed**.
- TPI-STUDIOFLOW-017 offline checks: **14/14 passed**.
- TPI-STUDIOFLOW-012 offline checks: **14/14 passed**.
- TPI-STUDIOFLOW-019 checks: **7/7 passed**.
- TPI-STUDIOFLOW-020 checks: **11/11 passed**.
- `git diff --check`: **PASSED**.
- External internet requests: **0**. Local browser HTTP requests occurred as
  part of the authorized runtime verification.

## Files modified

- `studio/workspace-bridge.js`
- `studio/index.html`
- `.local-dev/assets/studio/index.html` (current local staged runtime copy)
- `scripts/verify/tpi-studioflow-023-active-studio.mjs`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-023-ACTIVE-STUDIO-NAVIGATION.md`
- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-023-RESULT.md`

These files were modified or created for TPI-023 only; all other dirty worktree
changes were preserved and not cleaned up.

## Safety

- Local development only.
- No deployment.
- No database migration or reset.
- No production access.
- No intentional Studio creation, deletion, rename, or data mutation; prior
  authorized refreshes did issue existing synthetic-workspace autosave PATCHs.
- No media or recording changes.
- No Worker or room-server restart.
- No commit or push.

## Remaining limitation

Crossroads of the Unknown is currently a local StudioFlow broadcast without a
matching server-backed `studio_workspaces` row in the local development D1.
The selector correctly displays it and refuses to bind saves to an unrelated
synthetic workspace, but server-backed persistence for that local-only Studio
requires a separate approved data-mapping decision. Recording and livestream
were not activated.


# StudioFlow panel cache and isolation repair

Date: 2026-10-23

Status: SUPERSEDED BY THE LIVE PANEL DISPLAY REPAIR

## Correction

This cache rotation was valid but did not fully resolve the production defect.
The live owner session later proved that the media bridge elements were marked
hidden yet still rendered because their author stylesheet applied
`display: grid`. The complete root cause and deployed correction are recorded
in
`2026-10-23-STUDIOFLOW-LIVE-PANEL-DISPLAY-REPAIR.md`.

The 59/59 result below used an assertion that trusted `node.hidden`; it did not
prove that the browser had removed the element from the rendered layout. The
replacement acceptance test checks computed display and rendered client
rectangles.

## Problem

The maintained media bridges had already been changed to hide their injected
video, timer, sound, and music sections outside Media Assets. Fresh disposable
Firefox acceptance passed, but an existing Firefox profile could continue
loading the old bridge URLs because the script query strings had not changed.
That made the right rail appear cumulative even though the new React panel
state was exclusive.

## Repair

- Bumped the video and audio bridge cache identifiers to `exclusive-v2`.
- Added the generated video timer bridge section to the same active-panel
  visibility gate.
- Updated the authoritative staging and release-safety checks to require the
  new cache identifiers.
- Preserved the existing React one-panel conditional rendering and all media
  functionality.

## Verification

- Local authentication lifecycle: 38/38 passed.
- Local Firefox Developer Edition acceptance: 59/59 passed.
- Isolated API/build/request-budget/room/RTMP checks: passed.
- Authoritative StudioFlow build: reproducible twice.
- Guarded Wrangler dry-run: passed.
- Live anonymous production smoke: 10/10 passed.
- Live isolated Firefox Developer Edition acceptance: 59/59 passed.
- Owner Firefox profile: not accessed.

## Release

- Branch: `codex/tpi-development`
- Source/release commit: `983601d74cad700a9b14148ff4b7dcab3fca93bc`
- Worker: `theparanormalinitiative`
- Deployed version: `a4e1f565-21fb-449d-878a-388beabac36c`
- Immediate rollback version: `41c7c0bf-5b46-4fd7-b2af-4bdf3f101bc3`
- Rollback required: no

No D1 migration, R2 mutation, Crossroads change, or owner-browser storage
access occurred.

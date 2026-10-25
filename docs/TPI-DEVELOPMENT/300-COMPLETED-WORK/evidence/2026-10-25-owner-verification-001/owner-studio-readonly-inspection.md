# Owner Studio read-only inspection — TPI-STUDIOFLOW-OWNER-VERIFICATION-001 §8

Date: 2026-10-25 (after 19:09 EDT)
Method: read-only `SELECT` statements against the production D1 database
`tpi_contributor_portal` through the project's authenticated Wrangler access
(`npx wrangler d1 execute ... --remote`). No writes, no mutations, no owner-data
changes. Owner Studios were not modified, renamed, reset, or deleted.

## Server-backed Studio records (`studio_workspaces`)

The owner account `5d9e7ec6-9507-487a-96fd-00441f7f7570` has exactly three
workspace records:

| Created (UTC) | Title | Status | Workspace ID |
|---|---|---|---|
| 2026-10-20T01:24:38Z | TPI Acceptance Test A | active | (owner test) |
| 2026-10-20T01:30:00Z | TPI Acceptance Test B | active | (owner test) |
| 2026-10-25T16:37:36Z | Testing 123 | active | `a75afc38-c7a6-452d-9460-5d746712d411` |

All other `studio_workspaces` rows belong to the synthetic QA account
(`qa-17927…`) and are lifecycle/verification fixtures (archived at cleanup).

There is **no** `studio_workspaces` row named "Crossroads of the Unknown" or
"Browser Only Crossroads". Consistent with the workspace architecture
(TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md), browser-local Studios live in the
creator's own browser storage (`studioflow.broadcasts`,
`studioflow.tpiLocalStudioSnapshots.v1`) and have no server workspace record
until saved through "Save Current Studio to My Studios".

## Testing 123 — saved state (read-only extract)

- Workspace ID: `a75afc38-c7a6-452d-9460-5d746712d411`
- local_broadcast_id: `studio-52e44312-20b1-4e9f-b31e-18c148271d5d`
- Created 2026-10-25T16:37:36Z — **before** the lifecycle repair was deployed
  (Worker `9d3aa40c` deployed 22:16Z the same day).
- Saved `configuration.scenePanelItems` contains exactly the eight rows the
  owner reported:
  1. Intro Video (intro)
  2. Background Music (music, scene `after-intro`)
  3. Countdown Timer (timer)
  4. Demo scene 2 (scene `scene-2`)
  5. Background Music (music, scene `scene-2`)
  6. Two-person split (scene `scene-1`)
  7. Background Music (music, scene `scene-1`)
  8. Outro Video (outro)
- `studioScenes` contains `Intro video`, `Two-person split`, `Demo scene 2`,
  `Outro video` — Crossroads-like scene configuration.
- `sceneMusicAssignments` and `backgroundMusicSlots` reference Crossroads-era
  media ("The Valley of RA…", "Nefertari's Dream…"); `videoClipSlots` contains
  `COTU INTRO.mp4` (Crossroads of the Unknown intro). `selectedBackground` is
  `custom-image`.

## Interpretation

1. **Testing 123 holds historically persisted inherited configuration.** It was
   created at 16:37Z under the pre-repair build (the creation-inheritance
   defect fixed in source `44f9478` / Worker `9d3aa40c`, deployed 22:16Z), and
   its own saved record contains the eight Crossroads-like panel rows and
   Crossroads media assignments the owner observed. This is stored data created
   by the old defect — not a failure of the deployed repair to initialize new
   Studios.
2. **The current repair does not rewrite existing saved data.** Per the owner
   data protection requirements, no remediation was performed. A separate
   proposed remediation (exact Studio ID, current saved state, proposed change,
   backup/rollback procedure, expected outcome, risks) is included in the
   completion record and awaits explicit owner authorization.
3. **"Browser Only Crossroads" has no server record.** It is a browser-local
   Studio in the owner's own browser profile. Its snapshot references are only
   legitimately accessible inside that browser; the agent has no access to the
   owner's browser-local storage and did not attempt to obtain any. If that
   Studio lacks a saved snapshot, the deployed repair now opens it with the
   default configuration and a visible notice instead of silently reverting
   (owner-flow checks H2a/H2b, verified live). Whether the owner's specific
   browser-local record has a snapshot cannot be established from the server
   side; that is an explicit limitation.
4. **"Crossroads of the Unknown" is not present as a server workspace row
   under the owner account.** The protected Crossroads production data remains
   wherever the owner maintains it (browser-local Studio state and/or media
   assets). Nothing in this investigation read, wrote, or altered it.

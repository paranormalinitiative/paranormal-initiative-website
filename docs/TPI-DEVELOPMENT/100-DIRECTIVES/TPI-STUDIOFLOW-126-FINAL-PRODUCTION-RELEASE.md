# TPI-STUDIOFLOW-126 — Final Production Release

Date: 2026-11-01 (UTC)

Status: **COMPLETE — DEPLOYED AND VERIFIED**

## Release decision

The guarded release workflow promoted the verified `codex/tpi-development`
candidate to the production Worker after all mandatory gates passed. No D1
migration, D1 data mutation, R2 deletion, credential rotation, or production
configuration change was performed.

## Release inventory

| Directive | Feature | Development status | Source / baseline | Website release | Decision |
| --- | --- | --- | --- | --- | --- |
| TPI-STUDIOFLOW-122F.4A–122F.5 | Notes Trash, restore, missing-folder notice, attachment-safe deletion, and closure baseline | VERIFIED COMPLETE | `9703b087e91e85e0f791f618a90f9b2c4eeb5160` | `a025889a7e0361ddbd1867c2f66c83c0ebbe1e43` | INCLUDE |
| TPI-STUDIOFLOW-125 | Teleprompter Script integration, My Scenes workflow, color-coded production items, and private manual playback | COMPLETE | `e2363fb877d3984c938f0703fe62446ad9f17c4f` | `a025889a7e0361ddbd1867c2f66c83c0ebbe1e43` | INCLUDE |
| TPI-STUDIOFLOW-122H | Podcast Project export and ZIP packaging | COMPLETE IN DEVELOPMENT; not previously deployed | `56f8ad7cc403560e22388e907b2000ee9f49c0db` | Not separately integrated in this candidate | EXCLUDE |
| TPI-STUDIOFLOW-122H.1–122H.2 | Native local-folder synchronization | PARTIAL / native filesystem verification outstanding | Preserved in development history | Not integrated | EXCLUDE |
| TPI-STUDIOFLOW-122F broad completion | Remaining Notes acceptance beyond the accepted Trash sequence | PARTIAL | Historical records preserved | Not separately integrated | EXCLUDE |

The release contains only the approved, verified candidate already staged on
the website branch. Incomplete local-folder synchronization and unrelated
unfinished work were not promoted.

## Provenance and assets

- Website branch: `codex/tpi-development`
- Website release commit: `a025889a7e0361ddbd1867c2f66c83c0ebbe1e43`
- StudioFlow source commit: `e2363fb877d3984c938f0703fe62446ad9f17c4f`
- Canonical generated JavaScript: `studio/assets/index-C7n2E6kz.js`
- JavaScript SHA-256: `94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc`
- Canonical generated CSS: `studio/assets/index-SDxcWQji.css`
- CSS SHA-256: `0b2b18de7f6308a19116e539d2ac10de54bd9241f300b8d7229577c5eca302b7`
- Reproducible staging: PASS; generated assets matched the integrated candidate
  in both verification builds.
- GitHub parity before release: PASS, `0/0` ahead/behind on the website branch.

## Release gates

| Gate | Result |
| --- | --- |
| Completed directive inventory | PASS |
| Approved change isolation | PASS |
| Reproducible build | PASS |
| Source and website parity | PASS |
| Local authentication lifecycle | PASS; 38/38 per lifecycle run |
| Local Firefox lifecycle | PASS; 64/64 |
| Studio lifecycle regression | PASS; 29/29 |
| Studio ownership regression | PASS; 40/40 |
| Studio deletion/archive regression | PASS; 31/31 |
| Studio deletion safety regression | PASS; 32/32 |
| Isolated API/QA E2E | PASS |
| Production smoke checks | PASS; 10/10 |
| Firefox production acceptance | PASS; 64/64 |
| Release safety | PASS; 21/21 |
| Rollback readiness | PASS |
| Documentation readiness | PASS |

## Standalone regression verification after deployment

These maintained local checks were executed against the authoritative Worker
after the production release and are reported separately from the guarded
release workflow:

- Notes regression (`tpi-studioflow-122-notes.mjs`): PASS; every emitted check
  passed, including Notes navigation, editor focus, autosave, title generation,
  folders, image removal, and responsive behavior.
- Scenes panel regression (`tpi-studioflow-037-scenes-panel.mjs`): PASS, 20/20.
- Recording/storage regression (`tpi-studioflow-035-recording-storage.mjs`):
  PASS, 33/33.
- Screen-sharing regression (`tpi-studioflow-120-screen-share.mjs`): PASS,
  13/13. Native operating-system picker interaction remains
  `NOT_AUTOMATED`.
- Release safety (`tpi-release-safety.mjs`): PASS, 21/21.

## Production deployment

- Production URL: https://paranormalinitiative.com/studio/
- Worker: `theparanormalinitiative`
- Previous Worker: `4108a0d7-5833-435f-8a0b-f6be8c1c8b27`
- New Worker: `584f29db-1568-4ff4-a99e-b32b3b63a23e`
- New deployment record: `9c250a8d-4b6e-432c-b210-0e5ef591b41e`
- New deployment time: `2026-11-01T03:12:18.83128Z`
- Traffic allocation: 100% to `584f29db-1568-4ff4-a99e-b32b3b63a23e`
- Rollback target retained: `4108a0d7-5833-435f-8a0b-f6be8c1c8b27`
- Deployment result: `DEPLOYED_AND_VERIFIED`

The guarded workflow performed anonymous production smoke checks and isolated
Firefox acceptance using the dedicated synthetic production QA account. The
live Firefox run authenticated, loaded StudioFlow, exercised the protected
panels and media/backup flows, and completed 64/64 checks without accessing an
owner browser profile.

## Functional verification and limitations

Verified in production:

- Authentication and protected StudioFlow access.
- My Studios lifecycle, ownership, switching, refresh persistence, and safe
  deletion/archive safeguards.
- My Scenes and Teleprompter panel integration, including the private reader
  boundary and production-item presentation covered by the maintained suite.
- Notes panel access and protected panel exclusivity.
- Existing public-site routes and private API boundaries.

Known limitations retained accurately:

- Native operating-system screen picker selection was not automated by the
  maintained screen-sharing harness.
- External livestream delivery was not initiated; configured destinations are
  not represented as verified external broadcast delivery.
- TPI-STUDIOFLOW-122H.1–122H.2 native local-folder synchronization remains
  partial and was excluded from this release.
- Notes Trash retains underlying R2 objects where safe object-level ownership
  and reference cleanup cannot be proven; no R2 cleanup was introduced.
- The production Firefox acceptance is isolated synthetic QA coverage, not
  owner-content acceptance.

## Documentation and handoff

This record is the production baseline for TPI-STUDIOFLOW-126. The directive
index, current development status, agent handoff, production deployment
history, and future-development roadmap were updated in the same documentation
checkpoint. Historical partial reports remain unchanged; statuses here
distinguish implemented, verified in development, deployed, and verified in
production.

Production data, authentication, D1, R2, existing Studios, recordings, and
owner browser data were preserved. The next development directive should begin
from the pushed website branch and the source commit recorded above.

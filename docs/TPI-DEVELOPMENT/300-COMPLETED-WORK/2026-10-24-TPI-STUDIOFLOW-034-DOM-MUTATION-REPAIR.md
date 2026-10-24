# TPI-STUDIOFLOW-034 — StudioFlow DOM Mutation Storm Repair

Date: 2026-10-24
Authority: TPI-STUDIOFLOW-034 under the standing TPI master agent authority
Status: COMPLETE / DEPLOYED AND LIVE-VERIFIED

## Scope and governing record

The governing `AGENTS.md`, the master autonomous-agent authority, the local-to-
production runbook, and the StudioFlow source-to-live workflow were reviewed
before investigation. Historical records for TPI-STUDIOFLOW-028 and Addendum A,
029, 030, 031, and 032 were reviewed together with the Playback Contract,
development status, agent handoff, directive index, bridge architecture, and
browser-testing records. Historical records remain unchanged.

The canonical website repository was used at `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`, branch `codex/tpi-development`. The authoritative StudioFlow source remained `/Users/toddknipple/Documents/StudioFlow/web`; no source application change was required. Starting website HEAD was `546d90d`; starting production commit was `6a1f8ad`; starting Worker was `7029c6c5-3994-42a1-9570-d6119a5792f3`; starting rollback target was `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`.

## Investigation and root cause

The reported storm was reproduced locally in isolated Firefox Developer Edition
before the repair. A settled five-second idle window produced 32,495 attribute
records, 6,498 added nodes, 6,498 removed nodes, 2,171 observer callbacks, and
22,743 redundant hidden writes. A 30-second window produced 196,054 attribute
records, 39,204 added nodes, 39,204 removed nodes, and 13,102 callbacks. The
largest repeated child target was `.tpi-scene-music-label`; the repeated writes
also included scene-button `disabled`/`title`, legacy-audio `hidden` and data
attributes, and native video-timer visibility attributes. No repeated workspace
saves or media synchronization requests were observed; room guest/status GETs
at the existing 10-second cadence were expected polling.

The actual cycle was:

1. `audio-soundboard-bridge.js` observed the document body subtree for child-list,
   subtree, and class mutations.
2. Its callback scheduled `sync()` and called panel-visibility synchronization.
3. `sync()` called `renderState()` and `syncSceneMusic()`.
4. `sceneMusicButton()` unconditionally assigned the same label text, title,
   disabled state, and related attributes.
5. Reassigning identical `textContent` replaced the label text node, producing
   child-list mutations inside the observed subtree.
6. The observer saw those mutations and restarted the cycle indefinitely.

The video bridge and audio bridge also performed redundant hidden/style/data
writes while the cycle was active. `workspace-bridge.js` could rebuild studio
menus on every render call; settled idle instrumentation showed no menu churn,
but its render path lacked a meaningful-state guard and was hardened as part of
the same targeted repair. The asset-state bridge, backup bridge, navigation
bridge, and brand bridge were inspected; no additional self-sustaining cycle was
found. Existing stale-response protection and stable asset-identifier matching
were preserved.

## Repair

The application repair is in commit `8d7185b279de2b33c9e1b657c1d60dffa80143c8`.

- `studio/audio-soundboard-bridge.js`: scene labels, titles, disabled state,
  selection state, panel visibility, and legacy-audio attributes are written
  only when their desired value differs from the current DOM value.
- `studio/video-clip-management-bridge.js`: panel visibility, legacy video
  placeholders, and native timer attributes are likewise idempotent.
- `studio/workspace-bridge.js`: studio-menu rendering is fingerprinted against
  meaningful workspace and selection state, so unchanged menu data is retained.
  Studio selection, creation, rename, deletion, restoration, and saving remain
  on the existing paths.
- `studio/index.html` and `scripts/stage-studioflow-authoritative.mjs`: the
  maintained bridge cache-buster is `tpi034=dom-stability-v1`.
- `scripts/verify/tpi-studioflow-034-mutation-regression.mjs`: maintained
  Firefox regression instrumentation and controlled disposable-studio coverage.
- `package.json` and `scripts/verify/tpi-release-safety.mjs`: the new regression
  command and staging contract are integrated into verification.

No React source, media record, D1 schema, R2 object, Crossroads workspace,
production user content, or unrelated StudioFlow system was modified.

## Before and after measurements

| Metric | Before repair | After repair |
| --- | ---: | ---: |
| Idle attribute records / 5 seconds | 32,495 | 5 expected checkbox updates |
| Idle child-list records / 5 seconds | 12,996 add/remove events | 0 |
| Idle observer callbacks / 5 seconds | 2,171 | 5 |
| Idle redundant hidden writes / 5 seconds | 22,743 | 0 |
| Idle menu child adds/removals / 5 seconds | storm-associated churn | 0 |
| Idle attribute records / 30 seconds | 196,054 | 35 expected checkbox updates |
| Idle child-list records / 30 seconds | 78,408 add/remove events | 0 |
| Idle observer callbacks / 30 seconds | 13,102 | 35 |
| Workspace saves in settled idle windows | 0 | 0 |
| Media synchronization in settled idle windows | 0 | 0 |

CPU utilization was not isolated as a trustworthy per-page metric in the
maintained harness. The mutation and callback evidence is sufficient to show
that the self-sustaining loop is gone. Results were repeated in existing and
fresh disposable studios, sound-effects and background-music panels, the
background picker, active background-music playback, after playback stopped,
and after switching to a second disposable studio. All settled windows had zero
node churn and zero redundant writes. The normal room polling requests remained
bounded and unchanged.

## Validation

The maintained mutation regression passed twice consecutively after the final
repair, including the 5-second and 30-second windows, active playback, panel
coverage, and disposable studio switching. The full required local and release
checks passed, including the local authentication lifecycle 38/38 per phase,
isolated Firefox local acceptance 64/64, complete QA/API E2E, production
request-budget guard, read-only production smoke 10/10, reproducible source
staging, and the guarded Wrangler dry run.

The focused regression battery passed: TPI-STUDIOFLOW-020 playback and video
clips, 021 audio contracts and browser interactions, 027 scene contracts, 028
scene browser interactions, 030 Sound Effects browser interactions, 031
Background Music browser interactions, 031 video overlays, and release safety.
The production Firefox acceptance passed 64/64, including StudioFlow loading,
Video Clips, Sound Effects, Background Music, My Studios switching and
restoration, Intro/Outro independence, and persistence checks. No owner browser
profile was accessed and no real recording or livestream was started.

## Release

The guarded production workflow completed with `DEPLOYED_AND_VERIFIED` on
2026-10-24:

- Application commit: `8d7185b279de2b33c9e1b657c1d60dffa80143c8`
- StudioFlow source commit: `ce7c389d23db65bd5ebb92597695d9854d21c7ab` (source unchanged)
- Production Worker: `theparanormalinitiative`
- Deployed Worker version: `0c0a8660-21cf-47e1-ac66-98c91b26972c`
- Rollback reference: `7029c6c5-3994-42a1-9570-d6119a5792f3`
- Production anonymous smoke: 10/10
- Production isolated Firefox acceptance: 64/64

The documentation synchronization commit follows this application release.
There were no production D1, R2, Crossroads, or user-media mutations.

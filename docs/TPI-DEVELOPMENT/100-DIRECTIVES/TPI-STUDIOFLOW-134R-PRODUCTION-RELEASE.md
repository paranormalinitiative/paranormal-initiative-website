# TPI-STUDIOFLOW-134R — Authorized Production Release

Directive: TPI-STUDIOFLOW-134R (authorized production release of
TPI-STUDIOFLOW-134 and its Scene Teleprompter live-playback addendum).
Release date: 2026-11-01.
Authorization: approved by the project owner.

## 1. Result

`release:production` finished **DEPLOYED_AND_VERIFIED** with exit 0 at
**2026-11-01T22:37:19Z**. The new Worker version is
**`4de115db-6537-41b5-9bf7-ae99cb0e20fc`**, receiving 100% of production
traffic. The rollback target is the previously active
**`71a5293d-fef4-4643-bf50-e9dfc7327eb5`**. The anonymous production smoke suite
passed 10/10 and the authenticated isolated Firefox Developer Edition acceptance
suite passed 64/64 inside the guarded release command.

The release did not delete, recreate, reset or otherwise rewrite a Studio, D1
record, R2 object, membership, credential or browser-local Studio. Crossroads
of the Unknown was never opened by the release or by any verification run.

## 2. Released identity

| Item | Value |
| --- | --- |
| Branch | `codex/tpi-development` |
| Approved website commit | `ea2ca6a` (parity with `origin`) |
| Approved source commit | `f44f3a08cfc0efa271385125c6780557aaa85fb9` on `codex/tpi-134` |
| JavaScript | `studio/assets/index-D9yljEwa.js`, SHA-256 `e317fc07…` |
| CSS | `studio/assets/index-D6ZhUVW1.css`, SHA-256 `1baa338c…` |
| Previous Worker | `71a5293d-fef4-4643-bf50-e9dfc7327eb5` |
| New Worker | `4de115db-6537-41b5-9bf7-ae99cb0e20fc` |

The 11 maintained bridge files (`workspace-asset-state`, `brand-heading`,
`production-lock`, `workspace`, `video-playback-reset`,
`video-clip-management`, `audio-soundboard`, `backup`, `backup-core.mjs`,
`navigation`, `studioflow-012-overrides.css`) are byte-identical to `291b83d`;
`git diff 291b83d..HEAD` over that set is empty.

## 3. Preflight

`npm run release:preflight` ran three times during this directive.

| Run | Result |
| --- | --- |
| First | **FAILED** at the TPI-133 floating menu gate (S5 scroll, S6 resize) |
| Second, third | **READY, exit 0**, `rollbackVersion 71a5293d-…` |

The first failure is a timing flake in a suite this release did not modify: the
same suite passed **44/44 twice standalone** immediately afterwards and passed
in both subsequent full preflights. It is not a regression and was not treated
as harmless — it was reproduced and re-run before deployment.

Verified inside preflight: branch, clean tree and GitHub parity; persistent
`local_admin` lifecycle; disposable D1/R2 E2E; QA and API E2E; reproducible
StudioFlow build (`reproducibleBuilds: true`, `matches: true`, 29/29 files);
isolated Firefox acceptance; Cloudflare account/Worker/binding/rollback captures;
guarded Wrangler dry run; final Git cleanliness and parity.

Gate counts: TPI-134 **43/43**, TPI-133 **44/44**, Firefox release acceptance
**64/64**, Scenes panel, provenance `20/20`, deletion, ownership, lifecycle,
release safety and local auth lifecycle all passing. The pre-existing
`verify:studioflow-035-recording-storage` discrepancy (it asserts
`[data-private-teleprompter="true"]`, which exists only on the unreleased
`codex/studioflow-122-notes` lineage) is unchanged and was not "fixed" here.

## 4. Live production verification

Run against `https://paranormalinitiative.com` with the synthetic
`production_qa` account in a disposable Firefox Developer Edition profile. The
run created its own disposable Studio and never opened, mutated or deleted an
existing Studio.

Confirmed live:

- Production authentication succeeds; the StudioFlow editor loads.
- The served bundle is **byte-identical** to the approved build: fetching
  `/studio/assets/index-D9yljEwa.js` from the page yields SHA-256
  `e317fc071f4968e3…`, so the deployed code is exactly the code that passed
  43/43 local Firefox acceptance.
- Scene rows use the approved colors with full-perimeter borders — video
  orange `rgb(249,115,22)`, Scene blue `rgb(59,130,246)` resting /
  `rgb(96,165,250)` selected, Teleprompter purple `rgb(168,85,247)`.
- Dragging a Teleprompter script from the right rail publishes
  `application/x-studioflow-teleprompter-script`, highlights a purple drop
  target, and creates a purple, full-perimeter `teleprompter-script` row
  labelled for the creator.
- Clicking that row **opens the live presenter teleprompter on the stage**,
  loads the correct script text, positions it at the beginning and leaves it
  **paused and ready for Play**. No blocking reader dialog appears.
- Play runs the approved countdown and scrolls the script; Pause holds it;
  Reset clears the countdown and returns the reader to the beginning with the
  control returned to Play.

Evidence:
`evidence/TPI-STUDIOFLOW-134/production-scene-script-cued-in-live-teleprompter.png`
shows the live stage with the cued script and its Play/Reset/Speed/A−/A+/Hide
controls, alongside the purple `134R Live Script` row in My Scenes.

## 5. Outstanding defect found by the live run — Scene rows do not survive a reload

The live run found one real gap that no local gate can see. In a Studio backed
by an account workspace, a dropped Teleprompter Script row is created, cues the
live prompter, and survives for the session, but **is gone after a page reload**.

Measured sequence: after the drop, `studioflow.scenePanelItems` holds 5 rows
including the new one and the DOM shows it; a real reload returns it to the 4
default rows. The account workspace is not the cause of data loss on the server
side — it never stores that key at all: the saved workspace `state` exposes only
`broadcast`, `settings`, `recording` and `configuration`. The restore path
therefore rebuilds the panel from server-derived defaults and replaces the
browser-local rows.

Cause, stated exactly: `scenePanelItems` is **browser-local state that the
account workspace sync does not carry**, and the production restore path treats
the server snapshot as authoritative for the panel. The local gate could not
catch this because it seeds a Studio in browser-local storage only, so there is
no server snapshot to overwrite the seed. This is a pre-existing scope limit of
the release lineage's workspace sync meeting the restored TPI-125 feature, not a
regression this release introduced: no previously working behavior changed.

Impact and scope: the live cue works for as long as the row exists in the
session; the row must be re-dropped after a reload. Colors, drag, cue, Play,
Pause, Reset, Studio switching, deletion safeguards, authentication and storage
are unaffected.

Rollback was **not** executed. TPI-134R's rollback clause is triggered by a
critical regression, and this is an incomplete new capability inside a
successful release rather than a regression of previously verified behavior;
rolling back would also remove the colors, drag and live cue the owner
explicitly verified and authorized. `71a5293d` remains the recorded, tested
rollback target if the owner decides otherwise.

Recommended follow-up (not performed here — this directive authorized only the
verified 134 release): persist `scenePanelItems` in the account workspace
snapshot, or merge server state with existing browser-local rows on restore
instead of replacing them, and extend the Firefox gate so it seeds through an
account-backed Studio. That work needs its own directive.

## 6. State after release

- Production: `4de115db-6537-41b5-9bf7-ae99cb0e20fc` at 100%.
- Rollback: `71a5293d-fef4-4643-bf50-e9dfc7327eb5`, tested and recorded in
  `.local-dev/release-preflight.json`.
- GitHub: `ea2ca6a` on `codex/tpi-development`, clean tree, parity confirmed.
- Source: `f44f3a08cfc0efa271385125c6780557aaa85fb9` on `codex/tpi-134`, clean.
- Studio data: untouched; the verification Studio created in the QA account is
  the only new record, and the QA account's existing Studios were read-only.
- Remaining known limitations: the reload loss in §5; the pre-existing
  TPI-035 recording/storage test discrepancy; the wider lineage loss (Notes,
  podcast export, folder sync, recording-audio work, private stage reader) still
  awaiting its own directive.

## 7. Owner verification

The owner verified the local implementation before authorization. **Live owner
verification of the production site is still required** — this record does not
declare the live release owner-verified. The owner should open
`https://paranormalinitiative.com/studio/`, click a Scene Teleprompter item,
confirm the live prompter cues paused at the beginning, and note that a reload
currently drops that row until §5 is addressed.

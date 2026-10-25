# TPI Development Agent Handoff

Last verified: 2026-10-25
Current controlling directive: TPI MASTER — Standing Autonomous Agent Authority

## Mandatory authority update

Read `100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`. Agents now have
standing authority to investigate, repair, test, commit, push, perform guarded
production deployment, verify live, and roll back. Do not stop for a routine
repairable blocker or require a fresh owner directive for each lifecycle step.
Historical restrictions below describe prior executions and do not override
the controlling directive.

## Workspace

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Last fully verified workflow baseline: `41f36688c0fc2d38f99ca5559494390af68c59c3` (application) / `3bf3acf` (source)
- Active production Worker version: `4b44e41d-7fb1-43a8-b9d9-510a90672cb0`
- Recorded rollback target: `3a9b090f-78b5-43d6-bb11-17a1ba54d41b`
- Local website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`
- Worker ownership: launchd-owned by `com.tpi.local-development`

## TPI-STUDIOFLOW-037 Addendum E current handoff

Addendum E is repaired, deployed, and live-verified. The
confirmed defects were durable shortcut recreation after removal, missing
shared context-menu coverage for Background Music, and preview lifecycle
state being mistaken for a production scene transition. New Studios now use
Intro Video → Scene 1 → Scene 2 → Outro Video; `Remove from Scenes` removes
only the panel shortcut; new scenes use the next available sequential name;
and deleting a saved scene layout remains confirmation-backed. Individual
Intro preview stop does not start After Intro music, while natural completion
and sequence rehearsal preserve the production handoff.

The maintained Firefox Addendum E suite passed 20/20. The source commit is
`3bf3acf` in `/Users/toddknipple/Documents/StudioFlow/web`; the website
application commit is `41f36688c0fc2d38f99ca5559494390af68c59c3`. Production
Worker `4b44e41d-7fb1-43a8-b9d9-510a90672cb0` is live with rollback
`3a9b090f-78b5-43d6-bb11-17a1ba54d41b`. Guarded live smoke passed 10/10 and
isolated Firefox acceptance passed 64/64. Owner acceptance remains pending
until the owner confirms the corrected interface.

## TPI-STUDIOFLOW-037 current handoff

Addendum D is deployed and live-verified. Playable production shortcuts use
independent first-click play/second-click stop behavior through the existing
timer, Video Clips, and Background Music engines. Play Sequence is now a
visible Play Sequence/Stop Sequence rehearsal toggle with cancellation tokens
and timeout cleanup. The context menu's `Remove from Scenes` action removes a
panel shortcut without deleting its underlying asset. The focused Addendum D
regression passed 10/10. Source commit is `5186e28`, website application/test
commit is `8d46a45`, production Worker is
`3a9b090f-78b5-43d6-bb11-17a1ba54d41b`, and rollback is
`5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`. Local/live isolated Firefox
acceptance passed 64/64 and production smoke passed 10/10. Owner acceptance
remains pending. See
`300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md`.

The Scenes panel redesign, Addenda A/B uniformity corrections, the reactive
drag-and-drop repair, and the Addendum C visual-consistency and drag
interaction corrections are deployed and live-verified. Source commit is
`d6b8f03`; website application commit is `8a954ad` (test commit `dd22fc5`).
The maintained Firefox suites `npm run verify:studioflow-037-scenes-panel`
(20/20) and the Addendum C acceptance suite (26/26) pass. The panel uses
uniform stable shortcut items for Intro Video, Countdown Timer, Production
Scene, Video Clip, and Outro Video with single-line labels and full-name
tooltips, per-Studio ordering, skip flags, context actions, rehearsal-only
Play Sequence, the same drag handle on every movable item, a live `Move here`
gap with surrounding rows visibly repositioning as the pointer moves, Escape
cancellation, edge auto-scroll, Background Music SmartPad color indicators,
and existing workspace autosave. Dragging does not preview media. Existing
timer, Video Clips, and Background Music engines (including After Intro
Background Music and Background Music Stop) remain authoritative; TPI-031
remains passing.

The active production Worker is `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`; the
rollback reference is `1c752f3f-8af3-461f-8082-3dd8a447fd3d`. Production smoke
passed 10/10, isolated Firefox live acceptance passed 64/64, and the Addendum
C suite passed 26/26 against the deployed interface with the synthetic
production QA account. Owner acceptance of the corrected interface is
pending.

The authoritative StudioFlow source is the separate repository:
`/Users/toddknipple/Documents/StudioFlow/web`. The website `studio/` directory
is an integrated generated copy plus maintained TPI bridge files. Use
`node scripts/stage-studioflow-authoritative.mjs` in verification-only mode to
build twice and compare the candidate before any reviewed `--apply` operation.
The complete commit/push/deploy distinction is documented in
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`; use it instead of inferring current
procedure from historical directive or completion records.

Preserve unrelated tracked and untracked changes. Focused commits and pushes to
`codex/tpi-development` are authorized after the applicable checks pass. Do not
reset, clean, stash, force-push, or rewrite history as a routine shortcut.

## TPI-STUDIOFLOW-036 current handoff

TPI-STUDIOFLOW-036 is deployed and live-verified. The nine approved silent
timer themes are available in the existing Video Timers section: Classic
Countdown, Stargate Portal, Alien Transmission, Haunted Clock, Spirit
Manifestation, EVP Signal, ITC Communication, Paranormal Energy Vortex, and
Ghostly Countdown. They share one countdown engine and program-output path;
the four existing durations remain 10, 20, 30, and 60 seconds.

The source revision is `37c6598` in
`/Users/toddknipple/Documents/StudioFlow/web`. The deployable website
checkpoint is `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`, and production Worker
`076c9614-9251-4efd-b047-0e7033f4ad9c` is active at 100% traffic. Immediate
rollback is `aa9bff15-6252-4ae5-9422-17d63b99ab5a`.

The maintained `npm run verify:studioflow-036-video-timers` test passed 28/28.
Local and live isolated Firefox acceptance passed 64/64, production smoke
passed 10/10, and the complete guarded preflight passed. One initial disposable
API gate attempt hit a transient isolated migration startup failure; the
isolated migration was verified independently and the clean retry passed.

The implementation uses `src/videoTimerThemes.ts`, the existing React timer
engine in `src/App.tsx`, the existing workspace configuration bridge, and the
API normalizer. A startup hydration race and a stale duplicate React-owned
timer grid were corrected during validation. No separate timer player,
browser-only persistence system, audio path, or owner-data mutation was added.

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`
- `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`

## TPI-STUDIOFLOW-035 current handoff

The right-navigation cleanup, Teleprompter placement, and Recording & Storage
consolidation are deployed and live-verified. The maintained regression
`npm run verify:studioflow-035-recording-storage` passed 33/33 against the
local Worker in disposable Firefox with fake media devices
(`media.navigator.streams.fake`, `media.navigator.audio.fake`,
`media.navigator.permission.disabled`). It covers the three rail removals,
Teleprompter beneath Notes reusing the existing reader, the seven
consolidated sections, both Settings redirects, connected/persisted
recording settings, the confirmed save lifecycle with the actual destination
reported, destination-fallback decline (awaiting-action) and approval, and
per-studio preference isolation across real Studio switching.

Authoritative StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`.
The workspace bridge recording-settings save/hydrate mapping was repaired in
`studio/workspace-bridge.js` and the activation re-read in `src/App.tsx` —
see the completion record for the four documented defects and the settings
inventory.

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`

Production Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a` is active at 100%
traffic; the immediate rollback is `5c8e78b5-f920-4335-940f-a5e4d6df0e49`.
Guarded live Firefox acceptance passed 63/63 and anonymous smoke passed; the
standalone acceptance runner refuses production targets outside the guarded
release. Cloud storage destinations remain unimplemented and are presented
only as "Not connected"; implementing one requires owner direction and
registered OAuth credentials.

## Prior handoff — TPI-STUDIOFLOW-033

The configuration persistence repair is deployed and live-verified. The focused regression
`npm run verify:studioflow-033-roundtrip` passed 26/26 against the local Worker
with disposable Firefox Studios. It covers `videoClipSlots`, validated slot
positions, scalar `programOrientation`, existing Background Music fields,
stale-save rejection, Studio A/B switching, isolation, and refresh restoration.

Authoritative StudioFlow source commit: `53bf8dc` in
`/Users/toddknipple/Documents/StudioFlow/web`. The completion record and field
inventory are:

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`

Production Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49` is active at 100%
traffic. The immediate rollback is `0c0a8660-21cf-47e1-ac66-98c91b26972c`.
The live non-destructive release acceptance passed 64/64 and anonymous smoke
passed 10/10. The new 033 disposable server round-trip remains local evidence;
live acceptance did not mutate production Studio configuration.

## Latest verified production release

The latest release is TPI-STUDIOFLOW-035: application commit `d0b1f70`, source
commit `60af530`, Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a`, rollback
`5c8e78b5-f920-4335-940f-a5e4d6df0e49`. It is `DEPLOYED / LIVE VERIFIED`.
The 035 suite passed 33/33; guarded live smoke and Firefox acceptance passed
and the deployed bundle serves the new Recording & Storage and Teleprompter
panels. Full evidence is in the TPI-035 completion record.

Prior release TPI-STUDIOFLOW-033: application commit `cb38061`, Worker
`5c8e78b5-f920-4335-940f-a5e4d6df0e49`, rollback
`0c0a8660-21cf-47e1-ac66-98c91b26972c`. It is `DEPLOYED / LIVE VERIFIED`.
The configuration normalizer and hydration repair passed the focused 26/26
local round-trip; guarded live smoke and Firefox acceptance passed 10/10 and
64/64. The prior TPI-034 mutation repair remains in the deployed baseline.
Full evidence is in the TPI-033 completion record.

Deployment commit `6a1f8ad77649f1ef175a5191396d55a45141764c`
(TPI-STUDIOFLOW-032 — Background Music and Sound Effects icon replacement;
feature commit `02056c1`) was deployed to Worker `theparanormalinitiative`
as version `7029c6c5-3994-42a1-9570-d6119a5792f3` at 100% traffic on
2026-10-24. The release passed the 021 browser suite 31/31 (two
consecutive runs), 028 browser 33/33 (twice), the 030 sound-effects suite
25/25 (twice), the 031 music-pad suite 34/34 (twice), 021 static
contracts 86/86, 020 playback 14/14, 020 video clips 13/13, 027 contracts
12/12, 031 overlays 12/12, release safety 17/17, the complete local auth
lifecycle (isolated Firefox 64/64), complete preflight, the guarded
Wrangler dry-run, and the guarded live acceptance against production
64/64 (`DEPLOYED_AND_VERIFIED`). Both pad artwork files were verified
serving byte-identical on production. Crossroads, D1, R2, and owner
browser storage were not modified. The current approved StudioFlow playback
contract and regression history are in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.

## Latest StudioFlow repair

The deployed change is documented in
`300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`.
The API now preserves Video Clips assignments, validated slot positions, and
scalar program orientation through server round-trips and Studio activation.
The focused disposable API/Firefox regression passed 26/26. The prior
TPI-032 pad-artwork behavior remains in the deployed baseline.
The audio pads now show the owner-approved per-category artwork inside the
unchanged circular icon container — Waveform on Background Music pads,
Microphone on Sound Effects pads (`studio/Waveform.png` and
`studio/Microphone.png`, byte-identical to the owner's Desktop originals,
which were left untouched). The artwork is proportion-preserving and
pointer-transparent; pad layout, playback, drag-and-drop, context menus,
and the TPI-030/031 interfaces are unchanged. The 021 browser suite's
obsolete home-screen entry was repaired (each run seeds a fresh
browser-local recording broadcast — the same empty-state studio the home
"Record without going live" flow creates — with all assertions unchanged),
which also ends the disposable test-account studio pollution recorded as
TPI-030 finding 3. The TPI-033 normalizer gaps are resolved, and the TPI-034
bridge mutation storm repair remains in the deployed baseline. The 028 scene playback
workflow
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`,
including its Addendum A section), the TPI-030 Sound Effects work
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`),
and the TPI-031 Background Music work
(`300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`)
remain untouched in the deployed baseline.
Use the disposable Firefox acceptance profile for future checks; do not use
the owner profile for destructive testing.

The automated production acceptance gate must use the disposable Firefox
window titled `TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE`. After that gate
passes, StudioFlow's final user-facing acceptance target is the authenticated
live production page. When the owner has authorized live verification, the
existing production tab may be used non-destructively to confirm the exact
visible behavior; do not alter stored studios, media, recordings, or settings.

## Current browser workflow

- Firefox Developer Edition is the default browser for local and production
  TPI acceptance.
- StudioFlow completion is judged against the live production site. Local
  checks remain safety gates but are not substitutes for live acceptance.
- Automated acceptance uses isolated disposable profiles and never closes or
  repurposes the owner's existing local or production tabs.
- Chromium is used only for an explicit compatibility requirement.

The latest retained browser evidence is 278 PASS, 6 expected limitations, 0
FAIL across 284 routes, with 54/54 focused checks passing and zero external
requests. Synthetic local roles are `local_admin`, `local_member`, and
`local_contributor`; credentials must never be printed or copied into reports.

## Recent verified changes

- OPS-018 changed shared fragment URLs in `includes.js` to root-relative paths
  and restaged local assets; the Worker was not restarted.
- The existing browser harness is `scripts/e2e/tpi-ops-016-browser.mjs`.
- Repository-scoped Playwright tooling uses the locally available package and
  installed Chrome without a browser download.
- OPS-019 policy and result records document Codex/FreeBuff/Opera boundaries.

## Last successful checks

- OPS-002 traffic protection: 11/11
- OPS-007 local foundation: 10/10
- OPS-009 authentication: 27/27
- OPS-011 member home: 37/37
- OPS-012 StudioFlow/ParaTube: 26/26
- OPS-014 local service: 20/20
- OPS-015 admin/API QA: 62/62
- `node --check includes.js`: passed
- `node --check scripts/e2e/tpi-ops-016-browser.mjs`: passed
- `git diff --check`: passed

## Safe continuation

Open the affected route in an isolated Firefox Developer Edition profile,
inspect console and local request activity, and run the smallest applicable
test followed by the required regressions. Agents may control the maintained
LaunchAgent services, commit, push, and deploy through `scripts/tpi-release.mjs`
when required. Do not interrupt unrelated services, expose credentials, or use
owner Studios for destructive testing.

No credentials, tokens, private payloads, or secrets are included in this
handoff.

## Documentation synchronization

Every completed TPI directive must update the affected Markdown records before
its status is marked complete. Record changed source files, executed evidence,
known limitations, development status, and the directive-index entry. Do not
describe a feature as production-ready from local tests alone.

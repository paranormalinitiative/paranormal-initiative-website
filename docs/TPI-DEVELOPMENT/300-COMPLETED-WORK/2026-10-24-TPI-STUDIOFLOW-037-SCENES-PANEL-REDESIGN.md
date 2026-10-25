# TPI-STUDIOFLOW-037 — Scenes Panel Redesign and Production Shortcuts

Date: 2026-10-24
Agent: GPT-5.6 Luna / NiMo 2.6 Pro execution path
Authority: TPI standing autonomous-agent authority and TPI-STUDIOFLOW-037
Status: COMPLETE / DEPLOYED AND LIVE-VERIFIED

## Scope and root cause

The existing left panel rendered legacy scene cards only. Intro and Outro were
connected to React scene selection, while Timers and Video Clips were owned by
the existing right-rail React/bridge controls. That made the panel visually and
behaviorally inconsistent and left no stable panel-level ordering, skip state,
or production-item identity.

The second defect was preview coupling: the existing `scene-changed` event is
also consumed by the Background Music bridge for the approved automatic Intro
to After Intro handoff. A manual Intro preview therefore had no way to identify
itself as a preview. The repair adds a `preview: true` event detail for manual
scene-panel previews; the audio bridge ignores only that preview transition.
Automatic Intro completion and manual stopping still dispatch the existing
non-preview path and retain the approved After Intro behavior.

## Implementation

The authoritative source change is commit `f31bd95` in
`/Users/toddknipple/Documents/StudioFlow/web`.

- `src/App.tsx` adds a persisted `ScenePanelItem` manifest, uniform item cards,
  Intro/Timer/Scene/Video Clip/Outro shortcuts, drag/drop ordering, keyboard
  Move Up/Down actions, skip state, supported context-menu actions, and the
  non-production Play Sequence rehearsal control.
- The existing timer engine remains the only countdown engine. Video Clip
  shortcuts dispatch `studioflow:video-clip-preview` to the maintained bridge;
  they do not create a second player or asset assignment.
- `src/styles.css` gives every production shortcut the same dimensions,
  spacing, radius, typography, bright border, selected/skipped states, and
  unclipped floating menus. Background Music remains a separate bridge-owned
  control.
- `studio/workspace-bridge.js` persists and validates `scenePanelItems` through
  the established per-Studio workspace configuration fingerprint and save path.
- `functions/api/[[path]].js` validates the item kind, stable id, title, scene
  reference, slot, and opening/closing/skip flags without accepting arbitrary
  configuration.
- `studio/audio-soundboard-bridge.js` isolates manual preview transitions from
  automatic After Intro music handoff.
- `studio/studioflow-012-overrides.css` and the audio bridge now use the same
  56px production surface contract for every Scenes-panel production surface:
  solid border/background, blue icon treatment, consistent alignment, and
  controlled text handling. Background Music always displays the primary label
  `Background Music`; the assigned track and scene remain available through
  the existing title, accessible label, and context menu.
- `src/App.tsx` keeps the visible timer label `Countdown Timer` independent of
  persisted custom metadata, preserves creator scene names, and supplies full
  button titles for longer names without changing saved configuration.
- `studio/video-clip-management-bridge.js` reuses `playAssetOnStage()` for
  Video Clip shortcut previews.
- `scripts/verify/tpi-studioflow-037-scenes-panel.mjs` is the maintained
  Firefox regression for the new panel contract.

No media records, asset bytes, D1 schema, R2 objects, recording/live paths,
Voice FX, guests, SMART Pads, or owner Studio data were modified.

## Persisted contract

`scenePanelItems` is a per-Studio workspace field. It stores stable panel item
ids, supported item kinds, display names, scene references or Video Clips slot
references, ordering, skip flags, and opening/closing membership. Empty legacy
values receive the established Intro/Timer/Scene/Outro defaults; missing or
invalid optional entries are ignored. Existing Video Clips, Timer, Background
Music, orientation, and scene assignment fields remain authoritative in their
existing configuration keys.

## Validation

- Authoritative source TypeScript/build: PASS.
- Reproducible authoritative staging: PASS; generated JS/CSS matched the
  integrated candidate.
- TPI-STUDIOFLOW-037 Firefox regression: 11/11.
- TPI-STUDIOFLOW-037 Addendum A Firefox regression: 13/13, including shared
  production-button dimensions, solid styling, blue icon color, and readable
  `Add Background Music` / `After Intro` labels.
- TPI-STUDIOFLOW-037 Addendum B Firefox regression: 13/13, including exact
  Intro Video dimensions for Background Music, Countdown Timer, Add Production
  Item, and Play Sequence surfaces, simplified labels, and accessible track
  details.
- TPI-STUDIOFLOW-036 timer regression: 28/28.
- TPI-STUDIOFLOW-034 mutation regression: PASS; settled 5-second windows had
  zero child-list churn and zero redundant writes.
- TPI-STUDIOFLOW-035 Recording & Storage regression: 33/33.
- TPI-STUDIOFLOW-031 Background Music and After Intro regression: 34/34.
- Disposable workspace API round-trip, skip persistence, refresh restoration,
  timer program output, menu actions, and cleanup: PASS.

The TPI-037 browser test verified the new shortcut layer and real workspace
round trip. It used a disposable synthetic workspace and did not mutate an
owner or production Studio. The guarded release completed with production
smoke 10/10 and isolated Firefox Developer Edition live acceptance 64/64.

## Release record

- Source commit: `7f233df` (Addendum B; prior TPI-037 source `f31bd95`).
- Website application commit: `23dd5a1` (Addendum B; prior Addendum A
  application `b2972f3`).
- Documentation/release checkpoint commit: `27cf38e`.
- Production Worker: `9b3353a6-8f5d-4468-af89-1d71d8fcc39f`.
- Rollback: prior TPI-037 Worker `273390fa-8018-439f-b3bc-6a7ff935cc1e`.
- Production status: `DEPLOYED_AND_VERIFIED`.
- Live verification: production smoke 10/10; isolated Firefox Developer
  Edition acceptance 64/64; owner profile access false.

The release completed only after `verify:local-auth-lifecycle`,
`release:preflight`, the guarded production command, and isolated live Firefox
acceptance all passed. Documentation was synchronized after deployment; the
documentation-only commit does not require a second Worker release.

## Addendum B — reactive drag-and-drop completion

Date: 2026-10-24
Agent: GPT-5.6 Luna
Status: COMPLETE / DEPLOYED AND LIVE-VERIFIED

The remaining Scenes-panel interaction defect was the old target-based native
drag handler: it only reordered after a drop, had no insertion index or visual
placeholder, had no Escape cancellation, and did not scroll the list at its
edges. It therefore provided no reliable indication of the destination and
could allow a drag gesture to reach the preview surface.

The repair remains inside the existing panel and persistence architecture:

- `src/App.tsx` now starts drag only from the existing handle, tracks the
  destination index, renders a blue insertion placeholder, updates that index
  on each dragover, cancels on Escape, suppresses the post-drag click, and
  scrolls the existing list near its top or bottom edge. Drop changes only the
  existing `scenePanelItems` order, so the established per-Studio autosave path
  persists it and no media playback is invoked.
- `src/styles.css` adds the bounded scroll surface, subtle movement/drag
  styling, reduced-motion handling, hidden scrollbar chrome, and the shared
  fixed production-item dimensions.
- `studio/studioflow-012-overrides.css` applies the same fixed dimensions to
  bridge-injected Background Music shortcuts without changing their assigned
  track, context menu, volume, looping, or playback behavior.
- `scripts/verify/tpi-studioflow-037-scenes-panel.mjs` now exercises the live
  placeholder, Escape restoration, committed reorder, no-playback guarantee,
  exact shared dimensions, and workspace-API autosave in a disposable
  authenticated Firefox workspace.

Root cause and scope were verified without changing media assignments, scene
playback, recording, livestreaming, audio routing, D1, R2, or owner data.

Validation:

- Canonical source TypeScript/build: PASS.
- Reproducible authoritative staging: PASS.
- TPI-037 browser regression: 20/20.
- TPI-031 Background Music/Sound Effects regression: 34/34.
- Local auth lifecycle: PASS; local Firefox acceptance: 64/64.
- Full guarded preflight: PASS; production smoke: 10/10.
- Live isolated Firefox acceptance: 64/64.

Release:

- Source commit: `322b132`.
- Website application/test commit: `da9bfab`.
- Production Worker: `1c752f3f-8af3-461f-8082-3dd8a447fd3d`.
- Rollback: `9b3353a6-8f5d-4468-af89-1d71d8fcc39f`.
- Production status: `DEPLOYED_AND_VERIFIED`.
- Documentation/test synchronization commit: `3b509d1`; documentation changes
  do not require a second Worker release.

## Addendum C — Scenes panel visual consistency and drag interaction repair

Date: 2026-10-24
Agent: FreeBuff / MiMO 2.6 Pro execution path
Status: CORRECTIONS DEPLOYED AND LIVE-VERIFIED / OWNER ACCEPTANCE PENDING

The owner reviewed the deployed panel and reported that it was not yet
acceptable: production button labels wrapped inconsistently, Intro Video and
Outro Video presented their labels differently, Countdown Timer was
unnecessarily truncated, some scene names wrapped awkwardly, Background Music
buttons did not show their assigned SmartPad track color, Background Music
items lacked consistent drag handles, drag-and-drop did not visibly reposition
surrounding buttons during movement, and the drag destination was not
sufficiently obvious.

### Root causes

1. The uniform 56px production surface constrained only the outer box; each
   button's internal label layout still wrapped and truncated on its own, so
   `Intro Video`, `Countdown Timer`, and custom scene names presented
   inconsistently.
2. Background Music shortcuts were rendered by the audio bridge
   (`studio/audio-soundboard-bridge.js`, `tpiSceneMusicButton`) as a separate
   surface family. They never received the shared drag handle, and their
   button styling never consumed the assigned track's persisted SmartPad color
   (`backgroundMusicSlots[].color`), even though that color already existed in
   the data model.
3. The Addendum B drag repair positioned the insertion placeholder correctly
   but did not displace or animate the surrounding rows, so during movement the
   list looked static until the drop and the destination was hard to read.

### Repairs

Authoritative source change is commit `d6b8f03` in
`/Users/toddknipple/Documents/StudioFlow/web`.

- `src/App.tsx` and `src/styles.css`: every production button keeps the exact
  uniform outer dimensions while its internal layout enforces single-line
  primary labels (`Intro Video`, `Countdown Timer`, `Background Music`,
  `Outro Video`) with a consistent secondary label line (for example
  `Opening - Ready`, `After Intro`, `Scene - Ready`). Creator scene names keep
  their real names with fixed-height controlled truncation and a full-name
  tooltip/accessible label. Countdown Timer is no longer truncated.
- `studio/studioflow-012-overrides.css` and `studio/audio-soundboard-bridge.js`:
  the bridge-rendered Background Music shortcuts use the same internal label
  layout and expose the same visible drag handle in the same position as the
  React items. When a music item's assigned track has a persisted SmartPad
  color, the button receives a subtle corresponding tint via
  `--tpi-scene-music-color`; unassigned items stay neutral; assigned, selected,
  and actively-playing states remain visually distinct. The track's full name
  stays available through the title/accessible label and the context menu. No
  second color system was created and no color is inferred from a name.
- `src/App.tsx` drag lifecycle: while a row is dragged, surrounding rows glide
  into their would-be positions (FLIP animation with reduced-motion opt-out)
  around a live `Move here` insertion gap that follows the pointer across
  positions. The gap is visible before release, Escape cancels, the list
  auto-scrolls at its edges, and dropping moves only the existing
  `scenePanelItems` order through the established per-Studio autosave. The
  drag handle never triggers playback, never opens a context menu, and never
  alters the item's media assignment.

### Preserved systems

Addendum C did not modify Intro/Outro automation, the countdown engine,
Background Music playback (including the Background Music Stop control and the
After Intro handoff from TPI-028 Addendum A), recording, livestreaming, media
storage, the production compositor, or any Studio configuration. The Addendum
C regression re-verifies that reordering never reassigns the After Intro music
binding and that the reordered row still plays its assigned track.

### Validation

- Authoritative source TypeScript/build: PASS.
- Reproducible authoritative staging: PASS.
- TPI-STUDIOFLOW-037 Addendum C Firefox regression: 26/26, including uniform
  button dimensions, non-wrapping labels with full-name tooltips, drag handles
  on every movable item, neutral/unassigned vs tinted/assigned music color
  states, genuine pointer drag with live gap following the pointer, visible
  displacement of surrounding buttons, Escape cancellation, completed drop at
  the indicated position, workspace-API autosave, refresh restoration,
  per-Studio isolation, After Intro binding preservation, keyboard row
  reordering, Background Music Stop, and edge auto-scroll.
- Full regression battery: TPI-020 14/14; TPI-021 86 static + 31 browser;
  TPI-027 12/12; TPI-028 33/33; TPI-030 full pass including After Intro music
  and Stop control; TPI-031 pass; TPI-033 pass; TPI-034 mutation regression
  PASS; TPI-035 33/33; TPI-036 28/28; TPI-037 20/20; release safety 17/17;
  local auth lifecycle 64/64.
- Evidence: genuine-pointer-drag screenshots (initial positions, dragging with
  displaced rows, highlighted insertion gap, completed drop, Escape-cancelled,
  music color indicator, auto-scroll) saved under `.local-dev/evidence/tpi-037c/`
  (local) and `.local-dev/evidence/tpi-037c-prod/acceptance/` (production
  acceptance run) and visually inspected.
- Production acceptance: the Addendum C suite was run in isolated Firefox
  Developer Edition against the deployed interface at
  `https://paranormalinitiative.com` using the approved synthetic production QA
  account (`qa-studioflow-*`, double-gated credential file) with disposable
  studios archived afterwards: 26/26 PASS. Local synthetic credentials are
  never sent to production.
- Acceptance tooling notes (test-only, no application behavior change): the
  Addendum C suite gained the production QA credential gate mirroring
  `tpi-studioflow-firefox-acceptance.mjs`, and its auto-scroll probe sweeps the
  48px edge band instead of a single point because geckodriver's synthesized
  drag coordinates can drift ~14px from the commanded pointer position. The
  application's edge auto-scroll logic is unchanged and verified against real
  pointer input.

### Release record

- Source commit: `d6b8f03` (Addendum C; prior Addendum B `322b132`).
- Website application commit: `8a954ad` (Addendum C; prior `da9bfab`).
- Website test commit: `dd22fc5` (Addendum C acceptance suite).
- Production Worker: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`.
- Rollback: `1c752f3f-8af3-461f-8082-3dd8a447fd3d` (Addendum B release).
- Production status: `DEPLOYED_AND_VERIFIED` via the guarded release path
  (`verify:local-auth-lifecycle`, `release:preflight`,
  `TPI_PRODUCTION_DEPLOY=approved release:production`); production smoke and
  isolated live Firefox acceptance passed, followed by the Addendum C
  production acceptance run above.
- Owner acceptance: PENDING. The owner must confirm the corrected interface
  behaves correctly before Addendum C is considered accepted.
- Documentation synchronization commit: recorded after this section; doc-only
  changes do not require a second Worker release.

## Addendum D — production button playback and rehearsal controls

Date: 2026-10-25

### Authority and objective

This correction was completed by GPT-5.6 Luna under the standing TPI agent
authority for TPI-STUDIOFLOW-037 Addendum D. The objective was to make each
playable Scenes-panel shortcut an independent play/stop control, make Play
Sequence a cancellable rehearsal toggle, and remove panel shortcuts without
deleting their underlying media assets.

### Root causes

The Video Clips bridge treated a repeated click on the same staged asset as a
new playback request instead of a stop request. The Background Music bridge
always called the assigned-track start path and had no same-track toggle. The
timer shortcut started the shared countdown engine but did not use its running
state to stop on a second click. Rehearsal advancement used delayed callbacks
without a generation/token invalidation path, so stopping rehearsal could
leave a later item eligible to start. The context menu also exposed the
ambiguous `Remove` label rather than the required `Remove from Scenes` action.

### Implementation

- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`: added independent
  timer and Intro/Outro toggles, rehearsal token/timeout cancellation,
  Stop Sequence state, stop-event dispatch, and the non-destructive removal
  action while preserving required fixed Intro/Outro assignments.
- `studio/audio-soundboard-bridge.js`: repeated clicks on the same assigned
  scene track use the existing `stopMusic()` path; rehearsal stop uses the
  existing music stop path.
- `studio/video-clip-management-bridge.js`: repeated clicks on the same
  staged asset stop the existing stage player, add guarded async playback
  invalidation, and expose the existing row playing state without adding a
  second player.
- `scripts/verify/tpi-studioflow-037-addendum-d.mjs`: maintained isolated
  Firefox regression for toggle playback, rehearsal cancellation, context
  action naming, and asset-preserving shortcut removal.

No production playback engine, media assignment schema, D1 record, R2 object,
recording, livestream, or owner Studio configuration was changed.

### Validation

- Addendum D focused regression: 10/10 locally.
- TPI-037 maintained Scenes suite: 20/20.
- TPI-028 browser suite: 33/33.
- TPI-031 Background Music pad suite: 34/34.
- TPI-034 mutation regression: PASS; no idle mutation loop reintroduced.
- Local and live isolated Firefox acceptance: 64/64.
- Production smoke: 10/10.
- Release safety, auth lifecycle, reproducible staging, and guarded preflight:
  PASS.

The focused Addendum D test used disposable browser state and synthetic media
locally. The live release acceptance used the governed isolated production QA
suite; no focused Addendum D mutation was performed against owner production
data. Owner acceptance remains pending.

### Release

- Authoritative StudioFlow source commit: `5186e28` (local source repository;
  no configured source remote)
- Website application/test commit: `8d46a45`
- Production Worker: `3a9b090f-78b5-43d6-bb11-17a1ba54d41b`
- Rollback Worker: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`
- Production status: `DEPLOYED_AND_VERIFIED` through the guarded source-to-live
  workflow.
- Documentation commit: recorded after this completion record; documentation
  only, so no second no-op Worker deployment is required.

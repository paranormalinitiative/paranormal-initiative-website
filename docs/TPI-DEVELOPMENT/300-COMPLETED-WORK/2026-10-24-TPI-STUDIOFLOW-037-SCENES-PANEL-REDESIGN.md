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
- TPI-037 browser regression: 19/19.
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
- Documentation commit: recorded after this release; documentation changes do
  not require a second Worker release.

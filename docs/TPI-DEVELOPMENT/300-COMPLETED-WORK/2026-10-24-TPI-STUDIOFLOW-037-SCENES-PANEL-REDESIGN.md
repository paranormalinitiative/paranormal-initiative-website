# TPI-STUDIOFLOW-037 — Scenes Panel Redesign and Production Shortcuts

Date: 2026-10-24
Agent: GPT-5.6 Luna / NiMo 2.6 Pro execution path
Authority: TPI standing autonomous-agent authority and TPI-STUDIOFLOW-037
Status: COMPLETE / LOCAL VALIDATION PASSED / DEPLOYMENT PENDING

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
- TPI-STUDIOFLOW-036 timer regression: 28/28.
- TPI-STUDIOFLOW-034 mutation regression: PASS; settled 5-second windows had
  zero child-list churn and zero redundant writes.
- TPI-STUDIOFLOW-035 Recording & Storage regression: 33/33.
- TPI-STUDIOFLOW-031 Background Music and After Intro regression: 34/34.
- Disposable workspace API round-trip, skip persistence, refresh restoration,
  timer program output, menu actions, and cleanup: PASS.

The TPI-037 browser test verified the new shortcut layer and real workspace
round trip. It used a disposable synthetic workspace and did not mutate an
owner or production Studio. Full live acceptance and production deployment
remain release-gated until the application and documentation commits pass the
guarded workflow.

## Release record

- Source commit: `f31bd95`.
- Website application commit: pending until final diff review.
- Documentation commit: pending.
- Production Worker: unchanged from TPI-036 until guarded deployment.
- Rollback: current TPI-036 Worker `076c9614-9251-4efd-b047-0e7033f4ad9c`.
- Production status: NOT DEPLOYED in this local-validation record.

Any deployment update must be appended here only after
`verify:local-auth-lifecycle`, `release:preflight`, the guarded production
command, and isolated live Firefox acceptance all pass.

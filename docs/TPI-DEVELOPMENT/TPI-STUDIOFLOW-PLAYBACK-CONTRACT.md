# StudioFlow Playback and Scene-Media Contract

Status: ACTIVE / CURRENT APPROVED BEHAVIOR
Maintained under: TPI-STUDIOFLOW-029 (documentation synchronization),
updated by TPI-STUDIOFLOW-030 (Sound Effects interface)
Last verified: 2026-10-23

This document is the single current-state record of what StudioFlow's scene
and media playback is supposed to do, how the approved implementation was
built, what broke it, how it was repaired, and what must never be broken
again. It supplements the historical completion records; it does not replace
them. Historical records under `100-DIRECTIVES`, `200-AUDITS`, and
`300-COMPLETED-WORK` preserve the conditions of their own execution and are
not current commands.

## Approved playback contract

The following is the current approved StudioFlow behavior, confirmed live in
production after TPI-STUDIOFLOW-028 and TPI-STUDIOFLOW-028 Addendum A.

### Intro Video

- Uses the assigned Intro Video from Video Clips.
- First click starts playback.
- Second click stops playback.
- Every playback starts at 00:00.
- Video and audio stop together.
- Appropriate scene restoration occurs (the previous production scene is
  restored on stop and on natural completion).
- Natural completion resets playback.
- Guest connections remain unaffected.

### Outro Video

- Uses the assigned Outro Video from Video Clips.
- First click starts playback.
- Second click stops playback.
- Every playback starts at 00:00.
- Video and audio stop together.
- Appropriate scene restoration occurs (the previous production scene is
  restored on stop and on natural completion).
- Natural completion resets playback.
- Outro completion does not automatically terminate recording or
  livestreaming. Recording and livestreaming are separate production
  operations.

### After Intro Background Music

- Uses its assigned track from the Background Music media section.
- Remains independently controllable: the shortcut has its own identity,
  click plays the assigned track, and right-click reassigns it.
- Automatically activates when leaving the Intro scene — including natural
  Intro completion and manual stop — exactly as implemented by Sol
  (commit `d262867`). Entering the Intro scene clears music for the video
  moment. This transition is approved intentional behavior, not a coupling.
- Does not share the Intro Video playback handler or scene identifier, and
  never starts, stops, or restarts the Intro Video.
- Preserves existing assigned music track, playback controls, volume
  configuration, looping behavior, program audio routing, monitoring audio
  routing, and Studio-specific persistence (`studioflow.sceneMusicAssignments`
  in the existing Background Music media system).
- No duplicate media player or asset record exists for this feature.

### My Scenes

- Uses the existing media assignments (Intro Video, Outro Video, and
  Background Music resolve for the currently selected Studio).
- Maintains independent scene identifiers (`data-tpi-scene-id`) and handlers;
  music-shortcut buttons are excluded from scene/video handling.
- Does not create duplicate playback systems; playback runs through the
  existing stage video and the existing Background Music audio board.
- Preserves the existing production scene workflow: general Video Clips
  remain stage-playable, and the left-side Intro/Outro scene cards are the
  playback entry point for the Intro and Outro videos.

### Sound Effects pads (TPI-STUDIOFLOW-030)

- Sound effects play on pad click from the existing assignments; playback
  ends naturally or is replaced by clicking another pad. The Stop Sound
  button is intentionally absent from the visible sound controls (the
  volume slider, playback, and audio routing are unchanged; the internal
  stop control remains for programmatic use). Background Music keeps its
  own stop control.
- Pads show no permanent three-dot menu button. The unchanged options menu
  (Rename, Change color, Replace audio, Remove) opens on right-click and,
  for touch and keyboard users, with the ContextMenu key or Shift+F10.
- Pads reorder by drag-and-drop (pointer events with long-press, covering
  mouse, trackpad, and touch) and by Alt+ArrowLeft/Alt+ArrowRight on the
  focused pad. A drag never fires playback.
- The pad order saves automatically per studio through the existing
  workspace configuration (`studioflow.customSounds`); there is no Save
  button, and each studio restores its own arrangement on switching.
- Empty pads keep their Add Audio affordance at their position; pad colors,
  labels, the three-column grid, volume controls, and the media system are
  unchanged. No duplicate players or asset records exist.

## Verified regression history

Every entry below is verified from repository Git history (both the website
repository and the authoritative StudioFlow source repository) and the cited
completion records. No archival RAG system is available in this environment;
no archival verification is claimed. Nothing in this section is inferred
beyond those sources.

1. **Original playback behavior — TPI-STUDIOFLOW-019/020.** Directive 019
   established the shared 16:9 stage rendering contract; Directive 020
   established the Play/Stop toggles, one-shot compositor playback,
   fresh-start safety, and the Record/Go-live preview-clearing contract that
   never starts playback. Records:
   `100-DIRECTIVES/TPI-STUDIOFLOW-019-INTRO-OUTRO-STAGE.md` and
   `100-DIRECTIVES/TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md`. (The
   directive-index rows for this era also cite `TPI-STUDIOFLOW-019-RESULT.md`
   and `TPI-STUDIOFLOW-020-RESULT.md`; those historical result files are not
   present in this repository and are documented as missing sources rather
   than re-created here.)
2. **Sol's After Intro Background Music — commit `d262867`
   ("Repair StudioFlow scene background music", 2026-10-22).** The Intro
   control assigns a Background Music track for automatic playback after
   Intro ends. The `syncSceneMusic` handoff ran on the scene transition out
   of the Intro scene (natural completion and manual stop alike) and was not
   gated by Live or Record state. Record:
   `300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-SCENE-BACKGROUND-MUSIC.md`.
3. **Authenticated media-resolution repair — TPI-STUDIOFLOW-027
   (commit `7888568` source, `eee0cff` website, 2026-10-23).** Saved media
   assignments lost `serverAssetId` during API normalization and never
   rebuilt their authenticated Studio-scoped media URL, so Intro Video,
   Outro Video, and Background Music assignments existed in configuration
   but could not resolve playable media. The repair preserves `serverAssetId`,
   reconstructs `serverUrl`, and resolves local or server-backed media in one
   path. Record:
   `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-027-SCENE-MEDIA-CONNECTION-REPAIR.md`.
4. **Click-to-play regression — commit `17bbd4a`
   ("Gate StudioFlow program cues and repair panel navigation", 2026-10-23).**
   Removed `autoPlay` from the Intro/Outro stage video and gated playback
   behind Record/Go-live, so clicking Intro Video or Outro Video loaded the
   clip but never played it. The same change is recorded in
   `300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-PANEL-AND-PROGRAM-CUE-REPAIR.md`.
5. **Program-state gating regression — commit `0241dc7`
   (website side, 2026-10-23).** Replaced the playback bridge's
   Record/Go-live preview-clearing contract with a program-cue `return`, and
   wrapped Sol's `syncSceneMusic` in a `studioflow.programActive` gate, so
   the Intro-scene music clear and the After Intro handoff only ran while
   Live or Record was engaged. In ordinary studio use Sol's approved
   transition never fired.
6. **Scene-identity coupling defect (same family).** The playback bridge
   identified scenes by user-editable text labels and matched `.scene-card`
   broadly; the Background Music shortcut buttons also carry `.scene-card`,
   so the Play/Stop toggle's scene restore clicked the After Intro music
   shortcut. Stopping the Intro Video appeared to "activate" After Intro
   music and never restored the previous scene. This is the reported
   "Intro Video and After Intro appear connected" behavior.
7. **Scene playback and restoration repair — TPI-STUDIOFLOW-028
   (commit `592028a` website, source `ce7c389`, 2026-10-23).** Restored
   click-to-play `autoPlay` and one-shot compositor playback, restored the
   020 preview-clearing contract, moved scene identity to stable
   `data-tpi-scene-id`, excluded music-shortcut buttons from scene handling,
   added previous-scene tracking for accurate Play/Stop restoration, and gave
   the After Intro shortcut its own identity with click-to-play and
   right-click reassignment. Record:
   `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`.
8. **Restoration of Sol's automatic music transition — TPI-STUDIOFLOW-028
   Addendum A (commit `cb97464` website, bridge-only, 2026-10-23).** Removed
   the `studioflow.programActive` gate from the music path and restored
   Sol's original `syncSceneMusic` transition semantics verbatim (adapted
   only to the maintained `after-intro` scene ID and its legacy assignment
   migration), while keeping all independence fixes from step 7. Automatic
   post-Intro activation is preserved Sol behavior, not a reintroduction.
   Record: the Addendum A section of
   `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`.

Why earlier tests missed the regressions: the 027 static checks asserted URL
resolution rather than playback, the 028 starter test asserted only that a
stage video had a `src`, and the 020/031 bundle-pattern checks pinned stale
minified fragments or silently changed bridge text.

## Must never be broken again

1. Sol's After Intro Background Music is an existing approved StudioFlow
   feature. Do not remove it, redesign it, replace it with a generic scene,
   delete its assignments, or gate its automatic post-Intro transition behind
   program state.
2. Do not eliminate the intentional post-Intro transition while removing an
   unintended connection. The After Intro handoff firing on leaving the Intro
   scene (natural completion and manual stop) is Sol's original design.
   Limiting it to natural completion only would be a deliberate, explicitly
   reported behavior change, never a silent side effect.
3. Intro Video, Outro Video, and music shortcuts must keep independent scene
   identifiers and handlers. Never identify scenes by user-editable labels,
   and never match music-shortcut buttons as scene cards.
4. Record/Go-live clears preview state and never starts media playback.
   Outro completion does not stop recording or livestreaming.
5. All scene media comes from the existing media sections (Video Clips for
   Intro/Outro, Background Music for music) through the existing players,
   routing, and persistence. No duplicate playback systems or asset records.
6. Sound pad order and assignments are ordinary per-studio workspace
   configuration. A remote workspace response must never overwrite a
   configuration key that changed locally while that request was in flight
   (the asset-state bridge echo guard, TPI-STUDIOFLOW-030). Do not remove
   the guard or reintroduce a second persistence system for pad ordering.

## Regression-prevention requirements (TPI-STUDIOFLOW-029)

Every future change to StudioFlow scene/media behavior must:

1. Review the historical directives and completion records for the feature
   being changed before modifying it.
2. Compare Git history in both repositories when repairing a suspected
   regression, and identify the last known working implementation by commit.
3. Preserve previously approved behavior; restore rather than redesign when
   recovering lost functionality.
4. Exercise user-facing controls with browser interaction testing, not only
   static source contracts.
5. Add regression tests covering restored functionality before release.
6. Report every intentional behavior change explicitly in the completion
   record and to the owner.
7. Keep this contract current: when approved behavior deliberately changes,
   update this document in the same change.

These requirements are also recorded in `AGENTS.md` and are consistent with
the standing authority in
`100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`.

## Verification coverage pinning this contract

- `scripts/verify/tpi-studioflow-028-browser.mjs` — Firefox interaction
  suite (33 checks), including the Addendum-A independence and preserved
  automatic-transition checks.
- `scripts/verify/tpi-studioflow-021-audio-soundboards.mjs` — static
  contract (69 checks), including pins of Sol's handoff, the Intro-scene
  music clear, assignment-only After Intro handoff, distinct After Intro
  scene identity, and the TPI-STUDIOFLOW-030 save-echo guard.
- `scripts/verify/tpi-studioflow-030-browser.mjs` — Sound Effects pad
  suite (25 checks): interface cleanup, context menu, drag/keyboard
  reordering, automatic persistence, and multi-studio isolation.
- `scripts/verify/tpi-studioflow-021-browser.mjs` (31 checks),
  `tpi-studioflow-027-scenes.mjs` (12), `tpi-studioflow-020-video-playback.mjs`
  (14), `tpi-studioflow-031-video-overlays.mjs` (12),
  `tpi-release-safety.mjs` (17).

## Current production baseline

Latest reported successful production deployment (verified against the
guarded release records before publishing this baseline):

- Directive: TPI-STUDIOFLOW-030 (Sound Effects interface cleanup and
  drag-and-drop pad reordering)
- Application commit: `e18d327` (feature `8f6035a`)
- Worker version: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
- Previous Worker version: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
  (TPI-STUDIOFLOW-028 Addendum A)
- Reported validation: 030 sound effects browser interactions 25/25 (two
  consecutive runs); 021 static contracts 69/69; 021 browser interactions
  31/31; 028 browser interactions 33/33; 020 contracts 14/14; 031 overlays
  12/12; release safety 17/17; local auth lifecycle (Node 38/38, isolated
  Firefox 61/61); guarded live acceptance 61/61.

The playback sections above remain exactly as verified after
TPI-STUDIOFLOW-028 Addendum A; TPI-STUDIOFLOW-030 changed only the Sound
Effects interface documented in its own section.

See `TPI-CURRENT-DEVELOPMENT-STATUS.md` and
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md` for the maintained baseline and release
procedure.

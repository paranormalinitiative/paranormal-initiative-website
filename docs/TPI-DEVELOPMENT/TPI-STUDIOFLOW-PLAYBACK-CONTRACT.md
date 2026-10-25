# StudioFlow Playback and Scene-Media Contract

Status: ACTIVE / CURRENT APPROVED BEHAVIOR
Maintained under: TPI-STUDIOFLOW-029 (documentation synchronization),
updated by TPI-STUDIOFLOW-030 (Sound Effects interface),
TPI-STUDIOFLOW-031 (Background Music interface),
TPI-STUDIOFLOW-033 (workspace configuration persistence), and
TPI-STUDIOFLOW-034 (DOM mutation stability), updated by
TPI-STUDIOFLOW-036 (cinematic Video Timers) and
TPI-STUDIOFLOW-037 (Scenes panel shortcuts)
Last verified: 2026-10-24

This document is the single current-state record of what StudioFlow's scene
and media playback is supposed to do, how the approved implementation was
built, what broke it, how it was repaired, and what must never be broken
again. It supplements the historical completion records; it does not replace
them. Historical records under `100-DIRECTIVES`, `200-AUDITS`, and
`300-COMPLETED-WORK` preserve the conditions of their own execution and are
not current commands.

### Workspace persistence invariant — TPI-STUDIOFLOW-033

Video Clips assignments, their validated slot positions, program orientation,
Background Music assignments, loop state, and After Intro stable asset
references are per-Studio workspace configuration. They must round-trip through
the server normalizer and restore before the existing playback controls are
used. A Studio switch or refresh must never reuse another Studio's media or
orientation. The maintained regression is
`npm run verify:studioflow-033-roundtrip`.

## Approved playback contract

The following is the current approved StudioFlow behavior, confirmed live in
production after TPI-STUDIOFLOW-028 and TPI-STUDIOFLOW-028 Addendum A.

### DOM stability invariant — TPI-STUDIOFLOW-034

Scene shortcut synchronization, audio/video panel visibility, native timer
preparation, and My Studios menu rendering are idempotent. A bridge observer
must not respond indefinitely to DOM writes made by its own synchronization
callback. Unchanged labels, attributes, styles, and menu data are retained;
legitimate changes still update the existing elements and playback paths. The
maintained regression is `npm run verify:studioflow-034-mutation`; its settled
idle target is fewer than 100 unnecessary mutations in five seconds, with zero
self-sustaining child-list churn.

### Video Timers — TPI-STUDIOFLOW-036

- The Video Timers section exposes exactly nine approved designs in the
  maintained order: Classic Countdown, Stargate Portal, Alien Transmission,
  Haunted Clock, Spirit Manifestation, EVP Signal, ITC Communication,
  Paranormal Energy Vortex, and Ghostly Countdown.
- All designs use the existing shared countdown engine and support 10, 20, 30,
  and 60 seconds. Changing a design does not change duration, and changing
  duration does not change design.
- Classic Countdown remains the existing native renderer. The eight cinematic
  designs are silent canvas renderers driven by the same countdown deadline;
  they do not create separate playback engines or audio paths.
- The selected timer renders in the established program output, reaches zero,
  can be restarted or stopped, and cleans up its animation frame when replaced
  or closed. No automatic scene transition, music, or sound effect is added.
- `videoTimerTheme` and `videoTimerDuration` are per-Studio workspace fields
  and must survive server save, refresh, and Studio switching.

### Scenes panel — TPI-STUDIOFLOW-037

- My Scenes is a shortcut layer over the existing production owners. Intro and
  Outro use the assigned Video Clips scene controls, Countdown Timer uses the
  existing shared timer engine, Scene uses the existing active-scene path, and
  Video Clip uses the maintained Video Clips bridge stage-preview path.
- Panel items have stable ids and per-Studio ordering. Drag/drop and keyboard
  Move Up/Down change only panel configuration; they do not play media or
  interrupt recording/livestreaming. Skip flags omit optional opening/closing
  items without deleting their assignments, and manual Preview remains
  available through the item menu when the item is included.
- A manual Intro/Timer/Outro preview is isolated from automatic progression and
  does not trigger the After Intro Background Music handoff. Actual automatic
  Intro completion and manual stop retain the approved After Intro transition.
- Play Sequence is rehearsal-only: it uses existing preview and timer paths,
  does not start real output, does not alter saved configuration, and remains in
  rehearsal until the operator manually selects a scene or requests closing.

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

### Sound Effects and Background Music pads (TPI-STUDIOFLOW-030 / 031)

- Sound effects play on pad click from the existing assignments; playback
  ends naturally or is replaced by clicking another pad. The Stop Sound
  button is intentionally absent from the visible sound controls (the
  volume slider, playback, and audio routing are unchanged; the internal
  stop control remains for programmatic use). Background Music keeps its
  own Stop control — music tracks can run long and creators must be able to
  stop them manually.
- Pads on both boards show no permanent three-dot menu button. The
  unchanged options menu (Rename, Change color, Replace audio, Remove)
  opens on right-click and, for touch and keyboard users, with the
  ContextMenu key, Shift+F10, or a touch long-press.
- Pads on both boards reorder by drag-and-drop (pointer events with
  long-press, covering mouse, trackpad, and touch) and by
  Alt+ArrowLeft/Alt+ArrowRight on the focused pad. A drag never fires
  playback, and dropping neither starts nor stops an already playing
  track. Reordering moves the pad's complete configuration (media
  assignment and pad metadata) and keeps the playing indicator attached to
  the actually-playing track.
- The pad order saves automatically per studio through the existing
  workspace configuration (`studioflow.customSounds` /
  `studioflow.backgroundMusicSlots`); there is no Save button, and each
  studio restores its own arrangement on switching. Music pad order and
  the After Intro assignment are independent: the assignment references a
  stable asset identifier (`blobKey`), so reordering never changes which
  track is assigned.
- Music volume, looping, program routing, monitoring routing, and the
  existing media system are unchanged. Empty pads keep their Add Audio
  affordance at their position; pad colors, labels, the three-column grid,
  and the media system are unchanged. No duplicate players or asset
  records exist.
- TPI-STUDIOFLOW-032: the icon inside each pad's unchanged circular
  container is the approved per-category artwork — Waveform on Background
  Music pads and Microphone on Sound Effects pads
  (`/studio/Waveform.png`, `/studio/Microphone.png`, served through the
  established staging and cache-tag pipeline). The artwork keeps its
  proportions (`object-fit: contain`), never captures pointer events, and
  changes nothing about pad layout, colors, labels, or playback.

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
9. **Workspace persistence gap — repaired by TPI-STUDIOFLOW-031 (commit
   `4cacb3a`, 2026-10-24).** The API's `normalizeStudioConfiguration`
   allow-list silently dropped `backgroundMusicSlots`,
   `backgroundMusicLoop`, and `sceneMusicAssignments`, so the music board's
   assignments, order, loop preference, and the After Intro assignment
   never survived a studio switch (hydration reset them to defaults).
   Verified by server-state probes; the normalizer now persists all three
   and preserves pad `color`/`titleCustomized` metadata.
10. **Cross-wired media replacements — repaired by TPI-STUDIOFLOW-031
    (commit `4cacb3a`, 2026-10-24).** `replaceAssets` in the asset-state
    bridge matched uploaded media replacements by visit position while
    `visitAssets` visits fields in a different, partially conditional order,
    so one asset's uploaded replacement landed on a different field (music
    assets observed inside `customSounds`, duplicated pad entries in saved
    state). Replacement matching is now keyed by `blobKey`. Record:
    `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`.

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
6. Sound and music pad order and assignments are ordinary per-studio
   workspace configuration. A remote workspace response must never
   overwrite a configuration key that changed locally while that request
   was in flight (the asset-state bridge echo guard, TPI-STUDIOFLOW-030).
   Do not remove the guard or reintroduce a second persistence system for
   pad ordering.
7. Everything the boards persist must round-trip through the workspace
   save: `backgroundMusicSlots`, `backgroundMusicLoop`, and
   `sceneMusicAssignments` must remain in the API's configuration
   normalizer, and uploaded media replacements must be matched to their
   assets by `blobKey`, never by visit position (TPI-STUDIOFLOW-031). The
   After Intro assignment must keep referencing stable asset identifiers,
   not pad positions.
8. Music pad reordering must never start, stop, or restart playback, and
   must never change the After Intro assigned track.

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
  contract (86 checks), including pins of Sol's handoff, the Intro-scene
  music clear, assignment-only After Intro handoff, distinct After Intro
  scene identity, the TPI-STUDIOFLOW-030 save-echo guard, and the
  TPI-STUDIOFLOW-032 pad-artwork delivery and pointer-safety contracts.
- `scripts/verify/tpi-studioflow-030-browser.mjs` — Sound Effects pad
  suite (25 checks): interface cleanup, context menu, drag/keyboard
  reordering, automatic persistence, and multi-studio isolation.
- `scripts/verify/tpi-studioflow-031-music-pads.mjs` — Background Music pad
  suite (34 checks): interface cleanup, context menu, drag/keyboard
  reordering, playback protection, automatic persistence, multi-studio
  isolation, and the mandatory After Intro assignment regression test.
- `scripts/verify/tpi-studioflow-021-browser.mjs` (31 checks — since
  TPI-STUDIOFLOW-032 each run starts a fresh browser-local recording
  broadcast, the same empty-state studio the home "Record without going
  live" flow creates, replacing that flow's now-unreachable home-screen
  entry; every assertion is unchanged),
  `tpi-studioflow-027-scenes.mjs` (12), `tpi-studioflow-020-video-playback.mjs`
  (14), `tpi-studioflow-020-video-clips.mjs` (13),
  `tpi-studioflow-031-video-overlays.mjs` (12),
  `tpi-release-safety.mjs` (17).

## Current production baseline

Latest reported successful production deployment (verified against the
guarded release records before publishing this baseline):

- Directive: TPI-STUDIOFLOW-036 (cinematic Video Timers)
- Application commit: `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`
- StudioFlow source commit: `37c6598`
- Worker version: `076c9614-9251-4efd-b047-0e7033f4ad9c`
- Previous Worker version: `aa9bff15-6252-4ae5-9422-17d63b99ab5a`
  (TPI-STUDIOFLOW-035)
- Reported validation: TPI-035 suite 33/33; TPI-033 round-trip 26/26;
  TPI-034 mutation regression twice; 021 browser interactions 31/31; 028
  browser 33/33; 030 sound effects browser 25/25; 031 music pad browser
  34/34; 021 static contracts 86/86; 020 contracts 14/14; 020 video clips
  13/13; 027 contracts 12/12; 031 overlays 12/12; release safety 17/17;
  local auth lifecycle PASS; local Firefox acceptance 64/64; guarded live
  acceptance against production 64/64; TPI-036 timer regression 28/28;
  live artifact verification and complete isolated QA/API E2E.

The Intro/Outro and After Intro playback sections above remain exactly as
verified after TPI-STUDIOFLOW-028 Addendum A; TPI-STUDIOFLOW-030 through
TPI-STUDIOFLOW-035 changed only pad interfaces, persistence, artwork, DOM
stability, workspace configuration mapping, and the right-rail/recording
management surfaces documented in their own records. Playback behavior is
unchanged by TPI-STUDIOFLOW-035.

See `TPI-CURRENT-DEVELOPMENT-STATUS.md` and
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md` for the maintained baseline and release
procedure.

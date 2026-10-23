# TPI-STUDIOFLOW-028 — My Scenes Independent Media Shortcut & Playback Repair

Date: 2026-10-23
Project: The Paranormal Initiative — StudioFlow
Status: IMPLEMENTED / TESTED / DEPLOYED AND LIVE-VERIFIED

## Result

My Scenes again operates as a set of independent production shortcuts:

- Intro Video plays the assigned Intro Video from Video Clips at 00:00.
- Outro Video plays the assigned Outro Video from Video Clips at 00:00.
- The After Intro music shortcut plays the assigned track from the
  Background Music section.
- Each regular scene music shortcut plays its own assigned Background
  Music track.
- Activating one control never activates another control's media.

## Historical records reviewed

- `TPI-STUDIOFLOW-019-INTRO-OUTRO-STAGE.md` (stage rendering contract).
- `TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md` and the maintained
  `studio/video-playback-reset-bridge.js` implementation
  (Play/Stop toggles, fresh-start safety).
- `2026-10-22-STUDIOFLOW-SCENE-BACKGROUND-MUSIC.md` (scene music
  assignment system and Intro handoff).
- `2026-10-22-STUDIOFLOW-INTRO-OUTRO-CARD-FIX-RESULT.md`,
  `...-INTRO-OUTRO-PREVIEW-RESULT.md`,
  `...-VIDEO-CLIP-STAGE-PLAYBACK-RESULT.md` (left-side scene cards are
  the only Intro/Outro playback entry point).
- `2026-10-23-STUDIOFLOW-PANEL-AND-PROGRAM-CUE-REPAIR.md` (the
  2026-10-23 program-cue change identified as the regression).
- `2026-10-23-TPI-STUDIOFLOW-027-SCENE-MEDIA-CONNECTION-REPAIR.md`
  (authenticated media URL resolution to preserve).
- Git history of both repositories, including `cb1b2d5`, `72df3af`,
  `f0a6ecb`, `0241dc7`, `17bbd4a`, `7888568`, and `0c071fd`.

No archival RAG system is available in this environment; no archival
verification is claimed. Historical verification used the repository
directive/completed-work records and both repositories' Git history.

## Last known working implementation

- Website bridge layer as retained in `f0a6ecb`
  (`studio/video-playback-reset-bridge.js`), whose Record/Go-live branch
  cleared preview state without starting playback.
- Authoritative StudioFlow source before `17bbd4a`: the stage clip video
  carried `autoPlay`, the compositor clip was one-shot with
  `autoplay = true`, and `finishVideoClipPlayback` only restored the
  previous production scene.

## Exact regression identified

1. `17bbd4a` ("Gate StudioFlow program cues and repair panel
   navigation", 2026-10-23 11:27) removed `autoPlay` from the Intro/Outro
   stage video and gated playback behind Record/Go-live. Clicking Intro
   Video or Outro Video loaded the clip but never played it.
2. `0241dc7` (same time, website side) replaced the playback bridge's
   Record/Go-live preview-clearing contract with a program-cue `return`,
   removing the `Do not start playback here` behavior pinned by the
   TPI-STUDIOFLOW-020 contract checks.
3. The maintained playback bridge identified scenes by user-editable text
   labels and matched `.scene-card` broadly. The Background Music
   shortcut buttons also carry `.scene-card`, so the Play/Stop toggle's
   scene restore clicked the After Intro music shortcut: stopping the
   Intro Video activated After Intro music and never restored the
   previous scene. Clicking a music shortcut also reset a playing stage
   clip. This is the "Intro Video and After Intro appear connected"
   behavior the directive reports.
4. The started Directive 028 work (`0c071fd` source sync effect,
   `studio/audio-soundboard-bridge.js` after-intro shortcut identity,
   media-section sync) was correct but incomplete: it was staged only,
   left an intermediate bundle uncommitted, did not bump bridge cache
   tags, and its browser test checked media URL resolution rather than
   playback behavior.

Earlier automated tests missed the regression because the 027 static
checks asserted URL resolution (`src` wiring) rather than playback, the
028 starter test asserted only that a `video.stage-video` element had a
`src`, and the 020/031 bundle-pattern checks either pinned minified
fragments that no longer matched or asserted bridge text that had been
silently changed.

## Files modified

Authoritative StudioFlow source (`/Users/toddknipple/Documents/StudioFlow/web`,
commit `ce7c389d23db65bd5ebb92597695d9854d21c7ab`):

- `src/App.tsx` — restored `autoPlay` on the stage clip video; removed
  the program-state playback gate/auto-restart while keeping
  `studioflow.programActive` publication for the maintained bridges;
  restored one-shot compositor clip playback
  (`clipVideo.autoplay = true`, unconditional composite source play);
  removed the Outro-completion recording/livestream auto-stop.

Website repository (commit `592028a599d2fff64e9d81f2e28856aead63c822`):

- `studio/video-playback-reset-bridge.js` — scene identity from stable
  `data-tpi-scene-id`, music-shortcut buttons excluded from scene
  handling, previous-scene tracking for accurate Play/Stop restoration,
  and the original Record/Go-live preview-clearing contract restored.
- `studio/audio-soundboard-bridge.js` — (carried from the started work)
  independent `after-intro` shortcut identity with legacy assignment
  migration, click-to-play of assigned Background Music tracks, and
  right-click reassignment.
- `studio/index.html` — new integrated bundle reference and bumped
  bridge cache tags (`tpi031=video-overlay-v2`,
  `tpi-scene-music=v3`).
- `studio/assets/index-DKZ2XOEP.js` — generated authoritative bundle
  from source commit `ce7c389` (reproducible twice by
  `scripts/stage-studioflow-authoritative.mjs --apply`).
- `scripts/stage-studioflow-authoritative.mjs`,
  `scripts/verify/tpi-release-safety.mjs`,
  `scripts/verify/tpi-studioflow-021-audio-soundboards.mjs`,
  `scripts/verify/tpi-studioflow-020-video-playback.mjs`,
  `scripts/verify/tpi-studioflow-031-video-overlays.mjs`,
  `scripts/verify/tpi-studioflow-055-source-reconciliation.mjs` —
  cache-tag pins updated; the 020 Outro-completion contract now also
  verifies the source, and the 031 source pin follows the 027
  `activeVideoClipUrl` resolution.
- `scripts/verify/tpi-studioflow-027-scenes.mjs` — added playback-start
  and recording-independence source contracts.
- `scripts/verify/tpi-studioflow-028-browser.mjs` — new Firefox
  interaction suite (29 checks).
- `scripts/verify/tpi-studioflow-021-browser.mjs`,
  `package.json` — (carried from the started work) after-intro selector
  updates and the `verify:studioflow-028-browser` script.

## Playback behavior restored

1. Intro starts on first click at 00:00 with its Video Clips asset.
2. Intro stops on second click (Play/Stop toggle).
3. Intro always restarts at 00:00.
4. Intro audio stops with the video.
5-8. The same four behaviors for Outro.
9. Intro and Outro cannot overlap (single stage video).
10. The previous production scene is restored on stop and completion.
11. Natural completion resets the controls and restores the scene.
12. After Intro remains independent (stopping Intro never activates it).
13. Background Music uses its intended media assignment.
14. Guest connections are unaffected (guest audio mixing paths
    unchanged; full live WebRTC acceptance remains owner-gated).
15. Recording and livestream controls remain independent: production
    start clears preview state without starting playback, and Outro
    completion no longer stops recording or livestream.
16-17. Studio switching and reload persistence verified in the release
    acceptance suite (My Studios switching, restore, identity and media
    persistence after reopening).
18. Existing Video Clips general-clip stage playback remains functional.

## After Intro independence verification

The shortcut now has its own stable identity (`after-intro`), legacy
`intro`/`global` assignments migrate without losing the track, and the
bridge's scene logic keys on `data-tpi-scene-id` only. Firefox checks
confirm: stopping Intro Video restores the previous scene and leaves
After Intro music inactive; clicking After Intro plays Background Music
without changing the active scene.

## Background Music verification

The After Intro shortcut and per-scene shortcuts play the assigned
Background Music tracks through the existing audio board (volume,
looping, program/monitor routing unchanged). The Background Music card
continues to play independently with exactly one active playback card.

## Test results

- TPI-STUDIOFLOW-028 Firefox interaction: 29/29 PASS.
- TPI-STUDIOFLOW-021 Firefox soundboards: 29/29 PASS; static 54/54.
- TPI-STUDIOFLOW-027 static: 12/12; 020: 14/14 (both previously failing
  contracts pass); 031: 12/12; 019: 7/7; 055: 17/17.
- Video clips 13/13; media organization 27/27; release safety 17/17.
- Local admin lifecycle 38/38; local isolated Firefox 60/60.
- Live anonymous production smoke 10/10; live isolated Firefox
  Developer Edition acceptance 60/60 with the synthetic QA account.

Pre-existing failures found and left unchanged (reproduced identically
on the previously deployed `index-Tzq2r-El.js` bundle, therefore not
caused by this repair): `tpi-studioflow-022-browser.mjs` fails its
narrow-width check on a stale unscoped `.tpi-video-grid` locator (two
grids exist since the Intro/Outro split) and intermittently sees a
duplicated countdown duration row in Chromium. The gate suite's Firefox
timer check passes singular.

## Source commit

- Authoritative StudioFlow source: `ce7c389d23db65bd5ebb92597695d9854d21c7ab`.
- Website commit (deployed application): `592028a599d2fff64e9d81f2e28856aead63c822`.

## Production deployment

- Worker: `theparanormalinitiative`.
- Deployed Worker version: `210f4610-ff8a-4192-a944-4668892dd669`.
- Rollback version retained by the release workflow:
  `d6ee132b-59f6-4694-a64b-09d6de37d3e5`.
- Result: `DEPLOYED_AND_VERIFIED` through the guarded source-to-live
  workflow after `release:preflight` reported `READY`. No production
  files, D1 records, or R2 objects were edited directly.

## Remaining limitations and deliberate behavior changes

1. Outro completion no longer stops the podcast recording or livestream
   (TPI-STUDIOFLOW-020/028 requirement "these are separate production
   operations"). This reverses the 2026-10-10 StreamYard-parity
   show-end behavior from `72df3af`. If the owner wants Outro completion
   to end the show again, that is a one-line restoration in
   `finishVideoClipPlayback`.
2. Record/Go live clears any previewing clip and never starts playback
   (restored 020 contract), replacing the 2026-10-23 "program cue"
   behavior where production start restarted the selected clip. If the
   owner prefers the program cue, say so and it can be reinstated on top
   of click-to-play.
3. Live audible confirmation of Intro/Outro audio routing during a real
   recording or livestream remains an owner-facing check; automated
   acceptance verifies controls and state, not audible output.
4. Guest WebRTC paths were preserved but not exercised with real remote
   guests.
5. The local StudioFlow room server at `127.0.0.1:8788` is stopped;
   only the 022 browser test's background room polling notices it.

---

# Addendum A — Preserve Sol's After Intro Background Music

Date: 2026-10-23
Status: IMPLEMENTED / TESTED / DEPLOYED AND LIVE-VERIFIED

## Historical determination (Addendum A §3)

Sol's approved implementation is commit `d262867` "Repair StudioFlow scene
background music" (2026-10-22), documented in
`2026-10-22-STUDIOFLOW-SCENE-BACKGROUND-MUSIC.md`: "The Intro control assigns
a track for automatic playback after Intro ends." Automatic post-Intro
activation therefore WAS part of Sol's approved implementation and is
preserved, not introduced. Sol's original `syncSceneMusic` handoff ran on the
scene transition out of the Intro scene (natural completion and manual stop
alike, since both restore the prior scene) and was not gated by Live or Record
state.

## What had been lost

Commit `0241dc7` (the program-cue regression family) wrapped Sol's
`syncSceneMusic` in a `studioflow.programActive` gate, so the Intro-scene
music clear and the After Intro handoff ran only while Live or Record was
engaged. In ordinary studio use Sol's approved transition never fired, which
altered the original functionality.

## What was restored

- `studio/audio-soundboard-bridge.js` now runs Sol's original transition
  semantics verbatim (adapted only to the maintained `after-intro` scene ID
  with its legacy migration): entering the Intro scene clears music for the
  video moment; leaving the Intro scene plays the entered scene's assigned
  track or the assigned After Intro track. The program-state gate, its
  `programWasActive` tracking, and the `studioflow:program-state` listener
  are removed from the music path.
- Preserved from the main 028 repair: the After Intro shortcut's own
  click-to-play control (click plays the assigned Background Music track,
  right-click reassigns), music-shortcut exclusion from scene/video
  handling, and independent Intro/Outro scene identity.
- Unchanged per Addendum §5: the existing Background Music media system,
  assignments (`studioflow.sceneMusicAssignments`), track slots, loop
  preference, volume configuration, program/monitor audio routing, and
  Studio-scoped persistence. No duplicate player or asset record exists.

## Independence guarantees (Addendum §2/§4/§6)

- Intro Video and After Intro music do not share a playback handler or scene
  identifier; clicking the music shortcut never starts, stops, or restarts
  the Intro Video (tested during active playback), and stopping music leaves
  the Intro Video running.
- Clicking to play the Intro Video clears music (Sol's Intro-scene clear) and
  never triggers the After Intro track.
- The video stop path restores the actual previous scene and never clicks the
  music shortcut (the removed unintended connection).
- Sol's intentional transition is preserved exactly as originally
  implemented: the After Intro handoff fires when production leaves the Intro
  scene, whether the Intro Video finished naturally or was stopped early.
  This trigger condition is Sol's original design and was not redesigned; if
  the owner wants activation limited to natural completion only, that is a
  deliberate one-line deviation from Sol's implementation and was not made
  unilaterally.

## Verification

- TPI-STUDIOFLOW-028 Firefox interaction suite: 33/33, including new
  Addendum-A checks: music-shortcut playback never mounts stage video;
  music playback does not restart the Intro Video mid-playback; the music
  shortcut plays its assigned track without leaving the Intro scene; Stop
  music leaves the Intro Video running; Sol's preserved handoff starts After
  Intro music when the Intro segment ends; Sol's approved automatic After
  Intro playback runs when the Intro Video finishes.
- TPI-STUDIOFLOW-021 static contract: 58/58, including four new pins of
  Sol's handoff, Intro-clear, assignment-only After Intro handoff, and
  distinct After Intro scene identity.
- TPI-STUDIOFLOW-021 Firefox: 29/29. TPI-STUDIOFLOW-027: 12/12.
  TPI-STUDIOFLOW-020: 14/14. TPI-STUDIOFLOW-031: 12/12.
- Release safety contract: 17/17. Local authentication lifecycle: PASS
  (38 API checks per phase, 60 browser checks). Maintained local Firefox
  acceptance gate: 60/60.

## Release

- Website source commit: `cb9746411398df16282c305101cb0b41425bcd39`
- Authoritative StudioFlow source commit unchanged: `ce7c389` (bridge-only
  release; no React source change).
- `release:preflight`: `READY` with exact commit parity.
- Production result: `DEPLOYED_AND_VERIFIED`.
- Worker: `theparanormalinitiative`, deployed version
  `21ea05f7-588d-4b5a-b039-c6063f7fd248`, rollback version
  `210f4610-ff8a-4192-a944-4668892dd669`.
- Live anonymous production smoke: 10/10. Live isolated Firefox Developer
  Edition acceptance: 60/60.
- No production files, D1 records, R2 objects, Crossroads data, or owner
  browser storage were modified. Audible confirmation of the music handoff in
  a real studio session remains the owner-facing check.

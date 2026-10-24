# TPI-STUDIOFLOW-031 — Background Music Interface Cleanup and Drag-and-Drop Pad Reordering

Date: 2026-10-24
Project: The Paranormal Initiative — StudioFlow
Status: COMPLETE / IMPLEMENTED / TESTED / DEPLOYED AND LIVE-VERIFIED
Scope: StudioFlow Background Music pad interface, ordering, and per-Studio
persistence. No sound-engine redesign; Sol's After Intro Background Music
preserved; the TPI-030 Sound Effects improvements preserved. No D1
migration, R2 mutation, Crossroads mutation, or owner-browser storage
access.

## 1. Original Background Music implementation findings

The Background Music board is rendered by the maintained TPI bridge
`studio/audio-soundboard-bridge.js` (`board("music", ...)`, `makeCard`),
which owns pad creation, playback (`playMusic` / `stopMusic`), the floating
options menu, volume/loop controls, and per-slot persistence in
`studioflow.backgroundMusicSlots` (legacy single-track key
`studioflow.backgroundMusic`). React (`App.tsx`) is the second writer of the
sound keys (`saveCustomSounds`, the `customSounds` persistence effect) and
plays music through the `studioflow:audio-command` bridge contract.

**After Intro assignment was already position-independent.** Before any
change, `saveSceneMusic` stored `{ blobKey, assetId, title, assignedAt }` in
`studioflow.sceneMusicAssignments`, and `playAssignedSceneMusic` /
`sceneMusicButton` resolve the assigned track by stable `blobKey`, never by
pad position. Reordering pads therefore cannot change which track is
assigned to After Intro; this was verified from source first and then
covered by the mandatory §6 test (checks 22/23/24/8c below).

**Two pre-existing persistence defects made per-Studio music persistence
impossible and were repaired (justified out-of-scope changes, see §10):**

1. **API workspace normalizer dropped the music state.**
   `normalizeStudioConfiguration` in `functions/api/[[path]].js` is an
   explicit allow-list: it persisted `customSounds`, `customSound`, and the
   singular `backgroundMusic`, but silently dropped `backgroundMusicSlots`
   (pad assignments and order), `backgroundMusicLoop`, and
   `sceneMusicAssignments` (including Sol's After Intro assignment). Any
   studio-switch hydration therefore reset the music board to defaults —
   verified by server-state probes showing `backgroundMusicSlots: []` after
   saves that contained music. The normalizer now persists all three, and
   `normalizeAsset` preserves pad `color` and `titleCustomized` metadata.
2. **Asset-state bridge wired media replacements by position.**
   `replaceAssets` in `studio/workspace-asset-state-bridge.js` consumed the
   upload `replacements` array with a shared positional counter, while
   `visitAssets` visits fields in a different order and visits some
   conditionally (the singular `backgroundMusic` is skipped whenever music
   slots hold assets). Every conditional visit shifted the mapping, so one
   asset's uploaded replacement landed on a different field — observed as
   music titles inside `customSounds` and duplicated pad entries in saved
   state. Replacement matching is now keyed by `blobKey`, so each asset
   receives exactly its own uploaded replacement.

The write-path was verified with a localStorage write-trace probe (uploads
were clean; the corruption appeared only after workspace saves), keeping
the investigation evidence-based.

## 2. Historical directives and files reviewed

- `AGENTS.md` and `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`
  (governing authority, read before implementation).
- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`
  (reference implementation for this directive).
- `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md` (approved
  behavior, including Addendum A's preserved automatic transition).
- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`
  (including its Addendum A section) and
  `2026-10-22-STUDIOFLOW-SCENE-BACKGROUND-MUSIC.md` (Sol's implementation,
  commit `d262867`).
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-017-SMART-PADS.md` and
  `2026-10-22-STUDIOFLOW-SMART-PADS-RESULT.md` (original Background Music
  board implementation), `2026-10-22-STUDIOFLOW-BACKGROUND-MUSIC-FORMATS.md`,
  `2026-10-22-STUDIOFLOW-FLOATING-AUDIO-MENU.md`.
- Directive index, development status, agent handoff, development README,
  testing documentation, and the maintained verification suites
  (020/021/027/028/030 family).

## 3. Files modified (commit `4cacb3a`)

- `studio/audio-soundboard-bridge.js` — permanent three-dot triggers removed
  from Background Music pads (the menu trigger is gone from both boards
  now); drag-and-drop and Alt+Arrow keyboard reordering generalized to both
  boards (`moveSoundSlot` became `moveSlot(category, from, to, restoreFocus)`
 ); the active playback slot is remapped on reorder so the playing indicator
  follows the actually-playing track and reordering never starts or stops
  playback.
- `functions/api/[[path]].js` — `normalizeStudioConfiguration` persists
  `backgroundMusicSlots`, `backgroundMusicLoop`, and `sceneMusicAssignments`
  (values sanitized like the existing lists); `normalizeAsset` preserves
  `color` and `titleCustomized` pad metadata.
- `studio/workspace-asset-state-bridge.js` — `replaceAssets` matches
  uploaded replacements by `blobKey` (finding 2).
- `studio/index.html`, `scripts/stage-studioflow-authoritative.mjs`,
  `scripts/verify/tpi-release-safety.mjs` — bridge cache tag bumped to
  `soundboards-v7`.
- `scripts/verify/tpi-studioflow-031-music-pads.mjs` — new 34-check browser
  suite covering every requirement in §11 of the directive.
- `scripts/verify/tpi-studioflow-021-audio-soundboards.mjs` — regression
  pins for the API persistence fields, the blobKey-keyed replacement
  matching, and the generalized reordering (78 checks total).
- `scripts/verify/tpi-studioflow-firefox-acceptance.mjs` — live-coverage
  checks: music pads omit the three-dot trigger, right-click opens the music
  pad menu, drag affordance present (gate now 64 checks).
- `package.json` — `verify:studioflow-031-music-pads` script.

## 4. Three-dot menu removal

Background Music pads no longer render the permanent
`tpi-audio-slot-menu-trigger` button. The unchanged floating options menu
(Rename, Change color, Replace audio, Remove) opens on right-click, on the
ContextMenu key or Shift+F10 for keyboard users, and on touch long-press
(pointer events with a 500 ms long-press, `touch-action: none` on
draggable pads). The menu itself was not redesigned or replaced.

## 5. Drag-and-drop implementation

The proven TPI-030 interaction is reused for the music board:
pointer-event dragging with long-press activation (mouse, trackpad, touch),
a lifted dragged pad, an explicit drop placeholder, immediate rearrangement
without reload, and Alt+ArrowLeft/Alt+ArrowRight keyboard reordering of the
focused pad. Dragging never fires playback (a drag suppresses the
click-through and no play command is dispatched), dropping does not restart
or stop an already playing track (verified by command-log inspection), and
the pad's complete configuration — media assignment, title, color, and slot
metadata — moves with it.

## 6. Playback protection

Music playback, play/stop behavior, volume, looping, program and monitoring
routing, recording/livestream integration, and the Background Music Stop
control are unchanged. The Stop control remains available exactly as
required (music tracks can run long). The 028 scene playback workflow was
not modified. Sol's After Intro Background Music automatic transition
(Addendum A behavior: activating on leaving the Intro scene, natural
completion and manual stop alike) is preserved and verified below.

## 7. Automatic persistence

Every reorder writes `studioflow.backgroundMusicSlots` immediately through
the existing workspace save pipeline — no Save button. The arrangement
survives refresh (check 14) and studio switching (checks 15a–15d) because
of the two persistence repairs in §1. The TPI-030 save-echo guard
(`captureKeyGuard` in the asset-state bridge) is preserved and now also
protects the music keys.

## 8. Studio isolation

Checks 15a–15d create two studios, give each its own music arrangement,
and switch both ways: each restores exactly its own saved order and neither
overwrites the other. Server-state probes confirmed both workspaces persist
distinct `backgroundMusicSlots` and `sceneMusicAssignments`.

## 9. After Intro Background Music regression verification (directive §6)

The mandatory sequence was executed end-to-end (suite checks 22, 23, 24,
8b, 8c): a track was assigned to After Intro; the pads were reordered; the
Intro Video was played and allowed to complete naturally (fast-forwarded to
the final 0.3 s); the originally assigned track started automatically; the
test was repeated with a manually stopped Intro Video with the same result;
and the `after-intro` assignment's `blobKey` was confirmed unchanged after
the reorder. Pad order does not change the assigned track.

## 10. Sound Effects regression verification

Sound Effects ordering is untouched by music reordering (check 16), the
TPI-030 suite passes 25/25 (Stop Sound removal, menu removal, drag/keyboard
reordering, automatic persistence, and multi-studio isolation all intact),
and the 021 browser suite passes 31/31. The `moveSlot` generalization also
remaps the sound playback indicator correctly across reorders.

**Changes outside the Background Music area, justified per §10:**
`functions/api/[[path]].js` (required for §7 persistence — without it the
arrangement cannot survive studio switching),
`studio/workspace-asset-state-bridge.js` (required for §4 — without it pad
configuration is cross-wired on save), the cache tag and release-tooling
strings (release mechanics), the 021/030 verification suites' pins
(regression contracts), and the Firefox acceptance gate (live coverage of
the removed triggers). The Intro/Outro production workflow was not modified.

## 11. Browser test results (directive §11 mapping)

`scripts/verify/tpi-studioflow-031-music-pads.mjs` — **34/34 PASS on two
consecutive runs.** Check mapping: 1 three-dot removal ✓; 2 right-click
menu with all actions ✓; 3 keyboard menu ✓; 4 touch menu path ✓; 5 correct
playback on click ✓; 6 drag plays nothing ✓; 7 drop does not restart/stop
music ✓; 8/9 forward and backward moves ✓; 10 empty pads usable ✓; 11
assignments move with pads ✓; 12 reordered pads play correct tracks ✓; 13
automatic save ✓; 14 refresh preserves order ✓; 15a–15d studio isolation ✓;
16 Sound Effects order unchanged ✓; 17 volume ✓; 18a/18b Stop control ✓;
19 looping ✓; 20 program routing commands dispatched ✓; 21 monitoring
routing settings reach the engine ✓; 22/23/24 + 8b/8c After Intro
assignment and both automatic activations ✓; 25 Outro independence ✓; 26/27
recording, livestreaming, and guest controls present (live sessions not
activated — see §17).

## 12. Audio routing and playback test results

Music play/settings commands are dispatched through the
`studioflow:audio-command` bridge contract (the play command's detail
carries the asset metadata category `background-music`, the settings
commands `music` — both spellings accepted as the pre-existing contract).
Volume and loop changes write their persisted keys and reach the engine.
The 021 static contract pins the React-side program and monitor gain
handling.

## 13. Regression suite results

| Suite | Result |
| --- | --- |
| 031 Background Music pad browser interactions | 34/34 (twice) |
| 030 Sound Effects pad browser interactions | 25/25 |
| 028 scene playback browser interactions | 33/33 |
| 021 browser interactions | 31/31 |
| 021 static contracts | 78/78 |
| 020 video playback contracts | 14/14 |
| 027 scenes contracts | 12/12 |
| 031 video overlays (static) | 12/12 |
| Release safety | 17/17 |
| Polling contract | 3/3 |
| Local auth lifecycle (Node) | 38/38 |
| Local auth lifecycle (isolated Firefox acceptance) | 64/64 |
| Guarded live acceptance against production | 64/64 |

One earlier 021-browser failure was test-account pollution (leftover
synthetic studios from repeated runs caused a nav click-detach loop);
cleaning the disposable account restored 31/31. This is test maintenance,
not a product defect.

## 14. Documentation files updated

- This completion record.
- `100-DIRECTIVES/DIRECTIVE-INDEX.md` — TPI-STUDIOFLOW-031 row and current
  production reconciliation baseline.
- `TPI-CURRENT-DEVELOPMENT-STATUS.md` — new latest-release section; TPI-030
  demoted to prior release and retained.
- `TPI-DEVELOPMENT-AGENT-HANDOFF.md`, `README.md`,
  `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` — baseline blocks updated.
- `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md` — pads section extended to cover
  Background Music, the two persistence repairs added to the verified
  regression history, and new must-never-break rules.

Historical records were preserved unchanged; `AGENTS.md` was reviewed and
required no change (its TPI-029 regression-prevention requirements remain
controlling, and both governing documents remain authoritative).

## 15. Git commits

- Website repository (`codex/tpi-development`):
  - `4cacb3a` — feat(studioflow): music pad drag reordering and persistence
    repairs (TPI-031)
  - The documentation commit for this record follows.
- Authoritative StudioFlow source
  (`/Users/toddknipple/Documents/StudioFlow/web`): unchanged at `ce7c389`.
  This release changed only website-repository bridge, API, and tooling
  files.

## 16. Production deployment status and rollback reference

Deployed through the maintained guarded release path
(`verify:local-auth-lifecycle` → `release:preflight` →
`TPI_PRODUCTION_DEPLOY=approved release:production`):

- Source commit: `4cacb3aac1b28e9159e2511108956776f931b0e3`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `48cdb81d-efcc-4f03-8717-eaa5a51e45d5` at 100%
  traffic
- **Rollback reference: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`**
  (the TPI-STUDIOFLOW-030 release)
- Release state: `DEPLOYED_AND_VERIFIED`, including the guarded live
  isolated Firefox Developer Edition acceptance against production (64/64,
  containing the new music-pad trigger/menu/drag checks).

## 17. Unresolved issues and limitations

1. **Pre-existing gaps observed, not changed (out of this directive's
   area):** the API configuration normalizer also drops `videoClipSlots`
   (the general Video Clips board) and `programOrientation`, so those keys
   do not round-trip through the server either. No regression was
   introduced; a future Video Clips directive should apply the same
   treatment.
2. Touch drag is implemented through pointer events with long-press and is
   verified structurally (check 4); physical multi-touch tablet acceptance
   was not performed.
3. Recording, livestreaming, and guest sessions were not activated (checks
   26/27 verify the controls remain present and the affected systems pass
   their suites); live session acceptance remains the owner's step.
4. Drag-and-drop reordering was not exercised against the live production
   site (the live gate is non-destructive); local browser verification
   (34/34 twice) plus the live gate's new pad checks cover the released
   surface.

## Intentional behavior changes (explicitly reported)

1. The permanent three-dot menu buttons are removed from Background Music
   pads (directive §3); the menu is reachable by right-click, Shift+F10 /
   the ContextMenu key, and touch long-press.
2. Background Music pads can be reordered by drag-and-drop and by keyboard,
   saving automatically per studio (directive §4–§7).
3. Reordering now remaps the active playback indicator to the moved track
   on both boards instead of leaving it on a stale slot index; playback
   itself is never started or stopped by a reorder.
4. The workspace API now persists `backgroundMusicSlots`,
   `backgroundMusicLoop`, and `sceneMusicAssignments` (finding 1) and the
   asset-state bridge matches media replacements by `blobKey` (finding 2).
   Both repair pre-existing defects and change only previously broken
   behavior.

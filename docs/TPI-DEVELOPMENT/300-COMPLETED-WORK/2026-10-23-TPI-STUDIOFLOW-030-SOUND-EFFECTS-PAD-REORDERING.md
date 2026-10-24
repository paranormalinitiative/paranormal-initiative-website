# TPI-STUDIOFLOW-030 — Sound Effects Interface Cleanup and Drag-and-Drop Pad Reordering

Date: 2026-10-23
Project: The Paranormal Initiative — StudioFlow
Status: COMPLETE / IMPLEMENTED / TESTED / DEPLOYED AND LIVE-VERIFIED
Scope: StudioFlow Sounds / Sound Effects panel interface and pad ordering.
No sound engine redesign, no media system changes, no D1 migration, no R2
mutation, no Crossroads mutation, no owner-browser storage access.

## 1. Root implementation findings

The Sound Effects panel is a maintained TPI bridge surface:
`studio/audio-soundboard-bridge.js` renders the nine-slot per-category
boards (`[data-tpi-audio-board="sound"]` and `["music"]`), owns pad
creation, playback (`playSound` / `stopSound`), the floating options menu,
volume/loop controls, and per-slot persistence. Pad data persists in the
existing per-studio workspace configuration key `studioflow.customSounds`
through the existing save pipeline (`configurationForSave` / `CONFIG_KEYS`
and the API's `normalizeStudioConfiguration`). No separate storage system
was needed; the directive's §7 requirement is satisfied by the existing
StudioFlow persistence architecture.

Three defects surfaced during verification and were repaired:

1. **In-flight save echo clobbering pad order (root cause of the persistence
   failures).** `studio/workspace-asset-state-bridge.js` echoes every
   PATCH/GET workspace response back into localStorage through
   `applyConfiguration`. Saves re-upload local media blobs first and can
   land after a later drag, so a stale response rewrote
   `studioflow.customSounds` with the pre-drag order (DOM revert) and the
   stale body could also win on the server (cross-studio symptoms). Fixed
   with an echo guard: an echo never overwrites a configuration key that
   changed locally while that request was in flight. Regression pins were
   added to `scripts/verify/tpi-studioflow-021-audio-soundboards.mjs`; the
   existing call-signature pin in `scripts/verify/tpi-studioflow-050-stability.mjs`
   was updated to the guarded signature.
2. **Firefox acceptance gate move target.** W3C actions moves do not scroll,
   so the sound-pad menu check targeted a below-fold pad and failed the
   local auth lifecycle Firefox gate. The check scrolls the pad into view
   before the context click (commit `e18d327`). The assertion itself is
   unchanged.
3. **Test-account pollution (test-only).** Repeated local runs left 40+
   same-named synthetic studios in the disposable test account, making
   name-based row matching in the suites pick stale studios. The suites now
   create uniquely titled studios per run and switch by `data-workspace-id`;
   the disposable account was cleaned. No product change.

## 2. Files modified (commit `8f6035a`, plus `e18d327`)

- `studio/audio-soundboard-bridge.js` — Stop Sound button removal, three-dot
  trigger removal, right-click/keyboard menu access, pointer drag-and-drop
  reordering (`moveSoundSlot`), Alt+ArrowLeft/Right keyboard reordering,
  automatic per-studio order persistence.
- `studio/workspace-asset-state-bridge.js` — in-flight echo guard (finding 1).
- `studio/studioflow-012-overrides.css` — drag feedback styles only
  (dragging/drop-target states, `touch-action: none` on draggable pads).
- `studio/index.html` — bridge cache-bust identifiers.
- `scripts/verify/tpi-studioflow-030-browser.mjs` — new 25-check browser
  suite covering every requirement in §11 of the directive.
- `scripts/verify/tpi-studioflow-021-audio-soundboards.mjs` — echo-guard
  regression pins.
- `scripts/verify/tpi-studioflow-050-stability.mjs` — updated pin.
- `scripts/verify/tpi-studioflow-021-browser.mjs` — unique per-run studio
  titles and `data-workspace-id` switching (finding 3).
- `scripts/verify/tpi-studioflow-firefox-acceptance.mjs` — migrated Stop
  Sound checks and the scroll-into-view fix (finding 2).
- `scripts/stage-studioflow-authoritative.mjs`, `scripts/verify/tpi-release-safety.mjs`,
  `package.json` — suite registration and release-tooling wiring.

## 3. Stop Sound removal confirmation

The Stop Sound button (`[data-tpi-audio-stop="sound"]`) is no longer
rendered in the sound controls. The Sound Effects volume slider is
unchanged and functional. Sound playback, audio routing, recording and
livestream audio integration, and every sound assignment are preserved.
Sound playback still ends naturally or is replaced by clicking another
pad; the underlying `stopSound` bridge control remains for internal and
programmatic use. The Background Music board keeps its own stop control
(`[data-tpi-audio-stop="music"]`); only the requested sound button was
removed.

## 4. Three-dot menu removal confirmation

Sound pads no longer render the permanent `tpi-audio-slot-menu-trigger`
button. The existing floating options menu is unchanged and keeps all its
actions — Rename, Change color, Replace audio, Remove. It opens on
right-click (context menu), and for touch and keyboard users via the
keyboard path: the ContextMenu key or Shift+F10 opens the same menu
(`aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Shift+F10"` declared on
each pad). The menu was not redesigned.

## 5. Drag-and-drop implementation details

Pointer-event based dragging with long-press activation
(`data-tpi-audio-draggable="true"`, `touch-action: none`), covering mouse,
trackpad, and touch. The dragged pad shows a dragging state, the grid
shows the intended drop position, and the pads rearrange immediately on
drop. Keyboard reordering moves the focused pad with Alt+ArrowLeft and
Alt+ArrowRight. Normal clicks still play the pad's sound; a drag never
fires playback (verified: no pad is playing after a drag). Empty pads keep
their Add Audio affordance at their position. The three-column grid,
pad colors, labels, upload controls, volume slider, and panel styling are
preserved.

## 6. Automatic persistence verification

Every reorder persists immediately through the existing workspace save
pipeline — there is no Save button. Verified by the 030 suite: the stored
workspace configuration matches the on-screen order right after a drag
(check 10), after a page refresh (check 11), and across studio switches
(checks 12c/12d). The echo guard (finding 1) makes this deterministic even
when a slow save is in flight during a drag.

## 7. Multi-studio isolation verification

Checks 12a–12d create two studios, give each its own arrangement, and
switch between them both ways: each studio restores exactly its own saved
order and neither overwrites the other. The arrangement is keyed to the
studio's workspace configuration like all other StudioFlow settings.

## 8. Regression test results

| Suite | Result |
| --- | --- |
| 030 sound effects browser interactions (`tpi-studioflow-030-browser.mjs`) | 25/25, two consecutive clean runs |
| 021 static contracts (`tpi-studioflow-021-audio-soundboards.mjs`) | 69/69 |
| 021 browser interactions | 31/31 |
| 028 scene playback browser interactions | 33/33 |
| 020 video playback contracts | 14/14 |
| 031 video overlays | 12/12 |
| Release safety (`tpi-release-safety.mjs`) | 17/17 |
| Polling contract | 3/3 |
| Local auth lifecycle (Node) | 38/38 (three runs) |
| Local auth lifecycle (isolated Firefox acceptance) | 61/61 |
| Guarded live acceptance against production | 61/61 |

Directive §11 mapping: Stop Sound invisible (1) ✓; volume slider
functional (2) ✓; three-dot buttons invisible (3) ✓; right-click menu with
all actions (4) ✓; pad click plays the correct sound (5) ✓; drag does not
play (6) ✓; forward and backward moves (7, 8) ✓; empty pads usable (9a/9b)
✓; automatic save (10) ✓; refresh preserves order (11) ✓; studio switching
restores each studio's arrangement (12a–12d) ✓; assignments stay attached
(13) ✓; playback works after reordering (14) ✓; keyboard and touch paths
(15a–15d) ✓; Intro Video playback (16) ✓; After Intro Background Music
(17) ✓; music stop control and audio routing (18) ✓.

The recently repaired TPI-STUDIOFLOW-028 playback workflow was not modified
(the bridge's scene/video code paths are untouched); the 028 suite's 33/33
and the 030 checks 16–18 confirm no regression into scene playback, After
Intro music, recording, livestreaming, or guest connections.

## 9. Documentation updates

- This completion record.
- `100-DIRECTIVES/DIRECTIVE-INDEX.md` — new TPI-STUDIOFLOW-030 row and
  current production reconciliation baseline.
- `TPI-CURRENT-DEVELOPMENT-STATUS.md` — new latest-release section; the
  028 Addendum A section is demoted to prior release and retained.
- `TPI-DEVELOPMENT-AGENT-HANDOFF.md`, `README.md`,
  `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` — baseline blocks updated.
- `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md` — Sound Effects pads section added
  to the approved behavior and the persistence guard added to the
  must-never-break rules.

Historical records were not rewritten. Documentation follows the
TPI-STUDIOFLOW-029 standards.

## 10. Git commits

- Website repository (`codex/tpi-development`):
  - `8f6035a` — feat(studioflow): sound pad drag reordering and effects cleanup (TPI-030)
  - `e18d327` — test(verify): scroll sound pad into view before Firefox context-click
  - The documentation commit for this record follows these.
- Authoritative StudioFlow source
  (`/Users/toddknipple/Documents/StudioFlow/web`): unchanged at `ce7c389`.
  This is a bridge-only release; no React/TypeScript source change was
  required.

## 11. Deployment status

Deployed through the maintained guarded release path
(`verify:local-auth-lifecycle` → `release:preflight` →
`TPI_PRODUCTION_DEPLOY=approved release:production`):

- Source commit: `e18d3271b61c34adf2099448521e263dbcd13e70`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
- Immediate rollback reference: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
  (the TPI-STUDIOFLOW-028 Addendum A release)
- Release state: `DEPLOYED_AND_VERIFIED`, including live isolated Firefox
  Developer Edition acceptance against production (61/61).

## 12. Unresolved limitations

1. Touch drag is implemented through pointer events with long-press and is
   verified structurally (check 15d) and through the keyboard path; physical
   multi-touch tablet acceptance was not performed.
2. Drag-and-drop reordering was not exercised against the live production
   site: the live acceptance gate is non-destructive and does not reorder a
   live studio's pads. Local browser verification (25/25, twice) plus the
   live gate's migrated pad checks (Stop Sound removal, menu-trigger
   absence, right-click menu) cover the released surface.
3. The earlier flaky 021-browser failures were test-account pollution, not
   product defects; the disposable test account cleanup is maintenance and
   is not part of the released behavior.

## Intentional behavior changes (explicitly reported)

1. The Stop Sound button is removed from the visible sound controls
   (directive §3). Background Music keeps its stop control.
2. The permanent three-dot menu buttons are removed from sound pads
   (directive §4); the same menu is reachable by right-click and by
   Shift+F10 / ContextMenu key.
3. Sound pads can be reordered by drag-and-drop and by keyboard; the order
   saves automatically per studio (directive §5–§7).
4. Internally, remote workspace responses no longer overwrite configuration
   keys that changed locally while the request was in flight (finding 1).
   This changes only the pathological race; normal saves and hydration are
   unchanged.

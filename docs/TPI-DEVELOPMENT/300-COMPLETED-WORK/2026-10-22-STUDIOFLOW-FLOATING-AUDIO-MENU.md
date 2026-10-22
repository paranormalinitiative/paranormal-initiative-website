# StudioFlow Floating Audio Menu Repair

Date: 2026-10-22

Directive: TPI-STUDIOFLOW-017 SMART Pads

## Reported issue

The three-dot menu on Sound Effects and Background Music pads opened inside
the audio card/panel boundary and was clipped, making its actions unusable.

## Repair

- Audio management menus now move to `document.body` while open.
- Menus use a fixed-position floating layer with a high stacking order.
- Menu coordinates are calculated from the visible three-dot trigger and
  clamped to the browser viewport.
- Menus reposition on resize and scrolling, dismiss on outside click, and
  are removed before the audio board re-renders.
- The audio board's mutation observer now leaves an open floating menu alone
  when the board signature has not changed; cleanup runs only when a real
  audio-board rebuild is required.
- Existing Rename, Change color, Replace audio, Remove, right-click, and
  keyboard/card playback behavior remains unchanged.

## Data protection

No owner studio, Crossroads of the Unknown data, D1 record, R2 object, or
existing browser media was modified. The change is UI-only.

## Verification

- Static soundboard checks: 40 passed.
- Isolated Firefox Developer Edition acceptance: 26 passed, 0 failed.
- Acceptance covered the floating menu's document-body placement, fixed
  positioning, viewport clamping, sound/music playback, local save, backup,
  restore-as-new, switching, and narrow-width behavior.

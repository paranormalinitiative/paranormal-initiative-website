# StudioFlow Live Panel Display Repair

Date: 2026-10-23

Status: DEPLOYED AND VERIFIED ON PRODUCTION

Worker: `theparanormalinitiative`

## User-visible failure

On the authenticated production StudioFlow page, selecting Live interaction,
Comments, Banners, Voice FX, Style, Widgets, Notes, People, Private chat, or
Recording changed the React panel but left the Media Assets bridge content
visible underneath it. Video Timers, Sounds, and Background Music therefore
appeared in multiple right-rail tabs.

The earlier bridge visibility and cache-busting repairs were not sufficient.
They set the injected elements' HTML `hidden` property, but the production
stylesheet assigned `display: grid` to those same elements. Author CSS won the
display cascade, so content marked hidden remained visibly rendered. The
previous automated assertion trusted `node.hidden` and could therefore report
success while the browser still displayed the elements.

## Production repair

- `studio/video-clip-management-bridge.js` now applies an inline
  `display: none !important` while Media Assets is not selected and removes
  that inline value when Media Assets is selected.
- `studio/audio-soundboard-bridge.js` applies the same rendered-display rule to
  Sounds and Background Music.
- `studio/studioflow-012-overrides.css` now contains explicit `[hidden]` rules
  for the video, timer, soundboard, and original-audio bridge roots.
- `studio/index.html` uses the `exclusive-v3` cache identifier for both bridges
  and the maintained override stylesheet.
- The authoritative staging and release-safety checks require the new cache
  identifiers.
- The Firefox acceptance test now inspects computed display, visibility, and
  rendered client rectangles. It no longer treats `node.hidden` alone as proof
  that content is absent from the visible layout.

## Verification

- Audio soundboard static checks: PASS, 54 checks.
- Video organization static checks: PASS, 26/26.
- Release workflow safety: PASS, 16/16.
- Local authentication lifecycle required by the guarded release: PASS, 38/38.
- Isolated production Firefox Developer Edition acceptance: PASS, 59/59.
- Live anonymous production smoke: PASS, 10/10.
- Authenticated owner Firefox Developer Edition production verification: PASS.
  The existing live tab at `https://paranormalinitiative.com/studio/` was
  reloaded after deployment. All 11 right-rail tabs were selected. Every
  non-media tab showed its expected panel with Video Timers, Sounds, and
  Background Music absent from the rendered accessibility tree. Media Assets
  showed its video, timer, sound, and music controls and did not show Voice FX.
- The owner production tab was left on Live interaction with Media Assets-only
  content hidden.

The owner profile was used only for non-destructive live UI verification. No
browser storage, studio data, media assignment, recording, or account setting
was changed.

## Release

- Branch: `codex/tpi-development`
- Source and deployment commit:
  `f1603710545447b072fbe6160acc3bccbcf456e4`
- Worker version: `0862ff17-3003-4e27-8ab3-dc7218dbbff3`
- Immediate rollback version: `a4e1f565-21fb-449d-878a-388beabac36c`
- Production assets uploaded: `studio/index.html`,
  `studio/video-clip-management-bridge.js`,
  `studio/audio-soundboard-bridge.js`, and
  `studio/studioflow-012-overrides.css`.
- Rollback required: no.

No D1 migration, R2 mutation, Crossroads of the Unknown change, or destructive
owner-browser action occurred.

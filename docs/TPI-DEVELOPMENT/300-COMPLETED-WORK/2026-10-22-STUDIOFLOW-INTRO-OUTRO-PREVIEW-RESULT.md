# StudioFlow Intro/Outro Preview Visibility — 2026-10-22

Status: DEPLOYED / PRODUCTION PACKAGE VERIFIED

## Objective

Keep Intro and Outro playback stage-only while making it obvious that each
identity slot has a loaded clip. The media cards now show a visible `Preview`
badge over the stored thumbnail, or hydrate a control-free video preview from
the stored IndexedDB media when a legacy asset has no saved thumbnail.

## Implementation

- Preserved the no-fullscreen, no-card-playback behavior from the preceding
  Intro/Outro fix.
- Added a visible `Preview` label to assigned Intro and Outro cards.
- Added a control-free video fallback preview for assigned clips without a
  thumbnail; it loads from the existing stored media blob and cannot take over
  playback or open fullscreen from the card.
- Shows `Loading preview…` while the fallback is being hydrated and `Clip
  loaded` when the media record exists but no preview frame can be displayed.
- Left-side Intro and Outro scene cards remain the only playback entry point for
  those clips in the StudioFlow stage.

## Verification

- Node syntax check: PASS.
- Video Clips focused checks: PASS, 13/13.
- Media organization checks: PASS, 22/22.
- Release safety checks: PASS, 15/15.
- Authoritative StudioFlow build: PASS twice, reproducible output.
- Generated assets preserved: `index-qJRmDT77.js` and
  `index-TsnuK4Ub.css`.
- Guarded production dry-run: PASS.
- Public production smoke: PASS, 10/10.
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser storage
  operation was performed.

## Release evidence

- Branch: `codex/tpi-development`
- Commit: `5ffe238b9a88023f6feabb27f0a30ef9e0bd6e52`
- Worker: `theparanormalinitiative`
- Production Worker version: `68dc36ac-a3bf-47c6-b1b0-8500abd3ffa1`
- Immediate rollback version: `b41a8582-4558-4391-bf37-188049125853`
- GitHub branch and local checkout matched after push.
- Working tree was clean after the application release.

## Firefox Developer Edition acceptance

In the existing authenticated Firefox Developer Edition StudioFlow tab, press
`Cmd+Shift+R` once. Confirm that assigned Intro and Outro cards visibly show
their thumbnail or preview badge, but do not show native video/fullscreen
controls. Click the left-side Intro or Outro scene card to load that clip into
the stage. Do not close either existing Firefox tab.

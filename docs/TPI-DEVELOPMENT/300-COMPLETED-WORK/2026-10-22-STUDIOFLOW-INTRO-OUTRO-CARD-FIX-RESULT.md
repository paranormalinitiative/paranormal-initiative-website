# StudioFlow Intro/Outro Card Fix — 2026-10-22

Status: DEPLOYED / PRODUCTION PACKAGE VERIFIED

## Objective

Correct the Intro and Outro media cards so assigned videos are not presented
as simultaneously selected or as card-level playback controls. Intro and Outro
playback now remains owned by the left-side scene cards, which load the selected
scene into the StudioFlow stage. General Video Clips retain click-to-play stage
behavior.

## Implementation

- Removed the assigned-card blue selection styling from Intro and Outro media
  cards. Timer selection/running styling remains unchanged.
- Made the Intro and Outro card previews display-only: no native video controls,
  no fullscreen/Picture-in-Picture affordance, and no card-level preview action.
- Prevented clicking an assigned Intro or Outro card from starting card playback.
- Kept Replace and Remove available from the three-dot menu.
- Preserved left-side scene playback and the existing general Video Clips
  stage-play behavior.
- Bumped the maintained bridge and CSS cache tag from `video-organization-v9`
  to `video-organization-v10`.

## Files changed

- `studio/video-clip-management-bridge.js`
- `studio/studioflow-012-overrides.css`
- `studio/index.html`
- `scripts/stage-studioflow-authoritative.mjs`
- `scripts/verify/tpi-studioflow-022-media-organization.mjs`
- `scripts/verify/tpi-release-safety.mjs`

## Verification

- Node syntax check: PASS.
- Video Clips focused checks: PASS, 13/13.
- Media organization checks: PASS, 21/21.
- Release safety checks: PASS, 15/15.
- Authoritative StudioFlow build: PASS twice, reproducible output.
- Generated assets preserved: `index-qJRmDT77.js` and
  `index-TsnuK4Ub.css`.
- Guarded production dry-run: PASS.
- Public production smoke: PASS, 10/10.
- Deployed assets uploaded by the guarded Worker release included the updated
  bridge, shell, and CSS; no D1 migration or R2 mutation was performed.

## Release evidence

- Branch: `codex/tpi-development`
- Commit: `3ed53c8805d1ff338ab86e7e9c59ad4f1f420d94`
- Worker: `theparanormalinitiative`
- Production Worker version: `b41a8582-4558-4391-bf37-188049125853`
- Immediate rollback version: `f6b87433-5b35-466b-b536-b6ef1ec7fa2e`
- GitHub branch and local checkout matched after push.
- Working tree was clean after the application release.
- Crossroads of the Unknown and owner browser storage were not accessed or
  modified.

## Firefox Developer Edition acceptance

Codex did not reload the existing owner Firefox tabs, because reloading the
authenticated StudioFlow tab could affect protected owner state. In the
existing Firefox Developer Edition StudioFlow tab, press `Cmd+Shift+R` once.
Then confirm that Intro and Outro assigned cards show thumbnails without native
video/fullscreen controls, while clicking the left-side Intro or Outro scene
cards loads the corresponding video into the stage. General Video Clips should
still play on stage when clicked.

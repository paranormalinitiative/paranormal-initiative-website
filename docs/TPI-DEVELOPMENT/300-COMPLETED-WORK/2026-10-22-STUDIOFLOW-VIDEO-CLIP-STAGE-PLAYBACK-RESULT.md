# StudioFlow Video Clip Stage Playback — 2026-10-22

Status: DEPLOYED / SOURCE AND PRODUCTION BOUNDARY VERIFIED

## Objective

Extend the existing StudioFlow Video Clips area with six independent general
video cards. Clicking an assigned general clip must play it on the StudioFlow
stage. Intro and Outro remain separate identity slots and continue using their
existing scene behavior.

## Implementation

- Preserved the existing Intro Video and Outro Video slots.
- Added a sixth general clip slot, `Video 10`, without renumbering or deleting
  existing Video 5–9 metadata.
- Added stage playback through the maintained video bridge using the existing
  IndexedDB `studioflow-recordings` media bytes.
- Clicking a general clip plays it in the existing `.program-stage`.
- Added a `Play in stage` action to the general clip menu.
- General clip playback uses a temporary object URL and does not migrate,
  duplicate, or delete stored media.
- When playback ends, the temporary stage video is removed and the prior stage
  video is resumed when applicable.
- Added stage overlay stacking CSS so the playing clip is visible above the
  existing stage content.
- Bumped the StudioFlow bridge/style cache tag to `video-organization-v9`.

## Files changed

- `studio/video-clip-management-bridge.js`
- `studio/studioflow-012-overrides.css`
- `studio/index.html`
- `scripts/stage-studioflow-authoritative.mjs`
- `scripts/verify/tpi-studioflow-020-video-clips.mjs`
- `scripts/verify/tpi-studioflow-022-media-organization.mjs`
- `scripts/verify/tpi-studioflow-022-browser.mjs`
- `scripts/verify/tpi-release-safety.mjs`

## Verification

- Video clip checks: 13/13 passed.
- Media organization checks: 18/18 passed.
- Release safety checks: 15/15 passed.
- Authoritative StudioFlow build: passed twice; reproducible output confirmed.
- Generated assets preserved: `index-qJRmDT77.js` and `index-TsnuK4Ub.css`.
- Guarded Wrangler dry-run: passed.
- Public production smoke: 10/10 passed.
- Authenticated Firefox card-click acceptance: owner must hard-refresh the
  existing authenticated StudioFlow tab and visually confirm the stage result.
  The existing owner tab was not reloaded by Codex to protect Crossroads data.

## Release evidence

- Branch: `codex/tpi-development`
- Commit: `07aa0139035a2ab858ec4c21be02c56766b7d149`
- Worker: `theparanormalinitiative`
- Production Worker version: `f6b87433-5b35-466b-b536-b6ef1ec7fa2e`
- Deployment date: 2026-10-22
- GitHub branch and local checkout matched after push.
- Working tree was clean after the release.
- No D1 migration, D1 mutation, R2 mutation, Crossroads mutation, or owner
  browser-storage operation was performed.

## Firefox acceptance step

In the existing authenticated Firefox Developer Edition StudioFlow tab, press
`Cmd+Shift+R`. Open Video Clips and click an assigned general video card. The
clip should play in the stage. The three-dot menu also provides `Play in stage`.


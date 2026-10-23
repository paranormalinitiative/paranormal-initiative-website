# TPI-STUDIOFLOW-027 — My Scenes Media Connection Repair

Date: 2026-10-23
Project: The Paranormal Initiative — StudioFlow
Status: Deployed and live-verified

## Result

The existing My Scenes controls now resolve the assigned Intro Video, Outro Video, and Background Music for the currently selected Studio. Existing scene playback, program/monitor audio routing, automatic saving, restoration, and Studio switching remain in place.

## Root cause

The three connections shared a persistence-to-runtime failure:

1. The StudioFlow API normalizer removed `serverAssetId` from saved media assignments.
2. Workspace reads returned the saved configuration without rebuilding the authenticated, Studio-scoped `/api/studio/workspaces/{workspace}/media/{asset}` URL.
3. The React runtime and the Background Music soundboard path primarily accepted browser-local `previewUrl`/IndexedDB blobs. After a saved Studio was restored or opened in another browser context, the assignment could still exist in configuration but had no usable local blob and no remote URL.

This produced the same visible failure for Intro Video, Outro Video, and Background Music: the existing assignment was present, but the scene could not resolve playable media. Intro and Outro also relied on `previewUrl` for scene activation, while Background Music commands attempted local blob lookup even when the assigned asset was server-backed.

## Repair

- Preserved `serverAssetId` during API configuration normalization.
- Reconstructed a Studio-scoped authenticated `serverUrl` for persisted media assignments when workspace state is read.
- Added a shared runtime media URL resolution path that accepts either the existing local `previewUrl` or the existing server-backed `serverUrl`.
- Updated Intro and Outro scene activation, stage rendering, and playback to use the resolved assigned asset.
- Updated Background Music hydration, program/monitor rendering, volume handling, and audio-command playback to use the resolved assigned asset while retaining the local IndexedDB fallback.
- Preserved the existing audio command, program mix, and monitoring buses; no second player or alternate storage path was introduced.
- Missing Intro/Outro assignments continue through the existing empty-state/modal behavior instead of falling back to another asset.

## Existing assignment mechanism retained

The repair uses the existing Studio configuration in the D1-backed workspace state, the existing `studio_media_assets`/R2 media records and authenticated media route, the existing browser IndexedDB blob fallback, `workspace-bridge.js`, `workspace-asset-state-bridge.js`, and `audio-soundboard-bridge.js`. No media records were created, duplicated, migrated, or overwritten.

## Files changed

Authoritative StudioFlow source (`/Users/toddknipple/Documents/StudioFlow/web`):

- `src/App.tsx`

Source commit: `7888568a5ff1d1da65d888bc2afea3b241fb7774` (`fix(studioflow): resolve assigned studio media URLs`)

Canonical website repository:

- `functions/api/[[path]].js`
- `package.json`
- `scripts/verify/tpi-studioflow-027-scenes.mjs`
- `studio/index.html`
- `studio/assets/index-Tzq2r-El.js`

Deployed application commit: `eee0cff300e7e7b8196eae2e7c9e1db3522b9780` (`fix(studioflow): restore assigned scene media connections`)

## Validation

- Authoritative StudioFlow TypeScript/Vite production build: passed.
- Authoritative staging: passed; reproducible builds matched, generated assets matched the integrated candidate, and maintained media bridges were preserved.
- Focused TPI-STUDIOFLOW-027 contract: 10/10 passed.
- Existing TPI-STUDIOFLOW-021 audio soundboard checks: 54 checks passed.
- Integrity check: 21/21 passed; external requests 0; owner data accessed: false.
- Mandatory local auth lifecycle: passed before restart, after restart, after StudioFlow rebuild, and in isolated Firefox; 38 API checks per lifecycle phase and 60 browser checks.
- Release preflight: `READY`.
- Live anonymous production smoke: 10/10 passed.
- Live isolated Firefox Developer Edition acceptance: 60/60 passed, including independent Intro/Outro assignments, visible previews, Background Music/soundboard behavior, persistence, restore, Studio switching, and narrow-width usability.

## Release

Production deployment result: `DEPLOYED_AND_VERIFIED`
Worker: `theparanormalinitiative`
Deployed Worker version: `d6ee132b-59f6-4694-a64b-09d6de37d3e5`
Rollback version retained by the release workflow: `dcb6ad62-d496-44fc-bfa2-20be076f0617`

The application was deployed through the guarded source-to-live workflow. No production files or production database/media records were edited directly. This completion report is documentation-only and does not require a second no-op Worker deployment.

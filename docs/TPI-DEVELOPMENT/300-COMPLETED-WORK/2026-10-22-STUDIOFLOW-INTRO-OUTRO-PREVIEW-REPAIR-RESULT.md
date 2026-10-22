# StudioFlow Intro/Outro Preview Repair — 2026-10-22

Status: RELEASED TO PRODUCTION

## Problem

The assigned Intro and Outro cards showed `Video assigned · preview unavailable`
even though the workspace retained the historical `COTU INTRO.mp4` and
`CR Outro.mp4` assignments.

## Repair

- Kept the existing display-only Intro/Outro card design and left-side scene
  playback ownership.
- Hydrated previews from the existing `studioflow-recordings.recordingBlobs`
  IndexedDB store using both the stored asset key and the historical canonical
  keys `media-video-intro` and `media-video-outro`.
- Accepted cross-realm IndexedDB Blob values safely.
- Revealed a readable assigned video immediately after its local bytes are
  retrieved; thumbnail extraction is now best-effort and cannot hide a valid
  clip behind the fallback state.
- Preserved thumbnail generation from representative timeline frames when
  Firefox can decode them.
- Bumped the bridge cache tag to `video-organization-v11` so the live shell
  fetches the repaired bridge.
- Updated the authoritative staging and release-safety checks to use the same
  bridge cache tag.

## Files changed

- `studio/video-clip-management-bridge.js`
- `studio/index.html` (cache tag already included in the preceding release)
- `scripts/stage-studioflow-authoritative.mjs`
- `scripts/verify/tpi-release-safety.mjs`

## Verification

- `node --check studio/video-clip-management-bridge.js`: PASS.
- `git diff --check`: PASS.
- TPI-STUDIOFLOW-022 media checks: 25/25 passed.
- Release-safety checks: 15/15 passed.
- Crossroads data was not recreated, reset, edited, or used for destructive
  testing.

## Release evidence

- Branch: `codex/tpi-development`
- Application release commit before this final preview fallback correction:
  `a72fa7a6026166a4aebfd6fd27d286b219388a0c`
- Worker serving the cache-busted bridge: `34af5765-a8a6-4612-bc01-05a9d20f2da8`.

## Acceptance boundary

Firefox still displayed the fallback for the existing Crossroads records during
the read-only inspection. The source-level repair now exposes the video element
as soon as bytes are readable. If the fallback remains after the new release is
loaded, the protected Firefox profile does not contain readable bytes for the
historical metadata keys; restoring those owner media bytes would require a
separate owner-authorized recovery action and is not performed by this repair.

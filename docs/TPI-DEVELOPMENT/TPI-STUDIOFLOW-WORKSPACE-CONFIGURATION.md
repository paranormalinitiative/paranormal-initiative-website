# StudioFlow Workspace Configuration Contract

Status: ACTIVE / TPI-STUDIOFLOW-033

Last verified: 2026-10-24

This document records the supported per-Studio configuration fields that travel
through the StudioFlow workspace save and restore path. The authoritative
server boundary is `normalizeStudioWorkspaceState()` and its
`normalizeStudioConfiguration()` helper in `functions/api/[[path]].js`. Browser
media bytes remain in the existing local media store; workspace JSON stores
validated metadata and stable media references.

## Round-trip inventory

| Field | Origin / owner | API preserves | Server stores | Client hydrates | Scope | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `selectedBackground` | Background picker | Yes | Yes | Yes | Studio | Pass |
| `activeSceneId` | My Scenes | Yes | Yes | Yes | Studio | Pass |
| `showLogo`, `logoPlacement` | Branding controls | Yes | Yes | Yes | Studio | Pass |
| `styleSettings` | Branding/stage settings | Yes, validated | Yes | Yes | Studio | Pass |
| `widgetSettings` | Stage widgets | Yes, validated | Yes | Yes | Studio | Pass |
| `generalSettings` | General output settings | Yes, validated | Yes | Yes | Studio | Pass |
| `guestPermissionSettings` | Guest controls | Yes, validated | Yes | Yes | Studio | Pass |
| `studioScenes` | Scene editor | Yes, normalized | Yes | Yes | Studio | Pass |
| `sceneMusicAssignments` | Background Music / After Intro | Yes, stable `blobKey` | Yes | Yes | Studio | Pass |
| `bannerScrollTicker` | Ticker controls | Yes, validated | Yes | Yes | Studio | Pass |
| `programOrientation` (configuration) | Program output / bridge | Yes, supported scalar | Yes | Yes | Studio | Pass |
| `programOrientation` (state settings) | Program output / workspace state | Yes, supported scalar | Yes | Yes | Studio | Pass |
| `videoClips.intro`, `videoClips.outro` | Intro/Outro Video | Yes, stable asset metadata | Yes | Yes | Studio | Pass |
| `videoClipSlots` | Video Clips board | Yes, stable asset metadata and `slot` | Yes | Yes | Studio | Pass |
| `customBackground`, `customLogo` | Asset panel | Yes, stable asset metadata | Yes | Yes | Studio | Pass |
| `overlayAssets`, `activeOverlayId` | Overlay panel | Yes, validated | Yes | Yes | Studio | Pass |
| `backgroundMusic`, `backgroundMusicSlots` | Background Music board | Yes, stable asset metadata and `slot` | Yes | Yes | Studio | Pass |
| `backgroundMusicVolume`, `backgroundMusicLoop` | Background Music controls | Yes, validated | Yes | Yes | Studio | Pass |
| `customSounds`, `customSound`, `soundVolume` | Sound Effects board | Yes, validated | Yes | Yes | Studio | Pass |

Workspace `settings` also preserves `recordingDestination`, `keepLocalBackup`,
`saveAutomatically`, `recordBackstageAutomatically`, and
`resumeBackstageAfterShow`. The separate `recording` object preserves browser
library/session counts and storage mode. These fields are validated by the
workspace-state normalizer and are not arbitrary client keys.

## TPI-STUDIOFLOW-033 repairs

The server allow-list now preserves `videoClipSlots` and the configuration copy
of `programOrientation`. Asset-list normalization also retains the validated
zero-based `slot` value; without that, a board could retain the media metadata
but lose its pad arrangement.

The workspace bridge now converts the historical local-storage orientation
object (`{"resolution":"1080p","orientation":"portrait"}`) to the scalar
orientation required by the workspace state/API contract. The asset-state bridge
applies the same conversion when it merges local configuration into an
authenticated create or update request. When a saved Studio is activated, the
authoritative StudioFlow React state re-reads the restored program-output value
before the next save, preventing the previously active Studio's orientation
from being written back over the restored one.

Supported orientation values remain `landscape`, `portrait`, and `square`.
Invalid or omitted values use the established `landscape` default. No schema,
D1, R2, stable media identifier, or media storage migration was introduced.

## Verification

`npm run verify:studioflow-033-roundtrip` exercises the real local API and an
isolated Firefox Developer Edition session. The current run passed 26/26
checks, including server normalization, Video Clips metadata and slot
preservation, Background Music fields, stale-version rejection, browser
hydration, orientation control, refresh, Studio A/B switching, and isolation.

The browser fixture uses controlled metadata-only video assignments so the
configuration contract can be tested without creating media bytes. Existing
030/031 media upload and playback suites remain the coverage for the upload and
media-sync paths.


# StudioFlow Storage and Persistence

## Browser-local configuration

The current source stores a large portion of StudioFlow state in `localStorage`, including active broadcast and scene, broadcasts, destinations, profile, recording preferences, audio processing settings, resolution/orientation, guest permissions, RTMP destination, selected background/music, logos, overlays, style/widgets, custom sound, room guests, comments, private chat, notes, scenes, teleprompter scripts, and video clips.

This supports a local prototype and a convenient single-browser workflow. It does not provide account-level ownership, cross-device continuity, shared team state, server-side backup, or recovery after browser storage loss.

## IndexedDB

The application uses IndexedDB database `studioflow-recordings`, with a `recordingBlobs` object store for finalized recordings and uploaded custom media/avatars. This is an appropriate browser-local mechanism for larger blobs, but it remains device/browser scoped and subject to quota, eviction, private-mode behavior, and browser lifecycle limits.

## Export

The current App path uses `showSaveFilePicker` when available and otherwise falls back to download behavior for recording export. `googleDrive.ts` contains OAuth upload code, but the current App does not use it as the active recording path. Google Drive is therefore not evidence of current cloud recording persistence.

## TPI persistence

The TPI API and migrations provide D1 structures for room lifecycle and invite codes, plus a server-side RealtimeKit scaffold. The canonical StudioFlow frontend currently has no active D1/R2 calls for studio settings, recordings, or media libraries. The result is a split model: room metadata may be relayable through TPI, while the working studio, media, and recording state remain local.

## Required persistence work

Production persistence needs an explicit data model for users/owners, studios, broadcasts, scenes, destinations, media assets, recordings, retention, permissions, and deletion. Blob storage needs signed upload/download access, resumability, quota/retention policy, and recovery semantics. The browser should retain a safe offline/local mode, but it cannot be the only source of truth for a multi-device creator product.


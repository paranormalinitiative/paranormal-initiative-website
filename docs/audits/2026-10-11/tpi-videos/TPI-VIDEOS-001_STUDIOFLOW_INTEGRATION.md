# TPI-VIDEOS-001 StudioFlow Integration

## Current boundary

StudioFlow source is `/Users/toddknipple/Documents/StudioFlow/web` at `0622f27`. The TPI integration is represented in the TPI repository and production baseline at `e7b6be2` / deployment `5c1f0006-cce6-45ba-8ba0-628891c9f045`. Creator Studio remains owner-only; `/live-video` remains public Coming Soon. Real-world acceptance is deferred.

## What is preserved

- Camera, microphone, local recording, comments/overlay controls, guests, RTMP/prerecorded pathways, and connection guidance remain in the existing baseline.
- Creator-owned recording storage policy remains authoritative.
- No automatic publication or upload of a private StudioFlow recording is assumed.

## Required integration design

1. A creator explicitly chooses “publish to TPI” after recording finalization.
2. The flow creates or updates an authorized `tpi_videos` record, with an ownership proof and publication state.
3. The system stores only the approved destination reference unless a separate storage decision is made.
4. Live broadcasts use a distinct public playback record and explicit start/stop state; a private StudioFlow room is never public merely because it exists.
5. Completion, failure, retry, deletion, takedown, and recovery states are auditable.

No StudioFlow source was edited and no integration code was reopened in this audit.

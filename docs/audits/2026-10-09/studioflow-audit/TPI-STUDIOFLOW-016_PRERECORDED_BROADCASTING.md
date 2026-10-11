# TPI-STUDIOFLOW-016 — Pre-Recorded Video as a Live Broadcast Source

Status: IMPLEMENTED LOCALLY — READY FOR PROTECTED PRODUCTION PREVIEW

This directive adds a genuine local pre-recorded source to the existing StudioFlow broadcast path. It does not create a TPI-hosted video library, upload selected files to TPI, add OAuth integrations, or replace the existing Studio source.

## Architecture

- The Create Live Stream modal now supports `Studio` and `Pre-recorded video` source selection.
- A selected file is inspected in the browser before the broadcast is created.
- The selected Blob is retained in the browser's existing IndexedDB recording store under a broadcast-specific key. The active React state keeps a transient Blob reference so the first setup transition does not race the IndexedDB write.
- On reload, the saved broadcast metadata reloads the local Blob from IndexedDB. If the local file is missing, StudioFlow stops with an honest recovery message instead of silently substituting another source.
- The existing program compositor draws the decoded local video into the same canvas used by camera, screen-share, overlays, banners, widgets, and logos.
- The existing Web Audio program mix routes the pre-recorded video's audio into the same captured output stream.
- The existing MediaRecorder and local RTMP bridge continue to pace, package, and forward the compositor output. No direct file upload to an RTMP endpoint is used.

## Validation and supported formats

The browser checks readable metadata, positive duration, browser decode support, dimensions, MIME type, and the available audio-track signal. The interface prioritizes browser-decodable MP4/H.264/AAC media and also permits MOV/WebM only when the current browser reports that it can play the file. Unsupported or damaged media is rejected with a visible error.

Codec support is browser-dependent. StudioFlow does not advertise a format merely because its filename ends in `.mp4`, `.mov`, or `.webm`.

## Playback and broadcast behavior

- The selected file has a native preview with play, pause, restart, mute, progress, elapsed time, and total duration controls.
- Preview playback does not start a broadcast.
- Go Live uses the existing configured RTMP/RTMPS destination selector, including multiple saved destinations where the existing bridge supports them.
- The local test broadcast bypasses camera/microphone requirements because the video file is the active source.
- When the video reaches the end, StudioFlow stops that pre-recorded broadcast and shows a completion message. It does not silently loop or switch sources.
- Ordinary Studio broadcasts retain their existing camera, microphone, stage, recording, and live behavior.

## Scheduling

Schedule for later remains available and stores the timezone-aware start timestamp already used by StudioFlow. The current behavior is manual start: the creator opens StudioFlow and presses Go Live. Automatic unattended start remains explicitly unsupported because the browser and current Cloudflare Worker architecture do not provide a persistent video execution environment. No paid infrastructure was added.

## Storage and security

Selected video files remain creator-owned local data. StudioFlow does not upload them to TPI R2 or create a TPI-hosted recording library. Existing authentication and owner-only Creator Studio access remain unchanged. Stream keys remain in the existing local destination settings and are not rendered in the broadcast metadata or public pages.

## Verification evidence

Completed locally on 2026-10-10:

- `npx tsc --noEmit` — passed.
- `npm run build` — passed; only the existing Vite large-chunk warning remains.
- `npm run check:rtmp` — passed.
- `git diff --check` — passed.
- Browser workflow with a real isolated H.264/AAC MP4 — passed: source selection, metadata display, preview controls, setup transition, and local storage write.
- Existing local RTMP bridge workflow — passed: the compositor broadcast ran without camera access, ended when the video ended, and produced a captured FLV containing H.264 video at 1920×1080/30 fps and AAC audio. Captured duration was approximately 3.066 seconds.
- No public-provider broadcast was attempted. Local RTMP evidence is not evidence of successful YouTube, Facebook, Twitch, Rumble, LinkedIn, Instagram, X, Kick, or Vimeo delivery.
- Authenticated production interaction is not claimed until an owner/test session verifies it through the protected Creator Studio.

## Release evidence

- Canonical StudioFlow source commit: `3f17b58` — `Add pre-recorded video broadcast source`.
- TPI integration commit and Cloudflare deployment identifiers are recorded here after the protected release deployment.

## Outstanding integration requirements

- Verify an authenticated owner/test session in production.
- Verify a real external RTMP/RTMPS destination separately from the isolated local listener.
- Verify browser interruption, device sleep, network interruption, destination failure, and recovery messaging with a real owner session.
- Keep unattended automatic scheduling disabled until a persistent execution environment is separately approved and implemented.

# TPI-STUDIOFLOW-008C — Background Music empty-state guidance

Date: 2026-10-10  
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`  
Scope: local StudioFlow development only

## Implementation

- Preserved the existing Background Music upload, local IndexedDB persistence, playback, stop, volume, loop, and shared Program audio-mixer paths.
- Added explicit loading, empty-library, uploaded/selected-track, and actionable error states.
- Replaced the misleading empty-library text “Pick a track below to begin” with upload guidance explaining how creator music becomes available for recordings and live broadcasts.
- Kept the uploaded track below the **Upload Music** control and displayed its actual title when selected.
- Added browser decode validation so unsupported or unplayable files produce a direct upload error instead of entering the library as unusable media.
- Did not add a new media library, delete creator music, or create a second broadcast-audio path.

## Verification

Passed:

- TypeScript no-emit.
- Vite production build.
- `git diff --check`.
- Source inspection confirms the old “Pick a track below to begin” empty-state message is removed.

Not conclusively verified in this batch:

- Recording/export inclusion of background music.
- Local RTMP/broadcast inclusion of background music.
- Long-session levels, looping behavior under capture, or failure recovery after interrupted saves.

Isolated browser verification did provide evidence for empty guidance, valid WAV upload, selected track naming, playback, stop, reload persistence, and actionable rejection of an unsupported file. The recording/broadcast claims above remain unverified. No owner camera/microphone/recording session was touched.

## Documentation and boundary

Updated the canonical StudioFlow Production Bible, Desktop integration/readiness documentation, and this GitHub audit index/report. Existing history was preserved. No generated `/studio/` copy, production system, creator-owned music, deployment, commit, or GitHub push was changed.

## Owner acceptance checklist addition

In a device-enabled or synthetic-media browser session, verify an empty library, Upload Music, valid upload, track appearance and selection, play/stop, volume, loop, reload persistence, upload failure guidance, Program Recording playback/export, and local broadcast audio. Delete only isolated test media after verification.

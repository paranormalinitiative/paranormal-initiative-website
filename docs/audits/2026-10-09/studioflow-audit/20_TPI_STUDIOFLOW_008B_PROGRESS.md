# TPI-STUDIOFLOW-008B — Sounds simplification and creator uploads

Date: 2026-10-10  
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`  
Scope: local StudioFlow development only

## Implementation

- Reduced the default bundled sound catalog to **Heartbeat Fast — Pulse hit**.
- Removed Applause Intense, Bounce, Gong, and Drum Roll Bongos from the default visible catalog without deleting creator-owned files or recordings.
- Preserved the existing Sounds section and Upload sound control.
- Expanded the existing one-slot creator sound metadata into a local creator-owned list, while migrating the legacy `studioflow.customSound` entry and retaining the legacy key for older builds.
- Reused the existing IndexedDB `recordingBlobs` store; no new database or provider was introduced.
- Added MP3, WAV, M4A, AAC, and OGG type/extension checks plus browser decode validation before storage.
- Added creator sound play, stop, replay/switch behavior, rename, delete, and reload persistence controls.
- Kept creator effects on the existing `programSoundGainRef` and shared Program audio graph. No separate broadcast audio path was added.
- Hardened the existing blob loader to accept cross-realm Blob-shaped values returned by IndexedDB.

## Verification

Passed in an isolated local browser:

- Sounds section opens and Upload sound remains present.
- Only Heartbeat Fast remains in the bundled default catalog.
- Valid WAV upload succeeds.
- Valid MP3 upload succeeds.
- Unsupported JSON upload is rejected with visible format guidance.
- Creator sound entries remain visible after browser reload.
- Creator sound rename control works.
- Heartbeat playback enables the Stop sound control, and explicit stop returns it to disabled.
- TypeScript no-emit and `git diff --check` passed.

Not conclusively verified in this batch:

- Uploaded-file playback after reload in the embedded browser audio environment.
- Program Recording playback/export containing a creator sound.
- Local RTMP output containing a creator sound.
- Long sound switching, final audio levels, and multi-minute sessions.

No owner recording or microphone/camera permission was touched. The local browser test data was isolated from production and existing creator libraries.

## Documentation and boundary

Updated the canonical StudioFlow Production Bible, Desktop integration/readiness documentation, and this GitHub audit index/report. Existing documentation history was preserved. No creator-owned production asset, recording, database, generated `/studio/` output, deployment, commit, or GitHub push was changed.

## Next acceptance steps

In a device-enabled or synthetic-media browser session, upload a valid creator sound, play and stop it while the Program compositor is active, record and play back a Program recording, export it, capture local RTMP audio, switch between two sounds, reload, and delete only the isolated test assets.

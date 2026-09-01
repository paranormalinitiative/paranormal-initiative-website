# StudioFlow Readiness Audit

Last updated: September 1, 2026

## Bottom Line

StudioFlow is a substantial visual and local-production prototype. It is not yet a finished live studio.

The strongest part is the host-side browser studio: camera and microphone capture, screen sharing, scenes, layouts, branding controls, a hidden program compositor, local Program Recording, separate Backstage Recording, and a local Library are implemented far enough for controlled physical testing.

The largest missing parts are production remote guests, program-accurate cloud livestreaming, reliable long-session recording and recovery, real cloud persistence, and replacement or removal of visible placeholder controls.

## Status Definitions

- **Working locally — needs physical test:** implemented in source and builds successfully, but not yet proven with the required camera, microphone, browser, duration, and playback tests.
- **Partial:** some real behavior exists, but important parts are missing or local-only.
- **Placeholder:** the control is visible but does not perform the complete action it advertises.
- **Backend scaffold only:** website API/database code exists, but StudioFlow does not call it.
- **Not implemented:** no usable production path exists.

## Current Readiness Table

| Area | Status | What is actually present | What is still needed |
| --- | --- | --- | --- |
| Member access | Working | Signed-in members can open `/studio/`; unauthenticated visitors see the membership gate. | Confirm Todd's normal login remains valid across Safari/Chrome and tablet sessions. |
| Home and navigation | Working locally — needs physical test | Home, Library, Destinations, Teleprompter, Setup, Studio, and Guest routes exist. | Remove misleading items and confirm responsive layouts. |
| Camera and microphone | Working locally — needs physical test | Permission request, device lists, preview, mute/camera toggles, and mic meter exist. | Test real devices, permission recovery, device switching, unplug/replug, Safari, and Chrome. |
| Screen sharing | Working locally — needs physical test | Browser `getDisplayMedia` start/stop and program-stage display exist. | Verify screen audio, source changes, cancellation, and saved output. |
| Speaker selection | Partial | Speaker devices can appear in the selector. | Route remote audio with `setSinkId` where supported and make the Test button work. |
| Scenes and layouts | Partial | Scene creation, rename, duplicate, delete, selection, and eight layout choices exist. | Verify every layout in both visible preview and recorded/live compositor with real participants. |
| Program compositor | Partial but substantial | A 1920x1080 canvas at 30 FPS draws camera, screen, staged local guests, backgrounds, branding, comments, banners, and widgets. | Prove preview/output parity, add configurable resolution/orientation, finish all media/audio paths, and test long sessions. |
| Program Recording | Working locally — needs physical test | Browser MediaRecorder records the compositor in one-second chunks and saves the finalized WebM blob to IndexedDB/Library. | Persist chunks during recording, add recovery, explicit preparing/finalized states, duration tests, audio-sync tests, and truthful resolution/file controls. |
| Backstage Recording | Partial | Separate host camera/mic recording, auto-stop for Program Recording, optional resume, and separate Library item exist. | Confirm state transitions, long sessions, failures, exit handling, and intended guest/backstage composition. |
| Recording Library | Partial | Local IndexedDB storage, metadata, preview, thumbnail, and WebM download exist. | Add recovery, storage reporting, cleanup controls, multiple browsers/devices, R2 upload, and verified export formats. |
| Intro/outro video | Partial | Local MP4 upload, storage, playback, and visual compositor drawing exist. | Mix clip audio into Program Recording/live output and verify playback synchronization. |
| Logos and overlays | Working locally — needs physical test | Local upload, persistence, placement/show-hide, visible stage, and compositor drawing exist. | Verify output parity and build full multi-asset management. |
| Backgrounds | Partial | Built-in selections and one local custom background slot exist. | Build a real saved background library and verify every background in output. |
| Sound effects | Partial | Generated effects, one custom sound, volume, and program audio mixing exist. | Build a multi-sound library and verify levels/synchronization. |
| Background music | Partial | One local music item, preview controls, volume, and program/RTMP audio mixing exist. | Build a library, add ducking/fades if wanted, and verify recording/live levels. |
| Banners | Working locally — needs physical test | Manual lower-third banners can be shown in preview and compositor output. | Verify layouts/mobile controls and add reusable organization if needed. |
| Comments | Placeholder/partial | Manual local test comments can be placed on screen. | Connect real platform comments later; label these as manual comments until then. |
| Private chat | Placeholder | Messages are stored only in the host browser's localStorage. Guests do not receive them. | Implement real room chat through the production guest backend or relabel as private host notes. |
| Notes | Working locally | Private show notes persist in the current browser. | Add show-specific organization and cloud persistence if required. |
| Teleprompter | Partial but usable locally | Script library, editing, import/export, countdown, scroll, speed, size, line height, mirror, and in-studio modal exist. | Add camera-reading layout/overlay and cloud persistence; physically test during recording. |
| Settings — General | Placeholder-heavy | Resolution/orientation and several switches are visible. | Connect them to the media constraints/compositor or remove them. Output is currently fixed at 1920x1080 landscape. |
| Settings — Camera | Partial | Device selection and mirror work. | Resolution selector and restrictive-firewall mode do not control production behavior. |
| Settings — Audio | Placeholder-heavy | Mic selection and meter work. | Speaker Test, echo/noise/auto-gain settings, mic volume, and stereo behavior must be connected. |
| Settings — Visual effects | Placeholder | Background/filter/effect controls are visual options only. | Implement real processing or replace this panel with an honest unavailable state. |
| Settings — Recording | Partial | Backstage auto-record/resume preferences work. | Per-participant local recording is not implemented; advertised high-quality settings need truthful behavior. |
| Hotkeys | Placeholder | Shortcut labels are displayed. | Implement keyboard handlers, conflict protection, and editable/reset behavior. |
| Guest settings | Placeholder | Several StreamYard-style switches are visible. | Connect to real room permissions or remove them. |
| Remote guest links | Not production-ready | Guest setup and local invitation UI exist. Same-browser BroadcastChannel, a localhost room server, WebRTC, and public STUN are used for development. | Integrate RealtimeKit, production room tokens, remote media, reconnection, permissions, stage controls, kick/remove, and real two-network testing. |
| RealtimeKit backend | Backend scaffold only | D1 migration `0023`, room creation, guest token, close room, and livestream start/stop handlers exist in the website backend. | Confirm migration/configuration, add the frontend SDK, connect every room lifecycle action, deploy secrets, and run live tests. |
| Livestreaming | Not production-ready | A local Node/FFmpeg RTMP bridge accepts the compositor's WebM chunks and has first-pass reconnect logic. | Replace localhost dependency with a hosted production path and prove the live output exactly matches the Program compositor. |
| YouTube/Facebook/Rumble | Placeholder/partial | RTMP URL helpers and a Custom RTMP form exist. | Run private/unlisted destination tests; add verified settings and later OAuth only if useful. |
| On-Air webinar | Placeholder | A creation card and broadcast kind exist. | Remove it for now or build a complete private webinar workflow later. |
| Google Drive | Not configured | Upload code exists. | A Google client ID/OAuth configuration and real upload test are required; R2 may be the better primary StudioFlow library. |
| Cloud storage | Not implemented in frontend | None of the StudioFlow source calls D1/R2 storage APIs for studios, assets, or recordings. | Add reusable studio metadata, R2 media/recording uploads, retries, storage state, and cleanup rules. |
| Storage display | Misleading placeholder | Home currently says `Unlimited`. | Replace with real browser/R2 usage or remove it. |

## What Todd Can Safely Test Now

Do not use **Go live**, remote guest invitations, webinar, Google Drive, or platform destinations as production features yet.

The first useful test is a short host-only recording:

1. Sign in and open **TPI Studio**.
2. Choose **Recording** and give it a test name.
3. Connect the camera and microphone.
4. Enter the studio.
5. Click the host participant tile to place yourself on stage.
6. Add a logo and a banner.
7. Start screen sharing briefly, then stop it.
8. Play one sound effect and a short background-music sample.
9. Start **Program Recording** and record for two to three minutes.
10. Change at least two layouts while recording.
11. Stop recording and wait for saving to finish.
12. Open **Library**, play the result, and download it.

Record the result of these checks:

- Camera appears in the saved file.
- Microphone is audible and synchronized.
- Screen share appears and disappears correctly.
- Logo and banner appear.
- Layout changes appear.
- Sound effect and music are audible at sensible levels.
- The file plays from beginning to end.
- The downloaded WebM file also plays outside StudioFlow.

If any item fails, note the exact step, browser, and visible error. Do not repeat a long recording until the short test passes.

## Implementation Order From Here

### 1. Make the interface honest

- Remove or label webinar, Unlimited Storage, unconfigured Google Drive, fake platform connections, and placeholder settings.
- Keep only actions that perform real behavior during testing.

### 2. Finish dependable host-only recording

- Connect real resolution, orientation, camera, and audio preferences.
- Make Speaker Test work.
- Mix intro/outro clip audio.
- Persist chunks throughout the session and add incomplete-session recovery.
- Add navigation/exit protection while recording.
- Verify all eight layouts and every output-visible asset.
- Pass the two-minute test, then a 30-minute host-only test.

### 3. Connect Cloudflare RealtimeKit guests

- Add the supported frontend SDK.
- Connect the existing room APIs.
- Replace localhost signaling with production rooms.
- Test MacBook host plus tablet/second-network guest.

### 4. Finish program-accurate livestreaming

- Prove how the exact StudioFlow composite is published.
- Connect Custom RTMP and private/unlisted destination tests.
- Keep local recording independent from stream failure.

### 5. Add cloud persistence and recovery

- Reusable studios and media libraries.
- R2 recording upload after successful local finalization.
- Clear storage, retry, download, and deletion behavior.

## Current Automated Validation

Passed on September 1, 2026:

```text
npm run check:room
npm run check:rtmp
npm run build
node --check worker.js
node --check functions/api/[[path]].js
```

These checks prove syntax and compilation only. They do not prove camera, microphone, recording quality, guest connectivity, Cloudflare configuration, or livestream success.

## Initial Release Definition

StudioFlow is ready for Todd's real use only after all of the following pass:

- A 30-minute host-only recording with correct video and synchronized mixed audio.
- A live guest joining from another device and network.
- Host add-to-stage, remove-from-stage, and remove-from-room behavior.
- Guest screen sharing.
- A 30-minute private/unlisted livestream with simultaneous local recording.
- A forced stream interruption where the local recording remains intact.
- Library playback, download, persistence, and recovery.
- No visible control falsely advertising unavailable behavior.

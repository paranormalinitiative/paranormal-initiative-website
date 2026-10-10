# TPI-STUDIOFLOW-006 Development Report

Date: October 10, 2026  
Scope: Existing StudioFlow guest invitations, participant lifecycle, backstage/stage integration, and local guest-room reliability.  
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`

## BASELINE SOURCE

Development remained in the canonical StudioFlow source. The GitHub repository's generated `/studio/` directory was not used as a source and was not modified.

## BASELINE PRESERVATION

The working tree was already dirty before this directive. Existing camera, microphone, local Program Recording, Backstage Recording, IndexedDB recovery, Library, Present menu, PDF, Extra Camera, General settings, room-server, RTMP bridge, and prior guest work were preserved. No recordings, production data, Cloudflare data, database, deployment, commit, or GitHub push was changed.

## EXISTING GUEST ARCHITECTURE

The existing architecture remains: per-show code links, a guest route, localStorage/BroadcastChannel fallback, the development Node room server on `127.0.0.1:8788`, SSE/HTTP presence and signal relay, and browser WebRTC peer connections using the existing STUN configuration. No second guest system or new transport was created.

## INVITATION LINK GENERATION

**AUTOMATED / BROWSER VERIFIED.** The host Studio loaded the active room code and generated `/studio/guest/<code>?code=<code>`.

## INVITATION LINK COPYING

**IMPLEMENTED — NOT VERIFIED IN THIS BATCH.** The existing Copy action remains in the invite modal. No external message or email was sent.

## GUEST JOINING

**AUTOMATED / BROWSER VERIFIED** for the local room workflow. A separate guest tab validated the active code, accepted display name and headline, joined backstage, rejoined after host removal, and left normally. Invalid code input reached the ended/invalid state and did not expose join controls.

## GUEST CAMERA PERMISSIONS

**IMPLEMENTED — NOT VERIFIED** with physical or synthetic capture in this batch. The existing permission and device-selection UI is preserved. Capture acquisition now falls back to audio-only or video-only when a single device is unavailable; presence-only joining is allowed when neither device is available.

## GUEST MICROPHONE PERMISSIONS

**IMPLEMENTED — NOT VERIFIED** with physical or synthetic capture in this batch. Existing microphone controls and meters remain intact.

## GUEST PREVIEW

**IMPLEMENTED — NOT VERIFIED** with live media in this batch. The existing preview, mic meter, camera-off avatar, device selectors, and screen-share control remain intact.

## GUEST CONNECTION

**PARTIALLY IMPLEMENTED.** Local presence and the existing WebRTC offer/answer/ICE path remain in place. Signal delivery is now deduplicated across BroadcastChannel and relay paths, and early ICE candidates are queued until the matching peer description is installed. A no-media guest correctly remains a presence-only participant with `Waiting for media` status.

## MULTI-CLIENT CONNECTION TEST

**AUTOMATED / BROWSER VERIFIED** for two independent local browser tabs through the Node room server for presence, signaling activity, stage state, removal, rejoin, and leave cleanup. **NOT VERIFIED** for actual camera/microphone WebRTC media, because the isolated browser environment did not provide approved capture streams. No simulated participant tile was counted as remote media proof.

## PARTICIPANT IDENTITY

**AUTOMATED / BROWSER VERIFIED** for stable session identity, display name, optional headline, and rejoin behavior. The guest session identifier remained stable across host removal and guest rejoin in the same browser session.

## PARTICIPANT STATE SYNCHRONIZATION

**AUTOMATED / BROWSER VERIFIED** for presence arrival, room guest count, backstage state, stage state, removal, rejoin, and normal leave. Stale peer connections, remote streams, staged references, and consent state are now cleared when a guest leaves or disappears from the active presence list.

## BACKSTAGE MANAGEMENT

**AUTOMATED / BROWSER VERIFIED** for guest arrival, host People panel visibility, waiting-for-media status, add-to-stage, host removal, rejoin, and leave. The existing backstage recording consent UI and separate recording architecture were preserved.

## HOST CONTROLS

**AUTOMATED / BROWSER VERIFIED** for add to stage, remove from stage, and remove guest from session. Host removal now sends a targeted `guest-removed` signal to the affected guest before removing local/server presence. The host still does not claim physical control of a guest's microphone; guest mic state remains guest-controlled.

## GUEST STAGE INTEGRATION

**AUTOMATED / BROWSER VERIFIED** for local participant state: the host moved the guest from backstage to stage and back through the existing People controls without creating a second guest tile. Actual rendered remote video/audio placement remains unverified without capture media.

## PROGRAM/BACKSTAGE SEPARATION

**PARTIALLY IMPLEMENTED.** Existing staged-guest filtering and compositor separation remain intact, and backstage-only guest presence was not added to the staged compositor list. Pixel/audio proof using a real guest stream was not performed in this environment.

## GUEST AUDIO

**PARTIALLY IMPLEMENTED — NOT VERIFIED WITH LIVE GUEST MEDIA.** Existing guest audio tracks are added to the host peer connection and staged guest tracks feed the program audio mix. Duplicate signal delivery and stale connection defects were repaired. Guest speaking/mute/unmute, routing, feedback, and recording capture require a real media-client test.

## GUEST VIDEO

**PARTIALLY IMPLEMENTED — NOT VERIFIED WITH LIVE GUEST MEDIA.** Existing remote track rendering, stage tile assignment, camera-off avatar behavior, screen-share substitution, and compositor source selection were preserved. Actual remote frames and disconnect-frame cleanup require capture-enabled clients.

## GUEST RECORDING INTEGRATION

**PARTIALLY IMPLEMENTED — NOT VERIFIED.** Existing staged guest video/audio integration into Program Recording and separate Backstage Recording were preserved. No claim is made that a guest recording contains playable remote media until a capture-enabled multi-client recording test is completed.

## DISCONNECTION HANDLING

**AUTOMATED / BROWSER VERIFIED** for normal guest Leave and host removal, including prompt participant cleanup. Tab-close, permission loss, camera unplug, microphone unplug, and network-loss handling with live tracks remain unverified.

## RECONNECTION HANDLING

**PARTIALLY IMPLEMENTED.** A guest can rejoin after host removal using the same stable session identity, and failed/closed host peer connections are recreated rather than reused. ICE queuing supports connection setup races. Live network-loss reconnection with active media remains unverified.

## SECURITY/AUTHORIZATION

**PARTIALLY IMPLEMENTED / BLOCKED FOR PRODUCTION ACCEPTANCE.** The guest route does not expose host-only controls, and the host-removal signal is targeted to the affected guest. The local room server remains a permissive development relay. Existing TPI production relay documentation still records the unresolved room-code close/presence/signaling authorization concern; no production security change was authorized in this directive.

## FEATURES COMPLETED

- Targeted host removal notification and guest-side removal state.
- Signal deduplication across local channel and relay delivery.
- Early ICE candidate queues for host and guest peer setup.
- Stale peer, remote stream, staged reference, and consent cleanup.
- Host setup can enter Studio while devices are unavailable so device recovery can happen in Studio.
- Guest presence-only join plus audio-only/video-only capture fallback.
- Local browser verification of invitation, presence, backstage, stage, removal, rejoin, leave, and invalid-code workflows.

## FEATURES PARTIALLY COMPLETED

- Real guest audio/video remains dependent on capture-enabled multi-client testing.
- Cross-network connectivity, TURN, and production media provider/client integration remain open.
- Guest recording, audio routing/feedback, and output pixel/audio parity remain open.
- Production authorization hardening remains an owner-approved backend/security task.

## FILES MODIFIED

- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/src/useMediaDevices.ts`
- StudioFlow `PROJECT_STATUS.md`, `BUILD_PLAN.md`, and `TODO.md`
- Desktop TPI `STUDIOFLOW_MASTER_TODO.md`, `STUDIOFLOW_READINESS_AUDIT.md`, and `TPI_STUDIOFLOW_AND_SITE_REBUILD_PLAN.md`
- GitHub TPI `STUDIOFLOW_MASTER_TODO.md`, `STUDIOFLOW_READINESS_AUDIT.md`, and `TPI_STUDIOFLOW_AND_SITE_REBUILD_PLAN.md`
- This report: `16_TPI_STUDIOFLOW_006_PROGRESS.md`

## DEPENDENCIES ADDED

None. Existing dependencies, including the previously present PDF renderer dependency, were preserved.

## TESTS PASSED

- `npm exec tsc -- --noEmit` in canonical StudioFlow source.
- `npm run check:room`.
- `npm run check:rtmp`.
- `git diff --check` in canonical source.
- Isolated production build from a temporary copy: `npm run build` passed; the PDF worker and application bundle emitted successfully.
- Browser host/guest local-room pass: active invite generation and validation, guest presence/name/headline, backstage arrival, host stage transition, targeted removal, guest rejoin, normal leave cleanup, invalid-code rejection, and room signal activity.

## TESTS FAILED

- Canonical `npm run build` could not complete because restricted execution prevented Vite from writing its temporary `vite.config.ts.timestamp-*.mjs` file (`EPERM`). TypeScript completed; the same source built successfully from an isolated temporary copy.

## TESTS NOT PERFORMED

- Physical camera/microphone permission and guest preview.
- Actual guest camera/microphone WebRTC frame and audio transport.
- Audio-only/video-only acquisition with real devices.
- Cross-network/TURN connection, network-loss reconnect, tab-close reconnect, or device unplug.
- Guest media in Program Recording and Backstage Recording playback/export.
- Physical output parity, long-session recording, live broadcasting, webinars, native save picker, and production authorization exploit testing.

## REGRESSIONS IDENTIFIED

The existing local signaling path delivered the same signal through both BroadcastChannel and the room relay, allowing duplicate offer/answer/ICE processing. ICE candidates could also arrive before a remote description, and host removal did not notify the removed guest. These were confirmed by source tracing and addressed in this batch.

## REGRESSIONS REPAIRED

Signal IDs now prevent duplicate processing. Host and guest ICE candidates queue until descriptions are available. Failed/closed host peer connections are replaced. Leave/presence expiry clears remote state. Host removal sends `guest-removed`, and the guest displays a removal state and stops its media. Host and guest setup can proceed without requiring a camera and microphone pair.

## KNOWN LIMITATIONS

The local room server is an in-memory development bridge. The production TPI D1 relay carries presence/signaling metadata but is not a production media transport. The frontend still needs an approved production media provider/client integration, TURN, signed authorization, real cross-network tests, and guest recording acceptance. The local browser pass used no capture stream, so its WebRTC evidence is lifecycle/signaling evidence only.

## EXTERNAL INFRASTRUCTURE REQUIREMENTS

Production guest media requires a selected provider or an owner-approved direct WebRTC strategy, TURN relay coverage, room/session authorization, guest-limit enforcement, and independent host/guest devices/networks. These requirements were documented but not changed or deployed.

## FINAL OWNER ACCEPTANCE TESTS ADDED

- Open a fresh invite on a second physical device/browser and verify display name, camera, microphone, preview, and join.
- Verify guest audio/video reaches the host, remains backstage until added, appears in the selected layout when staged, and leaves Program when returned backstage.
- Verify host add/remove stage, remove-from-session, guest leave, refresh, network loss/reconnect, camera/mic denial, and device disconnect.
- Verify a Program Recording with a staged guest plays back with intended guest media and excludes backstage-only media.
- Verify guest audio routing, no echo/duplicate playback, and guest recording/export.
- Verify authorization boundaries and closed/expired invite behavior on the deployed production path.

## PRODUCTION BIBLE FILES UPDATED

Updated current status/plan/task documents in:

- `/Users/toddknipple/Documents/StudioFlow`
- `/Users/toddknipple/Desktop/paranormal-initiative-website`
- `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Historical reports 13, 14, and 15 were preserved. This report adds the next directive record without duplicating the documentation collections.

## REMAINING WORK

Complete capture-enabled multi-client media verification and repair any confirmed media defects. Then select and implement the approved production media transport/TURN/authorization path, followed by real cross-network guest recording and disconnect/reconnect acceptance. Preserve the open native PPTX/Keynote decision, physical dual-camera/output checks, native save-picker, 30-minute recording, live broadcasting, webinars, and other owner acceptance items.

## NEXT DEVELOPMENT PRIORITY

Run a capture-enabled isolated multi-client test or owner-approved local device test for actual guest audio/video, stage/backstage compositor separation, and guest recording. Do not promote or deploy the local fixes until that evidence and the production authorization decision are complete.

Deployment performed: **NO**  
GitHub push performed: **NO**  
Commit performed: **NO**

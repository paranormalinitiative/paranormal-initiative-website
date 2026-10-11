# TPI-STUDIOFLOW-017 — Pipeline Audit

Date: 2026-10-10 (America/New_York)  
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`  
Canonical source revision audited: `e40b876` (`Add branded destination selector logos`)  
Audit scope: isolated local development only; no production data, R2 object, or external provider was used.

## Executive result

The audit exercised the locally testable media path with generated media and a real browser session. The strongest verified path is:

`generated MP4 → browser pre-recorded source → StudioFlow canvas compositor → MediaRecorder WebM → local RTMP bridge → loopback RTMP receiver → FFprobe`

That path passed for a single destination, two simultaneous destinations, and an unavailable-destination failure case. A browser-driven pre-recorded broadcast also passed through the UI, auto-ended at end of source video, and created a local broadcast-history entry.

The audit did not establish production-provider delivery, authenticated production StudioFlow behavior, physical mobile-device behavior, unattended scheduling, multi-hour reliability, or real guest WebRTC media transport. Those remain explicitly unverified.

## Environment and evidence

| Item | Result |
|---|---|
| Node.js | `v22.22.3` |
| npm | `10.9.8` |
| FFmpeg | `/opt/homebrew/bin/ffmpeg`, `8.0.1` |
| FFprobe | `/opt/homebrew/bin/ffprobe`, `8.0.1` |
| Browser | Codex in-app browser, isolated local tab at `http://127.0.0.1:5182/?testMedia=1` |
| Browser automation package | No repository Playwright test suite; CUA browser automation was used for runtime interaction |
| RTMP bridge | `server/rtmp-bridge.mjs`, loopback `127.0.0.1:8787` |
| Room relay | `server/room-server.mjs`, existing loopback `127.0.0.1:8788` |
| Generated input | `/private/tmp/studioflow-017/synthetic-blue-6s.mp4` and `.webm` |
| Captured output | `/private/tmp/studioflow-017/received-single.flv`, `received-multi-a.flv`, `received-multi-b.flv`, `received-browser.flv` |
| Screenshot evidence | Browser AX/screenshot observations were captured in the audit session; no source screenshot was written into the repository |

Generated MP4 metadata: H.264, 640×360, 30 fps, AAC 48 kHz mono, 6.000 seconds, 105,996 bytes. Generated WebM metadata: VP8, 640×360, 30 fps, Opus 48 kHz mono, 6.024 seconds, 105,996 bytes.

## Pipeline results

| Pipeline | Result | Evidence and boundary |
|---|---|---|
| Camera initialization and frame delivery | PARTIAL | Browser enumerated FaceTime HD Camera and an iPhone camera in the isolated setup/studio. The browser session could not be credited with a separate fake-device frame test; owner-verified camera functionality remains separate. |
| Camera switching/interruption/recovery/removal | BLOCKED | No safe isolated fake-device harness or physical-device interruption test was available. |
| Microphone initialization and capture | PARTIAL | Browser enumerated MacBook Pro Microphone plus virtual inputs. No independent known-signal capture/analysis was completed in the browser. Owner-verified microphone functionality remains separate. |
| Audio gain/mute/mix/routing | PARTIAL | Browser program capture produced AAC stereo output through the compositor, but exhaustive mute, gain, clipping, leakage, and drift cases were not all run. |
| Guest signaling and presence | PASS | Room relay accepted a waiting guest, returned it in `/guests` and `/status`, accepted a `guest-offer` signal, and removed the guest. Non-waiting presence was correctly omitted by the relay’s waiting-room policy. |
| Guest WebRTC media transport | BLOCKED | A real two-browser offer/answer with camera/audio tracks was not completed in the isolated session. Signaling alone was not counted as media proof. |
| Canvas compositor / pre-recorded source | PASS | Browser selected the generated MP4, displayed `00:06 · 640 × 360 · video/mp4`, used the pre-recorded source in the existing compositor, and produced RTMP output. |
| Program overlays/layouts/ticker | PARTIAL | Source inspection confirms banner/ticker rendering is inside `drawProgramFrame` and `canvas.captureStream(30)`. The fresh RTMP capture verified the compositor path but did not separately assert every layout/overlay combination. |
| Single-destination RTMP | PASS | 6.037-second captured FLV contained H.264 640×360 video and AAC 48 kHz mono audio. |
| Multi-destination RTMP | PASS | Two independent loopback receivers each captured the same 6.037-second H.264/AAC output with matching dimensions and audio metadata. |
| RTMP destination failure | PASS | Unavailable receiver transitioned the session to controlled `error` with `The RTMP output process stopped unexpectedly.`; bridge health remained `ok` and FFmpeg remained available. |
| Browser-driven pre-recorded broadcast | PASS | UI created a local pre-recorded broadcast, entered Studio, started Go Live, showed the automatic `Pre-recorded video finished — broadcast ended` message, and returned to idle. Captured output: `received-browser.flv`. |
| Browser RTMP capture timing | PARTIAL | `received-browser.flv` was decodable for 6.067 seconds with 182 video frames and 283 audio packets. FFprobe/FLV reported a 1,000 fps stream time base/rate even though packet timestamps spanned ~6 seconds and frame count was consistent with ~30 fps. This needs follow-up before claiming strict output frame-rate metadata correctness. |
| Program recording | PASS | Browser started and stopped an isolated Program recording, saved it to local Library, and showed a playable 1920×1080 video with `readyState=4`, duration `10.995` seconds. |
| Recording checkpoint/recovery | PARTIAL | Source contains IndexedDB session/chunk checkpoints, reload recovery, cleanup, and fallback to in-memory chunks. A controlled browser termination/reload recovery was not performed in this audit to avoid interfering with active owner recordings. |
| Recording playback | PASS | Library video loaded as a decodable blob URL with nonzero dimensions and duration. |
| Recording download/export | PARTIAL | Download control was present and invoked in the Library, but the in-app browser did not expose a completed download path to the audit harness. External file integrity was therefore not claimed. |
| Folder/external-drive recording | BLOCKED | File System Access behavior requires an OS picker and physical folder/drive permission. No owner folder was opened or modified. |
| IndexedDB/local browser storage | PASS | Isolated browser Library showed 325 KB used after recording; recording and broadcast metadata survived navigation to Library. No TPI R2 upload path was invoked. |
| Storage exhaustion/failure recovery | BLOCKED | Deliberate quota exhaustion was not safe or necessary in the owner’s browser profile. |
| Scheduling/local persistence | PARTIAL | Create-live-stream UI exposed immediate/scheduled controls and the pre-recorded source persisted into the local broadcast record. DST, rescheduling, and unattended start were not executed. |
| Destination selector/manual RTMP | PASS | Browser selected Other Platforms / RTMP, saved a local destination, and used it in the live broadcast. Provider OAuth/API connections were not claimed. |
| Interruption/reconnect | PARTIAL | Destination failure was exercised at bridge level. Browser reconnect after a live network interruption and browser-process termination were not executed. |
| Long-duration stability | BLOCKED | Only a 6-second media path and a short isolated recording were run; no multi-hour claim is made. |
| UI/accessibility smoke | PASS | Create Live Stream, pre-recorded source selection, metadata, destination selection, Go Live, recording controls, Library, playback, and download control were visibly exercised. |
| Production security/access control | PARTIAL | Previous read-only production checks confirmed `/studio/` and direct assets remain protected and `/live-video` remains Coming Soon. An authenticated owner session was not available in this audit, so owner access and private API behavior remain unverified here. |

## Repairs

No new application repair was required by this audit. The previously implemented RTMP child-stdin/EPIPE hardening in canonical commit `9a6097e` was regression-tested: a failed destination produced a controlled session error and did not take down the bridge health endpoint.

## Release decision

This audit produced documentation and evidence only. No source-code change was made in the canonical StudioFlow checkout, so no new application bundle was promoted or Cloudflare code deployment was created from this directive. Existing owner-only production restrictions remain the release boundary.


# StudioFlow Media Pipeline

## Capture

`useMediaDevices.ts` acquires camera and microphone streams with browser permissions, device selection, fallback/re-acquisition, audio processing constraints, and an AudioContext-based microphone meter. It also supports display capture. The current source includes camera resolution choices and orientation state.

## Mix and composition

`App.tsx` builds a Web Audio mix using microphone, guest, music, and sound-effect sources. The program video is composed on a canvas. The compositor draws camera and screen-share content, staged guest video, backgrounds, logos, overlays, banners, comments, widgets, and nameplates. Current source contains speaker, split, grid, spotlight, screen, picture-in-picture, news, and cinema-style layout branches, along with landscape/portrait and several output resolutions.

## Program output

The program canvas is captured with `canvas.captureStream(30)`. For local recording, the result is sent to `MediaRecorder` as a WebM stream. For local streaming, WebM chunks are sent to the development RTMP bridge, which invokes FFmpeg. This is a workable prototype pipeline, but it is not a verified production output pipeline.

## Guest media

The current source contains host and guest `RTCPeerConnection` handling, offer/answer/ICE exchange, remote stream attachment, stage/remove controls, and guest camera/microphone/screen controls. The configured ICE set contains Google STUN only and no TURN service. Therefore, cross-network reliability is not established.

## Recording durability concern

Program recording accumulates approximately one-second `MediaRecorder` chunks in memory. When recording stops, the chunks are combined into a Blob and persisted to IndexedDB as a finalized recording. There is no durable chunk checkpoint during an active session. A tab crash, browser termination, storage failure, or finalization failure can lose the complete session.

## Pipeline assessment

The local media path is broad and technically credible. The unresolved production questions are transport selection, TURN/NAT traversal, output timing and acceptance, bitrate/codec policy, destination backpressure, reconnect behavior, crash-safe recording, and telemetry. None of those should be inferred from the presence of a working-looking UI or a successful TypeScript check.


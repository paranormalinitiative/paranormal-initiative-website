# TPI-STUDIOFLOW-017 — Failures and Repairs

## Verified defects found in this pass

No new application defect reached the threshold for a safe code repair. The canonical source remained clean at `e40b876` throughout the audit.

## Existing repair regression-tested

The RTMP bridge already contains the small repair from canonical commit `9a6097e`: child stdin errors are handled and chunk writes check whether the FFmpeg process is destroyed or ended. The audit sent generated WebM to an unavailable receiver at `127.0.0.1:1999`.

Observed result:

- session entered `error`;
- user-facing session error was controlled and did not expose raw FFmpeg logs;
- loopback bridge health still returned `ok: true`;
- no bridge process crash occurred.

This is a regression result, not a new commit.

## Partial result requiring follow-up

The browser-driven RTMP capture was valid and decodable, but FFprobe reported the video stream as `1000/1` fps with a 1/1000 time base. Packet timestamps covered approximately 6 seconds and the capture contained 182 video frames, which is consistent with the intended 30 fps source path, but strict output frame-rate metadata should be investigated before production claims about frame-rate fidelity.

No repair was applied because the evidence does not yet isolate whether the metadata is introduced by MediaRecorder timestamps, canvas capture, the bridge encoder, or the FFmpeg FLV muxer. The next safe step is an isolated timestamp/encoder comparison using a longer browser capture and intermediate WebM inspection, without touching production.

## Tooling limitations

- The repository has no automated Playwright test package or media fixture harness.
- The first local-listener attempt was sandbox-blocked; the authorized loopback-only retry succeeded with filesystem/network escalation.
- The in-app browser did not return a completed download path for the Library Download button, so external export integrity is not marked PASS.
- Physical iPhone/iPad/Android, native Files/share, external-drive, and provider OAuth/API tests were not performed.

## Unverified behavior that must remain unverified

- Real guest WebRTC audio/video transport between two browser sessions.
- Camera/microphone interruption, permission denial, device removal, and recovery in a controlled fake-device harness.
- Reload/process-termination recording recovery while a recording is active.
- Storage exhaustion and native folder finalization.
- Multi-hour memory, CPU, dropped-frame, and A/V drift behavior.
- RTMPS and real external-provider delivery.
- Authenticated owner production StudioFlow interaction and unauthorized direct API checks.

## Scope protection

No TPI production database, Cloudflare R2 object, recording-storage bucket, credential, or unrelated dirty file was changed. No new StudioFlow source or generated application bundle was committed, pushed, or deployed from this audit. The required audit documents are documentation-only output.


# StudioFlow Completion Roadmap

## Stage 0 — Truthful baseline and security gate

Document current supported behavior, label local/development controls, remove misleading completion signals, and reproduce/review the room-code close and guest-relay authorization findings. Freeze the release contract before adding more surface area.

Exit evidence: accepted capability matrix, security decision, clean static checks, and a test plan with named artifacts.

## Stage 1 — Minimum usable host-only release

Support camera/microphone capture, screen share, scenes/layouts, branding, local Program Recording, playback, and download/export. Focus on the normal host path and make unsupported guest/live/cloud controls clearly unavailable.

Exit evidence: desktop/tablet/phone smoke matrix, permission/device recovery tests, recording/export acceptance, browser refresh/reopen behavior, and truthful UI review.

## Stage 2 — Durable recording and local operational reliability

Add crash-safe recording checkpoints, recovery/finalization, quota/retention handling, long-session limits, structured logs, and failure recovery. Validate program audio/video output and all supported resolutions/orientations.

Exit evidence: interrupted-session recovery, storage-pressure test, long-session test, export integrity check, and documented support diagnostics.

## Stage 3 — Production guest rooms

Complete RealtimeKit frontend integration or harden WebRTC with TURN, secure signaling, host admission, backstage/stage/remove, guest permissions, screen share, leave/rejoin, reconnect, and cross-network tests.

Exit evidence: two-browser/two-network matrix, device matrix, host/guest lifecycle logs, unauthorized-action tests, and an accepted transport SLO/failure policy.

## Stage 4 — Production broadcast output

Replace the localhost FFmpeg dependency with the selected production output architecture. Implement destination secret handling, program-accurate output, start/stop/status, retry/backpressure, and a private/custom destination acceptance path before native platform adapters.

Exit evidence: destination start/stop, failure/retry, reconnect, output sync, secret isolation, and operator status tests.

## Stage 5 — Cloud persistence and reusable studios

Persist studio/broadcast/scene/destination metadata in D1, media and recordings in durable blob storage, and implement signed access, retention, deletion, quota, cross-device reopen, and recovery. Keep local/offline behavior explicit.

Exit evidence: fresh-device login/reopen, asset and recording restore, permission isolation, deletion/retention, and backup/recovery tests.

## Stage 6 — Optional expansion

Only after the core release gates pass: native YouTube/Facebook/Rumble integrations, audience chat ingestion, guest destinations, webinar workflows, scheduled/pre-recorded streaming, participant-isolated recordings, and advanced visual effects.

## OpenCode recommendations

OpenCode should be used as a recommendation and review aid only. It may help produce implementation checklists, test-case drafts, threat-model questions, and alternative architecture comparisons. It should not be treated as authority for completion, should not independently mutate StudioFlow, and should not substitute for owner-approved changes, current source checks, physical runtime evidence, or production acceptance.

## Roadmap conclusion

The shortest credible route is host-only recording first, then durable recording, then guests, then live output, then cloud persistence. This sequencing follows the current risk concentration and preserves StudioFlow’s independent product identity.


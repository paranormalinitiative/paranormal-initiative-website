# QA Defect Register

## Resolved in TPI-QA-001 bootstrap

| Item | Cause | Resolution | Verification |
|---|---|---|---|
| Contributor article list expectation | Existing E2E expected `200` for an ordinary member, while the endpoint correctly requires contributor authorization | Updated expected result to `403` and clarified the assertion name | Full local suite 152/0 |
| Notification unread count assertions | Harness read `count`; API returns `unreadCount` | Updated all affected assertions to use `unreadCount` | Full local suite 152/0 |
| External scraper refresh in default regression | Live provider calls could hang and made the default suite nondeterministic | Made live scraper checks opt-in via `TPI_E2E_LIVE_SCRAPERS=1` | Default suite completes locally; opt-in remains separate |

## Open / not defects until reproduced

- Actual StudioFlow media transport, physical-device behavior, and external-provider output lack a reusable automated lab.
- Existing StudioFlow build chunk-size warning is recorded as a performance follow-up, not a release failure.
- Long-duration recording and native folder-picker behavior remain owner/device verification items.

## TPI-STUDIOFLOW-019 audit disposition

- No reproducible StudioFlow runtime defect was found in the 019 local audit.
- The audit did not alter camera, microphone, recording, compositor, storage,
  authentication, database, or R2 code.
- The prior local RTMP FLV `1,000 fps` metadata anomaly remains an open
  fidelity investigation; it was not changed speculatively.
- Recording reload/process recovery, download-byte FFprobe verification,
  physical/native storage workflows, external provider output, guest WebRTC
  media, webinars, authenticated production Studio interaction, and long
  sessions remain **NOT YET VERIFIED**, not defects.

## TPI-STUDIOFLOW-019A disposition

- Confirmed defect: a synthetic prerecorded MP4 with a known 440 Hz tone
  reaches the local program/RTMP pipeline with video and an audio stream, but
  the captured audio is effectively silent under FFmpeg `astats` analysis.
- A narrow mute-state source hypothesis was tested and failed a repeated
  end-to-end capture; the edit was reverted. The defect remains open and was
  not deployed.
- The existing ticker passed actual local RTMP and saved-recording visual
  inspection. This does not close the audio, strict WebM validation, guest,
  physical storage, responsive, production, or external-provider gaps.

## TPI-STUDIOFLOW-023 disposition

- Repaired in canonical StudioFlow: opt-in automatic live-comment queue,
  visible-status filtering, 5/8/10/15-second display duration, manual host
  override, starred filter, host reply, explicit moderation control, and stale
  hidden-comment compositor protection.
- Local build, focused browser UI, isolated RTMP H.264/AAC capture, and
  production anonymous boundary smoke passed. Authenticated production
  comment/media capture, multi-member guest transport, physical devices,
  external providers, long duration, and storage exhaustion remain NOT YET
  VERIFIED.
- The expanded local API E2E runner was canceled after becoming silent during
  its local Wrangler startup path; no pass was recorded.

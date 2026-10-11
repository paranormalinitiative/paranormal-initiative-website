# QA Dashboard

Last updated: 2026-10-11

## Current release-health snapshot

| Gate | Result | Evidence |
|---|---|---|
| TPI syntax and shell checks | PASS | `scripts/qa/run-qa.mjs` baseline |
| TPI local social regression | PASS — 152/152, 0 failures | `scripts/e2e/api-e2e.sh`, external scrapers disabled |
| StudioFlow build | PASS | `npm run build` in canonical web workspace |
| StudioFlow room/RTMP syntax | PASS | `npm run check:room`, `npm run check:rtmp` |
| Anonymous production boundary smoke | PASS — 10/10 | `scripts/qa/production-smoke.mjs`, read-only GETs |
| Actual StudioFlow media pipelines | PARTIAL | 019 real local recording plus prior 017 local RTMP/FFprobe evidence; see coverage matrix |
| Physical devices and external providers | NOT YET VERIFIED | owner/device/provider testing required |
| Production deployment for this QA batch | PASS — Cloudflare version 152f752a-0dd1-46aa-8fae-884bed496e19 | TPI integration commit 101b834 pushed; anonymous post-deployment smoke 10/10 |
| TPI-STUDIOFLOW-023 implementation | PASS locally / release pending | automatic live-comment queue and host controls built in canonical StudioFlow; authenticated media acceptance remains open |
| TPI-STUDIOFLOW-023 production boundary | PASS — 10/10 anonymous smoke | /studio/ denied, /live-video Coming Soon, private APIs protected |
| TPI-VIDEOS-002 creator publishing/security | PASS locally — 171/171 | migration-backed draft privacy, ownership, provider validation, channel, and lifecycle checks |
| TPI-VIDEOS-002 production boundary | PASS — 10/10 standard smoke; 5/5 video-specific checks | Cloudflare version 165b50e5-0e84-4179-ad33-208173095123; owner-authenticated workflow remains open |

## Readiness interpretation

The automated QA system is established and the deterministic local social baseline is green. That does not certify camera, microphone, WebRTC guest transport, public broadcast, physical storage pickers, cloud-provider integrations, or multi-hour reliability. Those remain visible in the matrix until executed with evidence.

## TPI-STUDIOFLOW-023 note

The 023 batch adds a small authenticated live-interaction control surface and
does not rebuild StudioFlow. The local API E2E runner was not allowed to hang
indefinitely; it was canceled after silent local Wrangler startup and is
recorded as incomplete. The full 023 matrix in the StudioFlow documentation is
the authoritative status record.

## Evidence locations

- Baseline JSON reports: `docs/quality-assurance/reports/`.
- Detailed social assertions: `scripts/e2e/api-e2e.sh`.
- StudioFlow status and owner verification: `/Users/toddknipple/Documents/StudioFlow/PROJECT_STATUS.md`.
- 019 feature inventory and test reports: `/Users/toddknipple/Documents/StudioFlow/TPI-STUDIOFLOW-019_*.md`.

## TPI-STUDIOFLOW-019 audit note

The local audit connected the available camera and microphone, finalized a
28-second Program recording in Browser Storage, exercised the existing ticker
setting during that recording, and inspected the Library playback/download
surface. This is local browser evidence and remains distinct from the owner's
separate **OWNER VERIFIED — WORKING** statement. It does not verify external
providers, authenticated production interaction, physical devices, guest media
transport, webinars, or long-duration reliability.

## TPI-STUDIOFLOW-019A pipeline verification note

The 019A local media pass captured the existing ticker in an actual 1920x1080
local RTMP output and in a downloaded Program-recording frame. A synthetic
prerecorded source with a known 440 Hz tone produced video and an audio stream,
but the received audio measured effectively silent. This is an open confirmed
prerecorded-audio defect, not a passing audio result. Recovery-to-Library was
exercised with browser-generated chunks; strict external validation of the
concatenated WebM download remains partial. The attempted narrow runtime repair
was reverted after it failed the repeat capture, so this QA batch has no runtime
deployment. Full evidence is in the four
`/Users/toddknipple/Documents/StudioFlow/TPI-STUDIOFLOW-019A_*.md` records.

## TPI-VIDEOS-002 note

The TPI-VIDEOS-002 batch repairs authored-video draft exposure and unsafe embed
acceptance, then adds a draft-first contributor publishing/channel foundation.
The local suite passed 171/171. External provider accounts and authenticated
production creator acceptance remain separate verification items.

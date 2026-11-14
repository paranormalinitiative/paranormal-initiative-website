# QA Dashboard

## Current member-access release snapshot — 2026-11-14

Password storage modernization is deployed and live verified in release
`rel-710b6c9126f5-dedd127c76c8`, Worker
`6c84d19b-6e50-4d5d-a6d7-75da5152cf12`, at 100% traffic. New and changed
credentials use salted PBKDF2-SHA-256 with 120,000 iterations. Legacy SHA-256
records verify and upgrade after successful login through a guarded
compare-and-swap write; no bulk production rewrite was performed.

| Gate | Result | Evidence |
|---|---|---|
| Password-hash compatibility and upgrade | PASS — 9/9 | `npm run verify:password-hash` |
| Password recovery API | PASS — 23/23 | `npm run verify:password-recovery` |
| Legacy Admin/staff-role compatibility | PASS — 20/20 | maintained staff-role regression |
| Full certified preflight | PASS — 35 gates | immutable candidate `710b6c9126f5` |
| Production smoke | PASS — 10/10 | read-only anonymous checks |
| Production Firefox | PASS — 65/65 | isolated synthetic production QA account |
| Real mailbox delivery and failure alerting | NOT YET VERIFIED | high-priority recovery-delivery observability item |

The historical November 11 and October QA sections below remain dated evidence,
not the latest production release record.

## Current website release snapshot — 2026-11-11

The most recent deployed application evidence is the November 11 member profile and
transparent Founding Membership releases. Their focused suites, release gates, and
production results are recorded in the corresponding completion records under
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/`. A separate site consistency audit is
complete: shared asset versions are aligned across 237 in-scope HTML pages, its
regression check passes, and its guarded production release completed with 30/30
preflight gates, 10/10 anonymous smoke checks, and 65/65 isolated Firefox checks. See
[`TPI-WEBSITE-COMPLETENESS-AND-CONSISTENCY-AUDIT.md`](../audits/2026-11-11/TPI-WEBSITE-COMPLETENESS-AND-CONSISTENCY-AUDIT.md).

This dashboard's table below is the historical October 11 QA batch, not a live view of
all current feature status. Do not use its dated release IDs or PASS counts as evidence
for later source commits. Open provider/device, authenticated owner, full social, and
administrative acceptance gaps remain tracked below and in the QA inventory.

Historical batch last updated: 2026-10-11

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
| TPI-VIDEOS-003 discovery/social | PASS locally — 181/181 | migration-backed discovery, follows, Community share, threaded comments; production member workflow remains open |
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

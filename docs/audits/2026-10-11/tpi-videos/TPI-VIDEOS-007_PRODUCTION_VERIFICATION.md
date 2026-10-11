# TPI-VIDEOS-007 Production Verification

Verified: 2026-10-11 after Cloudflare Version
`66aeea64-4f39-4ead-b7dd-239804ce4fa8`.

Read-only checks covered:

- `https://paranormalinitiative.com/tpi-videos.html`
- a production watch-page shell
- `/live-video` remaining Coming Soon
- anonymous `/studio/index.html` remaining denied
- anonymous private API access remaining denied

| Check | Result | Evidence |
|---|---|---|
| Deployed player asset | PASS | `GET /tpi-video-player.js?v=1` returned 200 `text/javascript`; resolver markers present |
| Watch-page shell | PASS | `GET /tpi-video.html?id=scraped-3033` redirected 307 to `/tpi-video?id=scraped-3033`, then 200; helper loaded |
| Actual production watch rendering | PASS | Browser showed the Odysee record as “Playback unavailable here” plus validated “Watch on Odysee”; no fake player |
| Public `/live-video` | PASS | HTTP 200 and page contains “Coming Soon” |
| Anonymous `/studio/index.html` | PASS | HTTP 403 |
| Anonymous private API | PASS | `GET /api/notifications` returned 401 |
| Public creator catalog | PASS / LIMITATION | HTTP 200 with `videos: []`; no creator-authored playback rows exist to exercise |

The production catalog check found zero published creator-authored rows
(`source=creator`). Therefore production cannot honestly be reported as
creator-recording playback verified. External discovered rows remain
source-owned records and use the approved external fallback, not a fake native
player.

The final deployment identifier and endpoint results are also recorded in
`TPI-VIDEOS-007_RELEASE_REPORT.md`.

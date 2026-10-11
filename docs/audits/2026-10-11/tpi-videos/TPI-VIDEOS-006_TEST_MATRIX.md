# TPI-VIDEOS-006 Test Matrix

| Area | Method / environment | Result | Evidence or limitation |
|---|---|---|---|
| Git/source baseline | Read-only inspection of canonical TPI and StudioFlow repos | PASS | Commits and dirty-file boundaries recorded in `BASELINE.md`. |
| TPI API/security regression | Local Wrangler D1, seeded isolated sessions | PASS 211/211 | `scripts/e2e/api-e2e.sh`; scrapers disabled. |
| 005 stable sync identity | Local API | PASS | Repeated create returned existing identity. |
| 005 schedule update/reschedule | Local API | PASS | Current-revision update advanced revision. |
| 005 publication/unpublication | Local API | PASS | Explicit publication and unpublication verified. |
| 005 cancellation | Local API | PASS | New regression covers cancellation, discovery removal, stale retry. |
| 005 conflict protection | Local API | PASS | Stale update/publication/cancellation returned 409 snapshots. |
| 005 offline persistence | Source inspection | PARTIAL | Pending operation/retry state exists; real browser interruption/reload not run. |
| StudioFlow TypeScript/Vite build | Canonical StudioFlow workspace | PASS | `npm run build`; existing chunk warning only. |
| Room/RTMP bridge syntax | Canonical StudioFlow workspace | PASS | `npm run check:room`, `npm run check:rtmp`. |
| Local RTMP media | Synthetic FFmpeg input and local receiver | PASS | FFprobe: H.264/AAC, 640×360, 6.037 seconds. |
| External provider playback | Legitimate public provider | NOT VERIFIED | No authenticated provider/player evidence. |
| Production pages/APIs | Read-only HTTPS requests | PASS | Homepage, TPI Videos, watch/channel shells, discovery, comments/reactions, feed, broadcasts. |
| Production access gates | Read-only HTTPS requests | PASS | `/studio/index.html` 403; `/live-video` 200 Coming Soon; notifications 401. |
| Authenticated production creator UI | Browser session | NOT VERIFIED | No authenticated owner/contributor session available. |
| Physical mobile/tablet | Real devices | NOT VERIFIED | No physical device test performed. |
| Keyboard/screen-reader audit | Browser accessibility tooling | NOT VERIFIED | Playwright is not installed in this checkout. |
| Long-duration broadcast | Extended runtime | NOT VERIFIED | No multi-hour claim made. |
| Production database/R2 safety | Read-only scope review | PASS | No D1 migration, R2 write, recording upload, or production fixture used. |

The earlier 005 release report's 207-check baseline is historical. The current
suite is 211/211 because this audit added four cancellation assertions.

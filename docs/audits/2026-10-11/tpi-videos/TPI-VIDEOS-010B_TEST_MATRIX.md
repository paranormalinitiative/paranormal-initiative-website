# TPI-VIDEOS-010B Test Matrix

| Pipeline / area | Method and environment | Result | Evidence / limitation |
|---|---|---|---|
| TPI duration/date/grid/player | Focused local regressions | PASS | Prior 010 release evidence |
| TPI API suite | Local Wrangler runner | PASS 213/213 in prior accepted run | Current full runner attempt hung before assertions |
| StudioFlow build | Canonical local source, production build | PASS | No source change |
| Room checks | Canonical local source | PASS | `npm run check:room` |
| RTMP checks | Canonical local source | PASS | `npm run check:rtmp` |
| Program recording | Isolated browser, `?testMedia=1`, 5183 | PASS | 14-second Library item |
| Local playback | Native video metadata and rendered controls | PASS | 13.965s, 1920×1080, readyState 4 |
| Download/export | Isolated browser Download control | PARTIAL | Click exercised; harness exposed no file path |
| Checkpoint recovery | Existing isolated browser-generated WebM evidence | PASS | 8s/15s recovery and failure-retention evidence |
| Physical devices | iPhone/iPad/Android and native Files/share | UNVERIFIED | Hardware not available in this run |
| Long duration | Extended recording | UNVERIFIED | No multi-hour claim |
| Publication/channel | Authenticated production mutation | UNVERIFIED | No production mutation performed |
| Feed-to-playback | Authorized newly published recording | UNVERIFIED | Existing routing preserved |
| Security boundaries | Read-only production smoke | PASS 10/10 | `/studio/`, `/live-video`, private APIs |
| Full API E2E | Local runner | BLOCKED | Hung before assertions; not counted as failure/pass |

Synthetic, local integration, production endpoint, authenticated production,
external-provider, and physical-device evidence are intentionally distinguished
above.

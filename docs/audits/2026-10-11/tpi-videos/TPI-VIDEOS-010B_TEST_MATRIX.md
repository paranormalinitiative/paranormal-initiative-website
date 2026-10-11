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

## Remaining media acceptance register

| Requirement | Current status | Evidence | Last test date | Blocking condition | Next verification action | Owner approval |
|---|---|---|---|---|---|---|
| Physical camera/microphone interruption and recovery | UNVERIFIED | Owner verified normal camera/mic/local recording only | 2026-10-11 | Physical device/session required | Test isolated owner-authorized device session without risking an active recording | Required |
| iPhone/iPad/Android compatibility and native Files/share | UNVERIFIED | No physical mobile run in this batch | 2026-10-11 | Devices and native workflows unavailable | Run per-device recording, playback, share, and save checks | Required |
| Long-duration recording and A/V drift | UNVERIFIED | Short synthetic sessions only | 2026-10-11 | Multi-hour window not run | Run timed soak with CPU/memory/drift capture; do not infer from short run | Required |
| Recording download/export file integrity | PARTIAL | Download control exercised; prior fallback WebM evidence exists | 2026-10-11 | Harness exposed no fresh file path | Capture a downloaded file and inspect with FFprobe/independent decoder | Required |
| Authenticated creator publication | UNVERIFIED | Existing publication path preserved; no production mutation | 2026-10-11 | Authorized account/playback source not used | Perform isolated authorized publish/unpublish workflow | Required |
| Public playback of creator-owned recording | UNVERIFIED | Local Library native playback only | 2026-10-11 | No approved public playback source | Verify explicit publication then watch-page playback | Required |
| Creator channel end-to-end publication | UNVERIFIED | Attribution/channel paths preserved | 2026-10-11 | Depends on authorized publication | Publish a test recording and verify channel attribution | Required |
| StudioFlow-to-TPI Videos integration | UNVERIFIED | Existing architecture and routing preserved | 2026-10-11 | Complete authorized workflow not run | Verify recording metadata, publication, watch page, and permissions together | Required |
| StudioFlow-to-Community Feed integration | UNVERIFIED | Existing Feed preview/routing evidence | 2026-10-11 | No newly published creator recording | Share an authorized recording and verify preview/routing | Required |
| Cross-account creator/member acceptance | UNVERIFIED | Anonymous security boundaries passed | 2026-10-11 | Multiple authorized roles not exercised | Test owner/creator/member visibility and permissions with isolated accounts | Required |
| Real provider broadcast / RTMPS | UNVERIFIED | Local RTMP receiver evidence only | 2026-10-11 | No external provider session authorized | Run a private/unlisted provider test with approved credentials | Required |
| Full API E2E runner | BLOCKED | Runner hung before assertions | 2026-10-11 | Startup/timeout cause unresolved | Diagnose startup, timeout, dependencies, then rerun or document blocker | No production mutation |

This register is the current owner-review queue. It does not replace the
historical StudioFlow or TPI Videos reports.

# TPI-VIDEOS-001 Test Matrix

Audit date: 2026-10-11. “Pass” means the named test was actually run; “blocked” is not a pass.

| Area | Method/environment | Result | Evidence/limitation |
|---|---|---|---|
| Worker/API syntax | Existing `scripts/qa/run-qa.mjs` | PASS | Node checks for Worker, API, shell scripts, and Bash checks |
| Production boundaries | Existing read-only smoke suite | PASS | 8 checks passed; anonymous Studio denied and live page Coming Soon |
| Static/Worker build | `npx wrangler deploy --dry-run` | PASS | 9,258 assets read; no deploy |
| Scraped video API | Production GET `/api/videos?limit=5` | PASS | 200; five Odysee records returned |
| Authored video API | Production GET `/api/tpi-videos` | PASS/EMPTY | 200; zero authored rows, so playback cannot be exercised |
| Auth endpoint | Production GET `/api/auth/me` | PASS | Anonymous user null |
| D1 schema | Remote read-only `sqlite_master` query | PASS | Relevant tables/indexes present; zero writes |
| TPI page delivery | Production GET authored/member/live HTML pages | PASS | 200 responses; no authenticated visual/player session |
| Authored playback | Browser/player test | BLOCKED | No published authored video and no authorized test account in this audit |
| External provider playback | Rumble/Odysee/Dailymotion/IA authenticated/content test | BLOCKED | No test content was created or mutated; provider playback varies by source |
| StudioFlow recording pipeline | Real camera/mic/recording test | DEFERRED | Creator Studio acceptance is explicitly deferred; no rebuild/reopen |
| Guest WebRTC transport | Actual guest media transport | DEFERRED | Requires owner acceptance environment and isolated media sessions |
| RTMP receiver | Local receiver and captured stream | DEFERRED | Not part of this audit-only pass; no public broadcast created |
| Long-duration playback/recording | Extended run | DEFERRED | Not claimed from short checks |
| Mobile physical devices | iPhone/iPad/Android | BLOCKED | No physical-device session available |
| Screenshots | Rendered authenticated pages | BLOCKED | Only HTTP/source evidence captured; no authenticated browser screenshot was created |

## Interpretation

The audit establishes the source/runtime inventory and boundaries. It does not certify video playback, live broadcasting, recording export, guest transport, or physical-device behavior.

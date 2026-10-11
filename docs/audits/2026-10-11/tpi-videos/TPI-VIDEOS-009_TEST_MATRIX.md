# TPI-VIDEOS-009 Test Matrix

| Test | Method | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Node syntax | `node --check` on Worker, API, shared scripts | PASS | Local 2026-10-11 |
| Bash syntax | Existing E2E/migration scripts | PASS | Local 2026-10-11 |
| Provider playback regression | Existing 008 focused test | PASS 22/22 | Local; 008 resolver preserved |
| Link-preview URL/parser regression | New focused test | PASS 7/7 | Local `scripts/qa/tpi-link-preview-regression.mjs` |
| New migrations | Isolated SQLite schema apply | PASS | Tables 0045 and format column 0046 created |
| Full multi-user API E2E | Existing local Wrangler runner | BLOCKED | Stops at pre-existing `0001_contributor_portal.sql` migration failure before assertions |
| StudioFlow build | Existing separate workspace | NOT RUN | No StudioFlow source change in this batch |
| Anonymous production boundary | `production-smoke.mjs` | PENDING | Run after deployment |
| Authenticated saves/history | Disposable member session | PENDING | Requires local runner or authorized session |
| External providers | Browser/provider sessions | UNVERIFIED | Not inferred from source tests |
| Physical devices | iPhone/iPad/Android | UNVERIFIED | Not available in this environment |
| Long duration | Extended browser/media run | UNVERIFIED | No multi-hour claim |

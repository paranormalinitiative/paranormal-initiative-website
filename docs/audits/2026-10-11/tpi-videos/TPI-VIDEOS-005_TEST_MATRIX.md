# Test Matrix

| Area | Method | Result | Evidence / limitation |
|---|---|---|---|
| StudioFlow TypeScript/build | `npm run build` in canonical web source | PASS | Vite production bundle generated; chunk-size warning only |
| API regression | Isolated local Wrangler D1 + Worker, seeded sessions | PASS 207/207 | `scripts/e2e/api-e2e.sh 8793` |
| Stable create retry | Contributor API calls with same `broadcastId` | PASS | Existing mapping returned |
| Update conflict | Current and stale revisions | PASS | HTTP 409 conflict snapshot |
| Publication conflict | Current and stale revisions | PASS | HTTP 409 conflict snapshot |
| Same-origin mutation | Evil Origin header | PASS | HTTP 403 |
| Auth boundary | anonymous/member/contributor session matrix | PASS | Existing 401/403 behavior preserved |
| Browser UI | Loopback Vite page | PARTIAL | Auth gate rendered correctly; no signed-in TPI browser session was available for mutation controls |
| Recording media | Existing StudioFlow systems | NOT RE-RUN | Preserved; outside this metadata-only bridge batch |
| External provider playback | Real provider | NOT TESTED | No provider credentials or broadcast authorized |
| Physical offline/network interruption | Device/browser | NOT TESTED | Requires owner session/device |

## TPI-VIDEOS-005-A — Navigation branding

| Surface | Method | Result | Evidence / limitation |
|---|---|---|---|
| Member/sidebar navigation | Static source regression | PASS | `member-sidebar.html` displays `TPI Creator Studio` and preserves `/studio/`. |
| Mobile/injected navigation | Static source regression and JavaScript syntax check | PASS | `member-shell.js` injects the same label, aria label, and `/studio/` destination; `scripts/qa/tpi-videos-005a-navigation.mjs` passed. |
| Desktop/mobile production assets | Cache-busted production asset inspection | PASS | `/member-sidebar.html` and `/member-shell.js` returned 200 with `TPI Creator Studio` and `/studio/`; authenticated owner DOM rendering remains a separate acceptance item because Playwright is not installed in this checkout. |

## Current audit note

The historical 005 release baseline recorded 207 API checks. The current
TPI-VIDEOS-006 rerun is 211/211 because four cancellation lifecycle assertions
were added to `scripts/e2e/api-e2e.sh`; the historical release count is
preserved rather than rewritten.

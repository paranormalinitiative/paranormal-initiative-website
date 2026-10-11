# TPI-SOCIAL-003 Test Matrix

| Test | Method | Result | Evidence / limitation |
|---|---|---|---|
| JavaScript syntax | Node `--check` for changed and core route files | PASS | `member-settings.js`, `member-shell.js`, `functions/api/[[path]].js` |
| Settings card repair | `scripts/qa/tpi-social-003-settings-regression.mjs` | PASS | Six cards retained; no unary `+card` coercion |
| Settings API/security | `scripts/e2e/member-settings.mjs` | PASS | Auth, enum, owner isolation, persistence, public style, blocks |
| Full social/API regression | `scripts/e2e/api-e2e.sh 8794` | PASS 213/213 | Disposable local D1/Wrangler; bounded execution; no production data |
| Messenger attachment security | `scripts/qa/messenger-media-security.mjs` | PASS | Fake R2; denied requests did not fetch objects |
| Link-preview safety | `scripts/qa/tpi-link-preview-regression.mjs` | PASS 7/7 | Existing Social-002 repair |
| Video/player regression | `scripts/qa/tpi-video-player-regression.mjs` | PASS 22 | Existing media boundary preserved |
| Navigation branding | `scripts/qa/tpi-videos-005a-navigation.mjs` | PASS | Desktop/mobile label and `/studio/` destination |
| Signed-in browser Settings matrix | Existing member-settings harness | BLOCKED | Playwright module unavailable |
| Formal accessibility scan | Automated scanner | NOT RUN | Tool/dependency unavailable in this checkout |
| Physical devices/external providers | Manual/provider sessions | NOT TESTED | Not available; not inferred |
| Production endpoint smoke | `scripts/qa/production-smoke.mjs` | PENDING | Run after verified release deployment |

The previous unbounded-run concern is resolved for this batch: the same suite
completed when run with the required loopback permissions. Future runs should
retain a bounded wrapper.

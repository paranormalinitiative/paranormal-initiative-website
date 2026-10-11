# TPI-SOCIAL-002 Test Matrix

| Area | Method | Result |
|---|---|---|
| JavaScript/Bash syntax | Node `--check`, `bash -n` | PASS |
| Link-preview parser/security | `scripts/qa/tpi-link-preview-regression.mjs` | PASS 7/7 |
| Video/provider/player regression | `scripts/qa/tpi-video-player-regression.mjs` | PASS 22 assertions |
| Navigation branding | `scripts/qa/tpi-videos-005a-navigation.mjs` | PASS |
| Messenger attachment authorization | `scripts/qa/messenger-media-security.mjs` | PASS |
| Settings API/SQLite | `scripts/e2e/member-settings.mjs` | PASS; browser phase blocked by missing Playwright |
| Full local social/API regression | fresh local D1/Wrangler, seeded disposable identities | PASS 213/213 |
| Direct pasted URL composer | isolated browser member session | PASS; preview, publish, reload |
| Preview image rendering | NASA Open Graph image in isolated browser | PASS; 3000 × 2400 natural image |
| External destination safety | DOM inspection of rendered card | PASS; original URL, `_blank`, `noopener noreferrer` |
| Production boundary smoke | read-only production endpoints | PASS 10/10 |
| Authenticated production Feed/Settings | owner/member production session | NOT TESTED |
| Physical devices/external provider sessions | unavailable resources | NOT TESTED |

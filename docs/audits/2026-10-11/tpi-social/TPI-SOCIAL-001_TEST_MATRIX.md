# TPI-SOCIAL-001 Test Matrix

| Test | Method | Environment | Result | Evidence |
|---|---|---|---|---|
| Auth/member gates | curl assertions | fresh local D1/Wrangler | PASS | `scripts/e2e/api-e2e.sh`, 211/211 |
| Feed/comments/reactions | multi-user API | fresh local D1/Wrangler | PASS | same suite |
| Messenger A/B/C metadata | multi-user API | fresh local D1/Wrangler | PASS | same suite |
| Messenger attachment object gate | isolated Node/D1/fake R2 | local | PASS | `scripts/qa/messenger-media-security.mjs` |
| Personalization API | real SQLite/onRequest | local | PASS | `scripts/e2e/member-settings.mjs` |
| Personalization browser UI | Playwright source test | local | BLOCKED | module unavailable |
| Production public/member boundary | read-only curl | production | PASS | root/API 200; notifications 401; studio 403 |
| Physical devices/external providers | manual/provider test | unavailable | NOT TESTED | owner/provider resources absent |

Previous TPI-VIDEOS-006 build/RTMP evidence remains in its separate audit; it
was not repeated or duplicated here.

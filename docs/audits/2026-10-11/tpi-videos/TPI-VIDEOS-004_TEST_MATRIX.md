# TPI-VIDEOS-004 Test Matrix

| Area | Method | Result | Evidence / limitation |
|---|---|---|---|
| JS syntax | `node --check functions/api/[[path]].js` | PASS | Local source check |
| Migration replay | Fresh local D1, all migrations including 0044 | PASS | No migration errors |
| Existing regression suite | `bash scripts/e2e/api-e2e.sh 8795` | PASS | 199/199 checks, 0 failures |
| Anonymous/member mutation denial | Isolated seeded sessions | PASS | 401/403 assertions |
| Stable identity and owner reopen | Isolated seeded contributor | PASS | Broadcast `e2e-broadcast-004` |
| Explicit publish/upcoming discovery | Isolated local D1/Worker | PASS | Published listing visible only after action |
| Lifecycle transitions | Isolated local D1/Worker | PASS | Ready → live → ended |
| Unverified live suppression | Isolated local D1/Worker | PASS | Live filter excluded unverified playback |
| Replay metadata/public discovery | Isolated local D1/Worker | PASS | Replay filter passed |
| External provider delivery | No provider credentials/session | NOT TESTED | No operational claim |
| Actual media capture/decode | No real broadcast media in this batch | NOT TESTED | URL validation is not playback proof |
| StudioFlow browser-to-TPI sync | Existing StudioFlow localStorage reviewed | BLOCKED | No explicit bridge currently wired |
| Authenticated production mutations | Not run against owner data | NOT TESTED | No production test record created |
| `/studio/` and `/live-video` boundary | Prior production read-only evidence; no route change | PASS boundary | Recheck required after deployment |

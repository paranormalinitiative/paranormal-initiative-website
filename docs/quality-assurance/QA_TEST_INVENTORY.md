# QA Test Inventory

| Area | Existing or new entrypoint | Evidence class | Default status |
|---|---|---|---|
| TPI Worker and API syntax | `scripts/qa/run-qa.mjs` | local static check | PASS when runner completes |
| TPI social API | `scripts/e2e/api-e2e.sh` | local D1, synthetic multi-user integration | PASS: 152/0 on 2026-10-11 |
| Migration replay | `scripts/e2e/verify-0010-equivalence.sh` | local migration equivalence | available; run when migration changes |
| Member settings | `scripts/e2e/member-settings.mjs` | local browser/synthetic API harness | existing focused suite; run when settings changes |
| TPI/StudioFlow integration | `scripts/studioflow-release-dry-run.mjs` | read-only source/dist manifest comparison | available; no deployment mutation |
| StudioFlow build | `npm run build` in `StudioFlow/web` | local production build | PASS on 2026-10-11 |
| StudioFlow room server | `npm run check:room` | local syntax check | PASS on 2026-10-11 |
| StudioFlow RTMP bridge | `npm run check:rtmp` | local syntax check | PASS on 2026-10-11 |
| Production boundary | `scripts/qa/production-smoke.mjs` | anonymous read-only endpoint check | explicit opt-in |
| Actual media capture/analysis | StudioFlow local media tools | local integration/media evidence | PARTIAL/BLOCKED; no general automated runner exists |
| Physical iOS/Android/browser devices | owner/device lab | physical-device evidence | NOT YET VERIFIED |
| External RTMP/RTMPS providers | provider accounts and receivers | external-provider evidence | NOT YET VERIFIED |

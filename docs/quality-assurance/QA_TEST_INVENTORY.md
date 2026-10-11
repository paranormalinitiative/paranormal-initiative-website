# QA Test Inventory

| Area | Existing or new entrypoint | Evidence class | Default status |
|---|---|---|---|
| TPI Worker and API syntax | `scripts/qa/run-qa.mjs` | local static check | PASS when runner completes |
| TPI social API | `scripts/e2e/api-e2e.sh` | local D1, synthetic multi-user integration | PASS: 152/0 on 2026-10-11 |
| Social multi-member interaction audit | isolated synthetic Member A/B/C/D sessions plus local D1/API/browser checks | cross-account functional/security evidence | QUEUED after TPI-STUDIOFLOW-019 |
| Migration replay | `scripts/e2e/verify-0010-equivalence.sh` | local migration equivalence | available; run when migration changes |
| Member settings | `scripts/e2e/member-settings.mjs` | local browser/synthetic API harness | existing focused suite; run when settings changes |
| Personalization Highlights | member settings browser/API regression harness | persistence, reset, theme, and visual behavior | NOT YET VERIFIED; owner-reported issue queued for Phase 2 |
| TPI/StudioFlow integration | `scripts/studioflow-release-dry-run.mjs` | read-only source/dist manifest comparison | available; no deployment mutation |
| StudioFlow comparative audit | `/Users/toddknipple/Documents/StudioFlow/TPI-STUDIOFLOW-020_PROGRESS.md` | source, local runtime, and current public-reference evidence | REGISTERED; execute only after 019 owner review |
| StudioFlow build | `npm run build` in `StudioFlow/web` | local production build | PASS on 2026-10-11 |
| StudioFlow room server | `npm run check:room` | local syntax check | PASS on 2026-10-11 |
| StudioFlow RTMP bridge | `npm run check:rtmp` | local syntax check | PASS on 2026-10-11 |
| Production boundary | `scripts/qa/production-smoke.mjs` | anonymous read-only endpoint check | explicit opt-in |
| Actual media capture/analysis | StudioFlow local media tools | local integration/media evidence | PARTIAL/BLOCKED; no general automated runner exists |
| TPI-STUDIOFLOW-019A media audit | `/Users/toddknipple/Documents/StudioFlow/TPI-STUDIOFLOW-019A_TEST_MATRIX.md` | isolated browser, FFmpeg, FFprobe, local RTMP receiver | ticker/video PASS; prerecorded audio defect open; recovery/download PARTIAL |
| Physical iOS/Android/browser devices | owner/device lab | physical-device evidence | NOT YET VERIFIED |
| External RTMP/RTMPS providers | provider accounts and receivers | external-provider evidence | NOT YET VERIFIED |

## Phase gate

The social multi-member and Highlights entries are intentionally queued. The
official sequence is Creator Studio testing/repairs first, the complete social
network audit second, and future features third. A passing API baseline does
not close the multi-member delivery, privacy, or Settings acceptance criteria.

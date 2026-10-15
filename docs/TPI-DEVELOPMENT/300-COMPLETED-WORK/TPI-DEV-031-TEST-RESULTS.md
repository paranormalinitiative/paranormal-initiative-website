# TPI-DEV-031 — Test Results

Date: 2026-10-14

| Area | Status | Evidence |
| --- | --- | --- |
| Analytics source/contract checks | PASSED | `tpi-dev-031-analytics.mjs`, 11/11 |
| React/Vite build | PASSED | `npm run build` in `admin-center-app` |
| Existing DEV-030 source compatibility | PASSED | 9/9 |
| Administration preview regression | PASSED | 81/81 |
| Authenticated authorization regression | PASSED | DEV-014, 57/57 |
| Worker/API syntax | PASSED | `node --check` for both entry points |
| Git whitespace validation | PASSED | `git diff --check` |
| Development runtime analytics API | PASSED | authenticated HTTP 200 and expected series |
| Owner authenticated chart browser inspection | NOT TESTED | no safe owner-session browser handoff |
| Production runtime | NOT TESTED | production deployment prohibited by DEV-031 |

The build emitted only the existing large JavaScript chunk warning; it did not
fail. No test made application writes or external service mutations.

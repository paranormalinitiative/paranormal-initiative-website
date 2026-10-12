# Functional test results

| Test | Environment | Result | Evidence |
| --- | --- | --- | --- |
| TypeScript/build | Local `admin-center-app` | PASS | `npm run build` |
| Production dependency audit | Local npm tree | PASS | `npm audit --omit=dev --audit-level=high` — 0 findings |
| Static preview regression | Repository source/build | PASS | `node scripts/qa/tpi-admin-005-preview.mjs` — 6/6 |
| Desktop shell render | Local Vite `127.0.0.1:5183` | PASS | Browser AX state |
| Dashboard navigation | Local Vite | PASS | Dashboard view rendered |
| Members navigation | Local Vite | PASS/PARTIAL | View rendered; API unavailable on Vite-only server |
| Analytics navigation | Local Vite | PASS | Empty-source state rendered honestly |
| Audit navigation | Local Vite | PASS/PARTIAL | View rendered; API unavailable on Vite-only server |
| Authenticated D1 data | Local Vite | BLOCKED | No Worker/D1 backend attached |
| Anonymous gate | Local Worker/deployment | PENDING | Requires deployed Worker or authenticated local Worker harness |

No production database or R2 test was performed.

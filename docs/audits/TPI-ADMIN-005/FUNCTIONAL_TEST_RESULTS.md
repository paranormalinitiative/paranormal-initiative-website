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

## Production smoke evidence

Cloudflare version `7256a900-37ab-41c0-81e1-858d536e26c1` was checked through
the Worker endpoint. Anonymous entry and direct-asset requests were rejected
with `403`; the admin API was rejected with `403`; the legacy admin entry was
also rejected with `403`; and `/live-video` returned `200` with Coming Soon.
An authorized owner/admin session was not available in this automated run and
remains pending owner acceptance testing.

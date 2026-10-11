# TPI-ADMIN-002 Test Matrix

| Test | Method | Result |
|---|---|---|
| Worker/API syntax | `node --check` on Worker, API, admin JS | PASS |
| Migration replay | Fresh local D1 applies migrations 0001–0048 | PASS |
| Existing API regression | `scripts/e2e/api-e2e.sh 8800` | PASS 225 / FAIL 0 |
| Overview/analytics | Local seeded admin API calls | PASS |
| Members pagination/filtering | Local seeded admin API call | PASS |
| Community management fields | Local seeded admin API call | PASS |
| Audit filters/pagination | Local seeded admin API call | PASS |
| Founding 50 zero accounting | Local seeded admin API call | PASS |
| Admin award denial | Local seeded admin API call | PASS |
| Owner production-award gate | Local seeded owner API call without activation flag | PASS: 423 gated |
| Authenticated production admin UI | No approved production credential used | BLOCKED |
| Physical mobile/device admin UI | No device lab in this batch | BLOCKED |

The suite exercised simulated/local identities only; it did not consume
production memberships.

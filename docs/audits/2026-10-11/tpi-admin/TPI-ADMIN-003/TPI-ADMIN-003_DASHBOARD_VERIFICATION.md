# TPI-ADMIN-003 Dashboard Verification

Classification: **PASS WITH LIMITATIONS**.

The dashboard is backed by `/api/admin/overview` and real D1 timestamp aggregates. ADMIN-002 local seeded admin calls verified live metrics and bounded trends; the current source still maps metrics into the existing cards and renders empty/unavailable text rather than fabricated numbers. Current fresh execution of that suite was blocked by Wrangler `spawn EBADF` before the local server became ready, so the prior 225/225 result is carried as historical evidence, not re-counted.

| Metric group | Authoritative source | Current evidence |
|---|---|---|
| Members and registrations | D1 contributor/member timestamps via `/api/admin/overview` | ADMIN-002 API PASS; current rerun BLOCKED |
| Community activity | D1 community posts/comments | ADMIN-002 API PASS; current rerun BLOCKED |
| Publishing activity | existing video/event tables | ADMIN-002 API PASS; current rerun BLOCKED |
| Founding 50 | additive allocation tables, capacity 50 | production read-only zero allocated / 50 remaining in ADMIN-002 |
| Creator entitlements | additive entitlement table | production read-only zero rows in ADMIN-002 |

Authenticated rendered card values, loading transitions, chart readability, and error state remain **BLOCKED** without an authorized browser session.

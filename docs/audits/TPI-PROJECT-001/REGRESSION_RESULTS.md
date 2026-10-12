# TPI-PROJECT-001 — Regression results

Status: **PASS WITH LIMITATIONS pending live authenticated owner review.**

| Check | Result |
| --- | --- |
| TPI source/build scope only | PASS |
| Deleted-post default filter source regression | PASS |
| Explicit Deleted filter remains available | PASS |
| TPI theme/isolation suite | PASS — 18/18 after this change |
| Frontend TypeScript/Vite build | PASS — `npm run build` |
| Worker JavaScript syntax | PASS — `node --check 'functions/api/[[path]].js'` |
| Legacy admin JavaScript syntax | PASS — `node --check admin-center.js` |
| Anonymous `/admin-panel` protection | PASS — production HTTP 403 |
| Anonymous preview protection | PASS — production HTTP 403 for route and direct asset |
| Anonymous admin API protection | PASS — production HTTP 403 |
| `/live-video` Coming Soon | PASS — production HTTP 200 with Coming Soon content |
| Published audit document | PASS — production HTTP 200 |
| Authenticated owner/admin Community Overview | BLOCKED without authorized session |

No production records were modified for testing. The TPI D1 evidence query was
read-only.

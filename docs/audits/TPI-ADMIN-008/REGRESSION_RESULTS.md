# TPI-ADMIN-008 — Regression results

Status: **PASS WITH LIMITATIONS — protected preview batch; promotion not ready.**

| Check | Result |
| --- | --- |
| Refine/Vite/TypeScript build | PASS — `npm run build` |
| Worker JavaScript syntax | PASS — `node --check 'functions/api/[[path]].js'` |
| Legacy admin JavaScript syntax | PASS — `node --check admin-center.js` |
| TPI admin/theme/isolation suite | PASS — 20/20 |
| Deleted-post active filtering | PASS — source regression |
| Distinct Community routes | PASS — source regression |
| Optional dashboard metrics | PASS — source regression |
| Existing `/admin-panel` replacement | NOT PERFORMED |
| Authenticated production browser matrix | BLOCKED — no authorized session |
| Live deployment for this batch | PENDING final release |

Pre-existing unrelated dirty files were preserved and not staged.

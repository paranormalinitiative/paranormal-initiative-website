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
| Live deployment for this batch | PASS — Cloudflare Version `ff131b83-25a2-4dd9-a9aa-dd45e0f7ae5a` |
| Anonymous homepage | PASS — HTTP 200 |
| Anonymous `/admin-panel.html` | PASS — HTTP 403 |
| Anonymous preview route and hashed asset | PASS — HTTP 403 |
| Anonymous admin API | PASS — HTTP 403 |
| Public `/live-video` | PASS — HTTP 200 with Coming Soon |
| Published TPI-ADMIN-008 docs | PASS — HTTP 200 |

Pre-existing unrelated dirty files were preserved and not staged.

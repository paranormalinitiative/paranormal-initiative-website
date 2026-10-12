# TPI-ADMIN-008 — Regression results

Status: **PASS WITH LIMITATIONS — protected preview batch; promotion not ready.**

| Check | Result |
| --- | --- |
| Refine/Vite/TypeScript build | PASS — `npm run build` |
| Worker JavaScript syntax | PASS — `node --check 'functions/api/[[path]].js'` |
| Legacy admin JavaScript syntax | PASS — `node --check admin-center.js` |
| TPI admin/theme/isolation suite | PASS — 30/30 |
| Deleted-post active filtering | PASS — source regression |
| Distinct Community routes | PASS — source regression |
| Optional dashboard metrics | PASS — source regression |
| Existing `/admin-panel` replacement | NOT PERFORMED |
| Authenticated production browser matrix | BLOCKED — no authorized session |
| Live deployment for this batch | PASS — Cloudflare Version `d4576ae9-1d28-45bc-9c7a-beae7203464a` |
| Anonymous homepage | PASS — HTTP 200 |
| Anonymous `/admin-panel.html` | PASS — HTTP 403 |
| Anonymous preview route and hashed asset | PASS — HTTP 403 |
| Anonymous admin API | PASS — HTTP 403 |
| Public `/live-video` | PASS — HTTP 200 with Coming Soon |
| Published TPI-ADMIN-008 docs | PASS — HTTP 200 |

Pre-existing unrelated dirty files were preserved and not staged.
## Incremental teams batch

- `npm run build` in `admin-center-app`: PASS.
- `node scripts/qa/tpi-admin-006-preview.mjs`: PASS, 22/22 focused checks.
- Teams navigation now renders a protected management view instead of only a
  transitional link.
- Pending, approved, and rejected filters map to the existing server-side
  `/admin/teams` contract.
- Pending approve/reject actions map to the existing protected status endpoint.
- Contributor Management loads the existing contributor and invite contracts,
  preserves invitation type/access-level choices, and maps role/title updates
  to the existing protected endpoint.
- Platform Health loads the existing read-only `/admin/scraper-runs` contract,
  preserves provider capability disclosures, and does not trigger scraper jobs.
- Creator Directory, Founding 50, and Creator Studio Access map to their
  existing protected APIs; award activation and Studio entitlement escalation
  remain unavailable in the preview.
- System Settings reads the existing protected settings contract and renders
  disabled controls; no settings mutation is invoked by the preview.
- Education Center, TPI Videos, and Events read their existing published or
  approved listings without invoking content mutations.
- No team data was mutated during verification; authenticated runtime action
  testing remains pending owner/admin browser access. No contributor, invite,
  or role data was mutated during verification.

## Production boundary smoke

- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous preview JavaScript asset: HTTP 403.
- Anonymous `/api/admin/teams`: HTTP 403.
- Anonymous `/api/admin/contributors`: HTTP 403.
- Anonymous `/api/invites`: HTTP 403.
- Anonymous `/api/admin/scraper-runs`: HTTP 403.
- Anonymous `/api/admin/creator-partnership`: HTTP 403.
- Anonymous `/api/admin/founding-50`: HTTP 403.
- Anonymous `/api/admin/creator-studio/entitlements`: HTTP 403.
- Anonymous `/api/admin/settings`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Authenticated owner/admin Teams rendering and mutation workflow: BLOCKED
  pending an authorized browser session; not claimed as passed.


# TPI-ADMIN-008 — Regression results

Status: **PASS WITH LIMITATIONS — protected preview batch; promotion not ready.**

| Check | Result |
| --- | --- |
| Refine/Vite/TypeScript build | PASS — `npm run build` |
| Worker JavaScript syntax | PASS — `node --check 'functions/api/[[path]].js'` |
| Legacy admin JavaScript syntax | PASS — `node --check admin-center.js` |
| TPI admin/theme/isolation suite | PASS — 42/42 |
| Deleted-post active filtering | PASS — source regression |
| Distinct Community routes | PASS — source regression |
| Optional dashboard metrics | PASS — source regression |
| Existing `/admin-panel` replacement | NOT PERFORMED |
| Authenticated production browser matrix | BLOCKED — no authorized session |
| Live deployment for this batch | PASS — Cloudflare Version `c3acc232-061c-4155-ac11-c8c2a68603ac` |
| Anonymous homepage | PASS — HTTP 200 |
| Anonymous `/admin-panel.html` | PASS — HTTP 403 |
| Anonymous preview route and hashed asset | PASS — HTTP 403 |
| Anonymous admin API | PASS — HTTP 403 |
| Public `/live-video` | PASS — HTTP 200 with Coming Soon |
| Published TPI-ADMIN-008 docs | PASS — HTTP 200; latest docs sync Version `fb1d9db4-0bbc-4d2a-8725-e4ed4299e904` |

## Reports queue release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 34/34.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-BgDOmMqw.js`: HTTP 403.
- Anonymous `/api/admin/reports`: HTTP 403.
- Anonymous `/admin-panel.html` and `/api/admin/overview`: HTTP 403.
- Public `/api/articles`, `/api/tpi-videos`, and `/api/events`: HTTP 200.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Reports API query and status-filter behavior: source/build verified; live
  authenticated data rendering and filter interaction remain BLOCKED without an
  authorized owner/admin browser session.

## Notifications queue release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 36/36.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-DtzLRBXy.js`: HTTP 403.
- Anonymous `/api/admin/notifications`: HTTP 403.
- Anonymous `/api/admin/reports`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Authenticated notification data rendering and filter interaction remain
  BLOCKED without an authorized owner/admin browser session.

## Creator Channels release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 38/38.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-BM2E7VZ7.js`: HTTP 403.
- Anonymous `/api/admin/channels`: HTTP 403.
- Anonymous `/api/admin/notifications` and `/api/admin/reports`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Authenticated channel directory data/filter rendering remains BLOCKED
  without an authorized owner/admin browser session.

## Roles & Permissions release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 40/40.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-DVENW52k.js`: HTTP 403.
- Anonymous `/api/admin/roles`: HTTP 403.
- Anonymous `/api/admin/channels`, `/api/admin/notifications`, and
  `/api/admin/reports`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Authenticated role-summary rendering remains BLOCKED without an authorized
  owner/admin browser session.

## Account Restrictions release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 42/42.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-BDgFA2FY.js`: HTTP 403.
- Anonymous `/api/admin/restrictions`: HTTP 403 with the existing server-side
  owner/admin authorization response.
- Anonymous `/api/admin/roles`, `/api/admin/channels`,
  `/api/admin/notifications`, and `/api/admin/reports`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Authenticated restriction-list rendering remains BLOCKED without an
  authorized owner/admin browser session.

Pre-existing unrelated dirty files were preserved and not staged.

## Security boundary view release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 44/44.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-FI-EnamA.js`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Anonymous `/api/admin/restrictions`, `/api/admin/roles`,
  `/api/admin/channels`, `/api/admin/notifications`, and
  `/api/admin/reports`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity, security-review, and owner-acceptance documentation:
  HTTP 200.
- Authenticated Security view rendering, role-matrix, and session-expiry
  checks remain BLOCKED without an authorized owner/admin browser session;
  they are not claimed as passed.
- No production records, D1 schema, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.

## Community Comments queue release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 46/46.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-Dbr2-v9H.js`: HTTP 403.
- Anonymous `/api/admin/community/comments?status=visible` and
  `?status=deleted`: HTTP 403.
- Anonymous `/admin-panel.html`, `/api/admin/overview`,
  `/api/admin/reports`, and `/api/admin/notifications`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity and security documentation: HTTP 200.
- Authenticated Community Comments rendering and filter interaction remain
  pending an authorized owner/admin browser session; they are not claimed as
  passed.
- No Community Feed records, D1 schema, R2 objects, Creator Studio access,
  or legacy `/admin-panel` behavior were changed.

## Events review queue release verification

- Source/build checks: PASS — `npm run build`, Worker syntax, legacy admin
  syntax, `git diff --check`, and focused QA 48/48.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-CQ5r140J.js`: HTTP 403.
- Anonymous `/api/admin/events?status=approved`, `pending`, `rejected`,
  `cancelled`, and `all`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity and security documentation: HTTP 200.
- Authenticated Events rendering, filter interaction, and owner-approved
  mutation testing remain pending an authorized owner/admin browser session;
  they are not claimed as passed.
- No event records, D1 schema, R2 objects, Creator Studio access, or legacy
  `/admin-panel` behavior were changed.
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
- Public `/api/articles`, `/api/tpi-videos`, and `/api/events`: HTTP 200.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Authenticated owner/admin Teams rendering and mutation workflow: BLOCKED
  pending an authorized browser session; not claimed as passed.

## Audit Logs pagination release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  `git diff --check`, and focused QA 50/50. Vite emitted only its existing
  large-chunk advisory.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-CXNAwm4r.js`: HTTP 403.
- Anonymous `/api/admin/audit-logs?page=1&limit=50`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity documentation: HTTP 200.
- Authenticated Audit Logs rendering, pagination interaction, and rollback
  verification remain pending an authorized owner/admin browser session; they
  are not claimed as passed.
- No D1 schema, production records, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.

## Reports pagination release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  58/58. Vite emitted only its existing large-chunk advisory.
- The protected Reports queue now returns total/totalPages metadata and the
  preview uses a bounded 50-row page with Previous/Next controls. Safe search,
  status filters, metadata-only fields, and the no-resolution boundary remain
  intact.
- Anonymous production boundary checks after deployment: preview HTML, exact
  `index-Bp15uWxX.js` asset, `/api/admin/reports?status=all&search=video&page=1&pageSize=50`,
  and `/admin-panel.html` returned HTTP 403; `/live-video` returned HTTP 200
  with Coming Soon preserved; the full read-only production smoke passed 10/10.
- Authenticated Reports rendering and pagination interaction remain pending an
  authorized owner/admin browser session and are not claimed as passed.
- No report records, D1 schema, R2 objects, Creator Studio access, or legacy
  `/admin-panel` behavior were changed.

## Events pagination release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  59/59. Vite emitted only its existing large-chunk advisory.
- The protected Events queue now consumes the existing `pagination.total` and
  `totalPages` contract, uses a bounded 50-row request, and exposes matching
  totals plus Previous/Next controls while preserving status filters, search,
  metadata-only fields, and the no-mutation boundary.
- Anonymous production boundary checks after deployment: preview HTML, exact
  `index-C_4vJIMb.js` asset, `/api/admin/events?status=all&page=1&pageSize=50`,
  and `/admin-panel.html` returned HTTP 403; `/live-video` returned HTTP 200
  with Coming Soon preserved; the full read-only production smoke passed 10/10.
- Authenticated Events rendering, pagination interaction, owner-approved
  mutation testing, and rollback verification remain pending an authorized
  owner/admin browser session and are not claimed as passed.
- No event records, D1 schema, R2 objects, Creator Studio access, or legacy
  `/admin-panel` behavior were changed.

## Quality-gate follow-up — 2026-10-12

- Focused TPI-ADMIN-008 preview suite: PASS — 55/55.
- Read-only production smoke: PASS — 10/10 after allowing network access;
  public shell and category/feed boundaries returned 200, `/studio/` returned
  403, anonymous Messenger and Notifications returned 401, the anonymous
  admin API returned 403, and `/live-video` remained Coming Soon.
- Local multi-user API E2E: BLOCKED by the execution environment, not
  classified as an application pass or fail. The first migration applies
  successfully when run directly, but the existing Wrangler local server
  repeatedly fails during esbuild startup with `spawn EBADF`, so no local API
  assertions were counted.
- No production records, D1 schema, R2 objects, or unrelated worktree files
  were changed by the attempted test run.

## Community route separation release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  55/55. Vite emitted only its existing large-chunk advisory.
- Community Overview now renders protected overview metrics in its own
  resource; Posts & Comments retains record-level post status controls and the
  metadata-only Community Comments queue.
- Anonymous production boundary checks after deployment: preview HTML,
  `index-BE8hSo1D.js`, `/api/admin/overview`, and
  `/api/admin/community/posts?status=active&page=1&pageSize=25` returned HTTP
  403; `/admin-panel.html` returned HTTP 403; `/live-video` returned HTTP 200
  with Coming Soon preserved; the parity and deployment reports returned HTTP
  200.
- Authenticated rendering remains pending an authorized owner/admin browser
  session and is not claimed as passed.
- No Community Feed records, D1 schema, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.

## Activity route separation release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  57/57. Vite emitted only its existing large-chunk advisory.
- Dashboard Activity now renders a dedicated recent-activity feed from the
  protected audit query; Audit Logs retains the searchable/paginated view and
  Moderation History retains its filtered view.
- Anonymous production boundary checks after deployment: preview HTML, exact
  `index-8ikpZcBw.js` asset, `/api/admin/audit-logs?page=1&limit=25`, and
  `/admin-panel.html` returned HTTP 403; `/live-video` returned HTTP 200 with
  Coming Soon preserved; the full read-only production smoke passed 10/10.
- Authenticated rendering remains pending an authorized owner/admin browser
  session and is not claimed as passed.
- No audit records, D1 schema, R2 objects, Creator Studio access, or legacy
  `/admin-panel` behavior were changed.

## Notifications pagination release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  54/54. Vite emitted only its existing large-chunk advisory.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-lvN7HLWs.js`: HTTP 403.
- Anonymous `/api/admin/notifications?status=all&page=1&pageSize=50`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity documentation: HTTP 200.
- Authenticated Notifications rendering and pagination interaction remain
  pending an authorized owner/admin browser session; they are not claimed as
  passed.
- No D1 schema, production records, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.

## Reports metadata search release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  53/53. Vite emitted only its existing large-chunk advisory.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-Dx3_mIh3.js`: HTTP 403.
- Anonymous `/api/admin/reports?status=all&search=video&pageSize=100`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity documentation: HTTP 200.
- Authenticated Reports rendering and search interaction remain pending an
  authorized owner/admin browser session; they are not claimed as passed.
- No D1 schema, production records, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.

## Audit Logs search repair release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  52/52. Vite emitted only its existing large-chunk advisory.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-R-ZadZ2y.js`: HTTP 403.
- Anonymous `/api/admin/audit-logs?page=1&limit=50`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published regression documentation: HTTP 200.
- Authenticated search interaction remains pending an authorized owner/admin
  browser session; it is not claimed as passed.
- No D1 schema, production records, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.

## Protected Analytics contract release verification

- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  51/51. Vite emitted only its existing large-chunk advisory.
- Anonymous `/admin-center-preview/`: HTTP 403.
- Anonymous `/admin-center-preview/assets/index-6AjarIbz.js`: HTTP 403.
- Anonymous `/api/admin/analytics?range=30d`: HTTP 403.
- Anonymous `/admin-panel.html`: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon preserved.
- Published parity documentation: HTTP 200.
- Authenticated Analytics rendering and range interaction remain pending an
  authorized owner/admin browser session; they are not claimed as passed.
- No D1 schema, production records, R2 objects, Creator Studio access, or
  legacy `/admin-panel` behavior were changed.


# Regression results

Status: **PASS WITH LIMITATIONS**.

No `admin-panel.html`, Worker gate, D1 migration, R2 configuration, StudioFlow,
authentication, Messenger UI, or `/live-video` source was changed by Batch A
except the protected admin API handler and preview integration. The build and
static regressions pass. Authenticated production regression remains pending.

Production smoke evidence for the protected deployment:

| Endpoint/check | Result |
| --- | --- |
| `/admin-center-preview/` anonymous access | PASS — HTTP 403 restricted gate |
| `/api/admin/members` anonymous access | PASS — HTTP 403 |
| `/admin-panel.html` anonymous access | PASS — HTTP 403 |
| `/live-video` public behavior | PASS — HTTP 200 with Coming Soon marker |
| `/` public behavior | PASS — HTTP 200 |
| Cloudflare Worker version | `8dac1b3c-d4f4-4e65-9e37-f8508c4c73ae` |

ADMIN-007A repair verification:

| Check | Result |
| --- | --- |
| Legacy resource isolation and navigation ownership | PASS — 13/13 administration isolation checks |
| Legacy Analytics, Dashboard, Members, and System views free of relocated panels | PASS — source-level route/DOM boundary checks |
| Refine preview navigation rendered at local Vite server | PASS — Community and Content & Publishing groups visible |
| Authenticated legacy workflow with real invite/team/comment records | PENDING OWNER SESSION |

ADMIN-007A production deployment:

- Source commit: `2859f7c`
- Cloudflare Worker version: `31086383-9600-4ca8-abef-8cc4928cee3a`
- Anonymous legacy `/admin-panel.html` and direct `#analytics` access: HTTP 403.
- Anonymous preview route and direct preview asset access: HTTP 403.
- Public `/live-video`: HTTP 200 with Coming Soon.

ADMIN-007B theme regression coverage:

| Check | Result |
| --- | --- |
| TPI semantic background, card, accent, sidebar, chart, and shadcn mappings | PASS — source regression coverage added |
| Six theme selectors and persisted theme allowlist | PASS — `cryptid`, `seance`, `cosmic`, `asylum`, `fieldops`, `gothicnight` |
| Former generic light dashboard palette absent from preview CSS | PASS — source regression coverage added |
| Responsive/mobile theme states and focus treatment | PASS — CSS coverage; rendered browser review pending |
| Authenticated owner visual acceptance | PENDING — owner session required |

ADMIN-007B production verification:

| Endpoint/check | Result |
| --- | --- |
| `/admin-center-preview/` anonymous access | PASS — HTTP 403 |
| Direct protected preview JS asset | PASS — HTTP 403 |
| `/admin-panel.html` anonymous access | PASS — HTTP 403 |
| `/live-video` public behavior | PASS — HTTP 200 with Coming Soon marker |
| `/` public behavior | PASS — HTTP 200 |
| Cloudflare Worker version | `29c88d39-25be-42dd-8ac5-2753d3b11811` |

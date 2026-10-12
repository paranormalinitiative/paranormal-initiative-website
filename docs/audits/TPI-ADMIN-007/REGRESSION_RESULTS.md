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

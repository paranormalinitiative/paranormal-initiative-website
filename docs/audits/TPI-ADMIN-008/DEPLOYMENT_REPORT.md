# TPI-ADMIN-008 — Deployment report

Status: **DEPLOYED WITH LIMITATIONS — protected preview only; promotion not ready.**

This batch is limited to the TPI repository and protected preview assets/API.
The production `/admin-panel` remains unchanged. The Cloudflare target must be
verified as account `221ea5479876fd303ddc87002b9e892d`, Worker
`theparanormalinitiative`, D1 `tpi_contributor_portal`, and R2
`tpi-contributor-media` immediately before deployment.

No D1 migration, production data mutation, R2 object operation, credential
change, Founding 50 activation, or Creator Studio access expansion is part of
this batch.

## Release evidence

- Git commit: `0bc2d474fe67606aac022366d810db109a4ce66a`
- GitHub: pushed to `origin/main`
- Cloudflare Version ID: `ff131b83-25a2-4dd9-a9aa-dd45e0f7ae5a`
- Worker: `theparanormalinitiative`
- Preview asset: `/admin-center-preview/assets/index-SUDuDyoT.js`
- Dry run: PASS; `TPI_DB` resolved to `tpi_contributor_portal` and `TPI_MEDIA`
  resolved to `tpi-contributor-media`.

## Anonymous production verification

| Endpoint | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/admin-panel.html` | HTTP 403 |
| `/admin-center-preview/` | HTTP 403 |
| `/admin-center-preview/assets/index-SUDuDyoT.js` | HTTP 403 |
| `/api/admin/overview` | HTTP 403 |
| `/live-video` | HTTP 200; Coming Soon preserved |
| `/docs/audits/TPI-ADMIN-008/FEATURE_PARITY_MATRIX.md` | HTTP 200 |

Authenticated administrator browser verification remains BLOCKED without an
authorized session. `/admin-panel` promotion remains explicitly gated by full
parity, authenticated acceptance, rollback verification, and owner approval.

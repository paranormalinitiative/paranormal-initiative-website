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

The initial protected-preview batch and this incremental Teams integration are
both retained below as release history.

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

## Teams integration release

- Git commit: `2f46d35cd74d00508c6df91b086f2e0b6e156867`
- GitHub: pushed to `origin/main`
- Cloudflare Version ID: `c4594714-a6c5-45cf-9ee1-0cf16de2875e`
- Preview asset: `/admin-center-preview/assets/index-CdANy844.js`
- Wrangler identity: PASS — designated TPI account ID
  `221ea5479876fd303ddc87002b9e892d`
- Dry run: PASS — `TPI_DB` resolved to `tpi_contributor_portal`, `TPI_MEDIA`
  resolved to `tpi-contributor-media`, and `ASSETS` was present.
- Uploaded assets were limited to the protected preview bundle, focused QA
  script, and TPI-ADMIN-008 documentation.
- No D1 migration, team-record mutation, R2 operation, or `/admin-panel`
  replacement was performed.
- Documentation sync commit: `d6b45ed` pushed to `origin/main`.
- Documentation sync Cloudflare Version ID: `53f787b5-ed28-4796-9b0a-20b01ade2f87`.

## Contributor Management release

- Git commit: `88f2316` pushed to `origin/main`.
- Cloudflare Version ID: `6e48d46b-5f3b-44f8-98a6-7596e84db61d`.
- Preview asset: `/admin-center-preview/assets/index-b-VW_Pff.js`.
- Dry run: PASS — `TPI_DB` resolved to `tpi_contributor_portal`, `TPI_MEDIA`
  resolved to `tpi-contributor-media`, and `ASSETS` was present.
- Anonymous boundary checks: preview, preview asset, `/api/admin/contributors`,
  and `/api/invites` returned HTTP 403; `/live-video` returned HTTP 200 with
  Coming Soon preserved.
- No contributor, invite, role, D1, or R2 data was mutated during verification.

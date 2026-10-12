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

## Platform Health release

- Git commit: `8d006bf` pushed to `origin/main`.
- Cloudflare Version ID: `a4efadbc-5dde-4df3-b57c-0c4343b21392`.
- Preview asset: `/admin-center-preview/assets/index-DU0WSzoQ.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview, preview asset, and
  `/api/admin/scraper-runs` returned HTTP 403; `/live-video` returned HTTP 200
  with Coming Soon preserved.
- No scraper refresh job, D1 migration, R2 operation, or production data
  mutation was performed.

## Creator Management release

- Git commit: `0a6e8bc` pushed to `origin/main`.
- Cloudflare Version ID: `1294ca23-52b8-41f7-a11a-73ff4445d72e`.
- Preview asset: `/admin-center-preview/assets/index-CiNmH33P.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview, preview asset,
  `/api/admin/creator-partnership`, `/api/admin/founding-50`, and
  `/api/admin/creator-studio/entitlements` returned HTTP 403; `/live-video`
  returned HTTP 200 with Coming Soon preserved.
- No Founding 50 award, Creator Studio entitlement, D1, or R2 mutation was
  performed during verification.

## System Settings release

- Git commit: `85b8ac6` pushed to `origin/main`.
- Cloudflare Version ID: `d4576ae9-1d28-45bc-9c7a-beae7203464a`.
- Preview asset: `/admin-center-preview/assets/index-CNAPvCfq.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview, preview asset, and `/api/admin/settings`
  returned HTTP 403; `/live-video` returned HTTP 200 with Coming Soon
  preserved.
- The preview invoked no settings POST mutation and changed no production
  configuration.

## Published content views release

- Git commit: `82ca842` pushed to `origin/main`.
- Cloudflare Version ID: `fd566f6e-9a15-4183-a450-709c19ed3b1b`.
- Preview asset: `/admin-center-preview/assets/index-BhFaD7AW.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview and preview asset returned HTTP 403;
  existing public `/api/articles`, `/api/tpi-videos`, and `/api/events`
  listings returned HTTP 200; `/live-video` returned HTTP 200 with Coming
  Soon preserved.
- No draft, event, video, article, D1, or R2 mutation was performed.

## Reports metadata queue release

- Git commit: `30996baa0742263b6958b12ad696b568418c4783` pushed to `origin/main`.
- Cloudflare Version ID: `0ceddb56-cc3e-4820-a132-3ee5e01ba94a`.
- Preview asset: `/admin-center-preview/assets/index-BgDOmMqw.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- The protected `/api/admin/reports` route now provides a metadata-only queue
  over existing video and messenger reports with status filters. It does not
  expose report details, private conversation IDs or bodies, recordings, or
  stream data, and it presents no unverified resolution mutation.
- Anonymous boundary checks: preview, exact preview asset, `/api/admin/reports`,
  `/admin-panel.html`, and `/api/admin/overview` returned HTTP 403; public
  article/video/event listings returned HTTP 200; `/live-video` returned HTTP
  200 with Coming Soon preserved.
- No D1 migration, report mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was performed.

## Release documentation sync

- Documentation commit: `3b8ba6d` pushed to `origin/main`.
- Documentation sync Cloudflare Version ID: `763f96a9-19ee-472a-bbd0-f20531d615df`.
- The sync published the updated deployment report and regression results;
  runtime code remained unchanged.

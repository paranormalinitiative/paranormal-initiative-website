# TPI-ADMIN-009 — Deployment report

Status: **DEPLOYED WITH LIMITATIONS — protected preview only**.

This directive preserves `/admin-panel` and targets only the protected
`/admin-center-preview/` route. The verified code batch is the explicit
read-only Community Reactions view and the Member Directory label update.

Pre-deployment evidence:

- Baseline: `a7bf0cf0b983085211d62a5d9f3107b898f20798`.
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`.
- Worker: `theparanormalinitiative`.
- Build: PASS.
- Focused QA: `73/73` PASS.
- No production database, R2, auth, Creator Studio, livestream, or
  `/admin-panel` changes.

## Verified preview deployment

- Git commit: `c7bc24b` pushed to `origin/main`.
- Cloudflare Version ID: `1e85a141-7234-4b47-8e1d-f4ae9b3aabab`.
- Live preview: `https://paranormalinitiative.com/admin-center-preview/`.
- Preview JavaScript asset: `/admin-center-preview/assets/index-fn4DGWTu.js`.
- Preview CSS asset: `/admin-center-preview/assets/index-CcAOeEMa.css`.
- Cloudflare bindings resolved to the designated D1 `tpi_contributor_portal`,
  R2 `tpi-contributor-media`, and `ASSETS` binding.
- Production regression: `/` HTTP 200; `/live-video` HTTP 200; `/admin-panel`
  HTTP 403 without an authorized session; preview HTML, the new preview asset,
  and `/api/admin/overview` HTTP 403 without an authorized session; the 009
  parity document HTTP 200.
- Anonymous 403 is expected and is not evidence of authenticated functionality.
- `/admin-panel` was not replaced. No D1 migration, production record,
  R2-object, authentication, Creator Studio, Founding 50, or livestream change
  was made.
- Authenticated owner/admin browser acceptance and rollback verification remain
  pending and are not claimed as passed.

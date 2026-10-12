# TPI-ADMIN-009 — Deployment report

Status: **PENDING VERIFIED PREVIEW DEPLOYMENT**.

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

The deployment identifier and live asset hash will be appended after the
verified preview deployment. Anonymous 403 is expected and is not evidence of
authenticated functionality.

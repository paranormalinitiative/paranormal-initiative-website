# TPI-ADMIN-010 — Regression Results

Pre-deployment results for this batch:

- `node scripts/e2e/admin-community.mjs`: PASS.
- `node scripts/qa/tpi-admin-006-preview.mjs`: 75/75 PASS.
- `node scripts/qa/tpi-admin-005-preview.mjs`: PASS (all six checks).
- `node --check 'functions/api/[[path]].js'`: PASS.
- `git diff --check`: PASS.
- `npm run build` in `admin-center-app`: PASS.

The existing QA suite covers preview protection, API boundaries, navigation,
member privacy, deleted-content filtering, theme tokens, and preservation of
the legacy admin route.

Live production smoke results for runtime commit `fa56fc6` and Cloudflare
Version ID `0b9dccc1-590b-463f-a187-01223dca4a4a`:

- Homepage: HTTP 200.
- `/live-video`: HTTP 200 with `Coming Soon`.
- `/admin-panel`: HTTP 403 anonymously.
- `/admin-center-preview/`: HTTP 403 anonymously.
- New preview JavaScript asset: HTTP 403 anonymously.
- Community posts admin API: HTTP 403 anonymously.
- TPI-ADMIN-010 audit document: HTTP 200.

These are anonymous endpoint checks. Authenticated owner/admin acceptance,
functional rollback verification, and physical production data workflows
remain pending and are not classified as passed.

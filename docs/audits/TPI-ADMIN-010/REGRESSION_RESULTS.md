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
the legacy admin route. Production smoke checks and deployment evidence are
recorded in `DEPLOYMENT_REPORT.md` after deployment.

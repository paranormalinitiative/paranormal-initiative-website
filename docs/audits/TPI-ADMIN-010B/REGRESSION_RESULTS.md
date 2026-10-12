# Regression Results

Pre-deployment results:

- `node scripts/e2e/admin-comments-reports.mjs`: PASS.
- `node scripts/e2e/admin-community.mjs`: PASS.
- `node scripts/qa/tpi-admin-006-preview.mjs`: 78/78 PASS.
- `node scripts/qa/tpi-admin-005-preview.mjs`: PASS.
- `node --check 'functions/api/[[path]].js'`: PASS.
- `git diff --check`: PASS.
- `npm run build` in `admin-center-app`: PASS.

Build output: `admin-center-preview/assets/index-DHCMRuca.js`; CSS remains
`index-CcAOeEMa.css`. The existing large JavaScript chunk warning remains a
non-failing build advisory.

Live route and asset results will be appended after deployment.

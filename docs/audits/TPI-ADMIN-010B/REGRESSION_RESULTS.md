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

Live results for runtime commit `45649cc`, Cloudflare Version ID
`41858f81-27d2-413d-821b-6a03f7316bf3`, and asset
`index-DHCMRuca.js`:

- Homepage: HTTP 200.
- `/live-video`: HTTP 200 with `Coming Soon`.
- `/admin-panel`: HTTP 403 anonymously.
- `/admin-center-preview/`: HTTP 403 anonymously.
- New preview JavaScript asset: HTTP 403 anonymously.
- Community comment detail API: HTTP 403 anonymously.
- Report detail API: HTTP 403 anonymously.
- TPI-ADMIN-010B audit document: HTTP 200.

# TPI-ADMIN-009 — Regression results

## Local source/build checks

- Admin Center Vite/TypeScript build: PASS.
- Worker syntax: PASS.
- `git diff --check`: PASS.
- Focused `scripts/qa/tpi-admin-006-preview.mjs`: PASS, `73/73`.
- Existing `scripts/qa/tpi-admin-005-preview.mjs`: PASS.
- Vite emitted only the existing large-chunk advisory.

## Production protection checks

The previous verified deployment preserved the following anonymous boundaries:

- `/`: HTTP 200.
- `/live-video`: HTTP 200 with Coming Soon.
- `/admin-panel`: protected.
- `/admin-center-preview/`: HTTP 403 without an authorized session.
- Protected preview assets and Admin APIs: HTTP 403 without an authorized
  session.

The current batch changes only the protected preview bundle and focused QA
source. Authenticated production rendering and mutation behavior are not
claimed as passed.

## TPI-ADMIN-009 preview release

- Runtime commit: `c7bc24b`, pushed to `origin/main`.
- Cloudflare Version ID: `1e85a141-7234-4b47-8e1d-f4ae9b3aabab`.
- Asset hash: `index-fn4DGWTu.js`; CSS remained `index-CcAOeEMa.css`.
- Production smoke: homepage and `/live-video` HTTP 200; `/admin-panel`,
  preview HTML, exact preview asset, and protected overview API HTTP 403
  without an authorized session; 009 parity documentation HTTP 200.
- Authenticated owner/admin and rollback tests remain pending.

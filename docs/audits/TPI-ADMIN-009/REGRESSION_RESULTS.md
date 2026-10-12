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

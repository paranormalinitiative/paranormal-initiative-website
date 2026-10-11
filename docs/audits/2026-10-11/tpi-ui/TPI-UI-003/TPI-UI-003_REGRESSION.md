# TPI-UI-003 Regression Results

## PASS

- `node --check member-shell.js`
- `node --check scripts/verify/workspace-layout.mjs`
- `node --check scripts/verify/workspace-layout-ui-003.mjs`
- `node scripts/verify/workspace-layout.mjs`
- `node scripts/verify/workspace-layout-ui-003.mjs`
- `git diff --check`

The focused checks cover workspace route scope, cache-busted assets, reserved
header account slots, Settings sidebar geometry, Administration flexible width
rules, existing Back to TPI/title hooks, and ordinary member-page preservation.

## Additional verification

- Settings API/auth harness: PASS for real API/SQLite auth gates, enum
  validation, owner isolation, theme persistence, public style boundaries, and
  Messenger block-list behavior.
- Settings browser phase: BLOCKED because Playwright is not installed.
- TPI-QA-001 read-only gate: 7 repository syntax/bash checks PASS, local API
  E2E explicitly BLOCKED because it was not requested, StudioFlow checks
  explicitly BLOCKED because this frontend-only directive does not modify
  StudioFlow, and pre-release production smoke PASS 10/10.

Cloudflare dry-run and final deployment smoke are recorded after execution in
the production verification and release reports.

## Post-deployment verification

- Cloudflare dry-run: PASS.
- Public production domain smoke: PASS 10/10.
- Worker endpoint smoke: PASS 10/10.
- Versioned CSS/JS asset checks: PASS for `workspace-shell.css?v=3` and
  `member-shell.js?v=57`.
- Anonymous `/studio/` denial, `/live-video` Coming Soon, and private API
  boundaries: PASS on both endpoints.

Authenticated visual owner acceptance is not inferred from source assertions.

# Friends Workspace UI Correction

Date: 2026-11-10
Status: COMPLETE — DEPLOYED AND VERIFIED

## Root cause

`friends.html` used isolated page-local styling and unclassed native form
controls. The page therefore bypassed the shared `body.member-mode` controls
used throughout the member workstation. It also displayed a second Friends
heading inside the panel below the shell-generated page heading.

## Correction

- Reused the shared `member-panel` surface.
- Applied `member-input` to member search.
- Applied `member-btn` variants to Find members, Follow, and Unfollow.
- Applied `member-section-title` to the two Friends sections.
- Matched member-shell theme variables for surfaces, borders, typography,
  hover states, and status text.
- Added responsive full-width controls and stacked member rows on narrow
  screens.
- Preserved all Friends API calls and follow/unfollow behavior.

## Verification

- `npm run verify:community-workstation`: 12/12 PASS.
- `node --check member-shell.js`: PASS.
- `git diff --check`: PASS.
- No migration, API, authentication, Messenger, or member data changes.

## Production release

- Application commit: `5a02baa42a5d0343d1e84c3854cfc2e067050fad`.
- Certified release: `rel-5a02baa42a5d-8e7bafee3516`.
- Worker: `8caaf9f4-bb79-4721-ae8b-676808e76b38` at 100% traffic.
- Rollback Worker: `6e552552-9458-4506-ab8f-48fd8e4b45fc`.
- Certification: 30/30 gates passed.
- Live anonymous smoke: 10/10 passed.
- Isolated Firefox Developer Edition production acceptance: 65/65 passed;
  the owner Firefox profile was not accessed.

The Friends-specific contract remains covered by the focused 12/12 checks. The
production release uploaded the corrected `friends.html` asset and did not
change database schema, API behavior, authentication, or member data.

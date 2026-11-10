# Friends Workspace UI Correction

Date: 2026-11-10
Status: IMPLEMENTED — RELEASE VERIFICATION PENDING

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

The guarded release and live Firefox acceptance will be recorded here after
the corrected page is deployed.

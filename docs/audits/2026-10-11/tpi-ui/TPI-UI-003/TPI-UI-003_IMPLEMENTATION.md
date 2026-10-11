# TPI-UI-003 Implementation

- Added a reserved account/Messenger slot to both workspace headers.
- Updated `member-shell.js` so only the collapsed Messenger owner control is
  mounted in that slot; opening it restores the existing floating panel.
- Removed the Settings route's centered 1600px wrapper and matched the
  Administration sidebar geometry: flexible `248px + minmax(0, 1fr)` columns,
  24px gap, sticky top alignment, and shared card treatment.
- Made Administration content sections explicitly use the available main
  column width while preserving all existing data, navigation, and APIs.
- Added intentional desktop, tablet, and mobile header/account reflow rules.
- Advanced workspace cache versions to `workspace-shell.css?v=3` and
  `member-shell.js?v=57`.
- Added `scripts/verify/workspace-layout-ui-003.mjs` and updated the existing
  workspace regression guard for the new approved architecture.

No authentication, authorization, API, D1, R2, recording, membership,
entitlement, role, StudioFlow, or public navigation behavior was changed.

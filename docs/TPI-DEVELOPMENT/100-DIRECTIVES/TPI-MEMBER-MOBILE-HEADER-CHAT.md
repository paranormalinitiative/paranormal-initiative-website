# Member Mobile Header and Messenger — Production Repair

Date: 2026-11-09  
Status: **COMPLETE — DEPLOYED AND VERIFIED**

## Problem

On narrow mobile viewports, the authenticated member greeting was absolutely
positioned in the command header while the header title remained in the same
horizontal row. The two regions could overlap. The floating Messenger frame
also expanded by default when no mobile preference had been saved, reducing
available space on mobile.

## Correction

- At mobile widths, the command header now uses normal flow and gives the
  authenticated greeting its own row, preventing overlap with the title/logo.
- Messenger now defaults to minimized on mobile when no explicit mobile
  expansion preference exists.
- An intentional mobile **Show** action is preserved through the stored
  `mobileExpanded` preference; this does not disable Messenger.
- Updated the member-shell asset reference to `member-shell.js?v=56`.

Files changed:

- `member-home.html`
- `member-shell.js`
- `scripts/qa/tpi-ops-011-member-home.mjs`

## Verification

- JavaScript syntax and diff checks: PASS.
- Focused member-home QA: **40/40 PASS**.
- Isolated Firefox mobile geometry check: PASS — `titleGreetingOverlap=false`,
  greeting position `static`, and `chatCollapsed=true`.
- Guarded release preflight: **30/30 gates certified**.
- Production smoke: **10/10 PASS**.
- Live isolated Firefox acceptance: **65/65 PASS**.
- Live artifact check: `member-home.html` and `member-shell.js` returned HTTP
  200; the entrypoint returned `public, max-age=0, must-revalidate`; the live
  HTML referenced `member-shell.js?v=56`; the mobile-header and mobile-default
  logic were present in the served assets.

The first Selenium form interaction attempt failed with an automation
`ElementNotInteractableError`; it was not an application failure. The
supported DOM-driven isolated Firefox check then passed, and no creator data
was changed.

## Release

- Source website commit: `d81da4e7d08673098d68fd9f17e48959dcd95b4c`.
- Release ID: `rel-d81da4e7d086-71f677773147`.
- Production Worker: `2ce0b94d-5eb7-45dd-a55f-7965da187668`.
- Previous/rollback Worker: `bcb18b54-6841-46ef-9996-973ec061b251`.
- Traffic: 100% on the new Worker.
- Uploaded release assets: `/admin-center-preview/release.json`,
  `/member-home.html`, `/member-shell.js`.
- Production deployment did not modify creator data, membership records, or
  databases.

If an already-open mobile tab still shows the old header or expanded chat,
open a fresh tab or hard-refresh it so the updated entrypoint and shell asset
are loaded.

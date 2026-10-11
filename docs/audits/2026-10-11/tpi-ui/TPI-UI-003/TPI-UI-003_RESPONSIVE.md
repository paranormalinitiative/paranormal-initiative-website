# TPI-UI-003 Responsive Verification

Implemented route-scoped responsive behavior for the requested ranges:

- Wide desktop: flexible Settings and Administration main columns with the
  account control reserved in the header.
- Tablet: header becomes a two-row grid with the account slot on its own row;
  workspace actions remain visible and the existing Administration sidebar
  collapse behavior remains intact.
- Mobile: header becomes an intentional single-column layout; account controls,
  session status, Back to TPI, Settings navigation, and dashboard cards remain
  accessible without page overflow.
- Open Messenger remains the existing mobile-safe floating panel; only its
  collapsed account bar is placed in the workspace header.

Static breakpoint checks pass. Authenticated rendered screenshot verification
at 1920/1600/1440/1280/1024, 834/800/768, and 430/390/375/320 remains an owner
review item because no authorized browser session or installed Playwright
fixture was available.

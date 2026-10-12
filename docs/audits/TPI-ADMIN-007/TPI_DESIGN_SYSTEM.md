# TPI-ADMIN-007B — TPI Administration Design System

## Scope

ADMIN-007B applies the existing Paranormal Initiative visual system to the
protected Refine + shadcn/ui Administration Center preview. It does not replace
or redesign production `/admin-panel`, change StudioFlow access, or alter data.

## Source of truth

The preview is mapped from the established website theme in `style.css` and
the six-theme behavior in `member-shell.js`. The default `cryptid` tokens are:

| Role | Value |
| --- | --- |
| Primary backgrounds | `#1a221e`, `#161d19`, `#1f2824` |
| Card/elevated surfaces | `#2a3430`, `#323d38`, `#34403a` |
| Sidebar | `#141b17` |
| Accent / hover | `#2f9e44` / `#4bb263` |
| Primary / secondary / tertiary text | `#f2f7f3` / `#cfd6d3` / `#9ba8a0` |
| Accent text / text on accent | `#4bb263` / `#0b140b` |
| Border alpha values | `0.12`, `0.18`, `0.25`, `0.30` of the accent |
| Radii | `16px`, `24px`, `24px`, `32px` |

The remaining supported themes retain their exact source values: `seance`,
`cosmic`, `asylum`, `fieldops`, and `gothicnight`. `main.tsx` reads the
existing `tpiSiteTheme` local-storage key, defaults safely to `cryptid`, and
does not add a separate admin theme preference. The existing source red
`#ef4444` is used only as the destructive-state token; no new brand color was
invented.

## Component mapping

The preview maps TPI tokens to the shadcn semantic variables for background,
foreground, card, popover, primary, secondary, muted, accent, destructive,
border, input, ring, sidebar, and chart colors. Shared component classes
therefore inherit the TPI theme rather than a generic framework palette.

- Sidebar and active navigation use the TPI sidebar, accent, border, and glow
  tokens.
- Cards, tables, forms, dialogs, notices, and status states use dark TPI
  surfaces, exact token-derived borders, and the established radius scale.
- Charts use the TPI accent and supporting theme tokens.
- Focus-visible controls use a two-pixel accent outline with offset.
- Mobile navigation, tables, cards, dialogs, and two-column layouts reflow at
  the existing preview breakpoints.

## Verification

The source-level theme regression suite checks all six themes, the semantic
shadcn mappings, dark color scheme, chart/sidebar variables, and removal of the
former generic light palette. The protected preview production smoke checks
remain separate from authenticated visual acceptance.

Current status:

- Automated theme/isolation regression: **PASS — 16/16 checks**.
- Preview production build: **PASS — TypeScript and Vite build completed**.
- Local rendered mobile visual check: **PASS — dark TPI preview rendered; API
  data remained correctly unavailable without an authenticated Worker session**.
- Local rendered desktop screenshot: **NOT CAPTURED — the available in-app
  browser surface was mobile-sized; authenticated desktop owner review remains
  open**.
- Authenticated owner visual acceptance: **NOT YET VERIFIED**.
- Public `/admin-panel` replacement: **NOT PERFORMED**.

Release evidence: source commit `5521f55`; Cloudflare Worker version
`29c88d39-25be-42dd-8ac5-2753d3b11811`. Anonymous access protection remained
active after deployment.

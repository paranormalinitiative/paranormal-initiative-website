# TPI-STUDIOFLOW-122E.1 — Home Create Section Layout Correction

Date: 2026-10-31  
Status: COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED

## Objective

Correct the Home Create section so the five production tools remain balanced,
usable, and free of document-wide horizontal overflow at responsive widths.

Required order:

`Live stream | Recording | On-Air webinar | Notes | Teleprompter`

## Root cause

The existing `.create-grid` used `repeat(auto-fit, minmax(240px, 1fr))`.
Because the authenticated Home content area is narrower than the full browser
viewport after the StudioFlow navigation rail and content padding are applied,
five cards could not satisfy the 240px minimum and Teleprompter wrapped early.

## Implementation

The isolated StudioFlow source worktree
`/Users/toddknipple/Documents/StudioFlow/web-122` remains the source of record
and the original mixed checkout was not modified. The correction is CSS-only:

- Wide layouts use five equal `minmax(0, 1fr)` tracks.
- Medium layouts use three columns.
- Tablet layouts use two columns.
- Mobile layouts use one column.
- The dashboard content grid item can shrink, existing Home context menus stay
  inside narrow viewports, and existing production rows stack below the tablet
  breakpoint so the document itself does not gain horizontal scrolling.
- The five Home card actions, titles, icons, descriptions, and order are
  unchanged.

The final source commit is `1e08da2b651136ea19a654ad03b97ddd45ca4457` on
`codex/studioflow-122-notes`. The final candidate was built twice from the
exact clean approved commit and staged through
`scripts/stage-studioflow-authoritative.mjs --apply`.

## Candidate identity

- Authoritative URL: `http://127.0.0.1:8787/studio/`
- Runtime: local Cloudflare Worker (`workerd`)
- Source commit: `1e08da2b651136ea19a654ad03b97ddd45ca4457`
- JavaScript: `index-DmaCJVhN.js`
- JavaScript SHA-256: `e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`
- CSS: `index-DLIu5icU.css`
- CSS SHA-256: `e09191f0e7f94bacea4e63876cf3d5e407c9b7076d7f4ab35203e71992e0ea13`
- Integrated entry-point SHA-256: `8d3e810c55042f33bb0a1e519c15a398049bfff5364373ff4a6e8adeba67c0c7`

## Verification

Focused verifier: `scripts/verify/tpi-studioflow-122e1-home-create-layout.mjs`

Firefox Developer Edition acceptance on the actual authenticated 8787 Worker:

- Local login/session: PASS
- Five cards and required order: PASS
- Wide desktop 1440px: five cards in one row, equal widths, no horizontal
  document overflow: PASS
- Medium desktop 1000px: balanced 3+2 rows, equal widths, no overflow: PASS
- Tablet 760px: balanced 2+2+1 rows, equal widths, no overflow: PASS
- Mobile 560px: one-column layout, equal widths, no overflow: PASS
- Focused suite: 19/19 PASS
- Maintained Firefox StudioFlow regression: 64/64 PASS
- Release safety: 21/21 PASS

The existing D122E Notes/Home/deletion evidence remains historical and is not
rewritten. Production was not contacted or modified. Existing Studio data,
recordings, Notes data, and deletion safeguards were preserved.

## Release status

Development-only staging is complete. No production deployment is authorized
under TPI-STUDIOFLOW-122E.1. The owner may inspect the corrected Home screen at
the authoritative local URL.

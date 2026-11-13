# TPI-OPS-017 — Site-Wide Shell and Theme Audit

Verified: 2026-11-12  
Source: tracked HTML files and shared theme/shell implementation in the canonical repository.

## Scope and method

This audit checks whether current site pages use the shared public or member
shell, whether legacy brand-header markup remains on in-scope pages, and
whether the six saved site themes are applied by the shared Worker bootstrap
or by standalone application code. It is a source audit, not a full browser
acceptance pass.

The following content is explicitly outside the change scope and was not
modified: every HTML file under `haunted-location-directory/`, and the five
standalone Repository books:

- `TPI_Evidence_Compendium.html`
- `TPI_Field_Encyclopedia.html`
- `TPI_Forensic_Analysis_Compendium.html`
- `TPI_Investigation_Compendium.html`
- `TPI_Terminology_Reference_Unified.html`

## Current inventory

| Measure | Count |
| --- | ---: |
| Tracked HTML documents | 293 |
| Haunted Location directory documents excluded by scope | 51 |
| Standalone Repository books excluded by scope | 5 |
| Shared HTML fragments excluded from page counts | 3 |
| In-scope HTML page files | 234 |
| In-scope pages with shared `site-header` markup | 211 |
| In-scope pages with member-content wrapper | 35 |
| In-scope pages with member-shell CSS | 37 |
| In-scope pages with member-shell JS | 36 |
| In-scope pages containing `.brand-header` legacy markup | 0 |
| Tracked pages containing `.brand-header` (all excluded) | 29 |

The 29 legacy brand-header files consist of 24 Haunted Location state pages
and the five protected standalone books. No other tracked page uses that
legacy header.

## Findings

### Complete: core site and member pages share theme behavior

The Worker injects the early theme bootstrap into served HTML documents that
do not already contain it. Server-generated access pages now use that same
bootstrap and theme color tokens. The bootstrap applies the browser's saved
`tpiSiteTheme` choice from the supported set: Cryptid, Seance, Cosmic, Asylum,
Field Ops, and Gothic Night. Public pages also load `includes.js`; member
pages load the shared member shell, which can hydrate the signed-in member's
saved theme. The Administration Center source applies the cached theme first
and then refreshes it from the authenticated account response.

The Paranormal Teams directory pages apply the same six-theme preference in
their head and provide corresponding theme token sets in `teams/teams.css`.
The browser audit found Nova Editorial's internal workspace color tokens were
fixed to Cryptid even though the shared Worker correctly set the selected
theme. Nova now maps its workspace tokens to all six themes. Its HTML entry
document still has a Cryptid fallback attribute, which the shared Worker
replaces with the stored choice when served through the site.

### Complete: no in-scope legacy brand-header pages found

All in-scope HTML with the shared public shell or member shell is on the
current design path. The remaining 29 old-header files are the protected
books listed above. They remain untouched.

### Intentional separate application surfaces

StudioFlow, Nova Editorial, Administration Center, the Teams directory, and
the full-screen Reels experience have their own application layouts. Their
different navigation chrome is an application boundary, not evidence that a
content page has reverted to the old site template. The theme preference is
carried across these surfaces through the shared Worker bootstrap or their
own theme bridge. Nova Editorial has explicit theme palettes now. Restricted
and coming-soon access gates also follow the saved theme.

### Not fully verified in this audit

- The official local Worker at `127.0.0.1:8787` was available for targeted
  Firefox checks. The checks sampled the home page, Education Center,
  Ghostology, Teams, Nova's access gate, and the authorized Nova workspace.
- All six themes were exercised on those representative routes and in the
  authorized Nova workspace. This was not a page-by-page visual pass across
  all 234 in-scope pages.
- The older OPS-015/OPS-016 records are historical snapshots of a 284-route
  inventory. Their historical results should not be read as the current
  tracked-file count or as a fresh site-wide browser certification.

## Status and next work

The source audit found no in-scope legacy header requiring a site-wide
replacement. It did find and fix Nova's fixed Cryptid workspace palette, and
the access-gate screens now follow the saved theme. The representative Firefox
theme route pass passed 48/48 across the home page, Education Center,
Ghostology, member profile, Teams, Reels, Nova, and the Administration Center
gate. Nova access-gate color checks passed 6/6.
Education Center/Ghostology acceptance passed 30/30, Nova's six workspace
palettes passed 6/6, site theme source checks passed 5/5, and navigation
checks passed 13/13. The official local Worker is
available at `127.0.0.1:8787`.

A full page-by-page visual pass remains open. It should cover the remaining
in-scope public pages, member pages, and application surfaces, while continuing
to exclude all Haunted Location books and all other Repository books.

Nova's theme token source and generated build assets, plus the shared Worker
theme behavior for access gates, were changed locally. No books, member data,
production data, or production site were changed.

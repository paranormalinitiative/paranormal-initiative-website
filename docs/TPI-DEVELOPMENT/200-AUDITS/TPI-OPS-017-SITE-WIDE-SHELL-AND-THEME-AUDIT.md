# TPI-OPS-017 — Site-Wide Shell and Theme Audit

Verified: 2026-11-12; production release verified 2026-11-13 UTC
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

The exact list of 234 in-scope HTML files is in the
[in-scope HTML inventory](TPI-OPS-017-IN-SCOPE-HTML-INVENTORY.md). This is a
source-file count, not 234 distinct public URLs: the list includes individual
lessons and articles, application entry points, and internal preview/lab
files. Route and authentication behavior varies by file.

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

The Firefox route pass also found invalid modern HTML pattern syntax on the
username and creator-channel fields. Literal punctuation and hyphens are now
escaped for the browser's current Unicode-set (`v`) pattern rules. The local
Firefox check confirms the fields accept valid values and reject spaces. This
small cross-browser correction is verified locally; it is not part of the
previously recorded production release and must go through the guarded release
workflow before being considered live.

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
- A subsequent local Firefox route/render matrix checked all 234 in-scope
  HTML files with anonymous and synthetic role sessions. All 234 were
  accounted for: 227 passed normally, seven had documented expected
  limitations, zero failed, and zero remained unverified. Focused interaction
  checks passed 61/61. The [browser acceptance report](TPI-OPS-017-BROWSER-ROUTE-ACCEPTANCE.md)
  lists every file and its outcome.
- The seven expected limitations are five internal source/test files that are
  not Worker-served visitor pages, one editor bootstrap that only renders when
  mounted inside Paper Editor, and Nova's intended anonymous authentication
  gate. No broken user-facing route was found in this pass.
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

A visual consistency review remains open; the 234-page pass verifies expected
response, rendering, and focused interactions, but does not compare every
page's spacing, responsive layout, theme color rendering, images, and shared
navigation at desktop and mobile sizes. Continue with representative page
families and responsive/theme checks, then fix confirmed exceptions in shared
components first. Keep all Haunted Location books and other Repository books
excluded. The [browser runner](../../../scripts/e2e/tpi-ops-017-browser-routes.mjs)
and route report make reruns reproducible without asking the owner to review
234 pages individually.

### Production release

The changes were deployed through the guarded release workflow from source
commit `8d444b943916a68a995facc1dbdbf1393b3dec2f` as release
`rel-8d444b943916-8e1f9c61cc85`. The active Worker version is
`33e72eed-f4f3-41bd-9106-0217ee89baf1`; the release workflow confirmed that it
held 100% of traffic.

- Release preflight: certified; all 30 release gates passed.
- Live anonymous production smoke: 10/10 passed.
- Live isolated Firefox Developer Edition acceptance: 65/65 passed.
- Production schema readiness was read-only and passed with no pending
  migrations.
- Rollback version captured before deployment:
  `f65602de-f2ff-4af4-85e4-bef08490f6ee`.

The production release changed the Nova Editorial theme palettes and the
shared theme behavior for access gates. No Haunted Location books, other
Repository books, or production data were changed. Local route/render and
focused interaction checks now pass across the complete 234-file scope. The
responsive and visual consistency review remains the next audit phase.

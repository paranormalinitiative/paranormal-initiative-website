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
escaped for the browser's current Unicode-set (`v`) pattern rules. Firefox
checks confirm the fields accept valid values and reject spaces. The fix was
deployed and passed the guarded live acceptance recorded below.

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
- A follow-up responsive visual sample checked 17 representative routes in
  their applicable anonymous/member/contributor/administrator sessions, at
  desktop and phone sizes, across all six themes (204 combinations). It found
  and repaired narrow-screen overflow in the profile editor, Settings, and
  member home. The final local sweep passed with zero layout overflow, theme
  mismatch, blank route, broken local image, browser error, or title/greeting
  overlap. Details and runner are in
  [the responsive visual sample review](TPI-OPS-017-RESPONSIVE-VISUAL-SAMPLE-REVIEW.md).
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

A full visual consistency review remains open; the 234-page pass and the
representative responsive sample do not compare every page's spacing, layout,
theme color rendering, images, and navigation at every desktop/mobile size.
Continue with representative page families and responsive/theme checks, then
fix confirmed exceptions in shared components first. Keep all Haunted Location
books and other Repository books excluded. The
[browser runner](../../../scripts/e2e/tpi-ops-017-browser-routes.mjs) and route
report make route reruns reproducible without asking the owner to review 234
pages individually.

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

The earlier production release changed the Nova Editorial theme palettes and
the shared theme behavior for access gates. No Haunted Location books, other
Repository books, or production data were changed.

The follow-up browser-compatibility fix was deployed from source commit
`926fbdd8b65924857b6a81a068598564cf570f8c` as release
`rel-926fbdd8b659-1e05e0517898`. Worker version
`0df5ebd5-e07c-42d8-a094-bd7d4f1abe75` holds 100% of production traffic;
rollback version `33e72eed-f4f3-41bd-9106-0217ee89baf1` was captured before
deployment. Certification passed all 30 release gates, including the
authentication lifecycle (38/38 before and after restart and 38/38 after the
production build), production preflight, and the StudioFlow regressions.
Live anonymous production smoke passed 10/10, and isolated Firefox Developer
Edition production acceptance passed 65/65. Production schema readiness was
read-only and passed without pending migrations. No protected books or
production data were changed.

The responsive and visual consistency review remains open. The route/render
and focused interaction checks now pass across the complete 234-file scope,
but they do not compare every page's spacing, responsive layout, images, and
shared navigation at desktop and mobile sizes across every theme.

### Responsive sample follow-up — 2026-11-12

The representative responsive review in
[`TPI-OPS-017-RESPONSIVE-VISUAL-SAMPLE-REVIEW.md`](TPI-OPS-017-RESPONSIVE-VISUAL-SAMPLE-REVIEW.md)
checked 17 routes across six themes, applicable roles, and desktop/phone
viewports (204 combinations). It fixed mobile overflow in the profile editor,
Settings, and member home. The final sweep passed with zero layout, theme,
rendering, image, browser-error, or title/greeting overlap findings. The
profile editor also passed ten viewport widths from 320px to 1440px.

The repairs deployed as release `rel-da185da5ae93-5ab88ae30d0e` from source
commit `da185da5ae939b75d74670944135e8084e01172d`, Worker
`c48da23b-d832-49ed-97fd-38e398798807` at 100% traffic. The guarded preflight
passed 30/30, production smoke passed 10/10, and isolated Firefox acceptance
passed 65/65. This completes the representative sample, not visual review of
all 234 pages. Protected books and production data were not changed.

### Member right-rail order — 2026-11-12

The member right rail is now ordered consistently for the signed-in member and
viewed profiles: My Pulse, Honors & Distinctions, Active People, People to
Discover, Recently Viewed Members, ParaNews Spotlight, Featured Content,
Upcoming Events, and Active Discussions. The redundant standalone Featured
Video panel was removed; video remains represented in Featured Content. Local
Firefox confirmed the requested order on both member home and a member profile.
The release record is
[`TPI-OPS-017-MEMBER-RIGHT-RAIL-ORDER.md`](TPI-OPS-017-MEMBER-RIGHT-RAIL-ORDER.md).

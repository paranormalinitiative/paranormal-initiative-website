# Browser acceptance

Status: **BLOCKED** for authenticated acceptance.

The local rendered preview previously confirmed the complete navigation and
honest API error state when served without Worker/D1. Production anonymous
access gates were verified. No owner/admin session was available to render
real member records, reports, charts, or mutation success states.

Owner-assisted procedure: open `/admin-center-preview/` with an authorized test
account, open All Members, inspect each detail tab, confirm original-content
links, verify empty/error states, and use only a disposable test account for
block/reactivate checks.

Anonymous production smoke checks passed for the deployed protected preview:

- `/admin-center-preview/` returned HTTP 403 with the restricted gate.
- `/api/admin/members` returned HTTP 403.
- `/admin-panel.html` returned HTTP 403.
- `/live-video` remained public with its Coming Soon state.

These checks verify the access boundary only; they do not replace authenticated
owner acceptance of real member records or administrative actions.

ADMIN-007A local rendered preview evidence:

- The rebuilt protected preview rendered the Community group with Reports &
  Moderation and Moderation History.
- The rebuilt protected preview rendered Content & Publishing with Contributor
  Management, Paranormal Teams, Education Center, and Article Comment Moderation.
- Selecting Reports & Moderation rendered its isolated integration-boundary
  view; no unrelated contributor/team/article panels were rendered.
- Legacy `/admin-panel` owner/admin visual acceptance remains pending an
  authorized session.

Deployment evidence: commit `2859f7c`, Cloudflare version
`31086383-9600-4ca8-abef-8cc4928cee3a`.

ADMIN-007B visual review status:

- The protected preview now uses the existing TPI dark theme and six-theme
  architecture rather than the former generic light dashboard palette.
- A local mobile-sized browser render was captured and visibly showed the dark
  TPI background, green accent treatment, dark cards, and responsive stacked
  layout. A desktop screenshot was not captured because the available in-app
  browser surface was mobile-sized.
- Authenticated owner review and desktop/tablet visual checks are still
  required before visual acceptance is marked complete.
- This directive does not replace `/admin-panel`; it only updates the protected
  preview application.

ADMIN-007B deployment evidence: source commit `5521f55`, Cloudflare Worker
version `29c88d39-25be-42dd-8ac5-2753d3b11811`. Anonymous route verification
passed for the protected preview and direct asset, legacy `/admin-panel.html`,
public `/live-video` Coming Soon, and the homepage. This is access-boundary
evidence, not authenticated owner visual acceptance.

## ADMIN-007C — live deployment verification

The latest committed Administration Center build remains:

- GitHub HEAD: `f4cbf675fba04c1019dd68e19a0e254068afb81d` (`origin/main` matches)
- HTML entry: `/admin-center-preview/index.html`
- JavaScript asset: `index-DB483ZS4.js`
- CSS asset: `index-CcAOeEMa.css`
- Local SHA-256: JS `3c3cf483809d1a2adb281ccbd3728d1c614b62adae40b26179aa5e278337a252`;
  CSS `f0d29ea39ebb533eea1b626e5e7c9e0819185f9627f34c1211b14522d2222748`
- The themed asset bundle was uploaded in Cloudflare Version
  `29c88d39-25be-42dd-8ac5-2753d3b11811`; later versions `0c4e6846...` and
  `961d08c3...` contained documentation-only changes.

Live anonymous routing verification:

- `/admin-center-preview/`: **PASS — HTTP 403**
- Direct `/admin-center-preview/assets/index-DB483ZS4.js`: **PASS — HTTP 403**
- `/admin-panel.html`: **PASS — HTTP 403**
- `/live-video`: **PASS — HTTP 200 with Coming Soon**
- `/`: **PASS — HTTP 200**

Authenticated owner/admin verification is **BLOCKED** in this environment;
no authorized production session was available. This means the live gate and
asset protection are verified, but it does not claim that an authenticated
browser session loaded the UI or exercised its APIs.

Owner-assisted verification: sign in with an authorized TPI administrator,
open <https://paranormalinitiative.com/admin-center-preview/>, hard-refresh,
confirm the dark TPI sidebar/dashboard, open Members, Analytics, Reports &
Moderation, and inspect browser console/network failures. Confirm `/admin-panel`
is unchanged and ordinary signed-out access remains denied.

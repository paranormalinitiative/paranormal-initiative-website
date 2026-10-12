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

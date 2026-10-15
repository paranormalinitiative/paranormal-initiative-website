# TPI-DEV-034 — Unified Website Layout and Navigation

## Scope

TPI-DEV-034 unifies the ParaNews and ParaTube content hubs with the existing
TPI website/member shell. The work applies to the canonical routes `/news`
and `/paratube` and preserves the existing content APIs, card rendering,
search/category controls, links, and content-generation paths.

The existing `member-shell.js`, `member-shell.css`, `member-sidebar.html`,
authentication boundary, personalization APIs, responsive navigation, and
member-home conventions are the source of truth. No replacement navigation
system or second theme system was introduced.

## Requirements

- Use the established TPI shell and independently scrolling member layout.
- Preserve public `/`, authenticated `/member-home`, and Community Feed
  `/explore` as distinct destinations.
- Keep existing ParaNews and ParaTube APIs, content cards, search, tabs, and
  links functional.
- Remove page-local duplicate headings/navigation where the shared shell now
  supplies the page heading and navigation.
- Use shared theme variables so authenticated personalization can apply.
- Keep canonical aliases `/news.html` and `/paratube.html` redirecting to the
  canonical routes.
- Do not modify D1/R2 data, migrations, imports, production secrets, or
  unrelated application features.

## Delivery boundary

The implementation is a static website-shell correction. It does not alter
the news/video APIs, scrapers, database schema, storage, authentication, or
Administration Center code. Development was deployed first and the same
application commit was promoted through the guarded production procedure.

## Addendum — authenticated home routing and stable page paint

The addendum corrects two shared-shell problems:

- The root route now checks the existing server session. Authenticated users
  receive a 307 redirect to `/member-home`; signed-out visitors continue to
  receive the public `/` document. `/explore` remains an intentional,
  independent Community Feed destination.
- The Worker injects a small early theme bootstrap into HTML responses. It
  uses only the existing local `tpiSiteTheme` preference and applies matching
  dark background/text colors before the full stylesheet and authenticated
  personalization request finish loading. It does not expose session data or
  create a second personalization system.
- `includes.js` now signals when the shared header/footer injection is ready,
  and `member-shell.js` waits for that signal instead of imposing a fixed
  150 ms delay on every navigation. A bounded fallback remains for blocked
  include requests.

The implementation preserves login/logout/session handling, protected routes,
DEV-034 ParaNews/ParaTube work, and the existing public/member navigation.

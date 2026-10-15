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

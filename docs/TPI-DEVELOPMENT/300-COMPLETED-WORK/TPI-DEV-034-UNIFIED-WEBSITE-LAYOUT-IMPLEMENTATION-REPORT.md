# TPI-DEV-034 Implementation Report

## Outcome

**PASSED — implementation, development deployment, production deployment,
and read-only runtime verification completed.**

ParaNews and ParaTube now use the existing TPI member shell and navigation
behavior on their canonical routes:

- ParaNews: `/news`
- ParaTube: `/paratube`
- Public homepage: `/`
- Authenticated member homepage: `/member-home`
- Community Feed: `/explore`

The implementation source commit was `50cedea2bd5e9f7e2f0bad1bcbfd9a9761cc5ee0`.
Only the authorized website-shell files and the focused QA script were part
of that implementation commit. Existing news/video APIs, content rendering,
search/category controls, links, scrapers, authentication, and data storage
were preserved.

## Implementation changes

- Added the canonical shared member shell assets to `news.html` and
  `paratube.html`.
- Wrapped both content hubs in the existing `data-member-content` shell
  contract so the shared sidebar, mobile navigation, auth state, theme, and
  typography behavior apply consistently.
- Removed duplicate page-local `ParaNews` and `ParaTube` H1 headings supplied
  by the shared shell.
- Replaced ParaTube page-local hardcoded accent/background/text values with
  existing TPI theme variables.
- Updated public/member navigation, member-home cards, search index, and
  sitemap links to `/news` and `/paratube`.
- Added focused source QA at
  `scripts/qa/tpi-dev-034-paranews-paratube.mjs`.

No D1/R2 writes, migrations, imports, scraper changes, production data
changes, or Administration Center changes were made.

## Deployment provenance

| Environment | Worker | Version | Application source |
| --- | --- | --- | --- |
| Development | `theparanormalinitiative-dev` | `98cb936a-0c63-4662-b2f6-97b1e76fbafd` | `50cedea2bd5e9f7e2f0bad1bcbfd9a9761cc5ee0` |
| Production | `theparanormalinitiative` | `a2cbde12-0c39-4eeb-ac75-269e66c6dcea` | `50cedea2bd5e9f7e2f0bad1bcbfd9a9761cc5ee0` |

The guarded production staging output recorded the source commit and asset
SHA-256 hashes. The release manifest endpoint is protected by the existing
Administration Center boundary and returned HTTP 403 to anonymous validation,
so no private release metadata was exposed publicly.

The production baseline immediately before promotion was Worker version
`8f251d0d-d4d2-46e0-8be8-3ed3a960035a`.

## Verification

### Offline/source checks — PASSED

- TPI-DEV-034 focused checks: **12/12**.
- Member-home navigation addendum: **10/10**.
- DEV-032 navigation regression: **13/13**.
- DEV-033 StudioFlow regression: **16/16**.
- DEV-030 source checks: **9/9**.
- Workspace layout checks: **2/2** scripts passed.
- JavaScript syntax checks passed for the affected shell, worker, explore,
  include, and API files.
- `git diff --check` passed for the implementation files.

### Development runtime — PASSED

- `/news`, `/paratube`, `/member-home`, and `/explore` returned HTTP 200.
- `/news.html` redirected to `/news` and `/paratube.html` redirected to
  `/paratube`.
- Shared shell assets returned HTTP 200.
- Public news/video API reads returned HTTP 200.
- Anonymous and owner-authenticated development session checks passed.
- Owner `/api/auth/me`, protected Administration Center overview, and member
  management reads returned the expected authorized responses.

### Production runtime — PASSED

- `/`, `/news`, `/paratube`, `/member-home`, and `/explore` returned HTTP 200.
- Canonical `.html` aliases redirected to the new canonical routes.
- Shared shell CSS/JS and member sidebar returned HTTP 200.
- Public news/video APIs returned HTTP 200.
- Anonymous `/api/auth/me` returned no user.
- Anonymous Administration Center API access returned HTTP 403.
- Anonymous `/studio/` access returned HTTP 403.
- Existing read-only production smoke suite passed **10/10**.

## Limitations

- Authenticated production browser acceptance was not performed because no
  production owner session was available in the authorized test environment.
- Desktop/tablet/mobile behavior was verified through the existing shared
  responsive shell source checks and deployed asset/runtime checks; a manual
  owner visual walkthrough remains a recommended acceptance step.

## Preservation and safety

- The authoritative research workspace and historical runs were not touched.
- Existing unrelated `.DS_Store`, StudioFlow audit, research, and prior
  documentation worktree changes remained unstaged and preserved.
- No production or development database/storage data was modified.
- No migrations, imports, deployments outside the authorized development and
  production Workers, commits to `main`, pushes, or merges were performed.

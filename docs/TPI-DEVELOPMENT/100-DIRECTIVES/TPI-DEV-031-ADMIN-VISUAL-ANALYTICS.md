# TPI-DEV-031 — Administration Center Visual Analytics

Date: 2026-10-14
Status: `DEVELOPMENT IMPLEMENTED AND VERIFIED — PRODUCTION NOT DEPLOYED`

## Scope

TPI-DEV-031 adds an interactive Analytics Overview to the existing protected
React Administration Center. It preserves the DEV-030 canonical route,
personalization hydration, authorization boundaries, and existing modules.
The implementation uses native SVG/CSS charts and introduces no charting
dependency, migration, import, or data-writing path.

## Implemented analytics

- Member growth: daily new members and cumulative member total.
- Community engagement: posts, comments, and reactions by day.
- Membership distribution: actual creator-partnership membership categories
  where the source table is available; an explicit unavailable state otherwise.
- Creator activity: creator accounts, channels, published content, and the
  available video engagement totals.
- Moderation: pending, resolved, dismissed, and total reports.
- Content overview: article, video, channel, and community-post counts from
  available first-party sources.
- Website activity: explicitly unavailable because the current schema does not
  provide a reliable first-party visits/page-views source.
- Range selector for today, 7 days, 30 days, and 90 days.
- Hover/focus tooltips, keyboard-focusable chart points, legends, and responsive
  layouts for smaller screens.

All protected analytics data is returned by `GET /api/admin/analytics` through
the existing admin authorization boundary. Aggregate queries are bounded and
read-only; optional source tables fail closed into an explicit unavailable
state rather than fabricating metrics.

## Data and product limitations

The current schema has no general free/paid membership-plan distribution
source. The UI therefore does not invent a plan breakdown. It reports the
available creator-partnership membership distribution or explains why that
metric is unavailable. Likewise, it does not present request counts or other
operational data as website traffic.

Analytics are administrative summaries, not publication or import workflows.
No team records, memberships, posts, media, settings, or other application data
were written by this directive.

## Verification

- `npm run build` in `admin-center-app`: passed.
- `node scripts/qa/tpi-dev-031-analytics.mjs`: 11/11 passed.
- `node scripts/qa/tpi-dev-030-source.mjs`: 9/9 passed.
- `node scripts/qa/tpi-admin-006-preview.mjs`: 81/81 passed.
- `node scripts/qa/tpi-admin-005-preview.mjs`: passed.
- `node scripts/qa/tpi-dev-014-authenticated.mjs`: 57/57 passed against the
  development Worker.
- `node --check worker.js`: passed.
- `node --check functions/api/[[path]].js`: passed.
- `git diff --check`: passed.
- Development API verification: login 200, protected admin panel 200, and
  analytics API 200 with persisted community, creator, moderation, content,
  and explicit website-unavailable results.

Authenticated API verification is complete. An owner production session was
not used and production was not deployed; owner visual browser acceptance of
the protected charts remains a separate acceptance item.

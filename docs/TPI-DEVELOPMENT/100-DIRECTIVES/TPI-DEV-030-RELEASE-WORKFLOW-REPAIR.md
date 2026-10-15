# TPI-DEV-030 — Release Workflow Repair

Date: 2026-10-15
Status: `IMPLEMENTED AND DEPLOYED — AUTHENTICATED ACCEPTANCE PENDING`

## Objective

Unify the Administration Center so development and production use one protected
React implementation, one canonical user-facing route, shared member
personalization, and a reproducible release boundary.

## Root cause

The development Administration Center was the React application at
`/admin-center-preview/`, while the signed-in member navigation and the
production `/admin-panel.html` entry point still opened a separate legacy HTML
Administration Center. The preview build also initialized only from browser
local storage and did not hydrate the signed-in member's saved theme and font
preferences from the existing session APIs.

## Implemented repair

- `/admin-panel` is now the canonical protected Administration Center route.
- `/admin-center-preview/` remains a protected compatibility route to the same
  static React package.
- Authenticated `/admin-panel.html` requests redirect to `/admin-panel`;
  unauthorized requests remain server-side denied.
- Desktop and mobile member navigation now point to `/admin-panel`.
- The existing React application remains the only Administration Center
  implementation; the legacy HTML page is no longer an active entry point.
- The application loads the signed-in member's saved site theme through
  `/api/auth/me` and saved typography through `/api/me/personalization`.
- The existing theme system remains the source of truth; no separate admin
  theme settings were introduced.
- The development deployment staging script now emits a protected
  Administration Center release manifest containing source commit, branch,
  timestamp, package files, sizes, and SHA-256 hashes.
- Production and development bindings remain separate in their existing
  Wrangler configurations.

## Explicit boundaries

No D1 migration, D1 write, R2 write, data import, credential change, Founding
50 activation, StudioFlow change, or production deployment is included in this
implementation checkpoint. Unsupported creator-application fields continue to
fail closed where the production schema lacks the required columns.

## Release result

The owner-approved release was staged from the production `main` baseline with
only the Administration Center/runtime patch, the required `lib/auth.js`
compatibility dependency, and the protected package manifest. The final source
identity is `ef7182e77d7966dacff49e21701580ba189103ae`; the approved application
commit remains `dc28377` and the candidate documentation commit remains
`633f097`.

Development was deployed and verified as Worker
`85a142a1-026e-4658-b8f1-a7924ba30062`. Production was initially deployed as
Worker `40e6b45d-7f85-40ec-acc3-0cd1edac490c`, then corrected as Worker
`f89c0971-b3e5-40be-9b20-abfa9a132dcd`, replacing rollback target
`830aa684-d14e-4d39-b103-7fb7538fef84`. The package uses the production D1 and
R2 bindings and contains no migrations or data imports. A packaging-only fix
excluded the required `lib/` auth helper from static assets after the first
deployment exposed `/lib/auth.js`; the corrected path returns 404. Anonymous
protection, public routes, asset boundaries, and read-only D1 migration state
were verified after the corrective deployment. Authenticated owner browser
acceptance remains pending.

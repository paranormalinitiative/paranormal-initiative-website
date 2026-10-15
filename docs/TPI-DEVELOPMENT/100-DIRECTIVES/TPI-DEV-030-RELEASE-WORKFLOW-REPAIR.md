# TPI-DEV-030 — Release Workflow Repair

Date: 2026-10-14
Status: `IMPLEMENTATION COMPLETE — PRODUCTION APPROVAL PENDING`

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

## Release gate

The exact candidate must be reviewed after the final commit and package
verification. Production deployment is not claimed by this document. The
deployment must preserve the current production Worker as rollback target and
must use the guarded production procedure with an explicit candidate-specific
approval.

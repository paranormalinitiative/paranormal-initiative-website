# TPI-DEV-028 — Administration Center Release Report

Date: 2026-10-14
Status: `DEPLOYED WITH LIMITATIONS — LIVE PROTECTION VERIFIED`

## Concise approval summary

- Exact source snapshot: `8dc0d45c8e0ab9dac2b7154f4458503d4a58bc44`
- Production Worker version to preserve for rollback:
  `7e357215-2579-4c60-b27e-dd572a5656fe`
- Proposed package: Administration Center preview runtime plus the protected
  admin API compatibility portion, assembled against the production baseline.
- Database changes: none proposed; none executed.
- Destructive operations: none included or executed.
- Rollback: restore the prior Worker version; because no database change is
  included, database rollback is not required for this focused package.
- Deployment status: deployed after explicit owner approval.
- Final Worker version: `830aa684-d14e-4d39-b103-7fb7538fef84`.
- Initial Worker version immediately superseded: `0f114a72-ccf0-46c7-aae2-ea53b79510de`.

## Production compatibility

Read-only production schema inspection confirmed the tables required by the
compatible Administration Center modules, including contributors,
admin_audit_logs, community tables, member_notifications, articles, comments,
videos, TPI videos, reports, events, paranormal teams, team claims, team
verification events, settings, creator memberships, creator entitlements,
channels, and studio metadata.

The production `founding50_applications` table lacks the additive application
detail columns introduced by `0050_creator_application_details.sql`, and
`creator_partnership_memberships` lacks `application_id`. Creator-application
detail/create and application-linked operations are therefore deferred. The
entire Administration Center is not blocked by that optional module.

## Security verification

Passed:

- Anonymous production requests to `/admin-center-preview/`,
  `/admin-panel.html`, and `/api/admin/overview` returned `403`.
- Existing server-side `requireAdmin` protection remains in the API path.
- Owner-only Founding 50 allocation remains separately gated.
- Creator entitlements do not grant Administration Center access.
- No public administrative endpoint or hardcoded credential was introduced.
- The deployed documentation path `/docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`
  returns `404` after the corrective asset-manifest deployment.

## Live verification

Passed:

- `/admin-center-preview/`: `403` anonymously.
- `/admin-center-preview/assets/index-Bc-OW49F.js`: `403` anonymously.
- `/admin-panel.html`: `403` anonymously.
- `/api/admin/overview`: `403` anonymously.
- `/api/auth/me`: `200` anonymous response with no session.
- `/`: `200`.
- `/events`, `/education-center`, `/teams/`, `/member-home`, and
  `/published-article/`: `200` after existing redirects.
- Unintended documentation asset path: `404` after correction.

## Tests

Passed:

- `npm run build` in `admin-center-app`.
- TPI-ADMIN-005 preview checks.
- TPI-ADMIN-006 preview checks: 79/79.
- TPI-DEV-012 authorization checks: 16/16.
- TPI-DEV-013 partnership checks: 17/17.
- TPI-DEV-014 source checks: 9/9.
- TPI-DEV-018 source checks: 11/11.
- TPI-DEV-019 source checks: 23/23.
- `node --check worker.js`.
- `node --check functions/api/[[path]].js`.

Not tested:

- Authenticated owner login against production.
- Authenticated production Administration Center rendering and module loading.
- Production data mutation, intentionally.
- Production deployment and post-deployment acceptance.

## Preservation and exclusions

No production D1/R2 writes, exports, migrations, deployments, member changes,
synthetic imports, Founding 50 activation, RealtimeKit activity, research
activity, commit, or push was performed. Existing dirty and untracked files in
the shared worktree were preserved and were not included in this report's
commit.

## Decision

`DEPLOYED WITH LIMITATIONS.` The final Worker version is recorded above and the
non-destructive anonymous/live route checks passed. Authenticated owner testing
is still required to confirm dashboard data and module loading. Do not run the
historical migration backlog or activate deferred creator-application schema.

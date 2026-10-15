# TPI-DEV-028 — Administration Center Release Report

Date: 2026-10-14
Status: `READY FOR OWNER APPROVAL — NOT DEPLOYED`

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
- Deployment status: not deployed; waiting for explicit owner approval.

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
- Authenticated production Administration Center rendering.
- Production data mutation, intentionally.
- Production deployment and post-deployment acceptance.

## Preservation and exclusions

No production D1/R2 writes, exports, migrations, deployments, member changes,
synthetic imports, Founding 50 activation, RealtimeKit activity, research
activity, commit, or push was performed. Existing dirty and untracked files in
the shared worktree were preserved and were not included in this report's
commit.

## Decision

`READY FOR OWNER APPROVAL.` After approval, assemble and deploy only the exact
focused package above, record the new Worker version, and perform the
non-destructive live acceptance checks. Do not deploy the whole development
branch or run the historical migration backlog.

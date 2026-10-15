# TPI-DEV-028 — Live Administration Center

Date: 2026-10-14
Status: `READY FOR OWNER APPROVAL — NOT DEPLOYED`

## Objective

Prepare the smallest safe production release for the existing protected TPI
Administration Center. This directive does not authorize deployment before the
owner approves the exact package below.

## Candidate and production target

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Candidate source snapshot: `8dc0d45c8e0ab9dac2b7154f4458503d4a58bc44`
- Production Worker: `theparanormalinitiative`
- Production D1: `tpi_contributor_portal`
- Production R2: `tpi-contributor-media`
- Existing production Worker version: `7e357215-2579-4c60-b27e-dd572a5656fe`

## Focused package

Runtime files/modules proposed for the focused release:

- `admin-center-preview/index.html`
- `admin-center-preview/assets/index-Bc-OW49F.js`
- `admin-center-preview/assets/index-BkWHAl_w.css`
- The Administration Center route/API compatibility portion of
  `worker.js` and `functions/api/[[path]].js`, assembled from the production
  baseline rather than deploying the whole development branch.
- Existing shared authentication and authorization contracts already present in
  the production baseline.

No database migration is included. No R2 change is included. No development
data, fixtures, credentials, research artifacts, StudioFlow changes, or
unrelated Events/Community changes are included except where an existing
Administration Center moderation contract requires its already-present table.

## Verified modules

The following modules are compatible with the inspected production schema and
passed focused source/security checks:

- Dashboard and analytics metadata.
- Member directory, account controls, activity, and notifications.
- Community Feed moderation metadata and status controls.
- Education article listing/status and article-comment moderation.
- Video metadata/lifecycle and report metadata.
- Paranormal Teams review, claims, and verification history.
- Site settings, roles, account restrictions, audit views, and channels.
- Read-only creator membership and Creator Studio entitlement views.

All API routes remain server-side `requireAdmin` protected. Founding 50
allocation remains owner-gated and disabled.

## Deferred modules

Creator-application detail/create and application-linked membership operations
are deferred from this focused package. Production has the base
`founding50_applications` and `creator_partnership_memberships` tables, but it
does not have the additive columns from `0050_creator_application_details.sql`
or `creator_partnership_memberships.application_id`. No migration is proposed
or executed in this directive.

Authenticated owner acceptance, member-data inspection, and any mutating live
test remain post-deployment owner checks. No synthetic accounts or real member
records may be changed for demonstration.

## Approval boundary

Before any production write, the owner must approve this exact focused package.
Approval must not be interpreted as approval for D1 migrations, Founding 50
activation, unrelated branch deployment, or production data changes.

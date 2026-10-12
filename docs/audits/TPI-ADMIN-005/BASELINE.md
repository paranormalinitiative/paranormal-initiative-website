# TPI-ADMIN-005 — Baseline

Date: 2026-10-11
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch at audit start: `main`
Baseline commit: `b6de19d90b5d314542ebb75a281fef996db5f6d4`

## Scope and safety boundary

This baseline covers the existing TPI administration surface before any
TPI-ADMIN-005 application work. The existing `/admin-panel` remains the
production administration surface. The new Administration Center must be
isolated behind the existing server-side owner/admin boundary until owner
acceptance. No production database, R2 object, authentication system, or
StudioFlow system is changed by this baseline.

Pre-existing unrelated working-tree changes were observed and are excluded
from this directive:

- `STUDIOFLOW_READINESS_AUDIT.md`
- `education-center.html`
- `index.html`
- `scripts/build-sitemap.js`
- `sitemap.xml`
- the existing 2026-10-09 audit files and competitive-audit report

## Current application architecture

- The repository is a static HTML/CSS/JavaScript site served by a Cloudflare
  Worker (`worker.js`) with an asset binding rooted at `.`.
- There is no root `package.json` or existing React/Vite application.
- D1 binding: `TPI_DB`, database `tpi_contributor_portal`.
- R2 binding: `TPI_MEDIA`, bucket `tpi-contributor-media`.
- Authentication is the existing `tpi_session` cookie resolved by
  `lib/auth.js::getSessionUser` against the `sessions` and `contributors`
  tables.
- Existing admin API routes live in `functions/api/[[path]].js` and use
  `requireAdmin` (owner/admin) or `requireOwner` for sensitive operations.

## Existing protected surfaces

`worker.js` server-side gates these HTML entry points for owner/admin users:

- `/admin-panel.html`, `/admin-panel`, `/admin-panel/`
- `/admin-advanced-settings.html`, `/admin-advanced-settings`,
  `/admin-advanced-settings/`
- `/admin-events.html`, `/admin-events`, `/admin-events/`
- `/teams/admin.html`, `/teams/admin`, `/teams/admin/`

The same Worker gates `/studio` and its direct assets for owner/admin users,
and preserves the public `/live-video` Coming Soon behavior.

## Existing Administration Center

`admin-panel.html`, `admin-center.js`, and `admin-center.css` provide the
current protected Administration Center. Its navigation currently includes:

- Dashboard, Analytics, Activity
- All Members, Roles & Permissions
- Community Overview, Moderation
- Creator Directory, Founding 50, Creator Studio Access
- TPI Videos, Education & Content, Events
- Notifications, Platform Health, Security, System Settings

The current page has live data for overview metrics, analytics trends,
Founding 50 status, Creator Studio entitlements, Community Feed operations,
moderation counts, creator partnership records, and audit logs. Several
publishing, notification, health, and security sections are explanatory
surfaces or links to existing tools rather than complete CRUD interfaces.
Member search and member activity controls are present in the legacy page and
are backed by protected API routes.

## Existing administrative API contracts

The following protected routes were found and are available for an isolated
frontend adapter:

- `GET /api/admin/overview`
- `GET /api/admin/analytics`
- `GET /api/admin/audit-logs`
- `GET /api/admin/members`
- `GET /api/admin/members/:username/activity`
- `POST /api/admin/members/:username/access`
- `POST /api/admin/members/:username/notifications`
- `POST /api/admin/members/:username/block`
- `POST /api/admin/members/:username/unblock`
- `GET /api/admin/community/posts`
- `POST /api/admin/community/posts/:id/status`
- `GET /api/admin/comments`
- `POST /api/admin/comments/:id/approve`
- `DELETE /api/admin/comments/:id`
- Creator Partnership, Founding 50, Creator Studio entitlement, settings,
  scraper, and Paranormal Teams administration routes listed in the source
  dispatch table.

All admin API routes resolve the existing session and reject unauthenticated
or non-admin requests. The current member activity response includes private
member activity and must remain protected; the new UI must not widen that
boundary.

## Existing data foundation

The repository includes additive admin migrations through `0048`, including:

- `0047_admin_audit_logs.sql`
- `0048_creator_partnership_admin.sql`

No TPI-ADMIN-005 migration is justified by the baseline. Dashboard and member
management work should consume existing APIs first. Any new schema request
must be separately justified, reviewed for performance, and kept out of the
initial isolated shell.

## Baseline classification

| Resource | Classification | Evidence | TPI-ADMIN-005 implication |
| --- | --- | --- | --- |
| Existing admin route gate | WORKING | `worker.js` owner/admin check | Reuse; do not replace |
| Admin API authorization | WORKING | `requireAdmin` / `requireOwner` in API handler | Reuse; test direct requests |
| Legacy admin dashboard | PARTIALLY WORKING | Live metrics and several informational sections | Preserve while preview is developed |
| Member search | PARTIALLY WORKING | `/api/admin/members` plus legacy UI | Build isolated list/detail adapter |
| Member activity | PARTIALLY WORKING | Protected activity endpoint and legacy detail view | Keep private and regression-test |
| Community moderation | PARTIALLY WORKING | Existing protected list/status/comment routes | Integrate only against existing contracts |
| Creator Partnership / Founding 50 | PARTIALLY WORKING | Existing additive tables and gated handlers | Preserve explicit owner gate |
| Reports and moderation center | NOT IMPLEMENTED as unified surface | Current UI states no unified report table | Document limitation; do not invent data |
| Root React build | NOT IMPLEMENTED | No root `package.json` or React source | Use isolated preview subdirectory |
| Cloudflare production switch to new app | NOT APPROVED | Directive requires owner acceptance first | Do not replace `/admin-panel` |

## Gate decision

The existing architecture can support an isolated React preview if it is
served from a dedicated path, protected by the Worker for the entry document
and every preview asset, and connected only to existing `/api/admin/*`
contracts. No new login, user database, D1 migration, R2 storage, or public
route is required for the initial implementation.

This baseline is complete. Compatibility and application design documents
must record the exact dependency versions and test evidence before any
production route replacement is considered.

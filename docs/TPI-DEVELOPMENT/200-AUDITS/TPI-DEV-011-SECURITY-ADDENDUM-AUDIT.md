# TPI-DEV-011 — Mandatory Security Addendum Audit

Date: 2026-10-13

Environment: development only (`codex/tpi-development` → `theparanormalinitiative-dev`)

Status: **PARTIAL COMPLETION — DEVELOPMENT DEPLOYED; AUTHENTICATED ROLE ACCEPTANCE PENDING**

## Finding

The existing authorization architecture is role-based and server-authoritative:

- `owner` and `admin` are required for the Administration Center, legacy administrative pages, and StudioFlow preview.
- `owner`, `admin`, and `contributor` are required for contributor management pages and contributor APIs.
- Article, Community Feed, live broadcast, and TPI Video mutations retain resource-ownership checks; owners and administrators retain the existing moderation override.
- New accounts continue to default to ordinary member access unless an existing approved invite or owner/admin workflow assigns a role.

The current schema does not contain a separate granular `content_editor`, `content_creator`, or category-assignment permission. This addendum therefore reuses the existing role and ownership model rather than introducing a competing permission system. Granular assigned-content permissions remain a future architectural decision requiring owner approval.

## Implemented boundary repairs

1. Added permission-gated Administration Center links to desktop and mobile member navigation. Only owner/admin sessions see them.
2. Hid the Creator Studio navigation entry from non-admin sessions. The Worker continues to enforce the owner/admin gate for `/studio/` and its assets.
3. Added server-side gates for `/paper-editor.html` and `/creator-videos.html`, including their direct URL variants. Only owner/admin/contributor sessions receive the management documents.
4. Kept the member-home Content Editor shortcut contributor-gated.
5. Preserved existing API authorization and resource ownership checks. Browser-supplied role labels are not trusted.
6. Preserved audit logging for existing administrative permission/capability changes. No role, account, or permission records were changed by this addendum.

## Development verification

Anonymous development checks after deployment:

| Boundary | Result |
| --- | --- |
| `/admin-center-preview/` | HTTP 403 |
| `/admin-panel.html` | HTTP 403 |
| `/paper-editor.html` | HTTP 403 |
| `/creator-videos.html` | HTTP 403 |
| `/studio/` | HTTP 403 |
| `/api/admin/overview` | HTTP 403 |
| `/api/contributors/me/articles` | HTTP 401 |
| `/api/tpi-videos?mine=true&status=all` | HTTP 401 |
| Public creator-video listing without management filters | HTTP 200 with safe empty development data |

The existing ordinary development-member browser session was reloaded against the deployed Administration Center and continued to receive the restricted-access page. No owner credentials were entered or transmitted.

## Tests

- `npm run build` in `admin-center-app`: PASS.
- `node --check worker.js`: PASS.
- `node --check member-shell.js`: PASS.
- `node scripts/qa/tpi-dev-011-admin-functional.mjs`: 16/16 PASS.
- `node scripts/qa/tpi-admin-006-preview.mjs`: 79/79 PASS.
- Development live direct-URL/API boundary checks: PASS.
- Authenticated owner, administrator, contributor, and creator browser matrix: pending approved development sessions.

## Deployment and safety

- Source commit: `0594f89009b0199b4983a61d1f829a0ff05c7569`.
- Development deployment: `b78d63d0-ebc9-4458-88fe-7bd7ac029283`.
- Worker: `theparanormalinitiative-dev`.
- D1: `tpi_contributor_portal_dev`.
- R2: `tpi-contributor-media-dev`.
- `TPI_ENV=development` and `TPI_DISABLE_OUTBOUND=1` remained enabled.
- Production Worker, D1, R2, roles, accounts, sessions, routes, secrets, and cron were not modified.

## Remaining limitations and approval

The addendum is not marked complete until the owner supplies or uses approved synthetic development accounts for the authenticated owner/admin/contributor/member matrix. That verification must confirm navigation visibility, direct URL access, API authorization, and ownership behavior without changing production or activating Founding 50 awards.


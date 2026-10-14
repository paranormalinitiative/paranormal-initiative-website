# TPI-DEV-011 — Administration Center Functional Inventory

Date: 2026-10-13

Environment: `codex/tpi-development` → `theparanormalinitiative-dev`

This is a focused implementation inventory, not a new website-wide audit.

## Existing module inventory

| Module | Classification before this slice | Current state |
|---|---|---|
| Dashboard and analytics | WORKING | Reads protected overview/analytics contracts and uses real development D1 metrics with unavailable states. |
| Member directory and detail | PARTIALLY WORKING | Search, filtering, pagination, detail activity, and activation state were already connected. Capability flags and in-app administrative notification are now connected through existing protected endpoints. |
| Community Feed posts/comments | WORKING | Protected search, detail, metadata boundaries, and supported post moderation are connected. Community comment detail remains metadata-only where no authoritative mutation contract exists. |
| Reports and audit history | WORKING | Protected metadata queues, status controls, detail history, and audit views are connected; private evidence remains excluded. |
| Education Center | PARTIALLY WORKING | Previously published-only listing. Now has a protected development article queue with search/status filters and audited draft/published status changes. Article editing remains on the contributor workflow. |
| TPI Videos | PARTIALLY WORKING | Previously published-only listing. Now supports protected development status filtering and publish/unpublish/remove lifecycle actions through the existing TPI Videos handlers. |
| Paranormal Teams | WORKING | Protected search, pagination, review status, and existing claim/review boundaries are connected. Research CSV import remains out of scope. |
| Creator directory | WORKING / READ-ONLY | Uses the existing protected Creator Partnership records. Award mutations remain gated. |
| Creator Studio / StudioFlow | WORKING / BOUNDED | Entitlement visibility is available without exposing private recordings, stream credentials, or unpublished private media. The StudioFlow engine is unchanged. |
| Founding 50 | PARTIALLY WORKING / GATED | Applications and allocation summary are visible; award activation and real entitlement allocation remain inactive by directive. |
| Notifications | WORKING / METADATA-ONLY | Delivery metadata is visible. Member-specific development in-app notices are now available from member detail. Bulk sending and email delivery remain unavailable. |
| Settings | WORKING / BOUNDED | Existing account-access flags can be read and saved through the protected settings contract with confirmation and audit logging. |
| Events | READ-ONLY | Protected metadata review is connected; lifecycle mutation remains on the existing event workflow. |
| Roles and restrictions | READ-ONLY | Server-derived role/capability summaries remain authoritative; permanent role mutation is not invented here. |
| Platform health | READ-ONLY | Scraper/provider health and run history are connected without starting jobs from the preview. |

## Implemented source changes

- Added protected `GET /api/admin/articles` listing with status/search/pagination.
- Added protected `POST /api/admin/articles/:id/status` with `draft`/`published` validation, audit logging, and existing member-notification behavior for newly published content.
- Connected Education Center queue controls to the new admin article contract.
- Connected TPI Videos status filtering and lifecycle controls to the existing protected `/api/tpi-videos/:slug/(publish|unpublish|remove)` contract.
- Connected member capability controls to `/api/admin/members/:username/access`.
- Connected single-recipient development in-app notices to `/api/admin/members/:username/notifications`.
- Preserved private-message, private-recording, stream-key, production, and Founding 50 award boundaries.

## Deferred or blocked

- Full authenticated owner browser acceptance requires the approved development owner session; the currently open browser session is an ordinary development member and correctly receives the admin restriction page.
- Full local multi-user E2E remains subject to the known Wrangler/esbuild `spawn EBADF` startup issue.
- Article body editing, video metadata editing, event lifecycle controls, channel ownership changes, role mutation, bulk notifications, and Founding 50 award activation remain on existing workflows or explicitly gated.

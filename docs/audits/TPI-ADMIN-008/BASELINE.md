# TPI-ADMIN-008 — Baseline

## Scope

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `main`
- Baseline HEAD: `9cd1f91d4a75c3794674ee3dc4297071c7859087`
- Production Administration Center: `/admin-panel`
- Protected Refine preview: `/admin-center-preview/`
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`

The checkout contains unrelated pre-existing dirty files. They are preserved
and remain outside this directive's staged scope.

## Existing systems

`/admin-panel` is the existing production administration surface. The Refine
and shadcn/ui application is a protected preview, not a replacement. Existing
Worker authorization, D1, R2, Creator Studio, `/live-video`, and legacy admin
contracts remain in place.

## Baseline limitations

The preview has implemented overview, analytics, member directory/detail,
Community Feed post management, classic article-comment moderation, audit logs,
moderation history, TPI theme tokens, and the ADMIN-007A isolation repair.
Creator, reports, publishing, events, notifications, health, settings, and
role/restriction workspaces remain partial integrations or capability links.
Authenticated production browser acceptance is not available in this run.

## Current incremental status

The baseline above records the starting state and is preserved as history. Since
that capture, the protected preview has added metadata-only Reports &
Moderation, Notifications, Creator Channels, Roles & Permissions, and Account
Restrictions views using existing TPI tables/contracts. Creator Channels now
uses the existing server-backed count/pagination contract for bounded browsing.
These additions remain
read-only where no complete safe mutation contract exists; `/admin-panel`
promotion, authenticated owner/admin acceptance, and rollback verification
remain gated.

The Community Posts & Comments surface now also includes a protected
metadata-only Community Comments queue backed by `community_comments`. It
supports visible/deleted/all filtering and search without adding an
unverified administrative comment mutation.

The Events surface now includes a protected metadata-only review queue backed
by the existing `events` table. It can browse approved, pending, rejected,
cancelled, or all records with search and bounded server-backed pagination;
event mutations remain on the existing protected event manager.

The Community navigation now renders Community Overview as its own protected
resource using authoritative overview metrics, while Posts & Comments retains
record-level post and metadata-only comment review. The two routes no longer
render the same full moderation page.

The Dashboard Activity route now renders its own bounded recent-activity feed
from the protected audit query. Audit Logs remains the searchable and
paginated accountability resource, rather than being rendered identically as
the Activity page.

The Reports & Moderation queue now consumes the existing report contract with
bounded server-backed pagination and matching-record totals. It remains
metadata-only for report evidence, and now exposes protected status/review-audit
controls backed by the existing report review fields. Authenticated mutation
acceptance remains pending; no report records were changed by this batch.

Moderation History now applies a fixed server-side moderation scope to the
existing audit-log contract before pagination. Its matching totals and
Previous/Next controls therefore describe the filtered moderation set rather
than filtering only the current unscoped page in the browser.

An isolated in-memory SQLite contract test now exercises the protected admin
gates, metadata-only report response, report status/review audit update,
invalid-status rejection, and server-scoped moderation query using seeded test
identities. The full Wrangler local API E2E harness remains environment-
blocked before assertions by `spawn EBADF` from Wrangler/esbuild; this is not
treated as a passing full-suite result.

Creator Studio Access now consumes the existing entitlement pagination
contract with bounded server-backed browsing and matching totals. It remains
read-only and does not grant, revoke, or expand Creator Studio access.

Founding 50 applications now consume the existing status-filtered pagination
contract with bounded review browsing. Existing approve/reject actions remain
on the protected workflow, while award activation remains gated.

Creator Directory now uses the existing partnership contract with bounded
server-side search, pagination, and matching totals. It remains read-only and
does not allocate memberships or grant Creator Studio access.

Published TPI Videos now uses the existing public-safe `hasMore` listing
contract for bounded Previous/Next browsing. Draft and lifecycle mutations
remain on the existing contributor workflow.

Published Education now uses the existing public-safe `/articles` listing
contract with explicit 50-record pages and matching totals. Existing unpaged
article callers and destination-filtered behavior remain unchanged; draft,
editor, and comment mutations remain on their existing protected workflows.

Article Comment Moderation now uses the existing protected `/admin/comments`
contract with explicit 50-record pages and matching totals. The legacy
unpaged response remains compatible, and approve/delete actions remain on the
existing protected endpoints.

Paranormal Teams now uses the existing protected `/admin/teams` contract with
server-side status/search filtering, explicit 50-record pages, and matching
totals. Existing offset/limit callers and approve/reject actions remain
compatible.

Account Restrictions now uses the existing protected `/admin/restrictions`
contract with server-side search, explicit 50-record pages, and matching
totals. It remains metadata-only and does not expose suspension or
user-to-user blocking mutations.

Contributor Management now uses the existing protected `/admin/contributors`
contract with server-side status/search filtering, explicit 50-record pages,
and matching totals. Existing no-query callers, invite generation, and
role/title updates remain compatible.

Contributor Invites now uses the existing protected `/invites` contract with
optional explicit 25-record pages and matching totals. Existing no-query
callers, invite generation, validation, and access-level enforcement remain
compatible.

Member Detail activity now uses the existing protected member-activity
contract with explicit 25-record pages and Previous/Next browsing. Existing
member-directory behavior and private-data boundaries remain unchanged.

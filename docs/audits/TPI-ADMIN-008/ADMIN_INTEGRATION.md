# TPI-ADMIN-008 — Administration integration

The approved integration strategy is incremental and protected-preview-first.
The Refine/shadcn application continues to reuse existing TPI APIs and does
not create a second backend or replace `/admin-panel`.

This batch improves the preview's route ownership and dashboard contract:

- Community Overview and Posts & Comments now have distinct client routes.
- Community Overview now renders the protected overview metrics as a separate
  resource; Posts & Comments owns record-level post status review and the
  metadata-only Community Comments queue.
- Dashboard Activity now renders a dedicated recent-activity feed from the
  existing protected audit query; Audit Logs retains search and pagination.
- Posts & Comments now includes a protected metadata-only Community Comments
  queue backed by the existing `community_comments` table; Article Comment
  Moderation remains a separate Education Center resource.
- Events now includes a protected metadata-only review queue over the existing
  `events` table with bounded server-backed pagination; creation, approval,
  editing, and lifecycle mutations remain on the existing protected event
  manager.
- Audit Logs and Moderation History now use the existing protected audit query
  with read-only search and pagination; no mutation surface is added.
- Overview exposes real metrics for members, community content, reactions,
  videos, creator channels, articles, teams, open reports, and Founding 50
  allocations when their existing tables are available.
- Analytics now queries the existing protected `/admin/analytics` contract
  directly, rendering its authoritative trend definitions instead of relying
  on the Overview response as an implicit data source.
- Optional table/query failures display `Unavailable`, never fabricated zeroes.
- Remaining capability links remain explicit transitional routes where no
  complete preview-safe contract exists.
- Reports & Moderation and Notifications now have protected metadata-only
  queues backed by their existing tables; Reports supports safe metadata
  search with the existing server-backed count/pagination contract,
  Notifications uses its existing server-backed count and pagination contract,
  and private payloads and unverified resolution/delivery mutations remain
  excluded.
- Creator Channels now has a protected read-only view backed by existing
  channel fields with bounded server-backed pagination. Roles & Permissions
  and Account Restrictions remain protected read-only views backed by existing
  contributor fields;
  lifecycle, role, suspension, and user-to-user restriction mutations remain
  on their existing protected workflows.
- Security now has an explicit read-only boundary summary for the existing
  server-side gates and preserved public/private data boundaries; it does not
  add new controls or replace authenticated verification.
- Creator Studio Access now consumes the existing entitlement count/pagination
  contract with bounded read-only browsing; grant, revoke, and escalation
  controls remain excluded.

Promotion to `/admin-panel` is not authorized by this batch. It remains gated
by parity, authenticated browser acceptance, rollback verification, and
explicit owner approval.

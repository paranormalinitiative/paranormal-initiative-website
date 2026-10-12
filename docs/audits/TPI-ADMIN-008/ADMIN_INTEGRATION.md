# TPI-ADMIN-008 — Administration integration

The approved integration strategy is incremental and protected-preview-first.
The Refine/shadcn application continues to reuse existing TPI APIs and does
not create a second backend or replace `/admin-panel`.

This batch improves the preview's route ownership and dashboard contract:

- Community Overview and Posts & Comments now have distinct client routes.
- Posts & Comments now includes a protected metadata-only Community Comments
  queue backed by the existing `community_comments` table; Article Comment
  Moderation remains a separate Education Center resource.
- Events now includes a protected metadata-only review queue over the existing
  `events` table; creation, approval, editing, and lifecycle mutations remain
  on the existing protected event manager.
- Audit Logs and Moderation History now use the existing protected audit query
  with read-only search and pagination; no mutation surface is added.
- Overview exposes real metrics for members, community content, reactions,
  videos, creator channels, articles, teams, open reports, and Founding 50
  allocations when their existing tables are available.
- Optional table/query failures display `Unavailable`, never fabricated zeroes.
- Remaining capability links remain explicit transitional routes where no
  complete preview-safe contract exists.
- Reports & Moderation and Notifications now have protected metadata-only
  queues backed by their existing tables; private payloads and unverified
  resolution/delivery mutations remain excluded.
- Creator Channels, Roles & Permissions, and Account Restrictions now have
  protected read-only views backed by existing channel/contributor fields;
  lifecycle, role, suspension, and user-to-user restriction mutations remain
  on their existing protected workflows.
- Security now has an explicit read-only boundary summary for the existing
  server-side gates and preserved public/private data boundaries; it does not
  add new controls or replace authenticated verification.

Promotion to `/admin-panel` is not authorized by this batch. It remains gated
by parity, authenticated browser acceptance, rollback verification, and
explicit owner approval.

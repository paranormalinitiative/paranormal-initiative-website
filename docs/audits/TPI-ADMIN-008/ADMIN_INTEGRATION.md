# TPI-ADMIN-008 — Administration integration

The approved integration strategy is incremental and protected-preview-first.
The Refine/shadcn application continues to reuse existing TPI APIs and does
not create a second backend or replace `/admin-panel`.

This batch improves the preview's route ownership and dashboard contract:

- Community Overview and Posts & Comments now have distinct client routes.
- Overview exposes real metrics for members, community content, reactions,
  videos, creator channels, articles, teams, pending reports, and Founding 50
  allocations when their existing tables are available.
- Optional table/query failures display `Unavailable`, never fabricated zeroes.
- Existing capability links remain explicit transitional routes.

Promotion to `/admin-panel` is not authorized by this batch. It remains gated
by parity, authenticated browser acceptance, rollback verification, and
explicit owner approval.

# TPI-VIDEOS-004 Database Changes

Migration: `migrations/0044_tpi_broadcast_integration.sql`.

The migration is additive. It adds scheduling, visibility, playback reference,
verification, replay, lifecycle synchronization, and stable `broadcast_id`
mapping fields to `live_broadcasts` and `tpi_videos`, plus indexes.

It does not drop tables, rewrite recordings, provision R2, alter unrelated
Cloudflare infrastructure, create accounts, or migrate creator-owned storage.

Local migration replay: PASS through migration 0044. Production D1 migration:
pending release deployment and must be reported separately from local proof.

# TPI-VIDEOS-002 Database Changes

Migration: `migrations/0042_tpi_video_channels.sql`

This is an additive migration only:

- creates `tpi_video_channels` with contributor ownership, unique slug,
  visibility, description, artwork, and timestamps;
- adds nullable `channel_id` to `tpi_videos` with `ON DELETE SET NULL`;
- adds owner and channel indexes.

No existing rows are deleted or rewritten. Existing member identities remain
the source of creator ownership. Local D1 replay and the full API suite passed
with the migration. Remote application is recorded only after the authorized
release migration step; production database status must not be inferred from
local replay.

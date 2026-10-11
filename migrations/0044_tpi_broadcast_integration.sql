-- TPI-VIDEOS-004: additive broadcast/listing integration metadata.
-- StudioFlow remains the creator-side runtime. These fields provide a
-- server-side identity and public-listing boundary without moving recordings
-- into TPI storage or changing existing accounts/channels.

ALTER TABLE live_broadcasts ADD COLUMN scheduled_at TEXT;
ALTER TABLE live_broadcasts ADD COLUMN scheduled_timezone TEXT;
ALTER TABLE live_broadcasts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
ALTER TABLE live_broadcasts ADD COLUMN playback_provider TEXT;
ALTER TABLE live_broadcasts ADD COLUMN playback_url TEXT;
ALTER TABLE live_broadcasts ADD COLUMN playback_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE live_broadcasts ADD COLUMN replay_url TEXT;
ALTER TABLE live_broadcasts ADD COLUMN replay_published INTEGER NOT NULL DEFAULT 0;
ALTER TABLE live_broadcasts ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE live_broadcasts ADD COLUMN sync_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE live_broadcasts ADD COLUMN last_sync_at TEXT;

ALTER TABLE tpi_videos ADD COLUMN broadcast_id TEXT;
ALTER TABLE tpi_videos ADD COLUMN broadcast_status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE tpi_videos ADD COLUMN scheduled_at TEXT;
ALTER TABLE tpi_videos ADD COLUMN scheduled_timezone TEXT;
ALTER TABLE tpi_videos ADD COLUMN playback_provider TEXT;
ALTER TABLE tpi_videos ADD COLUMN playback_url TEXT;
ALTER TABLE tpi_videos ADD COLUMN playback_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tpi_videos ADD COLUMN replay_url TEXT;
ALTER TABLE tpi_videos ADD COLUMN replay_published INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tpi_videos ADD COLUMN actual_started_at TEXT;
ALTER TABLE tpi_videos ADD COLUMN actual_ended_at TEXT;
ALTER TABLE tpi_videos ADD COLUMN sync_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tpi_videos ADD COLUMN last_sync_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tpi_videos_broadcast_id
  ON tpi_videos(broadcast_id) WHERE broadcast_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tpi_videos_broadcast_status
  ON tpi_videos(broadcast_status, scheduled_at, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_broadcasts_public_listing
  ON live_broadcasts(status, visibility, scheduled_at, updated_at DESC);

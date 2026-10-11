-- TPI-VIDEOS-002: minimal creator channel foundation.
-- Channel identity remains linked to the existing contributor account.
CREATE TABLE IF NOT EXISTS tpi_video_channels (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL UNIQUE REFERENCES contributors(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  artwork_url TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tpi_video_channels_visibility ON tpi_video_channels(visibility, updated_at DESC);

ALTER TABLE tpi_videos ADD COLUMN channel_id TEXT REFERENCES tpi_video_channels(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tpi_videos_channel_status ON tpi_videos(channel_id, status, published_at DESC);

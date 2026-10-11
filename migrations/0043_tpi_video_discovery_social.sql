-- TPI-VIDEOS-003: creator follows and threaded authored-video comments.
-- Additive only. Existing contributors, videos, comments, and reactions remain intact.
CREATE TABLE IF NOT EXISTS tpi_video_follows (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES tpi_video_channels(id) ON DELETE CASCADE,
  follower_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(channel_id, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_tpi_video_follows_follower
  ON tpi_video_follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tpi_video_follows_channel
  ON tpi_video_follows(channel_id, created_at DESC);

ALTER TABLE video_comments ADD COLUMN parent_id TEXT REFERENCES video_comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_video_comments_parent ON video_comments(parent_id, created_at);

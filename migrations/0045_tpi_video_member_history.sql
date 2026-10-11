-- TPI Videos 009: member-owned saved items and privacy-conscious watch history.
-- These tables intentionally do not reference creator recordings, R2 objects, or
-- external provider credentials. Existing video_saves rows remain readable.
CREATE TABLE IF NOT EXISTS tpi_video_saved_items (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL,
  video_key TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('creator', 'discovered')),
  destination_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  category TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  published_at TEXT,
  platform TEXT DEFAULT '',
  channel_slug TEXT,
  channel_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (contributor_id, video_key)
);
CREATE INDEX IF NOT EXISTS idx_tpi_video_saved_items_member ON tpi_video_saved_items(contributor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tpi_video_watch_history (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL,
  video_key TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('creator', 'discovered')),
  destination_url TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT DEFAULT '',
  platform TEXT DEFAULT '',
  last_position_seconds REAL NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  watched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (contributor_id, video_key)
);
CREATE INDEX IF NOT EXISTS idx_tpi_video_watch_history_member ON tpi_video_watch_history(contributor_id, watched_at DESC);

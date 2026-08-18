CREATE TABLE IF NOT EXISTS tpi_videos (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  published_at TEXT,
  category TEXT NOT NULL DEFAULT 'Applied Paranormal Research and Studies',
  tags TEXT DEFAULT '',
  platform TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  embed_url TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  is_live INTEGER NOT NULL DEFAULT 0,
  live_started_at TEXT,
  series TEXT DEFAULT '',
  episode TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES contributors(id)
);

CREATE INDEX IF NOT EXISTS idx_tpi_videos_slug ON tpi_videos(slug);
CREATE INDEX IF NOT EXISTS idx_tpi_videos_status ON tpi_videos(status);
CREATE INDEX IF NOT EXISTS idx_tpi_videos_category ON tpi_videos(category);
CREATE INDEX IF NOT EXISTS idx_tpi_videos_published_at ON tpi_videos(published_at);
CREATE INDEX IF NOT EXISTS idx_tpi_videos_featured ON tpi_videos(featured);
CREATE INDEX IF NOT EXISTS idx_tpi_videos_is_live ON tpi_videos(is_live);

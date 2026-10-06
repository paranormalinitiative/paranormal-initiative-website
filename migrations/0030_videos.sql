-- ParaTube: aggregated paranormal videos from public platforms
-- (Dailymotion + Internet Archive live; Odysee/Rumble/BitChute adapters
-- ready in lib/video-scraper.js, disabled until their APIs cooperate).
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    source_url TEXT NOT NULL,
    source_name TEXT,
    channel_name TEXT,
    duration_seconds INTEGER DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'unexplained',
    published_at TEXT,
    scraped_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'approved'
);

CREATE INDEX IF NOT EXISTS idx_videos_category
    ON videos (category, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_published
    ON videos (published_at DESC);

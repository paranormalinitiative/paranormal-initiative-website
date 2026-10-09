-- Private member collections. Shared post/media URLs keep their existing visibility.
CREATE TABLE IF NOT EXISTS member_media_albums (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id),
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_media_library (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id),
  media_key TEXT NOT NULL,
  name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('photo','video','file')),
  size INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'upload',
  source_post_id TEXT,
  album_id TEXT REFERENCES member_media_albums(id),
  is_of_me INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(owner_id, media_key)
);
CREATE INDEX IF NOT EXISTS idx_member_library_owner ON member_media_library(owner_id, kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_albums_owner ON member_media_albums(owner_id);

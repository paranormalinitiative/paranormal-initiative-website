CREATE TABLE IF NOT EXISTS forum_post_attachments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  url TEXT NOT NULL,
  media_key TEXT DEFAULT '',
  name TEXT DEFAULT '',
  content_type TEXT DEFAULT '',
  media_type TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_forum_post_attachments_post ON forum_post_attachments(post_id);

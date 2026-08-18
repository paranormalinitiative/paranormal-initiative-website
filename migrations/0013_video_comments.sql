CREATE TABLE IF NOT EXISTS video_comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_contributor_id ON video_comments(contributor_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_status ON video_comments(status);

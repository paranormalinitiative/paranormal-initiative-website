CREATE TABLE IF NOT EXISTS member_notifications (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_href TEXT,
  type TEXT NOT NULL DEFAULT 'admin',
  read_at TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES contributors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_member_notifications_contributor
  ON member_notifications(contributor_id, read_at, created_at);

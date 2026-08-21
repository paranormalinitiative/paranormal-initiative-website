ALTER TABLE contributors ADD COLUMN can_post INTEGER NOT NULL DEFAULT 1;
ALTER TABLE contributors ADD COLUMN can_comment INTEGER NOT NULL DEFAULT 1;
ALTER TABLE contributors ADD COLUMN can_message INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES contributors(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('auto_restrict_unverified_email', '0'),
  ('require_verified_email_to_post', '0'),
  ('require_verified_email_to_comment', '0'),
  ('require_verified_email_to_message', '0');

-- TPI community workflow: member follows and authenticated bug reports.
-- Additive only. Existing accounts, conversations, and moderation records remain intact.

CREATE TABLE IF NOT EXISTS member_follows (
  follower_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_member_follows_follower
  ON member_follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_follows_following
  ON member_follows(following_id, created_at DESC);

CREATE TABLE IF NOT EXISTS member_bug_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT REFERENCES contributors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_member_bug_reports_status
  ON member_bug_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_bug_reports_reporter
  ON member_bug_reports(reporter_id, created_at DESC);

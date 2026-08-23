-- Migration 0022: Messenger presence tracking
-- Adds real presence tracking with heartbeat system

CREATE TABLE IF NOT EXISTS member_presence (
  contributor_id TEXT PRIMARY KEY,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'offline',
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_presence_status ON member_presence(status);
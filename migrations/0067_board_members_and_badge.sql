-- TPI-GOVERNANCE-005: Board Member appointment records and published badge.
--
-- Board membership is an audited governance appointment. It is deliberately
-- separate from Founding Memberships, Gold/Silver/Bronze recognition, and
-- account access roles. Revoked rows remain in the table as history.

CREATE TABLE IF NOT EXISTS board_members (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL,
  position_title TEXT NOT NULL DEFAULT 'Board Member',
  badge_path TEXT NOT NULL DEFAULT '/assets/board-members/web/board-member-256.png',
  badge_path_2x TEXT NOT NULL DEFAULT '/assets/board-members/web/board-member-512.png',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  appointed_by TEXT,
  appointed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_board_members_active_contributor
  ON board_members(contributor_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_board_members_status_appointed
  ON board_members(status, appointed_at DESC);

-- TPI moderation enforcement: bounded warnings, temporary content restrictions,
-- and member appeals. Additive only; no existing member capability flags or
-- private conversation records are rewritten.

CREATE TABLE IF NOT EXISTS member_moderation_actions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE RESTRICT,
  action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'temporary_restriction')),
  scope TEXT NOT NULL DEFAULT 'all_content' CHECK (scope IN ('posting', 'commenting', 'messaging', 'all_content')),
  reason TEXT NOT NULL,
  source_report_type TEXT,
  source_report_id TEXT,
  starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  revoked_at TEXT,
  revoked_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  revocation_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (action_type = 'warning' OR expires_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_member_moderation_actions_member
  ON member_moderation_actions(member_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_moderation_actions_active_scope
  ON member_moderation_actions(member_id, action_type, scope, status, expires_at);

CREATE TABLE IF NOT EXISTS moderation_appeals (
  id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL REFERENCES member_moderation_actions(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'denied', 'withdrawn')),
  reviewed_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  response_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moderation_appeals_status
  ON moderation_appeals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_member
  ON moderation_appeals(member_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_moderation_appeals_one_open_per_action
  ON moderation_appeals(action_id)
  WHERE status IN ('pending', 'under_review');

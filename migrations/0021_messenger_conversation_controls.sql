-- Migration 0021: Messenger conversation controls
-- Adds participant-specific preferences and relationship tables for full Messenger controls

-- Add participant-specific preference columns to conversation_participants
ALTER TABLE conversation_participants ADD COLUMN theme TEXT DEFAULT 'default';
ALTER TABLE conversation_participants ADD COLUMN quick_emoji TEXT DEFAULT '👍';
ALTER TABLE conversation_participants ADD COLUMN muted_until TEXT DEFAULT NULL;
ALTER TABLE conversation_participants ADD COLUMN read_receipts_enabled INTEGER NOT NULL DEFAULT 1;

-- Create conversation_nicknames table for participant-specific nicknames
CREATE TABLE IF NOT EXISTS conversation_nicknames (
  conversation_id TEXT NOT NULL,
  setter_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, setter_id, target_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (setter_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversation_nicknames_conversation ON conversation_nicknames(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_nicknames_setter ON conversation_nicknames(setter_id);
CREATE INDEX IF NOT EXISTS idx_conversation_nicknames_target ON conversation_nicknames(target_id);

-- Create member_blocks table for blocking
CREATE TABLE IF NOT EXISTS member_blocks (
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_blocks_blocker ON member_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_member_blocks_blocked ON member_blocks(blocked_id);

-- Create member_restrictions table for restricting
CREATE TABLE IF NOT EXISTS member_restrictions (
  restrictor_id TEXT NOT NULL,
  restricted_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (restrictor_id, restricted_id),
  FOREIGN KEY (restrictor_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (restricted_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_restrictions_restrictor ON member_restrictions(restrictor_id);
CREATE INDEX IF NOT EXISTS idx_member_restrictions_restricted ON member_restrictions(restricted_id);

-- Create messenger_reports table for reporting conversations
CREATE TABLE IF NOT EXISTS messenger_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  reported_contributor_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT,
  FOREIGN KEY (reporter_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_contributor_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES contributors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_messenger_reports_reporter ON messenger_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_messenger_reports_reported ON messenger_reports(reported_contributor_id);
CREATE INDEX IF NOT EXISTS idx_messenger_reports_conversation ON messenger_reports(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messenger_reports_status ON messenger_reports(status);
-- Migration 0020: Add per-participant hidden state for non-destructive chat removal
-- This adds hidden_at and archived_at columns to conversation_participants
-- so each participant can independently hide/archive a conversation without
-- affecting other participants or deleting any data.

ALTER TABLE conversation_participants ADD COLUMN hidden_at TEXT DEFAULT NULL;
ALTER TABLE conversation_participants ADD COLUMN archived_at TEXT DEFAULT NULL;

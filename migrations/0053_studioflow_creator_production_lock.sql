-- TPI-STUDIOFLOW-012 Addendum C: one active production per creator.
-- Scheduling remains workspace-scoped and does not acquire this lock.
-- This migration is intentionally additive; it does not import or publish data.

ALTER TABLE live_broadcasts ADD COLUMN studio_workspace_id TEXT REFERENCES studio_workspaces(id) ON DELETE SET NULL;
ALTER TABLE live_broadcasts ADD COLUMN production_session_id TEXT;
ALTER TABLE studio_rooms ADD COLUMN production_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_live_broadcasts_studio_workspace
  ON live_broadcasts(studio_workspace_id, scheduled_at, updated_at DESC);

CREATE TABLE IF NOT EXISTS studio_production_sessions (
  creator_id TEXT PRIMARY KEY REFERENCES contributors(id) ON DELETE CASCADE,
  studio_workspace_id TEXT NOT NULL REFERENCES studio_workspaces(id) ON DELETE RESTRICT,
  session_id TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('recording', 'live', 'combined')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'abandoned')),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_heartbeat_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_studio_production_sessions_workspace_status
  ON studio_production_sessions(studio_workspace_id, status, last_heartbeat_at DESC);

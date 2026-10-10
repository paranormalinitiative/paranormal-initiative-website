-- 0040_paranormal_teams_management_audit.sql
-- Append-only audit history for authorized team profile edits.

CREATE TABLE IF NOT EXISTS team_edit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id TEXT NOT NULL,
  editor_id TEXT NOT NULL,
  editor_role TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES paranormal_teams(id)
);

CREATE INDEX IF NOT EXISTS idx_team_edit_events_team ON team_edit_events(team_id, created_at);

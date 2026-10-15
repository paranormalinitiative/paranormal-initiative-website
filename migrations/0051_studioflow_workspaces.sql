-- TPI-DEV-024: owner-scoped StudioFlow workspace metadata.
-- Recording blobs remain browser-local; this table stores only a bounded,
-- allow-listed workspace snapshot and does not upload or delete recordings.
CREATE TABLE IF NOT EXISTS studio_workspaces (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES tpi_video_channels(id) ON DELETE SET NULL,
  room_id TEXT REFERENCES studio_rooms(id) ON DELETE SET NULL,
  local_broadcast_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  workspace_type TEXT NOT NULL DEFAULT 'broadcast' CHECK (workspace_type IN ('broadcast')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  state_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  last_opened_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(owner_id, local_broadcast_id)
);

CREATE INDEX IF NOT EXISTS idx_studio_workspaces_owner_status_updated
  ON studio_workspaces(owner_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_workspaces_channel
  ON studio_workspaces(channel_id);

-- TPI-STUDIOFLOW-069: server-persistent custom Studio media metadata.
-- The object bytes live in the existing TPI_MEDIA R2 binding. Recording blobs
-- remain browser-local and are intentionally not represented here.
CREATE TABLE IF NOT EXISTS studio_media_assets (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES studio_workspaces(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  media_kind TEXT NOT NULL CHECK (media_kind IN ('image', 'video', 'audio')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_studio_media_assets_workspace
  ON studio_media_assets(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_media_assets_owner_workspace
  ON studio_media_assets(owner_id, workspace_id, created_at DESC);

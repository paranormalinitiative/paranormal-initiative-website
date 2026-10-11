-- TPI-STUDIOFLOW-021 / 021A: native TPI livestream interaction.
-- These records store comments/reactions/host state only. Creator recordings
-- remain creator-owned and are not uploaded to R2 by this migration.

CREATE TABLE IF NOT EXISTS live_broadcasts (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  video_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready', 'live', 'ended', 'cancelled')),
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_live_broadcasts_creator_status
  ON live_broadcasts(creator_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_broadcasts_video
  ON live_broadcasts(video_id);

CREATE TABLE IF NOT EXISTS live_comments (
  id TEXT PRIMARY KEY,
  broadcast_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  parent_id TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible'
    CHECK (status IN ('visible', 'hidden', 'deleted', 'moderated')),
  starred INTEGER NOT NULL DEFAULT 0,
  displayed INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'tpi-live',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  moderated_by TEXT,
  moderated_at TEXT,
  FOREIGN KEY (broadcast_id) REFERENCES live_broadcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES live_comments(id) ON DELETE SET NULL,
  FOREIGN KEY (moderated_by) REFERENCES contributors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_live_comments_broadcast_cursor
  ON live_comments(broadcast_id, status, created_at, id);

CREATE INDEX IF NOT EXISTS idx_live_comments_broadcast_host_state
  ON live_comments(broadcast_id, starred, displayed, created_at);

CREATE TABLE IF NOT EXISTS live_reactions (
  id TEXT PRIMARY KEY,
  broadcast_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  reaction TEXT NOT NULL
    CHECK (reaction IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (broadcast_id) REFERENCES live_broadcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES contributors(id) ON DELETE CASCADE,
  UNIQUE (broadcast_id, member_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_live_reactions_broadcast
  ON live_reactions(broadcast_id, reaction);

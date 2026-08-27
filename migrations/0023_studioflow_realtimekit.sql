CREATE TABLE IF NOT EXISTS studio_rooms (
  id TEXT PRIMARY KEY,
  broadcast_key TEXT NOT NULL,
  title TEXT NOT NULL,
  host_id TEXT NOT NULL,
  realtimekit_meeting_id TEXT NOT NULL,
  host_participant_id TEXT,
  invite_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  livestream_id TEXT,
  livestream_kind TEXT,
  livestream_playback_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT,
  FOREIGN KEY (host_id) REFERENCES contributors(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_rooms_host_broadcast
  ON studio_rooms(host_id, broadcast_key);

CREATE INDEX IF NOT EXISTS idx_studio_rooms_status
  ON studio_rooms(status, updated_at DESC);

-- TPI-DEV-009: complete the StudioFlow room relay schema in isolated
-- development environments. These tables contain transient guest presence
-- and signaling payloads; they do not store creator recordings or media.

CREATE TABLE IF NOT EXISTS studio_room_guests (
  room_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  camera_enabled INTEGER NOT NULL DEFAULT 0,
  mic_enabled INTEGER NOT NULL DEFAULT 0,
  screen_sharing INTEGER NOT NULL DEFAULT 0,
  joined_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  waiting INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (room_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_studio_room_guests_last_seen
  ON studio_room_guests(room_id, last_seen);

CREATE TABLE IF NOT EXISTS studio_room_signals (
  id INTEGER PRIMARY KEY,
  room_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_room_signals_room_cursor
  ON studio_room_signals(room_id, id, created_at);

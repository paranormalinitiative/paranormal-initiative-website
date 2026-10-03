-- 0024 StudioFlow per-show guest invite codes.
-- Every live stream / recording / webinar gets its own guest code at creation
-- time. The code stays valid while the show runs and expires when the show
-- ends, so old guest links stop working after each broadcast.
-- Room relay tables remain 0022/0023; this table maps codes -> live rooms.

CREATE TABLE IF NOT EXISTS studio_room_codes (
  code TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  ended_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_studio_room_codes_room_id ON studio_room_codes (room_id);
CREATE INDEX IF NOT EXISTS idx_studio_room_codes_status ON studio_room_codes (status, created_at);

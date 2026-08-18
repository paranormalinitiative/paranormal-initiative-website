-- Add viewing_access to tpi_videos with CHECK constraint
ALTER TABLE tpi_videos ADD COLUMN viewing_access TEXT NOT NULL DEFAULT 'members'
  CHECK (viewing_access IN ('members', 'public'));

-- Video reactions
CREATE TABLE IF NOT EXISTS video_reactions (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  reaction TEXT NOT NULL
    CHECK (reaction IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_id, contributor_id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_reactions_video ON video_reactions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reactions_contributor ON video_reactions(contributor_id);

-- Video saves (Watch Later)
CREATE TABLE IF NOT EXISTS video_saves (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_id, contributor_id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_saves_video ON video_saves(video_id);
CREATE INDEX IF NOT EXISTS idx_video_saves_contributor ON video_saves(contributor_id);

-- Video reports (moderation records - preserved even if reporter account deleted)
CREATE TABLE IF NOT EXISTS video_reports (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  contributor_id TEXT,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES contributors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_video_reports_video ON video_reports(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);

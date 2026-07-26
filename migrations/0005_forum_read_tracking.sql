CREATE TABLE IF NOT EXISTS forum_topic_reads (
  contributor_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  seen_post_count INTEGER NOT NULL DEFAULT 0,
  seen_last_post_at TEXT,
  read_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contributor_id, topic_id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_forum_topic_reads_contributor ON forum_topic_reads(contributor_id);

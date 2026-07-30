CREATE TABLE IF NOT EXISTS article_reactions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  reaction TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (page_id, contributor_id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

CREATE INDEX IF NOT EXISTS idx_article_reactions_page ON article_reactions(page_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_contributor ON article_reactions(contributor_id);

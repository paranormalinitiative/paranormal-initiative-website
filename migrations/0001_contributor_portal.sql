CREATE TABLE IF NOT EXISTS contributors (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  title TEXT,
  role TEXT NOT NULL DEFAULT 'contributor',
  correspondence TEXT,
  affiliation TEXT,
  organization TEXT,
  website TEXT,
  comment_signature_enabled INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'contributor',
  used INTEGER NOT NULL DEFAULT 0,
  used_by TEXT,
  used_at TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  href TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT,
  source TEXT,
  body_html TEXT NOT NULL,
  article_html TEXT,
  labels TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  parent_id TEXT,
  name TEXT,
  author_title TEXT,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  contributor_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

CREATE INDEX IF NOT EXISTS idx_articles_destination ON articles(destination);
CREATE INDEX IF NOT EXISTS idx_comments_page_id ON comments(page_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

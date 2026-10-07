-- 0032: Dedicated Community Feed data model.
-- Part A of the Community Feed consolidation (see FORUM_DEPENDENCY_AUDIT.md).
-- Non-destructive: creates the community tables the Feed will use instead of
-- forum_categories/forum_topics/forum_posts. No forum table is touched here.
-- The Feed is TPI's single community discussion system; these tables are its
-- dedicated storage (posts + comments/replies + reactions + attachments).

CREATE TABLE IF NOT EXISTS community_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  author_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible', -- visible | hidden | deleted
  edited_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES community_categories(id),
  FOREIGN KEY (author_id) REFERENCES contributors(id)
);

CREATE INDEX IF NOT EXISTS idx_community_posts_created
  ON community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author
  ON community_posts(author_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category
  ON community_posts(category_id, status);

CREATE TABLE IF NOT EXISTS community_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible', -- visible | deleted
  edited_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES contributors(id)
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post
  ON community_comments(post_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_community_comments_author
  ON community_comments(author_id, status);

CREATE TABLE IF NOT EXISTS community_reactions (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL, -- post | comment
  target_id TEXT NOT NULL,
  contributor_id TEXT,
  reaction TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (target_type, target_id, contributor_id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_community_reactions_target
  ON community_reactions(target_type, target_id);

CREATE TABLE IF NOT EXISTS community_attachments (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL DEFAULT 'post', -- post | comment
  target_id TEXT NOT NULL,
  url TEXT NOT NULL,
  media_key TEXT DEFAULT '',
  name TEXT DEFAULT '',
  content_type TEXT DEFAULT '',
  media_type TEXT DEFAULT 'image', -- image | video | link
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
  -- NOTE: target_type/target_id is intentionally polymorphic (post|comment),
  -- so no single-table FOREIGN KEY is possible here. Referential integrity is
  -- enforced by the application layer, which only inserts ids that exist in
  -- community_posts or community_comments.
);

CREATE INDEX IF NOT EXISTS idx_community_attachments_target
  ON community_attachments(target_type, target_id, sort_order);

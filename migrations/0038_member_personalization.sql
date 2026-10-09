-- Additive Settings migration. Profile accents/fonts are separate from the site theme.
CREATE TABLE IF NOT EXISTS member_personalization (
  owner_id TEXT PRIMARY KEY REFERENCES contributors(id),
  highlight TEXT NOT NULL DEFAULT 'theme',
  font TEXT NOT NULL DEFAULT 'default',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

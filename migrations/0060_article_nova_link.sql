-- TPI-NOVA-004R5: optional link from an article to its Nova editorial working document.
-- The articles row stays the publication record. The column is nullable, so every
-- existing article remains valid without a Nova document. No rows are updated and
-- no foreign key cascade exists: deleting either side never deletes the other.
ALTER TABLE articles ADD COLUMN nova_item_id TEXT;

-- One article links to at most one Nova document, and one Nova document is linked
-- to at most one article.
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_nova_item_id
  ON articles(nova_item_id)
  WHERE nova_item_id IS NOT NULL;

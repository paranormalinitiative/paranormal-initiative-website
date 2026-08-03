-- Fix Spiricom Digital Bench Test article ownership
-- The article id = education-area-investigation-science-untitled-research-paper
-- was created with created_by pointing to the wrong contributor.
-- It belongs to Todd Wayne (owner/director account) but was assigned
-- to a different contributor ID, causing the author profile link to
-- point to the wrong person and the article to be missing from Todd's
-- My Content → Published list.
--
-- This migration:
-- 1. Finds Todd Wayne's contributor record
-- 2. Updates the article's created_by to Todd Wayne's UUID
-- 3. Preserves all article content, comments, reactions, and metadata

UPDATE articles
SET created_by = (
    SELECT id FROM contributors
    WHERE active = 1
      AND role = 'owner'
      AND (lower(display_name) LIKE '%todd%wayne%'
           OR lower(username) LIKE '%todd%')
    LIMIT 1
)
WHERE id = 'education-area-investigation-science-untitled-research-paper'
  AND created_by != (
    SELECT id FROM contributors
    WHERE active = 1
      AND role = 'owner'
      AND (lower(display_name) LIKE '%todd%wayne%'
           OR lower(username) LIKE '%todd%')
    LIMIT 1
  );

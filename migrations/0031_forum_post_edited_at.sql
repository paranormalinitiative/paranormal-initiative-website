-- 0031: track when a forum post body was last edited by its author.
ALTER TABLE forum_posts ADD COLUMN edited_at TEXT;

-- Backfill from updated_at so existing edits are not mislabeled as unedited.
UPDATE forum_posts SET edited_at = updated_at WHERE updated_at IS NOT NULL AND updated_at != created_at;

-- 0034: Remove the retired Forum schema (Community Feed consolidation, Part E).
-- ONLY apply after: migration 0033 data migration verified, the deployed
-- application reads/writes the dedicated community_* tables exclusively, and
-- a database backup has been taken (wrangler d1 export). See
-- FORUM_DEPENDENCY_AUDIT.md §4 for the full safety sequence.
--
-- The Community Feed does NOT depend on any of these tables after the
-- community model cutover. All community content lives in:
--   community_categories / community_posts / community_comments /
--   community_reactions / community_attachments

DROP TABLE IF EXISTS forum_reactions;
DROP TABLE IF EXISTS forum_post_attachments;
DROP TABLE IF EXISTS forum_topic_reads;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS forum_topics;
DROP TABLE IF EXISTS forum_categories;

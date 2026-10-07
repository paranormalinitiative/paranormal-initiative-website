-- 0033: Community Feed data migration (see FORUM_DEPENDENCY_AUDIT.md §2/§4).
-- Part B of the Community Feed consolidation. Copies ALL existing community
-- content out of the forum tables into the dedicated community tables with
-- original IDs, authors, timestamps, states, reactions and attachments preserved.
-- Also preserves the Steve Glanz ITC Ethics essay as the canonical Education
-- Center article in the Ethics topic (directive §13).
--
-- Reconciliation targets after this migration (directive §40):
--   community_categories  = 16  (one per forum_categories row)
--   community_posts       = 5   (one per forum_topics row; opener post id preserved)
--   community_comments    = 2   (forum posts that are not openers: 7 - 5)
--   community_reactions   = 2   (one per forum_reactions row)
--   community_attachments = 4   (one per forum_post_attachments row)
--   articles              +1    (Steve Glanz ITC Ethics essay, Ethics topic)
--
-- Forum tables are NOT modified or dropped here (that is 0034, later).

-- ---- 1. Categories ----
INSERT INTO community_categories (id, title, description, sort_order, active, created_at)
SELECT id, title, description, sort_order, active, created_at
FROM forum_categories;

-- ---- 2. Topic openers -> community_posts (original forum_post id preserved) ----
-- "Opener" = the earliest post of its topic (created_at, then id) — the same rule
-- the feed always used. Topic status maps: open|locked -> visible,
-- inactive -> hidden, deleted -> deleted.
INSERT INTO community_posts (id, category_id, author_id, title, body, status, edited_at, created_at, updated_at)
SELECT
  fp.id,
  ft.category_id,
  fp.contributor_id,
  ft.title,
  fp.body,
  CASE ft.status WHEN 'deleted' THEN 'deleted' WHEN 'inactive' THEN 'hidden' ELSE 'visible' END,
  fp.edited_at,
  fp.created_at,
  fp.updated_at
FROM forum_posts fp
JOIN forum_topics ft ON ft.id = fp.topic_id
WHERE NOT EXISTS (
  SELECT 1 FROM forum_posts fp2
  WHERE fp2.topic_id = fp.topic_id
    AND (fp2.created_at < fp.created_at
         OR (fp2.created_at = fp.created_at AND fp2.id < fp.id))
);

-- ---- 3. Non-opener posts -> community_comments (original forum_post id preserved) ----
INSERT INTO community_comments (id, post_id, author_id, body, status, edited_at, created_at, updated_at)
SELECT
  fp.id,
  (SELECT op.id FROM forum_posts op
    WHERE op.topic_id = fp.topic_id
      AND NOT EXISTS (
        SELECT 1 FROM forum_posts fp2
        WHERE fp2.topic_id = fp.topic_id
          AND (fp2.created_at < op.created_at
               OR (fp2.created_at = op.created_at AND fp2.id < op.id))
      )
  ) AS community_post_id,
  fp.contributor_id,
  fp.body,
  CASE WHEN fp.status = 'visible' THEN 'visible' ELSE 'deleted' END,
  fp.edited_at,
  fp.created_at,
  fp.updated_at
FROM forum_posts fp
WHERE EXISTS (
  SELECT 1 FROM forum_posts fp2
  WHERE fp2.topic_id = fp.topic_id
    AND (fp2.created_at < fp.created_at
         OR (fp2.created_at = fp.created_at AND fp2.id < fp.id))
);

-- ---- 4. Reactions (target = post if source was an opener, else comment) ----
INSERT INTO community_reactions (id, target_type, target_id, contributor_id, reaction, created_at)
SELECT
  fr.id,
  CASE WHEN EXISTS (
    SELECT 1 FROM forum_posts fp3
    WHERE fp3.id = fr.post_id
      AND NOT EXISTS (
        SELECT 1 FROM forum_posts fp2
        WHERE fp2.topic_id = fp3.topic_id
          AND (fp2.created_at < fp3.created_at
               OR (fp2.created_at = fp3.created_at AND fp2.id < fp3.id))
      )
  ) THEN 'post' ELSE 'comment' END,
  fr.post_id,
  fr.contributor_id,
  fr.reaction,
  fr.created_at
FROM forum_reactions fr;

-- ---- 5. Attachments (same opener/reply mapping as reactions) ----
INSERT INTO community_attachments (id, target_type, target_id, url, media_key, name, content_type, media_type, sort_order, created_at)
SELECT
  fa.id,
  CASE WHEN EXISTS (
    SELECT 1 FROM forum_posts fp3
    WHERE fp3.id = fa.post_id
      AND NOT EXISTS (
        SELECT 1 FROM forum_posts fp2
        WHERE fp2.topic_id = fp3.topic_id
          AND (fp2.created_at < fp3.created_at
               OR (fp2.created_at = fp3.created_at AND fp2.id < fp3.id))
      )
  ) THEN 'post' ELSE 'comment' END,
  fa.post_id,
  fa.url,
  fa.media_key,
  fa.name,
  fa.content_type,
  fa.media_type,
  fa.sort_order,
  fa.created_at
FROM forum_post_attachments fa;

-- ---- 6. Preserve the Steve Glanz ITC Ethics essay (directive §13) ----
-- Canonical Education Center article, Ethics topic, existing articles model.
-- The essay body is preserved word-for-word; only formatting was adapted to the
-- Education Center publication format (principle labels became headings).
-- Provenance (original community discussion, July 2026) is kept in `source`.
-- No publication notification is generated for this preservation insert.
INSERT INTO articles (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by, created_at, updated_at)
VALUES (
  'education-area-ethics-professional-standards-itc-ethics-curiosity-must-be-matched-by-responsibility',
  'education-area-ethics-professional-standards.html',
  'published-article.html?id=education-area-ethics-professional-standards-itc-ethics-curiosity-must-be-matched-by-responsibility',
  'ITC Ethics: Curiosity Must Be Matched by Responsibility',
  'An ethical framework for responsible Instrumental TransCommunication research',
  'Research Paper',
  'Steve Glanz',
  'Originally published in the TPI community discussion, July 2026.',
  '<section class="lesson-reading-section series-article">
<p>As interest in Instrumental TransCommunication grows, so does the need for a thoughtful ethical framework. ITC involves more than experimenting with audio, video, radio, or digital systems. It can also affect grieving families, vulnerable individuals, research participants, and the credibility of the wider field.</p>
<p>A few principles seem especially important:</p>
<h3>Be Honest About Uncertainty</h3>
<p>An unusual voice, image, or message should not automatically be presented as proof of spirit communication. Possible contamination, misinterpretation, pareidolia, and ordinary technical causes should be considered openly.</p>
<h3>Protect Privacy and Obtain Consent</h3>
<p>Recordings, names, personal messages, photographs, and session details should not be shared publicly without permission from the living people involved. Extra care is needed when material concerns bereavement, illness, trauma, or family relationships.</p>
<h3>Avoid Exploiting Grief</h3>
<p>No practitioner should use extraordinary claims, fear, or emotional vulnerability to pressure someone into paying for a service, buying equipment, or accepting a particular belief. Fair compensation for genuine work is one thing; taking advantage of people coping with death or loss is another.</p>
<h3>Separate Observation from Interpretation</h3>
<p>Researchers should preserve original files, document equipment and conditions, disclose editing or filtering, and distinguish clearly between what was recorded and what they believe it means.</p>
<h3>Encourage Independent Evaluation</h3>
<p>Blind listening panels, controlled procedures, consistent protocols, and collaboration can reduce personal bias. Criticism should be treated as part of responsible inquiry rather than as hostility.</p>
<h3>Consider Potential Harm</h3>
<p>Before conducting or sharing a session, we should ask: Could this increase fear, obsession, dependency, conflict, or false hope? Respect for persons and protection from harm should matter as much as the pursuit of evidence.</p>
<h3>Treat All Participants with Dignity</h3>
<p>Whether someone is a believer, skeptic, experiencer, researcher, or grieving relative, respectful discussion should be the standard. No one person or group has a monopoly on truth or communication.</p>
<p>ITC may involve profound questions, but profound questions require careful methods and ethical restraint. The goal should not simply be to produce compelling material. It should be to pursue understanding without misleading, exploiting, or harming others.</p>
<p><em>What ethical principles do you believe every ITC researcher or practitioner should follow? Join the discussion in the TPI Community Feed.</em></p>
</section>',
  NULL,
  'Ethics, ITC, Research Standards',
  'published',
  '04c286d7-ef2a-4f52-a2cc-7999d65ed040',
  '2026-07-29 06:02:09',
  '2026-07-29 06:02:09'
);

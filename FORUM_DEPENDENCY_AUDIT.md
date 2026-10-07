# FORUM DEPENDENCY AUDIT — Community Feed Consolidation & Complete Forum Retirement

[BUFFY] 2026-10-06 — Required by REVISED MASTER IMPLEMENTATION DIRECTIVE §6–§7 before any schema change.
Builds on PHASE1_IMPLEMENTATION_MAP.md (Phase 1, read-only). This audit is code + live-schema focused.

---

## 1. EVERY RUNTIME REFERENCE TO FORUM (project-wide scan result)

### Backend — `functions/api/[[path]].js`
| Reference | Purpose | Feed dependency? | Action |
|---|---|---|---|
| Routes `GET /forum` (handleForumIndex) | Forum UI index + **feed composer category list** (member-home `loadForumCategories`) | YES (categories) | Replace with `GET /community/categories` |
| Routes `GET /forum/topics/{id}` (handleForumTopic) | Forum topic thread view | YES (feed "Open Discussion" target) | Replace with `GET /community/posts/{id}/comments` |
| `POST /forum/topics` (handleCreateForumTopic) | **Feed composer submit** | YES (WRITE) | Replace with `POST /community/posts` |
| `PUT /forum/topics/{id}` (handleUpdateForumTopic) | Feed post edit (edits opener post body) | YES (WRITE) | Replace with `PUT /community/posts/{id}` |
| `DELETE /forum/topics/{id}` (handleDeleteOwnForumTopic) | Feed post delete (soft) | YES (WRITE) | Replace with `DELETE /community/posts/{id}` |
| `POST /forum/topics/{id}/posts` (handleCreateForumPost) | Forum replies = **the Feed's only comment/reply mechanism** | YES (WRITE) | Replace with `POST /community/posts/{id}/comments` |
| `POST /forum/topics/{id}/read` (handleMarkForumTopicRead) | forum_topic_reads (forum UI only) | NO | Remove with Forum |
| `DELETE /forum/posts/{id}` (handleDeleteForumPost) | Delete a reply/comment | YES (WRITE) | Replace with `DELETE /community/comments/{id}` |
| `POST /forum/posts/{id}/reactions` (handleSetForumReaction) | Reactions on posts AND replies | YES (WRITE) | Replace with `POST /community/{posts\|comments}/{id}/reactions` |
| `GET /feed` (handleCommunityFeed) | Reads forum_posts+topics+categories (latest post per topic) | YES (READ) | Rewrite on community tables |
| `GET /feed/user` (handleUserFeed) | Reads forum posts by user | YES (READ) | Rewrite on community tables |
| `notifyActiveMembers` / `createForumContentNotifications` | Notification hrefs `community-forum.html?member=1&topic=…&post=…` | YES | Rewrite href → `member-home.html?member=1#post-<id>`; types `forum_post` → `community_post` |
| `handleMyPulse` (/me/pulse) | Counts forum_reactions, forum_topics started, forum reply posts | YES (READ) | Rewrite on community tables |
| `handleAdminMemberForumPosts` (`GET /admin/forum/posts`) | Admin member detail (posts list) | YES (READ) | Replace with `GET /admin/community/posts` |
| `handleAdminSetForumTopicStatus` (`POST /admin/forum/topics/{id}/status`) | Admin moderation of feed posts | YES (WRITE) | Replace with `POST /admin/community/posts/{id}/status` |
| `attachForumPostMedia`, `attachForumPostReactions`, `getForumReactionSummary`, `sanitizeForumAttachments`, `insertForumAttachments`, `getForumReadRows`, `isAllowedForumReaction`, `FORUM_REACTIONS` | Forum helpers | YES (first five) | Port to community versions (batched to avoid N+1); drop `getForumReadRows` |
| `handleForumMediaUpload` (`POST /uploads/forum-media`) | Feed media upload; R2 keys prefixed `forum/` | YES | Rename `POST /uploads/community-media`, area key `community/` (existing R2 keys keep serving via `/api/media/`) |

### Frontend
| File | Reference | Action |
|---|---|---|
| `community-forum.html` / `community-forum.js` | The Forum UI itself (16 categories, topic sidebar, bubble thread, New Topic, leadership tools) | DELETE (retire) |
| `member-home.html` | Composer (`createForumTopic`, `uploadForumMedia`), `loadForumCategories` (from `/api/forum`), feed card `item.topicId`, "Open Discussion" → `community-forum.html#topic=…`, share URL, edit/delete menu, rail Featured "Community Forum" block (line ~2000), rail Active Discussions (`forumIndex` ×2) + "Forum" link (~2049) | Rewrite on community model; inline comments + reaction button replace the forum thread view |
| `explore.js` | `createForumTopic`, redirect to `community-forum.html?member=1&topic=…`, "Open Community Forum" CTA, member fallback href, `item.type === "forum_post"` links | Rewrite: `POST /community/posts`, links → `member-home.html?member=1#post-<id>` |
| `explore.html` | Filter button `data-explore-filter="forum_post"` | → `community_post` |
| `api-client.js` | `memberForumPosts`, `setForumTopicStatus`, `deleteForumTopic`, `uploadForumMedia`, `forumIndex`, `forumTopic`, `markForumTopicRead`, `createForumTopic` (+ updateForumTopic/deleteOwnForumTopic further down) | Replace with community wrappers |
| `member-shell.js` (~line 433) | Mobile nav injected "Forum" link → community-forum.html | Remove |
| `member-login.js` (admin) | `/admin/forum/posts` render ("Forum Posts", `topicTitle`), setForumTopicStatus/deleteForumTopic buttons, copy "Can post in the community forum." | Repoint to `/admin/community/*`, update copy |
| `admin-panel.html` (line 74) | Copy: "forum posts, uploaded forum media" | Update copy |
| `member-login.html` (line 70) | Copy: "comments and forum replies" | Update copy |
| `index.html` (lines 121, 251-253) | Landing teaser card + CTA "Community Forum" → community-forum.html | Repoint to member-home (Community Feed) |
| `teams/teams.js` (line 84) | Nav link ../community-forum.html | Remove |
| `tpi-videos.html` (line 464) | CTA → community-forum.html | Repoint to member-home |
| `header.html` (line 24) | Public nav "Community Forum" | Remove |
| `member-sidebar.html` (line 67) | Member nav "Community Forum" | Remove |
| `sitemap.xml` (line 128) | community-forum.html entry | Remove (regenerate; build script auto-excludes deleted files) |
| `search-index.js` | Static index includes community-forum.html | Regenerate after file deletion |
| `worker.js` | No forum reference | ADD: 302 redirect `/community-forum.html` (+ extensionless) → `member-home.html?member=1` for historical URLs/notifications |
| `style.css` | `discussion-*` forum UI classes (inert after UI removal) | Leave in shared stylesheet (inert, zero risk) — documented as intentionally retained |

### NOT runtime (verified, no action)
- Historical prose in lesson/compendium pages (e.g., "ITC forums", "community forum posts" in research text) — content, not code.
- `social-feed-lab/app.js` — offline design lab, not deployed page flow (chat copy mentions forum) — leave.
- Docs/plans (.md) — historical records; MASTER_BUILD_PLAN/PHASE1 map updated at completion.
- Migrations 0003–0031 — immutable history; superseded by 0032+.

## 2. LIVE FORUM DATA INVENTORY (read-only prod queries, 2026-10-06)

Tables: `forum_categories` (16), `forum_topics` (5), `forum_posts` (7), `forum_post_attachments` (4),
`forum_reactions` (2), `forum_topic_reads` (forum-UI-only read tracking).

Topics and classification (per directive §12–§14):
| # | Topic / first post | Author | Status | Classification | Disposition |
|---|---|---|---|---|---|
| 1 | "What is an EVP?" ("How do you know its a spirit voice" + "It should tell you") | Todd Wayne | **deleted** | C. Test/obsolete | Migrate with status `deleted` (data preserved, never displayed) |
| 2 | "Test for Water Scrying" (water-faces question) | Todd Wayne | open | A. Community discussion | Migrate visible → Community Feed |
| 3 | "ITC Ethics: Curiosity Must Be Matched by Responsibility" — **unique educational essay** by Steve Glanz (2nd post = Todd Wayne's supportive reply) | Steve Glanz | open | B. Educational material + A. discussion | **Essay preserved as Education Center → Ethics article (canonical)**; thread also migrates to Community Feed as discussion (Todd's reply preserved as a comment) |
| 4 | "…heart felt Thank You for becoming a member…" | Todd Wayne | open | A. Community announcement | Migrate visible → Community Feed |
| 5 | "The Cauldron and The Craft Website" | Todd Wayne | **deleted** | C. Test/obsolete | Migrate with status `deleted` |

Post-level mapping rule: each topic's FIRST visible post → `community_posts` (id preserved = original forum_post id);
subsequent posts → `community_comments` (id preserved). Topic status mapping: `open|locked → visible`,
`inactive → hidden`, `deleted → deleted`. Reactions and attachments follow their source post (opener→post,
reply→comment) via polymorphic `target_type`/`target_id`.

The Steve Glanz essay full text was retrieved verbatim (2026-07-29 06:02:09) and is preserved
word-for-word in migration 0033 as an `articles` row:
- id: `education-area-ethics-professional-standards-itc-ethics-curiosity-must-be-matched-by-responsibility`
- destination: `education-area-ethics-professional-standards.html` (Ethics shelf)
- article_type: `Research Paper` (matches the sibling ethics article type)
- author: `Steve Glanz`; created_by: sglanz contributor id `04c286d7-ef2a-4f52-a2cc-7999d65ed040`
- status: `published`; created_at preserved `2026-07-29 06:02:09`
- No notification fan-out for the preservation insert (it is a preservation, not a new publication).

## 3. NEW COMMUNITY DATA MODEL (directive §5, §8)

Tables (migration 0032) — reuse existing patterns; no rename-and-pretend:
- `community_categories` — copied from forum_categories (16 rows; the composer's category list).
- `community_posts` — id, category_id, author_id→contributors, title, body, status (visible/hidden/deleted), edited_at, created_at, updated_at.
- `community_comments` — id, post_id, author_id, body, status, edited_at, created_at, updated_at (flat thread = same shape as the old topic reply list; no nesting existed).
- `community_reactions` — id, target_type (post|comment), target_id, contributor_id, reaction, UNIQUE(target_type,target_id,contributor_id).
- `community_attachments` — id, target_type (post|comment), target_id, url, media_key, name, content_type, media_type, sort_order, created_at.

NOT migrated (forum-UI-only, retired with Forum): `forum_topic_reads` (unread tracking for the forum
thread view; the Feed has no read-state feature).

## 4. MIGRATION SEQUENCE (directive §11, §38)

- **0032** `community_feed.sql` — create the five community tables + indexes (non-destructive).
- **0033** `community_feed_migration.sql` — INSERT…SELECT categories; map topics/posts → posts/comments
  (IDs preserved); map reactions/attachments; **INSERT the Glanz Education Center article**.
  Reconcile counts before proceeding (§40): 16/16 categories; 5 openers + 2 replies = 7 posts mapped;
  2 reactions; 4 attachments; 0 unmigrated.
- **0034** `drop_forum.sql` — `DROP TABLE forum_reactions, forum_post_attachments, forum_topic_reads,
  forum_posts, forum_topics, forum_categories` — applied ONLY after: code switched (deployed), prod
  Feed verified, counts reconciled, and `wrangler d1 export` backup taken.
- No foreign keys in the retained schema reference forum tables (verified: only the six forum tables
  reference each other + contributors; comments/article/video/messenger tables do not).

## 5. STOP CONDITIONS (§57)

Any of: count mismatch after 0033; feed reading/writing forum tables post-switch; missing
comments/reactions/attachments; FK references to forum tables; auth regression; Education publication
regression; notification breakage ⇒ STOP before 0034.

--- END AUDIT — implementation proceeds per directive §64 order.
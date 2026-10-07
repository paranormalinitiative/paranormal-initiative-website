# TPI PHASE 1 — IMPLEMENTATION MAP (INSPECTION DELIVERABLE)

[BUFFY] 2026-10-06 — Per MASTER_IMPLEMENTATION_DIRECTIVE Section 63 / MASTER_ARCHITECTURAL_PLAN.md Phase 1.
Read-only inspection. NO code, data, or configuration was modified during this phase.
Live production D1 was queried read-only (`wrangler d1 execute --remote` with SELECT-only
commands; zero writes, `changed_db: false`).

---

## 1. FRAMEWORK & DEPLOYMENT

| Layer | Implementation |
|---|---|
| Hosting | Cloudflare Workers (`wrangler.toml`, worker name `theparanormalinitiative`, main = `worker.js`) |
| Static site | Repo-root HTML/JS/CSS served from `ASSETS` binding, `run_worker_first = true` |
| Backend API | Single catch-all Pages-Function-style router: `functions/api/[[path]].js` (4,472 lines) mounted at `/api/*` by `worker.js` |
| Database | Cloudflare D1 binding `TPI_DB`, database `tpi_contributor_portal` (id `f36b9161-b517-4634-9857-bef4147cefe3`) |
| Object storage | R2 binding `TPI_MEDIA`, bucket `tpi-contributor-media`, served via `/api/media/{key}` |
| Cron | `0 */6 * * *` — events/news/videos scrapers (`lib/*-scraper.js`) |
| Auth provider | Custom: D1 `sessions` + `contributors` tables, cookie `tpi_session` (`lib/auth.js`) |
| Email | `lib/email.js` (Resend — see RESEND_SETUP.md) |
| Cache/CDN | Cloudflare (Workers Cache API used for link previews) |

**No framework frontend** — plain HTML pages + vanilla JS. Two shared shells:
- Public pages: `includes.js` injects `header.html` + `footer.html`, site search band, comments, theme.
- Member pages: `member-shell.js` + `member-sidebar.html` inject left-nav, notifications badge, chat, role gating.

## 2. DATA MODEL (relevant tables; 31 migrations in `migrations/`)

- `contributors` — ALL users (members + contributors + admins in one table). `role TEXT` in {`owner`, `admin`, `contributor`, `member`}. Also: username, password_hash, display_name, title, photo_url, chat_color, active, `can_post/can_message` flags (0018), `notification_prefs` JSON (0028), email verification (0026).
- `sessions` — token cookie sessions.
- `articles` — **Education Center content model** (0001 + 0002): id, `destination` (topic page filename), href (canonical URL), title, subtitle, `article_type` (content type), author (display string), source, `body_html` + `article_html`, labels, `status` (`draft`|`published`), created_by, created_at, updated_at. 24 rows live (22 published, 2 drafts).
- `forum_categories` (16 rows) / `forum_topics` (5 rows) / `forum_posts` (7 rows) — **Community Forum AND Community Feed share these tables** (0004, 0007, 0031 edited_at). `forum_reactions` (7 emoji set), `forum_post_attachments` (4 rows), `forum_topic_reads`.
- `comments` — article page comments with moderation status.
- `member_notifications` (0017) — per-user: id, contributor_id, title, body, `action_href`, type, read_at, created_by, created_at. 12 rows live.
- `article_reactions`, `tpi_videos` (+comments/reactions/saves/reports), `news_articles`, `events`, `messenger` tables (conversations/messages/read state/restrictions), `invite_codes`, `site_settings`, `paranormal_teams`, StudioFlow tables.

## 3. AUTHENTICATION & ROLES

- Login: `POST /api/auth/login` → session token cookie. `getSessionUser()` joins sessions→contributors, checks expiry + active.
- Middleware in `[[path]].js` (lines 3878–3899):
  - `requireMember` = any authenticated, active user (no role check).
  - `requireContributor` = role in {owner, admin, contributor} — **backend-enforced**.
  - `requireAdmin` = role in {owner, admin} — **backend-enforced**.
- Per-account action flags: `getMemberActionAccessError` (post/comment/message disabled per member).
- Live roles: admin=Todd_Wayne, contributor=sglanz, member×3 (HRMoss7, Backwoods_Signal, TPI_Tablet_Test).

## 4. EDUCATION CENTER (as found)

- Hub: `education-center.html` (static topic cards) → 12 topic "shelf" pages `education-area-*.html`
  (exactly the 12 master-plan topics) + extra series shelves (`investigation-development-series.html`,
  `ghostology-101.html`, `evp-itc-lessons.html`, `field-articles.html`, `method-exercises.html`, `tpi-videos.html`).
- Topic shelves = static HTML cards (pre-existing lesson pages `education-research-*.html`, `evp-itc-lesson-*.html`,
  `investigation-development-*.html`, Anabela Cardoso research pages) **plus dynamic cards**:
  `includes.js` (`loadCloudflareArticleCards`, ~line 846) fetches
  `GET /api/articles?destination=<this page>` and prepends `study-resource-card` elements.
- Article detail: `published-article.html?id=…` + `published-article.js` render from
  `GET /api/articles` (only `status='published'` exposed publicly — drafts are NOT).
- `articles.destination` IS the topic assignment; `article_type` IS the content type
  (Research Paper, Research Note, Field Article, Experimental Report, Technical Note, Review Paper,
  Case / Location Study, Media Review, Method Exercise, Contributor Note, TPI Video).
- Canonical URLs: `href` defaults to `published-article.html?id=<id>`; shelf pages carry
  `<link rel="canonical">` to their own `education-area-*.html` URL.
- Static site search index (`search-index.js`, built by `scripts/build-search-index.js`) covers all
  static pages including every education shelf/lesson page.

## 5. CONTENT EDITOR (as found)

- `paper-editor.html` + `paper-editor.js` (2,211 lines) — rich compose/HTML editor.
- Post Settings: Subtitle, **Destination select (topic)** listing all 12 education areas + 6 extra
  shelves, **Contribution Type select (content type)**, Author, Affiliation, Organization,
  Correspondence, Website, Source, Labels, plus TPI-Video settings block.
- Drafts: `POST /api/articles` with `status:"draft"`; Publish with `status:"published"`.
  Idempotent upsert on `articles.id`. Publishing requires a real (non-"Untitled") title.
- **Publication event already exists**: `handleCreateArticle` (line ~1252) fires ONLY when
  `status==="published" && existingArticle?.status !== "published"` (draft→published transition;
  re-saving an already-published article does NOT re-notify). It calls `notifyActiveMembers(... type:"education", actionHref: article href ...)`, excluding the publishing author.
- Front-end gating: page loads `editor-locked`; `hasContributorAccess()` (owner/admin/contributor)
  unlocks; otherwise an access-gate overlay blocks the UI. **Backend enforcement is via
  `requireContributor` on `POST /api/articles`** — a member hitting the API directly gets 403.
- Media upload to R2: `/api/uploads/article-media` (requireContributor) — this is the enforced path.
- Nav entry: member-sidebar "Content Tools → Content Editor" link is currently shown to ALL
  signed-in members (not role-hidden; only guests get `is-member-protected`). Page + API gate the
  actual functionality; regular members see the access-denied message.
- Delete: `DELETE /api/articles/{id}` — author-or-admin enforced.

## 6. COMMUNITY FEED (as found)

- UI: `member-home.html` — Facebook-style composer (text, photos, videos, files, links w/
  Facebook-style server-side OG previews via `GET /api/link-preview`), category select
  (currently only `general`), feed tabs (Activity / Posts / Published Content), Load More,
  share modal, Edit/Delete own posts (`forum_posts.edited_at`), full-screen media lightbox,
  right-rail widgets (My Pulse, Events, Active Members, Discussions, ParaNews, Featured).
- **Backend: the feed IS the forum tables.** Composer calls `POST /api/forum/topics`
  (`createForumTopic` → `forum_topics` + first `forum_posts`, per-category, per-member
  `can_post` flag enforced, R2 attachments sanitized). Read via `GET /api/feed` which merges:
  latest `forum_posts` per topic + published `tpi_videos` + published `articles`
  (title/subtitle/type/author/href preview — **link+summary, never full body**), merged
  newest-first, paginated limit/offset. `GET /api/feed/user` for profile feeds.
- Notifications for member posts: `createForumContentNotifications` → "X posted in …" (+photo/video
  variants) to all active members except author.
- Moderation: admin block/unblock, set topic status, delete comments, delete posts (owner-or-admin /
  own-post delete endpoints), `member_restrictions` in messenger.
- **Conclusion: the Community Feed already exists and is the live social hub; it is layered on the
  forum data model, so forum "infrastructure retirement" cannot mean dropping those tables without
  breaking the feed.**

## 7. COMMUNITY FORUM (legacy, as found)

- UI: `community-forum.html` + `community-forum.js` — messenger-style board: category list
  (16 categories mirroring Education topics + Experiences, Metaphysics, Scrying), topic sidebar,
  bubble thread, New Topic form, leadership member-search tools, read/unread tracking.
- Same API + tables as the feed (`/api/forum/*`, `forum_topics`/`forum_posts`).
- **Live content inventory (read-only audit of prod D1, 2026-10-06):**

| # | Topic (category) | Author | Created | Status | Posts | Assessment |
|---|---|---|---|---|---|---|
| 1 | "What is an EVP?" (EVP & ITC Research) | Todd Wayne | 2026-07-26 | **deleted** | 2 ("How do you know its a spirit voice" / "It should tell you") | C — duplicate/obsolete; static lesson `evp-itc-lesson-evp-basics.html` already covers EVP basics authoritatively |
| 2 | "Test for Water Scrying" (Scrying) | Todd Wayne | 2026-07-27 | open | 1 ("What do you believe the faces are in the water?…") | D — discussion question; water-ITC educational material already exists (`water-itc.html`, `evp-itc-lesson-water-steam.html`) |
| 3 | "ITC Ethics: Curiosity Must Be Matched by Responsibility" (Ethics) | Steve Glanz (+1 reply by Todd Wayne) | 2026-07-29 | open | 2 | **B — unique educational essay** by contributor Steve Glanz; candidate for Education Center preservation (Ethics topic, ~Field/Research Article) |
| 4 | "…heart felt Thank You for becoming a member…" (General) | Todd Wayne | 2026-10-06 | open | 1 | D — non-educational announcement |
| 5 | "The Cauldron and The Craft Website" (General) | Todd Wayne | 2026-10-06 | **deleted** | 1 | C — deleted in testing |

- Attachments: 4 `forum_post_attachments` rows exist; 2 `forum_reactions`; 2 external article comments.
- No topic currently functions as unique formal research EXCEPT #3 (Steve Glanz ITC Ethics essay,
  whose full body needs retrieval before any retirement step).
- External URL exposure: `community-forum.html` is in `sitemap.xml` (1 reference), public
  `header.html` nav, member sidebar, footer links, and `?member=1&topic=` notification hrefs —
  notification history in `member_notifications` permanently references forum URLs.

## 8. NOTIFICATIONS (as found)

- Model: `member_notifications` (per-recipient rows, action_href deep link, type, read_at).
- Creators: admin→member (`/admin/members/{id}/notifications`), article publish ("New educational
  content: …", type `education`), forum posts/photos/videos, video publish (type video,
  href `tpi-video.html?id=`), messenger (virtual, computed from read state).
- Prefs: `contributors.notification_prefs` (0028) — per-category JSON map, NULL = all on. UI:
  member-notifications.html settings card.
- Delivery: in-app only (bell in sidebar with unread badge via `/api/notifications/unread-count`).
- `notifyActiveMembers` fans out one row per active member, excluding the actor. Idempotency for
  article publish is handled at the trigger level (draft→published transition only).

## 9. SEARCH (as found)

- `search.html` + `search.js` + static `search-index.js` (generated by `scripts/build-search-index.js`).
- Sources: all static pages (title/subtitle/text) + `GET /api/articles` (full text incl. bodyHtml)
  + `GET /api/contributors` (public profiles). Client-side scoring, top 80.
- Does NOT search forum/feed posts or comments (fine — feed posts are ephemeral; forum retirement
  requires no search cleanup, and forum pages in the static index are only the forum shell page itself).

## 10. NAVIGATION (as found)

- Public `header.html` nav: Home, About, Our Apps, Education Center, TPI Videos,
  **Community Forum**, ParaNews, ParaTube, Repository, Haunted Locations, Paranormal Teams,
  Standards & Ethics, Advisory Board, Search, Member Login, Contact & Links.
- `member-sidebar.html`: Alerts(Notifications); TPI(Home, About, Our Apps, **Education Center**,
  Repository, Haunted Locations, Teams, Standards, Advisory, Search, Contact); Video & Studio
  (Reels, TPI Videos, Studio); Community(**Community Forum**, Events, ParaNews, ParaTube, Chat,
  Activity[coming]); Content Tools(**Content Editor** — not yet role-hidden); You(Profile, Saved,
  Settings, Admin Panel[hidden non-admin], Manage Events[hidden non-admin], Log Out).
- Footer: `footer.html` — contains NO forum link (verified by grep); forum exposure is limited to public `header.html` nav, member sidebar, and sitemap.
- No sitemap/robots issues: `robots.txt` disallows `/paper-editor.html`; sitemap includes forum page.

## 11. RELEVANT API ENDPOINTS (complete route table in `functions/api/[[path]].js` lines 20–141)

Education/content: `GET/POST /articles`, `DELETE /articles/{id}`, `GET /contributors/me/articles`,
`POST /uploads/article-media`, `GET/POST /articles/reactions`, `GET/POST /comments` (+admin moderation).
Feed/forum: `GET /feed`, `GET /feed/user`, `GET /forum`, `GET/POST/PUT/DELETE /forum/topics…`,
`POST /forum/topics/{id}/posts`, `POST /forum/posts/{id}/reactions`, `DELETE /forum/posts/{id}`,
`POST /uploads/forum-media`, `GET /link-preview`, `POST /forum/topics/{id}/read`.
Notifications: `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/{id}/read`.
Auth/admin: `/auth/*`, `/members/register`, `/owner/bootstrap`, `/invites*`, `/admin/contributors`,
`/admin/members/…` (activity, access, notifications, block/unblock), `/admin/forum/*`,
`/admin/comments/*`, `/admin/settings`.
Media/other: `/media/*`, `/events*`, `/news*`, `/videos*`, `/tpi-videos*`, `/video-*`,
messenger `/conversations/*`, studio `/studio/*`, `/room-codes/*`, `/rooms/*`, `/me/pulse`.

## 12. MIGRATION REQUIREMENTS (gaps vs. target architecture)

The site is CLOSER to the target architecture than the directive assumes. Confirmed already true:
canonical article model w/ topics+types ✓, server-side editor auth ✓, feed=announcement-style
article cards (link, not copy) ✓, article→notification on publish (idempotent on transition) ✓,
feed backed by one social store ✓, members blocked from publishing ✓.

Smallest gaps identified (for later phases, each a small change):
1. **Feed announcement as first-class record (optional):** articles already appear in feed via the
   `/api/feed` `article` merge — a dedicated `education_publication` feed post is NOT required;
   preserving the existing mechanism is the smaller change. (Decision for Phase 5–7.)
2. **Notification granularity:** notifications say "New educational content:" without
   content-type/topic detail; could include type/topic cheaply (title prefix).
3. **Forum retirement:** because feed + forum share `forum_topics/posts`, retirement = retire the
   community-forum.html UI + nav/footer/sitemap entries + public forum routes (read endpoints may
   remain for notification deep-links or get redirects), NOT the tables. Before that: preserve
   Steve Glanz's ITC Ethics essay into the Education Center (Ethics topic) and record audit
   classifications (Section 7 table). Notification hrefs referencing forum URLs need a redirect
   target decision (community-forum.html?member=1&topic=… → member-home feed or forum archive page).
4. **Nav hygiene:** member-sidebar "Content Editor" link shown to members — hide for
   non-contributor roles (page+API already enforce; UI-only nicety, no security impact).
5. **No destructive schema changes required** by anything found. No data loss risks identified.

## 13. FILES THAT WILL BE TOUCHED IN LATER PHASES (anticipated, per above)

`community-forum.html/js` (retire), `header.html`, `member-sidebar.html`,
`member-shell.js`, `sitemap.xml`, `scripts/build-search-index.js` (regenerate),
`functions/api/[[path]].js` (forum write-disable + optional notification enrichment),
`paper-editor.js` (notification copy only), `PHASE8_FORUM_AUDIT.md` (to create),
plus new Education Center preservation article for the Glanz essay.

--- END OF PHASE 1 MAP — no changes made; awaiting Phase 2 approval.
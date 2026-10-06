# TPI MASTER BUILD PLAN

[BUFFY] 2026-10-06 — **MASTER ARCHITECTURAL / SOURCE-OF-TRUTH PLAN v1.0 established (Todd).** MASTER_ARCHITECTURAL_PLAN.md added at repo root and is now the governing specification for: Education Center + research topics, Content Editor, contributor publishing, Community Feed (single social hub), publication notifications + community announcements, and Community Forum retirement. Key non-negotiables: Education Center = authoritative knowledge base organized by existing topics; Content Editor restricted to authorized contributors (regular members never); feed announces content with links, never duplicates full articles; notifications = discovery, announcements = discussion; forum content must be audited and unique educational material preserved in the Education Center before retirement — no forum-to-feed discussion migration, no new forum. Implementation must follow the preservation rules (inspect first, smallest safe change, no unrelated refactoring) and the 8-phase order ending in full regression. All future work in these areas conforms to this document unless superseded.

[BUFFY] 2026-10-06 — Community Forum media sized like the home feed (Todd: "community forum needs to be sized for videos and images as well. just like our home feed"): forum post attachments were locked to a 1:1 square crop with a 720px cap — now 16:10 boxes in the 3-across grid, a single image/video fills the full post width at 16:9 (max 460px), grid cap removed. Kept the Open Image/Video lightbox badges and captions. style.css cache bumped v88 → v89 across 203 pages. Verified computed geometry in-browser at desktop width (3 cols ×266px @16:10; single 818px full-width @16:9).

[BUFFY] 2026-10-06 — My Pulse Posts pill now reflects Todd's full posting history (Todd: "I have a ton of posts I have created since I first started this project"): the pill counted only forum topics started (his: 2 open after 2 were deleted in testing), hiding his real body of work — 21 published papers + 2 forum replies. Posts = forum topics started + visible forum replies (topic openers excluded so nothing double-counts) + published articles, every number still a truthful D1 COUNT. Expected value for Todd's account: 25 (2 + 2 + 21; drafts excluded until published). Deploy Version ID: 76d188bf-bbb4-40ed-a6e1-b8d99b9e160b (commit 0187f9f).

[BUFFY] 2026-10-06 — Removed the "Open Content Editor" button from the Settings page header (member-dashboard.html) per Todd — the Content Editor already lives in the left nav. member-login.js's data-contributor-tool hook is now a no-op on that page but stays for future tools. The duplicate button on member-home's My Content card was left in place (different surface) pending Todd's call.

[BUFFY] 2026-10-06 — Feed post overhaul (Todd): photos now fixed-size boxes filling the card (16:10 grid / 16:9 single, 8–12px corners) instead of the accidental circle crop — round corners stay avatar-only; Facebook-style link previews shipped end-to-end (new GET /api/link-preview server-side OG/Twitter-card fetcher with 30-min cache + SSRF guard, live preview card in the composer while adding a link, preview cards under feed posts via hydrateLinkPreviews); post Edit + Delete shipped on the member's own feed posts (⋯ menu → inline edit textarea with Edited badge via new forum_posts.edited_at migration 0031, or confirm-delete; PUT/DELETE /api/forum/topics/{id} with owner-or-admin checks). ParaPost itself is behind a Vercel bot checkpoint with an empty feed, so dimensions follow Facebook's feed convention. Verified in browser with mocked APIs: photo geometry, menu only on own posts, edit PUT + badge, delete removes card, composer + feed preview cards render; live curl of /api/link-preview returned real Wikipedia OG data. Cache bumps: api-client v17. Commit + deploy Version ID: 94539799-baaf-4fd1-8d83-473622dae16a.

[BUFFY] 2026-10-06 — Follow-up on the Featured Content rename: the homepage (index.html) static fallback card still said "Audio Research Lab" — renamed to "EVP / ITC Research" so the rename is consistent site-wide (member-home.html was already done in commit 6f414c5). Also confirmed Todd's screenshot showed the pre-deploy cached render; new layout is pills-above-preview as shipped in 8c5617cc. Deploy Version ID: 93daf349-6726-4df7-a985-89b927eeae5f (commit e644bd0).

[BUFFY] 2026-10-06 — Featured Content layout (Todd): category pills moved from overlapping the preview to their own line above it, block spacing widened to 16px, and Audio Research Lab renamed EVP / ITC Research across markup and JS so that section focuses on EVP/ITC. ParaTube dynamic fill updated to match the new pill placement. Verified in-browser (all 4 pills static above media). Deploy Version ID: 8c5617cc-8c92-4ebc-bddc-e24afe0dd3aa (commit 6f414c5).

[BUFFY] 2026-10-06 — Fresh content + spellcheck (Todd items 1-3): (1) home-page Featured Content carousel now pulls live latest videos + published articles from the APIs with per-visit shuffle and static-card fallback, and member-home's ParaTube rail slot rotates through the 6 newest videos instead of pinning the newest; (2) the main Activity feed refreshes on the visibility/timer cycle alongside the rail so everything posted by anyone reaches everyone without a reload (/feed was already viewer-agnostic); (3) spellcheck=true added to every textarea and text input across 50 pages. Verified in-browser: carousel rebuilt from mock APIs (14 cards, shuffled differently across runs), zero text boxes left unspelled. Deploy Version ID: faa07f02-94d6-4b09-ac8f-2a69b92716e8 (commit 42f33dc).

[BUFFY] 2026-10-06 — Member-home polish (Todd items 1-3): removed the redundant 'Home | Hello, …' header row (empty hidden marker prevents shell auto-regenerating it), right rail now starts exactly level with the You-Are-the-Initiative card (0px diff at desktop), and the My Pulse avatar ring breathes bright-then-dim on a 2.6s accent loop (reduced-motion respected). Verified in-browser including live border-color sampling. Deploy Version ID: 6c72ea04-9b65-4d69-ac45-9c4296b041ea (commit 3ea61ca).

[BUFFY] 2026-10-06 — Theme colors extended site-wide: events page (gradients, glows, section badges), ParaTube accent token (--pn-accent now var(--accent)), home featured-thumb gradient, and member-shell chat UI strings all converted from hardcoded purple to var(--accent). Default chat bubble color now follows the theme accent at runtime (asylum = dark orange). member-shell.js cache bumped to v=51. Category badges intentionally keep their multi-color semantic palette. Verified under asylum: computed-style sweep of events.html shows zero purple elements. Deploy Version ID: 6dd291f1-1cc2-47bf-82f0-3c6b77be7527 (commit 8337b5f).

[BUFFY] 2026-10-06 — Member-home themed: all 23 hardcoded purple values (rgba 168,85,247 / #a855f7 / #a78bfa) now derive from var(--accent), so highlights, hovers, glows, badges and avatar fallbacks follow the active theme. Author photo avatars now render on article feed cards and the Published Content tab (was hardcoded initial) — every article shows its author's real avatar. Verified under asylum theme in-browser. Deploy Version ID: 9a7f5235-026e-4a8b-9d7e-77eae6c5d497 (commit 1f16694).

[BUFFY] 2026-10-06 — Member-home items 2-4: (2) identity avatar ring now pulses with a slow accent-colored breathing animation on the member chip — unique TPI visual, prefers-reduced-motion respected; (3) You Are the Initiative statement moved into its own rounded card matching the page family; (4) soft light highlight halo added across member-home cards, pills, composer and empty states. member-shell.css cache bumped to v=60 across 28 pages. Verified in-browser. Deploy Version ID: 68d3c01e-17aa-4b6d-9a73-2ecc6fe98f67 (commit b3be22f).

[BUFFY] 2026-10-06 — My Pulse rebuilt per Todd: ParaPost-style card with six stat pills (Likes | Following, Posts | Comments, Uploads | Live Streams) backed by a new truthful /me/pulse endpoint counting real DB rows — reactions given (forum+article+video), forum topics started, article+video comments, R2 media uploads. Following and Live Streams honestly 0 until those features ship. Verified in-browser. Deploy Version ID: 543ef59c-15d4-44de-aa82-181127135041 (commit e74006b).

[BUFFY] 2026-10-06 — Radius uniformity completed on ALL 276 pages: final sweep fixed haunted-location directory (50 state pages), the three TPI compendiums, tpi-video watch page and ITC lab manual. Audit confirms zero off-system radii remain — the whole site now runs the single scale: 24px cards, 16px nested, 12px controls, full-round pills. Verified in-browser on directory + watch page. Deploy Version ID: 2ad2e782-736c-4daf-9a9c-3d990b4f8547 (commit f812c40).

[BUFFY] 2026-10-06 — Finished radius uniformity on member-home: nested rail blocks/feed cards/empty states to 16px, identity + composer cards to 24px, feed-card badge to full pill, share modal to 24px. Deploy Version ID: b1eb41f0-dce4-4c46-b9b5-51cd110d0dbf (commit ac79d03).

[BUFFY] 2026-10-06 — Uniform radius language on every page: swept all remaining hardcoded radii (cards/panels 10–20px → 24px Education look, small pills/chips 4–6px & 20px → fully round 999px, controls/inner tiles → 12–16px) across index, events, submit-event, admin-events, tpi-videos, member-home and the encyclopedia/glossary pages. Verified in-browser on home, events and tpi-videos. Deploy Version ID: 32764369-9576-4e42-b027-e0b6cf208a6c (commit f662e83).

[BUFFY] 2026-10-06 — Global Education Center card/pill styling: remapped radius tokens (--radius-sm 10→16px, --radius-md 16→24px) so all token-driven cards/panels/inputs get the rounder look, plus hardcoded 10px card radii on news/paratube/member-home rail → 24px. Pills already fully round. Verified in-browser (news 24px, rail 24px, Education Center unchanged as reference). Deploy Version ID: 5dc8d03f-6637-48da-99bb-bf1fb462b632 (commit 5de20e8).

[BUFFY] 2026-10-06 — Even trailing card rows on ParaNews/ParaTube: short final card rows widen their cards to span the grid (spans collapse on mobile), ParaNews promotes imageless rows into empty card slots first, and fixed a Load More bug where a page ending on a block boundary zeroed the quotas so the next page rendered nothing. Verified in-browser with short-remainder mocks on both pages. Deploy Version ID: f8e2e9a1-4b7e-4428-84af-0c7efc9d4337 (commit fb8c6b5).

[BUFFY] 2026-10-06 — Full card-height equalization on ParaNews/ParaTube: 3-line clamped titles (2 on ParaTube), excerpt element always rendered with reserved min-height, grid stretch + full-height cards. Verified in-browser: every card in a block measures identical height with uniform 292px media boxes. Deploy Version ID: 81d83531-fef3-420a-9902-64aee2e4715e (commit 2c79d23).

[BUFFY] 2026-10-06 — Uniform ParaNews/ParaTube image cards: card images absolutely positioned inside the 16/9 media box so tall/square sources can't stretch it — every image card now matches the Rabbit Hole card size. Verified in-browser (portrait/square/landscape all render 292px media boxes). Deploy Version ID: c0c98a11-946c-45e9-af2a-5d19323d6508 (commit 74b13de).

[BUFFY] 2026-10-06 — Member-home right rail now refreshes with new content: shuffled ParaNews Spotlight + Featured Content picks (no longer always-newest), visibility-aware timer re-fetches all rail widgets every 3 minutes plus immediate refresh on tab return, soft cross-fade on swap. Deploy Version ID: 8f5c3c3e-0e58-4727-9a40-d6f9a172126e (commit 487ff66).

> **THE single source of truth for project state.** Both agents MUST keep this file current.
> If you shipped work and didn't log it here, you are not done. Synced to every workspace via
> git (live repo + desktop playground copy).

---

## 👥 THE TEAM

| Mark | Who | Role |
|---|---|---|
| **[TODD]** | Todd Wayne | Creator, designer, visual direction. **Approves everything.** Nothing ships without his sign-off. |
| **[BUFFY]** | Codebuff agent | Architect, coder, right hand. Owns the member portal, landing, themes, docs, and overall plan. **Writes Opencode's task directives.** |
| **[OPENCODE]** | Opencode agent (a.k.a. "MiMo") | Coder / assistant. **Implements Buffy's directives.** Good for focused builds and many task types. |

## 🔖 HOW TO LOG WORK (the identifying marks)

Every entry in the CHANGELOG and every checkbox move gets tagged with who did it:

- `[TODD]` — Todd's decisions, approvals, design calls
- `[BUFFY]` — Buffy's work
- `[OPENCODE]` — Opencode's work

Format for a changelog entry (append at the TOP of the changelog, newest first):

```
- **[AGENT] YYYY-MM-DD — one-line what** — details: files touched, deploy Version ID,
  what was verified, what wasn't finished. 
```

Rules:
1. **Move the checkbox** in the section below AND **append a changelog entry**. Both, every time.
2. Never delete or rewrite another agent's entries — append corrections as new entries.
3. Disputes/uncertainty → ask [TODD].

---

## ✅ COMPLETED (approved and live)

- ✅ [BUFFY] **ParaNews launched — Todd approved the concept 2026-10-05 ("I want our site to have something like paranormalcountry.com/news")** — public news.html with 12 category tabs (Cryptozoology→Unexplained), article cards linking to original publishers; lib/news-scraper.js aggregates 10 Google News topic feeds + 9 verified paranormal site feeds (17/19 healthy), keyword-classifies into the 12 topics, dedupes by hashed URL, inserts idempotently, prunes at 30 days; cron now every 6h (`0 */6 * * *`) covering events + news; GET /api/news + /api/news/refresh; news_articles table (migration 0029) applied to remote D1; header + member-sidebar links. Live-verified: clean excerpts (0 junk), 75% image coverage from site feeds, page rendering on prod. Deploys `d987275b` → `11c46496`.

- ✅ [BUFFY] **Fixed the dead Eventbrite scraper (Todd approved 2026-10-05 "go ahead and fix it")** — cron AND /api/events/refresh had matched 0 cards (Eventbrite changed markup); both now share lib/event-scraper.js. Live-verified on prod: refresh returns 358 scraped / 300 inserted, all 300 rows have real ISO start_date (was 0% dates), external_id `eb_*` populated, scraped_at stamped, chronological sort works, hex entities decoded, Meetup/community rows untouched. "Other" down ~55% → 37%. Deploys `6cd1f547` + `40a8bdcf`.

- ✅ [TODD] **Approved 2026-10-05** — Two-workspace system: fresh playground clone at `~/Desktop/paranormal-initiative-website` (git, clean at `d395b5f`), dual-workspace sync script v2 (`~/Desktop/sync-tpi-workspace.command`, --ff-only pulls both folders, unpushed-commit warnings); Opencode's home = the Desktop path
- ✅ [TODD] Site concept, design language, six member themes, section structure
- ✅ [BUFFY] Member portal: Home (composer + community feed + My Content), Profile page (identity summary + edit form), Settings (login + color themes)
- ✅ [BUFFY] Landing front door: "Explore before you join" hero + teaser cards; `?member=1` → member-home redirect (ONE home page)
- ✅ [BUFFY] Notification center + per-category notification settings
- ✅ [BUFFY] Events section pages (events / submit-event / admin-events) migrated to live, theme-tokenized
- ✅ [OPENCODE] Events data pipeline: scrapers → D1 database, cron auto-scraping, 177+ events, location/distance filtering, Show More
- ✅ [BUFFY] TPI Studio gating (Coming Soon for non-leadership) + theme bridge
- ✅ [BUFFY] Two-agent workflow: MIMO_DIRECTIVE.md (standing rules + per-task directive mechanism), this file

## 🔨 IN PROGRESS

- 🔨 [OPENCODE] Events system refinement (its current lane — per-task directives from [BUFFY])

## 📋 NEXT UP (approved queue — [TODD] approves pulling items into 🔨)

- 📋 [BUFFY] Finish public/member split: scrub leftover `?member=1` dual-mode from public pages
- 📋 [BUFFY] Test the full visitor journey: landing → Join Free → register → member home
- 📋 [BUFFY] Dedicated Join page with TPI branding (landing's Join Free → it)
- 📋 [TODD] Landing graphics: further polish rounds as Todd directs
- 📋 Phase 12 (future): TPI Creator Studio — video reels + photo editing (see UI_REDESIGN_LOG.md)

## 🛠️ NEEDS MODIFICATION (known issues awaiting a decision or slot)

- 🛠️ Floating chat widget causes mobile horizontal overflow (420px inside 390px) — pre-existing, parked
- 🛠️ Events: ~111 of 300 scraped events still classify as "Other" (vague titles; classification is best-effort) — [OPENCODE] lane if a smarter pass is wanted
- 🛠️ Meetup rows (44) are imported once and never refreshed by cron (cron only manages eventbrite) — [OPENCODE] lane

## 📜 CHANGELOG (newest first)

- **[BUFFY] 2026-10-05 — ParaNews interleaved rhythm (4 cards / 5 rows repeating) + per-visit shuffle on both hubs** — Todd: people are extremely visual, and pages should look freshly updated between content refreshes. news.html is now ONE interleaved grid: a row of up to 4 image cards, then 5 full-width text rows, repeating down the page — quotas carry across Load More pages so the rhythm continues; imageless stories always take row slots and imageful overflow waits for the next card block. Both news.html and paratube.html now Fisher-Yates shuffle each fetched page before rendering, so leaving and coming back shows a different visual order every visit until the next real refresh. Verified in preview with mocked API: DOM order renders pn-card×4 → pn-row×5 → repeating, and re-visits produce different orders (differentOrder: true). Commit `ac11307`, deploy Version `a157e99c-5db0-4b80-8bb4-5f711a86c040`.
- **[BUFFY] 2026-10-05 — Scrapers scour all topics + 2025-2026 news, stories, videos, and podcasts (Todd's "endless news" order)** — Live-tested every source first: Google News `when:1y` recency works (≤100 items/query), Bing accepts plain multi-word queries (the len-1056 limit is only 3+-term ORs), Yahoo search RSS is DEAD (returns HTML — skipped). NEWS: Google queries now cover paranormal, ghost hunting, hauntings, UFO/UAP/aliens, bigfoot/cryptids, psychic/mediumship, NDE, dreams, Mandela, prophecies, ancient, parapsychology, telepathy, secret programs/declassified, skinwalker (all when:1y) + niche ITC, EVP/ITC, seance, out-of-body, premonitions (no recency filter — returns 0 with it); 15 Bing topic queries (ghosts, hauntings, haunted places, UFO, aliens, bigfoot, cryptids, NDE, psychic, telepathy, parapsychology, EVP, secret programs, seance); 4 paranormal PODCAST feeds added — Monsters Among Us, Astonishing Legends, Sasquatch Chronicles, The Paranormal Podcast. VIDEOS: Dailymotion queries doubled to 16 topics (ITC, seance, parapsychology, abduction, declassified, astral, 2026 docs). Fixed three scraper correctness bugs found while scaling: (1) Workers subrequest budget capped the 50-feed list at ~23/run — feeds now rotate in halves per 6-hour run (full sweep every 12h, ~25 fetches/run); (2) video prune by published_at was deleting most Dailymotion rows instantly — now prunes by DB age (scraped_at, 180d); (3) news prune by published_at was deleting every 2025-era story in the same batch that inserted it, pinning the table at ~150 rows — now also DB-age (180d), page still sorts newest-first. Insert cap 250→400. Verified live: dry-run 47/50 feeds OK, 3,799 stories in 30s; prod refreshes inserted ~1,000 stories + ~600 videos across the day; DB now 447 news rows (newest-first: Archaeology, UFO/MSN, NDE/Newsweek) + 223 videos with 0 dup titles. Commits `600b4c5`, `e542b61`, `2f6b625`, `8fd4680`; deploys through Version `97ed67fa-f6ff-4cd4-847e-5dcdc35cb671`.
- **[BUFFY] 2026-10-05 — ParaTube rows of 4, video title dedup, and member theme now follows onto public pages** — Todd flagged three things: (1) paratube.html video cards now run 4 across like ParaNews (24 per page = 6 rows of 4, 2-col ≤1024px, 1-col ≤640px). (2) Same-video-different-title duplicates (the "Nightfall" trio) fixed at the scraper: normalizeVideoTitle collapses lowercase/years/punctuation and the source pool dedupes on it (live pool 215→180); also deleted 9 duplicate rows already in D1 (Nightfall ×3, Bureau EP12 ×2, Roasting Ghost ×2); page verified returning 24 videos with 0 dup normalized titles. (3) Public pages were pinned to the Cryptid green default because only member-shell.js set html[data-theme] — news.html, paratube.html now apply the saved tpiSiteTheme before first paint, and includes.js applies it on every public page, so members see their own theme (Asylum brown/orange) everywhere. Commit `25a3fdc`, deploy Version `060e7688-affc-4bd1-8fca-729530bb402e`.
- **[BUFFY] 2026-10-05 — ParaNews 4-column grid; Featured Content rebuilt as Spotlight-sized blocks with real content** — Todd feedback on the first pass: (1) news.html image cards now run 4 across (6 rows of 4, LIMIT 24), stepping to 2 columns ≤1024px and 1 ≤640px, still 4 image cards per page then paranormalcountry-style text rows. (2) Featured Content blocks are now the same card style/size as ParaNews Spotlight — Field Papers & Articles and Audio Research Lab fill with the newest real published articles (inline image + title + author) from /api/articles, the ParaTube slot pulls the newest aggregated video's thumbnail and links out to watch it, TPI Investigation Series keeps a static series image, and the three not-yet-complete areas (TPI Reels, Community Forum, Live Video) render as compact centered-icon blocks until those pages are done. Verified in preview: 7 blocks render, article images load, grid math confirmed. Commit `83d1320`, deploy Version `08be34c2-0e2e-481a-9987-19290dcc5731`.
- **[BUFFY] 2026-10-05 — Todd's 6-part order shipped: news layout, profile restyle, ParaNews theme, rail Featured Content, ParaTube** — (1) news.html now splits each page into up to 6 image cards + compact text rows for imageless stories (accent kicker / bold title / 2-line excerpt / date / divider rows, per paranormalcountry.com reference). (2) Public profile (contributor-profile.html via member-login.js render) restyled to the new UI: themed bg-card/bg-secondary/border tokens, fixed old white detail-card border bug, page padding, unified Published Work card. (3) ParaNews header now says "ParaNews" (pp:title meta) and the whole page runs on the site design-system variables so member color themes carry through (orange --pn-accent kept as ParaNews brand). (4) Right rail gained the Featured Content widget — TPI Investigation Series, Audio Research Lab, Field Papers & Articles, ParaTube, TPI Reels, Community Forum, Live Video — placed directly UNDER ParaNews Spotlight; Featured Video stays in the same rail-feature card style. (5) **ParaTube built**: lib/video-scraper.js live-tested before build — Dailymotion Graph API (public, 8 queries) + Internet Archive advancedsearch both WORK; Odysee claim_search returns 0 results even for generic queries (API-side, adapter shipped disabled), Rumble search 403s server-side, BitChute feeds now 404 — adapters ready to re-enable. Routes /api/videos + /api/videos/refresh, cron scrape every 6h, migration 0030 videos table applied to remote D1, paratube.html with the same 12 ParaNews categories + duration badges + pp:title branding, header.html nav gets ParaTube link. First refresh live on prod: 215 collected / 200 inserted. Verified: news.html 6-card + row split (mock injection), ParaTube cards, public profile theme, rail order Pulse→Spotlight→Featured→Video. Commit `41049a4`, deploy Version `db935f78-885c-496a-8daa-fb276174324e`.
- **[BUFFY] 2026-10-05 — ParaNews sources broadened; real images on cards** — Todd approved the source list and flagged images as "very important." Live-tested every candidate first: added 5 Bing News RSS feeds (each item carries the REAL article URL unwrapped from apiclick + a real thumbnail via News:Image, entity-decoded), MUFON, The Paranormal Daily News; extracted images also from WordPress content:encoded (Daily Grail, Archaeology 9/10). Reddit r/paranormal works (RSS) but ships no thumbnails and .json is IP-blocked (403) — dropped for now so the page stays image-rich; revisit with Reddit OAuth. Dead/undocumented feeds skipped: Coast to Coast AM (all RSS paths 404), Mysterious Universe (moved), Phantoms & Monsters (520), Paramagazine (unresolvable). DB now 123 rows, 77 with images (63%); page verified rendering image-rich cards from real publishers. Deploys `a430436f`→`6257e274`.

- **[BUFFY] 2026-10-05 — Rail card padding restored (root cause found)** — Todd: "still not right." The shell's `body.member-mode section { padding: 0 }` reset out-specified `.rail-card` and stripped every widget card's padding (computed 0px), squashing content against card edges — this was the real cause of the original "no padding" complaint too. Fixed with higher-specificity `.member-home-rail section.rail-card` (0,2,1) plus `min-width: 0` on discussion titles so reply counts stay inside cards. Verified: computed padding 16px 18px on all cards, topic rows inside card bounds. Commit `47bb2fb`, deploy `cd9b2337`.

- **[BUFFY] 2026-10-05 — Member home layout widened; rail sized properly** — Todd: "no padding on the right widgets, not sized correctly, not far enough right, middle too narrow." Root cause: shell's `.member-main-inner` max-width 1050px capped the whole page. Lifted to 1680px on member-home only (`:has` override), rail 300→348px with uniform full-width padded cards, main column now ~1111px, responsive steps at 1200/1020px. Verified at 1900px viewport: side-by-side grid, rail flush right, uniform 348px cards. Commit `e25400f`, deploy `193bb707`.

- **[BUFFY] 2026-10-05 — Member home rail filled + two event-widget bugs fixed** — Todd flagged the right rail as sparse and asked for featured content: added **ParaNews Spotlight** (newest imaged headline → publisher) and **Featured Video** (latest TPI video → watch page; auto-hides if feed has none). Fixed Upcoming Events showing "No upcoming events" (fetch polluted by 44 dateless Meetup rows sorting first; filter now tests ISO start_date only) and "Invalid Date" labels (format from ISO, not display text). Verified live on prod APIs: news story with image renders, 4 real upcoming events with correct dates. Deploys `37b776eb` → `5048a106`. Commits `a546af2`→`4bad01a`.

- **[BUFFY] 2026-10-05 — Member home dashboard right rail (Parapost-inspired)** — Todd reviewed parapost.net/dashboard and approved the "full right rail" package: two-column layout (feed center, sticky 300px rail right, collapses ≤1020px). Widgets, all live from existing APIs: **My Pulse** (avatar, role, posts/replies counts, View Profile), **Upcoming Events** (D1 `/api/events`, next 4, date-filtered), **Active Members** (recent feed authors excluding self), **Active Discussions** (latest 5 forum topics with reply counts). Rail hides when viewing other members' profiles. Verified locally: grid side-by-side at 1450px, single-column stack at 390px with no horizontal overflow, sticky positioning, widget content rendering. Deployed, Version ID `a7598124-1ac1-42e3-bc70-164b2f1ef92d`. Commit `525cea6`.

- **[BUFFY] 2026-10-05 — Member home remake: composer links, video cards, share modal, one home page**

- **[BUFFY] 2026-10-05 — Member home remake: composer links, video cards, share modal, one home page** — member-home.html is now the full creator+feed hub per Todd's direction (posts, photos, videos, shared links, community feed): (1) composer Link button + paste-URL row (validated http(s), max 5/post); (2) backend `sanitizeForumAttachments` accepts mediaType "link" (URL-validated, persisted, limit 5) in `functions/api/[[path]].js`; (3) feed now renders link chips AND TPI video cards (previously dropped); (4) full share modal (Copy Link / Facebook / X / Email) ported from community-home onto every feed card; (5) community-home.html retired to a 0s redirect → member-home (one home page, noindex). Verified locally in browser: link add/reject/remove flows, Post button state, share modal open/close, redirect target. Deployed to prod, Version ID `a2f1c46b-20af-4092-a753-742c8cbfe73e`. Commit `3077a95`.

- **[BUFFY] 2026-10-05 — Landing hero CTA alignment fix**

- **[BUFFY] 2026-10-05 — Landing hero CTA alignment fix** — Join Free / Sign In / Start Exploring row now centered under the hero text (`.landing-hero .portal-actions { justify-content: center; }` in index.html). Verified locally via browser screenshots at desktop + mobile widths; deployed to prod, Version ID `877da5f6-d6a6-4c72-aa76-c1b3832d472e`. [TODD] granted standing commit/pull/deploy permission this session. Commit `be0860b`.

- **[BUFFY] 2026-10-05 — Two-workspace playground system stood up** — verified master plan + directive files present in BOTH folders via git; fresh Desktop clone created after Todd removed the stale copy; sync script rewritten for dual-folder pulls with unpushed warnings. **[TODD] approved.**

- **[BUFFY] 2026-10-05 — Two-agent workflow formalized** — MIMO_DIRECTIVE.md created + per-task directive mechanism; landing graphics pass shipped (banner hero + teaser cards); deploy `564afe21`.
- **[OPENCODE] 2026-10-05 — Events pipeline to D1 + cron** — commits `e8833d6`…`964bf17`: real events into D1, paranormal-only filtering, 177 events, Show More, cron auto-scrape + refresh endpoint.
- **[BUFFY] 2026-10-05 — Landing + one home** — explore-before-you-join hero, Join Free/Sign In CTAs, `?member=1` redirect to member-home; member-shell v55; deploy `d2694ea4`.

---

## 🖥️ THE TWO WORKSPACES

| Workspace | Path | Purpose |
|---|---|---|
| **Live repo** | `~/Documents/GitHub/paranormal-initiative-website` | The real site. Deploys to production via `npx wrangler deploy`. |
| **Playground** | Desktop backup copy (`~/Desktop/...`) | Experiments and new features are BUILT here first, approved by [TODD], then merged to the live repo. |

Flow: **build in playground → [TODD] approves → commit to live repo → deploy → log here.**
The sync script (`~/Desktop/sync-tpi-workspace.command`) pulls GitHub → workspace; the playground
copy should be a git clone too, so `git pull` keeps both workspaces and this file in lockstep.

**Related docs:** `MIMO_DIRECTIVE.md` (Opencode's standing rules) · `UI_REDESIGN_LOG.md` (design history) · `SITE_STREAMLINING_PLAN.md` (phases) · `STUDIOFLOW_MASTER_TODO.md` (detailed session handoffs)

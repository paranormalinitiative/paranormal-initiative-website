# TPI MASTER BUILD PLAN

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

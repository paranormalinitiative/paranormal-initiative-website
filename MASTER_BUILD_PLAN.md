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
- 🛠️ Events: ~47 of scraped events classify as "Other" (Meetup data thin) — [OPENCODE] lane
- 🛠️ Scraper dedup: reruns append, no dedup by URL yet — [OPENCODE] lane

## 📜 CHANGELOG (newest first)

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

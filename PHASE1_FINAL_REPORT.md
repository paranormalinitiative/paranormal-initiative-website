# TPI PARANORMAL DISCOVERY ENGINE — PHASE 1 FINAL REPORT

**Foundation, Security, Monitoring & Quality Hardening**
Date: 2026-10-07 · Commit: `768d376` · Production Version ID: `31d9ba1e-84c3-4da7-90a4-5b876afe8734`

---

## A. CHANGES MADE

| File | Change |
|---|---|
| `functions/api/[[path]].js` | 1A: `/api/news/refresh`, `/api/videos/refresh`, `/api/events/refresh` now wrapped in `requireAdmin(request, env, ...)`. New `GET /api/admin/scraper-runs` handler (`handleAdminScraperRuns`, requireAdmin) returning `{runs, latest, providers}`. |
| `migrations/0035_scraper_runs.sql` | **NEW.** `scraper_runs` table + 2 indexes (see §B). |
| `lib/scraper-log.js` | **NEW.** `sanitizeScraperError` (redacts `sk_/pk_/rk_`, bearer/token/api-key patterns, caps 500 chars), `startScraperRun`, `logScraperRun` (failure-tolerant — logging failure never fails the scraper), `pruneScraperRuns` (90-day retention). |
| `lib/video-scraper.js` | 1B: per-provider `scraper_runs` rows + aggregated videos row; per-provider diag counters (`found/skipped/errors`). 1D: `STRONG_PARANORMAL_RE` relevance bar applied to both Dailymotion and Internet Archive (title + description); weak categories (dreams/ancient/spirituality) now require score ≥ 2 (phrase match or two weak hits); expanded `SPAM_PATTERNS` (gameplay, let's play, minecraft, music video, movie/Netflix trailer, etc.). 1E: `canonicalVideoUrl` (strips `utm_*/ref/source/fbclid/gclid`, trailing slash), `titleSimilarity` (Jaccard), `isProbableDuplicate` (URL match conclusive; same-provider normalized-title ≥ 0.8; cross-provider requires channel + duration corroboration). Duplicates counted as `items_skipped`. 1F: Odysee probe findings recorded in code comments; `ODYSEE_ENABLED=false` preserved; `PROVIDER_STATUS` export (5 entries). |
| `lib/news-scraper.js` | 1B: `scrapeNews(env, {trigger})`; one aggregated `scraper_runs` row per run (no per-feed write explosion). |
| `lib/event-scraper.js` | 1B: `scrapeAndUpdateEvents(env, {trigger})`; one aggregated row; `fetchErrors` recorded. |
| `worker.js` | scheduled() passes `{trigger:"cron"}` to all three scrapers; calls `pruneScraperRuns(env)` at end of each run. |
| `admin-advanced-settings.html` | 1C: new **DISCOVERY & SCRAPERS** section (`data-scraper-monitor`): per-scraper cards (last run, status, duration, found/added/errors), provider health table, run-history table (last 20), manual refresh buttons. Script cache-bumped to `member-login.js?v=39`. |
| `member-login.js` | `initScraperMonitor()`, `renderScraperMonitor()`, `bindScraperRefreshButtons()` — running/success/failure states, buttons disabled while a request is in flight, sanitized error display. |
| `api-client.js` | New client methods: `adminListScraperRuns(limit=20)`, `refreshScraper(type)`. |
| `scripts/e2e/api-e2e.sh` | Extended to 159 assertions: refresh authz matrix (anonymous/member/contributor/muted × 3 endpoints), admin/owner allowed, run-history observability (per-provider rows, trigger=manual, duration>0, secret-free content), provider states. |
| `scripts/e2e/seed-local.sql` | E2E seed password hash corrected to `sha256('e2e-password')` so browser-login tests can authenticate (suite itself uses session tokens and was unaffected). |
| `PHASE1_DISCOVERY_NOTES.md` | **NEW.** Narrative documentation: security change, schema, monitoring, provider table, relevance filtering, dedup, Odysee finding. |

Not touched: forum files, `docs/cosmic-profile/`, `tpi_videos` schema, news/event feed strategy, Dailymotion/Archive adapter removal, Worker architecture (still single Worker).

## B. DATABASE

- **Migration added:** `migrations/0035_scraper_runs.sql` — `CREATE TABLE scraper_runs` (id, scraper_type, source, started_at, completed_at, status, items_found, items_inserted, items_skipped, error_count, error_message, duration_ms, run_trigger, metadata_json) + indexes on `(started_at)` and `(scraper_type, started_at)`. Source-agnostic — not hard-coded to today's providers.
- **Applied:** locally (via E2E harness) and to **production** `tpi_contributor_portal` (verified: table exists).
- **Pre-migration production backup:** `backups/scraper-runs-pre-0035-prod-2026-10-07.sql` (19 legacy article rows, INSERT OR IGNORE form; gitignored, not committed).
- **Verification:** legacy `articles legacy-%` count = 19 before and after; no destructive changes; no existing tables altered.

## C. SECURITY — BEFORE / AFTER

| Endpoint | Before | After |
|---|---|---|
| `GET /api/news/refresh` | No auth guard — anyone could trigger | 403 unauthenticated/member/contributor/muted; allowed for admin/owner |
| `GET /api/videos/refresh` | No auth guard | Same |
| `GET /api/events/refresh` | No auth guard | Same |
| `GET /api/admin/scraper-runs` | (did not exist) | 403 unauth/member; allowed admin/owner |
| Worker cron | Ran normally | Unchanged — no HTTP auth involved, still `0 */6 * * *` |

- Uses the repository's existing `requireAdmin()` — no second auth system invented.
- Error responses are generic; no implementation detail exposed.
- **1A.1 rate-limit decision:** admin-only auth is the abuse protection for this phase. Manual triggers are expensive live-API calls that only authorized admins can invoke, and cron is unaffected. No distributed rate limiting added (documented decision; revisit only if admin-trigger abuse is ever observed).

## D. SCRAPER MONITORING

Administrators (admin/owner) now see in **admin-advanced-settings.html → DISCOVERY & SCRAPERS**:

- Per-scraper cards (Paranormal News / Videos / Events): last run, status, duration, items found/added, errors.
- Provider health: Dailymotion ACTIVE · Internet Archive ACTIVE · Odysee DISABLED / API ISSUE · YouTube NOT CONFIGURED · Rumble NOT CONFIGURED (NOT CONFIGURED shown as informational, not error).
- Run history (last 20): date/time, scraper, source, status, found, inserted, skipped, errors, duration.
- Failure details: sanitized error summaries (`sanitizeScraperError` redacts key/token/credential patterns at write time; UI can never receive secrets).
- Manual Refresh News/Videos/Events buttons with running/success/failure feedback; double-click prevented while in flight; no page reload needed.

## E. VIDEO FILTERING — WHAT IMPROVED

1. **Internet Archive now passes the same relevance bar as Dailymotion** — title *and* description are scored; a result must match a classifier category or `STRONG_PARANORMAL_RE` (specific paranormal phrases: ghost hunt, EVP, cryptid, UFO/UAP, bigfoot, séance, poltergeist, etc.).
2. **Weak-word protection** — `dreams`, `ancient`, `spirituality` categories alone no longer classify content; a phrase-level keyword or two weak hits (score ≥ 2) is required. No categories were deleted.
3. **Spam patterns expanded** — gameplay/let's play/minecraft, music videos, movie/Netflix trailers, generic promotional material. Legitimate investigations, documentaries, folklore, cryptid/UFO/EVP research and dramatic-but-relevant content are preserved (strong phrases and known-good categories outrank spam heuristics).
4. Per-provider diag counters (`found/skipped/errors`) are logged per run, so future tuning is data-driven.

## F. DEDUPLICATION — WHAT IMPROVED

1. **Canonical URL matching** — tracking params (`utm_*`, `ref`, `source`, `fbclid`, `gclid`) and trailing slashes stripped before comparison; platform-specific URLs remain distinct.
2. **Title similarity** — normalized-token Jaccard similarity replaces exact-match reliance. Same-provider duplicates: ≥ 0.8 on normalized title. Cross-provider duplicates require **corroboration** (same channel/creator AND same duration) — not title alone.
3. **Conservative by design** — generic-title-only similarity never merges ("Ghost Hunting" from two different creators stays two records); URL identity is conclusive; uncertain cases are left as separate records (flag philosophy, no silent deletion).
4. **No schema change, no retroactive cleanup** — existing `tpi_videos`, comments, reactions, saves, reports untouched; in-run dedup counts increment `items_skipped` for observability.

## G. ODYSEE

**Status: DISABLED — BLOCKED BY API (needs adapter rewrite before enablement).**

Live probes against the Odysee/LBRY claim_search API:

- The adapter's query shape (`any_tags` search) returns **0 items for every tag tested — including the control tag "gaming"** — indicating the tag-index query path is not returning results, not that paranormal content is absent.
- The `text:` claim_search variant **does** return well-formed claims (claim_id, canonical `lbry://` URLs, thumbnails, durations, channel names, release_time), proving the API itself is reachable and parseable.
- Conclusion: the adapter's parsing/error handling are fine; the *query construction* is the problem. Enabling as-is would produce a permanently zero-result provider. Odysee remains `ODYSEE_ENABLED=false`, is surfaced in the admin monitor as DISABLED/API ISSUE, and its failure path is non-crashing (verified by E2E).
- No secrets are exposed; no access restrictions were bypassed; no blind enablement.

## H. YOUTUBE

**NOT IMPLEMENTED IN THIS PHASE.** No `fetchYouTube()`, no API keys, no stubs.

## I. RUMBLE

**NOT IMPLEMENTED IN THIS PHASE.** No `fetchRumble()`, no API keys, no stubs.

## J. TEST RESULTS

- **E2E suite** (`scripts/e2e/api-e2e.sh`, local wrangler dev :8791, fresh DB, migrations + seed applied strictly): **PASS=159 FAIL=0, exit 0** — run 3× from clean state, all clean.
  - Exact total is 159 (an earlier working note recorded 160; recount confirms 159 is the deterministic total — no assertion dropped).
- Coverage per directive §4: security matrix (anon/member/contributor/muted rejected ×3 endpoints; admin/owner allowed; cron untouched), scraper logging (manual run logged with trigger=manual, per-provider rows, found>0 on live Dailymotion, duration>0, no secret-shaped strings in history), admin UI (endpoint authz, provider states incl. Odysee disabled, admin page serves monitor section + v39 script), dedup spot checks (dual-source corroboration → duplicate; generic-title-differs → kept), Odysee failure non-crashing, regression (feed, categories, auth, community, news, events, video systems all pass within suite).
- **Browser/UI verification:** local DB seed hash fixed → password login as `e2e_admin` / `e2e-password` succeeds (was 401 before the fix); admin session retrieves `/api/admin/scraper-runs` (4 runs, correct 5-provider states); served admin page contains `data-scraper-monitor` and `member-login.js?v=39`. (Direct browser-panel attach was unavailable in this session; equivalent checks performed via authenticated HTTP against the served pages.)
- **Production smoke:** `/api/feed` 200 · `/api/community/categories` 200 · unauth `/api/news|videos|events/refresh` → 403 (correct requireAdmin denial; suite accepts 401/403) · unauth `/api/admin/scraper-runs` → 403 · `/api/forum/topics` 404 · `/community-forum.html` 302.

## K. PRODUCTION

- **Deployed:** YES — `npx wrangler deploy` succeeded.
- **Version ID:** `31d9ba1e-84c3-4da7-90a4-5b876afe8734`
- **Commit deployed:** `768d376`
- **Migration 0035 was applied to production before this deploy** (with pre-migration backup), so the deployed code found its table ready. Cron trigger `0 */6 * * *` confirmed in deploy output.
- **Verification performed:** smoke checks listed in §J; legacy article count unchanged at 19.

## L. GIT

- **Commit:** `768d376` — "Phase 1: Discovery engine foundation — security, observability, quality hardening" (13 files, +749/−43)
- **Push:** SUCCESS — `10b7b47..768d376 main -> main` to `git@github.com:paranormalinitiative/paranormal-initiative-website.git`
- **Final git status:** clean working tree (only gitignored `backups/` and local `.wrangler/` state, as expected).

## M. REMAINING ISSUES

1. **Odysee adapter query rewrite required** — must move from `any_tags` to `text:`-based claim_search (with paranormal query terms) before enablement. Documented in code + notes.
2. **Manual refresh abuse protection is auth-only** — acceptable for current admin-only usage; revisit if repeated admin-triggered refreshes become a cost concern.
3. **scraper_runs retention pruning runs on cron cadence (6h)** — fine at current write volume (a handful of rows per run); no action needed.
4. **Rate of Internet Archive relevance rejections** — new STRONG bar may reduce IA volume; per-provider diag counters now make this measurable on the next cron runs. If IA yield drops too far, tune phrase list (data-driven, low risk).
5. **Pre-existing untracked `scripts/e2e/`** — was committed as part of this work (it is the test harness); nothing remains untracked.

## N. NEXT PHASE RECOMMENDATION

Based on actual findings (not assumption):

- **Phase 2 — YouTube automated discovery**, as the directive anticipated. The foundation (source-agnostic schema, per-provider logging, admin monitor, dedup, relevance bar) is now in place; a new `fetchYouTube()` adapter plugs into the existing SOURCE ADAPTER → NORMALIZE → RELEVANCE → DEDUP → STORAGE pipeline with zero architecture change.
- **Phase 3 — Odysee reactivation** via the `text:` query-shape rewrite validated in this phase's probes; then a staged enablement (local → canary observation through the new scraper_runs history → production enable).
- **Phase 4 — Rumble** through a legitimate/authorized discovery mechanism only.

Recommended immediate follow-ups before Phase 2: monitor one week of `scraper_runs` data via the new admin dashboard to baseline per-provider yield, and (optionally) tune the IA phrase list against observed `items_skipped` counts.

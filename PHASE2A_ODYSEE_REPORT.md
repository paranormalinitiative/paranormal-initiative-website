# TPI PARANORMAL DISCOVERY ENGINE — PHASE 2A REPORT

**Odysee Adapter Repair, Validation & Safe Activation**
Date: 2026-10-07 · Base: `1ab78e8` (Phase 1) · Production Version: see §13

## 1. STARTING BASELINE

- HEAD: `1ab78e8` on `main`, synchronized with `origin/main`, clean tree.
- Pre-implementation E2E run: **PASS=159 FAIL=0, exit 0** (Phase 1 baseline healthy).

## 2. PHASE 1 BACKUP AUDIT

`backups/scraper-runs-pre-0035-prod-2026-10-07.sql`:

- **Not tracked by Git.** The `backups/` directory is gitignored; `git ls-files backups/` returns zero files. It was never in commit `768d376` or `1ab78e8`.
- **Content:** 19 `INSERT OR IGNORE` statements covering only legacy `articles` rows (the pre-0035 snapshot).
- **Sensitivity scan (counts, not values):** zero hits for password hashes, email (`@`), tokens, sessions, cookies, `sk_`-style keys, or auth headers.
- **Action:** none required — the file is already correctly excluded from version control and contains no sensitive data. No history rewrite needed.

## 3. ODYSEE ROOT CAUSE

Phase 1's diagnosis ("the tag index is dead") was **wrong about the cause**. Fresh isolation probes show `any_tags` works fine. Two specific request parameters poisoned every query:

1. **`media_type: ["video"]`** — returns 0 items (`total_items: 0`) on the Odysee proxy for every query tested, even when the same query without it returns results.
2. **`order_by: ["release_time"]`** (and `"creation_time"`) — returns 0 items with `total_items` missing. Only the default ordering and `"trending_mixed"` work.

The old adapter used both. With them removed, tag queries return well-formed video claims (control tag "gaming" included).

## 4. ODYSEE QUERY REPAIR

The adapter keeps its original tag-based discovery shape (no rewrite to a new system):

- `claim_search` with `any_tags: [tag]`, `claim_type: ["stream"]`, `page_size: 20`, `not_tags: ["porn","mature","c:private","c:unlisted"]`, default ordering — **`media_type` and `order_by:["release_time"]` removed**.
- Video-only filtering is done client-side via `value.video` presence (the proxy cannot filter by media_type).
- `ODYSEE_ENABLED` → `true`. Public unauthenticated proxy; no credentials; no protections bypassed.

## 5. LIVE ODYSEE TESTING

- Reproduction probes: old shape → 0 items; isolated params → only `media_type` and `release_time` ordering zeroed queries.
- Tag set (`paranormal, ghosts, ufo, bigfoot, hauntings, cryptid`): 120 items found per live run, well-formed.
- Two full local scrape cycles ran clean; API responded correctly each time (well-formed JSON-RPC, correct result envelope).
- A `text:` search ("ghost investigation") also works — kept as a documented fallback option, not used (tag discovery gives better topical coverage with less noise).

## 6. NORMALIZATION

- **Stable identifier:** `pt_od_<claim_id>` (claim IDs are permanent). `hashId(lbryUrl)` fallback only if claim_id were absent (never observed).
- **Canonical URL:** `lbry://@channel#x/claim#y` → `https://odysee.com/@channel:x/claim:y` (Odysee's standard short-URL form). Verified stable and valid in stored rows.
- **Mapped fields:** title, description (HTML-stripped, ≤500), thumbnail, source_url, source_name ("Odysee"), channel_name (from `signing_channel.value.title` or parsed from `signing_channel.canonical_url`), duration_seconds (`value.video.duration`), category (classifier), published_at (`release_time` → `timestamp` fallback). Nothing invented when absent.

## 7. RELEVANCE

Odysee runs the identical Phase 1 bar as Dailymotion/Internet Archive: classifier category (with weak-category score ≥ 2) **or** `STRONG_PARANORMAL_RE` over title + description — no bypass.

One tightening: bare `\bitc\b` admitted unrelated material (e.g., Dutch tax text "ITC procureur fiscal"). ITC now requires research context (`itc session|research|recording|device|experiment|spirit|radio`); EVP keeps the bare word.

Spot checks: ghost investigation kept; Minecraft gameplay rejected; Portuguese politics rejected; Dutch tax ITC rejected; Bell Witch historical folklore kept; ITC/EVP research kept. Live run: 120 found, 34 skipped by relevance/spam/video-filter.

## 8. DEDUP

- **Same-source/repeat:** external_id (claim_id) → `ON CONFLICT DO NOTHING`; in-run normalized-title skip unchanged. Repeat live scrape: Odysee 67 → 84 rows (+17 genuinely new), **0 duplicate external_ids** in the table.
- **Cross-source:** Phase 1 conservative rules unchanged — URL identity conclusive; cross-provider merge requires channel+duration corroboration; generic titles never merge (verified by spot tests).
- **Bug fixed (exposed by activation):** the 200-row storage cap was filled in fixed batch order, so a busy Dailymotion day (279 results) crowded Internet Archive (41) and Odysee (86) out entirely — zero rows stored for both. Provider batches are now interleaved round-robin before the cap, so each source gets a fair share (live: DM 93 / IA 40 / Odysee 67). Dedup and relevance rules unchanged.

## 9. LOGGING

- Odysee logs a per-provider `scraper_runs` row (`success`/`partial`/`failed` based on per-tag errors vs. tag count, metadata `{enabled, queries}`).
- **Phase 1 latent bug fixed:** callers passed `metadata:` but `logScraperRun` read `run.metadataJson` — metadata was never persisted (all rows NULL). The logger now accepts both keys.
- The admin endpoint now selects and parses `metadata_json` into a `metadata` object (internal counters only — never secrets; sanitize-at-write unchanged).

## 10. ADMIN MONITORING

`PROVIDER_STATUS` Odysee → `active`; the dashboard renders **ACTIVE** via the existing state-label mapping. Final display: Dailymotion ACTIVE · Internet Archive ACTIVE · Odysee ACTIVE · YouTube NOT CONFIGURED · Rumble NOT CONFIGURED. No new UI built.

## 11. ACTIVATION DECISION

**ACTIVE.** All 20 gates pass:

1-2. Public query works consistently; multiple paranormal searches return results ✓
3-5. Normalization, stable claim IDs, canonical URLs verified ✓
6-7. Common relevance applies; irrelevant classes rejected ✓
8-9. Dedup works; repeat scrape produced 0 duplicate rows ✓
10-11. Provider logging works; errors sanitized (suite secret-scan passes) ✓
12-13. Simulated total-API-outage test: scrape completed, providers isolated, no crash ✓
14. Full E2E 161/0 ✓ 15-18. No Forum/Feed/ParaTube/UGC regression ✓
19. No secrets ✓ 20. Bounded load (6 requests/cycle, single page each) ✓

## 12. TEST RESULTS

- Spot checks (node, real titles): 9/9 pass after the ITC fix.
- Failure isolation (fetch stubbed to always throw): scrape completes `{collected:0, inserted:0}`, no throw; logging failures also swallowed.
- Full E2E suite: **PASS=161 FAIL=0, exit 0** (159 baseline + 2 new Odysee assertions: provider run logged success/partial; metadata bounded & enabled). Two clean full-suite runs; provider-state assertion updated (3 active / 0 disabled / 2 not_configured) — no assertions weakened.

## 13. PRODUCTION VALIDATION

- Deployed: yes (version recorded in closeout); cron unchanged `0 */6 * * *`.
- Pre-deploy verification: production smoke on the prior deploy (feed 200, categories 200, refresh 403 unauth, scraper-runs 403 unauth, forum 404/302).
- Post-deploy: smoke re-run; Odysee's first production run occurs at the next cron cycle (≤6h) or via the admin Refresh Videos button — **no prod admin credentials were available to this session**, so the first production Odysee `scraper_runs` row was not directly observed; the admin dashboard will show it. Reported as a limitation.

## 14. GIT

- Implementation commit: see closeout (pushed to origin/main, tree clean).
- Files: `lib/video-scraper.js`, `lib/scraper-log.js`, `functions/api/[[path]].js`, `scripts/e2e/api-e2e.sh`, `PHASE2A_ODYSEE_REPORT.md`.

## 15. PROTECTIONS CONFIRMED

- YouTube **NOT implemented**; Rumble **NOT implemented** (PROVIDER_STATUS unchanged at `not_configured`).
- Dailymotion and Internet Archive operational (live counts in every test run).
- Forum remains retired (`/api/forum/*` 404, `/community-forum.html` 302); no forum_ tables; Community Feed intact.
- No UGC systems touched; no schema changes to videos tables; no new Worker; no second scraper architecture.
- No secrets/credentials anywhere; Odysee proxy is public and unauthenticated; no rate limits or protections bypassed.

## 16. REMAINING LIMITATIONS

1. First production Odysee run not directly observed (no prod admin session); verify via the dashboard after the next cron.
2. Odysee ordering is default/trending (release_time/creation_time orderings are broken API-side) — results favor currently-trending claims; acceptable for a 6h discovery cadence.
3. `not_tags` filtering relies on Odysee tag hygiene; relevance filtering is the real safety net.
4. The `text:` search fallback is documented but not wired in; useful if tag coverage ever proves too narrow.

## 17. NEXT PHASE RECOMMENDATION

**Rumble discovery integration** — the next provider expansion per the owner's plan. Phase 1 recorded that Rumble's search HTML 403s server-side and no public RSS exists; investigate legitimate/authorized discovery mechanisms (official APIs, embeddable feeds, or partnership access) without bypassing access protections. **Do not implement YouTube yet** (planned after Rumble per owner sequencing); the pipeline is ready for it when authorized.

---

## ADDENDUM — PRODUCTION VALIDATION & SUBREQUEST-BUDGET FIX (2026-10-07, later)

Post-deploy production validation (read-only queries against the live D1) found that **both cron runs after the Phase 2A deploy failed for Odysee — and so did Dailymotion and Internet Archive**. Failure isolation and logging worked exactly as designed (providers isolated, sanitized errors recorded), which is what made the diagnosis fast.

**Root cause:** the Cloudflare Workers free plan allows ~50 subrequests per invocation, and one `scheduled()` call chains Events (31 Eventbrite URLs) + News (25 of 50 feeds) + Videos (16 DM + 4 IA + 6 Odysee = 26 queries) = **82 fetches**. The budget was exhausted before the video scrapers ran: every provider failed with `Too many subrequests by single Worker invocation` (Odysee error_count 6, Dailymotion 16, IA 4, plus 17–23 news feeds). Local `wrangler dev` does not enforce this limit, which is why E2E was green while production failed.

**Fix (rotation, the pattern Phase 1 already established in the news scraper):**

- `lib/video-scraper.js` — each provider rotates its query list in **halves** per run (Dailymotion 8/16, Internet Archive 2/4, Odysee 3/6). Full coverage every 12h; run metadata now records `queries` (this run) and `queriesTotal`.
- `lib/news-scraper.js` — feed rotation changed from halves to **thirds** (17/50 feeds per run, full sweep ~18h). Also fixed a latent crash surfaced by the rotation: `classifyNews` returns `null` for deliberately excluded items (jobs/coupons), and the caller bound the null straight into the INSERT, failing the whole news batch (`NOT NULL constraint failed: news_articles.category`). Excluded items are now skipped at the caller.
- `lib/event-scraper.js` — URL rotation in **thirds** (11/31 per run, ~18h per listing). Because the old write path deleted ALL eventbrite rows each run (which would wipe the rotated-out groups), the write is now an **upsert** (`ON CONFLICT(external_id) DO UPDATE`) plus a 2-day staleness prune; rows from inactive groups survive untouched until their own group's next run.

**Verified locally:** a full simulated `scheduled()` invocation on a fresh D1 now completes end-to-end — Events 173 scraped/173 inserted, News 1420 collected/400 inserted (17 feeds active), Videos 190 collected/190 inserted with per-provider metadata `{queries:8,queriesTotal:16}`, `{queries:2,queriesTotal:4}`, `{enabled:true,queries:3,queriesTotal:6}` — **41 fetches per invocation**, safely inside the limit. E2E suite re-run after the fix: **PASS=161 FAIL=0, exit 0**.

**Production validation of the fix** fires at the next 6h cron (`0 */6 * * *`); success signature: `scraper_runs` rows for `dailymotion`/`internet_archive`/`odysee` with `status='success'`/`'partial'` and non-zero `items_found`, and Odysee `source_name='Odysee'` rows appearing in `/api/videos`.

Request volume per scheduled run is now: **11 Eventbrite + ≤17 news feeds + 13 video queries ≈ 41 fetches** (was 82). Manual `/videos/refresh` is unchanged in shape (13 queries) and was never affected.

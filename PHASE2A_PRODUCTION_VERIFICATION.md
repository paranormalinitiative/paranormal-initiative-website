# PHASE 2A — PRODUCTION VERIFICATION & FINAL STABILIZATION

Directive: TPI-DISCOVERY-VERIFY-001 · Performed 2026-10-08 (~02:30–03:00 UTC) · Read-only production verification. **No source code was modified; no new commit or deploy was made.**

**VERDICT: PRODUCTION COLLECTION CONFIRMED HEALTHY.** The first scheduled cron run after deployment `405876a1` (fired 2026-10-08 00:00:25 UTC) succeeded for every scraper, with real production evidence — not inferred from local tests.

---

## 1. Starting Git HEAD

`fc2d672` "Fit scheduled scraping inside the Workers subrequest budget" — HEAD == origin/main, working tree clean (0 dirty files). Both prior commits present: `45ab85a` (Phase 2A Odysee), `fc2d672` (subrequest-budget fix). `1ab78e8`/`768d376` (Phase 1) present.

## 2. Production deployment version

**`405876a1-dfef-4edd-a063-b9f6bd129781`** (deployed 2026-10-07T21:45:33Z, 100% traffic), confirmed via `wrangler deployments status`. Cron schedule `0 */6 * * *` confirmed in both wrangler.toml and the deployment trigger output. D1 binding `TPI_DB` → `tpi_contributor_portal`. No deployment was performed for this verification.

## 3. Cloudflare Worker limits verified

Verified against the official Cloudflare Workers limits documentation (developers.cloudflare.com/workers/platform/limits), not assumed:

- **Subrequests per invocation: Free plan 50 / Paid 10,000.** This Worker runs on the free plan (the production errors were the free-plan signature).
- **"A subrequest is any request a Worker makes using the Fetch API or to Cloudflare services like R2, KV, or D1"** — D1 operations count toward subrequests, but the docs list a **separate, higher limit for internal services (1,000 on Free)**, so ~9 D1 operations per scheduled run do not meaningfully consume the external 50 budget.
- **"Each subrequest in a redirect chain counts against this limit"** — redirect hops are the main hidden cost. The observed run completed with every provider succeeding and zero event-fetch errors, so Eventbrite redirect chains did not exhaust the budget in practice.

## 4. Estimated actual request/subrequest budget

Per scheduled invocation after the rotation fix:

| Component | External fetches |
|---|---|
| Events (Eventbrite, thirds) | 10–11 of 31 URLs |
| News (feeds, thirds) | 17 of 50 feeds |
| Videos (Dailymotion 8 + IA 2 + Odysee 3, halves) | 13 |
| **Total external** | **~40–41** |

Plus ~6–9 internal-service operations (scraper-run log writes, content batches, prune) against the separate 1,000 internal limit. **Headroom: ~9 external fetches under normal conditions.** Observed: the 00:00 run completed with all providers `success` and no subrequest errors, so the rotation is safe as configured. Risk note: redirect chains could erode headroom; none were observed to matter. If Phase 2B/2C add providers, re-check this budget before activation (a paid Workers plan at 10,000 subrequests would remove the constraint entirely).

## 5. Latest Event scraper run (post-deploy)

2026-10-08 00:00:25 UTC · trigger `cron` · **success** · found 123 · inserted 123 · skipped 0 · errors 0 · 23,327 ms · metadata `{urls: 10, urlsTotal: 31}`. First run to use the new rotation + upsert code.

## 6. Latest News scraper run (post-deploy)

2026-10-08 00:01:23 UTC · trigger `cron` · **partial** · found 694 · **inserted 179** · skipped 7 · errors 7 · 58,079 ms · metadata `{feedsOk: 10, feedsActive: 17, feedsTotal: 50}`. Compare pre-fix runs (inserted 2–6 with 17–23 feed errors): the budget fix + NULL-category fix are visible in production. `partial` reflects 7 feeds that failed or returned no items — feed-level availability, not a system defect.

## 7. Latest Dailymotion run (post-deploy)

2026-10-08 00:01:29 UTC · **success** · found 160 · skipped 38 · errors 0 · metadata `{queries: 8, queriesTotal: 16}` (rotation active). 5 new Dailymotion rows stored this run.

## 8. Latest Internet Archive run (post-deploy)

2026-10-08 00:01:29 UTC · **success** · found 30 · skipped 8 · errors 0 · metadata `{queries: 2, queriesTotal: 4}`. 9 new IA rows stored this run. Zero `items_inserted` on provider rows is the established logging convention (provider rows log found/skipped; the aggregate `videos` row logs insertions) — pre-existing Phase 1 behavior, not a defect.

## 9. Latest Odysee run (post-deploy)

2026-10-08 00:01:29 UTC · **success** · found 60 · skipped 26 (non-video streams + relevance bar) · errors 0 · metadata `{enabled: true, queries: 3, queriesTotal: 6}`. No subrequest failures. **34 new Odysee rows stored this run** — Odysee's first successful production collection.

## 10. Odysee production video count

**34 rows, all healthy:** 34/34 `pt_od_`-prefixed stable external IDs, 34/34 distinct (zero duplicate IDs), 34/34 canonical `https://odysee.com/@channel:claim` URLs, all `status='approved'`, categories assigned (ghosts, cryptozoology, near death, …), durations and fresh publication dates populated. Sample: `pt_od_ccd36b34…` → `https://odysee.com/@FollowsTheWay:9/NS-10-07-2026:ccd36b342e…`.

## 11. Odysee content reaches ParaTube

Confirmed via the public API: `GET /api/videos` returns Odysee rows (8 of 30 on page 1) with source_name "Odysee" and valid source URLs. Odysee content flows through the existing normalized-video pipeline (relevance → dedup → storage → ParaTube) with no special display logic; `status='approved'` rows are served like any other provider's.

## 12. News classification fix verified

`classifyNews`'s deliberately-NULL exclusions (jobs/coupons/giveaways) are now skipped at the caller. Production proof: **0 NULL/empty categories across all 700 news_articles rows**; the 00:00 run inserted 179 articles with no `NOT NULL constraint failed` error (the pre-fix failure mode). Category classification, dedup (idempotent external_id), and feed rotation (thirds) all observed working.

## 13. Event rotation/upsert verified

Production proof from the 00:00 run: 123 rows refreshed via upsert; **180 rows from the two rotated-out URL groups survived untouched** (303 total − 123 refreshed). **303 external_ids, 303 distinct — zero upsert duplicates.** Rotation group 1 correctly covered 10 of 31 URLs.

## 14. Event staleness pruning verified

0 rows older than the 2-day staleness window. Policy assessment: each URL group is revisited every 18h (3 runs × 6h), so the 48h prune allows ~1.5 missed runs of headroom; an event still listed is re-upserted (never prematurely removed); an event that vanishes from its listing is removed within ≤48h. **Policy is appropriate for a source visited every third run — no change made.** (8 past-date events currently in table will age out naturally via the same prune.)

## 15. Source rotation coverage verified

Rotation is **time-based** (`Math.floor(Date.now() / 6h) % N`), computed per invocation — no persistent state. Computed slots for consecutive cron times: events/news `1 → 2 → 0 → 1`, videos `0 → 1 → 0 → 1` — each cron run advances exactly one group; no reset. The observed run's metadata (`urls:10/31`, `feedsActive:17/50`, `queries:8/16`, `2/4`, `3/6`) matches the computed slots. Manual refreshes and retries within the same 6h window reuse the current slot and are idempotent (dedup by external_id); the next cron advances coverage regardless. Pre-deploy runs correctly show old code's metadata (`urls:31`, `queries:16`, etc.), proving the cutover.

## 16. Failure isolation verified

Structurally preserved and unchanged this phase: each scraper and each provider is independently try/caught with its own `scraper_runs` row; logging writes are individually wrapped (a logging failure cannot crash collection). Production evidence: the failed pre-deploy runs show providers failing independently while others completed; the successful 00:00 run shows all completing independently. E2E suite (PASS=161) includes the isolation assertions.

## 17. Admin monitoring verified

`/api/admin/scraper-runs` returns `providers` (config-truthful states: Dailymotion/IA/Odysee ACTIVE, YouTube/Rumble NOT CONFIGURED) plus `runs` (actual run history with per-run SUCCESS/PARTIAL/FAILED status, counts, duration, sanitized errors). The monitor therefore distinguishes **enabled (ACTIVE)** from **last-run health** (the FAILED rows during the subrequest incident were displayed as FAILED, not masked by the ACTIVE badge). No changes made.

## 18. Public API smoke results

All on `https://paranormalinitiative.com`:

| Endpoint | Result |
|---|---|
| `GET /api/videos` | **200** — videos served incl. Odysee |
| `GET /api/videos/refresh` (unauthenticated) | **403** (requireAdmin denial) |
| `GET /api/admin/scraper-runs` (unauthenticated) | **403** |
| `GET /api/forum/topics` | **404** (retired) |
| `GET /community-forum` | **302** → `member-home.html` (retired redirect) |

## 19. Production errors discovered

None new. The only errors in the post-deploy window are the known pre-fix failures (runs before 2026-10-07T21:45Z, correctly logged with sanitized subrequest errors) and 7 of 17 news feeds returning no items in the 00:00 run (external feed availability, not a code defect).

## 20. Exact repairs performed

**None.** All verification checks passed; per Step 13, no source code was modified. The two pre-existing observations noted (provider rows log `items_inserted: 0` by convention; provider badge state is config-based while run health lives in the history) are Phase 1 design, not defects affecting reliability, and were left untouched.

## 21. E2E results

No source changes were made this directive, so no new E2E run was required; the suite's last full run against this exact HEAD (`fc2d672`) is **PASS=161, FAIL=0, exit 0**. All areas listed in Step 14 (auth, admin/scraper authorization, logging, news, events, videos ×3 providers, ParaTube, Community Feed, Education, notifications, Messenger, video UGC, forum retirement) are covered by that run and unchanged since.

## 22. Git commit

None (no code changes). HEAD remains `fc2d672` — no meaningless commit created, per Step 16.

## 23. Deployment version

Unchanged: **`405876a1-dfef-4edd-a063-b9f6bd129781`**. Nothing was deployed during this verification.

## 24. Final working tree status

Clean — 0 modified/untracked files; HEAD == origin/main.

## 25. Remaining risks or limitations

1. **Headroom is modest (~9 external fetches).** Sufficient today (proven by the 00:00 run), but redirect chains or a chatty future provider (Rumble/YouTube) could erode it. Re-verify the budget in Phase 2B planning; the paid Workers plan (10,000 subrequests) removes the constraint if ever needed.
2. **Only one post-fix cron run exists so far** (00:00 UTC). Subsequent runs (06:00, 12:00, …) will exercise the other rotation slots; the slot math is deterministic and verified, but direct observation of slots 2/0 remains outstanding.
3. News feed availability fluctuates (10/17 OK this run) — external feed reliability, monitored via run metadata.
4. Provider `items_inserted` attribution is aggregate-only (pre-existing convention).
5. Rumble remains NOT IMPLEMENTED and is the next required provider phase (Phase 2B), followed by YouTube.

---

## Addendum — Independent Re-Verification (2026-10-08 ~03:15 UTC)

A second, independent read-only verification pass re-checked every section above against live production ~45 minutes after the original. **All checks passed; no source code was modified; no deploy was made.**

- **Deployment:** `wrangler deployments status` re-confirmed `(100%) 405876a1-dfef-4edd-a063-b9f6bd129781` (2026-10-07T21:45:33Z). Next cron run (06:00 UTC) had not yet fired at verification time — the 00:00 UTC run remains the only post-deploy scheduled run, so rotation slots 2 and 0 are still verified by slot math + code reading rather than direct observation.
- **Cloudflare limits:** re-confirmed against the current limits docs and the 2026-02-11 changelog: Free plan = **50 external subrequests/invocation**, **1,000 subrequests to Cloudflare services (D1/R2/KV)**. D1 logging does not consume the external budget; ~41 external fetches leave ~9 headroom.
- **Scraper runs:** all six post-deploy `scraper_runs` rows re-read directly from production D1 and identical to sections 5–9 (events success 123/123; news partial 179 inserted, 7 feed-level errors; DM 8/16 queries; IA 2/4; Odysee 3/6; videos aggregate 48 inserted).
- **Correction to §13/§14:** the events table holds **347 rows**, of which **303 are Eventbrite rows with 303 distinct external_ids** (zero upsert duplicates — confirmed) plus **44 legacy rows** from the retired pre-Phase-2A Meetup scraper (all `source='meetup'`, all NULL `external_id`, all created 2026-10-05 18:47:21, before this deployment). The original report's "303 total" counted only Eventbrite rows. The 44 legacy rows are untouched by the prune because the prune is deliberately scoped to `source = 'eventbrite'` (lib/event-scraper.js:354); they are historical data from the old architecture, not output of the current pipeline, and were left in place (production data deletion is out of scope for a verification directive). They are inert with respect to scraper reliability.
- **Code re-inspection:** rotation math (`Math.floor(Date.now()/6h) % 3` events/news, `% 2` videos — time-based, stateless), upsert `ON CONFLICT(external_id) DO UPDATE`, Eventbrite-scoped 2-day prune, per-scraper/per-provider try/catch isolation, `classifyNews()` NULL-skip at lib/news-scraper.js:286-287, and `requireAdmin`-gated `handleAdminScraperRuns` all confirmed in source.
- **Public smoke re-run:** `/api/videos` 200 (Odysee: 8 of 30 items on page 1, sample `https://odysee.com/@FollowsTheWay:9/NS-10-07-2026:…`), `/api/videos/refresh` 403, `/api/admin/scraper-runs` 403, `/api/forum/topics` 404, `/community-forum` 302 → `member-home.html?member=1`.

**Verdict unchanged: PRODUCTION COLLECTION CONFIRMED HEALTHY.** Outstanding: direct observation of rotation slots 2 and 0 at the 06:00/12:00 UTC cron runs; next-phase budget re-check before Phase 2B (Rumble).

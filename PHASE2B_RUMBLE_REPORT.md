# PHASE 2B — RUMBLE VIDEO DISCOVERY INTEGRATION

Directive: TPI-DISCOVERY-RUMBLE-001 · Performed 2026-10-08 (~03:20–03:40 UTC)

**VERDICT: RUMBLE INTEGRATION BLOCKED — NO AUTHORIZED DISCOVERY METHOD EXISTS.**

Per Directive Section 4 ("If Rumble does not provide an authorized and reliable discovery method: DO NOT fabricate an integration. Report the blocker and exact requirements. Leave Rumble marked NOT CONFIGURED.") and Section 23 ("Do not commit speculative production code. A research report may be committed separately."), **this directive ends at the research stage.** No source code was modified; no deploy was made; Rumble remains **NOT CONFIGURED** in the admin monitor (displayed truthfully, never ACTIVE).

---

## 1. Starting repository state

Branch `main`, HEAD `d9fb8f2` ("Add independent re-verification addendum to Phase 2A production report"), HEAD == origin/main, working tree clean. All Phase 1 / 2A commits present (`768d376`, `45ab85a`, `fc2d672`, `25e5f2f`).

## 2. Starting commit

`d9fb8f2`

## 3. Rumble discovery methods investigated

1. **Official Rumble API** — investigated; see §4–5. The historical public-facing API documentation ("Rumble API", formerly at api.rumble.com, mirrored as a frozen/deprecated OpenAPI spec) is **partner-gated and deprecated**. An independent integration listing confirms: *"Rumble's official API is gated to partner accounts."*
2. **Rumble Advertising Center API** (ads.rumble.com/docs) — official but scoped to **advertising data** for your own ad account. Not a video discovery mechanism.
3. **Rumble Live Stream API v1.1** (rumble.support, updated 2025-11-20) — official but scoped to **your own account's** live-stream telemetry (followers, chat, rants, viewer counts) via a private per-account URL containing your stream key. Not discovery; using others' would be credential misuse.
4. **Rumble Cloud API** (docs.rumble.cloud) — entirely different product (Rumble's cloud-infrastructure offering). Unrelated to rumble.com video.
5. **"Rumble Network Discovery"/runZero API** — name collision only; a network-asset discovery product. Unrelated.
6. **Publicly documented feeds (MRSS & OTT)** — help.rumble.com's "MRSS-&-OTT-Feeds" page historically documented syndication feeds **for OTT-platform partners** (e.g., set-top/Roku distribution). The page is now dead: it 302-redirects to `www.rumbleplayer.com/developers/index.html`, which itself now redirects to `rumble.com`. Community reporting from the era confirms regular (non-live) uploads had **no public RSS**; at most, live events exposed feeds. No general public channel/search RSS exists today.
7. **Official search/discovery interface** — none exists. Rumble.com search is an HTML page for interactive use; there is no documented public search API.
8. **Third-party scraping services** (ScrapeCreators, Apify, ScrapingBee, socialfetch, captapi, rss.app/OpenRSS generators) — **explicitly prohibited** by this directive ("Do not use unapproved third-party scraping services") and by Rumble's terms (below). Not used, not evaluated for integration.
9. **robots.txt** (`rumble.com/robots.txt`, fetched live): `User-agent: *` disallows only `/l/` and `/api/`; other public pages are not robots-disallowed. **However, robots.txt permission is not authorization** — Rumble's Terms of Use independently prohibit automated access (see §8), and the directive expressly warns against treating a responding endpoint as authorized.

## 4. Official documentation reviewed

- Rumble Website Terms and Conditions of Use and Agency Agreement — **live fetch of https://rumble.com/s/terms, last modified September 1, 2026** (quoted in §8).
- Rumble Live Stream API v1.1 help article (live fetch).
- Rumble Advertising Center API docs (search-verified scope).
- Historic MRSS & OTT Feeds help page (via Wayback Machine snapshot 2025-04-02; both the help page and the rumbleplayer.com/developers target are now dead ends redirecting to rumble.com).
- Cloudflare-side limits docs (unchanged from Phase 2A verification: Free plan 50 external subrequests/invocation; 1,000 to Cloudflare services).

## 5. Authorized discovery method selected

**None.** Every candidate fails at least one gate:

| Method | Status | Why it fails for discovery |
|---|---|---|
| Public search API | Does not exist | No documented endpoint |
| Deprecated video API | Partner-gated | Requires an approved partner account + key |
| Advertising Center API | Official | Ads data only, own account |
| Live Stream API | Official | Own-account telemetry, private URL/key |
| MRSS/OTT feeds | Partner-only | Dead public docs; OTT syndication partners |
| Channel RSS | Does not exist for uploads | Community-documented absence |
| HTML scraping of search/channel pages | Robots-tolerated but **contractually prohibited** | ToS automation ban (§8) |
| Third-party scraper services | Prohibited | Directive §4; also ToS-violating |

## 6. Authentication requirements

The only official metadata APIs require an authenticated, Rumble-approved account (partner API keys; ad-account credentials; private per-account stream URLs). None is available without an approved relationship with Rumble. TPI holds no such relationship.

## 7. Rate limits

Not published for any public discovery surface (none exists). Partner API rate limits are set per agreement. Moot without authorized access.

## 8. Access restrictions (the decisive finding)

From **https://rumble.com/s/terms** (live fetch, last modified 2026-09-01), two clauses:

> **RESTRICTIONS ON AUTOMATED SOFTWARE** — "You are prohibited from employing any form of automated software to interact with or access the Rumble Site, including but not limited to programming scripts, bots, or any other automated means, **without the prior written permission of Rumble**."

> **PROPRIETARY RIGHTS AND RESTRICTIONS** — "**Systematic retrieval of data or Content from the Rumble Service to create or compile, directly or indirectly, a collection, compilation, library, database or directory** without prior written permission from Rumble is prohibited."

The second clause describes precisely what the Paranormal Discovery Engine does: periodically retrieving video metadata and compiling it into a database (D1 `videos`) for a public directory (ParaTube). Even before any implementation question, the *activity itself* requires Rumble's prior written permission. The directive's prohibition on scraping "blocked pages," bypassing restrictions, and using proxy/scraping services makes every technical workaround out of scope by definition.

## 9. Metadata available

Not assessable without authorized access. (For completeness: Rumble embeds publicly expose an iframe player and the site displays title/creator/thumbnail/date on video pages, but retrieving that metadata systematically is prohibited by §8. Embedding a *known* Rumble video via the official iframe embed is permitted and is how ParaTube would play a Rumble video **if** a legitimate discovery path is later established.)

## 10. Rumble adapter implementation

**Not implemented.** No speculative production code was written or committed (Directive §23). `lib/video-scraper.js` remains exactly as deployed (`405876a1`): three providers (Dailymotion, Internet Archive, Odysee) with per-provider isolation, unchanged.

## 11. Stable ID format

Reserved and verified conflict-free for a future integration: **`pt_rm_`** — no `videos.external_id` in production D1 currently begins with `pt_rm_` (existing prefixes in use: Dailymotion, Internet Archive `pt_ia_*`-style, Odysee `pt_od_`). Recorded here so Phase 2B can be resumed without a prefix conflict.

## 12. Canonical URL handling

N/A (not implemented). When a discovery path exists, canonical form should be `https://rumble.com/v<id>-<slug>.html` exactly as Rumble publishes it, with no tracking parameters.

## 13. Relevance filtering

Not implemented. The existing common relevance architecture in `lib/video-scraper.js` (shared keyword/score pipeline, Jaccard near-duplicate flagging) is ready to accept a fourth provider's results without changes when a legitimate feed exists.

## 14. Deduplication behavior

Not implemented. Existing dedup (stable `external_id` UNIQUE + canonical-URL checks) is untouched and will absorb Rumble rows by the same mechanism when integrated.

## 15. Request-budget calculations

**Re-verified against live production and current Cloudflare docs** (Free plan: 50 external subrequests/invocation; 1,000 to Cloudflare services — D1 logging does not consume the external budget):

| Component | External fetches per scheduled run |
|---|---|
| Events (Eventbrite, thirds of 31) | ~10–11 |
| News (feeds, thirds of 50) | ~17 |
| Dailymotion (half of 16) | 8 |
| Internet Archive (half of 4) | 2 |
| Odysee (half of 6) | 3 |
| **Total (current)** | **~40–41** |
| **Free-plan limit** | **50** |
| **Headroom** | **~9** |

A hypothetical Rumble channel-feed provider at 2–4 fetches per run (halved across two runs) would fit inside the ~9 headroom **only if** headroom stays reserved for redirects/retries (Phase 2A observed redirect chains did not exhaust budget, but headroom must not be spent to zero). A safe design would either cap Rumble at ~3 fetches/run or redistribute Dailymotion's 8 queries across the video slot. **This calculation is moot while discovery is unauthorized, and no scheduling change was made.**

## 16. Updated rotation schedule

**Unchanged.** Events/News on `% 3` thirds, videos on `% 2` halves (`Math.floor(Date.now()/6h) % N`), exactly as deployed in `fc2d672`/`405876a1`. No provider's coverage was reduced and no source was removed.

## 17. Existing provider regression results

**Not run** — no source changes were made (Directive §14 conditions a regression run on source changes). Deployed code is byte-identical to `fc2d672`, whose full-suite baseline is **PASS=161, FAIL=0**. Production evidence (2026-10-08 00:00 UTC cron): Dailymotion success (8/16 queries, 160 found), Internet Archive success (2/4, 30 found), Odysee success (3/6, 60 found, 34 new rows), videos aggregate success (48 inserted).

## 18. News regression results

Not run (no changes). Production: 2026-10-08 00:00 UTC run `partial` (179 inserted, 7 of 17 active feeds returning nothing — external feed availability, not a defect); 0 NULL categories across 700 rows.

## 19. Events regression results

Not run (no changes). Production: 2026-10-08 00:00 UTC run success (123 found/inserted, 0 errors, 10/31 URLs); 303 Eventbrite rows all-distinct; 44 legacy pre-2A Meetup rows untouched by the Eventbrite-scoped prune (documented in the Phase 2A addendum).

## 20. Rumble tests

**None added** — no adapter exists to test. Directive §23 prohibits committing speculative production code; test code for an unimplemented provider would be exactly that. Existing suite untouched: PASS=161, FAIL=0 baseline stands.

## 21. Complete E2E results

No source changes were made this directive; the suite was not re-run. Last full run against deployed code `fc2d672`: **PASS=161, FAIL=0, exit 0**.

## 22. Production deployment status

**Not deployed.** Production remains `405876a1-dfef-4edd-a063-b9f6bd129781` (100% traffic, 2026-10-07T21:45:33Z), which is correct: the Phase 2A production rotation gate (Directive §3) was also not yet satisfiable — at execution time only one post-deploy scheduled run existed (2026-10-08 00:00 UTC; the 06:00/12:00 UTC runs had not yet fired), so a full observed rotation cycle remains outstanding. No new production requests were enabled, honoring both gates.

## 23. Production scraper-run results

Read-only inspection (2026-10-08 ~03:15 UTC): latest scheduled runs all post-deployment `405876a1` — events success, news partial (feed-level), Dailymotion/IA/Odysee all success, zero subrequest-limit failures, zero database errors. Rumble has no rows (never attempted).

## 24. Rumble production video count

**0** — correctly. No Rumble records exist in the `videos` table; nothing was attempted or fabricated.

## 25. ParaTube integration verification

N/A for Rumble. ParaTube verified healthy via the public API during this phase's read-only checks: `/api/videos` returns 200 with Odysee (8 of 30 page-1 items), Internet Archive, and Dailymotion content flowing through the normal pipeline.

## 26. Admin monitoring verification

No changes needed or made. `DISCOVERY & SCRAPERS` continues to display Rumble as **NOT CONFIGURED** — truthful, per Directive §13. Monitor semantics (config state vs. last-run health) verified in Phase 2A.

## 27. Final Git commit

`PHASE2B_RUMBLE_REPORT.md` (this file) is the only change: a research report, explicitly permitted by §23. Committed and pushed to `origin/main`. **No production code in this commit.**

## 28. Final working tree status

Clean; HEAD == origin/main; no stray files.

## 29. Remaining limitations

1. **The blocker is contractual, not technical.** A compliant integration requires **prior written permission from Rumble** (Terms of Use, "RESTRICTIONS ON AUTOMATED SOFTWARE" and "PROPRIETARY RIGHTS AND RESTRICTIONS"). Concrete unblock paths: (a) request partner/API access from Rumble (business/support contact) for a documented discovery or MRSS feed; (b) if granted, integrate through this same `lib/video-scraper.js` provider pattern with credentials in Cloudflare secrets; (c) alternatively, Rumble-authorized syndication (MRSS) of specific paranormal channels, if Rumble offers it to TPI.
2. **Phase 2A rotation observation still outstanding:** rotation slots 2 and 0 await the 06:00/12:00 UTC cron runs for direct production confirmation (slot math and code are verified; one run observed).
3. **Budget headroom (~9 fetches)** must be re-planned before any fourth provider is activated (see §15).
4. Rumble terms were re-checked on 2026-10-08; the ToS is dated 2026-09-01 and could change — re-verify before resuming.

## 30. Recommended next phase

Per the directive's own blocking logic, Phase 2B is **complete as a research outcome**: Rumble is correctly marked NOT CONFIGURED and must stay that way until written permission exists. Recommended sequencing:

1. **(No code)** Send Rumble a permission/partnership inquiry requesting API or MRSS discovery access for a non-profit paranormal-education directory, embedding via the official player, with attribution.
2. **(No code, gate closure)** After the 06:00/12:00 UTC runs, close out the Phase 2A rotation observation and record it in the Phase 2A report.
3. **Phase 2C — YouTube discovery research** can proceed independently under the same research-first standard (YouTube Data API v3 has a documented, key-authorized search endpoint with explicit quota terms — a materially different authorization picture than Rumble's).
4. If Rumble grants access, resume Phase 2B implementation with the reserved `pt_rm_` prefix and the budget plan in §15.

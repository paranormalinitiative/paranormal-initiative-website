# Discovery Engine — Phase 1 Foundation Notes

Phase 1 hardened the existing discovery infrastructure (news / videos /
events scrapers) without adding providers or changing architecture.

## Scraper endpoints now require admin authorization

`GET /api/news/refresh`, `GET /api/videos/refresh` and
`GET /api/events/refresh` previously ran for anyone. They are now guarded by
the existing `requireAdmin()` middleware (owner or admin). Unauthenticated
requests get 401; authenticated non-admin roles get 403. The scheduled cron
in `worker.js` calls the shared scraper functions directly, so the cron path
never touches HTTP authentication and behaves exactly as before.

Manual refreshes and cron runs are distinguished in the run history by
`run_trigger` (`manual` vs `cron`).

## scraper_runs table (migration 0035)

Each scraper execution is recorded in `scraper_runs`:

    id, scraper_type, source, run_trigger, started_at, completed_at,
    status (success | partial | failed), items_found, items_inserted,
    items_skipped, error_count, error_message, duration_ms, metadata_json

- `videos` runs are logged per provider (`dailymotion`, `internet_archive`,
  `odysee`) plus one aggregated row — future providers log per provider with
  no schema change because `source` is free-form.
- `news` and `events` are logged as one aggregated row per run (feeds rotate,
  so per-feed rows would double write volume for little diagnostic gain).
- Errors are sanitized before storage (`lib/scraper-log.js`): nothing that
  looks like a credential, header, or token survives, and messages are capped.
- Logging is failure-tolerant: a logging/D1 failure can never fail a scrape.
- Retention: the scheduled cron prunes rows older than 90 days
  (`pruneScraperRuns`). Only `scraper_runs` rows are deleted — never content.

## Admin monitoring

`admin-advanced-settings.html` has a **Discovery & Scrapers** section
(owner/admin only, same access gate as the rest of the page) fed by
`GET /api/admin/scraper-runs`:

- last-run summary per scraper (status, duration, found/added, errors)
- video provider health chips: Dailymotion ACTIVE, Internet Archive ACTIVE,
  Odysee DISABLED/API ISSUE, YouTube NOT CONFIGURED, Rumble NOT CONFIGURED
- last 20 runs (date/time, scraper, source, status, found, inserted,
  errors, duration) for operational troubleshooting
- manual Refresh News / Videos / Events buttons with running / success /
  failure feedback and disabled buttons while a request is in flight

## Provider states (2026-10-07)

| Provider         | State            | Notes                                          |
|------------------|------------------|------------------------------------------------|
| Dailymotion      | ACTIVE           | Graph API, no key. Working.                    |
| Internet Archive | ACTIVE           | advancedsearch + metadata APIs. Working.       |
| Odysee           | DISABLED / API ISSUE | see below                                   |
| YouTube          | NOT CONFIGURED   | future phase — no code added in this phase     |
| Rumble           | NOT CONFIGURED   | future phase — no code added in this phase     |

## Video relevance filtering (this phase)

- Internet Archive results now pass the same relevance bar as Dailymotion:
  the classifier must assign a category from title + description, or the
  text must carry a strong paranormal signal. Previously *every* Archive
  search hit was inserted unfiltered.
- Weak single-word categories (dreams, ancient, spirituality) now require a
  stronger signal (phrase keyword or two weak hits) before classification,
  because a bare "dream" or "ancient" matched mainstream content.
- Spam patterns extended with obvious non-paranormal entertainment
  (gameplay, music video, movie-trailer uploads) while keeping dramatic
  paranormal investigation content.

## Cross-source duplicate handling (this phase)

- Added `canonicalVideoUrl()` — strips tracking parameters (utm_*, ref,
  source, fbclid, gclid) and trailing slashes; host and path preserved so
  platform-specific URLs stay identifiable.
- Added conservative `isProbableDuplicate()` / `titleSimilarity()` helpers:
  canonical-URL match is conclusive; otherwise ~identical normalized titles
  plus (channel + duration) corroboration, or same-provider normalized-title
  match, is treated as a duplicate. Generic-title-only similarity is never
  merged. Existing videos, comments, reactions, saves and reports were not
  touched — helpers are for insertion-time dedup.
- The in-run normalized-title skip now counts duplicates as `items_skipped`
  so monitoring shows dedup working.

## Odysee — audit result: BLOCKED BY API (adapter needs a small rewrite)

Live tested 2026-10-07:

- The adapter's `any_tags` `claim_search` returns **0 items for every tag**,
  including a non-paranormal control ("gaming"). The tag index is effectively
  dead for this query shape — this is why the adapter returned nothing.
- A `text:` `claim_search` **does** return valid, well-formed video claims
  (titles, thumbnails, durations, claim_ids, channels), so Odysee discovery
  is achievable by switching the adapter to text queries.

Odysee stays DISABLED. Switching the query shape is an adapter rewrite that
should land with its own relevance filtering and a live soak in a separate
reviewed change — not silently inside this foundation phase.

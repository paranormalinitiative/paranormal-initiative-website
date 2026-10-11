# TPI-VIDEOS-001 Scraper Audit

## Current implementation

`lib/video-scraper.js` is a failure-tolerant, metadata-only aggregator. The scheduled Worker cron is `0 */6 * * *`. Dailymotion and Internet Archive queries rotate by half across six-hour runs to stay within the Workers subrequest budget. Odysee uses its public claim-search proxy with tag rotation and filters results to video claims. Rows are deduplicated by external ID/canonical URL/title similarity, inserted into `videos`, and old scraped rows are pruned after the configured retention window. `lib/scraper-log.js` sanitizes error text and records provider run health in `scraper_runs`.

## Provider status from source

| Provider | Source status | Current evidence |
|---|---|---|
| Dailymotion | Active | Public API adapter in source; not present in the current first production page sampled |
| Internet Archive | Active | Public advanced-search/metadata adapter in source; not present in the current first production page sampled |
| Odysee | Active | Production endpoint returned Odysee records on 2026-10-11 |
| YouTube | Not configured | Provider status explicitly says `not_configured`; no YouTube API ingestion |
| Rumble | Not configured | No production scraper; prior audit records contractual/API uncertainty |
| BitChute | Disabled/unsupported | Prior implementation notes record the tested feed as unavailable |

## Findings

1. The rotation strategy is an intentional quota-safety measure, not evidence that every provider appears on every run.
2. The current production feed is metadata and external links; it is not a TPI-hosted media CDN.
3. Scraper source attribution is preserved in D1, but the user-facing discovery model does not yet provide a unified source-health explanation or per-source filter.
4. Provider terms, thumbnail rights, takedown behavior, and content moderation need a documented acceptance policy before adding another adapter.

No scraper code was changed in this audit.

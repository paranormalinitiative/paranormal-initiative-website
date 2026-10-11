# TPI-VIDEOS-001 Database Audit

The remote D1 database `tpi_contributor_portal` was queried read-only on 2026-10-11. The query returned zero writes and confirmed these relevant tables and indexes:

## Authored content and engagement

- `tpi_videos` with unique slug, publication/status/category/featured/live indexes.
- `video_comments` with visible/hidden status and contributor ownership.
- `video_reactions` with one reaction per contributor/video.
- `video_saves` for Watch Later.
- `video_reports` with open/reviewed/dismissed/actioned moderation states.

## Scraped discovery and observability

- `videos` with unique external ID and category/publication indexes.
- `scraper_runs` with recent/type indexes and retention-oriented observability.

## Live integration

- `live_broadcasts` linked optionally to `tpi_videos`.
- `live_comments` with parent replies, moderation, starred/displayed controls.
- `live_reactions` with per-broadcast member reactions.

## Ownership and library

The source includes `member_media_library` and related album tables. The private library is owner-scoped and uses the R2 media binding for uploaded member media. StudioFlow recording storage is not represented as a public `tpi_videos` row automatically.

## Schema gaps for a future platform

- No creator-channel table or stable channel handle relation for video publishing.
- No canonical video playlist/watch-history model beyond Watch Later saves.
- No unified moderation case relation connecting authored, scraped, live, and community media.
- No explicit publication event linking a completed StudioFlow recording to a public watch page.
- `video_comments` lacks the richer reply/moderation fields present in `live_comments`.

No migration was created or applied.

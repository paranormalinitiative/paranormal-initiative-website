# TPI-VIDEOS-001 Video Sources

## Source classes

### Authored TPI videos

The `tpi_videos` table stores title, description, category, tags, platform, `video_url`, optional `embed_url`, thumbnail, featured/live flags, series/episode/duration, `viewing_access`, status, and creator ownership. These are references to externally hosted or otherwise supplied playback URLs; TPI does not transcode or automatically mirror them.

### Scraped discovery videos

The `videos` table stores metadata only: external ID, title, description, thumbnail URL, source URL, source name, channel name, duration, category, publication date, scrape date, and approval status. Current active adapters are Dailymotion, Internet Archive, and Odysee. Production `GET /api/videos?limit=5` returned Odysee records on 2026-10-11.

### Member library media

`member_media_library` records member-owned uploads stored through the existing `TPI_MEDIA` R2 binding. Private-library objects are authenticated and owner-checked at `/api/media/...`. This is a member media library, not a public video-platform publishing pipeline.

### StudioFlow recordings/live

StudioFlow recordings and live sessions remain separate from the authored `tpi_videos` catalog. Creator-owned storage is the approved policy: no automatic TPI-hosted recording archive, no R2 recording quotas, and no silent upload of private recordings. Any later public-live integration must be explicit and authenticated.

## Required future source contract

Every new source must state: ownership, URL/embed policy, terms/API authority, thumbnail rights, availability expectations, moderation/report path, rate limits, takedown handling, and whether TPI stores metadata only or media bytes. A source is not “supported” merely because a URL can be pasted into a form.

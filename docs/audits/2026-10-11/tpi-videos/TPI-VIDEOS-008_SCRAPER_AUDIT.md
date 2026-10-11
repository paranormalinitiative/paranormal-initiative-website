# TPI-VIDEOS-008 Scraper Audit

`lib/video-scraper.js` currently marks Dailymotion, Internet Archive, and
Odysee active; YouTube and Rumble are `not_configured`. The scraper stores
source-owned metadata in the existing `videos` table:

- original provider URL
- provider/source name
- title, description, thumbnail, channel, category, duration, dates

The schema in `migrations/0030_videos.sql` has no embed or direct-media-file
column. The public API therefore intentionally emits the original
`source_url` as `videoUrl` and an empty `embedUrl` for discovered rows.

Internet Archive search identifies items, but the scraper does not select or
persist a particular file from each item’s metadata. It would be unsafe to
invent a direct MP4 path from an item identifier. Odysee source URLs are
preserved as canonical external pages under the approved policy.

No scraper rewrite or database migration was necessary for this repair.

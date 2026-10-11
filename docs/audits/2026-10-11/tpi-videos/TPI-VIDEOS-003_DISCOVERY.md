# TPI-VIDEOS-003 Discovery

`GET /api/tpi-videos` now supports bounded `page`, `pageSize` (maximum 48), `q`, `category`, `source`, `creator`, `sort`, `live`, `featured`, `mine`, `status`, and authenticated `following` filters. Authored `tpi_videos` and approved scraped `videos` records are combined into a common safe payload. Scraped records are labeled `sourceType=discovered` and retain their external source name; they are not given creator ownership.

The home surface requests filtered pages from the server, supports load-more, and preserves the existing Latest, Live Streams, and All Videos tabs. Empty production authored data remains an honest empty state.

# TPI-VIDEOS-001 Discovery and Watch Pages

## Existing discovery

- `tpi-videos.html` is the authored TPI catalog with search, sort, category, featured, and live presentation.
- `member-home.html` renders an authored-video rail and a separate scraped ParaTube slot from `/api/videos`.
- Scraped entries link to provider URLs; they are not automatically watched in a TPI-native player.

## Existing watch page

`tpi-video.html` loads an authored item, renders an optional external iframe from `embedUrl`, or exposes a “Watch on” external link when no embed is available. It renders metadata, reactions, saves, comments, reports, share, and embed controls. The page uses the item’s `viewingAccess` for its client-side watch gate.

## Important security gap

The server handler for `GET /api/tpi-videos/:slug` returns a row without filtering `status` or requiring authorization. The collection route also accepts an arbitrary `status` parameter without an authorization check. This is a confirmed source-level pre-publication defect. Production currently returns an empty authored catalog, so no current draft row was exposed during the read-only check. Fix this before the first authored draft exists in production; do not rely on the page’s client-side gate.

## Future discovery plan

Build a unified search index only after deciding whether results are authored, scraped, live, or member-owned. Keep source labels visible, preserve external attribution, and never imply that scraped content is TPI-produced or that an external player is TPI-hosted.

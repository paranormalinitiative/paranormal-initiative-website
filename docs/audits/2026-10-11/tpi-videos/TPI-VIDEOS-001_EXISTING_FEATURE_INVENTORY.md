# TPI-VIDEOS-001 Existing Feature Inventory

## Public/member-facing surfaces

| Surface | Current behavior | Status |
|---|---|---|
| `tpi-videos.html` | Member-shell catalog backed by `/api/tpi-videos`; search, category filters, sort, featured/live presentation | Implemented; catalog is empty in current production |
| `tpi-video.html` | Detail/watch page; external iframe or external watch link, metadata, related items, reactions, saves, comments, reports, share/embed UI | Implemented; live playback not evidenced because no authored rows exist |
| `member-videos.html` | Private member media library; local browser file picker uploads to `/uploads/library`, playback, open/download | Implemented; creator-owned private media path |
| `member-home.html` | Feed/rails surface authored TPI videos plus a ParaTube scraped-video slot | Implemented; separate authored and scraped sources |
| `live-video.html` | Public Coming Soon page | Preserved; not a public StudioFlow player |
| `paper-editor.html` | Contributor entry fields for TPI Video metadata and external URL/embed | Implemented publishing workflow; needs security gate before first production publication |

## API inventory

- Authored catalog: `GET /api/tpi-videos`, `GET /api/tpi-videos/:slug`.
- Authored management: contributor-protected `POST`, `PUT`, and `DELETE /api/tpi-videos` routes.
- Scraped directory: `GET /api/videos`, admin-protected `GET /api/videos/refresh`.
- Authored engagement: `/api/video-comments`, `/api/video-reactions`, `/api/video-saves`, and `/api/video-reports`.
- Live Studio interaction: `/api/studio/live-broadcasts`, `/api/live-broadcasts/:id/events`, comments, reactions, and moderation controls.
- Private member media: `/api/uploads/library`, `/api/me/library`, and protected `/api/media/private-library/...` objects.

## Feature classification

- **Implemented:** external authored-video metadata, embeds, public/member visibility field, comments, reactions, Watch Later saves, reports, scraped directory, member video uploads, live interaction tables/routes, owner-only StudioFlow boundary.
- **Partial:** creator channels, public watch history/playlists, moderation console for authored video reports, discovery/search across both video domains, public live playback, StudioFlow-to-TPI publication.
- **Not implemented:** TPI-native video transcoding/player pipeline, creator-owned public channel pages, provider OAuth/API ingestion, Rumble scraper, YouTube scraper, automatic upload of StudioFlow recordings to TPI cloud storage.
- **Deferred/blocked:** physical device and real-world Creator Studio acceptance; external-provider broadcast certification.

# TPI-VIDEOS-001 Architecture

## Current architecture

```text
Contributor external URL/embed -> tpi_videos -> tpi-videos.html -> tpi-video.html
Public provider metadata       -> scraper -> videos -> member-home ParaTube slot
Member upload                   -> R2 + member_media_library -> member-videos.html
StudioFlow room/live            -> live_broadcasts + live interaction -> owner-only Studio
```

These paths must remain distinct until an explicit publication contract connects them.

## Target logical layers

1. **Source/ownership layer:** creator-owned destination, external provider reference, TPI-authored media, or scraped discovery record.
2. **Publication layer:** draft, review, published, unlisted, archived, removed, with server-side visibility.
3. **Playback layer:** reviewed embed, external watch link, native playback only if separately approved.
4. **Social layer:** comments, reactions, saves, follows, notifications, and playlists with ownership-aware authorization.
5. **Moderation layer:** reports, takedowns, review decisions, audit log, and provider/source handling.
6. **Live layer:** private StudioFlow session, public broadcast record, viewer playback, and post-live archive as separate states.

## Non-goals

- Rebuilding StudioFlow.
- Automatically hosting all creator recordings in TPI R2.
- Adding YouTube API/OAuth without approval.
- Treating a scraped provider row as TPI-owned content.
- Launching public `/live-video` before owner approval.

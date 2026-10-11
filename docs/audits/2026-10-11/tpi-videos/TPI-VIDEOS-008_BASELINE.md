# TPI-VIDEOS-008 Baseline

Date: 2026-10-11

Canonical source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

## Existing integration

The 007 strict resolver already protected the native player from thumbnails,
unsafe URLs, and unapproved embeds. Its remaining provider branch returned a
generic external-watch state. The watch page rendered that state with the
heading `Playback unavailable here`, even when the provider link was valid.

The public production catalog was inspected read-only through
`/api/tpi-videos?pageSize=48`:

| Provider | Records | Source URL | Embed URL | Direct/playback URL |
|---|---:|---:|---:|---:|
| Odysee | 90 | 90 | 0 | 0 |
| Dailymotion | 59 | 59 | 0 | 0 |
| Internet Archive | 51 | 51 | 0 | 0 |
| **Total** | **200** | **200** | **0** | **0** |

All inspected rows were `sourceType: discovered`; no published creator-authored
rows were present in this public inventory.

## Scope boundary

This batch repairs provider intent and visible actions in the existing TPI
Videos catalog/watch flow. It does not rebuild StudioFlow, upload recordings,
create a public livestream, add a database migration, modify R2, or change
authentication and `/live-video` behavior.

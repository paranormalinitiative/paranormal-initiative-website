# TPI-VIDEOS-007 Playback Sources

The source priority is:

1. Verified direct media from `playbackUrl`, `replayUrl`, or an explicit direct
   media field.
2. Validated provider embed from `embedUrl`.
3. Validated approved provider source from `videoUrl`.
4. Private/local recording classification.
5. Unavailable or unsupported.

The resolver preserves source ownership and does not rewrite scraped provider
URLs. A thumbnail, title, duration, or successful API response is metadata—not
playback evidence.

Production discovery is currently dominated by external Odysee and Internet
Archive records without embed URLs. Those records correctly use the external
fallback path until an approved playable embed or direct source exists.

# TPI-VIDEOS-008 Provider Matrix

| Provider | Approved behavior | Current catalog state | Result |
|---|---|---|---|
| TPI Creator Studio | Internal player only for a valid authorized public source | No public creator rows in the inspected catalog | NOT VERIFIED in production |
| Odysee | Always open the original Odysee page externally | 90 source-owned URLs; no embeds | PASS: external by design |
| Dailymotion | Official Player-ID embed when configured; otherwise original page | 59 source-owned URLs; no configured TPI Player ID | PASS: external fallback; embed path unit-tested |
| Internet Archive | Compatible media/approved embed when verified; otherwise original item | 51 item URLs; scraper does not store a selected media file | PARTIAL: external fallback |
| Rumble | Approved embed when supported; otherwise original page | No active records; provider not configured | NOT CONFIGURED |
| YouTube | Approved embed when supported | No active records; provider not configured | NOT CONFIGURED |

Provider links are never presented as native playback. The resolver must have
a validated direct media URL or an approved provider embed before rendering a
player surface.

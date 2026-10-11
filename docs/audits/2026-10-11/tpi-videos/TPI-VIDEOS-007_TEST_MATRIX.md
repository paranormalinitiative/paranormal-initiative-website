# TPI-VIDEOS-007 Test Matrix

| Pipeline / behavior | Method and environment | Result | Evidence / limitation |
|---|---|---|---|
| Source resolver | Node VM regression against `tpi-video-player.js` | PASS | 10 assertions: direct, replay, embed, external, local, unsafe, thumbnail-only, markup, page integration |
| Native media markup | Resolver output inspection | PASS | `<video controls playsinline preload="metadata">` only for direct media |
| Actual media decode/playback | Isolated localhost browser fixture; FFmpeg H.264/AAC input | PASS | Metadata loaded, playing, `readyState=4`, currentTime≈1.997/4.000, ended; screenshot captured in audit run |
| Provider embed | Node resolver regression | PASS | Approved YouTube embed renders iframe; unsafe host does not |
| External fallback | Node resolver regression | PASS | Odysee classified external; no native video is rendered |
| Thumbnail-only record | Node resolver regression | PASS | Explicit unavailable state; no fake player |
| Local StudioFlow recording | Source/API architecture inspection | PARTIAL | Local/private classification preserved; public publication not tested |
| TPI API/security | Existing isolated Wrangler/D1 suite | PASS 211/211 | `scripts/e2e/api-e2e.sh 8793`; no production data |
| TPI production creator playback | Read-only production API inspection | NOT TESTED | No published creator-authored video rows currently exist |
| External provider playback | Production provider session | NOT VERIFIED | No provider playback claim made |
| Mobile/physical device | Physical devices | NOT TESTED | No physical device available in this run |
| Screen reader/full keyboard | Browser automation | PARTIAL | AX tree exposed controls; Playwright module unavailable for full audit |
| `/live-video` boundary | Read-only production endpoint check | PENDING RELEASE CHECK | Must repeat after deployment |
| `/studio/` access boundary | Read-only production endpoint check | PENDING RELEASE CHECK | Must repeat after deployment |

Result labels distinguish simulated/local integration evidence from production,
authenticated, external-provider, and physical-device evidence.

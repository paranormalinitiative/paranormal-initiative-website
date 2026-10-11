# TPI-VIDEOS-008 Source Resolver

The existing `tpi-video-player.js` resolver remains the single client decision
point. Its states are:

| State | Meaning | Rendering |
|---|---|---|
| `DIRECT_BROWSER_MEDIA` | Approved TPI media host and recognized media extension | Native HTML5 player |
| `APPROVED_PROVIDER_EMBED` | HTTPS URL matches an approved provider embed shape | Provider iframe |
| `APPROVED_EXTERNAL_WATCH` with `EXTERNAL_BY_DESIGN` | Odysee policy | `WATCH ON ODYSEE`, new tab |
| `APPROVED_EXTERNAL_WATCH` with `EXTERNAL_FALLBACK` | Valid provider page without approved embed | Provider-labelled external action |
| `LOCAL_PRIVATE_RECORDING` | Browser-local StudioFlow recording | Private explanation, never public media |
| `UNAVAILABLE` / `UNSUPPORTED` | No usable or unsafe source | `Playback unavailable here` |

The new `actionFor` helper is shared by the catalog and watch page. It keeps
the existing internal TPI watch route for playable/internal records and gives
provider records a safe `target="_blank" rel="noopener noreferrer"` action.
No provider URL is rewritten, proxied, or uploaded.

Dailymotion embeds are accepted only when the URL contains a Player ID in the
official `geo.dailymotion.com/player/{id}.html?video={videoId}` shape. The
generic no-Player-ID API value is intentionally rejected.

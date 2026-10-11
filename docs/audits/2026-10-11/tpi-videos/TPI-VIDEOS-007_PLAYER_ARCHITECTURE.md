# TPI-VIDEOS-007 Player Architecture

`tpi-video-player.js` exposes a small browser-side `TPI_VIDEO_PLAYER` helper.
It resolves the API payload into one of these explicit states:

| State | Rendering |
|---|---|
| `DIRECT_BROWSER_MEDIA` | Native HTML5 `<video controls playsinline>` |
| `APPROVED_PROVIDER_EMBED` | Strictly allowlisted provider iframe |
| `APPROVED_EXTERNAL_WATCH` | Non-pretend unavailable panel plus provider link |
| `LOCAL_PRIVATE_RECORDING` | Private/local explanation; no public player |
| `UNAVAILABLE` / `UNSUPPORTED` | Explicit unavailable state |

Direct media is accepted only for approved TPI media hosts (or loopback hosts
in a loopback test page) and a recognized media extension. Provider embeds and
external links require HTTPS, no credentials/port/hash, an approved host, and
a provider-shaped URL. The resolver never performs a `HEAD` request and never
equates an HTTP success with playable media.

The helper wires native media events to an accessible status line: metadata
ready, playing, paused, ended, and browser playback error.

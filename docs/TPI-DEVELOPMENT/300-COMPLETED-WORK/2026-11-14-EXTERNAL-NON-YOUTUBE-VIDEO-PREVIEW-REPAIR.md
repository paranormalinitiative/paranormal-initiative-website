# External Non-YouTube Video Preview Repair

Date: 2026-11-14 15:08:50–20:27 ET
Incident: `TPI-EXTERNAL-VIDEO-2026-11-14`

Status: **External-video support and interactive-page fallback deployed and live verified**

## Reported impact

A Community Feed post linking to `Battery Drain Experiment.html` showed a
generic chain-icon card. It did not show a video preview or provide in-feed
playback. The link was not a YouTube URL.

## Confirmed cause

The shared link-preview renderer only created an in-feed player for YouTube.
Direct external video responses and video sources published by ordinary web
pages were reduced to generic link metadata.

The supplied research page has an additional source limitation: its initial
HTML is JavaScript-rendered and does not expose a safe direct video URL,
`og:video` value, or `<video>/<source>` element to the server preview fetch.
The page is HTTP-only; its HTTPS endpoint fails TLS negotiation, and the
browser blocks the HTTP page in the current environment. TPI cannot safely
invent a playable video URL or bypass that external host restriction.

## Repair

- Direct `video/*` responses now return an external-video preview payload.
- Standard `og:video`, `twitter:player:stream`, `<video>`, and `<source>`
  metadata are detected and validated before use.
- Older pages that place an MP4/WebM/MOV/OGV file in a link or script source
  are also recognized by safe extension-based extraction.
- The Community Feed renders validated external video sources in a native
  HTML5 player with controls, metadata preload, poster support, and an
  external fallback link.
- JavaScript-rendered research/media pages that expose no direct source now
  return an `external-page` interactive preview. The feed offers an
  in-context **Open interactive preview** action using a sandboxed iframe,
  while retaining an **Open source** fallback when the external host blocks
  embedding, HTTP navigation, or playback.
- YouTube behavior remains isolated and unchanged.

The supplied page now receives the interactive fallback in the feed. For
guaranteed native in-feed playback, its owner must still expose a direct HTTPS
MP4/WebM URL or publish standard video metadata. Uploading the actual MP4 to
TPI is also supported and provides the most reliable cross-browser playback.

## Verification

- Link-preview regression: **17/17 passed**.
- Member interaction contracts: **27/27 passed**.
- Release safety: **35/35 passed**.
- Release impact: **12/12 passed**.
- Focused Firefox profile/feed regression: **53/53 passed**.
- Focused Firefox Messenger regression: **22/22 passed**.
- Authenticated Messenger MP4/ZIP round trip: **12/12 passed**.
- Guarded preflight: **CERTIFIED**, 13 gates, 34.6 seconds.
- Production smoke: **10/10 passed**.
- Live Worker returned `provider: external-page` and `interactive: true` for the
  exact supplied URL, confirming that the feed now provides an interactive
  fallback rather than the previous blank chain-icon card.

## Release identity

- Source commit: `7e4a4049181de2390ced8c83f51b285d5b52e563`
- Release: `rel-7e4a4049181d-d19476c2386d`
- Deployed Worker version: `ce91ea28-cc8a-4542-81c5-58165b80f754`
- Rollback Worker version: `6d5d40e2-5fba-49c8-a890-dd9d89106148`

## Permanent protection

The maintained Community YouTube/link-preview regression now covers direct
external video responses, page metadata, source tags, legacy linked-file
patterns, and JavaScript-rendered interactive external pages. Protected-
application integrity passed; StudioFlow, Nova Workspace, and Creator Studio
were not modified.


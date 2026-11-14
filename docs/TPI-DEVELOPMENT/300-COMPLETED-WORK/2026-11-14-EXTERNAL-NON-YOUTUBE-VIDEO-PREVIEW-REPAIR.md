# External Non-YouTube Video Preview Repair

Date: 2026-11-14 15:08:50 ET  
Incident: `TPI-EXTERNAL-VIDEO-2026-11-14`

Status: **External-video support deployed; supplied source-page limitation confirmed**

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
- YouTube behavior remains isolated and unchanged.

For the supplied page to play inside TPI, its owner must expose a direct HTTPS
MP4/WebM URL or publish standard video metadata. Uploading the actual MP4 to
TPI is also supported and provides the most reliable cross-browser playback.

## Verification

- Link-preview regression: **16/16 passed**.
- Member interaction contracts: **27/27 passed**.
- Release safety: **35/35 passed**.
- Release impact: **12/12 passed**.
- Guarded preflight: **CERTIFIED**, 10 gates, 16.2 seconds.
- Production smoke: **10/10 passed**.
- Live Worker returned the supplied page's title but no playable video source,
  confirming the limitation is on the linked page rather than the TPI player.

## Release identity

- Source commit: `2d5c8e6e2f65ad6f506ba9579d6731a537fd4136`
- Release: `rel-2d5c8e6e2f65-844575167462`
- Deployed Worker version: `6d5d40e2-5fba-49c8-a890-dd9d89106148`
- Rollback Worker version: `1d6f02c2-f157-4e0d-8d29-bae8aded6ca4`

## Permanent protection

The maintained Community YouTube/link-preview regression now covers direct
external video responses, page metadata, source tags, and legacy linked-file
patterns. Protected-application integrity passed; StudioFlow, Nova Workspace,
and Creator Studio were not modified.


# TPI-STUDIOFLOW-015B — Real Platform Logos and Visual Destination Selector

Status: IMPLEMENTED LOCALLY; PRODUCTION RELEASE PENDING

This visual refinement preserves the existing Creator Studio destination model,
saved destinations, manual RTMP configuration, stream-key handling, broadcast
routing, authentication, owner-only access, and `/live-video` Coming Soon
boundary. No provider OAuth, D1 migration, R2 change, or broadcast-engine
rewrite was introduced.

## Implemented

- Replaced generic monogram tiles with locally bundled recognizable logos.
- Added the requested order: YouTube, Facebook, Rumble, Twitch, LinkedIn,
  Instagram, X, Kick, Vimeo, Brightcove, Hopin, and Other Platforms / RTMP.
- Kept Rumble prominently visible in the first row.
- Used a broadcast icon for Other Platforms / RTMP.
- Reduced initial card content to logo, platform name, and a short capability
  indicator. Detailed technical status remains in the selected-platform panel.
- Preserved accurate unsupported-provider disclosures and the existing manual
  RTMP fallback without adding fake OAuth controls.
- Added centered card layout, selected state, visible keyboard focus, brand
  color, responsive two-column narrow layout, and local asset bundling.

## Icon sources and usage notes

- YouTube, Facebook, Rumble, Twitch, LinkedIn, Instagram, X, Kick, and Vimeo
  use the bundled Simple Icons package (`simple-icons`, CC0-1.0). The package
  provides paths and source metadata without runtime requests.
- Brightcove uses `src/assets/brands/brightcove.svg`, sourced from the
  Wikimedia Commons Brightcove logo record, which identifies Brightcove as the
  author/source and records the public-domain text-logo classification:
  https://commons.wikimedia.org/wiki/File:Brightcove_logo.svg
- Hopin uses `src/assets/brands/hopin.png`, sourced from the Wikimedia Commons
  Hopin 2024 logo record, which identifies Hopin.com as the source and Hopin as
  the author:
  https://commons.wikimedia.org/wiki/File:Hopin_logo_(2024).png
- Hopin is kept as the requested catalog label; the selected-platform panel
  accurately says provider setup is required and does not claim a live native
  integration.

## Files modified

- Canonical source `web/src/App.tsx` — catalog, logo rendering, ordering,
  accessibility labels, and capability display.
- Canonical source `web/src/styles.css` — centered responsive cards, logo sizing,
  selected state, and keyboard focus styling.
- Canonical source `web/src/assets/brands/brightcove.svg`.
- Canonical source `web/src/assets/brands/hopin.png`.
- Canonical source `web/package.json` and `web/package-lock.json` — bundled
  `simple-icons` dependency.
- Generated TPI `studio/` bundle and this report.

## Verification

Passed locally:

- TypeScript and Vite production build.
- Room-server and RTMP-bridge syntax checks.
- `git diff --check`.
- Local browser selector rendering with recognizable logos and requested order.
- Brightcove/Hopin visibility and unsupported capability disclosure.
- Other Platforms / RTMP selection and existing manual RTMP fields.
- Narrow responsive preview with two-column cards and no visible horizontal
  clipping in the captured browser view.

The current browser-control session could not set exact 100%, 125%, 150%, or
200% browser zoom levels or produce persistent repository screenshot files.
Those exact zoom levels and authenticated production interaction remain
**NOT YET VERIFIED**. The captured narrow preview was inspected during local
verification; the production bundle is still protected by the existing
server-side owner/admin gate.

## Release record

Canonical StudioFlow source, TPI integration commit, Cloudflare deployment
identifier, and final production route checks will be appended after release.

## Known limitations

Native account connections remain unsupported unless separately implemented and
verified. Brightcove and Hopin are visual destination choices with accurate
setup-required messaging; they do not become functional broadcast integrations
through this visual change.

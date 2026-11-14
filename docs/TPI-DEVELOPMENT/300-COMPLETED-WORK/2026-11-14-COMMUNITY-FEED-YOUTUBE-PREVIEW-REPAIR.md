# Community Feed YouTube Preview and In-Feed Playback Repair

Date: 2026-11-14  
Incident: `TPI-COMMUNITY-YOUTUBE-2026-11-14`

Status: **DEPLOYED AND LIVE VERIFIED**

## Reported impact

Member Bill Heiland published a Community Feed post containing two YouTube
links. The links were stored correctly, but the post displayed no useful
preview and did not provide a way to play either video inside the feed. The
affected production post is `bfaaffcf-3a39-49cf-9fd2-e41e23220848`.

No member post, attachment, account, or production database row was modified
as part of the diagnosis, repair, release, or live verification.

## Root cause

The generic link-preview service attempted to fetch and scrape the normal
YouTube page. YouTube returned HTTP 429 to the production Worker, so the API
returned no previewable response. The browser silently ignored that failure.

The feed also had two product limitations:

- only the first link attachment in a post was eligible for a preview;
- link previews could open an external tab but had no in-feed YouTube player.

## Repair

- Added strict recognition for supported HTTPS YouTube URL forms, including
  `youtu.be`, `watch`, `shorts`, `live`, and `embed` links.
- Replaced normal-page scraping for YouTube with the public oEmbed metadata
  path.
- Added a deterministic fallback preview using the validated video identifier
  and YouTube thumbnail host. A rate limit or metadata outage no longer removes
  the preview or player.
- Rendered every link attachment in its stored order instead of only the first.
- Added an accessible **Play** action that opens a privacy-enhanced
  `youtube-nocookie.com` player inside the Community Feed card.
- Retained a visible **Open on YouTube** link for every preview.
- Corrected the broad Member Home regression to check the maintained TPI Video
  and ParaTube destinations instead of a retired page marker.

## Permanent prevention

The guarded release preflight now includes
`verify:community-youtube-preview`. It checks:

- supported and malicious-lookalike URL handling;
- oEmbed metadata handling;
- rate-limit fallback behavior;
- two ordered previews for the two exact URLs from the reported post;
- direct YouTube fallback links;
- accessible in-feed playback in Firefox Developer Edition;
- creation and cleanup of a disposable local member post.

The release-safety contract fails if this Community YouTube gate is removed
from preflight.

## Verification

- YouTube link-preview regression: **12/12 passed**.
- Focused local Firefox Community Feed acceptance: **PASS**.
- Broad Member Home regression: **48/48 passed**.
- Local authentication lifecycle: **38/38 passed** at each checkpoint.
- Local Firefox administrator acceptance: **65/65 passed**.
- Full release preflight: **34/34 gates passed**.
- Live anonymous production smoke: **10/10 passed**.
- Live isolated production Firefox acceptance: **65/65 passed**.
- Live API checks for both reported URLs: **HTTP 200** with validated preview,
  thumbnail, video identifier, and privacy-enhanced player target.
- Read-only live Firefox check of Bill's existing post: **PASS**; both previews
  appeared in stored order and the player opened inside the feed.

## Release identity

- Source commit: `9e28d63715b79dc9e395c6360fa0145b3ea0947a`
- Release: `rel-9e28d63715b7-fbdc19f32cde`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `aabd3b01-6769-4402-b05a-b06cbe964c1c`
- Rollback version: `c26d3d21-3d0e-4fe3-b401-87b4403f58a8`
- Production traffic after verification: **100% on the deployed version**


# Community Feed YouTube Body-Link Repair and Protection

Date: 2026-11-14  
Incident: `INC-2026-11-14-10`  
Reported: **2026-11-14 14:42:01 ET**  
Status: **DEPLOYED AND LIVE VERIFIED**

## Reported impact

A new Community Feed post containing a YouTube link showed a generic external
link card instead of the YouTube preview and in-feed player. This was a
site-wide rendering issue: it could affect any member, any supported browser,
and any post created through a client path that stored the URL in the body
without a separate link-attachment record. The earlier two-YouTube attachment
repair remained important and was preserved.

No member post, account, attachment, or production database row was modified
as part of the diagnosis or live verification. Browser regression posts were
disposable synthetic fixtures and were deleted after testing.

## Root cause

The Community Feed renderer hydrated link previews only from persisted
`community_attachments` rows marked as `mediaType: "link"`. The normal
YouTube resolver, thumbnail fallback, ordered multi-link rendering, and
privacy-enhanced player were still present and working, but a post whose
YouTube URL existed only in its body gave the renderer no URL to hydrate.

That explains the difference between the earlier successful two-attachment
case and the newly reported post: the preview service was not the broken part;
the feed had an incomplete source-of-URLs contract.

## Repair

- Added one shared `linkPreviewUrlsForPost(item)` source-of-URLs function in the
  Community Feed renderer.
- It checks saved link attachments and HTTPS URLs found in the post body.
- It removes trailing punctuation and deduplicates URLs while preserving their
  original order.
- It sends every discovered URL through the existing `/api/link-preview`
  resolver, so YouTube detection, fallback thumbnails, direct links, and
  in-feed `youtube-nocookie.com` playback remain centralized.
- Kept existing stored-attachment behavior unchanged, including multiple
  ordered YouTube previews and the accessible Play action.

## Permanent protection

The Community YouTube browser regression now covers both supported creation
paths:

1. Two explicit saved YouTube link attachments render as two ordered preview
   cards, preserve direct fallback links, and open the privacy-enhanced player.
2. Two YouTube URLs found only in post text render as two ordered preview cards
   without requiring stored link chips.

The source-contract suite fails if the feed stops checking either attachments
or post text. The release-safety contract keeps the Community YouTube gate in
the guarded preflight, and production promotion remains fail-closed when the
gate fails. StudioFlow, Nova Workspace, and Creator Studio remain protected by
the unchanged-application byte guard.

## Verification

- Link-preview regression: **12/12 passed**.
- Member interaction source contracts: **19/19 passed**.
- Firefox Community Feed acceptance: **PASS**, including both saved-link and
  body-only two-video cases.
- Full release preflight: **34/34 workflow gates passed** after a transient
  unrelated profile acceptance retry; the final targeted profile/feed
  regression passed **53/53**.
- Production anonymous smoke: **10/10 passed**.
- Production traffic confirmed at **100%** on the new Worker version.

## Release identity

- Source commit: `d3fa0d1242a5c3006579960e2ca73e4d9489287d`
- Release: `rel-d3fa0d1242a5-450b451fa7cd`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `e2291e3f-d354-4f77-b18f-505128dd5cdd`
- Rollback version: `9113ac7d-1663-44e1-aa95-819d185ce350`
- Certification manifest digest: `dcab48bddb04a92bd311da2a98e8ddd7d3298dfe57d0a6bc1a98317802ff6606`
- Protected StudioFlow source commit recorded by certification:
  `2c7c651f34839b0115596d632f1009214e4cd63d`

## Useful references

- [`member-home.html`](../../member-home.html) — shared Community Feed
  renderer and URL discovery
- [`tpi-member-interactions.mjs`](../../scripts/verify/tpi-member-interactions.mjs)
  — source contract
- [`tpi-community-youtube-preview-browser.mjs`](../../scripts/verify/tpi-community-youtube-preview-browser.mjs)
  — disposable Firefox acceptance
- [`2026-11-14-COMMUNITY-FEED-YOUTUBE-PREVIEW-REPAIR.md`](2026-11-14-COMMUNITY-FEED-YOUTUBE-PREVIEW-REPAIR.md)
  — earlier two-attachment resolver and player repair

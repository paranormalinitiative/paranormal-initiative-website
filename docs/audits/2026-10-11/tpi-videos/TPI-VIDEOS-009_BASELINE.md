# TPI-VIDEOS-009 Baseline Audit

Date: 2026-10-11
Canonical source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Scope: TPI Videos, watch pages, creator channels, Reels, Community Feed link previews, saved content, history, APIs, schemas, tests, and production boundaries.

## Baseline result

The TPI Videos surface is a functioning catalog and watch-page foundation, not yet a complete video platform. TPI-VIDEOS-008's provider-aware external-routing behavior is preserved as the baseline. Creator-authored published video inventory and authenticated owner workflows remain sparse or unverified in production.

## Existing capabilities

- Public TPI Videos catalog with featured, latest, live, all-videos, search, source, category, sort, and load-more controls.
- Provider-aware watch routing from 008: Odysee is external by design; unsupported Dailymotion and Internet Archive records use provider-labelled external fallbacks; verified direct media/provider embeds remain eligible for internal playback.
- Watch page with playback area, title/description, creator/channel identity, follow, reactions, sharing, save, comments, related videos, reporting, and embed UI.
- Creator video/channel CRUD and publication controls exist behind authenticated Creator Studio flows.
- Public channel route exists with published videos and follow controls.
- Community Feed has client-side link-preview hydration, but the Worker route currently fails at runtime because `handleLinkPreview` is referenced but not defined.
- Community Feed link attachments preserve original HTTP(S) URLs and open them externally with safe window attributes.
- Existing video save/reaction/comment tables and API routes exist for authored `tpi_videos` records.
- No watch-history table/API was found.
- The current `reels.html` route is a static demonstration placeholder, not a persisted Reels catalog or creator workflow.

## Confirmed baseline defects or gaps

1. `GET /api/link-preview?url=...` returns HTTP 500 with `handleLinkPreview is not defined` in the current production runtime.
2. Featured selection is deterministic rather than rotating eligible featured items across refreshes.
3. The homepage still includes the legacy Continue Exploring and Community & Research cards requested for removal by 009.
4. The video grid uses auto-fill sizing rather than a defined four-column desktop layout.
5. Regular videos are not distinguished from Shorts/Reels in the catalog controls or payload.
6. New-video polling and a non-interruptive availability indicator are absent.
7. External video cards expose provider action links, but the card's primary click still routes through the internal TPI watch page instead of consistently opening the original provider.
8. External discovered videos are not returned by the existing authored-video save retrieval join.
9. Watch Later is not a unified member-owned experience for internal and external destinations.
10. Watch History has no durable data model or member-facing review/clear surface.
11. Reels remains a placeholder and has no discovered or Creator Studio-backed content pipeline.

## Security and boundary baseline

- `/studio/` remains owner/authorized-account protected; do not weaken this boundary.
- `/live-video` remains public Coming Soon; do not replace it with the live application.
- No creator recording uploads to TPI-managed R2 are part of this audit.
- Link preview fetching must validate the original URL, block local/private/metadata targets, bound redirects and response size, and never proxy arbitrary private content.
- Production verification must use read-only or disposable authenticated sessions and must not alter real member recordings, libraries, or unrelated R2 data.

## Baseline evidence

- TPI-VIDEOS-008 production inventory: 200 discovered records (90 Odysee, 59 Dailymotion, 51 Internet Archive), each with a source URL and no published embed/direct media URL.
- TPI-VIDEOS-008 provider regression: 22 assertions passed.
- TPI-VIDEOS-008 anonymous production smoke: 10/10 passed.
- Current production link-preview failure was observed read-only on 2026-10-11 and is recorded above.

## Development rule

Implement additive, source-first changes in small verified batches. Preserve TPI-VIDEOS-008 routing, StudioFlow, authentication, `/live-video`, production data, and unrelated working-tree changes. Do not claim external-provider, physical-device, owner-authenticated, or long-duration behavior without corresponding evidence.

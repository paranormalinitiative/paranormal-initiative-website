# TPI-VIDEOS-001 Master Build Plan

This is a gated plan, not an authorization to start a large implementation.

## Phase 0 — Security and acceptance gates

- Fix and test server-side publication/access filtering for authored videos.
- Define reviewed embed allowlist and external-link policy.
- Define moderation/takedown ownership and audit records.
- Keep StudioFlow owner-only and `/live-video` Coming Soon.

## Phase 1 — Creator publishing foundation

- Add creator-channel identity and contributor dashboard boundaries.
- Add review/unlisted/archive states and publication audit events.
- Keep creator-owned storage as the default; support explicit destination references.
- Add channel pages and a safe authored watch flow.

## Phase 2 — Discovery and social

- Unify authored, live, and scraped discovery with visible source labels.
- Add creator follows/subscriptions only after notification policy is defined.
- Add playlists/history if accepted; retain current Watch Later compatibility.
- Consolidate moderation views without merging source ownership.

## Phase 3 — StudioFlow publication bridge

- Design explicit creator action after successful recording finalization.
- Link a public broadcast/archive to `tpi_videos` only after authorization.
- Add retry/recovery/takedown and no-silent-upload safeguards.
- Verify owner-only preview and ordinary-member/public access separately.

## Phase 4 — Mobile/accessibility/performance/cost

- Test phone/tablet layouts, keyboard flow, captions/transcripts, reduced motion, and player fallback.
- Measure external thumbnail/player cost, D1 query cost, and scraper subrequests.
- Add source freshness and failure states.

## Phase 5 — Release

- Run unit/API/browser/accessibility checks.
- Run authenticated owner, member, and anonymous production smoke.
- Commit, push, and deploy only the verified change set.
- Record exact commit/deployment/evidence links.

## Stop conditions

Stop and request owner direction for new infrastructure, destructive migrations, credential/OAuth changes, TPI-managed creator recording storage, public Creator Studio launch, or a provider integration without authoritative API/terms review.

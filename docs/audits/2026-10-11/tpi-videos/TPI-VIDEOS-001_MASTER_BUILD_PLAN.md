# TPI-VIDEOS-001 Master Build Plan

This is a gated plan, not an authorization to start a large implementation.

## TPI-VIDEOS-003 implementation status — 2026-10-11

The discovery/social batch is implemented in the canonical source as a bounded
increment: server-side catalog filters and pagination, authored/scraped source
labels, creator-channel follows, follower notifications, public-video Community
sharing, and validated one-level threaded comments. The required 003 audit
records are in this directory. Local migration-backed API verification and the
release checks are still pending; authenticated production behavior and external
provider playback remain unverified.

Detailed records:

- `TPI-VIDEOS-003_BASELINE.md`
- `TPI-VIDEOS-003_DISCOVERY.md`
- `TPI-VIDEOS-003_FOLLOWING.md`
- `TPI-VIDEOS-003_FEED_INTEGRATION.md`
- `TPI-VIDEOS-003_COMMENTS_AND_REACTIONS.md`
- `TPI-VIDEOS-003_TEST_MATRIX.md`
- `TPI-VIDEOS-003_RELEASE_REPORT.md`

## TPI-VIDEOS-002 implementation status — 2026-10-11

The Phase 0 security gates are now repaired in the canonical TPI source. The
creator publishing foundation is implemented as a draft-first, contributor-
owned workflow with an additive channel migration. Local migration-backed API
coverage is green at 171/171 assertions. The release report and production
verification remain the authoritative records for deployment status.

Detailed records:

- `TPI-VIDEOS-002_SECURITY_REPAIRS.md`
- `TPI-VIDEOS-002_CREATOR_PUBLISHING.md`
- `TPI-VIDEOS-002_CREATOR_CHANNELS.md`
- `TPI-VIDEOS-002_TEST_MATRIX.md`
- `TPI-VIDEOS-002_RELEASE_REPORT.md`

StudioFlow is unchanged. The StudioFlow publication bridge, richer discovery
social features, physical-device checks, and authenticated production owner
acceptance remain future or explicitly unverified work.

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

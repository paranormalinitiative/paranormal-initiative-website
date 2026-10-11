# TPI Permanent QA Master Plan

Status: active baseline established 2026-10-11

TPI-QA-001 defines the repeatable quality boundary for the TPI social network, the separately maintained StudioFlow workspace, GitHub release changes, and Cloudflare production verification. The system orchestrates existing checks, records evidence, and keeps unperformed provider, device, and long-duration tests explicitly open.

## Operating order

1. Inspect the change and select affected checks using `QA_CHANGE_IMPACT_MAP.md`.
2. Run the local deterministic regression and the relevant focused checks.
3. Exercise actual media only in isolated local environments; connection-only evidence is not a media pass.
4. Repair confirmed defects with the smallest safe change and rerun the affected check.
5. Run the production build and release checklist.
6. Commit and push the scoped source, test, and documentation changes.
7. Deploy only when runtime assets changed and the release gate passes.
8. Run read-only production smoke checks and record the deployment evidence.

Tests and documentation may be committed and pushed without a Cloudflare deployment when no production runtime asset changed.

## Historical QA sequence: TPI-ROADMAP-002

This section preserves the earlier QA operating sequence and is not the current
owner-locked implementation order. The current order is recorded in
[`MASTER_BUILD_PLAN.md`](../../MASTER_BUILD_PLAN.md) and
[`TPI-DOCS-001_MASTER_STATUS.md`](../planning/TPI-DOCS-001_MASTER_STATUS.md):
TPI-MEDIA-001, TPI-VIDEOS-010, TPI-VIDEOS-010B, TPI-SOCIAL-003, TPI-ADMIN-001,
TPI-FINAL-001, TPI-FINAL-002, and TPI-FINAL-003. Do not start the older
StudioFlow-019/020 sequence from this historical section.

The current phase gate is explicit:

1. **Phase 1A — Creator Studio:** complete `TPI-STUDIOFLOW-019`, including
   meaningful functional/media/cross-feature testing and verified repairs.
2. **Phase 1B — Comparative audit:** after 019 and owner review, execute the
   registered `TPI-STUDIOFLOW-020` StreamYard comparison. Do not implement
   findings automatically.
3. **Phase 1C — Owner review:** obtain separate approval for high-value
   Creator Studio improvements before changing runtime code.
4. **Phase 2 — Social Network:** only after Phase 1C, audit the existing TPI
   social platform with isolated synthetic members and simultaneous sessions.
   Include Feed visibility, Messenger delivery and conversation-level
   attachment authorization, notifications, media, permissions, responsive
   behavior, and every Settings Center page.
5. **Phase 3 — Future features:** only after Phases 1A–2, resume approved
   work such as `TPI-ADMIN-001` and Creator Partnership enhancements.

The owner-reported **Settings → Personalization → Highlights** issue is a
Phase 2 high-priority defect investigation. It is not marked fixed by this
roadmap update. Any repair must be reproduced, regression-tested, and verified
for save/reset/persistence and light/dark theme behavior before release.

This roadmap record is documentation-only; it does not authorize runtime
feature work, database changes, R2 changes, authentication changes, or a
deployment.

The TPI-VIDEOS-010 implementation batch and TPI-VIDEOS-010B documentation
acceptance batch are now recorded complete. The media platform remains READY
WITH LIMITATIONS; physical-device, long-duration, fresh export-file,
authenticated publication, authorized playback, provider, and Feed end-to-end
items remain in the 010B acceptance register. The API runner hang is an
explicit follow-up for TPI-FINAL-001.

## Boundaries

- TPI live source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`.
- StudioFlow canonical source: `/Users/toddknipple/Documents/StudioFlow/web`.
- StudioFlow documentation: `/Users/toddknipple/Documents/StudioFlow`.
- Synthetic identities and local D1 state are disposable and local-only.
- Production data, recordings, R2 objects, credentials, and unrelated dirty files are preserved.
- StudioFlow has no configured Git remote; its local checks and documentation must not invent a push destination.

## Current baseline

On 2026-10-11 the earlier TPI multi-user local API baseline completed **152 PASS / 0 FAIL** with external scraper refreshes disabled by default. Later TPI-MEDIA-001 evidence records the current isolated API result as **213/213**; both results remain attributable to their named test runs. StudioFlow `npm run build`, `npm run check:room`, and `npm run check:rtmp` also passed locally. The anonymous production boundary smoke completed **10/10** read-only checks, including `/live-video` Coming Soon and Creator Studio/API denial boundaries. Physical devices, public/provider broadcast, TURN/WebRTC guest media, and multi-hour reliability remain unverified unless separately recorded in the matrix.

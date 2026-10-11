# QA Release Checklist

## Before commit

- [ ] Inspect `git status`; preserve unrelated dirty files.
- [ ] Select tests from `QA_CHANGE_IMPACT_MAP.md`.
- [ ] Run `node scripts/qa/run-qa.mjs --e2e --studioflow-root /Users/toddknipple/Documents/StudioFlow/web` when both workspaces are in scope.
- [ ] Run any actual media test required by the changed pipeline; do not convert a connection pass into a media pass.
- [x] For TPI-STUDIOFLOW-019A, run an actual local prerecorded media/RTMP capture and record the silent-audio defect without deploying the failed repair.
- [ ] Review secrets, stream keys, R2 objects, recordings, and database writes.
- [ ] Run the production build and inspect warnings/failures.

## Commit and push

- [ ] Stage only intended files.
- [ ] Record the commit hash.
- [ ] Push only to the configured repository remote.
- [ ] StudioFlow currently has no configured remote; do not invent one.

## Deployment decision

- [ ] If only tests/docs/CI changed: commit and push, but do not deploy unnecessarily.
- [ ] If runtime assets changed: deploy through the established Cloudflare workflow only after all gates pass.
- [ ] Preserve owner-only Creator Studio access and public `/live-video` Coming Soon.

## After deployment

- [ ] Record the Cloudflare deployment/version ID.
- [ ] Run `node scripts/qa/production-smoke.mjs --base <production-url>`.
- [ ] Verify owner/authenticated workflows separately from anonymous boundaries.
- [ ] Update `QA_DASHBOARD.md`, the defect register, and the applicable Production Bible.

## Roadmap phase gate

- [ ] Do not begin major future features while `TPI-STUDIOFLOW-019` has
  meaningful feasible tests or verified repairs remaining.
- [ ] Before Phase 2 completion, verify isolated multi-member Feed visibility,
  Messenger delivery and attachment authorization, notifications, media,
  permissions, responsive behavior, and every Settings Center page.
- [ ] Reproduce and repair the owner-reported Personalization → Highlights
  issue, then add permanent save/reset/persistence/theme regression coverage.
- [ ] Do not begin `TPI-ADMIN-001` implementation until Phases 1 and 2 are
  complete and documented.
- [ ] Do not execute `TPI-STUDIOFLOW-020` until 019 is complete and the owner
  has reviewed its completion report.
- [ ] Present comparative findings to the owner before implementing any
  StreamYard-referenced improvement.

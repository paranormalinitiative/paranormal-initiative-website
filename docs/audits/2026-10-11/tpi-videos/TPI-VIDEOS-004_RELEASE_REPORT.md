# TPI-VIDEOS-004 Release Report

Status: IMPLEMENTED, VERIFIED LOCALLY, COMMITTED, PUSHED, MIGRATED, AND DEPLOYED.

Implemented batch:

- Additive 0044 broadcast/listing schema.
- Stable creator-owned broadcast identity.
- Draft-first scheduling and explicit publication.
- Upcoming/live/ended/replay discovery boundary.
- Validated playback and replay references with explicit verification state.
- Lifecycle synchronization with existing StudioFlow registration/start/stop
  paths when a matching TPI listing exists.
- Existing live comments/reactions reused.

Verification: fresh local D1 migration replay PASS; full isolated API E2E PASS,
199/199 checks, 0 failures. One schema mismatch was repaired and the suite was
rerun successfully. `node --check`, `git diff --check`, and the Cloudflare
dry-run build passed.

Release evidence:

- GitHub commit: `6d7e96f` pushed to `origin/main`.
- Production D1 migration 0044: PASS; bookmark recorded in the database-change
  report.
- Cloudflare Version ID: `2c2fe8d3-3389-48a4-8b12-f6026d02f1ef`.
- Production read-only boundary smoke: PASS; see the production-verification
  report.

Not complete: StudioFlow-to-TPI browser sync, actual media/provider delivery,
external playback decode, owner-authenticated production mutation, physical
device behavior, and automatic broadcast notifications.

The release does not claim StudioFlow browser-to-TPI sync, actual provider
media delivery, external playback decode, authenticated owner production
mutation, physical-device behavior, or automatic broadcast notifications.

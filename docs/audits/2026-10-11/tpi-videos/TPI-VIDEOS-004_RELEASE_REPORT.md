# TPI-VIDEOS-004 Release Report

Status: local implementation verified; release pending.

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
rerun successfully.

Not complete: StudioFlow-to-TPI browser sync, actual media/provider delivery,
external playback decode, owner-authenticated production mutation, physical
device behavior, and automatic broadcast notifications.

No deployment, GitHub push, or production D1 migration is claimed until the
release step is completed and live boundaries are rechecked.

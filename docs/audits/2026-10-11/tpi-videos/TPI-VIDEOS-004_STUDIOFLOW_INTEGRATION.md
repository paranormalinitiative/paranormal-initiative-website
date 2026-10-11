# TPI-VIDEOS-004 StudioFlow Integration

Status: PARTIAL — server-side integration boundary implemented; StudioFlow
source and generated bundle were not changed in this batch.

Implemented in TPI:

- Stable creator-owned broadcast identity keyed by `broadcastId`.
- Explicit authenticated listing creation and publication endpoints.
- Metadata, schedule, visibility, playback-reference, lifecycle, and replay
  synchronization fields.
- Existing `/api/studio/live-broadcasts` registration/start/stop paths now
  synchronize a matching published TPI listing when one exists.

Not implemented or verified:

- StudioFlow does not yet call `/api/tpi-broadcasts` during its local create or
  publish workflow.
- Browser-local StudioFlow schedules are not server-visible by inference.
- No recording blob is uploaded, copied, or stored by TPI.
- No automatic provider broadcast connection is represented as operational.

This is intentionally a narrow integration boundary, not a StudioFlow rebuild.

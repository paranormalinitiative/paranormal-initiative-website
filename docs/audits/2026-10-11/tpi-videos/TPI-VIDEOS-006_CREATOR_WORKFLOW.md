# TPI-VIDEOS-006 Creator Workflow

## Verified locally

The StudioFlow source creates device-local broadcast schedules and exposes
explicit controls for `Sync to TPI`, `Sync changes`, `Publish to TPI Videos`,
`Unpublish`, `Cancel TPI broadcast`, and `Refresh`. The TPI API suite verified
draft creation, stable identity, schedule update, explicit publication,
unpublication, cancellation, refresh, ownership, and stale-revision conflict
responses.

The server does not treat a client-supplied owner ID as authoritative. Mutating
routes use the existing session and contributor authorization, then check the
stored broadcast owner or administrator role.

## Not verified in this run

An authenticated browser session was not available for a complete human-like
creator workflow. Consequently, browser clicks, signed-in route rendering,
offline retry after a real network interruption, and owner notification display
remain **NOT VERIFIED**, not failed.

The intended workflow remains draft-first and explicit-publication. No local
recording is automatically uploaded or published.

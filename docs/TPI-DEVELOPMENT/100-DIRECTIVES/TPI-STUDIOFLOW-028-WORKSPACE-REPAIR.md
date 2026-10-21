# TPI-STUDIOFLOW-028 — Crossroads Workspace Repair and Persistence Verification

Status: **CONDITIONALLY COMPLETE**

This directive authorizes one narrowly scoped, version-checked repair of
`state_json.broadcast.title` for workspace
`43b20614-69da-4d82-af9d-063cace4b6cc`. The repair is gated on the running
local Worker serving the TPI-STUDIOFLOW-027 title-integrity correction.

## Runtime resolution

The source file `studio/workspace-bridge.js` contains the required
`normalizeBroadcastTitle` validation, identity checks, conflict rejection,
and versioned save logic. Its SHA-256 is `7754186c6ac12cbc6450cf00ec4d94c46ab97a5f97d19567ba0936085ec6fddf`.

The local Worker was rebuilt through `scripts/stage-local-assets.mjs` and
restarted through the owner-controlled `com.tpi.local-development`
LaunchAgent. The staged bridge now matches the source byte-for-byte:
`7754186c6ac12cbc6450cf00ec4d94c46ab97a5f97d19567ba0936085ec6fddf`.
The runtime log records HTTP 200 for `/studio/workspace-bridge.js` and two
successful supported workspace PATCH responses.

The `com.tpi.local-development` LaunchAgent is owned by this repository and
is configured for the local-only Worker. Port 8787 was restarted; the room
server on 8788 and guest gateway on 8789 remained running with their existing
PIDs/configuration.

## Repair result

After refresh, Opera loaded Crossroads and the corrected bridge's normal
restore/autosave path issued supported, version-checked PATCH requests. A
fresh D1 read reports workspace version `154`, title
`Crossroads of the Unknown`, broadcast ID
`studio-0ec3848f-5500-462c-a1da-f711d3148d49`, and nested broadcast title
`Crossroads of the Unknown`.

The authorized change is complete. The pre-write snapshot could not be
created before the refresh because the corrected application immediately
performed its supported save. A complete post-repair, non-media recovery
snapshot was created and read-back/hash verified. This timing limitation is
why the directive remains conditionally complete rather than unqualified.

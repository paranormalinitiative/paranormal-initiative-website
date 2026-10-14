# TPI-DEV-022 StudioFlow Verification

## Status

`PARTIALLY COMPLETE` / `BLOCKED BY EXTERNAL DEPENDENCY`

## Verified boundaries

- Ordinary authenticated members are denied by `requireStudioAccess` with HTTP 403 when they lack an active Creator Studio entitlement.
- Entitlement lookup is fail-closed when the additive entitlement schema is unavailable.
- Existing room, guest-token, close, and livestream routes remain protected by the same entitlement gate.
- The generated StudioFlow bundle truthfully describes browser-managed recording storage and recovery through the Browser Library.

## Actual persistence boundary

The repository contains `studio_rooms` persistence for room metadata and relay state. The current generated StudioFlow application does not expose a TPI API or D1 table for creator projects/workspaces. Recording-library state is browser-local; the bundle explicitly says that connected cloud-provider quota is unavailable until an authorized provider API is supplied.

Therefore project CRUD, server persistence, ownership transfer, and persisted project-level revocation cannot be claimed complete from this repository state. The canonical StudioFlow source is maintained outside this website checkout; modifying the generated bundle here would create a competing source of truth.

## Not tested

- Positive entitled creator room creation, RealtimeKit token issuance, livestream start/stop, and cloud recording were not invoked because they depend on external service credentials and could create external sessions.
- Browser recording/playback and mobile visual acceptance were not tested.
- No entitlement was granted, revoked, or modified.

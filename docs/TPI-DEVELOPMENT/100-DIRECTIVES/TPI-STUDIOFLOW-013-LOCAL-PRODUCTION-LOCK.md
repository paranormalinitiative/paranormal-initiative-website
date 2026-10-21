# TPI-STUDIOFLOW-013 — Local Production Lock and Concurrent Session Validation

Date: 2026-10-17  
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`  
Branch: `codex/tpi-development`

## Authorized scope

This directive authorizes local-only validation of the existing StudioFlow
production-lock implementation and the additive local D1 migration
`0053_studioflow_creator_production_lock.sql`.

Authorized operations are limited to:

- one backup of the isolated local D1;
- applying migration 0053 to the local D1 only;
- one controlled restart of the existing TPI Worker on port 8787;
- synthetic local Studio/workspace and production-lock writes;
- local browser and loopback API verification.

Production, hosted development, remote D1/R2, deployment, commits, pushes,
real recordings, real livestreams, RealtimeKit rooms, and external streaming
providers are outside scope and prohibited.

## Safety requirements

- Preserve the existing dirty worktree and unrelated changes.
- Do not reset, clean, stash, switch branches, or overwrite unrelated work.
- Do not modify the authoritative research data or historical research runs.
- Do not restart the independent StudioFlow room server on port 8788.
- Do not reset local D1/R2 or delete existing fixtures.
- Synthetic test rows must be clearly identified and removed or isolated after
  validation.

## Validation targets

The local validation must establish:

1. migration 0053 is additive and integrity-safe;
2. existing Studio configurations remain available;
3. schedules remain workspace-scoped and independent;
4. one creator cannot start production in two Studios concurrently;
5. matching-session heartbeat/stop and release behavior work;
6. Studio switching and authorization remain owner-scoped;
7. the local Worker and room server remain independently healthy; and
8. no production or external provider operation occurs.

The final result belongs in
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-013-VALIDATION-RESULT.md`.

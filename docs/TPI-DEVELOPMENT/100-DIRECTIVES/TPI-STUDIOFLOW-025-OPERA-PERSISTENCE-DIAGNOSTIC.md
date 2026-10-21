# TPI-STUDIOFLOW-025 — Opera Persistence Diagnostic

## Scope

Read-only investigation of Opera settings, local development origin, cache
behavior, browser storage architecture, and the Crossroads workspace mismatch.
No browser setting, cache, storage, D1 record, source file, or service was
changed by this diagnostic.

## Protected record

- Studio: Crossroads of the Unknown
- Workspace ID: `43b20614-69da-4d82-af9d-063cace4b6cc`
- Development origin: `http://127.0.0.1:8787`

## Investigation boundaries

Opera was not refreshed. The existing StudioFlow tab was only selected after
visiting Opera's internal settings pages. No storage, cookies, permissions,
Studios, media, or services were modified.

## Questions to answer

The investigation distinguishes browser configuration, cache, localStorage,
IndexedDB, origin, and application reconciliation rather than assuming Opera
is responsible for the save errors.

## Evidence sources

- Opera Air settings and existing StudioFlow tab, inspected through the
  available accessibility surface.
- `studio/index.html`, `studio/workspace-bridge.js`, and the bundled StudioFlow
  storage code.
- Read-only local D1 query against the local development SQLite state.
- Existing non-mutating TPI-017, TPI-023, and TPI-024 tests.

## Required outcome

Classify the root cause and recommend the smallest safe correction. Any repair
that changes owner browser state or D1 must remain a separate authorization.

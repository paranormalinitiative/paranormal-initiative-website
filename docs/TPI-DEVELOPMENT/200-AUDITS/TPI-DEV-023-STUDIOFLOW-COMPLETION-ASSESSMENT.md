# TPI-DEV-023 — StudioFlow Completion Assessment

> Historical snapshot: this assessment describes the state before DEV-024
> workspace persistence and DEV-025 creator acceptance. See the TPI-DEV-026
> current development status for the reconciled state. Original findings and
> test results remain unchanged below.

Date: 2026-10-14

## Evidence reviewed

- Existing `studio/` generated application assets.
- `functions/api/[[path]].js` StudioFlow routes.
- Existing `studio_rooms` and room-relay migrations.
- TPI-DEV-022 StudioFlow verification and gap records.
- Existing repository StudioFlow readiness and audit documentation.

## Current implementation boundary

The website checkout contains protected StudioFlow room creation, guest-token,
room-close, livestream start/stop, room relay, and entitlement gates. The
generated StudioFlow bundle explicitly describes a browser-local recording
library/storage boundary.

The checkout does not contain a `studio_projects` table, project/workspace CRUD
API, cross-device project persistence, or project-level ownership/revocation
workflow. The canonical StudioFlow source is maintained outside this website
checkout; changing the generated bundle here would create a competing source
of truth.

## Assessment

### Current live-room plus browser-library model

`CONDITIONALLY COMPLETE FOR THE CURRENT REPOSITORY BOUNDARY`

The current model is internally consistent for live rooms plus local/browser
recording storage, subject to positive RealtimeKit session validation and owner
visual acceptance.

### Persistent creator project/workspace model

`NOT COMPLETE`

The required persistence layer does not exist in this repository. It should be
designed and implemented in a separate directive against the canonical
StudioFlow source, with an owner-approved schema, storage model, ownership
rules, and migration plan.

## Decision

No StudioFlow project architecture was added under TPI-DEV-023. This preserves
the existing boundary and avoids silently converting browser-local recording
state into a claimed server-backed product feature.

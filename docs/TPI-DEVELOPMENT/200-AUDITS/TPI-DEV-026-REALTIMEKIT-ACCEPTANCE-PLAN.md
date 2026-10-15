# TPI-DEV-026 — RealtimeKit Acceptance Plan

This is a plan only. DEV-026 did not create a room, start a livestream, contact
the provider, or use production credentials.

## Preconditions requiring owner approval

1. Confirm a development-only RealtimeKit credential and permitted account.
2. Confirm any provider cost, trial usage, or quota impact is acceptable.
3. Confirm one synthetic entitled creator and one synthetic non-entitled member.
4. Confirm an explicit maximum duration and cleanup deadline.
5. Confirm that no real audience, member account, or production content is used.

## Controlled acceptance sequence

1. Verify development Worker provenance and `TPI_DISABLE_OUTBOUND=1` is changed
   only within an explicitly approved test configuration.
2. Authenticate the synthetic entitled creator.
3. Create one development room through the existing protected route.
4. Verify the room is owner-scoped and no provider token is exposed to the UI.
5. Join with the permitted synthetic participant.
6. Exercise participant controls, close behavior, and expected error handling.
7. If separately authorized, start one short synthetic livestream.
8. Verify stop/close cleanup and persisted local metadata.
9. Confirm no production bindings, real accounts, or published content were used.
10. Record provider usage and clean up the test room according to provider rules.

## Current readiness

The local route and authorization protections are documented and prior negative
tests passed. Positive external provider behavior remains `IMPLEMENTED, EXTERNAL
ACCEPTANCE PENDING` until the owner authorizes the bounded test above.

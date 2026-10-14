# TPI-DEV-023 — Events Runtime Verification

Date: 2026-10-14

## Deployment

- Worker: `theparanormalinitiative-dev`
- URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev`
- D1: `tpi_contributor_portal_dev`
- R2: `tpi-contributor-media-dev`
- Source commit: `7d721b5fe2e3aeb65ddc59f7e50a7038613d4410`
- Current Version ID: `a34d299b-a98e-425c-bf22-cf6a618a2d19`
- Provenance endpoint matched the branch, Worker, and source commit.

## Focused live result

`scripts/qa/tpi-dev-022-media-search-studio-events.mjs` passed **37/37**.

Verified behaviors:

- anonymous and ordinary-member admin event access is denied;
- ordinary members cannot create, update, or cancel events;
- admin creation persists address, attendee limit, price, and server-owned
  `source = admin` metadata;
- invalid end-date ordering and unsafe URL schemes are rejected with HTTP 400;
- admin detail and update read back persisted values;
- approved events are publicly readable;
- cancellation is soft, auditable, and hides the event from public detail;
- create, update, and cancel actions are present in the admin audit history;
- private media ownership checks remain intact;
- ordinary-member StudioFlow access remains fail-closed;
- search source contracts remain present.

The QA fixture was additive in development only. No production record was
created or modified.

## Related verification

- TPI-DEV-014 source checks: **9/9**.
- TPI-DEV-014 authenticated suite: **57/57**.
- TPI-DEV-014 gate-off allocation/status requests: **HTTP 423**, state remained
  `allocated = 50`, `remaining = 0`.
- TPI-DEV-020 acceptance: **39/39** after the repeat-safe QA expectation was
  made explicit. The first post-deployment run observed two HTTP 409 responses
  for already-persisted team-claim fixtures; subsequent history assertions
  passed for both states.
- TPI-DEV-021 integration: **116/116**.
- TPI-DEV-022 offline contract checks: **15/15**.

## Not tested here

- Browser visual acceptance by the owner.
- Positive StudioFlow room creation or external RealtimeKit session flow.
- Production runtime or any production database/storage path.

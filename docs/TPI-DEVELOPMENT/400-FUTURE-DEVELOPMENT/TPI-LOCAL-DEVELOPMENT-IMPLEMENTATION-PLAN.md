# TPI Local Development Implementation Plan

**Relationship to TPI-OPS-006:** Future implementation plan only. No step in
this document was executed by OPS-006.

## Phase 0 — approval and isolation

Before implementation, confirm the owner wants the local environment built
under the documented boundaries. Create no branch or remote resource as part
of this assessment. Preserve the existing dirty worktree and keep all local
state under ignored paths.

## Phase 1 — local configuration

Add a separate local Wrangler configuration with:

- local Worker identity;
- loopback `127.0.0.1:8787`;
- `TPI_ENV=local`;
- local D1/R2 bindings only;
- no cron;
- no remote bindings;
- local persistence path;
- explicit local banner;
- fail-closed external target policy.

Add a launcher that performs configuration checks before starting. It should
refuse to run if a production/hosted-development config, remote binding, or
unsafe target is selected.

## Phase 2 — local schema and fixtures

Produce a reviewed schema manifest from the current application requirements.
Resolve duplicate/out-of-order historical migration names in the local
bootstrap without rewriting historical migration files. Add a local-only
fixture package covering authentication roles, settings/personalization,
community, messenger, media references, admin permissions, creator
entitlements, StudioFlow workspaces, and ownership boundaries.

The fixture command must be explicitly local, idempotent, and resettable. It
must reject remote execution and must not reuse production or hosted-development
credentials/data.

## Phase 3 — R2 and media fixtures

Use the local R2 simulation with a dedicated persistence directory. Generate
synthetic image/audio/video placeholders and validate the API’s authorization,
metadata, retrieval, deletion, and error behavior. Do not copy real objects.

## Phase 4 — authentication protocol

Choose and document local HTTPS or a local-only cookie policy. If a cookie
policy change is required, gate it strictly to local configuration and add a
regression proving hosted development and production remain Secure-cookie
paths. Then run the synthetic role/ownership matrix through the Worker.

## Phase 5 — outbound and scheduled-work guard

Centralize local outbound policy. Replace external service calls with explicit
stubs in local mode, block production and hosted-development hosts, disable
cron/manual refresh, and add tests for Resend, RealtimeKit, scrapers,
link-preview, provider URLs, and private-network targets.

## Phase 6 — StudioFlow integration

Keep the existing room server as an optional loopback process. Add a safe local
launcher integration, health checks, deterministic shutdown, and tests that
distinguish ephemeral room state from persistent local D1 workspace state.
Verify workspace save/restore/archive, recording recovery boundaries, media
ownership, revoked creator denial, and cross-account isolation.

## Phase 7 — agent access

Verify Codex, FreeBuff, and OpenCode execution topology separately. Prefer a
same-machine loopback browser. If a separate agent cannot reach loopback, use
offline/test-runner evidence or an explicitly approved private development
network later; do not create a public tunnel or LAN-default server as a
workaround.

## Phase 8 — test and acceptance gates

Run, in order:

1. static syntax and configuration checks;
2. local D1 schema/fixture bootstrap checks;
3. local R2 persistence checks;
4. outbound-denial and no-cron checks;
5. anonymous/public route checks;
6. synthetic login and role checks;
7. cross-account and private-media checks;
8. Administration Center and StudioFlow integration checks;
9. browser desktop/tablet/mobile checks where the local browser can reach the
   loopback server;
10. reset/rebuild and restart checks.

Acceptance must report `PASSED`, `FAILED`, `BLOCKED`, and `NOT TESTED` per gate.
The local environment is not operational if any critical isolation or
authorization gate is unverified.

## Phase 9 — documentation and maintenance

Document the launcher, ports, fixture credentials policy, reset procedure,
state paths, supported browser/agent topology, and troubleshooting. Add a
local-development regression to the existing QA entry point without changing
remote deployment behavior.

## Explicit non-goals

- No production or hosted-development data copy.
- No remote D1/R2 binding for routine local work.
- No deployment or public tunnel.
- No production/authentication weakening.
- No automatic media upload or deletion.
- No external RealtimeKit room or livestream.
- No replacement Administration Center or StudioFlow architecture.


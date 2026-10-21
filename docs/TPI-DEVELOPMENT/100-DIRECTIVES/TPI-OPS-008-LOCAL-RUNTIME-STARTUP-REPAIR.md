# TPI-OPS-008 — Local Runtime Startup Repair

**Status:** Completed with verified localhost operation.

## Objective

Repair the OPS-007 local Wrangler startup failure without changing production,
hosted development, Cloudflare routes, remote D1/R2, or the StudioFlow room
server.

## Authorized boundaries

- Canonical repository only.
- `wrangler.local.toml` only for local runtime changes.
- Loopback only: `127.0.0.1:8787`.
- Local D1/R2 state under `.local-dev/state`.
- No remote mode, deployment, public tunnel, public Worker traffic, or account
  access.
- Existing `127.0.0.1:8788` StudioFlow room server preserved.

## Repair scope

The repair was limited to:

1. Diagnosing Wrangler/esbuild and Miniflare startup behavior.
2. Selecting a secret-free local env file so `.dev.vars` is not loaded.
3. Staging only deployable static assets for local Wrangler asset handling.
4. Setting the local-only compatibility date to the newest date supported by
   the installed local workerd binary.
5. Verifying the actual TPI Worker over localhost.

Production and hosted-development Wrangler configurations were not modified.


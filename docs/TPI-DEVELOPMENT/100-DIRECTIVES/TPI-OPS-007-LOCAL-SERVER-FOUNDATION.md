# TPI-OPS-007 — Local Development Server Foundation

**Status:** Authorized implementation; foundation partially completed with a
local Wrangler/esbuild runtime blocker.

## Scope

OPS-007 establishes an isolated local foundation using the actual TPI Worker
source, assets, and routing architecture. It does not attempt full application
parity, authenticated acceptance, StudioFlow recording verification, remote
development, deployment, or production integration.

## Safety boundary

The implementation is local-only. It must use:

- `wrangler.local.toml`, never `wrangler.toml` or `wrangler.dev.toml`;
- `127.0.0.1:8787` for the Worker;
- local D1 and R2 simulations;
- `.local-dev/state` for local persistence;
- no cron, remote binding, Cloudflare route, tunnel, or deployment.

The existing StudioFlow room server at `127.0.0.1:8788` is outside this
directive and was not stopped, restarted, reconfigured, or replaced.

## Authorized implementation

The following local foundation components were added:

- `wrangler.local.toml` — explicit local-only Worker configuration;
- `scripts/local-dev.mjs` — guarded `wrangler dev --local` launcher;
- `lib/local-request-guard.js` — local server-side outbound target policy;
- local-only browser wrappers for fetch, XHR, WebSocket, EventSource, and
  `sendBeacon` injected by `worker.js`;
- local-only `TPI — LOCAL DEVELOPMENT` indicator;
- local scraper/link-preview/RealtimeKit outbound blocking;
- `.local-dev/` ignore rule;
- `scripts/qa/tpi-ops-007-local-foundation.mjs` focused offline regression;
- integration of that regression into `scripts/qa/run-qa.mjs`.

Production and hosted-development configuration files were not changed.

## Local data foundation

The local D1 binding is named `tpi-local-foundation`; it is not either hosted
TPI database. The initial local schema was applied from
`migrations/0001_contributor_portal.sql` to the ignored `.local-dev/state`
directory. No production or hosted-development data, credentials, or accounts
were copied.

The local R2 binding is named `tpi-local-media`; its local state directory was
created under `.local-dev/state/v3/r2`. No objects were uploaded.

## Explicit limitations

The Worker reached Wrangler local initialization and displayed the expected
local D1/R2 bindings, but the current execution environment raises
`spawn EBADF` from Wrangler’s esbuild service before the Worker binds to
`127.0.0.1:8787`. The same failure occurred with Wrangler’s `--no-bundle`
fallback. Consequently, HTTP homepage, static asset, routing, R2 request,
environment-banner, and shutdown checks remain blocked rather than claimed as
passed.

The next implementation step should resolve the local Wrangler/esbuild runtime
compatibility in the execution environment, then rerun bounded localhost-only
verification. It must not replace the Worker with an imitation server.


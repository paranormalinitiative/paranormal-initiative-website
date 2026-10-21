# TPI-OPS-013 — Shared Local Development Environment

## Scope

This directive makes the existing TPI local Worker practical for daily local
development. It does not create a second Worker architecture, change the
application's hosted configuration, deploy anything, or modify remote D1/R2.

## Canonical local runtime

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Worker: `http://127.0.0.1:8787/`
- Human-friendly equivalent: `http://localhost:8787/`
- Preferred daily browser address: `http://127.0.0.1:8787/`
- Wrangler config: `wrangler.local.toml`
- Secret-free environment file: `scripts/local-dev.env`
- Local D1/R2 state: `.local-dev/state`
- Preserved StudioFlow room service: `127.0.0.1:8788`

The Worker is loopback-only. Local D1 and R2 simulations are selected by the
local config, and `TPI_DISABLE_OUTBOUND=1` remains enabled. Hosted development
and production resources are rejected by the launcher preflight.

## Daily commands

From the repository root:

```text
npm run dev:local
npm run dev:local:status
npm run dev:local:stop
```

Equivalent direct commands are:

```text
node scripts/local-dev.mjs
node scripts/local-dev.mjs status
node scripts/local-dev.mjs stop
```

`start` stages sanitized assets and launches the existing Wrangler local
runtime. `status` reports Worker state, loopback address, D1/R2 persistence,
StudioFlow room-server state, branch, and HEAD without credentials or session
tokens. `stop` signals only a launcher-owned Wrangler process after verifying
its recorded PID, command identity, config path, and loopback port.

## Duplicate and shutdown protection

The launcher records non-secret ownership metadata under the ignored
`.local-dev/local-worker.json`. A second start returns the existing status when
the recorded launcher owns the Worker. If 8787 is occupied without verified
TPI ownership, the launcher fails closed and does not kill or replace the
occupant. Stale metadata is removed only when no process or listener remains.

Shutdown does not target port 8788 and does not use a broad process-name kill.
The separate StudioFlow room service remains an independent dependency.

## Browser and agent safety

The preferred browser address is `127.0.0.1:8787`; localhost also reached the
same local Worker during anonymous browser verification. Cookie sharing between
the two hostnames is not assumed. The system hosts file, system certificates,
LAN binding, and public tunnels were not changed.

The bounded authenticated browser harness uses a fresh Playwright context,
reads the existing ignored mode-0600 synthetic credential fixture locally, and
aborts all non-loopback requests before dispatch. It does not use real member
accounts, expose a credential endpoint, or print credentials.

Codex repository access, local Node execution, loopback Worker access, and the
local browser were verified. FreeBuff and OpenCode were visible as installed
desktop applications but were not connected to an agent session in this run;
their repository, localhost, browser, log, and public-routing reachability is
therefore **NOT VERIFIED**. No agent-wide permissions or shared credential
stores were changed.

## Request observability

Local Worker logs remain at the ignored `.local-dev/wrangler.log` path. The
browser harness records only sanitized blocked destinations and error classes;
it does not retain credentials. In the bounded browser run, Google Fonts was
blocked before dispatch because it is external; no external request was sent.
The existing local request guard and outbound protections remain active.

## Data and functionality boundaries

The local runtime uses only local simulated D1/R2 state and existing fictional
fixtures. It does not copy real member data, recordings, credentials, or hosted
media. Existing application routes and StudioFlow behavior were preserved.

Authenticated local browser acceptance covered login, Member Home, Messenger,
Notifications, Profile, logout, and session clearing. WebSocket transport,
actual video playback, recording recovery after browser restart, RealtimeKit,
and livestream behavior remain outside this directive and were not claimed.

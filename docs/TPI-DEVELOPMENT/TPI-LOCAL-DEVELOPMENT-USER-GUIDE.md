# TPI Local Development User Guide

## Open the local site

The canonical local Worker is:

`http://127.0.0.1:8787/`

The Finder launcher is:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/TPI Local Development.command`

Double-clicking it starts the owner-managed service if needed, waits for the
local Worker, and opens the loopback site. Finder may briefly show a Terminal
window while it runs.

## Owner service controls

Run these from the canonical repository:

```sh
TPI_LOCAL_OWNER_CONTROL=1 npm run dev:local:service:install
TPI_LOCAL_OWNER_CONTROL=1 npm run dev:local:service:start
npm run dev:local:service:status
TPI_LOCAL_OWNER_CONTROL=1 npm run dev:local:service:restart
TPI_LOCAL_OWNER_CONTROL=1 npm run dev:local:service:stop
TPI_LOCAL_OWNER_CONTROL=1 npm run dev:local:service:uninstall
```

The explicit `TPI_LOCAL_OWNER_CONTROL=1` prefix is required for operations
that change service state. Status is read-only. The generic Worker command
`npm run dev:local:stop` refuses to stop a service-managed Worker unless the
same explicit owner control is supplied.

Stopping is intentional and persistent: launchd is unloaded and does not
immediately restart the Worker. Use the explicit start or restart command to
bring it back.

## What remains separate

StudioFlow's existing room server remains independently available at:

`http://127.0.0.1:8788/`

The TPI LaunchAgent does not start, stop, restart, or replace that server.

## Local-only safety

The service uses `wrangler.local.toml` and `scripts/local-dev.env`. It binds
only to loopback, uses isolated `.local-dev/state` D1/R2 simulations, and
blocks outbound services. It does not deploy, modify hosted development or
production, import data, publish profiles, or manage external accounts.

The service plist contains no credentials. Runtime logs are stored under:

`.local-dev/logs/`

The main service log is bounded and redacted. Do not add credentials, tokens,
or private payloads to local configuration or test output.

## If the Worker is unavailable

1. Run `npm run dev:local:service:status`.
2. Run `npm run dev:local:service:start` with the owner-control prefix.
3. Run `node scripts/local-dev-service.mjs wait` to confirm HTTP readiness.
4. Inspect `.local-dev/logs/local-development.log` if startup still fails.
5. Confirm that port 8788 remains a separate StudioFlow process.

Do not kill an ambiguous process or reuse the generic stop command against an
owner-managed service. Use the exact owner controls first.

## Browser-based development workflow

Firefox Developer Edition is the default browser for active local development,
owner review, and automated acceptance. Automated runs use a disposable profile
and must not close, clear, or repurpose the owner's open Firefox windows.
Chromium or another browser is used only for an explicit compatibility test.

The canonical site origin is `http://127.0.0.1:8787/`. StudioFlow's separate
local room server is `http://127.0.0.1:8788/`. Keep both addresses on the local
machine; do not substitute a public development or production origin for local
review.

For normal work, open the affected route in Firefox Developer Edition, inspect the rendered page,
console, and request activity, then run the smallest applicable local test.
The local Worker is launchd-owned and may already be serving a staged asset
copy. A source edit that affects served assets may require:

```sh
node scripts/stage-local-assets.mjs
```

When the authoritative StudioFlow source changes, verify the full source-to-
website reconciliation with:

```sh
node scripts/stage-studioflow-authoritative.mjs
```

This is verification-only unless `--apply` is supplied. It builds the separate
StudioFlow source twice, compares the generated artifacts, and confirms that
the integrated website entry point preserves the TPI bridge files and current
asset names. Do not treat a local build as production approval.

See `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` before applying, committing,
pushing, or deploying StudioFlow changes. The local site never auto-syncs to
the development Worker or production.

Do not restart or stop the owner-managed Worker as part of ordinary agent work.
Use the explicit owner-control commands above only when the owner has asked for
a service lifecycle change. Preserve the independent 8788 room server.

Authenticated checks use the fictional local synthetic roles
`local_admin`, `local_member`, and `local_contributor`. They exist only for
local testing. Do not expose their credentials in browser output, screenshots,
logs, reports, or commits. Verify authorization and cross-account isolation;
anonymous access must remain anonymous.

### Owner review handoff

The owner can review the current local build in Firefox Developer Edition by opening
`http://127.0.0.1:8787/` and navigating normally. This is a visual review of
the same local Worker, not a deployment or a second site. The owner should
report the route, browser, viewport, and observed issue in plain language;
the agent then reproduces the issue in Codex and records the focused result.

Automated verification uses a separate disposable Firefox Developer Edition
profile and does not close or reuse the owner's existing tabs.

## Retrieve the local administrator credentials

The existing local synthetic administrator username is `local_admin`. The
password remains in the existing Git-ignored credential store and is not
documented or printed by agent checks. To view it as the owner, open the Mac
Terminal interactively in the canonical repository and run:

```sh
zsh scripts/show-local-admin-credentials.sh
```

The same viewer is available as:

```sh
npm run local:credentials
```

The viewer requires an interactive terminal and verifies that the credential
store is mode `0600`. It displays the value only in that terminal, does not
copy it to the clipboard, does not write a log, and does not expose it over
HTTP. Use the credentials only against the local origin at
`http://127.0.0.1:8787/`. The viewer does not reset or modify the password.


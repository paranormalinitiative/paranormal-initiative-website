# TPI-DEV-017 — Authenticated Browser Access Audit

Status: **BLOCKED IN THIS EXECUTION ENVIRONMENT / RUNNER IMPLEMENTED**

## Credential bridge findings

The approved synthetic credential store exists at:

`/Users/toddknipple/.config/tpi/dev-014/credentials.json`

The file was readable by this execution environment and reported filesystem
mode `0600`. Only usernames, roles, and presence metadata were inspected; no
password was printed or written to the repository, logs, clipboard, or
screenshots.

The browser runner could not execute because the Playwright module is not
installed in this repository/runtime. Earlier shell live checks also failed to
resolve `theparanormalinitiative-dev.paranormalsomerset.workers.dev` with
`ENOTFOUND`. These are environment blockers, not authenticated application
passes or application failures.

## Repeatable local runner

Install Playwright outside the repository, if it is not already available:

```sh
mkdir -p /tmp/tpi-dev-017-browser
npm install --prefix /tmp/tpi-dev-017-browser playwright
```

Then run from the canonical repository:

```sh
TPI_DEV017_PLAYWRIGHT=/tmp/tpi-dev-017-browser/node_modules/playwright \
TPI_DEV017_HEADLESS=0 \
node scripts/e2e/tpi-dev-017-authenticated-browser.mjs
```

The runner reads the existing credential file directly in memory, uses actual
development login/session behavior, and emits only pass/fail metadata. It does
not save storage state, screenshots, passwords, or session tokens.

## Required acceptance matrix

The runner covers member, contributor, admin, owner, creator-without-entitlement,
and revoked-creator synthetic identities at 1280×800, 1440×900, 1920×1080,
375×812, 390×844, and 430×932. It checks member home, Administration Center,
Creator Studio, horizontal overflow, login identity, logout, and session
clearing. Positive privileged browser acceptance remains **NOT TESTED** until
the runner can reach the development Worker.

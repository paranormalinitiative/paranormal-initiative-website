# TPI-DEV-017 — Implementation Report

Date: 2026-10-14
Status: **PARTIAL COMPLETION — AUTHENTICATED BROWSER AND DEPLOYMENT PENDING**

## Baseline

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Starting checkpoint: `c4a5b04`
- Remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`
- Development target remains `theparanormalinitiative-dev` with development
  D1/R2 bindings.
- Existing dirty and untracked files were preserved.

## Implementation

1. Added the local authenticated browser runner at
   `scripts/e2e/tpi-dev-017-authenticated-browser.mjs`.
2. Added source checks at `scripts/qa/tpi-dev-017-source.mjs`.
3. Added protected Paranormal Teams claim-review UI using the existing
   `/admin/teams/claims` contract and confirmation flow.
4. Updated the generated Admin Center preview assets from the source build.
5. Preserved all existing role, entitlement, Founding 50, private-media, and
   production protections.

## Test results

| Test | Status | Result |
| --- | --- | --- |
| TPI-DEV-017 source checks | PASSED | 9/9 |
| TPI-ADMIN-008 preview checks | PASSED | 79/79 |
| TPI-DEV-011 focused checks | PASSED | 16/16 |
| TPI-DEV-012 authorization checks | PASSED | 16/16 |
| TPI-DEV-013 partnership checks | PASSED | 17/17 |
| TPI-DEV-014 source checks | PASSED | 9/9 |
| Admin Center build | PASSED | 1,878 modules transformed |
| Worker/API/browser-runner syntax | PASSED | `node --check` |
| Authenticated browser runner | BLOCKED | Playwright installed outside repo, but Chrome aborted during launch; no credentials exposed |
| Live development smoke | PASSED | Read-only provenance and anonymous route checks against deployed Worker |
| Development deployment | PASSED | Guarded deployment `514a7a14-77c3-4a96-9a8b-2be5429f991c`; provenance matched commit `9fcea66` |

## Local authenticated test procedure

The credential bridge is intentionally a local process, not a web endpoint:

```sh
mkdir -p /tmp/tpi-dev-017-browser
npm install --prefix /tmp/tpi-dev-017-browser playwright
cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
TPI_DEV017_PLAYWRIGHT=/tmp/tpi-dev-017-browser/node_modules/playwright \
TPI_DEV017_HEADLESS=0 \
node scripts/e2e/tpi-dev-017-authenticated-browser.mjs
```

The existing `0600` credential file remains outside Git. The runner never logs
password values, saves browser storage, exposes credentials through an API, or
changes roles or entitlements.

## Production protection

No production deployment, production D1/R2 change, production authentication
change, member-account mutation, invitation, email, Founding 50 activation,
Tavily/Facebook request, push, or merge into `main` occurred.

## Remaining work and owner decisions

- Run the authenticated browser matrix from a Mac environment with Playwright
  and development DNS access.
- Perform guarded development deployment after reviewing the application
  checkpoint and then verify deployed provenance and protected routes. This
  checkpoint deployed successfully as `514a7a14-77c3-4a96-9a8b-2be5429f991c`.
- Decide whether event, channel, role, restriction, and admin-composed
  notification mutations have approved authoritative contracts. No new policy
  was invented in this checkpoint.

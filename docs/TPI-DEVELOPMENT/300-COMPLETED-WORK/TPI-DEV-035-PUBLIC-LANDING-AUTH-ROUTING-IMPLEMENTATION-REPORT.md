# TPI-DEV-035 Implementation Report

Date: 2026-10-15
Branch: codex/tpi-development
Application source: d127bd3
Repository: /Users/toddknipple/Documents/GitHub/paranormal-initiative-website

## Status

IMPLEMENTED AND DEPLOYED WITH LIMITATIONS

The public landing page and shared navigation correction was implemented from
the existing TPI shell, verified in development, and promoted through the
guarded production deployment procedure. Authenticated production browser
acceptance remains NOT TESTED because no production member session was
available. The available broad authenticated browser runner was BLOCKED by
its safety guard because it logs into six synthetic privileged accounts and
creates development session records.

## Root cause

The browser-side header and member shell each accepted
localStorage.tpiEditorSession and localStorage.tpiEditorContributors after the
hosted /api/auth/me request returned no user or failed. That local preview
fallback could display a member greeting while the Worker correctly saw no
valid tpi_session cookie and served the public homepage. The mismatch was
stale client preview state, not a changed member-home route or cookie
path/domain corruption.

## Implementation

- includes.js now treats a successful /api/auth/me response as authoritative
  and only permits local preview fallback on local origins.
- member-shell.js applies the same fail-closed hosted-session rule in both
  quick detection and full shell identity resolution.
- Guest mode maps the existing shared sidebar's dual-mode links to public
  destinations (/, about.html, education-center.html, /news, /paratube, and
  the existing public pages). Member-only actions remain login-protected or
  role-gated.
- worker.js preserves authenticated root redirect to /member-home and returns
  anonymous root HTML with Cache-Control: private, no-store.
- index.html retains the existing hero, content, assets, and routes while
  adding clear public entry cards for ParaNews, ParaTube, Our Apps, and
  Contact & Links. “Join Free” is now “Join the Community.”
- member-sidebar.html and footer.html remain the canonical source files.
  Guarded deployment staging emits identical .txt aliases because this
  Cloudflare asset configuration returned 500 for the standalone clean URLs
  /member-sidebar and /footer. The browser includes the same markup; no
  alternate navigation design was created.

## Verification

### Source and regression checks — PASSED

- node --check worker.js
- node --check includes.js
- node --check member-shell.js
- node --check scripts/deploy-development.mjs
- node --check scripts/deploy-production-guarded.mjs
- git diff --check
- TPI-DEV-017 source checks: 9/9
- TPI-DEV-034 ParaNews/ParaTube checks: 16/16
- Existing DEV-030 source checks: 9/9

### Development runtime — PASSED

Development deployment:
20031a3d-1c35-4621-a1b4-b74842256a95

Read-only runtime checks confirmed:

- / returns HTTP 200 with Cache-Control: private, no-store.
- /member-sidebar.txt and /footer.txt return HTTP 200.
- /api/auth/me returns no authenticated user without a session.
- /news and /paratube remain reachable.
- The browser DOM contains the populated shared sidebar and footer.
- Guest Home resolves to /; guest ParaNews resolves to /news.
- Stale local preview identity did not produce a member greeting.
- The mobile shell rendered its existing bottom navigation and landing content.
- The browser-visible landing page showed the existing TPI visual system,
  hero, public calls to action, content cards, and footer.

The broad six-account authenticated browser runner was not executed because
its safety gate correctly rejected a test that would create multiple
development session records and access privileged routes. This is recorded as
BLOCKED, not passed.

### Production runtime — PASSED for non-authenticated checks

Production baseline before promotion:
80cc9aa2-c2a2-4fc8-99c7-989e523e4654

Production deployment:
adc6e8d7-1950-49a7-8127-54f0a2acd634

Deployment provenance:

- Worker: theparanormalinitiative
- Source branch: codex/tpi-development
- Source commit: d127bd34daa5aa5bdc86db74d12a41d15d6e8432
- The guarded production script passed the production config checks and
  staged only the sanitized static package.

Read-only checks confirmed:

- / returns HTTP 200 and private, no-store.
- /member-sidebar.txt and /footer.txt return HTTP 200.
- /api/auth/me returns { user: null } without a production session.
- /admin-panel returns HTTP 403 without authorization.
- /news and /paratube return HTTP 200.
- No D1/R2 migration, import, or data write was performed.

Authenticated production routing, session persistence, member personalization,
admin authorization, and logout/back-forward behavior are NOT TESTED in this
run because no production session was available.

## Production protection

PASSED:

- No production database changes.
- No production R2 changes.
- No imports or migrations.
- No Founding 50 activation.
- No StudioFlow room or livestream creation.
- No git push or merge.
- Unrelated worktree changes remained unstaged and untouched.

## Files changed by implementation commits

- worker.js
- includes.js
- member-shell.js
- index.html
- member-sidebar.html
- footer.html
- scripts/deploy-development.mjs
- scripts/deploy-production-guarded.mjs

Documentation files are recorded separately after deployment.

## Recommended follow-up

Use a dedicated, already-authorized development browser session that does not
create new records, or have the owner perform authenticated browser acceptance
for root redirect, /member-home, refresh, new-tab, logout, and mobile
navigation. Do not treat the anonymous production smoke checks as a substitute
for that authenticated acceptance.

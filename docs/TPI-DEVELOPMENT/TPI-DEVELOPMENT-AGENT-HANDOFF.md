# TPI Development Agent Handoff

Last verified: 2026-10-22
Current controlling directive: TPI MASTER — Standing Autonomous Agent Authority

## Mandatory authority update

Read `100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`. Agents now have
standing authority to investigate, repair, test, commit, push, perform guarded
production deployment, verify live, and roll back. Do not stop for a routine
repairable blocker or require a fresh owner directive for each lifecycle step.
Historical restrictions below describe prior executions and do not override
the controlling directive.

## Workspace

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Last fully verified workflow baseline: `07ad157f68aaa9f5afdc2801d1089ab66b9cf10d`
- Active production Worker version: `106c3d6a-5cbb-4a62-917d-644f850b4287`
- Recorded rollback target: `7c5ea692-e2e9-41f1-9b34-651230e03997`
- Local website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`
- Worker ownership: launchd-owned by `com.tpi.local-development`

The authoritative StudioFlow source is the separate repository:
`/Users/toddknipple/Documents/StudioFlow/web`. The website `studio/` directory
is an integrated generated copy plus maintained TPI bridge files. Use
`node scripts/stage-studioflow-authoritative.mjs` in verification-only mode to
build twice and compare the candidate before any reviewed `--apply` operation.

Preserve unrelated tracked and untracked changes. Focused commits and pushes to
`codex/tpi-development` are authorized after the applicable checks pass. Do not
reset, clean, stash, force-push, or rewrite history as a routine shortcut.

## Latest verified production release

Source commit `07ad157f68aaa9f5afdc2801d1089ab66b9cf10d` was deployed to
Worker `theparanormalinitiative` as version
`106c3d6a-5cbb-4a62-917d-644f850b4287` at 100% traffic on 2026-10-22. The
release passed anonymous smoke 10/10, isolated Firefox Developer Edition
acceptance 23/23, local authentication lifecycle 38/38, complete preflight,
asset/build integrity, and the guarded Wrangler dry-run. Crossroads, D1, R2,
and owner browser storage were not modified.

For production acceptance, use only the disposable Firefox window titled
`TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE`. Other Firefox windows and the
owner's existing tabs do not satisfy the acceptance gate.

## Current browser workflow

- Firefox Developer Edition is the default browser for local and production
  TPI acceptance.
- Automated acceptance uses isolated disposable profiles and never closes or
  repurposes the owner's existing local or production tabs.
- Chromium is used only for an explicit compatibility requirement.

The latest retained browser evidence is 278 PASS, 6 expected limitations, 0
FAIL across 284 routes, with 54/54 focused checks passing and zero external
requests. Synthetic local roles are `local_admin`, `local_member`, and
`local_contributor`; credentials must never be printed or copied into reports.

## Recent verified changes

- OPS-018 changed shared fragment URLs in `includes.js` to root-relative paths
  and restaged local assets; the Worker was not restarted.
- The existing browser harness is `scripts/e2e/tpi-ops-016-browser.mjs`.
- Repository-scoped Playwright tooling uses the locally available package and
  installed Chrome without a browser download.
- OPS-019 policy and result records document Codex/FreeBuff/Opera boundaries.

## Last successful checks

- OPS-002 traffic protection: 11/11
- OPS-007 local foundation: 10/10
- OPS-009 authentication: 27/27
- OPS-011 member home: 37/37
- OPS-012 StudioFlow/ParaTube: 26/26
- OPS-014 local service: 20/20
- OPS-015 admin/API QA: 62/62
- `node --check includes.js`: passed
- `node --check scripts/e2e/tpi-ops-016-browser.mjs`: passed
- `git diff --check`: passed

## Safe continuation

Open the affected route in an isolated Firefox Developer Edition profile,
inspect console and local request activity, and run the smallest applicable
test followed by the required regressions. Agents may control the maintained
LaunchAgent services, commit, push, and deploy through `scripts/tpi-release.mjs`
when required. Do not interrupt unrelated services, expose credentials, or use
owner Studios for destructive testing.

No credentials, tokens, private payloads, or secrets are included in this
handoff.

## Documentation synchronization

Every completed TPI directive must update the affected Markdown records before
its status is marked complete. Record changed source files, executed evidence,
known limitations, development status, and the directive-index entry. Do not
describe a feature as production-ready from local tests alone.

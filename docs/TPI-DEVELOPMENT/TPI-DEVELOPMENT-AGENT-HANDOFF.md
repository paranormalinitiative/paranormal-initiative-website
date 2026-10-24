# TPI Development Agent Handoff

Last verified: 2026-10-23
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
- Last fully verified workflow baseline: `e18d3271b61c34adf2099448521e263dbcd13e70`
- Active production Worker version: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
- Recorded rollback target: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
- Local website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`
- Worker ownership: launchd-owned by `com.tpi.local-development`

The authoritative StudioFlow source is the separate repository:
`/Users/toddknipple/Documents/StudioFlow/web`. The website `studio/` directory
is an integrated generated copy plus maintained TPI bridge files. Use
`node scripts/stage-studioflow-authoritative.mjs` in verification-only mode to
build twice and compare the candidate before any reviewed `--apply` operation.
The complete commit/push/deploy distinction is documented in
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`; use it instead of inferring current
procedure from historical directive or completion records.

Preserve unrelated tracked and untracked changes. Focused commits and pushes to
`codex/tpi-development` are authorized after the applicable checks pass. Do not
reset, clean, stash, force-push, or rewrite history as a routine shortcut.

## Latest verified production release

Deployment commit `e18d3271b61c34adf2099448521e263dbcd13e70`
(TPI-STUDIOFLOW-030 — Sound Effects interface cleanup and drag-and-drop pad
reordering; feature commit `8f6035a`) was deployed to Worker
`theparanormalinitiative` as version `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
at 100% traffic on 2026-10-23. The release passed the 030 sound-effects
browser suite 25/25 (two consecutive runs), 021 static contracts 69/69,
021 browser 31/31, 028 browser 33/33, 020 contracts 14/14, 031 overlays
12/12, release safety 17/17, the complete local auth lifecycle (Node 38/38,
isolated Firefox 61/61), complete preflight, the guarded Wrangler dry-run,
and the guarded live acceptance against production 61/61
(`DEPLOYED_AND_VERIFIED`). Crossroads, D1, R2, and owner browser storage
were not modified. The current approved StudioFlow playback contract and
regression history are in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.

## Latest StudioFlow repair

The deployed change is documented in
`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`.
The Sound Effects panel no longer shows the Stop Sound button or the
permanent per-pad three-dot menu triggers; the existing options menu opens
on right-click and on Shift+F10/ContextMenu; pads reorder by drag-and-drop
or Alt+Arrow keys and each studio's order saves automatically through the
existing workspace configuration. The in-flight save-echo race in the
asset-state bridge that could clobber pad order was repaired with a guard
pinned by the 021 static contract. The 028 scene playback workflow
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`,
including its Addendum A section) remains untouched in the deployed
baseline, and the earlier countdown-row repair
(`300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-COUNTDOWN-TIMER-DEDUPLICATION.md`)
remains deployed as history.
Use the disposable Firefox acceptance profile for future checks; do not use
the owner profile for destructive testing.

The automated production acceptance gate must use the disposable Firefox
window titled `TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE`. After that gate
passes, StudioFlow's final user-facing acceptance target is the authenticated
live production page. When the owner has authorized live verification, the
existing production tab may be used non-destructively to confirm the exact
visible behavior; do not alter stored studios, media, recordings, or settings.

## Current browser workflow

- Firefox Developer Edition is the default browser for local and production
  TPI acceptance.
- StudioFlow completion is judged against the live production site. Local
  checks remain safety gates but are not substitutes for live acceptance.
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

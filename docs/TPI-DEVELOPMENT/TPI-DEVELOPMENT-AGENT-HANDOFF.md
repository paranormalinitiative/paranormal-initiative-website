# TPI Development Agent Handoff

Last verified: 2026-10-18  
Current directive: TPI-STUDIOFLOW-056 documentation addendum

## Workspace

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- HEAD: `7385f0c` (`fix: reject concurrent Studio workspace saves`)
- Local website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`
- Worker ownership: launchd-owned by `com.tpi.local-development`

The authoritative StudioFlow source is the separate repository:
`/Users/toddknipple/Documents/StudioFlow/web`. The website `studio/` directory
is an integrated generated copy plus maintained TPI bridge files. Use
`node scripts/stage-studioflow-authoritative.mjs` in verification-only mode to
build twice and compare the candidate before any reviewed `--apply` operation.

The worktree is intentionally dirty with pre-existing work. Preserve unrelated
tracked and untracked changes. Do not reset, clean, stash, commit, or push as a
routine continuation step.

## Current browser workflow

- Codex In-App Browser is the active agent browser and is verified for the local
  homepage, navigation, screenshot capture, and retained synthetic role QA.
- FreeBuff is standby and **NOT VERIFIED** for agent use.
- Opera is reserved for owner visual review and has not been used for agent QA.

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

Open the affected local route in Codex, inspect console and local request
activity, and run the smallest applicable test. If a source change affects
staged local assets, run `node scripts/stage-local-assets.mjs`. Do not restart
or stop the launchd-owned Worker without explicit service-lifecycle direction;
do not interrupt 8788. Do not deploy, import, contact external services, or
claim owner acceptance without owner review.

No credentials, tokens, private payloads, or secrets are included in this
handoff.

## Documentation synchronization

Every completed TPI directive must update the affected Markdown records before
its status is marked complete. Record changed source files, executed evidence,
known limitations, development status, and the directive-index entry. Do not
describe a feature as production-ready from local tests alone.

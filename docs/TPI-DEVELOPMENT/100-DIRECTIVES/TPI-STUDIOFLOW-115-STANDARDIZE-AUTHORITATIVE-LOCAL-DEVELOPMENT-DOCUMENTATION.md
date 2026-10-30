# TPI-STUDIOFLOW-115 — Standardize authoritative local development documentation

Date: 2026-10-29
Status: **COMPLETE / DOCUMENTATION STANDARDIZED / NOT DEPLOYED**
Production deployment: **NOT AUTHORIZED / NOT PERFORMED**

## Objective

Establish one official owner-facing StudioFlow local development environment
in all active documentation:

`http://127.0.0.1:8787/studio/`

## Official configuration

| Item | Verified documentation value |
| --- | --- |
| Application | StudioFlow |
| Official URL | `http://127.0.0.1:8787/studio/` |
| Runtime | Local Cloudflare Worker (`workerd`) |
| Startup | `npm run dev:local` |
| Local backend | Cloudflare Worker development runtime |
| Database | Local D1 |
| Object storage | Local R2 |
| Persistent data | Repository-relative `.local-dev/state/v3`; absolute `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3` |
| Environment | Local development; production is separate and explicitly authorized |

Port 8787 is the established owner-facing environment containing the owner's
existing local Studio records and recordings. A different localhost port is a
different browser-storage origin; an isolated preview does not automatically
contain those Studios, recordings, scripts or preferences.

## Current Teleprompter status

- Teleprompter 092 is implemented and engineering-verified.
- Approved source commit: `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`.
- Directive 111 recording-audio repair: integrated and verified.
- Directive 113 isolated acceptance: completed historically.
- Directive 114 environment reconciliation: completed.
- Port 5192: retired historical infrastructure; not an available URL.
- Port 8787: authoritative local Worker environment.
- Teleprompter 092 on port 8787: **not integrated**.
- Current port 8787 frontend: approved Video Setup 091 baseline.
- Owner acceptance: pending.
- Production release: not authorized.

## Documentation reviewed and updated

The following active authority, testing, onboarding, handoff and status files
were reviewed and standardized:

- `AGENTS.md`
- `docs/TPI-DEVELOPMENT/003-LOCAL-DEVELOPMENT.md`
- `docs/TPI-DEVELOPMENT/009-TESTING-AND-VERIFICATION.md`
- `docs/TPI-DEVELOPMENT/010-DEVELOPER-ONBOARDING.md`
- `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-MASTER-HANDOFF.md`
- `docs/TPI-DEVELOPMENT/TPI-LOCAL-DEVELOPMENT-USER-GUIDE.md`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`

The permanent StudioFlow local-development policy now states that 8787 is the
sole owner-facing environment, temporary previews are test-only, owner
acceptance occurs through 8787 unless explicitly excepted, and existing data
must be preserved. Source repository, website repository, local runtime,
browser-origin and local D1/R2 boundaries are documented separately.

## Reference audit

The maintained documentation was searched for `127.0.0.1:5192`,
`localhost:5192`, Vite preview instructions, localhost assignments and startup
commands. Remaining 5192 references are limited to:

1. Historical Directive 113 execution evidence.
2. Directive 114’s reconciliation and retirement evidence.
3. Active policy warnings that 5192 is retired and must not be recreated.

No active owner-facing instruction assigns StudioFlow to port 5192 or another
substitute port. The separate Admin Center Vite instructions are explicitly
identified as unrelated to StudioFlow. The optional remote development Worker
is explicitly identified as an isolated non-owner environment.

Historical Directive 109–114 execution records and reusable regression tests
were preserved. Historical events were not rewritten to claim that 5192 was
never used; the current documentation now makes its retired status explicit.

## Preservation and scope

No application source, generated StudioFlow asset, Worker route, D1 database,
R2 object, Studio, recording, browser storage, authentication configuration or
production configuration was changed. No development server was started or
stopped. No additional localhost was created. No production command was run.

## Verification

| Check | Result |
| --- | --- |
| Required active Markdown reviewed | PASS |
| Official owner URL consistently documented | PASS — `127.0.0.1:8787/studio/` |
| Startup procedure documented | PASS — `npm run dev:local` |
| Local D1/R2 persistence documented | PASS — `.local-dev/state/v3` and absolute path |
| Port 5192 classified as retired historical infrastructure | PASS |
| Teleprompter status accurate | PASS — verified source preserved, not integrated on 8787 |
| Historical records preserved | PASS |
| Application/data/production changes | NONE |

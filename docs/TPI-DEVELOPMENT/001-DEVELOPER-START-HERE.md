# Developer Start Here

## Controlling authority

Read `100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md` first. It grants
standing authority to complete current TPI directives through repair, testing,
commit, push, guarded production deployment, live verification, and rollback.
Historical task restrictions are preserved as evidence but do not silently
become permanent restrictions on later work.

## Before changing code

1. Work only in /Users/toddknipple/Documents/GitHub/paranormal-initiative-website.
2. Run git status --short and preserve unrelated changes.
3. Read the applicable directive in docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md.
4. Confirm whether the current directive explicitly limits the task to local,
   preview, research, or report-only work.
5. Use the maintained guarded release workflow for production; never use the
   production configuration as an improvised development deployment.

For StudioFlow, read `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` before editing.
The StudioFlow source repository, website repository, local site, development
Worker, and production site are separate states; none automatically syncs to
the next.

## Source and feature locations

- Public pages and site assets are in the repository root.
- The Cloudflare Worker entry point is worker.js.
- Wrangler configuration is wrangler.toml.
- The new Administration Center source is admin-center-app/.
- Historical audits and implementation reports remain under docs/.
- Authoritative StudioFlow application source is in
  `/Users/toddknipple/Documents/StudioFlow/web`; deployable integrated assets
  and TPI bridge files are in this repository's `studio/` directory.

## Safe workflow

Use the exact copy-and-paste sequence in
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`. It is the only maintained production
path and includes local authentication, complete isolated E2E, Firefox
Developer Edition, clean Git/GitHub parity, guarded Wrangler deployment, live
verification, and automatic rollback. Standing owner authority covers ordinary
verified production releases, so agents continue through that guard when the
active directive requires production completion.

## Evidence rules

Label results as verified, implemented, partial, blocked, or not tested. A successful build is not proof of authentication, state isolation, or authenticated production behavior.

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

## Source and feature locations

- Public pages and site assets are in the repository root.
- The Cloudflare Worker entry point is worker.js.
- Wrangler configuration is wrangler.toml.
- The new Administration Center source is admin-center-app/.
- Historical audits and implementation reports remain under docs/.

## Safe workflow

Use the sequence in `005-PRODUCTION-DEPLOYMENT.md`. Standing owner authority now
covers ordinary verified production releases, so agents continue through the
guarded release when the active directive requires production completion.

## Evidence rules

Label results as verified, implemented, partial, blocked, or not tested. A successful build is not proof of authentication, state isolation, or authenticated production behavior.

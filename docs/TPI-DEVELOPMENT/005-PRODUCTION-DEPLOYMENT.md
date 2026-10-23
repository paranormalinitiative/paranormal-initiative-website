# Production Deployment

The exact agent procedure is
[`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`](TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md).
That runbook is mandatory and takes precedence over abbreviated or historical
release descriptions in this file.

StudioFlow releases must also follow
[`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`](TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md)
so the authoritative source commit, integrated website commit, GitHub push,
Worker deployment, and live result cannot be confused.

## Release sequence

    AUTHORITATIVE SOURCE / LOCAL DEVELOPMENT
            |
            v
    LOCAL TESTING
            |
            v
    INTEGRATE REVIEWED ASSETS
            |
            v
    COMMIT AND PUSH EXACT CHECKPOINT
            |
            v
    GUARDED RELEASE PREFLIGHT
            |
            v
    PRODUCTION DEPLOYMENT
            |
            v
    PRODUCTION VERIFICATION

Production promotion is authorized under
`100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md` when the active
directive calls for production completion and every maintained safety gate
passes. A separate approval message for each ordinary release is no longer
required.

## Official approval workflow

1. Develop in the canonical checkout on the dedicated development branch after that branch has been created and verified.
2. Record status and preserve unrelated changes.
3. Create a recoverable checkpoint before substantial work.
4. Run local tests and build checks.
5. Optionally deploy to the isolated development Worker when a public preview
   is useful. This does not promote or synchronize production.
6. Complete isolated Firefox Developer Edition local acceptance and record evidence.
7. Commit and push the exact verified release to `codex/tpi-development`.
8. Run the complete guarded preflight from that clean, pushed commit.
9. Continue through guarded production deployment and live verification when
   the active directive requires production completion.

The development branch `codex/tpi-development` is the maintained release
source. Production promotion uses the standing authority and the guarded
release command below; it must not be performed from an uncommitted overlay or
an older branch.

## Current production guardrails

- Preserve /admin-panel and the existing public site.
- Preserve authentication, member data, D1 records, R2 objects, entitlements, and livestream restrictions.
- Verify account 221ea5479876fd303ddc87002b9e892d, Worker theparanormalinitiative, bindings, changed files, tests, and rollback before any authorized release.
- Never treat a workers.dev URL or a successful build as proof of environment isolation.

## Maintained release command

The permanent, guarded workflow is implemented by `scripts/tpi-release.mjs`:

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

Preflight requires `codex/tpi-development`, an empty Git working tree, and an
exact match with the GitHub branch. It runs the complete persistent
`local_admin` restart/build/Firefox lifecycle,
disposable port-8789 API E2E, the StudioFlow build, Firefox Developer Edition
acceptance in a new profile, authoritative asset staging verification,
read-only production smoke, Wrangler account/version/rollback checks, and the
existing guarded Wrangler dry-run.

The preflight rechecks the clean tree and exact GitHub commit after staging and
verification. The lower-level guarded deploy script also rejects every
uncommitted or untracked path, including documentation and generated leftovers.

Production mode repeats preflight, records the current Worker version, deploys
only through `scripts/deploy-production-guarded.mjs`, performs live smoke and
isolated Firefox acceptance, verifies the new version at 100% traffic, and
automatically restores the recorded version if acceptance fails. The workflow
contains no database migration, D1 mutation, or R2 deletion command.

Production Firefox acceptance uses the dedicated synthetic production QA
account from the protected credential file in a new disposable Firefox
Developer Edition profile. Local fixture accounts and owner accounts are
rejected by the maintained runner. Owner-profile verification is optional,
non-destructive, and never replaces isolated automated acceptance.

## StudioFlow release checkpoint status

Current commit-to-Worker traceability is recorded in
`TPI-CURRENT-DEVELOPMENT-STATUS.md`; this procedure intentionally does not pin a
version that becomes stale after the next release. The authoritative source is
`/Users/toddknipple/Documents/StudioFlow/web`; the website integration is the
reviewed `studio/` candidate produced by
`node scripts/stage-studioflow-authoritative.mjs`. A source/build revision and
the generated asset hashes must be recorded together.

Before production promotion, review the exact manifest for StudioFlow source,
generated JavaScript/CSS, TPI bridge files, API/Worker integration, and any
schema migration. Exclude local D1/R2 state, credentials, browser storage,
recordings, owner media, recovery artifacts, `.dev.vars`, `.local-dev/`, and
unrelated dirty-worktree files. Production readiness also requires authenticated
StudioFlow acceptance, verified server-side media persistence, HTTPS/WebRTC
guest signaling, and a rollback plan. Local tests alone are insufficient.

## Rollback preparation

Record the pre-release Git commit and Cloudflare deployment version, retain the previous verified deployment, and verify the route after rollback. No rollback or production mutation was performed in this directive.

## Recovery rules

- Uncommitted mistakes: stop, preserve unrelated files, and restore only the intended paths after review.
- Incorrect local commits: use a targeted revert or a new corrective commit; do not reset or rewrite shared history.
- Incorrect development push: stop further deployment, record the commit and target, and revert through the development branch after review.
- Failed development deployment: keep the prior verified deployment, inspect the deployment output, and roll back only the development target.
- Production rollback: use the recorded prior verified deployment or a reviewed revert commit. A code rollback does not roll back D1 or R2 data; state recovery requires a separately reviewed procedure.

Todd should not need to operate Git, Wrangler, or Cloudflare for an ordinary
release. The agent owns implementation, evidence, deployment, verification,
and targeted recovery. Owner interaction is reserved for private login,
operating-system permission, unavailable account authorization, or an
irreversible owner-data operation.

## Current preview destination

- Development website: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- Administration Center preview: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`
- Current verified dev deployment: `c8432743-71c7-4b5c-8cd1-9503cb81e038`

The development deployment has no scheduled triggers, no production Resend secrets, and uses only the development D1/R2 resources. The existing production Worker and custom domain remain separate.

# TPI-DEV-003 Proposed Safe Development Workflow

This document describes the proposed workflow only. It does not create a branch, Cloudflare resources, deployment automation, or production changes.

## Recommended workflow

```text
DEVELOP ON DEDICATED BRANCH
          |
          v
RUN LOCAL TESTS
          |
          v
DEPLOY ONLY TO ISOLATED DEVELOPMENT WORKER
          |
          v
TODD REVIEWS THE DEVELOPMENT WEBSITE
          |
          v
APPROVED CHANGES MERGE THROUGH A CONTROLLED RELEASE
          |
          v
EXPLICIT PRODUCTION DEPLOYMENT AND VERIFICATION
```

## Proposed development environment

After approval, create or identify:

- Worker: `theparanormalinitiative-dev`
- URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- D1: a separately named development database, for example `tpi_contributor_portal_dev`
- R2: a separately named development bucket, for example `tpi-contributor-media-dev`
- Authentication: separate session namespace, secrets, cookie host, and synthetic test accounts
- Cron: disabled or manually triggered in development
- Email: disabled or replaced with a test sink; no production Resend credentials
- Environment indicator: a visible `DEVELOPMENT ENVIRONMENT` banner and a non-production config value

The development configuration must be explicit and must fail review if it contains the production D1 ID, production bucket name, production custom domain, or production secret names/values. No production member data, private messages, sessions, recordings, or media should be copied.

The existing `/admin-center-preview/` application can be included in the isolated development Worker. The production `/admin-panel` remains unchanged.

## Proposed Git workflow

1. Preserve the canonical checkout as the only release source.
2. Create an owner-approved dedicated branch, recommended name `codex/tpi-development`.
3. Before work, inspect `git status --short`; leave unrelated dirty files untouched.
4. Make changes only on the dedicated branch.
5. Save reversible checkpoints as ordinary commits.
6. Run local tests and build checks.
7. Push only the dedicated development branch after owner approval of that step.
8. Deploy only the development Wrangler configuration.
9. Give Todd the development URL and exact test notes.
10. If rejected, repair or revert with a new commit on the development branch; do not reset, force-push, or clean the workspace.
11. If approved, prepare a separate production release for explicit owner authorization.

For a non-technical undo procedure: stop using the development URL, identify the last approved checkpoint, and create a revert commit on the development branch. Production is unaffected because the branch has no production route or production bindings.

## Approval gates

Todd must approve before:

- Creating the development Worker, D1 database, or R2 bucket.
- Creating or assigning development secrets and test accounts.
- Creating the dedicated branch if it will be pushed to GitHub.
- Enabling any development cron or email test path.
- Promoting any approved change to production.

## Exact implementation changes proposed, but not performed

1. Add a dedicated Wrangler development config or explicit isolated environment.
2. Add safety checks that reject production resource IDs in development config.
3. Add the development environment indicator.
4. Add or adapt a branch-only QA/development deployment workflow with no production credentials.
5. Document the owner review checklist and rollback command sequence.
6. Keep the production Wrangler file and `/admin-panel` unchanged.

## Cost expectation

No charge was incurred by this inspection. Future Cloudflare cost is not guaranteed to be zero: separate D1/R2 resources may remain within included Free-plan usage for small test volumes, but database limits, storage, operations, media, and email test services must be checked before provisioning. No paid service should be activated without approval.

## Stop condition

Do not create the branch, Worker, database, bucket, secrets, test accounts, development deployment, or CI deployment workflow until Todd reviews and approves this proposal.

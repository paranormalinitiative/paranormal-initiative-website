# Production Deployment

## Release sequence

    LOCAL DEVELOPMENT
            |
            v
    LOCAL TESTING
            |
            v
    CLOUDFLARE DEVELOPMENT
            |
            v
    DEVELOPMENT ACCEPTANCE
            |
            v
    OWNER APPROVAL
            |
            v
    PRODUCTION DEPLOYMENT
            |
            v
    PRODUCTION VERIFICATION

Production promotion requires explicit owner authorization for the specific release. TPI-DEV-001 does not authorize a production deployment.

## Official approval workflow

1. Develop in the canonical checkout on the dedicated development branch after that branch has been created and verified.
2. Record status and preserve unrelated changes.
3. Create a recoverable checkpoint before substantial work.
4. Run local tests and build checks.
5. Deploy only to the isolated development Worker after its separate D1, R2, authentication, and scheduling boundaries are verified.
6. Todd reviews the actual development website and either approves or rejects the change.
7. Only approved changes may be merged into `main`.
8. Production deployment requires separate explicit authorization and live verification.

The development branch `codex/tpi-development` and development Worker `theparanormalinitiative-dev` are now operational for preview testing. Production promotion still requires separate explicit owner authorization.

## Current production guardrails

- Preserve /admin-panel and the existing public site.
- Preserve authentication, member data, D1 records, R2 objects, entitlements, and livestream restrictions.
- Verify account 221ea5479876fd303ddc87002b9e892d, Worker theparanormalinitiative, bindings, changed files, tests, and rollback before any authorized release.
- Never treat a workers.dev URL or a successful build as proof of environment isolation.

## Rollback preparation

Record the pre-release Git commit and Cloudflare deployment version, retain the previous verified deployment, and verify the route after rollback. No rollback or production mutation was performed in this directive.

## Recovery rules

- Uncommitted mistakes: stop, preserve unrelated files, and restore only the intended paths after review.
- Incorrect local commits: use a targeted revert or a new corrective commit; do not reset or rewrite shared history.
- Incorrect development push: stop further deployment, record the commit and target, and revert through the development branch after review.
- Failed development deployment: keep the prior verified deployment, inspect the deployment output, and roll back only the development target.
- Production rollback: use the recorded prior verified deployment or a reviewed revert commit. A code rollback does not roll back D1 or R2 data; state recovery requires a separately reviewed procedure.

Todd should not need to operate Git to approve or reject a change: review the development URL and report the page or workflow result. A developer must preserve the evidence and perform any targeted recovery.

## Current preview destination

- Development website: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- Administration Center preview: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`
- Current verified dev deployment: `c8432743-71c7-4b5c-8cd1-9503cb81e038`

The development deployment has no scheduled triggers, no production Resend secrets, and uses only the development D1/R2 resources. The existing production Worker and custom domain remain separate.

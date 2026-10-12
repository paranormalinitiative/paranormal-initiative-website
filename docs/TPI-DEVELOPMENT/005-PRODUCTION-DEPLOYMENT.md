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

## Current production guardrails

- Preserve /admin-panel and the existing public site.
- Preserve authentication, member data, D1 records, R2 objects, entitlements, and livestream restrictions.
- Verify account 221ea5479876fd303ddc87002b9e892d, Worker theparanormalinitiative, bindings, changed files, tests, and rollback before any authorized release.
- Never treat a workers.dev URL or a successful build as proof of environment isolation.

## Rollback preparation

Record the pre-release Git commit and Cloudflare deployment version, retain the previous verified deployment, and verify the route after rollback. No rollback or production mutation was performed in this directive.

# TPI-DEV-036 — StudioFlow Workspace Persistence

Status: **IMPLEMENTED — PRODUCTION SCHEMA REPAIRED WITH AUTHENTICATED MUTATION TEST PENDING**  
Date: 2026-10-15  
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`  
Branch: `codex/tpi-development`

## Scope

Repair the missing production D1 schema required by the already-deployed
StudioFlow saved-workspace API. This directive is limited to the additive
`studio_workspaces` table and its two required indexes. It does not rebuild
StudioFlow, change the workspace API, run the historical migration backlog,
modify migration-ledger history, import data, alter R2, or change memberships
or entitlements.

## Required safeguards

- Inspect production and development schemas before writing.
- Verify the production D1 identity.
- Create and verify a private production export outside the repository and
  public assets before the schema change.
- Validate the existing development implementation and owner-isolation tests.
- Apply only `migrations/0051_studioflow_workspaces.sql` after confirming the
  production table is absent and its prerequisites exist.
- Keep the production `d1_migrations` ledger unchanged because the production
  database has an intentionally incomplete historical ledger and the directive
  does not authorize backlog execution or ledger fabrication.
- Do not create a production test account or mutate a real member workspace
  without an authorized production test identity.

## Required result

Production must contain the exact schema already verified in development, while
existing member data, recordings, R2 objects, authentication, memberships,
and unrelated application tables remain unchanged. The completion evidence is
recorded in
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-DEV-036-STUDIOFLOW-WORKSPACE-PERSISTENCE-IMPLEMENTATION-REPORT.md`.

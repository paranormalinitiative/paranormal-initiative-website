# TPI-DEV-013 — Creator Partnership and Administration Integration

## Scope

This directive continues the existing TPI-DEV-011 Administration Center and TPI-DEV-012 role/Creator Studio work. It is development-only. Production Worker, D1, R2, authentication, accounts, and sessions are out of scope.

## Required boundaries

- Administration Center remains server-gated to owner/admin accounts.
- Creator Studio remains controlled by the existing role plus active entitlement capability.
- Contributor/content tools remain separate from Administration Center and Creator Studio.
- Founding 50 applications are linked to existing active accounts; new account creation is not part of this workflow.
- Application review does not grant a membership or entitlement.
- Membership activation is separately owner-gated, requires an approved application when an application is supplied, and remains disabled by default in development.
- Capacity is enforced by the existing 50-slot allocation model and database uniqueness/concurrency handling.
- Permission and membership changes continue to use the existing administrative audit log.

## Owner decisions still required

Owner approval is required before enabling `FOUNDING50_DEVELOPMENT_ACTIVATION=approved`, creating synthetic development fixtures, or activating any actual Founding 50 membership. Granular contributor/content-editor permissions also require an explicit permission model decision before implementation.

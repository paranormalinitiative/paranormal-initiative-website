# Administration Center

## Applications

The installed Refine + shadcn/ui application remains in admin-center-app/ and is previewed at /admin-center-preview/. The existing legacy administration application remains at /admin-panel.

The preview must remain protected and separate. It must not be promoted to /admin-panel by this workflow.

## Integration status

The preview application has prior completed work and protected-route deployments recorded in the TPI-ADMIN-009, TPI-ADMIN-010, and TPI-ADMIN-010B audit records. Those records remain the source of detailed feature status. TPI-DEV-001 does not rebuild or replace either administration application.

## Development requirement

The Administration Center is now available for authenticated development testing at `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`. Its APIs use the isolated development D1. Owner access returned HTTP 200 and the protected admin overview/member APIs returned data for the synthetic development records. Ordinary member access remained HTTP 403. Do not claim production acceptance from these preview results.

The existing `/admin-panel` remains the production Administration Center and was not replaced.

## Owner review requirement

The intended review path is an authenticated development account on the isolated development website. Todd should be able to open `/admin-center-preview/`, navigate the pages, inspect real development functionality, and approve or reject the change without sharing passwords, cookies, or tokens. Until the isolated backend and test accounts are implemented and verified, this is an approved requirement rather than an available acceptance environment.

The existing `/admin-panel` remains the production Administration Center and must not be replaced by the preview during development work.

# Future Development

This directory contains proposals and historical planning. It is not an
operational release guide. Current commit, push, and deployment instructions
are in `../TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`; StudioFlow source integration is
in `../TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`.

## Historical development-environment requirements

The isolated development Worker, D1, R2, configuration, and authentication
boundary have since been implemented. The list below is retained to explain
the original design requirements, not to claim those resources are still
missing.

- Provision or identify an owner-approved development Worker.
- Provision or identify separate development D1 and R2 resources.
- Define separate authentication/session and cookie boundaries.
- Create sanitized or synthetic fixtures.
- Add a separate reviewed Wrangler configuration.
- Verify routes, bindings, rollback, and protected APIs.

## Deferred policy work

Detailed Owner, Assistant Administrator, and Moderator permissions remain for a future owner-approved directive. This documentation set does not implement roles or grant access.

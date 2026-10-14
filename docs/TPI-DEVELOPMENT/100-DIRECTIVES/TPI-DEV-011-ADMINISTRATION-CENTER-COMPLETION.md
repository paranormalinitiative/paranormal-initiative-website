# TPI-DEV-011 — Administration Center Functional Completion

Status: **AUTHORIZED FOR DEVELOPMENT-ONLY IMPLEMENTATION, TESTING, DOCUMENTATION, AND SAFE DEPLOYMENT**.

Production modifications are not authorized. This directive continues the existing protected Administration Center preview and does not replace `/admin-panel`, StudioFlow, TPI Videos, Community Feed, or Paranormal Teams.

## Scope

- Use the existing `admin-center-app/` source and `/admin-center-preview/` deployment route.
- Connect existing management interfaces to authoritative development D1/API contracts.
- Preserve server-side authorization, private media boundaries, and the development-only deployment workflow.
- Keep Founding 50 awards inactive and do not issue real invitations or entitlements.
- Do not import the Paranormal Teams research CSV or begin the separate enrichment project.

## Implementation order

The first implementation slice covers member account controls, Education Center publication status, and TPI Videos lifecycle management. Existing Community Feed moderation, Paranormal Teams review, audit logs, settings, reports, and bounded Creator/StudioFlow views remain preserved. A later slice may address additional management contracts after owner review of this deployment.

## Required evidence

- `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-011-ADMINISTRATION-FUNCTIONAL-INVENTORY.md`
- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-DEV-011-IMPLEMENTATION-REPORT.md`
- `scripts/qa/tpi-dev-011-admin-functional.mjs`

# TPI-ADMIN-001 — Future Administration & Network Operations Center

**Project:** The Paranormal Initiative Administration & Network Operations Center
**Directive:** TPI-ADMIN-000
**Status:** **PLANNED — AWAITING IMPLEMENTATION**
**Priority:** High
**Implementation authorization:** **Not yet granted**
**Registered:** 2026-10-11

> **Current roadmap note — TPI-DOCS-001:** Administration Center work remains
> queued after TPI-VIDEOS-009A, TPI-VIDEOS-010, and TPI-SOCIAL-003. This
> planning document does not authorize implementation. The current locked
> order and cross-workspace status are in
> [`docs/planning/TPI-DOCS-001_MASTER_STATUS.md`](docs/planning/TPI-DOCS-001_MASTER_STATUS.md).

## Planning boundary

This document records an owner-approved future project. It is a planning
record, not an implementation authorization. StudioFlow remains the current
active development priority. No Administration Center routes, APIs, database
migrations, authentication changes, production-data changes, or deployment
are part of this registration.

The future center must integrate existing TPI functionality instead of
duplicating or rebuilding working systems. Existing member accounts,
Community Feed, Messenger, notifications, administrative functionality,
Cloudflare infrastructure, D1, R2, authentication, StudioFlow, and the
Creator Partnership Program remain protected dependencies.

## Approved technology direction

The owner-approved planning direction is:

- **Functional foundation:** [Refine](https://refine.dev/), subject to
  compatibility review against the actual TPI frontend architecture.
- **Visual components:** [shadcn/ui](https://ui.shadcn.com/), subject to
  dependency, licensing, maintenance, and security review.
- **Design inspiration:** [Discourse](https://www.discourse.org/) administration
  dashboards and navigation patterns. Discourse is a design reference only,
  not a replacement backend or community platform.
- **Existing backend:** Cloudflare Workers, Cloudflare D1, Cloudflare R2,
  existing TPI authentication, and existing TPI APIs.

This direction does not authorize implementation. Before work begins, the
project must verify that Refine and shadcn/ui integrate appropriately with the
actual TPI frontend without introducing a second frontend framework
unnecessarily. The Administration Center must use the existing backend,
authentication, member data, and social-network services; it must not
introduce another database or replace the existing community.

## Project overview

The Administration Center will be a protected, professional operations
surface for the TPI network with dedicated left-side navigation. It will
provide authorized administrators with a truthful view of member, content,
creator, StudioFlow, security, infrastructure, quality, and audit operations.
All displayed statistics must come from existing authoritative data sources;
fabricated counts and unverified health claims are not acceptable.

## Planned navigation and modules

The final information architecture remains subject to implementation design,
but the approved module inventory is:

1. Administration Overview Dashboard
2. Member Directory and Management
3. New Member Statistics
4. Active and Inactive Member Tracking
5. Community Feed Administration
6. Posts, Comments, and Reactions
7. Messenger Operational Health
8. Notification Management
9. Creator Partnership Management
10. Live Broadcast Administration
11. Education Center Administration
12. Paranormal Teams Administration
13. Content Moderation
14. Member Reports and Enforcement
15. Security Monitoring Center
16. Authentication and Access Monitoring
17. Privacy and Data Requests
18. Complete Member Account History Export
19. Account Deletion Request Management
20. Network Health Monitoring
21. Cloudflare Worker Health
22. D1 Database Health
23. R2 Storage Health
24. Background Job Monitoring
25. Error Monitoring
26. Community Analytics
27. Administrative Audit Logs
28. Administrative Roles and Permissions
29. System Configuration
30. Automated Quality Assurance Integration

The navigation should group these modules into understandable operational
areas without making private member conversations broadly accessible.

## Security, privacy, and audit requirements

- Enforce authorization server-side for every page, API, export, and action.
- Use role-based permissions with least privilege and explicit sensitive-action
  boundaries.
- Preserve existing authentication and member-account behavior.
- Protect private conversations, recordings, sessions, configuration, stream
  keys, and other sensitive data from unrestricted administrative display.
- Record sensitive administrative actions in durable audit logs with actor,
  action, target, timestamp, and result where the existing data model supports
  it.
- Provide secure, permission-checked privacy requests and account-deletion
  workflows; do not make deletion destructive by default or bypass retention
  obligations.
- Treat member history exports as sensitive operations with explicit access,
  traceability, and safe delivery.
- Do not introduce new paid infrastructure unless separately approved.

## Network and infrastructure monitoring requirements

The center should report meaningful, bounded health information for the
existing Cloudflare Worker, D1 database, R2 storage, background jobs, error
signals, and QA runs. It must distinguish unavailable telemetry from healthy
telemetry and must not imply that a resource was checked when it was not.

Monitoring must not alter production infrastructure, provision recording
storage, expose credentials, or turn StudioFlow's unverified provider and
livestream capabilities into production claims.

## Project relationships and dependencies

| Project | Relationship |
| --- | --- |
| StudioFlow | Current active development priority; remains independent and must not be interrupted. |
| TPI-QA-001 | Permanent automated quality system to integrate with future admin status and release views. |
| Creator Partnership Program | Separate project that may later integrate with administration workflows. |
| Existing TPI site/auth/data systems | Protected dependencies; integrate rather than duplicate or rebuild. |

## Implementation phases (future)

1. **Discovery and authority map:** inventory existing admin routes, Worker
   handlers, D1 schema, R2 paths, authentication roles, audit records, and QA
   evidence.
2. **Information architecture:** finalize left navigation, module ownership,
   role matrix, privacy boundaries, and empty/unavailable states.
3. **Read-only foundation:** add authorized overview and health views using
   existing authoritative sources; validate privacy and access boundaries.
4. **Operational modules:** add member, content, moderation, reports,
   creator, Education Center, Teams, broadcast, and notification operations
   with smallest-safe integrations.
5. **Security and data operations:** implement audited exports, privacy
   requests, deletion-request handling, role administration, and secure
   configuration workflows only after schema and retention review.
6. **QA and release:** integrate TPI-QA-001, test authorized/unauthorized
   sessions, review audit coverage, perform responsive/accessibility checks,
   and obtain explicit implementation and release authorization.

No phase may begin until the owner grants explicit authorization for
TPI-ADMIN-001 implementation.

## Acceptance criteria

Before this project can be considered implemented, it must demonstrate:

- Dedicated left-side Administration Center navigation using TPI visual
  identity.
- Real statistics and health results sourced from verified existing data.
- Server-side authorization and role-based permissions on every protected
  surface and endpoint.
- No unrestricted access to private member conversations or sensitive media.
- Auditable sensitive actions, exports, privacy requests, and deletion
  workflows.
- Preservation of existing accounts, Feed, Messenger, notifications, admin
  functions, authentication, Cloudflare infrastructure, D1, R2, StudioFlow,
  and Creator Partnership functionality.
- Automated QA coverage integrated without weakening existing boundaries.
- Desktop, tablet, mobile, keyboard, error, empty-state, and unauthorized
  access verification.
- A release report with exact commits, deployment identifiers where applicable,
  production verification, and explicit remaining limitations.

## Current project status

**Planned — awaiting implementation.** TPI-ADMIN-000 registers the project and
preserves its approved vision. No application implementation has started, no
administrative functionality was changed, and no database migration, API
route, authentication change, production-data change, or deployment was made
for this project.

StudioFlow remains the current active development priority. TPI-QA-001 remains
the permanent QA system. The Creator Partnership Program remains separately
documented until an approved integration plan exists.

## Change control

Implementation requires a new explicit owner authorization. Any future work
must update this document and the existing roadmap with verified evidence,
must preserve documentation history, and must not create a duplicate planning
system.

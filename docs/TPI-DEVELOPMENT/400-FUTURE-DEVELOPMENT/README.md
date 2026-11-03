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

The authoritative membership and professional-access model — Free and Paid
membership, the Creator and Contributor capability families, combined access,
Founding identities, cumulative access resolution, and the separation of
membership, payment, capability, Founding status, role, and honor — is recorded in
[TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md)
(TPI-GOVERNANCE-003A). It is policy only: no subscription, billing, or new
entitlement behavior is implemented by it. Commercial terms remain owner
decisions.

The operational staff model — Moderator, Senior Moderator, Lead Moderator,
Administrator, Senior Administrator, Platform Administrator, and the separate
Owner/Founder authority, with least privilege, capability-based authorization,
appointment records, and the prohibition on self-escalation — is recorded in
[TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md](TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
(TPI-GOVERNANCE-003B). It is policy and asset provenance only: no role is assigned,
no permission changes, and no staff tier exists yet.

TPI-GOVERNANCE-003B1 amended that record with the constitutional-value principles that
bound staff authority, the working Moderator/Administrator oath, the moderation
philosophy of conduct over viewpoint, recusal and accountability rules, and the future
help architecture: Community Standards, a member-facing Community Help Center, a
staff-facing Internal Help Desk, governance Markdown as the single source of truth, and
Mystic as an explainer that must not invent policy. All of it is documentation.

The operational badge masters (Moderator, Administrator) now live in
[`../../../assets/operational-roles/`](../../../assets/operational-roles/), a family
separate from the Founding and Society/Leadership artwork.

## TPI-STUDIOFLOW-126 future roadmap preservation

The following are recorded as future projects and were not implemented or
deployed under TPI-STUDIOFLOW-126:

- Professional Content Editor: extend the existing TPI Content Editor for
  authors, editors, researchers, article and research-paper development,
  citations, drafts, revision history, editorial review, and publishing
  workflows. Inspect the existing editor before any implementation.
- Founding 50 Creators: preserve the planned 50 complimentary lifetime Creator
  memberships, lifetime StudioFlow access, recognition badges, and approved
  creator privileges.
- Founding 50 Contributors: preserve the planned 50 complimentary lifetime
  Contributor memberships, professional Content Editor access, research/article
  tools, and recognition badges. Contributor membership alone does not grant
  StudioFlow access.
- Administration and account roles: future planning must distinguish Owner /
  Super Administrator, Full Administrator, Moderator, Developer, Marketing /
  Advertising, Content Editor, Contributor, Creator, Support, and any later
  specialized roles. Membership entitlements and administrative permissions
  remain separate, and no final permission matrix is assumed.

## Nova product family — current architectural record

The Nova product-family decision (StudioFlow Nova Edit, Nova Edit Documents and
Slides, Nova Editorial Workspace, Nova Docs, Nova Slides, PDF export-only, AI
deferred, GenOffice evaluation, shared Nova Core) is recorded in
[TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md](TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md).

That record is an architectural decision, not an implementation directive. The
canonical development sequence, including the Creator Incentive + Dual-Member
track that comes next, is the top section of
[`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md).

The founding-membership items recorded below remain planning items and are
unchanged by that record; the Founding Membership System is roadmap step 10.

# Security and Permissions

## Current boundary

The existing Worker and production domain remain protected. The audit did not request credentials, cookies, or tokens and did not bypass authentication. Anonymous authenticated-feature acceptance is therefore not claimed.

New and changed production credentials use versioned, salted PBKDF2-SHA-256
records with 120,000 iterations. Legacy 64-character SHA-256 records remain
compatible and upgrade only after successful password verification through a
guarded compare-and-swap update. No bulk credential rewrite is authorized by
this compatibility path. Password hashes, reset codes, sessions, provider
secrets, and protected credential files must never be logged or documented.

Because the current workers.dev target maps to the same configured Worker and stateful bindings, development authentication cannot yet be considered independent. Treat session validation, cookies, APIs, and administrative permissions as production-sensitive until a separate environment is configured.

## Required checks for an isolated environment

- Separate cookie/session namespace and authentication configuration.
- Server-side authorization on every administrative API.
- Protected preview assets and direct URLs.
- No stream keys, private recordings, private messages, or tokens in logs or client payloads.
- Synthetic test accounts and fixtures.
- Explicit owner approval before granting new permissions or implementing new administrative roles.

Development authentication uses the separate development D1 session store, host-scoped `tpi_session` cookies without a Domain attribute, and development-only `tpi-dev-owner` / `tpi-dev-member` accounts. The current auth implementation uses random database-backed session tokens rather than a signing secret. Production credentials, cookies, private member data, and secrets were not copied into development. The development config has no Resend secrets and sets `TPI_DISABLE_OUTBOUND=1`.

Runtime checks passed: anonymous Admin Center access returned 403; the development owner logged in and received Admin Center/API access; the ordinary development member logged in but remained denied from Admin Center; `.dev.vars` and temporary deployment config probes returned 404.

## Current role policy

Owner-confirmed baseline boundaries for Owner, Executive, Full Administrator,
Administrator, Moderator, and Member are recorded in section 82 of the
[operational-role architecture](400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
and the [Membership and Staff Rules](400-FUTURE-DEVELOPMENT/TPI-MEMBERSHIP-AND-STAFF-RULES-WORKING-DRAFT.md).
The additive `0071_staff_role_appointments.sql` migration stores explicit,
audited appointments separately from membership, entitlements, honors, and
legacy account role values. `lib/staff-roles.js` resolves permissions on the
server. Badges and client-provided values never grant authority.

The intended operational-role architecture — Moderator, Senior Moderator, Lead Moderator, Administrator, Senior Administrator, Platform Administrator, and the separate Owner/Founder authority, together with least privilege, capability-based authorization, position records, and the rule that no badge or client value grants authority — is recorded in
[TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
(TPI-GOVERNANCE-003B). Its earlier statements that no staff appointments or
tiers exist are historical snapshots, superseded by the 2026-11-13
implementation record below.

That record now also carries the staff-conduct principles added by
TPI-GOVERNANCE-003B1 — freedom of religion, speech, and the press as voluntary
organizational values, viewpoint-neutral moderation, the boundary that free
expression does not authorize abuse, recusal, fair process, equal application,
and the working staff oath. The oath and staff help surfaces remain future
work. The active appointment table is the authority source for appointed staff;
legacy `owner` and `admin` values remain supported for existing accounts.

### Implemented staff permission baseline (2026-11-13)

- **Owner:** protected highest authority; staff account workflows cannot block
  or deactivate the Owner. Owner alone may appoint/revoke Executives and Full
  Administrators, and may appoint/revoke lower staff.
- **Executive:** CEO, Founder, Director, or Assistant Director appointment;
  full platform authority except Owner transfer. May appoint/revoke
  Administrator and Moderator appointments. Executive status is never inferred
  from a display title.
- **Full Administrator:** broad Administration Center and moderation access;
  cannot appoint staff or change/remove Owner, Executive, Full Administrator,
  Administrator, or Moderator accounts/appointments. Founding membership,
  leadership honors, Creator incentives, security/settings, and access-entitlement
  administration remain outside this role.
- **Administrator:** routine member, community, article, report, event, and
  team admin routes; may remove inappropriate Community Feed posts with a
  required reason and audit entry. Cannot change staff/security/ownership or
  alter staff accounts or grant professional entitlements. Route groups are allowlisted in
  `mayUseAdminRoute()`.
- **Moderator:** dedicated `/moderation` surface and server routes to hide or
  remove Community Feed posts/comments with a required reason and audit entry;
  no Administration Center access, staff appointment authority, or account
  controls.
- **Member:** participation and existing membership-based capabilities only.
- **Membership stays separate:** Member, Contributor, Creator, Dual, and
  Founding records do not imply operational authority. The Member badge is
  recognition only.

Appointments are explicit, one active role per person, reason-required, and
audited. Revocation preserves history. Existing `owner` remains Owner and
existing `admin` remains Administrator unless an explicit staff appointment
overrides that baseline. Moderator warnings, temporary account restrictions,
report intake/triage, staff suspension, and appeals are not implemented in this
first release.

## Membership entitlements and administrative permissions (recorded 2026-11-02)

The policy model behind these controls — Free versus Paid membership, the Creator
and Contributor capability families, combined access, and why membership, payment,
capability, Founding status, role, and honor must remain separate — is recorded in
[TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md)
(TPI-GOVERNANCE-003A). Its security rule is unchanged from this document: no badge,
label, client state, or visible control grants access; authorization is resolved
server-side.

Recorded by TPI-DOCS-ROADMAP-001 as planning, then **implemented locally by
TPI-CREATOR-INCENTIVE-001**. The implemented model and its exact authorization
behaviour are specified in
[`TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`](TPI-FOUNDING-MEMBERSHIP-REGISTRY.md).
No production migration or deployment has been performed.

### Implemented authorization (TPI-CREATOR-INCENTIVE-001)

- **Capabilities are resolved server-side**, never accepted from a request.
  `lib/membership-entitlements.js` unions active Founding Membership
  capabilities, explicit administrative grants, legacy Creator Studio
  entitlements, and the existing account role. Resolution fails closed when the
  additive schema is absent.
- **Founding Membership administration is owner/admin only.** Ordinary members
  receive `403` on every registry, assignment, state-change, capability, and
  incentive route, including forged direct API calls. Covered by permanent
  regression assertions.
- **Creator Studio access** continues to be a separate gate; it now asks for the
  resolved Creator capability instead of one entitlement table. StudioFlow
  behavior is unchanged and an account without the capability still receives
  `403`.
- **Editorial access** (`requireContributor`) asks for the resolved Contributor
  capability. A Creator-only account does not gain editorial rights; a
  Contributor-only account does not gain Creator Studio or Creator Incentive
  eligibility.
- **Education Center publishing authority is not implied** by Contributor or
  All-Access capability. Author/Submitter/Editor/Publisher/Administrator remain
  separately enforced decisions.
- **Creator Incentive participation** requires the Creator capability. The API
  refuses to enrol a Contributor-only account (`403 capability_required`), so
  the rule cannot be bypassed by calling the endpoint directly.
- **Audit:** issuance, state changes, capability grants/revokes, and incentive
  participation changes write `founding_membership_history` and
  `admin_audit_logs` records with the acting account.
- **Account isolation** is covered by tests across a Creator account, a
  Contributor account, an All-Access account, an ordinary account, and a dual
  Creator+Contributor account; granting or reading capability for one account
  never changes another.

**Membership entitlements and administrative permissions are separate.** Holding
a membership grants product capability; it does not grant administrative
authority over the site, other accounts, or the Education Center.

### Product access model

| Membership | Receives |
|---|---|
| Creator | Creator capabilities, StudioFlow access, StudioFlow Nova Edit, production-oriented document and presentation creation |
| Contributor / Editorial member | Nova Editorial Workspace, professional document and presentation capability, Education Center workflow appropriate to editorial permissions |
| Dual / All-Access | both of the above through one account |

**Cumulative entitlements are mandatory.** A dual account must hold Creator and
Contributor capability sets simultaneously. One membership must never overwrite
another, and combining access must not silently drop either set. This is a
permanent regression requirement for the Creator Incentive System work.

### Education Center permission layers

Nova access and publishing authority are not identical. The layers to evaluate
are: **Author** (create professional content), **Submitter** (submit for
Education Center consideration), **Editor** (review/edit authorized educational
content), **Publisher** (publish/unpublish official Education Center material),
and **Administrator** (manage broader editorial permissions and configuration).

A Dual / All-Access member receives Creator and Contributor capabilities. That
does not automatically grant unrestricted administrative authority over every
live Education Center item.

Every administrative and editorial API must continue to enforce authorization
server-side. No entitlement change may be implemented from client-side state
alone.

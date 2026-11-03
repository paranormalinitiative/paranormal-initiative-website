# TPI Operational Roles and Administrative Authority Architecture

Effective: 2026-11-03
Status: **AUTHORITATIVE POLICY — DOCUMENTATION AND ASSET IMPORT ONLY. NO
APPLICATION, DATABASE, ROLE ASSIGNMENT, OR DEPLOYMENT CHANGE.**
Authority: owner directive TPI-GOVERNANCE-003B (with the badge-master addendum)
Section: TPI-GOVERNANCE-003, section B (Operational Roles — Moderators &
Administrators)
Depends on: [TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md) (003A)
Next section: TPI-GOVERNANCE-003C (Governance, Board & Executive Leadership) —
not defined here.

This document defines how operational responsibility works at TPI. It records
current behavior and the intended future architecture separately, and it
implements neither role changes nor permissions.

---

## 1. Central principle

Record:

> **Operational roles describe responsibility for operating, protecting,
> moderating, and administering TPI. They are not memberships, subscriptions,
> honors, or organizational rank.**

A person may simultaneously be a Free Member, a Moderator, a Founding
Contributor, a Board Member, and a Creator if each status was legitimately
granted. None replaces another.

## 2. Six independent dimensions

| Dimension | Question | Source of truth |
|---|---|---|
| Community membership | May this person participate? | membership record |
| Payment | What is being billed now? | subscription/billing |
| Professional capability | Which tool families may they use? | resolved capabilities |
| Operational role | What may they operate or enforce? | staff role record |
| Organizational office | What governance authority do they hold? | governance record (003C) |
| Honor / distinction | What have they earned or been given? | honors record |

## 3. Operational authority is appointed

Moderator and Administrator authority is **appointed**, not purchased, not earned
automatically from posting volume, not granted by a subscription tier, not
inferred from a Founding Membership, not inferred from a badge, and not granted
because the account holds Creator or Contributor access.

Only authorized TPI leadership appoints operational roles. The exact appointment
authority is finalized with the governance/leadership architecture (003C).

## 4. Free Members may hold operational roles

A person does not need a paid subscription to serve TPI operationally. A
legitimate Free Member may be appointed Moderator, Senior Moderator, or Lead
Moderator if TPI authorizes it. Staff responsibility does not automatically
confer StudioFlow, Nova Edit, the Nova Editorial Workspace, premium subscription
benefits, or any Creator/Contributor entitlement.

## 5. Paid Members may hold operational roles

A Paid Member may also be Moderator, Administrator, or another authorized
operational role. Payment does not cause the appointment; the states coexist.

## 6. Founding Members may hold operational roles

Example — **Founding All-Access + Administrator** — is three independent records:

- Founding identity: `FAA-###`
- Professional capabilities: Creator + Contributor
- Operational responsibility: Administrator

None of these may be derived from another, and revoking one must not silently
revoke the others.

## 7. Moderation family

Working architecture names:

- **Moderator**
- **Senior Moderator**
- **Lead Moderator**

These are working names, refinable by the owner before implementation. Their
functional separation is what this document fixes.

## 8. Moderator

A Moderator is a trusted operational community role. Expected responsibilities,
within authorized scope:

- reviewing reported posts and comments;
- enforcing community rules;
- handling obvious spam and inappropriate public content;
- reviewing member reports;
- applying limited moderation actions;
- escalating serious cases;
- documenting moderation actions.

A Moderator does not automatically receive broad account-administration
authority.

## 9. Moderator limitations

A standard Moderator should not automatically be able to: assign Founding
Memberships, assign Creator/Contributor entitlements, appoint Administrators,
alter Board roles, change executive authority, manage billing, change global
security configuration, alter production infrastructure, grant themselves
privileges, or read unrelated private information.

Least privilege applies (section 22).

## 10. Senior Moderator

Represents increased operational trust: everything a Moderator may do, plus
escalated-case review, more serious conduct handling, mentoring Moderators,
moderation-consistency review, limited queue oversight, and recommending
suspensions or escalations.

Exact permissions: **OWNER DECISION REQUIRED BEFORE IMPLEMENTATION.** No
unrestricted powers are implied.

## 11. Lead Moderator

The highest currently planned moderation-specific role: moderation-team
coordination, difficult-case escalation, policy-consistency oversight, review of
Senior Moderator actions, communication with Administrators on serious cases, and
moderation workflow oversight.

Lead Moderator remains below administrative/platform authority unless separately
appointed to an Administrator role.

## 12. Moderation is not administration

Record explicitly:

> **Moderator authority is content/community enforcement authority. Administrator
> authority is broader platform/member operational authority.**

A Lead Moderator does not automatically become an Administrator. An Administrator
does not automatically become a community leader or Board Member.

## 13. Administration family

Working architecture names:

- **Administrator**
- **Senior Administrator**
- **Platform Administrator**

Historical documentation also referenced **Assistant Administrator**. That term is
preserved in section 45 rather than erased; whether it remains an official role is
an owner decision.

## 14. Administrator

Trusted operational authority over defined administrative functions, potentially:
member management, account administration, Creator/Contributor administration,
moderation escalation, content-management operations, Education Center
administration where separately granted, Founding Membership administration where
explicitly granted, and system operational tools appropriate to the role.

Administrator does not automatically mean unrestricted platform authority.

## 15. Senior Administrator

Higher operational trust: broader administrative management, complex account
issues, role management within delegated scope, oversight of standard
Administrators, higher-risk operational actions, and escalation handling.

Exact sensitive permissions must be defined explicitly before implementation.

## 16. Platform Administrator

The highest currently proposed non-owner operational tier: broad Administration
Center access, platform configuration, system management, security operations,
staff-role administration where authorized, and advanced member/account
operations.

Platform Administrator does not automatically mean Founder, CEO, Board Member, or
Gold Medallion holder. Operational power and organizational office remain
different concepts.

## 17. Owner / Founder authority is separate

The Founder/Owner must not be modeled as another ordinary Administrator tier.
**Owner / Founder Authority** represents the highest organizational
ownership/control authority, and may include Full Platform Authority once that is
formally documented. The owner may exercise administrative capabilities without
being visually represented as "Platform Administrator": the owner is Founder/CEO
first, and administrative access follows from explicit authority.

## 18. Current owner

Current TPI owner: **Todd Wayne** — Founder, Chief Executive Officer, and Board
role as legitimately established. Operationally the owner requires full
administrative access.

Those organizational offices must not be collapsed into an `admin` label. A future
UI may display **Founder / CEO** while authorization resolves Full Platform
Authority once that is formally implemented.

## 19. Role stacking

Every combination must be expressible without overwriting another role:

| Example | Membership | Capability | Operational |
|---|---|---|---|
| A | Free | — | Moderator |
| B | Paid | — | Senior Moderator |
| C | — (Founding Contributor) | Contributor | Lead Moderator |
| D | Paid | Creator | Administrator |
| E | — (Founding All-Access) | Creator + Contributor | Senior Administrator |
| F | — | — | Founder/CEO + Full Platform Authority + Gold Medallion |

## 20. A single role column is not the final architecture

The historical single-role account model is insufficient for the complete future
architecture. It must not be modified under 003B. Future implementation should
support cumulative sources of membership, professional entitlement, staff
authority, organizational office, leadership authority, and honors.

## 21. Server-side authority

Operational authorization is always evaluated server-side. Never authorize
Moderator or Administrator functions from a visible badge, profile text, HTML,
CSS, a JavaScript label, `localStorage`, a query parameter, or a client-supplied
role value.

## 22. Least privilege

Record as permanent:

> **Operational staff receive only the authority necessary for their assigned
> responsibilities.**

A Moderator does not receive Administrator access for convenience. An
Administrator does not receive Founder authority. Senior roles expand authority
deliberately instead of inheriting everything.

## 23. Capability-based authorization

Future implementation should favor explicit capabilities over coarse role checks.
Illustrative only — not final API names, not implemented:

`moderation.view_reports`, `moderation.resolve_reports`,
`moderation.suspend_content`, `members.view`, `members.manage`,
`members.suspend`, `founding_memberships.issue`, `creator_entitlements.manage`,
`contributors.manage`, `admin.staff_roles.manage`, `security.view`,
`security.manage`.

## 24. High-risk capabilities

Future elevated actions include: permanent account deletion, Founding Membership
assignment, staff appointment, privilege escalation, executive/Board changes,
security configuration, billing configuration, production-level settings, and
sensitive data export. The exact matrix belongs to future implementation and
security work.

## 25. Self-escalation prohibited

No staff member may increase their own privileges by editing their own account. A
Moderator cannot make themselves Administrator. An Administrator cannot make
themselves Founder. A Platform Administrator cannot grant themselves a Gold
Medallion or Board office unless governance policy separately authorizes it.

## 26. Appointment records

Operational roles must have recorded appointment authority. Future records should
support appointee, role, assigning authority, date/time, reason, and current state.
High-level staff appointments should be auditable.

## 27. Role states

Future operational roles support `active`, `suspended`, `revoked`, and `expired`
where appropriate. Historical service does not disappear when active authority
ends.

## 28. Authority versus history

If a person served as Moderator for three years and later steps down: current
operational authority is **none**, while an Honors Wall/service record may still
show **former Moderator / service distinction** if TPI chooses to recognize it.
Past service never grants current permissions.

## 29. Operational service insignia — imported masters

Two official operational-role badge masters now exist in the repository:

| Identity | Owner source | Repository master | Format | Dimensions | Alpha | SHA-256 |
|---|---|---|---|---|---|---|
| Administrator | `/Users/toddknipple/Desktop/ADMIN.png` | `assets/operational-roles/masters/AdministratorBadgeMaster.jpg` | JPEG (delivered with `.png` extension) | 1024 × 1024 | none | `683b7c1237879092bcbb996a7c91653cb6e752c10f22ac8b54c40d08d667facc` |
| Moderator | `/Users/toddknipple/Desktop/MODERATOR.png` | `assets/operational-roles/masters/ModeratorBadgeMaster.jpg` | JPEG (delivered with `.png` extension) | 1024 × 1024 | none | `48aa9ad5d7879432408c09e298cafa26a2a958bab4c82f308e695e26b0ea1d36` |

**Administrator / Moderator badge artwork exists. Separate Senior / Lead /
Platform insignia remains undecided.** No derivatives are published, and no
display surface references the masters. Provenance, regeneration, and the recorded
asset defects are documented in
[`../../../assets/operational-roles/README.md`](../../../assets/operational-roles/README.md).

The Moderator master carries a **baked checkerboard matte** where transparency was
intended (JPEG cannot store alpha), so it cannot be placed on the dark interface
without rework. That is recorded as an owner-resolvable defect, not repaired here.

## 30. Service insignia are not leadership medallions

Operational insignia remain distinct from the Gold, Silver, and Bronze Medallions,
future Board medallions, and the Founding Membership badges. A Moderator badge
represents operational service; a Gold Medallion represents a separate
leadership/honor concept.

## 31. Honors Wall relationship

Operational service may eventually appear in **TPI Honors & Distinctions** and the
**Honors Wall** — for example Moderator Service, Senior Moderator, Administration
Service, or Years of Service. Public display is never authorization.

## 32. Staff privacy

Future implementation should distinguish public-facing staff distinction, private
operational permissions, and security-sensitive staff metadata. A member may
publicly show that they are a Moderator without exposing the capability matrix.

## 33. Moderation audit

Future moderation actions should be auditable where appropriate: actor, action,
target, reason, timestamp, previous state, resulting state. Avoid unnecessary
collection of private data.

## 34. Administrative audit

Sensitive administrative operations should be auditable, particularly staff-role
changes, Founding Membership assignments, entitlement changes, account suspension,
high-risk data actions, and security changes.

## 35. Moderation appeals

**Moderation Appeals / Review Process — OWNER DECISION REQUIRED.** The architecture
must allow escalated review by more senior operational authority; the full appeals
system is not designed here.

## 36. Account suspension authority

Exact suspension powers are defined later. Conceptual direction: Moderator —
limited temporary moderation actions; Senior/Lead Moderator — broader escalation
tools; Administrator — account-level operational actions; Owner/authorized
leadership — highest review authority. No exact limits are implemented here.

## 37. Permanent ban and deletion

Permanent destructive account actions are not casually delegated. Policy:
**OWNER DECISION REQUIRED.** Future implementation must distinguish content
moderation, temporary suspension, account restriction, permanent ban, and account
deletion — they are not equivalent operations.

## 38. Private messages

Operational roles do not automatically receive unrestricted access to private
member communications. Existing TPI privacy principles remain intact.
Administrators may need reported-conversation context, delivery/system health, and
abuse reports without silently browsing everyone's private messages.

## 39. Education Center authority

Administrator status does not automatically imply Education Center Editor,
Publisher, or Administrator. Those remain separate capability families; a person
may hold both, but neither creates the other.

## 40. Creator / Contributor authority

Administrator status does not automatically mean the Administrator personally
receives StudioFlow, Nova Edit, or the Nova Editorial Workspace. The ability to
administer a program and the personal entitlement to use a professional
application are different things.

## 41. Founding Membership authority

**CURRENT IMPLEMENTATION (factual).** Production permits an authenticated owner or
administrator to issue Founding Memberships: `requireAdmin` in
`functions/api/[[path]].js` accepts the account roles `owner` and `admin`, and the
issuance route additionally resolves the class and number server-side. No
operational role other than `owner`/`admin` exists today.

Future governance may formalize or narrow which operational roles hold
`founding_memberships.issue`. Production behavior is **not** changed by this
directive.

## 42. The owner cannot be locked out

Future role systems must prevent accidental loss of legitimate Owner/Founder
access. No ordinary staff-management action may demote the Founder, revoke Owner
authority, lock the Owner out, or transfer ownership implicitly. Any future
ownership transfer requires a separate explicit procedure.

## 43. Staff account security

Future operational accounts need stronger security consideration because
compromise has wider consequences: stronger authentication, session review,
security notifications, sensitive-action confirmation, and audit visibility.
No security change is implemented under 003B.

## 44. Current implementation versus future architecture

**CURRENT (verified 2026-11-03, production release `rel-d5fca8ea960d-5007997d873d`):**

- A single role value on the account record (`contributors.role`, default
  `contributor`) distinguishes `owner` and `admin`; there is **no** Moderator,
  Senior Moderator, Lead Moderator, Senior Administrator, or Platform Administrator
  role, and no capability table for staff authority.
- Administrative HTML routes (`/admin-panel`,
  `/admin-center-preview/*`, admin pages) and every admin API are gated
  server-side by an owner-or-admin session; anonymous and ordinary-member
  requests receive `403`.
- The Administration Center shows the owner a single protected session; there is
  no staff directory, role assignment, or permission inspection.

**FUTURE (this document, not built):** the tiered moderation and administration
families, capability-based authorization, appointment records, role states, staff
directory, and operational insignia. None of it exists yet, and no tier should be
described as available.

## 45. Terminology

| Term | Meaning |
|---|---|
| Moderator | community moderation |
| Senior Moderator | experienced/escalated moderation |
| Lead Moderator | moderation leadership |
| Administrator | general administrative operations |
| Senior Administrator | higher administrative responsibility |
| Platform Administrator | highest proposed non-owner platform operations |
| Owner / Founder Authority | separate highest organizational authority |
| Operational insignia | visual service distinction for a staff role |
| Capability | an explicit, server-checked permission |

## 46. Historical Assistant Administrator term

Existing TPI planning referenced **Assistant Administrator**. The term is recorded
rather than lost. Status: **OWNER DECISION REQUIRED** — whether it remains an
official role, maps to Administrator, sits below Administrator, or is replaced.
No prior documentation is silently rewritten.

## 47. Membership does not determine staff rank

Operational rank must not be based on whether a person is Free, Paid, Creator,
Contributor, or Founding. Appointment is its own decision.

## 48. Payment does not purchase staff authority

Record permanently:

> **No payment tier grants Moderator or Administrator authority.**

## 49. Achievement does not grant staff authority

A member does not become a Moderator by posting often, receiving reactions,
earning achievements, completing courses, or reaching content milestones. Those
systems may make someone worth considering; they do not create authority.

## 50. Medallions do not grant staff authority

A Gold, Silver, or Bronze image is never interpreted as an operational role.
Leadership authority and operational roles may interact later, but authorization
remains explicit.

## 51. Administration Center

The Administration Center will eventually become the primary interface for
operational staff. Preserved roadmap item: **TPI Administration Center — Complete
Quality & Functional Audit.** Future implementation should adapt visible tools to
the user's actual capabilities. Nothing is implemented now.

## 52. Future staff management

Future Administration Center functionality may support a staff directory, role
assignment, role suspension, permission inspection, audit history, appointment
notes, and role-state management. This requires a separate implementation
directive.

## 53. Badge families in the repository

TPI now recognizes three distinct families. They must never be collapsed into one
generic rank field.

| Family | Identities | Location |
|---|---|---|
| Founding Membership | Founding Creator, Founding Contributor, Founding All-Access | `assets/founding-memberships/` |
| Operational Service | Moderator, Administrator | `assets/operational-roles/` |
| Leadership / Society | Gold, Silver, Bronze, future Board/leadership medallions | `assets/society-leadership/` |

## 54. Unresolved owner decisions

- whether Senior Moderator is required;
- whether Lead Moderator is required;
- whether Assistant Administrator remains;
- final Administrator tier names;
- the exact permission matrix;
- who may appoint each tier;
- who may remove each tier;
- moderation appeal policy;
- account suspension limits;
- permanent-ban authority;
- public staff insignia design;
- service-recognition rules;
- whether Senior/Lead/Platform tiers receive separate artwork.

## 55. Non-goals of this record

No role assignment, permission change, staff tier implementation, profile change,
badge display, schema change, deployment, or Founding Membership issuance. The
policy architecture comes first.

## 56. Cross-references

| Record | Relationship |
|---|---|
| [`TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md`](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md) | Membership, capability, and Founding policy that staff roles sit beside |
| [`../../../assets/operational-roles/README.md`](../../../assets/operational-roles/README.md) | Operational insignia provenance, asset defects, regeneration |
| [`../007-SECURITY-AND-PERMISSIONS.md`](../007-SECURITY-AND-PERMISSIONS.md) | Current server-side authorization behavior |
| [`../008-ADMINISTRATION-CENTER.md`](../008-ADMINISTRATION-CENTER.md) | Administration Center status and roadmap |
| [`../TPI-CURRENT-DEVELOPMENT-STATUS.md`](../TPI-CURRENT-DEVELOPMENT-STATUS.md) | Newest verified change records |
| [`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md) | Development sequence |
| [`../100-DIRECTIVES/DIRECTIVE-INDEX.md`](../100-DIRECTIVES/DIRECTIVE-INDEX.md) | Directive history |

## 57. Next section

**TPI-GOVERNANCE-003C — Governance, Board & Executive Leadership Architecture**
will address Founder, CEO, President where applicable, Board structure, Chair, Vice
Chair, Secretary, Treasurer, Directors/Board Members, organizational office versus
operational authority, Full Platform Authority, and the relationship to future
leadership medallions. The full Medallion system receives its own later section.

# TPI Membership and Professional Access Architecture

Effective: 2026-11-03
Status: **AUTHORITATIVE POLICY — DOCUMENTATION ONLY. NO APPLICATION, DATABASE,
OR DEPLOYMENT CHANGE.**
Authority: owner directive TPI-GOVERNANCE-003A
Section: TPI-GOVERNANCE-003, section A (Core Membership & Access Architecture)
Companion sections: TPI-GOVERNANCE-003B — operational roles (Moderators &
Administrators), recorded in
[TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md](TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
— and the later Honors/Leadership section. Neither is defined here.

This document is the policy foundation for subscriptions, entitlements,
professional applications, Education Center access, StudioFlow, Nova,
achievements, profiles, honors, and Administration Center management. It records
what TPI intends and what already exists in production; it implements nothing.

Implementation records remain authoritative for behavior:

- [`../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`](../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md)
  — classes, permanent numbers, assignment, lifecycle, entitlements, badges.
- [`../007-SECURITY-AND-PERMISSIONS.md`](../007-SECURITY-AND-PERMISSIONS.md)
  — server-side authorization boundaries.
- [`TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`](TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md)
  — Nova product family.
- [`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md)
  — development sequence.

Where this document and an implementation record disagree about current behavior,
the implementation record and the running system win; this document then needs
correction, not the system.

---

## 1. Central rule

Record permanently:

> **Community membership, payment, professional application access, Founding
> status, organizational role, achievement, honor, and authority are separate
> concepts.**

One must not silently replace another. A member may hold several simultaneously,
and no layer may erase another layer's legitimate benefits.

Concretely:

| Layer | Question it answers | Examples |
|---|---|---|
| Community membership | May this person participate as a member? | Free, Paid |
| Payment / subscription | What is currently being billed? | monthly, annual, cancelled, none |
| Professional capability | Which professional tool families may this account use? | Creator, Contributor |
| Founding identity | Is this a permanent historical TPI distinction? | FC, FCT, FAA |
| Organizational role | What authority does this person hold over others? | Moderator, Administrator, Owner |
| Achievement / honor | What has this person earned or been awarded? | participation, service, distinction |

## 2. Membership layers

Conceptual architecture, top to bottom:

```
TPI Account
   ↓
Community Membership            Free or Paid
   ↓
Professional Capability Package Creator / Contributor / Creator + Contributor
   ↓
Optional Historical Identity    Founding Creator / Founding Contributor / Founding All-Access
```

The layers coexist. A Founding All-Access member is a Founding member *and*
holds two professional capability families; a paying Creator is a professional
member but not a Founding member; an Administrator holds authority but gains no
professional capability or prestige from the role.

## 3. Free Member

A Free Member is a normal registered TPI community member. Where currently or
eventually provided, Free Members receive:

- a TPI account and member profile;
- Community Feed participation, posting, commenting, and reactions where the
  community rules permit;
- Messenger / community communication where permitted;
- free public TPI content and free educational resources;
- eligible community achievements and participation recognition;
- future Honors & Distinctions profile access for distinctions actually earned.

## 4. Free Member limitations

A Free Member does not automatically receive: full premium site access, the full
Education Center, StudioFlow, Nova Edit, the Nova Editorial Workspace, professional
podcast or video production tools, professional Contributor/editorial tools,
unrestricted publishing capabilities, or Creator-specific applications.

Visible application links, profile badges, client-side text, CSS classes,
`localStorage`, or image URLs never grant access. Authorization is resolved
server-side (see section 33).

## 5. Free Members may earn honors

Free membership must not mean a member is socially insignificant. A Free Member
may eventually earn legitimate participation achievements, longevity recognition,
education achievements available to Free Members, community service distinctions,
moderation recognition when formally appointed, research or community honors, and
other eligible distinctions.

Payment is not required to possess a meaningful Honors Wall. Honors rules,
including Gold/Silver/Bronze and role Medallions, are intentionally **not**
defined in this document; they belong to the later Honors/Leadership section.

## 6. Paid Member

TPI will support a normal paid community membership. The marketing name is
**OWNER DECISION REQUIRED** and must not be invented here; "Paid Member" is a
working term.

A Paid Member receives everything included with Free Membership, plus the premium
regular-member experience TPI defines.

## 7. Paid Member expected access

Current policy direction only — not a committed feature list:

- full regular TPI member areas;
- full Education Center access;
- premium educational and research resources;
- expanded community features;
- other normal paid-member benefits established later.

Exact pricing and the detailed benefit list remain **OWNER DECISION REQUIRED**.

## 8. Paid membership excludes professional creation software

A normal Paid Member does not automatically receive StudioFlow, Nova Edit, the
Nova Editorial Workspace, professional Creator tools, or professional Contributor
tools. Those belong to separate optional professional upgrades.

This is intentional: a member who does not want professional creation software
should not have to buy it as part of ordinary premium membership.

## 9. Professional Creator upgrade

Creator is a professional capability package. It is **not** a community rank,
leadership rank, Board status, honor, or Founding status. Creator access may
eventually be purchased as an upgrade by eligible members.

## 10. Creator capability family

Intended to include, subject to actual implementation:

- StudioFlow (recording, livestream production, webinar production, podcast
  production, video-production workflows, production asset management);
- Nova Edit Documents and Nova Edit Slides;
- future Creator-specific applications.

Streaming, webinar, and podcast production already exist inside StudioFlow; the
Nova Edit components do not exist yet. Unfinished capabilities must never be
advertised as live.

## 11. Nova Edit

Nova Edit belongs to the Creator capability family and is intended to serve
scripts, show notes, episode planning, talking points, podcast preparation,
webinar preparation, livestream preparation, and production presentations.

Nova Edit remains unavailable until actually implemented. See
[`TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`](TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md).

## 12. Professional Contributor upgrade

Contributor is a separate professional capability family, not another name for
Creator. It focuses on research, editorial work, formal documents, Education
Center contribution, professional publishing workflows, and educational material
development.

## 13. Contributor capability family

Intended to include, subject to actual implementation:

- Nova Editorial Workspace;
- Nova Docs and Nova Slides;
- research-paper creation;
- formal editorial workflows;
- educational-content preparation;
- Education Center submission workflows;
- future Contributor-specific tools.

## 14. Contributor does not automatically mean publisher

Contributor professional access stays separate from Education Center Editor,
Publisher, and Administrator authority. A Contributor may prepare and submit
material without the right to publish directly to the live Education Center.
Publishing authority remains a separate permission layer, enforced server-side
and granted deliberately.

## 15. Creator + Contributor

A member may hold Creator and Contributor simultaneously. Effective capabilities
are the **union** of both sets. There must never be last-role-wins behavior, and
no assignment, plan change, or session event may silently drop one family.

This union is already implemented, and the All-Access badge resolves from one
class rather than two.

## 16. Combined professional access

Creator + Contributor eventually provides StudioFlow, Nova Edit, Creator
production tools, the Nova Editorial Workspace, Nova Docs, Nova Slides, and
Contributor/editorial tools, subject to actual availability.

Commercial packaging — one combined upgrade, a bundle, or two simultaneously
active upgrades — remains **OWNER DECISION REQUIRED**. Whatever the billing
presentation, the entitlement result must stay cumulative.

## 17. Paid access never creates Founding status

Record as an absolute rule:

> **Purchasing Creator, Contributor, or Creator + Contributor access never
> creates a Founding Membership.**

A future customer may purchase the identical functional professional access a
Founding Member possesses. They still do not become a Founding Member.

## 18. Founding classes

| Class | Display name | Number range | Capability set | Badge |
|---|---|---|---|---|
| `FC` | Founding Creator | `FC-001` – `FC-050` | `creator` | Founding Creator, green |
| `FCT` | Founding Contributor | `FCT-001` – `FCT-050` | `contributor` | Founding Contributor, blue |
| `FAA` | Founding All-Access | `FAA-001` – `FAA-050` | `creator` + `contributor` | Founding All-Access, purple |

Maximum lifetime issuance: **150 permanent Founding numbers**, 50 per class.
Authoritative detail: [`../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`](../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md).

## 19. Founding Memberships are conferred

Record permanently:

> **Founding Memberships are conferred, not purchased.**

They are awarded directly by TPI and cannot be obtained through checkout,
subscription upgrade, renewal, plan conversion, purchasing Creator access,
purchasing Contributor access, or purchasing both.

## 20. Free lifetime Founding Membership

Current policy intent: Founding Memberships are **complimentary lifetime
memberships** — price `$0`, duration lifetime — subject to account standing,
legitimate suspension/revocation rules, and program terms TPI establishes.

A Founding number remains permanent even if active access is later suspended.

## 21. Founding Creator

Receives a permanent `FC-###` identity, the Founding Creator badge, the Creator
capability family, and lifetime Creator access within the defined Founding
entitlement. It does **not** automatically provide Contributor capability.

## 22. Founding Contributor

Receives a permanent `FCT-###` identity, the Founding Contributor badge, the
Contributor capability family, and lifetime Contributor access within the defined
Founding entitlement. It does **not** automatically provide Creator capability.

## 23. Founding All-Access

Receives a permanent `FAA-###` identity, the Founding All-Access badge, the
Creator capability family, and the Contributor capability family.

All-Access must remain **Creator + Contributor**. It must not become a third,
unrelated professional permission system.

## 24. Founding All-Access visual identity

Internally: Creator + Contributor. Visually: **one** Founding All-Access identity
with the official purple badge. Creator and Contributor badges must never be
displayed as a substitute for the All-Access badge.

## 25. Founding badges are historical distinctions

A Founding badge represents historical Founding status, membership identity, and
TPI recognition. It is not merely an icon for current feature access. A person who
purchases equivalent access years later does not receive the badge.

Badge identity is resolved server-side from the class mapping; the client never
supplies a badge.

## 26. Permanent numbers

Founding numbers are unique, permanent, never recycled, never reassigned, and
historically preserved (`FC-001`, `FCT-001`, `FAA-001`). If a membership is
suspended or revoked, its number remains permanently associated with its
historical issuance.

## 27. Founding limit

Each class has exactly 50 lifetime issuance slots. There may never be `FC-051`,
`FCT-051`, or `FAA-051` unless TPI creates an entirely different future program
under a separate identity. The Founding allocation must never be expanded
silently.

## 28. Founding versus a future paid professional member

A future Paid Member who purchases Creator + Contributor may functionally receive
StudioFlow, Nova Edit, the Nova Editorial Workspace, and both tool families. They
do not receive an FAA number, the Founding All-Access badge, Founding status, or a
complimentary lifetime Founding membership.

## 29. Access resolution

Future access resolves from cumulative sources:

```
effective capabilities = union of valid entitlement sources
```

Sources may include a paid subscription, a Founding Membership, an explicit
administrative entitlement, organizational authority, and other authorized
sources. No single source may erase legitimate capabilities granted by another,
and expiry of a paid plan must not remove a Founding-derived capability.

## 30. Security principle

Never grant professional access based solely on a profile badge, client-side
text, CSS class, `localStorage`, an image URL, or a visible subscription label.
Authorization is resolved server-side, and every protected route re-checks it
rather than trusting a rendered control.

## 31. Education Center distinction

| Holder | Intended Education Center position |
|---|---|
| Free Member | limited / free Education Center content |
| Paid Member | full normal Education Center access |
| Contributor | professional contribution and editorial tools, not publishing authority |
| Education Publisher / Administrator | separately granted publishing authority |

These four positions must not be collapsed into one permission.

## 32. Examples

Each example is legitimate and must remain expressible in the data model.

- **Free Member:** Free membership, community achievements, education
  achievements, a Moderator role, Honors Wall distinctions — and no StudioFlow,
  Nova Edit, or Nova Editorial Workspace.
- **Paid Member:** premium community membership, full Education Center, premium
  member resources — and no professional Creator/Contributor tools.
- **Paid Creator:** Paid membership plus the Creator upgrade — StudioFlow, Nova
  Edit, production capabilities, no editorial environment.
- **Paid Contributor:** Paid membership plus the Contributor upgrade — full
  regular Education Center, Nova Editorial Workspace, Contributor workflows, no
  StudioFlow unless Creator is also active.
- **Paid Creator + Contributor:** both professional families, still a normal paid
  professional member.
- **Founding All-Access:** complimentary lifetime Founding membership, permanent
  FAA identity, official purple badge, Creator entitlement, Contributor
  entitlement — historically distinguished from future paid professionals.

## 33. Current production state (recorded 2026-11-03)

The Founding Membership foundation is **deployed and owner-accepted in
production** under TPI-CREATOR-INCENTIVE-001, 001A, 001B, 001R, and 001RA.

Production currently supports: FC, FCT, FAA classes; permanent non-recycled
numbering with the 50-per-class limit; cumulative entitlement resolution;
server-side badge mapping; Administration Center issuance by existing username;
audit and history; member and public profile badge display; and the Nova
entitlement hook.

As of 2026-11-03 the production registry is empty — 0 issued, 0 entitlements, 0
history entries — and the next numbers are `FC-001`, `FCT-001`, `FAA-001`.

**FAA-001 remains unissued**, pending the intended member's response and exact
production-account identification. The identity is not inferred anywhere, and
TPI-CREATOR-INCENTIVE-001F remains the assignment procedure.

No subscription, checkout, or payment capability exists. Nothing in this document
is implemented beyond the Founding foundation described above.

## 34. Future billing system

Billing comes later. It must eventually support Free, Paid, Creator upgrade,
Contributor upgrade, and Creator + Contributor without affecting permanent
Founding status.

## 35. Upgrade, downgrade, cancellation

Normal paid plans may start, stop, upgrade, downgrade, expire, and renew. Founding
identities do not follow subscription lifecycle rules: cancelling a payment must
never erase a legitimate Founding Membership, and downgrading a paid plan must not
revoke a Founding capability.

## 36. Terminology

| Term | Meaning |
|---|---|
| Free Member | normal free registered member |
| Paid Member | working term for premium regular membership until the owner chooses a marketing name |
| Creator | professional production entitlement |
| Contributor | professional editorial/research entitlement |
| Creator + Contributor | combined professional capability set |
| Founding Creator | conferred lifetime Founding Creator membership |
| Founding Contributor | conferred lifetime Founding Contributor membership |
| Founding All-Access | conferred lifetime combined Founding membership |
| Capability | a server-resolved professional entitlement (`creator`, `contributor`) |
| Layer | one of membership, payment, capability, Founding identity, role, honor |

## 37. Owner decisions still required

These remain open and must not be guessed, promised, or published as terms:

- marketing name of the regular Paid Membership;
- regular membership price;
- Creator upgrade price;
- Contributor upgrade price;
- combined-plan pricing;
- monthly versus annual options;
- trial policy;
- detailed premium-member feature list;
- billing provider and integration;
- cancellation and refund policy;
- exact public commercial terms.

Related unresolved area, recorded elsewhere and unchanged: Creator Incentive
financial rules (amounts, payout values, qualification thresholds, point systems,
revenue percentages, reward schedules, approval requirements, payout frequency,
accounting).

## 38. Explicit non-goals of this record

- No subscription, checkout, or payment code.
- No membership or entitlement schema change.
- No change to Founding logic, numbering, or badges.
- No production access change.
- No deployment.
- No Founding Membership issued.
- No definition of Moderator/Administrator ranks (TPI-GOVERNANCE-003B).
- No definition of Board or executive authority.
- No definition of Gold/Silver/Bronze or role Medallions.

## 39. Cross-references

| Record | Relationship |
|---|---|
| [`../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`](../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md) | Classes, numbers, assignment, lifecycle, badges — implemented detail |
| [`../007-SECURITY-AND-PERMISSIONS.md`](../007-SECURITY-AND-PERMISSIONS.md) | Server-side gates for capabilities, editorial access, admin authority |
| [`TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`](TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md) | Nova Edit, Nova Editorial Workspace, Nova Docs/Slides |
| [`../008-ADMINISTRATION-CENTER.md`](../008-ADMINISTRATION-CENTER.md) | Administration Center surfaces that administer these layers |
| [`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md) | Development sequence and current build state |
| [`../TPI-CURRENT-DEVELOPMENT-STATUS.md`](../TPI-CURRENT-DEVELOPMENT-STATUS.md) | Newest verified change records |
| [`TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md`](TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md) | Staff roles and authority that sit beside these membership layers |
| [`../100-DIRECTIVES/DIRECTIVE-INDEX.md`](../100-DIRECTIVES/DIRECTIVE-INDEX.md) | Directive history |

## 40. Next section

**TPI-GOVERNANCE-003B — Operational Roles: Moderators & Administrators** will
define Moderator, Senior Moderator, Lead Moderator, Administrator, Senior
Administrator, the Platform Administrator/Owner relationship, appointment,
permissions, separation from paid plans and prestige, possible service insignia,
and audit requirements. It is not defined or implemented under 003A.

# TPI Future Work Register

Effective: 2026-11-03
Status: **AUTHORITATIVE FUTURE-WORK INDEX — DOCUMENTATION ONLY. NOTHING HERE IS
AUTHORIZED FOR IMPLEMENTATION BY BEING LISTED.**
Authority: owner directive TPI-GOVERNANCE-003B2 (governance and community
future-work reconciliation)
Scope: every major future system established during TPI-GOVERNANCE-003A, 003B, and
003B1, plus the owner dependencies that block them.

This register exists for one reason:

> **Do not build these systems now. Make sure we cannot forget them later.**

An entry here is a commitment to remember the work, not permission to start it. Each
future system still requires its own owner directive. Nothing in this file assigns a
role, grants a permission, defines a qualification, creates artwork, or changes
production.

---

## 1. How this register relates to the other records

| Record | What it owns |
|---|---|
| This register | The list of future work, its status, and what blocks it |
| [`TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md`](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md) (003A) | Membership, payment, capability, and Founding policy |
| [`TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md`](TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md) (003B / 003B1) | Operational staff roles, authority, staff conduct, oath |
| [`TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`](TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md) | Nova product family |
| [`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md) | What has actually been completed, newest first |
| [`../../../assets/society-leadership/README.md`](../../../assets/society-leadership/README.md) | Gold / Silver / Bronze master and derivative provenance |
| [`../../../assets/operational-roles/README.md`](../../../assets/operational-roles/README.md) | Moderator / Administrator master provenance and asset defects |

The register adds no policy of its own. Where an entry implies a rule, the rule lives
in the owning record and this file only points at it.

---

## 2. Governance architecture — the next active section

### TPI-GOVERNANCE-003C — Governance, Board & Executive Leadership Architecture

Status: **NEXT GOVERNANCE SECTION — NOT YET AUTHORED. The owner has deferred
beginning 003C: after this register, current development priority is NOVA (see
section 13). 003C stays preserved here until the owner directs otherwise.**

It must eventually define, and separate:

- Founder
- CEO
- Board Member / Director
- Board leadership
- Chair, if adopted
- Vice Chair, if adopted
- Secretary, if adopted
- Treasurer, if adopted
- any other organizational office later adopted
- organizational office versus operational staff role
- executive authority versus Administrator authority
- **Full Platform Authority** — what it includes, who may hold it, how it is recorded
- appointment and removal authority for each office
- audit requirements for governance actions
- ownership protection, including the owner-lockout and implicit-succession questions
- governance history and succession recording

It must consolidate, in one place, the Owner/Founder Authority concept that 003B
deliberately left outside the administrator tiers. Bylaws are not invented here, and no
governance office is created by being named in this list.

---

## 3. Leadership medallions and honors

### TPI Leadership Medallions & Honors

Status: **FUTURE ARCHITECTURE — ASSETS PARTIALLY SUPPLIED, POLICY UNRESOLVED.**

Known assets already preserved in [`assets/society-leadership/`](../../../assets/society-leadership/)
as byte-identical masters with PNG/JPEG mismatch recorded and web derivatives for the
existing three.

Known direction:

- Gold is currently the highest planned leadership distinction.
- Gold, Silver, and Bronze are **Medallions**, not ordinary membership badges.
- Holding a Medallion does not automatically equal Board rank or any office.
- Governance office and ceremonial distinction remain separate things.
- Medallion artwork never grants permissions or access.
- **Primary Distinction** should eventually control the featured profile presentation.
- Multiple legitimate distinctions may coexist on one account.

Still unresolved:

- Silver qualification;
- Bronze qualification;
- exact Gold qualification beyond the established leadership intent;
- relationship between each Medallion and specific organizational offices;
- whether a separate Board Member medallion is needed;
- other future leadership medallions;
- exact public display behavior;
- succession and history rules.

Not to be implemented until the owner has completed and approved the larger medallion
set and its policy.

---

## 4. Owner asset dependencies

### ADDITIONAL BADGE / MEDALLION ARTWORK — OWNER ASSETS NOT YET COMPLETE

Status: **OWNER DEPENDENCY — BLOCKS NOTHING ELSE.**

Artwork that does not yet exist:

- Senior Moderator
- Lead Moderator
- Senior Administrator
- Platform Administrator
- Board Member
- other Board offices
- other leadership distinctions
- other Honors & Distinctions

The existing Moderator and Administrator masters remain the only currently supplied
operational-role masters, and the Gold / Silver / Bronze masters remain the only
supplied leadership medallions. No artwork is to be invented, generated, recolored, or
approximated, and the owner has indicated more and larger medallion artwork is still to
come.

Governance architecture work must not wait on these assets.

### Operational badge web derivative cleanup

Status: **FUTURE — REQUIRED ONLY WHEN OPERATIONAL BADGES ARE ACTUALLY DISPLAYED.**

`assets/operational-roles/masters/ModeratorBadgeMaster.jpg` contains a baked grey/white
checkerboard instead of genuine transparency. The master stays preserved and unchanged
with its hash recorded. When operational badges are genuinely implemented, the work is:

- create proper web/display derivatives;
- remove the visible checkerboard **only** from derivative artwork;
- keep the original master untouched;
- optimize for the dark TPI interface;
- verify the Administrator badge's background treatment on the same surfaces;
- preserve provenance and hashes for both master and derivative.

### Operational master release-packaging exclusion

Status: **REQUIRED BEFORE NEXT APPLICATION RELEASE CERTIFICATION.**

`scripts/deploy-production-guarded.mjs` filters unserved asset prefixes through an
explicit list that does not currently include `assets/operational-roles/masters/`.
`.assetsignore` currently prevents those masters from being publicly served, so nothing
is exposed today. The correction ensures the immutable certification candidate also
excludes the unserved masters, consistent with the Founding and Society asset policy.

The script is not modified by documentation directives, including this one.

---

## 5. Staff role finalization

Status: **UNRESOLVED POLICY — OWNER DECISION REQUIRED.**

### Moderator family

- whether Senior Moderator remains;
- whether Lead Moderator remains;
- exact capabilities per tier;
- appointment authority per tier;
- removal authority per tier;
- escalation boundaries between tiers.

### Administrator family

- whether the historical **Assistant Administrator** term remains, and what it maps to;
- whether it sits below Administrator;
- the exact Administrator hierarchy;
- Senior Administrator definition;
- Platform Administrator definition;
- the exact high-risk capability list;
- appointment and removal authority per tier.

No tier, capability, or appointment rule is settled by being listed here.

### Moderator / Administrator oath implementation

Status: **FUTURE — OATH DOCUMENTED, NOT IMPLEMENTED.**

The working oath is recorded in the operational-role architecture and approved in
principle by the owner. Future work must determine:

- final wording;
- the acceptance mechanism;
- appointment-time acknowledgment;
- where acceptance is recorded;
- renewal or reaffirmation policy, if any;
- relationship to staff training;
- the violation and review process.

The principles the oath states may not be weakened in any of that work.

---

## 6. TPI Community Standards

Status: **REQUIRED FUTURE WORK — NOT YET AUTHORED IN FULL. AUTHORING IS NOT AUTHORIZED
BY THIS DIRECTIVE.**

The standards must eventually become a complete, searchable authoritative policy. It
must cover at minimum:

**Freedom and expression** — freedom of religion, freedom of speech, freedom of the
press, legitimate criticism of The Paranormal Initiative itself (including its staff,
its moderation, and its decisions), skepticism, belief, evidence debate, and
viewpoint-neutral moderation.

**Member conduct** — bullying, harassment, intimidation, threats, stalking, targeted
abuse, doxxing, retaliation, coordinated harassment.

**Graphic and harmful material** — murder footage, executions, torture, rape and sexual
violence, dismemberment, mutilation, graphic human death, graphic animal death, animal
cruelty, severe injury, gore, self-harm imagery.

**Sexual material** — pornography, explicit sexual material, exploitation,
nonconsensual intimate content, child sexual exploitation and sexualization.

**Difficult paranormal-relevant topics** — the standards must distinguish discussing
murder from showing murder, discussing death from displaying graphic death, researching
occult history from displaying real abuse, discussing animal-mutilation claims from
posting shock imagery, and historical research from gore.

**Other areas** — privacy, impersonation, fraud, scams, evidence fabrication, spam,
advertising, intellectual property, plagiarism, illegal activity, disturbing content,
fictional and horror material, historical material, mature paranormal themes,
reporting, enforcement levels, warnings, suspensions, permanent action, appeals,
recusal, and staff accountability.

### Recorded philosophy the standards must preserve

> **TPI should be permissive about ideas and expression while being strict about actual
> harmful conduct and clearly inappropriate material.**

> **Moderate harmful conduct, not viewpoints.**

> **Members may vigorously challenge ideas, evidence, claims, and conclusions. They may
> not weaponize the community against another person.**

> **Paranormal does not mean anything goes.**

> **Paranormal relevance does not excuse harmful content.**

Something does not become acceptable because it is described as paranormal,
supernatural, occult, demonic, ritual, haunted, or unexplained. Conversely, the future
standards should not become unnecessarily restrictive merely because larger social-media
platforms use stricter automated moderation. Context matters, and keyword spotting is
not moderation.

---

## 7. Help architecture

### TPI Community Help Center

Status: **REQUIRED FUTURE WORK — NOT YET BUILT.**

Public and member-facing, searchable, organized by topic, written in understandable
language, and grounded in authoritative TPI documentation. Expected subjects: Community
Standards, memberships, Paid Membership, Creator access, Contributor access, Founding
Memberships, profiles, badges, Honors & Distinctions, the Honors Wall, reporting,
moderation, appeals, privacy, the Education Center, StudioFlow, Nova, accounts,
security, tutorials, and common questions.

### TPI Internal Help Desk

Status: **REQUIRED FUTURE WORK — NOT YET BUILT.**

For Moderators, Administrators, leadership, and authorized staff. It must eventually
explain: TPI organizational structure, membership structure, professional entitlements,
Founding Membership, Moderator duties, Administrator duties, operational hierarchy,
Board and leadership structure, ranks, badges, Medallions, Honors & Distinctions, the
staff oath, Community Standards enforcement, escalation, recusal, appeals, privacy,
auditing, Administration Center procedures, account administration, Founding Membership
administration, Creator and Contributor administration, security procedures,
troubleshooting, and staff training.

### Single source of truth

Status: **STANDING RULE — APPLIES TO ALL FUTURE HELP SURFACES.**

> **Authoritative TPI governance, policy, security, product, and operational Markdown
> remains the source of truth.**

The Community Help Center, the Internal Help Desk, and Mystic must derive their answers
from those approved records. They must not become independent competing policy systems,
and a published explanation never overrides the record it explains.

### Mystic — Help & Policy Assistance

Status: **FUTURE ROADMAP ITEM — NO AI IMPLEMENTATION AUTHORIZED.**

Future Mystic functionality may answer questions such as: what can a Moderator do; what
is Founding All-Access; why was my post removed; can I criticize paranormal evidence;
what does this badge mean; how do I report someone; what does Contributor access
provide; what does a Gold Medallion mean.

Mystic must be grounded in approved TPI documentation. Mystic must not invent policy,
permissions, ranks, sanctions, or membership benefits, and must not soften or extend an
answer beyond what the record states.

---

## 8. Honors, achievements, and profile presentation

### TPI Honors & Distinctions

Status: **FUTURE SYSTEM — NOT IMPLEMENTED.**

Profile section **TPI Honors & Distinctions**, collection and display **Honors Wall**.
Future categories may include Founding Membership, leadership Medallions, Board
distinctions, operational service, community achievements, educational credentials,
longevity, service recognition, Creator milestones, Contributor milestones, and research
distinctions.

Service recognition never reactivates expired or revoked operational authority, and
public display is never authorization.

### TPI Community Achievement System

Status: **FUTURE — NOT IMPLEMENTED.**

Potential recognition areas: meaningful participation, helping other members, years of
membership, education, community service, research contribution, legitimate Creator
milestones, legitimate Contributor milestones.

Raw-volume incentives that reward spam, meaningless posting, or reaction farming are to
be avoided. Payment must not automatically produce prestige.

### Education credentials

Status: **FUTURE — NOT IMPLEMENTED.**

Preserve the distinction between Education Center access, Contributor capability,
Education publishing authority, and education achievements or credentials. Education
credentials may eventually appear on the Honors Wall. They must not automatically grant
staff or leadership authority.

### Profile presentation and Primary Distinction

Status: **FUTURE REQUIREMENT — NOT IMPLEMENTED.**

An account may simultaneously hold membership status, subscription, Creator entitlement,
Contributor entitlement, Founding identity, Moderator or Administrator service, a Board
office, a leadership distinction, achievements, and education credentials. Future
profile presentation must support all of them without turning the profile into
uncontrolled badge clutter.

**Primary Distinction** remains the future mechanism for selecting the most prominent
visible distinction or medallion, while the full Honors Wall preserves the rest.

---

## 9. Administration Center future work

Status: **FUTURE — ROADMAP ITEM PRESERVED, NOT IMPLEMENTED.**

Preserved audit item: **TPI Administration Center — Complete Quality & Functional Audit.**

Future management areas:

- membership administration;
- professional entitlement administration;
- Founding Membership administration;
- Moderator and Administrator role management;
- permission inspection;
- staff history;
- honors management;
- distinction management;
- audit records;
- Community Standards enforcement tools.

Future UI should show only the tools the signed-in account's resolved capabilities
permit. None of this exists today: administration is still gated by an owner-or-admin
session.

---

## 10. Public policy versus internal procedure

Status: **STANDING ARCHITECTURE — RETAIN AS THESE SYSTEMS ARE BUILT.**

| Layer | Contents |
|---|---|
| Public / member-facing | Community Standards, Community Help Center |
| Internal / staff-facing | Internal Help Desk, staff procedures, permission matrices, escalation procedures, Administration Center operational guides |
| Authoritative source | Governance, policy, security, product, and operational Markdown |

This separation must be retained. The internal layer may explain more than the public
layer, but it may not contradict the authoritative source, and the public layer may not
be edited into a different rule set.

---

## 11. Not authorized to start

Explicitly **future work only**. None of the following is authorized by this register or
by 003B2:

- complete Community Standards;
- Community Help Center;
- Internal Help Desk;
- Mystic Help integration;
- new Moderator or Administrator artwork;
- Board medallions;
- additional leadership medallions;
- operational badge derivative repair;
- Honors Wall implementation;
- achievements implementation;
- staff hierarchy implementation;
- staff oath implementation;
- new role permissions;
- any application, database, or Worker change;
- any deployment or release certification.

The owner does not currently have all required artwork or final policy decisions. That is
acceptable and expected. These items stay visible on the roadmap without blocking
current architecture work.

---

## 12. Status summary

| Future item | Status | Blocked by |
|---|---|---|
| TPI-GOVERNANCE-003C governance architecture | Next governance section — deferred | Owner directive after the Nova program |
| Full Platform Authority definition | Part of 003C | 003C |
| Gold / Silver / Bronze medallion policy | Unresolved | Owner decisions on qualification |
| Board and leadership medallions | Unresolved | Owner artwork and policy |
| Additional badge / medallion artwork | Owner dependency | Owner artwork |
| Senior / Lead / Platform role finalization | Unresolved | Owner decisions |
| Assistant Administrator question | Unresolved | Owner decision |
| Staff oath implementation | Documented, not implemented | Owner directive |
| Complete Community Standards | Not authored | Owner directive |
| Community Help Center | Not built | Community Standards and help directive |
| Internal Help Desk | Not built | Staff policy finalization |
| Mystic help integration | Not built | Help Center / Help Desk content |
| Honors & Distinctions system | Not implemented | Policy and profile design |
| Honors Wall | Not implemented | Honors policy |
| Achievement system | Not implemented | Owner policy |
| Education credentials on Honors Wall | Not implemented | Education policy |
| Profile Primary Distinction | Not implemented | Honors policy |
| Moderator badge derivative cleanup | Not started | Actual badge display work |
| Operational master release exclusion | Required before release certification | Next release directive |
| Administration Center full audit | Preserved roadmap item | Owner directive |

---

## 13. Next active program

After this register, the owner has moved development priority to the NOVA
product family — **StudioFlow Nova Edit** (Creator-facing Nova Edit Documents
and Nova Edit Slides) and the **Nova Editorial Workspace** (Contributor-facing
Nova Docs and Nova Slides) — beginning with Nova architecture and repository
investigation before any implementation. See
[`TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`](TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md).

TPI-NOVA-004R6A (editorial submission, review and publishing authority) is
architecture-only, recorded in
[`TPI-NOVA-EDITORIAL-SUBMISSION-REVIEW-PUBLISHING-ARCHITECTURE.md`](TPI-NOVA-EDITORIAL-SUBMISSION-REVIEW-PUBLISHING-ARCHITECTURE.md).
Implementation has not started.

**TPI-GOVERNANCE-003C — Governance, Board & Executive Leadership Architecture**
remains the next governance section, but it is not scheduled to begin until the
Nova program is underway or the owner directs otherwise.

The unfinished Community Standards, the help systems, and the additional badge and
medallion artwork are not prerequisites for either track. They remain listed here
so they are not lost.

---

## 14. Cross-references

| Record | Relationship |
|---|---|
| [`README.md`](README.md) | Directory index for future development |
| [`TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md`](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md) | Membership and capability policy these items extend |
| [`TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md`](TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md) | Staff roles, authority, staff oath |
| [`../008-ADMINISTRATION-CENTER.md`](../008-ADMINISTRATION-CENTER.md) | Administration Center status and roadmap |
| [`../TPI-CURRENT-DEVELOPMENT-STATUS.md`](../TPI-CURRENT-DEVELOPMENT-STATUS.md) | Newest verified change records |
| [`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md) | Completed work sequence |
| [`../100-DIRECTIVES/DIRECTIVE-INDEX.md`](../100-DIRECTIVES/DIRECTIVE-INDEX.md) | Directive history |

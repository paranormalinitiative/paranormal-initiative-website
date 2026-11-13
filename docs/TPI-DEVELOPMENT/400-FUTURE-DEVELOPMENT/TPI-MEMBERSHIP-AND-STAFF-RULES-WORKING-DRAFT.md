# TPI Membership and Staff Rules

Date: 2026-11-13  
Status: **OWNER-APPROVED BASELINE — IMPLEMENTED IN SOURCE; RELEASE PENDING**

This document records the owner-approved role boundaries and the first
server-enforced implementation. The architecture records below remain the
policy sources for their broader topics. Until the guarded production release
completes, this document does not claim these new appointments or controls are
active on the live site. No staff appointment is made by this document.

## 1. Keep membership, access, office, and honor separate

An account can have more than one of these at the same time. None automatically
creates another:

| Layer | What it means | Examples |
|---|---|---|
| Community membership | Participation in the TPI community | Member, future paid community membership |
| Professional access | Which professional tools an account can use | Creator, Contributor, Dual (Creator + Contributor) |
| Founding identity | A permanent distinction conferred by TPI | Founding Creator, Founding Contributor, Founding All-Access |
| Organizational office | A position in TPI leadership | Owner, CEO, Founder, Director, Assistant Director |
| Operational staff role | Delegated authority to administer or moderate | Full Administrator, Administrator, Moderator |
| Honor or distinction | Recognition earned or awarded | Member badge, service recognition, leadership medallion |

A Contributor or Dual account does not become staff. A Moderator or Admin does
not receive Creator or Contributor tools just by holding that role. Badges and
profile text identify people; server-side records must determine access.

## 2. Membership and professional access

### Community Member

- May use community features available to their account and follow the Community
  Standards.
- Receives the TPI Member recognition badge in the profile Honors area.
- The Member badge is recognition of membership; it does not indicate staff
  authority or access to every professional tool.

### Contributor

- Receives the Contributor tools and capabilities assigned to that account.
- May publish directly in open Education Center subjects under the current
  publishing rule.
- Cannot publish to Ghostology or TPI Videos unless also explicitly authorized
  as an eligible executive leader.
- Contributor access does not grant administrative or moderation authority.

### Creator

- Receives the Creator tools and capabilities assigned to that account.
- Creator access does not grant administrative or moderation authority.

### Dual Member

- “Dual” means the account has both Creator and Contributor access.
- The account receives the union of both capability sets; one must not cancel or
  overwrite the other.
- Dual access is not a leadership rank, staff role, or Founding identity.

### Founding Member

- Founding status is conferred by TPI, not purchased or implied by staff service.
- The class and number are permanent historical recognition; access follows
  the recorded entitlement rules.
- A Founding badge does not grant staff authority.

Paid community membership names, prices, and exact benefits remain undecided.
Do not advertise a benefit until its implementation and terms are approved.

## 3. Leadership and staff authority

The following is the approved authority model. Leadership titles and staff
roles must be recorded explicitly; profile text or a badge alone is not proof
of authority.

### Owner / CEO / Founder / Director / Assistant Director

- The owner's stated intent is complete platform authority for this protected
  executive leadership group.
- Admins and Moderators must not remove, block, demote, disable, or lock out a
  protected executive.
- The Owner appoints or revokes Executive and Full Administrator appointments.
  The Owner and Executive leadership appoint or revoke Administrator and
  Moderator appointments. No one may appoint themselves. Each change requires
  a reason and is written to the administrative audit log.

### Full Administrator

- Holds broad delegated platform and member-management authority.
- May manage content, including removing inappropriate posts, and perform
  administrative work that is expressly granted by the server.
- Must not remove, block, demote, or disable a protected executive, another
  Administrator, or a Moderator.
- Must not grant themselves higher authority or bypass an executive safeguard.
- Does not appoint staff or administer Founding memberships, leadership honors,
  Creator incentives, security settings, or high-impact configuration.
- A “Full Administrator” label does not mean Owner or executive authority.

### Administrator

- Handles routine member, community, and content administration within assigned
  capabilities.
- May remove posts or other content that violates TPI rules. Removal should
  have a stated reason and an audit record.
- Must not remove or block protected executives, another Administrator, or a
  Moderator; must not self-elevate.
- Does not automatically control ownership, executive appointments, billing,
  membership entitlements, security settings, permanent account deletion, or
  unrelated private messages.
  Those capabilities require separate explicit grants.

### Moderator

- Reviews Community Feed posts and comments and addresses conduct that violates
  the Community Standards. The initial console can hide or remove posts and
  comments; every action requires a reason and is audited.
- Cannot change account access, appoint staff, or use the Administration
  Center. Warnings, temporary posting restrictions, report intake/triage, and
  appeals are not part of this first implementation.
- Does not appoint staff, change account access or billing, change security or
  platform configuration, permanently delete accounts, or inspect unrelated
  private messages.
- Must not remove content solely because of disagreement, criticism, skepticism,
  or an unpopular research conclusion.

### Member without staff authority

- May participate, publish where their account is allowed, and report content.
- Cannot moderate another member or administer accounts because of membership,
  Founding status, badges, popularity, or personal relationship.

## 4. Community conduct baseline — existing standards apply

The Community Standards remain the source for member-facing conduct rules.
These principles guide staff enforcement and do not create a new site policy:

1. Treat other members respectfully. No targeted harassment, threats, stalking,
   intimidation, or repeated unwanted contact.
2. Do not publish another person's private information, credentials, or private
   communications without authorization.
3. Do not use the community to defraud, impersonate, spam, recruit for violence,
   or coordinate harm.
4. Keep posts relevant to the selected area and follow its subject-specific
   posting rules.
5. Present paranormal, supernatural, metaphysical, and spiritual claims honestly.
   Distinguish personal experience, interpretation, and evidence; do not fabricate
   sources, results, or credentials.
6. Challenge ideas and evidence directly without attacking or organizing against
   the person presenting them.
7. Follow lawful and safe conduct during investigations, events, and field work.
   Do not trespass, endanger people, or encourage others to do so.
8. Respect copyright and permission when sharing writing, photographs, audio,
   video, or other people's work.

“Paranormal” is not an exemption from these rules. Enforcement should address
harmful conduct and clearly inappropriate material, not a viewpoint or a claim
merely because staff disagree with it.

## 5. Staff conduct and enforcement safeguards

- Apply the same standards regardless of membership class, staff title, personal
  relationship, viewpoint, or criticism of TPI.
- Use the least disruptive action that reasonably addresses the conduct.
- State the rule and reason when hiding content, issuing a warning, or applying
  a restriction, except where doing so would create an immediate safety risk.
- Keep an auditable record of staff actions and who took them.
- A staff member involved in a dispute should recuse themselves when practical
  and escalate it to an uninvolved reviewer.
- Provide a way to appeal significant moderation decisions to a different,
  higher-authority reviewer.
- Separate content removal from account suspension, permanent bans, and account
  deletion. Define who may authorize each step before those powers are built.
- No staff role may grant itself additional access. Use server-enforced,
  capability-specific permissions and protect owner recovery.

## 6. Remaining policy and product work

1. Define executive succession, ownership transfer, and any board governance in
   the separate governance architecture. Owner remains the protected highest
   authority in the current implementation.
2. Expand the role capability matrix as new administrative areas are reviewed.
   Current API route groups are documented in Security and Permissions.
3. Decide whether staff suspension is required. The first interface supports
   appointment and revocation, retaining appointment history.
4. Build member report intake/triage, warning/restriction actions, and an appeal
   path before claiming those Moderator powers exist.
5. Decide whether additional tiers such as Senior Moderator or Lead Moderator
   are needed. They are not implemented or implied by current badges.
6. Set the boundaries for temporary restrictions, account suspension, permanent
   bans, account deletion, and emergency action.
7. Define the appeal path and the required audit history.
8. Approve the member-facing Community Standards, including investigation
   safety, privacy, copyright, and content-specific rules.
9. Separately settle paid membership names, prices, and benefits before offering
   them publicly.

## 7. Current implementation boundary

As of 2026-11-13, source includes server-resolved staff appointments for
Executive, Full Administrator, Administrator, and Moderator; reasoned
appointment/revocation audit history; role-specific Administration Center API
allowlists; protected staff-account controls; and a dedicated Moderator console
for hiding/removing Feed posts and comments with a required reason. Existing
Owner/Admin account values retain their safe compatibility mapping. No
individual staff appointments were created during implementation. The additive
schema change and application controls are **not live until the guarded release
and live acceptance complete**. Refer to the dated completion record for the
latest release and verification state.

The Moderator console does not yet implement warning/restriction actions,
member report intake/triage, or appeals. Keep those powers out of role claims
until separately implemented and verified.

## Related authoritative records

- [Membership and Professional Access Architecture](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md)
- [Operational Roles and Administrative Authority Architecture](TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
- [Future Work Register](TPI-FUTURE-WORK-REGISTER.md)
- [Current Development Status](../TPI-CURRENT-DEVELOPMENT-STATUS.md)

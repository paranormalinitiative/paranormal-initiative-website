# TPI Member Help Center and Internal Help Desk

Date: 2026-11-14
Status: IMPLEMENTED — DEPLOYED AND LIVE-VERIFIED

## Decision

TPI now has two distinct support experiences:

- The public Member Help Center covers site use, member accounts, policies,
  privacy, safety, abuse reporting, research, community, and applications.
- The protected internal Help Desk covers Administration Center navigation,
  moderation, member blocking and restoration, staff appointments, publishing,
  Creator Studio/Nova operations, security, and audit practices.

The information architecture uses Facebook Help Center as a usability reference:
expandable topic groups, article counts, and nested guide links keep a large
support library scannable without copying Facebook content. All labels, routes,
content, and permissions remain TPI-specific.

## Navigation and content expansion

- The public Member Help Center now has expandable topic groups for getting
  started, account access, community, research, apps and Studio, policies and
  safety, media and events, teams and membership, and accessibility.
- The internal Help Desk now has expandable groups for Administration Center,
  moderation, member restrictions, publishing, apps and operations, security,
  daily workflow, incidents and outages, and staff training.
- The public Help Center is in the member left navigation immediately above
  `Log Out`.
- The internal Help Desk is in Administration Center under System navigation;
  it is no longer presented as a public or member sidebar destination.
- The Help Center hero typography was loosened so the eyebrow, headline, and
  supporting copy do not visually collapse into one block.

## Access boundary

The internal Help Desk namespace is server-gated for the owner, legacy admin,
and active Executive, Full Administrator, Administrator, or Moderator staff
appointments. Direct HTML routes, clean URLs, article routes, search routes,
contact routes, and internal data assets are covered by the same gate. The
member Help Center remains public.

The internal Help Desk explains existing controls; it does not grant roles,
bypass authorization, or replace the server-side policy for administrative
actions. The current account action is documented using TPI’s interface label
`Block Member`, with restoration documented as `Unblock / Restore Member`.

## Verification

- `node --check help-center.js` — passed.
- `node --check help-center-data.js` — passed.
- `node --check internal-help-center-data.js` — passed.
- `node --check worker.js` — passed.
- `npm run verify:help-center-separation` — passed, 11/11.
- Local browser verification — expandable member topic groups, nested member
  guides, protected Help Desk home, internal blocking procedure article, and
  internal search results passed.
- Anonymous HTTP verification — member Help Center 200; internal Help Desk
  403.

## Release verification

- Release candidate: `rel-9eafa6a97e67-9b145746774f` — Tier 1 certified with
  35 release gates passed.
- Source commit: `9eafa6a97e6765ef440ca952335ea063536ba4c7`.
- Deployed Worker version: `d4fcb7b5-03a8-49ba-8909-df2f28f949dd`.
- Rollback version: `b014cf10-77c6-497d-a224-15bd277aaf7a`.
- Live anonymous production smoke — passed, 10/10.
- Live isolated Firefox Developer Edition acceptance — passed, 65/65.

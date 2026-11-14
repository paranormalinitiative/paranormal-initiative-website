# TPI Member and Internal Help Center Separation

Date: 2026-11-14
Status: IMPLEMENTED — LOCAL VERIFIED / RELEASE PENDING

## Decision

TPI now has two distinct Help Center experiences:

- The public Member Help Center covers site use, member accounts, policies,
  privacy, safety, abuse reporting, research, community, and applications.
- The protected Internal Help Center covers Administration Center navigation,
  moderation, member blocking and restoration, staff appointments, publishing,
  Creator Studio/Nova operations, security, and audit practices.

The left-navigation information architecture remains familiar and scannable,
but all labels, routes, content, and permissions are TPI-specific.

## Access boundary

The Internal Help Center namespace is server-gated for the owner, legacy admin,
and active Executive, Full Administrator, Administrator, or Moderator staff
appointments. Direct HTML routes, clean URLs, article routes, search routes,
contact routes, and internal data assets are covered by the same gate. The
member Help Center remains public.

The Internal Help Center explains existing controls; it does not grant roles,
bypass authorization, or replace the server-side policy for administrative
actions. The current account action is documented using TPI’s interface label
`Block Member`, with restoration documented as `Unblock / Restore Member`.

## Verification

- `node --check help-center.js` — passed.
- `node --check help-center-data.js` — passed.
- `node --check internal-help-center-data.js` — passed.
- `node --check worker.js` — passed.
- `npm run verify:help-center-separation` — passed, 8/8.
- Local browser verification — member home, protected internal home, internal
  blocking procedure article, and internal search results passed.
- Anonymous HTTP verification — member Help Center 200; Internal Help Center
  403.

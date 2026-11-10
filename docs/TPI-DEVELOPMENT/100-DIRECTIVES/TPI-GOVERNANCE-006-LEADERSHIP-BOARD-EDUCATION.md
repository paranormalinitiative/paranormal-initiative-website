# TPI-GOVERNANCE-006 — Leadership Rank Safety and Education Subject Index

Date: 2026-11-09
Status: COMPLETE — DEPLOYED AND LIVE VERIFIED
Scope: Leadership medallions, Board Member rank/domain appointments, Education Center subject organization

## Objective

Make leadership and Board recognition safe to administer, with the medallion
derived from the selected role and displayed in Gold → Silver → Bronze order.
Make the Education Center use the same complete subject catalog as the Nova
Editorial Workspace and surface published contributor work under those subjects.

## Implementation

- Added the server-owned `LEADERSHIP_ROLE_CATALOG`. Founder/Director, CEO, and
  both Sol AI executive roles are Gold; Assistant Director and Senior Advisor
  are Silver; Community Liaison and Research Fellow are Bronze.
- Leadership assignment now accepts a role code only. The backend derives the
  medallion and rejects free or mismatched rank input. Existing recognition
  history remains intact and is labeled as legacy when it predates role codes.
- Added Board role and domain catalogs. Board Chair is Gold, Board Vice Chair
  and Committee Chair are Silver, and Board Member / Advisory Board Member are
  Bronze. Board domains cover Research & Investigation, Evidence & Analysis,
  Instrumentation & Technology, Education & Standards, Ethics & Professional
  Conduct, Community & Outreach, and Operations & Governance.
- Board appointments now store role, domain, and derived medallion metadata;
  the supplied Board Member badge remains separate and is still rendered.
- Added additive migration `0068_governance_role_rank_metadata.sql`.
- Added a shared `education-subjects.js` catalog used by the editor and public
  Education Center. Added a live published-contributor index with all 18 editor
  destinations, legacy shelves, and a Water & Steam ITC reference link.
- Existing article destinations were not rewritten. The index reads published
  records from `/api/articles`, so Steve Glanz's published Ethics paper appears
  under Ethics & Professional Standards when the live record is available.

## Verification

- `npm --prefix admin-center-app run build`: PASS
- `node scripts/verify/tpi-governance-004-leadership-distinctions.mjs`: 18/18 PASS
- `node scripts/verify/tpi-governance-004-local.mjs`: 10/10 PASS
- `node scripts/verify/tpi-governance-005-board-members.mjs`: 20/20 PASS
- `node scripts/verify/tpi-governance-005-local.mjs`: 11/11 PASS
- `npm run verify:governance-subject-index`: 24/24 PASS
- `npm run verify:release-safety`: 27/27 PASS
- Local-only migration application: PASS; migration 0068 applied to the
  isolated `tpi-local-foundation` database.
- Production additive migrations: PASS; `0067_board_members_and_badge.sql`
  and `0068_governance_role_rank_metadata.sql` were applied individually to
  the production D1 database, in order. No existing creator records,
  recordings, Notes, or shared storage objects were deleted or rewritten.
- Production schema readiness after migration: PASS; all required tables and
  role/medallion columns present, no pending migrations.

## Production release

The application and documentation were pushed on `codex/tpi-development` with
GitHub parity verified. The guarded release certified and deployed the exact
candidate `rel-f1c2b2c02c88-c6acf327c5ce` from source commit
`f1c2b2c02c8883eedd69f7abd4c689225530834b` and website release commit
`f1c2b2c02c8883eedd69f7abd4c689225530834b`. The active production Worker is
`6e552552-9458-4506-ab8f-48fd8e4b45fc` at 100% traffic; rollback target is
`a8184f43-8d53-437b-9a8f-bc88cef485f8`.

Release gates passed: certification 30/30, anonymous production smoke 10/10,
and isolated Firefox Developer Edition production acceptance 65/65. The
release candidate was reproducibly built with JavaScript
`index-BAUieVoD.js` (SHA-256
`06315f104af7ddef7637d4f2001556d50a1770fc9b21e354ffaa60ab946bfb0b`) and
CSS `index-V2mQ_DP8.css` (SHA-256
`6e68faa590fb4a116d57b71bb768835e6b901c8ffdd903eee75267d4fad9899b`).
The integrated StudioFlow entrypoint hash was
`98f050274c7855e0f74ee74d10951564715269a4557bb99d8ae959dae1dd49d2`.

The live published article API contains Steve Glanz's paper “ITC Ethics:
Curiosity Must Be Matched by Responsibility” under
`education-area-ethics-professional-standards.html`, so the subject index can
surface it under Ethics & Professional Standards. The deployed subject index
also retains the complete 18-destination editor catalog and the legacy Water &
Steam ITC reference shelf.

## Known limitation

The existing historical Board Member rows, if any, retain their appointment
history. New appointments use the governed role/domain form. Assigning a Gold
role to Todd or a Sol AI role to a human account remains an explicit protected
Administration Center action; the release does not infer identities from names.

Authenticated Administration Center assignment of a real owner/admin account
was not executed by automation because no owner credential was used. The
protected API and local authenticated workflow passed; live anonymous admin
access remains correctly denied (403). This is an acceptance boundary, not a
production deployment failure.

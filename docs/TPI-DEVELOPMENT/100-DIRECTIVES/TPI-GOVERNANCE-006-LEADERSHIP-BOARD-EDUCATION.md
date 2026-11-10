# TPI-GOVERNANCE-006 — Leadership Rank Safety and Education Subject Index

Date: 2026-11-09
Status: IMPLEMENTED — LOCAL VERIFIED / PRODUCTION RELEASE IN PROGRESS
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
- Production schema check before migration: BLOCKED because `board_members`
  was absent. No production database mutation occurred during local testing.

## Production release gate

The application commit must be pushed and the additive production schema must
be applied individually in order: `0067_board_members_and_badge.sql`, then
`0068_governance_role_rank_metadata.sql`. The maintained release preflight and
Firefox Developer Edition acceptance must then pass before production traffic
is changed. No existing creator records, recordings, Notes, or shared storage
objects are part of this release.

## Known limitation

The existing historical Board Member rows, if any, retain their appointment
history. New appointments use the governed role/domain form. Assigning a Gold
role to Todd or a Sol AI role to a human account remains an explicit protected
Administration Center action; the release does not infer identities from names.

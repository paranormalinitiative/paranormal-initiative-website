# TPI-GOVERNANCE-005 — Board Member Badge and Appointment Workflow

Date: 2026-11-09
Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED**
Source commit: `b695234b1148d7e3aa90043e4d1ea85ea8486465` on
`codex/tpi-development` (pushed to GitHub).

## Objective

Add the owner-provided Board Member badge and provide a protected, auditable
workflow for appointing and revoking Board Member status for existing TPI
accounts.

Board appointments remain separate from Founding Memberships, Gold/Silver/
Bronze medallions, and account roles. The badge is presentation and governance
identity; it does not grant access or entitlement.

## Implementation

- Added migration `0067_board_members_and_badge.sql` for append-only appointment
  history with active/revoked states and one active appointment per account.
- Added `lib/board-members.js` for server-resolved badge and appointment data.
- Added protected Admin Center routes:
  - `GET /api/admin/board-members`
  - `POST /api/admin/board-members`
  - `POST /api/admin/board-members/:id/revoke`
- Added the Board Members assignment, search, position, audit note, list, and
  revoke controls to the Admin Center preview.
- Added Board Member badge rendering to authenticated and public contributor
  profiles.
- Added the provided badge source and web derivatives:
  - `assets/board-members/masters/Board Member.jpg`
  - `assets/board-members/web/board-member-256.png`
  - `assets/board-members/web/board-member-512.png`

## Evidence

- Board Member source contract: **16/16 PASS**.
- Local integration: **10/10 PASS**.
- Existing leadership contract: **15/15 PASS**.
- Admin preview contract: **6/6 PASS**.
- Release safety: **27/27 PASS**.
- Local-only migration applied to `tpi-local-foundation`.
- Disposable `local_member` appointment was revoked before completion; no active
  local test appointment remains.

Badge hashes:

| Asset | SHA-256 |
| --- | --- |
| `Board Member.jpg` | `848ec01c8c4e7c58440f4182818b2692cecd1731bc856d788a4e168ae1f7e6f1` |
| `board-member-256.png` | `1eeb7097b5b3c013faf3f38f863b882d401f8178bc61db752e886c9f5ef6ff9e` |
| `board-member-512.png` | `49b485212f50958f8b2fcf59347da7006cf0f546eb6222401a5f41b5b80d860c` |

## Production release

The additive `0067_board_members_and_badge.sql` migration was applied to
production D1 before the guarded release, followed by the rank metadata
`0068_governance_role_rank_metadata.sql` migration. The production schema gate
passed with `board_members` and all governed role/medallion columns present.
The workflow shipped in release `rel-f1c2b2c02c88-c6acf327c5ce` on Worker
`6e552552-9458-4506-ab8f-48fd8e4b45fc` at 100% traffic, with rollback
`a8184f43-8d53-437b-9a8f-bc88cef485f8`. Certification passed 30/30, anonymous
production smoke passed 10/10, and isolated Firefox production acceptance
passed 65/65.

Live protected assignment was not executed with owner credentials. Anonymous
Admin Center access remains denied by design; the authenticated assignment
workflow is covered by the local integration tests and the deployed protected
routes.

The existing live Leadership/medallion workflow remains unchanged.

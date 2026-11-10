# TPI-GOVERNANCE-005 — Board Member Badge and Appointment Workflow

Date: 2026-11-09
Status: **IMPLEMENTED — LOCAL VERIFIED / PRODUCTION PENDING SCHEMA RELEASE**

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

## Production boundary

Production has not been modified by this change. The new workflow requires the
additive `0067_board_members_and_badge.sql` table in production D1 before it can
be safely enabled there. The maintained release process does not apply
production D1 migrations automatically, and the runbook prohibits ad-hoc
production migration execution. A separate authorized migration/release step
is required before production deployment.

The existing live Leadership/medallion workflow remains unchanged.

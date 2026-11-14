# Owner Administration Authorization Repair

Date: 2026-11-14 15:45:38 ET  
Incident: `TPI-AUTH-OWNER-ADMIN-2026-11-14`

Status: **REPAIRED AND LIVE VERIFIED**

## Reported impact

The Owner/Founder account could open the Administration Center but received:

> Your staff role does not have access to this administrative area.

The failure occurred when opening Founding Memberships.

## Confirmed cause

The signed-in account `Todd_Wayne` was stored in production with the legacy
base role `admin`, even though the account represented the Owner/Founder
leadership identity. The shared resolver correctly translated legacy `admin`
to the narrower `administrator` staff role. That role is intentionally denied
access to high-impact areas such as Founding Memberships.

This was an account authorization data mismatch, not a frontend navigation
failure.

## Repair

The exact active account was promoted from `admin` to `owner`, guarded by all
of the following conditions:

- contributor ID matched the authenticated Owner session;
- username matched `Todd_Wayne`;
- title remained `Founder / Director`;
- previous role was exactly `admin`;
- account was active.

The change affected one account only. An administrative audit record was also
written for the role correction. No memberships, posts, media, StudioFlow
data, Nova data, or other accounts were changed.

## Verification

- Production `/api/auth/me` now returns `role: "owner"` and
  `staffIdentity.role: "owner"`.
- Production `/api/admin/founding-memberships` returns **HTTP 200** for the
  authenticated Owner session.
- Production Admin Center opened directly at
  `/admin-panel#founding-memberships` with the Founding Memberships interface
  fully available.
- Existing staff-role source verification remains covered by the maintained
  role matrix.

## Permanent protection

Owner authorization is resolved from the server-side `contributors.role` field,
not from a display title, badge, membership, or browser state. The Admin Center
continues to re-check every protected API route server-side. Ordinary members
and narrower staff roles remain denied from Owner-only controls.


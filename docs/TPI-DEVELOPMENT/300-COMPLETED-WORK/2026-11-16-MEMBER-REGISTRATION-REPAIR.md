# Member Registration and Email Verification Repair

Date/time: **2026-11-16 13:36–20:12 EST**
Status: **DEPLOYED AND LIVE VERIFIED**

## What happened

Members reported that attempting to join TPI from the public community path
could fail with a generic request or signup-widget error. A later report added
that a laptop-created account could reach Member Home but could not complete
email verification, and profile information appeared not to remain after the
account was created.

The original atomic signup repair was still present. The recurrence was caused
by a later Worker API consolidation that removed the email-verification route
registrations and handlers while leaving the member UI, verification table, and
client calls in place. The client therefore received a route-not-found response
when it requested verification. The signup-to-profile-save-to-fresh-session
path also lacked a dedicated browser regression.

## Fix

- Account creation and the first authenticated session now use one atomic D1
  batch, so a transient failure cannot leave a half-created account.
- The registration response sets the secure session cookie and returns the safe
  member identity in the same response.
- The browser opens Member Home from that returned session instead of making a
  second login and third session request.
- Duplicate username/email races return a clear conflict message instead of an
  opaque server failure.
- Unexpected database failures return a safe retry message without exposing
  SQL details or credentials.
- `/register`, `/signup`, `/sign-up`, and `/members/register` GET links now
  redirect to the canonical registration form and focus it.
- Restored authenticated `/api/auth/verify-email/request` and
  `/api/auth/verify-email/confirm` routes using the existing verification table.
- Verification uses a branded one-time eight-digit code with a 30-minute
  expiry, invalidates older active codes, applies IP and account limits, and
  removes the token when email delivery fails.
- Email verification is scheduled after successful signup when the Worker
  context supports it, so an email provider problem cannot undo account/session
  creation.
- Confirmation updates the member first and consumes the token only after the
  update succeeds; invalid and expired codes return controlled errors.
- The member registration submit button now locks immediately on the first
  tap, exposes `aria-busy`, prevents duplicate in-flight signup requests, and
  reopens after a controlled failure so a slow phone connection cannot create a
  misleading second-request error.
- Every member-facing page now loads the same current `member-login.js?v=53`
  asset. Profile editing, verification controls, notifications, contributor
  pages, and protected member tools no longer drift onto an older script copy.
- Added the existing email-verification migration to the maintained local
  schema verifier and added a real Firefox regression for signup, profile save,
  fresh-session profile retention, and the protected verification route.
- The shared registration script cache version was advanced to `v53` so stale
  browser copies are not reused.

## Safeguards

- The public registration route remains unauthenticated but creates only the
  normal `member` role; it cannot grant staff, administrator, Creator Studio,
  or internal Help Desk access.
- Passwords continue through the existing salted password hashing helper.
- The session cookie continues to use the existing secure hosted-cookie policy.
- No production account was created during diagnosis or verification.
- The maintained full release preflight now includes both registration source
  contracts, email-verification route coverage, and a Firefox end-to-end local
  signup/profile-retention test.
- Email verification remains member-only and cannot grant staff, administrator,
  Creator Studio, or internal Help Desk access.

## Verification

- Registration source contract: **14/14 PASS**.
- Firefox local end-to-end signup/profile test: **PASS** — account creation,
  atomic session, Member Home redirect, protected verification route, profile
  save, and fresh-session profile retention verified with a temporary local-only
  account that was cleaned up after the test.
- Member interaction contracts: **35/35 PASS**.
- Password recovery contracts: **24/24 PASS**.
- Release safety: **38/38 PASS**.
- Release impact classification: **15/15 PASS**.
- Local authentication lifecycle: **38/38 PASS** at each checkpoint;
  isolated Firefox acceptance: **65/65 PASS**.
- Focused profile/feed acceptance: **57/57 PASS** after a transient first-run
  browser timeout was rerun standalone; focused Messenger acceptance:
  **27/27 PASS**; Messenger media roundtrip: **PASS**.
- Full guarded preflight: **11/11 certified gates PASS** for the website
  release `rel-6f86d2e34192-e2d62b6bae9a`.
- Production smoke: **10/10 PASS**; Worker version
  `89be4f97-0d2c-4af4-9fc8-c3a2dd3f718c` reached 100% traffic. Rollback target
  is `3c2674b2-bb00-4820-820e-f65dd54f028e`.
- Live boundary checks: anonymous verification request returns the expected
  controlled **401**, the maintained synthetic login returns **200**, and an
  invalid eight-digit confirmation returns the expected controlled **400**.
  The live test intentionally did not send email or modify a real member
  account.

The physical signup-button interaction was repeated in three sequential fresh
Firefox sessions after the busy-state repair: **3/3 PASS**.

The follow-up member-page freshness repair is live in release
`rel-406da3f0cf64-ea56526811d7`, serving Worker
`15ba2065-c061-49aa-aafd-bc0d097d8542` at 100% traffic. Its rollback target is
`89be4f97-0d2c-4af4-9fc8-c3a2dd3f718c`; production smoke passed **10/10**.

No real production account was created during diagnosis or verification.

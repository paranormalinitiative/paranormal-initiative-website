# Member Registration Repair

Date/time: **2026-11-16 13:36 EST**  
Status: **IMPLEMENTED LOCALLY; RELEASE VERIFICATION IN PROGRESS**

## What happened

Members reported that attempting to join TPI from the public community path
could fail with a generic request or signup-widget error. The existing public
flow created the account first, then made a separate login request, then made a
third session check before opening Member Home. A failure in either follow-up
request could leave the member unsure whether the account existed and unable to
continue.

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
- The shared registration script cache version was advanced to `v51` so stale
  browser copies are not reused.

## Safeguards

- The public registration route remains unauthenticated but creates only the
  normal `member` role; it cannot grant staff, administrator, Creator Studio,
  or internal Help Desk access.
- Passwords continue through the existing salted password hashing helper.
- The session cookie continues to use the existing secure hosted-cookie policy.
- No production account was created during diagnosis or verification.
- The maintained full release preflight now includes both registration source
  contracts and a Firefox end-to-end local signup test.

## Verification

- Registration source contract: **9/9 PASS**.
- Firefox local end-to-end signup: **PASS** — account creation, atomic session,
  and Member Home redirect verified with a temporary local-only account that
  was cleaned up after the test.
- Member interaction contracts: **29/29 PASS**.
- Password recovery contracts: **23/23 PASS**.
- Release safety: **37/37 PASS**.
- Release impact classification: **15/15 PASS**.
- Local authentication lifecycle: **38/38 PASS** at each checkpoint;
  isolated Firefox acceptance: **65/65 PASS**.

Production deployment remains gated until the complete certified candidate
passes the maintained preflight and live acceptance workflow.

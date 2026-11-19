# Member Session Resilience Repair

Date: 2026-11-18  
Status: **DEPLOYED AND LIVE VERIFIED**

## Owner-reported symptom

A member reported that signing in returned him to the public home page instead
of leaving him in the authenticated member experience. The report was treated
as a site-wide authentication concern because the shared login/session path is
used by every member and by the member-facing applications.

## Root cause

The password and session creation path was valid, but optional post-login
lookups for capabilities, staff identity, membership recognition, and related
navigation data could still interrupt the response after a valid session had
already been created. That left the browser without a usable authenticated
payload and made the member appear to be bounced out of the site.

The login-identifier resolver also failed to await the legacy username-alias
fallback, so some older identifiers could not reliably resolve to their
account. These were shared authentication boundary defects, not a Bill-specific
account repair.

## Corrected and protected behavior

- A valid password now produces a usable session even when an optional
  capability or recognition table is unavailable. Optional fields fall back to
  safe empty values; core identity and the session cookie remain authoritative.
- `/api/auth/me` now preserves the authenticated member identity when optional
  staff, membership, leadership, or distinction lookups fail.
- Username and legacy-login-alias resolution now awaits each lookup and falls
  back deterministically.
- The new regression simulates a valid member login with every optional lookup
  unavailable and requires HTTP 200, a session insert, the member identity,
  and a session cookie.
- Existing server-side authorization remains authoritative. This repair does
  not weaken admin, StudioFlow, Nova, Messenger, notification, media, or
  member-data boundaries.

No Bill credentials were used, and no production account, membership,
entitlement, session, message, or member content was changed for diagnosis.

## Verification and release evidence

- Staff-role and authentication boundary regression: **24/24 passed**.
- Member-registration regression: **15/15 passed**.
- Password-hash regression: **10/10 passed**.
- Local member profile/feed Firefox acceptance: **57/57 passed**.
- Local authentication lifecycle: **38/38 passed** at each maintained
  restart/build checkpoint, including isolated Firefox acceptance **65/65**.
- Release safety: **38/38 passed**.
- Impact-aware shared-API preflight: **13 guarded gates passed**, including
  27/27 Messenger browser checks, MP4/ZIP media round trips, shared API
  authentication/member-boundary checks, staging, and protected-application
  byte integrity.
- Live anonymous production smoke: **10/10 passed**.
- Cloudflare confirmed the deployed Worker at **100% traffic**.

Release `rel-ee9e83bb4957-1d2331cfe75b` deployed source commit
`ee9e83bb4957cf3f99cc2f701800b291f87140a2` as Worker
`33209fd1-f5ca-410a-a98c-b5770be8f166`. Rollback reference:
`abe9b70b-115f-4dd0-a773-d4ebd195b39c`. The certified manifest digest is
`f906c169b03d25d202bb7701f6d91c9f61b65069e6ae4ffd0d3a2f1c6b490a5a`.

## Owner follow-up

Bill should retry the sign-in using the same identifier and browser. If it
still returns to the home page, capture the browser, the exact identifier
type used (email, username, or legacy alias), and whether a visible error
appears. That would indicate an account- or browser-specific issue rather
than the shared optional-lookup failure repaired here.

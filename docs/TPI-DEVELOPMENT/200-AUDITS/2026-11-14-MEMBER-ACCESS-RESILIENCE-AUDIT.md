# Member Access Resilience Audit — 2026-11-14

## Scope and outcome

This audit covers the production member login, password recovery, account
creation, session confirmation, and the release checks that failed to catch the
owner lockout. It is not a certification of every site feature or of email
delivery to every provider. The owner confirmed that signing in opened Member
Home after the legacy Admin session repair. The subsequent recovery safeguards
are deployed and live verified without using the owner's private credentials.

## Confirmed incident causes

1. The Member Login page had lost its final Save New Password action. Later,
   reset status appeared below the visible form and a successful save did not
   clearly hand the member to Member Home. The form, inline status, new session,
   and handoff were repaired.
2. A live-service availability probe for `/api/auth/me` blocked recovery and
   could divert hosted sign-in, registration, and invitation flows to stale
   browser-only behavior. These hosted flows now use the live member service.
3. Production had an active legacy Admin account and valid session, while the
   optional `staff_role_appointments` table was absent during diagnosis.
   A second unguarded query to that table made `/api/auth/me` fail for the
   owner, returning Member Home to Member Login. Legacy Admin identity now has
   a guarded fallback; a dedicated release regression covers that route.
4. Reset-code expiry compared ISO text to SQLite's space-separated timestamp,
   potentially extending validity. Both reset-code and session expiry now use
   normalized database date comparisons.
5. The release suite's synthetic member path did not cover the legacy Admin
   identity. Legacy Admin and recovery API/browser gates were added. The
   owner-confirmed login is the direct acceptance evidence for the incident.

## Safeguards now live

- Recovery requests have limits by source address and account email, plus a
  database cap of six generated codes per account in a rolling hour. Code
  confirmation has a separate source-address limit.
- The hosted recovery endpoint fails temporarily closed when its rate-limit
  binding is unavailable. A conditional database update claims a valid code
  once before changing the password and invalidating prior sessions.
- The request response does not reveal whether an account exists or assert
  that a message was delivered. The page shows a visible error or success
  state at the action used by the member.
- Hosted sign-in, registration, and owner invitations do not switch to
  browser-stored accounts when the live service probe fails.
- The release passed 33 preflight gates, live smoke 10/10, isolated production
  Firefox 65/65, and focused live recovery Firefox using mocked credentials.
  A single nonexistent-address request confirmed the production reset endpoint
  responded with the generic message. Real Yahoo delivery was not retested.

## Remaining work, ordered by impact

1. **High — password storage.** `hashPassword()` in the member API uses a
   single unsalted SHA-256 digest for passwords. Design a backward-compatible
   slow, salted password-hash upgrade on successful login and reset, then test
   legacy accounts and migration behavior before release. There is no evidence
   in this audit of a password database disclosure.
2. **High — recovery delivery observability.** Provider failures are logged,
   while members receive the same generic response for privacy. Add an
   operational delivery-failure signal and a safe support path so a delivery
   outage is noticed before many members report lockout. Test the provider
   failure path without exposing whether an account exists. This audit did not
   establish delivery to Yahoo or any other mailbox.
3. **Medium — reset transaction boundary.** The code is claimed before the
   password/session database batch. If that later batch fails, the code is
   consumed and the member must request a new one. Make code claim and account
   changes one database transaction if the deployed D1 API can guarantee that
   behavior, or provide a controlled recovery path. Preserve single-use codes.
4. **Medium — missing optional staff schema.** The compatibility fallback
   restores legacy Admin access, but the absent appointment table observed
   during the incident means staff appointment features need a separate schema
   readiness review. Do not run an unreviewed production migration.
5. **Medium — distributed attempt limits.** The Worker rate-limit binding is
   an approximate per-location limit. Shared addresses can also affect multiple
   legitimate members. Monitor false blocks and consider a durable account or
   challenge-based defense for distributed guessing. The eight-digit code is
   still the existing user-facing format.
6. **Low — API error boundary.** Route dispatch returns async handlers inside
   an outer `try` without awaiting them, so later promise rejections may bypass
   that catch. Review the router and add one failure-path regression before
   changing global error behavior.

## Stale-path cleanup rule

The browser-only account fallback was removed from hosted member access.
Inventory any remaining legacy account, email, and role paths against actual
production usage before deleting them. Preserve account data and access
history; cleanup here does not authorize destructive production data changes.

## Evidence

- [Member Login and Password Recovery Repair](../300-COMPLETED-WORK/2026-11-14-MEMBER-LOGIN-PASSWORD-RECOVERY-REPAIR.md)
- `functions/api/[[path]].js`, `lib/auth.js`, `lib/staff-roles.js`
- `scripts/verify/tpi-password-recovery.mjs`,
  `scripts/verify/tpi-password-recovery-browser.mjs`,
  `scripts/verify/tpi-staff-roles.mjs`
- Release `rel-ad0198bcf13d-be5a64930272`, Worker
  `c26d3d21-3d0e-4fe3-b401-87b4403f58a8`
- Cloudflare's [Workers rate limiting documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

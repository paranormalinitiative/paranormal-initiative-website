# Member Login and Password Recovery Repair

Date: 2026-11-14  
Status: **DEPLOYED AND LIVE VERIFIED**

## Incident

Production rejected the `todd_wayne` login with a normal username/password
mismatch response. The account existed, was active, and had a verified
correspondence email, but the password was unknown. The page also displayed
the stale **Contributor Access** label.

The password-reset request handler created a database token but never sent an
email, and the confirmation endpoint used by the page did not exist. That made
the reset UI appear functional while no reset could complete.

## Repair

- Connected password-reset requests to the configured Resend email provider.
- Added a 30-minute, single-use eight-digit reset code.
- Added the confirmation endpoint to hash the new password, consume the code,
  and invalidate existing sessions.
- Kept responses generic so account existence is not disclosed.
- Restored **Member Login** and **Member Access** labels in the page and
  footer.
- Added static and mock integration verification in
  `scripts/verify/tpi-password-recovery.mjs`.

No production member record, password, session, or schema was changed during
diagnosis or deployment. The release only changed application behavior.

## Verification and release

- Password-recovery verification: **11/11 passed**.
- Staff-role verification: **18/18 passed**.
- Release-safety verification: **28/28 passed**.
- Local authentication lifecycle: **38/38 passed** at each checkpoint.
- Full release preflight: **30/30 gates passed**.
- Live anonymous production smoke: **10/10 passed**.
- Isolated production Firefox Developer Edition acceptance: **65/65 passed**.
- Production schema readiness: **PASS**, with no pending migrations.

## Release identity

- Source commit: `85e5988d4690ffe38721906b4e8096aedeefca1`
- Release: `rel-85e59888d469-bf09e1872ef7`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `f7eb7aaa-c736-48bf-98a6-ebef34797245`
- Rollback version: `36ddd245-0ba1-4747-a475-a7b62da52c65`
- Release branch: `codex/tpi-development`

## Follow-up: missing final save action

The first recovery release exposed the code and password fields but omitted the
form's final submit button. The confirmation API was present and tested, but a
member had no visible way to invoke it. The follow-up adds **Save New Password**
and changes the form to show that action after the reset code is requested.

Verification passed **12/12** for password recovery, **38/38** for the local
authentication lifecycle, and **65/65** for isolated Firefox acceptance. The
full preflight passed **30/30**; live production smoke passed **10/10** and
isolated production Firefox passed **65/65**.

Follow-up source commit: `05bcb175909a5e0e52da35a052f7c07f086e31e2`

Follow-up release: `rel-05bcb175909a-6417cd0fffd8`

Deployed Worker version: `9552fe40-5519-41d1-b089-1582ce913c33`

Rollback version: `f7eb7aaa-c736-48bf-98a6-ebef34797245`

## Access repair after owner browser report

The prior fix still coupled code confirmation to the email request form. Its
save control was hidden until the email request completed in the same page
session. That failed the owner workflow of using an already received code,
especially with an empty required email field. A source-only assertion for the
presence of the button did not test whether it was actually visible.

The recovery panel now contains two independent forms. Save New Password is
visible whenever the panel is open, and it requires only the eight-digit code
and matching new password. The login HTML is delivered with `Cache-Control:
no-store`, and its script URL was updated. An isolated Firefox interaction
verified the rendered button and mocked confirmation against both local and
production pages. The production test did not submit an actual owner code.

The owner reported receiving a reset email. This contradicts the preceding
claim that DNS prevented delivery; that claim was unsupported and should not
be used as the incident cause.

Verification: recovery checks 12/12, local auth lifecycle 38/38 and Firefox
65/65, full preflight 30/30 gates, production smoke 10/10, production release
Firefox 65/65, targeted live recovery Firefox PASS, final login HTML response
`Cache-Control: no-store`.

Source commit: `cd6cb26318a91e42f54eba25eacfb9e32e8c1c83`

Release: `rel-cd6cb26318a9-86a3b5fb3aec`

Worker: `d71984cf-a52d-4d65-af82-c28b066b51e1`

Rollback version: `9552fe40-5519-41d1-b089-1582ce913c33`

### Follow-up auth audit findings

- Password-reset requests return a generic success even when the email
  provider rejects the send, making delivery faults invisible to the member.
- The eight-digit confirmation endpoint currently has no attempt throttle in
  application code. Add rate limiting before large-scale member onboarding.
- The original recovery regression test checked source text and a mocked API,
  so it missed the missing or hidden browser action. Keep the new Firefox
  interaction in the auth release gate.
- Owner completion with a real code and login is not independently verified;
  it requires the owner to enter the private code and password.

## Live service availability gate follow-up

The owner then saw “Password recovery needs the live member service.” Both
recovery actions ran `cloudflareReady()`, which probes `/api/auth/me`, before
calling the dedicated reset endpoints. This made an unrelated availability
check a hard prerequisite for recovery. The page now calls the request and
confirmation endpoints directly and surfaces their real errors.

The targeted Firefox interaction forced `TPIApi.isAvailable()` to return false
and verified that both actions still reached their mocked API calls. It passed
against the local and live pages. No actual owner code or password was entered
by the test. Password recovery checks passed 12/12, local auth lifecycle 38/38,
full preflight 30 gates, live anonymous smoke 10/10, and isolated production
Firefox acceptance 65/65. The release changed no production member record or
schema.

Source commit: `e5d9f57a0b0c5d7f00493ab3b1d423e7a5ad5346`

Release: `rel-e5d9f57a0b0c-c10bb753c43e`

Worker: `ec81be70-cdf1-4c61-96fa-aea079c70509`

Rollback version: `d71984cf-a52d-4d65-af82-c28b066b51e1`

### Recovery audit items

- The confirmation SQL compares ISO `expires_at` text with SQLite's
  `CURRENT_TIMESTAMP` text. This can accept a code beyond its intended
  30-minute lifetime on the same UTC day. **Resolved in the follow-up release
  below.**
- The confirmation endpoint has no attempt limit. Add a server-side limit before
  broad member onboarding.
- A failed email send is logged while the request still returns the same
  “instructions have been sent” message. Keep account enumeration resistance
  while making delivery failures operationally visible.
- The owner's successful password change and subsequent login still require
  the owner to complete the flow privately.

## Reset-code expiration correction

The confirmation query now compares `datetime(prt.expires_at)` with
`CURRENT_TIMESTAMP`, so ISO text and SQLite's clock are normalized to the same
format. The focused check exercises expired and unexpired values in SQLite;
password recovery passed 14/14. The local auth lifecycle passed 38/38, full
preflight passed 30 gates, live anonymous smoke passed 10/10, and isolated
production Firefox acceptance passed 65/65. No member record or schema was
changed.

Source commit: `32673265c10c79962c26869f67a377781ccf0d55`

Release: `rel-32673265c10c-c70252d5602e`

Worker: `4229354b-a0fd-4aa5-bfb3-08385104b6b7`

Rollback version: `ec81be70-cdf1-4c61-96fa-aea079c70509`

## Visible reset confirmation and Member Home handoff

The owner reported that Save New Password appeared to do nothing. The prior
page placed the result message below the login and registration cards, outside
the visible recovery panel. On success it also stayed on the same page without
signing the member in. The recovery panel now shows request, error, saving, and
success messages directly beneath the reset action. A successful confirmation
invalidates old sessions, creates a fresh session cookie, announces “Password
saved,” and opens Member Home after a short pause. A visible Member Home link
provides a fallback. An invalid code remains on the form with an inline error.

The focused browser test exercises both an invalid code and a successful
response. It passed locally and against the live page with mocked API calls;
neither test used an owner code or password. Password-recovery checks passed
15/15, local auth lifecycle 38/38, full preflight 30 gates, live anonymous
smoke 10/10, and isolated production Firefox acceptance 65/65.

A separate read-only production query counted one recently consumed reset code
for the owner's account. This is consistent with the prior Save action having
updated the password while its feedback remained offscreen. The query did not
read any code, password, or password hash. The owner's actual sign-in was not
performed by the agent.

Source commit: `541d8e29854a7a3f75c58ec29c65fe3e70c4052b`

Release: `rel-541d8e29854a-b916ab496c03`

Worker: `c9435aa6-59f8-486a-8aaf-2ab5819fb89b`

Rollback version: `4229354b-a0fd-4aa5-bfb3-08385104b6b7`

## Legacy Admin session bounce and password eye

The owner then reported that the page jumped toward Member Home and returned
to Member Login. Read-only production checks showed an active legacy Admin
account, a recently consumed reset code, and a valid session. The production
database did not have the optional `staff_role_appointments` table. The role
resolver already caught that absence, but `publicStaffIdentity` queried the
same table again without a guard. For a legacy Admin, `/api/auth/me` therefore
failed and the Member Home shell treated the session as absent. Anonymous smoke
and the synthetic member account had not exercised this legacy Admin path.

The identity builder now falls back to the existing Admin role if the optional
appointment table is absent. Hosted Sign In calls the live login endpoint
directly even when the unrelated availability probe fails, verifies the session
before redirecting, and shows any error beside the button. The password field
has an accessible eye button that toggles visibility while typing. The reset
success path also verifies its new session before redirecting, so a failed
session check produces a visible message instead of a redirect loop.

Verification: staff-role checks 20/20, password-recovery checks 15/15, local
auth lifecycle 38/38, full preflight 30 gates, live anonymous smoke 10/10,
isolated production Firefox acceptance 65/65, and targeted live Firefox PASS
for hosted login under a failed availability probe and the password eye. Tests
used synthetic or mocked credentials and did not access the owner's browser
profile. No production schema migration or owner account mutation was made.
Personal sign-in remains for the owner to verify privately.

Source commit: `44c8b8658580f40f9067885004a27cd0851ef802`

Release: `rel-44c8b8658580-42b7e7a720da`

Worker: `d68fde11-e688-457f-bb48-bada8978868f`

Rollback version: `c9435aa6-59f8-486a-8aaf-2ab5819fb89b`

Owner acceptance: the owner confirmed that signing in on production opened
Member Home. The private password was not shared with the agent. This confirms
the owner access incident is resolved; the separate recovery hardening items
above remain follow-up work.

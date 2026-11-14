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

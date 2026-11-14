# Password Hash Modernization and Login Compatibility

Date: 2026-11-14

Status: **DEPLOYED AND LIVE VERIFIED**

## Finding addressed

The member API stored passwords as one unsalted SHA-256 digest. That was a
confirmed security weakness in the existing implementation, not evidence that
the production database had been disclosed or that an account had been taken
over. A bulk production rewrite was not required and was intentionally not
performed.

## Repair

- New registrations, owner bootstrap, password changes, password resets, QA
  accounts, and local administrator resets now write a salted PBKDF2-SHA-256
  password record with 120,000 iterations.
- Existing 64-character SHA-256 records remain readable only through the
  successful password-verification compatibility path. After a valid login,
  the Worker upgrades that one account with a compare-and-swap update; a
  transient upgrade-write failure does not lock the member out and can retry on
  the next successful login.
- Reset-code rate-limit keys use a separate deterministic SHA-256 helper, so
  password salts cannot make throttling ineffective.
- Local synthetic-account and credential-reset tooling now understands the new
  format and verifies credentials without comparing random salted strings.
- The release preflight permanently includes the password-hash compatibility
  and upgrade regression.

No owner or ordinary member row was modified by the engineering tests or
production acceptance. Production acceptance used the protected synthetic QA
account only; its disposable login session was the only authenticated
production test state.

## Verification

- Password-hash regression: **9/9**.
- Password recovery API regression: **23/23**.
- Legacy Admin/staff-role regression: **20/20**.
- Persistent local authentication: **38/38** before restart, after restart,
  and after StudioFlow rebuild.
- Isolated local Firefox authentication/StudioFlow acceptance: **65/65**.
- Full certified preflight: **35 gates passed**, including isolated D1/R2,
  Firefox, StudioFlow lifecycle, Cloudflare, rollback, and immutable-candidate
  checks.
- Production anonymous smoke: **10/10**.
- Production isolated Firefox: **65/65**, with the synthetic production QA
  account and owner profile untouched.

## Release record

- Source commit: `710b6c9126f5d387a09632bc1263af2ea40375d7`
- Release: `rel-710b6c9126f5-dedd127c76c8`
- Worker: `6c84d19b-6e50-4d5d-a6d7-75da5152cf12`
- Rollback: `aabd3b01-6769-4402-b05a-b06cbe964c1c`
- StudioFlow source: `2c7c651f34839b0115596d632f1009214e4cd63d`

## Remaining boundary

Accounts that never authenticate remain in the legacy format until they use a
successful login, password reset, or password change. This avoids a risky
bulk credential operation while ensuring every active use of the account path
gets the stronger storage format. Recovery email-delivery observability,
recovery transaction boundaries, optional staff-schema readiness, distributed
rate-limit behavior, and the API async error boundary remain separate audit
items.

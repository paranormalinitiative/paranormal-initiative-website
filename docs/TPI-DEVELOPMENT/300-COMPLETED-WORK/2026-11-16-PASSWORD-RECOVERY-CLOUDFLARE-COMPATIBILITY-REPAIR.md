# Password Recovery Cloudflare Compatibility Repair

Date: 2026-11-16 17:53 EST  
Incident: `TPI-AUTH-2026-11-16-PBKDF2`

Status: **REPAIRED LOCALLY; GUARDED PRODUCTION RELEASE IN PROGRESS**

## What happened

Members could request a reset, but submitting an eight-digit reset code and a
new password could fail with Cloudflare **1101 / HTTP 500**. The owner could
still sign in, but the reset verification path did not complete reliably.

The production Worker log identified the exact exception:

> `NotSupportedError: Pbkdf2 failed: iteration counts above 100000 are not supported (requested 120000).`

The password-reset handler attempted to create the new password hash before
the recovery code lookup. Cloudflare rejected the 120,000-iteration PBKDF2
operation before the code could be confirmed or the password saved.

## Why the earlier repair missed it

The password-hardening release changed new and reset credentials to salted
PBKDF2-SHA-256 with 120,000 iterations. Node's Web Crypto accepted that value,
so the repository test passed. The Firefox recovery test mocked the API and did
not execute the Cloudflare Worker cryptography runtime. The release therefore
verified the application contract but not this provider-specific runtime
limit.

## Repair

- Set new and reset password hashes to 100,000 PBKDF2-SHA-256 iterations, the
  highest supported Cloudflare Worker boundary confirmed by the production
  exception.
- Treat higher-iteration stored records as unsupported instead of allowing a
  login attempt to throw a Worker exception. Members with such a record can
  use the repaired reset path to establish a compatible hash.
- Validate the reset code and active account before hashing the new password.
- Claim the code only after hashing succeeds, preventing a hashing failure from
  consuming a usable code.
- Preserve salted hashes, single-use codes, expiration checks, session
  invalidation, and existing legacy SHA-256 compatibility.

## Verification

- Password-hash compatibility: **10/10**.
- Password recovery API regression: **24/24**.
- Member registration regression: **9/9**.
- Production D1 read-only checks confirmed `password_reset_tokens` exists and
  the deployed reset lookup SQL is accepted by D1.
- Production Worker tail reproduced the original exception before the repair;
  no member password, reset code, or production record was exposed.

The guarded release and live reset verification are recorded below after
deployment completes.

## Prevention

Password hashing is now constrained by an explicit hosted-runtime maximum, and
the regression suite checks both the generated format and fail-closed behavior
for an unsupported higher-iteration record. Future security-parameter changes
must be exercised in the actual Worker runtime before release, not only in
Node or mocked browser tests.


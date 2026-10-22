# TPI-OPS-009 — Local Authentication and Synthetic Accounts

## Authorization

This directive authorizes a controlled local-only authentication implementation
and verification pass. It does not authorize deployment, remote D1/R2 access,
real member data, real credentials, public Worker traffic, or authentication
changes to hosted environments.

## Scope

The existing TPI authentication architecture remains the source of truth:

- `contributors` stores account identity, role, password hash, and active state.
- `sessions` stores expiring server-side session tokens.
- `lib/auth.js` validates the `tpi_session` cookie against local D1.
- Existing `requireMember`, `requireContributor`, `requireAdmin`, and
  `requireOwner` guards remain in use.

The implementation adds only the smallest local-runtime compatibility needed by
the HTTP loopback Worker and a repeatable synthetic fixture process.

## Local-only rules

The local exception is valid only when all of the following are true:

- `TPI_ENV=local` and `TPI_LOCAL_ONLY=1` are present in the local Worker.
- The request URL is plain HTTP.
- The request hostname is `127.0.0.1` or `localhost`.
- The request port is `8787`.

The code does not trust forwarded host headers. Hosted development and
production cookies continue to receive `Secure; HttpOnly; SameSite=Lax`.
Local cookies remain `HttpOnly; SameSite=Lax`, with `Secure` omitted only for
the approved HTTP loopback origin.

## Fixture process

From the canonical repository, run:

```sh
node scripts/local-auth-fixtures.mjs --local-only
```

The script validates `wrangler.local.toml`, reapplies the idempotent initial
schema to the isolated local D1 state, and creates synthetic accounts using the
application's existing SHA-256 password-hash format. Generated passwords are
stored only in `.local-dev/local-auth-credentials.json` with mode `0600`.
The file, generated SQL, local D1, and local R2 state are gitignored and must
not be copied into hosted environments.

Local identities are fictional and local-only:

- `local_admin` — the protected development administrator used by the owner;
  created only when absent and never overwritten by normal fixtures.
- `tpi_test_admin` — the automation-only administrator used by browser tests.
- `local_contributor` — `contributor`, active.
- `local_member` — `member`, active.
- `local_disabled` — `member`, inactive.

The fixture also seeds one expired session marker for rejection testing. It
never updates an existing password. The protected credential file and
persistent D1 hash are checked by OPS-009 before login.

API E2E is prohibited from reusing `.local-dev/state`. The former
`TPI_E2E_REUSE_LOCAL=1` path is now a hard failure. Full E2E must use the
disposable LaunchAgent Worker on port 8789 and temporary state under macOS's
temporary directory.

## Verification boundary

Use `scripts/qa/tpi-ops-009-authentication.mjs` only while the Worker is
running at `http://127.0.0.1:8787`. The test uses synthetic credentials,
localhost HTTP requests, the existing local banner, `/api/auth/me`, the
existing read-only `/api/admin/overview` route, and authenticated
`/member-home` navigation. It does not contact any hosted TPI Worker, remote
D1/R2, email provider, identity provider, RealtimeKit, Facebook, or scraper.

## Owner administrator recovery

The owner's development administrator `local_admin` lives in the persistent
local D1 state (`.local-dev/state`). Automated browser tests use the separate
`tpi_test_admin` identity. The fixture script never rotates an existing
password and refuses to run if its protected credential is missing while its
row exists. The API E2E seed cannot access this database.

If the D1 hash and protected credential drift, this targeted noninteractive
repair restores only `local_admin`, invalidates only its sessions, verifies the
account count and role, and never prints the password:

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs --restore-protected-local-admin
```

To regain access without deleting data, the owner runs the reset from their own
terminal (it reads the new password from a TTY and never prints it):

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs --target-username local_admin
```

This updates only the password hash of the named active `admin` or `owner`
account, invalidates its sessions, and leaves other accounts and Studio records
unchanged. When the target is `local_admin`, the protected credential file is
updated atomically so the browser, API regression, and D1 cannot drift apart
again. Do not run it from automated tests or fixture scripts.

The permanent lifecycle proof is:

```sh
npm run verify:local-auth-lifecycle
```

It verifies login before and after a managed Worker restart, rebuilds
StudioFlow, verifies login again, compares protected credential/D1
fingerprints, and runs complete acceptance in a disposable Firefox Developer
Edition profile.

The local D1 is intentionally the minimal OPS-008 foundation schema. Some
later administrative routes require additive capability columns that are not
part of that local schema; those routes are not silently upgraded or tested as
available by this directive.

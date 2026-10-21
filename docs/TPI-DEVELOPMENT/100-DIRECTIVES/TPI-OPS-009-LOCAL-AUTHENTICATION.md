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

Synthetic identities are fictional and local-only:

- `local_admin` — `admin`, active.
- `local_contributor` — `contributor`, active.
- `local_member` — `member`, active.
- `local_disabled` — `member`, inactive.

The fixture also seeds one expired session marker for rejection testing. The
process is safe to rerun and removes prior sessions for these fixture IDs only.

## Verification boundary

Use `scripts/qa/tpi-ops-009-authentication.mjs` only while the Worker is
running at `http://127.0.0.1:8787`. The test uses synthetic credentials,
localhost HTTP requests, the existing local banner, `/api/auth/me`, the
existing read-only `/api/admin/overview` route, and authenticated
`/member-home` navigation. It does not contact any hosted TPI Worker, remote
D1/R2, email provider, identity provider, RealtimeKit, Facebook, or scraper.

The local D1 is intentionally the minimal OPS-008 foundation schema. Some
later administrative routes require additive capability columns that are not
part of that local schema; those routes are not silently upgraded or tested as
available by this directive.

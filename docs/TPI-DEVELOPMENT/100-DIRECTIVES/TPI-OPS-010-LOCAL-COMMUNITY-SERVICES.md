# TPI-OPS-010 — Local Community Services

## Authorized scope

TPI-OPS-010 extends the isolated local Wrangler/D1 environment so the existing
Community Feed, Messenger, notifications, member directory, and member
personalization APIs can be exercised with fictional data. It is local-only.

The canonical application repository is
`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`, on
`codex/tpi-development`, with the local Worker at `http://127.0.0.1:8787`.
The existing StudioFlow room server at `127.0.0.1:8788` is a separate service
and must remain untouched.

## Safety boundaries

- No development or production deployment.
- No remote D1 or R2 access, imports, migrations, or data changes.
- No public Worker traffic, external service calls, or real member data.
- No reset, clean, commit, push, or unrelated worktree cleanup.
- No password, session token, or generated credential is stored in Git.
- Local fixture scripts require the explicit `--local-only` flag and validate
  `wrangler.local.toml` before writing.

## Implementation plan

1. Inventory the existing route handlers and authoritative migrations.
2. Create and verify a recoverable local D1 backup before schema changes.
3. Apply only the narrow schema required by the named local services.
4. Seed repeatable fictional records tied to the existing OPS-009 accounts.
5. Verify API authentication, authorization, ownership, isolation, persistence,
   notifications, personalization, and member-home routing.
6. Record browser reachability separately from authenticated API acceptance.

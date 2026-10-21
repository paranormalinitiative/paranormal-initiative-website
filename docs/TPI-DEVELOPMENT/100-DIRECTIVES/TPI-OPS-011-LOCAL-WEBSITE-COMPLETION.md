# TPI-OPS-011 — Local Website Completion

## Authorized scope

TPI-OPS-011 completes the missing local D1 dependencies required by the
existing member homepage and verifies the existing authenticated member
services against the isolated local Worker. This is local-only work. It does
not redesign the member homepage, change hosted environments, or copy real
member data.

Canonical repository:
`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Branch: `codex/tpi-development`

Local Worker: `http://127.0.0.1:8787`

StudioFlow room server: `127.0.0.1:8788` (preserved)

## Safety boundaries

- No development or production deployment.
- No hosted D1/R2 access, imports, migrations, or data changes.
- No external requests or public tunnels.
- No reset, clean, stash, commit, or push.
- No real member credentials, posts, messages, or media copied.
- Local fixture and schema scripts require `--local-only` and validate the
  isolated `wrangler.local.toml` configuration before writing.
- Historical research and unrelated dirty-worktree changes remain preserved.

## Implementation scope

1. Audit the existing member-home API dependencies and authoritative migration
   definitions.
2. Back up the persisted local D1 state before applying additive schema.
3. Apply only the verified tables and columns required by the existing
   homepage routes.
4. Extend the existing repeatable fictional fixture mechanism with one local
   record for each dashboard content type.
5. Verify anonymous protection, authenticated member-home APIs, existing
   Community Feed/Messenger/Notifications behavior, personalization, empty
   states, invalid filters, logout invalidation, and contributor access.
6. Verify browser reachability separately from authenticated browser visual
   acceptance without exposing synthetic passwords.

## Stop conditions

Stop before any hosted operation, remote data mutation, deployment, external
request, or credential exposure. Authenticated browser acceptance remains a
separate owner-controlled step when a secure browser credential bridge is
available.

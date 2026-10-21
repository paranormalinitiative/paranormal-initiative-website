# TPI-OPS-002 — Development Traffic Protection

## Directive scope

This directive investigates the Cloudflare Worker request surge affecting the
TPI development environment and adds local, fail-closed protections for
development verification traffic. The work is limited to request forensics,
safe client-side traffic controls, polling reduction for authenticated/live
surfaces, and documentation. It does not change production data, D1, R2,
billing, memberships, or deployment state.

## Safety gates

- Preserve the existing dirty worktree and unrelated changes.
- Do not reset, delete, or overwrite historical work.
- Do not probe the public Workers while Error 1027 capacity is active.
- Do not deploy until development capacity recovers and a guarded deployment
  preflight passes.
- Do not use paid APIs, change billing, or modify database/storage data.

## Authorized implementation

The implementation adds a shared request-budget helper for QA and browser
verification scripts. It enforces an explicit opt-in for non-local targets,
bounded concurrency, timeouts, bounded retries, Retry-After handling, and an
immediate stop for HTTP 429/Cloudflare Error 1027 responses. Existing member
and live-comment polling was tightened so guest users, hidden tabs, and
in-flight duplicate requests do not generate unnecessary traffic. StudioFlow
autosave remains fingerprint-gated; its local timer is not a one-second HTTP
poll.

## Implementation status

Local implementation and offline regression checks are complete. Cloudflare
deployment is intentionally blocked while the development Worker remains
rate-limited. No commit or push was made.

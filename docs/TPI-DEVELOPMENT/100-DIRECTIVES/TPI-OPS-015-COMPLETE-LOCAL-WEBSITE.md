# TPI-OPS-015 — Complete Local Website, Administrator Capabilities, and Page Verification

## Authorized scope

This directive establishes a complete local verification surface for the
existing TPI source code. It does not redesign pages, rebuild the application,
create a replacement website, deploy, contact hosted Workers, copy real data,
or alter the protected StudioFlow room server.

The canonical local environment is:

- Worker: `http://127.0.0.1:8787/`
- StudioFlow room server: `127.0.0.1:8788`
- D1/R2 state: `.local-dev/state`
- Configuration: `wrangler.local.toml`
- Environment: `scripts/local-dev.env`
- Branch: `codex/tpi-development`

## Required boundaries

- Use the existing authorization system and role checks.
- Keep local administrator access limited to the existing `owner`/`admin`
  roles.
- Keep contributor and member permissions separate.
- Use only fictional local fixtures and synthetic credentials.
- Apply authoritative schema migrations only to isolated local D1.
- Keep outbound request guards fail-closed.
- Do not deploy, import, publish, contact public Workers, or modify production.

## Required deliverables

1. Filesystem and runtime page inventory.
2. Administrator capability and role-boundary verification.
3. Local D1/R2 dependency verification.
4. Codex browser verification for administrator, contributor, and member roles.
5. Explicit distinction between verified, blocked, and unverified behavior.
6. Regression evidence and a final parity classification.


# TPI-STUDIOFLOW-026 Addendum A — Permanent Development Administrator Authentication

Status: IMPLEMENTED AND LOCALLY VERIFIED on 2026-10-22.

## Root cause

The persistent D1 `local_admin` row and the protected mode-0600 credential
file had different password hashes. The account existed and retained the
correct active administrator role, but credentials from the protected store
could not authenticate. The repository also retained an API E2E reuse mode
that seeded the owner's persistent `.local-dev/state`, violating the required
development/test database boundary.

## Permanent repair

- Restored only `local_admin` from the protected credential store and
  invalidated only that account's prior sessions. No account, Studio, scene,
  media, D1 table, or R2 object was deleted.
- Interactive `local_admin` password changes now atomically synchronize the
  protected credential file after the D1 postconditions pass.
- Added a noninteractive, owner-gated drift recovery command that never prints
  the password.
- Permanently disabled `TPI_E2E_REUSE_LOCAL`. API E2E must use the disposable
  port-8789 LaunchAgent and temporary D1/R2 state.
- OPS-009 now discovers the actual persistent D1 and always verifies the
  stored role, active state, and password hash against the protected store.
- Repaired local Worker ownership detection so Codex/macOS environments that
  deny `ps` can verify the same process chain through read-only `lsof`
  metadata instead of falsely reporting port 8787 as unowned.
- Added one maintained release workflow for local authentication, isolated
  E2E, Firefox Developer Edition, Git/GitHub, Cloudflare dry-run, live
  acceptance, and automatic Worker rollback.

## Commands

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

`release:production` cannot deploy a dirty tree, the wrong branch, or a commit
that does not match GitHub. It records the active Worker as rollback target,
checks the approved Cloudflare account, runs the guarded dry-run, performs the
guarded deployment, runs public smoke plus isolated Firefox production
acceptance, and automatically rolls back if acceptance fails. It contains no
D1 migration or R2 mutation step.

Production Firefox acceptance always requires manual sign-in inside the new
disposable profile. Local protected credentials are never sent to production.

## Verification evidence

- OPS-009 authentication and access boundaries: 38/38 before restart.
- Managed LaunchAgent Worker restart: successful.
- OPS-009 after restart: 38/38.
- StudioFlow production build: successful.
- OPS-009 after rebuild: 38/38.
- Firefox Developer Edition isolated `local_admin` StudioFlow acceptance:
  23/23, including backup, restore-as-new, switching, media persistence, and
  narrow layout.
- Credential and D1 fingerprints remained unchanged throughout the lifecycle
  proof.
- No production request or production-data mutation occurred during this
  local administrator repair.

## Recovery

Restore D1 from the protected established credential without displaying it:

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs --restore-protected-local-admin
```

Set a new private password from an interactive owner Terminal:

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs --target-username local_admin
```

Both paths preserve the account identity and role, invalidate only its
sessions, verify the account count, and leave StudioFlow data untouched.

# TPI-DEV-023 — Worktree Change Inventory

Date: 2026-10-14

## Repository state at reconciliation

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Checkpoint commit: `7d721b5fe2e3aeb65ddc59f7e50a7038613d4410`
- Previous HEAD before checkpoint: `18056c21a59838c16f4fef0b2b1061e55dbbe555`
- Remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`

## Classification

### A — verified application/source changes checkpointed

- `admin-events.html`
- `functions/api/[[path]].js`

The Events admin page now uses the protected persisted API. The API supports
admin detail, update, and soft-cancel routes; validates dates, URL schemes,
attendee limits, and status values; persists the complete event fields; and
writes create/update/cancel audit entries.

### B — verified development QA/support files checkpointed

- `scripts/dev/seed-tpi-dev-020.mjs`
- `scripts/dev/seed-tpi-dev-021.mjs`
- `scripts/qa/tpi-dev-020-acceptance.mjs`
- `scripts/qa/tpi-dev-021-integration.mjs`
- `scripts/qa/tpi-dev-022-media-search-studio-events.mjs`
- `scripts/verify/tpi-dev-022-offline.mjs`

These files contain synthetic development fixtures and tests. They do not
contain production credentials or Tavily keys.

### D — verified documentation checkpointed

- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`
- TPI-DEV-022 directive, audit, gap, and completion records.

The checkpoint intentionally did not stage every historical untracked report in
the worktree.

## Explicitly preserved and not staged

- `.DS_Store`
- `STUDIOFLOW_READINESS_AUDIT.md`
- `TPI_VS_PARAPOST_SOCIAL_NETWORK_COMPETITIVE_AUDIT_2026-10-09.md`
- unrelated prior TPI-DEV, TPI-TEAMS, and broad audit documents

These files were preserved in place and were not reset, overwritten, deleted,
or included in the deployment payload. Documentation-only untracked files did
not block the guarded deployment; uncommitted application files did.

## Follow-up QA-only adjustment

After deployment, `scripts/qa/tpi-dev-020-acceptance.mjs` was made explicit
about repeat-safe HTTP 409 responses for already-persisted synthetic team
claims. The following history checks continue to require the approved and
rejected states. This adjustment affects the QA harness only; it does not
change application behavior or the deployed Worker source.

## Safety result

The deployment guard reported `uncommittedApplicationFiles: []` and
`reproducibleFromHead: true`. No unrelated source change was discarded.

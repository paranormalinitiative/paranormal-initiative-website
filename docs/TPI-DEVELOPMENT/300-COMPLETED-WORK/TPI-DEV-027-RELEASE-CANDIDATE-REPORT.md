# TPI-DEV-027 — Release Candidate Report

Date: 2026-10-14

Status: `PREPARATION BLOCKED — STOPPED BEFORE FINAL RELEASE APPROVAL`

## Release candidate

- Candidate commit: `71047c1ef394a1347ef862b3dc841767dc630809`
- Candidate branch: `codex/tpi-development`
- Production target: `theparanormalinitiative`
- Production D1: `tpi_contributor_portal`
- Production R2: `tpi-contributor-media`
- Current production Worker version: `7e357215-2579-4c60-b27e-dd572a5656fe`

## Gate results

| Gate | Result |
| --- | --- |
| Repository and branch verification | PASSED |
| Production binding verification | PASSED, read-only |
| Production D1 schema inventory | PASSED, read-only |
| Development D1 schema inventory | PASSED, read-only |
| Development/production migration reconciliation | BLOCKED |
| External production backup | NOT COMPLETED |
| Backup restore verification | NOT TESTED |
| Rollback readiness | BLOCKED |
| Release regression evidence | PARTIAL; development suites only |
| Final owner release approval | NOT REQUESTED, prerequisite gates failed |

## Required migrations

Wrangler reports production migrations pending from `0002_article_type.sql`
through `0051_studioflow_workspaces.sql`, with `0002_contributor_profiles.sql`
already recorded. Production schema already contains many later tables, so this
list cannot be treated as a safe execution order. Migration `0033` is a data
copy, `0034` drops forum tables, and other files update or insert existing data.

## Exact commands reserved for a future approved release

These commands were documented only and were not executed:

```text
npx wrangler d1 export tpi_contributor_portal --remote --config wrangler.toml --output <approved-external-staging-path>
npx wrangler d1 migrations list tpi_contributor_portal --remote --config wrangler.toml
npx wrangler d1 migrations apply tpi_contributor_portal --remote --config wrangler.toml
npx wrangler deploy --config wrangler.toml
```

The migration and deploy commands must not run until the schema/history,
external backup/restore, rollback, and final owner approval gates pass.

## Expected production impact

If eventually approved, the release would add or change authentication,
authorization, Administration Center, creator, StudioFlow, Events, video, media,
search, community, messaging, notifications, and settings behavior. It must not
replace production D1/R2, import development data, activate Founding 50, or
modify existing member/content records outside an explicitly reviewed migration.

## Decision

Do not deploy. Resolve the D1 history discrepancy, complete external backup and
restore verification, rebuild the migration plan against the actual production
schema, and obtain explicit final owner approval.

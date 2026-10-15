# TPI-DEV-027 — Production Difference Analysis

## Revisions compared

- Remote production branch tip observed read-only: `f09e4e63a325235c9378ce69c0a91855ae166daf`
- Local development release candidate: `71047c1ef394a1347ef862b3dc841767dc630809`
- Local `main` branch is older than the remote main tip; this analysis uses the
  fetched remote tip rather than treating local `main` as current production.

The tracked source comparison contains 151 changed files, 8,857 insertions, and
370 deletions. It includes application source, Administration Center sources and
preview assets, migrations, scripts, and extensive documentation. This is not a
safe instruction to deploy the whole branch blindly.

## Change classes

| Area | Release relevance | Handling |
| --- | --- | --- |
| Authentication and sessions | High | Requires production compatibility and account/session regression testing |
| Authorization and creator entitlements | High | Must preserve production roles and keep Founding 50 inactive |
| Administration Center | High | Protected routes and production data compatibility required |
| Creator Partnership | High | Synthetic fixtures and allocations must be excluded |
| StudioFlow and workspace persistence | High | Requires migration 0051 compatibility and browser/RealtimeKit decisions |
| Events | Medium/high | Requires production schema and authenticated acceptance |
| Videos, media, and search | High | Existing records and R2 objects require preservation checks |
| Community, messaging, and notifications | High | Existing member content must remain intact |
| Migrations | Critical | Production ledger/schema mismatch; ordered review required |
| Development configuration | Excluded | `wrangler.dev.toml`, development D1/R2, and disabled outbound settings must not enter production configuration |
| Synthetic data and credentials | Excluded | No development accounts, fixtures, credentials, memberships, or research data may be imported |
| Documentation and tests | Not Worker runtime | Keep as release evidence; do not let them determine production bindings |

## Migration risk

Production reports migrations 0002 article type through 0051 pending, while its
schema already contains many later tables. Migration `0033` copies forum data,
`0034` drops the retired forum schema, and `0010`/`0012` contain data-changing
statements. These are not safe to apply as a generic backlog. A production
migration sequence must be rebuilt from verified schema/data evidence, with the
required backup and rollback gates satisfied first.

## Candidate packaging

The candidate must be built from a clean, explicitly reviewed commit and the
production `wrangler.toml`. It must exclude development configuration, synthetic
accounts, private fixtures, untracked worktree files, documentation-only assets,
research data, and any unapproved RealtimeKit behavior. No production package was
built or deployed by TPI-DEV-027.

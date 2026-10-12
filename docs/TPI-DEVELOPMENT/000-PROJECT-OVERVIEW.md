# TPI Development Overview

## Scope

The Paranormal Initiative (TPI) is maintained from the canonical checkout:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

The repository contains the public website, member/community features, Cloudflare Worker APIs, the protected Creator Studio integration, and the separate Refine + shadcn/ui Administration Center preview.

## Official workspace rules

The canonical application source is:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

All approved application development must use this checkout. The Desktop workspace at `/Users/toddknipple/Desktop/paranormal-initiative-website` is an older checkout containing unique uncommitted StudioFlow/member-site work and approximately 188 MB of Paranormal Teams research, verification data, review queues, evidence, and scripts. It is preserved archive/research material. Do not delete, overwrite, automatically synchronize, merge, or deploy from it. Any useful work must be separately reviewed before incorporation.

The development branch is `codex/tpi-development`; it was created and selected under TPI-DEV-005. Preserve `main` and do not merge or deploy production without separate approval.

## Environment status

| Environment | Address | Status |
| --- | --- | --- |
| Local source | repository checkout | Available; commands are documented in 003-LOCAL-DEVELOPMENT.md |
| Cloudflare development | https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/ | VERIFIED isolated Worker, D1, R2, and authenticated test workflow |
| Production | https://paranormalinitiative.com/ | Protected; not modified by TPI-DEV-001 |

The root Wrangler configuration remains production-bound: Worker `theparanormalinitiative`, D1 `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`), and R2 `tpi-contributor-media`. The development configuration is `wrangler.dev.toml`; it binds `TPI_DB` to `tpi_contributor_portal_dev` (`4948ecc5-35de-4782-8f6b-b07fa1782b66`) and `TPI_MEDIA` to `tpi-contributor-media-dev`.

The development architecture is implemented and deployed. Its development-only accounts are `tpi-dev-owner` and `tpi-dev-member`; passwords are not documented or committed. The Worker has no cron trigger and no Resend secrets.

## Safety decision

The workers.dev address must not be treated as an isolated development environment. The public HTML returned by the workers.dev address and the production domain was byte-identical during this audit (19,312 bytes each; SHA-256 87669c4992174b729e1b8d220c24dfd041951d3de008fe9041f747ed1b86d6e0c2c6f). The configured deployment target also exposes the production D1 and R2 bindings.

The historical shared workers.dev endpoint remains production-bound and must not be used for development. Remote development deployment now uses only the explicit dev configuration and preflight script.

## Status vocabulary

- **Verified current state** means directly inspected in the repository or Cloudflare configuration and supported by an audit record.
- **Approved future architecture** means the intended design recorded for later implementation; it is not an active environment.
- **Implemented and tested** means the change has both source evidence and execution evidence. A document describing a safeguard does not prove that the safeguard exists.

## Protected areas

Do not replace /admin-panel, modify production member data, change production authentication, alter production R2 objects, activate memberships, launch livestreaming, implement new administrative roles, or access other projects as part of this workflow.

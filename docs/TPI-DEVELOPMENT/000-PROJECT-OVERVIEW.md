# TPI Development Overview

## Scope

The Paranormal Initiative (TPI) is maintained from the canonical checkout:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

The repository contains the public website, member/community features, Cloudflare Worker APIs, the protected Creator Studio integration, and the separate Refine + shadcn/ui Administration Center preview.

## Environment status

| Environment | Address | Status |
| --- | --- | --- |
| Local source | repository checkout | Available; commands are documented in 003-LOCAL-DEVELOPMENT.md |
| Cloudflare development | https://theparanormalinitiative.paranormalsomerset.workers.dev/ | BLOCKED for safe deployment: current evidence identifies the same Worker and production stateful bindings |
| Production | https://paranormalinitiative.com/ | Protected; not modified by TPI-DEV-001 |

The current Wrangler configuration names Worker theparanormalinitiative, binds D1 tpi_contributor_portal (f36b9161-b517-4634-9857-bef4147cefe3), and binds R2 tpi-contributor-media. There is no separate development D1, R2 bucket, Worker configuration, or authentication namespace in the inspected checkout.

## Safety decision

The workers.dev address must not be treated as an isolated development environment. The public HTML returned by the workers.dev address and the production domain was byte-identical during this audit (19,312 bytes each; SHA-256 87669c4992174b729e1b8d220c24dfd041951d3de008fe9041f747ed1b86d6e0c2c6f). The configured deployment target also exposes the production D1 and R2 bindings.

Until separate stateful resources, session boundaries, and a Worker deployment target are approved and configured, development deployment is blocked. Local documentation and non-production preparation may continue.

## Protected areas

Do not replace /admin-panel, modify production member data, change production authentication, alter production R2 objects, activate memberships, launch livestreaming, implement new administrative roles, or access other projects as part of this workflow.

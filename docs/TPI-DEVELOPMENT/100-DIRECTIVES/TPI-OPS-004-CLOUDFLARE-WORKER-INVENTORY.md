# TPI-OPS-004 — Cloudflare Worker Inventory

**Status:** COMPLETED — read-only inventory and history investigation  
**Date:** 2026-10-17  
**Repository:** `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`  
**Branch:** `codex/tpi-development`

## Scope

This directive inventories the Cloudflare account and reconstructs the TPI
development Worker history. It does not deploy, delete, disable, route, import,
modify data, change billing, or generate Worker traffic.

## Current repository verification

| Check | Result | Status |
| --- | --- | --- |
| Branch | `codex/tpi-development` | CONFIRMED |
| HEAD | `7385f0c` (`fix: reject concurrent Studio workspace saves`) | CONFIRMED |
| Remote | `git@github.com:paranormalinitiative/paranormal-initiative-website.git` | CONFIRMED |
| Unrelated worktree changes | Existing dirty changes preserved | CONFIRMED |

## Account inventory

The read-only account inventory returned exactly four Workers. Two are TPI
Workers; the other two are separate projects.

| Worker | TPI relationship | Created | Last account modification | Current role |
| --- | --- | --- | --- | --- |
| `theparanormalinitiative` | TPI | 2026-07-11 | 2026-10-16 | Production |
| `theparanormalinitiative-dev` | TPI | 2026-10-12 | 2026-10-16 | Development |
| `the-cauldron-the-craft` | Separate project | 2026-09-02 | 2026-09-08 | Separate application |
| `applied-paranormal-research-and-studies` | Separate project | 2026-07-12 | 2026-07-14 | Separate application |

**Older TPI development Worker:** **NOT FOUND / NOT CONFIRMED.** The current
account inventory contains no older similarly named TPI development Worker.
Repository history and inspected configuration also contain no separate older
TPI development Worker name. The current development Worker was created on
2026-10-12.

## Current Worker configuration

### Production — `theparanormalinitiative`

- Custom domain: `paranormalinitiative.com`, enabled, production environment.
- Workers.dev preview is enabled; no production custom domain was inferred for
  the development Worker.
- D1 binding: `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`).
- R2 binding: `tpi-contributor-media`.
- Assets binding: `ASSETS`.
- Scheduled trigger: `0 */6 * * *`.
- Active deployment at the OPS-005 reconciliation: version
  `05c5d075-8d28-4f72-a4c8-a8edba01bb10`, 100% allocation.

### Development — `theparanormalinitiative-dev`

- Workers.dev host: `theparanormalinitiative-dev.paranormalsomerset.workers.dev`.
- D1 binding: `tpi_contributor_portal_dev` (`4948ecc5-35de-4782-8f6b-b07fa1782b66`).
- R2 binding: `tpi-contributor-media-dev`.
- Assets binding: `ASSETS`.
- Development variables include `TPI_ENV=development`,
  `TPI_DISABLE_OUTBOUND=1`, and `FOUNDING50_DEVELOPMENT_ACTIVATION=disabled`.
- No scheduled trigger is present in `wrangler.dev.toml` or the inspected
  Worker settings.
- Active deployment at the OPS-005 reconciliation: version
  `cf58029d-62be-409f-98ff-58591b020641`, 100% allocation.

The production and development bindings are distinct. No production secret
values were read or recorded. No service binding, queue, or Durable Object
binding was found in the inspected source/configuration or returned settings.

## Routing

The custom-domain API returned one enabled mapping: `paranormalinitiative.com`
to the production Worker. The classic zone Worker Routes endpoint returned an
empty route list. This means no classic zone-route records were returned; it
does not negate the confirmed custom-domain mapping.

## Deployment history reconstruction

Repository documentation and history establish the following sequence:

1. The original production Worker and workers.dev hostname existed before the
   isolated development environment was introduced.
2. TPI-DEV-005 created the explicit `wrangler.dev.toml` configuration and the
   guarded development deployment procedure.
3. TPI-DEV-009 documented the isolated development Worker and a deployment
   version in the `c8432743...` / `a6dded19...` sequence.
4. The current account inventory confirms the isolated development Worker is
   `theparanormalinitiative-dev`, created on 2026-10-12.
5. The retained Wrangler deployment list shows that `c181...` and `f89...`
   are earlier deployments, while the later 2026-10-16 deployments
   `cf58029d...` and `05c5d075...` are the active development and production
   versions respectively. The older OPS-004 observation had selected an
   earlier retained deployment and is corrected by this reconciliation.

The historical record supports **CONFIRMED** development isolation in the
current configuration. The exact complete deployment history before the
Wrangler/API retention window is **NOT VERIFIED**.

## Safety conclusion

No Worker was modified. No traffic was sent to a Worker URL. No database,
R2 bucket, route, secret, billing setting, or deployment was changed.


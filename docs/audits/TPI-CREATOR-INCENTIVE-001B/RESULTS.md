# TPI-CREATOR-INCENTIVE-001B — Acceptance evidence

Date: 2026-11-03. Local Worker `workerd` at `http://127.0.0.1:8787`, local D1 in
`.local-dev/state/v3`. Production was read only.

## Suites

| Suite | Command | Result |
|---|---|---|
| Model / registry / numbering / packaging / guards | `npm run verify:creator-incentive` | **155 / 155 PASS** |
| Isolated API E2E | `TPI_E2E_ISOLATED=1 bash scripts/e2e/api-e2e.sh` | **293 / 293 PASS** |
| Admin + profile browser acceptance | `npm run verify:creator-incentive-browser` | **46 / 46 PASS** (run twice) |

## Badge mapping and artwork

| Class | Derivative | Verified |
|---|---|---|
| `FC` | `founding-creator-256.png` (+ 512 / webp) | file is a real PNG; API, admin and profile all reference it |
| `FCT` | `founding-contributor-256.png` | same |
| `FAA` | `founding-all-access-256.png` | same; one badge, not two |
| ordinary member | — | `badge: null`, `badges: []` |

Rendered checks: class cards 3/3 loaded at 44px; registry rows carry a 30px
badge; capability inspection shows the Contributor badge with alt text;
member-profile chip 48px square (not stretched) with
`alt="Founding All-Access badge"`; public profile chip for FAA and FC shows the
correct artwork; `local_member` shows no chip; no admin or profile surface
references `/masters/`.

## Asset packaging

| Check | Result |
|---|---|
| Derived badge served (`/assets/founding-memberships/web/founding-all-access-256.png`) | `200` |
| Master served (`/assets/founding-memberships/masters/…png`) | `404` |
| Society derivative served (`/assets/society-leadership/web/gold-256.png`) | `404` |
| Masters in Git | 6 files, 8,552,727 bytes |
| Published founding derivatives | 2,363,608 bytes |
| Unpublished society derivatives | 1,769,855 bytes |

## All-Access acceptance (local fixture `FAA-001`)

- identity: Founding All-Access, `FAA-001`, active
- capabilities: Creator + Contributor
- entitlements: StudioFlow Nova Edit and Nova Editorial Workspace entitled;
  reported unavailable because the features are not built
- Creator Incentive: eligible
- profile and public profile both show the purple badge and the number

## Security negatives

- forged `badge`/`membershipNumber`/`capabilities` in the assignment payload
  ignored; server issues the class artwork
- ordinary member: no badge and no capability
- suspended membership: no active badge, number and state still reported
- anonymous and member requests to the registry, assignment and entitlements:
  `403`
- profile markup cannot add a capability: the chip is rendered from the resolved
  server payload only

## Production read-only state

| Check | Result |
|---|---|
| Worker version | `daa5aee1-304f-4e96-89a8-86aac2df98e9` (unchanged) |
| 0058 tables in production | absent (`founding50_*` from 0048 only) |
| `wrangler d1 migrations list --remote` | `0058` still pending |
| Production Founding numbers consumed | none |

## Screenshots

`admin-badges.png`, `member-profile-badge.png`, `public-profile-badge.png` in this
directory; the admin workflow screenshots remain in
`docs/audits/TPI-CREATOR-INCENTIVE-001/`.

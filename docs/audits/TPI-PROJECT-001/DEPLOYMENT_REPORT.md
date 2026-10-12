# TPI-PROJECT-001 — Deployment report

## Status

Implementation and anonymous production verification are complete. Authenticated
owner/admin review remains pending because this run did not have an authorized
session.

## Intended release

- TPI repository only: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Existing `/admin-panel` remains in place.
- Refine/shadcn application remains protected at `/admin-center-preview/`.
- No Cauldron & The Craft project or infrastructure is part of the release.
- No D1 migration, production data mutation, R2 operation, Founding 50
  activation, Creator Studio access expansion, or `/live-video` change.

## Release evidence

- Git commit: `97966e3b62d385caace702f9982a084206f2124b`
- GitHub: pushed to `origin/main`
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`
- Cloudflare Worker: `theparanormalinitiative`
- Cloudflare Version ID: `0aa8885d-693d-45e1-b6fe-e453f34bfc07`
- Dry run: PASS; TPI_DB and TPI_MEDIA bindings resolved to the configured
  TPI D1 database and R2 bucket.

## Anonymous production verification

| Endpoint | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/admin-panel.html` | HTTP 403 |
| `/admin-center-preview/` | HTTP 403 |
| `/admin-center-preview/assets/index-6egd1gI8.js` | HTTP 403 |
| `/api/admin/community/posts?status=deleted` | HTTP 403 |
| `/live-video` | HTTP 200; Coming Soon preserved |
| `/docs/audits/TPI-PROJECT-001/ADMIN_CONTENT_FILTERING.md` | HTTP 200 |

No production records were changed. No R2 object was read or written. The
authenticated owner review remains a separate acceptance gate: confirm in an
authorized session that Community Overview defaults to Active (not deleted),
that the reported deleted post appears only under the explicit Deleted filter,
and that `/admin-panel` and the TPI theme remain intact.

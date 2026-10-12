# TPI-ADMIN-007 baseline

Date: 2026-10-12
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch: `main`
Baseline commit: `c4b84c4` (`docs(admin): record ADMIN-006 release evidence`)

The existing production administration surface is `/admin-panel`. The
protected development preview is `/admin-center-preview/`, built from
`admin-center-app/` with React, Refine, and shadcn-compatible primitives.
ADMIN-006 is deployed but has not replaced `/admin-panel`.

Cloudflare target remains account `221ea5479876fd303ddc87002b9e892d`, Worker
`theparanormalinitiative`, D1 binding `TPI_DB`, and R2 binding `TPI_MEDIA`.
No migration or production data change is authorized by Batch A.

Pre-existing unrelated working-tree changes remain excluded and unstaged:
`STUDIOFLOW_READINESS_AUDIT.md`, `education-center.html`, `index.html`,
`scripts/build-sitemap.js`, `sitemap.xml`, and the existing 2026-10-09 audit
files.

Prior ADMIN-006 verification: build passed, static checks passed 8/8,
anonymous preview and direct asset gates returned 403, `/admin-panel.html`
returned 403, `/live-video` returned 200 with Coming Soon, and the homepage
returned 200. Authenticated browser acceptance was not available.

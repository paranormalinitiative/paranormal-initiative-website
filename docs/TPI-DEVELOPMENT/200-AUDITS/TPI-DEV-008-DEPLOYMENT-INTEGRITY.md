# TPI-DEV-008 Deployment Integrity Audit

Date: 2026-10-13
Status: **PARTIAL COMPLETION — source integrity understood; deployment guard repaired; new deployment intentionally blocked**

## Scope and safety boundary

This audit covers only the canonical TPI checkout and the isolated development
Worker. The Desktop archive was not accessed or modified. Production was not
deployed, migrated, or written.

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Baseline HEAD before this repair: `e98619e5379fdb70157e2e13a89f9a1ebe1391b3`
- Repair commit: `ad93bf0` (`dev: enforce reproducible development deployments`)
- Development Worker: `theparanormalinitiative-dev`
- Development URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- Development D1: `tpi_contributor_portal_dev` / `4948ecc5-35de-4782-8f6b-b07fa1782b66`
- Development R2: `tpi-contributor-media-dev`
- Production Worker: `theparanormalinitiative`
- Production D1: `tpi_contributor_portal` / `f36b9161-b517-4634-9857-bef4147cefe3`
- Production R2: `tpi-contributor-media`

## Root cause

The effective development version `c8432743-71c7-4b5c-8cd1-9503cb81e038`
was uploaded from a working-tree state that contained application files not
present in Git at `HEAD`. A later clean-archive upload, version
`6e01afa5-928a-4bae-91a6-7f16fcee52f6`, represented the committed revision but
omitted those working-tree files. The clean upload therefore did not represent
the application previously visible in development. It was rolled back to
`c8432743` before owner testing continued.

The prior deployment process had no fail-closed check for this condition. It
staged the current checkout, but a separate clean-archive path could be used
without an explicit source manifest. A successful Worker upload was therefore
not proof that the intended application source had been packaged.

## Source reconciliation

The source comparison produced these classifications:

| Files or area | Classification | Evidence / decision |
| --- | --- | --- |
| `index.html` | Required application source, uncommitted | Development runtime contains the private StudioFlow status copy; local hash differs from `HEAD`. Preserve; do not auto-commit. |
| `education-center.html` | Required application source, uncommitted | Development runtime contains the corrected `education-research-*` links; local hash differs from `HEAD`. Preserve; do not auto-commit. |
| `sitemap.xml` | Required generated/application output, uncommitted | Development runtime hash matches the local working-tree sitemap. Preserve; regenerate only from an approved source revision. |
| `scripts/build-sitemap.js` | Required build configuration, uncommitted | Adds noindex/exclusion handling used to produce the current sitemap. Preserve; do not auto-commit. |
| `STUDIOFLOW_READINESS_AUDIT.md` | Documentation | Uncommitted documentation only; excluded from deployment assets. |
| `TPI_VS_PARAPOST...md` and `docs/audits/2026-10-09/**` | Documentation / research records | Untracked documentation; preserved and excluded from deployment assets. |
| `.dev.vars` | Local secret material | Ignored and excluded; never copied to a deployment package or committed. |
| `.wrangler/**`, `node_modules/**`, backups, and data | Local/generated/testing state | Ignored and excluded; not application source. |
| `admin-center-app/` source | Tracked application source | Present in Git; its installed `node_modules` is local-only. The deployment script excludes the source project because the deployed preview assets are already in the application tree. |

No unknown required application file was found in the reviewed status, ignored
file, deployment, or runtime comparisons. The four application files above are
the unresolved source overlay that prevents a clean-HEAD reproduction.

## Recovery checkpoint

A private recovery checkpoint was created before repair work:

`/private/tmp/tpi-dev-008-recovery-20261013/`

It contains the tracked working-tree patch, staged patch, status and branch
manifests, copies of the five pre-existing dirty tracked files, and a tarball
of safe untracked documentation. `.dev.vars`, `.wrangler`, dependencies,
backups, data, and credential-like files were excluded. Hashes and a readable
reverse patch check were completed. The historical active and rolled-back
development deployment identifiers are recorded in `deployment-context.txt`.

## Repaired deployment safeguards

`scripts/verify-development-config.mjs` now:

1. Verifies the development Worker, account, D1, R2, branch, development flag,
   outbound guard, and absence of production bindings/routes/cron.
2. Reports HEAD, changed files, ignored local state, and reproducibility.
3. Treats uncommitted application files and undocumented ignored files as a
   deployment error.
4. Permits `--report-only` for audit inventory without weakening deployment.

`scripts/deploy-development.mjs` now invokes that preflight itself, so direct
invocation cannot bypass the safety gate.

Current enforcement result: **BLOCKED as designed** because the four
pre-existing application files remain uncommitted. The repaired deployment
scripts are now committed in `ad93bf0`; documentation-only dirt and known
local state are allowed.

## Runtime and Cloudflare verification

Read-only Cloudflare verification on 2026-10-13 confirmed:

- Development active version remains `c8432743-71c7-4b5c-8cd1-9503cb81e038`.
- The rollback record restored that same development version after
  `6e01afa5-928a-4bae-91a6-7f16fcee52f6`.
- Development D1 is `tpi_contributor_portal_dev`, ID
  `4948ecc5-35de-4782-8f6b-b07fa1782b66`.
- Production D1 is `tpi_contributor_portal`, ID
  `f36b9161-b517-4634-9857-bef4147cefe3`.
- Production latest observed version remains
  `7e357215-2579-4c60-b27e-dd572a5656fe`.

HTTP checks passed read-only:

- Development `/`: HTTP 200, development banner present, and current private
  StudioFlow status copy present.
- Development `/education-center.html`: redirects to `/education-center`; the
  corrected education links are present.
- Development `/sitemap.xml`: HTTP 200; SHA-256 matches the local working-tree
  sitemap (`a736f2eecf16d29b6ce02d9d6f4fb3f9aaeae8d9e0b36d456e089fc52aba9b16`).
- Production `/`: HTTP 200.
- Production `/admin-panel`: anonymous HTTP 403.
- Production `/live-video`: HTTP 200 and remains the Coming Soon page.

The prior TPI-DEV-007 API, browser, D1, R2, and development content checks
remain the latest completed application verification. They are recorded in
`TPI-DEV-007-CONTENT-PARITY.md`; this audit did not repeat destructive or
content-mutating tests.

## Build and deployment status

Syntax and diff checks passed for the repaired scripts. A new development
deployment was **not** attempted because the preflight correctly detected the
uncommitted application overlay. This preserves the verified active deployment
and avoids replacing it with an incomplete package.

There is no new Cloudflare deployment ID for TPI-DEV-008.

## Required next step

Todd must review and explicitly approve the four pre-existing application files
for inclusion in the development branch, or identify that they belong to a
different workstream. After that decision, the approved files can be committed
as a narrow source-reconciliation change, the preflight can pass from a clean
revision, and a new development deployment can be built and verified. No
unrelated documentation or Desktop archive files should be included.

Owner acceptance remains pending. No production promotion is authorized by
this audit.

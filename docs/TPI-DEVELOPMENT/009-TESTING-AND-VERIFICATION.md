# Testing and Verification

## Evidence categories

- Verified: directly executed in the current environment with recorded output.
- Implemented: source or documentation exists, but runtime acceptance may remain open.
- Partial: only some required behavior was exercised.
- Blocked: a safety or environment prerequisite prevents execution.
- Not tested: no current evidence.

## TPI-DEV-001 audit results

| Check | Result | Evidence |
| --- | --- | --- |
| Repository, remote, branch, and HEAD | VERIFIED | Canonical checkout; origin is git@github.com:paranormalinitiative/paranormal-initiative-website.git; branch main; HEAD 11070e444200f95c546997e4d9412ae245752cc9 at audit start |
| Wrangler identity | VERIFIED | npx wrangler whoami; designated account ID confirmed |
| Production D1 binding | VERIFIED | npx wrangler d1 info tpi_contributor_portal |
| Dry-run bindings | VERIFIED | npx wrangler deploy --dry-run reported TPI_DB, TPI_MEDIA, and ASSETS |
| Dev/prod public HTML comparison | VERIFIED | Both 19,312 bytes and SHA-256 87669c4992174b729e1b8d220c24dfd041951d3de008fe9041f747ed1b86d6e0c2c6f; byte comparison equal |
| Isolated development deployment | BLOCKED | No separate Worker, D1, R2, or auth boundary found |
| Authenticated dev workflow | NOT TESTED | No isolated test account/environment |
| Production mutation | NOT PERFORMED | Safety requirement preserved |

## TPI-DEV-005 implementation verification

| Check | Result | Evidence |
| --- | --- | --- |
| Development branch | VERIFIED | `codex/tpi-development` created from `3579fe8` |
| Development Worker | VERIFIED | `theparanormalinitiative-dev` at workers.dev |
| Development D1 | VERIFIED | `tpi_contributor_portal_dev`, `4948ecc5-35de-4782-8f6b-b07fa1782b66`; 50 migrations applied |
| Development R2 | VERIFIED | `tpi-contributor-media-dev`; remote disposable upload/download/delete passed |
| Development banner | VERIFIED | Homepage contains `DEVELOPMENT ENVIRONMENT`; production was not given the banner |
| Anonymous protection | VERIFIED | Admin preview and admin panel returned 403 on development URL |
| Development owner login | VERIFIED | `tpi-dev-owner` login, `/api/auth/me`, Admin Center HTML, overview, and member API passed |
| Development member boundary | VERIFIED | `tpi-dev-member` login passed; Admin Center returned 403 |
| Secret/config asset protection | VERIFIED | `/.dev.vars` and `/.wrangler.dev.toml` returned 404 |
| Local build and syntax | VERIFIED | Admin Center build, worker/API syntax, and QA syntax gates passed |
| Existing local E2E harness | PARTIAL | First run hit sandbox `spawn EBADF`; escalated retry completed the reported QA checks, but no separate production-authenticated E2E claim is made |
| Production preservation | VERIFIED | Production remained at observed version `7e357215-2579-4c60-b27e-dd572a5656fe`; homepage 200, `/admin-panel` 403, `/live-video` Coming Soon |

## Future verification

Owner acceptance remains for broader browser coverage: public/member workflows, Community Feed, Messenger, Notifications, StudioFlow, responsive layouts, and the complete Administration Center navigation. These are available for development testing but are not all claimed as end-to-end verified by TPI-DEV-005.

## Approval evidence

Separate these claims in every report:

- **Verified current state:** directly observed repository, configuration, or runtime evidence.
- **Implemented and tested:** source change plus executed test evidence.
- **Approved future architecture:** intended design awaiting implementation.
- **Not tested / blocked:** no safe environment, credentials, device, or other prerequisite.

An anonymous protected response can verify that a route is not public; it cannot prove authenticated Administration Center functionality. Owner review must occur on the isolated development website after that environment is operational.

## TPI-DEV-008 deployment-integrity verification

| Check | Result | Evidence |
| --- | --- | --- |
| Git/source inventory | VERIFIED | Branch `codex/tpi-development`, HEAD `e98619e`, tracked and untracked status captured before repair |
| Recovery checkpoint | VERIFIED | Private checkpoint at `/private/tmp/tpi-dev-008-recovery-20261013/`; patches, safe untracked documentation, hashes, and reverse patch check |
| Root cause | VERIFIED | Clean archive `6e01afa5` omitted application files not present at HEAD; active version `c8432743` was restored |
| Development bindings | VERIFIED | Wrangler read-only checks confirmed dev D1 `4948ecc5-35de-4782-8f6b-b07fa1782b66` and prod D1 `f36b9161-b517-4634-9857-bef4147cefe3` |
| Source preflight report | VERIFIED | `node scripts/verify-development-config.mjs --report-only` identifies the unresolved application overlay |
| Deployment enforcement | VERIFIED | Normal preflight exits nonzero until application files are approved and committed |
| New development deployment | NOT PERFORMED | Safe stop preserved active `c8432743`; no incomplete replacement was uploaded |
| Production protection | VERIFIED | Production homepage 200, anonymous `/admin-panel` 403, `/live-video` Coming Soon; no production deployment or data mutation |

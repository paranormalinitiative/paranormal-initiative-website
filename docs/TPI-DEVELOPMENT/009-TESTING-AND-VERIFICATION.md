# Testing and Verification

## Evidence categories

- Verified: directly executed in the current environment with recorded output.
- Implemented: source or documentation exists, but runtime acceptance may remain open.
- Partial: only some required behavior was exercised.
- Blocked: a safety or environment prerequisite prevents execution.
- Not tested: no current evidence.

## TPI-STUDIOFLOW-034 mutation regression — 2026-10-24

`npm run verify:studioflow-034-mutation` is the maintained Firefox Developer
Edition regression for the StudioFlow idle mutation storm. It uses disposable
browser-local studios and measures observer callbacks, attribute and child-list
records, node additions/removals, redundant hidden/style/attribute writes, menu
churn, storage writes, and network activity. Two consecutive final runs passed.
The settled 5-second windows recorded 0 added nodes, 0 removed nodes, 0
child-list records, 0 redundant writes, and 5 expected checkbox updates; the
30-second window recorded 35 expected checkbox updates and 0 child-list churn.
The test covers bootstrap, existing/fresh studios, Sound Effects, Background
Music, Background Picker, active playback, post-playback idle, and switching to
a second disposable studio. It is integrated into the package verification
surface and documented in the TPI-034 completion record.

## TPI-STUDIOFLOW-033 workspace configuration round-trip — 2026-10-24

`npm run verify:studioflow-033-roundtrip` is the maintained API and Firefox
Developer Edition regression for the workspace configuration contract. It uses
disposable local Studios and exercises the real server normalizer, current and
stale workspace versions, Video Clips metadata and slot positions, program
orientation, existing Background Music fields, browser hydration, Studio A/B
switching, isolation, and refresh restoration. The current run passed 26/26.

The complete field inventory is maintained in
`TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`. The test does not replace the
existing media upload/playback suites; it covers their shared configuration
round-trip boundary without creating media records or touching owner data.

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

## TPI-DEV-009 production-baseline and development-deployment verification

| Check | Result | Evidence |
| --- | --- | --- |
| Production baseline file comparison | VERIFIED | `index.html`, `education-center.html`, and `sitemap.xml` hashes matched current production responses; sitemap generator behavior was reconciled |
| Development StudioFlow relay schema | VERIFIED | Development-only migration `0049_studioflow_room_relay.sql`; guest and signal tables present with zero data rows |
| Reproducible source preflight | VERIFIED | HEAD `7f3a3f1`; no uncommitted application files; `reproducibleFromHead: true` |
| Admin Center build and focused QA | VERIFIED | `tsc -b && vite build`; existing focused suites; Admin Center `78/78` |
| Development runtime smoke | VERIFIED | `10/10` against `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev` |
| Production preservation smoke | VERIFIED | `10/10` against `https://paranormalinitiative.com`; production version remained `7e357215-2579-4c60-b27e-dd572a5656fe` |
| Development deployment | VERIFIED | Version `a6dded19-2f63-4a98-88c4-30ed3d02ca1b` on `theparanormalinitiative-dev` |
| Owner-authenticated StudioFlow/Admin Center acceptance | NOT TESTED | No owner credentials or session used; anonymous protection is verified only |
| Full local API E2E | BLOCKED | Existing Wrangler `spawn EBADF` runner issue |

## Approval evidence

Separate these claims in every report:

- **Verified current state:** directly observed repository, configuration, or runtime evidence.
- **Implemented and tested:** source change plus executed test evidence.
- **Approved future architecture:** intended design awaiting implementation.
- **Not tested / blocked:** no safe environment, credentials, device, or other prerequisite.

An anonymous protected response can verify that a route is not public; it cannot prove authenticated Administration Center functionality. Owner review must occur on the isolated development website after that environment is operational.

## TPI-DEV-026 current verification

The following checks were executed for the current development state and are not
added to historical totals:

| Check | Result | Evidence |
| --- | --- | --- |
| Workspace and backup boundary checks | PASSED | DEV-024 offline verification: 17/17 |
| Media, search, and Events offline contracts | PASSED | DEV-022 offline verification: 15/15 |
| Video player policy and rendering regression | PASSED | 22 assertions |
| Video duration/date regression | PASSED | Formatting, unknown handling, filters, and card wiring |
| Media grid regression | PASSED | Responsive 4/3/2/1 breakpoint assertions |
| TPI Videos navigation regression | PASSED | Stale attribute-order/title assertions repaired; current protected StudioFlow markup verified |
| Development Worker provenance | PASSED | Endpoint reports `a8ef0df` / `codex/tpi-development` / `theparanormalinitiative-dev` |
| Development D1 schema presence | PASSED WITH RECONCILIATION NOTE | `studio_workspaces` exists; Wrangler migration ledger still reports 0051 pending |
| Public browser Events surface | PASSED | Development browser inspection rendered filters, event cards, RSVP, and submit-event navigation |
| Authenticated StudioFlow visual/file-picker acceptance | NOT TESTED | Owner browser session required |
| Browser session-restart recording recovery | NOT TESTED | Browser restart and authenticated recording fixture not available in this run |
| Positive external RealtimeKit room/livestream | NOT TESTED | Explicitly outside DEV-026 authorization |

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

# Testing and Verification

## Production recovery lesson — visible UI assertions are mandatory

For StudioFlow context menus and other overlays, a DOM node count or text
assertion is insufficient. Maintained Firefox tests must use a browser
interaction, confirm the element is visible and in the viewport using its
bounding rectangle and computed visibility, and capture evidence when a
production acceptance failure is being reconciled. This prevents ancestor
clipping, stacking, and pointer-event defects from being reported as passes.

## Evidence categories

- Verified: directly executed in the current environment with recorded output.
- Implemented: source or documentation exists, but runtime acceptance may remain open.
- Partial: only some required behavior was exercised.
- Blocked: a safety or environment prerequisite prevents execution.
- Not tested: no current evidence.

## TPI-STUDIOFLOW-087 Studio ownership and dashboard regression — 2026-10-26

`npm run verify:studioflow-087-studio-ownership` is the maintained Firefox
Developer Edition regression for the Independent Studios, Studio Dashboards,
and Production Ownership directive (Directive Tests 1–13 plus fixture hygiene
and release-gate checks; 40 checks). It asserts persisted Studio identities
and production ownership — not just visible labels: homepage cards equal the
authorized Studio collection, dashboards list only their own Studio's
productions and recordings, recording ownership stamps the owning Studio's
stable key, Studio A never inherits Studio B's data, rename keeps the Studio
ID and its attachments, archive/restore round-trips, and browser-local
Studios remain visible with their snapshots preserved. Account-dependent
checks report `HEADLESS_WARN` (never silently pass) without a QA account.
Since 2026-10-26 the suite also runs inside `npm run release:preflight`,
enforced by a `verify:release-safety` contract check. Verified results
2026-10-26: 40/40 locally and 40/40 on authenticated production (isolated QA
account; evidence in `300-COMPLETED-WORK/evidence/2026-10-26-studioflow-087-production-suite.json`).

## Studio lifecycle regression suite — 2026-10-25

`npm run verify:studioflow-studio-lifecycle` is the maintained Firefox
Developer Edition regression for Studio creation, switching, and workspace
isolation (Directive Tests 1–10 plus the owner-flow checks). It asserts
persisted Studio IDs and scene ownership — not just visible labels — and
passes both locally and against production (`TPI_REPRO_BASE_URL` +
`TPI_FIREFOX_CREDENTIALS_FILE` select the environment and QA profile). It
covers: clean four-item creation, independent second Studio, A→B→A switching
with identity assertions, scene isolation, media isolation, refresh
restoration, unsaved-change preservation, failed-save handling (no silent
switch, no overwrite), rapid switching, existing-Studio compatibility, clean
home-screen creation, and the browser-local Studio that lacks a snapshot
(opens with defaults and a visible notice). The H3/H4 checks verify that a
malformed browser-local snapshot record and a fully corrupt snapshot store
are preserved under `studioflow.tpiLocalStudioSnapshots.recovery.v1` before
any replacement (TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001). Only disposable
Studios are created; they are archived at the end of each run. Since 2026-10-25
(TPI-STUDIOFLOW-OWNER-VERIFICATION-001 §11) the suite also runs inside
`npm run release:preflight`, enforced by a `verify:release-safety` contract
check, so a Studio lifecycle regression blocks a release. Verified results
2026-10-25: 25/25 on authenticated production (isolated QA account) and
25/25 locally.

Known open failures — documented, not resolved: the static-contract suites
`tpi-studioflow-048-project-persistence`, `tpi-studioflow-049-portable-backups`,
`tpi-dev-024-offline`, `tpi-dev-037-offline`, and
`tpi-studioflow-022-media-organization` fail on stale source-literal
expectations (pre-existing baseline; they were left untouched rather than
rewritten to pass), and `verify:studioflow-030-browser`'s rapid-upload step is
timing-sensitive (one flaky failure observed in four runs; passes on re-run).

## TPI-STUDIOFLOW-037 Addendum E scene-management repair — 2026-10-25

`npm run verify:studioflow-037-addendum-e` is the maintained Firefox Developer
Edition regression for the owner-reported Scenes-panel failures. It passed
20/20 in a disposable authenticated workspace. The suite verifies the new
Studio arrangement (Intro Video, Scene 1, Scene 2, Outro Video), every React
production-item context menu, the Background Music bridge menu, right-click
behavior, stable scene IDs during rename, next-available sequential naming,
non-destructive shortcut removal, server-backed persistence after refresh, and
the explicit rule that stopping an individual Intro preview does not start
After Intro music. Synthetic media is used only in the disposable workspace.

The repair also reran the maintained TPI-037 suite (20/20), Addendum C
uniformity/drag suite (26/26), Addendum D playback/removal suite (10/10),
TPI-028 (33/33), TPI-030 (25/25), TPI-031 (34/34), TPI-033 (26/26), TPI-034
mutation regression, TPI-035 (33/33), TPI-036 (28/28), and TPI-021 (31/31).
Natural Intro completion still activates configured After Intro music; manual
preview stopping remains isolated. No owner Studio, Crossroads data,
production D1 record, R2 object, recording, or live broadcast was mutated.

## TPI-STUDIOFLOW-036 cinematic video timers — 2026-10-24

`npm run verify:studioflow-036-video-timers` is the maintained server/browser
round-trip regression for the nine approved silent Video Timers. It passed
28/28 using the real local API, disposable workspace configuration, and an
isolated Firefox Developer Edition session. It verifies the exact nine-theme
inventory and order, one three-column grid, all nine selections, all four
durations, program-output integration, restart/stop behavior, no timer audio,
server persistence, refresh restoration, and disposable cleanup.

The guarded release also passed local Firefox acceptance 64/64, production
smoke 10/10, live isolated Firefox acceptance 64/64, release safety 17/17,
local authentication lifecycle, complete isolated QA/API E2E, reproducible
StudioFlow staging, and the prior maintained StudioFlow suites through
TPI-STUDIOFLOW-035. A legacy Chromium-only 021/022 browser runner remains
environment-blocked by Chrome SIGABRT/EPERM; Firefox is the governing browser
for this release.

## TPI-STUDIOFLOW-037 Addendum D playback and rehearsal controls — 2026-10-25

`npm run verify:studioflow-037-addendum-d` passed 10/10 in an isolated
Firefox Developer Edition session. It verified first-click play and
second-click stop for the Countdown Timer, Background Music, and Video Clips;
Play Sequence/Stop Sequence cancellation; the `Remove from Scenes` label; and
non-destructive shortcut removal that preserved the underlying Video Clips
asset. The test uses disposable browser state and synthetic media only.

The maintained regression set also passed TPI-037 20/20, TPI-028 browser
33/33, TPI-031 music pads 34/34, and TPI-034 mutation regression. The guarded
release preflight passed, production smoke passed 10/10, and local and live
isolated Firefox acceptance passed 64/64. The live acceptance is the governed
full StudioFlow acceptance suite; the focused Addendum D test was run locally
to avoid mutating production data.

## TPI-STUDIOFLOW-035 recording/storage consolidation — 2026-10-24

`npm run verify:studioflow-035-recording-storage` is the maintained Firefox
Developer Edition regression for the right-navigation cleanup, Teleprompter
placement, and Recording & Storage consolidation. It runs in a disposable
profile with fake capture devices (`media.navigator.streams.fake`,
`media.navigator.audio.fake`, and `media.navigator.permission.disabled` so
getUserMedia answers without a prompt) and uses disposable synthetic studios
and generated recordings only. The current run passed 33/33, covering: the
three removed rail items, Notes preservation and Teleprompter directly beneath
Notes, Recording & Storage visibility and exact rail order, reuse of the
existing studio teleprompter reader, all seven consolidated panel sections,
honest folder-destination gating and cloud "Not connected" reporting, both
Settings redirect notices and the link into the rail section, connected and
persisted configuration toggles with refresh restoration, the full recording
save lifecycle (recording → preparing → saving → saved) with confirmed
destination and file reporting, Library landing and IndexedDB byte storage,
recording survival across unrelated panel navigation, destination-fallback
decline (awaiting-action) and approval (fallback destination identified), and
per-studio recording-preference isolation across real Studio switching.

Harness notes for future suites: right-rail panels render only their selected
tab, so state assertions must run with the owning panel open; native confirm
dialogs are answered through the WebDriver alert API; and inline `find`
callbacks must capture `arguments` in locals before use. The updated
`tpi-studioflow-firefox-acceptance.mjs` asserts the removals and the
Teleprompter/Recording & Storage placement on both local and production runs.

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
The guarded production release completed the non-destructive smoke and Firefox
acceptance gates at 10/10 and 64/64; it did not mutate production Studio
configuration to manufacture a live round-trip fixture.

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
# TPI-STUDIOFLOW-037 Scenes panel, Addendum A, and Addendum B — 2026-10-24

`npm run verify:studioflow-037-scenes-panel` passed 13/13 in isolated Firefox
Developer Edition. It created and archived a disposable workspace, verified the
uniform Intro/Timer/Scene/Outro shortcut inventory, drag handles and context
controls, timer program-output activation, supported Intro actions, skip-state
server persistence through the real workspace API, refresh restoration, safe
non-playable skipped items, and Addendum A's shared production-button
dimensions, solid styling, blue music icon, and readable two-line labels. The
maintained test is
`scripts/verify/tpi-studioflow-037-scenes-panel.mjs`.

The same change retained TPI-036 timers at 28/28, TPI-031 Background Music and
After Intro at 34/34, TPI-035 Recording & Storage at 33/33, and TPI-034 mutation
stability PASS. No owner or production Studio data was used.

Addendum A uses the existing scene-music bridge and preserves automatic After
Intro playback, volume, looping, context-menu assignment, drag-and-drop, and
per-Studio persistence. The guarded Addendum A release passed local and live
Firefox acceptance 64/64 and production smoke 10/10.

Addendum B passed the same maintained Firefox test at 13/13 after verifying
that Background Music, Countdown Timer, Add Production Item, and Play Sequence
all match the Intro Video outer dimensions. Background Music now presents the
stable `Background Music` label while preserving track and scene details in
the existing title, accessible label, and context menu. Creator scene names
remain available through controlled two-line truncation and tooltips. The
guarded Addendum B release passed live Firefox acceptance 64/64 and production
smoke 10/10; the existing Background Music regression remained 34/34.

The Addendum B reactive drag-and-drop correction extended the maintained suite
to 20/20. Firefox verified handle-based dragging, a continuously updated blue
insertion placeholder, Escape cancellation and order restoration, committed
reordering, no timer/media activation during drag, exact shared button
dimensions, and autosave through the real workspace API. The local auth gate,
full release preflight, production smoke (10/10), and live isolated Firefox
acceptance (64/64) all passed. The test uses a disposable workspace and
archives it during cleanup.
## StudioFlow integrated recovery verification — 2026-10-25

`npm run verify:studioflow-integrated-recovery` is the maintained end-to-end
Firefox Developer Edition check for Studio creation, clean defaults, active
identity, viewport-safe context menus, removal persistence, sequential scene
naming, rename persistence, refresh, and bidirectional Studio isolation. It
passed 21/21 locally using disposable server workspaces.

Browser acceptance must evaluate rendered behavior, not DOM existence alone:
menus and dialogs require visible non-zero geometry inside the viewport,
pointer clicks must open the intended control, and persistence assertions must
read the server without triggering the application's hydration bridge. The
test uses an isolated Firefox profile, synthetic metadata-only assets where
possible, server-side reads that do not mutate the browser state, and archives
disposable workspaces during cleanup.

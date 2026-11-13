# TPI-OPS-017 — Responsive Visual Sample Review

Date: 2026-11-12
Status: **DEPLOYED AND LIVE VERIFIED — REPRESENTATIVE REVIEW COMPLETE**

## Scope

This is a representative responsive/theme review that supplements the 234-file
route acceptance. It is not a visual inspection of all 234 pages. The sample
covers 17 routes across public education/content, Ghostology, member profiles,
Friends, Community, Settings, video, Administration Center, Teams, creator,
and Nova-related content. Each route was checked in its applicable anonymous,
member, contributor, or administrator session at desktop (1440×1000) and phone
(390×844) sizes in all six saved themes.

The review used isolated Firefox browser contexts against the official local
Worker at `127.0.0.1:8787`. External requests were blocked. Two expected
external origins were observed: Google Fonts and Refine telemetry. No external
image or application dependency was counted as a local broken image. The sweep
did not alter production data or member records.

## Findings and repairs

1. **Profile editor overflow:** at phone and tablet widths, the banner preview's
   fixed 16:5 ratio and 180px minimum height forced a wide intrinsic size. Grid
   items also retained their automatic minimum width, and the authenticated
   greeting could overlap the page title. The profile editor now permits the
   banner preview and form fields to shrink within their container; on narrower
   screens the banner preview follows the available width, and the greeting
   moves into normal page flow. The profile editor was separately checked at
   320, 360, 390, 430, 768, 900, 1024, 1100, 1280, and 1440px. The document and
   body widths matched the viewport at every checked width, and the title and
   greeting did not overlap.
2. **Settings mobile overflow:** the later workspace-shell rule overrode the
   Settings page's one-column breakpoint, leaving a narrow second grid track.
   A specific responsive override now collapses the Settings layout to one
   column at 900px and below.
3. **Member home mobile overflow:** a one-track `1fr` declaration retained an
   automatic minimum size for the profile/feed column. It now uses
   `minmax(0, 1fr)` for both the member home and profile-mode mobile layouts.

## Verification

The repeatable runner is
[`scripts/e2e/tpi-ops-017-visual-family.mjs`](../../../scripts/e2e/tpi-ops-017-visual-family.mjs).
Its final local run checked 204 route/theme/viewport combinations and passed:

- HTTP responses and nonblank content: 204/204.
- Horizontal overflow/out-of-viewport findings: 0.
- Incorrect selected theme: 0.
- Broken local images: 0.
- Browser page errors: 0.
- Greeting/title overlap: 0.

The raw run report and screenshots are generated under ignored `.local-dev/`
paths; they are local evidence and are not committed. `git diff --check` and
the JavaScript syntax check passed before release preparation. The required
local authentication lifecycle passed 38/38 before restart, 38/38 after
restart, and 38/38 after the StudioFlow build; its isolated Firefox Developer
Edition acceptance passed 65/65. Production preflight certified all 30 gates;
live anonymous smoke passed 10/10 and isolated Firefox Developer Edition
acceptance passed 65/65.

## Limits and remaining work

These results are evidence for the sampled page families, roles, six themes,
and two viewport sizes. They do not certify every route's spacing, every
interactive feature, or all 234 pages at each theme and size. The complete
route-by-route render results remain in
[`TPI-OPS-017-BROWSER-ROUTE-ACCEPTANCE.md`](TPI-OPS-017-BROWSER-ROUTE-ACCEPTANCE.md).
Continue this audit by extending representative families where the source
inventory or new user reports identify a distinct layout. Keep the 51 Haunted
Location directory documents and all five standalone Repository books outside
the edit scope.

No Haunted Location books, standalone Repository books, production member
records, membership data, profile data, honors, or articles were modified.

## Release record

- Source commit: `da185da5ae939b75d74670944135e8084e01172d`
- Release: `rel-da185da5ae93-5ab88ae30d0e`
- Worker version: `c48da23b-d832-49ed-97fd-38e398798807` (100% traffic)
- Rollback version: `0df5ebd5-e07c-42d8-a094-bd7d4f1abe75`
- Guarded release preflight: 30 gates passed; schema readiness passed with no
  pending migrations.
- Production anonymous smoke: 10/10 passed.
- Isolated production Firefox acceptance: 65/65 passed.
- Read-only production asset checks: profile editor, member shell, workspace
  shell, member home, Settings, and member profile routes returned HTTP 200;
  updated responsive CSS rules were present.
- No production member, membership, profile, honor, article, or Studio data
  changed. No protected book content changed.

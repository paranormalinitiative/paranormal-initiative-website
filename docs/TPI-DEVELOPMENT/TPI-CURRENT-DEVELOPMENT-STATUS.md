# TPI Current Development Status

Last verified: 2026-10-15

## Project identity

- Canonical repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Current committed source: d127bd3
- Current deployed application source: d127bd3
- Development Worker: `theparanormalinitiative-dev`
- Development URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev`
- Development version: 20031a3d-1c35-4621-a1b4-b74842256a95
- Production version: adc6e8d7-1950-49a7-8127-54f0a2acd634
- Production: TPI-DEV-035 public landing/auth routing correction deployed; authenticated member acceptance remains pending

The deployed provenance endpoint reports the development Worker, branch, and
application source commit above. The latest commit after the deployed source is
documentation-only and was not redeployed.

## Status vocabulary

- **VERIFIED COMPLETE**: current source and executed evidence support the claim.
- **IMPLEMENTED, VISUAL ACCEPTANCE PENDING**: source and non-visual tests exist,
  but authenticated browser inspection remains open.
- **IMPLEMENTED, EXTERNAL ACCEPTANCE PENDING**: local integration exists, but a
  separately authorized provider or external service test has not occurred.
- **PARTIALLY COMPLETE**: only a defined subset is verified.
- **NOT IMPLEMENTED**: no current implementation evidence.
- **BLOCKED**: a required safe prerequisite prevents verification.
- **NOT TESTED**: no current execution evidence for the specific claim.

## Current feature matrix

| Area | Current status | Evidence / limitation |
| --- | --- | --- |
| Public homepage, navigation, content, authentication entry points | VERIFIED COMPLETE | Development runtime and prior website integration evidence; visual scope remains subject to owner review where noted below |
| Member Home, profiles, feed, comments, reactions, messaging, notifications, settings, privacy | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | DEV-021 integration evidence and focused API regressions; no claim of complete owner visual acceptance |
| Education Center | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | Existing development source and prior integration evidence; production publication is outside scope |
| Paranormal Teams | IMPLEMENTED, IMPORT NOT AUTHORIZED | Research remains separate; no research import or publication was performed |
| TPI Videos | VERIFIED COMPLETE WITH REGRESSION LIMITATIONS | Video player: 22 assertions passed; format/date, navigation, and media-grid regressions passed |
| Media uploads and retrieval | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | DEV-022 offline privacy contracts and media regression passed; no production media changes |
| Search | VERIFIED COMPLETE AT CONTRACT LEVEL | DEV-022 offline search contracts passed; broad visual acceptance remains owner work |
| Events | VERIFIED COMPLETE AT DEVELOPMENT RUNTIME LEVEL | Browser inspection rendered the development Events page, filters, cards, RSVP controls, and submit-event navigation; authenticated administration UI remains owner acceptance |
| Administration Center | IMPLEMENTED, DEVELOPMENT AND PRODUCTION DEPLOYED / VISUAL ACCEPTANCE PENDING | DEV-032 navigation correction and DEV-031 analytics are deployed to both environments; anonymous protection, public routes, private-source exclusion, and development authenticated authorization passed; authenticated production owner inspection remains open |
| Public landing and authenticated home routing | IMPLEMENTED AND DEPLOYED / AUTHENTICATED ACCEPTANCE PENDING | TPI-DEV-035 uses the existing shared shell for guest navigation, makes hosted /api/auth/me authoritative, redirects authenticated / server-side to /member-home, and marks anonymous root HTML private/no-store. Anonymous development and production checks passed; authenticated browser acceptance remains open. |
| Creator applications and entitlement enforcement | VERIFIED COMPLETE WITH LIMITATIONS | DEV-014 and DEV-025 authenticated synthetic tests passed; real membership activation remains disabled |
| Founding 50 activation/allocation | VERIFIED PROTECTED | Development activation is `disabled`; protected mutation remains expected HTTP 423 |
| StudioFlow creator access | VERIFIED COMPLETE WITH LIMITATIONS | Positive entitled creator access and revoked denial passed; visual acceptance remains open |
| StudioFlow workspaces | VERIFIED COMPLETE WITH LIMITATIONS | Save, restore, update, archive, owner isolation, and conflict protection passed; migration ledger reconciliation remains open |
| StudioFlow JSON configuration backup/import | VERIFIED COMPLETE AT API/OFFLINE LEVEL | Export structure and import validation passed; browser download/file-picker interaction remains owner acceptance |
| StudioFlow recording recovery | IMPLEMENTED, BROWSER RESTART ACCEPTANCE PENDING | Existing browser-local recovery and download behavior preserved; session restart and playback were not manually verified in DEV-026 |
| RealtimeKit rooms/livestreams | IMPLEMENTED, EXTERNAL ACCEPTANCE PENDING | Integration path and protections are documented; no external room or livestream was created |

## Administration Center and creator boundaries

Creator Studio entitlement does not grant Administration Center access. The
current tests verify owner-scoped workspace access and cross-account isolation.
Private recordings, stream credentials, unpublished media, and provider tokens
remain outside the administration preview surface.

## Database and migration status

Development D1 is `tpi_contributor_portal_dev` (`4948ecc5-35de-4782-8f6b-b07fa1782b66`).
The `studio_workspaces` table exists remotely and supports the deployed workspace
routes. Wrangler's read-only migration listing reports
`0051_studioflow_workspaces.sql` as pending even though the table is present.
This is a migration-ledger reconciliation blocker for future migration work. No
database write or migration was performed by DEV-026.

## Backup and restore policy

Cloudflare D1 and R2 are application-storage services, not backup destinations.
The approved backup destinations are local storage, personal cloud drives, and
external/removable storage. StudioFlow currently exports/imports workspace
configuration JSON locally. Recording binaries are not included in that JSON;
existing browser-local recordings remain in browser storage until the creator
explicitly downloads or exports them. No automatic upload, deletion, or cloud
drive OAuth was introduced.

## Verified test evidence

- DEV-025 creator acceptance: 39/39 passed.
- DEV-024 offline workspace/backup boundaries: 17/17 passed.
- DEV-022 offline media/search/Events contracts: 15/15 passed.
- DEV-014 authenticated authorization: 57/57 passed.
- DEV-020 acceptance: 39/39 passed.
- DEV-021 integration: 116/116 passed.
- Video player regression: 22 assertions passed.
- Video format/date regression: passed.
- Media grid regression: passed.
- TPI Videos navigation regression: passed after a stale assertion was repaired.

Historical totals are not added together as unique coverage.

## Remaining owner and release decisions

1. Perform authenticated StudioFlow browser acceptance at desktop, tablet, and
   mobile sizes.
2. Verify browser download/import dialogs and browser session-restart recording
   recovery with a synthetic recording.
3. Decide whether to authorize a separate bounded RealtimeKit test, including any
   provider cost and cleanup approval.
4. Reconcile the development D1 migration ledger before future migration work.
5. Approve a production release only after the gap analysis and release checklist
   are satisfied.

See [TPI-DEV-026 implementation report](300-COMPLETED-WORK/TPI-DEV-026-IMPLEMENTATION-REPORT.md)
and [TPI-DEV-026 production readiness gap analysis](200-AUDITS/TPI-DEV-026-PRODUCTION-READINESS-GAP-ANALYSIS.md).

## TPI-DEV-031 interactive visual analytics

DEV-031 extends the existing protected Administration Center with member-growth,
community-engagement, membership-distribution, creator-activity, moderation,
and content-overview charts. The development Worker version is
`893f373b-8fa8-48ed-bd2b-f46e73142f57` from source commit `863387e`.
Analytics queries are read-only and bounded. Website traffic is shown as
unavailable because no reliable first-party visits/page-views source exists in
the current schema; no synthetic traffic is displayed. Membership distribution
is limited to actual creator-partnership membership categories where available,
with an explicit unavailable state when a general plan table is absent.

The DEV-031 focused checks pass 11/11, existing authorization regression passes
57/57, the React build passes, and authenticated development API verification
returns the expected analytics series. Production was not deployed or modified.
Owner authenticated browser inspection of the protected chart view remains an
acceptance item.

## TPI-DEV-032 navigation correction

The Administration Center now follows the existing member-shell navigation
patterns rather than maintaining a separate navigation design. The desktop and
iPad rail is fixed and independently scrollable; the main content scrolls in its
own viewport; active items use page-current semantics; the mobile layout uses a
drawer and bottom navigation; and `Return to Main Site` uses the current host's
`/` route. Existing menu groups and DEV-031 analytics remain present.

The final application source is `51236c3`. Development version
`c181a58d-005d-4c57-b188-24d3467fef78` and production version
`4f679573-fb15-4bf9-9541-2a85e70209a0` use the same built asset hashes. A
packaging-only corrective deployment removed private `lib/` and `functions/`
source files from the asset package; both environments now return 404 for
those paths. No database migrations, imports, or data writes were performed.

## TPI-DEV-027 production-release preparation

Production release preparation is currently `BLOCKED`. Read-only inspection
confirmed production Worker version `7e357215-2579-4c60-b27e-dd572a5656fe`, the
production D1 binding `tpi_contributor_portal`, and production R2 bucket
`tpi-contributor-media`. Production D1 contains many later application tables but
its Wrangler migration ledger records only `0001_contributor_portal.sql` and
`0002_contributor_profiles.sql`; `studio_workspaces` is absent.

The development D1 has the workspace table and five existing workspace rows, but
does not record migration 0051 in its ledger. Because both environments have
schema/history discrepancies, no migration was applied and no production backup
was exported. The release candidate and required approval procedure are recorded
in the TPI-DEV-027 reports. Production remains untouched.

## TPI-DEV-028 focused Administration Center release

TPI-DEV-028 was deployed after explicit owner approval. The
candidate source snapshot is `8dc0d45c8e0ab9dac2b7154f4458503d4a58bc44` on
`codex/tpi-development`; the production Worker version immediately before the
DEV-028 release was `7e357215-2579-4c60-b27e-dd572a5656fe`. Anonymous
read-only checks returned
HTTP 403 for `/admin-center-preview/`, `/admin-panel.html`, and
`/api/admin/overview`, confirming that the existing public boundary remains
protected.

The focused package is limited to the existing Administration Center preview
runtime, its protected admin API compatibility changes, and the already
present authentication/navigation boundary. It excludes StudioFlow, Events,
research, synthetic data, Founding 50 activation, database replacement, and
unapproved migrations. Dashboard, member management, community moderation,
notifications metadata, Education, video metadata/lifecycle, Paranormal Teams,
settings, roles/restrictions, and read-only creator/entitlement views passed
the local focused checks. Creator-application detail/create is deferred because
production does not have the additive `0050_creator_application_details.sql`
columns or the membership `application_id` column. No production write,
No production D1/R2 write, migration, export, data import, Founding 50
activation, or unrelated feature deployment was performed for DEV-028. The
final production Worker version is
`830aa684-d14e-4d39-b103-7fb7538fef84` at the time of the DEV-028 release;
an initial package version
`0f114a72-ccf0-46c7-aae2-ea53b79510de` was immediately corrected after its root
asset manifest exposed existing documentation paths. The final asset manifest
excludes `docs/`, and the checked documentation path now returns `404`.

## TPI-DEV-030 release workflow repair and deployment

The Administration Center source and route boundary has now been unified in
the development branch. `/admin-panel` is the canonical protected route, the
historical `/admin-center-preview/` path serves the same React package for
compatibility, and authenticated `/admin-panel.html` bookmarks redirect to the
canonical route. Desktop and mobile Administration navigation now use
`/admin-panel`. The shared React application hydrates the signed-in member's
saved theme and typography from the existing personalization APIs. The guarded
development staging script records an Administration Center package manifest
with source identity and SHA-256 file hashes. TPI-DEV-030 implementation checks
pass. The owner-approved release was deployed to development as Worker
`85a142a1-026e-4658-b8f1-a7924ba30062` and to production as Worker
`f89c0971-b3e5-40be-9b20-abfa9a132dcd` from final source commit
`ef7182e77d7966dacff49e21701580ba189103ae`. The first production version
`40e6b45d-7f85-40ec-acc3-0cd1edac490c` was immediately corrected after a
non-destructive source-path check found `/lib/auth.js` publicly readable; the
corrected asset manifest excludes `lib/`, and the path now returns 404. The
production package was assembled against the production baseline and uses the
production D1/R2 bindings; no migrations, imports, secret changes, or data
writes were made. Anonymous protection and public smoke routes passed, and the
deployed source and documentation paths are not publicly exposed. Authenticated
owner/admin browser rendering, dashboard data loading, and production
personalization acceptance remain pending because no owner production session
was available.

## TPI-DEV-034 unified ParaNews and ParaTube layout

TPI-DEV-034 unified the canonical `/news` and `/paratube` content hubs with
the existing TPI member shell. The implementation reuses the established
sidebar, independent scrolling, mobile navigation, authentication boundary,
theme variables, typography, and member-home conventions. Existing news/video
APIs, cards, search/category controls, links, scrapers, and the distinct `/`,
`/member-home`, and `/explore` destinations were preserved.

The original implementation source is `50cedea2bd5e9f7e2f0bad1bcbfd9a9761cc5ee0`.
The addendum source is `41de90a98fac0747fe19c376e463c70a578cee36`.
Development deployment `264e5ea5-b165-4b6e-adc0-1bc41f7bebcc` and production
deployment `80cc9aa2-c2a2-4fc8-99c7-989e523e4654` use the addendum source.
Focused source checks passed 16/16; member-home, DEV-032, DEV-033,
DEV-030, workspace-layout, syntax, and diff checks passed; development
runtime verification passed, including authenticated development root routing;
and the anonymous production smoke suite passed 10/10. No D1/R2 writes,
migrations, imports, authentication changes, or
unrelated feature changes were made. Authenticated production browser visual
acceptance remains pending because no production owner session was available.

The root routing correction uses the Worker session boundary to redirect
authenticated `/` requests to `/member-home` while preserving the public home
for signed-out visitors. The early theme bootstrap applies the existing local
theme before first paint, and the member shell now synchronizes with the
include-ready event instead of waiting a fixed 150 ms. The production rollback
target was `a2cbde12-0c39-4eeb-ac75-269e66c6dcea`.

## TPI-DEV-035 public landing and authenticated home routing

TPI-DEV-035 corrected the remaining public/authenticated mismatch. Hosted
/api/auth/me is authoritative, while localStorage identities are accepted only
for local preview origins. This prevents stale preview state from showing a
member greeting when the Worker correctly has no session. Anonymous root
responses are private, no-store, and authenticated root requests continue to
redirect to /member-home.

The public landing page retains the established TPI visual system and content
assets while adding clear entry cards for ParaNews, ParaTube, Our Apps, and
Contact & Links. The existing shared sidebar is populated for guests with
public route destinations and remains unchanged for authenticated members.
Because the deployed Cloudflare asset configuration returned 500 for the
standalone clean URLs /member-sidebar and /footer, the guarded staging
scripts emit .txt aliases containing the exact canonical source markup.

Development deployment 20031a3d-1c35-4621-a1b4-b74842256a95 and production
deployment adc6e8d7-1950-49a7-8127-54f0a2acd634 use source commit d127bd3.
Source checks and public runtime checks passed. The broad authenticated browser
runner was blocked by its own safety gate because it would create six
development session records; authenticated production acceptance remains
pending and is not represented as passed.

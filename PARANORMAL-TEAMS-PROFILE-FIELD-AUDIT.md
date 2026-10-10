# Paranormal Teams Profile & Field Mapping Audit

**Directive:** 009A
**Date:** 2026-10-09
**Project:** The Paranormal Initiative
**Status:** Local implementation and pre-import audit completed

## Local implementation update — 2026-10-09

The first implementation pass is now complete in the canonical checkout. It remains local-only: migrations `0039` and `0040` were created but not applied, and no production data or deployment was touched.

Completed in this pass:

- Added a nullable `description` field and separate Organization Description display.
- Added international State / Province / Region submission support.
- Preserved postal codes in international profile, browse, search, and admin locations.
- Connected public detail responses to normalized `organization_links` with legacy-link fallback.
- Added safe HTTP(S)-only link handling and hidden source-page comment/ad markup from rendered narrative text.
- Added historical/unverified profile notices.
- Added authorized team editing with append-only edit audit events.
- Added administrative claim review endpoints and UI.
- Prevented deletion of approved, imported, claimed, or otherwise protected team records.
- Prevented imported listings from being approved through the ordinary registered-team approval controls.

Completed in the pre-import preparation pass:

- Extended the dry-run preview with research/source/snapshot provenance and normalized website, Facebook, X, and YouTube identities.
- Marked imported links unverified and preserved the raw historical `details` value separately from display-only comment-stripped text.
- Resolved historical description mapping explicitly: `description` remains null because the research source has no dedicated description field; historical narrative remains in `details`.
- Added a temporary SQLite/D1-shaped authorization fixture for edit membership, claim/admin guards, audit events, protected deletion, and imported-publication blocking.
- Generated `data/paranormal_teams_publication_review.json` as a review-only publication manifest; all 4,935 valid candidates remain pending and none are marked for automatic publication.
- Qualified rehearsal import identities as `source_region:external_id` after detecting overlapping numeric IDs between the USA and international source directories; raw source IDs remain visible in the review manifest.
- Added a production-package builder that emits deterministic import chunks, guarded rollback SQL, post-import verification SQL, and checksums without contacting remote D1.

The remaining decision is operational rather than structural: imported listings still require an explicit approved publication policy before any production import or approval.

## Publication review manifest

The local manifest is intentionally a queue, not an import instruction. Its policy is:

- `record_type`: `IMPORTED_DIRECTORY_LISTING`
- initial `status`: `pending`
- `verification_status`: `UNVERIFIED`
- automatic publication: disabled
- ownership/claim assignment: none
- current activity inference: disabled
- duplicate candidates: held for review; no automatic merge or overwrite

The generated review queue contains 4,935 candidate records, with 569 records participating in duplicate candidates. Three records are blocked separately because their latest snapshot has no city. A further 975 candidates have no normalized online identity and should receive additional review before publication.

The local rehearsal uses deterministic IDs based on the region-qualified source identity, so a USA record and an international record with the same numeric source ID cannot collide in `team_imports`.

The production package is generated separately from the rehearsal fixture and is marked `remote_execution: NOT_PERFORMED` with `authorization_required: true`.

## Scope and restrictions

This audit compares the user-provided Pasco Paranormal Research Society screenshot with the existing Paranormal Teams frontend, API, D1 migrations, and local research database.

No organizations were imported. No production D1 migration was applied. No production data was changed. No deployment was performed. The screenshot was used for information structure only; its visual styling was not copied.

## Executive conclusion

The existing profile page already has the correct general information structure for the reference:

1. Organization name
2. Location
3. Contact information
4. Organization information
5. Areas served
6. Specialties
7. Details

The core fields can be carried from the research database into the current legacy `paranormal_teams` columns and then into the public profile. Empty rows are already omitted by the profile renderer, so the site does not need to show fabricated `Unknown` values.

The profile is now locally prepared for a controlled import review. Before importing research organizations, the following operational safeguards still apply:

- Preserve postal codes for international profiles and model/display state or province when supplied.
- Keep the historical `details` field as source material and leave imported `description` null until a dedicated description is independently supplied.
- Review the dry-run's normalized links and duplicate candidates before any import.
- Keep imported listings unverified and separate from activity, approval, and ownership/claim state.
- Do not apply migrations or import records until the publication policy is explicitly approved.

These are focused data-display and safety corrections, not a reason to redesign the Paranormal Teams section.

## Existing page inventory

The directory currently contains the expected seven pages:

| Page | Current role | Audit result |
|---|---|---|
| `teams/index.html` | Directory home and counts | Present; uses the public counts/listing API |
| `teams/find.html` | State/country entry point | Present; supports U.S. and international browsing |
| `teams/browse.html` | Filtered team listing | Present; renders name and location rows |
| `teams/search.html` | Name, acronym, city, and keyword search | Present; uses the public teams API |
| `teams/add.html` | U.S. and international submission form | Present; contains the core reference fields plus social fields |
| `teams/admin.html` | Leadership approval queue | Present; renders most submitted fields and status actions |
| `teams/team.html` | Individual public profile | Present; matches the reference information hierarchy in broad form |

The add form now supports authorized edit mode for an existing approved team. The admin page includes claim-review controls. The submission form and approval queue remain available for registered-team workflows.

## Reference field mapping

The reference screenshot contains a single profile with the following information groups. The mapping below traces each field through the available layers.

| Reference field | Research source | Website/D1 field | Form/API support | Public profile result |
|---|---|---|---|---|
| Organization Name | `organizations.canonical_name`; snapshot `source_name` | `paranormal_teams.name` / `name` | Add form, POST `/api/teams`, public GET | **Direct; supported** |
| City | `source_snapshots.city` | `city` | Add form, POST, list/detail API | **Supported; required for registered submissions** |
| State | `source_snapshots.state_province` | `state` / `additional_states` | U.S. and international add/edit forms and public location | **Supported; international values use State / Province / Region** |
| Postal Code | `source_snapshots.postal_code` | `zip` | Add/edit form, POST/PUT, public profile and listings | **Supported wherever supplied** |
| Contact Name | `source_snapshots.contact_name` | `contact_name` / `contactName` | Add form, POST, admin, public profile | **Direct; supported** |
| Phone | `source_snapshots.phone` | `phone` | Add form, POST, admin, public profile | **Direct; supported** |
| Email | `source_snapshots.email` | `email` | Add form, POST, admin, public profile | **Direct; supported** |
| Website | `source_snapshots.website` | `website` | Add form, POST, admin, public profile | **Direct; supported as one legacy link** |
| Founder | `source_snapshots.founder` | `founder` | Add form, POST, admin, public profile | **Direct; supported** |
| Year Founded | `source_snapshots.year_founded` | `year_founded` / `yearFounded` | Add form, POST, admin, public profile | **Direct; supported** |
| Number of Members | `source_snapshots.member_count` | `members` | Add form, POST, admin, public profile | **Direct; supported** |
| Areas Served | `source_snapshots.areas_served` | `areas_served` / `areasServed` | Add form, POST, admin, public profile | **Direct; supported** |
| Specialties | `source_snapshots.specialties` | `specialties` | Add form, POST, admin, public profile | **Direct; supported** |
| Organization Description | No dedicated source column; narrative may be in `details` | `description` added by local migration `0039` | Add/edit form, API, admin, and profile now support it | **Historical import intentionally maps to null; new/edited records can supply it** |
| Additional Details | `source_snapshots.details` | `details` | Add/edit form, POST/PUT, admin, public profile | **Raw value preserved; display renderer removes source HTML comments** |

The existing database also stores address, alternate phone/email, fax, acronym, and additional U.S. states. Those are available to the form/API/admin layer, but the public profile intentionally does not display the street address and only displays the additional-state summary.

## Research database coverage

Counts below use the latest snapshot associated with each of the 4,938 organizations, which is the same snapshot-selection approach used by `scripts/migration_dry_run.py`.

| Field | Populated | Missing |
|---|---:|---:|
| Organization name | 4,938 | 0 |
| City | 4,935 | 3 |
| State/province | 4,891 | 47 |
| Postal code | 3,368 | 1,570 |
| Country | 4,938 | 0 |
| Contact name | 3,875 | 1,063 |
| Phone | 2,986 | 1,952 |
| Alternate phone | 774 | 4,164 |
| Fax | 128 | 4,810 |
| Email | 4,925 | 13 |
| Alternate email | 1,144 | 3,794 |
| Website | 3,581 | 1,357 |
| Facebook URL | 656 | 4,282 |
| X/Twitter URL | 192 | 4,746 |
| YouTube URL | 164 | 4,774 |
| Founder | 3,752 | 1,186 |
| Year founded | 4,937 | 1 |
| Member count | 4,729 | 209 |
| Areas served | 4,543 | 395 |
| Specialties | 3,463 | 1,475 |
| Details | 3,187 | 1,751 |

The database contains 5,142 source records and 5,142 source snapshots for 4,938 organizations. The snapshot layer is the authoritative historical source for profile-field values; the identity/source-record layer should not be treated as a current-value table by itself.

The three latest records without a city are:

- South Carolina Paranormal Research and Investigations
- Dusk Til Dawn Paranormal Services
- Vanquishing Demons

They should remain preserved as source records. They should not receive invented cities or be silently discarded.

## Pasco reference validation

The local research database contains the reference organization as organization `3063`, source listing `USA/3949`, named **Pasco Paranormal Research Society**. Its latest snapshot contains the reference profile's location, contact, website, founder, founding year, member count, areas served, specialties, and details.

The current profile renderer has a corresponding output path for every one of those populated values. It omits empty rows, which is the desired behavior. The main discrepancy is semantic: the long narrative is currently rendered under **Details**, while the screenshot presents a separate narrative area before the final **Details** block.

## Social and multiple online identities

Migration `0036_paranormal_teams_extensions.sql` adds `organization_links` with platform, URL, link type, discovery source, discovery/check dates, link status, verification status, and evidence notes. That is the correct long-term model for historical websites, replacement websites, Facebook pages/groups, Instagram, YouTube, X, and other identities.

The local implementation is connected while preserving legacy compatibility:

- `teamRowToPublic()` returns the legacy fields plus normalized `links` from the approved profile response.
- `teams/team.html` renders normalized links and falls back to legacy columns during transition.
- The authenticated link route and authorized edit form are available for maintained records.
- The dry-run emits normalized link objects with historical discovery time, source, and unverified status; no link rows have been imported.

Before import, the normalized link preview should be reviewed. Historical URLs should remain stored rather than replaced when a newer social identity is discovered.

## Imported, registered, claimed, and verification state

Migration 0036 adds `record_type`, provenance columns, claim columns, and verification columns. The API exposes `recordType` and `verificationStatus` on public team objects, but the profile does not display either value.

The research dry-run preview identifies future records as `IMPORTED_DIRECTORY_LISTING` and `UNVERIFIED`. That distinction must remain separate from:

- administrative approval (`status`)
- organizational activity (`ACTIVE`, `POSSIBLY_ACTIVE`, `UNABLE_TO_VERIFY`, `APPEARS_DEFUNCT`)
- ownership/claim state

An imported listing with a dead website must not automatically be labeled defunct, and an imported listing must not receive an owner merely because a claimant knows the organization's name.

## API and authorization audit

Current public and protected routes include:

- `GET /api/teams/counts`
- `GET /api/teams/{id}`
- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/{id}/links`
- `POST /api/teams/{id}/links` — member plus team-owner/admin check
- `GET /api/teams/{id}/verification`
- `POST /api/teams/{id}/verification` — owner/admin
- `POST /api/teams/{id}/claim` — authenticated member
- `GET /api/admin/teams` — owner/admin
- `POST /api/admin/teams/{id}/approve` — owner/admin
- `POST /api/admin/teams/{id}/reject` — owner/admin
- `POST /api/admin/teams/{id}/status` — owner/admin
- `DELETE /api/admin/teams/{id}` — owner/admin

The public profile and directory correctly restrict ordinary team listing/detail queries to `status = 'approved'`. All current team submission and admin queries use bound parameters.

The local implementation closes the listed mutation and visibility gaps: edit and claim routes are protected, edits are audited, claim review is admin-only, protected records cannot be deleted from the queue, and link/verification history requires an approved public team. The profile displays the historical/unverified distinction without treating it as a current activity finding.

## Responsive and presentation audit

The existing `teams.css` uses a self-contained responsive layout. The profile uses a flexible label/value row and changes labels to full-width at the 720px breakpoint. Long values use `overflow-wrap: anywhere`, and narrative sections preserve line breaks.

The structure is appropriate for desktop, tablet, and phone layouts. Before importing, representative local previews should still be checked for:

- very long organization names;
- international locations with long country names;
- long areas-served and details text;
- profiles with only a Facebook or other social link;
- missing city or postal code;
- multiple normalized links;
- special characters in names and descriptions.

No visual redesign is required by this audit.

## Required implementation order before migration

1. Review `data/paranormal_teams_publication_review.json`, including the 461 duplicate pairs, 569 participating records, and the three blocked missing-city records.
2. Review normalized-link candidates (4,593 links across 3,962 organizations) and decide which imported records, if any, should be published.
3. Approve a separate publication policy for imported listings.
4. Only after that approval, prepare a separate production migration/import directive.

## Audit result

The current site has the right foundation and can represent the Pasco-style information structure without copying the reference site's appearance. The local code and dry-run are now prepared for controlled review: normalized identities, provenance/status presentation, international location handling, description/details semantics, editing/claiming controls, and protected admin mutations are implemented and tested.

This report still does not authorize or perform an import, production migration, or deployment. The two new migrations remain unapplied, and the dry-run output was written only to a temporary validation path.

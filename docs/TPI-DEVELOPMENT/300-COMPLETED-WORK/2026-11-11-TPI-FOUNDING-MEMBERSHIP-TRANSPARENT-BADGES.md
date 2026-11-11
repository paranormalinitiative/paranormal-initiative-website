# Founding Membership: Transparent Badges Across Member Profiles

Date: 2026-11-11
Status: `DEPLOYED_AND_VERIFIED`

## Changes

- Replaced the prior opaque founding membership badge masters with the owner
  supplied transparent images: `FoundingAllAccessMaster.png`,
  `FoundingContributerMaster.png`, and `FoundingCreatorMaster.png`.
- Regenerated every published PNG and WebP derivative from those masters.
  The master PNGs and derivatives preserve transparency; profile badge images
  use `object-fit: contain` on a transparent background.
- Kept the existing shared badge paths, so member profile identity, the
  Honors & Distinctions wall, and the right rail all use the new art without
  changing membership assignments or profile layouts.
- Updated the recognition image cache version so previously cached badge art
  refreshes on the member badge and its details view.
- Added verification that founding badge PNG masters and derivatives remain
  RGBA. No production member, membership, capability, or profile records were
  changed.

## Verification

- Founding membership and entitlement regression: 157 passed, 0 failed,
  including transparency checks for all master and published PNG files.
- Focused member profile API checks: 32/32 passed.
- Focused Firefox member profile acceptance: 32/32 passed, including the
  visible badge loading with the current cache version, matching compact
  recognition tiles, right rail, and clickable membership details.
- Required local authentication lifecycle: 38 checks passed before and after
  the managed Worker restart and after the StudioFlow build; isolated Firefox
  acceptance passed 65/65.
- Guarded release preflight certified the exact source commit; all 30 release
  gates passed.
- Production schema readiness passed with no pending migrations.
- Production anonymous smoke: 10/10 passed.
- Production isolated Firefox Developer Edition acceptance: 65/65 passed.
- New Worker version verified at 100% traffic; rollback was not needed.

The focused badge/profile checks used synthetic local membership fixtures. No
member membership assignment or account record was changed.

## Release

- Source commit: `88eb84bde0a87d9940619e571750f457facc91fd`
- Release ID: `rel-88eb84bde0a8-4ef7eedc0255`
- Worker: `theparanormalinitiative`
- Deployed version: `eb0a4037-3ac6-4927-a6cc-9f21c8dd1160`
- Rollback version: `8889499f-80ef-4f62-8fd8-76c32080731c`
- Guarded release result: `DEPLOYED_AND_VERIFIED`

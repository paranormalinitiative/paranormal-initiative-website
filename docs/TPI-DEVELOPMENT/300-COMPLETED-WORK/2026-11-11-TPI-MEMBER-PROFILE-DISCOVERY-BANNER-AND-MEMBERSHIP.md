# Member Profile Discovery: Banner and Membership Display

Date: 2026-11-11
Status: `DEPLOYED_AND_VERIFIED`

## Changes

- Removed the shared TPI banner fallback from member profile views. A profile
  without a saved banner now has an empty cover area; a member's own banner is
  still shown when set.
- Added the single public Founding Membership badge and membership number to
  the profile identity when the server provides an active membership identity.
- Hide the generic role chip when this badge is present, preventing the
  misleading `Member Access` label from appearing alongside a dual-access
  membership badge.
- Did not change any production membership, capability, profile, or media
  records.

## Production data review

Read-only production checks found nine active profiles without a custom banner;
none had the shared TPI banner saved as their own. Heather Leigh's account has
active Creator and Contributor capabilities and an active Founding All-Access
membership (FAA-001). The profile now displays that one membership badge and
number. The inspected production records were not modified.

## Verification

- Focused profile API suite: 26/26 passed.
- Focused isolated Firefox profile suite: 26/26 passed, including an empty
  banner profile and a synthetic Founding All-Access profile with loaded badge
  artwork and FAA membership number.
- Required local authentication lifecycle: 38/38 checks passed, including the
  managed Worker restart and isolated Firefox acceptance.
- Guarded release preflight: `READY`; all release gates passed.
- Production anonymous smoke: 10/10 passed.
- Production isolated Firefox Developer Edition acceptance: 65/65 passed.
- New Worker version verified at 100% traffic; automatic rollback was not
  needed.

## Release

- Source commit: `43fd8e30863046c35f450e55a6e3198ac4c8490b`
- Worker: `theparanormalinitiative`
- Deployed version: `d984e23a-8955-441a-947a-ea8c9c651609`
- Rollback version: `d13308d8-b039-4b27-ad9b-cbf50d013bc2`
- Guarded release result: `DEPLOYED_AND_VERIFIED`

The isolated production Firefox acceptance is the repository's standard
authenticated release smoke, focused on StudioFlow. The profile-specific
browser acceptance used local synthetic members; Heather's production
membership and capability records were verified read-only.

# Member Profile Honors Header Cleanup

Date: 2026-11-12  
Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED**

## Requested outcome

Remove the Founding Membership badge pill from every member profile header
because recognition now has a dedicated Honors & Distinctions area.

## Changes

- Removed the membership chip, its identity-header styles, and its render-time
  DOM updates from the shared member profile template.
- Kept role labels, public profile data, and membership records intact.
- Kept founding membership artwork, membership numbers, descriptions, and
  accessible detail modals in the profile Honors & Distinctions wall and right
  rail.
- Updated source and Firefox acceptance checks to require an empty profile
  header membership slot and retained honors recognition.

No member records, membership assignments, badge assets, other repository
books, or Haunted Locations books were changed.

## Verification

- `npm run verify:member-profile-feed`: **31/31 passed**.
- `npm run verify:member-profile-feed-firefox`: **31/31 passed** in isolated
  Firefox Developer Edition.
- `npm run verify:local-auth-lifecycle`: **38/38 passed**, including login
  after managed Worker restart and StudioFlow build.
- `npm run release:preflight`: **CERTIFIED**; 30 release gates passed, with
  isolated disposable API E2E, release Firefox, StudioFlow lifecycle,
  ownership, deletion-safety, UI, and build checks passing.
- `TPI_PRODUCTION_DEPLOY=approved npm run release:production`:
  **DEPLOYED_AND_VERIFIED**; anonymous production smoke **10/10** and live
  isolated Firefox Developer Edition release acceptance **65/65**.
- Read-only production template check: HTTP 200; no membership chip marker;
  Honors renderer and shared profile shell remain present.

## Release

- Branch: `codex/tpi-development`
- Application source commit: `a5a815e8b9a3e30fa9b4df6043bfe3614420e5c4`
- Release: `rel-a5a815e8b9a3-a2f404f5c50c`
- Worker version: `f65602de-f2ff-4af4-85e4-bef08490f6ee` (100% traffic)
- Rollback version: `83cd8130-f963-487e-add8-9cc31a77c7e0`
- Production data changes: none

## Scope boundaries

This profile-only change did not alter the Education Center, Ghostology,
Messenger, StudioFlow functionality, Haunted Locations books, or other
Repository books.

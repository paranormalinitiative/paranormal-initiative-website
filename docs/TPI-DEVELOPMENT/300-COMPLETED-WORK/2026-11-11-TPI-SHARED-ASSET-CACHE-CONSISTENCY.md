# Shared Page Asset Cache Consistency

Date: 2026-11-11 (local)  
Status: `DEPLOYED_AND_VERIFIED`

## Changes

- Aligned shared CSS and JavaScript cache versions across 237 in-scope HTML pages.
- Updated the automatic member-shell loader to request the same shell versions as
  explicit page references.
- Added `verify:shared-asset-cache-consistency` to detect mismatched shared asset
  versions in those pages.
- Left five standalone reference books and the full `haunted-location-directory/`
  tree untouched. No Repository book text was edited.
- No production account or content data changed.

## Verification

- Shared asset reference verifier: 237 in-scope HTML files passed.
- Local authentication lifecycle: 38/38 checks before and after the managed Worker
  restart/build; local isolated Firefox acceptance: 65/65.
- Focused member profile: 32/32; Friends layout: 9/9; Messenger: 18/18;
  Education Center destinations: 30/30; leadership distinctions contract: 18/18.
- Guarded release preflight certified the exact commit with all 30 gates passed.
- Production anonymous smoke: 10/10; production isolated Firefox Developer Edition:
  65/65.
- Six directly checked shared asset URLs and the member-home and Education Center
  page shells returned HTTP 200 after deployment.
- The deployed Worker version reached 100% traffic; rollback was not needed.

## Release

- Source commit: `a4a349647356e689ffd3cc37c484d5f592e78c6f`
- Release ID: `rel-a4a349647356-83905623f687`
- Worker: `theparanormalinitiative`
- Deployed version: `83cd8130-f963-487e-add8-9cc31a77c7e0`
- Rollback version: `eb0a4037-3ac6-4927-a6cc-9f21c8dd1160`
- Guarded release result: `DEPLOYED_AND_VERIFIED`

This is a shared-asset cache consistency repair. It does not certify visual
acceptance of every website route. The broader audit and ongoing owner review are in
[`TPI-WEBSITE-COMPLETENESS-AND-CONSISTENCY-AUDIT.md`](../../audits/2026-11-11/TPI-WEBSITE-COMPLETENESS-AND-CONSISTENCY-AUDIT.md).

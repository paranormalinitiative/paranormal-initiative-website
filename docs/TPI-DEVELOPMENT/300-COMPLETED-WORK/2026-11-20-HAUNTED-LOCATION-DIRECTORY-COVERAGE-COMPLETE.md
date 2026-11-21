# Haunted Location Directory Coverage Completion

Date: 2026-11-20
Scope: The Paranormal Initiative public Haunted Locations / State Directory

## Result

The State Directory now presents all 50 states as completed directory pages.
Every state that was below the 12-location minimum was expanded to at least
12 entries, including Pennsylvania. Existing larger directories were
preserved rather than trimmed.

The public directory index now records 775 location entries. The former New
State Research Leads are presented in the completed State Directory section.
The expanded states are:

- Alaska, Delaware, Hawaii, and West Virginia: expanded to 12 entries.
- Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire,
  New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio,
  Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota,
  Tennessee, Texas, Utah, Vermont, Virginia, and Washington: completed at 12
  entries each.

Pennsylvania includes the previously verified Doss House entry, bringing its
runtime directory count to 12.

## Image and source coverage

Each added entry has a local case-file photo asset and a recorded source and
credit. The renderer uses the verified source photograph directly, or the
existing TPI case-file treatment when one is already recorded. The pages keep
the state label, full-image viewer, source/license link, and credit visible.

The six remaining base-entry gaps found during the final audit were filled for
Gold Hill Hotel (Montana), Hinsdale House (New York), Hotel Donaldson (North
Dakota), Gilcrease Museum (Oklahoma), Sica Hollow State Park (South Dakota),
and Old South Pittsburg Hospital (Tennessee). The Gilcrease image is the exact
museum interior and is attributed to its Wikimedia Commons license record.

## Safeguards and verification

The directory expansion is kept in dedicated data/source layers:

- `haunted-location-directory/state-directory-additions.js`
- `haunted-location-directory/state-directory-addition-sources.js`
- `haunted-location-directory/legacy-directory-additions.js`
- `haunted-location-directory/legacy-directory-addition-sources.js`
- `scripts/qa/tpi-haunted-location-directory.mjs`

The regression gate checks all 50 pages, minimum state counts, complete
eight-field records, valid local image bytes rather than saved error pages,
source and credit attribution,
legacy additions, state labels, full-image viewer behavior, and the directory
index count. It passed with:

```text
TPI haunted-location-directory verification passed: 50 state pages, 775 indexed directory entries, no placeholders.
```

Commands used:

```sh
node --check scripts/qa/tpi-haunted-location-directory.mjs
node scripts/qa/tpi-haunted-location-directory.mjs
```

No StudioFlow, Nova Editorial Workspace, authentication, administration, or
member data was changed by this directory work.

## Release evidence

The guarded release completed successfully on 2026-11-21.

- Release ID: `rel-a70d8de10283-ea655f622bca`
- Source commit: `a70d8de10283ce836b3547acb5aca5847b326236`
- Release profile: website
- Certification status: `CERTIFIED` with 10 gates passed
- Deployed Worker version: `ce07db63-5daf-40c7-886f-148e51384f9f`
- Live result: `DEPLOYED_AND_VERIFIED`
- Anonymous production smoke: 10/10 passed

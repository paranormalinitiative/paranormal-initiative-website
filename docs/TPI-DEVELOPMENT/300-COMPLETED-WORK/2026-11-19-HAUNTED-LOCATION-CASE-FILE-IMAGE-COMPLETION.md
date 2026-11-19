# Haunted Location Case-File Image Completion Pass

Date: 2026-11-19
Status: **LOCALLY COMPLETE AND VERIFIED — production release pending repository transport recovery.**

## Scope

This continuation completes the exact-location image pass for the 25 newer
state pages. The directory still contains all 50 state pages and 563 total
location entries. Of the 100 newer shared-rendered starter entries, 94 now
have an exact, locally stored source photograph and a separate TPI archival
case-file treatment.

The six remaining starter entries are intentionally visible as **Exact
case-file photograph pending** because no exact source with clear reuse terms
could be confirmed:

- Montana — Gold Hill Hotel: the readily available exact Nevada Gold Hill
  photograph is not the Montana entry, so it is not reused.
- New York — Hinsdale House: the location is private and no permission-cleared
  exact photograph was confirmed.
- North Dakota — Hotel Donaldson: available exact photographs were marked all
  rights reserved or lacked a clear reuse grant.
- Oklahoma — Gilcrease Museum: the freely reusable Commons result is a
  rendering, not a documentary photograph of the exact building.
- South Dakota — Sica Hollow State Park: no exact site photograph with clear
  reuse terms was confirmed.
- Tennessee — Old South Pittsburg Hospital: the exact building photographs
  located were credited to a current photographer without a reuse grant.

No AI-generated landmark substitute is used for any of these six entries.

## Added in this pass

- Washington: Pike Place Market, Northern State Recreation Area, Arctic Club
  Building, and Thornewood Castle.
- Nebraska: Museum of Shadows, using the exact Christian Specht Building at
  1110 Douglas Street in Omaha.
- New Mexico: The James Hotel, using the exact St. James Hotel in Cimarron.
- Vermont: corrected the source-key punctuation for Emily’s Bridge so the
  verified image resolves from the canonical entry name.

Each new source is stored in
`haunted-location-directory/case-file-photos/`, with the untouched source
photograph, the TPI case-file treatment, source URL, credit, and reuse terms
recorded in `case-file-sources.js` and the photo README.

## Protection and verification

The renderer remains state-aware for duplicate names and resolves
`State::Location` before falling back to a unique location name. This prevents
one state’s photograph from being shown for another state’s similarly named
location. The existing viewer keeps the complete image inside its frame and
opens the full treatment when clicked.

Verification passed:

```text
node --check haunted-location-directory/state-directory.js
node --check haunted-location-directory/case-file-sources.js
npm run verify:haunted-location-directory
git diff --check
TPI haunted-location-directory verification passed: 50 state pages, 100 new starter entries, no placeholders.
```

The focused local checks completed without touching StudioFlow, Nova Editorial
Workspace, member data, or the owner account. The guarded production release
has not been claimed: GitHub is currently resetting the branch upload before
the remote can accept the commits, so production smoke and live acceptance
remain pending.

## Source rule

An exact location photograph is added only when the source identifies the
actual place and the reuse terms are recorded. A stylized TPI case-file image
is a presentation treatment of that exact source; it is not presented as an
unedited documentary photograph. If those conditions cannot be verified, the
pending state stays visible until TPI receives a compatible source or direct
permission.

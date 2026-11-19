# Haunted Location Case-File Image Completion Pass

Date: 2026-11-19
Status: **DEPLOYED AND LIVE VERIFIED.**

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
Workspace, member data, or the owner account. The guarded website release
completed with production smoke passing 10/10 and the new Worker holding 100%
traffic. StudioFlow live acceptance remained locked and skipped because no
StudioFlow source or shared runtime changed.

## Release record

- Source commit: `6727874517500321452bdd7efee1a469d9de7fd8`
- Release candidate: `rel-672787451750-6f7d3f8f3d80`
- Production Worker version: `64527314-059c-4036-b5c3-3b4f770739eb`
- Rollback target: `f0538997-789a-4857-ad2d-0e1cc2cd359f`
- Release profile: website; protected application maintenance lock preserved
- Production smoke: **10/10 passed**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Source rule

An exact location photograph is added only when the source identifies the
actual place and the reuse terms are recorded. A stylized TPI case-file image
is a presentation treatment of that exact source; it is not presented as an
unedited documentary photograph. If those conditions cannot be verified, the
pending state stays visible until TPI receives a compatible source or direct
permission.

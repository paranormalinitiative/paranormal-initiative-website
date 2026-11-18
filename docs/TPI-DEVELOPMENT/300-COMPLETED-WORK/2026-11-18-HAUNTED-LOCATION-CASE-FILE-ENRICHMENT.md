# Haunted Location Case-File Enrichment

Date: 2026-11-18
Status: **DEPLOYED AND LIVE VERIFIED.**

## Direction

The new state pages should feel like the original TPI location-reference
pages: a real case file with historical context, reported activity, structure
and research zones, location data, classification, and a clear research state.

The image rule is documentary and exact. An AI-generated landmark likeness must
not be presented as a photograph of a real building or haunted place. TPI will
use an official, historical-society, government, or properly attributed public
archive photograph when the source identifies the exact location and the reuse
terms are recorded. AI may help with a frame, crop, or non-documentary design
treatment only when it does not alter the identity of the place.

## Implementation

- The shared renderer now gives every new entry Historical Context, Activity
  Reported, Structure / Research Zones, Location Data, Classification, and
  Research Status sections.
- Exact source photographs are stored in TPI's local
  `haunted-location-directory/case-file-photos/` folder and include a visible
  source-and-license link and credit.
- Entries without a verified exact photograph display **Exact case-file
  photograph pending** and explicitly use no AI substitute.
- Minnesota is now complete for its four directory entries: Wabasha Street
  Caves, Palmer House Hotel, Glensheen Mansion, and Forepaugh's Restaurant.
  Their local copies retain the source, attribution, and license record; the
  Forepaugh image was supplied as the exact-building reference for TPI's case
  file.
- Each of the three current exact-photo records now has a separate archival
  case-file treatment derived from that exact photo. The renderer labels each
  treatment and links to the untouched original local photo, so the
  presentation cannot be mistaken for an unedited documentary photograph.
- Every case-file photo now carries a visible state label rendered from the
  page's canonical state name. This keeps Minnesota, Michigan, or any future
  state label tied to the location data instead of relying on text baked into
  an image or a manual label that can drift.
- The remaining locations are intentionally pending source-by-source image
  review; no guessed image is published.
- The maintained local Worker refresh now includes
  `haunted-location-directory`, preventing nested directory pages from serving
  stale staged copies after an update.

## Verification

```text
node --check haunted-location-directory/state-directory.js
node --check haunted-location-directory/case-file-sources.js
node --check scripts/qa/tpi-haunted-location-directory.mjs
npm run verify:haunted-location-directory
TPI haunted-location-directory verification passed: 50 state pages, 100 new starter entries, no placeholders.
```

The official local Worker was refreshed and served the updated renderer and
case-file source layer. The guarded production release completed with
production smoke passing 10/10 and the new Worker holding 100% traffic.

## Release record

- Source commit: `a1b246a25172c5d313703cb17c8ee34b14d32cec`
- Release candidate: `rel-a1b246a25172-609a92f2714b`
- Production Worker version: `fbc17d25-ec5d-44fc-8e44-ba759937ead4`
- Rollback target: `9d4d3805-e13a-4eee-83cb-c9441adf3654`
- Release profile: website; protected application integrity guard passed
- Production smoke: **10/10 passed**
- Firefox Developer Edition acceptance: not required by the website-only
  profile; the existing protected-application guard passed and StudioFlow live
  acceptance was skipped without changing StudioFlow.
- Final release state: **DEPLOYED_AND_VERIFIED**

## Remaining image work

Image completion is a research queue, not an AI batch-generation task. Each
remaining location needs an exact-place photo, a source page, a reuse/license
record, and a visual identity check before it is added. If no safe reusable
photo can be confirmed, the pending state remains visible.

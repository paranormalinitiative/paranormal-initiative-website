# Haunted Location Case-File Enrichment

Date: 2026-11-18
Status: **IMPLEMENTED; RELEASE PENDING FINAL GUARD AND LIVE ACCEPTANCE.**

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
- Exact source photographs include a visible source-and-license link and credit.
- Entries without a verified exact photograph display **Exact case-file
  photograph pending** and explicitly use no AI substitute.
- The first exact-photo records are for Wabasha Street Caves, Glensheen
  Mansion, and the Forepaugh mansion entry in Minnesota, sourced from
  Wikimedia Commons with attribution and license information.
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
case-file source layer. Production deployment identifiers will be added below
after the guarded release completes.

## Release record

- Source commit: pending
- Release candidate: pending
- Production Worker version: pending
- Rollback target: pending
- Production smoke: pending
- Firefox Developer Edition acceptance: pending

## Remaining image work

Image completion is a research queue, not an AI batch-generation task. Each
remaining location needs an exact-place photo, a source page, a reuse/license
record, and a visual identity check before it is added. If no safe reusable
photo can be confirmed, the pending state remains visible.

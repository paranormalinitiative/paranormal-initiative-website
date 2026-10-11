# TPI-VIDEOS-009 Defects and Repairs

## Repaired

- Undefined `/api/link-preview` handler causing production HTTP 500. Replaced with bounded, SSRF-aware metadata resolution and focused tests.
- External video share path used an internal TPI URL for discovered records. It now preserves the original approved provider URL.
- Homepage had legacy bottom cards and no format distinction. Removed the cards and added Regular vs Shorts/Reels controls.
- Featured selection was deterministic. Added browser-local rotation guard.
- Catalog grid had no four-column desktop contract. Added explicit responsive breakpoints.
- Catalog had no non-disruptive new-video indicator. Added visibility-aware five-minute polling.
- Reels page contained fake demo engagement/progress behavior. It now reads actual format-tagged catalog records and reports an honest empty state.

## Not claimed repaired

The existing full local E2E runner remains blocked before assertions by its first migration; no unrelated migration repair was made. External provider playback, authenticated production mutations, physical devices, long-duration reliability, and a full Reels creation/editing pipeline remain unverified or partial.

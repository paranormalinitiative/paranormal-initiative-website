# TPI-VIDEOS-003 Defects and Repairs

## Repaired in this batch

- The catalog previously fetched one unfiltered client-side result. Added server-side filters, bounded pagination, source labels, and load-more.
- There was no creator follow relationship. Added additive follow storage and authenticated mutations.
- Community sharing was not connected to authored video watch pages. Added public-video-only share creation using existing Community Feed infrastructure.
- Video comments were flat. Added validated parent IDs and bounded one-level reply rendering.
- Comment reads were not explicitly tied to authored-video visibility. Added server-side visibility checks.

The first isolated run exposed one implementation defect: the new Community link attachment omitted the existing helper's required empty media-key binding and returned HTTP 500. The share payload was corrected to provide an explicit empty key; the complete suite was rerun and passed 181/181.

## Open

Authenticated production creator/member workflow, external provider playback, live broadcast discovery, mobile visual acceptance, and notification delivery remain unverified.

# TPI-VIDEOS-006 Baseline

Date: 2026-10-11

Canonical sources:

- TPI website: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- StudioFlow: `/Users/toddknipple/Documents/StudioFlow/web`
- Production: `https://paranormalinitiative.com`

The main TPI-VIDEOS-005 synchronization implementation is present. The
navigation-only TPI-STUDIOFLOW-005-A addendum is separate and remains
preserved: the website navigation says `TPI Creator Studio`, links to
`/studio/`, and does not rename internal identifiers.

Verified source state:

- StudioFlow local commit: `8437b07`.
- TPI release-record head: `3e3b326`.
- TPI-VIDEOS-005 bridge controls exist for sync, update, publish, unpublish,
  cancel, refresh, retry, and conflict review.
- The bridge stores synchronization metadata in browser localStorage only;
  recordings, stream keys, and private media are not uploaded by this path.

Current acceptance classification: **READY WITH LIMITATIONS**. The local API,
build, syntax, security, and isolated RTMP checks pass. Signed-in browser
mutation, physical-device, real external-provider playback, and offline
reload recovery remain unverified in this environment.

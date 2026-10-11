# TPI-VIDEOS-002 Defects and Repairs

## Repaired

- F-001: authored draft/private video API exposure. Repaired with server-side
  visibility filtering, contributor ownership checks, and draft-first lifecycle.
- F-002: arbitrary or unsafe video/embed URL acceptance. Repaired with the
  reviewed provider and thumbnail allowlists in `lib/video-providers.js`.

Both repairs passed the focused assertions and the complete local API suite
(171 passed, 0 failed).

## Remaining limitations

Authenticated production creator acceptance, real provider playback, external
provider account workflows, captions/transcripts, and the future StudioFlow
publication bridge remain NOT YET VERIFIED or out of scope. They are not
classified as repaired or functional based on local synthetic tests.

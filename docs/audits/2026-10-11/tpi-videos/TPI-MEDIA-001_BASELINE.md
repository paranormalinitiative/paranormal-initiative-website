# TPI-MEDIA-001 Baseline

Date: 2026-10-11

Canonical TPI source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

StudioFlow source inspected: `/Users/toddknipple/Documents/StudioFlow/web`

## Baseline classification

- **Working / verified:** existing TPI Videos catalog, provider validation, internal/external routing policy, creator-channel API, comments/reactions/save/history API surfaces, Community Feed link-preview repair, StudioFlow build and room/RTMP syntax gates.
- **Repaired in this directive:** authenticated TPI Videos grid specificity causing three columns at a 1440px rendered viewport.
- **Partial:** end-to-end creator recording-to-public-video workflow; public Creator Studio playback depends on an authorized browser-accessible source.
- **Unverified:** physical camera/microphone interruption behavior, long-duration recording, authenticated production mutations, real external-provider sessions, and public Creator Studio recording playback.
- **Blocked for this environment:** Playwright-based Settings/browser coverage and playback of a disposable video fixture rejected by the server's approved-source policy.

The baseline preserved unrelated dirty files and made no production database or R2 changes.

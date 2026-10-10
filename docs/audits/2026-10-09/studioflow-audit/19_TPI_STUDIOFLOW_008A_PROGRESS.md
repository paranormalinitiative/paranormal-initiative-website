# TPI-STUDIOFLOW-008A — Banner ticker progress

Date: 2026-10-10  
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`  
Scope: local StudioFlow development only

## Implementation

- Added the unchecked-by-default **Scroll Across Ticker** checkbox to the existing Banners panel.
- Persisted the setting as `studioflow.bannerScrollTicker` through the existing local settings pattern.
- Preserved the existing fixed-banner path when the checkbox is off.
- Added the ticker to the existing Program compositor frame loop. The compositor clips the bottom safe-area band, reuses the banner accent color, rounded background, and typography, and derives position from elapsed time at a fixed speed rather than a frame counter.
- Added a matching Studio preview ticker so the operator sees the selected mode. The compositor remains the authoritative path for Program Recording and RTMP output.
- No separate ticker animation loop was added; disabling the setting or removing the active banner therefore stops ticker drawing through normal compositor state.

## Verification

Passed:

- `npm exec tsc -- --noEmit`
- `npm run build`
- `git diff --check`
- Isolated local browser: checkbox present and unchecked by default.
- Isolated local browser: long banner text moved across the Program preview.
- Isolated local browser: disabling removed the ticker and restored one fixed banner.
- Isolated local browser: the checked state survived a browser reload.
- Isolated local browser: ticker remained visible after Two-person split and Cinema layout changes.

Not verified in this batch:

- Ticker in an actual saved Program Recording, playback, or download/export.
- Ticker in local RTMP receiver output.
- Checkpoint cleanup/retention during a ticker-enabled recording.
- Short-text cycle timing, every resolution/orientation, and a device-enabled long session.

The recording control correctly refused the isolated browser test with `Connect a camera or share a screen before recording.` No owner active recording was touched and no camera/microphone permission prompt was accepted.

## Documentation and boundary

Updated the canonical StudioFlow Production Bible files, the Desktop integration/readiness files, and this GitHub audit index/report. Existing history was preserved; no documentation collection was duplicated. Generated `/studio/` output was not modified. No production system, database, deployment, commit, or GitHub push was performed.

## Next acceptance steps

With an isolated device-enabled or synthetic-media session: create a long and short banner, enable the ticker, record several cycles, verify playback and download, capture local RTMP output, change layout/resolution/orientation, disable/remove the banner, and confirm checkpoint cleanup and failed-final-save retention remain unchanged.

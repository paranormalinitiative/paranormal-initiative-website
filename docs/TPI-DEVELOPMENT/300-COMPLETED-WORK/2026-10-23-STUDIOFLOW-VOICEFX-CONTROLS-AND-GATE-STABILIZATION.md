# StudioFlow Voice FX controls restored and gate stabilized

Date: 2026-10-23  
Directive: TPI-STUDIOFLOW-026 follow-up  
Status: Local implementation verified; production deployment not authorized

## User-reported issue

The Voice FX controls were still implemented but had been placed behind a
collapsed Advanced Settings disclosure. That made Microphone Gain, Voice
Output Volume, Monitor Volume, Pitch, Formant resonance, Voice clarity, Noise
gate, Auto Level, Echo, and Reverb appear to have been removed. The user also
reported needing to speak loudly and experiencing speech dropouts.

## Changes

- Advanced Settings is now open by default while retaining the grouped layout.
- The requested controls are visible together in the panel:
  - Microphone & levels
  - Voice character
  - Effects
- Noise gate now defaults to Off (`0`) because the upstream gate runs before
  voice transformation and can suppress speech near its threshold.
- Existing stored values from the prior low-level defaults (`0.006`, `0.012`,
  and `0.001`) migrate to Off so an old browser session does not silently keep
  the suspected dropout condition.
- The gate remains available as an explicit Advanced Settings control.
- No change was made to the independent gain architecture:
  Microphone Gain feeds processing, Voice Output Volume affects outgoing
  WebRTC/recording, and Monitor Volume affects local headphones only.

## Local verification

In the disposable local StudioFlow tab:

- The full grouped control set was visible.
- Noise gate displayed `Off`.
- Input level displayed approximately `-56 dBFS`.
- Processed level displayed approximately `-49 dBFS`.
- Voice FX remained active while the gate was off.
- No browser console errors were observed.

Automated checks passed:

- `git diff --check`
- `npx tsc --noEmit`
- `npm run check:voice-fx`
- AudioWorklet syntax checks
- `npm run build`

This verifies the UI state, settings migration, and non-empty local processed
path. It does not prove subjective audio quality. Human headphone testing is
still required to confirm that speech dropouts and clipping-like artifacts are
resolved with a real microphone.

## Source and safety

Source commit: `8d14d80` (`Restore Voice FX controls and disable default gate`)

Modified source files:

- `/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`
- `/Users/toddknipple/Documents/StudioFlow/web/src/VoiceFxPanel.tsx`

No production Worker, Cloudflare setting, D1 database, R2 object, owner browser
storage, Crossroads data, or production recording was modified. No production
deployment was performed.

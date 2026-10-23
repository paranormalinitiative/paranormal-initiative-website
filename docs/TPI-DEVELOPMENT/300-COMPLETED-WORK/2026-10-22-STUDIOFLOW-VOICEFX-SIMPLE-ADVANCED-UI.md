# StudioFlow Voice FX simple and advanced controls

Date: 2026-10-22  
Directive: TPI-STUDIOFLOW-026  
Status: Local implementation verified; production deployment not authorized

## User-facing result

The default Voice FX panel now presents one understandable workflow:

1. Turn Voice FX on or off.
2. Choose one voice preset.
3. Optionally turn on Hear My Voice.
4. Adjust Headphone volume.
5. Start speaking.

The duplicate Masculine / Feminine / Custom mode row was removed from the
panel. Users choose the effect directly, so they no longer have to make two
separate voice selections.

Visible presets are now:

- Natural Voice
- Deep Voice
- Feminine Voice
- Robot
- Telephone
- Ghost
- Echo
- Reverb

Megaphone was removed from the selectable preset list as requested. Its old
internal processing branch was not deleted, protecting older code paths while
keeping it out of the everyday interface.

## Advanced Settings

Advanced Settings is collapsed by default and preserves the existing controls.
When expanded, controls are grouped as:

- Microphone & levels: Microphone Gain, Voice Output Volume, Monitor Volume.
- Voice character: Pitch, Formant resonance, Voice clarity.
- Effects: Noise gate, Auto Level, Echo delay, Echo feedback, Reverb mix.

The simple Headphone volume control still maps to the independent monitor gain.
It never changes WebRTC or program-recording level. Voice Output Volume remains
the outgoing processed level, and Microphone Gain remains the processor input
level.

Feminine Voice is a real preset, not a decorative button. It uses the existing
voice-processing configuration path with a positive pitch and resonance
configuration. Deep Voice remains the masculine-style preset. The saved
internal mode state is retained for compatibility, but it is no longer a
second user-facing choice.

## Verification

Disposable local StudioFlow browser verification showed:

- `Ready in this browser` status.
- The simplified preset list with Feminine Voice present.
- No visible Megaphone preset.
- Hear My Voice and Headphone volume controls.
- Advanced Settings collapsed on initial display.
- Expanded grouped controls including Pitch and Formant resonance.
- No browser console errors during the UI check.

Automated verification passed:

- `git diff --check`
- `npx tsc --noEmit`
- `npm run check:voice-fx`
- AudioWorklet JavaScript syntax checks
- `npm run build`

The build emitted the existing large-chunk warning only. Human headphone
listening remains required for subjective audio-quality acceptance; this UI
change does not claim that clicking, latency, or preset sound quality has
passed audible acceptance.

## Source and safety

Source commit: `5df385b` (`Simplify Voice FX controls and add feminine preset`)

Modified source files:

- `/Users/toddknipple/Documents/StudioFlow/web/src/VoiceFxPanel.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`
- `/Users/toddknipple/Documents/StudioFlow/web/src/styles.css`
- `/Users/toddknipple/Documents/StudioFlow/web/scripts/check-voice-fx.mjs`

No production Worker, Cloudflare setting, D1 database, R2 object, owner browser
storage, Crossroads data, or production recording was modified. No production
deployment was performed.

# StudioFlow Noise Gate enable control

Date: 2026-10-23  
Directive: TPI-STUDIOFLOW-026 follow-up  
Status: Local implementation verified; production deployment not authorized

## User request

Add an Auto Level-style checkbox for Noise Gate so creators can turn it off
when it causes speech dropouts. Noise Gate must be off by default.

## Implementation

- Added a persisted `gateEnabled` setting separate from `gateThreshold`.
- Noise Gate defaults to Off, while retaining a safe `0.001` threshold
  (`-60 dB`) for optional use.
- When Off, the AudioWorklet and OpenVoiceChanger bridge do not apply the
  upstream gate. The threshold slider is disabled and the panel displays
  `Off`.
- When enabled, a legacy session whose threshold is zero receives the safe
  `-60 dB` starting threshold instead of displaying or sending an invalid
  `-Infinity` value.
- Disabling the gate preserves the selected threshold so it can be reused
  when the creator enables the checkbox again.
- Older stored gate defaults (`0.006`, `0.012`, and `0.001`) migrate to the
  new disabled state unless an explicit new `gateEnabled` value is present.
- The existing independent gain controls remain unchanged.

## Local verification

In Firefox Developer Edition, using the disposable local StudioFlow URL with
the OpenVoiceChanger test engine:

- Noise Gate initially displayed `Off`.
- Its threshold slider was disabled while Off.
- Enabling the checkbox displayed `-60 dB` and enabled the threshold slider.
- Disabling it again returned the display to `Off` and disabled the slider.
- The local processed level remained non-empty during the enabled check.
- Browser warning and error logs were empty.

Automated checks passed:

- `git diff --check`
- `npx tsc --noEmit`
- `npm run check:voice-fx`
- `node --check public/openvoicechanger-bridge-worklet.js`
- `node --check public/voice-fx-worklet.js`
- `npm run build`

These checks verify the control, persistence/migration logic, worklet syntax,
and production build. They do not replace human headphone testing of speech
clarity and dropout behavior.

## Source and safety

Source implementation:

- `/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`
- `/Users/toddknipple/Documents/StudioFlow/web/src/VoiceFxPanel.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/public/voice-fx-worklet.js`
- `/Users/toddknipple/Documents/StudioFlow/web/scripts/check-voice-fx.mjs`

No production Worker, Cloudflare setting, D1 database, R2 object, owner
browser storage, Crossroads data, or production recording was modified. No
production deployment was performed.


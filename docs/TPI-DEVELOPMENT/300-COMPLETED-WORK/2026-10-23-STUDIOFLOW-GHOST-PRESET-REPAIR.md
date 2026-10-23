# StudioFlow Ghost preset repair

Date: 2026-10-23  
Directive: TPI-STUDIOFLOW-026 follow-up  
Status: Implemented, deployed, and live acceptance verified

## User-reported issue

Ghost contained too much noise and the spoken voice was not intelligible.

## Root cause

StudioFlow was using the aggressive upstream-style Ghost blend:

- Whisper mix: `0.60`
- Reverb: size `0.85`, mix `0.50`
- Echo: `420 ms`, feedback `0.45`, mix `0.30`

The Whisper effect replaces much of the voice excitation with shaped noise.
At a `0.60` mix, that noise overwhelms the dry speech signal for ordinary
microphones and speakers.

## Repair

Ghost now uses the quieter, intelligibility-focused comparison mix from the
isolated OpenVoiceChanger repair prototype:

- Pitch: `-2 st`
- Formant/resonance: `0 st`
- Whisper mix: `0.12`
- Reverb: size `0.75`, mix `0.42`
- Echo: `480 ms`, feedback `0.34`, mix `0.20`

Selecting Ghost also resets its pitch and effect controls to these values so a
previous Feminine or Deep Voice configuration cannot carry an unsuitable pitch
into Ghost.

Noise Gate remains independently disabled by default.

## Local DSP verification

The existing local OpenVoiceChanger bridge was tested with the two Ghost chains
using the same 48 kHz, 1,024-sample synthetic input:

| Chain | RMS | Peak | Clipped | Invalid samples |
| --- | ---: | ---: | ---: | ---: |
| Aggressive `0.60` Whisper mix | `0.031543` | `0.126952` | `0` | `0` |
| Repaired `0.12` Whisper mix | `0.032117` | `0.079547` | `0` | `0` |

The repaired chain retains a comparable overall level with a lower peak and a
much larger dry-voice component. This is a signal-level comparison, not proof
of subjective voice quality.

## Firefox Developer Edition verification

In the disposable local StudioFlow Firefox tab:

- Ghost selected successfully.
- Pitch displayed `-2.0 st`.
- Noise Gate displayed `Off` and its threshold control was disabled.
- Echo displayed `480 ms` and `34%` feedback.
- Reverb displayed `42%` mix.
- Voice FX reported Ready/Active and local monitoring could be enabled.
- No production resources were accessed or modified.

The browser input meter was silent during the automated observation, so final
human headphone listening is still required to confirm the audible Ghost result
with live speech.

## Automated checks

Passed:

- `git diff --check`
- `npx tsc --noEmit`
- `npm run check:voice-fx`
- AudioWorklet syntax checks
- `npm run build`
- Local OpenVoiceChanger Ghost comparison without clipping or invalid samples

## Release and live verification

The verified StudioFlow build was integrated into the maintained deployment
checkout and released after the guarded production workflow passed.

- Source commit: `776e83d26511034acb2ea65f6cebcdd9c55b85f8`
- Deployment checkout commit: `68e44b7ff0c294db72aaef1bc1f21307af8c765d`
- GitHub branch: `codex/tpi-development` (local and remote match)
- Production Worker: `theparanormalinitiative`
- Deployed Worker version: `e04b6691-6f35-453b-8780-1015e5a55cb5`
- Recorded rollback version: `ad3b6211-ca07-4156-9cef-e99ab9484035`
- Anonymous production smoke: `10/10 PASS`
- Isolated production Firefox Developer Edition acceptance: `26/26 PASS`
- Production D1/R2, Crossroads data, owner browser storage, and recordings:
  unchanged
- Rollback: not required

## Source and safety

Modified source files:

- `/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`
- `/Users/toddknipple/Documents/StudioFlow/web/scripts/check-voice-fx.mjs`

No production Worker configuration, D1 database, R2 object, owner browser
storage, Crossroads data, or production recording was modified. The verified
application bundle was deployed through the guarded Wrangler workflow.


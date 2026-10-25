# TPI-STUDIOFLOW-022 — Live Voice Monitoring & Fine-Tuning Integration

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 21:59.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-VOICE-DISGUISE-FINE-TUNING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-DISGUISE-FINE-TUNING.md), [2026-10-22-STUDIOFLOW-VOICE-MONITORING-FINE-TUNING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-MONITORING-FINE-TUNING.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-022
## STUDIOFLOW — LIVE VOICE MONITORING & FINE-TUNING INTEGRATION

**Project Codename:** DEEP THROAT  
**Priority:** HIGH  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL DEVELOPMENT AND TESTING  
**Production Deployment:** NOT AUTHORIZED

**Previous Directives:**
- TPI-STUDIOFLOW-020 — Browser Voice FX Foundation
- TPI-STUDIOFLOW-021 — Live Voice Disguise, Fine-Tuning & Settings Integration

---

## 1. DIRECTIVE OBJECTIVE

Modify StudioFlow's existing Voice FX system to provide continuous, real-time voice monitoring and fine-tuning directly within the active recording studio.

The current implementation includes private microphone testing and test recording/playback functionality.

That is not the intended primary user experience.

The desired workflow is:

**Activate Voice FX → Hear Your Modified Voice → Adjust Controls While Speaking → Finish Adjusting → Continue Using the Modified Voice.**

Participants must not be required to record samples, stop speaking, or play back recordings to evaluate their adjustments.

The system must operate continuously during live podcast sessions.

This applies equally to hosts and invited guests.

---

## 2. REMOVE THE SEPARATE MICROPHONE TEST WORKFLOW

Remove the dedicated Voice FX test-recording and playback controls from the user interface.

The following controls are no longer required:

- Record Test
- Stop Test Recording
- Play Test Recording
- Record Again

Remove the separate microphone-testing workflow where it duplicates live monitoring.

Do not remove microphone permissions, microphone selection, or other essential audio functionality.

Do not remove the underlying processing capabilities needed for live Voice FX.

Preserve existing program recording functionality.

Remove unused test-recording code only after verifying that it is not required by other StudioFlow features.

---

## 3. LIVE VOICE MONITORING

Implement a dedicated:

### MONITOR MY VOICE — ON / OFF

This control allows participants to hear their processed microphone audio through their selected audio output device.

The monitoring system must:

1. Operate continuously while enabled.
2. Play the processed microphone signal.
3. Reflect pitch adjustments immediately.
4. Reflect resonance adjustments immediately.
5. Reflect clarity adjustments immediately.
6. Reflect gain, gate, echo, and reverb adjustments.
7. Avoid unnecessary processing interruptions.
8. Allow monitoring to be disabled independently of Voice FX.
9. Preserve the active voice disguise when monitoring is disabled.
10. Work during active host and guest sessions.

Monitoring must use the same effective processing configuration as the outgoing audio.

Do not create a separate voice-processing configuration for monitoring that could sound different from what other participants receive.

### IMPORTANT

**Voice monitoring and voice disguise are two independent controls.**

Turning monitoring OFF must never disable voice disguise.

Turning voice disguise OFF must not unintentionally disable other microphone functionality.

---

## 4. HEADPHONE REQUIREMENT AND FEEDBACK PROTECTION

Live microphone monitoring should be designed primarily for participants using headphones or a headset.

Display a clear notice:

**Headphones recommended. Live microphone monitoring may cause feedback when using speakers.**

Where browser capabilities permit, respect the participant's selected audio output device.

Do not assume that the browser can reliably detect whether headphones are connected.

Monitoring must begin only after an intentional user action.

If the browser blocks monitoring or output-device selection, provide an understandable message.

Do not automatically enable loudspeaker monitoring.

Prevent duplicate monitoring paths and unnecessary audio amplification.

Preserve existing echo cancellation and microphone-processing behavior unless changes are necessary and validated.

---

## 5. LIVE VOICE FX CONTROL PANEL

The primary Voice FX interface must be accessible directly from the active StudioFlow recording environment.

Do not require participants to leave their podcast session to fine-tune their voice.

### REQUIRED PANEL

**VOICE FX — LIVE VOICE DISGUISE**

**Voice Style**

[ Natural ] [ Masculine ] [ Feminine ] [ Custom ]

**VOICE FX**

[ ON / OFF ]

**LIVE FINE-TUNING**

Pitch  
[────────●────────]

Resonance  
[────────●────────]

Clarity  
[────────●────────]

Gain  
[────────●────────]

Noise Gate  
[────────●────────]

Echo  
[────────●────────]

Reverb  
[────────●────────]

**LIVE MONITORING**

Monitor My Voice: [ ON / OFF ]

**AUDIO STATUS**

Microphone: Connected  
Voice FX: Active  
Monitoring: Active

Display only controls that correspond to actual implemented audio-processing functions.

Do not create decorative sliders.

### PANEL BEHAVIOR

The participant must be able to:

- Open the panel during a live session.
- Enable voice disguise.
- Enable monitoring.
- Speak continuously.
- Adjust supported controls.
- Hear changes immediately.
- Disable monitoring.
- Close the panel.
- Continue speaking with the selected voice effect active.

**Closing the panel must not disable Voice FX.**

---

## 6. PERSISTENT VOICE FX TOGGLE

The Voice FX ON/OFF toggle must remain accessible in the active studio interface.

It must be a persistent toggle, not a press-and-hold control.

When Voice FX is ON:

- The selected processing configuration remains active.
- The modified voice is transmitted to other participants.
- The modified voice is used in the program recording.
- Closing Settings does not disable processing.
- Turning monitoring OFF does not disable processing.
- Navigating between non-destructive studio panels does not reset the effect.

When Voice FX is OFF:

- Normal microphone operation resumes through the authorized audio path.
- The participant's fine-tuning adjustments remain saved.
- Re-enabling Voice FX restores the previous settings.

Voice FX must not be automatically disabled simply because the participant closes the configuration panel.

---

## 7. REAL-TIME FINE-TUNING

All supported processing controls must update the active AudioWorklet during continuous speech.

Do not require:

- Microphone restarts.
- WebRTC reconnections.
- Recording restarts.
- Audio-track replacement for ordinary parameter adjustments.
- Test recordings.
- Playback comparisons.

Use parameter updates or equivalent mechanisms supported by the existing processor.

Avoid clicks, pops, sudden gain spikes, and unnecessary audio discontinuities.

### PITCH

Adjust the voice higher or lower in real time.

### RESONANCE

Adjust the implemented vocal-resonance processing in real time.

Verify and document whether this is independent formant processing or tonal filtering.

Do not describe tonal EQ as formant shifting unless the implementation genuinely performs formant modification.

### CLARITY

Apply the implemented clarity processing in real time.

### OTHER CONTROLS

Gain, gate, echo, and reverb must respond while audio processing continues.

Use appropriate parameter smoothing where needed.

---

## 8. HOST INTEGRATION

The host must have full Voice FX access from within the active StudioFlow interface.

The host must be able to:

- Enable or disable Voice FX.
- Select a voice preset.
- Fine-tune the selected voice.
- Enable or disable live monitoring.
- Continue recording while adjusting controls.
- Close the panel without losing the active effect.

The host's monitoring signal must remain local.

It must not be added as an additional program recording source.

Do not allow monitoring to create duplicate audio in the host's recording mix.

---

## 9. GUEST INTEGRATION

Invited guests must receive equivalent Voice FX capabilities.

The guest must be able to:

- Select a voice effect.
- Enable or disable Voice FX.
- Fine-tune the effect.
- Enable or disable local monitoring.
- Hear the modified voice through headphones.
- Continue speaking while adjusting controls.
- Close the panel without disabling the effect.

Guests must not need to install additional software.

The guest's Voice FX configuration must remain independent of the host's settings.

### BEFORE JOINING

Guests may configure and monitor their voices before joining.

Monitoring must remain local to the guest's browser.

### DURING A LIVE SESSION

Guests must be able to adjust their voice while connected.

The host must receive the modified audio.

Changes must not require the guest to disconnect and reconnect.

---

## 10. SETTINGS INTEGRATION

Retain the existing:

**StudioFlow Settings → Voice FX**

However, Settings must not be the only location where voice effects can be adjusted.

The full live fine-tuning experience must also be available directly within the studio.

Avoid maintaining two conflicting copies of the same settings.

Changes made in either location must update the same active processing configuration.

The current Voice FX preset, toggle state, and fine-tuning values must remain synchronized.

If the Settings interface is opened during a session, it must not interrupt recording or disconnect participants.

---

## 11. AUDIO ROUTING AND PRIVACY

Preserve the processed audio routing established under TPI-STUDIOFLOW-020.

Required audio flow:

**Microphone → Voice FX Processor → Processed Audio Stream → WebRTC / Recording**

When monitoring is enabled, the processed signal must also feed a local monitoring output.

**Processed Audio → Local Headphone Monitoring**

The monitoring branch must not create a second outgoing microphone stream.

### PRIVACY REQUIREMENTS

When voice disguise is enabled:

- Do not transmit the raw microphone signal alongside the processed signal.
- Do not silently bypass the disguise processor.
- Maintain fail-closed protection if processing fails.
- Mute outgoing microphone audio if the disguise processor becomes unavailable.
- Display a visible warning.
- Require an intentional user action before transmitting an undisguised voice.

Monitoring failures must not compromise outgoing audio privacy.

Voice disguise must not be represented as guaranteeing anonymity.

---

## 12. SETTINGS PERSISTENCE

Preserve the participant's selected voice configuration.

Required behavior:

- Fine-tuning adjustments remain intact when monitoring is disabled.
- Fine-tuning adjustments remain intact when the panel closes.
- Voice FX remains active when the panel closes.
- Switching Voice FX OFF and ON restores the selected settings.
- Studio navigation does not unnecessarily reset the active configuration.
- Guest settings remain independent.

Use the existing preferences architecture where appropriate.

Do not reset or overwrite existing studio data.

---

## 13. REQUIRED ACCEPTANCE TESTING

### TEST A — CONTINUOUS MONITORING

Enable Voice FX and monitoring.

Speak continuously.

Confirm that the participant hears the processed voice without recording or playback.

### TEST B — LIVE PITCH ADJUSTMENT

Speak continuously while adjusting pitch.

Confirm that the audible voice changes without interrupting speech.

### TEST C — LIVE RESONANCE ADJUSTMENT

Adjust resonance while speaking.

Confirm that the processing changes audibly.

Document the actual DSP mechanism.

### TEST D — LIVE CLARITY ADJUSTMENT

Adjust clarity while speaking.

Confirm that the processing changes audibly.

### TEST E — OTHER EFFECTS

Verify gain, gate, echo, and reverb adjustments during continuous speech.

### TEST F — MONITORING INDEPENDENCE

Enable Voice FX.

Enable monitoring.

Disable monitoring.

Confirm that Voice FX remains active.

### TEST G — PANEL CLOSURE

Enable Voice FX.

Close the fine-tuning panel.

Confirm that the modified voice remains active.

### TEST H — HOST AND GUEST

Connect a host and guest.

Confirm that each participant can independently modify their voice.

Confirm that both can monitor locally.

Confirm that neither participant receives duplicate audio.

### TEST I — LIVE RECORDING

Record a conversation while adjusting Voice FX.

Confirm that recording continues uninterrupted.

Confirm that the program recording contains processed audio.

### TEST J — PRIVACY FAILURE

Simulate processor failure while voice disguise is active.

Confirm that outgoing audio mutes rather than exposing the natural voice.

### TEST K — FEEDBACK PREVENTION

Test monitoring with headphones.

Evaluate feedback behavior and document limitations.

### TEST L — REGRESSION TESTING

Confirm that existing StudioFlow features continue functioning.

Clearly distinguish automated checks from actual audible testing.

Do not claim successful live audio verification without performing it.

---

## 14. EXISTING FEATURES TO PRESERVE

Do not break or remove:

- Existing Voice FX presets.
- SMART Pads.
- Background music.
- Sound effects.
- Microphone selection.
- Microphone mute controls.
- WebRTC participation.
- Guest invitation functionality.
- Podcast recording.
- Recording synchronization.
- Studio selection.
- Automatic studio saving.
- Existing studio assets.
- Crossroads of the Unknown project data.

Do not modify unrelated application features.

---

## 15. DEVELOPMENT RESTRICTIONS

This directive authorizes local development and testing only.

**DO NOT DEPLOY TO PRODUCTION.**

Do not modify:

- Production Cloudflare Workers.
- Production D1 databases.
- Production R2 storage.
- Existing production recordings.
- Owner browser storage.
- Crossroads of the Unknown assets.
- Unrelated website functionality.

Local source commits and development documentation updates are permitted after validation.

Production deployment requires separate authorization.

---

## 16. REQUIRED COMPLETION REPORT

Provide:

1. Implementation summary.
2. Files created or modified.
3. Live monitoring implementation details.
4. Removed test-recording controls.
5. Host interface integration.
6. Guest interface integration.
7. Persistent toggle behavior.
8. Live parameter update implementation.
9. Monitoring audio-routing explanation.
10. Headphone and feedback safeguards.
11. Privacy failure-handling results.
12. Automated test results.
13. Actual microphone monitoring results.
14. Host-and-guest live testing results.
15. Program recording verification.
16. Browser compatibility findings.
17. Known limitations.
18. Commit identifiers.
19. Confirmation that production was not deployed.

Report testing status accurately.

---

## 17. FINAL OBJECTIVE

StudioFlow must allow hosts and invited guests to modify their voices naturally during live conversations.

Participants must be able to hear their processed voices through headphones, fine-tune the available controls while speaking, and continue using their chosen voice effect after closing the control panel.

No separate test recording or playback workflow should be required.

The system must provide a professional, intuitive experience without interrupting podcast production.

**The final workflow is:**

**Open Voice FX → Activate Voice Disguise → Enable Monitoring → Speak and Fine-Tune → Disable Monitoring → Close Panel → Continue Recording with Voice Disguise Active.**

### PROJECT DEEP THROAT

**Hear it live. Adjust it live. Keep it live.**

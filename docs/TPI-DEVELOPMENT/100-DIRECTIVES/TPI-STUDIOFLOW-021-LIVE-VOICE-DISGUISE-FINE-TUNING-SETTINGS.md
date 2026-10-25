# TPI-STUDIOFLOW-021 — Live Voice Disguise, Fine-Tuning & Settings Integration

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 21:38.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-VOICE-DISGUISE-FINE-TUNING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-DISGUISE-FINE-TUNING.md), [2026-10-22-STUDIOFLOW-VOICE-MONITORING-FINE-TUNING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-MONITORING-FINE-TUNING.md)
**Previously archived variant(s):** [TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md](TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md)

---

# TPI-STUDIOFLOW-021
## STUDIOFLOW — LIVE VOICE DISGUISE, FINE-TUNING & SETTINGS INTEGRATION

### Project Codename: DEEP THROAT

**Priority:** HIGH  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL DEVELOPMENT AND TESTING  
**Production Deployment:** NOT AUTHORIZED  
**Supersedes:** Previous version of TPI-STUDIOFLOW-021  
**Foundation:** TPI-STUDIOFLOW-020 — Browser Voice FX Foundation and Integration

---

# 1. DIRECTIVE OBJECTIVE

Enhance StudioFlow's existing Voice FX system by introducing a professional, adjustable, real-time voice disguise capability.

The system must allow podcast hosts and invited guests to modify their voices during live conversations using masculine-style, feminine-style, and custom voice transformations.

The primary configuration and testing interface must reside within **StudioFlow Settings → Voice FX**.

The main recording interface must provide convenient access to the active voice effect without requiring participants to navigate away from their recording session.

Invited guests must have equivalent configuration and testing capabilities within their guest interface.

The objective is to deliver a practical voice disguise system that is easy to configure, easy to test, and reliable during live podcast production.

This directive extends the existing AudioWorklet Voice FX foundation implemented under TPI-STUDIOFLOW-020.

Do not replace or unnecessarily restructure that foundation.

---

# 2. STUDIOFLOW SETTINGS — VOICE FX

Create or extend a dedicated **Voice FX** section within StudioFlow Settings.

This section will serve as the primary location for configuring, testing, and fine-tuning voice effects.

Before implementing, inspect the existing StudioFlow settings architecture and integrate with its established navigation and visual design.

Do not create a competing settings system.

### Required Settings Features

The Voice FX settings area must provide:

1. Voice effect selection.
2. Voice disguise activation and deactivation.
3. Masculine voice configuration.
4. Feminine voice configuration.
5. Custom voice configuration.
6. Pitch adjustment.
7. Vocal resonance adjustment, where technically supported.
8. Voice clarity adjustment, where technically supported.
9. Live microphone preview.
10. Short test recording.
11. Test recording playback.
12. Reset to default settings.
13. Appropriate settings persistence.

The interface must remain approachable for participants without professional audio engineering experience.

---

# 3. REQUIRED VOICE DISGUISE MODES

Implement three primary voice disguise modes.

## A. MASCULINE VOICE

This mode should produce a deeper-sounding voice.

Required capabilities:

- Adjustable downward pitch shifting.
- Natural speech timing.
- Understandable speech.
- Minimal robotic distortion.
- Adjustable resonance where supported.
- Continuous real-time processing.

The existing Deep Voice preset should provide the starting foundation.

Users must not be restricted to one predetermined voice depth.

## B. FEMININE VOICE

This mode should produce a higher-sounding voice.

Required capabilities:

- Adjustable upward pitch shifting.
- Natural speech timing.
- Understandable speech.
- Minimal artificial distortion.
- Adjustable resonance where supported.
- Continuous real-time processing.

The system must modify vocal pitch without slowing down or speeding up normal speech.

## C. CUSTOM VOICE

Allow participants to create their preferred voice characteristics using the available processing controls.

Custom Voice must not require selecting either the Masculine or Feminine preset.

Participants should be able to configure their voice according to personal preference.

Masculine and Feminine are descriptive presets, not guarantees of reproducing a particular gender's voice.

---

# 4. VOICE FINE-TUNING CONTROLS

The Voice FX settings panel must include the following controls.

### A. VOICE DISGUISE TOGGLE

Provide a persistent ON/OFF toggle.

When activated, voice disguise remains enabled until the participant intentionally disables it.

**This must not function as a press-and-hold button.**

The selected voice effect must remain active throughout continuous speech.

### B. PITCH ADJUSTMENT

Provide a slider that allows participants to adjust vocal pitch.

Requirements:

- Real-time adjustment.
- Appropriate pitch ranges for each mode.
- No changes to normal speech playback speed.
- No interruption to the recording session.
- Clear indication of the current adjustment.

### C. VOCAL RESONANCE

Investigate implementing independent formant or resonance adjustment.

This feature should help modify vocal characteristics beyond simple pitch shifting.

If technically feasible, provide an adjustable resonance slider.

If reliable independent resonance processing cannot be implemented within acceptable latency and performance limits, document the limitation and defer the control.

**Do not display a resonance slider that does not actually modify the audio.**

### D. VOICE CLARITY

Evaluate whether additional audio processing can improve speech intelligibility.

If implemented, provide a clarity adjustment.

The control must produce a meaningful audio-processing result.

Do not introduce decorative or nonfunctional controls.

### E. RESET SETTINGS

Provide a reset function that restores the selected voice mode's default values.

### F. SETTINGS RETENTION

Preserve the participant's selected adjustments when voice disguise is temporarily switched OFF.

Switching the effect back ON should restore the previous configuration.

---

# 5. LIVE MICROPHONE TESTING

The Voice FX settings area must include a private microphone-testing capability.

Participants must be able to hear their modified voice before using it during a podcast.

### Required Controls

**START MICROPHONE TEST**

Activates a local microphone preview using the selected voice-processing configuration.

**STOP MICROPHONE TEST**

Stops the local preview.

**LIVE VOICE PREVIEW**

Allows the participant to hear the processed microphone signal while speaking.

**Important Requirements**

- Microphone preview must be initiated by the participant.
- The preview must use the actual voice-processing pipeline.
- Adjustments must be audible in real time.
- Headphone guidance must be displayed to reduce acoustic feedback.
- Preview audio must not automatically transmit to other participants.
- Preview must not unintentionally activate the podcast's recording system.

Where necessary, use a separate local preview path to prevent interference with the live WebRTC audio connection.

---

# 6. VOICE TEST RECORDING & PLAYBACK

Implement a short, private voice test recording feature.

This allows participants to hear how their modified voice sounds after recording.

### Required Controls

**RECORD TEST**

Begins a temporary recording of the processed microphone signal.

**STOP RECORDING**

Ends the test recording.

**PLAY TEST**

Plays the modified recording.

**RECORD AGAIN**

Allows the participant to replace the temporary test recording.

### Requirements

1. Record the processed voice, not the original microphone signal.
2. Use the same voice-processing configuration selected in Settings.
3. Keep the recording local to the participant's browser.
4. Do not upload the test recording to Cloudflare R2 or any external storage.
5. Do not add the test recording to the podcast's program recording.
6. Do not transmit the test recording to other participants.
7. Provide clear recording and playback states.
8. Release temporary audio resources when no longer needed.
9. Do not persist temporary recordings without explicit user authorization.

A recording duration of approximately 10–15 seconds is sufficient.

The interface should prevent accidental repeated recording or overlapping playback.

The participant must be able to adjust the voice settings and record another sample.

---

# 7. MAIN STUDIO — QUICK VOICE FX ACCESS

The main StudioFlow recording interface must retain convenient access to Voice FX.

Participants should not need to open the full Settings interface simply to activate or deactivate an already configured effect.

### Required Quick Controls

Provide a compact Voice FX control that displays:

- Current voice preset.
- Whether the effect is ON or OFF.
- A persistent activation toggle.
- Access to Fine-Tune or Voice FX Settings.

Example:

**VOICE FX**

Deep Voice — ON

[ ON / OFF ] [ Fine-Tune ]

The quick controls must remain usable while recording.

Opening the fine-tuning interface must not interrupt:

- Microphone audio.
- WebRTC participation.
- Podcast recording.
- Guest connections.
- Existing SMART Pad operation.

If StudioFlow already provides equivalent quick-access Voice FX controls, extend them rather than introducing duplicates.

---

# 8. INVITED GUEST VOICE FX SETTINGS

Invited guests must receive equivalent Voice FX functionality.

The guest interface must provide access to voice configuration before joining the podcast.

### Guest Pre-Join Requirements

Guests must be able to:

1. Select their microphone.
2. Open Voice FX Settings.
3. Select Masculine, Feminine, or Custom Voice.
4. Adjust available fine-tuning controls.
5. Test their modified voice.
6. Record and play back a temporary test sample.
7. Activate or deactivate voice disguise.
8. Join the podcast with their selected configuration.

The guest must not need to install additional software.

### Guest In-Session Requirements

After joining, guests must be able to:

- Toggle voice disguise ON or OFF.
- Access their current voice settings.
- Adjust supported controls.
- Change voice presets.
- Continue participating without disconnecting.

Each guest must control their own voice independently.

Host settings must not overwrite guest settings.

Guest settings must not affect other participants.

---

# 9. LIVE AUDIO PROCESSING

All voice disguise modes must operate during live conversation.

Required audio flow:

**Microphone → Voice FX AudioWorklet → Processed Audio Stream → WebRTC / Program Recording**

Requirements:

- Continuous real-time voice processing.
- Immediate response to supported control adjustments.
- Preservation of normal speech timing.
- Minimal processing latency.
- No duplicate raw and processed microphone transmission.
- No unnecessary audio-track interruptions.
- Compatibility with existing mute controls.
- Compatibility with microphone switching.
- Compatibility with guest reconnection.
- Preservation of recording synchronization.

Use the existing TPI-STUDIOFLOW-020 implementation as the technical foundation.

Do not introduce a server-based voice conversion service without separate authorization.

---

# 10. VOICE PRIVACY AND FAIL-CLOSED BEHAVIOR

Voice disguise is intended to reduce recognizable vocal characteristics.

It must not be presented as guaranteeing anonymity.

Maintain the privacy protections established in TPI-STUDIOFLOW-020.

### Required Safeguards

When voice disguise is enabled:

1. Outgoing audio must use the processed signal.
2. The original microphone signal must not simultaneously enter the podcast's transmission or recording path.
3. Processing failures must not silently expose the natural voice.
4. Failure must result in outgoing microphone audio being muted.
5. The participant must receive a visible warning.
6. Processing recovery must not silently bypass the selected disguise.
7. Disabling the disguise must require an intentional user action.

Apply these safeguards to microphone switching, reconnection, processing initialization, and unexpected processor failures.

### Private Testing Safeguards

During microphone preview and test recording:

- Preview audio must remain local.
- Test recordings must remain local.
- No raw microphone audio may be inadvertently transmitted through the preview mechanism.
- Temporary recording resources must be released appropriately.

Include a concise notice explaining that voice disguise cannot guarantee anonymity.

---

# 11. SETTINGS PERSISTENCE

Voice FX configuration should remain stable throughout the participant's session.

Required behavior:

- Preserve selected voice mode.
- Preserve pitch adjustments.
- Preserve supported resonance adjustments.
- Preserve supported clarity adjustments.
- Preserve the active ON/OFF state appropriately.
- Restore adjustments when toggling effects.
- Avoid resetting settings when navigating between StudioFlow views.

Investigate whether preferences can safely persist between sessions.

If persistent storage is implemented, use the existing application preferences architecture.

Do not introduce unnecessary database changes.

Do not overwrite existing studio configurations.

For invited guests, do not automatically reuse a prior privacy-sensitive activation state across unrelated invitations without an explicit, understandable user choice.

---

# 12. AUDIO QUALITY AND PERFORMANCE

Evaluate the voice disguise system for professional podcast use.

Required evaluation areas:

- Pitch-shifting quality.
- Vocal intelligibility.
- Processing latency.
- Audio stability.
- CPU utilization.
- Browser compatibility.
- Mobile compatibility.
- Long-session stability.
- Audio feedback prevention.
- Recording quality.

Investigate browser-compatible DSP or WebAssembly processing if necessary.

Higher-quality formant processing may require additional development.

Do not claim independent formant shifting is implemented unless the audio processor actually supports it.

Prioritize reliable live audio over excessive processing complexity.

---

# 13. REQUIRED ACCEPTANCE TESTING

Testing must cover both configuration and actual audio behavior.

### TEST A — SETTINGS INTEGRATION

Confirm Voice FX appears in the appropriate StudioFlow Settings area.

Verify that existing settings and navigation remain functional.

### TEST B — MASCULINE VOICE

Confirm that Masculine Voice produces audibly deeper speech.

Verify live pitch adjustments.

### TEST C — FEMININE VOICE

Confirm that Feminine Voice produces audibly higher speech.

Verify live pitch adjustments.

### TEST D — CUSTOM VOICE

Confirm that Custom Voice supports available fine-tuning controls.

Verify that controls produce actual processing changes.

### TEST E — PERSISTENT TOGGLE

Confirm the effect remains active without holding a button.

Verify that toggling OFF and ON preserves configured settings.

### TEST F — LIVE MICROPHONE PREVIEW

Confirm that the participant hears their processed voice locally.

Verify that preview does not transmit audio to other participants.

### TEST G — TEST RECORDING

Record a short modified voice sample.

Play it back.

Confirm that playback contains the modified voice.

Confirm the sample is not uploaded or included in the program recording.

### TEST H — HOST AUDIO

Confirm that guests hear the host's modified voice.

Verify that adjustments can occur during an active session.

### TEST I — GUEST AUDIO

Confirm that the host hears the guest's modified voice.

Verify that guests can configure their voice before joining.

### TEST J — PROGRAM RECORDING

Record a host-and-guest conversation using voice disguise.

Confirm the program recording contains the modified audio.

Inspect recorded waveforms or audio samples where practical.

### TEST K — PRIVACY FAILURE

Simulate an AudioWorklet processing failure.

Confirm that the microphone fails closed.

Verify that the natural voice is not silently transmitted.

### TEST L — DEVICE AND BROWSER COMPATIBILITY

Test available desktop and mobile environments.

Document actual devices and browsers tested.

### TEST M — REGRESSION TESTING

Confirm that existing Voice FX presets, SMART Pads, recording controls, guest connections, and studio persistence continue functioning.

**Do not report simulated UI verification as successful audible testing.**

Clearly identify any acceptance tests requiring manual completion.

---

# 14. EXISTING FUNCTIONALITY THAT MUST BE PRESERVED

Do not break, remove, or unnecessarily modify:

- Existing Voice FX presets.
- SMART Pads.
- Background music.
- Sound effects.
- Host microphone controls.
- Guest microphone controls.
- WebRTC connections.
- Program recording.
- Audio synchronization.
- Studio selection.
- Automatic studio saving.
- Studio assets.
- Guest invitations.
- Existing settings.
- Crossroads of the Unknown project data.

Preserve all existing owner data.

Do not reset browser storage.

Do not introduce destructive database migrations.

---

# 15. DEVELOPMENT AND PRODUCTION RESTRICTIONS

This directive authorizes local implementation and validation only.

**Production deployment is NOT authorized.**

Do not modify:

- Production Cloudflare Workers.
- Production D1 databases.
- Production R2 storage.
- Existing production recordings.
- Owner browser storage.
- Crossroads of the Unknown assets.
- Unrelated website functionality.

Local commits and development documentation updates are permitted after appropriate validation.

Any production deployment requires separate authorization.

---

# 16. REQUIRED COMPLETION REPORT

Upon completion, provide:

1. Implementation summary.
2. Files created or modified.
3. StudioFlow Settings integration details.
4. Host interface changes.
5. Guest interface changes.
6. Masculine Voice implementation.
7. Feminine Voice implementation.
8. Custom Voice implementation.
9. Fine-tuning controls.
10. Live microphone preview results.
11. Test recording and playback results.
12. AudioWorklet processing changes.
13. Formant-processing implementation status.
14. WebRTC integration results.
15. Program recording integration results.
16. Privacy failure-handling results.
17. Automated test results.
18. Real microphone testing results.
19. Two-device testing results.
20. Browser and mobile compatibility findings.
21. Known limitations.
22. Commit identifiers.
23. Production deployment confirmation.

Clearly distinguish:

**IMPLEMENTED**

**AUTOMATED TESTED**

**AUDIBLY VERIFIED**

**PENDING MANUAL ACCEPTANCE**

Do not claim successful audio verification without performing the corresponding test.

---

# 17. FINAL OBJECTIVE

StudioFlow must provide a complete, practical voice disguise experience.

Hosts and invited guests must be able to configure their voice, fine-tune it, test it privately, and use it during live podcast conversations.

**StudioFlow Settings → Voice FX** must serve as the primary configuration and testing location.

The main recording interface must retain convenient quick-access controls.

The guest invitation experience must provide equivalent functionality.

All voice processing must preserve the existing podcast workflow, recording architecture, and privacy safeguards.

The completed system should feel like a natural part of StudioFlow rather than an additional application or complicated audio plugin.

### PROJECT DEEP THROAT
**Configure it. Test it. Fine-tune it. Go live.**

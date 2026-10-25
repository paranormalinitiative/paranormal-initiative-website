# TPI-STUDIOFLOW-024 — Microphone Gain, Voice Volume & Audio Calibration

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 22:28.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-024
## STUDIOFLOW — MICROPHONE GAIN, VOICE VOLUME & AUDIO CALIBRATION

**Project:** The Paranormal Initiative — StudioFlow  
**Codename:** Project Deep Throat  
**Priority:** HIGH  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL IMPLEMENTATION  
**Production Deployment:** NOT AUTHORIZED

**Related Directives:**
- TPI-STUDIOFLOW-020 — Voice FX Foundation
- TPI-STUDIOFLOW-021 — Voice Disguise & Fine-Tuning
- TPI-STUDIOFLOW-022 — Live Voice Monitoring
- TPI-STUDIOFLOW-023 — OpenVoiceChanger Integration

---

## 1. DIRECTIVE OBJECTIVE

Improve microphone sensitivity, processed voice loudness, and audio-level management within StudioFlow's OpenVoiceChanger integration.

During microphone testing, the user reported needing to hold the microphone extremely close to their mouth to hear the processed voice adequately.

This is not an acceptable experience for a professional podcast recording studio.

StudioFlow must support normal microphone positioning and comfortable speaking levels while maintaining clear, consistent audio.

**Do not assume the problem is simply insufficient gain.**

Investigate whether the low volume originates from:

- Browser microphone input levels.
- Microphone capture constraints.
- Input gain staging.
- OpenVoiceChanger processing attenuation.
- Noise gate thresholds.
- Compression settings.
- Processed output gain.
- Local monitoring volume.
- Audio output-device settings.
- Incorrect audio-level scaling between StudioFlow and the localhost processing bridge.

Identify the actual cause before applying corrective amplification.

---

## 2. PRESERVE THE ORIGINAL OPENVOICECHANGER ENGINE

Continue using the original OpenVoiceChanger DSP integrated under Directive 023.

Do not replace the engine with StudioFlow's previous approximation.

Preserve the original processing implementations for:

- Pitch shifting.
- Formant processing.
- Noise gate.
- EQ.
- Compression.
- Echo.
- Reverb.
- Other supported effects.

Any gain improvements must integrate with the existing processing chain.

Avoid unnecessary changes to the voice-transformation algorithms.

Maintain the current opt-in engine selection during development.

---

## 3. MICROPHONE INPUT GAIN

Provide an adjustable microphone input gain control.

**Control Label: Microphone Gain**

The control must allow participants to increase or decrease the microphone signal entering the voice-processing system.

Requirements:

1. Operate during continuous speech.
2. Apply adjustments without restarting the microphone.
3. Avoid abrupt volume jumps.
4. Display the current gain value.
5. Include a clearly marked neutral setting.
6. Provide a reset-to-default option.
7. Prevent excessive amplification and clipping.
8. Preserve the selected setting when the Voice FX panel closes.

Use appropriate gain smoothing.

Do not amplify the signal beyond safe operating levels without suitable limiting or clipping protection.

---

## 4. PROCESSED VOICE OUTPUT LEVEL

Provide a separate control:

**Control Label: Voice Output Volume**

This control adjusts the processed voice signal after OpenVoiceChanger has applied its effects.

It must affect the processed audio delivered to:

- The podcast recording.
- Other participants through WebRTC.

It must not independently change the local headphone monitoring volume.

Requirements:

- Real-time adjustment.
- Smooth level changes.
- Clear neutral/default position.
- Clipping prevention.
- Consistent behavior across voice presets.
- No interruption to recording or WebRTC.

Preserve the character of the selected voice transformation.

---

## 5. HEADPHONE MONITORING VOLUME

Provide a third independent control:

**Control Label: Monitor Volume**

This controls how loudly the participant hears their own processed voice through headphones.

**This setting must affect local monitoring only.**

Changing Monitor Volume must not change:

- The outgoing WebRTC microphone level.
- The podcast recording level.
- Other participants' audio.
- The underlying voice transformation.

The participant must be able to adjust headphone monitoring without affecting the podcast audience.

### MONITORING BEHAVIOR

The existing **Monitor My Voice** toggle must remain independent of Voice FX.

Turning monitoring OFF must not disable the selected voice effect.

Closing the Voice FX panel must not disable the voice effect.

Do not automatically enable monitoring through speakers.

Preserve headphone guidance and feedback precautions.

---

## 6. NOISE GATE INVESTIGATION

Inspect the OpenVoiceChanger noise gate implementation.

Determine whether the current threshold is suppressing normal speech.

A noise gate that is too aggressive can make a microphone appear insensitive even when its actual input level is sufficient.

Verify:

- Gate threshold.
- Gate opening behavior.
- Gate closing behavior.
- Attack time.
- Release time.
- Whether normal speech is being unintentionally suppressed.

Provide a usable gate adjustment where supported.

Ensure that quiet speech remains audible without unnecessarily amplifying background noise.

Do not solve gate-related suppression by simply applying excessive microphone gain.

---

## 7. COMPRESSION AND AUTOMATIC LEVEL CONTROL

Evaluate the original OpenVoiceChanger compression functionality.

Determine whether it can help maintain consistent speaking levels.

Where technically appropriate, implement or configure a conservative voice-leveling option.

**Suggested Control: Auto Level — ON / OFF**

Auto Level should help compensate for moderate variations in speaking volume.

Requirements:

- Avoid pumping and breathing artifacts.
- Preserve speech intelligibility.
- Avoid excessive background noise amplification.
- Prevent clipping.
- Maintain reasonable processing latency.
- Allow manual gain adjustments when Auto Level is disabled.

Do not stack multiple automatic gain controllers without evaluating their interaction.

Inspect browser-level automatic gain control before enabling additional DSP-based leveling.

If Auto Level cannot be implemented reliably, document the limitation rather than providing a nonfunctional toggle.

---

## 8. LIVE AUDIO LEVEL METERS

Add clear audio-level feedback to the Voice FX panel.

### INPUT LEVEL

Displays the microphone signal level before voice processing.

### PROCESSED LEVEL

Displays the voice signal level after OpenVoiceChanger processing and output gain.

The meters should respond continuously while the microphone is active.

They should help the participant determine whether:

- The microphone is receiving sufficient audio.
- The processing engine is reducing the signal.
- The processed output is too quiet.
- The signal is approaching clipping.

Use appropriate audio-level measurements rather than arbitrary visual animation.

Provide clear peak or clipping indications.

Avoid unnecessary CPU overhead.

Do not confuse monitoring volume with the actual processed recording level.

---

## 9. LIVE AUDIO CALIBRATION

Create a straightforward calibration experience within the Voice FX panel.

The user should be able to:

1. Put on headphones.
2. Activate the microphone.
3. Enable Voice FX.
4. Enable live monitoring.
5. Speak at a normal conversational volume.
6. Observe the input level meter.
7. Adjust microphone gain.
8. Observe the processed level meter.
9. Adjust voice output volume.
10. Adjust headphone monitoring volume.
11. Continue speaking with the selected settings.

**No test recording or playback workflow is required.**

Calibration must happen during live microphone operation.

Do not introduce a complicated setup wizard unless technically necessary.

The interface should remain simple enough for inexperienced podcast creators.

---

## 10. HOST AND GUEST SUPPORT

These improvements must work for both hosts and invited guests.

Each participant must have independent controls for:

- Microphone Gain.
- Voice Output Volume.
- Monitor Volume.
- Noise Gate.
- Auto Level, if implemented.
- Voice FX ON/OFF.
- Monitor My Voice ON/OFF.

A guest adjusting their microphone gain must not change the host's audio settings.

A host adjusting headphone monitoring must not change the guest's audio.

Preserve independent audio-processing paths.

---

## 11. AUDIO ROUTING REQUIREMENTS

Maintain the following conceptual architecture:

**Microphone → Input Gain → OpenVoiceChanger DSP → Processed Output Gain → WebRTC / Recording**

For local monitoring:

**Processed Output → Independent Monitor Gain → Headphones**

The precise implementation may differ if necessary to preserve the original DSP architecture.

However, the three gain stages must remain logically distinct.

### IMPORTANT

Monitor Volume must never be applied to the outgoing podcast recording or WebRTC transmission.

The outgoing processed voice must not be duplicated through the monitoring branch.

Preserve correct sample-rate negotiation and frame handling in the OpenVoiceChanger bridge.

---

## 12. PRIVACY AND FAILURE HANDLING

Preserve all existing fail-closed voice-disguise protections.

If OpenVoiceChanger processing fails while Voice FX is enabled:

- Do not silently transmit the natural microphone signal.
- Mute outgoing audio as required by the existing privacy design.
- Display an appropriate warning.
- Do not automatically bypass the processor.

Prevent excessive output levels from creating avoidable hearing risks during monitoring.

Do not automatically set headphone monitoring to maximum volume.

Voice disguise must not be described as guaranteeing anonymity.

---

## 13. REQUIRED ACCEPTANCE TESTS

### TEST A — NORMAL MICROPHONE DISTANCE

Speak at a normal conversational volume with the microphone positioned according to its intended use.

Confirm that the microphone captures the voice adequately without requiring unusually close positioning.

Document any microphone-specific limitations.

### TEST B — INPUT GAIN

Adjust Microphone Gain while speaking.

Confirm that the input level changes smoothly.

Verify that clipping is prevented or clearly indicated.

### TEST C — PROCESSED OUTPUT

Adjust Voice Output Volume.

Confirm that the processed audio level changes appropriately.

Verify that the voice effect remains intact.

### TEST D — MONITORING VOLUME

Adjust Monitor Volume.

Confirm that headphone loudness changes without altering the outgoing podcast audio level.

### TEST E — NOISE GATE

Speak softly and normally.

Confirm that the noise gate does not unnecessarily suppress intelligible speech.

### TEST F — AUTO LEVEL

If implemented, test the leveling behavior during quiet and louder speech.

Check for pumping, distortion, and excessive noise amplification.

### TEST G — LIVE ADJUSTMENT

Change supported controls while speaking continuously.

Confirm that microphone capture, processing, and monitoring continue without unnecessary interruption.

### TEST H — HOST AND GUEST

Verify independent gain and monitoring controls for two participants.

### TEST I — RECORDING

Record processed speech at different speaking levels.

Confirm that the recording contains clear audio without excessive clipping.

### TEST J — PRIVACY FAILURE

Simulate processing failure.

Confirm that the existing fail-closed behavior remains functional.

### TEST K — REGRESSION

Verify that the existing StudioFlow functionality remains operational.

Distinguish automated tests from actual audible microphone testing.

---

## 14. DEVELOPMENT RESTRICTIONS

All implementation and testing must remain local.

Do not:

- Deploy to production.
- Modify production Cloudflare Workers.
- Modify production D1 or R2 resources.
- Modify Crossroads of the Unknown project assets.
- Overwrite existing recordings.
- Remove the original OpenVoiceChanger integration.
- Change unrelated StudioFlow functionality.
- Push changes without authorization.

Local commits and documentation updates are permitted after successful validation.

---

## 15. REQUIRED COMPLETION REPORT

Provide:

1. Root cause of the low microphone volume.
2. Files modified.
3. Microphone Gain implementation.
4. Voice Output Volume implementation.
5. Monitor Volume implementation.
6. Noise gate findings.
7. Compression or Auto Level implementation.
8. Input and processed level-meter behavior.
9. Audio-routing verification.
10. Host and guest compatibility.
11. Privacy safeguards.
12. Automated test results.
13. Actual microphone testing results.
14. Recording-level verification.
15. Known limitations.
16. Source commit identifier.
17. Documentation commit identifier.
18. Confirmation that production was not modified.

Do not mark audible acceptance tests as passed unless they were actually performed.

---

## 16. FINAL OBJECTIVE

StudioFlow must provide comfortable, professional microphone operation.

A participant should be able to sit at a normal microphone distance, speak naturally, and hear a clear, appropriately loud processed voice.

The system must provide independent control over microphone input gain, processed voice output volume, and headphone monitoring volume.

All adjustments must work during continuous speech.

**Preserve the original OpenVoiceChanger processing engine and improve its audio-level management without sacrificing sound quality, privacy, or stability.**

**END DIRECTIVE — TPI-STUDIOFLOW-024**

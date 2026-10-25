# TPI-STUDIOFLOW-025 — Audio Latency, Clicking & Ghost Voice Repair

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 22:35.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-AUDIO-LATENCY-GHOST-REPAIR.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-AUDIO-LATENCY-GHOST-REPAIR.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-025
## OPENVOICECHANGER — AUDIO LATENCY, CLICKING & GHOST VOICE REPAIR

**Project:** The Paranormal Initiative — StudioFlow  
**Codename:** Project Deep Throat  
**Priority:** CRITICAL — AUDIO QUALITY  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL IMPLEMENTATION  
**Production Deployment:** NOT AUTHORIZED

### 1. OBJECTIVE

Investigate and repair three audio problems discovered during actual microphone testing of StudioFlow's OpenVoiceChanger integration.

**Problem A — Clicking and Crackling**

The Natural voice setting produces repeated clicking or crackling sounds during microphone operation.

**Problem B — Voice Monitoring Delay**

The user experiences a noticeable delay between speaking and hearing the processed voice through headphones.

This makes real-time voice monitoring uncomfortable.

**Problem C — Ghost Voice Malfunction**

The Ghost preset produces an unpleasant static-like sound instead of an intelligible ghost voice.

The objective is to identify and correct these problems at their source.

Do not disguise the problems using additional filters, noise suppression, or gain adjustments.

---

### 2. INVESTIGATE THE COMPLETE AUDIO PIPELINE

Inspect the current OpenVoiceChanger integration, including:

- Browser microphone capture.
- AudioWorklet processing.
- Audio frame buffering.
- Localhost bridge communication.
- Python DSP processing.
- Sample-rate conversion.
- Frame synchronization.
- Processed audio playback.
- Monitoring output.
- WebRTC transmission.
- Recording output.

Identify where clicking, audio discontinuities, and unnecessary latency are introduced.

Inspect the actual implementation rather than assuming that successful automated tests establish correct audio behavior.

---

### 3. NATURAL VOICE — CLEAN AUDIO REQUIREMENT

Natural must provide clean, intelligible microphone audio without unnecessary voice transformation.

Test Natural through:

1. Direct browser microphone monitoring.
2. StudioFlow's existing browser processing path.
3. OpenVoiceChanger's processing bridge.
4. Final headphone monitoring.

Compare the results.

Determine whether clicking originates from:

- Buffer underruns.
- Buffer overruns.
- Discontinuous audio frames.
- Sample-rate mismatches.
- Incorrect frame boundaries.
- AudioWorklet scheduling.
- Bridge communication.
- Improper gain or clipping.
- DSP processing artifacts.

Repair the actual cause.

Natural should not contain artificial clicking, crackling, or distortion.

Do not introduce unnecessary processing into Natural if a clean bypass path is more appropriate.

Any bypass must preserve the existing Voice FX privacy rules.

---

### 4. REAL-TIME MONITORING LATENCY

Investigate the noticeable delay between speaking and hearing the processed voice.

Measure latency across the complete processing pipeline.

Specifically examine the current frame size, reported as approximately 85 milliseconds during earlier bridge testing.

Determine:

- How much audio is buffered before processing.
- How many frames are queued.
- How long bridge communication takes.
- How long DSP processing takes.
- How long processed audio waits before playback.
- Whether unnecessary buffering exists.
- Whether the monitoring path introduces additional delay.

**Do not confuse DSP execution time with total microphone-to-headphone latency.**

Implement improvements that reduce latency without introducing audio discontinuities.

Evaluate smaller frame sizes where supported by the original DSP.

Use appropriate buffering, frame continuity, and synchronization techniques.

Do not simply reduce buffer sizes until audio becomes unstable.

The target is comfortable, near-real-time voice monitoring with stable playback.

Report measured latency and any unavoidable technical limitations.

---

### 5. GHOST VOICE — ORIGINAL SOURCE INVESTIGATION

Return to the original OpenVoiceChanger GitHub repository.

Repository:

https://github.com/sioaeko/OpenVoiceChanger

Original upstream commit:

8e6a00c628eafc0fd1d68c6bc13f2c17b8a46ea1

Inspect the original Ghost voice implementation, if one exists.

Determine:

1. Whether Ghost is an original upstream preset or a StudioFlow-created combination of effects.
2. Which DSP algorithms are actually involved.
3. What processing parameters are expected.
4. Whether StudioFlow is passing correct parameter values.
5. Whether the effect depends on specific sample rates or frame sizes.
6. Whether the current implementation is introducing distortion.
7. Whether the output contains clipping, excessive noise, or invalid samples.

**Do not assume that Ghost is an original OpenVoiceChanger preset without verifying the source.**

If Ghost is a StudioFlow preset built from original OpenVoiceChanger effects, identify its exact processing chain.

Compare the current implementation against the original algorithms and their supported parameter ranges.

Repair incorrect parameter mapping, processing order, or DSP integration.

---

### 6. GHOST VOICE QUALITY REQUIREMENTS

The repaired Ghost preset should produce an atmospheric voice effect while preserving intelligible speech.

Desired characteristics:

- Eerie and supernatural atmosphere.
- Clear enough to understand spoken words.
- Controlled reverberation.
- Appropriate vocal transformation.
- No continuous static-like distortion.
- No excessive crackling.
- No uncontrolled feedback.
- No clipping.
- No unexplained loudness changes.

Do not create a completely new Ghost effect until the existing implementation has been investigated.

If the existing processing chain cannot produce an acceptable result, document the limitation and propose a replacement using verified available DSP components.

---

### 7. VERIFY ALL VOICE PRESETS

After repairing the shared audio pipeline, test:

- Natural.
- Masculine.
- Deep.
- Feminine.
- Robot.
- Ghost.
- All other available presets.

Verify that switching presets does not cause:

- Audio dropouts.
- Persistent clicking.
- Excessive delay.
- Sudden volume spikes.
- Incorrect parameter carryover.
- Processing failures.

Maintain the original OpenVoiceChanger processing wherever applicable.

---

### 8. PRESERVE DIRECTIVE 024 IMPROVEMENTS

Do not remove or break:

- Microphone Gain.
- Voice Output Volume.
- Monitor Volume.
- Adjustable Noise Gate.
- Auto Level.
- Input audio meter.
- Processed audio meter.
- Clipping indicators.
- Independent host and guest controls.

Ensure that the gain and compression stages are not responsible for the observed distortion.

Test the repaired processing path with neutral gain settings before introducing additional amplification.

---

### 9. LIVE MONITORING REQUIREMENTS

The user must be able to:

1. Start the microphone.
2. Enable Voice FX.
3. Enable Monitor My Voice.
4. Speak normally.
5. Hear the processed voice with minimal practical delay.
6. Change voice presets.
7. Adjust supported controls while speaking.
8. Continue without recurring clicks or crackling.

Monitoring volume must remain independent of the outgoing recording and WebRTC levels.

Preserve headphone feedback precautions.

---

### 10. HOST AND GUEST COMPATIBILITY

Verify that the corrected processing pipeline works independently for hosts and guests.

A guest's voice processing must not interfere with the host's audio.

Do not introduce shared buffering that causes participants' audio to mix or become delayed unnecessarily.

Verify that recording and WebRTC use the intended processed signals.

---

### 11. PRIVACY REQUIREMENTS

Preserve fail-closed voice-disguise behavior.

If processing fails while voice disguise is enabled:

- Do not silently transmit unmodified microphone audio.
- Do not bypass the processor without authorization.
- Prevent invalid or unstable audio from reaching the outgoing stream.
- Display an appropriate failure indication.

Do not transmit microphone audio to an unapproved external service.

---

### 12. REQUIRED DIAGNOSTIC TESTS

**Test A — Clean Natural Audio**

Verify that Natural produces clean audio without recurring clicking.

**Test B — Frame Continuity**

Inspect consecutive processed audio frames for discontinuities, missing samples, or unexpected gaps.

**Test C — End-to-End Latency**

Measure microphone-to-monitoring latency.

Report actual measurements, not only DSP processing time.

**Test D — Ghost Processing**

Compare the Ghost implementation with the verified original OpenVoiceChanger components.

Confirm that output remains intelligible and does not produce static-like distortion.

**Test E — Preset Switching**

Switch between presets during continuous speech.

Check for clicks, volume spikes, and processing interruptions.

**Test F — Recording**

Verify that recorded audio does not contain the same clicking or distortion.

**Test G — WebRTC**

Verify that the outgoing processed audio remains stable.

**Test H — Regression**

Run existing architecture, TypeScript, AudioWorklet, DSP, and production-build checks.

Actual audible tests must be reported separately from automated validation.

---

### 13. DEVELOPMENT RESTRICTIONS

All work must remain local.

Do not:

- Deploy to production.
- Push changes without authorization.
- Modify production Cloudflare resources.
- Modify production D1 or R2.
- Alter existing podcast assets.
- Overwrite recordings.
- Remove working StudioFlow functionality.
- Replace the original OpenVoiceChanger engine without justification.

Local source commits and documentation updates are authorized.

---

### 14. REQUIRED COMPLETION REPORT

Provide:

1. Root cause of the Natural clicking.
2. Root cause of the monitoring delay.
3. Original Ghost implementation findings.
4. Explanation of the Ghost malfunction.
5. Source files modified.
6. Audio-buffering changes.
7. Sample-rate and frame-handling changes.
8. Measured end-to-end latency before and after.
9. Ghost preset corrections.
10. Results for all voice presets.
11. Recording verification.
12. WebRTC verification.
13. Privacy regression results.
14. Automated test results.
15. Actual audible microphone test results.
16. Known limitations.
17. Source commit.
18. Documentation commit.
19. Confirmation that production was not modified or deployed.

Do not report audio-quality acceptance as passed without actual listening verification.

---

### 15. FINAL ACCEPTANCE CRITERIA

The repair must deliver:

**Natural:** Clean speech without recurring clicks or crackling.

**Monitoring:** Minimal practical delay between speaking and hearing the processed voice.

**Ghost:** An intelligible atmospheric voice rather than static-like distortion.

**Other Presets:** Stable processing without regressions.

The system must preserve StudioFlow's existing Voice FX interface, calibration controls, privacy protections, and recording architecture.

**Repair the audio pipeline first. Correct the Ghost effect using verified source behavior. Preserve everything already working.**

**END DIRECTIVE — TPI-STUDIOFLOW-025**

# TPI-STUDIOFLOW-026 — Voice FX Audio Stabilization & Interface Simplification

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 15:20.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-026
## VOICE FX AUDIO STABILIZATION & INTERFACE SIMPLIFICATION

**Project:** The Paranormal Initiative — StudioFlow  
**Codename:** Project Deep Throat  
**Priority:** HIGH — AUDIO QUALITY & USER EXPERIENCE  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL IMPLEMENTATION  
**Production Deployment:** NOT AUTHORIZED

### 1. DIRECTIVE OBJECTIVE

Stabilize StudioFlow's OpenVoiceChanger audio processing and simplify the Voice FX interface for everyday podcast creators.

The original OpenVoiceChanger processing engine has already been integrated.

Previous directives established:

- Original OpenVoiceChanger DSP integration.
- Live microphone processing.
- Host and guest Voice FX.
- Processed WebRTC audio.
- Program recording integration.
- Local headphone monitoring.
- Independent microphone and output gain.
- Adjustable noise gate.
- Automatic voice leveling.
- Audio meters.
- Independent participant audio routing.

These capabilities must be preserved.

However, actual user testing has identified two remaining problems:

**A. Audio performance**

The processed voice is approaching acceptable quality but still exhibits noticeable latency, intermittent clicking, jumpiness, or clipping-like artifacts.

**B. Interface complexity**

The current Voice FX panel exposes too many technical controls, making it unnecessarily complicated for podcast creators unfamiliar with audio engineering.

This directive addresses both problems without rebuilding the system.

---

## 2. ESTABLISH THE STANDALONE PROTOTYPE AS THE REFERENCE

The standalone OpenVoiceChanger prototype previously developed under Directive 023 produced a noticeably better listening experience than StudioFlow's integrated Voice FX panel.

The user specifically identified this prototype as the version they preferred.

**Preserve that prototype.**

Do not overwrite, delete, or unnecessarily modify it.

Use it as the reference implementation for audio-quality comparisons.

Compare the prototype against StudioFlow using:

- The same microphone.
- The same browser.
- The same audio device.
- The same sample rate.
- The same voice preset.
- Equivalent gain settings.
- Equivalent monitoring conditions.

Identify the actual differences in processing, buffering, playback, and gain staging.

Do not assume that matching the bridge protocol guarantees identical audible results.

---

## 3. INVESTIGATE REMAINING AUDIO ARTIFACTS

The user reports that processed speech still sounds slightly delayed and occasionally resembles clipping or interrupted playback.

Investigate whether these symptoms originate from:

- AudioWorklet scheduling.
- WebSocket frame delivery.
- Processing queue accumulation.
- Frame underruns or overruns.
- Playback buffer discontinuities.
- Incorrect sample alignment.
- Resampling.
- Excessive gain.
- Compressor behavior.
- Noise gate behavior.
- Browser audio processing.
- Multiple monitoring paths.

Use diagnostic measurements to distinguish these causes.

Do not apply additional compression, limiting, or filtering merely to conceal an underlying timing problem.

### REQUIRED DIAGNOSTICS

Instrument the local audio pipeline to identify:

1. Audio capture timing.
2. Frame submission timing.
3. DSP processing duration.
4. Frame return timing.
5. Playback scheduling.
6. Queue depth.
7. Dropped or late frames.
8. Buffer underruns.
9. Clipping events.
10. Total monitoring latency.

Diagnostic logging must be lightweight and must not itself disrupt audio processing.

---

## 4. REDUCE MONITORING LATENCY

The current implementation uses a 48 kHz sample rate and 1,024-sample frames.

At 48 kHz, each frame represents approximately 21.3 milliseconds of audio.

However, total monitoring latency includes capture, buffering, bridge communication, processing, playback scheduling, and audio-device output.

Measure these stages separately.

Investigate whether unnecessary buffering or queued frames are responsible for the audible delay.

Evaluate:

- Smaller processing frames where supported.
- Improved playback scheduling.
- Reduced queue accumulation.
- Continuous sample delivery.
- Stable frame transitions.
- Efficient WebSocket handling.
- Appropriate AudioWorklet buffering.

Avoid reducing latency at the expense of stability.

**The goal is the lowest practical latency that maintains clean, uninterrupted speech.**

Do not promise zero latency.

Document any unavoidable limitations of the localhost processing architecture.

---

## 5. CORRECT CLICKING AND STUTTERING

Natural Voice must be the baseline for diagnosing audio quality.

Compare:

**Path A:** Direct microphone audio.

**Path B:** Standalone prototype processed audio.

**Path C:** StudioFlow integrated processed audio.

Determine where clicking or stuttering first appears.

Inspect frame continuity and playback timing.

Repair identified defects.

Test with:

- Continuous speech.
- Short phrases.
- Pauses between sentences.
- Quiet speech.
- Louder speech.
- Rapid preset changes.

The processed output should remain stable without repeated clicks, crackling, or unnecessary interruptions.

Do not treat the absence of browser console errors as proof of clean audio.

---

## 6. VERIFY AUDIO LEVELS

Previous screenshots showed very low processed audio meter readings.

Determine whether those readings reflect:

- Actual low signal amplitude.
- Quiet microphone input.
- Incorrect metering.
- Gain-stage attenuation.
- A measurement taken during silence.
- DSP processing behavior.

Verify input and processed audio levels using controlled test signals.

Correct unintended attenuation.

Preserve:

- Input gain smoothing.
- Output gain control.
- Independent monitor gain.
- Clipping protection.
- Noise gate.
- Auto Level.

Do not automatically increase all gain stages.

Ensure that normal conversational speech produces a usable processed signal without excessive amplification.

---

# PART TWO — VOICE FX INTERFACE SIMPLIFICATION

## 7. INTRODUCE SIMPLE AND ADVANCED MODES

The existing Voice FX panel is too technical for everyday podcast creators.

The user should not need to understand audio engineering to select a voice and begin recording.

Implement two interface levels:

**Simple Mode — Default**

**Advanced Settings — Optional**

Simple Mode must be the default for new users.

Existing advanced settings must remain available.

Do not remove the underlying processing capabilities.

---

## 8. SIMPLE MODE — REQUIRED INTERFACE

The primary Voice FX panel should present a straightforward workflow.

### VOICE FX

**Voice FX — ON / OFF**

A clearly visible persistent toggle.

When ON, the selected voice effect is applied to the participant's microphone.

When OFF, voice transformation is disabled through the existing authorized bypass behavior.

### CHOOSE YOUR VOICE

Display the available voice presets as simple selectable buttons.

Preserve the existing supported presets, including:

- Natural.
- Deep Voice.
- Feminine.
- Robot.
- Ghost.
- Telephone.
- Megaphone.
- Echo.
- Reverb.

Additional existing presets may remain available where appropriate.

Each preset must automatically load its intended processing configuration.

Users must not be required to adjust pitch, resonance, echo feedback, or other technical parameters simply to make a preset function.

### VOICE STRENGTH

Provide one optional simplified adjustment:

**Voice Strength**

This control should modify the intensity of the selected transformation only where the DSP supports a meaningful, safe adjustment.

It must not indiscriminately scale pitch, formants, gain, echo, and reverb together.

If a preset does not support a meaningful strength control, hide or disable it for that preset.

### HEAR MY VOICE

Provide a clearly labeled toggle:

**Hear My Voice — ON / OFF**

This controls local monitoring of the processed microphone signal.

When enabled, the user hears the processed voice through headphones.

When disabled, the voice effect remains active for WebRTC and recording.

### HEADPHONE VOLUME

Provide one simple monitoring control:

**Headphone Volume**

This adjusts only the local processed-voice monitoring level.

It must not alter the podcast recording or the volume heard by other participants.

### ADVANCED SETTINGS

Provide a clearly visible button:

**Advanced Settings**

This opens the existing technical controls.

---

## 9. ADVANCED SETTINGS — PRESERVE ALL CAPABILITIES

Move the following controls into Advanced Settings:

- Microphone Gain.
- Processed Voice Output Volume.
- Pitch.
- Vocal Resonance.
- Voice Clarity.
- Noise Gate.
- Auto Level.
- Echo Delay.
- Echo Feedback.
- Reverb Mix.
- Additional supported DSP adjustments.

Preserve all existing functionality.

Do not delete the controls or their underlying processing logic.

Group related settings logically.

Suggested sections:

**Microphone & Levels**

**Voice Character**

**Effects**

**Diagnostics**

Avoid displaying every advanced setting in one long scrolling list.

Advanced Settings should be available to experienced users without overwhelming beginners.

---

## 10. AUTOMATIC PRESET CONFIGURATION

Each preset should provide sensible default settings.

Selecting a preset should automatically configure the relevant DSP parameters.

For example:

**Deep Voice**

Loads the intended pitch and tonal configuration.

**Feminine**

Loads the intended pitch and formant configuration.

**Robot**

Loads the appropriate robotic processing.

**Ghost**

Loads the verified atmospheric processing configuration.

**Natural**

Returns to clean, unmodified vocal character without unnecessary effects.

Users may customize settings through Advanced Settings.

Preserve supported user-defined settings and saved presets.

Do not overwrite previously saved custom configurations without an appropriate migration strategy.

---

## 11. GHOST PRESET VERIFICATION

The user previously reported that Ghost sounded like static.

Investigate the original OpenVoiceChanger Ghost preset and verify its actual DSP configuration.

The upstream interface shows Ghost associated with atmospheric processing such as Whisper, Echo, and Reverb.

Verify the implementation, parameter values, and processing order from the source.

Do not invent settings and represent them as original upstream values.

Ensure that Ghost produces intelligible speech without uncontrolled static, clipping, or feedback.

The Ghost preset must remain subject to the same latency and stability requirements as other effects.

---

## 12. SIMPLIFY AUDIO LEVEL MANAGEMENT

The user should not normally need to adjust three separate volume controls.

Preserve the independent gain stages internally, but provide sensible defaults.

In Simple Mode:

- Microphone gain should use an appropriate default.
- Processed output should use an appropriate default.
- Auto Level may assist where validated.
- Headphone Volume remains user-adjustable.

Do not automatically enable multiple conflicting gain controllers.

Do not introduce sudden volume changes.

If input levels are too low or clipping occurs, provide a clear, nontechnical warning.

Example:

**Microphone volume is low. Check your microphone position or open Advanced Settings.**

Avoid requiring users to interpret dBFS measurements during ordinary operation.

---

## 13. PRESERVE LIVE PODCAST ROUTING

The simplified interface must not alter the established audio architecture.

The participant's microphone must continue through the selected voice-processing path.

The processed signal must reach:

- WebRTC transmission.
- Program recording.
- Local monitoring when enabled.

The participant must continue hearing:

- Other hosts.
- Co-hosts.
- Guests.
- Appropriate podcast playback audio.
- Music and sound effects routed to the monitor mix.

Prevent duplicate microphone playback.

Monitor Volume must not affect outgoing audio.

Guests must not receive their own voices through the return mix.

Preserve camera-independent guest audio playback.

---

## 14. PRESERVE PRIVACY PROTECTIONS

Maintain fail-closed voice-disguise behavior.

If the processing engine fails while voice disguise is enabled:

- Do not silently transmit the natural microphone.
- Do not automatically bypass the processor.
- Mute the affected outgoing signal.
- Display an appropriate warning.

Do not introduce external audio processing services without authorization.

Do not describe voice disguise as guaranteeing anonymity.

---

## 15. USER EXPERIENCE REQUIREMENTS

A new StudioFlow user should be able to:

1. Open Voice FX.
2. Turn Voice FX ON.
3. Select a voice preset.
4. Enable Hear My Voice if desired.
5. Adjust Headphone Volume.
6. Begin recording or broadcasting.

No technical calibration should be required under normal conditions.

The interface should feel approachable, polished, and consistent with StudioFlow's existing design.

Preserve responsive layouts for desktop, tablet, and mobile.

Do not redesign unrelated StudioFlow panels.

---

# PART THREE — TESTING & ACCEPTANCE

## 16. REQUIRED TECHNICAL TESTS

### TEST A — PROTOTYPE COMPARISON

Compare StudioFlow and the standalone prototype using equivalent audio conditions.

Document differences and corrections.

### TEST B — NATURAL VOICE

Verify clean speech without recurring clicking.

### TEST C — MONITORING LATENCY

Measure end-to-end latency.

Report actual values and methodology.

### TEST D — FRAME CONTINUITY

Verify stable frame delivery without unnecessary underruns or queue accumulation.

### TEST E — AUDIO LEVELS

Verify input and processed output levels.

Check for clipping and unintended attenuation.

### TEST F — PRESET QUALITY

Verify all existing voice presets.

Pay particular attention to Ghost.

### TEST G — SIMPLE MODE

Verify that a user can select a voice and begin speaking without advanced configuration.

### TEST H — ADVANCED MODE

Verify that all existing technical controls remain functional.

### TEST I — SETTINGS PERSISTENCE

Verify that Voice FX, monitoring preferences, and supported user settings persist correctly.

### TEST J — HOST AND GUEST ROUTING

Verify independent processed audio paths.

### TEST K — RECORDING

Verify that the program recording captures the intended processed voice.

### TEST L — PRIVACY FAILURE

Verify that processing failure does not silently expose unmodified microphone audio.

### TEST M — REGRESSION

Run:

- TypeScript validation.
- Voice FX architecture checks.
- AudioWorklet syntax checks.
- OpenVoiceChanger DSP tests.
- Production build.
- Git diff validation.

Automated checks must not be presented as proof of audible quality.

---

## 17. HUMAN LISTENING ACCEPTANCE

Actual headphone listening remains necessary.

The user must be able to evaluate:

- Natural voice clarity.
- Masculine and Feminine transformations.
- Ghost Voice.
- Monitoring delay.
- Clicking or stuttering.
- Comfortable listening volume.
- Preset switching.
- Podcast recording quality.

Where the development environment cannot complete microphone access, report audible acceptance as pending.

Do not claim completion of listening tests that were not performed.

---

## 18. DEVELOPMENT RESTRICTIONS

All work must remain local.

Do not:

- Deploy to production.
- Push without authorization.
- Modify production Cloudflare Workers.
- Modify production D1 or R2.
- Alter Crossroads of the Unknown assets.
- Delete existing voice presets.
- Remove working gain controls.
- Break host or guest audio routing.
- Replace the original OpenVoiceChanger engine unnecessarily.
- Modify unrelated StudioFlow features.

Preserve the standalone prototype.

Local commits and documentation updates are authorized.

---

## 19. REQUIRED COMPLETION REPORT

Provide:

1. Root cause of remaining audio artifacts.
2. Root cause of monitoring latency.
3. Prototype comparison findings.
4. Audio-processing changes.
5. Frame-buffering changes.
6. Measured latency before and after.
7. Audio-level findings.
8. Ghost preset verification.
9. Simple Mode implementation.
10. Advanced Settings implementation.
11. Preset behavior.
12. Host and guest routing verification.
13. Recording verification.
14. Privacy regression results.
15. Automated test results.
16. Human listening results or pending status.
17. Known limitations.
18. Source commit.
19. Documentation commit.
20. Confirmation that production was not modified or deployed.

---

## 20. FINAL ACCEPTANCE STANDARD

StudioFlow Voice FX must provide a professional yet simple podcasting experience.

**Audio Quality**

Clear, stable processed speech without recurring clicking, stuttering, or avoidable distortion.

**Real-Time Performance**

The lowest practical monitoring latency consistent with reliable processing.

**Ease of Use**

A beginner can select a voice and start speaking without understanding audio engineering.

**Advanced Capabilities**

Experienced creators retain access to detailed audio controls.

**Podcast Integration**

Processed voices continue working correctly with hosts, co-hosts, guests, WebRTC, local monitoring, and recording.

**Privacy**

Existing fail-closed protections remain intact.

The standalone prototype remains the audio-quality reference until StudioFlow's integrated processing meets or exceeds its performance.

**Do not rebuild what already works. Stabilize the audio, simplify the interface, and preserve the complete podcast production system.**

---

**END DIRECTIVE — TPI-STUDIOFLOW-026**

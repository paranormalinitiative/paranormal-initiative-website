# TPI-STUDIOFLOW-021 — Live Voice Disguise & Fine-Tuning

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 21:35.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-VOICE-DISGUISE-FINE-TUNING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-DISGUISE-FINE-TUNING.md), [2026-10-22-STUDIOFLOW-VOICE-MONITORING-FINE-TUNING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-MONITORING-FINE-TUNING.md)
**Previously archived variant(s):** [TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md](TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md)

---

# TPI-STUDIOFLOW-021
## STUDIOFLOW — LIVE VOICE DISGUISE & FINE-TUNING
### Project Codename: DEEP THROAT
**Priority:** HIGH  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL DEVELOPMENT AND TESTING  
**Production Deployment:** NOT AUTHORIZED

---

## 1. DIRECTIVE OBJECTIVE

Enhance StudioFlow's existing Voice FX system with a professional, real-time voice disguise capability.

The primary objective is to allow podcast hosts and invited guests to modify their natural voices during live conversations, with adjustable pitch and vocal characteristics.

This system must support both deeper, masculine-style voice transformations and higher, feminine-style voice transformations.

The feature must be accessible to every StudioFlow participant without requiring additional software, plugins, installations, or external accounts.

**This directive extends TPI-STUDIOFLOW-020. It does not replace the existing Voice FX architecture.**

The completed AudioWorklet pipeline, WebRTC integration, recording integration, existing voice presets, and privacy safeguards must remain operational.

---

## 2. REQUIRED VOICE DISGUISE MODES

Implement three selectable voice disguise modes.

### MODE A — MASCULINE VOICE

Designed to produce a deeper-sounding voice.

Required characteristics:

- Adjustable downward pitch shifting.
- Natural speech timing.
- Preservation of understandable speech.
- Adjustable vocal resonance where technically supported.
- Continuous real-time processing.
- Minimal distortion and robotic artifacts.

The existing Deep Voice preset should serve as the starting point.

Users must be able to adjust the depth rather than being restricted to one predetermined sound.

### MODE B — FEMININE VOICE

Designed to produce a higher-sounding voice.

Required characteristics:

- Adjustable upward pitch shifting.
- Natural speech timing.
- Preservation of understandable speech.
- Adjustable vocal resonance where technically supported.
- Continuous real-time processing.
- Minimal distortion and artificial artifacts.

This must be a genuine live voice transformation rather than playback-speed manipulation.

### MODE C — CUSTOM VOICE

Allow participants to configure their own voice disguise settings.

Custom Voice must support the available pitch and vocal-processing controls without requiring users to select a masculine or feminine preset.

**Important:** Masculine and Feminine are descriptive starting presets, not claims that the software can reliably reproduce a particular gender's voice.

---

## 3. VOICE FINE-TUNING CONTROLS

Create a compact fine-tuning interface within StudioFlow's existing Voice FX panel.

### Required Controls

**A. Voice Disguise Toggle**

Provide a persistent ON/OFF toggle.

When activated, voice disguise remains enabled until the participant intentionally disables it.

This is NOT a push-to-talk or press-and-hold control.

**B. Pitch Adjustment**

Provide a slider for adjusting vocal pitch.

The slider must support the pitch ranges appropriate to the selected voice mode.

Adjustments must take effect during live speech.

Do not change speech playback speed to achieve pitch modification.

**C. Vocal Resonance**

Investigate and, where feasible, implement independent formant or vocal-resonance adjustment.

This control should help users alter vocal character without relying exclusively on pitch shifting.

A control must not appear in the interface unless it performs a real, measurable audio-processing function.

If reliable formant processing is not feasible within acceptable browser latency and performance limits, document the limitation and defer that control.

**D. Voice Clarity**

Evaluate whether a useful clarity control can be implemented through appropriate audio processing.

If implemented, it must provide a genuine, audible improvement in speech intelligibility.

Do not introduce a decorative control that has no meaningful effect.

**E. Reset to Default**

Provide a reset function that restores the selected mode's default settings.

**F. Live Preview**

Allow participants to hear their modified voice before joining or activating the effect during a recording session.

Preview must be user-controlled and include appropriate headphone guidance to prevent feedback.

---

## 4. LIVE AUDIO PROCESSING

All voice transformations must occur continuously during live speech.

Required audio flow:

**Microphone → Voice Disguise Processor → Processed Audio Stream → WebRTC / Recording**

The system must:

1. Process audio locally in the participant's browser.
2. Apply adjustments without restarting the podcast session.
3. Preserve normal speech timing.
4. Minimize additional processing latency.
5. Avoid clicks, pops, and abrupt audio discontinuities when changing settings.
6. Preserve existing microphone mute functionality.
7. Avoid transmitting duplicate raw and processed microphone tracks.
8. Continue functioning when participants switch between available voice modes.

Changes to the pitch or other supported fine-tuning controls must take effect without requiring the participant to disconnect or rejoin.

Use the existing TPI-STUDIOFLOW-020 AudioWorklet architecture wherever practical.

---

## 5. HOST AND GUEST AVAILABILITY

Voice Disguise must be available to both hosts and invited guests.

### Host Experience

The host must be able to:

- Select Masculine, Feminine, or Custom Voice.
- Activate or deactivate voice disguise.
- Adjust the available fine-tuning controls.
- Preview the selected voice.
- Continue using StudioFlow's existing recording and podcast controls.

### Guest Experience

Guests joining through StudioFlow invitation links must receive equivalent voice disguise capabilities.

Guests must be able to configure their voice before joining the podcast.

The guest interface should remain simple and intuitive.

No StudioFlow administrator intervention should be required to activate the guest's voice disguise.

**Each participant controls their own voice settings independently.**

One participant's adjustments must not affect another participant's microphone or processing settings.

---

## 6. VOICE DISGUISE USER INTERFACE

Integrate the feature into the existing Voice FX interface.

Suggested presentation:

### VOICE DISGUISE

**Voice Style**

[ Masculine ] [ Feminine ] [ Custom ]

**Voice Disguise:** ON / OFF

**Pitch**

[────────●────────]

**Vocal Resonance**

[────────●────────]

*Display only if independently implemented and functional.*

**Clarity**

[────────●────────]

*Display only if supported by functional processing.*

[ Preview Voice ] [ Reset ]

### Interface Requirements

- Follow StudioFlow's existing visual design.
- Preserve current Voice FX presets.
- Avoid creating an unnecessarily complicated audio engineering interface.
- Support desktop and mobile layouts.
- Ensure controls are usable with touchscreens.
- Clearly indicate whether disguise processing is active.
- Provide immediate visual feedback when adjustments change.

The feature must remain accessible to users without audio engineering experience.

---

## 7. VOICE PRIVACY PROTECTION

Voice disguise is intended to help participants conceal recognizable vocal characteristics.

It must not be marketed as guaranteeing anonymity.

Maintain the fail-closed safeguards introduced in TPI-STUDIOFLOW-020.

### Required Behavior

When voice disguise is enabled:

- The processed microphone signal must be used for outgoing audio.
- The original microphone signal must not simultaneously reach the podcast or recording through another route.
- Processing failure must not silently expose the natural voice.
- If the disguise processor fails, outgoing microphone audio must mute.
- The participant must receive a visible warning.
- Recovery must not automatically bypass the disguise.

The participant must explicitly choose to disable voice disguise before an unmodified microphone signal can be transmitted.

This behavior must also apply to reconnection, microphone changes, and audio-processing initialization failures.

**Do not claim that voice modification guarantees anonymity or prevents identification.**

---

## 8. SETTINGS AND SESSION PERSISTENCE

Voice disguise settings should remain stable throughout an active session.

Required behavior:

- Switching the toggle OFF must not erase the user's adjustments.
- Switching it ON must restore the previously selected settings.
- Changing between presets must not corrupt saved settings.
- Reconnecting must not unexpectedly disable privacy protections.
- Host and guest settings must remain independent.

Evaluate whether participant settings can safely persist between StudioFlow sessions.

Do not alter or migrate existing stored data unnecessarily.

Any persistence changes must preserve current studio configurations and saved assets.

---

## 9. AUDIO QUALITY AND PERFORMANCE

The goal is a natural, understandable modified voice suitable for podcast recording.

Evaluate:

- Pitch-shifting quality.
- Speech intelligibility.
- Processing latency.
- Audio dropouts.
- CPU utilization.
- Browser compatibility.
- Mobile performance.
- Stability during extended conversations.

Where appropriate, use AudioWorklet processing, optimized DSP, or browser-compatible WebAssembly.

Do not introduce a server-side voice-processing dependency without separate authorization.

Avoid implementing computationally expensive voice conversion that makes real-time podcast participation unreliable.

Higher-quality formant processing may require additional engineering. Investigate the feasibility rather than assuming the existing pitch algorithm already supports it.

---

## 10. REQUIRED ACCEPTANCE TESTING

The implementation must be tested beyond interface verification.

### Test A — Masculine Voice

Activate the Masculine Voice mode.

Confirm that the output is audibly deeper than the original microphone signal.

Adjust pitch during continuous speech.

Confirm that the output changes in real time.

### Test B — Feminine Voice

Activate the Feminine Voice mode.

Confirm that the output is audibly higher than the original microphone signal.

Adjust pitch during continuous speech.

Confirm that the output changes in real time.

### Test C — Persistent Toggle

Activate voice disguise.

Speak continuously without interacting with the control.

Confirm that processing remains active.

Disable the toggle.

Confirm that normal microphone processing resumes only after intentional deactivation.

### Test D — Guest Participation

Join a StudioFlow session using a guest invitation link.

Activate voice disguise on the guest side.

Confirm that the host receives the modified audio.

Verify that the guest can adjust the effect without disconnecting.

### Test E — Host Participation

Activate voice disguise on the host side.

Confirm that the guest receives the modified audio.

Verify that the host can adjust the effect without interrupting the session.

### Test F — Recording

Record a session using modified voices.

Inspect the resulting recording.

Confirm that the recorded audio contains the processed voices rather than unintended original microphone audio.

### Test G — Privacy Failure

Simulate a voice-processing failure while disguise is enabled.

Confirm that outgoing microphone audio mutes rather than falling back to the natural voice.

### Test H — Browser and Device Compatibility

Evaluate available desktop browsers and mobile devices.

Document which configurations were actually tested.

Do not report simulated interface interactions as successful audible audio tests.

**If two-device or real-microphone testing cannot be completed in the development environment, explicitly mark those tests as pending rather than passed.**

---

## 11. EXISTING FEATURES THAT MUST BE PRESERVED

Do not break or remove:

- Existing Voice FX presets.
- SMART Pads.
- Background music.
- Sound effects.
- Host and guest microphone controls.
- WebRTC participation.
- Podcast recording.
- Recording audio synchronization.
- Studio selection and switching.
- Automatic studio saving.
- Existing studio assets.
- Guest invitation functionality.
- Crossroads of the Unknown project data.

Do not modify unrelated StudioFlow features.

Preserve all existing owner data and browser storage.

---

## 12. PRODUCTION AND INFRASTRUCTURE RESTRICTIONS

This directive authorizes local development and validation only.

**Do not deploy to production.**

Do not modify:

- Production Cloudflare Workers.
- Production D1 databases.
- Production R2 storage.
- Existing production podcast recordings.
- Owner browser storage.
- Existing Crossroads of the Unknown assets or project data.

Do not reset, delete, overwrite, or migrate stored user data.

Local source commits and development documentation updates are permitted after appropriate validation.

Production deployment requires separate authorization.

---

## 13. REQUIRED COMPLETION REPORT

Upon completion, provide:

1. Implementation status.
2. Files created or modified.
3. Voice modes implemented.
4. Fine-tuning controls implemented.
5. Explanation of the pitch-processing method.
6. Whether independent formant processing was implemented.
7. Host and guest integration status.
8. WebRTC and recording integration status.
9. Privacy failure-handling results.
10. Automated test results.
11. Actual microphone and audible test results.
12. Browser and mobile compatibility findings.
13. Known limitations.
14. Local commit identifiers.
15. Confirmation that production was not deployed.

Clearly distinguish:

**IMPLEMENTED**

**AUTOMATED TESTED**

**AUDIBLY VERIFIED**

**PENDING MANUAL ACCEPTANCE**

Do not claim completion of unperformed tests.

---

## 14. FINAL OBJECTIVE

Deliver a reliable, adjustable, real-time voice disguise system for StudioFlow.

Participants must be able to select a deeper voice, a higher voice, or a custom voice and fine-tune the result while speaking.

The system must be accessible to hosts and invited guests, preserve the existing podcast workflow, and protect against accidental raw-audio exposure when disguise processing fails.

**The objective is not to create dozens of novelty voices.**

The objective is to provide a practical, professional voice modification feature that people can actually use during live podcast interviews.

### PROJECT DEEP THROAT
**Professional voice disguise. Simple controls. Live performance.**

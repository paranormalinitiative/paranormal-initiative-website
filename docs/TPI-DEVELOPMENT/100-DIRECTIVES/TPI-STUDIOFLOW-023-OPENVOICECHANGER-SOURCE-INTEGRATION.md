# TPI-STUDIOFLOW-023 — OpenVoiceChanger Source Integration

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 22:12.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-023
## OPENVOICECHANGER — ORIGINAL SOURCE CODE INTEGRATION

**Project:** The Paranormal Initiative — StudioFlow  
**Codename:** Project Deep Throat  
**Priority:** HIGH  
**Assigned To:** Luna / Codex  
**Status:** AUTHORIZED FOR LOCAL IMPLEMENTATION  
**Production Deployment:** NOT AUTHORIZED

### 1. OBJECTIVE

Integrate the actual open-source OpenVoiceChanger processing technology into StudioFlow's existing Voice FX system.

We have already completed the Voice FX interface, live monitoring, fine-tuning controls, host integration, and guest integration.

The current voice transformations do not produce the desired audio quality.

**The objective is to use the original OpenVoiceChanger processing implementations rather than continue developing approximations of its effects.**

### 2. SOURCE REPOSITORY

Original project:

https://github.com/sioaeko/OpenVoiceChanger

Copyright (c) 2024 Sioaeko.

The project includes an MIT License permitting use, modification, integration, and commercial distribution, subject to its license conditions.

Preserve the required copyright notice, permission notice, and warranty disclaimer.

Inspect third-party dependencies and assets for separate license requirements.

### 3. OBTAIN THE ORIGINAL SOURCE CODE

Clone the original OpenVoiceChanger repository into an isolated local development directory.

Do not overwrite StudioFlow's existing source files.

Inspect the complete repository and identify:

- Original audio-processing implementations.
- Voice transformation algorithms.
- Pitch-shifting functionality.
- Formant or resonance processing, if present.
- Available voice effects.
- Processing dependencies.
- Server-side requirements.
- Browser-compatible components.
- Audio input and output architecture.

Determine which components are responsible for the actual audible voice transformations.

**Do not substitute newly written effects when the original implementation can be reused.**

### 4. BUILD A WORKING INTEGRATION

Proceed beyond source inspection.

Create a functional local prototype using the original processing code or a faithful port of the relevant components.

The prototype must demonstrate actual microphone audio processing.

Prioritize:

**Masculine Voice**
- Lower perceived vocal pitch.
- Natural-sounding speech.
- Adjustable depth.
- Minimal robotic distortion.

**Feminine Voice**
- Higher perceived vocal pitch.
- Natural-sounding speech.
- Adjustable characteristics.
- Minimal robotic distortion.

**Custom Voice**
- Adjustable pitch.
- Resonance or formant controls where supported.
- Additional compatible processing adjustments.

Do not claim that a feature is supported by the original engine unless its implementation has been verified.

### 5. INTEGRATION ARCHITECTURE

First determine whether the original processing can operate in StudioFlow's browser-based audio architecture.

Preferred architecture:

Microphone → Original/Adapted Voice Processor → Processed Audio → WebRTC / Recording

Processed Audio → Local Headphone Monitoring

If the original processing depends on Python, native libraries, or server-side processing, evaluate and prototype a suitable integration architecture.

Do not introduce an external processing service into production without separate authorization.

Do not transmit private microphone audio to an unapproved external service.

Document any proposed server infrastructure, processing costs, latency, and privacy implications.

### 6. PRESERVE THE EXISTING STUDIOFLOW INTERFACE

Retain the Voice FX system developed under Directives 020, 021, and 022.

Preserve:

- Voice FX ON/OFF toggle.
- Live monitoring.
- Live fine-tuning panel.
- Masculine, Feminine, and Custom modes.
- Host Voice FX controls.
- Guest Voice FX controls.
- Saved settings.
- WebRTC integration.
- Program recording integration.
- Existing privacy protections.

Adapt the processing engine to the existing controls wherever technically appropriate.

Do not replace functioning interface components unnecessarily.

### 7. REAL-TIME OPERATION

Voice transformation must operate during live speech.

Users must be able to:

1. Enable Voice FX.
2. Enable headphone monitoring.
3. Speak into their microphone.
4. Hear the transformed voice.
5. Adjust supported parameters while speaking.
6. Disable monitoring without disabling Voice FX.
7. Continue broadcasting and recording with the modified voice.

Measure and report processing latency.

Identify whether latency is acceptable for natural podcast conversations.

Avoid clicks, dropouts, excessive CPU usage, and unnecessary audio interruptions.

### 8. PRIVACY AND AUDIO ROUTING

Preserve the existing fail-closed Voice FX protections.

When voice disguise is enabled, an engine failure must not silently expose the participant's unmodified microphone audio.

Do not create duplicate outgoing audio streams.

Do not mix local monitoring audio into the program recording.

Do not describe the resulting system as guaranteeing anonymity.

### 9. AUDIO QUALITY COMPARISON

Compare the original OpenVoiceChanger processing with StudioFlow's existing Voice FX implementation.

Evaluate:

- Voice naturalness.
- Masculine transformation quality.
- Feminine transformation quality.
- Speech intelligibility.
- Processing artifacts.
- Audio latency.
- CPU usage.
- Stability during continuous speech.

Where possible, use equivalent source audio and processing settings.

Document which original algorithms were successfully reused and which required adaptation.

**A successful build alone does not establish acceptable audio quality.**

Actual listening tests are required.

### 10. FALLBACK PLAN

If direct integration proves technically impractical:

1. Identify the specific limitation.
2. Determine whether a faithful port is practical.
3. Evaluate compatible open-source voice-processing alternatives.
4. Recommend the best approach based on sound quality, latency, licensing, and StudioFlow compatibility.

Do not repeatedly implement approximate effects without demonstrating an improvement.

Preserve the existing StudioFlow processor until a replacement has been validated.

### 11. DEVELOPMENT RESTRICTIONS

Development and testing must remain local.

Do not:

- Deploy to production.
- Modify production Cloudflare Workers.
- Modify production D1 or R2 resources.
- Overwrite existing podcast recordings.
- Alter Crossroads of the Unknown assets.
- Remove functioning StudioFlow features.
- Replace the current production audio processor.

Local commits and documentation updates are permitted after validation.

### 12. REQUIRED COMPLETION REPORT

Provide:

1. Original repository version or commit inspected.
2. Original processing algorithms identified.
3. Original source files reused.
4. Files adapted or ported.
5. Dependencies introduced.
6. License compliance details.
7. Processing architecture implemented.
8. Working microphone prototype results.
9. Masculine transformation results.
10. Feminine transformation results.
11. Live fine-tuning results.
12. Measured audio latency.
13. CPU and stability observations.
14. Browser compatibility findings.
15. Known limitations.
16. Actual listening tests completed or pending.
17. Source commits.
18. Confirmation that production was not deployed.

Distinguish implemented functionality from verified audio quality.

### 13. FINAL ACCEPTANCE REQUIREMENT

The work is not complete merely because the source code has been copied or the application builds successfully.

The goal is a functioning voice-processing system that provides noticeably better, usable live voice transformations.

Preserve StudioFlow's existing interface and workflow while replacing or improving the underlying audio-processing technology.

**Copy the original technology where feasible. Adapt it correctly. Test the actual sound.**

Do not authorize production deployment.

---

**END DIRECTIVE — TPI-STUDIOFLOW-023**

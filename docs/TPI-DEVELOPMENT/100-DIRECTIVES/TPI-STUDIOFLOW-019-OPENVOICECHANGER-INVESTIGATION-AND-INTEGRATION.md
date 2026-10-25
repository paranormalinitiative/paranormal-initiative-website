# TPI-STUDIOFLOW-019 — OpenVoiceChanger Investigation and Integration

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 20:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-019
## OpenVoiceChanger — Live Voice FX Integration Investigation

**Assigned Agent:** Luna — Codex GPT-5.6  
**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** High  
**Status:** APPROVED — INVESTIGATION AND PROTOTYPING

### 1. PRIMARY OBJECTIVE

Investigate the open-source OpenVoiceChanger project as a potential foundation for StudioFlow's live Voice FX system.

**Source repository:**

https://github.com/sioaeko/OpenVoiceChanger

Our objective is to implement professional real-time voice-changing capabilities for StudioFlow podcast hosts and invited guests.

We want functionality comparable to RØDE UNIFY's Voice FX panel, with additional capabilities where practical.

Do not rebuild functionality unnecessarily if suitable, legally reusable open-source implementations already exist.

### 2. REPOSITORY INVESTIGATION

Clone OpenVoiceChanger into an isolated research directory outside StudioFlow's production source tree.

Examine:

- Project architecture.
- Frontend implementation.
- AudioWorklet components.
- Real-time microphone processing.
- Pitch-shifting algorithms.
- Formant-shifting functionality.
- Voice presets.
- Robot and synthetic voice effects.
- Echo and reverb.
- Voice-disguise functionality.
- WebSocket communication.
- Python backend dependencies.
- AI voice conversion and model requirements.
- Browser compatibility.
- Licensing and third-party dependencies.

**Verify all claimed capabilities against the actual source code.**

Do not assume that a feature exists merely because it was mentioned in a previous discussion.

### 3. DETERMINE WHETHER SERVERLESS PROCESSING IS POSSIBLE

Our preferred architecture is browser-side voice processing.

Investigate whether OpenVoiceChanger's effects can operate using:

- Web Audio API.
- AudioWorklet.
- WebAssembly, if appropriate.
- Client-side digital signal processing.

Determine which effects can operate without Python, AI models, or external processing servers.

Identify which effects genuinely require backend infrastructure.

**Do not introduce a new server unless there is a demonstrated technical requirement.**

### 4. REQUIRED STUDIOFLOW VOICE EFFECTS

Investigate implementation of:

**Voice Disguise**

Alter the recognizable characteristics of a participant's voice.

**Pitch Shift**

Allow users to raise or lower vocal pitch.

**Robot Voice**

Apply robotic modulation.

**Megaphone**

Create a loudspeaker-style voice.

**Echo**

Provide adjustable delayed repetitions.

**Reverb**

Provide adjustable acoustic-space effects.

Also identify any useful additional effects supported by OpenVoiceChanger.

Prioritize audio clarity, low latency, and reliable live operation.

### 5. HOST INTEGRATION

StudioFlow hosts must have access to a dedicated Voice FX panel.

The panel should use the previously approved SMART Pad design language.

Each effect must have:

- A clearly labeled pad.
- An active/inactive state.
- Appropriate adjustment controls.
- A reset option.
- A way to preview the effect.

Voice effects must work during live podcast sessions and recordings.

### 6. GUEST INVITATION INTEGRATION

**This is mandatory.**

When a guest opens their StudioFlow invitation link, they must have access to Voice FX within their existing device and microphone settings.

Guests must be able to:

1. Select an effect before joining.
2. Preview their modified voice.
3. Adjust the effect.
4. Join with the selected effect active.
5. Change or disable effects during the session.

Each guest controls their own microphone effects independently.

No external software installation should be required.

### 7. AUDIO ROUTING INVESTIGATION

Inspect StudioFlow's current microphone, WebRTC, and recording architecture.

Determine how to route audio through the following pipeline:

**Microphone → Voice FX Processing → WebRTC Transmission → Host/Guest Monitoring → Recording**

Confirm that the processed voice reaches other participants and the podcast recording.

Investigate whether the existing recording system uses local tracks, remote tracks, mixed audio, or separate participant recordings.

Preserve existing audio synchronization and recording functionality.

### 8. VOICE PRIVACY

Voice Disguise should support participants who prefer not to use their natural voices.

However, do not advertise it as guaranteed anonymity.

Voice effects must not secretly preserve or transmit an unprocessed microphone stream when the participant expects their voice to be altered.

Any optional recording of original audio must require appropriate disclosure and consent.

### 9. LICENSING REVIEW

Verify OpenVoiceChanger's current license from the repository.

Review dependencies and any model-specific licensing restrictions.

Identify required attribution or copyright notices.

Do not copy proprietary RØDE or Graillon software.

### 10. ISOLATED PROTOTYPE

If the repository contains suitable reusable code, create an isolated proof of concept.

Demonstrate:

- Microphone input.
- Real-time pitch shifting.
- At least one voice-disguise effect.
- Effect activation and deactivation.
- Processed microphone output.
- Basic latency and audio-quality measurements.

Where feasible, test additional effects.

Do not modify production StudioFlow audio routing during this investigation.

### 11. STUDIOFLOW INTEGRATION PLAN

After investigating and testing, prepare an implementation plan identifying:

- Reusable OpenVoiceChanger components.
- Components requiring adaptation.
- Components that must be developed independently.
- Proposed Voice FX SMART Pad interface.
- Host integration points.
- Guest invitation integration points.
- Recording integration requirements.
- Browser compatibility.
- Performance considerations.
- Security and privacy considerations.
- Licensing obligations.

### 12. VALIDATION

Verify that the proposed architecture can support:

- Multiple simultaneous podcast participants.
- Independent voice effects per participant.
- Real-time processing.
- Correct WebRTC transmission.
- Recording of processed audio.
- Microphone changes and reconnection.
- Disabling effects without losing audio.
- Desktop and supported mobile browsers.

Clearly distinguish demonstrated functionality from features requiring additional implementation.

### 13. AUTONOMOUS AUTHORITY

Luna is authorized to:

- Research and inspect the repository.
- Clone the project into an isolated workspace.
- Inspect StudioFlow's existing audio architecture.
- Install dependencies in the isolated research environment.
- Run local tests and prototypes.
- Create investigation documentation.
- Commit research documentation where appropriate.

Do not deploy experimental audio-processing changes to production until the prototype and integration approach have been validated.

### 14. REQUIRED COMPLETION REPORT

Provide:

1. OpenVoiceChanger architecture findings.
2. Verified available effects.
3. Browser-only versus server-dependent capabilities.
4. Reusable source components.
5. Licensing findings.
6. Prototype results.
7. StudioFlow integration feasibility.
8. Guest invitation compatibility.
9. Recording compatibility.
10. Recommended implementation phases.

### SUCCESS CONDITION

We have a technically validated approach for integrating OpenVoiceChanger-inspired live Voice FX into StudioFlow, allowing hosts and invited guests to independently change their voices during podcast sessions without installing additional software.

**END DIRECTIVE — TPI-STUDIOFLOW-019**

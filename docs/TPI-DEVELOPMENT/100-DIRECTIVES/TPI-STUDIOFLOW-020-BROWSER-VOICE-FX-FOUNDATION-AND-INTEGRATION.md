# TPI-STUDIOFLOW-020 — Browser Voice FX Foundation and Integration

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 21:29.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-VOICE-FX-FOUNDATION.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-VOICE-FX-FOUNDATION.md)
**Previously archived variant(s):** [TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md](TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md)

---

# TPI-STUDIOFLOW-020
## STUDIOFLOW — LIVE VOICE FX FOUNDATION AND INTEGRATION

**Project:** The Paranormal Initiative — StudioFlow  
**Assigned Agent:** Luna — Codex GPT-5.6  
**Priority:** HIGH  
**Directive Type:** IMPLEMENTATION  
**Previous Directive:** TPI-STUDIOFLOW-019  
**Status:** AUTHORIZED FOR DEVELOPMENT AND LOCAL VALIDATION

---

## 1. PRIMARY OBJECTIVE

Implement StudioFlow's browser-based real-time Voice FX foundation using the findings and prototype developed during TPI-STUDIOFLOW-019.

The system must allow podcast hosts and invited guests to modify their microphone audio in real time.

The modified audio must be transmitted to other participants and captured by StudioFlow's recording system.

The implementation must preserve StudioFlow's existing podcast functionality, including:

- Studio selection and persistence.
- Guest invitation links.
- Guest connection and disconnection.
- Microphone selection.
- Audio monitoring.
- Podcast recording.
- Audio synchronization.
- Existing sound effects and background music.
- SMART Pad functionality.
- Existing studio assets and saved configurations.

**Do not rebuild StudioFlow's audio architecture unnecessarily.**

Extend the existing architecture using the audio-routing points identified in TPI-STUDIOFLOW-019.

---

## 2. AUTHORITATIVE RESEARCH

Use the completed investigation:

`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-OPENVOICECHANGER-INVESTIGATION.md`

Reference implementation:

https://github.com/sioaeko/OpenVoiceChanger

Existing isolated prototype:

`/private/tmp/tpi-openvoicechanger-research/browser-prototype/`

The investigation identified two important StudioFlow integration points.

**Guest microphone transmission:**

`/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`

Previously identified near line 10862.

**Host recording/compositor:**

`/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`

Previously identified near line 6157.

These line numbers are investigation references, not permanent identifiers. Locate and verify the relevant functions before making changes.

Inspect the existing implementation before modifying either location.

---

## 3. IMPLEMENT THE BROWSER AUDIO PROCESSING FOUNDATION

Create a reusable Voice FX processing system using browser-supported audio technology.

Preferred technologies:

- Web Audio API.
- AudioContext.
- AudioWorklet.
- MediaStreamAudioSourceNode.
- MediaStreamAudioDestinationNode.
- WebAssembly where justified by performance requirements.

The intended architecture is:

**Microphone → Voice FX Processor → Processed MediaStream → WebRTC / Recording**

The processing system must support:

1. Real-time microphone input.
2. Independent processing for each participant.
3. Effect activation and deactivation.
4. Adjustable effect parameters.
5. Clean bypass.
6. AudioContext lifecycle management.
7. Microphone switching.
8. Device disconnection and reconnection.
9. Audio cleanup when leaving a session.
10. Safe handling of processing failures.

Avoid unnecessary audio-processing servers.

The initial implementation should run locally in each participant's browser.

---

## 4. HOST MICROPHONE INTEGRATION

Integrate the Voice FX processing system into StudioFlow's host microphone pipeline.

When an effect is active, the host's processed microphone audio must be used wherever StudioFlow expects the host microphone signal.

This includes:

- Live podcast communication.
- Guest monitoring of the host.
- Host recording.
- Mixed recording output.
- Any other existing audio consumers that should receive the modified microphone.

Do not accidentally transmit or record both the original and processed microphone simultaneously.

Preserve existing audio controls and microphone permissions.

---

## 5. GUEST INVITATION INTEGRATION

**This is a mandatory requirement.**

Guests must be able to use Voice FX through their existing StudioFlow invitation links.

No separate application or software installation should be required.

The guest interface must allow participants to:

1. Select their microphone.
2. Open Voice FX controls.
3. Select an available effect.
4. Preview their modified voice.
5. Adjust the effect.
6. Join the podcast with the selected effect.
7. Change effects during the session.
8. Disable effects when desired.

Each guest must have an independent processing instance.

One participant's effects must never change another participant's microphone audio.

The host must receive the guest's processed audio through the existing WebRTC connection.

Preserve existing guest authentication, invitation validation, and connection behavior.

---

## 6. INITIAL VOICE EFFECTS

Implement an initial collection of browser-compatible effects.

### Robot Voice

Provide robotic vocal modulation.

### Telephone Voice

Apply frequency filtering to simulate telephone audio.

### Megaphone

Provide a loudspeaker-style vocal effect.

### Echo

Allow adjustable delay and feedback.

### Reverb

Provide adjustable room or atmospheric reverberation.

### Basic Pitch Shift

Provide adjustable upward and downward pitch shifting.

Pitch shifting must not simply change audio playback speed, causing timing and synchronization problems.

If a satisfactory independent pitch-shifting algorithm is not ready, keep the feature experimental rather than releasing an inadequate implementation.

### Noise Gate

Provide adjustable background-noise suppression through a threshold-based gate.

### Output Gain

Provide adjustable output level with appropriate clipping protection.

Additional effects may be implemented when supported by the existing prototype and validated processing architecture.

**Audio quality and stability take priority over the number of effects.**

---

## 7. VOICE FX SMART PAD INTERFACE

Create a dedicated Voice FX panel consistent with StudioFlow's existing design.

Use the previously approved SMART Pad visual language.

The panel should display individual effect tiles with:

- Clear effect names.
- Distinct active and inactive states.
- Consistent styling.
- Effect selection.
- Adjustable parameters where applicable.
- Bypass/reset controls.

Initial suggested pads:

- Natural Voice
- Deep Voice
- Robot
- Telephone
- Megaphone
- Ghost
- Echo
- Reverb

Presets such as Deep Voice and Ghost must be backed by actual processing configurations.

Do not create decorative pads that imply unavailable functionality.

The initial interface should be straightforward for podcast hosts and first-time guests.

Advanced controls may be placed inside an expandable settings area.

---

## 8. VOICE PREVIEW

Implement microphone effect preview where browser capabilities permit.

Hosts and guests should be able to hear how their selected effect sounds before using it during a session.

Preview requirements:

- User-initiated activation.
- Clear preview on/off control.
- No automatic speaker playback without permission.
- Headphone recommendation when appropriate.
- Protection against feedback loops.
- Proper cleanup when preview stops.

Preview must not interfere with outgoing podcast audio.

The preview signal and outgoing processed signal should use the same processing configuration.

---

## 9. WEBRTC ROUTING

Investigate and modify the existing WebRTC audio-track routing.

When Voice FX is enabled, the transmitted microphone track must represent the processed signal.

Preserve:

- Existing peer connections.
- Guest invitations.
- Connection negotiation.
- Microphone mute/unmute.
- Audio device switching.
- Reconnection behavior.
- Participant removal.
- Track cleanup.

Prefer replacing or updating the existing outgoing audio track without unnecessary peer-connection reconstruction.

Use `RTCRtpSender.replaceTrack()` where appropriate, but validate compatibility with StudioFlow's actual connection architecture.

Ensure effects can be changed without disconnecting participants.

---

## 10. RECORDING INTEGRATION

Integrate processed microphone audio into StudioFlow's existing recording and audio-mixing pipeline.

The recording must capture the audio participants actually intend to transmit.

For example:

If the host selects Robot Voice, the podcast recording must contain the processed robot voice.

If a guest selects Deep Voice, the host must hear that processed voice, and the recording must capture it.

Investigate all relevant recording paths rather than assuming there is only one.

Verify:

- Host microphone recording.
- Guest microphone recording.
- Mixed podcast recording.
- Any separate-track recording.
- Audio synchronization.
- Recording start and stop.
- Effects changed during recording.

Do not modify unrelated recording or media-storage behavior.

---

## 11. PRIVACY AND FAILURE HANDLING

Voice disguise may be used by guests who do not wish to reveal their natural voice.

Therefore, processing failures require explicit handling.

If a participant has selected a privacy-sensitive voice-disguise effect:

**Never silently substitute their unprocessed microphone audio after a processing failure.**

Instead:

1. Stop or mute outgoing microphone audio.
2. Display a clear processing error.
3. Offer recovery or reconnection.
4. Allow the participant to explicitly disable disguise if they choose.

For ordinary nonprivacy effects, define and document the appropriate failure behavior.

Do not claim that pitch shifting guarantees anonymity.

Also ensure that raw microphone audio is not unintentionally included in recordings when a privacy-sensitive effect is active.

---

## 12. PERFORMANCE AND LATENCY

Real-time podcast communication requires stable, low-latency processing.

Measure:

- AudioWorklet processing performance.
- CPU usage.
- Audio buffering.
- Added processing latency.
- Dropouts.
- Audio glitches.
- Synchronization with other participants.

Avoid unnecessary buffering.

Test effects individually and in supported combinations.

Evaluate desktop and mobile browser performance separately.

Do not introduce significant recording synchronization problems to accommodate an effect.

---

## 13. LICENSING

OpenVoiceChanger is reported to use the MIT license.

Verify the license in the actual repository and preserve required copyright and license notices for reused code.

Check any additional dependencies independently.

Do not copy proprietary RØDE UNIFY or Graillon source code.

Only reuse OpenVoiceChanger components when technically appropriate and permitted by their applicable licenses.

---

## 14. IMPLEMENTATION SEQUENCE

Follow this order.

### PHASE A — AUDIO ROUTING FOUNDATION

Implement the reusable browser Voice FX processor.

Connect it to StudioFlow's microphone pipeline.

Demonstrate that a processed track can be transmitted through the existing WebRTC connection.

### PHASE B — RECORDING VALIDATION

Ensure StudioFlow records processed microphone audio correctly.

Test host and guest audio independently.

Verify synchronization and prevent accidental raw-audio leakage.

### PHASE C — INITIAL EFFECTS

Implement and validate the initial DSP effects.

Begin with simpler, stable effects before advancing to pitch shifting.

### PHASE D — USER INTERFACE

Implement the Voice FX SMART Pad panel.

Integrate it into the host interface and guest invitation experience.

### PHASE E — FULL VALIDATION

Test simultaneous host and guest processing, reconnections, recording, and failure recovery.

Do not proceed to advanced AI voice conversion during this directive.

---

## 15. TESTING REQUIREMENTS

Before declaring completion, validate the following scenarios:

**Scenario 1:** Host activates Robot Voice. Guest hears the processed voice.

**Scenario 2:** Guest activates Telephone Voice. Host hears the processed voice.

**Scenario 3:** Host and guest use different effects simultaneously.

**Scenario 4:** Host changes effects during an active recording.

**Scenario 5:** Guest changes effects during an active recording.

**Scenario 6:** Guest disconnects and reconnects.

**Scenario 7:** Host switches microphones.

**Scenario 8:** Effects are disabled and normal microphone operation resumes.

**Scenario 9:** Voice processing fails while a privacy-sensitive disguise is active. Original microphone audio must not be transmitted automatically.

**Scenario 10:** Existing sound effects, background music, and recording functionality remain operational.

**Scenario 11:** Voice preview operates without creating feedback or duplicate outgoing audio.

**Scenario 12:** Studio switching and saved studio configurations continue functioning normally.

Run existing StudioFlow tests and add targeted regression coverage.

Where automated browser tests cannot establish actual audible behavior, conduct and document a real microphone/WebRTC test.

Do not report a feature as validated solely because its code compiles.

---

## 16. PROJECT PROTECTION

StudioFlow already contains substantial completed functionality.

Do not overwrite, reset, or recreate existing studio data.

Protect:

- Existing studios.
- Saved studio configurations.
- Studio assets.
- Uploaded audio.
- SMART Pads.
- Guest invitation functionality.
- Crossroads of the Unknown project data.
- Existing recordings.
- Owner browser storage.
- Cloudflare production resources.

No destructive database or storage operations are authorized.

Do not deploy experimental changes to production.

---

## 17. AUTONOMOUS DEVELOPMENT AUTHORITY

Luna is authorized to:

- Inspect StudioFlow's existing source code.
- Implement browser-side Voice FX components.
- Integrate processing into local development audio routing.
- Modify the host and guest interfaces.
- Create reusable audio-processing modules.
- Add automated tests.
- Run local builds.
- Conduct isolated browser tests.
- Document changes.
- Commit completed and validated development work.

Luna must preserve existing functionality and avoid unrelated modifications.

**Production deployment requires separate authorization.**

---

## 18. COMPLETION REPORT

Provide a detailed implementation report containing:

1. Files created or modified.
2. Voice FX processing architecture.
3. Implemented effects.
4. Host microphone integration results.
5. Guest invitation integration results.
6. WebRTC transmission validation.
7. Recording integration validation.
8. Audio latency and performance measurements.
9. Browser compatibility findings.
10. Privacy and failure-handling results.
11. Regression-test results.
12. Known limitations.
13. Remaining work for advanced voice disguise.
14. Commit identification.
15. Deployment status.

Clearly distinguish fully implemented functionality from experimental or incomplete features.

---

## 19. SUCCESS CRITERIA

TPI-STUDIOFLOW-020 is complete when:

**A StudioFlow host and an invited guest can independently activate supported browser-based Voice FX, hear their processed voices, communicate through the existing podcast system, and record the processed audio without disrupting StudioFlow's established functionality.**

Advanced AI voice conversion and sophisticated formant-preserving disguise are outside this directive unless separately authorized.

**END DIRECTIVE — TPI-STUDIOFLOW-020**

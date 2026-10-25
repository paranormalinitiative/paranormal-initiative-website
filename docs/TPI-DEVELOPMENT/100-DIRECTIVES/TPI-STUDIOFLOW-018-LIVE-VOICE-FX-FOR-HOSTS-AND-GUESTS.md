# TPI-STUDIOFLOW-018 — Live Voice FX for Hosts and Guests

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 15:16.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-018
## Live Voice FX SMART Pads — Host and Guest Integration

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** High  
**Status:** Approved for Investigation and Implementation  
**Assigned Agent:** FreeBuff

### OBJECTIVE

Develop and integrate a real-time Voice FX system into StudioFlow for both podcast hosts and invited guests.

The system should provide functionality inspired by RØDE UNIFY's voice effects while maintaining StudioFlow's existing interface and branding.

**Voice FX must be available through the host's StudioFlow interface and the guest's invitation link.**

### 1. HOST VOICE FX PANEL

Add a dedicated Voice FX section to the host's StudioFlow controls.

Provide the following effects:

- Voice Disguise
- Pitch Shift
- Robot
- Megaphone
- Reverb
- Echo

Display these effects using colored SMART Pads with prominent FX lettering and clearly labeled effect names.

Each effect must have appropriate adjustment controls.

Hosts must be able to activate, deactivate, and customize effects while recording or broadcasting.

### 2. GUEST VOICE FX PANEL

**This is a mandatory requirement.**

When an invited guest opens their StudioFlow invitation link, the guest interface must include a Voice FX panel.

The panel should appear alongside the guest's existing audio, microphone, camera, and device settings.

Guests must have access to:

- Voice Disguise
- Pitch Shift
- Robot
- Megaphone
- Reverb
- Echo

Guests must be able to:

1. Select their preferred voice effect.
2. Adjust available effect settings.
3. Preview how their altered voice sounds.
4. Activate or deactivate the effect.
5. Change effects during the podcast.
6. Return to their natural voice instantly.

The guest interface must remain simple and accessible.

### 3. INDEPENDENT VOICE CONTROL

Every participant must have independent Voice FX controls.

For example:

- The host uses their natural voice.
- Guest 1 activates Voice Disguise.
- Guest 2 activates Robot.
- Guest 3 uses Pitch Shift.

All participants must be able to speak simultaneously with their individual effects applied.

One participant's effect settings must not change another participant's voice.

The host must not be able to activate another participant's effects without that participant's consent.

### 4. LIVE AUDIO PROCESSING

Voice effects must process microphone audio in real time.

The processed audio must be routed correctly to:

- Other podcast participants.
- The host's monitoring system.
- Live broadcast output, where supported.
- Podcast recordings.

**The recorded audio must match the processed voice heard during the session.**

Do not implement effects that only work during local microphone previews.

Avoid audio feedback, noticeable delays, distortion, or interruptions when switching effects.

### 5. VOICE DISGUISE

Voice Disguise is a priority feature.

It must allow a host or guest to alter the recognizable characteristics of their voice.

Provide adjustable controls appropriate to the implementation.

Include a clearly visible indicator whenever Voice Disguise is active.

Do not promise guaranteed anonymity or identity protection.

### 6. PITCH SHIFT

Implement adjustable pitch shifting.

Allow users to raise or lower their voice.

Provide an intuitive adjustment slider and a reset-to-default option.

Where technically feasible, preserve natural speech timing while changing pitch.

### 7. SMART PAD APPEARANCE

Use StudioFlow's established SMART Pad design system.

Voice FX pads must have:

- Dark backgrounds.
- Brightly colored FX lettering.
- Clearly displayed effect names.
- Active/inactive visual states.
- Appropriate settings controls.

Maintain a consistent appearance across host and guest interfaces.

### 8. GUEST INVITATION EXPERIENCE

When guests open their invitation links, they must continue to see their existing device and participation settings.

Add Voice FX without removing or disrupting existing functionality.

The guest should be able to configure their microphone and preview voice effects before joining.

Once connected, the guest must retain access to their Voice FX controls.

Voice effects must work without requiring guests to install RØDE UNIFY or other desktop applications.

### 9. PRIVACY AND RECORDING

Voice FX settings must remain independent for each participant.

If original, unprocessed microphone audio is retained separately, the participant must be informed and consent to that recording.

Do not introduce hidden microphone recording or monitoring.

Preserve StudioFlow's existing permissions and guest-access security.

### 10. TECHNICAL INVESTIGATION

Before modifying the audio pipeline, inspect:

- Existing microphone capture.
- Guest audio routing.
- WebRTC connections.
- Host monitoring.
- Recording architecture.
- Existing audio-processing components.
- Browser compatibility.

Determine how processed microphone audio can replace the original microphone stream for transmission and recording.

Inspect publicly accessible RØDE UNIFY documentation and permitted local application resources for functional reference.

Develop an independent implementation without copying proprietary software.

### 11. IMPLEMENTATION AND VALIDATION

Implement the functionality using the existing StudioFlow architecture wherever possible.

Verify:

1. Host Voice FX works.
2. Guest Voice FX works through invitation links.
3. Guests can preview effects before joining.
4. Guests can change effects during a session.
5. Multiple participants can use different effects simultaneously.
6. Other participants hear the processed audio.
7. Podcast recordings contain the intended processed audio.
8. Switching effects does not disconnect microphones.
9. Disabling effects restores the natural microphone signal.
10. Existing recording, soundboard, background music, and studio-selection functionality remain operational.

Test desktop and supported mobile browsers.

Do not deploy an implementation that disrupts existing podcast audio or recording.

### 12. COMPLETION REQUIREMENTS

Report:

- Voice effects implemented.
- Host interface changes.
- Guest interface changes.
- Audio-routing changes.
- Supported browsers.
- Test results.
- Deployment status.
- Any remaining limitations.

**SUCCESS CONDITION:**

Every StudioFlow host and invited guest can independently activate, customize, and use real-time Voice FX through their existing browser interface, with processed audio correctly delivered to other participants and podcast recordings.

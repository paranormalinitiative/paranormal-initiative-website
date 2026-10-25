# TPI-STUDIOFLOW-025 — Addendum A: Live Podcast Audio Routing

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 22:36.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-LIVE-AUDIO-ROUTING.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-LIVE-AUDIO-ROUTING.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-025 — ADDENDUM A
## LIVE PODCAST MONITORING, VOICE FX & PARTICIPANT AUDIO ROUTING

**Priority:** CRITICAL  
**Applies To:** TPI-STUDIOFLOW-025

### OBJECTIVE

Verify and correct StudioFlow's complete live podcast audio-routing architecture.

The user has confirmed that **Monitor Processed Voice Locally** is enabled during microphone testing.

StudioFlow must support simultaneous:

1. Live microphone processing through OpenVoiceChanger.
2. Local monitoring of the processed microphone signal.
3. Transmission of the processed voice to other podcast participants.
4. Reception and playback of other participants' voices.
5. Playback of appropriate podcast audio sources.
6. Recording of the correct processed audio.

These operations must function together without unnecessary delay, duplication, feedback, or audio degradation.

### REQUIRED AUDIO ROUTING

**LOCAL MICROPHONE PATH**

Microphone → Input Gain → OpenVoiceChanger → Processed Output Gain

The processed signal must branch to:

- WebRTC transmission.
- Podcast recording.
- Local monitoring.

Local monitoring must have an independent volume control.

**REMOTE PARTICIPANT PATH**

Remote participants → WebRTC reception → Local headphone mix.

Each participant must hear the other participants without receiving an unnecessary duplicate of their own voice.

**PODCAST PLAYBACK PATH**

Music, sound effects, SMART Pads, and other applicable program sources must be routed to the appropriate monitoring and recording destinations.

Prevent unintended duplicate playback or recording.

### MONITOR PROCESSED VOICE LOCALLY

When enabled:

- The participant hears their own processed microphone signal.
- Other participants continue hearing the processed voice.
- Recording continues capturing the processed voice.
- The participant continues hearing the rest of the podcast.
- Monitoring volume affects only local playback.
- The processed microphone must not be duplicated in the local headphone mix.

When disabled:

- Only local self-monitoring is disabled.
- Voice FX remains active.
- WebRTC transmission continues.
- Recording continues.
- Other participants remain audible.

### REQUIRED VALIDATION

Test the following scenario:

**Host A:** Voice FX enabled, local monitoring enabled.

**Co-host B:** Connected through WebRTC.

Confirm:

1. Host A hears their own transformed voice.
2. Host A hears Co-host B.
3. Co-host B hears Host A's transformed voice.
4. Co-host B does not hear Host A's unmodified microphone.
5. Host A does not hear a delayed duplicate of their own voice.
6. Both voices appear correctly in the podcast recording.
7. Adjusting Host A's Monitor Volume does not affect Co-host B.
8. Disabling Host A's monitoring does not disable Voice FX.
9. Music and sound effects remain correctly routed.
10. No feedback, persistent clicking, or unexpected audio duplication occurs.

Measure and report monitoring latency separately from network participant latency.

Preserve the existing fail-closed voice-disguise protections.

### IMPLEMENTATION RESTRICTIONS

Preserve the existing StudioFlow architecture wherever possible.

Do not create unnecessary duplicate processing chains.

Do not introduce server-side audio transmission without authorization.

Do not modify production infrastructure or deploy.

Document the verified audio-routing behavior and any unresolved limitations.

**END ADDENDUM A**

# TPI-STUDIOFLOW-019 — Additional Investigation Instructions

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 20:56.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

## ADDENDUM — OPENVOICECHANGER DSP INVESTIGATION

Luna, pay particular attention to OpenVoiceChanger's model-free DSP processing.

The repository documentation confirms that its existing implementation uses server-side DSP processing, even when no AI voice model is loaded.

Investigate whether these algorithms can be adapted to run entirely inside StudioFlow's browser-based audio system.

Evaluate all 12 DSP effects and 16 built-in voice presets.

Prioritize:

1. Real-time pitch and formant shifting.
2. Voice disguise for anonymous podcast guests.
3. Robot, ghost, and deep voice presets.
4. AudioWorklet compatibility.
5. WebRTC transmission of processed microphone audio.
6. Recording processed audio rather than unintentionally recording the original microphone.
7. Independent effects for hosts and guests.
8. Low-latency performance on desktop and mobile browsers.

**Do not modify StudioFlow's production audio routing yet.**

First determine what is technically feasible, what code can be reused, and what additional development would be required.

Provide a detailed feasibility report with your recommended architecture.

If practical, create an isolated working prototype demonstrating real-time voice processing in the browser.

Do not deploy experimental functionality.

**END ADDENDUM**

# TPI-STUDIOFLOW-018 — iPhone and iPad Testing Requirements

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-17 16:54.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-018 — ADDITIONAL REQUIREMENTS
## iPhone and iPad Guest Testing

The development guest invitation environment must support both **Apple iPhone and Apple iPad**.

### Supported Testing Devices

**1. Mac — Studio Host**
- Runs the StudioFlow development environment.
- Hosts Crossroads of the Unknown.
- Generates guest invitations.
- Manages guest admission, audio, video, and scenes.

**2. iPhone — Mobile Guest**
- Opens development invitation links in Safari.
- Connects using the iPhone camera and microphone.
- Supports portrait and landscape orientations.
- Displays a mobile-friendly guest interface.
- Supports joining, leaving, and reconnecting.

**3. iPad — Tablet Guest**
- Opens development invitation links in Safari.
- Connects using the iPad camera and microphone.
- Supports portrait and landscape orientations.
- Displays a tablet-appropriate guest interface.
- Supports joining, leaving, and reconnecting.

### Required Testing

Verify the following on both iPhone and iPad:

1. Guest invitation links open correctly.
2. Camera and microphone permissions work.
3. Guest waiting room displays correctly.
4. Host can admit guests.
5. Two-way audio functions.
6. Guest video appears in the host's Studio.
7. Audio and video remain synchronized.
8. Device rotation does not break the interface.
9. Guest disconnection and reconnection work.
10. StudioFlow remains stable throughout the session.

### Simultaneous Guest Testing

The development environment should also support testing:

**Mac Host + iPhone Guest + iPad Guest**

This will allow us to verify multiple guests joining the same podcast session.

Test guest isolation, independent audio/video streams, connection stability, and host controls.

Use headphones or mute nearby devices during testing to prevent audio feedback.

### Development Environment Requirements

- Both devices must access the same development environment.
- Guest invitations must never redirect to production.
- Development sessions must remain isolated from production.
- HTTPS and secure WebSocket connections must work where required.
- No production deployment is authorized.
- No public development tunnel may be activated without explicit authorization.

### Acceptance

TPI-STUDIOFLOW-018 cannot receive full mobile guest testing acceptance until both iPhone and iPad have been successfully tested on physical devices.

Browser simulations alone are insufficient.

Codex should first investigate and prepare the development connection, then report what authorization is required before external access is enabled.

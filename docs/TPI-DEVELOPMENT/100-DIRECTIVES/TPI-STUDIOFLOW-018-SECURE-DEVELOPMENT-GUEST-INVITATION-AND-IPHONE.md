# TPI-STUDIOFLOW-018 — Secure Development Guest Invitation and iPhone Testing

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-17 16:53.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-018
## Secure Development Guest Invitation and iPhone Testing

**Project:** The Paranormal Initiative — StudioFlow

**Objective:** Establish a secure, temporary development testing environment that allows an iPhone to join a locally hosted StudioFlow session using the existing guest invitation system.

### Background

StudioFlow's guest invitation functionality already works on the production website.

The development environment currently uses:

- Port 8787 — Local Development Worker
- Port 8788 — StudioFlow room server

The host operates StudioFlow on a Mac.

The testing device is an iPhone.

The objective is to reproduce the existing production guest invitation experience in development without modifying or disrupting production.

### Phase 1 — Investigate Existing Architecture

Before making changes:

1. Identify how StudioFlow generates guest invitation links.
2. Identify the routes used by invited guests.
3. Determine how guests connect to StudioFlow rooms.
4. Identify the WebSocket connection requirements.
5. Determine whether WebRTC is involved.
6. Identify camera, microphone, and browser security requirements.
7. Inspect existing Cloudflare development configurations.
8. Identify any existing tunnel or development hostname configurations.
9. Determine how authentication and guest access are handled.
10. Verify whether development guest sessions are isolated from production.

Document the findings.

Do not modify application code during this phase.

### Phase 2 — Determine Secure Mobile Access

Evaluate the safest approach for allowing an iPhone to access the development environment.

Preferred option, if compatible:

**Temporary Cloudflare Tunnel with HTTPS.**

Requirements:

- Development-only access.
- No production deployment.
- No production Worker changes.
- No production database modifications.
- No changes to public production DNS.
- Support for guest invitation links.
- Support for required WebSocket connections.
- Support for iPhone Safari camera and microphone permissions.
- No unnecessary exposure of development administration interfaces.

Determine whether separate routing is necessary for ports 8787 and 8788.

Do not assume both services can be exposed through a single tunnel route without verification.

If a tunnel is unsuitable, recommend a secure alternative.

### Phase 3 — Development Guest Invitation Configuration

Once the architecture is understood, prepare a development-specific invitation configuration.

Requirements:

1. Guest invitations must resolve to the development environment.
2. Invitation links must not redirect guests to production.
3. Guest sessions must remain isolated from production sessions.
4. Existing production invitation functionality must remain unchanged.
5. Invitation tokens must retain their existing security protections.
6. Development invitations must work on iPhone Safari.
7. Camera and microphone permissions must function correctly.
8. Guest audio and video must connect to the host's StudioFlow session.

Avoid hardcoded temporary URLs in production source code.

### Phase 4 — Security and Safety

Before enabling external access:

- Verify development authentication boundaries.
- Prevent unintended access to administrative routes.
- Verify guest invitation token validation.
- Preserve production locks.
- Avoid exposing unrelated local services.
- Do not disable browser security protections.
- Do not disable authentication globally.
- Do not weaken CORS or WebSocket origin validation.
- Do not expose development secrets or environment variables.

Any temporary tunnel must be explicitly identified as a development testing connection.

### Phase 5 — Testing

Prepare a test procedure using:

**Host:** Mac running StudioFlow development.

**Guest:** iPhone using Safari.

**Studio:** Crossroads of the Unknown.

Test the following:

1. Host opens Crossroads of the Unknown.
2. Host generates a development guest invitation.
3. Invitation link opens on iPhone.
4. Guest enters the waiting room, if applicable.
5. Host admits the guest, if required.
6. Guest camera activates.
7. Guest microphone activates.
8. Host receives guest video.
9. Host receives guest audio.
10. Guest receives host audio where supported.
11. Guest disconnects.
12. Guest reconnects using the supported invitation flow.
13. Studio remains stable throughout testing.

Recording and livestreaming must remain disabled during this initial test.

### Phase 6 — Reporting

Provide:

- Existing guest invitation architecture.
- Recommended development access method.
- Required configuration changes.
- Development isolation verification.
- Security considerations.
- Exact steps needed to begin iPhone testing.
- Any remaining limitations.

### Authorization Boundaries

You are authorized to investigate the existing architecture, inspect configuration, and run local non-destructive tests.

You are NOT authorized to:

- Deploy to production.
- Modify production Cloudflare settings.
- Modify production DNS.
- Create a publicly accessible tunnel without explicit approval.
- Commit or push changes.
- Modify production databases.
- Disable security controls.
- Start recording or livestreaming.

**Stop and request authorization before creating an externally accessible development endpoint.**

### Acceptance Criteria

This directive is complete when Codex has identified a secure, technically viable method for iPhone guest testing and documented the implementation steps.

Actual external access and live iPhone testing require separate authorization.

**Directive ID: TPI-STUDIOFLOW-018**

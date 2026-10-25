# TPI-STUDIOFLOW-018B — Development Mobile Testing Authorization

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-17 17:03.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-018B
## Secure Development Connection — iPhone and iPad

**Project:** The Paranormal Initiative — StudioFlow

**Objective:** Establish a secure HTTPS development environment for physical iPhone and iPad guest testing.

### Owner Authorization

You are authorized to:

1. Configure a temporary, guarded HTTPS development tunnel.
2. Configure development-only routing for the local Worker on port 8787 and room server on port 8788.
3. Enable necessary external WebRTC connectivity for controlled testing.
4. Use STUN connectivity and investigate TURN requirements.
5. Generate development-only guest invitations.
6. Prepare one controlled three-device testing session.

### Security Requirements

- Do not modify production Cloudflare Workers.
- Do not modify production DNS.
- Do not deploy application changes to production.
- Do not access or modify production databases.
- Do not disable production locks.
- Do not expose unrelated local services.
- Do not expose development administrative interfaces publicly.
- Protect guest invitations with existing token validation.
- Ensure WebSocket connections use secure transport.
- Preserve development and production session isolation.
- Use temporary access with a defined shutdown procedure.

If the existing development server cannot safely separate guest routes from administrative routes, stop and report the issue before opening external access.

### Required Devices

**Mac:** StudioFlow host.

**iPhone:** Guest 1, Safari.

**iPad:** Guest 2, Safari.

### Connection Verification

Confirm:

1. The development environment is accessible through HTTPS.
2. Guest invitation links point to development.
3. iPhone Safari can load the invitation page.
4. iPad Safari can load the invitation page.
5. Camera and microphone permissions are available.
6. Secure WebSocket connections establish successfully.
7. WebRTC signaling functions.
8. No requests are redirected to production.

### Physical Device Testing

Once the development connection is ready, provide the owner with instructions for joining from both devices.

Do not claim physical-device acceptance until the owner confirms successful testing.

### Session Restrictions

- No recording.
- No livestreaming.
- No production sessions.
- No deployment.
- No database migration.
- No commit or push.

### Completion Report

Provide:

- Development tunnel status.
- Temporary HTTPS access method.
- Guest invitation routing status.
- WebSocket connectivity status.
- WebRTC connectivity status.
- iPhone readiness.
- iPad readiness.
- Security verification.
- Shutdown procedure.
- Remaining blockers.

**Acceptance:** The development connection must be operational and verified before proceeding to physical-device acceptance.

If safe external access cannot be established, stop and report the blocker.

# TPI-STUDIOFLOW-018C — Temporary Cloudflare Tunnel Authorization

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-17 17:19.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-018C
## Temporary Development Guest Tunnel Activation

**Project:** The Paranormal Initiative — StudioFlow

**Purpose:** Enable physical iPhone and iPad guest testing.

### Explicit Owner Authorization

The owner authorizes ONE temporary Cloudflare Quick Tunnel using a randomly generated `*.trycloudflare.com` hostname.

This authorization includes:

1. Temporary public exposure of the narrowly allowlisted development guest shell and required static assets.
2. Temporary exposure of code-scoped room relay routes.
3. External STUN/WebRTC connectivity necessary for guest testing.
4. Development-only guest invitations for iPhone and iPad.
5. One controlled Mac-host, iPhone-guest, and iPad-guest test session.

### Required Security Controls

Before tunnel activation:

- Verify that `/admin-panel` remains inaccessible.
- Verify that authenticated application APIs remain inaccessible.
- Verify that host-only invitation management remains inaccessible.
- Verify that arbitrary room codes cannot bypass authorization.
- Verify that no production routes or credentials are exposed.
- Confirm that the temporary gateway binds only to the intended local interface.
- Confirm that the tunnel forwards exclusively to the restricted guest gateway.

### Tunnel Activation

1. Start the restricted guest gateway.
2. Confirm its local security tests pass.
3. Start one temporary Cloudflare Quick Tunnel.
4. Record the generated HTTPS hostname.
5. Verify that the public endpoint serves only approved guest resources.
6. Confirm blocked routes remain inaccessible through the public hostname.
7. Verify secure WebSocket connectivity.
8. Verify that invitation links resolve to the temporary development hostname.

If any security check fails, immediately stop the tunnel.

### Physical Device Testing

After successful activation, provide the owner with:

- The temporary guest invitation URL.
- Instructions for opening it on iPhone Safari.
- Instructions for opening it on iPad Safari.
- Instructions for enabling camera and microphone access.

Do not activate recording or livestreaming.

### Shutdown Requirements

After testing:

1. Stop the Cloudflare Quick Tunnel.
2. Stop the temporary guest gateway.
3. Invalidate or close synthetic guest invitations.
4. Confirm the temporary public endpoint is no longer accessible.
5. Preserve the existing local development services unless otherwise instructed.

### Restrictions

No production deployment, production DNS modification, database migration, commit, or push is authorized.

Do not install or configure a paid TURN service without separate approval.

### Completion Requirements

Report:

- Tunnel activation status.
- Public route security results.
- WebSocket connectivity.
- iPhone and iPad connection results.
- Any WebRTC limitations.
- Tunnel shutdown status.

**Acceptance requires successful physical testing on both iPhone and iPad.**

If device testing cannot be completed, report the environment as ready for testing rather than fully accepted.

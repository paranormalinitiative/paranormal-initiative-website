# TPI-STUDIOFLOW-072 — LIVE BRIDGE PRODUCTION AUTHENTICATION REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 21:55.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-072
LIVE BRIDGE PRODUCTION AUTHENTICATION REPAIR
=====================================================================

PRIORITY:
CRITICAL

ACTIVE MISSION:
STUDIOFLOW PRODUCTION RELEASE

STATUS:
AUTHORIZED — SCOPED LOCAL SECURITY REPAIR

=====================================================================
1. OBJECTIVE
=====================================================================

Correct the production Live Bridge authentication
boundary so invited guests can participate without
requiring administrator accounts.

Preserve the existing invitation-code workflow.

Preserve host-only administrative controls.

Do not rebuild Live Bridge.

Do not introduce another guest platform.

DO NOT DEPLOY.

=====================================================================
2. AUTHORITATIVE CANDIDATE
=====================================================================

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Branch:
codex/studioflow-release-candidate

Verify current branch and Git status.

Preserve the original website development worktree.

Preserve the authoritative StudioFlow source.

Do not stage, commit, or push.

=====================================================================
3. TRACE LIVE BRIDGE AUTHENTICATION
=====================================================================

Inspect the existing guest workflow:

- Host creates invitation.
- Invitation code is generated.
- Guest receives invitation.
- Guest enters invitation code.
- Invitation is validated.
- Guest enters waiting room.
- Host admits guest.
- WebRTC signaling begins.
- Guest appears on stage.
- Guest can be removed.
- Session closes.

Identify every API endpoint involved.

Document which endpoints require:

HOST AUTHENTICATION

INVITE-BASED GUEST AUTHORIZATION

PUBLIC ACCESS WITHOUT SESSION PRIVILEGES

Do not assume all room endpoints require
the same authorization policy.

=====================================================================
4. HOST AUTHORIZATION
=====================================================================

Preserve strong authentication for:

- Room creation.
- Host token issuance.
- Room administration.
- Livestream controls.
- Production controls.
- Guest removal.
- Room closure.
- Workspace management.

Verify ownership and authorized host roles.

A guest invitation must never grant
administrative privileges.

=====================================================================
5. GUEST AUTHORIZATION
=====================================================================

Allow only the minimum guest operations
required by the existing Live Bridge.

Use the existing invitation-code lifecycle.

Requirements:

- Valid invitation required.
- Invitation scoped to one room.
- Invitation expiration enforced.
- Revocation enforced.
- No access to unrelated rooms.
- No access to host credentials.
- No administrative privileges.
- No unrestricted room enumeration.
- No exposure of private workspace data.

Use short-lived, room-scoped guest authorization
where the existing architecture supports it.

Do not treat possession of a room identifier
alone as sufficient authorization.

Do not weaken global authentication middleware.

=====================================================================
6. SIGNALING SECURITY
=====================================================================

Review:

- Offer/answer signaling.
- ICE candidate exchange.
- Guest presence.
- Waiting-room status.
- Admission state.
- Removal state.
- Session termination.

Ensure signaling access is scoped to the
authorized room and participant.

A guest who has been removed must not retain
active authorization.

Verify expired and revoked invitations fail.

Prevent unauthorized signaling injection.

Preserve the existing WebRTC implementation.

=====================================================================
7. LOCAL GATEWAY REVIEW
=====================================================================

Inspect:

/Users/toddknipple/Documents/StudioFlow/web/
server/room-server.mjs

Determine the role of:

GET /signals

and the existing SSE signaling mechanism.

Establish whether the missing fallback endpoint
is required by the current client.

Do not add an unnecessary fallback.

Do not modify the source gateway unless the
exact compatibility requirement is established.

Determine how the production Worker relay
replaces or supports the local gateway.

=====================================================================
8. REALTIMEKIT BOUNDARY
=====================================================================

Determine whether basic invite-code Live Bridge
joining depends on RealtimeKit.

Separate:

- Existing Live Bridge WebRTC signaling.
- RealtimeKit-backed managed rooms.
- Optional livestream functionality.

Do not make RealtimeKit mandatory for the
basic guest workflow unless the existing
implementation actually requires it.

Do not access production credentials.

=====================================================================
9. SECURITY REGRESSION TESTS
=====================================================================

Using disposable fixtures, verify:

- Authorized host can create invitations.
- Valid guest invitation is accepted.
- Invalid invitation is rejected.
- Expired invitation is rejected.
- Revoked invitation is rejected.
- Guest cannot administer rooms.
- Guest cannot enumerate rooms.
- Guest cannot access another room.
- Guest cannot obtain host tokens.
- Guest cannot access private workspaces.
- Guest removal revokes access.
- Session closure revokes access.
- Unauthorized signaling is rejected.

Test both successful and denied requests.

Do not claim physical WebRTC acceptance
without an actual two-participant session.

=====================================================================
10. SHARED BACKEND ISOLATION
=====================================================================

Review exact changes to:

functions/api/[[path]].js
worker.js
lib/auth.js

Apply only required Live Bridge security fixes.

Preserve unrelated website functionality.

Do not replace shared files wholesale.

Document all modified hunks.

=====================================================================
11. VERIFICATION
=====================================================================

Run:

- Live Bridge guest contracts.
- Authentication regression tests.
- Workspace ownership tests.
- StudioFlow focused regression suite.
- Worker routing tests.
- JavaScript syntax checks.
- git diff --check.

Report exact results.

=====================================================================
12. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-072-RESULT.md

Update:

- Directive index.
- Current development status.
- Creator Studio module record.

Document the final guest authorization model.

=====================================================================
13. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage.
- Commit.
- Push.
- Deploy.
- Apply production migrations.
- Access production D1 or R2.
- Use production credentials.
- Modify owner workspaces.
- Modify owner recordings.
- Modify protected browser storage.
- Weaken global authentication.
- Introduce unrelated features.
- Reorganize the Master Development Tree.

=====================================================================
14. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-072 RESULT

A. EXISTING LIVE BRIDGE FLOW
B. AUTHENTICATION ROOT CAUSE
C. HOST AUTHORIZATION
D. GUEST AUTHORIZATION
E. SIGNALING SECURITY
F. LOCAL GATEWAY COMPATIBILITY
G. REALTIMEKIT DEPENDENCY FINDINGS
H. SECURITY TEST RESULTS
I. EXACT FILE CHANGES
J. REMAINING RELEASE BLOCKERS
K. NEXT RECOMMENDED ACTION

Provide exactly one recommended next action.

=====================================================================
COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only if:

- Valid invited guests can use required
  Live Bridge endpoints.
- Host administration remains protected.
- Guest authorization is room-scoped.
- Expiration and revocation are enforced.
- Cross-room access is denied.
- Security regressions pass.
- No production resources are modified.

Otherwise report PARTIAL or BLOCKED.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-072
=====================================================================

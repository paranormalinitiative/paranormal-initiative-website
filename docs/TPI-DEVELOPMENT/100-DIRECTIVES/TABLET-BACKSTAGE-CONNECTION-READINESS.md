# TABLET BACKSTAGE CONNECTION READINESS INVESTIGATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:06.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-042
TABLET BACKSTAGE CONNECTION READINESS INVESTIGATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
HIGH

=====================================================================
1. OBJECTIVE
=====================================================================

Prepare StudioFlow for testing a real tablet connection
as a backstage guest.

The owner operates StudioFlow on a Mac and wants to connect
a tablet as a separate guest device.

The tablet should eventually:

1. Open a guest invitation.
2. Connect to the correct StudioFlow room.
3. Access its camera and microphone.
4. Appear backstage in StudioFlow.
5. Remain backstage until admitted to the stage.
6. Allow the owner to add or remove it from the stage.

This directive is INVESTIGATION FIRST.

Do not redesign the guest system.

=====================================================================
2. CURRENT CONDITIONS
=====================================================================

Local development Worker:

Port 8787

Room server:

Port 8788

Guest gateway:

Port 8789

TPI-040A reported that port 8788 was not listening.

Determine whether the room server is required for
the current guest connection workflow.

Do not assume a stopped room server is the only problem.

=====================================================================
3. PHASE ONE — INSPECT EXISTING ARCHITECTURE
=====================================================================

Identify:

- Local Worker.
- Room server.
- Guest gateway.
- Guest invitation generation.
- Room signaling.
- Camera and microphone permissions.
- Guest connection lifecycle.
- Backstage participant management.
- Stage admission controls.

Document how a guest device connects to StudioFlow.

Identify which services are required.

Do not change application code during this phase.

=====================================================================
4. PHASE TWO — VERIFY LOCAL SERVICES
=====================================================================

Check:

[ ] Worker on port 8787.
[ ] Room server on port 8788.
[ ] Guest gateway on port 8789.
[ ] Existing guest tunnel configuration.
[ ] Required signaling endpoints.
[ ] Required WebSocket connections.

Determine which services are running.

Determine which services are stopped.

Inspect startup commands and existing configuration.

Do not create duplicate processes.

Do not change the existing temporary guest tunnel.

=====================================================================
5. PHASE THREE — TABLET NETWORK ACCESS
=====================================================================

Determine how a tablet connected to the same Wi-Fi network
can access the local StudioFlow guest interface.

IMPORTANT:

The tablet cannot use the Mac's localhost address.

Localhost on the tablet refers to the tablet itself.

Investigate the existing guest gateway and LAN access
configuration.

Determine whether the guest interface requires:

- Mac LAN address.
- Existing guest gateway.
- Existing temporary tunnel.
- HTTPS for camera and microphone permissions.
- Additional browser compatibility handling.

Prefer existing infrastructure.

Do not create new Cloudflare resources.

Do not generate unnecessary Cloudflare traffic.

=====================================================================
6. PHASE FOUR — GUEST CONNECTION READINESS
=====================================================================

Verify the existing guest workflow supports:

1. Invitation generation.
2. Guest link opening.
3. Guest camera permission.
4. Guest microphone permission.
5. Room connection.
6. Backstage appearance.
7. Guest status updates.
8. Add to Stage.
9. Remove from Stage.
10. Guest disconnection.

Use synthetic testing where possible.

Do not modify the owner's Studio configuration.

=====================================================================
7. PHASE FIVE — IDENTIFY BLOCKERS
=====================================================================

Identify any blockers preventing tablet connection.

Examples:

- Room server not running.
- Guest gateway not running.
- Incorrect signaling URL.
- Browser security restrictions.
- Missing HTTPS.
- Incorrect room identifiers.
- WebSocket connection failure.
- Network isolation.
- Guest admission problems.

Distinguish confirmed defects from suspected problems.

Do not introduce speculative fixes.

=====================================================================
8. AUTHORIZED REPAIRS
=====================================================================

If an existing local service is stopped and its startup
procedure is verified safe, it may be started locally.

Before starting a service:

- Confirm the intended executable.
- Confirm the intended port.
- Confirm no conflicting process exists.
- Preserve existing configuration.
- Avoid duplicate processes.
- Avoid production endpoints.

Small, verified local-only corrections may be made when
necessary to restore existing guest functionality.

Do not redesign the signaling system.

Do not create new guest infrastructure.

Do not alter the existing temporary tunnel.

If a repair requires changing guest architecture, stop
and report the proposed change for owner approval.

=====================================================================
9. DATA PROTECTION
=====================================================================

PRESERVE:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify:

- Studio scenes.
- Backgrounds.
- Motion backgrounds.
- Intro/outro media.
- Recording references.
- Browser storage.
- Local D1.
- Owner credentials.
- Studio backup settings.

=====================================================================
10. TESTING
=====================================================================

Verify:

[ ] Existing Worker remains functional.
[ ] Required local room services respond.
[ ] Guest invitation generation works.
[ ] Guest signaling endpoints respond.
[ ] WebSocket connections work where applicable.
[ ] Guest session identifies the correct room.
[ ] Guest connection status updates.
[ ] Backstage guest handling remains functional.
[ ] Existing owner Studio remains unchanged.
[ ] No production Cloudflare traffic occurs.

Do not claim real tablet compatibility unless an actual
tablet connection is tested.

=====================================================================
11. RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO new Cloudflare resources.
NO local D1 reset.
NO browser storage clearing.
NO owner media deletion.
NO recording deletion.
NO authentication changes.
NO guest architecture rewrite.
NO temporary tunnel modification.
NO Git commit.
NO Git push.

Preserve existing working-tree changes.

=====================================================================
12. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-042 RESULT

STATUS:
READY / PARTIALLY READY / BLOCKED

A. ARCHITECTURE

Explain the current guest connection system.

B. LOCAL SERVICES

Report status of ports 8787, 8788, and 8789.

C. TABLET ACCESS

Explain how the tablet should connect.

D. GUEST WORKFLOW

Describe invitation, backstage connection,
and stage admission.

E. BLOCKERS

Identify confirmed issues.

F. REPAIRS

List any local-only repairs performed.

G. TEST RESULTS

Report verified results.

H. OWNER INSTRUCTIONS

Provide the exact steps required to connect a tablet
to the existing Crossroads Studio.

Do not invent a guest invitation URL.

I. DATA PROTECTION

Confirm existing owner Studio data remains unchanged.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-042
=====================================================================

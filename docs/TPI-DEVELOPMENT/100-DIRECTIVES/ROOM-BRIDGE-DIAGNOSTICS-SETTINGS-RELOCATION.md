# ROOM BRIDGE DIAGNOSTICS — SETTINGS RELOCATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:32.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-044
ROOM BRIDGE DIAGNOSTICS — SETTINGS RELOCATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
MEDIUM

=====================================================================
1. OBJECTIVE
=====================================================================

Remove the Room Bridge Fallback diagnostic display from
StudioFlow's main backstage interface.

Relocate the existing connection diagnostics into
StudioFlow Settings.

The owner does not want technical room connection
information permanently occupying space beside the camera.

IMPORTANT:

This directive concerns the DISPLAY of diagnostic information.

DO NOT remove or disable the underlying Room Bridge.

DO NOT modify guest connection functionality.

=====================================================================
2. INVESTIGATE CURRENT ROOM BRIDGE FUNCTIONALITY
=====================================================================

Before changing code, identify:

1. What the Room Bridge does.
2. What triggers the "Room bridge fallback" message.
3. Whether fallback is normal or indicates a problem.
4. How guest counts are calculated.
5. How signal counts are calculated.
6. Whether the indicator has interactive controls.
7. Whether any guest workflow depends on the visible component.

Document the findings.

Do not remove connection logic.

=====================================================================
3. REMOVE BACKSTAGE DIAGNOSTIC CARD
=====================================================================

Remove the visible Room Bridge status card from the
backstage control row.

DESIRED BACKSTAGE LAYOUT:

[ OWNER CAMERA ] [ PRESENT OR INVITE ]

Actual guest participant tiles must continue appearing
when guests connect.

Preserve:

- Owner camera.
- Owner name.
- Microphone controls.
- Add to Stage.
- Present or Invite.
- Guest participant tiles.
- Guest admission controls.

Do not remove any functional guest controls.

=====================================================================
4. ADD CONNECTION DIAGNOSTICS TO SETTINGS
=====================================================================

Inspect the existing StudioFlow Settings interface.

Reuse the existing settings layout and navigation.

Add a section named:

CONNECTIONS & DIAGNOSTICS

Display the existing available information:

- Room Bridge connection status.
- Fallback status.
- Connected guest count.
- Signaling activity or signal count.

Where available, also display relevant room connection
errors using existing state.

Do not invent connection metrics.

Do not introduce unnecessary network polling.

Reuse existing live status data and subscriptions.

=====================================================================
5. CONNECTION WARNINGS
=====================================================================

If an actionable guest connection problem occurs,
StudioFlow may display a small warning indicator near
the existing guest/invite controls.

REQUIREMENTS:

- No permanent diagnostic card backstage.
- No warning during normal operation.
- No warning based solely on an unverified fallback label.
- Do not obscure camera or stage controls.
- Do not introduce unnecessary notifications.

Warnings must reflect actual connection failures.

If reliable failure detection does not currently exist,
do not invent it.

Keep detailed information available in Settings.

=====================================================================
6. PRESERVE ROOM BRIDGE FUNCTIONALITY
=====================================================================

DO NOT MODIFY:

- Room signaling.
- Guest invitations.
- WebSocket connections.
- Guest admission.
- Guest disconnection.
- Guest counts.
- Signal counts.
- Camera or microphone handling.
- Stage controls.
- Room server.
- Guest gateway.

This is a UI relocation, not a guest system redesign.

=====================================================================
7. RESPONSIVE DESIGN
=====================================================================

Verify backstage displays correctly on:

- Desktop.
- Tablet.
- Mobile.

The owner camera and Present or Invite should appear
adjacent when sufficient space exists.

No empty space should remain where the Room Bridge
status card previously appeared.

Settings diagnostics must remain readable on narrow screens.

=====================================================================
8. DATA PROTECTION
=====================================================================

PRESERVE:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify:

- Studio configuration.
- Scenes.
- Backgrounds.
- Motion backgrounds.
- Intro/outro media.
- Recordings.
- Browser storage.
- IndexedDB.
- Local D1.
- Authentication.
- Backup settings.

=====================================================================
9. TESTING
=====================================================================

Verify:

[ ] Room Bridge status card is absent from backstage.
[ ] Owner camera remains functional.
[ ] Present or Invite remains functional.
[ ] Guest tiles continue appearing.
[ ] Add to Stage remains functional.
[ ] Connections & Diagnostics section appears in Settings.
[ ] Room connection status remains accurate.
[ ] Guest count remains accurate.
[ ] Signal count remains accurate.
[ ] Existing guest functionality remains unchanged.
[ ] Desktop layout remains correct.
[ ] Tablet layout remains correct.
[ ] Existing regression tests pass.

Use synthetic data for write-based tests.

Do not modify owner Studio data.

=====================================================================
10. RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO local D1 reset.
NO browser storage clearing.
NO media deletion.
NO recording deletion.
NO authentication changes.
NO room architecture changes.
NO guest gateway changes.
NO temporary tunnel changes.
NO Git commit.
NO Git push.

Preserve the existing working tree.

=====================================================================
11. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-044 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. ROOM BRIDGE PURPOSE

Explain exactly what Room Bridge Fallback means.

B. UI CHANGES

Confirm removal from backstage.

C. SETTINGS

Identify where diagnostics are now displayed.

D. FUNCTIONALITY

Confirm guest connection logic remains unchanged.

E. TESTING

Report actual test results.

F. DATA PROTECTION

Confirm Crossroads and existing data were preserved.

G. BROWSER VERIFICATION

Distinguish actual browser verification from
source-level testing.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The Room Bridge is infrastructure.

The owner does not need its technical diagnostics
permanently displayed in the backstage interface.

Move diagnostic information into StudioFlow Settings.

Keep backstage focused on cameras, guests,
presentations, and production controls.

Preserve all underlying Room Bridge functionality.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-044
=====================================================================

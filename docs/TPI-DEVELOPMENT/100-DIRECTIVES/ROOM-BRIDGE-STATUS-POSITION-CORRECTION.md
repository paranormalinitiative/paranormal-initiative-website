# ROOM BRIDGE STATUS POSITION CORRECTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:10.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-041A
ROOM BRIDGE STATUS POSITION CORRECTION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
LOW — UI POSITION CORRECTION

=====================================================================
1. OBJECTIVE
=====================================================================

Correct the positioning of the Room Bridge Fallback status
indicator in StudioFlow's backstage area.

TPI-STUDIOFLOW-041 moved the Room Bridge status indicator
inside the owner's camera-preview card.

This resulted in the indicator overlapping:

- The owner's video.
- The owner's displayed name.
- The Add to Stage button.

The owner has clarified the desired placement.

REQUIRED LAYOUT:

[ ROOM BRIDGE STATUS ] [ OWNER CAMERA ] [ PRESENT OR INVITE ]

The Room Bridge status must be positioned immediately to
the LEFT of the owner camera preview.

It must NOT overlap the camera preview.

=====================================================================
2. STATUS INDICATOR DESIGN
=====================================================================

Display the Room Bridge status as a compact, independent
status element.

Preserve the existing information:

- Room bridge connection state.
- Fallback state.
- Guest count.
- Signal count.

The indicator must:

1. Remain visible.
2. Remain readable.
3. Remain immediately left of the camera preview.
4. Not overlap any video content.
5. Not obstruct Add to Stage.
6. Not obstruct the owner's name.
7. Not interfere with camera controls.
8. Update when room connection status changes.

Do not convert the indicator into a participant tile.

Use existing StudioFlow colors and styling.

=====================================================================
3. BACKSTAGE LAYOUT
=====================================================================

DESKTOP:

[ Compact Room Status ] [ Owner Camera ] [ Present or Invite ]

Maintain appropriate spacing between elements.

The Room Bridge status should occupy substantially less
space than a participant camera tile.

Keep the owner camera and Present or Invite controls
at their existing dimensions.

Do not change the main stage layout.

=====================================================================
4. RESPONSIVE BEHAVIOR
=====================================================================

On narrower screens:

- Preserve readable status information.
- Avoid overlapping camera content.
- Avoid horizontal overflow.
- Allow the status element to wrap or reposition safely
  when insufficient width exists.

Do not cover camera controls at any viewport size.

=====================================================================
5. PRESERVE EXISTING FUNCTIONALITY
=====================================================================

Do not modify:

- Room bridge signaling.
- Guest connection logic.
- Guest count calculations.
- Signal count calculations.
- Participant management.
- Camera preview.
- Add to Stage.
- Present or Invite.
- Scene switching.
- Recording.
- Broadcasting.

This directive is a layout-only correction.

=====================================================================
6. OWNER DATA PROTECTION
=====================================================================

PRESERVE:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify Studio scenes, media, recordings,
browser storage, local D1, or Studio settings.

=====================================================================
7. TESTING
=====================================================================

Verify:

[ ] Room Bridge status appears left of owner camera.
[ ] Room Bridge status does not overlap camera.
[ ] Owner name remains readable.
[ ] Add to Stage remains unobstructed.
[ ] Present or Invite remains next to camera.
[ ] Status updates correctly.
[ ] Guest tiles remain functional.
[ ] Desktop layout remains correct.
[ ] Narrow layouts do not overlap.
[ ] Existing StudioFlow regression tests pass.

Perform actual browser verification where possible.

Do not claim browser verification if only source tests run.

=====================================================================
8. RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO database reset.
NO browser storage clearing.
NO owner media deletion.
NO Studio configuration changes.
NO room architecture changes.
NO guest gateway changes.
NO temporary tunnel changes.
NO Git commit.
NO Git push.

Preserve the existing working tree.

=====================================================================
9. REQUIRED REPORT
=====================================================================

TPI-STUDIOFLOW-041A RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

Report:

1. Files modified.
2. Exact new Room Bridge indicator placement.
3. Confirmation that camera overlap is eliminated.
4. Responsive layout behavior.
5. Test results.
6. Browser verification status.
7. Confirmation that Crossroads remains unchanged.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-041A
=====================================================================

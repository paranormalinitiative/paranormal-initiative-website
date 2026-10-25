# ROOM BRIDGE OVERLAP — RENDERING INVESTIGATION & REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:38.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-041B
ROOM BRIDGE OVERLAP — RENDERING INVESTIGATION & REPAIR
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
HIGH — REPEATED UI DEFECT

=====================================================================
1. OBJECTIVE
=====================================================================

Correct the persistent Room Bridge Fallback overlap in the
StudioFlow backstage area.

TPI-STUDIOFLOW-041 and TPI-STUDIOFLOW-041A both reported
successful source-level changes.

However, the owner has provided a new screenshot confirming
that Room Bridge Fallback STILL appears over the owner camera.

The defect remains unresolved.

DO NOT claim completion based only on source-code tests.

=====================================================================
2. CONFIRMED VISUAL DEFECT
=====================================================================

CURRENT OWNER SCREENSHOT:

The backstage area displays:

[ OWNER CAMERA ] [ PRESENT OR INVITE ]

However, the text "Room bridge fallback" is still visible
across the owner camera preview.

It overlaps the owner's name and Add to Stage area.

This is unacceptable.

DESIRED LAYOUT:

[ ROOM BRIDGE STATUS ] [ OWNER CAMERA ] [ PRESENT OR INVITE ]

All three elements must be separate.

The Room Bridge status must occupy its own compact,
independent layout element immediately LEFT of the owner camera.

It must not overlap the camera at any viewport size.

=====================================================================
3. INVESTIGATE WHY PREVIOUS REPAIRS FAILED
=====================================================================

Before changing code:

1. Inspect TPI-041 changes.
2. Inspect TPI-041A changes.
3. Inspect the current StudioFlow JavaScript bundle.
4. Inspect the current StudioFlow CSS bundle.
5. Identify every rendering location for the text:
   "Room bridge fallback"
6. Identify all room-status components.
7. Determine whether duplicate status indicators exist.
8. Determine whether the visible overlay comes from:
   - An old component.
   - A duplicate component.
   - A camera-card child element.
   - Absolute positioning.
   - A stale JavaScript bundle.
   - A stale CSS bundle.
   - Another backstage rendering path.

Do not assume the visible text belongs to the component
modified in TPI-041A.

Trace the actual rendered component.

=====================================================================
4. VERIFY SERVED ASSETS
=====================================================================

Inspect:

studio/index.html

studio/assets/index-j2x9m9vI.js

studio/assets/index-DXjilBOR.css

Confirm the local Worker serves the expected versions.

Check:

- Asset routing.
- Local cache-control headers.
- HTML asset references.
- Browser cache behavior.
- Any duplicate or obsolete asset files.

TPI-040A already introduced local no-store handling.

Verify that it is actually effective.

Do not repeatedly change caching behavior without evidence.

=====================================================================
5. IMPLEMENT CORRECT LAYOUT
=====================================================================

Create three separate backstage elements:

1. ROOM BRIDGE STATUS
2. OWNER CAMERA
3. PRESENT OR INVITE

REQUIRED ORDER:

ROOM BRIDGE STATUS
    |
    v
OWNER CAMERA
    |
    v
PRESENT OR INVITE

The elements should appear horizontally in that order
on desktop screens.

Room Bridge Status:

- Compact width.
- Independent container.
- No absolute positioning over camera.
- No nesting inside camera preview.
- Displays connection/fallback state.
- Displays guest count.
- Displays signal count.
- Updates dynamically.

Owner Camera:

- Existing video preview.
- Existing owner name.
- Existing microphone control.
- Existing Add to Stage button.
- No Room Bridge overlay.

Present or Invite:

- Preserve existing appearance and functionality.

Use existing StudioFlow design conventions.

=====================================================================
6. REMOVE DUPLICATE STATUS RENDERING
=====================================================================

If multiple Room Bridge status elements are discovered:

Determine which one is authoritative.

Keep one correct visible status component.

Remove only redundant visual rendering.

Do not remove room-status state management.

Do not remove signaling or guest-count logic.

Do not remove diagnostic information.

=====================================================================
7. RESPONSIVE LAYOUT
=====================================================================

Desktop:

[ ROOM STATUS ] [ CAMERA ] [ PRESENT OR INVITE ]

Tablet:

Allow safe wrapping if necessary.

Mobile:

Allow vertical stacking.

At no viewport size may the Room Bridge status
cover the camera, owner name, or Add to Stage button.

Avoid horizontal overflow.

=====================================================================
8. BROWSER VERIFICATION
=====================================================================

IMPORTANT:

The owner has already demonstrated that source-level
verification alone is insufficient.

Use actual browser inspection where available.

Verify:

1. The served application loads the modified assets.
2. Room Bridge status appears left of the camera.
3. No status text overlaps the camera.
4. The owner's name is readable.
5. Add to Stage remains unobstructed.
6. Present or Invite remains functional.

If authenticated Opera inspection is unavailable:

- Use a local isolated browser test harness.
- Render the actual backstage component and CSS.
- Capture a screenshot.
- Verify element bounding rectangles.
- Assert zero overlap between Room Bridge status and camera.

Do not modify the owner's browser session.

Do not clear browser storage.

Do not claim live Opera verification if it was not performed.

=====================================================================
9. REQUIRED AUTOMATED TESTS
=====================================================================

Verify:

[ ] Exactly one visible Room Bridge status component.
[ ] Room Bridge status is outside the camera container.
[ ] Room Bridge status is immediately left of camera.
[ ] Camera is immediately left of Present or Invite.
[ ] No absolute overlay positioning.
[ ] No element bounding-box overlap.
[ ] Owner name remains visible.
[ ] Add to Stage remains clickable.
[ ] Guest and signal counts remain functional.
[ ] Existing guest tiles remain functional.
[ ] Desktop layout works.
[ ] Tablet layout works.
[ ] Mobile layout works.
[ ] Existing StudioFlow regression tests pass.

Use synthetic data for write-based testing.

=====================================================================
10. OWNER DATA PROTECTION
=====================================================================

PRESERVE:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify:

- Scenes.
- Backgrounds.
- Motion backgrounds.
- Intro/outro media.
- Studio settings.
- Recordings.
- Browser storage.
- IndexedDB.
- Local D1.
- Authentication.

=====================================================================
11. MANDATORY RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO Cloudflare database changes.
NO local database reset.
NO browser storage clearing.
NO owner media deletion.
NO guest architecture changes.
NO room server architecture changes.
NO temporary tunnel changes.
NO Git commit.
NO Git push.

Preserve existing working-tree changes.

=====================================================================
12. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-041B RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. ROOT CAUSE

Explain why TPI-041 and TPI-041A did not resolve
the visible overlap.

B. COMPONENT IDENTIFICATION

Identify the exact component responsible for the
visible Room Bridge Fallback text.

C. REPAIR

List files changed and explain the correction.

D. ASSET VERIFICATION

Confirm the Worker serves the corrected files.

E. VISUAL VERIFICATION

Report actual browser or isolated rendering results.

F. TESTING

Provide test counts and results.

G. DATA PROTECTION

Confirm Crossroads and owner data were preserved.

H. OWNER VERIFICATION

Provide the exact existing local StudioFlow address
without tracking parameters.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner has supplied visual evidence that the overlap
still exists.

Do not make another speculative CSS adjustment.

Identify the exact element rendering over the camera.

Fix the actual cause.

Verify the rendered layout, not just the source code.

Do not declare COMPLETE unless visual rendering confirms
the Room Bridge status is separate from the camera.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-041B
=====================================================================

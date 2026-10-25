# ROOM BRIDGE STATUS BADGE REPOSITIONING

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 13:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-041
ROOM BRIDGE STATUS BADGE REPOSITIONING
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
LOW — USER INTERFACE IMPROVEMENT

=====================================================================
1. OBJECTIVE
=====================================================================

Reorganize the existing backstage controls beneath the
StudioFlow stage.

CURRENT LAYOUT:

[ Camera Preview ] [ Room Bridge Fallback ] [ Present or Invite ]

DESIRED LAYOUT:

[ Camera Preview ] [ Present or Invite ]

The Room Bridge Fallback status should become a small,
fixed indicator positioned within the camera preview area.

IMPORTANT:

This is a visual layout adjustment.

Do not modify guest connection architecture.

Do not modify room signaling.

Do not modify backstage participant management.

=====================================================================
2. ROOM BRIDGE STATUS INDICATOR
=====================================================================

Inspect the existing Room Bridge Fallback component.

Confirm its actual purpose and whether it represents:

- Guest connection count.
- Room bridge connection status.
- Fallback transport status.
- Any other diagnostic information.

Do not assume the component only displays guest count.

Preserve all meaningful existing status information.

If the component includes diagnostic controls or interactive
functions, preserve their accessibility.

=====================================================================
3. REQUIRED LAYOUT
=====================================================================

Move the existing Room Bridge Fallback indicator from its
standalone position.

Position a compact status badge within the camera preview.

PREFERRED POSITION:

Top-right corner of the camera preview.

The badge must:

- Remain visible.
- Remain readable.
- Not obstruct camera controls.
- Not interfere with Add to Stage.
- Not block camera preview interaction.
- Remain anchored during layout changes.
- Reflect live connection updates.

Use existing StudioFlow styling.

Do not introduce unnecessary animations.

=====================================================================
4. BACKSTAGE CONTROL ORDER
=====================================================================

After the adjustment, the visible backstage layout should be:

[ OWNER CAMERA ] [ PRESENT OR INVITE ]

Guest participant tiles should continue appearing in the
appropriate backstage area when guests connect.

Do not hide actual guest participant tiles.

Do not change participant ordering or stage admission logic.

Do not change how guests are added to or removed from stage.

=====================================================================
5. RESPONSIVE DESIGN
=====================================================================

Verify the layout works on:

- Desktop browsers.
- Safari.
- Chrome.
- Opera where testable.
- Tablet-sized screens.
- Narrow browser windows.

The badge must remain attached to the camera preview
rather than floating independently.

Avoid horizontal overflow.

=====================================================================
6. EXISTING FUNCTIONALITY
=====================================================================

Preserve:

- Camera preview.
- Microphone controls.
- Add to Stage.
- Present or Invite.
- Guest connection status.
- Guest participant tiles.
- Room bridge signaling.
- Guest admission.
- Scene switching.
- Broadcast controls.
- Recording functionality.

Do not modify room bridge fallback behavior.

=====================================================================
7. TESTING
=====================================================================

Verify:

[ ] Room Bridge status no longer occupies a standalone tile.
[ ] Status badge appears within the camera preview.
[ ] Status information remains accurate.
[ ] Badge updates when connection status changes.
[ ] Camera preview remains functional.
[ ] Add to Stage remains accessible.
[ ] Present or Invite remains accessible.
[ ] Guest tiles continue appearing backstage.
[ ] Desktop layout remains correct.
[ ] Tablet layout remains usable.
[ ] No guest signaling regressions.

Use synthetic connection states where possible.

Do not modify owner Studio data during testing.

=====================================================================
8. DATA PROTECTION
=====================================================================

Preserve Crossroads of the Unknown.

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify:

- Studio scenes.
- Media assets.
- Intro/outro.
- Backgrounds.
- Recordings.
- Studio settings.
- Browser storage.
- Local D1.

=====================================================================
9. RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO database reset.
NO browser storage clearing.
NO owner media deletion.
NO authentication changes.
NO room bridge architecture changes.
NO guest gateway changes.
NO temporary tunnel changes.
NO Git commit.
NO Git push.

Preserve the existing working tree.

=====================================================================
10. REQUIRED REPORT
=====================================================================

TPI-STUDIOFLOW-041 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

Report:

1. Files modified.
2. Confirmed purpose of Room Bridge Fallback.
3. New badge location.
4. Backstage layout changes.
5. Responsive behavior.
6. Tests performed.
7. Confirmation that existing guest functionality remains intact.
8. Confirmation that Crossroads of the Unknown was preserved.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-041
=====================================================================

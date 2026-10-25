# BACKSTAGE CLEANUP — REMOVE ROOM BRIDGE STATUS DISPLAY

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:36.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-044
BACKSTAGE CLEANUP — REMOVE ROOM BRIDGE STATUS DISPLAY
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PROJECT DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
MEDIUM

=====================================================================
1. OBJECTIVE
=====================================================================

Simplify StudioFlow's backstage interface.

The owner has determined that the Room Bridge Fallback
status indicator is unnecessary in the primary backstage
production area.

Remove the visible Room Bridge status element.

The backstage interface should begin with:

[ OWNER CAMERA ] [ PRESENT OR INVITE ]

When guests connect, their participant tiles should
appear in the existing backstage participant area.

IMPORTANT:

Remove the diagnostic DISPLAY only.

Do not disable the Room Bridge or any underlying
guest connection functionality.

=====================================================================
2. BACKSTAGE DESIGN
=====================================================================

REQUIRED DEFAULT LAYOUT:

[ OWNER CAMERA ] [ PRESENT OR INVITE ]

No Room Bridge status card.

No Room Bridge fallback badge.

No empty placeholder.

No reserved diagnostic column.

No diagnostic text over the owner's camera.

The owner camera and Present or Invite should sit
next to each other, aligned toward the left side
of the backstage area.

Maintain the existing dimensions and styling.

=====================================================================
3. GUEST ARRIVAL BEHAVIOR
=====================================================================

Preserve the existing guest participant workflow.

When a guest connects:

- Display the guest in the backstage participant area.
- Preserve the guest camera preview where available.
- Preserve guest identification.
- Preserve guest audio/video controls.
- Preserve the existing Add to Stage action.

Do not modify guest signaling or admission logic.

IMPORTANT:

Do not assume a guest is automatically live
or being recorded simply because they are connected.

Keep stage admission, recording, and broadcasting
as separate operations.

=====================================================================
4. ROOM BRIDGE FUNCTIONALITY
=====================================================================

Inspect the existing Room Bridge status implementation.

Determine whether its visible component contains
any functional controls or essential accessibility
information.

If the element is purely diagnostic:

Remove it from backstage.

Preserve the underlying status state, guest counts,
signal counts, and connection logic.

If the existing Settings interface already has a
suitable diagnostics area, the information may be
made available there without introducing new
infrastructure.

Do not create an elaborate diagnostics dashboard.

Do not add unnecessary controls.

Do not change guest connection architecture.

=====================================================================
5. BACKSTAGE RECORDING — INVESTIGATION ONLY
=====================================================================

The owner wants the ability to record conversations
between participants while they are backstage,
before starting the public broadcast.

This is an important future requirement.

For this directive:

INVESTIGATE ONLY.

Determine:

1. Whether StudioFlow currently records backstage audio.
2. Whether backstage guest audio is included.
3. Whether backstage recording can operate independently
   of public broadcasting.
4. Whether Add to Stage changes recording behavior.
5. Whether the existing recording controls can support
   private backstage recording.

Do not implement new recording functionality yet.

Do not automatically record guests.

Do not modify recording consent behavior.

Report the findings separately so the owner can
approve the appropriate recording workflow.

=====================================================================
6. PRESERVE EXISTING FUNCTIONALITY
=====================================================================

Do not modify:

- Owner camera.
- Microphone.
- Add to Stage.
- Present or Invite.
- Guest tiles.
- Guest invitations.
- Guest admission.
- Scene switching.
- Recording controls.
- Broadcast controls.
- Room signaling.
- Guest gateway.
- Room server.

=====================================================================
7. CACHE-BUSTING COMPATIBILITY
=====================================================================

TPI-STUDIOFLOW-043 implemented automatic local asset
staging and content-based versioning.

Ensure this directive's UI changes are detected by
the existing local asset watcher.

Verify that the locally served StudioFlow bundle
contains the updated backstage layout.

Do not introduce another cache-busting mechanism.

Do not manually hardcode a new version parameter.

Do not modify production caching.

=====================================================================
8. OWNER DATA PROTECTION
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

[ ] Room Bridge status is absent from backstage.
[ ] No diagnostic text overlaps the owner camera.
[ ] No empty diagnostic column remains.
[ ] Owner camera is positioned on the left.
[ ] Present or Invite appears next to owner camera.
[ ] Add to Stage remains functional.
[ ] Guest participant tiles remain functional.
[ ] Room Bridge connection logic remains intact.
[ ] Guest and signal state calculations remain intact.
[ ] Local asset watcher detects changes.
[ ] Updated assets are served with current versions.
[ ] Existing StudioFlow regression tests pass.
[ ] No owner Studio data changes occur.

Perform actual browser verification where possible.

Distinguish source-level tests from live Opera verification.

=====================================================================
10. RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO database reset.
NO browser storage clearing.
NO owner media deletion.
NO recording deletion.
NO automatic recording activation.
NO guest architecture changes.
NO room server changes.
NO temporary tunnel changes.
NO Git commit.
NO Git push.

Preserve all existing working-tree changes.

=====================================================================
11. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-044 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. BACKSTAGE LAYOUT

Confirm Room Bridge indicator removal.

B. GUEST FUNCTIONALITY

Confirm guest connections and participant tiles
remain unchanged.

C. CACHE-BUSTING

Confirm TPI-043 automatically stages and versions
the updated files.

D. BACKSTAGE RECORDING

Explain what StudioFlow currently supports and
what would be required to record private backstage
conversations independently of broadcasting.

E. FILES MODIFIED

List changed files.

F. TEST RESULTS

Report automated and browser verification separately.

G. DATA PROTECTION

Confirm Crossroads of the Unknown remains unchanged.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-044
=====================================================================

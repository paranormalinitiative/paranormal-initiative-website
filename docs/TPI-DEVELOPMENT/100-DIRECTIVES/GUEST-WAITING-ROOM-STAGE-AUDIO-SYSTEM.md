# GUEST WAITING ROOM & STAGE AUDIO SYSTEM

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:46.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-045
GUEST WAITING ROOM & STAGE AUDIO SYSTEM
FULL IMPLEMENTATION AUTHORITY
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PROJECT DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

IMPLEMENTATION AUTHORITY:
FULL — WITHIN THE DEFINED PROJECT SAFETY BOUNDARIES

=====================================================================
1. DEVELOPMENT AUTHORITY
=====================================================================

The project owner authorizes Codex to independently perform
the engineering work necessary to complete this directive.

Codex may:

- Investigate the existing application architecture.
- Inspect relevant source files.
- Modify application code.
- Refactor affected components.
- Correct related implementation defects.
- Create necessary supporting modules.
- Add or update automated tests.
- Run local development services.
- Restart existing local development services.
- Perform local browser testing.
- Perform isolated multi-browser testing.
- Implement appropriate error handling.
- Make technical implementation decisions.
- Resolve routine engineering issues without asking permission.

Codex should proceed autonomously through investigation,
implementation, testing, and correction.

DO NOT repeatedly stop for routine implementation approval.

The owner and ChatGPT are responsible for product direction,
design decisions, and intended user experience.

Codex is responsible for engineering execution.

IMPORTANT:

This authorization applies only to the work described
in this directive and its necessary supporting changes.

It does not authorize production deployment, destructive
operations, or changes to unrelated systems.

=====================================================================
2. OBJECTIVE
=====================================================================

Implement the intended StudioFlow guest waiting room
and stage audio workflow.

StudioFlow is modeled after the production experience
of StreamYard.

The owner wants a guest waiting area where guests can
follow the ongoing show without participating until
they are admitted to the stage.

The current implementation does not reliably provide
this behavior.

TPI-STUDIOFLOW-044A identified the following gaps:

1. No confirmed host-to-guest program audio return path.
2. Waiting guest microphones may enter the program mix.
3. Stage admission is not explicitly synchronized.
4. Removing guests disconnects them.
5. Waiting-room messaging does not match actual behavior.

Correct these issues.

=====================================================================
3. REQUIRED GUEST WAITING ROOM BEHAVIOR
=====================================================================

When a guest joins StudioFlow:

- Their camera appears in the backstage participant row.
- Their name is displayed.
- The owner can see that the guest has arrived.
- The guest remains outside the active stage.
- The guest receives the stage program audio.
- The guest can hear hosts speaking.
- The guest can hear admitted guests speaking.
- The guest can hear intro and outro playback.
- The guest can hear stage music and media audio.
- The guest cannot transmit microphone audio to the stage.
- The guest is not automatically added to the stage.
- The guest is not automatically included in recordings.
- The guest is not automatically included in broadcasts.

The waiting guest is a LISTENER.

They are not an active stage participant.

=====================================================================
4. WAITING GUEST MICROPHONE ISOLATION
=====================================================================

This is a critical requirement.

Waiting guest microphones must be excluded from:

- Stage program audio.
- Recording audio.
- Broadcast audio.
- Audio returned to other guests.

Do not rely exclusively on a visual mute button.

Enforce microphone isolation through the actual
audio routing and participant admission state.

Only admitted stage participants may contribute
microphone audio to the program mix.

A waiting guest must not be able to bypass this
restriction by toggling their microphone.

Test this behavior explicitly.

=====================================================================
5. PROGRAM AUDIO RETURN PATH
=====================================================================

Implement an appropriate host-to-guest audio return path.

Waiting guests must receive the stage program audio.

This includes:

- Host microphone.
- Admitted guest microphones.
- Intro audio.
- Outro audio.
- Stage media audio.

Use the existing StudioFlow media architecture wherever
possible.

Avoid unnecessary third-party services.

Avoid introducing paid infrastructure.

Prevent feedback loops and duplicated audio.

Ensure guest microphone audio is not returned to the
same guest in a way that causes echo.

Preserve existing microphone and speaker controls.

=====================================================================
6. ADD TO STAGE
=====================================================================

When the owner selects:

ADD TO STAGE

The guest transitions from:

WAITING

to:

ADMITTED

The guest becomes an active stage participant.

Required behavior:

- Guest video joins the stage layout.
- Guest microphone may enter the stage conversation.
- Guest receives the ongoing stage program audio.
- Admission state is synchronized with the guest.
- The guest interface reflects the admitted state.

Do not automatically start recording.

Do not automatically start broadcasting.

Admission and production state must remain independent.

=====================================================================
7. REMOVE FROM STAGE
=====================================================================

When the owner selects:

REMOVE FROM STAGE

The guest should return to the waiting room.

Do not disconnect the guest merely because they
are removed from the stage.

Required behavior:

- Guest is removed from the stage layout.
- Guest microphone is removed from the program mix.
- Guest remains connected to the room.
- Guest continues hearing stage program audio.
- Guest camera remains available in the waiting area.
- Guest can be admitted again later.

Preserve a separate explicit disconnect/remove-guest
action for cases where the owner intends to eject
the participant entirely.

Do not conflate stage removal with disconnection.

=====================================================================
8. RECORDING AND BROADCASTING
=====================================================================

Preserve independent recording and broadcasting controls.

Guest admission must not automatically trigger either.

Waiting guests must never be included as audio
contributors to a recording or broadcast.

Admitted guests may participate in the program mix
according to the existing production controls.

Do not automatically activate recording.

Do not change existing recording consent behavior.

Do not modify stored recordings.

=====================================================================
9. GUEST INTERFACE
=====================================================================

Update guest-facing status messaging to accurately
describe the current state.

WAITING:

"You are backstage. You can hear the show, but
the studio cannot hear you until you are added
to the stage."

ADMITTED:

"You are on stage."

REMOVED FROM STAGE:

"You have returned to the waiting area."

Ensure these messages reflect actual connection state.

Do not display misleading recording assurances.

Preserve existing guest camera and microphone controls.

=====================================================================
10. ROOM SERVER AND SIGNALING
=====================================================================

Investigate the existing room server on port 8788.

TPI-STUDIOFLOW-044A reported that this server was
not running during investigation.

Codex is authorized to:

- Inspect the room server.
- Identify its normal local startup mechanism.
- Start or restart the existing room server.
- Repair necessary local development configuration.
- Test guest signaling.
- Test admission synchronization.
- Test guest audio routing.

Do not create duplicate room servers.

Do not modify the temporary guest tunnel.

Do not modify production infrastructure.

Do not introduce unnecessary external dependencies.

=====================================================================
11. LOCAL CACHE-BUSTING
=====================================================================

TPI-STUDIOFLOW-043 implemented automatic local
asset staging and content-based versioning.

Preserve that implementation.

Ensure modified StudioFlow assets are automatically
restaged and served with updated versions.

Do not introduce another cache-busting system.

=====================================================================
12. MULTI-BROWSER TESTING
=====================================================================

Perform isolated local multi-browser testing.

Use synthetic test participants and disposable test rooms.

Test:

1. Guest joins waiting room.
2. Guest camera appears backstage.
3. Waiting guest hears host audio.
4. Waiting guest hears admitted guest audio.
5. Waiting guest hears intro/outro audio.
6. Waiting guest microphone is excluded from stage mix.
7. Guest is added to stage.
8. Guest microphone becomes available to stage.
9. Recording does not automatically start.
10. Broadcasting does not automatically start.
11. Guest is removed from stage.
12. Guest returns to waiting room.
13. Guest continues hearing stage audio.
14. Guest can be admitted again.
15. Explicit disconnect removes the guest.
16. Guest reconnection behaves correctly.

Test microphone isolation during rapid admission
and removal transitions.

Verify no audio feedback loops occur.

If physical audio-device testing is unavailable,
use synthetic media tracks where possible.

Clearly distinguish automated verification from
actual hardware/browser verification.

=====================================================================
13. DATA PROTECTION
=====================================================================

PRESERVE:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

DO NOT MODIFY:

- Owner Studio configuration.
- Scenes.
- Backgrounds.
- Motion backgrounds.
- Intro/outro media.
- Existing recordings.
- Browser IndexedDB.
- Local D1 data.
- Authentication credentials.
- Backup settings.

Do not clear browser storage.

Do not reset databases.

Do not delete owner media.

Use disposable test fixtures.

=====================================================================
14. HARD RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO production database changes.
NO destructive database operations.
NO browser storage clearing.
NO owner media deletion.
NO recording deletion.
NO temporary tunnel changes.
NO Git commit.
NO Git push.

Preserve the existing working tree.

Codex may proceed without additional permission
for all routine local engineering operations
within these boundaries.

If a required action falls outside these boundaries,
stop and report the specific blocker.

=====================================================================
15. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-045 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. ROOT CAUSE

Explain the original guest audio routing defects.

B. IMPLEMENTATION

Explain how waiting-room audio now works.

C. MICROPHONE ISOLATION

Explain how waiting guest microphones are excluded
from the program mix.

D. STAGE ADMISSION

Explain how admission state is synchronized.

E. STAGE REMOVAL

Confirm guests return to waiting rather than disconnect.

F. RECORDING AND BROADCASTING

Confirm independent production controls remain intact.

G. ROOM SERVER

Report the status of the local room server.

H. TESTING

Provide actual automated and browser test results.

I. FILES MODIFIED

List all changed files.

J. DATA PROTECTION

Confirm owner Studio data remains unchanged.

K. REMAINING LIMITATIONS

Identify anything that still requires physical
tablet or guest-device verification.

=====================================================================
FINAL INSTRUCTION
=====================================================================

Codex has full implementation authority within the
defined local development boundaries.

Investigate, implement, test, correct, and finish
the required guest waiting room functionality.

Do not stop for routine engineering approval.

The intended workflow is:

GUEST ARRIVES
      |
      v
WAITING ROOM
(HEARS STAGE, CANNOT SPEAK)
      |
      v
OWNER CLICKS ADD TO STAGE
      |
      v
ACTIVE STAGE PARTICIPANT
(CAN HEAR AND SPEAK)
      |
      v
OWNER CLICKS REMOVE FROM STAGE
      |
      v
RETURNS TO WAITING ROOM
(HEARS STAGE, CANNOT SPEAK)

Recording and broadcasting remain independently
controlled throughout.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-045
=====================================================================

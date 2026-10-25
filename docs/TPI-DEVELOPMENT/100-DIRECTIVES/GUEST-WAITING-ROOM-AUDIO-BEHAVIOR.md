# GUEST WAITING ROOM — AUDIO BEHAVIOR INVESTIGATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-21 22:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-044A
GUEST WAITING ROOM — AUDIO BEHAVIOR INVESTIGATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

OBJECTIVE:

Investigate and document the existing guest waiting room
audio behavior.

DO NOT modify the guest connection system.

=====================================================================
1. EXPECTED OWNER WORKFLOW
=====================================================================

GUEST WAITING AREA:

When a guest connects:

- Their camera appears in the backstage participant row.
- They remain outside the active stage.
- They can hear the complete stage program audio.
- They can hear hosts and admitted guests.
- They can hear intro/outro audio when played on stage.
- They can hear music and other stage playback.
- Their microphone must not be transmitted to the stage.
- They cannot speak to stage participants.
- They remain in the waiting area until admitted.

STAGE ADMISSION:

When the owner clicks Add to Stage:

- The guest becomes an active stage participant.
- Their microphone can participate in the conversation.
- Their camera can participate in the stage layout.
- Recording does not automatically begin.
- Broadcasting does not automatically begin.

STAGE REMOVAL:

Investigate what happens when a guest is removed from
the stage.

Determine whether they return to listen-only waiting
status or are disconnected.

=====================================================================
2. INVESTIGATE CURRENT IMPLEMENTATION
=====================================================================

Trace the existing guest audio and video architecture.

Determine:

1. Whether waiting guests currently receive stage audio.
2. Whether waiting guests receive host microphone audio.
3. Whether waiting guests receive admitted guest audio.
4. Whether intro/outro audio reaches waiting guests.
5. Whether music and other media audio reaches waiting guests.
6. Whether waiting guest microphones are isolated.
7. Whether Add to Stage changes audio routing.
8. Whether Remove from Stage restores listen-only behavior.
9. Whether stage audio is available before broadcasting.
10. Whether any audio routing depends on recording state.

Identify the actual code paths responsible.

Do not assume the desired behavior already exists.

=====================================================================
3. AUDIO SAFETY
=====================================================================

Verify that waiting guests cannot accidentally transmit
microphone audio into the stage conversation.

Determine whether isolation is enforced through:

- Audio routing.
- Track subscriptions.
- Publication permissions.
- Participant admission state.
- Client-side muting.

Report the actual mechanism.

Do not modify it during this investigation.

=====================================================================
4. TESTING
=====================================================================

Use isolated local test fixtures where possible.

Verify existing behavior without altering owner data.

Do not activate live broadcasting.

Do not modify the temporary guest tunnel.

Do not clear browser storage.

Do not modify Crossroads of the Unknown.

Do not change room server or gateway configuration.

=====================================================================
5. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-044A RESULT

STATUS:
INVESTIGATION COMPLETE / PARTIAL / BLOCKED

A. WAITING ROOM AUDIO

Can waiting guests currently hear the stage?

B. MICROPHONE ISOLATION

Can waiting guests transmit audio to the stage?

C. MEDIA PLAYBACK

Can waiting guests hear intro/outro and music?

D. STAGE ADMISSION

What changes when Add to Stage is clicked?

E. STAGE REMOVAL

What happens when a participant leaves the stage?

F. RECORDING AND BROADCASTING

Does either state affect guest audio routing?

G. GAPS

Identify any differences between current behavior
and the owner's desired workflow.

H. RECOMMENDATIONS

Recommend the smallest changes needed, if any.

DO NOT IMPLEMENT CHANGES.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-044A
=====================================================================

# TPI-STUDIOFLOW-028 — Addendum A: Preserve After Intro Background Music

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 20:43.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-028 — ADDENDUM A
## PRESERVE ORIGINAL AFTER INTRO BACKGROUND MUSIC FUNCTIONALITY

**Priority:** CRITICAL  
**Applies to:** TPI-STUDIOFLOW-028  
**Original Implementation:** Codex 5.6 / Sol

### MANDATORY INSTRUCTIONS

Before modifying the implementation, read and follow:

`AGENTS.md`

`docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

### 1. IMPORTANT CLARIFICATION

Sol previously implemented **After Intro Background Music** as part of StudioFlow's production workflow.

**THIS FUNCTIONALITY MUST BE PRESERVED.**

It must not be deleted, disconnected, replaced, or unintentionally altered while repairing the Intro/Outro scene controls.

### 2. REQUIRED FUNCTIONALITY

StudioFlow must preserve three distinct production controls:

**INTRO VIDEO**
- Uses the assigned Intro Video from Video Clips.
- Starts at 00:00.
- Stops on a second click.
- Restores the appropriate scene when playback ends or is stopped.

**AFTER INTRO BACKGROUND MUSIC**
- Retains the original functionality implemented by Sol.
- Uses its intended music assignment from the Background Music section.
- Must remain independently configurable and controllable.
- Must not share the Intro Video playback handler or scene identifier.
- Must not accidentally start, stop, or restart the Intro Video.

**OUTRO VIDEO**
- Uses the assigned Outro Video from Video Clips.
- Starts at 00:00.
- Stops on a second click.
- Restores the appropriate scene when playback ends or is stopped.

### 3. PRESERVE SOL'S ORIGINAL IMPLEMENTATION

Before making changes:

1. Locate Sol's original After Intro Background Music implementation.
2. Review the historical directives and Git commits associated with it.
3. Identify its original activation and playback behavior.
4. Preserve its existing music assignments, settings, and routing.
5. Verify that the Intro Video and After Intro Background Music controls operate according to their original intended workflow.

**Do not assume that After Intro Background Music must automatically start when the Intro Video finishes.**

Determine whether automatic activation was part of Sol's approved implementation.

If it was, preserve it.

If it was not, do not introduce it.

### 4. INDEPENDENT CONTROLS

The Intro Video and After Intro Background Music controls must remain separate.

They may participate in an established production sequence, but their underlying controls, media assignments, and playback states must not be accidentally coupled.

Correct the reported issue where clicking one appears to activate the other.

Do not eliminate an intentional transition while removing an unintended connection.

### 5. BACKGROUND MUSIC SOURCE

After Intro Background Music must use the existing Background Music media system.

Preserve:

- Assigned music track.
- Existing playback controls.
- Volume configuration.
- Looping behavior.
- Program audio routing.
- Monitoring audio routing.
- Studio-specific persistence.

Do not create duplicate media players or asset records.

### 6. REQUIRED TESTING

Verify:

1. Intro Video plays independently.
2. After Intro Background Music retains Sol's original functionality.
3. Intro Video does not unintentionally trigger After Intro Background Music.
4. After Intro Background Music does not unintentionally restart Intro Video.
5. Any originally approved automatic transition still works.
6. Outro Video operates independently.
7. All assigned media comes from the correct media sections.
8. Studio switching preserves the correct assignments.
9. Existing audio routing and playback controls remain functional.
10. No regression is introduced into recording, livestreaming, or guest connections.

### 7. FINAL REQUIREMENT

**Do not remove After Intro Background Music.**

**Do not redesign it.**

**Do not replace it with a generic scene.**

Recover and preserve the original implementation created by Sol.

This is an existing approved StudioFlow feature.

**END ADDENDUM A**

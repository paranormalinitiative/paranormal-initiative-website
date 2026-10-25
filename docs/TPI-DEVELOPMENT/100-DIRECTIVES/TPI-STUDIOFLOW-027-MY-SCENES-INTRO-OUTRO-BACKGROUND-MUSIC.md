# TPI-STUDIOFLOW-027 — MY SCENES — INTRO, OUTRO & BACKGROUND MUSIC CONNECTION REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 14:48.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-027-SCENE-MEDIA-CONNECTION-REPAIR.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-027-SCENE-MEDIA-CONNECTION-REPAIR.md), [2026-10-22-STUDIOFLOW-INTRO-OUTRO-PREVIEW-REPAIR-RESULT.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-INTRO-OUTRO-PREVIEW-REPAIR-RESULT.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-027
## MY SCENES — INTRO, OUTRO & BACKGROUND MUSIC CONNECTION REPAIR

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** HIGH  
**Environment:** Production-targeted maintenance  
**Scope:** My Scenes panel — existing media connections

### MANDATORY AGENT INSTRUCTIONS

Before making any changes:

1. Read and follow `AGENTS.md` located at:

   `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

2. Read and follow:

   `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

3. Follow all additional mandatory instructions referenced by those documents.

4. Verify the correct StudioFlow source repository, development environment, and production deployment procedure.

These documents govern this directive.

### 1. OBJECTIVE

Repair the existing **My Scenes** panel on the left side of StudioFlow.

The following scene controls must connect to their corresponding existing media assignments:

- **Intro Video → Intro Video**
- **Outro Video → Outro Video**
- **Background Music → Background Music**

These connections previously existed but are no longer behaving as intended.

Restore the intended behavior without redesigning the panel or introducing a replacement media system.

### 2. INVESTIGATE EXISTING CONNECTIONS

Inspect the current My Scenes implementation.

Identify how the three scene controls currently resolve their media sources.

Trace each control through:

- Current studio selection.
- Saved studio configuration.
- Media asset assignments.
- Scene configuration.
- Playback handlers.
- Program output.
- Audio routing, where applicable.

Determine why the controls no longer connect to their intended assets.

Use the existing StudioFlow architecture.

Do not create duplicate asset records or parallel storage mechanisms.

### 3. INTRO VIDEO

The **Intro Video** scene must use the Intro Video asset assigned to the currently selected studio.

Verify that selecting or activating the scene uses the correct existing asset and follows the established scene playback behavior.

Do not substitute another video or unrelated media asset.

If no Intro Video has been assigned, show an appropriate empty-state message rather than playing an incorrect asset.

### 4. OUTRO VIDEO

The **Outro Video** scene must use the Outro Video asset assigned to the currently selected studio.

Verify correct asset resolution and scene playback behavior.

Do not substitute the Intro Video or another media asset.

If no Outro Video has been assigned, handle the missing assignment appropriately.

### 5. BACKGROUND MUSIC

The **Background Music** scene must use the Background Music asset assigned to the currently selected studio.

Preserve existing playback, volume, and audio-routing behavior.

Ensure the music follows the established StudioFlow program and monitoring buses.

Prevent duplicate playback or unintended audio feedback.

### 6. STUDIO-SPECIFIC MEDIA

StudioFlow supports multiple studios.

The scene controls must resolve media assignments for the **currently active studio**.

Switching studios must not cause Intro Video, Outro Video, or Background Music to reference assets belonging to another studio.

Preserve existing studio switching, automatic saving, and restoration behavior.

### 7. STRICT SCOPE CONTROL

This is a targeted maintenance repair.

Do not modify:

- Voice FX.
- OpenVoiceChanger.
- Podcast recording.
- WebRTC participant routing.
- SMART Pads.
- Studio branding.
- Studio creation.
- Existing media uploads.
- Unrelated scene controls.
- Other StudioFlow functionality.

Only modify shared components when necessary to correct the three identified connections.

### 8. VALIDATION

Verify:

1. Intro Video resolves the correct assigned asset.
2. Outro Video resolves the correct assigned asset.
3. Background Music resolves the correct assigned asset.
4. All three work with the currently active studio.
5. Missing assignments are handled safely.
6. Switching studios does not mix media assignments.
7. Existing playback behavior is preserved.
8. Existing audio routing is preserved.
9. No duplicate media records are created.
10. Unrelated StudioFlow functionality remains unchanged.

Run all mandatory checks required by `AGENTS.md` and the StudioFlow Source-to-Live Workflow.

### 9. PRODUCTION SAFETY

This directive concerns the live production site.

However, production changes must follow the mandatory source-to-live workflow.

Do not edit production files directly.

Do not modify production databases or media storage unnecessarily.

Do not overwrite existing user content.

Prepare and validate the repair through the approved development process.

**Do not deploy until the required workflow checks and deployment authorization are satisfied.**

### 10. COMPLETION REPORT

Provide:

- Root cause of each broken connection.
- Files modified.
- Existing media assignment mechanism used.
- Validation results.
- Studio-switching verification.
- Source commit.
- Deployment readiness.
- Production deployment status.

**END DIRECTIVE — TPI-STUDIOFLOW-027**

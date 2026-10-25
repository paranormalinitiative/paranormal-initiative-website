# TPI-STUDIOFLOW-028 — My Scenes Independent Media Shortcut Repair

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 15:14.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-028
## MY SCENES — INDEPENDENT MEDIA SHORTCUT & PLAYBACK REPAIR

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** HIGH  
**Environment:** Production Maintenance  
**Previous Directive:** TPI-STUDIOFLOW-027  
**Status:** AUTHORIZED FOR LOCAL REPAIR AND VALIDATION

### 1. MANDATORY AGENT INSTRUCTIONS

Before beginning:

Read and follow:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

Then read:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Follow all additional mandatory instructions referenced by these documents.

These instructions take precedence over this directive.

### 2. PROBLEM DESCRIPTION

Directive 027 successfully repaired authenticated media URL resolution and was deployed.

However, the **My Scenes** panel still does not behave correctly.

The problem is not simply whether the media file can be retrieved.

The problem is how the scene controls are connected to their corresponding media sections and playback actions.

The user reports that clicking **Intro Video** and **After Intro** appears to activate connected or shared behavior.

These controls must operate independently.

### 3. REQUIRED SCENE CONNECTIONS

The My Scenes panel must act as a set of shortcuts to the corresponding media and production actions.

| My Scenes Control | Required Connection |
|---|---|
| Intro Video | Intro video assigned in Video Clips |
| After Intro | Its own assigned post-intro scene/action |
| Outro Video | Outro video assigned in Video Clips |
| Background Music | Assigned track in Background Music |
| Other existing scene controls | Their corresponding existing scene/action assignments |

**Important:** After Intro must not automatically be treated as Intro Video or Background Music.

Inspect its intended existing behavior and preserve its independent assignment.

Do not infer a shared media source from similar naming.

### 4. INTRO VIDEO

Clicking Intro Video in My Scenes must activate the assigned Intro Video from the Video Clips section.

Requirements:

- Resolve the currently selected studio.
- Identify its assigned Intro Video.
- Use the existing Video Clips playback mechanism.
- Display/play the correct video in the established program output.
- Preserve existing playback controls.
- Do not activate After Intro.
- Do not trigger unrelated media.

The Intro Video scene must not maintain an unnecessary duplicate media player or asset assignment.

### 5. OUTRO VIDEO

Clicking Outro Video in My Scenes must activate the assigned Outro Video from the Video Clips section.

Requirements:

- Use the correct studio-specific Outro Video.
- Reuse the existing Video Clips playback mechanism.
- Preserve established program output behavior.
- Do not activate Intro Video.
- Do not activate After Intro.
- Do not substitute another clip.

### 6. AFTER INTRO — INDEPENDENT CONTROL

Investigate the existing After Intro scene.

Determine its original purpose, media assignment, and playback behavior.

Inspect whether it shares:

- An event handler.
- A scene identifier.
- A media identifier.
- A state variable.
- A playback callback.
- A persistence key.
- A default assignment.

With Intro Video.

If so, correct the unintended coupling.

**Clicking Intro Video must not activate After Intro.**

**Clicking After Intro must not activate Intro Video.**

Do not introduce automatic transitions between these scenes unless an existing, explicitly configured transition requires them.

### 7. BACKGROUND MUSIC

Clicking Background Music in My Scenes must activate the corresponding assigned track from the Background Music section.

Requirements:

- Use the current studio's assigned background music.
- Reuse the existing background music playback system.
- Preserve volume controls.
- Preserve looping behavior.
- Preserve program and monitor audio routing.
- Prevent duplicate playback.
- Do not activate Intro Video or After Intro.

Do not create a separate music playback system for My Scenes.

### 8. SINGLE SOURCE OF TRUTH

The media sections must remain the authoritative source for their corresponding media assignments.

**Video Clips**

Owns the Intro Video and Outro Video media assignments.

**Background Music**

Owns the background music assignment.

**My Scenes**

Provides the appropriate shortcuts and scene activation controls.

My Scenes must not create competing media assignments or duplicate playback engines.

Preserve the authenticated media resolution implemented under Directive 027.

### 9. INDEPENDENT SCENE IDENTIFIERS

Inspect all My Scenes identifiers and event handlers.

Ensure that each scene has a unique, stable identity.

Avoid:

- Shared identifiers.
- Accidental event propagation.
- Incorrect array indexes.
- Shared selection state.
- Incorrectly reused callbacks.
- Stale media references.
- Cross-studio assignments.

Selecting one scene must not unintentionally select another.

### 10. STUDIO SWITCHING

All scene shortcuts must respect the currently active studio.

Verify:

- Intro Video uses the active studio's assigned intro.
- Outro Video uses the active studio's assigned outro.
- Background Music uses the active studio's assigned music.
- After Intro retains its own independent configuration.
- Switching studios does not reuse another studio's media.
- Saved scene assignments restore correctly.

Do not modify unrelated studio-switching functionality.

### 11. REQUIRED INTERACTION TESTS

Perform actual click-based browser tests.

**Test A — Intro Video**

Click Intro Video.

Confirm that the correct video from Video Clips plays.

Confirm that After Intro does not activate.

**Test B — Outro Video**

Click Outro Video.

Confirm that the correct outro from Video Clips plays.

Confirm that Intro Video and After Intro remain inactive.

**Test C — After Intro**

Click After Intro.

Confirm that its own intended scene/action activates.

Confirm that Intro Video does not play.

**Test D — Background Music**

Click Background Music.

Confirm that the assigned track from Background Music plays.

Confirm that no duplicate audio occurs.

**Test E — Repeated Switching**

Activate Intro Video, After Intro, Outro Video, and Background Music in different sequences.

Verify independent behavior and correct playback state.

**Test F — Studio Switching**

Repeat the tests using two studios with different media assignments.

**Test G — Persistence**

Reload StudioFlow and verify correct assignment restoration.

**Test H — Regression**

Verify that Video Clips and Background Music still work independently of My Scenes.

### 12. STRICT SCOPE CONTROL

This is a targeted repair.

Do not modify:

- Voice FX.
- OpenVoiceChanger.
- WebRTC.
- Podcast recording.
- SMART Pads.
- Studio branding.
- Unrelated media systems.
- Existing user assets.
- Unrelated scenes.

Do not redesign the My Scenes interface.

Repair the existing connections and event behavior.

### 13. PRODUCTION SAFETY

Follow the mandatory StudioFlow Source-to-Live Workflow.

Do not directly edit production files.

Do not modify production D1 or R2 data unless separately authorized.

Do not delete or overwrite existing media assets.

Complete local validation and required release checks before deployment.

**Deployment must follow the authorization and safeguards required by AGENTS.md and the source-to-live workflow. Do not treat this directive as permission to bypass those gates.**

### 14. REQUIRED COMPLETION REPORT

Provide:

1. Root cause of incorrect scene connections.
2. Root cause of Intro Video / After Intro coupling.
3. Corrected scene-to-media mappings.
4. Files modified.
5. Scene identifier and event-handler changes.
6. Browser interaction test results.
7. Studio-switching verification.
8. Persistence verification.
9. Regression test results.
10. Source commit.
11. Deployment commit, if authorized.
12. Production status.
13. Rollback reference, if deployed.

### 15. FINAL ACCEPTANCE

The My Scenes panel must function as a reliable set of independent production shortcuts.

**Intro Video → Assigned Intro Video in Video Clips**

**Outro Video → Assigned Outro Video in Video Clips**

**Background Music → Assigned Background Music**

**After Intro → Its own independent scene/action**

No unintended shared activation.

No duplicate playback systems.

No cross-studio media confusion.

Preserve the media-resolution improvements from Directive 027.

**END DIRECTIVE — TPI-STUDIOFLOW-028**

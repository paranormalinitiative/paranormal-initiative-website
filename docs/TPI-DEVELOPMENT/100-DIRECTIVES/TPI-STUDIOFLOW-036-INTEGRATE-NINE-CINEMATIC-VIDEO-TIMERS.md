# TPI-STUDIOFLOW-036 — Integrate Nine Cinematic Video Timers

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 20:21.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-036
## NINE CINEMATIC VIDEO TIMERS — STUDIOFLOW INTEGRATION

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** High  
**Assigned Agent:** NiMo 2.6 Pro / GPT-5.6 Luna  
**Objective:** Integrate the approved Spectacular Cinematic Timer collection into StudioFlow.

---

## 1. MANDATORY GOVERNING DOCUMENTS

Before performing any investigation or development, read these two files in their entirety:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents govern development, testing, documentation, deployment, and release procedures.

Read the relevant StudioFlow architecture, workspace configuration, playback, testing, and historical directive records.

Do not bypass existing release safeguards.

---

## 2. PRIMARY OBJECTIVE

Integrate the nine approved animated countdown timers from:

**StudioFlow_Video_Timers_Spectacular.html**

This is the owner-approved visual reference and implementation source.

Locate the HTML file provided by the owner. If it is not accessible in the development workspace, request the file before implementing the animations.

**Do not substitute newly invented timer designs.**

The owner has reviewed and approved the Spectacular Cinematic Edition.

StudioFlow must display all nine countdown timers in the existing **Video Timers** section.

The layout must contain:

**THREE COLUMNS × THREE ROWS**

All nine timers must be individually selectable and fully functional.

---

## 3. APPROVED TIMER COLLECTION

Integrate these nine timers:

1. Classic Countdown — existing orange circular countdown.
2. Stargate Portal — animated science-fiction portal.
3. Alien Transmission — extraterrestrial transmission interface.
4. Haunted Clock — supernatural antique clock.
5. Spirit Manifestation — animated spectral apparition.
6. EVP Signal — electronic voice phenomena waveform and spectrogram.
7. ITC Communication — electronic communication and scanning interface.
8. Paranormal Energy Vortex — animated dimensional energy field.
9. Ghostly Countdown — atmospheric supernatural landscape.

The eight additional designs must retain the visual identity, animation details, and effects from the approved HTML prototype.

**Preserve the existing production Classic Countdown implementation.** The prototype's Classic Countdown may be used as a visual reference, but it must not silently replace or regress the current production timer.

---

## 4. VIDEO TIMER INTERFACE

Within the existing Video Timers section:

- Display nine timer preview cards.
- Arrange cards in three columns and three rows on desktop.
- Maintain consistent card dimensions and spacing.
- Show each timer's name.
- Provide a clear selected state.
- Preserve the existing StudioFlow visual styling.
- Allow responsive adjustment on smaller screens without clipping or horizontal overflow.

The existing timer section must not be relocated or redesigned unnecessarily.

### Required layout

| | | |
|---|---|---|
| Classic Countdown | Stargate Portal | Alien Transmission |
| Haunted Clock | Spirit Manifestation | EVP Signal |
| ITC Communication | Energy Vortex | Ghostly Countdown |

Preview cards should visually represent their respective animations.

Where practical, provide lightweight animated previews without creating nine unnecessarily expensive rendering loops.

---

## 5. COUNTDOWN DURATION OPTIONS

Preserve the existing countdown durations:

**10 seconds — 20 seconds — 30 seconds — 60 seconds**

Every timer must support all four durations.

Selecting a different animation must not unexpectedly change the selected duration.

Changing the duration must not unexpectedly change the selected animation.

Do not create nine independent countdown engines.

Reuse the existing StudioFlow timer functionality wherever possible.

---

## 6. ANIMATION AND BROADCAST INTEGRATION

The animations must function as genuine StudioFlow video timers.

They must not be decorative HTML demonstrations disconnected from the actual production system.

Verify that the selected countdown:

1. Can be previewed.
2. Starts at the selected duration.
3. Counts down accurately.
4. Displays the correct animation.
5. Reaches zero correctly.
6. Performs its intended completion effect.
7. Can be restarted.
8. Integrates with the existing StudioFlow video/program output.
9. Appears correctly in supported recordings and livestreams when selected for program output.

Preserve existing transition and playback behavior.

Do not introduce unexpected automatic scene changes or broadcast actions.

Any existing timer-completion behavior must remain intact unless the owner explicitly approves a change.

---

## 7. AUDIO REQUIREMENTS

**ALL NINE TIMERS MUST BE SILENT.**

Do not introduce:

- Background music.
- Sound effects.
- Audio tracks.
- Automatic audio playback.
- Audio generation services.

The owner will use StudioFlow's existing music and sound-effects systems independently.

Do not modify the existing Intro, Outro, Background Music, or Sound Effects functionality.

---

## 8. PERFORMANCE REQUIREMENTS

The animations must be visually impressive without compromising production stability.

Requirements:

- Smooth animation on supported desktop browsers.
- Correct behavior at different viewport sizes.
- No unnecessary network requests.
- No external animation subscriptions.
- No remote dependencies for timer rendering.
- No uncontrolled animation loops.
- No DOM mutation storms.
- No accumulating timers or animation frames.
- Proper cleanup when switching animations or closing the panel.
- Reduced-motion accessibility support where appropriate.

Prefer reusing the approved HTML/CSS/JavaScript animation logic and adapting it to StudioFlow's existing architecture.

Do not introduce an unrelated rendering framework without justification.

---

## 9. WORKSPACE PERSISTENCE

Investigate the existing Video Timers configuration.

Ensure that each Studio can preserve its selected timer design and countdown duration using the established workspace persistence mechanism.

Requirements:

- Selection survives refresh.
- Selection survives switching between Studios.
- Each Studio maintains its own configuration.
- No cross-Studio configuration leakage.
- No unnecessary save requests.
- No regression to workspace autosaving.

Use the established StudioFlow workspace bridge and API contracts.

Do not create competing browser-only persistence mechanisms.

---

## 10. REGRESSION PROTECTION

Preserve all functionality completed through TPI-STUDIOFLOW-035.

Pay particular attention to:

- Studio selection and switching.
- Workspace persistence.
- Intro/Outro playback.
- Background Music.
- Sound Effects.
- Video clip configuration.
- Production orientation.
- Recording and Storage.
- Existing timer behavior.
- Program video output.
- DOM mutation stability.

Do not modify unrelated production systems.

---

## 11. TESTING AND VERIFICATION

Create or extend maintained regression tests covering:

**Timer inventory**
- Exactly nine approved designs are available.
- Correct names and ordering.
- Desktop grid displays three columns and three rows.

**Timer operation**
- All nine animations can be selected.
- All four durations work for every animation.
- Countdown reaches zero accurately.
- Restart behavior works.
- Timer switching does not create overlapping loops.

**Production integration**
- Selected timer appears in the intended program output.
- Timer remains synchronized with its countdown.
- Recording and livestream paths are not broken.
- No unintended audio is introduced.

**Persistence**
- Selected timer and duration survive refresh.
- Studio switching restores the correct selections.
- No configuration leakage between Studios.

**Performance**
- No self-sustaining DOM mutation loops.
- No runaway CPU usage.
- No accumulating animation frames.
- No unnecessary network polling.

Run relevant existing regression suites, including the safeguards established by Directives 028–035.

Use synthetic or disposable test data.

Do not overwrite the owner's actual Studio configurations.

---

## 12. PRODUCTION SAFETY

Follow the governing source-to-live workflow.

Before deployment:

1. Establish the repository and deployment baseline.
2. Inspect current uncommitted work.
3. Verify that the approved HTML prototype is available.
4. Implement in the canonical source.
5. Build and stage the application.
6. Run local regression tests.
7. Complete browser verification.
8. Review the exact release diff.
9. Confirm the rollback version.
10. Deploy only after all release gates pass.

Do not modify production D1 records, R2 objects, owner recordings, backups, or unrelated data.

If an essential release gate fails, stop and report the blocker rather than forcing deployment.

---

## 13. MANDATORY MARKDOWN DOCUMENTATION

The directive is not complete until all relevant Markdown documentation has been updated.

At minimum, review and update:

- Directive index.
- Current development status.
- Development agent handoff.
- StudioFlow workspace configuration.
- StudioFlow playback contract, if affected.
- Testing and verification records.
- Relevant StudioFlow feature documentation.
- Dated directive completion record.

The completion report must document:

**WHO:** Agent responsible.  
**WHAT:** Features implemented.  
**WHERE:** Source files and components changed.  
**WHEN:** Implementation and deployment dates.  
**WHY:** Owner-approved timer collection.  
**HOW:** Integration architecture and technical approach.

Also include:

- All nine timer names.
- Verification results.
- Browser testing.
- Performance observations.
- Source commit.
- Documentation commit.
- Production Worker version.
- Previous Worker rollback version.
- Deployment status.
- Remaining limitations.

Preserve historical documentation.

Commit and push documentation according to the governing workflow.

---

## 14. COMPLETION CRITERIA

TPI-STUDIOFLOW-036 is complete only when:

- All nine approved timers are integrated.
- The existing Classic Countdown is preserved.
- The eight new cinematic animations match the approved prototype.
- The timers appear in a three-column, three-row grid.
- All four countdown durations work.
- All timers remain silent.
- Program output integration is verified.
- Studio configuration persists correctly.
- Existing StudioFlow functionality remains intact.
- Regression and performance checks pass.
- Production deployment is verified, if authorized.
- All required Markdown documentation is completed and pushed.

**END OF TPI-STUDIOFLOW-036**

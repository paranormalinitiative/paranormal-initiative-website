# TPI-STUDIOFLOW-017 — StudioFlow SMART Pads — Sound Effects & Background Music

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 15:00.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-BACKGROUND-MUSIC-FORMATS.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-BACKGROUND-MUSIC-FORMATS.md), [2026-10-22-STUDIOFLOW-SCENE-BACKGROUND-MUSIC.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-SCENE-BACKGROUND-MUSIC.md)
**Previously archived variant(s):** [TPI-STUDIOFLOW-017-SMART-PADS.md](TPI-STUDIOFLOW-017-SMART-PADS.md)

---

# TPI-STUDIOFLOW-017
## StudioFlow SMART Pads — Sound Effects & Background Music

**Assigned Agent:** FreeBuff  
**Project:** The Paranormal Initiative — StudioFlow  
**Status:** APPROVED FOR IMPLEMENTATION  
**Priority:** High

### OBJECTIVE

Implement a professional SMART Pad interface for StudioFlow's existing Sound Effects and Background Music systems.

The interface should be inspired by RØDE UNIFY's SMART Pads while maintaining StudioFlow's own visual identity.

**This is an enhancement of the existing media systems, not a replacement.**

Preserve all existing uploaded audio, studio configurations, playback functionality, and user settings.

---

### 1. SOUND EFFECT SMART PADS

Create reusable, colored SMART Pads for uploaded sound effects.

Each pad must display:

- A prominent white waveform icon.
- The sound effect's actual name.
- A customizable background color.
- A visual active/playback state.

**Example:**

Uploaded file: `Ghost Scream.mp3`

Displayed pad:

**[Waveform Icon]**  
**Ghost Scream**

Clicking the pad must immediately play the associated sound effect using StudioFlow's existing audio system.

### 2. BACKGROUND MUSIC SMART PADS

Create a visually distinct SMART Pad design for Background Music.

Each pad must display:

- A prominent white music-note icon.
- The uploaded song's actual title.
- A customizable background color.
- A visual active/playback state.

**Example:**

Uploaded file: `Crossroads of the Unknown Theme.mp3`

Displayed pad:

**[Music Note Icon]**  
**Crossroads of the Unknown Theme**

Clicking the pad must play the associated music track using StudioFlow's existing background-music system.

### 3. AUTOMATIC NAME DETECTION

When an audio file is uploaded, StudioFlow must automatically determine its display name.

Use this priority:

1. Existing user-customized title, if available.
2. Embedded audio title metadata, if available.
3. Original filename without its extension.

For example:

`Haunted House Atmosphere.mp3`

Becomes:

**Haunted House Atmosphere**

Do not display generic labels such as "Sound 1" or "Music 2" when a valid title is available.

Users must be able to rename a pad without renaming or modifying its original audio file.

### 4. AUTOMATIC PAD GENERATION

SMART Pads must be generated automatically from the existing media library.

When a user uploads a new sound effect, StudioFlow creates its Sound Effect SMART Pad.

When a user uploads a new music track, StudioFlow creates its Background Music SMART Pad.

**Existing uploaded files must also receive SMART Pads automatically.**

Do not require users to reupload their media.

Do not create duplicate media records or duplicate pads.

### 5. COLORS AND APPEARANCE

Use a consistent reusable SMART Pad design.

Each newly created pad receives a default color selected from a coordinated palette.

Users must be able to change the color of individual pads.

The selected color must persist when switching studios, refreshing the browser, or returning later.

The waveform and music-note icons should remain white and visually consistent.

Pad labels must remain readable, including longer titles.

Sound Effects and Background Music must be immediately distinguishable by their icons.

### 6. PLAYBACK BEHAVIOR

Preserve the existing playback architecture.

Sound Effect SMART Pads must use the existing Sound Effects playback system.

Background Music SMART Pads must use the existing Background Music playback system.

Do not accidentally route background music through the sound-effects channel or vice versa.

When a pad is playing, provide a clear visual indication.

When playback stops or finishes, restore the pad's normal appearance.

Do not introduce countdown timers or additional playback modes as part of this directive.

### 7. STUDIO-SPECIFIC MEDIA

SMART Pads must respect StudioFlow's existing studio-selection system.

When switching between studios:

- Save the current studio's pad settings.
- Load the selected studio's corresponding media.
- Display the correct sound and music titles.
- Restore the selected studio's customized pad colors.

Do not mix media or settings between studios unless the existing media system explicitly supports shared assets.

### 8. RESPONSIVE DESIGN

The SMART Pad interface must work across:

- Desktop computers.
- Laptops.
- iPads.
- iPhones.

Use responsive pad grids appropriate to the available screen size.

Preserve StudioFlow's established visual styling.

### 9. DATA PROTECTION

**NON-NEGOTIABLE:**

- Do not delete existing uploaded audio.
- Do not overwrite existing media files.
- Do not remove existing soundboard functionality.
- Do not disrupt Background Music playback.
- Do not modify unrelated StudioFlow features.
- Do not alter podcast recordings or production assets.
- Do not modify unrelated TPI website functionality.

Use existing media records and storage wherever possible.

### 10. VALIDATION

Before completion, verify:

1. Existing sound effects appear as waveform SMART Pads.
2. Existing music appears as music-note SMART Pads.
3. Newly uploaded audio automatically receives the correct pad.
4. Sound names and music titles display correctly.
5. Custom pad names and colors persist after refresh.
6. Playback works correctly for both media types.
7. Switching studios restores the correct media and settings.
8. No existing audio files or studio data are lost.
9. Desktop and mobile layouts function correctly.
10. Existing automated regression tests pass.

### 11. AUTONOMOUS EXECUTION

FreeBuff is authorized to inspect the existing implementation, make necessary changes, run tests, and complete the implementation under the project's established autonomous development authority.

Follow all existing repository instructions, deployment safeguards, and rollback procedures.

### COMPLETION REPORT

Provide:

- Files modified.
- SMART Pad components implemented.
- How existing audio files were migrated into the new interface.
- How titles and colors are stored.
- Validation results.
- Deployment status.
- Any outstanding limitations.

**SUCCESS CONDITION:**

StudioFlow displays professional, customizable SMART Pads for both Sound Effects and Background Music. Every pad clearly identifies its associated uploaded sound or song and plays it through the correct existing audio system.

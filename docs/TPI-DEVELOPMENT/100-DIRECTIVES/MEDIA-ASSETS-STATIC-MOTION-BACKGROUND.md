# MEDIA ASSETS — STATIC & MOTION BACKGROUND CATEGORIES

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 13:39.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-040
MEDIA ASSETS — STATIC & MOTION BACKGROUND CATEGORIES
=====================================================================

PROJECT:
The Paranormal Initiative

APPLICATION:
StudioFlow

PRIORITY:
MEDIUM-HIGH

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PROJECT DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

=====================================================================
1. OBJECTIVE
=====================================================================

Improve StudioFlow's Media Assets organization by separating
static image backgrounds from motion/video backgrounds.

Currently, StudioFlow has a Backgrounds category.

The owner wants two distinct categories:

1. Backgrounds
2. Motion Backgrounds

BACKGROUND CATEGORY:
Static image backgrounds only.

MOTION BACKGROUNDS CATEGORY:
Animated or video backgrounds.

IMPORTANT:

This is primarily a media organization and user-interface
enhancement.

Do not create a second storage infrastructure.

Do not duplicate media files.

Do not migrate existing assets unnecessarily.

Preserve the existing background storage system.

=====================================================================
2. REQUIRED MEDIA ASSET CATEGORIES
=====================================================================

Within StudioFlow's Media Assets interface, provide:

BACKGROUND CATEGORIES:

[ Backgrounds ]

[ Motion Backgrounds ]

BACKGROUND CATEGORY:

Display supported static images:

- JPG
- JPEG
- PNG
- WebP
- Other existing supported image formats

MOTION BACKGROUNDS CATEGORY:

Display supported video backgrounds:

- MP4
- WebM
- MOV where supported by the browser
- Other existing supported video formats

Do not advertise unsupported playback formats as functional.

The categories must be clearly distinguishable.

Maintain StudioFlow's existing visual design.

=====================================================================
3. AUTOMATIC MEDIA CLASSIFICATION
=====================================================================

When an asset is uploaded through the existing background
upload workflow, determine its media type.

IMAGE FILE:

Assign to:

Backgrounds

VIDEO FILE:

Assign to:

Motion Backgrounds

Use reliable media-type detection based on existing metadata,
MIME type, and validated file information where available.

Do not rely exclusively on file extensions.

For legacy assets with incomplete metadata, implement a safe
classification fallback.

Do not modify original file contents.

Do not create duplicate asset records.

Do not re-upload existing files.

=====================================================================
4. EXISTING STORAGE MUST REMAIN UNCHANGED
=====================================================================

Both categories must continue using the existing background
media storage system.

LOGICAL ORGANIZATION:

MEDIA ASSETS
    |
    |--- Backgrounds
    |       |
    |       |--- Static image assets
    |
    |--- Motion Backgrounds
            |
            |--- Video background assets

PHYSICAL STORAGE:

Preserve the existing storage locations and asset references.

This directive does not authorize:

- New Cloudflare storage
- New R2 buckets
- New production media services
- Duplicate asset storage
- Unnecessary database migrations

Prefer classification at the UI/metadata layer.

=====================================================================
5. MEDIA ASSETS USER INTERFACE
=====================================================================

Add a clearly labeled Motion Backgrounds category alongside
the existing Backgrounds category.

REQUIREMENTS:

1. Backgrounds displays static images.
2. Motion Backgrounds displays video backgrounds.
3. Existing upload controls remain functional.
4. Existing delete controls remain functional.
5. Existing preview controls remain functional.
6. Existing selection controls remain functional.
7. Existing asset references remain intact.
8. Empty categories display a useful empty-state message.

The owner should be able to navigate between categories
without reloading StudioFlow.

Preserve the existing layout, styling, and responsive behavior.

=====================================================================
6. MOTION BACKGROUND PREVIEWS
=====================================================================

Motion backgrounds should provide an appropriate video preview.

Preferred behavior:

- Display video thumbnail or preview.
- Show a recognizable motion/video indicator.
- Allow preview playback.
- Keep preview audio muted.
- Avoid automatically playing every video simultaneously.
- Release inactive playback resources when possible.

Do not introduce unnecessary CPU or memory usage.

Do not autoplay dozens of video assets in the media library.

=====================================================================
7. APPLYING MOTION BACKGROUNDS TO SCENES
=====================================================================

When a motion background is selected for a scene:

1. Preserve the existing scene background workflow.
2. Apply the selected video as the scene background.
3. Loop playback continuously.
4. Mute background audio.
5. Preserve foreground overlays.
6. Preserve camera and guest layers.
7. Preserve logos and branding.
8. Preserve existing scene transitions where supported.

Motion backgrounds must not interfere with:

- Microphones
- Guest audio
- Podcast recording
- Intro/outro playback
- Scene switching
- Broadcast controls

IMPORTANT:

Inspect existing scene-rendering capabilities before modifying
video background behavior.

If looping video backgrounds are already supported, reuse the
existing implementation.

Do not build a second video-rendering system.

=====================================================================
8. EXISTING MEDIA COMPATIBILITY
=====================================================================

Existing static backgrounds must remain visible.

Existing video backgrounds must appear in Motion Backgrounds
when their media type can be identified.

Do not delete or re-upload existing assets.

Do not rewrite owner media references.

Do not modify media blobs.

Do not change existing Studio configurations unnecessarily.

If an existing asset has ambiguous metadata, preserve it and
report the ambiguity rather than silently discarding it.

=====================================================================
9. CROSSROADS OF THE UNKNOWN PROTECTION
=====================================================================

OWNER STUDIO:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

PRESERVE:

- Studio identity
- Scenes
- Scene ordering
- Static backgrounds
- Existing video backgrounds
- Intro video
- Outro video
- Logos
- Audio
- Media references
- Guest settings
- Recordings
- Backup configuration

Do not overwrite the owner's Studio configuration.

Do not replace missing browser-local assets.

Do not automatically synchronize browser storage.

=====================================================================
10. TESTING REQUIREMENTS
=====================================================================

Verify:

[ ] Backgrounds category appears.
[ ] Motion Backgrounds category appears.
[ ] Static images appear only under Backgrounds.
[ ] Videos appear only under Motion Backgrounds.
[ ] Existing assets remain accessible.
[ ] Uploading an image classifies it correctly.
[ ] Uploading a video classifies it correctly.
[ ] Motion background previews function.
[ ] Motion backgrounds loop when applied.
[ ] Background audio remains muted.
[ ] Scene overlays remain visible.
[ ] Scene switching continues working.
[ ] Intro/outro playback remains unaffected.
[ ] Media is not duplicated.
[ ] Existing media references remain valid.
[ ] Chrome functionality remains intact.
[ ] Safari functionality remains intact.
[ ] Opera functionality remains intact where testable.
[ ] Local development remains functional.

Use synthetic assets and Studios for tests requiring writes.

Do not modify Crossroads of the Unknown during testing.

=====================================================================
11. MANDATORY SAFETY RESTRICTIONS
=====================================================================

PROHIBITED:

- Production deployment
- Cloudflare production access
- Cloudflare database changes
- New paid storage infrastructure
- Local D1 reset
- Browser storage clearing
- IndexedDB deletion
- Owner media deletion
- Recording deletion
- Owner Studio overwrite
- Automatic backup activation
- Git commits
- Git pushes
- Discarding unrelated changes

Preserve existing development services and temporary guest tunnel.

All work must remain local.

=====================================================================
12. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-040 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. IMPLEMENTATION

Explain how Backgrounds and Motion Backgrounds are separated.

B. MEDIA CLASSIFICATION

Explain how image and video assets are identified.

C. STORAGE

Confirm that existing storage is reused.

D. SCENE PLAYBACK

Explain how motion backgrounds are applied and looped.

E. FILES CHANGED

List modified files.

F. TESTING

Report actual test results.

G. DATA PROTECTION

Confirm Crossroads of the Unknown and existing media
were preserved.

H. REMAINING LIMITATIONS

Identify unsupported video formats or browser-specific
playback limitations.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner wants a simple, intuitive distinction between
static backgrounds and motion backgrounds.

Implement this as a clean Media Assets enhancement.

Reuse the existing media infrastructure.

Do not duplicate media or introduce unnecessary complexity.

Preserve existing StudioFlow functionality and owner data.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-040
=====================================================================

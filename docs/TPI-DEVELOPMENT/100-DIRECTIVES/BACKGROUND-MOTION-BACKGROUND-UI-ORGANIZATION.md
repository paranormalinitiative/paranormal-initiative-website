# BACKGROUND & MOTION BACKGROUND UI ORGANIZATION

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
TPI-STUDIOFLOW-040
BACKGROUND & MOTION BACKGROUND UI ORGANIZATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

OBJECTIVE:

Organize the existing StudioFlow background selection panel
into two visually separated sections:

1. BACKGROUNDS
2. MOTION BACKGROUNDS

IMPORTANT:

StudioFlow ALREADY supports uploading and using motion
backgrounds.

DO NOT create new media functionality.

DO NOT modify scene rendering or playback.

DO NOT introduce a new storage system.

THIS IS A SMALL USER-INTERFACE ORGANIZATION CHANGE.

=====================================================================
1. CURRENT BEHAVIOR
=====================================================================

The existing Background section displays static images and
motion backgrounds together.

The owner has confirmed that motion backgrounds already work.

The existing motion background:

COTUMotion Background

currently appears among the static image backgrounds.

=====================================================================
2. REQUIRED INTERFACE
=====================================================================

Update the existing background panel to display:

BACKGROUNDS

[Existing static background thumbnails]

MOTION BACKGROUNDS

[Existing motion background thumbnails]

[Upload Background]

Keep the current thumbnail styling, selection highlighting,
spacing, and general StudioFlow appearance.

Both sections must remain within the same existing panel.

Do not create separate pages, tabs, or navigation.

=====================================================================
3. MEDIA CLASSIFICATION
=====================================================================

Use existing media metadata to distinguish:

STATIC BACKGROUNDS:
Image assets.

MOTION BACKGROUNDS:
Video assets.

Use existing MIME types and media metadata where available.

Provide a safe fallback for legacy assets.

Do not modify the underlying media files.

Do not change stored asset references.

Do not duplicate or migrate assets.

=====================================================================
4. UPLOAD BEHAVIOR
=====================================================================

Preserve the existing Upload Background button.

Keep the existing upload process unchanged.

When an image is uploaded:
Display it under BACKGROUNDS.

When a video is uploaded:
Display it under MOTION BACKGROUNDS.

Do not add a second upload button.

Do not change storage locations.

=====================================================================
5. EXISTING FUNCTIONALITY
=====================================================================

Preserve:

- Background selection.
- Motion background selection.
- Scene background application.
- Video looping.
- Background previews.
- Scene transitions.
- Media persistence.
- Existing thumbnail behavior.
- Existing media controls.

This directive does not authorize playback changes.

=====================================================================
6. OWNER DATA PROTECTION
=====================================================================

Preserve Crossroads of the Unknown.

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify:

- Existing scenes.
- Existing backgrounds.
- Motion background assets.
- Media references.
- Intro/outro videos.
- Recordings.
- Studio settings.
- Browser storage.
- Local D1.

Do not automatically save or rewrite the owner's Studio
during testing.

=====================================================================
7. TESTING
=====================================================================

Verify:

[ ] Static images appear under BACKGROUNDS.
[ ] Video backgrounds appear under MOTION BACKGROUNDS.
[ ] COTUMotion Background appears in the correct section.
[ ] Existing thumbnail selection still works.
[ ] Existing Upload Background button works.
[ ] Uploaded images display under BACKGROUNDS.
[ ] Uploaded videos display under MOTION BACKGROUNDS.
[ ] No assets disappear.
[ ] No duplicate assets appear.
[ ] Existing motion background playback remains unchanged.
[ ] Chrome compatibility remains intact.
[ ] Safari compatibility remains intact.
[ ] Opera compatibility remains intact where testable.

Use synthetic assets for write-based tests.

=====================================================================
8. RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production access.
NO local database reset.
NO browser storage clearing.
NO owner media deletion.
NO Studio configuration overwrite.
NO new media storage system.
NO playback system rewrite.
NO Git commit.
NO Git push.

Preserve the existing working tree.

=====================================================================
9. REQUIRED REPORT
=====================================================================

TPI-STUDIOFLOW-040 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

Report:

1. Files modified.
2. How static and motion backgrounds are separated.
3. Confirmation that existing media storage is unchanged.
4. Verification of COTUMotion Background classification.
5. Test results.
6. Confirmation that Crossroads remains unchanged.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-040
=====================================================================

# OPERA STALE ASSET INVESTIGATION & REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 13:47.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-040A
OPERA STALE ASSET INVESTIGATION & REPAIR
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PRIORITY:
MEDIUM

=====================================================================
1. OBJECTIVE
=====================================================================

TPI-STUDIOFLOW-040 added separate:

- BACKGROUNDS
- MOTION BACKGROUNDS

sections to StudioFlow.

Automated tests passed, but the owner reports that Opera does
not display the updated interface even after a hard refresh.

Investigate whether Opera is loading stale JavaScript/CSS assets
or whether the local Worker is serving outdated files.

Do not assume caching is the cause without evidence.

=====================================================================
2. INVESTIGATION
=====================================================================

Inspect:

1. Current StudioFlow HTML asset references.
2. Current JavaScript bundle.
3. Current CSS bundle.
4. Worker static asset routing.
5. Local development server asset responses.
6. Browser caching headers.
7. Service worker registration, if present.
8. Any application-level asset caching.

Verify that the local Worker serves the modified files:

studio/assets/index-j2x9m9vI.js

studio/assets/index-DXjilBOR.css

Confirm that the updated background section code is present
in the files actually returned by the server.

Compare local source files with served responses.

=====================================================================
3. OPERA VERIFICATION
=====================================================================

If direct Opera browser inspection is available:

1. Open the authenticated StudioFlow session.
2. Inspect the background selection panel.
3. Check loaded JavaScript and CSS resources.
4. Check browser console errors.
5. Determine whether Opera is using cached assets.
6. Verify whether the new headings render.

Do not log out the owner.

Do not clear browser storage.

Do not modify unrelated tabs.

If Opera inspection is unavailable, report that limitation.

=====================================================================
4. REPAIR
=====================================================================

After identifying the cause, apply the smallest safe fix.

Possible corrections include:

- Correcting outdated HTML asset references.
- Correcting Worker asset routing.
- Correcting development cache headers.
- Updating asset versioning.
- Fixing an actual rendering defect.

Prefer development-only cache-control corrections where
appropriate.

Do not disable production caching globally.

Do not introduce unnecessary rebuilds or infrastructure changes.

=====================================================================
5. DATA PROTECTION
=====================================================================

Preserve Crossroads of the Unknown.

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

DO NOT:

- Clear Opera cookies.
- Clear Opera localStorage.
- Clear Opera IndexedDB.
- Delete media.
- Modify Studio configurations.
- Reset local D1.
- Change authentication.
- Activate automatic backups.
- Replace browser-local assets.

=====================================================================
6. TESTING
=====================================================================

Verify:

[ ] Worker serves updated JavaScript.
[ ] Worker serves updated CSS.
[ ] HTML references correct assets.
[ ] Backgrounds heading appears.
[ ] Motion Backgrounds heading appears.
[ ] Existing media thumbnails remain visible.
[ ] COTUMotion appears under Motion Backgrounds
    when identified as video.
[ ] Upload Background still works.
[ ] No Studio data is modified.
[ ] Chrome compatibility remains intact.
[ ] Safari compatibility remains intact.
[ ] Opera compatibility remains intact.

Use synthetic data for write-based tests.

=====================================================================
7. RESTRICTIONS
=====================================================================

NO production access.
NO Cloudflare deployment.
NO database reset.
NO browser storage clearing.
NO owner media deletion.
NO Git commit.
NO Git push.
NO unrelated application changes.

Preserve the current development environment and guest tunnel.

=====================================================================
8. REQUIRED REPORT
=====================================================================

TPI-STUDIOFLOW-040A RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. ROOT CAUSE
Explain why Opera did not display the updated interface.

B. ASSET VERIFICATION
Confirm which JavaScript and CSS files Opera received.

C. REPAIR
List any files changed.

D. TESTING
Report actual verification results.

E. DATA PROTECTION
Confirm Crossroads and browser storage were preserved.

F. OWNER INSTRUCTIONS
Provide the exact local address to open.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-040A
=====================================================================

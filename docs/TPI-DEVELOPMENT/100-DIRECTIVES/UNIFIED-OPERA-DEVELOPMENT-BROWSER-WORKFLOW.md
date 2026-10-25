# UNIFIED OPERA DEVELOPMENT BROWSER WORKFLOW

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 02:22.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** [TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md](TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md)

---

TPI-STUDIOFLOW-021
UNIFIED OPERA DEVELOPMENT BROWSER WORKFLOW

PROJECT: The Paranormal Initiative — StudioFlow
PRIORITY: HIGH
ENVIRONMENT: LOCAL DEVELOPMENT ONLY

OBJECTIVE

Establish Opera as the primary development and testing
browser for StudioFlow.

The owner currently uses Opera for the active StudioFlow
development workspace.

Codex has been granted permission to access Opera.

The Codex browser and Opera have displayed different
saved Studios and scene configurations.

We must establish one authoritative development
workspace to prevent confusion and accidental data loss.

--------------------------------------------------
PHASE 1 — INVESTIGATE BROWSER DATA STORAGE
--------------------------------------------------

Determine exactly where StudioFlow stores:

- Studio configurations
- Studio names
- Scene configurations
- Uploaded media references
- Uploaded media data
- Last-active Studio
- Playback preferences
- Guest settings

Identify whether this information is stored in:

- localStorage
- IndexedDB
- Cookies
- Local development database
- Other storage mechanisms

Document which data is browser-specific and which
is shared through the development server.

DO NOT DELETE OR RESET ANY STORAGE.

--------------------------------------------------
PHASE 2 — ESTABLISH OPERA AS PRIMARY BROWSER
--------------------------------------------------

Opera is the owner's authoritative development
browser for StudioFlow.

Codex should use Opera for live UI verification
whenever access is available and authorized.

Codex must not assume its isolated browser contains
the same Studios, scenes, or uploaded assets.

The Codex browser may still be used for isolated
regression testing.

However, isolated browser test data must never be
treated as the owner's authoritative workspace.

--------------------------------------------------
PHASE 3 — VERIFY DEVELOPMENT ENVIRONMENT
--------------------------------------------------

Confirm Opera accesses the intended local development
Worker.

Confirm:

- Exact localhost URL
- Worker port
- Room server port
- Active Studio
- Loaded application version
- Loaded CSS and JavaScript versions
- Storage origin
- Storage mechanism

Verify Opera is not accidentally accessing production.

Document the canonical development URL.

Do not change production configuration.

--------------------------------------------------
PHASE 4 — PROTECT EXISTING STUDIO DATA
--------------------------------------------------

Preserve all Studios currently stored in Opera.

Preserve:

- Crossroads of the Unknown
- Existing Studio configurations
- Scenes
- Media
- Guest settings
- Saved preferences

Do not:

- Clear browser storage
- Delete IndexedDB
- Reset localStorage
- Delete Studios
- Replace Studio configurations
- Overwrite uploaded media
- Migrate browser data without authorization

If storage changes are necessary, stop and request
authorization before proceeding.

--------------------------------------------------
PHASE 5 — CODEX BROWSER TESTING RULES
--------------------------------------------------

Codex may use its isolated browser for:

- Synthetic test Studios
- Automated regression tests
- Temporary fixtures
- Controlled browser experiments

However:

1. Never confuse synthetic test data with Opera data.
2. Never overwrite Opera Studios with test fixtures.
3. Never clear Opera storage.
4. Never modify real Studio data during automated tests.
5. Always identify which browser was used in reports.

Use isolated test storage for destructive testing.

--------------------------------------------------
PHASE 6 — OPERA LIVE VERIFICATION
--------------------------------------------------

When Codex implements a StudioFlow change:

1. Complete local code modifications.
2. Run automated regression tests.
3. Open or inspect the current development site
   in Opera when authorized.
4. Verify the change in Opera.
5. Confirm the owner's Studios remain intact.
6. Confirm existing scenes and media remain intact.
7. Report the Opera verification result.

Do not claim Opera verification passed if the
change was tested only in the Codex browser.

--------------------------------------------------
PHASE 7 — DEVELOPMENT SAFEGUARDS
--------------------------------------------------

LOCAL DEVELOPMENT ONLY.

DO NOT:

- Deploy to production.
- Modify production databases.
- Commit.
- Push.
- Delete browser data.
- Reset existing Studios.
- Modify original media assets.
- Interfere with the mobile guest testing tunnel.
- Restart unrelated development services.

Preserve the dirty worktree.

--------------------------------------------------
PHASE 8 — COMPLETION REPORT
--------------------------------------------------

Report:

1. Authoritative development URL.
2. Opera storage origin.
3. StudioFlow storage mechanisms.
4. Which data is browser-specific.
5. Which data is shared.
6. Confirmation Opera is the primary browser.
7. Confirmation Codex can verify changes in Opera.
8. Data protection measures.
9. Remaining limitations.

Update development documentation.

END DIRECTIVE — TPI-STUDIOFLOW-021

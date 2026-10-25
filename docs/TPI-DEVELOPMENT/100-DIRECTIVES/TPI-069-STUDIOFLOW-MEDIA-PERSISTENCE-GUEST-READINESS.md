# TPI-069 — STUDIOFLOW MEDIA PERSISTENCE & GUEST READINESS

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 21:32.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-069
STUDIOFLOW MEDIA PERSISTENCE & GUEST READINESS
=====================================================================

PRIORITY:
CRITICAL

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

STATUS:
AUTHORIZED — SCOPED LOCAL IMPLEMENTATION

=====================================================================
1. OBJECTIVE
=====================================================================

Resolve the remaining StudioFlow release blockers
related to:

1. Custom Studio media persistence.
2. Workspace media portability.
3. Guest room test readiness.

Use existing TPI infrastructure wherever possible.

Do not build a separate media platform.

Do not introduce unrelated Creator Studio features.

DO NOT DEPLOY.

=====================================================================
2. AUTHORITATIVE RELEASE CANDIDATE
=====================================================================

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Expected branch:

codex/studioflow-release-candidate

Expected baseline:

7385f0cf24155f121bdc967a0985553daa8a05df

Verify current state before changes.

Preserve:

- Original website worktree.
- StudioFlow source repository.
- Existing owner workspaces.
- Existing media.
- Recordings.
- Backups.
- Browser storage.

Do not stage, commit, or push.

=====================================================================
3. EXISTING MEDIA ARCHITECTURE
=====================================================================

Inspect the current StudioFlow media system.

Identify:

- Custom image uploads.
- Video uploads.
- Motion backgrounds.
- Audio assets.
- Workspace asset references.
- Browser-local media storage.
- Media export/import behavior.
- Existing R2 storage facilities.
- Existing authentication and ownership checks.

Determine which media types are actually supported.

Do not assume every browser-local object should
be uploaded to R2.

Document the existing media contract before editing.

=====================================================================
4. SERVER-SIDE MEDIA PERSISTENCE
=====================================================================

Implement the smallest safe server-side persistence
path for supported custom Studio media.

Prefer existing TPI R2 infrastructure.

Requirements:

- Authenticated uploads.
- Workspace ownership enforcement.
- Stable asset identifiers.
- Persistent R2 object storage.
- Metadata associated with the workspace.
- Authenticated media retrieval.
- Correct content types.
- File size limits.
- Supported media-type validation.
- No arbitrary public access.
- No cross-user media exposure.
- Safe handling of upload failures.

Do not expose R2 credentials to browsers.

Do not overwrite existing media objects.

Do not modify owner recordings or backups.

If existing database schema cannot support the
required metadata safely, document the smallest
additive migration.

Do not apply migrations to production.

=====================================================================
5. WORKSPACE PORTABILITY
=====================================================================

Verify that a disposable workspace can:

- Upload custom media.
- Save its configuration.
- Refresh the browser.
- Restore the media.
- Open in a second isolated browser profile.
- Retrieve the same custom media.
- Preserve scene associations.

Workspace snapshots must not falsely imply
that media bytes are embedded in configuration JSON.

Use stable server-side references where applicable.

Preserve compatibility with existing browser-local
workspaces.

Do not silently delete local media.

=====================================================================
6. RECORDINGS
=====================================================================

Do not change recording storage behavior
under this directive.

Recordings remain subject to their existing
browser-local/export contract.

Clearly distinguish:

CUSTOM STUDIO MEDIA

from:

RECORDINGS.

Document the distinction in the UI if needed
to prevent misleading persistence claims.

=====================================================================
7. GUEST / REALTIMEKIT READINESS
=====================================================================

Inspect the existing guest-room configuration.

Identify the exact disposable configuration
required for local acceptance.

Do not invent credentials.

Do not copy production credentials.

Do not contact production room services.

If disposable credentials are unavailable:

- Verify local contracts.
- Document the remaining blocker.
- Do not claim live guest acceptance passed.

Do not create a mock result that is presented
as a successful real connection.

=====================================================================
8. SECURITY
=====================================================================

Verify:

- Authentication.
- Workspace ownership.
- Media object ownership.
- Cross-user isolation.
- Upload validation.
- Download authorization.
- Content-type handling.
- Object key safety.
- No credential exposure.
- No arbitrary outbound requests.
- No production data access.

Use disposable test users and workspaces.

=====================================================================
9. TESTING
=====================================================================

Run:

- StudioFlow focused regression suite.
- Media upload tests.
- Media retrieval tests.
- Workspace persistence tests.
- Second-browser portability tests.
- Authentication tests.
- Ownership tests.
- R2 failure-path tests.
- Relevant Worker routing tests.
- JavaScript syntax.
- git diff --check.

Use disposable D1 and R2 environments.

Do not modify production resources.

If full browser acceptance cannot be completed,
report PARTIAL.

=====================================================================
10. RELEASE MANIFEST
=====================================================================

Update the isolated release candidate manifest.

Identify:

- Exact changed files.
- New media routes.
- New storage dependencies.
- Schema dependencies.
- Security controls.
- Test results.
- Remaining blockers.

Exclude:

- wrangler.local.toml
- Secrets.
- Local databases.
- Disposable fixtures.
- Owner media.
- Recordings.
- Backups.
- Browser storage.
- Unrelated website development.

=====================================================================
11. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-STUDIOFLOW-069-RESULT.md

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/
DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Update:

docs/TPI-MASTER-DEVELOPMENT/
03-TPI-CREATOR-SYSTEMS/
01-TPI-CREATOR-STUDIO.md

Document the verified media-persistence contract.

Do not mark production readiness complete.

=====================================================================
12. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage.
- Commit.
- Push.
- Deploy.
- Apply production migrations.
- Access production D1 or R2.
- Modify Cloudflare production settings.
- Modify owner workspaces.
- Modify owner media or recordings.
- Modify protected browser storage.
- Modify global system services.
- Introduce unrelated features.
- Begin Master Development Tree reorganization.

=====================================================================
13. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-069 RESULT

A. REPOSITORY STATE

B. EXISTING MEDIA ARCHITECTURE

C. SERVER-SIDE PERSISTENCE IMPLEMENTATION

D. WORKSPACE PORTABILITY

E. RECORDING STORAGE CONTRACT

F. REALTIMEKIT READINESS

G. SECURITY VERIFICATION

H. TEST RESULTS

I. EXACT RELEASE MANIFEST

J. REMAINING BLOCKERS

K. NEXT RECOMMENDED ACTION

Provide exactly one recommended next action.

=====================================================================
COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only if:

- Custom media persists in disposable R2.
- Workspace media references survive refresh.
- Media works in a second browser profile.
- Ownership controls pass.
- Existing browser-local media is preserved.
- Recordings remain unchanged.
- No production resources were modified.
- No staging, commit, push, or deployment occurred.

Otherwise report PARTIAL or BLOCKED.

=====================================================================
END DIRECTIVE — TPI-069
=====================================================================

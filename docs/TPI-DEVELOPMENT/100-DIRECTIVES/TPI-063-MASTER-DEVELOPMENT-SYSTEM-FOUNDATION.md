# TPI-063 — MASTER DEVELOPMENT SYSTEM FOUNDATION

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
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-063
MASTER DEVELOPMENT SYSTEM FOUNDATION
PLATFORM AUDIT + MODULAR DEVELOPMENT REGISTRY
=====================================================================

PRIORITY:
HIGH

STATUS:
AUTHORIZED — AUDIT AND DOCUMENTATION IMPLEMENTATION

OWNER OBJECTIVE:
Organize the entire TPI website and community into
individually managed development modules.

Each module must have:

- A unique development identity.
- A numbered location in the master development tree.
- An authoritative Markdown development record.
- Known source files and directories.
- Known dependencies.
- Completed development.
- Pending development.
- Known issues.
- Git checkpoint status.
- Local verification status.
- Production verification status.
- An active or pending development mission.

The entire platform must be navigable from one
master Markdown document.

IMPORTANT:

The current primary development priority remains:

TPI CREATOR STUDIO / STUDIOFLOW.

This directive must not redirect implementation
effort into unrelated application development.

=====================================================================
1. AUTHORITATIVE REPOSITORIES
=====================================================================

WEBSITE:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Expected branch:

codex/tpi-development

Expected HEAD:

7385f0cf24155f121bdc967a0985553daa8a05df

STUDIOFLOW SOURCE:

/Users/toddknipple/Documents/StudioFlow/web

Expected branch:

main

Approved source checkpoint:

a919a881705c4f21dc184a6f2af8a5096d68e5f4

Verify actual state before proceeding.

Do not modify the StudioFlow source repository.

Do not assume expected state is unchanged.

=====================================================================
2. PRESERVATION REQUIREMENTS
=====================================================================

The website repository contains substantial
uncommitted development.

TPI-062 identified:

- 37 modified tracked files.
- 270 untracked files at audit baseline.
- 272 untracked files after documentation writes.
- No staged files.

These include:

- Administration Panel development.
- StudioFlow integration.
- Website development.
- Operations.
- Teams.
- Documentation.
- Scripts.
- Local-only development artifacts.

PRESERVE EVERYTHING.

Do not clean, reset, stash, move, rename,
overwrite, or delete existing files.

Do not stage or commit anything.

Do not access or modify production data.

=====================================================================
3. AUDIT THE COMPLETE WEBSITE
=====================================================================

Perform a read-only architectural inventory of
the website repository.

Include:

A. Tracked source files.

B. Untracked source files.

C. Public website pages.

D. Community pages.

E. Administration interfaces.

F. Creator applications.

G. Research and education sections.

H. Standalone applications.

I. Shared backend services.

J. Database migrations.

K. Development and deployment infrastructure.

L. Existing documentation.

M. Existing verification scripts.

N. Existing integration points.

Inspect actual application routes, navigation,
HTML entry points, API handlers, and relevant
source directories.

Do not classify files solely by filename.

Distinguish:

IMPLEMENTED
PARTIALLY IMPLEMENTED
PLANNED
HISTORICAL
UNKNOWN

A file existing does not prove that its
corresponding feature works.

=====================================================================
4. IDENTIFY EVERY MAJOR TPI MODULE
=====================================================================

The following are candidate modules.

Confirm their actual implementation and
source locations.

PUBLIC WEBSITE:

- Home Page
- About Page
- TPI News
- TPI Videos
- Other public-facing pages

COMMUNITY:

- Community Feed
- Messenger
- Reels
- Calendar and Events
- Member Profiles
- Notifications
- Other community features

CREATOR SYSTEMS:

- TPI Creator Studio / StudioFlow
- TPI Content Creator
- Creator publishing tools
- Media management
- Other creator tools

ADMINISTRATION:

- Administration Panel
- Contributor management
- Article management
- Moderation
- Permissions
- Other administration features

RESEARCH AND EDUCATION:

- Repository
- Education
- Research
- Resources
- Other educational systems

APPLICATIONS:

- Scrying application
- Paranormal tools
- Other interactive applications
- Application integrations

SHARED INFRASTRUCTURE:

- Authentication
- API services
- Databases
- Storage
- Cloudflare infrastructure
- Shared routing

OPERATIONS:

- Testing
- Deployment
- Security
- Recovery
- Local development

IMPORTANT:

This list is not exhaustive.

Discover additional modules from actual code.

Do not invent implemented features.

Do not combine unrelated modules simply
to fit this proposed structure.

=====================================================================
5. CREATE THE MASTER DEVELOPMENT DIRECTORY
=====================================================================

Create the following documentation root
inside the website repository:

docs/TPI-MASTER-DEVELOPMENT/

Create the numbered division directories:

00-MASTER-DEVELOPMENT-CONTROL/

01-PUBLIC-WEBSITE/

02-TPI-COMMUNITY/

03-TPI-CREATOR-SYSTEMS/

04-TPI-ADMINISTRATION/

05-TPI-RESEARCH-AND-EDUCATION/

06-TPI-APPLICATIONS/

07-TPI-SHARED-INFRASTRUCTURE/

08-TPI-OPERATIONS-AND-RELEASES/

These are DOCUMENTATION DIRECTORIES.

Do not move application source code.

Do not create Git worktrees.

Do not create branches.

Do not restructure the website.

If the audit identifies additional major
divisions, document the proposal before
adding them.

=====================================================================
6. MASTER DEVELOPMENT CONTROL
=====================================================================

Inside:

00-MASTER-DEVELOPMENT-CONTROL/

Create:

00-MASTER-DEVELOPMENT-CONTROL.md

01-MASTER-DEVELOPMENT-PLAN.md

02-MASTER-SYSTEM-MAP.md

03-ACTIVE-MISSIONS.md

04-SHARED-DEPENDENCIES.md

05-RELEASE-REGISTER.md

06-IDEA-BACKLOG.md

PURPOSE:

00-MASTER-DEVELOPMENT-CONTROL.md

This is the primary entry point.

It must link to every division master.

It must provide:

- Complete module registry.
- Module ownership.
- Current development status.
- Pending work summary.
- Git checkpoint status.
- Deployment verification status.
- Current priority.
- Links to detailed records.

01-MASTER-DEVELOPMENT-PLAN.md

Document:

- Development workflow.
- Module lifecycle.
- Mission selection.
- Mission suspension.
- Mission completion.
- Checkpoint review.
- Release preparation.
- Documentation update requirements.

02-MASTER-SYSTEM-MAP.md

Document:

- Complete module hierarchy.
- Relevant source directories.
- Major routes and entry points.
- Shared dependencies.
- Integration boundaries.
- Mermaid diagrams where useful.

03-ACTIVE-MISSIONS.md

Track:

- Current active mission.
- Authorized scope.
- Responsible repository.
- Relevant branch.
- Relevant worktree.
- Last verified checkpoint.
- Current blockers.
- Next action.

The current active development priority is:

TPI CREATOR STUDIO / STUDIOFLOW.

04-SHARED-DEPENDENCIES.md

Track shared files and services.

Pay special attention to:

functions/api/[[path]].js
worker.js
lib/auth.js

Identify every module that depends on them
as far as the evidence permits.

05-RELEASE-REGISTER.md

Track:

- Local development state.
- Verified source checkpoint.
- Website integration checkpoint.
- Staging verification.
- Production verification.
- Migration dependencies.
- Release blockers.
- Rollback readiness.

Do not confuse committed code with deployed code.

06-IDEA-BACKLOG.md

Create the Rabbit Hole Parking Lot.

Ideas must include:

- Idea ID.
- Description.
- Associated module.
- Related modules.
- Priority if known.
- Status.
- Source or origin when known.

Do not treat brainstormed ideas as
authorized implementation tasks.

=====================================================================
7. CREATE DIVISION MASTER DOCUMENTS
=====================================================================

Each numbered division must have one
00 master document.

Examples:

01-PUBLIC-WEBSITE/
00-PUBLIC-WEBSITE-MASTER.md

02-TPI-COMMUNITY/
00-COMMUNITY-MASTER.md

03-TPI-CREATOR-SYSTEMS/
00-CREATOR-SYSTEMS-MASTER.md

04-TPI-ADMINISTRATION/
00-ADMINISTRATION-MASTER.md

05-TPI-RESEARCH-AND-EDUCATION/
00-RESEARCH-EDUCATION-MASTER.md

06-TPI-APPLICATIONS/
00-APPLICATIONS-MASTER.md

07-TPI-SHARED-INFRASTRUCTURE/
00-INFRASTRUCTURE-MASTER.md

08-TPI-OPERATIONS-AND-RELEASES/
00-OPERATIONS-MASTER.md

Each division master must include:

- Division purpose.
- Module inventory.
- Module links.
- Source locations.
- Current development state.
- Dependencies.
- Outstanding work.
- Verification state.
- Git checkpoint state.
- Production state.
- Known risks.

=====================================================================
8. CREATE INDIVIDUAL MODULE DOCUMENTS
=====================================================================

Create one numbered Markdown document for
every confirmed module.

Examples:

01-HOME-PAGE.md
02-ABOUT-PAGE.md
03-TPI-NEWS.md

01-COMMUNITY-FEED.md
02-TPI-MESSENGER.md
03-TPI-REELS.md

01-TPI-CREATOR-STUDIO.md
02-TPI-CONTENT-CREATOR.md

01-ADMIN-PANEL.md

01-SCRYING-APPLICATION.md

IMPORTANT:

Final filenames and numbering must reflect
the actual audit inventory.

Use stable identifiers.

Do not create duplicate records for the
same application.

If a module is only proposed, clearly mark
it PLANNED.

Every module document must include:

1. Module identity.

2. Purpose.

3. User-facing functionality.

4. Repository location.

5. Source directories.

6. Routes and entry points.

7. Shared dependencies.

8. Completed development.

9. Partially completed development.

10. Pending work.

11. Known issues.

12. Verification evidence.

13. Git checkpoint state.

14. Local environment state.

15. Staging state.

16. Production state.

17. Active development mission.

18. Next recommended action.

19. Links to existing TPI documentation.

20. Last audit date.

Do not mark functionality COMPLETE without
supporting evidence.

Use UNKNOWN or NOT VERIFIED where appropriate.

=====================================================================
9. STUDIOFLOW RECORD — HIGHEST PRIORITY
=====================================================================

The Creator Studio record must accurately
reflect the current verified state.

Known evidence:

Authoritative source repository:

/Users/toddknipple/Documents/StudioFlow/web

Approved source commit:

a919a881705c4f21dc184a6f2af8a5096d68e5f4

Website integrated assets:

index-AccwBwcd.js
index-TsnuK4Ub.css

Prior audit:

TPI-STUDIOFLOW-061

Repository investigation:

TPI-STUDIOFLOW-062

Document:

- Source checkpoint complete.
- Website integration correspondence verified.
- Website integration checkpoint pending.
- Shared backend hunk review pending.
- Migration 0053 pending approval.
- Production deployment not authorized.
- Production readiness not established.
- Owner data preservation requirements.
- Current release blockers.

Do not modify StudioFlow code.

Do not modify owner workspaces.

Do not deploy.

=====================================================================
10. MAP EXISTING UNCOMMITTED WORK
=====================================================================

Use the TPI-062 inventory as a starting point.

For each changed or untracked file:

- Associate it with a module or division.
- Record its Git status.
- Record whether it is shared.
- Record whether it is local-only.
- Record whether it is sensitive.
- Record whether its origin is uncertain.

Do not guess attribution.

Where one file serves multiple modules,
record shared ownership.

The master system must make existing
uncommitted work visible.

Do not stage or commit it.

=====================================================================
11. DEFINE MODULE DEVELOPMENT WORKFLOW
=====================================================================

Document the following lifecycle:

IDEA
  |
  v
BACKLOG
  |
  v
MISSION REVIEW
  |
  v
OWNER AUTHORIZATION
  |
  v
SCOPED DEVELOPMENT
  |
  v
LOCAL VERIFICATION
  |
  v
DOCUMENTATION UPDATE
  |
  v
CHECKPOINT REVIEW
  |
  v
OWNER-APPROVED COMMIT
  |
  v
INTEGRATION VERIFICATION
  |
  v
STAGING
  |
  v
OWNER-APPROVED PRODUCTION RELEASE

Document that:

- A module may be developed independently.
- Shared dependencies require explicit review.
- Git worktrees isolate working directories.
- Git worktrees do not isolate production services.
- Production releases require integration checks.
- No automatic deployment is authorized.

=====================================================================
12. RABBIT HOLE PROTOCOL
=====================================================================

Document a formal process for ideas that
arise outside the active mission.

When a new idea concerns another module:

1. Capture it in the idea backlog.

2. Associate it with the correct module.

3. Record cross-module dependencies.

4. Do not modify unrelated code.

5. Return to the active mission.

If the owner decides to switch missions:

1. Record the current mission state.

2. Document unfinished work.

3. Review Git status.

4. Identify a safe checkpoint or suspension.

5. Explicitly authorize the new mission.

No silent mission switching.

=====================================================================
13. GIT CHANGE-CONTROL DESIGN
=====================================================================

Document future safeguards:

- Pre-task Git status inspection.
- Explicit authorized file manifest.
- Module ownership.
- Shared-file review.
- Sensitive-file exclusions.
- No broad git add.
- Checkpoint review.
- Source/build verification.
- Release manifests.
- Worktree isolation.
- Rollback planning.

DO NOT IMPLEMENT GIT HOOKS YET.

DO NOT CREATE WORKTREES YET.

DO NOT MODIFY .gitignore YET.

DO NOT COMMIT.

The owner will review the architecture
before those changes are authorized.

=====================================================================
14. DOCUMENTATION INTEGRATION
=====================================================================

Preserve existing documentation.

Do not rewrite historical directive reports.

Do not duplicate historical reports into
new module files.

Link to authoritative historical records.

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-063-RESULT.md

The new master development system must
reference existing TPI development documentation.

Ensure relative Markdown links resolve.

=====================================================================
15. VERIFICATION
=====================================================================

Verify:

- Every identified module has a registry entry.
- Every module record links to its division.
- Every division links to the master.
- All numbered files are consistently named.
- No duplicate module identifiers.
- No broken internal Markdown links.
- No invented implementation claims.
- StudioFlow status is accurate.
- Uncommitted work is classified.
- Sensitive information is not copied.
- Existing documentation is preserved.
- No application code changed.
- No Git staging occurred.
- No production resources were accessed.

Run git diff --check.

Do not run uncontrolled network tests.

=====================================================================
16. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Modify application code.
- Modify runtime assets.
- Modify StudioFlow source.
- Stage files.
- Commit.
- Push.
- Pull.
- Fetch.
- Merge.
- Rebase.
- Reset.
- Clean.
- Stash.
- Delete existing files.
- Move existing files.
- Rename existing files.
- Create branches.
- Create Git worktrees.
- Modify .gitignore.
- Deploy.
- Apply migrations.
- Modify Cloudflare.
- Access owner production data.
- Modify browser storage.
- Modify recordings or backups.

DOCUMENTATION WRITES ONLY.

=====================================================================
17. REQUIRED RESULT
=====================================================================

TPI-063 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. REPOSITORY STATE

B. PLATFORM INVENTORY

C. MASTER DEVELOPMENT TREE CREATED

D. DIVISION MASTERS CREATED

E. MODULE DOCUMENTS CREATED

F. SHARED DEPENDENCY MAP

G. UNCOMMITTED WORK MAPPING

H. STUDIOFLOW DEVELOPMENT STATUS

I. RABBIT HOLE PROTOCOL

J. GIT CHANGE-CONTROL DESIGN

K. DOCUMENTATION INTEGRATION

L. VERIFICATION RESULTS

M. REMAINING UNCERTAINTIES

N. NEXT RECOMMENDED ACTION

Provide exactly one recommended next action.

=====================================================================
18. COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only when:

- The actual website architecture is audited.
- Every confirmed major module is identified.
- The numbered master documentation tree exists.
- Division master documents exist.
- Module documents exist.
- Source ownership is recorded.
- Shared dependencies are mapped.
- Existing uncommitted work is represented.
- StudioFlow remains the primary mission.
- Documentation links are verified.
- No application code or Git state was changed.

If full coverage cannot be established,
report PARTIAL and list exact gaps.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The Paranormal Initiative is one interconnected
platform containing multiple independently
managed development modules.

The owner wants one authoritative Markdown
development system that shows:

WHAT EXISTS.
WHAT WORKS.
WHAT IS UNFINISHED.
WHERE THE CODE LIVES.
WHICH MODULE OWNS IT.
WHAT HAS BEEN COMMITTED.
WHAT HAS BEEN DEPLOYED.
WHAT WE ARE WORKING ON NEXT.

Build that documentation foundation now.

Do not change the functioning website.

Do not restructure Git.

Do not deploy.

Keep TPI Creator Studio as the current
development priority.

=====================================================================
END DIRECTIVE — TPI-063
=====================================================================

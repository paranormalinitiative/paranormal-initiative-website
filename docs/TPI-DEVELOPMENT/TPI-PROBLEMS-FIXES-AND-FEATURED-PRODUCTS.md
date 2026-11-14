# TPI Problems, Fixes, and Featured Products Reference

**Owner:** The Paranormal Initiative  
**Purpose:** A searchable memory aid for recurring problems, confirmed fixes,
release evidence, and the product direction for StudioFlow and Nova Workspace.  
**Created:** 2026-11-14  
**Time zone:** America/New_York unless a record explicitly says UTC.

This is a living reference. When something breaks, search the symptom, route,
error message, or product name here first. A historical match is a starting
point for investigation—not proof that the current source, database, browser
state, or production release is identical.

## How to use this file

1. Search the **Quick symptom lookup** for the visible problem.
2. Open the matching incident below and compare the date, route, account type,
   and environment.
3. Recheck the current source and runtime before applying the old fix.
4. Follow the linked completion record or maintained regression test.
5. Add a new entry after the problem is understood and the fix is verified.

Do not use a browser cache clear, production data change, migration, or access
grant as a first response. Confirm the exact scope and preserve owner data.

## Quick symptom lookup

| If you see this | Check first | Likely area |
| --- | --- | --- |
| A member cannot save a profile photo or banner | [Profile media update](#inc-2026-11-14-01--profile-photo-or-banner-would-not-update) | Member Profile, R2 upload, shared profile API |
| A new image previews but disappears after saving | [Profile media update](#inc-2026-11-14-01--profile-photo-or-banner-would-not-update) | File-input cleanup, object URL, cache version |
| A member without an account email cannot save uploaded profile media | [Profile media permissions recurrence](#inc-2026-11-14-07--profile-media-permissions-and-email-gate-recurrence) | Member boundary, profile save validation, R2 media |
| A new Community Feed post shows its opening line twice | [Community post title duplication](#inc-2026-11-14-08--community-post-auto-title-duplicated-the-body) | Composer auto-title, post body, legacy rendering |
| Login works, then the member is sent somewhere unexpected | [Member access](#inc-2026-11-14-03--member-access-and-home-redirect-loop) | Session identity, staff-role fallback, stale browser state |
| Password reset appears to work but sign-in fails | [Password recovery](#inc-2026-11-14-04--password-storage-and-recovery-hardening) | Session creation, password hash compatibility, recovery code |
| A YouTube link is only a URL or playback is broken in the Feed | [YouTube preview](#inc-2026-11-14-05--community-feed-youtube-preview) | Link preview extraction, iframe boundary, overlay isolation |
| Help content is visible to the wrong audience | [Two Help Centers](#inc-2026-11-14-06--member-help-center-and-internal-help-desk-confusion) | Member Help Center, internal Help Desk, Admin Center gate |
| StudioFlow controls are missing during an automated check | [StudioFlow acceptance timing](#inc-2026-11-14-02--studioflow-acceptance-check-clicked-before-controls-were-ready) | Browser hydration, release acceptance timing |
| A Studio opens with another Studio's scenes or media | [Studio isolation](#inc-2026-10-25-01--studio-creation-and-workspace-isolation) | Per-Studio identity, workspace hydration, local snapshots |
| Restoring a Nova document creates an unexpected extra version | [Nova restore autosave](#inc-2026-11-13-01--nova-restore-created-an-extra-autosave-version) | Snapshot hydration, editor update events, versioning |
| Nova publishing permissions look too broad or too narrow | [Nova publishing workflow](#inc-2026-11-13-02--nova-publishing-and-editorial-permissions) | Capability checks, restricted subjects, direct publishing |
| Messenger opens as a blank or unusable surface | [Messenger navigation](#inc-2026-11-10-02--messenger-navigation-and-release-certification) | Shared member shell, route target, disposable schema |

## Incident and fix register

### INC-2026-11-14-01 — Profile photo or banner would not update

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 10:33:49 ET**, shown in the member Community Feed report screenshot |
| Fixed in source | **2026-11-14 10:49:39 ET**, commit `ac3cf199` |
| Final release source | **2026-11-14 11:08:18 ET**, commit `c1b48003` |
| Production Worker | `9be0c066-9991-49b4-82a4-e1768aab42c4` |
| Status | **Deployed and live verified** |

**What happened:** A member could not reliably update a profile photo or
profile background/banner. The editor had a photo preview but not a complete
banner-file preview path. Selected files could remain in the form after a save,
causing later saves to upload them again. The client used a separate raw save
request instead of the shared API client, the fallback save path did not always
preserve the banner field, and stale script versions could leave a browser
running old behavior.

**How it was fixed:**

- Added photo and banner previews when a file is selected.
- Added shared validation for supported image formats and a 12 MB limit.
- Added a clear unsupported HEIC/HEIF message.
- Switched profile saving to the shared `TPIApi.updateProfile()` path.
- Preserved `profile_banner_url` in every server save branch.
- Cleared file inputs and temporary object URLs after a successful save.
- Corrected the CSS background URL handling.
- Added profile-media cache-busting across the affected member/admin pages.
- Added Firefox regression coverage for selecting, previewing, saving, and
  clearing both files.

**Verification:** The focused API/profile suite passed **40 checks**; the
isolated Firefox profile-media flow passed **49/49**; the final guarded release
passed **35 preflight gates**, anonymous smoke **10/10**, and live Firefox
acceptance **65/65**.

**Useful references:**

- [`member-login.js`](../../member-login.js) — shared profile editor and upload flow
- [`functions/api/[[path]].js`](../../functions/api/[[path]].js) — upload and profile API
- [`tpi-member-profile-feed-firefox.mjs`](../../scripts/verify/tpi-member-profile-feed-firefox.mjs) — regression coverage

### INC-2026-11-14-07 — Profile media permissions and email-gate recurrence

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 14:00:56 ET**, shown in the member Community Feed report screenshot |
| Root cause confirmed | **2026-11-14**, source audit and production member probe |
| Fixed in source | **2026-11-14**, commit `d1cb8a5c` |
| Certified release | `rel-d1cb8a5c5d5c-5088f9e96a85`, shared-API profile |
| Production Worker | `fbfd467e-f231-4cc6-8769-23103a47e959` |
| Status | **Deployed and live verified** |

**What happened:** The upload endpoints correctly required a signed-in member,
but the profile editor still marked the account email field as required. The
client also stopped the profile-media flow when an account had no recovery
email, and the server rejected the later profile save for that same account.
That made a normal member appear unable to add an avatar or background banner,
even though the member permission boundary itself was correct. Uploads could
also be stored before the later save failed, creating confusing partial state.

**How it was fixed:**

- Kept profile photo and profile banner uploads authenticated with the shared
  `requireMember` boundary: anonymous requests remain denied, while regular
  signed-in members are allowed.
- Removed the unnecessary required-email gate from the member profile editor.
- Allowed an existing account with no email to save profile media and other
  profile fields; a supplied email is still validated.
- Preserved an existing account email when the form submits the email field
  blank, so a save cannot accidentally erase it.
- Bumped the shared profile script cache version from `v49` to `v50` across
  every affected member and admin-facing page.
- Added source, API, and browser regression coverage for anonymous denial,
  regular-member photo/banner upload, readable stored media, and cleanup.

**Verification:** Local member interaction contracts passed **10/10**;
local profile/feed API checks passed **47/47**; isolated Firefox profile
acceptance passed **49/49**; the guarded shared-API preflight passed **11
gates** in about **31 seconds**; production anonymous smoke passed **10/10**;
and the live disposable production member probe passed anonymous denial **401**,
photo upload **200**, banner upload **200**, readable media **200/200**, and
profile cleanup **200**. The disposable account was restored to blank media and
blank correspondence after the check.

**Lesson:** Permission checks must be validated across the whole user journey:
authentication, upload authorization, file storage, profile save validation,
media readability, cache freshness, and cleanup. A correct endpoint permission
is not enough if the editor or the follow-up save blocks the same member.

**Permanent protection now in place:**

- The shared member-interaction contract now fails if either upload route loses
  its `requireMember` boundary, the editor makes recovery email required again,
  the server stops preserving an existing email, media validation is bypassed,
  or the editor stops uploading both files before saving.
- The official Firefox profile regression now explicitly checks that the email
  field is optional, clears it before saving, previews both files, saves both
  files, confirms the returned media URLs, and confirms the file inputs clear.
- The complete local QA runner executes the member profile-media source
  contracts on every quality-gate run, and release preflight continues to run
  the targeted profile/browser regression whenever the relevant site surface
  changes.
- Production promotion remains fail-closed: a failed contract or browser
  regression prevents the certified candidate from being deployed.

**Protected-app note:** This was classified as a shared-API release. StudioFlow,
Nova Workspace, and Creator Studio were protected by the byte-integrity guard
and were not rebuilt or live-accepted for this unrelated member-profile repair.

**Useful references:**

- [`member-profile.html`](../../member-profile.html) — email field and profile editor
- [`member-login.js`](../../member-login.js) — upload/save flow and cache version
- [`functions/api/[[path]].js`](../../functions/api/[[path]].js) — member upload and profile-save permissions
- [`tpi-member-interactions.mjs`](../../scripts/verify/tpi-member-interactions.mjs) — permission/source contracts
- [`tpi-member-profile-feed.mjs`](../../scripts/verify/tpi-member-profile-feed.mjs) — API/profile regression coverage
- [`tpi-member-profile-feed-firefox.mjs`](../../scripts/verify/tpi-member-profile-feed-firefox.mjs) — browser regression coverage

### INC-2026-11-14-08 — Community post auto-title duplicated the body

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 14:24:59 ET**, shown in the Community Feed report screenshot |
| Root cause confirmed | **2026-11-14**, composer and feed-rendering source audit |
| Fixed in source | **2026-11-14**, current `codex/tpi-development` release candidate |
| Product/surface | Community Feed post composer and shared post card renderer |
| Status | **Prepared for guarded production release** |

**What happened:** The composer generated a title from the first 120 characters
of the member's full message, then sent the unchanged full message as the body.
The feed rendered both fields, so the opening text appeared once as a large
title and again at the beginning of the post body. In the supplied post, the
generated title also included multiple sentences because it used a character
limit instead of the first line.

**How it was fixed:**

- The composer now uses the first non-empty line as the post title, up to the
  existing title limit.
- For multi-line posts, that opening title line is removed from the stored body
  before submission, leaving one headline followed by the message.
- Single-line posts still render once, without an empty body or duplicate title.
- Existing posts are not rewritten. The feed detects the legacy pattern where
  the body starts with the stored auto-title and suppresses only that duplicate
  heading at render time.
- Added source-contract coverage for both new-post payload construction and
  legacy duplicate-title rendering.

**Verification:** Member interaction source contracts passed **16/16**;
the official Firefox member/profile regression passed **50/50** after the
change. The fix is classified as a website/member experience release and does
not modify StudioFlow, Nova Workspace, or Creator Studio.

**Lesson:** A generated presentation field must not repeat source content. When
older records already contain the duplication, repair the renderer safely first
and avoid a data migration unless the owner explicitly wants historical records
rewritten.

### INC-2026-11-14-02 — StudioFlow acceptance clicked before controls were ready

| Field | Record |
| --- | --- |
| Detected | **2026-11-14**, during the first guarded production release attempt |
| Root-cause fix | **2026-11-14 11:08:18 ET**, commit `c1b48003` |
| Initial production response | The guarded release automatically rolled back to Worker `00d59d5c-d007-4de0-99ae-e2d15884068d` |
| Final status | **Repaired, recertified, redeployed, and live verified** |

**What happened:** The live acceptance browser occasionally saw the StudioFlow
shell before its media controls had finished hydrating. The test interpreted
the temporary absence of controls as the setup screen and clicked **Record
without going live** too early. The browser then ended up at Member Home and
the release was correctly treated as failed.

**How it was fixed:** The acceptance check now waits for the actual video and
audio controls before deciding whether setup is needed. If setup is needed, it
also waits for the setup button to be present before clicking it. The check was
rerun locally at **65/65**, the complete preflight passed **35 gates**, and the
production retry passed live Firefox **65/65**.

**Lesson:** A rendered shell is not the same as a ready application. Browser
automation must wait on the user-facing control state it intends to exercise.

### INC-2026-11-14-03 — Member access and home redirect loop

| Field | Record |
| --- | --- |
| Recorded | **2026-11-10**, member-access recovery record |
| Symptom | A signed-in member could be sent through a home redirect loop or receive an incomplete role-aware session |
| Cause | An optional staff-role table was absent in one environment and the browser retained stale identity state |
| Fix | Server-side access resolution was made tolerant of the optional table; stale client identity no longer overruled the authoritative session |
| Status | **Repaired, deployed, and verified** |

**How it was fixed:** The server now fails safely when the additive staff-role
table is unavailable, while still preserving normal member access. The browser
must use the authoritative session response instead of trusting old local
identity data. Appointment-based staff roles remain a separate schema/runtime
concern and must be checked independently.

**Lesson:** Authentication, member navigation, and optional staff appointments
are related but not interchangeable. Diagnose the session, route, and role
source separately.

### INC-2026-11-10-02 — Messenger navigation and release certification

| Field | Record |
| --- | --- |
| Recorded | **2026-11-10**, Messenger continuation and release records |
| Symptom | Chat and Hide navigation did not consistently return through the shared member shell; a release certification run also found a disposable-schema mismatch |
| Fix | Repaired shared navigation targets and hardened the disposable release harness so the missing fixture table could not be mistaken for a production defect |
| Verification | Focused Firefox navigation passed **18/18**; later release checks passed the isolated API and live browser gates |
| Status | **Repaired and released** |

**Lesson:** A local disposable database failure must be isolated from the
production schema. Do not apply a production migration merely to make a
disposable test fixture pass.

### INC-2026-11-14-04 — Password storage and recovery hardening

| Field | Record |
| --- | --- |
| Detected and repaired | **2026-11-13 21:12:04 ET through 2026-11-14 00:51:23 ET** |
| Problem | Password recovery needed clearer completion behavior, stronger attempt limits, and modern storage for new or changed credentials |
| Fix | Added visible reset completion, guarded recovery attempts, salted PBKDF2-SHA-256 for new/changed credentials, and safe legacy-hash upgrade after successful login |
| Verification | Password hash compatibility **9/9**; password recovery **23/23** plus Firefox interaction; no bulk credential rewrite |
| Status | **Deployed and live verified** |

**Lesson:** Password changes must preserve existing member access while
improving storage. A compatibility upgrade on successful login is safer than a
bulk rewrite of production credentials.

**Reference:** [`2026-11-14-PASSWORD-HASH-MODERNIZATION.md`](300-COMPLETED-WORK/2026-11-14-PASSWORD-HASH-MODERNIZATION.md)

### INC-2026-11-14-05 — Community Feed YouTube preview

| Field | Record |
| --- | --- |
| Recorded | **2026-11-14 00:30:38 ET**, repair commit `9e28d637` |
| Symptom | YouTube attachments in Community Feed did not consistently show ordered previews or play inside the feed |
| Fix | Repaired link-preview extraction, preserved direct fallback links, added privacy-enhanced iframe playback, and isolated Messenger overlays from the acceptance browser |
| Verification | Link-preview regression **12 passed**; browser verification covered two ordered preview cards and in-feed playback |
| Status | **Deployed and live verified** |

**Lesson:** Embedded third-party content needs both a useful in-site preview and
a direct fallback link. External iframe behavior must not be allowed to cover
or impersonate unrelated member controls.

**Reference:** [`2026-11-14-COMMUNITY-FEED-YOUTUBE-PREVIEW-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-COMMUNITY-FEED-YOUTUBE-PREVIEW-REPAIR.md)

### INC-2026-11-14-06 — Member Help Center and internal Help Desk confusion

| Field | Record |
| --- | --- |
| Recorded | **2026-11-14 01:56:25 ET through 03:31:52 ET** |
| Problem | Member help and internal operational guidance were too easy to confuse, and the navigation did not provide enough expandable organization |
| Fix | Created a member-facing Help Center for site use, policies, safety, abuse reporting, and support; separated the internal Help Desk into protected Admin Center content for administrators, moderators, and credentialed staff |
| Navigation rule | Member **Help Center** appears above **Log Out** in the member navigation; internal procedures remain protected and are not exposed to ordinary members |
| Status | **Deployed and live verified** |

**Lesson:** Audience boundaries are part of the product design. A member
should be able to find help without seeing ban procedures, staff actions, or
internal credentials guidance.

**References:**

- [`2026-11-14-HELP-CENTER-FOUNDATION.md`](300-COMPLETED-WORK/2026-11-14-HELP-CENTER-FOUNDATION.md)
- [`2026-11-14-HELP-CENTER-SEPARATION.md`](300-COMPLETED-WORK/2026-11-14-HELP-CENTER-SEPARATION.md)

### INC-2026-10-25-01 — Studio creation and workspace isolation

| Field | Record |
| --- | --- |
| Recorded | **2026-10-25**, StudioFlow lifecycle recovery |
| Symptom | Creating or switching Studios could reuse another Studio's scenes, media, or configuration |
| Cause | Studio identity, active broadcast state, and workspace hydration were not being treated as one isolated lifecycle |
| Fix | Added independent Studio identity, clean defaults for new Studios, per-Studio hydration, save-before-switch behavior, refresh recovery, and safe cleanup of disposable workspaces |
| Verification | Maintained lifecycle suite passed **29/29** and ownership suite passed **40/40** in the current release cycle |
| Status | **Repaired and maintained by regression tests** |

**Lesson:** A Studio is not just a production title. It has its own identity,
configuration, scenes, media assignments, and ownership boundary.

**Reference:** [`2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`](300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md)

### INC-2026-11-13-01 — Nova restore created an extra autosave version

| Field | Record |
| --- | --- |
| Recorded | **2026-11-13**, Nova publishing workflow audit |
| Symptom | Restoring a server snapshot could trigger an unintended editor update and create an extra version immediately afterward |
| Cause | Snapshot hydration emitted a normal editor update event, which the autosave path treated as user editing |
| Fix | Suppressed update emission while hydrating the server snapshot and strengthened the verifier to require exactly one new restored version |
| Verification | Nova Core browser/Worker foundation **105/105**; editor/browser suite **134/134**; persistence **67/67** |
| Status | **Deployed and live verified** |

**Lesson:** Restore is a state transition, not a user edit. Hydration must be
explicitly separated from ordinary typing and autosave events.

**Reference:** [`2026-11-13-NOVA-PUBLISHING-WORKFLOW-AUDIT.md`](300-COMPLETED-WORK/2026-11-13-NOVA-PUBLISHING-WORKFLOW-AUDIT.md)

### INC-2026-11-13-02 — Nova publishing and editorial permissions

| Field | Record |
| --- | --- |
| Recorded | **2026-11-13**, Nova publishing workflow audit |
| Problem | Publishing rules needed to distinguish ordinary Education Center subjects from restricted Ghostology and TPI Video subjects |
| Fix | Kept direct publishing for open subjects, restricted Ghostology/TPI Video creation to the approved leadership boundary, preserved review rounds already in progress, and kept editorial capability grants separate from account roles |
| Verification | Corrected isolated release suite **295/295**; production smoke **10/10**; production Firefox **65/65** |
| Status | **Deployed and live verified** |

**Lesson:** Contributor access, editorial authority, leadership recognition,
and administrative role are different layers. A visible badge or profile title
must never become a hidden permission grant.

## Release and diagnosis rules learned from these incidents

1. **Use the authoritative session.** Do not trust stale browser identity,
   cached role data, or a client-only access flag.
2. **Separate audiences.** Member help, staff procedures, Admin Center access,
   Creator Studio access, and Nova editorial capabilities are different gates.
3. **Treat fallback paths as real paths.** Local fallback storage, older schema
   compatibility, and server error branches must preserve the same important
   fields as the primary path.
4. **Wait for ready controls, not merely a rendered shell.** This applies to
   browser automation and to user-facing asynchronous interfaces.
5. **Preserve existing data by default.** Prefer additive changes, versioned
   records, compare-and-swap writes, and isolated disposable fixtures.
6. **Verify the actual interaction.** A static source check is not enough for
   uploads, previews, save buttons, Studio switching, restore, or navigation.
7. **A deployment is not complete until live acceptance passes.** The maintained
   sequence is local auth lifecycle → full preflight → guarded production
   deploy → live smoke → isolated Firefox acceptance → final Git parity.

## Featured products

### 1. StudioFlow — the production workspace

**What it is:** StudioFlow is TPI's creator-facing production environment. It
is where a Creator prepares, organizes, rehearses, records, and manages a
production. The canonical source is maintained separately at
`/Users/toddknipple/Documents/StudioFlow/web`; the website repository receives
verified integration output through the maintained source-to-live workflow.

**Current verified product surfaces:**

- Independent Studios with separate identities and workspace configuration.
- Home, Library, Destinations, Notes/Nova Edit, Teleprompter, and production
  setup flows.
- Scenes with Intro Video, Scene, and Outro Video behavior.
- Media assets, video clips, timers, Sound Effects, and Background Music.
- Banners, Style, Voice FX, People, Private chat, Recording, and Recording &
  Storage surfaces.
- Browser-local save, complete portable backup, restore-as-new, and media
  persistence checks.
- Responsive owner-facing behavior verified through isolated Firefox checks.

**Product boundary:** StudioFlow is the production surface. It is not the
Administration Center, not the member Help Center, and not the full editorial
document system. External provider connections, remote guests, and other
future live-production capabilities remain subject to their own entitlement,
provider, and acceptance gates.

**Current posture:** StudioFlow Core is stable and in maintenance mode. Future
work should preserve the verified production, scene, media, persistence, and
ownership contracts. Repairs, security work, and explicitly approved product
increments continue through the guarded release workflow.

**Primary references:**

- [`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`](TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md)
- [`TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`](TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md)
- [`TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`](TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md)
- [`TPI-STUDIOFLOW-MASTER-HANDOFF.md`](TPI-STUDIOFLOW-MASTER-HANDOFF.md)

### 2. Nova Workspace — the professional authoring workspace

**Canonical internal name:** Nova Editorial Workspace.  
**Suggested product-facing shorthand:** Nova Workspace.

**What it is:** Nova Workspace is TPI's professional document and presentation
authoring environment for Contributors, editorial members, Dual/All-Access
members, and explicitly authorized staff. It uses Nova Core for structured,
owner-scoped documents, presentations, revisions, autosave, and conflict-safe
saves.

**Current verified foundation:**

- Structured Nova documents with owner-scoped persistence and revisions.
- Shared editor architecture based on the Nova document model.
- Content Editor integration and controlled migration planning that preserves
  existing article records and public URLs.
- Nova Slides foundation with presentation creation, slide thumbnails,
  selection, add/duplicate/reorder/delete, text and shape elements, backgrounds,
  speaker notes, and optimistic-version saves.
- Publishing workflow boundaries for open Education Center subjects and
  leadership-restricted subjects.
- Restore behavior that creates one intentional new version rather than an
  accidental extra autosave.

**What we are doing next:**

- Continue the shared Nova Core editor rather than creating separate document
  formats for each product.
- Expand Nova Docs toward professional research papers, lessons, reports,
  templates, citations, comments, review, DOCX import/export, and print-quality
  output.
- Expand Nova Slides with richer assets, typography, layouts, preview mode,
  PDF export, and practical PPTX interchange.
- Keep editorial documents separate from published article records until an
  explicitly approved adapter/conversion phase is ready.
- Preserve version history, local draft recovery, owner scoping, and
  compare-and-swap conflict protection.

**Product boundary:** Nova Workspace is the full professional authoring and
editorial surface. It is not a replacement for StudioFlow's production
controls. It is also not a permission shortcut: Contributor, Creator,
Publisher/Reviewer, leadership, and Administrator capabilities remain separate
server-side decisions.

**Primary references:**

- [`TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`](400-FUTURE-DEVELOPMENT/TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md)
- [`TPI-NOVA-EDITORIAL-WORKSPACE-MIGRATION-PLAN.md`](400-FUTURE-DEVELOPMENT/TPI-NOVA-EDITORIAL-WORKSPACE-MIGRATION-PLAN.md)
- [`TPI-NOVA-006-SLIDES-AND-STUDIOFLOW-NOVA-EDIT-REPORT.md`](400-FUTURE-DEVELOPMENT/TPI-NOVA-006-SLIDES-AND-STUDIOFLOW-NOVA-EDIT-REPORT.md)
- [`2026-11-13-NOVA-PUBLISHING-WORKFLOW-AUDIT.md`](300-COMPLETED-WORK/2026-11-13-NOVA-PUBLISHING-WORKFLOW-AUDIT.md)

### 3. How StudioFlow and Nova fit together

Nova is the shared authoring technology. StudioFlow is the production
environment that uses a streamlined Nova Edit experience. Nova Workspace is the
full professional/editorial experience.

```text
Nova Core
  ├── StudioFlow Nova Edit
  │     ├── production documents and scripts
  │     └── production presentations
  │
  └── Nova Workspace
        ├── Nova Docs
        └── Nova Slides

StudioFlow production resource bridge (planned expansion)
  Nova Edit Presentation → Add to Production → Webinar / Livestream / Recording
```

The guiding rule is: **one shared content model, two appropriately scoped
experiences**. A Creator should not need editorial authority to prepare a
production. An editorial Contributor should not need StudioFlow production
access to write a research paper. Content can move between the experiences only
through an explicit, permission-aware bridge.

## New-entry template

Copy this section for the next confirmed problem. Keep the wording factual and
record what was actually tested.

```markdown
### INC-YYYY-MM-DD-NN — Short problem name

| Field | Record |
| --- | --- |
| Detected | YYYY-MM-DD HH:MM ET/UTC |
| Fixed in source | YYYY-MM-DD HH:MM ET/UTC, commit or release |
| Product/surface | Member site / Admin Center / StudioFlow / Nova |
| Environment | Local / disposable / development / production |
| Symptom | What the person or test actually saw |
| Root cause | The confirmed cause, not the first guess |
| Fix | The code, data, configuration, or process change |
| Verification | Exact test and pass count |
| Production status | Not deployed / deployed / rolled back / live verified |
| References | Completion record, source files, regression test |

**Lesson:** The reusable rule learned from this incident.
```

## Source-of-truth reminders

- Website source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Authoritative StudioFlow source: `/Users/toddknipple/Documents/StudioFlow/web`
- Official local StudioFlow URL: `http://127.0.0.1:8787/studio/`
- Production site: `https://paranormalinitiative.com/`
- Production StudioFlow: `https://paranormalinitiative.com/studio/`
- Required release sequence: `npm run verify:local-auth-lifecycle`,
  `npm run release:preflight`, then
  `TPI_PRODUCTION_DEPLOY=approved npm run release:production`


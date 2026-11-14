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
| Update Profile does not open the editor or a member bio is missing from the header | [Member profile editor and short bio](#inc-2026-11-14-09--member-profile-editor-and-short-bio) | Profile route, member identity header, self-service profile API |
| Update Profile opens the public profile instead of the editor, or avatars/backgrounds still do not load | [Production profile editor route](#inc-2026-11-14-12--production-profile-editor-route-redirect) | Cloudflare HTML handling, editor route, profile media render |
| Login works, then the member is sent somewhere unexpected | [Member access](#inc-2026-11-14-03--member-access-and-home-redirect-loop) | Session identity, staff-role fallback, stale browser state |
| Password reset appears to work but sign-in fails | [Password recovery](#inc-2026-11-14-04--password-storage-and-recovery-hardening) | Session creation, password hash compatibility, recovery code |
| A YouTube link is only a URL or playback is broken in the Feed | [YouTube preview](#inc-2026-11-14-05--community-feed-youtube-preview) and [body-link recurrence](#inc-2026-11-14-10--community-feed-youtube-body-link-recurrence) | Link preview extraction, body URL discovery, iframe boundary |
| Firefox acceptance cannot see markup that is present in source | [Local Worker asset freshness](#inc-2026-11-14-11--local-worker-asset-freshness) | Local staged assets, Worker reuse, browser acceptance |
| Help content is visible to the wrong audience | [Two Help Centers](#inc-2026-11-14-06--member-help-center-and-internal-help-desk-confusion) | Member Help Center, internal Help Desk, Admin Center gate |
| StudioFlow controls are missing during an automated check | [StudioFlow acceptance timing](#inc-2026-11-14-02--studioflow-acceptance-check-clicked-before-controls-were-ready) | Browser hydration, release acceptance timing |
| A Studio opens with another Studio's scenes or media | [Studio isolation](#inc-2026-10-25-01--studio-creation-and-workspace-isolation) | Per-Studio identity, workspace hydration, local snapshots |
| Restoring a Nova document creates an unexpected extra version | [Nova restore autosave](#inc-2026-11-13-01--nova-restore-created-an-extra-autosave-version) | Snapshot hydration, editor update events, versioning |
| Nova publishing permissions look too broad or too narrow | [Nova publishing workflow](#inc-2026-11-13-02--nova-publishing-and-editorial-permissions) | Capability checks, restricted subjects, direct publishing |
| Messenger opens as a blank or unusable surface | [Messenger navigation](#inc-2026-11-10-02--messenger-navigation-and-release-certification) | Shared member shell, route target, disposable schema |
| Messenger Chats shows the full conversation, truncates the thread, or overlaps the Members list | [Messenger chat-list truncation](#inc-2026-11-14-13--messenger-chat-list-truncation-and-layout) | Chat preview rendering, contacts-column sizing, independent scrolling |
| Messenger MP4 or ZIP upload returns 500/1101, ZIP is missing from the picker, or paste does not work | [Messenger media and clipboard repair](#inc-2026-11-14-14--messenger-media-upload-and-clipboard) | Media authorization query, browser MIME normalization, file pickers, shared text controls |
| A non-YouTube video link shows only a chain icon or will not play | [External video preview](#inc-2026-11-14-15--external-non-youtube-video-preview) | Link-preview metadata, direct video responses, JavaScript-rendered or HTTP-only source pages |
| Owner/Founder receives a staff-role access error in the Admin Center | [Owner Admin authorization](#inc-2026-11-14-16--owner-admin-authorization-mismatch) | Server-side contributor role, legacy admin mapping, protected Admin Center route |

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
| Fixed in source | **2026-11-14**, commit `5b031f11` |
| Product/surface | Community Feed post composer and shared post card renderer |
| Certified release | `rel-5b031f11b840-15bf2cb870a6`, full profile |
| Production Worker | `6f1456ed-5a2b-4728-b484-daa16cb356f4` |
| Status | **Deployed and live verified** |

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
change; the guarded release passed **37 certification gates**; production
anonymous smoke passed **10/10**; and live isolated Firefox acceptance passed
**65/65**. This release was escalated to the full profile because the release
QA guard itself changed in the same commit; the protected applications passed
their required checks and no unrelated application source was changed.

**Lesson:** A generated presentation field must not repeat source content. When
older records already contain the duplication, repair the renderer safely first
and avoid a data migration unless the owner explicitly wants historical records
rewritten.

### INC-2026-11-14-09 — Member profile editor and short bio

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 14:32:57 ET**, shown in the supplied public-profile and editor screenshots |
| Fixed in source | **2026-11-14 14:54 ET**, commit `e59ca4d7` |
| Product/surface | Public member profile and self-service profile editor |
| Certified release | `rel-e59ca4d7fd10-49b1b8992c38`, shared-API profile |
| Production Worker | `9113ac7d-1663-44e1-aa95-819d185ce350` |
| Status | **Deployed and live verified** |

**What happened:** The public profile's Update Profile action did not have an
explicit editor anchor, the profile options menu lacked a direct Edit profile
entry, and the editor's existing `bio` field was presented as a long biography.
The public identity header did not display a concise bio beneath the member's
name and handle.

**How it was fixed:** The public action and profile menu now target
`/member-profile.html#profile-editor`. The public header shows a normalized
short bio when one exists. The editor now uses a 175-character Short Bio field
with a live counter, Save Changes, and Cancel. The self-service API enforces the
same 175-character limit in both its primary and compatibility save paths.

**Verification:** Member interaction source contracts passed **18/18**; local
authentication passed **38/38**; member boundary checks passed **48/48**; the
official Firefox profile/feed regression passed **53/53**; production smoke
passed **10/10**; and the guarded preflight completed in **30.9 seconds**.

**Protected-app note:** This was a shared-API release. StudioFlow, Nova
Workspace, and Creator Studio were protected by the byte-integrity guard and
were not modified or unnecessarily rebuilt.

**Lesson:** Profile fields need one navigation contract and one validation
contract across the public page, editor, API, and browser regression. A stored
field is not user-facing functionality until members can reach it, save it, and
see the result.

**Completion record:**
[`2026-11-14-MEMBER-PROFILE-EDITOR-AND-SHORT-BIO-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-MEMBER-PROFILE-EDITOR-AND-SHORT-BIO-REPAIR.md)

### INC-2026-11-14-12 — Production profile editor route redirect

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 14:51:38 ET**, shown in the supplied Messenger report screenshot |
| Root cause confirmed | **2026-11-14 15:30:51 ET**, production route comparison and Worker configuration audit |
| Fixed in source | **2026-11-14 15:30:51 ET**, commit `de293dae` |
| Certified release | `rel-de293dae52fa-8172f58c5e28`, Tier 1 full/shared routing |
| Production Worker | `4049b58d-9410-42cc-b649-7d3a117f5010` |
| Status | **Deployed and live verified** |

**What happened:** Members still saw missing avatars or backgrounds because the
production Update Profile link redirected `/member-profile.html` to
`/member-profile`, the public profile route. The editor form never loaded, so
the member could not reliably reach the upload controls.

**Confirmed cause:** Production Cloudflare Assets was still applying automatic
HTML canonicalization. Local configuration had already disabled it, which hid
the production-only mismatch during local acceptance.

**How it was fixed:** Production `wrangler.toml` now sets
`html_handling = "none"`. The Worker continues to own extensionless clean-URL
fallback, while direct `.html` editor documents remain available. A source
contract now requires this route configuration alongside the editor anchor.

**Verification:** Full preflight **37 gates passed in 7m 22s**; production
anonymous smoke **10/10**; live Firefox **65/65**; direct editor route **200**;
and a disposable production member round trip uploaded and rendered both an
avatar and banner with **200 image/png** readback before restoring the original
profile values.

**Permanent protection:** After website updates, the maintained local Worker
asset refresh is `npm run dev:local:refresh`; it refreshes only general-site
assets and leaves StudioFlow/Nova application directories protected. Release
preflight now checks the production route configuration, and the live post-
deployment acceptance checks the actual profile surface.

**Completion record:**
[`2026-11-14-MEMBER-PROFILE-EDITOR-ROUTE-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-MEMBER-PROFILE-EDITOR-ROUTE-REPAIR.md)

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

### INC-2026-11-14-10 — Community Feed YouTube body-link recurrence

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 14:42:01 ET**, shown in the supplied Community Feed screenshot |
| Root cause confirmed | **2026-11-14**, shared feed renderer and post-model audit |
| Fixed in source | **2026-11-14**, commit `d3fa0d12` |
| Certified release | `rel-d3fa0d1242a5-450b451fa7cd`, website profile |
| Production Worker | `e2291e3f-d354-4f77-b18f-505128dd5cdd` |
| Rollback Worker | `9113ac7d-1663-44e1-aa95-819d185ce350` |
| Status | **Deployed and live verified** |

**What happened:** A new post containing a YouTube URL displayed a generic
external-link card instead of the YouTube preview. The existing resolver and
the earlier two-video attachment repair were intact, but the shared feed
renderer only asked for preview metadata from saved link attachments. A URL in
the post body without that attachment record was skipped entirely.

**How it was fixed:** The renderer now discovers HTTPS URLs from both saved
link attachments and the post body, removes punctuation at the end of a URL,
deduplicates the result, and hydrates every URL in original order through the
existing resolver. Multiple YouTube videos remain supported, direct fallback
links remain visible, and Play still opens the privacy-enhanced in-feed player.

**Verification:** Link-preview regression **12/12**; member interaction source
contracts **19/19**; Firefox Community Feed acceptance passed for both explicit
two-attachment and body-only two-video posts; final profile/feed regression
**53/53**; full preflight **34/34**; production smoke **10/10**.

**Permanent protection:** The browser regression creates disposable posts for
both URL-storage paths and deletes them after the run. The release-safety
contract requires this Community YouTube gate, and the protected-application
byte guard keeps StudioFlow, Nova Workspace, and Creator Studio unchanged for
website-only repairs.

**Completion record:**
[`2026-11-14-COMMUNITY-FEED-YOUTUBE-BODY-LINK-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-COMMUNITY-FEED-YOUTUBE-BODY-LINK-REPAIR.md)

### INC-2026-11-14-13 — Messenger chat-list truncation and layout

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 15:00:11 ET**, shown in the supplied Messenger screenshot |
| Root cause confirmed | **2026-11-14**, chat-list renderer and shared Messenger CSS audit |
| Fixed in source | **2026-11-14**, commit `29cc0582` |
| Certified release | `rel-29cc0582b4d6-dbb9db88ce25`, website profile |
| Production Worker | `48af4946-75e1-4624-a522-b6202928ba27` |
| Status | **Deployed and live verified** |

**What happened:** Continuing a conversation caused the left Chats section to
show too much of the latest message. The long preview expanded into the
Members roster and made the Messenger layout look truncated or overlapped.

**Confirmed cause:** The renderer used the complete latest message body as the
chat-list preview, and the contacts column did not give Members and Chats
independent flex/overflow boundaries.

**How it was fixed:** Chat-list previews now collapse whitespace and cap the
visible text at 88 characters, then use a one-line ellipsis. The Members and
Chats regions now have separate bounded scrolling, and rows cannot overflow
their own column. The full conversation remains only in the thread pane.

**Verification:** Source contracts **21/21**; focused Firefox Messenger
acceptance **19/19**; local auth lifecycle **38/38**; targeted profile/feed
Firefox **53/53**; production smoke **10/10**; and a read-only live Firefox
Messenger probe confirmed separate bounds, non-overlapping rows, and ellipsis
previews without creating production data.

**Completion record:**
[`2026-11-14-MESSENGER-CHAT-LIST-TRUNCATION-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-MESSENGER-CHAT-LIST-TRUNCATION-REPAIR.md)

### INC-2026-11-14-14 — Messenger media upload and clipboard

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 15:02:18–15:02:37 ET**, shown in the supplied Chrome screenshots |
| Root cause confirmed | **2026-11-14**, local Worker reproduction of the MP4 500/1101 |
| Fixed in source | **2026-11-14**, commit `d6e0fc53` |
| Certified release | `rel-d6e0fc532d0d-f12b5d924453`, full/Tier 1 profile |
| Production Worker | `1e4d4af2-47a5-409e-8f3b-fde72193460a` |
| Status | **Deployed and live verified** |

**What happened:** Messenger MP4 attachments could be uploaded and attached to
a message, but opening the saved media returned a Worker 500/1101. ZIP files
were absent from Messenger's picker. Members also needed dependable copy-and-
paste in Messenger and the Community Feed.

**Confirmed cause:** The private-media access check used SQLite `LIKE` against
the full attachment URL. The local Worker reproduced `LIKE or GLOB pattern too
complex` before the R2 object could be returned. Chrome-specific or generic MIME
labels were also trusted instead of being normalized from the filename.

**How it was fixed:** Media access now loads attachment JSON and compares the
URL exactly. Uploads normalize MP4 and ZIP types, Messenger accepts ZIP files,
Community Feed file selection recognizes video extensions, and older media
objects receive a safe content-type fallback. Plain-text paste now works in the
Messenger composer, post composer, comments, and post editing controls.

**Verification:** Source contracts **27/27**; focused Firefox Messenger
acceptance **22/22**; local MP4/ZIP authenticated round trip **12/12**; local
auth **38/38**; guarded full preflight **37 gates** in **6m 35s**; production
smoke **10/10**; live isolated Firefox **65/65**.

**Permanent protection:** Messenger/media changes now run the focused browser
regression and authenticated MP4/ZIP round trip during release certification.
The protected-application byte guard passed, and StudioFlow, Nova Workspace,
and Creator Studio were not modified or replaced by this repair.

**Completion record:**
[`2026-11-14-MESSENGER-MEDIA-UPLOAD-AND-CLIPBOARD-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-MESSENGER-MEDIA-UPLOAD-AND-CLIPBOARD-REPAIR.md)

### INC-2026-11-14-15 — External non-YouTube video preview

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 15:08:50 ET**, shown in the supplied Community Feed screenshot |
| Root cause confirmed | **2026-11-14**, link-preview source inspection and live API check |
| Fixed in source | **2026-11-14**, commits `70f386c1` and `2d5c8e6e` |
| Certified release | `rel-2d5c8e6e2f65-844575167462`, shared-api profile |
| Production Worker | `6d5d40e2-5fba-49c8-a890-dd9d89106148` |
| Status | **External-video support deployed; supplied HTTP/JavaScript page remains source-limited** |

**What happened:** A non-YouTube research link rendered as a generic chain-icon
card instead of a playable video preview.

**How it was fixed:** The shared preview service now recognizes direct external
video responses, standard video metadata, `<video>/<source>` tags, and older
pages that expose MP4/WebM/MOV/OGV files through links or scripts. The feed
renders a native HTML5 player with controls and a source fallback.

**Remaining source limitation:** The supplied page is JavaScript-rendered and
does not publish a safe direct video source in its initial HTML. It is also
HTTP-only; its HTTPS endpoint fails TLS negotiation and the browser blocks the
HTTP page in the current environment. TPI cannot safely bypass those external
host restrictions. A direct HTTPS video URL, standard `og:video` metadata, or
an MP4 uploaded to TPI is required for guaranteed in-feed playback.

**Verification:** Link-preview regression **16/16**; member interactions
**27/27**; release safety **35/35**; release impact **12/12**; preflight
**CERTIFIED** with **10** gates; production smoke **10/10**.

**Completion record:**
[`2026-11-14-EXTERNAL-NON-YOUTUBE-VIDEO-PREVIEW-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-EXTERNAL-NON-YOUTUBE-VIDEO-PREVIEW-REPAIR.md)

### INC-2026-11-14-16 — Owner Admin authorization mismatch

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 15:45:38 ET**, shown in the supplied Admin Center screenshot |
| Root cause confirmed | **2026-11-14**, authenticated production session and read-only D1 account check |
| Fixed | **2026-11-14**, one guarded production account-role correction |
| Account | `Todd_Wayne` / contributor ID `5d9e7ec6-9507-487a-96fd-00441f7f7570` |
| Previous authorization | `role: admin` → resolved staff role `administrator` |
| Correct authorization | `role: owner` → resolved staff role `owner` |
| Status | **Repaired and live verified** |

**What happened:** The Owner/Founder account could enter the Administration
Center shell but Founding Memberships rejected the request as a narrower staff
role.

**How it was fixed:** The exact active authenticated account was promoted from
legacy `admin` to server-authoritative `owner`, with an audit record. The
existing server-side route matrix now grants the intended Owner access while
continuing to protect the area from ordinary members and narrower staff roles.

**Verification:** `/api/auth/me` returned Owner identity; the Founding
Memberships API returned **200**; and the live Admin Center opened
`/admin-panel#founding-memberships` with the issuance and registry controls.

**Completion record:**
[`2026-11-14-OWNER-ADMIN-AUTHORIZATION-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-OWNER-ADMIN-AUTHORIZATION-REPAIR.md)

### INC-2026-11-14-11 — Local Worker asset freshness

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 15:14:15 ET**, during Firefox member profile acceptance |
| Symptom | Firefox received older profile markup even though the repository source contained the current profile implementation |
| Root cause | An already-running local Worker reused its previous `.local-dev/assets` stage when `dev:local` returned early; a watcher event could be missed or race with acceptance startup |
| Fix | Added an in-place general-site asset refresh before reusing the maintained Worker, plus the explicit `npm run dev:local:refresh` command |
| Protection | Refresh removes stale general-site files without replacing the watched directory and excludes `studio/`, `nova/`, and `content-editor-nova/` |
| Verification | Staging **14/14**; startup **11/11**; cache-busting/watcher **14/14**; refreshed **280 paths**; Firefox profile/feed acceptance **53/53** |
| Status | **Repaired locally and pushed; no production deployment required** |

**Lesson:** A browser acceptance run must never rely on a possibly stale staged
copy. Reusing the maintained local Worker is now itself a freshness boundary,
while stable application directories remain protected from unrelated website
refreshes.

**Reference:** [`2026-11-14-LOCAL-WORKER-ASSET-FRESHNESS-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-LOCAL-WORKER-ASSET-FRESHNESS-REPAIR.md)

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


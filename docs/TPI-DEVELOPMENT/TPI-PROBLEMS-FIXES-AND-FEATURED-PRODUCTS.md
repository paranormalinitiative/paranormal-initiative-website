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
| A visitor cannot create a member account, the signup button appears to do nothing, email verification returns not found, or a new member believes profile edits disappeared | [Signup button and verification recurrence](#inc-2026-11-16-51--signup-button-and-verification-recurrence), [Member registration and email verification recurrence](#inc-2026-11-16-50--member-registration-and-email-verification-recurrence), and [Member registration repair](#inc-2026-11-16-03--member-registration-request-failed) | Public registration form, mobile tap handling, duplicate-submit protection, verification routes, profile persistence, browser cache |
| A member cannot save a profile photo or banner | [Profile media update](#inc-2026-11-14-01--profile-photo-or-banner-would-not-update) | Member Profile, R2 upload, shared profile API |
| A new image previews but disappears after saving | [Profile media update](#inc-2026-11-14-01--profile-photo-or-banner-would-not-update) | File-input cleanup, object URL, cache version |
| A member without an account email cannot save uploaded profile media | [Profile media permissions recurrence](#inc-2026-11-14-07--profile-media-permissions-and-email-gate-recurrence) | Member boundary, profile save validation, R2 media |
| A new Community Feed post shows its opening line twice | [Community post title duplication](#inc-2026-11-14-08--community-post-auto-title-duplicated-the-body) | Composer auto-title, post body, legacy rendering |
| Update Profile does not open the editor or a member bio is missing from the header | [Member profile editor and short bio](#inc-2026-11-14-09--member-profile-editor-and-short-bio) | Profile route, member identity header, self-service profile API |
| Update Profile opens the public profile instead of the editor, or avatars/backgrounds still do not load | [Production profile editor route](#inc-2026-11-14-12--production-profile-editor-route-redirect) | Cloudflare HTML handling, editor route, profile media render |
| Login works, then the member is sent somewhere unexpected | [Member access](#inc-2026-11-14-03--member-access-and-home-redirect-loop) | Session identity, staff-role fallback, stale browser state |
| Password reset appears to work but sign-in fails | [Password recovery](#inc-2026-11-14-04--password-storage-and-recovery-hardening) | Session creation, password hash compatibility, recovery code |
| Password reset verification returns Cloudflare 1101/500 or the new password is not saved | [Cloudflare password recovery compatibility](#inc-2026-11-16-44--password-recovery-cloudflare-compatibility) | Worker Web Crypto PBKDF2 limit, code validation order, reset session handoff |
| A YouTube link is only a URL or playback is broken in the Feed | [YouTube preview](#inc-2026-11-14-05--community-feed-youtube-preview) and [body-link recurrence](#inc-2026-11-14-10--community-feed-youtube-body-link-recurrence) | Link preview extraction, body URL discovery, iframe boundary |
| Firefox acceptance cannot see markup that is present in source | [Local Worker asset freshness](#inc-2026-11-14-11--local-worker-asset-freshness) | Local staged assets, Worker reuse, browser acceptance |
| Help content is visible to the wrong audience | [Two Help Centers](#inc-2026-11-14-06--member-help-center-and-internal-help-desk-confusion) | Member Help Center, internal Help Desk, Admin Center gate |
| A member cannot find guidance for a common site feature | [Member Help Center guide expansion](#inc-2026-11-14-19--member-help-center-guide-expansion) | Expandable member topics, TPI-specific articles, deferred Pages/Groups |
| StudioFlow controls are missing during an automated check | [StudioFlow acceptance timing](#inc-2026-11-14-02--studioflow-acceptance-check-clicked-before-controls-were-ready) | Browser hydration, release acceptance timing |
| A Studio opens with another Studio's scenes or media | [Studio isolation](#inc-2026-10-25-01--studio-creation-and-workspace-isolation) | Per-Studio identity, workspace hydration, local snapshots |
| Restoring a Nova document creates an unexpected extra version | [Nova restore autosave](#inc-2026-11-13-01--nova-restore-created-an-extra-autosave-version) | Snapshot hydration, editor update events, versioning |
| Nova publishing permissions look too broad or too narrow | [Nova publishing workflow](#inc-2026-11-13-02--nova-publishing-and-editorial-permissions) | Capability checks, restricted subjects, direct publishing |
| Messenger opens as a blank or unusable surface | [Messenger navigation](#inc-2026-11-10-02--messenger-navigation-and-release-certification) | Shared member shell, route target, disposable schema |
| Messenger Chats shows the full conversation, truncates the thread, or overlaps the Members list | [Messenger chat-list truncation](#inc-2026-11-14-13--messenger-chat-list-truncation-and-layout) | Chat preview rendering, contacts-column sizing, independent scrolling |
| Messenger lists every member instead of friends, or a direct chat with a non-friend cannot be revisited | [Messenger friends roster and searchable direct chat](#inc-2026-11-14-17--messenger-friends-roster-and-searchable-direct-chat) | Accepted-friend roster, member search, persistent Chats list |
| Messenger Friends appear vertically centered or leave a large empty gap above Chats | [Messenger Friends top alignment](#inc-2026-11-14-18--messenger-friends-top-alignment) | Contacts-column sizing, grid row alignment, bounded Friends scrolling |
| Clicking Chat on a member's profile opens the wrong person, or New Chat asks for a room name | [Messenger profile target and direct New Chat](#inc-2026-11-16-45--messenger-profile-target-and-direct-new-chat) | Profile-to-Messenger target handoff, stale selected conversation, direct-chat chooser |
| A contributor publishes Education Center content in Nova but members cannot discover it in the feed | [Nova Education publication feed integration](#inc-2026-11-16-46--nova-education-publication-feed-integration) | Member-home feed scope, published article projection, feed refresh detection |
| The Community Feed composer is a pill-shaped box on mobile, or its Photo/Video/File/Link controls and attachment previews are circular | [Community Feed composer shape repair](#inc-2026-11-16-47--community-feed-composer-shape-repair) | Shared composer CSS, responsive viewport layout, attachment preview geometry |
| Messenger MP4 or ZIP upload returns 500/1101, ZIP is missing from the picker, or paste does not work | [Messenger media and clipboard repair](#inc-2026-11-14-14--messenger-media-upload-and-clipboard) | Media authorization query, browser MIME normalization, file pickers, shared text controls |
| An external link or non-YouTube video shows only a chain icon or will not preview/play | [External link/video preview](#inc-2026-11-14-15--external-non-youtube-video-preview-and-interactive-fallback) | Link-preview metadata, direct video responses, JavaScript-rendered or HTTP-only source pages |
| Owner/Founder receives a staff-role access error in the Admin Center | [Owner Admin authorization](#inc-2026-11-14-16--owner-admin-authorization-mismatch) | Server-side contributor role, legacy admin mapping, protected Admin Center route |
| A StudioFlow release gate reports that recording setup is missing while the browser is still on Member Home | [StudioFlow acceptance shell false positive](#inc-2026-11-16-02--studioflow-acceptance-shell-false-positive) | Firefox route handoff, broad shell predicate, protected release gate |
| A member asks Mystic a question anywhere in the community | [Mystic community assistant](#inc-2026-11-14-20--mystic-community-assistant) | Shared member shell, public article search, bug-report handoff, internal-content boundary |
| Mystic opens but returns “I don’t have a verified member Help Center answer” for a documented question | [Mystic knowledge catalog loading](#inc-2026-11-14-21--mystic-knowledge-catalog-loading) | Shared shell dependency loading, public article catalog, profile-question regression |
| Mystic cannot point a public research question toward TPI books, repository guides, education, or haunted-location material | [Mystic public knowledge expansion](#inc-2026-11-15-22--mystic-public-knowledge-expansion) | Public source index, source matching, internal-content exclusion |
| Mystic sends a definition question such as “What is a ghost?” to a broad guide instead of answering it | [Mystic direct definition answer](#inc-2026-11-15-23--mystic-definition-answer-ranking) | Public knowledge intent matching, Terminology Reference, source-grounded answer |
| Mystic sends “What is a thoughtform?”, “thought form”, or “tulpa” to a glossary or gives inconsistent guidance | [Mystic thoughtform retrieval repair](#inc-2026-11-16-48--mystic-thoughtform-retrieval-and-six-source-cross-reference) | Public terminology book, deterministic aliases, six-source retrieval, empty-source fallback |
| A Community Feed external link shows a black panel instead of a useful image preview | [External link preview unavailable state](#inc-2026-11-16-49--external-link-preview-unavailable-state) | Source metadata availability, safe external rendering, honest fallback state |
| Mystic needs to answer broader public TPI questions from the live knowledge base | [Mystic Cloudflare AI Search integration](#inc-2026-11-15-24--mystic-cloudflare-ai-search-integration) | Public website crawl, AI Search retrieval, public-only server boundary, deterministic fallback |
| A member cannot tell whether to ask Mystic or Nova, or Nova is missing from a site page | [Mystic and Nova identity separation](#inc-2026-11-16-42--mystic-and-nova-identity-separation-and-sitewide-coverage) | Assistant identity copy, shared site loader, public/internal knowledge boundary |
| Mystic and Nova appear in the wrong launcher order, or Nova has the wrong icon | [Assistant launcher order and Nova artwork](#inc-2026-11-16-43--assistant-launcher-order-and-nova-artwork) | Shared assistant positioning, Nova artwork, cache version |
| An Administration Center release deploys, then rolls back during an unrelated StudioFlow live gate | [Administration Center command center and release-gate finding](#inc-2026-11-15-25--administration-center-command-center-and-release-gate-finding) | Full release certification, live Firefox acceptance, protected application boundary |
| A small Administration Center change starts the full StudioFlow release suite | [Administration Center impact-aware release guard](#inc-2026-11-15-26--administration-center-impact-aware-release-guard) | Release-impact classifier, admin-only verification, protected application byte guard |
| The Administration Center candidate is ready after the unrelated StudioFlow rollback | [Administration Center guarded promotion](#inc-2026-11-15-27--administration-center-guarded-promotion) | Certified candidate reuse, anonymous smoke, protected admin routes, owner acceptance |
| The live Administration Center needed owner verification after promotion | [Administration Center owner acceptance](#inc-2026-11-15-28--administration-center-owner-acceptance) | Owner session, Command Center, read-only navigation, protected boundaries |
| Staff need a single policy source and complete repair-record format | [Internal Help Desk and policy foundation](#inc-2026-11-15-29--internal-help-desk-and-policy-foundation) | Internal Help Desk, policy reference, Bug / Repair record, protected application boundary |
| An appointed staff member can open the Admin Center but sees the wrong limited interface | [Administration Center role matrix](#inc-2026-11-15-30--administration-center-role-probe-mismatch) | Effective staff appointment, legacy role mapping, Admin Center access probe |
| A member bug report appears in the queue but cannot be opened or documented with a triage decision | [Administration Center report triage](#inc-2026-11-15-31--administration-center-report-triage-contract) | Bug-report route coverage, required triage note, metadata-only evidence, audit history |
| Authorized staff need to see who can access which Administration Center areas | [Staff directory and capability inspection](#inc-2026-11-15-33--administration-center-staff-directory-and-capability-inspection) | Effective server role, capability boundaries, appointment history, read-only staff metadata |
| Authorized staff need one place to understand a member's real access | [Membership and entitlement inspection](#inc-2026-11-15-34--administration-center-membership-and-entitlement-inspection) | Effective role, capability flags, Founding identity, Creator Studio, Nova authority, restrictions, read-only metadata |
| A staff member could submit a warning or restriction before reviewing the complete action | [Enforcement action review gate](#inc-2026-11-15-35--administration-center-enforcement-action-review-gate) | Enforcement & Appeals, confirmation boundary, audit-safe mutation |
| Owner needs to grant or revoke direct Creator Studio access without touching memberships or StudioFlow | [Creator Studio access review gate](#inc-2026-11-15-36--administration-center-creator-studio-access-review-gate) | Owner-only capability grant, protected entitlement sources, review-before-change |
| Owner needs a safe overview of creator channels and their published-video counts | [Creator Channels verification](#inc-2026-11-15-37--administration-center-creator-channels-verification) | Channel directory, search/filter/pagination, metadata-only boundary |
| Owner needs to know whether the reactive and legacy Administration Centers agree | [Administration Center parity and permissions audit](#inc-2026-11-15-38--administration-center-parity-and-permissions-audit) | Navigation inventory, server role matrix, migrate/integrate/preserve decisions |
| An authorized Administration Center user sees the wrong navigation, or a failed access probe could expose too much UI | [Role-aware Administration Center navigation repair](#inc-2026-11-15-39--role-aware-administration-center-navigation-repair) | Server-derived capability catalog, fail-closed access probe, existing route allowlist |
| Nova needs to answer public TPI questions without exposing internal operations | [Nova TPI Everything Assistant](#inc-2026-11-15-40--nova-tpi-everything-assistant) | Public Member Help Center mode, Mystic separation, public-only retrieval |
| Authorized staff need one assistant for Help Desk procedures and internal policy | [Nova protected internal Help Desk](#inc-2026-11-15-41--nova-protected-internal-help-desk) | Active staff gate, separate private index, role-safe retrieval, no-mutation boundary |

## Incident and fix register

### INC-2026-11-16-48 — Mystic thoughtform retrieval and six-source cross-reference

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 19:08 EST** |
| What happened | Mystic was asked what a thoughtform was. It first redirected the member to the glossary, and a repeated question produced a different broad route instead of a direct, stable answer. |
| Root cause | The public terminology reference did not contain explicit Thoughtform or Tulpa entries, and the server accepted an AI Search answer even when Cloudflare returned zero usable public source chunks. That allowed an unhelpful “look in the glossary” response to pass as if it were grounded. |
| Fix | Added public glossary entries for **Thoughtform / Thought Form** and **Tulpa** with TPI’s evidence-aware wording. Added deterministic aliases for thoughtform, thought form, tulpa, and plural forms. Mystic now shows six public TPI references for this concept: Terminology, Field Encyclopedia, Investigation, Evidence, Forensic Analysis, and Ghostology 101. The server prompt now requests direct answers and up to six distinct public sources for research concepts. |
| Safeguards | The public client and API share the same verified fallback. The API no longer returns an AI answer with no usable public source; it falls back only for the documented thoughtform/tulpa concept and otherwise returns the honest knowledge-base fallback. Internal Help Desk/Admin content remains excluded. |
| Verification | Local authentication lifecycle **38/38**; Help Center/Mystic protection contracts **34/34**; member boundary **48/48**; focused member/profile/feed browser **57/57**; Messenger browser **27/27**; MP4/ZIP media round trip **PASS**; exact candidate certified with **14 gates**; production smoke **10/10**; live thoughtform/thought form/tulpa queries and repeat **4/4 direct, consistent answers**, each returning six public TPI references. |
| Status | **DEPLOYED AND LIVE VERIFIED** in release `rel-711a9fbd8d0d-e68627783f29`; Worker `74c14f0d-7cfd-4570-9567-db467673bd2b` serves 100% of traffic; rollback `90170296-2208-473f-9563-0007e7159ca6`. See [Mystic Thoughtform Retrieval Repair](300-COMPLETED-WORK/2026-11-16-MYSTIC-THOUGHTFORM-RETRIEVAL-REPAIR.md). |

### INC-2026-11-16-49 — External link preview unavailable state

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 19:30 EST** |
| What happened | Bill Heiland's Battery Drain Experiment link showed a black external preview area without a useful image. |
| Root cause | The linked page provided a title but no usable preview image. The renderer treated the script-driven page as an embeddable interactive page, even though external sites may block framing, return an interstitial, or render blank. |
| Fix | Kept source-provided images as static previews, but replaced image-less external frames with an explicit **Preview image unavailable** state and a direct **Open source** link. Removed the misleading interactive-preview wording and unused blank-frame styling. |
| Safeguards | Safe URL validation, bounded external metadata fetching, redirect limits, and the external-content boundary remain unchanged. TPI does not fabricate a thumbnail or bypass a source's security/framing policy. |
| Verification | Link-preview regression **18/18**; member interaction contracts **35/35**; `git diff --check` passed; exact candidate certified with **11 gates**; focused Firefox profile/feed acceptance **57/57**; production smoke **10/10**; live Bill URL response confirmed no source image and the deployed bundle served the unavailable-preview state without an iframe. |
| Status | **DEPLOYED AND LIVE VERIFIED** in release `rel-2de944d38363-c0615bf4976b`; Worker `fe7d3561-708d-4c4f-8bf0-a5ef88882e8e` serves 100% of traffic; rollback `74c14f0d-7cfd-4570-9563-db467673bd2b`. See [External Link Preview Unavailable State](300-COMPLETED-WORK/2026-11-16-EXTERNAL-LINK-PREVIEW-UNAVAILABLE-STATE.md). |

### INC-2026-11-16-47 — Community Feed composer shape repair

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 18:40 EST** |
| What happened | On a narrow mobile viewport, the Community Feed message box looked like a large pill and the visible LINK attachment, along with the Photo/Video/File/Link controls, appeared circular. The rounded geometry made the composer harder to read and made attachment types unclear. |
| Root cause | Shared `member-home.html` composer rules explicitly used `border-radius: 999px` for the textarea, media controls, link field, and link buttons. Pending attachment previews used fixed 80px circular tiles. This was shared presentation code, so it was not limited to one browser. |
| Fix | Changed the textarea to a normal 12px-corner box with explicit sizing and readable overflow; changed composer controls and link-entry controls to 8px corners; changed pending attachment previews to rectangular 148×88px cards with 12px corners; changed saved feed link chips to 10px corners. Avatars and remove badges remain circular intentionally. |
| Safeguards | Added source-level checks for the shared geometry and Firefox computed-style acceptance at desktop and 390px mobile width. The mobile check also rejects horizontal overflow. The fix does not touch StudioFlow, Creator Studio, Nova Workspace, private media, or owner data. |
| Verification | Member interaction contracts **34/34**; maintained local Firefox profile/feed acceptance **57/57**; desktop and mobile computed geometry checks passed; local staged asset refresh passed. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-5cd6b06c78f3-9ee36bce394e` serves Worker `c1ff12bd-7830-4a3e-a479-3ee602efff39` at 100% traffic; production smoke passed **10/10** and live mobile Firefox verification passed. See [Community Feed Composer Shape Repair](300-COMPLETED-WORK/2026-11-16-COMMUNITY-FEED-COMPOSER-SHAPE-REPAIR.md). |

### INC-2026-11-16-46 — Nova Education publication feed integration

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 18:23 EST** |
| What happened | Nova already published valid Education Center articles and the API already had an article-card projection, but the signed-in member-home activity stream requested the posts-only `scope=community` view. As a result, a contributor could publish an Education Center article successfully while members missed the “check it out” discovery card in the shared feed. |
| Root cause | The feed endpoint supports both the complete public discovery stream and an intentional discussion-only view. Member Home was passing the discussion-only scope for its initial load, load-more action, profile feed, and refresh check. The refresh check also compared community-post IDs only, so it could not announce a newly published article. |
| Fix | Member Home now requests the complete public discovery stream. Published article cards from Nova appear alongside community posts and videos, retain the contributor avatar/name, article type, title, summary, and Education Center link, and are ordered using the article’s latest publication/update timestamp. The discussion-only API scope remains available for callers that explicitly need community posts only. |
| Safeguards | Added an isolated Nova publication regression proving the article appears in the shared feed exactly once with its title, link, and author, while the explicit posts-only scope excludes it. Added member interaction contracts for shared article discovery and refresh detection. Ran one disposable publication through the maintained local Worker, confirmed the live feed card projection, and removed only that synthetic article afterward. |
| Verification | Nova publication verifier **66/66**; member interaction contracts **33/33**; JavaScript syntax and diff checks passed; local member/profile/feed acceptance **47/47**; disposable port-8787 publication-to-feed check passed; guarded preflight **40/40**; production smoke **10/10**; live isolated Firefox **65/65**; live public feed/page probe passed with 36 feed items and 23 article cards. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-6d82f7e349f7-7eb0976ad7d9` serves Worker `617e1f7a-647c-4d45-9b1d-dbf828ed29e5` at 100% traffic; rollback `e72e8de9-ddbe-4c52-af28-d50d34c51019`. See [Nova Education Publication Feed Integration](300-COMPLETED-WORK/2026-11-16-NOVA-EDUCATION-PUBLICATION-FEED-INTEGRATION.md). |

### INC-2026-11-16-45 — Messenger profile target and direct New Chat

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 18:11 EST** |
| What happened | Clicking Chat on a member profile opened Messenger but retained the previously selected conversation, so a profile for Keith could open Bill's chat. New Chat also presented the room-builder workflow, including a room-name field, even when the member wanted a one-to-one conversation. |
| Root cause | The profile action linked only to `#messenger` and did not pass the profile username. Messenger therefore restored its existing active conversation. The shared chooser used one room-oriented panel for both room creation and direct chat selection. |
| Fix | Profile Chat now passes the exact profile member to a sitewide `openDirectChat` entry point. Messenger resolves that member, reuses or creates the correct direct conversation, and opens it. New Chat now opens a clearly labeled direct-chat chooser; the room-name field and room-creation submit button are hidden, and choosing a member immediately opens the direct chat. |
| Safeguards | Added source contracts for profile-target propagation and direct-chat-only New Chat behavior. Added isolated Firefox regression coverage for profile targeting, direct chooser presentation, non-friend search, conversation opening, paste, responsive layout, and existing Messenger controls. The runtime records the active direct-chat target for acceptance verification. |
| Verification | Member interaction contracts **31/31**; focused Firefox Messenger acceptance **27/27** on the maintained local Worker. The first browser attempt exposed a test-navigation readiness issue; the test was corrected to wait for the shared shell and the complete rerun passed. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-08fc99157bb1-83ce1678ef5e` serves Worker `e72e8de9-ddbe-4c52-af28-d50d34c51019` at 100% traffic. See [Messenger Profile Chat and Direct New Chat Repair](300-COMPLETED-WORK/2026-11-16-MESSENGER-PROFILE-CHAT-AND-DIRECT-NEW-CHAT-REPAIR.md). |

### INC-2026-11-16-44 — Password recovery Cloudflare compatibility

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 17:53 EST** |
| What happened | Members could request a reset, but entering the emailed eight-digit code and a new password could fail with Cloudflare **1101 / HTTP 500**. The owner could still sign in; the reset verification path was the broken part. |
| Root cause | The password-hardening change requested PBKDF2 with 120,000 iterations. Cloudflare Worker Web Crypto rejects iteration counts above 100,000. The reset handler hashed before code lookup, so the Worker threw before confirming the code. Node-based tests and mocked browser tests did not exercise this provider-specific limit. |
| Fix | Set new/reset hashes to 100,000 iterations; fail closed for higher-iteration records; validate the code and active account before hashing; claim the code only after hashing succeeds; preserve legacy-hash compatibility, expiry, single-use behavior, and session invalidation. |
| Safeguards | Added explicit hosted-runtime limits and focused regressions for generated hash format, unsupported stored records, reset validation order, and recovery completion. |
| Verification | Password hash **10/10**; password recovery **24/24**; registration **9/9**; production D1 schema and SQL read-only checks passed; guarded preflight **13 gates**; production smoke **10/10**; invalid and malformed live codes returned controlled 400 responses; live Firefox recovery interaction passed. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-634252c82091-f049f836a262` serves Worker `c302ad35-7aaf-431c-96d9-2e64efee3d16` at 100% traffic. See [Password Recovery Cloudflare Compatibility Repair](300-COMPLETED-WORK/2026-11-16-PASSWORD-RECOVERY-CLOUDFLARE-COMPATIBILITY-REPAIR.md). |

### INC-2026-11-16-42 — Mystic and Nova identity separation and sitewide coverage

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 14:41 EST** |
| What happened | Mystic and Nova were both helpful, but their labels and entry points could make a member unsure which assistant handled paranormal research versus TPI support. Nova was not automatically available on every shared site page, and the reactive Administration Center needed a direct Help Desk handoff. |
| Fix | Distinguished Mystic as the public paranormal research assistant and Nova as the TPI Help Center / protected Help Desk assistant. Added a Help Center assistant directory, distinct launchers and role copy, sitewide loading through `includes.js`, direct public Mystic answers for ghost definitions, MEL/EMF meters, weather, intake, and walkthroughs, and an Administration Center “Ask Nova · Help Desk” link. |
| Safeguards | Public pages load only public Help Center and Mystic knowledge. Internal pages load protected Help Desk data and Nova only. Internal retrieval remains server-authorized and fail-closed. Stable applications and owner data were not modified. |
| Verification | JavaScript syntax, Help Center separation **31/31**, assistant identity/source contracts, public/internal loader checks, Admin Center build, full guarded preflight, production smoke **10/10**, and focused Firefox profile/feed acceptance **55/55**. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-9bbfd62591d3-5da81729f15f` is serving Worker `797a0c7f-91bd-4bb1-b195-582750d85b41` at 100% traffic. See [Mystic and Nova identity separation](300-COMPLETED-WORK/2026-11-16-MYSTIC-NOVA-IDENTITY-AND-SITEWIDE-COVERAGE.md). |

### INC-2026-11-16-43 — Assistant launcher order and Nova artwork

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 15:14 EST** |
| What happened | The owner wanted Mystic visually above Nova and supplied a dedicated Nova Help Center icon so members could distinguish the two assistants at a glance. |
| Fix | Moved Mystic to the upper sitewide launcher position, moved Nova to the lower position, added the supplied artwork as `assets/nova-help-center.png`, and used it in Nova's launcher, panel avatar, and Help Center assistant card. |
| Safeguards | Cache versions advanced to `v3`; public/internal retrieval boundaries, staff authorization, Mystic's public-only sources, and protected applications remain unchanged. |
| Verification | JavaScript syntax, Help Center separation, order/icon source contracts, guarded preflight, production smoke, and live production probe. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-8fc6abb54996-0797f31bc261` is serving Worker `4a4cd164-fec4-4149-985c-8348b42b012e` at 100% traffic. See [Assistant Launcher Order and Nova Artwork](300-COMPLETED-WORK/2026-11-16-ASSISTANT-LAUNCHER-ORDER-AND-NOVA-ARTWORK.md). |

### INC-2026-11-16-03 — Member registration request failed

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 13:36 EST** |
| What happened | A prospective member reported that both attempts to create a TPI login failed with a generic signup request/widget error. |
| Root cause | The public flow required account creation, a separate login request, and a third session check before redirecting. Any transient failure in the follow-up chain could make a valid signup appear broken. Common `/register`-style links also had no canonical redirect. |
| Fix | Made contributor insertion and first-session creation one atomic D1 batch; returned the session cookie and safe member payload from registration; removed the browser's second login/session-probe chain; added duplicate/error mapping, canonical signup aliases, registration focus behavior, and cache version `v51`. |
| Safeguards | Public registration creates only the normal `member` role. It cannot grant administrative, staff, Creator Studio, or internal Help Desk access. Password hashing, secure hosted cookies, and server-side authorization remain unchanged. |
| Verification | Registration source contracts **9/9**; Firefox local end-to-end signup **PASS**; member interactions **29/29**; password recovery **23/23**; release safety **38/38**; local auth lifecycle **38/38** with Firefox **65/65**; full preflight **40/40**; production smoke **10/10**; live Firefox **65/65**. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-fe8c882100f9-f8d876e3d386` is serving Worker `36cffaa9-1ac6-4dc1-93c4-a7f767cac648` at 100% traffic. No production account was created during verification. See [Member Registration Repair](300-COMPLETED-WORK/2026-11-16-MEMBER-REGISTRATION-REPAIR.md). |

### INC-2026-11-16-50 — Member registration and email verification recurrence

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 19:55–20:12 EST** |
| What happened | Stephanie could still receive a generic signup failure on a phone. A laptop-created account reached Member Home but email verification failed, and profile information appeared not to remain. |
| Root cause | A later Worker API consolidation removed the email-verification route registrations and handlers even though the UI, client calls, and token table remained. The verification request therefore returned a route-not-found response. Signup → profile save → fresh-session read also lacked a dedicated browser regression. |
| Fix | Restored `/api/auth/verify-email/request` and `/api/auth/verify-email/confirm`; added branded one-time eight-digit codes, 30-minute expiry, single-use consumption, stale-code invalidation, IP/account limits, delivery-failure cleanup, and post-response welcome scheduling. Added the existing migration to the local schema verifier, advanced the cache to `v52`, and added Firefox coverage for signup, profile persistence, and the protected verification route. |
| Safeguards | Signup remains an atomic account/session operation; email delivery cannot block account creation; confirmation updates the member before consuming the code; all routes are member-only; no production account or profile was modified. |
| Verification | Registration **13/13**; browser signup/profile/verification-route test **PASS**; local auth **38/38** at each checkpoint; profile/feed **57/57** after a transient first-run timeout; Messenger **27/27**; media roundtrip **PASS**; release safety **38/38**; impact **15/15**; guarded preflight **14/14**; production smoke **10/10**; live anonymous verification **401**; synthetic login **200**; invalid code **400**. |
| Status | **DEPLOYED AND LIVE VERIFIED.** Release `rel-8143c0defd1a-8e60528ca287`; Worker `3c2674b2-bb00-4820-820e-f65dd54f028e`; rollback `fe7d3561-708d-4c4f-8bf0-a5ef88882e8e`. See [Member Registration and Email Verification Repair](300-COMPLETED-WORK/2026-11-16-MEMBER-REGISTRATION-REPAIR.md). |

### INC-2026-11-16-51 — Signup button and verification recurrence

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 20:20–20:27 EST** |
| What happened | A fresh Firefox click test once timed out after the signup button was pressed. Repeated checks showed the underlying account request could succeed, but the visible submit control had no in-flight lock. On a slow phone connection or double tap, overlapping requests could make the first successful signup look like a failed button. |
| Root cause | The registration form handled the submit event but left the submit button active while the network request was in flight. A second tap could race the first request and return a duplicate-account response after the account had already been created. |
| Fix | The actual `Create Member Account` button now disables immediately after valid form submission, sets `aria-busy="true"`, and remains locked until navigation succeeds or a controlled error is shown. Controlled failures release the button for a legitimate retry. The browser regression now physically clicks the visible button and reports the page's exact status instead of hiding it behind a generic timeout. |
| Safeguards | Duplicate in-flight signup requests are prevented at the UI boundary; server-side duplicate detection remains active; the account/session transaction remains atomic; the button and status are covered by source contracts and fresh-browser interaction checks. |
| Verification | Registration source contracts **14/14**; sequential physical Firefox signup-button clicks **3/3 PASS**; profile persistence and verification route **PASS**; release safety, auth lifecycle, targeted member interactions, and the guarded release gates remain required. |
| Status | **REPAIR VERIFIED LOCALLY; INCLUDED IN THE NEXT GUARDED PRODUCTION RELEASE.** |

### INC-2026-11-16-02 — StudioFlow acceptance shell false positive

| Field | Record |
| --- | --- |
| Date/time | **2026-11-16 11:50 EST** |
| What happened | A guarded StudioFlow promotion passed the public smoke checks but the live Firefox gate reported that recording setup was missing and automatically rolled production back. The same failure reproduced against the unchanged rollback Worker. |
| Root cause | The browser acceptance predicate treated Member Home's visible “TPI Creator Studio” navigation label as proof that the StudioFlow shell had loaded. The browser could still be on `/member-home` when the test advanced. |
| Fix | Tightened the acceptance harness to require the actual `/studio/` route plus a real StudioFlow control before continuing. The production QA account was independently verified with Creator Studio access and `/studio/` returned HTTP 200. |
| Safeguards | The route remains server-gated; the guard remains fail-closed; no access grant, destination secret, database change, or application behavior was bypassed. The failed promotion remained rolled back. |
| Verification | Repaired isolated Firefox acceptance against the unchanged production rollback: **65/65 PASS**, including destination/storage panels, browser-local save, portable backup, restore-as-new, reopen persistence, and narrow-width behavior. |
| Status | **Harness repaired; guarded promotion completed and live verified.** Release `rel-047845c745eb-9ce22fed1969`; Worker `9098fc45-3a5a-4afd-9365-c7117140b489`; rollback `98040d28-927f-48b2-9022-b2274ab7ae06`. |

### INC-2026-11-15-40 — Nova TPI Everything Assistant

| Field | Record |
| --- | --- |
| Requested | **2026-11-15**, Owner authorized completion of the public Help Center and protected internal Help Desk assistant work |
| What happened | Mystic was correctly focused on paranormal research, but the TPI Help Center still lacked a single assistant for site, member, product, policy, and support questions |
| Fix | Added Nova with public and protected internal modes, deterministic article matching, server-side Cloudflare retrieval, clear source boundaries, and safe human handoff |
| Sitewide scope | Public Help Center, shared member/community shell, protected Help Desk, and `/api/nova/ask`; Mystic and protected applications remain separate |
| Safeguard | Public pages never load internal Help Desk data; internal retrieval requires an active server-side staff role; Nova cannot grant access or perform mutations |
| Verification | JavaScript syntax, Help Center separation, private index retrieval, anonymous internal denial, authenticated internal retrieval, and guarded browser/release gates |
| Status | **Deployed and live verified** — release `rel-0cede55a393d-df67016fd878`; Worker `98040d28-927f-48b2-9022-b2274ab7ae06` |

### INC-2026-11-15-41 — Nova protected internal Help Desk

| Field | Record |
| --- | --- |
| Date/time | **2026-11-15 America/New_York**; exact release time is recorded by the guarded release runner |
| Affected audience | Owner, Executive, Full Administrator, Administrator, Moderator, and other active staff with the protected Help Desk boundary |
| Knowledge source | Private R2 bucket `tpi-nova-internal-knowledge` and Cloudflare AI Search instance `tpi-nova-internal` |
| Fix | Added the protected Nova assistant to all internal Help Desk routes, updated the internal Help Desk article, and separated public Mystic/Nova knowledge from internal Nova retrieval |
| Safety behavior | Anonymous and ordinary member requests receive no internal answer; direct API requests are authorization checked; credentials, private messages, secrets, and destructive actions are out of scope |
| Remaining owner action | None for this public/internal assistant release. The private source is uploaded and its indexing job was started; anonymous internal access remains denied, and no StudioFlow source or owner data was changed |

### INC-2026-11-15-25 — Administration Center command center and release-gate finding

| Field | Record |
| --- | --- |
| Requested | **2026-11-15 15:54 EST**, Owner requested a streamlined Reactive UI Administration Center with site-health signals, graphs, statistics, and a future NOVA boundary |
| Implemented | **2026-11-15**, preview command-center presentation, collapsible administration navigation, local asset freshness, and clean-URL route repair |
| Sitewide scope | **Protected Administration Center and maintained local/release workflow**; StudioFlow, Creator Studio, Nova Editor Workspace, private media, D1, and R2 were not changed |
| Status | **Preview verified; production candidate automatically rolled back** |

**What was needed:** The preview already had real overview metrics, analytics
charts, and read-only Platform Health, but the first screen did not make
operational queues, readiness blockers, or protected boundaries obvious. The
local Worker also needed to refresh the Administration Center bundle reliably
after a rebuild.

**How it was fixed:** Added a Command Center summary with an explicit
administrative-data health signal, relative queue bars for content review,
moderation, creator review, and reports, NOVA readiness gates, and protected
application boundaries. Added collapsible navigation groups while retaining all
31 resource views. The local launcher now watches the Administration Center
entry and generated assets, and protected admin clean URLs use the maintained
fallback in both local and hosted runtimes.

**Verification:** The admin preview source contract passed **82/82**. Isolated
local browser acceptance passed **56/56**, including all 31 resource items and
member/contributor denial. The required local authentication lifecycle passed
**38/38** at each checkpoint and isolated Firefox StudioFlow acceptance passed
**65/65**. The exact production candidate `rel-86907c5696de-6323c630311d`
passed the full 38-gate certification and 10/10 anonymous production smoke.

**Release finding:** The existing full Tier 1 live Firefox gate timed out while
setting up a StudioFlow recording session after the candidate was deployed.
Because this was unrelated to the Administration Center change, StudioFlow
was not edited and the release runner automatically rolled production back to
Worker `7d6b3674-5396-463d-a4ef-247858b0c849`. The new Administration Center
candidate is therefore not live yet. The next step is to audit and streamline
the release gate so a safe admin-only change does not enter an unrelated
StudioFlow repair loop; no bypass or weakened certification is authorized.

**Documentation:** [TPI Administration Center Command Center Audit](200-AUDITS/2026-11-15-ADMIN-CENTER-COMMAND-CENTER-AUDIT.md).

### INC-2026-11-15-26 — Administration Center impact-aware release guard

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 16:31 EST**, during the owner-requested release-streamlining follow-up |
| Symptom | An Administration Center preview change was classified as a full-platform release, so the release spent time rebuilding and browser-testing StudioFlow; an unrelated StudioFlow live gate then caused an automatic rollback |
| Root cause | The impact classifier treated Administration Center source, generated preview assets, and admin-only verification as full-platform paths. The release runner also had no dedicated admin-center profile |
| Fix | Added an `admin-center` profile with local authentication, Administration Center source/route, and local browser acceptance. Shared Worker, authentication, migration, dependency, release-tool, or ambiguous changes still escalate to full platform |
| Safeguards | Every profile now compares protected application bytes with the previous certified candidate. Only an application explicitly represented by changed source paths may vary; unexpected StudioFlow, Nova, or Administration Center asset changes fail closed |
| Production impact | No Worker deployment was made for this release-tool/documentation change. The previously rolled-back production Worker remains the known-good version |
| Status | **Implemented, fully verified, committed, and pushed; ready for the next admin-only application release** |

This change does not weaken StudioFlow protection. It removes unrelated StudioFlow
work only for a genuinely admin-confined change. A change to `worker.js`, shared
authentication, bindings, migrations, dependencies, release tooling, or another
protected application remains full-platform and keeps the broad certification
suite.

**Documentation:** [Administration Center impact-aware release guard](300-COMPLETED-WORK/2026-11-15-ADMIN-CENTER-IMPACT-AWARE-RELEASE-GUARD.md).

### INC-2026-11-15-27 — Administration Center guarded promotion

| Field | Record |
| --- | --- |
| Requested | **2026-11-15**, Owner said to proceed after the release safeguards were installed |
| Release | `rel-e5ada60ef448-6f27f390f5ab`, source commit `e5ada60ef44806bfdbe1c4b58fdefaa7c20fb51e` |
| Worker | `5bd6d0c9-53cd-4d4d-9021-a57804512b7a`, 100% production traffic |
| Verification | Certified candidate reused; anonymous production smoke **10/10**; `/admin-panel`, `/admin-center-preview/`, and `/api/admin/members` anonymous boundary checks returned **403** |
| StudioFlow boundary | StudioFlow live acceptance was skipped for the website-profile candidate; no StudioFlow source or data changed |
| Status | **Deployed and live verified; owner-authenticated Administration Center acceptance passed** |

The public boundary is verified; no anonymous visitor can reach the
Administration Center. Owner-authenticated read-only acceptance is recorded
below; mutation controls were intentionally not submitted during this pass.

**Documentation:** [Administration Center impact-aware release guard](300-COMPLETED-WORK/2026-11-15-ADMIN-CENTER-IMPACT-AWARE-RELEASE-GUARD.md).

### INC-2026-11-15-28 — Administration Center owner acceptance

| Field | Record |
| --- | --- |
| Date and time | **2026-11-15 17:06 EST** |
| What happened | The live Administration Center needed the Owner/Founder/CEO browser check after guarded promotion. |
| How it was fixed | No code change was required. Firefox Developer Edition used the existing authenticated Owner session and loaded the live `/admin-panel` route. |
| Verified | Command Center, health signal, queue bars, readiness gates, protected boundaries, Member Directory, Roles & Permissions, Community Overview, Reports & Moderation, Platform Health, Security, Audit Logs, Help Desk, Analytics, Activity, System Settings, and Notifications. |
| Safety result | Anonymous admin-route protection remained intact. Read-only views rendered from live administrative data. No settings, member records, report statuses, notification read states, or other mutations were changed. |
| Boundary result | StudioFlow, Creator Studio, Nova Editor Workspace, private media, D1, and R2 were not modified. |
| Status | **Owner-authenticated live acceptance passed** |

The Administration Center is now verified for the live Owner/Founder/CEO
session. Product-completeness work remains for the unfinished internal
workflows called out by the dashboard; that is separate from this access and
rendering acceptance.

### INC-2026-11-15-29 — Internal Help Desk and policy foundation

| Field | Record |
| --- | --- |
| Requested | **2026-11-15**, owner said to start with item 1: Help Desk and policies, then work through the Administration Center roadmap |
| What was missing | The protected Help Desk had a working expandable shell and core procedures, but there was no dedicated policy source, no single source-of-truth hierarchy, and no complete standard for Bug / Repair and release records |
| Fix | Added `TPI-INTERNAL-POLICIES.md` and five protected Help Desk articles covering policy sources, staff access checks, report/appeal limitations, complete bug/repair records, and stable-application release boundaries |
| Audience boundary | Internal Help Desk and policies remain protected inside Administration Center; public Member Help Center and Mystic remain public-only |
| Protected products | StudioFlow, Creator Studio, Nova Editor Workspace, private media, D1, R2, and NOVA retrieval were not changed or connected |
| Status | **Deployed and verified** — Help Desk data release `rel-7c74d0dc4a11-f661dedeb823`; final Admin Center readiness release `rel-e50e6e338ae6-213689cdd014`; Worker `b3e839e6-3c46-422f-b5f8-76471e228ef3` |

**What the policy foundation establishes:** server-side authority remains the
final gate; staff use the smallest capability; member data is minimized;
moderation, reports, appeals, account actions, publishing, security, and
incident response have explicit boundaries; protected applications stay out of
unrelated releases; and every meaningful repair records its date/time, scope,
cause, fix, verification, deployment result, and safeguard.

**What it does not claim:** report triage, appeals, warnings, temporary
restrictions, staff suspension, a full staff directory, or NOVA are not newly
implemented by documentation. The Help Desk labels those boundaries as not yet
available until the corresponding server and UI workflows exist.

**References:** [`TPI-INTERNAL-POLICIES.md`](TPI-INTERNAL-POLICIES.md),
[`TPI-INTERNAL-HELP-DESK.md`](TPI-INTERNAL-HELP-DESK.md), and the protected
Help Desk data in `internal-help-center-data.js`.

**Verification:** Help Center separation passed **21/21**; the local
authenticated Admin Center browser suite passed **56/56**; the Admin Center
source/route contract passed **82/82**; protected application bytes were
unchanged; and production anonymous smoke passed **10/10**.

### INC-2026-11-14-20 — Mystic community assistant

| Field | Record |
| --- | --- |
| Requested | **2026-11-14**, owner request to make Mystic available for community questions and Help Center support |
| Implemented | **2026-11-14**, website integration on `codex/tpi-development` |
| Sitewide scope | **Shared member/community shell and public Member Help Center pages**; the Internal Help Desk remains separate and protected |
| Status | **Deployed and live verified** — Worker version `cae55a18-0feb-49dd-88d9-14cab035862e`; release `rel-6dfad17eb153-4b2ce0fbf307` |

**What was needed:** Members needed to be able to reach Mystic whenever they
are using the TPI community, not only after navigating to the Help Center. The
assistant still needed to answer common questions without becoming a second,
confusing navigation system or exposing internal operations.

**How it was fixed:** Added an Ask Mystic panel to the shared member/community
shell as well as the public Help Center home, category, article, search, and
contact pages. It uses Mystic's existing TPI identity and evidence-first
guardrails, searches only the public member article catalog, provides a direct
guide link when it finds a match, and offers member support or the existing
bug-report flow when it cannot verify an answer. It also refuses internal Help
Desk questions in the public surface and reminds members never to share
credentials or recovery secrets.

**Bug-report handoff:** Mystic's bug guidance links to `bug-report.html`. That
form submits to the existing authenticated `/api/bug-reports` endpoint, and the
protected Administration Center reads the resulting report queue. No parallel
ticketing system was created.

**Protection:** The integration is local and deterministic, with no model API
key or third-party conversation service. The internal data namespace is never
loaded by Mystic, and the Help Desk is not mounted in the public experience.
The public article catalog remains the source of truth; updating a guide also
updates what Mystic can retrieve. The approved Mystic ghost image is reused
from the TPI Research and Investigation program and has a reduced-motion
fallback for members who disable animation.

The assistant script loads asynchronously so it cannot hold the shared member
shell hostage while it loads. The exact production candidate was certified
with the protected-application integrity guard, and the release passed 53/53
profile/feed checks, 19/19 Help Center separation checks, YouTube preview and
playback checks, owner/admin authentication, and 10/10 production smoke checks.

### INC-2026-11-14-21 — Mystic knowledge catalog loading

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 23:09:01 EST**, owner reported that Mystic opened but did not answer the documented profile question |
| What happened | Mystic loaded on shared member pages, but those pages had not loaded the public Help Center article catalog. Mystic therefore had no searchable articles and returned its honest fallback. |
| Fix | The shared member shell now loads `help-center-data.js` before mounting Mystic. The load remains asynchronous and does not delay member-shell readiness. |
| Scope | **Sitewide shared member/community shell and public Help Center** |
| Verification | Firefox member/profile regression passed **54/54**, including opening Mystic and finding the “Your profile” guide from “How do I update my profile?”; Help Center separation passed **19/19**. |
| Protection | The public catalog is the only knowledge source; internal Help Desk data is never loaded into Mystic. |
| Status | **Deployed and live verified** — release `rel-352d51d095c5-cc8260b67af6`; Worker version `cbe3f95c-59ae-4ef6-86ee-f4bca5b6eebf` |

**Source alignment:** The website adapter reflects the Mystic identity and
knowledge/guardrail intent in the TPI Research and Investigation program's
`ASSISTANT.md` and `MYSTIC_KNOWLEDGE.md` without modifying that separate program.

**Release-pipeline protection:** The maintained release runner now performs the
same in-place general-site asset refresh as `npm run dev:local:refresh` after
staging and before browser gates. This prevents a running local Worker from
serving mixed HTML and stale staged assets while leaving protected application
directories untouched. The certified release passed all 38 gates, live smoke
passed 10/10, and isolated production Firefox acceptance passed 65/65.

### INC-2026-11-15-22 — Mystic public knowledge expansion

| Field | Record |
| --- | --- |
| Requested | **2026-11-15**, owner approved continuing Mystic on the public/member side first |
| Implemented in source | **2026-11-15 00:21 EST**, public source index and shared-shell loading path |
| Sitewide scope | **Public Help Center and shared member/community shell** |
| Status | **Deployed and live verified** — release `rel-260b8781abc0-c67020fbdaea`; Worker version `2612594e-18ab-444e-addb-f40ca98ef890` |

**What was needed:** Mystic could answer verified member Help Center questions,
but it did not yet have a safe way to direct members toward the broader public
TPI knowledge base: repository books and guides, education material, haunted
locations, public articles, apps, and videos.

**How it was fixed:** Added `mystic-public-knowledge.js` as a public-only,
deterministic source catalog. Mystic continues to search Help Center articles
first; when there is no strong article match, it searches the source catalog and
returns a verified public source link with a concise description. Unknown
questions still receive a clear fallback.

**Public sources included:** Educational Repository, Repository Pathways, Field
Encyclopedia, Terminology Reference, Investigation Compendium, Forensic Analysis
Compendium, Evidence Compendium, Education Center, Haunted Locations Directory,
Published Articles, public Apps and Workspaces, and TPI Videos.

**Protection:** The catalog is explicitly marked `public-member`. Mystic does
not load internal Help Desk data, Administration Center procedures, staff or
moderator instructions, private records, credentials, or protected routes.
Internal Help Desk pages are checked to load neither Mystic nor the public
catalog. The separation contract also requires the public source matcher and
source-result renderer to remain present.

**Verification:** JavaScript syntax checks and `git diff --check` passed; Help
Center separation passed **20/20**, including anonymous public access and denied
anonymous internal access; the focused member/profile/feed gate passed **54/54**;
production smoke passed **10/10**; the live public Help Center answered
`Encyclopedia` with the Official Field Encyclopedia source link; and the
anonymous Internal Help Desk remained HTTP 403. Protected StudioFlow, Nova
Workspace, and Creator Studio bytes remained unchanged.

**Reference:** [`2026-11-15-MYSTIC-PUBLIC-KNOWLEDGE-EXPANSION.md`](300-COMPLETED-WORK/2026-11-15-MYSTIC-PUBLIC-KNOWLEDGE-EXPANSION.md)

### INC-2026-11-15-23 — Mystic definition answer ranking

| Field | Record |
| --- | --- |
| Detected | **2026-11-15**, owner asked “What is a ghost?” and Mystic routed the question to the broad Education Center guide |
| Fixed in source | **2026-11-15**, direct public knowledge answer and cache-version update |
| Sitewide scope | **Public Help Center and shared member/community Mystic** |
| Status | **Deployed and live verified** — release `rel-ca4350b09f14-71249913e23a`; Worker version `01ae8fc8-df88-48cf-bbe7-61689245b549` |

**What happened:** Mystic’s article matcher treated a broad Education Center
article as the best match because the word “ghost” appeared throughout its
content. The answer did not use the more precise definition already published
in TPI’s Terminology Reference.

**How it was fixed:** Added a direct, source-grounded `ghost-definition` intent
to the public Mystic knowledge catalog. Mystic now answers the common forms
“What is a ghost?”, “Define ghost,” and similar questions with TPI’s published
definition: a perceived manifestation, presence, or appearance believed to be
associated with a deceased individual, treated as a working description rather
than a proven conclusion. The response also preserves TPI’s instruction to
check environmental explanations, witness contamination, suggestion, folklore
influence, and perceptual error before assigning the label.

**Protection:** The answer is tied to the public Terminology Reference source;
it does not load internal Help Desk material or invent an unsupported claim.
The public source index now also includes Ghostology 101, and the separation
regression requires the direct-answer matcher to remain present.

**Verification:** JavaScript syntax checks, local asset refresh, and the Help
Center separation contract passed **20/20** before the guarded release.
Production smoke passed **10/10**. Live Mystic answered “What is a ghost?”
with the TPI definition and linked to
`TPI_Terminology_Reference_Unified.html`.

### INC-2026-11-15-24 — Mystic Cloudflare AI Search integration

| Field | Record |
| --- | --- |
| Requested | **2026-11-15**, owner approved trying Cloudflare AI Search for the public Mystic assistant and provided the account token through Cloudflare rather than chat |
| Fixed in source | **2026-11-15 01:29 EST**, public AI Search binding, server route, and retrieval fallback |
| Sitewide scope | **Public Help Center and shared member/community Mystic only**; NOVA/internal knowledge remains deferred |
| External resource | Cloudflare AI Search instance `tpi-mystic-public` in the account’s `default` namespace |
| Status | **Deployed and live verified** — release `rel-afbcac6a73f3-8480846ec919`; Worker `7d6b3674-5396-463d-a4ef-247858b0c849` |

**What happened:** The deterministic Mystic catalog could answer known Help
Center questions and selected public source questions, but it could not yet
retrieve broader answers from the published TPI website. The first AI Search
crawl discovered the public sitemap and began indexing the public site, but
the running owner-managed local Worker was still serving its older staged
configuration and did not yet have the new binding.

**How it was fixed:** Connected the Worker to Cloudflare’s remote AI Search
namespace and added a public `/api/mystic/ask` route. Mystic now preserves its
existing direct answers and Help Center article matching first, then asks the
`tpi-mystic-public` instance for broader public questions. The server uses a
strict public-only prompt, returns only same-origin public source links, and
fails closed to the existing deterministic Help Center answer when AI Search
is unavailable or has no usable answer.

**Public boundary:** The crawler is configured with public website inclusion
and exclusions for internal Help Center, Admin Center, API, member, moderation,
Studio, Paper Editor, and Nova paths. The Worker repeats the boundary before
returning source links. NOVA is not created or connected in this public phase.

**Verification:** JavaScript syntax checks passed; the Help Center separation
contract passed **21/21**; Cloudflare retrieval returned real Ghostology 101
chunks from `ghostology-101.html`; the final public refresh collected **250
sitemap URLs**, finished with **0 errors** and **0 skipped items**, and
produced **1,744 vectors** after two recovery retries. Full Tier 1 certification passed
**38/38 gates** in **6m 43s**. Production smoke passed **10/10**, and isolated
Firefox production acceptance passed **65/65**. Live Help Center interaction
verified the direct ghost definition, public Ghostology guidance, and the
internal-procedure refusal for “How do I ban someone?”.

The exact certified candidate was deployed without recertification in **45.5s**
and confirmed at 100% traffic. The official owner-managed local Worker remains
deterministic-only by policy; its lack of the remote AI Search binding is
intentional and does not affect the production binding.

**Protection:** The AI Search binding is represented in `wrangler.toml`, the
public-only route and private-path exclusions are covered by the Help Center
separation regression, and internal content remains outside Mystic’s loaded
browser catalog. The deterministic Help Center and direct ghost-definition
answers remain the user-facing fallback, so a temporary Cloudflare failure
cannot make Mystic invent or expose internal guidance.

### INC-2026-11-14-01 — Profile photo or banner would not update

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 10:33:49 ET**, shown in the member Community Feed report screenshot |
| Fixed in source | **2026-11-14 10:49:39 ET**, commit `ac3cf199` |
| Final release source | **2026-11-14 11:08:18 ET**, commit `c1b48003` |
| Production Worker | `9be0c066-9991-49b4-82a4-e1768aab42c4` |
| Sitewide scope | **Yes — shared member profile editor, profile API, avatar, and banner surfaces** |
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
| Sitewide scope | **Yes — every signed-in member's profile-media journey** |
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
| Sitewide scope | **Yes — all public member profiles and self-service profile editors** |
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
| Sitewide scope | **Yes — every member-facing profile editor route** |
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

### INC-2026-11-14-19 — Member Help Center guide expansion

| Field | Record |
| --- | --- |
| Recorded | **2026-11-14 22:11 ET** |
| Problem | The member Help Center had the expandable shell but not enough clearly named guides for the everyday account, community, media, safety, and reporting questions members will have |
| Reference | Facebook Help Center topic grouping, rewritten for TPI; direct Facebook access was rate-limited during research, so the public structure was used only as an information-architecture reference |
| Fix | Added TPI-specific member guides for account creation, profiles, friending, Home Page, messaging, Reels, Stories, photos, videos, accessibility, login/recovery/security, account management, privacy/safety, policies, and reporting |
| Deferred | Pages and Groups remain intentionally staged for a later phase |
| Audience rule | Member guidance stays in the public/member Help Center; internal Help Desk procedures remain protected inside Administration Center |
| Status | **Deployed and live verified** |

**How it was fixed:**

- Kept the existing `<details>` dropdown navigation and populated it with the
  larger article inventory instead of creating a second confusing navigation.
- Reused TPI’s existing categories, theme system, search, article pages, and
  member-support escalation route.
- Added a Help Center data-version bump so the maintained local Worker and
  browsers request the updated member article inventory.
- Added a regression contract for the required topic names and the deferred
  Pages/Groups boundary.

**Reference:** [`2026-11-14-HELP-CENTER-MEMBER-GUIDE-EXPANSION.md`](300-COMPLETED-WORK/2026-11-14-HELP-CENTER-MEMBER-GUIDE-EXPANSION.md)

**Audience references:**

- [`TPI-MEMBER-HELP-CENTER.md`](TPI-MEMBER-HELP-CENTER.md)
- [`TPI-INTERNAL-HELP-DESK.md`](TPI-INTERNAL-HELP-DESK.md)

**Release evidence:** Source commit `3b8669dc87ae5dce6d9c0e09a705998df33016b6`,
release candidate `rel-3b8669dc87ae-4b2f91c483dc`, production Worker
`4ffc57d6-006f-4553-86f9-e0ab77bb667d`, rollback Worker
`59cf78af-f9d1-4bc8-b7ef-4fd2d2294b00`, live smoke **10/10**.

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

### INC-2026-11-14-15 — External non-YouTube video preview and interactive fallback

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 15:08:50 ET**, shown in the supplied Community Feed screenshot |
| Root cause confirmed | **2026-11-14**, link-preview source inspection and live API check |
| Fixed in source | **2026-11-14 20:32 ET**, commits `70f386c1`, `2d5c8e6e`, `7e4a4049`, and `826e1cde` |
| Certified release | `rel-826e1cde50e9-29e6a23c7e13`, shared-api profile |
| Production Worker | `c914a5a5-6cfd-460a-8856-3a0397a87498` |
| Status | **External-link/video previews and interactive fallback deployed; live verified** |

**What happened:** A non-YouTube research link rendered as a generic chain-icon
card instead of a playable video preview.

**How it was fixed:** The shared preview service now recognizes direct external
video responses, standard video metadata, `<video>/<source>` tags, and older
pages that expose MP4/WebM/MOV/OGV files through links or scripts. The feed
renders a native HTML5 player with controls and a source fallback. When a page
is JavaScript-rendered and appears to be a media/research page but does not
expose a direct playable source, the resolver returns `external-page` with
`interactive: true`. The feed then offers **Open interactive preview** in a
sandboxed iframe plus **Open source**. This now applies to ordinary external
links as well as external video/research pages. When a source provides Open
Graph or standard metadata, the title, description, and image remain visible
in the card.

**Remaining source limitation:** The supplied page is JavaScript-rendered and
does not publish a safe direct video source in its initial HTML. It is also
HTTP-only; its HTTPS endpoint fails TLS negotiation and the browser blocks the
HTTP page in the current environment. The new interactive fallback gives the
member an in-feed attempt to view the external page, but TPI cannot guarantee
playback when the external host blocks framing, HTTP navigation, or its own
player. A direct HTTPS video URL, standard `og:video` metadata, or an MP4
uploaded to TPI is still required for guaranteed native in-feed playback.

**Verification:** Link-preview regression **18/18**; member interactions
**27/27**; focused Firefox profile/feed **53/53**; focused Firefox Messenger
**22/22**; authenticated Messenger media round trip **12/12**; release safety
**35/35**; release impact **12/12**; preflight **CERTIFIED** with **13** gates
in **33.5 seconds**; production smoke **10/10**. The live preview API returned
`provider: external-page` and `interactive: true` for the exact supplied URL
and for a normal MDN article, including the article's title, description, and
image metadata.

**Completion record:**
[`2026-11-14-EXTERNAL-NON-YOUTUBE-VIDEO-PREVIEW-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-EXTERNAL-NON-YOUTUBE-VIDEO-PREVIEW-REPAIR.md)

### INC-2026-11-16-01 — External page preview required an extra click

| Field | Record |
| --- | --- |
| Detected | **2026-11-16 18:36 ET**, shown in the supplied Chimera screenshot |
| Root cause confirmed | **2026-11-16**, shared Community Feed renderer inspection |
| Fixed in source | **2026-11-16**, inline image/live-preview rendering and regression protection |
| Status | **Implemented in source; guarded production release pending verification** |

**What happened:** JavaScript-rendered external pages were classified as
interactive previews, but the feed required the member to click **Open
interactive preview** before showing the page. This made a usable visual link
feel hidden, especially for sources such as Chimera that do not publish a
standard `og:image`.

**How it was fixed:** A safe source-provided image now appears immediately. If
the source has no image but renders as an interactive page, the existing
sandboxed iframe loads inline. The full external page remains available through
the card's **Open interactive preview** link, and the original URL, SSRF
guards, sandbox restrictions, and fallback behavior remain protected.

**Completion record:**
[`2026-11-16-EXTERNAL-PAGE-PREVIEW-IMAGE-REPAIR.md`](300-COMPLETED-WORK/2026-11-16-EXTERNAL-PAGE-PREVIEW-IMAGE-REPAIR.md)

### INC-2026-11-16-02 — Opening a notification did not reliably mark it read

| Field | Record |
| --- | --- |
| Detected | **2026-11-16**, member notification behavior report |
| Root cause confirmed | **2026-11-16**, notification link lifecycle inspection |
| Fixed in source | **2026-11-16**, navigation-safe read acknowledgement |
| Status | **Implemented in source; guarded production release pending verification** |

**What happened:** A member could open a notification and arrive at the right
post while the notification still appeared unread. The read request was
best-effort and could be canceled when the browser navigated away.

**How it was fixed:** Normal notification opens now queue the read mutation with
`navigator.sendBeacon` before following the destination. Browsers that cannot
queue the beacon use a `keepalive` request with a short fallback timeout. The
notification remains in the list after being marked read, and alternate-click
behavior remains native.

**Completion record:**
[`2026-11-16-NOTIFICATION-OPEN-MARK-READ-REPAIR.md`](300-COMPLETED-WORK/2026-11-16-NOTIFICATION-OPEN-MARK-READ-REPAIR.md)

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

### INC-2026-11-14-17 — Messenger friends roster and searchable direct chat

| Field | Record |
| --- | --- |
| Detected | **2026-11-14**, owner request to remove the full member directory from Messenger |
| Root cause confirmed | **2026-11-14 21:20 ET**, Messenger roster route and shared shell audit |
| Fixed in source | **2026-11-14 21:33 ET**, commit `a1d030af` |
| Certified release | `rel-a1d030af3b2c-5152a1d5c14e`, shared-api profile |
| Production Worker | `d1d8b5ee-f195-4ca9-ab86-ccaa8925e2cb` |
| Scope | Site-wide Messenger member picker and existing Chats list |
| Status | **Deployed and live verified** |

**What happened:** Messenger presented a directory of all members as the default
starting list. That exposed more people than needed for routine messaging and
made the distinction between friends and existing conversations unclear. A
member also needed a safe way to start a direct chat with someone who was not
yet a friend, then return to that conversation later.

**How it was fixed:** The default Messenger roster now contains only accounts
with an accepted friend request in either direction. The search field can still
find an active member outside the friend list when someone intentionally wants
to begin a direct chat. Once that conversation exists, the existing remote
conversation list keeps it in **Chats** with the member's avatar, regardless of
friend status. Existing chat history is not removed or hidden by the new
default roster.

**Verification:** Source contracts **28/28**; focused Firefox Messenger
acceptance **24/24**, including an empty-friends state, non-friend search, chat
selection, existing-chat persistence, layout bounds, MP4/ZIP controls, and
clipboard behavior. The local test fixture correctly showed **Friends** with no
accepted friends, then found a non-friend through intentional search.

**Permanent protection:** The shared Messenger browser regression now checks
that the default roster is friend-only and that search can start a non-friend
direct chat. The source contract checks the `/api/messenger/roster` boundary,
the friend-only default mode, the search affordance, and the rendered friend
classification. The protected-application guard remains in force; StudioFlow,
Nova Workspace, and Creator Studio are outside this change.

**Completion record:**
[`2026-11-14-MESSENGER-FRIENDS-ROSTER-AND-DIRECT-CHAT-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-MESSENGER-FRIENDS-ROSTER-AND-DIRECT-CHAT-REPAIR.md)

### INC-2026-11-14-18 — Messenger Friends top alignment

| Field | Record |
| --- | --- |
| Detected | **2026-11-14 21:37:46 ET**, shown in the supplied Messenger screenshot |
| Root cause confirmed | **2026-11-14 21:39 ET**, shared Messenger CSS layout audit |
| Fixed in source | **2026-11-14 21:39 ET**, commit `c83bedab` |
| Certified release | `rel-c83bedab8985-f9f2fc14c24b`, website profile |
| Production Worker | `59cf78af-f9d1-4bc8-b7ef-4fd2d2294b00` |
| Scope | Site-wide Messenger contacts column, desktop and mobile |
| Status | **Deployed and live verified** |

**What happened:** The Friends region reserved its full maximum-height grid
area even when only a small number of friends existed. The grid's default row
stretching then centered the friend button inside that reserved space, making
Friends appear in the middle of the column and pushing Chats lower than
necessary.

**How it was fixed:** The Friends list now sizes to its actual content, pins
its grid rows to the start of the region, and only grows into a bounded
scrolling area when the friend list needs more room. Chats keeps its own
independent scrolling region below Friends.

**Verification:** Source contracts **29/29**; focused Firefox Messenger
acceptance **25/25**, including the Friends-only default roster, top alignment
metrics, non-friend search, existing Chats rendering, desktop layout, and
mobile layout.

**Permanent protection:** The source contract requires the Friends list to use
content-sized rows, start alignment, and natural flex sizing. The focused
Firefox Messenger regression checks the computed alignment and verifies that a
friend button, when present, begins at the top of its list rather than in the
middle. StudioFlow, Nova Workspace, and Creator Studio remain outside this
change.

**Completion record:**
[`2026-11-14-MESSENGER-FRIENDS-TOP-ALIGNMENT-REPAIR.md`](300-COMPLETED-WORK/2026-11-14-MESSENGER-FRIENDS-TOP-ALIGNMENT-REPAIR.md)

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

### INC-2026-11-15-30 — Administration Center role probe mismatch

| Field | Record |
| --- | --- |
| Detected | **2026-11-15**, during the Administration Center role/capability reconciliation |
| Product/surface | Protected Administration Center and `/api/editorial/access` |
| Environment | Source, local verification, and guarded production release; no member or production data changed |
| Symptom | The server-side HTML gate recognized an appointed Executive, Full Administrator, or Administrator as an Administration Center account, but the navigation access probe still checked only the legacy `owner`/`admin` column. A valid appointed staff account could therefore be incorrectly shown the editorial-only shell. |
| Root cause | Two access decisions used different sources: the shared effective appointment resolver in the Worker versus a legacy raw-role check in the access-probe response. |
| Fix | Centralized full Administration Center eligibility in `hasAdministrationCenterRole()`. The Worker, `/api/auth/me`, and `/api/editorial/access` now use the effective appointed role; the access probe returns that effective role to the client. Added the role/action matrix audit and a protected Help Desk article. |
| Verification | Staff-role regression passed **22/22**; Administration Center source/route contract passed **82/82**; release-impact classifier passed **15/15**; release safety passed **37/37**; full preflight passed **38/38** gates; production smoke passed **10/10**; live Firefox passed **65/65**; Markdown reference passed with **1,078** files. The local Help Center HTTP probe could not connect in the earlier source-only phase; all source-level audience checks passed **19/19**. |
| Production status | **Deployed and live verified** in release `rel-0cb07bb0ba42-24c5cfb8e77e`; Worker `53382ceb-b9d1-46c0-ab94-0bd039a3611f` serves 100% of traffic |
| References | [`2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md`](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md), `lib/staff-roles.js`, `worker.js`, `functions/api/[[path]].js`, `scripts/verify/tpi-staff-roles.mjs`, [`2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-RECONCILIATION.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-RECONCILIATION.md) |

**Lesson:** Every protected HTML gate, API response, and client navigation hint
must derive from the same effective server-side role resolver. Legacy account
columns are compatibility inputs, not the complete authority model.

### INC-2026-11-15-31 — Administration Center report triage contract

| Field | Record |
| --- | --- |
| Detected | **2026-11-15**, during the first operational moderation workflow implementation |
| Fixed in source | **2026-11-15**, commit `33a090f8a72c2918836bf6a5387f1fca833cb32c`; guarded production release completed |
| Product/surface | Protected Administration Center Reports & Moderation queue |
| Environment | Source, local verification, and guarded production release; no production data or private evidence changed |
| Symptom | Video and messenger reports had protected status controls, but member bug-report detail/status handlers still rejected the route pattern. Terminal status changes also accepted an empty reason, so the queue could not guarantee a documented triage decision. |
| Root cause | The queue had grown around the original video/messenger sources while member bug reports were added later; the status API recorded an optional audit reason instead of enforcing a required decision note. |
| Fix | Extended the detail and status route contracts to `bug`, added the member bug type to the Admin Center, and required a server-validated triage note for reviewed, dismissed, and actioned outcomes. The UI now confirms the decision and shows the note in protected moderation history. |
| Verification | Admin Center preview/source contract **82/82**; Admin Center TypeScript/Vite build passed; Worker/API syntax passed; local authentication **38/38**; Help Center separation **21/21**; shared-API preflight **13/13**; production smoke **10/10**; private-evidence boundary preserved |
| Production status | **Deployed and live verified** in release `rel-33a090f8a72c-497b729bbec3`; Worker `771c0fbc-27a8-4af0-8d6a-1e994d0aa9ad` serves 100% of traffic |
| References | [`2026-11-15-ADMINISTRATION-CENTER-REPORT-TRIAGE-AUDIT.md`](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-REPORT-TRIAGE-AUDIT.md), [`2026-11-15-ADMINISTRATION-CENTER-REPORT-TRIAGE.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-REPORT-TRIAGE.md), `functions/api/[[path]].js`, `admin-center-app/src/app.tsx`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** A report queue is not a complete triage workflow until every
supported source can be opened, every terminal decision is documented by the
server, and private evidence stays outside the administrative response.

### INC-2026-11-15-32 — Administration Center bounded enforcement and appeals

| Field | Record |
| --- | --- |
| Detected | **2026-11-15**, during the next Administration Center roadmap slice |
| Fixed in source | **2026-11-15**, commit `a9a199d33bcaa2ae10c3b6225a7a1c2dd5db8a45` |
| Product/surface | Protected Administration Center Enforcement & Appeals; member Settings safety notices |
| Environment | Source and maintained local schema; no production data or protected application changed |
| Symptom | The report queue could document a decision, but there was no bounded workflow for a warning, temporary content restriction, member notice, or appeal. Staff could not complete a documented next step without using an unrelated account control. |
| Root cause | Report triage and account controls had been implemented as separate slices, while the enforcement state and appeal records had not yet been modeled as additive, auditable resources. |
| Fix | Added migration `0072_moderation_enforcement_and_appeals.sql`, server-authorized warning and temporary-restriction routes, member notice/appeal routes, Admin Center Enforcement & Appeals UI, member Settings notices, audit events, and fail-closed missing-schema handling. Restrictions are reasoned, scoped, time-limited, non-staff-only, and capped at 720 hours. |
| Verification | Admin Center source contracts **86/86**; release-safety contracts **37/37**; Admin Center build passed; Worker syntax passed; local schema migration 0072 applied; full certification **38 gates**; production smoke **10/10**; live isolated Firefox **65/65** |
| Production status | **Deployed and live verified** in release `rel-a9a199d33bca-4ff0b360fcd3`; Worker `627d364b-8cab-476f-b777-481528fb9d27` serves 100% of traffic; rollback `771c0fbc-27a8-4af0-8d6a-1e994d0aa9ad` |
| References | `migrations/0072_moderation_enforcement_and_appeals.sql`, `functions/api/[[path]].js`, `admin-center-app/src/app.tsx`, `member-settings.js`, `docs/TPI-DEVELOPMENT/008-ADMINISTRATION-CENTER.md` |

**Lesson:** Moderation needs a separate, bounded enforcement record with an
appeal path; report triage must not silently become a permanent ban, staff
suspension, content deletion, or private-message inspection tool.

### INC-2026-11-15-33 — Administration Center staff directory and capability inspection

| Field | Record |
| --- | --- |
| Detected | **2026-11-15**, during the next Administration Center roadmap slice |
| Fixed in source | **2026-11-15**, commit `319256e8ac861977d58350b023abd49721b42de3`; guarded release completed |
| Product/surface | Protected Administration Center Staff Directory & Capability Inspection |
| Environment | Source, isolated local verification, and production schema verification; no staff appointment or member data changed |
| Symptom | Authorized staff had no single read-only view showing recognized staff, effective roles, allowed Center areas, capabilities, or appointment/revocation history. |
| Root cause | Role management and individual capability probes existed separately, so authority had to be inferred from labels or inspected across multiple screens. |
| Fix | Added the server-authorized `GET /api/admin/staff-directory` route and a read-only Staff Directory view. It derives effective roles from the maintained appointment/legacy resolver, maps allowed areas through the server route allowlist, and returns minimized appointment history. |
| Safeguards | Owner, Executive, and Full Administrator only; legacy Administrator is denied the new directory route; missing optional appointment schema falls back to safe legacy-role records instead of a 500; no authority mutations, private contact data, credentials, tokens, session material, or member content are exposed. |
| Verification | Admin Center source contract **88/88**; Administration Center build passed; Worker syntax passed; local policy check confirmed the intended role boundary; preflight certified 13 gates in 28.19 seconds; local authentication **38/38**; member boundary **48/48**; targeted interaction contracts **29/29**; Messenger browser **25/25**; Messenger media round trip passed; production schema check verified the table and both indexes; read-only appointment count **0**; no appointment was created. |
| Production status | **Deployed and live Owner-verified; schema installed with explicit approval** in release `rel-319256e8ac86-3c7ebe4e1f27`; Worker `eadb134b-08f1-473b-af09-2189e3314c1a` serves 100% of traffic; rollback `3cf1b5cd-c7e4-415d-82fb-0f0fd24b8c96`; anonymous smoke **10/10**; migration `0071_staff_role_appointments.sql` applied individually at **2026-11-15 19:55 EST** |
| References | [`2026-11-15-ADMINISTRATION-CENTER-STAFF-DIRECTORY-AND-CAPABILITY-INSPECTION.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-STAFF-DIRECTORY-AND-CAPABILITY-INSPECTION.md), `functions/api/[[path]].js`, `admin-center-app/src/app.tsx`, `lib/staff-roles.js`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** Staff access must be inspectable from the same effective server-side
role resolver that enforces it, while inspection remains strictly read-only.

### INC-2026-11-15-34 — Administration Center membership and entitlement inspection

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 20:38 EST**, during the next Administration Center roadmap slice |
| Fixed in source | **2026-11-15**, commit `1bd4528c0d1e1e28c9e09a7ee667fc478dc3ff88` |
| Product/surface | Protected Administration Center Membership & Entitlements view |
| Symptom | Member Directory, Roles & Permissions, Founding Memberships, Creator Studio, Staff Directory, and Account Restrictions each showed only part of a member's access. Staff had no single safe answer for what the account could actually use or which server-authorized source explained it. |
| Root cause | Access information was distributed across separate contracts. Client labels and legacy roles could not safely represent the effective union of account flags, staff appointments, membership entitlements, Creator Studio records, editorial grants, and active restrictions. |
| Fix | Added `GET /api/admin/membership-entitlements` and a read-only Administration Center view with bounded search, pagination, summary counts, effective-role resolution, capability-source inspection, Founding Membership identity, Creator Studio access, and active restriction metadata. |
| Safeguards | Owner, Executive, and Full Administrator only; legacy Administrator denied; server-derived access; metadata-only response; optional missing schemas fail closed; no mutation controls; credentials, sessions, private contact data, private messages, and private evidence excluded; protected applications untouched. |
| Verification | Administration Center source contracts **90/90**; Admin Center build passed; `git diff --check` passed; local assets refreshed in place; local authentication lifecycle **38/38**; exact guarded candidate certified **38 gates in 6m42s**; production anonymous smoke **10/10**; live isolated Firefox acceptance **65/65**; live Owner/Founder/CEO inspection confirmed Todd Wayne as Owner with Creator Studio access and a read-only boundary. |
| Production status | **DEPLOYED AND LIVE** — release `rel-1bd4528c0d1e-6432f3fdd589`, Worker `60e536c8-b2a5-412a-b704-2b9fa4885a4`, 100% traffic; rollback `eadb134b-08f1-473b-af09-2189e3314c1a` |
| References | [`2026-11-15-ADMINISTRATION-CENTER-MEMBERSHIP-ENTITLEMENT-INSPECTION.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-MEMBERSHIP-ENTITLEMENT-INSPECTION.md), `functions/api/[[path]].js`, `admin-center-app/src/app.tsx`, `admin-center-app/src/lib/api.ts`, `lib/staff-roles.js`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** Administration needs one server-derived access inspection surface,
but inspection and mutation must remain separate. A missing optional source is
not permission and must never be interpreted as permission.

### INC-2026-11-15-35 — Administration Center enforcement action review gate

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 21:05 EST**, during the first guarded member-action workflow review |
| Fixed in source | **2026-11-15**, commit `cefdec86b4d88b8370cfef1ca6fc9b41fdba4e18` |
| Product/surface | Protected Administration Center Enforcement & Appeals |
| Symptom | The existing bounded warning/restriction form could submit immediately after staff entered a reason, without a separate review of the target, scope, duration, and reason. |
| Root cause | The form used its primary submit action as the mutation trigger, so the safety review was implicit rather than an explicit confirmation state. |
| Fix | Added a no-write **Review action** step, a visible review summary, a cancel path, and an explicit **Confirm & record action** mutation step. Any edited field clears the pending review. |
| Safeguards | Existing server-side staff authorization, non-staff target boundary, required reason, 1–720 hour limit, audit logging, member notice, revocation, appeals, and protected application boundaries remain in force. |
| Verification | Administration Center source contracts **91/91**; Admin Center build passed; release-impact **15/15**; release-safety **37/37**; local browser review state verified with no action submitted; exact candidate certified **10 gates in 18.8s**; production anonymous smoke **10/10**; live Owner/Founder/CEO Firefox review state verified with no action submitted. |
| Production status | **DEPLOYED AND LIVE** — release `rel-cefdec86b4d8-744d578d1df7`, Worker `d56a2056-0f51-4636-b230-16e1b0f8f72b`, 100% traffic; rollback `60e536c8-b2a5-412a-b704-2b9fa4885a4` |
| References | [`2026-11-15-ADMINISTRATION-CENTER-ENFORCEMENT-REVIEW-GATE.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-ENFORCEMENT-REVIEW-GATE.md), `admin-center-app/src/app.tsx`, `scripts/qa/tpi-admin-006-preview.mjs`, `functions/api/[[path]].js`, `migrations/0072_moderation_enforcement_and_appeals.sql` |

**Lesson:** A protected mutation should always show the exact proposed action
before it can be written, and editing any reviewed input must invalidate that
confirmation.

### INC-2026-11-15-36 — Administration Center Creator Studio access review gate

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 21:12 EST**, during the next Administration Center workflow slice |
| Fixed in source | **2026-11-15 21:20 EST**, commit `ee2e52dce7159f3af77318a8c27fb072e177bd0b` |
| Product/surface | Protected Administration Center → Creators → Creator Studio Access |
| Symptom | The integrated Creator Studio Access view was read-only, so the Owner had no safe way to manage a direct Creator capability grant while preserving membership-derived access. |
| Root cause | The view exposed only the legacy Creator Studio entitlement ledger and had no explicit review boundary for direct capability changes. Generic entitlement helpers existed, but the Creator Studio surface did not bind them to an Owner-only workflow. |
| Fix | Added a combined ledger view for legacy and direct administrative Creator grants; added exact-member lookup, visible review state, final confirmation, and Owner-only server routes for grant and revoke. Revoke refuses membership and legacy sources. Duplicate access is refused rather than creating a second grant. |
| Safeguards | Server authority uses the existing effective-role resolver and capability ledger. Only `owner` may mutate. Founding Memberships, staff appointments, role-derived access, legacy entitlements, StudioFlow source, private media, and owner data remain outside the workflow. Every successful grant/revoke uses the existing audit path. |
| Verification | Admin Center source contracts **92/92**; build passed; release-impact **15/15**; release-safety **37/37**; local authorization lifecycle **38/38**; isolated Firefox StudioFlow acceptance **65/65**; preflight certified the exact shared-API candidate in **22.9s**; production anonymous smoke **10/10**; live Owner Firefox review opened the final grant confirmation for @Backwoods_Signal and was canceled without mutation. |
| Production status | **DEPLOYED AND LIVE** — release `rel-ee2e52dce715-5a8621bf7e9f`, Worker `e9306f06-8fe6-49d2-894c-e30bd2e21f7f`, 100% traffic; rollback `d56a2056-0f51-4636-b230-16e1b0f8f72b` |
| References | [`2026-11-15-ADMINISTRATION-CENTER-CREATOR-STUDIO-ACCESS-REVIEW-GATE.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-CREATOR-STUDIO-ACCESS-REVIEW-GATE.md), `admin-center-app/src/app.tsx`, `admin-center-app/src/lib/api.ts`, `functions/api/[[path]].js`, `lib/founding-memberships.js`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** Access management should be reversible and explicit, but it must
never flatten different authority sources into one editable record. Review the
exact account and source, then mutate only the direct grant that the Owner
intended.

### INC-2026-11-15-37 — Administration Center Creator Channels verification

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 21:38 EST**, during the next Creator section review |
| Implemented in source | **2026-11-15**, existing implementation commit `18ceb209` |
| Product/surface | Protected Administration Center → Creators → Creator Channels |
| Symptom | Creator Channels was the next planned Creator section item and needed confirmation that the operational directory was complete, safe, and live. |
| Root cause | No defect was found. The feature had already been integrated, but its completion and live verification had not yet been recorded in the maintained TPI documentation. |
| Fix | Verified the existing server-backed channel directory: search by channel/slug/owner, public/private visibility filter, bounded pagination, owner identity, published-video count, updated timestamp, empty state, and explicit read-only boundary. |
| Safeguards | The API is protected by the existing effective-role Administration Center gate and returns metadata only. No channel mutations, ownership transfers, visibility changes, video lifecycle actions, private media, or StudioFlow data are exposed. |
| Verification | Admin Center build passed; source contracts **92/92**; live Owner Firefox page confirmed the controls and read-only notice. Production returned **0 channels**, which rendered the truthful empty state. |
| Production status | **ALREADY DEPLOYED AND LIVE** in release `rel-ee2e52dce715-5a8621bf7e9f`; no redeploy or database change required for this verification. |
| References | [`2026-11-15-ADMINISTRATION-CENTER-CREATOR-CHANNELS.md`](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-CREATOR-CHANNELS.md), `admin-center-app/src/app.tsx`, `functions/api/[[path]].js`, `admin-center-app/src/lib/api.ts`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** A directory can be complete without exposing mutation controls. Show
the authoritative metadata, report an honest empty state, and leave channel
ownership and publishing actions on their existing protected workflows.

### INC-2026-11-15-38 — Administration Center parity and permissions audit

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 21:54 EST**, during the planned legacy/reactive Administration Center comparison |
| Implemented in source | **2026-11-15**, documentation and audit record only |
| Product/surface | Legacy `/admin-panel`, reactive `/admin-center-preview/`, server role and route boundaries |
| Symptom | The reactive Center and legacy Center use different navigation inventories, so a label appearing in one surface cannot be assumed to represent the same data contract or authority boundary in the other. |
| Root cause | The reactive Center has grown with newer read-only and review-gated resources while the legacy Center retains established combined panels and separate route integrations. The staff capability catalog was not yet a complete inventory of the reactive resources. |
| Fix | Completed a read-only source comparison and recorded the current role/action matrix, protected application boundary, 35-resource reactive inventory, 22-entry legacy navigation inventory, and the required migrate/integrate/preserve classification step before replacement. |
| Safeguards | Server-side effective-role resolution, protected HTML access, route allowlists, handler-level checks, no client-side authority, no legacy replacement, and no production data or protected-application changes. |
| Verification | Reactive Administration Center build passed; source contracts **92/92**; live Owner Firefox verification confirmed the protected reactive navigation and read-only Creator Channels boundary. |
| Production status | **Documentation-only audit; no production deployment required.** The legacy route remains the current production surface, and the reactive Center remains a separate protected integration surface. |
| References | [`2026-11-15-ADMINISTRATION-CENTER-PARITY-AND-PERMISSIONS-AUDIT.md`](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-PARITY-AND-PERMISSIONS-AUDIT.md), [`2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md`](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md), `admin-center-app/src/app.tsx`, `admin-panel.html`, `functions/api/[[path]].js`, `lib/staff-roles.js`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** A navigation match is not feature parity. Compare the source
contracts and server authority, then classify each difference before moving or
replacing a protected administrative workflow.

### INC-2026-11-15-39 — Role-aware Administration Center navigation repair

| Field | Record |
| --- | --- |
| Detected | **2026-11-15 21:54 EST**, during the parity and permissions follow-up |
| Fixed in source | **2026-11-15 22:08 EST**, commit `661b06b5` |
| Product/surface | Reactive `/admin-center-preview/`, `/api/editorial/access`, shared Administration Center role boundaries |
| Environment | Local maintained Worker, guarded release candidate, production, live Owner Firefox session |
| Symptom | The reactive Center's server capability catalog did not name every current navigation area, and the client still used hardcoded role checks for only two items. A failed access probe could also default the UI to full administration visibility. |
| Root cause | The reactive navigation expanded faster than the older capability catalog. The server route matrix and handler gates were authoritative, but the UI hint was incomplete and its error fallback was not fail-closed. |
| Fix | Expanded the server-returned catalog to cover every current reactive navigation key, added route-aware allowed flags derived from the existing server allowlist, made Help Desk and TPI Videos use the existing full Administration Center boundary, filtered navigation from the server response, reset disallowed deep links to Overview, and changed access-probe failure to a denied state. |
| Safeguards | No role grant, appointment change, membership change, migration, legacy route replacement, or production data change. HTML gates, API route checks, handler authorization, protected application byte guards, exact-candidate certification, and anonymous smoke remain mandatory. |
| Verification | Administration Center source checks **94/94**; build passed; local authentication lifecycle **38/38**; isolated Firefox StudioFlow acceptance **65/65**; full preflight **13** certification gates; production anonymous smoke **10/10**; live Owner Firefox navigation verified after refresh. |
| Production status | **DEPLOYED AND LIVE** — release `rel-661b06b57761-81f33a142a9c`, Worker `b00b96d8-c0a6-4ca8-a137-63bfd980ce0f`, 100% traffic; rollback `e9306f06-8fe6-49d2-894c-e30bd2e21f7f` |
| References | [Administration Center Role-Aware Navigation Repair](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-ROLE-AWARE-NAVIGATION-REPAIR.md), [Parity and Permissions Audit](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-PARITY-AND-PERMISSIONS-AUDIT.md), `admin-center-app/src/app.tsx`, `admin-center-app/src/lib/api.ts`, `functions/api/[[path]].js`, `scripts/qa/tpi-admin-006-preview.mjs` |

**Lesson:** The UI may describe authority, but it must never invent it. Return
the allowed areas from the same server-side route matrix that protects the
request, fail closed on probe errors, and keep the handler checks authoritative.

### INC-2026-11-16-01 — StudioFlow destination collision and library-location mismatch

| Field | Record |
| --- | --- |
| Detected | **2026-11-16 11:27 EST**, during the owner-requested StudioFlow destinations and save-location audit |
| Fixed in source | **2026-11-16**, StudioFlow commit `882237ae1944f09a4f529ef94905917910c52eff`; website staging baseline updated |
| Product/surface | StudioFlow livestream destinations; Recording & Storage; Nova Workspace verification |
| Environment | Protected StudioFlow release lineage, disposable local Worker test environments, maintained staging workflow |
| Symptom | The RTMP companion defaulted to the official local Worker port 8787, and choosing a library folder did not automatically select that folder for recording output. |
| Root cause | The local media bridge and the authoritative Worker had the same default port. The folder picker updated `libraryLocation` but left `recordingDestination` unchanged, so the UI could look configured while the recording path remained Browser Library. |
| Fix | Moved the local bridge default to 8789 with an explicit hosted `VITE_STUDIOFLOW_RTMP_URL` boundary; added clear hosted-not-configured handling; made folder selection set both library and recording destinations; made Restore Default clear the persisted handle and return to browser storage; added a destination regression guard. |
| Safeguards | Provenance-checked two-build staging; protected bridge preservation; no credentials or stream keys stored; no silent recording fallback; permission check and byte verification remain required before a folder save is reported successful. |
| Verification | Destination catalog **13/13**; synthetic RTMP H.264/AAC delivery PASS; recording/storage **33/33**; Nova Core **105/105**; Nova Editor persistence **134/134**; Nova Slides **23/23**; staging reproducibility PASS. |
| Production status | Local repairs and staging verified. Hosted RTMP remains configuration-required until an approved production relay/provider adapter is provisioned and tested. |
| References | [`2026-11-16-STUDIOFLOW-DESTINATIONS-AND-LIBRARY-AUDIT.md`](300-COMPLETED-WORK/2026-11-16-STUDIOFLOW-DESTINATIONS-AND-LIBRARY-AUDIT.md), `scripts/studioflow-release-baseline.json`, StudioFlow `src/App.tsx`, `server/rtmp-bridge.mjs`, `scripts/check-destinations.mjs` |

**Lesson:** A local receiver test proves media transport, not production
delivery. Every save-location control must change the actual destination state,
and every hosted external destination must have an explicitly provisioned relay
before it is labeled ready.

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


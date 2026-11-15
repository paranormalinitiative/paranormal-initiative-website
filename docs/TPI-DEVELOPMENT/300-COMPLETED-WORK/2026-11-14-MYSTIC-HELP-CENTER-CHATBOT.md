# Mystic Help Center Chatbot

**Date:** 2026-11-14  
**Scope:** Shared member/community shell and public Member Help Center
**Status:** Implemented, deployed, and live verified.

## Request

Bring Mystic into the TPI Member Help Center as the first help assistant. The
assistant should feel like Mystic from the TPI Research and Investigation
program, answer common member questions, and keep the two Help Centers clearly
separate.

## What was implemented

- Added an **Ask Mystic** launcher and chat panel to the shared member/community
  shell, plus all public Member Help Center pages: home, category, article,
  search, and contact.
- Reused the approved Mystic ghost image from the separate TPI Research and
  Investigation program and added a gentle pulse with a reduced-motion
  fallback.
- Used Mystic's established identity: **Spirit Guide, Researcher, and Shadow
  Seeker**.
- Kept the voice friendly, calm, curious, concise, grounded, and evidence-first.
- Added direct matches for common member language such as avatar, profile
  picture, banner, messaging, login, recovery, reporting, photos, videos,
  reels, stories, privacy, and safety.
- Linked every verified answer to the matching public Help Center article.
- Added honest fallback behavior when no verified member answer is available.
- Added safe handoffs to the full Help Center, member support, and the existing
  bug-report form.
- Kept bug reporting on the existing authenticated `/api/bug-reports` path,
  which feeds the protected Administration Center report queue.
- Added a clear boundary for questions about Administration Center, staff
  roles, moderation procedures, or the internal Help Desk.
- Added a reminder not to submit passwords, recovery codes, session cookies,
  API tokens, or other secrets.

## Knowledge and privacy boundary

Mystic searches only `help-center-data.js`, which is the public member article
catalog. It does not load or search `internal-help-center-data.js`, internal
Markdown, protected routes, private records, or credentials. The assistant is
local and deterministic in this first integration: no AI API key, third-party
chat service, or member conversation export was introduced.

The website integration was adapted from the existing Mystic program in the
separate TPI Research and Investigation repository, especially its
`Resources/ASSISTANT.md` and `Resources/MYSTIC_KNOWLEDGE.md`. That program was
not modified by this website change.

## Future extensions requiring separate approval

- A model-backed answer layer or external provider.
- A protected internal Mystic mode for the Help Desk.
- Ticket creation, authenticated support history, or staff handoff APIs.
- Conversation analytics or retention beyond the current page session.

Each of those would require its own data, security, authorization, and release
review. The current assistant is intentionally useful without them.

## Verification checklist

- [x] Public pages load the Mystic script.
- [x] Shared member/community pages load Mystic and the approved image asset.
- [x] Internal Help Desk pages do not load or mount Mystic.
- [x] Article matching reads only the member article inventory.
- [x] Unknown questions do not receive invented answers.
- [x] Internal-procedure prompts are redirected to the protected boundary.
- [x] Sensitive credential prompts receive a safe warning.
- [x] Run the repository release preflight: certified release `rel-6dfad17eb153-4b2ce0fbf307`, including 53/53 profile checks, 19/19 Help Center separation checks, YouTube preview/playback checks, owner/admin authentication, and protected-application integrity.
- [x] Deploy through the guarded production path: Worker version `cae55a18-0feb-49dd-88d9-14cab035862e`.
- [x] Verify live behavior: production smoke passed 10/10; the public Help Center returned 200 with Mystic assets; internal Help Desk separation remained protected.

## Protection record

- Mystic is loaded asynchronously from the shared member shell so the member
  profile, feed, Messenger, and navigation are ready even if the assistant
  asset is still loading.
- The approved pulsing ghost asset is stored at `assets/mystic-ghost.png` and
  is covered by the Help Center separation regression.
- Mystic reads only the public member article catalog. Internal Help Desk
  content is not loaded into the public assistant.
- Bug questions link to `bug-report.html`; submissions continue through the
  authenticated `/api/bug-reports` endpoint into the protected Administration
  Center queue.
- The exact certified candidate was deployed without recertification drift;
  the protected StudioFlow/Nova/Creator application bytes were preserved.

## Follow-up repair — shared member knowledge loading

On **2026-11-14 at 23:09 EST**, the Ask Mystic panel opened correctly on a
member page but returned its fallback for the built-in “How do I update my
profile?” prompt. The public article catalog was present on Help Center pages
but was not being loaded when Mystic was attached by the shared member shell.

The shared shell now loads the public `help-center-data.js` catalog before
mounting Mystic, while keeping that work asynchronous so it cannot block the
member UI. The Firefox member regression opened Mystic, asked the exact
profile question, verified the “Your profile” guide link, and passed **54/54**
checks locally. Internal Help Desk data remains excluded.

This repair was deployed through the guarded release path in
`rel-352d51d095c5-cc8260b67af6` as Worker version
`cbe3f95c-59ae-4ef6-86ee-f4bca5b6eebf`. The certified candidate passed all 38
gates, production smoke passed **10/10**, and isolated production Firefox
acceptance passed **65/65**.

The release runner was also protected against the stale-local-asset condition
that exposed this bug: after staging, it now invokes the maintained in-place
general-site refresh before browser gates. Stable application directories remain
excluded from that refresh.

## Follow-up — public knowledge expansion

On **2026-11-15**, Mystic's public knowledge boundary was expanded beyond the
Help Center article catalog. The shared member shell and public Help Center now
load `mystic-public-knowledge.js`, a deterministic index of published TPI
sources: the Educational Repository and Pathways, Field Encyclopedia,
Terminology Reference, Investigation Compendium, Forensic Analysis Compendium,
Evidence Compendium, Education Center, Haunted Locations Directory, Published
Articles, public Apps and Workspaces, and TPI Videos.

Mystic still searches verified Help Center articles first, then falls back to a
matching public source. It does not load internal Help Desk data, Administration
Center procedures, moderator instructions, private records, credentials, or
protected routes. Internal Help Desk pages are explicitly checked to load
neither Mystic nor this public catalog.

The Help Center separation regression passed **20/20** locally, including the
public-versus-internal access probe. A new Firefox regression asks Mystic for
investigation methods and requires the public Investigation Compendium link.
The maintained release gate must complete before this source expansion is
called deployed; the source record is tracked separately in
[`2026-11-15-MYSTIC-PUBLIC-KNOWLEDGE-EXPANSION.md`](2026-11-15-MYSTIC-PUBLIC-KNOWLEDGE-EXPANSION.md).

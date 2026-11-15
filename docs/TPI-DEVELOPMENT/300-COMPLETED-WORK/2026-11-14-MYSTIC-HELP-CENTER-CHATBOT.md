# Mystic Help Center Chatbot

**Date:** 2026-11-14  
**Scope:** Shared member/community shell and public Member Help Center
**Status:** Implemented locally; guarded release verification and production
acceptance remain required.

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
- [ ] Run the repository release preflight.
- [ ] Deploy through the guarded production path.
- [ ] Verify live behavior in Firefox and at least one Chromium browser.

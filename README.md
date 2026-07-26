# The Paranormal Initiative Website

This repository contains the public website, Education Center, Content Editor, Contributor Portal, and Discussion Portal for **The Paranormal Initiative - Applied Paranormal Research and Studies**.

The site is designed to be dark, professional, research-driven, and practical. It supports public educational pages, research articles, contributor profiles, member discussion, article comments, legacy article conversion, and Cloudflare-backed publishing tools.

## Current Build Areas

- Public site pages: about, research areas, standards, education, search, contact/links, and public resources.
- Education Center: topic pathways, research articles, legacy content, and published contributor work.
- Content Editor: contributor-only drafting and publishing for papers, notes, reports, reviews, and articles.
- Contributor Portal: member login, profile pages, contributor access, admin access management, and R2 profile/media uploads.
- Discussion Portal: public-readable, member-posted forum with Education Center-aligned categories and chat-style topic replies.

## Cloudflare Backend

- D1 stores accounts, sessions, invites, profiles, articles, comments, forum records, read tracking, and password-reset tokens.
- R2 stores uploaded profile photos and article media.
- When applying D1 migrations through the Cloudflare dashboard Console, paste the **full SQL contents** from the migration file, not the migration filename.

Primary setup notes live in:

- `CLOUDFLARE_PORTAL_SETUP.md`
- `TPI_AGENT_HANDOFF.md`
- `TPI_NEXT_BUILD_TASKS.md`
- `CONTRIBUTOR_PORTAL_PLAN.md`
- `PAPER_EDITOR_ROADMAP.md`

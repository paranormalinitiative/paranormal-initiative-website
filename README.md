# The Paranormal Initiative Website

This repository contains the public website, Education Center, Content Editor, Contributor Portal, and Discussion Portal for **The Paranormal Initiative - Applied Paranormal Research and Studies**.

The site is designed to be dark, professional, research-driven, and practical. It supports public educational pages, research articles, contributor profiles, member discussion, article comments, legacy article conversion, and Cloudflare-backed publishing tools.

## Current Build Areas

- Public site pages: about, research areas, standards, education, search, contact/links, and public resources.
- Education Center: topic pathways, research articles, legacy content, and published contributor work.
- Content Editor: contributor-only drafting and publishing for papers, notes, reports, reviews, and articles.
- Contributor Portal: member login, profile pages, contributor access, admin access management, and R2 profile/media uploads.
- Discussion Portal: public-readable, member-posted forum with Education Center-aligned categories and chat-style topic replies.
- Apps: public app directory, dedicated app pages, software-use terms, third-party notices, and a future release manifest for Mac/Windows downloads.
- TPI Videos and Creator Studio integration: provider-aware video discovery,
  creator channels, responsive catalog, browser-local StudioFlow schedule
  synchronization, and protected `/studio/` access. `/live-video` remains
  Coming Soon and local creator recordings are not public playback by default.
- Community Feed and Messenger: existing member social and messaging systems
  with server-side authorization and preserved attachment boundaries.
- Administration and final release phases: planned only; no later phase may be
  started from a historical plan section without the current roadmap gate.

## Current authoritative status

The current roadmap and cross-workspace status are maintained in
[`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md) and
[`docs/planning/TPI-DOCS-001_MASTER_STATUS.md`](docs/planning/TPI-DOCS-001_MASTER_STATUS.md).
These documents consolidate status without replacing historical audit reports.
Do not restart or reorder completed work based on older handoff or audit text.

## App Release Position

The Paranormal Initiative apps are intended to be free ITC, EVP, paranormal research, documentation, and experimentation tools. They are not open-source releases. TPI source code, interface design, branding, workflows, compiled applications, and assets remain protected unless Todd explicitly changes the license.

Future public builds should use `app-releases.json` for version/download metadata. Large installer files should live in Cloudflare R2 or GitHub Releases, not as oversized static Worker assets.

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

# Mystic Public Knowledge Expansion

**Date:** 2026-11-15 00:21 EST
**Scope:** Public/member-facing Mystic only
**Status:** Deployed and live verified.

## Objective

Make Mystic useful for public TPI questions beyond the Help Center article
catalog while preserving a strict boundary around internal operations. Mystic
should be able to point members toward the public repository, education
material, haunted-location research, public articles, public apps, and public
videos without exposing the internal Help Desk or Administration Center.

## Public sources added

The new `mystic-public-knowledge.js` catalog includes these published sources:

- TPI Educational Repository and Repository Pathways
- Official Field Encyclopedia
- Complete Paranormal Terminology reference
- Investigation Compendium
- Forensic Analysis Compendium
- Evidence Compendium
- TPI Education Center
- Haunted Locations Directory
- TPI Published Articles
- TPI Apps and Workspaces
- TPI Videos

Mystic searches the existing public Help Center articles first. When no strong
article match is available, it searches this public source index and returns a
verified source link with a short description. Unknown questions still receive
the honest fallback instead of an invented answer.

## Audience and safety boundary

This is intentionally a public-only expansion. Mystic does not load or search:

- Internal Help Desk articles
- Administration Center procedures
- Moderator or staff instructions
- Private records, credentials, or protected routes

Questions about internal procedures continue to receive the protected-boundary
response and are not answered from internal material.

## Protection added

- Public Help Center pages load the public knowledge catalog explicitly.
- The shared member shell loads the catalog before mounting Mystic, without
  blocking the rest of the member shell.
- Internal Help Desk pages are checked to load neither Mystic nor the public
  catalog.
- Help Center separation verification checks the audience marker, public source
  references, and internal-route exclusion.
- Help Center separation verification requires the public source matcher and
  source-result renderer to remain present alongside the audience boundary.
- The existing local asset refresh path keeps the running Worker synchronized
  with the new general-site asset without touching protected app directories.

## Verification record

- JavaScript syntax checks: passed.
- `git diff --check`: passed.
- Help Center separation: **20/20 passed** locally, including anonymous public
  access and denied anonymous internal access.
- Focused Firefox profile/feed acceptance remains an existing member-profile
  gate and was not broadened for this public-only change. The new public source
  path is protected by the Help Center separation contract, which passed
  **20/20** locally.
- Guarded production release: `rel-260b8781abc0-c67020fbdaea`.
- Deployed Worker version: `2612594e-18ab-444e-addb-f40ca98ef890`.
- Production anonymous smoke: **10/10 passed**.
- Live public Help Center check: Mystic answered `Encyclopedia` with the
  Official Field Encyclopedia source link.
- Live boundary check: public knowledge asset returned HTTP 200; anonymous
  Internal Help Desk returned HTTP 403.
- Protected StudioFlow, Nova Workspace, and Creator Studio bytes remained
  unchanged by the website release.

The public Mystic expansion is complete. Internal Help Desk/Admin/Moderator
knowledge remains intentionally out of scope until the public experience is
finished and separately authorized.

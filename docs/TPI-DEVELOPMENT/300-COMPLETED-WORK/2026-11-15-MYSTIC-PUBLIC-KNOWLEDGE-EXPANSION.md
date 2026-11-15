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
- Ghostology 101
- Haunted Locations Directory
- TPI Published Articles
- TPI Apps and Workspaces
- TPI Videos

Mystic searches the existing public Help Center articles first for task
guidance. Direct definition intents use a source-grounded answer when TPI has a
precise published definition; otherwise, when no strong article match is
available, Mystic searches this public source index and returns a verified
source link with a short description. Unknown questions still receive the
honest fallback instead of an invented answer.

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

## Follow-up repair — direct definition answers

On **2026-11-15**, the owner tested “What is a ghost?” and Mystic selected a
broad Education Center guide instead of answering from the precise public
definition already present in TPI’s Terminology Reference.

The public catalog now contains a protected `ghost-definition` intent. Mystic
answers the common definition forms directly, explains that “ghost” is a
working description rather than a proven conclusion, and links to the complete
Terminology Reference. Ghostology 101 is also indexed as a public source for
related learning. The repair was deployed in release
`rel-ca4350b09f14-71249913e23a` as Worker version
`01ae8fc8-df88-48cf-bbe7-61689245b549`; production smoke passed **10/10**, and
the live Help Center returned the expected TPI definition and source link.

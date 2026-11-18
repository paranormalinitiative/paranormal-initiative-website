# Haunted Location Directory — Full State Coverage

Date: 2026-11-18
Status: **DEPLOYED AND LIVE VERIFIED.**

## Request and outcome

The remaining state pages in the Haunted Location Directory were filled with
starter research leads so every state now has a usable directory page. The
25 previously reserved pages now share a common data and rendering layer and
contain four research leads each, for 100 new entries. The directory now
contains 563 entries across all 50 states, including the existing researched
entries and the new starter leads.

The new entries are deliberately labeled **Under review** and **Starter
research lead**. They are not presented as proof that a place is haunted, and
they are not represented as fully verified investigation-ready records yet.
The established state pages and the public submission workflow retain their
existing verification standard.

## Research and sourcing method

The starter leads were assembled from public state tourism, heritage,
historical, preservation, and haunted-history references. Each lead keeps a
source URL and a short source note so the research team can continue the review
from a traceable starting point. The directory distinguishes documented
history and public folklore or reported claims; neither is silently converted
into a finding of paranormal activity.

The next verification pass should confirm the exact site identity, public
location, historical context, claim provenance, access status, and any
meaningful investigation zones before a starter lead is promoted to a complete
directory entry. Coordinates were intentionally not invented for this pass.
Researchers must verify the official site or a public map before field
planning.

## Access, privacy, and safety boundary

- Use public locations and public references only.
- Do not publish private residences, private addresses, trespassing routes, or
  instructions that bypass an operator’s permission.
- Confirm hours, closures, permits, operator rules, and safety conditions
  before visiting.
- Treat a reported haunting as a claim or tradition unless the entry’s
  evidence says otherwise; do not imply proof.
- Member submissions remain candidates for research review and are never
  auto-published into a state page.

## Implementation

- `haunted-location-directory/state-data.js` contains the shared state metadata
  and starter lead data.
- `haunted-location-directory/state-directory.js` renders the shared starter
  page without duplicating the entry markup across 25 files.
- `haunted-location-directory/state-directory.css` keeps the new pages in the
  TPI purple, gold, teal, and red visual system with responsive cards.
- The 25 state pages load the shared data, renderer, and stylesheet.
- `haunted-locations.html` and
  `haunted-location-directory/index.html` now expose all 50 state pages and
  show the 563-entry directory total.
- `scripts/qa/tpi-haunted-location-directory.mjs` prevents placeholder pages,
  missing state links, incomplete starter records, or missing shared assets
  from being released.

## Verification record

The focused directory guard passed:

```text
npm run verify:haunted-location-directory
TPI haunted-location-directory verification passed: 50 state pages, 100 new starter entries, no placeholders.
```

The supporting JavaScript syntax checks and `git diff --check` also pass.
The guarded release preflight and production live acceptance completed for the
exact candidate below.

## Release record

- Source commit: `0321c60ee20c2ac7556d57b7beee6c7940c25ee8`
- Release candidate: `rel-0321c60ee20c-92e30fe336f7`
- Production Worker version: `81ab46b7-e287-4580-9f83-2a32884b23d7`
- Rollback target: `9b5a8be5-7ce8-407b-8fa8-1a8c6e734aed`
- Release profile: full / Tier 1 because the verification tooling and package
  script changed
- Preflight: 40 gates passed; exact candidate certified with manifest digest
  `db10cb815ababfc16547a0a15f65e6db9f17a062cc1037082be8b7f3dc8fbdc7`
- Production smoke: **10/10 passed**
- Firefox Developer Edition acceptance: **65/65 passed** in an isolated
  disposable profile
- Final deployment status: `DEPLOYED_AND_VERIFIED` at 100% traffic
- Protected applications: StudioFlow, Nova Workspace, Creator Studio, and
  unrelated owner/member data were not intentionally changed.

## Follow-up work

This release establishes complete state-page coverage, not exhaustive
verification of every location. The research team can now deepen each state in
priority order, promote leads only after the TPI criteria are met, and add
member submissions through the private verification queue.

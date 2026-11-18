# Haunted Location Directory — Full State Coverage

Date: 2026-11-18
Status: **IMPLEMENTED; RELEASE PENDING FINAL GUARD AND LIVE ACCEPTANCE.**

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
The guarded release preflight and production live acceptance must record their
results below before this work is considered deployed and complete.

## Release record

- Source commit: pending
- Release candidate: pending
- Production Worker version: pending
- Rollback target: pending
- Production smoke: pending
- Firefox Developer Edition acceptance: pending
- Protected applications: StudioFlow, Nova Workspace, Creator Studio, and
  unrelated owner/member data were not intentionally changed.

## Follow-up work

This release establishes complete state-page coverage, not exhaustive
verification of every location. The research team can now deepen each state in
priority order, promote leads only after the TPI criteria are met, and add
member submissions through the private verification queue.

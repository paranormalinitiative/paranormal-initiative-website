# TPI-STUDIOFLOW-122B — Automatic Note Titles

Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED**  
Date: 2026-10-31

## Result

Automatic note naming is implemented and verified on the authoritative local
Worker at `http://127.0.0.1:8787/studio/`. A newly created note starts in
automatic mode with the title `New Note`. As the user enters content, the title
is derived from the first meaningful rendered text line, ignoring leading blank
lines and supported formatting markup, and limited to 80 display characters.

Users can edit the title directly to enter manual mode. Manual titles remain
stable when the body changes. The More editing tools menu provides **Use
automatic title**, which returns the note to automatic naming and immediately
derives the title from its current body.

## Source and staging

- StudioFlow source worktree: `/Users/toddknipple/Documents/StudioFlow/web-122`
- Source branch: `codex/studioflow-122-notes`
- Verified source commit: `8a68c677fa8c29cd2dffe3fc7edb29ef1a9919a5`
- Website branch: `codex/tpi-development`
- Local runtime: `npm run dev:local` / Cloudflare `workerd`
- Local persistence: `.local-dev/state/v3`
- Production: unchanged; no production command was run

The provenance-checked staging workflow built the exact source commit twice,
confirmed reproducible output, and staged the candidate into the existing
8787 Worker. The staged assets are:

- JavaScript: `studio/assets/index-BkV9BhfI.js`
  - SHA-256: `140141d76481fa3288fea1560ba564e59887e7e0c9a0c93952b7b0624adc6040`
- CSS: `studio/assets/index-DCzHEnai.css`
  - SHA-256: `c0a544549f0d440a3c017a3c4098158e62610b8cc36d7222b71cbeaaba9ece2c`

## Implementation

The backend adds an additive `title_mode` column through migration
`0056_studioflow_note_automatic_titles.sql`. Existing rows receive the
database default `manual`, so historical note titles are not rewritten. New
notes created by the Notes UI explicitly use `automatic` mode. Server-side
updates derive automatic titles from sanitized body text as well as enforcing
the existing optimistic `expectedVersion` save boundary.

The Notes editor derives the displayed automatic title from sanitized rendered
HTML, treats block elements as line boundaries, updates the draft while the
first line changes, and sends `titleMode` through the existing autosave path.
Manual title input switches the note to manual mode. Restoring automatic mode
uses the same existing editor and persistence model; it does not create a
second note or storage namespace.

Duplicate notes are explicitly manual copies. Automatic title generation is
also applied when restoring a revision into a note that remains in automatic
mode. All note list/search/collection/sidebar responses carry the synchronized
title and mode through the existing owner-scoped API.

## Verification

The real disposable Firefox Developer Edition verifier
`scripts/verify/tpi-studioflow-122-notes.mjs` passed **40/40** on port 8787.
It covered:

- `New Note` initial state
- creation and refresh persistence
- first meaningful line title generation
- live title update with multiple rendered lines
- generated title autosave persistence
- manual title override and stable manual mode
- restoration of automatic naming
- existing Notes workspace, sidebar, layout, toolbar, spellcheck and autosave
  regression coverage

Additional gates:

- `npm run test:studioflow:firefox`: **64/64 PASS**
- `npm run verify:release-safety`: **21/21 PASS**
- `npm run build` in the isolated source worktree: **PASS**
- `node scripts/stage-studioflow-authoritative.mjs --apply`: **PASS**;
  source identity, reproducible builds, exact hashes and staged comparison all
  matched

The verifier used disposable authenticated browser data and created/deleted
only disposable note and collection fixtures. Existing owner Studios,
recordings, scripts, preferences, browser storage, local D1/R2 state and the
original mixed StudioFlow checkout were preserved.

## Acceptance matrix

| Requirement | Result |
| --- | --- |
| New note begins as `New Note` | PASS |
| First meaningful line derives title | PASS |
| Leading blank/formatting handling | PASS |
| Live automatic title updates | PASS |
| Manual title override | PASS |
| Restore automatic naming | PASS |
| Autosave and optimistic persistence | PASS |
| Refresh persistence | PASS |
| Existing titles preserved | PASS by additive manual default; no migration rewrite |
| Notes workspace/sidebar synchronization | PASS through existing list payloads and real UI check |
| Production deployment | NOT AUTHORIZED / NOT PERFORMED |

Owner acceptance for the broader D122 Notes product remains separate from this
refinement. D122 attachment recovery, structured research references,
exhaustive revision/concurrency interruption coverage and unexecuted browser or
device matrices remain governed by the parent directive records.

# TPI-STUDIOFLOW-122F.2A — Notes Editor Document-Style Appearance

Status: COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT ONLY / NOT DEPLOYED  
Date: 2026-10-31

## Objective

Remove the prominent rectangular focus treatment from the Notes rich-text
editor while preserving automatic focus, the visible caret, keyboard editing,
rich formatting, attachments, autosave, revisions, and accessibility.

## Root cause

The Notes editor had a scoped rule in `src/styles.css`:

```css
.notes-rich-editor:focus{box-shadow:inset 0 0 0 1px var(--blue)}
```

That full inset box shadow surrounded the complete document surface whenever
the contenteditable editor received focus, producing the chat-input-style
green/bright rectangular outline reported by the owner.

## Implemented correction

Only the Notes editor focus rule changed:

- Removed the full perimeter inset focus box.
- Added a subtle theme-token-based document-surface tint on `:focus`.
- Added a thin bottom cue on `:focus-visible` for keyboard users.
- Preserved the existing `outline:0` editor base, `caret-color`, automatic
  focus helper, contenteditable surface, toolbar, and all editor handlers.

The correction is scoped to `.notes-rich-editor`; no global browser focus
outlines or unrelated controls were changed.

## Source and staged assets

- StudioFlow source worktree: `/Users/toddknipple/Documents/StudioFlow/web-122`
- Source branch: `codex/studioflow-122-notes`
- Source commit: `95fc46baae987dee0d7035e6032822330a709c32`
- Authoritative local URL: `http://127.0.0.1:8787/studio/`
- JavaScript: `index-DbEHpRbI.js`
- JavaScript SHA-256: `ff618245fa0a77811673fab77632914fd6239f1a57a596ae3114da2a477e39e9`
- CSS: `index-Diqa40JX.css`
- CSS SHA-256: `e4abe1d372de5f21dbecdd97c2dc9f0fef053e7c0e37fa2f36431d82bfd8794a`
- Integrated entry-point SHA-256: `2f96eae32e3828f4062763dea0c163bbe8531999c09a08f946a834aac813c3a4`

## Acceptance matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Notes editor loads normally | PASS | Firefox Developer Edition focused Notes suite |
| New Note automatically shows a caret | PASS | Focused browser assertion |
| Immediate typing and Enter paragraphs | PASS | Focused browser assertions |
| Full green/perimeter focus rectangle removed | PASS | Scoped source/style contract and staged browser candidate |
| Keyboard focus remains identifiable | PASS | `:focus-visible` bottom cue using `var(--blue)` |
| Rich formatting, toolbar and selection preserved | PASS | Focused Notes suite and maintained Firefox regression |
| Automatic title, autosave and revisions preserved | PASS | Focused Notes suite |
| Photograph and attachment controls preserved | PASS | Focused Notes suite |
| Organization rail and unrelated StudioFlow controls | PASS | D122F.1 13/13 and maintained Firefox 64/64 |
| Shared StudioFlow theme tokens | PASS | Editor uses existing `--bg`, `--blue`, `--text`, and `--muted` tokens |
| Alternate broadcast graphic themes | NOT APPLICABLE | They style program graphics, not the Notes application surface |
| Source/build/staging provenance | PASS | Reproducible build and verify-only staging |
| Release safety | PASS | 21/21 |
| Production deployment | NOT AUTHORIZED | No production command run |

## Files changed

- Isolated StudioFlow source: `src/styles.css` only.
- Website verifier: `scripts/verify/tpi-studioflow-122-notes.mjs`.
- Development release manifest and staged HTML/assets.
- This execution record and the authoritative status, handoff, workflow,
  testing, and directive-index records.

## Preservation

- Original mixed StudioFlow checkout was not modified.
- Existing note content, photographs, attachments, local D1/R2 state, owner
  Studios, recordings, and browser storage were not reset, migrated, or
  deleted.
- The authoritative Worker remained local-only on port 8787.
- Production remained unchanged and no deployment was attempted.

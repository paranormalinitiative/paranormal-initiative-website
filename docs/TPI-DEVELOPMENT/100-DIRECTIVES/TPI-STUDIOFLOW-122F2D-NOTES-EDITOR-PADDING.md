# TPI-STUDIOFLOW-122F.2D — Notes Editor Padding and Document Alignment

Date: 2026-10-31  
Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED**

## Objective and scope

This was a targeted Notes editor surface correction. No editor logic, note
records, attachment storage, autosave behavior, revision behavior, focus
handling, or production assets were changed. The original mixed StudioFlow
checkout and unrelated worktrees were preserved.

## Root cause

The editable document surface used:

```css
.notes-rich-editor { padding: 18px 4px; }
```

The 4px horizontal value left paragraphs, headings, lists, images, captions,
tables, and the empty placeholder too close to the writing-surface edge. The
editor panel itself already had 18px padding, but that did not provide adequate
internal document-column spacing because the editable surface occupied the
remaining panel width.

## Correction

Only `src/styles.css` was changed in the StudioFlow source:

- Desktop: `padding: 18px 22px`.
- Medium layouts (`max-width: 1180px`): `padding-inline: 18px`.
- Narrow layouts (`max-width: 850px`): `padding: 16px 14px`.

The existing focus background treatment, caret color, formatting rules, image
figure rules, caption behavior, table behavior, and responsive toolbar rules
remain unchanged. No green border or bottom focus line was reintroduced.

### Before/after measurements

| Layout | Before | After |
| --- | ---: | ---: |
| Desktop horizontal document padding | 4px left / 4px right | 22px left / 22px right |
| Medium horizontal document padding | 4px left / 4px right | 18px left / 18px right |
| Narrow horizontal document padding | 4px left / 4px right | 14px left / 14px right |
| Desktop vertical padding | 18px top / 18px bottom | unchanged |
| Narrow vertical padding | 18px top / 18px bottom | 16px top / 16px bottom |

The focused Firefox verifier measured the computed document surface at desktop
and narrow widths and confirmed the content begins inside the surface rather
than against its edge.

## Source and integration provenance

- StudioFlow source branch: `codex/studioflow-122-notes`
- StudioFlow source commit: `6af7b1089fbe38fb85a72590c0017086ff65f6b1`
- Website integration commit: `142c8a8bafc6cad56c16b5e80ec2ade9017aeb5d`
- JavaScript: `index-DMqbydAn.js`
- JavaScript SHA-256: `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- CSS: `index-CeIVL89B.css`
- CSS SHA-256: `35f10a284e564ea006e9bf44831618cc3b6bf38754a6868239cadd253b104f2c`
- Production: unchanged; no deployment was authorized or performed

The source repository remains a local worktree without a configured remote.
The website integration is committed on `codex/tpi-development`; the existing
production baseline is not modified.

## Verification

| Check | Result |
| --- | --- |
| Source `tsc` and Vite build | PASS |
| Reproducible authoritative staging | PASS; two builds matched |
| Exact staged asset comparison | PASS; 29 integrated files, zero mismatches |
| 8787 local Worker status | PASS; Worker running, local-only D1/R2 preserved |
| Firefox Notes acceptance with desktop/narrow computed padding checks | PASS |
| Maintained Firefox regression | PASS; 64/64 |
| Release-safety suite | PASS; 21/21 |
| Existing focus/caret, toolbar, autosave, title, attachment, image, folder, and revision paths | PASS through maintained Notes acceptance |
| Production deployment | NOT PERFORMED |

The browser checks used an isolated disposable Firefox Developer Edition
profile and disposable Notes collections/notes. Owner browser storage and
production data were not accessed or cleared.

## Files changed

StudioFlow source:

- `/Users/toddknipple/Documents/StudioFlow/web-122/src/styles.css`

Website integration and verification:

- `scripts/studioflow-release-baseline.json`
- `scripts/verify/tpi-studioflow-122-notes.mjs`
- `studio/index.html`
- `studio/assets/index-DMqbydAn.js`
- `studio/assets/index-CeIVL89B.css`

## Acceptance result

**PASS.** Notes now presents a consistent document-writing inset on desktop,
medium, and narrow layouts. Existing alignment, focus, caret, formatting,
attachments, autosave, revisions, note titles, and storage behavior remain
intact. Production remains unchanged.

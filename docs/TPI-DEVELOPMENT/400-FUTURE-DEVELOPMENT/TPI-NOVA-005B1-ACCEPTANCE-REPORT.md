# TPI-NOVA-005B1 — Home Ribbon Acceptance Report

**Date:** 2026-11-07
**Status:** COMPLETE
**Authoritative development origin:** `http://127.0.0.1:8787/`
**Scope:** Real GenOffice-style Home ribbon functionality in Nova and the integrated Content Editor.

## Result

The Home ribbon is implemented as Nova-owned TipTap commands and bounded document
schema attributes. Controls shown as available are wired to editor transactions;
unsupported GenOffice capabilities remain explicitly staged rather than exposed as
fake working controls.

Implemented Home functionality:

- clipboard: Paste, Cut and Copy;
- font family, bounded font size, bold, italic, underline and strike;
- bounded font colour and highlight colour;
- clear character and paragraph formatting;
- Normal, Title, Heading 1 and Heading 2 paragraph styles;
- bulleted and numbered lists, blockquote and horizontal rule;
- left, centre, right and justified alignment;
- increase and decrease indent with bounded paragraph margins;
- Undo and Redo;
- real table, link, row, column and delete-column document actions;
- responsive ribbon overflow without page-wide horizontal overflow;
- read-only disabling and persistence through the existing structured Nova document envelope.

## Verification

| Gate | Result |
|---|---:|
| Focused Home ribbon verifier | 5 passed, 0 failed |
| Nova 005B2A foundation verifier | 23 passed, 0 failed |
| Shared-editor verifier | 13 passed, 0 failed |
| Publication snapshot verifier | 60 passed, 0 failed |
| Persistence verifier | 67 passed, 0 failed |
| Nova Core verifier | 105 passed, 0 failed |
| Full editor acceptance | 134 passed, 0 failed |
| Firefox Developer Edition acceptance | 80 passed, 0 failed |
| Responsive acceptance | 5 passed, 0 failed |
| Chromium secondary smoke | 7 passed, 0 failed |
| TypeScript, syntax and diff checks | passed |

The focused verifier produced the prescribed success line:

`TPI-NOVA-005B1 — COMPLETE — REAL HOME RIBBON FUNCTIONALITY VERIFIED`

## Browser acceptance

Authenticated Firefox Developer Edition acceptance on `127.0.0.1:8787` verified the
integrated editor ribbon, Home controls, Insert controls, selection formatting,
table/link operations, save state and responsive editor surface. Chromium completed
the secondary shell, edit, reload, title and tablet-width smoke pass.

The persistent 8787 Worker was not restarted or replaced. Production was not touched.

## Environment and cleanup

- `127.0.0.1:8788` remained the existing StudioFlow room service and was not changed.
- The 005B1 and Nova verifiers use disposable or free ephemeral verification ports.
- No fixed `8792` Worker remains in the verifier defaults or active listener set.
- Verifier-created throwaway state was isolated from the official `.local-dev` state.
- The existing authenticated local browser test document was retained for the owner’s
  local workspace; no production or shared data was deleted.

## Attribution boundary

The ribbon is implemented in Nova-owned source. GenOffice was used as the documented
behaviour and capability reference only; no GenOffice source was copied or imported.
The existing attribution boundary and `THIRD-PARTY-NOTICES.md` remain unchanged.

**TPI-NOVA-005B1 — COMPLETE — REAL HOME RIBBON FUNCTIONALITY VERIFIED**

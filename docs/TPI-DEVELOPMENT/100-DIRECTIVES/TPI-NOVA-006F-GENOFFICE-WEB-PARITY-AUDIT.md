# TPI-NOVA-006F — GenOffice Documents and Slides Web Parity Audit

**Date:** 2026-11-08  
**Scope:** Nova Documents and Slides in the existing Content Editor  
**Reference repository:** `/Users/toddknipple/Documents/GitHub/genoffice`  
**Reference HEAD inspected:** `968d7d23`  
**Authoritative local runtime:** `http://127.0.0.1:8787/paper-editor.html`

## Result

The web editor now has the same primary GenOffice ribbon structure and the
core, browser-safe editing workflow is wired end to end. This audit also makes
the remaining parity boundary explicit: Electron GenOffice contains native
document and presentation features that cannot honestly be called complete in a
browser implementation until their data model, rendering, and persistence
contracts are ported.

This record does not silently convert those gaps into a false PASS.

## Verified implementation map

### Documents

- Home: clipboard commands, font family/size, bold/italic/underline/strike,
  text color, highlight, clear formatting, paragraph styles, lists, indents,
  alignment, blockquote, horizontal rule, styles pane, tables, links, and
  find/replace.
- Insert: tables and table operations, links, symbols, horizontal rules,
  bookmarks, DATE/TIME/AUTHOR/ORGANIZATION fields, and image upload/URL
  insertion with portable document image nodes.
- Draw: highlight and markup controls.
- Design: document font/theme and heading-style controls.
- Layout: paragraph alignment/indent and table row/column/merge/alignment,
  AutoFit, width, and border controls.
- References: citation marker, footnote marker, and source-link insertion.
- Mailings: author, organization, and date merge-field insertion.
- Review: word count and review-state controls.
- View: navigation pane, styles pane, find/replace, Print Layout, Web Layout,
  Outline, and zoom.
- Autosave, optimistic versioning, recovery drafts, revisions, and existing
  article/Nova persistence remain in the existing server-backed workflow.

### Slides

- Home/Insert/Draw/Design/Transitions/Animations/Slide Show/Review/View tabs
  are present with a shared ribbon interaction model.
- Layout insertion: Blank, Title, Title and content, Section header, Quote.
- Editable text, font family/size, bold/italic, alignment, shapes (rectangle,
  rounded rectangle, ellipse), lines, images from upload or URL, tables, themes,
  transitions, selected-element fade animation, review notes, undo/redo, slide
  duplication/deletion/reordering, live thumbnails, slide sorter, and reading
  view.
- Presenter mode includes fullscreen, previous/next navigation, speaker notes,
  next-slide preview, keyboard navigation, and exit behavior.
- Slide and workspace URL persistence remains active, so refresh returns to the
  Slides workspace and the open presentation.

## GenOffice comparison and remaining boundary

The inspected Electron reference contains additional native-first systems that
are not represented by the current Nova web model. They remain explicitly
unported rather than being represented by inert buttons:

- Documents: native page setup and print-preview fidelity, headers/footers,
  page-number fields, tracked changes with accept/reject, comments threads,
  compare, document protection, full references/footnote rendering, mail merge
  execution, and native DOCX import/export.
- Slides: SmartArt, charts with data dialogs, 3D models, native video/audio and
  screen recording, custom shows, audience view, multi-window presenter view,
  comments threads, advanced animation timelines, and native PPTX import/export.

These are product-sized ports, not safe cosmetic substitutions. They require
their own schemas or portable export contracts before they can be marked as
matching the Electron application.

## Browser verification

Firefox Developer Edition against the authoritative local Worker showed:

- Documents mode with all nine GenOffice document tabs and the Home ribbon.
- Documents Insert mode with table, bookmark, field, link, symbol, and image
  controls.
- Slides mode with the full nine-tab ribbon, existing deck thumbnails, speaker
  notes, Present, and saved Slides workspace routing.

Automated checks on this tree:

- `npm --prefix nova-app run typecheck` — PASS
- `node --check paper-editor.js` — PASS
- `git diff --check` — PASS
- `npm run verify:nova-006-slides` — PASS (22/22)
- `npm run verify:nova-006-editor-parity` — PASS (8/8)
- `npm run build:content-editor-nova` — PASS

Production was not changed by this audit pass. The generated assets from this
pass must complete the guarded local-auth, preflight, release, and live Firefox
acceptance gates before being described as deployed.

## Files changed in this audit pass

- `nova-app/src/documents/DocumentEditor.tsx`
- `nova-app/src/shared-editor/EditorToolbar.tsx`
- `nova-app/src/shared-editor/FindReplacePanel.tsx`
- `nova-app/src/shared-editor/GenOfficeRibbon.tsx`
- `nova-app/src/shared-editor/InsertTools.tsx`
- `nova-app/src/shared-editor/editorExtensions.ts`
- `nova-app/src/slides/GenOfficeRibbon.tsx`
- `nova-app/src/slides/SlideCanvas.tsx`
- `nova-app/src/slides/SlidesSurface.tsx`
- `nova-app/src/slides/model.ts`
- `nova-app/src/styles.css`
- `scripts/verify/tpi-nova-006-editor-parity.mjs`
- `scripts/verify/tpi-nova-006-slides.mjs`
- `package.json`
- generated `content-editor-nova` assets and entrypoint


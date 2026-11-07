# TPI-NOVA-005B0B — GenOffice Home Ribbon Architecture

**Parent:** TPI-NOVA-005B0
**Predecessor:** TPI-NOVA-005B0A (accepted at `21256bee`)
**TPI baseline:** `21256bee`
**Frozen GenOffice SHA:** `d5ebe838d91373c54528795b50663d4f33947183`
**Scope:** Architecture and inventory only. No GenOffice code imported, no packages added, no TipTap extensions, no Nova toolbar, JSON, autosave, publication, migration or production change.

Upstream paths below are relative to the GenOffice repository root. Ribbon files are under `apps/docs/src/renderer/`, abbreviated `R/` here. Upstream source was read from a scratch clone outside this repository and is not copied into it.

---

## 1. Provenance verification result

Every provenance row recorded in TPI-NOVA-005B0A was checked against the frozen SHA. This is an exhaustive pass, not a sample.

| Metric | Result |
|---|---|
| Provenance rows checked | 36 path rows (10 ribbon files; 26 `@genoffice/ui`, `@genoffice/docx-engine`, `@genoffice/pptx-render` preset-geometry and icon rows) plus 2 PNG icon assets |
| Blob SHA matches | 38 of 38 (all prefixes resolved by `git rev-parse --short=40 HEAD:<path>`) |
| Blob SHA mismatches | 0 |
| Last-touch commit matches | 38 of 38 (`git log -1 -- <path>`) |
| Last-touch mismatches | 0 in the rows that carried a last-touch value |
| Date mismatches | 0 |
| Byte counts | All 10 ribbon files re-measured; all matched |
| Rows corrected | 2 documentation errors in 005B0A (see below) |
| Unresolved provenance mismatches | **0** |

### 005B0A provenance corrections discovered during exhaustive 005B0B verification

Blob SHAs and byte counts in 005B0A were correct. Two documentation errors were corrected in place in `TPI-NOVA-005B0A-GENOFFICE-RIBBON-ARCHITECTURE.md`, with a dated note in its status section:

1. Section 30 gave the PNG icon paths as `components/icon-*.png`. The files are at `apps/docs/src/renderer/assets/icon-editor.png` (blob `3a1ef27f77`) and `apps/docs/src/renderer/assets/icon-translate.png` (blob `85c74064e3`). Both were added in `9d37beaf` on 2026-08-06, and both are imported at `ribbon-tabs.tsx:33–34`.
2. The `packages/ui/src/icons.tsx` reference (blob `a79128713a`) lacked its last-touch value. It is `f7555523` dated 2026-10-10.

---

## 2. Home source map

| Home area | Primary file (`R/` unless noted) | Key functions and locations | Editor/model layer |
|---|---|---|---|
| Tab body | `components/Ribbon.tsx` | Home body at line 3440 | TipTap commands, `ribbon-tabs.tsx` helpers |
| Clipboard group | `components/Ribbon.tsx` | Group at 3612; `pasteAs()` 2229; cut/copy `clipboard()` 2234 and `document.execCommand`; Format Painter `pickUpFormat` 1991 and button at 2095 | `editor/paste-actions.ts`, `editor/paste-options.ts`, `editor/paste-web-html.ts`, `editor/paste-text.ts`, `editor/markdown-paste.ts`, `editor/sanitize-markdown-html.ts` |
| Font family and size | `components/Ribbon.tsx` | Font combobox 1596–1700; `commitSize` 1720; grow/shrink 3863/3872; `applyFontStep` 1930–1975 | `setTextStyle` → `docTextStyle` mark; `font-sizes.ts`; `editor/text-style-resolve.ts` |
| Character buttons | `components/Ribbon.tsx`, `components/ribbon-tabs.tsx` | `markBtn` (bold/italic/underline/strike via `toggleMark`); `toggleVertAlign` 1986; highlight and colour via `setTextStyle`; Change Case `changeCase` 2222 and `applyCase` | `editor/marks.ts` (`Mod-b`, `Mod-i`, `Mod-u`); `editor/case-transform.ts` |
| Clear formatting | `components/ribbon-tabs.tsx` | `clearAllFormatting` at 169; `clearParagraphFormatting` 132–160 | `unsetAllMarks`, `applyParagraphStyleId`, `setParaAttrs` with `DIRECT_PARA_ATTRS` |
| Styles | `components/ribbon-tabs.tsx`, `components/StylesPane.tsx`, `components/StyleDialog.tsx` | `applyParagraphStyleId` 256–290; `shedMajorityDirectFormatting` 198–240; `applyGalleryStyle` about 305; StylesPane 402 lines; StyleDialog 360 lines | Heading nodes `docHeading` (attrs `level`, `outlineOnly`); `docParagraph`; `docListItem` |
| Format state | `components/ribbon-format-state.ts` | 399 lines; `RibbonFormatState` | Reads marks via `ed.isActive`; `text-style-resolve.ts` 53 (`selectedSizeMixed`) |
| Paragraph group | `components/Ribbon.tsx`, `ribbon-tabs.tsx` | Alignment, indent, spacing via `setParaAttrs`; `editor/indent.ts`, `editor/direction.ts` | Paragraph attributes |
| Lists | `components/Ribbon.tsx` (1826–1852), `components/ListDialogs.tsx` | `changeListLevel`; list presets | `list-presets.ts` (291 lines); `numbering-actions.ts` (440 lines) |
| Dialogs | `components/FontDialog.tsx` (544), `ParagraphDialog.tsx` (420), `ListDialogs.tsx` (795), `PasteSpecialDialog.tsx`, `StyleDialog.tsx` | See sections 10 and 29–31 | `setParaAttrs`, `docTextStyle` attributes, numbering definitions |
| Colour palette | `components/ribbon-color-palette.tsx` (70 lines) | `RibbonColorPalette` | Used by font colour and highlight |
| Shortcut reference | `shortcuts.ts` (195 lines); `components/ShortcutsDialog.tsx` | `SHORTCUTS` array; `shortcutKeys` | Mac notation rewritten for Windows by `@genoffice/i18n` |
| Icons | `components/icons.tsx`, `components/table-icons.tsx`; `assets/icon-editor.png`, `assets/icon-translate.png` | See 005B0A section 30 | Not reusable (see 005B0A section 30) |

---

## 3. Clipboard matrix

Adoption classes: **A** browser-ready logic; **B** adaptable with Nova UI/storage; **C** GenOffice document-model dependent; **D** desktop/native only.

| Capability | Source (`R/`) | Command or function | Dependencies | Browser notes | Nova today | Schema impact | Class | Recommended Nova treatment |
|---|---|---|---|---|---|---|---|---|
| Paste (default) | `components/Ribbon.tsx` 2229 `pasteAs()`; `editor/paste-actions.ts` | `pasteAs` with the default mode from `paste-options.ts` | ProseMirror paste pipeline | Relies on the browser clipboard event | Basic paste via TipTap | None beyond current v1 | B | Keep Nova paste pipeline; adopt the mode model |
| Cut | `Ribbon.tsx` 2234 `clipboard()` | `document.execCommand`-backed cut | Browser clipboard | `execCommand` is deprecated; use the native clipboard event where possible | Browser default | None | A | Use the browser clipboard event |
| Copy | `Ribbon.tsx` 2234 | Same as cut | Browser clipboard | As above | Browser default | None | A | As above |
| Paste Special dialog | `components/PasteSpecialDialog.tsx` | Choices: HTML→source, text, picture. OK disabled until a flavour is chosen | Clipboard flavour list | Flavours come from the clipboard `types` list | Not present | None for dialog | B | Adopt in 005B1 or later as a dialog |
| Paste options (mode) | `editor/paste-options.ts` | `PasteMode = 'source' \| 'merge' \| 'text'`; default stored in localStorage under `MODE_KEY`; `mergeFormattingFragment` near line 136 | localStorage; document marks | localStorage is per origin, so each Nova origin keeps its own setting | Not present | Needs mark-level merge rules | B | Adopt the `text`/`source` modes early; merge is later |
| Keep source formatting | `paste-options.ts` mode `source` | Writes source marks unchanged | Mark schema | None | Not present | Needs docTextStyle attrs preserved | C | Requires the v2 mark model (section 14) |
| Merge formatting | `paste-options.ts` mode `merge`, `mergeFormattingFragment` | Re-marks pasted runs to the destination | Mark schema and style resolution | None | Not present | Needs style-aware mapping | C | Later tranche |
| Plain text paste | `editor/paste-text.ts` `pasteTextSlice` 71 | Builds a plain-text slice | ProseMirror slice | None | Basic plain-text paste | None | A | Adopt |
| Single-cell paste | `editor/paste-text.ts` `singleCellPasteText` 29 | Splits table cell text | Table nodes | None | Not present | None | C | Later, with tables |
| Web HTML paste | `editor/paste-web-html.ts` | `isForeignPasteHtml`; `pushDownWebInlineStyles` copies font-family, font-size and colour down to spans; skips table subtrees | Browser DOM parsing | DOMParser is available in modern browsers | Basic HTML paste with sanitisation | None beyond v1 | B | Adopt the push-down rule in Nova's paste |
| Markdown paste | `editor/markdown-paste.ts` | `looksLikeMarkdown` 32; `markdownPasteHtml` 45 using `marked` | `marked` package; `sanitize-markdown-html.ts` | Runs only when no `text/html` flavour is present | Not present | None | B | Defer; check that the library is adopted before use |
| Clipboard sanitisation | `editor/sanitize-markdown-html.ts`; `paste-web-html.ts` | Strips unsafe markup before insertion | DOM sanitisation | Browser-only | Nova sanitises input in its own pipeline | None | B | Use Nova's existing sanitiser; compare rules |
| Format Painter | `Ribbon.tsx` 1991 `pickUpFormat`; 2095 button | Captures marks and paragraph style, then applies them to the next selection | Format-state readers | Browser-ready | Not present | Needs style IDs | B | Later, after style IDs |
| Paste as plain text shortcut | `shortcuts.ts` | `⌥⇧⌘V` on Mac; `Ctrl+Shift+V` elsewhere (Electron `pasteAndMatchStyle` role) | Shortcut list entry | Test each key in the target browser (see section 11) | Not present | None | B | Adopt the key only if no browser conflict |

---

## 4. Typography matrix

| Capability | Source (`R/`) | Implementation | Mixed-selection state | Storage (current) | Nova today | Class | Recommended treatment |
|---|---|---|---|---|---|---|---|
| Font family (combobox) | `Ribbon.tsx` 1596–1700 | Editable combobox with common and system sections (`fontFamiliesFor(lang)`, `useSystemFontFamilies`). Applied via `setTextStyle` → `chain().setMark('docTextStyle', patch)`. Inline completion on typing; ArrowUp/Down; Enter applies; Escape resets | `ribbon-format-state.ts` `fontFamily`, `fontEastAsia`, `fontLatin` | `docTextStyle` mark attrs `font`, `fontAscii`, `eastAsiaFont` | Fixed list in Nova | B |
| East Asian font handling | `Ribbon.tsx` | Writes `font`, `fontAscii`, `eastAsiaFont` and clears `eaSlotEmpty`; Latin face writes only `fontAscii` | Separate Latin/EastAsia state | Same mark | Not present | C |
| Symbol font | `font-list.ts` (not yet fully read) | Not confirmed | Not confirmed | Not confirmed | Not present | B (defer) |
| System font enumeration | `Ribbon.tsx` `useSystemFontFamilies` | Desktop/browser-dependent font list | None | Not stored | Not present | D for native; B for `queryLocalFonts` where supported |
| Theme fonts | Not confirmed as a Home control | Font dialog carries theme-related fields | Not confirmed | Not confirmed | Not present | C (schema v2) |
| Font size (combobox) | `Ribbon.tsx` 1720 `commitSize` via `parseFontSize` | Preset list from `font-sizes.ts` `fontSizeOptions`; typed values accepted | `ribbon-format-state.ts` `fontSizePt`, `fontSizeMixed` (`text-style-resolve.ts` 53) | `docTextStyle.sizeHalfPoints` | Nova stores point sizes | B |
| Font size bounds | `font-sizes.ts` | Min 1 pt, max 1638 pt; `clampFontSize`; `parseFontSize`; `namedFontSizes` | n/a | Half-points | Nova bounded ranges to be confirmed | B |
| Grow / shrink font | `Ribbon.tsx` 3863/3872; `applyFontStep` 1930–1975 | Steps through the UI-language size list via `stepFontSize`; 300 ms coalescing (`FONT_STEP_COALESCE_MS`) | Current size | `sizeHalfPoints` | Not present | B |
| 1 pt nudge | `shortcuts.ts`; `nudgeFontSize` | `⌘]` / `⌘[` | Current size | `sizeHalfPoints` | Not present | B |
| Change case | `Ribbon.tsx` 2222 `changeCase`; `editor/case-transform.ts` | Sentence, lower, upper, title, toggle; half-width/full-width for East Asian text | Not stateful | Rewrites text | Not present | A (for text transforms) |

---

## 5. Character-format matrix

| Capability | Source (`R/`) | Implementation | Nova today (`nova-app/src/documents/`) | Class | Recommended treatment |
|---|---|---|---|---|---|
| Bold | `Ribbon.tsx` `markBtn`; `editor/marks.ts` `Mod-b` | `toggleMark('bold')` | Yes: StarterKit bold; toolbar button | A | Keep |
| Italic | As bold, `Mod-i` | `toggleMark('italic')` | Yes: StarterKit italic; toolbar button | A | Keep |
| Underline | `editor/marks.ts` `Mod-u`; `FontDialog` | Boolean mark only. No underline style or colour found in Home or the Font dialog | Yes: Underline extension configured; toolbar button | A | Keep as boolean. Double/dotted styles are a later, schema-dependent item (section 12) |
| Strikethrough | `Ribbon.tsx` `markBtn` | `toggleMark('strike')` | Yes (StarterKit strike) | A | Keep |
| Subscript / superscript | `Ribbon.tsx` 1986 `toggleVertAlign` | Writes `vertAlign` attr of `docTextStyle` | No | B | Add `vertAlign` to `docTextStyle` in 005B1 |
| Text highlight | `Ribbon.tsx` via `setTextStyle` | `docTextStyle` highlight attr; uses `ribbon-color-palette.tsx` | No | B | Add in 005B1 (highlight colour set) |
| Font colour | `Ribbon.tsx` via `setTextStyle` | `docTextStyle` `color` attr | No | B | Add in 005B1 with a bounded palette |
| Clear character formatting | `ribbon-tabs.tsx` `clearAllFormatting` 169 | `unsetAllMarks`, then paragraph reset | No dedicated control; default TipTap `unsetAllMarks` available | A | Add in 005B1 |
| Change case | `Ribbon.tsx` 2222 `changeCase`; `editor/case-transform.ts` | Rewrites text (sentence, lower, upper, title, toggle; half/full width) | No | A | Later (text transform, no schema change) |
| Hidden text, caps, small caps, position, kerning, scale, spacing | `components/FontDialog.tsx` Advanced tab | Dialog-only typography attrs | No | C | Later; schema v2 (section 14) |
| Text effects (outline, shadow) | Not found in Home | None | No | D/none | Not adopted |

---

## 6. Paragraph matrix

| Capability | Source (`R/`) | Implementation | Nova today | Class | Recommended treatment |
|---|---|---|---|---|---|
| Align left / centre / right / justify | `Ribbon.tsx` `setParaAttrs`; `ParagraphDialog.tsx` | Paragraph `align` attr; `⌘L/E/R/J` | No (TipTap TextAlign not in StarterKit) | B | Add `align` to paragraph and heading nodes in 005B1 |
| Left / right indent, first-line and hanging | `editor/indent.ts`; `ParagraphDialog.tsx` | Paragraph indent attrs; Tab promotes/demotes list items | No | B | Add in 005B1 (basic left and first-line); hanging later |
| Increase / decrease indent | `Ribbon.tsx`; `indent.ts` | Changes indent attrs or list level | No | B | 005B1 |
| Line spacing (preset and custom) | `ParagraphDialog.tsx`; `setParaAttrs` | `lineSpacing` attr | No | C | Schema v2 candidate (section 14) |
| Space before / after | `ParagraphDialog.tsx` | `spacingBefore`, `spacingAfter` attrs | No | C | Schema v2 candidate |
| Widow/orphan, keep with next, keep lines, page break before | `ParagraphDialog.tsx` | Pagination attrs | No | C | Later; needs pagination engine |
| Text direction LTR / RTL | `editor/direction.ts`; `ribbon-format-state.ts` `bidi` | Paragraph `bidi` attr; interacts with alignment | No | C | Later; decide with Arabic/Hebrew support |
| Paragraph borders and shading | `ParagraphDialog.tsx`; `ribbon-format-state.ts` `shadingFill`, `paraBorders` | Paragraph attrs; Borders dialog | No | C | Later; schema v2 |
| Outline level | `ParagraphDialog.tsx` | Outline attr | No | C | Later |
| Clear paragraph formatting | `ribbon-tabs.tsx` 132–160 `clearParagraphFormatting` | Resets `DIRECT_PARA_ATTRS`, keeps structure | No | B | 005B1 once attrs exist |

---

## 7. List and numbering matrix

| Capability | Source (`R/`) | Implementation | Nova today | Class | Recommended treatment |
|---|---|---|---|---|---|
| Bullets (basic) | `Ribbon.tsx` 1826–1852; `numbering-actions.ts` | `numId`/`ilvl` model | Yes: StarterKit bullet list | A | Keep |
| Bullet library and custom bullets (pictures) | `ListDialogs.tsx` `DefineBullet` | Bullet definitions with symbol, font or picture | No | C | Later; needs list definitions |
| Numbering (basic) | `numbering-actions.ts`; `list-presets.ts` | `numId` with `ilvl` | Yes: StarterKit ordered list | A | Keep |
| Numbering library and formats | `ListDialogs.tsx` `DefineNumberFormat`; `list-presets.ts` 291 | Format string per level | No | C | Later; schema v2 |
| Restart / continue numbering | `ListDialogs.tsx` `SetNumberingValue` | Numbering value override | No | C | Later; schema v2 |
| Multilevel lists | `ListDialogs.tsx` `DefineMultilevel`; `AdjustListIndents` | Level definitions with indents and formats | No (flat Nova lists only) | C | Schema v2 |
| Nesting and level change | `Ribbon.tsx` `changeListLevel`; Tab | `ilvl` change | Partial: nested StarterKit lists | B | 005B1 |

---

## 8. Styles architecture

GenOffice styles are applied by `applyParagraphStyleId` (`ribbon-tabs.tsx` 256–290) and `applyGalleryStyle` (about 305). Heading level converts a paragraph to `docHeading`. Other paragraph styles revert headings to paragraphs. List items keep their numbering unless they become headings. `shedMajorityDirectFormatting` (198–240) removes bold, italic, underline, strike, colour, size and font direct formatting when a style covers more than half the paragraph.

| Element | Source (`R/`) | Behaviour | Nova today | Class | Recommended treatment |
|---|---|---|---|---|---|
| Style gallery | `Ribbon.tsx`; `ribbon-tabs.tsx` | Applies a paragraph style through `applyGalleryStyle` | No | B | Later; Normal and Headings first |
| StylesPane | `components/StylesPane.tsx` (402) | Modify, update from selection, select all instances (context menu) | No | B | Later |
| StyleDialog | `components/StyleDialog.tsx` (360) | `formValuesOf`, `styleIdFor`, `upsertFromForm`; basedOn select; paragraph and character types; excludes linked character shells | No | C | Schema v2 (style table) |
| Heading styles | `ribbon-tabs.tsx`; `docHeading` | Heading level attr | Yes: `heading` levels 1–3 | A | Keep |
| Normal style | `applyParagraphStyleId` | Revert to paragraph | Yes (Paragraph option) | A | Keep |
| Character styles | `StyleDialog.tsx` | Separate character style IDs | No | C | Schema v2 |
| Style inheritance (basedOn) | `StyleDialog.tsx` | `basedOn` chain | No | C | Schema v2 |
| Quick styles / default style | `StylesPane.tsx` | Default and quick style sets | No | C | Later |

**Application semantics for Nova.** Applying Normal or a heading must keep the paragraph's identity and its content. Direct formatting removal follows the majority rule above. Nova should record the removal in its own command so undo restores the previous state.

---

## 9. Format-state architecture

`components/ribbon-format-state.ts` (399 lines) builds the `RibbonFormatState` read by every Home control. It covers bold, italic, underline, strike, `vertAlign`, highlight, `textColor`, `charStyleId`, `paraStyleId`, `fontSizePt`, `fontSizeMixed`, font family (Latin and East Asian), `headingLevel`, list state, alignment, bidi, line spacing, `shadingFill`, `paraBorders`, indents and spacing.

- **Mixed selection** is detected in `editor/text-style-resolve.ts` (`selectedSizeMixed`, about line 53). Mixed values are shown as blank or as a mixed label; they are not coerced to the first run.
- **Adoption:** the reader pattern (read state from the selection, then render controls) can be adapted directly to Nova. The field list is the 005B1 minimum for state. Fields that depend on schema v2 (styles, spacing, borders) must be added with the schema.

---

## 10. Dialog inventory

| Dialog | Source (`R/components/`) | Scope | Class | Phase |
|---|---|---|---|---|
| Font | `FontDialog.tsx` (544) | Font and Advanced tabs: scale, spacing, position, kerning, caps, small caps, hidden, double strike | C (advanced tab), B (font tab) | Font tab in 005B1 after `docTextStyle` extension; Advanced later |
| Paragraph | `ParagraphDialog.tsx` (420) | Alignment, indents, special indent, line spacing, before/after, widow/keep, page break before, contextual spacing, outline level | C | Alignment and indents in 005B1; spacing and pagination later |
| Lists | `ListDialogs.tsx` (795) | `SetNumberingValue`, `AdjustListIndents`, `DefineBullet` (pictures), `DefineNumberFormat`, `DefineMultilevel` | C | Later; schema v2 |
| Paste Special | `PasteSpecialDialog.tsx` | HTML→source, text, picture | B | After paste modes |
| Styles (modify) | `StyleDialog.tsx` (360) | Paragraph and character style editing | C | Schema v2 |
| Keyboard shortcuts | `ShortcutsDialog.tsx` | Reads `shortcuts.ts` | A | Adopt the reference list |

---

## 11. Keyboard shortcuts

Source: `shortcuts.ts` (195 lines). Mac notation is rewritten for Windows by `@genoffice/i18n`.

| Action | GenOffice | Browser conflict | Nova today | Phase |
|---|---|---|---|---|
| Undo / Redo | ⌘Z; ⇧⌘Z or ⌘Y | Browser history navigation is not triggered inside the editor | Yes (TipTap history) | Keep |
| Cut / Copy / Paste | ⌘X / ⌘C / ⌘V | None inside the editor | Yes | Keep |
| Paste plain text | ⌥⇧⌘V | Test in the target browser | No | 005B1 only if no conflict |
| Bold / Italic / Underline | ⌘B / ⌘I / ⌘U | None | Yes | Keep |
| Font dialog | ⌘D | Browser bookmarks in some browsers | No | Later |
| Grow / shrink font | ⇧⌘. / ⇧⌘, | None | No | 005B1 |
| Nudge 1 pt | ⌘] / ⌘[ | None | No | 005B1 |
| Copy format | ⇧⌘C | None | No | Later |
| Clear formatting | ⌃Space | None | No | 005B1 |
| Align left / centre / right / justify | ⌘L / ⌘E / ⌘R / ⌘J | Browser default for ⌘L (address bar, Chrome) is not reached inside the editor | No | 005B1 |
| Clear paragraph formatting | ⌃Q | None | No | 005B1 |
| Heading styles / Normal | ⌥⌘0–3 | Browser reserves ⌥⌘ digit combinations in some browsers | Heading shortcuts via TipTap default | Keep; verify conflict |
| List shortcuts | Tab demote; Shift+Tab promote | Tab moves focus outside the editor | Partial | 005B1 |
| Page break / column break | ⌘Enter; ⇧⌘Enter | None | No | Later |
| Non-breaking space / hyphen | ⇧⌘Space; ⇧⌘- | None | No | Later |

**Browser conflicts.** Chromium and Firefox reserve several ⌘ and Ctrl combinations (for example ⌘D bookmark, ⌘L address bar). Nova must test each key in the target browser before binding it, and must not rely on a key the browser captures.

---

## 12. Responsive Home requirements

Nova's centre pane is about 900 px. Home cannot show every group at full width. Required behaviour:

- **Always visible:** Clipboard (compact icons), Font family and size, Bold, Italic, Underline, Lists, Alignment.
- **Collapse to compact:** Font size stepper, Strike and sub/superscript (group overflow), Indent controls.
- **Overflow menu:** Paragraph spacing, Clear formatting, Change case, Paste Special, Format Painter.
- **Two-tier ribbon** is appropriate only if a later measurement shows overflow is insufficient. Do not decide it in 005B0B.
- Professional capability must not be removed to fit. Use collapse, overflow and compact controls.

---

## 13. Nova-vs-GenOffice matrix

Columns: GenOffice capability; upstream implementation; Nova has?; schema supports?; command supports?; schema change?; UI change?; adoption class; recommended phase.

| GenOffice capability | Upstream implementation | Nova has? | Schema supports? | Command supports? | Schema change? | UI change? | Class | Phase |
|---|---|---|---|---|---|---|---|---|
| Paste / cut / copy | `Ribbon.tsx` 2229; browser clipboard | Yes | Yes | Yes | No | No | A | Keep |
| Paste Special | `PasteSpecialDialog.tsx` | No | Partial | No | No | Yes | B | 005B1 later |
| Paste modes (source, merge, text) | `paste-options.ts` | No | No (merge needs mark mapping) | No | Yes (merge) | Yes | B/C | Text in 005B1; source and merge later |
| Web HTML paste push-down | `paste-web-html.ts` | Partial | Yes | Partial | No | No | B | 005B1 |
| Markdown paste | `markdown-paste.ts` | No | Yes | No | No | No | B | Deferred |
| Font family | `Ribbon.tsx` 1596 | No | No (needs `fontFamily` attr) | No | Yes | Yes | B | 005B1 |
| Font size and steps | `font-sizes.ts`; `applyFontStep` | No | No (needs `fontSize` attr) | No | Yes | Yes | B | 005B1 |
| Bold / italic / strike | `marks.ts`; `markBtn` | Yes | Yes | Yes | No | No | A | Keep |
| Underline (boolean) | `marks.ts`; `FontDialog` | Yes | Yes | Yes | No | No | A | Keep |
| Underline styles / colour | Not found | No | No | No | Yes | Yes | C | Later |
| Subscript / superscript | `toggleVertAlign` | No | No | No | Yes | Yes | B | 005B1 |
| Highlight and colour | `setTextStyle`; palette | No | No | No | Yes | Yes | B | 005B1 |
| Change case | `case-transform.ts` | No | Yes | No | No | Yes | A | Later |
| Clear formatting | `clearAllFormatting` | Partial (`unsetAllMarks`) | Yes | Partial | No | Yes | B | 005B1 |
| Align | `setParaAttrs` | No | No (needs `align` attr) | No | Yes | Yes | B | 005B1 |
| Indent | `indent.ts` | No | No | No | Yes | Yes | B | 005B1 (basic) |
| Line and paragraph spacing | `ParagraphDialog.tsx` | No | No | No | Yes | Yes | C | Schema v2 |
| Direction (bidi) | `direction.ts` | No | No | No | Yes | Yes | C | Later |
| Paragraph borders and shading | `ParagraphDialog.tsx` | No | No | No | Yes | Yes | C | Later |
| Bullets and numbering | `numbering-actions.ts` | Partial (nested StarterKit lists; no numbering definitions) | Partial | Yes | No | No | A/B | Keep basic |
| Multilevel and custom numbering | `ListDialogs.tsx` | No | No | No | Yes | Yes | C | Schema v2 |
| Styles (heading, normal) | `applyParagraphStyleId` | Yes | Yes | Yes | No | No | A | Keep |
| Styles gallery and StyleDialog | `StylesPane.tsx`; `StyleDialog.tsx` | No | No | No | Yes | Yes | C | Schema v2 |
| Format Painter | `pickUpFormat` | No | Partial | No | Partial | Yes | B | Later |
| Font / Paragraph / List dialogs | Section 10 | No | No | No | Yes | Yes | B/C | Phased as section 10 |
| Shortcuts | `shortcuts.ts` | Partial | Yes | Yes | No | No | A | Test each key |

---

## 14. Likely schema-v2 requirements

These are evidence for the later global schema decision. They are not a schema design.

1. Paragraph attributes: `align`, indents, `lineSpacing`, `spacingBefore`, `spacingAfter`, `bidi`, `shadingFill`, borders, outline level.
2. Character attributes on a `docTextStyle`-like mark: `fontFamily` (with East Asian and Latin slots), `fontSize`, `color`, `highlight`, `vertAlign`, and advanced typography fields.
3. Underline variants (style and colour) if adopted. This is not found in the Home ribbon.
4. Paragraph style IDs and a style table (basedOn, paragraph and character types).
5. Numbering definitions with multilevel formats and restart values.
6. Theme fonts and colours, if GenOffice document themes are adopted.

Nova v1 can represent bold, italic, underline (boolean), strike, headings 1–3, bullet lists and ordered lists.

---

## 15. Proposed 005B1 implementation boundary

**Ribbon:** a professional Home tab shell with grouped controls and responsive collapse.

**Typography (v1-compatible where possible):** font family (only if its attribute fits without a schema change, otherwise defer), font size, grow/shrink, bold, italic, underline (boolean), strike, subscript, superscript, highlight, colour and clear formatting.

**Paragraph:** alignment, basic indents, clear paragraph formatting.

**Lists:** keep bullets and numbering, add level change.

**Styles:** Normal and Heading 1–3 with the style state shown in the control.

**Editing:** undo, redo and the clipboard foundation (plain text, web HTML push-down).

**Deferred to schema v2 or later:** paste merge and source modes, line and paragraph spacing, borders and shading, direction, multilevel numbering, style gallery and StyleDialog, Font Advanced tab, underline styles and colour, Format Painter, change case, Paste Special dialog.

This boundary depends on the schema decision in 005B0. It must be confirmed once the schema decision is made.



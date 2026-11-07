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
| Symbol font | `packages/ui/src/font-list.ts` (no symbol logic); symbol handling in `editor/marks.ts` 283–315 (`docSym`), `editor/convert.ts` 4104–4161, `font-check.ts` 65–96 (`symbolFontCovers`), `line-metrics.ts` 395–493 | Not a dropdown concept. A `w:sym` run is one glyph carried by a `docSym` mark (`font`, `char`). The glyph is drawn with the named symbol font only when the machine has it and covers the PUA code (probed by comparing against `.notdef`); otherwise the Unicode stand-in is shown. Bullet faces (Symbol, Segoe UI Symbol) get their own ascent metrics | Font-list candidates contain no symbol fonts; the symbol font is taken from the run, not the picker | `docSym` mark (`font`, `char`), inline in the document | Not present | B (defer; the symbol mark is a document-data concern, not a picker control) |
| System font enumeration | `Ribbon.tsx` `useSystemFontFamilies` | Desktop/browser-dependent font list | None | Not stored | Not present | D for native; B for `queryLocalFonts` where supported |
| Theme fonts | Design tab, not Home (`ribbon-design-tab.tsx` 217–337; section 20) | Font dialog carries theme-related fields | Not a Home control | Not a Home control | Not present | C (schema v2) |
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
| Text highlight | `Ribbon.tsx` via `setTextStyle`; `ribbon-color-palette.tsx` | `docTextStyle` highlight attr; palette emits `#RRGGBB` or null (see section 16.1) | No | B | Add in 005B1 with a bounded highlight set |
| Font colour | `Ribbon.tsx` via `setTextStyle`; `ribbon-color-palette.tsx` | `docTextStyle` `color` attr; palette emits `#RRGGBB` or null (see section 16.1) | No | B | Add in 005B1 with a bounded palette |
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
| Nesting and level change | `Ribbon.tsx` `changeListLevel`; Tab | `ilvl` change | Yes for nesting: StarterKit `sinkListItem`/`liftListItem` on Tab and Shift+Tab (TipTap-native). No level clamp or numbering-level model. | B | 005B1 |

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
| Undo / Redo | ⌘Z; ⇧⌘Z or ⌘Y (`shortcuts.ts` 53–54) | Browser history navigation is not triggered inside the editor | Yes: TipTap `UndoRedo` keymap `Mod-z`, `Shift-Mod-z`, `Mod-y` (`@tiptap/extensions`) | Keep (see section 16) |
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
| List shortcuts | Tab demote; Shift+Tab promote | Tab moves focus outside the editor | Yes, TipTap-native: StarterKit's list keymap maps Tab to `sinkListItem` and Shift+Tab to `liftListItem` (`@tiptap/extension-list` 3.32.2, `dist/index.js` 526–527 and 1338–1343). GenOffice uses a custom `changeLevel(±1)` keymap (`editor/extensions.ts` 1493–1494). Nova has no custom list Tab handler. | 005B1 (verify the Tab behaviour at the list level, not as focus movement) |
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

**Width.** The Nova centre pane is about 900 px. This is a responsive-layout requirement, not a reason to drop Home capabilities. 005B1 must use responsive groups, overflow menus, collapsing and compact controls (for example, a size combo that shrinks before it hides). Every professional Home capability listed above stays in scope; only the presentation adapts.

**Status.** This boundary stands. It was re-checked against the matrix in section 13 and the findings in sections 16–21. No capability was added or removed.

---

## 22. Status

**Status correction (2026-11-07).** Commit `a28b7eb9` marked this record COMPLETE prematurely. The track-changes and header/footer history trace was still open at that commit, and the list Tab/Shift+Tab row was still Partial. TPI-NOVA-005B0B2 completed the missing trace in section 16 (16.1–16.6) and resolved the list row in sections 7 and 13.

TPI-NOVA-005B0B — COMPLETE — GENOFFICE HOME RIBBON, TYPOGRAPHY, CHARACTER FORMATTING, PARAGRAPH, LIST, STYLE, CLIPBOARD, HISTORY & SCREENTIP ARCHITECTURE FULLY INVENTORIED — TRACK-CHANGES & HEADER/FOOTER HISTORY VERIFIED — ALL 005B0A PROVENANCE VERIFIED — CURRENT NOVA DOCUMENT & SHARED-EDITOR CAPABILITIES RECONCILED — NOVA PROFESSIONAL HOME CAPABILITY MATRIX DEFINED — 005B1 IMPLEMENTATION BOUNDARY ESTABLISHED

NO PROFESSIONAL EDITOR IMPLEMENTATION STARTED — PRODUCTION UNCHANGED

---

## 16. Undo / redo (source-verified)

**Mechanism.** Undo and redo use TipTap's `UndoRedo` extension from `@tiptap/extensions` (registered in `editor/extensions.ts`, lines 17, 7284, 7379). Its keymap is `Mod-z` (undo), `Shift-Mod-z` and `Mod-y` (redo). GenOffice's own shortcut table (`shortcuts.ts` 53–54) lists ⌘Z, ⇧⌘Z and ⌘Y. There is no separate application-level undo stack. History is the ProseMirror `prosemirror-history` plugin.

**Ribbon path.** Undo and redo buttons go through the editor command set and the same history plugin as the keyboard. No ribbon control keeps its own undo list.

**Grouping.** Typing and most edits group by the ProseMirror default `newGroupDelay` of 500 ms. Explicit boundaries are added where GenOffice needs them: `Ribbon.tsx` 503–509 calls `closeHistory(tr)` per brush stroke; autocorrect uses `closeHistory` and `undoAutocorrect`.

**Bypass and supplement.**
- `addToHistory=false` is used for caret bookkeeping, the AI draft and the streamed tail, so these never appear in undo.
- `file-actions.ts` `resetEditorHistory` (303–309) re-registers the history plugin when a document is opened or reparsed, which clears prior history.
- `editor/extensions.ts` 6724 groups an image-settle correction with the move that caused it, so one undo reverses both.
- Font-size stepping is coalesced by `FONT_STEP_COALESCE_MS` (300 ms, `Ribbon.tsx` 770; `applyFontStep` about 1930–1975). The first click applies at once. Later clicks inside the window only advance the pending size, and one trailing apply runs. Undo therefore reverts a burst of clicks in one step.
- Ribbon-tab Previous and Next Change buttons (`ribbon-tabs.tsx` about 1261 and 1272) navigate revisions. They are not undo.

**Special operations.** Table, list-definition, formatting, image and style edits are ProseMirror transactions, so they share the same history. I found no host-level or separate undo stack for these in the Home path. Track-changes and header/footer history were traced in TPI-NOVA-005B0B2 (sections 16.1–16.5 below).

**Coalescing classification.**
- Directly reusable concept: explicit `closeHistory` at user gestures (brush stroke, autocorrect) and `addToHistory=false` for non-user bookkeeping.
- TipTap-native: the 500 ms `newGroupDelay` and the `Mod-z` keymap.
- GenOffice-specific: the 300 ms font-step coalescer, and grouping an image-settle correction with its move.

**Nova comparison.** Both Nova copies register TipTap's default history through `StarterKit`. Their toolbar calls `editor.chain().focus().undo()` and `.redo()`, gated on `editor.can()`. Nova has no coalescing, no explicit history boundaries and no host-level history. Keyboard shortcuts come from TipTap's defaults.

**Future Nova command-layer implications.** Keep one history (ProseMirror). Add explicit history boundaries at compound user actions (brush, autocorrect equivalents). Mark non-user transactions with `addToHistory=false`. Coalesce repeated size or indent steps in the command layer, not in the ribbon. Confirm each shortcut with a narrow test before 005B1 ships.

### 16.1 Main editor
The main body uses the single ProseMirror history described above. Undo and Redo are reached from the ribbon button, the keyboard (`App.tsx` 6430–6433) and the title-bar button (`App.tsx` 7824–7833). All three call `editor.chain().focus().undo()` or `.redo()` on the main editor. Undo state is read at `App.tsx` 7798 with `editor.can()`.

### 16.2 Track Changes
- **Typing and deletion are ordinary transactions.** The recorder is an `appendTransaction` in `editor/revisions.ts` (about 1219). It records typed text as `ins` marks and records deleted inline text as re-inserted `del` marks. Deleting your own insertion removes it outright. The recorder returns its transaction tagged with `trackIgnore` (`TRACK_IGNORE`, line 79) and does not set `addToHistory`. Its output therefore joins the same history stack as the user's edit by ProseMirror's default rules. **Runtime (2026-11-07, TPI-NOVA-005B0B3, GenOffice harness):** a continuous typed run (`PARANORMAL`) was undone by one Undo. A pause longer than 500 ms split the run (`PARA` / `NORMAL`), and two Undos were needed. Basic insertion, tracked deletion and own-insertion deletion each behaved as described, and Undo created no new revision.
- **Undo reverses the tracked operation.** It does not generate a new tracked revision. Undo restores the prior document state, including the revision marks that existed before the edit. The recorder skips transactions carrying `trackIgnore` or `history$`, so undo's own replay is not re-tracked.
- **Revision marks are part of the document state.** They are in the history transaction and undo restores them. They are not separate history events.
- **Track-changes on/off is not in history.** The toggle is React state mirrored into `TrackChangesExtension` storage (`App.tsx` 2116, `storage.enabled = trackChanges`). Toggling does not dispatch a transaction. Its options (author, move and formatting tracking) live in localStorage (`track-changes-options.ts` 176–187). `App.tsx` 1546–1554 writes them and dispatches an empty transaction with `addToHistory=false`.

### 16.3 Accept and reject
- **Accept or reject one revision** (`review-actions.ts` `handleRevision`, the `next` path around 357–378) calls `applyRevisions` (`editor/revisions.ts` 515). That function sets `trackIgnore` only. It does not set `addToHistory=false`, so the change is a normal undoable transaction, and it can be undone in the main editor. **Runtime-confirmed (2026-11-07):** Accept one and Reject one each reverted by a single Undo, with the unrelated revision unchanged.
- **Accept All and Reject All** (`revisions.ts` 917 and 921) call `applyRevisions` once over the whole document. **Runtime correction (2026-11-07, TPI-NOVA-005B0B3, GenOffice harness, Firefox 157):**
  - *Previous inference:* Accept All and Reject All are each one undoable transaction, so one Undo restores every revision the operation resolved.
  - *Observed, Accept All:* confirmed. Three revisions (insertion, deletion, insertion) resolved to 0. One Undo restored all three.
  - *Observed, Reject All:* **disproved.** A single Undo does not reverse the operation. Case A (insert, delete, insert): Reject All reached 0 revisions. Undo 1 gave 2 revisions and Undo 2 gave 1. Case B (two insertions): Undo 1 restored only one of two. Case C (one deletion and one insertion): Undo 1 restored none of the deletion, and a further Undo was needed. Reject All therefore produces several history entries, not one.
  - *Reason:* not identified from source. The source sets no `addToHistory` or `closeHistory` around `rejectAllRevisions`, so its per-revision replacements appear to land in separate ProseMirror history groups. Confirming this needs a separate source pass. Accept All is unaffected. Reject All must not be assumed atomic in 005B1. The `all` path also calls `ctx.applyStoryRevisions(stories, action, true)` first (`review-actions.ts` 353), which is not in that history.
- **Story revisions (footnotes, endnotes, header/footer parts, textboxes) are not in ProseMirror history.** `applyStoryRevisions` (`App.tsx` 1662) writes React state through `setFootnotes`, `setEndnotes`, `setNotesDirty` and `setSectionHfEdits`. Accept or reject on a story therefore has no undo entry. No host-level undo stack exists for story state (searched for `undoStack`, `hfUndo`, `storyUndo`, `useUndo`, `undoManager`, none found).
- Accept/reject is therefore exact for the main body and not undoable for stories.

### 16.4 Header and footer
- **Ownership: D, hybrid.** The header/footer editor is a separate TipTap `Editor` instance (`editor/hf-editor.ts` `mountHfEditor`, line 626). Its extensions are `hfSubExtensions` (line 289), which include `UndoRedo` (`editor/extensions.ts` 7284). So it has its own per-editor ProseMirror history, which is class B. The committed result is host React state, which is class C. The combination is D.
- **Editing and history.** Each header/footer editor keeps its own undo stack while open. Undo inside it reverts only its own edits. Destroying the editor on exit discards that stack.
- **Commit.** On exit (focus leaving the strip, Escape, or the `HF_COMMIT_EVENT` window event) `close(commit)` runs (`hf-editor.ts` 694–706). It computes `changed()`, which compares the document JSON to the initial JSON, destroys the editor, and calls `onCommit` once with the whole `HeaderFooter` value. `App.tsx` `commitHfAt` (1622–1634) writes that value into `sectionHfEdits` with `hfTextCommit`. The whole part is replaced in one React state update. No incremental transactions reach the main document, the XML is not rebuilt at that step, and the commit adds no history entry on the main editor.
- **Routing.** Clicking a ribbon command while the header editor is focused routes to it through `getActiveSubEditor()` (`editor/active-editor.ts`). Formatting, paragraph, font and indent commands use `getActiveSubEditor() ?? editor` (`App.tsx` 6219–6545). Undo and Redo do not use this routing: the ribbon and title-bar buttons always call `editor?.chain().focus().undo()` on the main editor, even while a header editor is active.

**Runtime (2026-11-07, TPI-NOVA-005B0B3, GenOffice header harness, Firefox 157):**
- *Body Undo after a committed header:* body `BODY VERSION TWO` was reverted to `ONE` by `editor.commands.undo()` on the main editor. The committed header `HEADER ACCEPTANCE TEST` survived. Confirmed for the editor command. The keyboard Ctrl+Z route was **not proven**: the harness did not deliver the key to the editor, so the keyboard route is unverified.
- *Undo inside an open header:* the header editor had `canUndo` true, and the main editor had `canUndo` false while the header was open. Undo removed only the last header edit.
- *Post-exit history:* after exit and reopen, the header had `canUndo` false, and Undo changed nothing. The stack is discarded on exit, as the source says.
- *Footer:* not run separately. It uses the same `mountHfEditor` path, so the result is inferred from the header run, not observed.

### 16.5 Sub-editors and editor switching
- **Active sub-editor.** `active-editor.ts` keeps one active sub-editor. It is set on focus, cleared when the main editor regains focus, and dropped on destroy. It is a routing pointer only and does not own history.
- **Scenario 1: edit body, then header, return to body, press Undo.** Undo runs on the main editor's stack. It reverts the most recent body edit. The header commit is React state and is not on that stack, so it is not reverted by this Undo.
- **Scenario 2: edit header, switch to body, Undo.** Undo is routed to the main editor, which is the only editor the ribbon and keyboard target. It reverts the previous body edit, not the header edit. The header's own undo stack is reachable only while the header editor is open and focused, and the keyboard `Mod-z` in that editor uses the header's `UndoRedo`.
- **Result.** Undo is not editor-aware at the host. A header edit that has been committed cannot be undone from the body. A header's in-editor undo history does not survive commit, because the editor is destroyed on exit.
- **Textboxes.** The same `getActiveSubEditor` routing applies to textboxes (`editor/selected-box.ts`, `selection-bar.ts`). Textboxes use `textboxSubExtensions`, which include `UndoRedo` (`extensions.ts` 7284). Their history follows the same pattern as headers.

### 16.6 Nova implication
The 005B1 command layer should choose one of these models:
1. **Single history stack** (current Nova and the body of GenOffice). Simplest. Undo of a header or footer edit is then a host command, not an editor's own undo, so it must be recorded in the same stack.
2. **Active-editor history** (GenOffice's header and textbox editors). Keeps undo local to each editor and discards it on exit, which loses the cross-editor undo that users expect.
3. **Multiple editor histories with explicit boundaries.** Only if sub-editors persist across switches.

Recommendation for Nova: keep one authoritative history (model 1). Route Undo and Redo to the command layer, not to the focused editor. Record story edits (header, footer, notes) as explicit commands in that history. Mark UI-only state (track-changes toggle, options, display filters) as non-history. Do not mirror GenOffice's per-editor destroy-on-exit history. This is architecture only, and no implementation is started.

**List keyboard behaviour (runtime, 2026-11-07, TPI-NOVA-005B0B3, Firefox 157).** Measured on two runtimes; neither was changed.
- *Nova* (`novaExtensions`, TipTap StarterKit, real `nova-app` source): Tab nests a bullet or numbered item one level; Shift+Tab outdents one level. At top level Shift+Tab does nothing and focus stays in the editor. Tab on a bullet reached depth 2 and then stopped (three presses), so the limit was not checked against TipTap sink rules.
- *GenOffice* (`DocListItem` in the unmodified `editor/extensions.ts`): at the start of an item, Tab changes `ilvl` by +1 and Shift+Tab by -1. Tab repeated 10 times clamped at `ilvl` 8, and Shift+Tab clamped at 0. Mid-text Tab inserted a literal `\t` and left `ilvl` unchanged.
- *Difference (005B1 requirement):* Nova has no mid-text literal-tab rule and nests through TipTap's list sink, while GenOffice uses its own `ilvl` model with an 8-level clamp. Do not adopt either behaviour in Nova without a 005B1 decision.

**Limitation.** Keyboard Undo routing and the footer were not exercised at runtime (see the dated notes above). Grouping timing was checked at runtime for typing only. Nova list behaviour has no GenOffice equivalence yet (see the list note below).

---

## 17. Screentips (source-verified)

**Implementation.** `packages/ui/src/screentip.ts` (198 lines) and `screentip.css` (30 lines). It is a singleton fixed-position tip driven by delegated listeners on `[data-tip]`. Attributes: `data-tip` (text), `data-tip-kbd` (shortcut hint), `data-tip-detail`, `data-tip-anchor`, `data-tip-place`. Timing: 500 ms show delay, 100 ms warm re-show, 5 s auto-hide. Focus shows the tip. Escape, blur, scroll and resize hide it. Accessibility: `aria-describedby` on the anchor and `role="tooltip"` on the tip.

**Installation.** `installScreenTips()` is called from each app's `main.tsx`.

**Dependencies.** DOM only. No React, no Electron probe, no shell state, no platform detection. The shortcut text is supplied by the caller as `data-tip-kbd`, so platform notation is handled upstream by `@genoffice/i18n` `macShortcutsToWin`.

**Disabled controls.** The module does not special-case disabled controls. A disabled control shows whatever `data-tip` the caller provides.

**Tests.** `packages/ui/tests/screentip-a11y.test.ts` and `apps/shell/tests/tab-lifecycle-and-tooltip.test.ts`.

**Classification.** Reusable as-is: the DOM engine, timing, dismissal and ARIA wiring. Not reusable: the `data-tip` strings and shortcut strings, which are GenOffice content.

**Nova recommendation.** Adapt the GenOffice module. It is framework-free, so it can be used as is or copied under a Nova wrapper. Each Nova control should supply a name, a short description where useful, its shortcut in `data-tip-kbd`, and a disabled explanation in `data-tip-detail` where the control is disabled. Keep the visual implementation Nova-owned if its styling must change. No implementation is started here.

---

## 18. Colour palette (source-verified)

**Structure.** `apps/docs/src/renderer/components/ribbon-color-palette.tsx` (70 lines) wraps `ColorPicker` in `packages/ui/src/color-picker.tsx` (334 lines). It shows ten theme colours, each with tint and shade rows; a grid of standard colours; a list of recent colours; and a "More Colors" native `<input type="color">`.

**No-color behaviour.** The Automatic button calls `onPick(null)`. Swatches emit uppercase `#RRGGBB`.

**Selection.** Keyboard focus is tracked with `focusPos`. Cells use `role="gridcell"`, `aria-selected`, `aria-label` and `title`. Grids carry `aria-label`s.

**Callers.** Font colour and highlight both use `setTextStyle` in `Ribbon.tsx`. The palette is reused for highlight with its own set.

**Colour model.** GenOffice stores colours in the document as `w:color` hex values, `w:themeColor` with `w:themeTint` or `w:themeShade` (parsed in `packages/docx-engine` `parse-props.ts` 1087, 1194; `theme.ts` 148 `resolveThemeColor`), and highlight as a `w:highlight` string (`generate.ts` 3431, 3590). The palette writes only the hex form.

**Schema implications for Nova.** Nova v1 has no colour attributes. A schema-v2 colour attribute needs at least `hex`. A theme reference (`themeColor` plus tint or shade) is needed only if Nova adopts document themes. Highlight should be a separate bounded set, not the colour attribute.

---

## 19. Direction, indentation and case transform (source-verified)

**Direction (`direction.ts`, 232 lines).** Applies to `docParagraph`, `docHeading` and `docListItem`. Attributes: `bidi`, `bidiInherited`, `bidiInferred`, `align`. Automatic direction uses UAX#9 first-strong detection. `alignAttrFor` swaps left and right in RTL. `AutoDirectionExtension` flips direction on the first strong character typed, except during IME composition and block-level changes. The UI defaults to RTL for `ar` and `he`. Nova has no direction attribute, so it needs `bidi` and `align` in schema v2.

**Indentation (`indent.ts`, 12 lines).** `stepHangingIndent` (Ctrl+T and Ctrl+Shift+T) moves in half-inch stops. `stepParagraphIndent` changes list level for list items and snaps paragraphs to half-inch stops. In list items, `indentLeft` changes by 720 twips per step through `updateAttributes('docParagraph', { indentLeft })` (`Ribbon.tsx` about 1918–1930). Storage is numeric twip attributes on paragraphs plus list level for list items. Nova has no indent attribute and no list-level command beyond the StarterKit nesting.

**Case transform (`case-transform.ts`, 136 lines).** Modes: `upper`, `lower`, `title`, `sentence`, `toggle`, `halfWidth`, `fullWidth`. The width modes use NFKC for katakana and voiced pairs. `applyCase` rewrites text nodes and preserves marks. It is a no-op on a collapsed selection. The locale is not passed to `toUpperCase` or `toLowerCase`. Locale-specific casing (for example Turkish dotless i) is therefore not handled by this module; this is inferred from the call sites, not tested. Shift+F3 cycles the modes. Tests: `apps/docs/tests/case-transform.test.ts`. Nova has no case command. It can be added as a pure transform over text nodes, but its locale handling must be added deliberately.

---

## 20. Symbol fonts (source-verified)

**Identification.** `packages/ui/src/font-list.ts` (168 lines) contains no symbol-font logic. It holds candidate lists, locale ordering, spelling-aware presence checks and system-font partitioning. Symbol handling is in the renderer.

**Model.** A symbol run is a `docSym` mark (`editor/marks.ts` 283–315) with `font` and `char` attributes, rendered as `span[data-sym-char]`. The mark styles the span with its own font family only when that font is installed and covers the private-use code point.

**Coverage check.** `font-check.ts` 65–96 (`symbolFontCovers`) measures the candidate glyph on canvas and compares it with a `.notdef` glyph for `\uE000`. If the glyph matches the tofu, the font does not cover the code point.

**Editing.** `editor/convert.ts` ~4104–4125 (`symDisplayText`, `symRuns`) swaps private-use code points in for display and restores them on edit, so the stand-in text is never saved.

**Bullets.** `line-metrics.ts` 395–493 sets the ascent and line height for symbol bullet faces.

**Fallback.** If the named font is missing or does not cover the code point, the Unicode stand-in is shown with the normal font. Browser rendering depends on what the machine has installed.

**Impact.**
- Built-in font list: no effect. Symbol fonts are not in the list.
- Custom fonts: none exist in the upstream code reviewed here.
- Browser rendering: affected through the coverage probe and fallback.
- Publication renderer: the symbol mark must be preserved in document JSON if Nova imports `w:sym`; this is a schema-v2 decision.
- Document JSON: stores `font` and `char` on the symbol mark, not the stand-in glyph.

**Nova.** Nova v1 has no symbol mark. Symbol support is deferred to schema v2 or later.

**Theme fonts (not a Home control).** The theme-font picker is on the Design tab (`ribbon-design-tab.tsx` 217–337, `onThemeFonts`, preset `fonts.major` and `fonts.minor`). It sets document-wide heading and body fonts. It does not appear on Home and is out of 005B0B scope.

**Font-family categories (from sections 1–21).** Ordinary fonts (named, Latin); system fonts (installed list, partitioned in `font-list.ts`); theme fonts (document-wide major and minor, Design tab); East Asian fonts (routed to `w:eastAsia` by `EAST_ASIAN_FONT_RE`, with `defaultEastAsiaFontFor` for zh, ja, ko and zh-TW); symbol fonts (per-run `docSym` mark); uploaded custom fonts (not present upstream). These are separate concerns and need separate schema fields.

---

## 21. Nova editor comparison (`documents/` vs `shared-editor/`)

**Byte comparison.** `nova-app/src/documents/editorExtensions.ts` and `nova-app/src/shared-editor/editorExtensions.ts` are byte-identical (`cmp` exit 0). `documents/EditorToolbar.tsx` and `shared-editor/EditorToolbar.tsx` are byte-identical (`cmp` exit 0).

**Imports.** `documents/DocumentEditor.tsx` imports the `documents/` pair. `content-editor-entry.tsx` imports `shared-editor/NovaEditor.tsx`, which uses the `shared-editor/` pair. Both copies are live.

**Extensions (both).** StarterKit with headings 1–3, `codeBlock` off, `link` with `openOnClick` false, underline on; Table, TableRow, TableHeader, TableCell (non-resizable).

**Toolbar (both).** History undo and redo; Style select; Bold, Italic, Underline; lists; quote; link; table; divider. No alignment, font, colour, highlight, indent, spacing, case, direction or paste-mode controls.

**Differences.** None found in code, imports, commands or toolbar controls.

**Conclusion.** Category C: duplicated and should converge. The two copies are identical, so either can serve as the authority for future work. `documents/` is the authority for the active document editor, because `DocumentEditor.tsx` imports it. Converge onto `documents/` in a later step, with `shared-editor/` importing it. No refactor is made here.



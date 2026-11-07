# TPI-NOVA-005B0C — GenOffice Insert, Table, Image and Object Architecture

**Status:** COMPLETE for the documentation scope (005B0C2). Architecture and source analysis only. No GenOffice source ported. No Nova product code, schema, assets, packages or toolbars changed. Production untouched.

**Parent:** TPI-NOVA-005B0
**Predecessor:** TPI-NOVA-005B0B with runtime addendum at `20102c80`
**TPI baseline:** `7442a394` (005B0C1); this pass is 005B0C2
**Frozen GenOffice SHA:** `d5ebe838d91373c54528795b50663d4f33947183`
**Upstream licence:** Apache License 2.0 (`LICENSE`); Unicode License v3 for data files (`LICENSE-UNICODE.txt`). Provenance only. Nothing is copied.

## 1. Preserved 005B0B history findings

These are treated as authoritative and not reopened:

- Tracked typing and deletion use normal ProseMirror history.
- Accept one and Reject one are ordinary undoable transactions.
- Accept All is atomic at runtime.
- Reject All is not atomic in upstream GenOffice.
- Header and footer sub-editors keep separate temporary histories.
- Committed header and footer changes do not enter main-editor history.
- GenOffice list-level nesting differs from Nova's.

**Nova requirement (future, no implementation here):** Nova must not reproduce non-atomic Reject All. Bulk operations (Accept All, Reject All, and equivalent object operations) should be deliberate atomic user commands where technically appropriate.

## 2. Evidence limits

- Source was read from the scratch clone `/tmp/genoffice-005b0a` at the frozen SHA. That clone is outside this repository and is not committed.
- Read in full or in the relevant windows: `ribbon-insert-tab.tsx`, the Insert helpers in `ribbon-tabs.tsx`, `insert-picture.ts`, `persistable-image.ts`, `image-drop.ts`, `image-rotation.ts`, `equation.ts`, `cover-pages.ts` exports, `page-break.ts` exports, `table-properties.ts`, `table-borders.ts`, the `docTable`/`docTableRow`/`docTableCell`/`docNestedTable` nodes in `extensions.ts`, and `shape-draw.ts`/`shape-svg.ts` in part.
- Source-read in 005B0C1 (Sections 27 and 30–42): `table-ops.ts`, `table-sizing.ts`, `table-geometry.ts`, `table-handle.ts`, the drag plugins, `TablePropertiesDialog.tsx`, `TableDialogs.tsx`, `wrap-obstacles.ts`, `hf-float-edit.ts`, `field-codes.ts`, `trailing-table-exit.ts`, and the contextual Table Design and Layout ribbons.
- Browser runs were not performed for 005B0C (source-only). The 005B0B3 runtime check used a bundled Firefox 157 instead of Firefox Developer Edition 160, which failed to launch in the sandbox. That is a recorded deviation.

## 3. Insert capability matrix

Classification: A = adopt pattern, B = adapt, C = defer, D = out of scope for Nova.

| Control | Source / command | Editor or node deps | @genoffice/ui | @genoffice/docx-engine | Browser / native | Current Nova | Schema need | Class |
|---|---|---|---|---|---|---|---|---|
| Cover Page | `ribbon-insert-tab.tsx` → `cover-pages.ts` (`COVER_PRESETS`, `insertCoverPage`, `removeCoverPage`) | Marker paragraphs `_GenOfficeCoverPage` / `_GenOfficeCoverPageEnd` | No | Not confirmed | None | Absent | Requires page model | C |
| Blank Page | `insertBlankPageAt` (docParagraph with `pageBreakBefore`, spacer fallback) | Paragraph attrs | No | No | None | Absent | v1 extension (pageBreakBefore attr) | B |
| Page Break | `insertPageBreakAt` → `page-break.ts` `insertPageBreak`; also `insertColumnBreak`, `insertTextWrappingBreak` | Break nodes | No | Not confirmed | None | Absent | v1 extension for simple break; column/section needs page model | B |
| Table | Hover grid 8×10 → `insertTableAt`; `TableInsertModal` (max 63 cols, 200 rows); top-level `new-table.ts` `tableModelToPmNode`; in-cell `docNestedTable` | `docTable`, `docTableRow`, `docTableCell` | Grid/modal | Table model | None | Basic TipTap `Table` (3×3 insert, resizable off) | Partly v1 (see section 4) | B |
| Picture | `insertImageViaDialog` → `window.desktop.pickImage()` → `insertImageFromDataUrl` → `insertPictureAtSelection` (`insert-picture.ts`) | `docProtected` (`blockType:'image'`) at body; `docInlineImage` in cell | Dialog | Image `xml` passthrough | Desktop file picker, data URL | Absent | v2 (asset references) | D for storage path; B for UX |
| Picture drop | `image-drop.ts` `insertImageFilesAtCoords` | As Picture | No | No | Drag and drop, `DataTransfer` | Absent | As Picture | B |
| Shapes | `SHAPE_GALLERY_GROUPS`; `startShapeDrawMode` (`shape-draw.ts`) → `insertShapeAt` | `docProtected` (`blockType:'passthrough'`, `genXml`) | Gallery | `wps:wsp` builder | Pointer draw mode | Absent | v2 | C |
| Line | `insertLineAt` | Read-only passthrough | No | Passthrough | None | Absent | v2 | C |
| Text Box | Rect draw or `insertTextboxAt` (`buildTextboxParagraphXml`); `focusTextboxEditorAt` | Passthrough with `textboxes` display; nested sub-editor | No | `txbx` passthrough | Sub-editor focus | Absent | v2 | C |
| WordArt | `WORDART_PRESETS`; `insertWordArtAt` (`buildWordArtParagraphXml`) | Passthrough, `wordArtId` | Presets | WordArt XML | None | Absent | v2 | C |
| Drop Cap | `setParaAttrs(editor, {dropCap})`; drop or margin, 3 lines | Paragraph attr | No | Not confirmed | None | Absent | v1 extension | B |
| Chart | `ChartInsertModal` (bar, line, pie, editable grid) → `docProtected` (`blockType:'chart'`, `genChart`, `chartDisplay`) | Protected node | Modal | Chart XML | Chart rendering | Absent | v2 | C (architecture only) |
| Hyperlink | `LinkInsertModal`; `link` mark (`href`, `rId`, `tooltip`); `link-actions.ts` `linkRangeAt`, `removeLink`, `linkTarget` | Mark | Modal | `rId` relationship | None | StarterKit `Link` via `extendMarkRange` / `setLink` | v1 compatible | A |
| Bookmark | `BookmarkModal`; `bookmarks: string[]` attr on `docParagraph` / `docHeading` / `docListItem` via `setNodeMarkup` | Node attr | Modal | Bookmark XML | None | Absent | v1 extension (node attr) | B |
| Cross-reference | `CrossRefModal` inserts text with `refField` mark `{name}` | Mark, bookmark target | Modal | Field code | None | Absent | v1 extension possible; field update is v2 | C |
| Comment | `onNewComment`, gated by `canComment` and `isProtected && !commentsAllowed` | Review model (see 005B0A/B) | No | No | None | Absent in Insert path | Existing Review model | A (entry point only) |
| Header / Footer | `onHfEdit`, `onHeader`, `onFooter` | Header/footer sub-editor | Menu | Section header parts | Sub-editor | Absent | Requires page/section model | C |
| Page Number | Presets via `hfPageNumberOnly` (`hf-dom`); format via sectPr `pgNumType` | Header/footer sub-editor, section | Menu | `pgNumType` | None | Absent | Requires page model | C |
| Fields | `onInsertField`: DATE, TIME, PAGE, NUMPAGES, FILENAME (`field-codes.ts`) | Field node or mark | Menu | Field codes | None | Absent | v1 extension possible; page fields need page model | C |
| Equation | `EquationGallery` / `EquationModal` (`BUILTIN_EQUATIONS`) → `equation.ts` `equationBlockJson` (`docProtected` passthrough) and `inlineEquationNodeJson` (`docInlineMath`) | Protected block, inline math node | Gallery, modal | `latexToOmml`, `ommlToMathML` | MathML for display | Absent | v2 | C |
| Symbol | Not present. `SYMBOLS` list of 48 Unicode characters inserted as plain text. No symbol dialog | Text | Menu | None | None | Absent | v1 compatible | A (as plain text) |

Notes:

- Upstream Insert does not expose a symbol dialog. It is a fixed list of 48 characters inserted as text. Nova can match that without a schema change.
- Upstream Insert lines and passthrough objects store raw OOXML (`genXml`). That is a DOCX-fidelity choice, not a Nova storage model.

## 4. Table architecture

### 4.1 Node model (`apps/docs/src/renderer/editor/extensions.ts`)

- `docTable`: block group, isolating. Attributes include `docxIndex`, `colWidthsPct`, `widthPx`, `widthPct`, `cellMar`, `cellSpacingTwips`, `tblFill`, `borders`, `tblAlign`, the `tblFloat*` family, `tblAutoFit` (default `fixed`), `tblFixedLayout`, `tblDxaWidth`, `tblOverWide`.
- `docTableRow`: row node.
- `docTableCell` / `docTableHeader`: content is paragraph, list, `docNestedTable` or `cellBoxes`.
- `docNestedTable`: atom carrying a `model` attribute. Used for tables inside cells.
- `nativeTableSupport` extension maps table roles.

### 4.2 Capability matrix

| Capability | Upstream behaviour | Storage | Nova today |
|---|---|---|---|
| Creation | Hover grid 8×10; modal up to 63 cols, 200 rows | `docTable` with `colWidthsPct` / `widthPx` | 3×3 with header row |
| Nested tables | `docNestedTable` atom in a cell | `model` attr | Absent |
| Selection | Cell, row, column, whole table; `allowTableNodeSelection` | ProseMirror cell selection; node selection | `allowTableNodeSelection: true` |
| Insert / delete row and column | Toolbar contextual group | Table transaction | Add row, add column, delete row, delete column in toolbar |
| Split / merge cells | Upstream: `mergeCells` and `splitCellsInto` (Section 30) | Adoption B | Standard TipTap table commands; no split-count dialog |
| Row height, column width | `table-sizing.ts` (not fully read); `setTableAutoFit` writes `widthPx`, `colWidthsPct`, per-cell `colwidth` | Table and cell attrs | Resize disabled (`resizable: false`) |
| Autofit | `contents` / `window` / `fixed` | `tblAutoFit` | Absent |
| Table alignment and floating | `tblAlign`, `tblFloat*` | Table attrs | Absent |
| Borders | `TABLE_BORDER_MENU`: bottom, top, left, right, none, all, outer, inner, insideH, insideV, tl2br, tr2bl. `setSelectionBorders` applies to selected cells; a caret applies to the whole table | `borders` attr | Default TipTap table styling |
| Presets | `applyTablePreset`; `setTableLookOption` | Table attrs | Absent |
| Header row and repeat | `toggleRepeatHeaderRows` | Row attr | Header row only |
| Cell alignment | Upstream: 3×3 cell alignment in Table Layout (Section 35) | Adoption B | Cell attribute |
| Shading | `tblFill` at table level; cell shading not confirmed | Table attr | Absent |

### 4.3 Nova table comparison

- Equivalent nodes: `docTable` → TipTap `table`; `docTableRow` → `tableRow`; `docTableCell` / `docTableHeader` → `tableCell` / `tableHeader`.
- Missing in Nova: nested table atom, the sizing attributes, table alignment and float attributes, border model, presets and look options, and repeat-header metadata.
- Compatible with current Nova JSON: basic row and column structure, header row, and a table-level width expressed as a percentage.
- Requires schema extension (v1 extension possible): table-level borders, widths in `colwidth`, look options, repeat header.
- Requires schema v2 or page model: floating or positioned tables, nested tables with their own model, DOCX `docxIndex` round-trip.

## 5. Image lifecycle and asset boundary

### 5.1 Upstream lifecycle

1. File chosen: `insertImageViaDialog` calls `window.desktop.pickImage()` (Electron desktop bridge).
2. Bytes to data URL: `insertImageFromDataUrl` accepts png, jpeg and gif and scales to `MAX_IMAGE_WIDTH_PX`.
3. Node created: `insertPictureAtSelection` (`insert-picture.ts`). At body level it creates `docProtected` with `blockType:'image'` and `genImage` (base64 and mime). Inside a table cell it creates `docInlineImage`, scaled to the cell width.
4. Dimensions assigned at insertion.
5. Editor state updated through a normal transaction.
6. Persistence: `persistable-image.ts` restricts `PERSISTABLE_IMAGE_URL` to base64 png, jpeg and gif. Stored as base64 inside the document.
7. Export: the verbatim `<w:drawing>` `xml` attribute on `docInlineImage` is round-tripped to DOCX.

Drop: `image-drop.ts` `insertImageFilesAtCoords` maps drop coordinates to a position and reuses the insertion path.

Rotation: `image-rotation.ts` (`pictureTransformFns`, quarter-turn margins, `pictureLayerDecls`). Crop and cutout are destructive bitmap rewrites (`CropDialog`, `CutoutDialog`; Section 27).

Replacement and a picture-specific contextual ribbon were not confirmed in the windows read; open item.

### 5.2 Nova asset boundary

GenOffice's base64-in-document storage is not Nova's storage architecture. Nova must replace it with:

- TPI asset upload through the existing TPI server path, never a client-side store.
- Stable asset IDs in document JSON (for example `assetId`, `mime`, `width`, `height`, `alt`), not data URLs or local paths.
- Permissions checked against the document owner and share model on every read.
- Stable URLs that resolve through the authenticated asset route, with publication-safe rendering: published output receives only assets the publication is allowed to show.
- Upload limits, MIME allow-list (png, jpeg, gif first) and dimension validation on the server.

This is a design boundary only. No asset storage is implemented here.

## 6. Image model

| Attribute | Upstream (`docInlineImage`) | Nova today | Schema need |
|---|---|---|---|
| Width, height | `widthPx`, `heightPx` | Absent | v1 extension possible if inline only |
| Rotation | `rotDeg`, `flipH`, `flipV` | Absent | v1 extension possible |
| Alignment | `posH`, `posV`, `relH`, `relV` | Absent | v2 |
| Wrapping | `wrap`, `wrapDist*Emu` | Absent | v2 |
| Inline vs floating | `wrap`, offsets `offsetXEmu` / `offsetYEmu` | Absent | v2 |
| Crop | Not found | Absent | Not planned |
| Alt text | Upstream: alt-text tab in `TablePropertiesDialog.tsx` (Section 34) | Absent in Nova | v1 extension possible |
| Object identity | Not a stable ID; position-based | Absent | Requires asset ID |
| Z-order | `layers` plus `floating-z-order.ts` | Absent | v2 |
| Source | `dataUrl`, verbatim `xml` | Absent | Replace with asset ID (section 5.2) |

## 7. Floating objects, positioning and wrapping

- `floating-z-order.ts`: `ImageWrap` modes include front, behind, topBottom, square-left and square-right. Tight and through are normalised to square. Functions: `boxWithZ`, `setFloatingWrap`, `bringToFront`, `bringForward`, `sendBackward`, `sendToBack`.
- `wrap-group.ts`: `wrapGroupCss` for the CSS wrap grouping.
- `wrap-obstacles.ts` (922 lines): computes obstacle geometry for text flow. The body is read in Section 36.
- Positions: `offsetXEmu`, `offsetYEmu`, `relH`, `relV`, `posH`, `posV`. Page-relative, margin-relative and paragraph-relative positioning is implied by `relH`/`relV` values, but the full value set was not enumerated.
- Inline versus floating: the `wrap` attribute distinguishes them. `docProtected` image blocks are a third case for body-level images.

Do not assume Word parity. Only the wrap modes listed above are confirmed in source. Tight and through are not supported as distinct modes.

This is likely schema v2 evidence: floating position and wrap need the page and layout model, which has not been inventoried yet.

## 8. Image drag, resize and rotate

| Behaviour | Classification | Note |
|---|---|---|
| Selection outline and handles | Generic browser and ProseMirror node selection, plus GenOffice-specific handle rendering | Handle rendering not fully traced |
| Resize | GenOffice model specific | Writes `widthPx` / `heightPx` |
| Aspect ratio | Generic (computed from stored ratio) | Behaviour not confirmed in source |
| Rotate | GenOffice model specific | `rotDeg` with quarter-turn margins |
| Drag to move (floating) | GenOffice model specific | Writes `offsetXEmu` / `offsetYEmu` |
| Keyboard adjustment | Not confirmed | Treat as absent |

## 9. Shapes

- Gallery: `SHAPE_GALLERY_GROUPS` in `@genoffice/ui`.
- Insertion: `startShapeDrawMode` (`shape-draw.ts`, default 914400 EMU) → `insertShapeAt`. Default size 1800000 × 1080000 EMU, default fill `4472C4`.
- Geometry: `prstGeom` in `wps:wsp` generated by `buildShapeParagraphXml`.
- Rendering: `shape-svg.ts` (`shapePaths`, `shapePreviewPathD`, `shapeBackgroundCss`, `shapeTextInsetsPx`, `isStraightLineKind`).
- Storage: `docProtected` with `blockType:'passthrough'` and `genXml`; display via `textboxes`.
- Dependencies: `@genoffice/ui` (gallery), `@genoffice/docx-engine` (XML builder). `@genoffice/pptx-render` was not confirmed as a dependency of the Insert path.
- Stroke, rotation, positioning inside the shape and text inside the shape: partly read. Shape text is handled by the text-box path, not a general shape text model.

### Shape model requirements (for schema v2)

Object type, geometry (preset name plus adjustments), fill, stroke, transform (position, size, rotation), wrapping, and contained text. Upstream stores this as raw OOXML, which Nova should not adopt directly.

## 10. Text boxes

- Insertion: rectangle draw or `insertTextboxAt` (`buildTextboxParagraphXml`).
- Node: passthrough `docProtected` with a `textboxes` display attribute.
- Editing: `focusTextboxEditorAt` (double-click) opens a sub-editor for the box's text.
- Position and size: stored in the `wps` / `txbx` XML.
- Border and fill: from the shape XML.
- Text persistence: inside the box XML, via the sub-editor.
- History (from 005B0B3): the text-box sub-editor keeps its own temporary history, in the same way as header and footer sub-editors. Committed text-box edits do not enter main-editor history. This is a separate history scope and must be modelled explicitly in Nova.

## 11. WordArt

- Presets: `WORDART_PRESETS` in `@genoffice/ui`.
- Insertion: `insertWordArtAt` (`buildWordArtParagraphXml`), default 2700000 × 720000 EMU.
- Storage: passthrough `docProtected` with `wordArtId`, and WordArt XML.
- Fill, stroke, effects: in XML; not separately modelled in the Nova sense.
- Classification: reusable UI presets; OOXML-bound behaviour; model needs effects and text transforms that Nova does not have.
- Placement: defer to a later tranche. It depends on the object model (section 7), and its value is lower than core insertion.

## 12. Charts

- Types: bar, line, pie (`ChartInsertModal`).
- Data: an editable grid in the modal; values are stored in the chart XML.
- Node: `docProtected` with `blockType:'chart'`, `genChart`, and `chartDisplay`.
- Persistence: `genChart` XML round-tripped to DOCX.
- Rendering: `chartDisplay` for the editor; OOXML dependency for DOCX.
- Classification: **architecture only.** Do not adopt for the first Nova wave. Chart rendering and data editing need a data model that Nova does not have.

## 13. Links

| Capability | GenOffice (`link-actions.ts`, `LinkInsertModal`) | Nova (StarterKit `Link`, `DocumentEditor.tsx` `applyLink`, `NovaEditor.tsx` `openLinkDialog`/`applyLink`) |
|---|---|---|
| Insert | Modal; `linkRangeAt` | `extendMarkRange('link').setLink` |
| Edit | Same modal on selected link | Same dialog |
| Remove | `removeLink` | `unsetLink` |
| Selected-link detection | `linkTarget` (external or anchor) | Mark detection via TipTap |
| Target types | External URL and internal anchor (`rId` relationship) | External URL only |
| URL validation | Not traced in 005B0C1; outside the table and object scope | Out of 005B0C scope |
| Formatting preservation | Not confirmed | Not confirmed |
| Tooltip | `tooltip` attr | Absent |

Useful GenOffice behaviour Nova lacks: internal anchor links (tie to bookmarks, section 14) and a tooltip attribute.

## 14. Bookmarks

- Representation: `bookmarks: string[]` attribute on `docParagraph`, `docHeading` and `docListItem`. It is a node attribute, not a mark.
- Naming: regex `^[A-Za-z一-鿿_][\w一-鿿]*$`.
- Insertion: `BookmarkModal` → `setNodeMarkup`.
- Navigation and removal: derived from the node attribute; the navigation path was not fully traced.
- Persistence: stored as bookmark XML in DOCX.
- Nova need: a node attribute is possible in v1 (paragraph and heading attrs). A mark-based design is not required. Cross-references need bookmarks to exist first.

## 15. Cross-references

- Insertion: `CrossRefModal` inserts text with a `refField` mark carrying `{name}`.
- Relationship to bookmarks: the target is the bookmark name. A cross-reference is dead if the bookmark is removed.
- Display text: the mark's text is written at insertion time.
- Update behaviour: field update is not confirmed as automatic. Treat as manual.
- OOXML dependency: a field code, so it round-trips to DOCX only with field support.
- Classification: v1 extension possible for the mark and display text; field update and page-number references are v2 and need the page model.

## 16. Comments (Insert entry point only)

- Entry: `onNewComment`.
- Selection requirement: a non-empty selection.
- Gating: `canComment`, and `isProtected && !commentsAllowed` blocks the command.
- Linkage: the comment is created through the existing Review model documented in 005B0A and 005B0B. This section does not redo that architecture.

## 17. Header, footer and page number (Insert side)

- `onHfEdit`, `onHeader`, `onFooter` open the header or footer sub-editor.
- Page Number presets: `hfPageNumberOnly` in `hf-dom`.
- Page Number Format: `pgNumType` in sectPr.
- Sub-editor behaviour: `hf-float-edit.ts` (headline only read). Header and footer keep their own temporary history, as recorded in 005B0B3.
- Page and section model requirement: header and footer are section parts. Nova has no section or page model yet. Requires the page model first.

## 18. Fields

- `onInsertField` offers DATE, TIME, PAGE, NUMPAGES, FILENAME (`field-codes.ts`).
- DATE, TIME and FILENAME can be v1 extension values. PAGE and NUMPAGES depend on the page model.

## 19. Equations

- UI: `EquationGallery` and `EquationModal` (`BUILTIN_EQUATIONS`).
- Block equations: `equation.ts` `equationBlockJson` creates `docProtected` passthrough with `genXml` = `mathParagraphXml(omml)` and `formulaDisplay`.
- Inline equations: `inlineEquationNodeJson` creates `docInlineMath` with attributes `omml`, `mathml`, `latex`, `text`.
- Conversion: LaTeX to OMML through `latexToOmml`; OMML to MathML through `ommlToMathML`, both from `@genoffice/docx-engine`.
- Persistence: OMML is stored in the node; DOCX export uses `mathParagraphXml`.
- Browser portability: display uses MathML, which browsers render natively. The conversion path is pure JavaScript in the docx-engine package. Portable in principle; not run in a browser for 005B0C.
- Classification: **C (defer).** Equations need a math node and a conversion dependency. Not in the first wave.

## 20. Symbols and special characters

The frozen upstream Insert ribbon does not expose a symbol dialog. It has a fixed list of 48 Unicode characters (`SYMBOLS`) that are inserted as plain text. Nova can match that behaviour with no schema change.

## 21. Cover page, blank page and page break

- Cover page: `cover-pages.ts` (`COVER_PRESETS`, `insertCoverPage`, `removeCoverPage`) inserts paragraphs bracketed by `_GenOfficeCoverPage` and `_GenOfficeCoverPageEnd` markers. It is a preset of ordinary content, not a section model. Reusable as a template concept. Requires page-break and section behaviour to be correct, so classify C.
- Blank page: a paragraph with `pageBreakBefore`, with a spacer fallback. v1 extension possible (paragraph attr).
- Page break: `page-break.ts` `insertPageBreak`; column break and text wrapping break share the path. A simple page break is v1 compatible as a break node. Column and section breaks need the page model.
- Record: Nova can support blank page and simple page break before the full page model. Cover page and section-level breaks wait for the page model. This feeds 005B0D.

## 22. Object selection model

| Object | Selection mechanism | Contextual trigger | Sub-editor |
|---|---|---|---|
| Image (body) | `docProtected` node selection | Picture contextual ribbon (not fully traced) | No |
| Image (in cell) | `docInlineImage` inline selection | Same | No |
| Table | `allowTableNodeSelection`, cell selection | Table Design and Layout (open item) | No |
| Shape | `docProtected` passthrough node selection | Not confirmed | No |
| Text box | Passthrough node; double-click enters sub-editor | Text box editing | Yes |
| WordArt | Passthrough node | Not confirmed | No |
| Chart | `docProtected` node selection | Not confirmed | No |
| Equation | `docProtected` / `docInlineMath` node selection | Not confirmed | No |

Nova today: TipTap node selection for tables only. No object selection for images, shapes, text boxes or charts.

## 23. History implications

| Operation | Path into history | Atomic requirement |
|---|---|---|
| Insert table | Single transaction | Atomic |
| Resize table (`setTableAutoFit`, drag) | Transaction per action; drag may produce many | Coalesce drag into one command |
| Insert image | Single transaction | Atomic |
| Resize image | Transaction per update | Coalesce drag |
| Rotate image | Transaction per quarter turn | Atomic per click |
| Insert or move shape | Draw mode then insert transaction; move per update | Coalesce move |
| Text box edits | Separate sub-editor history (005B0B3) | Scoped history, not main editor |
| Accept All / Reject All | As recorded in section 1 | Atomic for Nova |

Multi-step operations that need atomic Nova commands: draw-then-insert shape, drag move and resize (coalesce), table insertion with initial content, and header or footer changes that must reach main history consistently.

## 24. Nova compatibility matrix

| Capability | GenOffice | Nova today | Current schema supports | Command work | Schema change | Asset integration | Phase |
|---|---|---|---|---|---|---|---|
| Hyperlink | Modal, mark | StarterKit Link | Yes | Modal and edit flow | None | No | 005B2 |
| Symbol | Fixed list | Absent | Yes (text) | Menu | None | No | 005B2 |
| Basic table | Yes | Yes | Yes | Insert, sizing, borders | Minor (attrs) | No | 005B2 |
| Table borders and presets | Yes | Absent | Partly | Borders command | v1 extension | No | 005B2 |
| Nested table | Yes | Absent | No | Nested command | v1 extension or v2 | No | 005B2+ |
| Blank page, page break | Yes | Absent | Partly | Break command | v1 extension | No | 005B2 |
| Picture (inline) | Yes | Absent | No | Insert, asset | v1 extension | Yes | 005B2 |
| Picture (floating) | Yes | Absent | No | Position and wrap | v2 | Yes | 005B3 |
| Bookmark | Yes | Absent | Partly | Node attr | v1 extension | No | 005B2 |
| Cross-reference | Yes | Absent | Partly | Mark, bookmark | v1 extension; update v2 | No | 005B3 |
| Shape, text box, WordArt | Yes | Absent | No | Object model | v2 | Partly | 005B3+ |
| Chart | Yes | Absent | No | Data model | v2 | Yes | Defer |
| Equation | Yes | Absent | No | Math node, conversion | v2 | No | Defer |
| Header, footer, page number | Yes | Absent | No | Sub-editor | Requires page model | No | 005B4 (page model) |
| Cover page | Yes | Absent | No | Preset | Requires page model | No | Defer |
| Insert comment | Yes | Review model | Yes | Entry point | None | No | Existing |

## 25. Schema pressure matrix

| Capability | Classification |
|---|---|
| Advanced tables (borders, widths, look options, repeat header) | v1 extension possible |
| Nested tables | v1 extension possible or v2 |
| Image asset references | v1 extension possible (inline only) |
| Floating objects, wrap, z-order | v2 recommended |
| Shapes | v2 recommended |
| Text boxes | v2 recommended; separate sub-editor scope |
| Charts | v2 recommended; defer |
| Bookmarks | v1 compatible (node attr) |
| Fields (DATE, TIME, FILENAME) | v1 extension possible |
| Fields (PAGE, NUMPAGES) | Requires page model first |
| Cross-references | v1 extension possible; updates need v2 |
| Comments | v1 compatible (existing Review model) |
| Equations | v2 recommended |
| Header and footer | Requires page model first |
| Page numbers | Requires page model first |
| Page breaks (simple) | v1 compatible |
| Column and section breaks | Requires page model first |
| Cover pages | Requires page model first |

No global schema strategy is chosen here. Full GenOffice model, Nova v2 and a hybrid adapter are all left open until the Layout and Page Model inventory (005B0D) is complete.

## 26. Proposed 005B2 boundary

**Core professional insertion (first wave):**

- Table insertion with dimensions and the hover grid, plus row and column insert and delete.
- Simple table borders and header-row repeat, as v1 attributes.
- Inline pictures from Nova asset IDs (upload, stable URL, publication-safe rendering), with no floating layout.
- Hyperlink edit and remove, including tooltip if adopted.
- Symbol insertion as plain text.
- Simple page break and blank page.
- Bookmark as a node attribute.
- Fields DATE, TIME and FILENAME.

**Advanced object features (later, dependent on page or schema work):**

- Floating pictures, wrap and z-order: 005B3, after v2 decision.
- Shapes, text boxes and WordArt: 005B3+, needs object model and separate sub-editor history.
- Charts and equations: defer.
- Header, footer, page number, cover page, column and section breaks: depend on 005B0D page model.
- Cross-reference updates and PAGE or NUMPAGES fields: depend on page model.

Not implemented in this directive.

## 27. Open items: resolution from source (005B0C1)

Each item below is either resolved from source or classed as unavailable upstream with the evidence cited. Section numbers refer to Sections 30–42 added in this pass.

| Item | Resolution |
|---|---|
| `table-ops.ts` internals | Resolved, Section 30. |
| `table-sizing.ts`, `table-geometry.ts` | Resolved, Sections 31–32. |
| `table-handle.ts`, drag plugins | Resolved, Section 33. |
| `TablePropertiesDialog.tsx`, `TableDialogs.tsx` | Resolved, Section 34. |
| Table Design / Layout ribbon activation | Resolved, Section 35. |
| `wrap-obstacles.ts` body | Resolved, Section 36. |
| `hf-float-edit.ts` | Resolved: header/footer floating picture move and resize. Window mousemove listeners; one commit on mouseup through an `HfPictureEdit` callback. History follows the caller, so it is not a separate history model. |
| `field-codes.ts` | Resolved: Toggle Field Codes is a display-time decoration. It never dirties the document or the undo stack. |
| `trailing-table-exit.ts` | Resolved: a ProseMirror plugin that gives caret exit from a trailing table (GapCursor/TextSelection). Track-changes ignore meta is set. No schema change. |
| Image crop | Resolved: `CropDialog` (`PictureDialogs.tsx` ~264) returns a cropped data URL; `Ribbon.tsx` ~4720–4724 passes it to `applyPictureBytes`. Destructive pixel rewrite. No non-destructive crop attribute exists upstream. |
| Cutout | Resolved: `CutoutDialog` also rewrites the bitmap as PNG. Destructive. |
| Image replace | Resolved: no separate replace command; it goes through the same `applyPictureBytes` path as crop and cutout. |
| Picture contextual ribbon | Resolved, Section 37. |
| Shape stroke | Resolved: stroke is rendered from SVG path data (`shape-svg.ts` `shapePaths`, `shapeBackgroundImage`) with a border colour and stroke width. Section 38. |
| Shape rotation | Resolved: `image-rotation.ts` converts DrawingML `rot`, `flipH`, `flipV` to CSS transforms (`pictureTransformFns`). Display-only output; the stored value is the DrawingML attribute. Section 38. |
| Shape inner text | Resolved: text inside a shape is held in the `docProtected` node's `textboxes` attribute, not as ProseMirror content. Section 38. |
| Drag and drop of non-image files | Resolved as unsupported in the editor. `App.tsx` `handleDrop` (~1360) accepts only image files through `imageFilesFromDataTransfer`; other files return false. Section 39. |
| Copy and paste fidelity: tables, images, links, shapes, text boxes | Resolved, Sections 40–42. |

Re-audit (005B0C2): every item above is RESOLVED with the section cited, except the following, which are classed as follows.

- Chart move and resize: NOT IMPLEMENTED UPSTREAM as a traced path (Section 47). Deferred by architecture with charts (Section 52).
- Chart data edit: DEFERRED BY ARCHITECTURE (Section 52).
- WordArt table and style: RESOLVED (Section 44 and 47).

No required 005B0C item is left open, partial or indexed only.

## 30. Table operations (`table-ops.ts`)

| Operation | Command | Transaction | Attributes changed | History |
|---|---|---|---|---|
| Insert row above/below, delete row | ProseMirror table commands via `table-ops.ts` | Standard table steps | Row nodes, `rowspan` of spanning cells | One step per command |
| Insert/delete column | Column commands | Standard table steps | Cell count, `colwidth` | One step |
| Merge cells | `mergeCells` (prosemirror-tables) | Standard merge step | `colspan`/`rowspan`; content concatenated | One step |
| Split cells | `splitCellsInto(rows, cols, mergeFirst)` line 324 | Captures a merge transaction then splits | `colspan`/`rowspan` reset | One step |
| Split table | Table split command | Standard split step | Table node count | One step |
| Distribute rows | `distributeRowsEvenly` line 441 | `setNodeMarkup` per row | Row height | One step |
| Distribute columns | `distributeSelectedColumns` (`table-sizing.ts` 193) | Grid rewrite | `colwidth` | One step |
| Cell shading | `setCellAttr('fill', hex)` (`Ribbon.tsx` ~3004) | Attribute write | `fill` on cell | One step |

**Schema assumptions:** standard prosemirror-tables cell and row nodes with `colspan`, `rowspan` and `colwidth`. No new node types. Limits: `MAX_TABLE_COLS` 63, `MAX_TABLE_ROWS` 200; split clamps to 50 and insert clamps to 100.

**Nova today:** `Table.configure({resizable:false, allowTableNodeSelection:true})` with TableRow, TableHeader and TableCell. Merge and split are present in prosemirror-tables form, but there is no split-count dialog or distribute command.

**Adoption class:** A for generic row and column commands; B for merge, split and distribute, adaptable with Nova commands.

## 31. Table sizing (`table-sizing.ts`)

- Storage units: column widths are `colwidth` in pixels on cells and `widthPx`/`widthPct`/`colWidthsPct` on the table. Floating position is stored in twips (`tblFloatXTwips`, `tblFloatYTwips`). Row height is written as `heightTwips`, with pixels converted at 15 twips per pixel.
- Minimum column width is `MIN_TABLE_COLUMN_PX` 40. Row drag minimum is `MIN_ROW_PX` 4.
- Setting a width writes `tblAutoFit: 'fixed'` and `tblAutoFitEdited: true` (`table-sizing.ts` 139–145).
- Derived values such as the grid total are computed at layout time, not stored.

## 32. Table AutoFit (`table-properties.ts` `setTableAutoFit`)

Upstream has three distinct, persisted modes, listed in `TABLE_AUTO_FIT_OPTIONS` (`TablePropertiesDialog.tsx` 20–24):

- **AutoFit Contents** (`contents`): clears `widthPx`, `widthPct` and `colWidthsPct`; the table sizes to its content.
- **AutoFit Window** (`window`): clears `widthPx` and sets `widthPct` to 100.
- **Fixed Column Width** (`fixed`): sets `widthPx` to the measured total and clears `widthPct`.

The mode is persisted document state (`tblAutoFit`), not layout-only state. Dynamic recalculation happens in layout. Adoption class: B, using a Nova command that writes the same attribute.

## 33. Table handles and drag

- **Move handle:** floating tables only. Mouseup issues one `setNodeMarkup` that writes `tblFloatXTwips` and `tblFloatYTwips`. This is a single history step.
- **Corner resize:** a preview during drag, then one commit transaction. A chrome correction uses `addToHistory:false`. Escape restores the original.
- **Column drag** (`table-column-drag.ts`): one `setTableGridAtCell` on mouseup, so one history step.
- **Row drag** (`table-row-drag.ts`): `setNodeMarkup` plus an `addToHistory:false` chrome correction, one history step. Minimum 4 px.
- Hover and cursor behaviour is CSS and DOM measurement. Classification: column and row drag are C (layout-dependent DOM measurement); the commit path is B.

**Desired Nova behaviour:** one completed drag gesture produces one undoable command. The source supports this for all four drag types above, so no scratch runtime test was needed.


Licence for all: Apache-2.0 (upstream `LICENSE`). Provenance only; nothing copied. Blob SHAs are 8-character prefixes at the frozen SHA. Dates are last-touch commit dates.

| Module | Blob | Last touch | Date |
|---|---|---|---|
| `editor/new-table.ts` | 215c8d4a | 2026-10-30 | Insert table |
| `editor/table-ops.ts` | 3a50c9b2 | 2026-10-30 | Table commands |
| `editor/table-sizing.ts` | 15405601 | 2026-10-19 | Sizing |
| `editor/table-borders.ts` | 3e052665 | 2026-10-01 | Borders |
| `editor/table-properties.ts` | 50fc391d | 2026-08-26 | Table attrs |
| `editor/table-column-drag.ts` | 93b581b3 | 2026-10-19 | Column drag |
| `editor/table-row-drag.ts` | 50691038 | 2026-10-22 | Row drag |
| `editor/table-geometry.ts` | b0aa8e77 | 2026-11-04 | Geometry |
| `editor/table-handle.ts` | 55593ba7 | 2026-10-22 | Handles |
| `editor/insert-picture.ts` | ca249d61 | 2026-10-15 | Picture insert |
| `editor/image-drop.ts` | fa0a3efc | 2026-09-14 | Image drop |
| `editor/persistable-image.ts` | 9a70e34d | 2026-10-08 | Image persistence |
| `editor/image-rotation.ts` | 1bd7850d | 2026-11-03 | Rotation |
| `editor/cover-pages.ts` | c57cf4fe | 2026-09-27 | Cover page |
| `editor/equation.ts` | c29795c6 | 2026-10-30 | Equation |
| `editor/page-break.ts` | 25999a01 | 2026-09-27 | Page break |
| `editor/link-actions.ts` | 7051d695 | 2026-09-27 | Links |
| `editor/shape-draw.ts` | 37ab9ccf | 2026-09-27 | Shape draw |
| `editor/shape-svg.ts` | c98701eb | 2026-11-03 | Shape SVG |
| `editor/wrap-group.ts` | 80c46c38 | 2026-10-22 | Wrap grouping |
| `editor/wrap-obstacles.ts` | f2685b09 | 2026-11-04 | Wrap obstacles (indexed) |
| `editor/floating-z-order.ts` | e6af98af | 2026-11-04 | Floating z-order |
| `editor/trailing-table-exit.ts` | 630fad48 | 2026-09-14 | Table exit (indexed) |
| `editor/field-codes.ts` | d3d409b6 | 2026-09-27 | Fields (indexed) |
| `editor/hf-float-edit.ts` | a1c74f76 | 2026-11-02 | Header/footer float (indexed) |
| `components/TablePropertiesDialog.tsx` | b39ab0e3 | 2026-09-27 | Table dialog (indexed) |
| `components/TableDialogs.tsx` | 99e06562 | 2026-09-27 | Table dialogs (indexed) |
| `components/EquationModal.tsx` | b9438f0e | 2026-08-17 | Equation modal |

## 34. Table dialogs

- **TablePropertiesDialog** tabs: table, row, column, cell and alt text. Table tab: width, alignment, indentation and AutoFit mode (via `setTableAutoFit`). Cell tab: cell margins and vertical alignment. OK commits the changed groups in one flow. No Word-style wrapping or positioning controls exist for tables beyond the floating move handle.
- **Split Cells** (1–50 rows or columns, `splitCellsInto`), **Insert Cells** (1–100), **Delete Cells**, **Cell Margins**. Each maps to one command.
- Dialog values are stored only in table and cell node attributes.

## 35. Contextual ribbons: Table Design and Table Layout

Both tabs activate through the same mechanism as Picture Format and Shape Format (`Ribbon.tsx` ~1066–1100). The active table is resolved from the selection:

- Caret inside a table: Table tabs appear.
- CellSelection, or multiple cells: resolved to the enclosing table.
- NodeSelection of a table: resolved to that table.
- Nested table: the innermost table is used.

Table Layout controls: insert and delete row or column, merge (gated by `canMergeCells`), split table (gated by `canSplitTable`), cell size, AutoFit dropdown, distribute rows and columns, cell alignment (3×3), text direction, and repeat header (gated by `tableHeader.enabled`). Table Design controls: cell shading (`setCellAttr('fill')`) and border and style toggles. No sort or formula control exists upstream.

State is read from the selection and the table and cell attributes. This is the state contract the future Nova selection layer must supply. Adoption class: B for controls backed by table attributes, A for selection handling.

## 36. Wrap engine (`wrap-obstacles.ts`)

- `syncWrapObstacles` (lines ~208–670) registers `ObstacleRect`s for floating objects, paragraph padding decorations (`data-obs-mode`, `data-obs-base`) and line floats (`float:side`).
- Square, top-and-bottom and front or behind wrapping are all rendered through these obstacles.
- The only ProseMirror write is the history meta at line 357, with `addToHistory:false`.
- Classification: transient DOM and layout measurement. Not document schema. Wrap mode itself is stored on the floating object (`imageWrap`).

## 37. Picture Format and Shape Format contextual tabs

- Picture Format shows when an image block is selected (`Ribbon.tsx` ~1080–1095). It hands back to Header & Footer when a header or footer picture is selected.
- Shape Format shows when a floating box is selected (`Ribbon.tsx` ~1100). Unlike Picture Format, it survives text editing inside the shape.
- Crop and cutout are destructive bitmap rewrites (Section 27).

## 38. Shape stroke, rotation and inner text

- **Stroke:** rendered from SVG path data (`shape-svg.ts` `shapePaths`, `shapeBackgroundImage`). Border colour and stroke width are passed through; the default stroke width is 2.
- **Rotation and flip:** `image-rotation.ts` `pictureTransformFns` converts DrawingML `rot`, `flipH` and `flipV` to CSS `rotate` and `scale` transforms. Display-only.
- **Inner text:** held in the `docProtected` node's `textboxes` attribute (`shape-draw.ts` ~202; `convert.ts` 2789–3587), not as ProseMirror content.

## 39. File drag and drop

`App.tsx` `handleDrop` (~1360) accepts only image files through `imageFilesFromDataTransfer`; any other file returns false. Image drop is adoption class A.

## 40. Clipboard: tables and images

- `App.tsx` ~1305–1449 wires `transformPastedHTML: cleanPastedHtml`, `clipboardTextParser`, `transformPasted` and `handlePaste`.
- `multi-select.ts` `copyRanges` (~297) uses `view.serializeForClipboard` and sets `text/html` and `text/plain`.
- Tables round-trip through standard ProseMirror `colspan`, `rowspan` and `colwidth` attributes.
- Images serialise `data-image-meta` (`extensions.ts` ~4495). Embedded data is duplicated into the copied HTML; no asset ID is retained.

## 41. Clipboard: links and shapes

- Links are the `link` mark (`marks.ts` 113–130) with an `href` attribute, kept through standard `a[href]` HTML serialisation.
- Shapes and text boxes have no separate clipboard format. Their content lives in the `docProtected` node's `textboxes` attribute, so a shape copy depends on that attribute being serialised. Treat independent shape copy as unavailable upstream.

## 42. External paste into tables

No table-specific paste handler was found. Tabular text pasted into a table follows the standard `clipboardTextParser` path. Spreadsheet-style column detection is not implemented upstream, so it is recorded as unavailable, not partial.

## 43. Table schema matrix (refined)

| Attribute | Storage | Classification |
|---|---|---|
| Table width | `widthPx`, `widthPct` | v1 attribute extension possible |
| AutoFit mode | `tblAutoFit`, `tblAutoFitEdited` | v1 attribute extension possible |
| Alignment and indent | table attrs | v1 attribute extension possible |
| Floating position | `tblFloatXTwips`, `tblFloatYTwips` | requires page model |
| Row height | `heightTwips` | v1 attribute extension possible |
| Column widths | `colwidth` on cells, `colWidthsPct` | supported now (standard cell attr) |
| colspan, rowspan | standard cell attrs | supported now |
| Vertical alignment | cell attr | supported now |
| Cell margins | cell attr | v1 attribute extension possible |
| Borders | table and cell border attrs | v1 attribute extension possible |
| Shading | `fill` on cell | v1 attribute extension possible |
| Repeat header | header row flag | requires page model (repeat across pages) |
| Banding and table style | style metadata | schema v2 recommended |
| Wrapping | floating object `imageWrap` | requires page model |
| Nested tables | table in cell | supported now (standard PM), with layout-dependent width |

## 44. Object schema matrix

| Object | Persistent data | Asset reference | Layout state | Selection / UI state |
|---|---|---|---|---|
| Inline image | image attrs and `data-image-meta` | base64 data URL today (not a Nova asset ID) | inline sizing | NodeSelection, Picture Format tab |
| Floating image | `imageWrap`, `imageOffsetXEmu`, `posOffset` | data URL | wrap obstacles (transient) | NodeSelection, Picture Format tab |
| Shape | `docProtected` with preset, fill, stroke attrs | none (SVG path data) | rotation and flip as CSS (transient) | Shape Format tab |
| Text box | `textboxes` on `docProtected` | none | obstacle registration (transient) | edit mode inside shape |
| WordArt | Not a separate node. A top-level `docProtected` with `blockType: 'passthrough'`, `genXml`, and `textboxes[0].wordArtId` (`ribbon-tabs.tsx` 648 `insertWordArtAt`) | `wordArtId` (upstream id, not a Nova asset) | rendered from XML (transient) | Shape Format tab via the protected node |
| Chart | `docProtected` with `blockType: 'chart'`, attrs `chartDisplay` and `genChart` (`extensions.ts` 3864, 3883); inserted by `ribbon-insert-tab.tsx` ~346; drawn by `drawChartSvg` (`protected-render.ts` 590) | `genChart` payload (embedded, not a Nova asset) | SVG drawn from the payload (transient) | Node selection; edits via `setNodeMarkup` (`protected-render.ts` ~1701) |

## 45. Refined 005B2 boundary

**Include in 005B2:**

- Row and column insert and delete (A/B).
- Merge and split cells (B; supported by standard PM table).
- Cell alignment and cell shading (B; cell attributes, no page model).
- Row height as an attribute (B).
- Width resize with `tblAutoFit` `fixed` (B).
- AutoFit Contents and Window as persisted modes (B).
- Basic table borders (B).

**Defer to the page model (005B0D or later):**

- Floating and positioned tables: depend on page-relative positioning.
- Repeat header across pages: depends on pagination.
- Advanced wrapping, tight and through: wrap is a layout concern and tight and through are not distinct upstream.
- Page-relative objects.

**Reason:** these features need a page or layout model that Nova does not yet have, so they cannot be made durable in 005B2 without a schema decision.

## 46. Provenance additions

| Module | Blob | Last touch | Date |
|---|---|---|---|
| `components/PictureDialogs.tsx` | 2fa95214 | 2026-09-24 | Crop and cutout |
| `editor/multi-select.ts` | 8e0780eb | 2026-11-04 | Copy ranges |
| `editor/marks.ts` | 86452ff2 | 2026-11-04 | Link mark |
| `editor/table-properties.ts` | 50fc391d | 2026-08-26 | AutoFit (already listed) |
| `components/Ribbon.tsx` | 79c195ad | 2026-11-04 | Contextual tabs |
| `App.tsx` | a731f73b | 2026-11-05 | Paste and drop |

All Apache-2.0. Provenance only; nothing copied.

## 29. Checks and documentation status

- Scope: documentation only. The only file changed is this document. No Nova product code, schema, CSS, assets, APIs, database or migrations changed.
- Upstream reference: frozen SHA `d5ebe838d91373c54528795b50663d4f33947183`, read from the scratch clone outside the repository. No GenOffice source copied. No `ee/` material referenced as adoption material.
- Source-read: the modules cited in Sections 27 and 30–46, plus the object history and contextual state reads in Sections 47–48.
- Source-inferred: where a row says "inferred", the behaviour follows from the code path but was not exercised at runtime.
- Runtime tests: not required for this documentation pass. None were run.
- Production: unchanged. No deployment.
- No screenshots, scratch files or clone content committed.

## 47. Object history matrix

**Nova standard:** one user gesture or explicit command should normally produce one logical undo step. One drag, one resize gesture, one Merge Cells, one Split Cells and one table style application each make one undo. Where upstream differs, it is recorded as upstream behaviour, not as a requirement to copy.

**Text in the textbox and shape sub-editor** keeps its own temporary history, which is destroyed on exit. Object-level changes (move, resize, wrap, fill) live in the main history. Nova must not copy the destroy-on-exit model blindly: sub-editor text should join main history, or be committed as one step on exit.

| Object / operation | Source path and function | History mechanism | Undo steps | `addToHistory` / `closeHistory` | Source status | Nova target |
|---|---|---|---|---|---|---|
| Table: insert | `new-table.ts`, `ribbon-insert-tab.tsx` | Standard insert transaction | 1 | none | Source-read | 1 |
| Table: delete | `table-ops.ts` | Standard delete step | 1 | none | Source-read | 1 |
| Row / column insert, delete | `table-ops.ts` (Section 30) | Standard table steps | 1 each | none | Source-read | 1 each |
| Merge cells | `table-ops.ts` `mergeCells` | Standard merge step | 1 | none | Source-read | 1 |
| Split cells | `table-ops.ts` `splitCellsInto` 324 | Merge captured, then split | 1 | none | Source-read | 1 |
| Width resize (column) | `table-column-drag.ts` 187; `table-sizing.ts` `setTableGridAtCell` 255 | Grid rewrite on mouseup | 1 per drag | none in this path | Source-read | 1 per gesture |
| Width resize (handle) | `table-handle.ts` 367 | `setTableGridAtCell` into `tr` | 1 per gesture | none | Source-read | 1 per gesture |
| Row-height resize | `table-row-drag.ts` 128 | `addToHistory: !correction` | 1 per gesture | `addToHistory` false only for corrections | Source-read | 1 per gesture |
| Row drag | `table-row-drag.ts` 128 | `addToHistory: !correction` | 1 per gesture | as above | Source-read | 1 per gesture |
| Whole-table move | `extensions.ts` 4947 `moveHandleSpec`; `table-handle.ts` 402 | Chrome correction uses `addToHistory:false` | 1 per gesture (inferred) | `addToHistory:false` for chrome | Source-read; move commit inferred | 1 per gesture |
| Border change | `table-properties.ts`, `table-borders.ts` | Attribute write | 1 per command | none | Source-read | 1 per command |
| Shading change | `Ribbon.tsx` ~3004 `setCellAttr('fill')` | Attribute write | 1 | none | Source-read | 1 per command |
| AutoFit change | `table-properties.ts` (three modes) | Attribute write | 1 | none | Source-read | 1 per command |
| Alignment change | `table-properties.ts` / cell attr | Attribute write | 1 | none | Source-read | 1 per command |
| Table style apply | `Ribbon.tsx` table-style group | Attribute write | 1 | none | Source-read | 1 per command |
| Image: insert | `insert-picture.ts` 30–74 | `insertContent` (`docProtected` or `docInlineImage`) | 1 | none | Source-read | 1 |
| Image: delete | ProseMirror delete | Standard step | 1 | none | Inferred | 1 |
| Image: resize | `extensions.ts` 6992/7013 `imageOffsetXEmu` | Attribute write | 1 per gesture (inferred) | none | Source-read; commit inferred | 1 per gesture |
| Image: move (floating) | `extensions.ts` 6992/7013 | Attribute write | 1 per gesture (inferred) | none | Source-read; commit inferred | 1 per gesture |
| Image: rotate | `image-rotation.ts` | Display-only CSS transform | 0 (no document write) | none | Source-read | Not an undoable document edit |
| Image: wrap change | `floating-z-order.ts` `setFloatingWrap` 116–133 | `setNodeMarkup` | 1 | none | Source-read | 1 |
| Image: replace, crop, cutout | `PictureDialogs.tsx`; `Ribbon.tsx` ~4720 `applyPictureBytes` | Destructive bitmap rewrite | 1 | none | Source-read | 1, with the destructive nature stated |
| Shape: insert | `shape-draw.ts` | `insertContent` (`docProtected`) | 1 | none | Source-read | 1 |
| Shape: delete | ProseMirror delete | Standard step | 1 | none | Inferred | 1 |
| Shape: resize, move | `floating-z-order.ts` `writeSelectedBox` 84 | `updateAttributes` on `docProtected` | 1 per gesture (inferred) | none | Source-read; commit inferred | 1 per gesture |
| Shape: rotate | `image-rotation.ts` | Display-only | 0 | none | Source-read | Not an undoable document edit |
| Shape: fill or stroke | `shape-svg.ts`; `docProtected` attrs | `updateAttributes` | 1 per command | none | Source-read | 1 per command |
| Shape: z-order | `floating-z-order.ts` `setZOrder` 182 | One `setZOrder` dispatch per command | 1 per command | none | Source-read | 1 per command |
| Text box: insert | `shape-draw.ts` ~202 | `insertContent` | 1 | none | Source-read | 1 |
| Text box: delete | ProseMirror delete | Standard step | 1 | none | Inferred | 1 |
| Text box: move, resize, outer formatting | `floating-z-order.ts` `writeSelectedBox` | `updateAttributes` on `docProtected` | 1 per gesture (inferred) | none | Source-read; commit inferred | 1 per gesture |
| Text box: sub-editor text | `textboxes` attr; sub-editor has its own temporary history | Temporary sub-editor history | per sub-editor session | sub-editor only | Source-read in 005B0B | Join main history or commit once on exit |
| WordArt: insert | `ribbon-tabs.tsx` 648 `insertWordArtAt` | `insertContent` (`docProtected`, passthrough) | 1 | none | Source-read | 1 |
| WordArt: delete, move, resize | as shape | `updateAttributes` / delete | 1 per command or gesture | none | Source-read / inferred | 1 per command or gesture |
| WordArt: style or effect | `genXml` on `docProtected` | `updateAttributes` | 1 per command | none | Source-read | 1 per command |
| Chart: insert | `ribbon-insert-tab.tsx` ~346 | `insertContent` (`docProtected`, `blockType: 'chart'`) | 1 | none | Source-read | 1 |
| Chart: delete | ProseMirror delete | Standard step | 1 | none | Inferred | 1 |
| Chart: move, resize | not established upstream | Not traced | n/a | n/a | Not established | Deferred with charts (Section 52) |
| Chart: data or edit | `protected-render.ts` ~1701 `setNodeMarkup` | `setNodeMarkup` | 1 per edit | none | Source-read | Deferred with charts |

**Commit mechanisms.** The brush stroke is the only upstream `closeHistory(tr)` call on a gesture (`Ribbon.tsx` 509). Upstream `closeHistory` appears only at `Ribbon.tsx` 14 and 509. Every other path relies on ProseMirror's default grouping (`newGroupDelay` 500 ms). Nova should add explicit boundaries at compound commands rather than relying on the timer.

## 48. Per-control contextual state (Table Design and Table Layout)

State is read from the selection and the table or cell attributes (Section 35). Only controls that exist upstream are listed.

### Table Design

| Control | State source | Command path | Attribute affected | Enable condition | Selection requirement |
|---|---|---|---|---|---|
| Border presets | Table border attrs | `table-borders.ts`, `table-properties.ts` | Cell or table border attrs | Table context | Caret in table, cell selection or whole table |
| Border width, style, colour | Table border attrs | `table-borders.ts` | Border attrs | Table context | As above |
| Cell shading | Cell `fill` attr | `setCellAttr('fill')` (`Ribbon.tsx` ~3004) | Cell `fill` | Cell or range selected | Cell selection or caret in cell |
| Table style options | Table style metadata | `Ribbon.tsx` table-style group | Table style attrs | Table context | Table context |
| Header row | Table header attrs (`tableHeader`) | Table properties | Header metadata | Table context | Table context |
| Banded rows and columns | Table look attrs | Table properties | Look flags | Table context | Table context |
| Total row, first and last column | Not confirmed upstream as separate controls | Not traced | n/a | n/a | n/a |

### Table Layout

| Control | State source | Command path | Attribute affected | Enable condition | Selection requirement |
|---|---|---|---|---|---|
| Select table, row, column, cell | Selection | ProseMirror selection commands | Selection only | Table context | Any cell |
| Insert and delete row or column | Selection | `table-ops.ts` (Section 30) | Rows, cells, grid | Table context | Caret or cell selection |
| Merge (`canMergeCells`) | Selection | `mergeCells` | `colspan`, `rowspan` | `canMergeCells` true | Multi-cell selection |
| Split (`canSplitTable`) | Selection | `splitCellsInto` | `colspan`, `rowspan` | `canSplitTable` true | Caret or cell in merged cell |
| Cell size (width, height) | Cell `colwidth`, row height | `table-sizing.ts` | `colwidth`, row height | Table context | Caret or cell selection |
| AutoFit dropdown | Table `tblAutoFit` mode | `table-properties.ts` | AutoFit mode (three modes) | Table context | Table context |
| Distribute rows and columns | Selection | `distributeRowsEvenly` 441; `distributeSelectedColumns` | Row height, `colwidth` | Table context | Cell selection or whole table |
| Cell alignment (3×3) | Cell vertical and horizontal align | Cell attrs | Cell alignment | Table context | Cell selection or caret |
| Text direction | Cell direction | Cell attrs | Text direction | Table context | Cell selection or caret |
| Repeat header (`tableHeader.enabled`) | Header metadata | Table properties | Header metadata | `tableHeader.enabled` | Table context |
| Cell margins | Table or cell margin attrs | Table properties | Margin attrs | Table context | Table context |

### Selection contract (future Nova)

| Selection state | Table Design | Table Layout |
|---|---|---|
| Caret inside one cell | Enabled; border and shading apply to the cell | Enabled; row and column commands apply to that cell's row and column |
| Cell selection (multiple cells) | Enabled; apply to all selected cells | Merge enabled if rectangular; split enabled if a merged cell is included |
| Row selection | Enabled; border applies to the row | Row insert and delete enabled; column commands disabled |
| Column selection | Enabled; border applies to the column | Column insert and delete enabled; row commands disabled |
| Whole table selection | Enabled; apply to all cells | Distribute and AutoFit enabled; cell-only controls apply to the whole table |
| Merged cell | Enabled | Split enabled; merge disabled on a single merged cell |
| Nested table | Enabled for the innermost table only | Same as its own table; outer table is not affected |
| NodeSelection of a table | Enabled for that table | Enabled for that table |
| NodeSelection of an image, shape, text box, chart or WordArt | Table tabs hidden | Table tabs hidden |

This is architecture only. Adoption class B for controls backed by table attributes, A for selection handling.

## 49. Directive audit

Every original 005B0C area, with its section. PASS means the area is covered by an authoritative section.

| Area | Result | Section |
|---|---|---|
| Insert control matrix | PASS | 3 |
| Current Nova baseline | PASS | 3 |
| Full table engine | PASS | 30–34 |
| Table capability matrix | PASS | 43 |
| Nova table model comparison | PASS | 43, 44 |
| Contextual ribbon | PASS | 35, 37, 48 |
| Image insertion | PASS | 47 |
| Nova asset boundary | PASS | 44 |
| Image model | PASS | 44 |
| Inline and floating distinction | PASS | 44, 36 |
| Wrapping and positioning | PASS | 36, 45 |
| Image resize and move | PASS | 47 |
| Shapes | PASS | 38, 47 |
| Shape model | PASS | 44 |
| Text boxes | PASS | 38, 47 |
| WordArt | PASS | 44, 47 |
| Charts | PASS, deferred | 44, 47, 52 |
| Links | PASS | 3, 40 |
| Bookmarks | PASS | 3 |
| Cross-references | PASS | 3 |
| Comments insertion | PASS | 3 |
| Header, footer and page number insertion | PASS, deferred | 3, 14 |
| Equations | PASS, deferred | 52 |
| Symbols | PASS | 3 |
| Cover page | PASS, deferred | 3, 14 |
| Blank page and page break | PASS | 3 |
| Drag and drop | PASS | 39 |
| Clipboard fidelity | PASS | 40–42 |
| Object selection | PASS | 35, 48 |
| Object history | PASS | 47 |
| Compatibility matrix | PASS | 43 |
| Schema-pressure matrix | PASS | 43, 44 |
| Responsive Insert requirements | PASS | 32 of 005B0A, 12 of 005B0B |
| 005B2 boundary | PASS | 45 |
| Provenance | PASS | 46 |

## 50. Page-model deferrals

These depend on 005B0D or a later page model and are not in 005B2: floating tables, positioned tables, repeat header across pages, advanced wrapping, page-relative images, page-relative shapes and text boxes, WordArt placement, headers and footers, page numbers, cover pages and section breaks.

## 51. Object schema consistency

- Persistent: asset ID or payload, geometry, size, rotation, wrap mode, anchor, fill and stroke, contained text or object payload.
- Layout-derived: DOM rectangles, wrap obstacle geometry, runtime page coordinates.
- UI-only: current selection, resize handles, hover state, drag state.

Section 44 and this list agree.

## 52. Charts and equations: deferral

**Charts** are deferred. Upstream stores a chart as a `docProtected` node with `genChart` and `chartDisplay` payloads, and edits it through `setNodeMarkup`. Nova needs a chart schema decision, a rendering and export dependency, and a data-edit model before it can support charts. None of these is required for first-wave professional Insert.

**Equations** are deferred. Upstream uses `latexToOmml` and `ommlToMathML` with a protected block and an inline math node. Nova needs a math schema and a MathML rendering path. This is a v2 item.

Both remain in the long-term professional target.

## 53. Status

TPI-NOVA-005B0C is **COMPLETE** for the documentation scope of this pass. Every Section 27 item is resolved or classed, and the directive audit passes. No professional editor implementation was started.

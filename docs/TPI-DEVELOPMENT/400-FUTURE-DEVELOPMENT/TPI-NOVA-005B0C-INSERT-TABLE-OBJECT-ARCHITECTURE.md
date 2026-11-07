# TPI-NOVA-005B0C — GenOffice Insert, Table, Image and Object Architecture

**Status:** Architecture and source analysis only. No GenOffice source ported. No Nova product code, schema, assets, packages or toolbars changed. Production untouched.

**Parent:** TPI-NOVA-005B0
**Predecessor:** TPI-NOVA-005B0B with runtime addendum at `20102c80`
**TPI baseline:** `20102c80`
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
- Indexed by export list only, not fully traced: `table-ops.ts` internals, `table-sizing.ts`, `table-geometry.ts`, `table-handle.ts`, the drag plugins, `TablePropertiesDialog.tsx`, `TableDialogs.tsx`, `wrap-obstacles.ts`, `hf-float-edit.ts`, `field-codes.ts`, `trailing-table-exit.ts`, and the contextual Table Design/Layout ribbon. These are listed as open items in section 19, not as complete findings.
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
| Split / merge cells | Not confirmed in the modules indexed (`table-ops.ts` internals not fully read) | Open item | Absent |
| Row height, column width | `table-sizing.ts` (not fully read); `setTableAutoFit` writes `widthPx`, `colWidthsPct`, per-cell `colwidth` | Table and cell attrs | Resize disabled (`resizable: false`) |
| Autofit | `contents` / `window` / `fixed` | `tblAutoFit` | Absent |
| Table alignment and floating | `tblAlign`, `tblFloat*` | Table attrs | Absent |
| Borders | `TABLE_BORDER_MENU`: bottom, top, left, right, none, all, outer, inner, insideH, insideV, tl2br, tr2bl. `setSelectionBorders` applies to selected cells; a caret applies to the whole table | `borders` attr | Default TipTap table styling |
| Presets | `applyTablePreset`; `setTableLookOption` | Table attrs | Absent |
| Header row and repeat | `toggleRepeatHeaderRows` | Row attr | Header row only |
| Cell alignment | Not confirmed in indexed modules | Open item | Absent |
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

Rotation: `image-rotation.ts` (`pictureTransformFns`, quarter-turn margins, `pictureLayerDecls`). Crop and cutout were not found in the indexed modules; treat as absent.

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
| Alt text | Not confirmed in indexed attributes | Absent | v1 extension possible |
| Object identity | Not a stable ID; position-based | Absent | Requires asset ID |
| Z-order | `layers` plus `floating-z-order.ts` | Absent | v2 |
| Source | `dataUrl`, verbatim `xml` | Absent | Replace with asset ID (section 5.2) |

## 7. Floating objects, positioning and wrapping

- `floating-z-order.ts`: `ImageWrap` modes include front, behind, topBottom, square-left and square-right. Tight and through are normalised to square. Functions: `boxWithZ`, `setFloatingWrap`, `bringToFront`, `bringForward`, `sendBackward`, `sendToBack`.
- `wrap-group.ts`: `wrapGroupCss` for the CSS wrap grouping.
- `wrap-obstacles.ts` (922 lines): computes obstacle geometry for text flow. Only its exports were indexed, not the body.
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
| URL validation | Not confirmed in the modules indexed | Not confirmed |
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

## 27. Open items (not fully traced)

- `table-ops.ts` internals: split and merge cells, cell alignment, exact row and column commands.
- `table-sizing.ts`, `table-geometry.ts`, `table-handle.ts`: sizing internals, drag handles.
- `table-column-drag.ts`, `table-row-drag.ts`: drag plugins.
- `TablePropertiesDialog.tsx`, `TableDialogs.tsx`: dialogs.
- Table Design and Layout contextual ribbon activation.
- `wrap-obstacles.ts` body; `hf-float-edit.ts` body; `field-codes.ts` body; `trailing-table-exit.ts`.
- Image replacement, picture contextual ribbon, crop.
- Shape stroke, rotation and inner text.
- Drag and drop of non-image files and objects.
- Copy and paste fidelity for tables, images, links, shapes, text boxes.

These need a follow-up source pass before any 005B2 implementation planning for those areas.

## 28. Provenance

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

## 29. Checks and documentation status

- Source-only: no GenOffice code copied, no packages added, no Nova product code, schema, assets, toolbar or CSS changed.
- No EE source referenced as adoption material.
- No screenshots or scratch clone committed.
- Browser runs: none in 005B0C.

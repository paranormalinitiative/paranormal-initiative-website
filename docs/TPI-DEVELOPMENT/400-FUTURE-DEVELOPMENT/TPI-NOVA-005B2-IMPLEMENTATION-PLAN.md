# TPI-NOVA-005B2 — Professional Insert Implementation Plan

**Status:** PLANNING COMPLETE (005B2P). No implementation started.
**Architecture baseline:** `b2585ca0` (TPI-NOVA-005B0C closure).
**GenOffice reference snapshot:** `d5ebe838d91373c54528795b50663d4f33947183`.
**Scope of this document:** current Nova readiness audit and an implementation plan for the 005B2 first wave. Nothing here changes product code, document JSON, schema, packages, assets, APIs, migrations or production.

**DO NOT IMPLEMENT 005B2 YET.**
**DO NOT ADD PACKAGES.**
**DO NOT CHANGE NOVA DOCUMENT JSON YET.**
**DO NOT ADD DATABASE MIGRATIONS.**
**DO NOT DEPLOY.**

Labels used below: **SOURCE-CONFIRMED** (read in the current repository), **SOURCE-INFERRED** (follows from confirmed source but not executed), **NOT IMPLEMENTED UPSTREAM**, **DEFERRED**.

## 1. Current Nova Readiness

SOURCE-CONFIRMED evidence:

- Nova editor extensions are StarterKit, `@tiptap/extension-link`, `@tiptap/extension-underline`, and `@tiptap/extension-table` with `resizable: false`, plus `TableRow`, `TableHeader`, `TableCell`. Dependencies are in `nova-app/package.json`.
- No Nova source file defines or imports an image, bookmark, field, symbol, page-break, `pageBreakBefore`, or cross-reference extension. A search of `nova-app/src` returned no such matches.
- The publication renderer `lib/nova-document-html.js` renders only: paragraph, heading, bulletList, orderedList, listItem, blockquote, horizontalRule, table, tableRow, tableHeader, tableCell, hardBreak, and the bold, italic, underline and link marks. Any other node is not rendered.
- Persistence is a JSON envelope in `nova_items.content_json` with `format_version` (currently only `1` is supported, `lib/nova.js`). Revisions are in `nova_revisions` (retention 50). Document limit is 512 KiB (`lib/nova-limits.js`).
- Uploads: the R2 binding `TPI_MEDIA` is used by existing media routes (`makeMediaKey`, `handleMediaUpload`, `/api/media/${key}`). Nova has no upload route or asset reference today.
- Editor sources are duplicated: `nova-app/src/documents/editorExtensions.ts` and `nova-app/src/shared-editor/editorExtensions.ts` are byte-identical. `EditorToolbar.tsx`, `LinkDialog.tsx` and `Modal.tsx` exist in both folders. `DocumentEditor.tsx` (documents) and `NovaEditor.tsx` (shared-editor) each own link state.

Conclusion: Nova is a structured-JSON editor with basic text, lists, simple tables and external links. The 005B2 features (bookmarks, images, fields, symbols, page break, blank page, professional table attributes) are absent and must be added.

## 2. Bookmark Gap

**Claim in 005B0C:** Nova has no bookmark support, so 005B2 needs a node attribute.
**Verified:** Confirmed. No bookmark name, anchor, id, or `#` target handling exists in Nova. Nova's `link` mark only stores `href`. Nova blocks carry no stable identifier attribute. The 005B0C statement holds.

**Existing stable identifier:** none. Nova paragraph and heading nodes have no `id`. Creating one is a schema-attribute decision, not a reuse.

**GenOffice behaviour (SOURCE-CONFIRMED in 005B0C):** `bookmarks: string[]` on `docParagraph`, `docHeading` and `docListItem`; `hiddenBookmarks` also exists; naming rule `/^[A-Za-z一-鿿_][\w一-鿿]*$/`; duplicates rejected; one `setNodeMarkup` per action.

**Options evaluated:**

| Option | Description | Assessment |
|---|---|---|
| A. Node attribute | `bookmarks` (string array) on paragraph, heading, list item | Matches GenOffice, simple, optional attribute. Name is the target. Needs a document-level duplicate check. |
| B. Stable ID + map | Block gets `id`; document keeps `bookmarks: {name: id}` | Survives renames of text, but adds a second identifier system and a document-level map that must stay in sync. |
| C. Mark or dedicated node | Inline mark or `bookmark` node at a point | Anchors a point not a block. Heavier for TipTap, unnecessary for paragraph/heading/list-item targets. |

**Recommendation: Option A**, a `bookmarks` node attribute on paragraph, heading and list item, with a stable `id` added only when cross-references need it (see below). This is the smallest change and matches the accepted architecture.

**v1 compatibility (SOURCE-INFERRED):** Adding an optional attribute with default `[]` keeps `nova-document` format version 1. Old documents load with the default. The serializer writes the attribute only when non-empty. No migration is required. Renderer impact: bookmarks produce `id` attributes in HTML, which must be sanitised and must not create duplicate ids in one publication.

**Validation rules to implement:**

- Empty names: rejected.
- Duplicate names within a document: rejected (case-sensitive comparison, as in GenOffice's model; to be decided and tested).
- Spaces and punctuation: rejected by the GenOffice pattern (`[A-Za-z_][A-Za-z0-9_]*` with Unicode letters).
- Case: case-sensitive storage, case-insensitive uniqueness recommended to avoid ambiguous targets. Decide before 005B2A.
- Rename: no rename command in 005B2; remove then re-create.
- Deleted target: a link or cross-reference to a removed bookmark must show a visible broken state, not silently fail.

**Cross-reference compatibility:** A bookmark name is the reference target. Heading, paragraph and numbered-item references need the bookmark on that block (available with Option A). Displayed reference text and dirty state are separate attributes added later (005B3). Option A does not block them.

**Preservation:** Bookmarks live in the document JSON, so they travel through autosave, revisions, submission, approval and publication snapshots with no storage change. Publication must emit ids only if the renderer is extended (see Section 9).

## 3. Table Gap

**Current Nova (SOURCE-CONFIRMED):** `Table` is configured with `resizable: false`. Row, header and cell nodes exist. The publication renderer renders tables without width, border, shading or alignment attributes. `MAX_TABLE_COLS` 63 and `MAX_TABLE_ROWS` 200 and `MIN_TABLE_COLUMN_PX` 40 are GenOffice limits from 005B0C, not Nova limits.

| Capability | Status in Nova | Classification |
|---|---|---|
| Insert table | Table extension present; command not wired to a Nova UI | Nova-native (TipTap command) |
| Add/delete row | TipTap commands exist; no Nova UI | Nova-native |
| Add/delete column | TipTap commands exist; no Nova UI | Nova-native |
| Merge cells | TipTap `mergeCells` requires `colspan`/`rowspan` attributes on cells | Attribute extension required |
| Split cells | TipTap `splitCell` requires the same attributes | Attribute extension required |
| Column width / grid | `resizable: false`; no width attribute | Attribute extension + custom command |
| Row height | No attribute | Attribute extension required |
| Table width, alignment, indent | No attribute | Attribute extension required |
| AutoFit mode | No attribute | Custom command required |
| Vertical cell alignment | No attribute | Attribute extension required |
| Borders (style, width, colour) | No attribute | Attribute extension + custom command |
| Shading | No attribute | Attribute extension required |
| Cell margins | No attribute | Deferred to page model |

**Dependency order (SOURCE-INFERRED, to confirm in 005B2B):** 1. attributes on table, row and cell (with defaults so old JSON loads unchanged); 2. central table commands; 3. insert and delete; 4. merge and split; 5. sizing; 6. alignment; 7. borders and shading; 8. AutoFit; 9. contextual Table Design and Table Layout ribbon. The order holds because each later step reads attributes defined by an earlier step.

**Constraint:** Merge and split must go through one Nova command each, creating one Undo step per completed command.

## 4. Image Gap and TPI Asset Discovery

**Current Nova (SOURCE-CONFIRMED):** no image node, image extension, upload route, paste handler or asset reference exists.

**Existing TPI infrastructure (SOURCE-CONFIRMED):**
- R2 binding `TPI_MEDIA` with `put` and `httpMetadata.contentType`.
- `makeMediaKey(area, username, filename, contentType)` and `handleMediaUpload` (`functions/api/[[path]].js`) enforce a content-type allow-list such as `image/`.
- Existing public URL form is `/api/media/${key}`.
- Media rows are recorded with `recordMemberUpload`.
- Studio Notes stores private attachments in `TPI_MEDIA` with `ownerId`, `noteId`, `attachmentId` metadata, using `cache-control: private, no-store`.

Prefer reuse of `TPI_MEDIA` and its key scheme. Do not create a new asset service in 005B2.

**Proposed image reference model (SOURCE-INFERRED):**
- Node `image` (inline) with attributes: `assetId` (the TPI media key or asset row id), `alt`, `width`, `height`, `naturalWidth`, `naturalHeight`, `caption` (optional), `alignment` (`inline`). No base64, blob URL, local path or expiring upload URL is stored.
- The renderer resolves `assetId` to the published asset URL at publication time, and the publication snapshot stores the resolved reference so later asset changes cannot alter a published page silently.
- Authorization: Contributor uploads are owner-scoped. Publication must confirm the asset is public or copied into the publication scope before the snapshot is accepted.

**Image publication safety:** autosave and revisions store only the `assetId`. Submission and approval store the same JSON. Publication validates that every referenced asset exists, is an allowed image type, and is accessible. A missing asset blocks publication with a specific error.

**Scope:** inline images only. No floating or page-relative coordinates in 005B2.

## 5. Link Gap

**Current Nova (SOURCE-CONFIRMED):** `link` mark with `autolink`, `linkOnPaste`, `openOnClick: false`. `NovaEditor.tsx` and `DocumentEditor.tsx` use `setLink` and `unsetLink` with `extendMarkRange('link')`, so insert and remove already work. `LinkDialog` accepts a URL. The publication renderer emits `<a rel="noopener noreferrer nofollow">` for a `href`.

| Requirement | Status |
|---|---|
| Insert | Present |
| Edit (selected-link detection) | Present in `NovaEditor`; confirm in `DocumentEditor` (duplicate code) |
| Remove | Present |
| Display text | Partly: link wraps selected text only |
| External URL | Present |
| Unsafe protocol rejection (`javascript:`, `data:`) | UI: SOURCE-CONFIRMED. `LinkDialog` accepts only `http(s):`, `mailto:`, `tel:`, or adds `https://` to bare domains. Renderer: NOT CONFIRMED; `renderInline` emits any `href` it receives. Server-side protocol check is required before 005B2A |
| Internal `#bookmark` targets | Absent; depends on Section 2 |

**Connection (SOURCE-INFERRED):** keep one `link` mark. Internal targets use an `href` of `#<bookmark>` resolved against the document's bookmarks. This avoids a second linking system.

## 6. Symbols

GenOffice inserts 50 fixed symbols as ordinary text (SOURCE-CONFIRMED in 005B0C, `ribbon-insert-tab.tsx` 63–114).

**Recommendation: Option A, adapt the same fixed set as ordinary text.** No symbol node. Provenance: the table of 50 characters is a data list, so its origin is recorded in the attribution section (Section 14) before adoption. Option B (a separate TPI professional set) is not needed for 005B2.

## 7. Page Break and Blank Page

**Current Nova (SOURCE-CONFIRMED):** no `pageBreak`, `pageBreakBefore`, hard section break or pagination marker exists in Nova. The only break is `hardBreak` (a line break).

**Representation options:**

| Option | Assessment |
|---|---|
| Dedicated `pageBreak` node | Works, but is a block that must be handled by every renderer and list/table rule. |
| `pageBreakBefore` paragraph attribute | Matches GenOffice blank page; optional attribute, no schema version change. Needs pagination to be meaningful. |

**Blank page:** GenOffice inserts a paragraph with `pageBreakBefore` and a spacer fallback (005B0C). Nova must not fake a blank page with repeated empty paragraphs. The eventual Nova form is page-break driven, which depends on the page model.

**Decision gate:** The page-break representation cannot be chosen safely until 005B0D defines pagination. Page break and blank page are therefore **005B2 planned, implementation blocked on 005B0D**. Recommended provisional choice, to be confirmed by 005B0D: `pageBreakBefore` attribute.

## 8. Fields (DATE, TIME, FILENAME)

**Current Nova (SOURCE-CONFIRMED):** no field node, dynamic text, protected field or calculated-text system exists. A search for `DATE` and `FILENAME` in `nova-app/src` finds only date-formatting helpers in `lib/format.ts`, which are for display in the UI and not document content.

**Model (SOURCE-INFERRED):** an inline `field` node with `fieldType` (`date`, `time`, `filename`) and optional `format`. Store only the semantics. The displayed value is generated when rendered and is not the stored truth. This keeps future updates possible.

**FILENAME semantics:** Nova does not have an operating-system file. `FILENAME` means the logical Nova document title (`nova_items.title`), not a path. This must be stated in the product copy and the field must update when the title changes.

**Gap:** no field extension, no rendering, no update rule. DATE and TIME are time-dependent, so publication must fix the value at publication time and record it in the snapshot.

## 9. Command Layer

No command layer exists in `nova-app/src` for Insert. Components call TipTap chains directly (`NovaEditor.tsx`, `DocumentEditor.tsx`). 005B2 should introduce commands in one module per domain so components do not write storage or JSON directly.

Proposed commands (names only; implementation later):

- Images: `insertInlineImage`
- Tables: `insertTable`, `addRow`, `deleteRow`, `addColumn`, `deleteColumn`, `mergeCells`, `splitCells`, `setTableWidth`, `setRowHeight`, `setCellAlignment`, `setBorders`, `setShading`, `setAutoFit`
- Links: `setLink`, `editLink`, `unsetLink`
- Bookmarks: `createBookmark`, `removeBookmark`, `navigateBookmark`
- Insert utilities: `insertSymbol`, `insertPageBreak` (blocked), `insertBlankPage` (blocked), `insertField`

## 10. History

Rule: one user command or completed gesture is one logical Undo step. Planned for: insert image; resize image (if supported); merge cells; split cells; row and column insert or delete; border application; shading; AutoFit; bookmark create or remove; field insert. Each command must dispatch one transaction, which TipTap groups by default. Known GenOffice history defects in 005B0C are not to be copied.

## 11. Autosave, Versioning and Locks

SOURCE-INFERRED: no 005B2 feature requires changes to `expectedVersion`, the autosave serialisation contract, `nova_revisions`, article metadata, submission locks, approval locks or publication snapshot structure. All features mutate document JSON and flow through the existing save path. Any feature that needs a storage exception must be called out before its tranche starts. None is currently identified.

## 12. Publication Renderer Gap

`lib/nova-document-html.js` (SOURCE-CONFIRMED):

| Construct | Renders today | Gap |
|---|---|---|
| Basic tables | Yes | No width, border, shading, alignment, colspan/rowspan |
| Inline images | No | Must resolve `assetId` and emit `<img>` with alt, size |
| Bookmarks (ids) | No | Must emit sanitised, unique `id` attributes |
| Links | Yes | Protocol check missing on render (Section 5) |
| Symbols | Yes, as text | None |
| Page break | No | Blocked on 005B0D |
| Fields | No | Must render stored value and fix DATE/TIME at publication |

Professional features are not complete until the publication snapshot can represent them safely. Renderer changes are part of each tranche, not a later pass.

## 13. Legacy Boundary

SOURCE-CONFIRMED: Legacy articles keep HTML bodies. `handleArticleNovaLink` only links a Nova document after conversion, and the Nova editor is the only place that writes structured JSON. SOURCE-INFERRED: no 005B2 feature changes the Legacy path. Professional structures are added only to Nova documents. The Legacy HTML editor is not extended.

## 14. Editor Convergence

SOURCE-CONFIRMED: `nova-app/src/documents/` and `nova-app/src/shared-editor/` duplicate `editorExtensions.ts`, `EditorToolbar.tsx`, `LinkDialog.tsx` and `Modal.tsx`.

**Plan (no refactor in planning):**
1. Make `shared-editor/editorExtensions.ts` the single schema authority. `documents/editorExtensions.ts` becomes a re-export. Must be done in its own tranche (005B2A), before new nodes are added, so each new node is added once.
2. Merge the duplicate `LinkDialog` and `Modal` next, with the protocol check.
3. Keep `EditorToolbar` duplicates until the Insert and Table ribbons exist, then converge them.

Adding 005B2 nodes to two schema files would multiply the drift, so step 1 is a prerequisite.

## 15. GenOffice Adoption Map

| Capability | Adoption | Notes |
|---|---|---|
| Bookmark data model | Logic adaptation | `bookmarks` attribute semantics and naming rule; Nova components |
| Symbol set (50) | Direct data adaptation | Data list; provenance recorded (Section 16 (Attribution Impact)) |
| Insert link behaviour | Nova-native | TipTap `link` mark already present |
| Table commands | Nova-native + logic reference | TipTap table commands; GenOffice merge/split/AutoFit as behaviour reference |
| Table attributes | Logic adaptation | Attribute names and defaults |
| Image reference model | Reference only | Nova-specific `assetId` design |
| Fields | Reference only | GenOffice `ai/field-ops.ts` and DATE/TIME handling are not copied |
| Page break / blank page | Reference only | Depends on 005B0D |
| Ribbon contextual tabs | Reference only | Nova components |

No GenOffice source is copied verbatim. No `ee/` code is reused.

## 16. Attribution Impact

Modules that adapt GenOffice logic or data require attribution before source work starts: the 50-symbol list; the bookmark naming rule; table limit constants if adopted. No attribution file is created in planning. The list must be added to `THIRD-PARTY-NOTICES.md` in the 005B2A tranche if any adoption is confirmed.

## 17. Implementation File Map

Final paths must match the actual Nova structure. Proposed (not created):

- `nova-app/src/shared-editor/editorExtensions.ts` (authoritative schema, extended in 005B2A and later)
- `nova-app/src/documents/editorExtensions.ts` (re-export after convergence)
- `nova-app/src/shared-editor/commands/insertCommands.ts`
- `nova-app/src/shared-editor/commands/tableCommands.ts`
- `nova-app/src/shared-editor/commands/linkCommands.ts`
- `nova-app/src/shared-editor/extensions/bookmark.ts`
- `nova-app/src/shared-editor/extensions/field.ts`
- `nova-app/src/shared-editor/extensions/novaImage.ts`
- `nova-app/src/shared-editor/extensions/tableAttributes.ts`
- `nova-app/src/documents/ribbon/InsertTab.tsx` (location to confirm against the current toolbar)
- `nova-app/src/documents/ribbon/TableDesignTab.tsx`, `TableLayoutTab.tsx` (contextual)
- `lib/nova-document-html.js` (renderer extensions)
- `lib/nova.js` (validation of `assetId`, bookmark names, link protocols)

## 18. Tests

**Unit and source tests:** serialisation round-trip; bookmark name validation and uniqueness; table attribute defaults and old-document loading; field semantics; image asset reference validation; URL protocol safety.

**Browser (Firefox Developer Edition authoritative):** image insert and reload; table insert, edit and reload; merge and split; row and column operations; borders and shading; AutoFit; link edit and remove; bookmark navigation; symbols; field insertion; Undo and Redo; autosave and reload; revision creation; publication preview.

**Chromium:** secondary compatibility pass.

## 19. Fixtures

Disposable fixtures only. Do not use ITC Ethics, `local-ops011-article`, the retained orphan Nova document, or real Contributor content. Cleanup: delete the disposable Nova item and its revisions through the owner-scoped API after each run, and confirm the R2 test objects are removed.

## 20. 005B0D Dependency Gate

**Safe before the page model (005B0D):**

- core table schema attributes and commands (insert, row/column insert and delete, merge, split, width, row height, alignment, borders, shading, AutoFit)
- inline images referencing TPI assets
- links (insert, edit, remove)
- symbols, as ordinary text
- bookmarks, using the optional block attribute from Section 2
- DATE, TIME and FILENAME fields

**Blocked on 005B0D:**

- simple page break (provisional `pageBreakBefore` paragraph attribute; final choice confirmed by 005B0D)
- blank page (must be page-model driven, never repeated empty paragraphs)

Status: **005B2 planned; Page Break and Blank Page implementation blocked on 005B0D.**

## 21. Implementation Tranche Recommendation

The recommended order is not accepted automatically; it follows the current source dependencies found above.

- **TPI-NOVA-005B2A:** bookmark, link, field and Insert command foundation, together with editor convergence (Section 14), so that new nodes are added to one schema authority only.
- **TPI-NOVA-005B2B:** professional table schema attributes and central table commands (insert/delete, merge/split, sizing, alignment, borders, shading, AutoFit), in the dependency order from Section 3 of this plan.
- **TPI-NOVA-005B2C:** contextual Table Design and Table Layout ribbon, which depends on 005B2B commands and the active-table state.
- **TPI-NOVA-005B2D:** inline image and TPI asset integration, which depends on the asset-reference contract (Section 4) and on publication snapshot resolution.
- **TPI-NOVA-005B2E:** symbols polish, simple page break and blank page, implemented only after 005B0D confirms the page model.

Each tranche must end with the Section 18 browser checks for the features it introduces, the publication renderer updated for those features (Section 12), and a documentation completion record.

## 22. Risk Register

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| 1 | Bookmark attribute conflicts with future cross-reference model | High | Medium | Keep bookmark names as plain strings on blocks; design cross-references as separate reference nodes that resolve by name; validate names with the 005B0C regex before storage |
| 2 | Page break representation conflicts with the 005B0D page model | High | Medium | Do not implement Page Break or Blank Page before 005B0D; keep the provisional attribute isolated |
| 3 | Duplicated editor sources in `documents/` and `shared-editor/` diverge | High | High | Converge on `shared-editor/editorExtensions.ts` in 005B2A before adding nodes (Section 14) |
| 4 | Image asset not accessible to readers after publication | High | Medium | Resolve and snapshot asset references at publication; test public render on the published origin |
| 5 | Table JSON from before 005B2 fails to load or renders differently | High | Low | All new table attributes optional with defaults; add old-document load tests in 005B2B |
| 6 | Publication renderer does not match the editor | Medium | High | Renderer gap matrix (Section 12) is a completion gate for each tranche |
| 7 | Contextual Table tabs show for the wrong selection | Medium | Medium | Derive active-table state from the editor selection only; test enter, leave and nested selection in Firefox |
| 8 | Undo granularity wrong for compound operations | Medium | Medium | One gesture equals one Undo step (Section 10); test each multi-step operation |
| 9 | Ribbon bundle size grows too much | Low | Medium | Load contextual Table tabs lazily with the editor; measure bundle before and after |
| 10 | GenOffice provenance or attribution omitted | High | Low | Record attribution per Section 16 before any adapted source is committed |
| 11 | Unsafe link protocols or internal targets | High | Low | Keep the protocol allowlist (http, https, mailto, tel) and add `#bookmark` targets only after name validation |

## 23. Documentation

This planning pass creates one document: `docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-NOVA-005B2-IMPLEMENTATION-PLAN.md`. No source, schema, CSS, asset, API, database, migration, package or deployment change is part of this pass. The plan is committed as `docs(nova): plan professional Insert implementation` and pushed to `origin/codex/tpi-development`.

Checks run for this pass: `git diff --check` and a tree-status check before and after the commit. No build, unit test or browser test was run, because the pass changes documentation only.

## 24. Production

**UNCHANGED.** No deploy, release or production data operation was performed.

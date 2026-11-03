# TPI Nova — Product Family Architecture and Roadmap

Effective: 2026-11-02
Status: **ARCHITECTURAL DECISION — RECORDED, NOT IMPLEMENTED**
Authority: owner decision recorded by TPI-DOCS-ROADMAP-001

This record preserves the Nova product-family decision so a future agent can
resume without chat history. It authorizes **no** application change. Nothing
here is implemented, renamed, deployed, or migrated.

The canonical development sequence lives in
[`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md).
This record describes **what** Nova is; that record describes **when** each
part is built.

Which capability family owns which Nova surface — Nova Edit under Creator, the
Nova Editorial Workspace, Nova Docs, and Nova Slides under Contributor, and the
union of both for Creator + Contributor holders — is recorded in
[TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md](TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md)
(TPI-GOVERNANCE-003A). That policy does not activate any Nova product; Nova
remains unbuilt and unavailable.

---

## 1. What Nova is

**Nova** is The Paranormal Initiative's unified document and presentation
creation technology. It has two principal product experiences built on one
shared core:

```
                        Nova Core
            (shared document + presentation engine)
                            |
        +-------------------+-------------------+
        |                                       |
StudioFlow Nova Edit                 Nova Editorial Workspace
(streamlined production)             (full professional)
        |                                       |
  - Nova Edit Documents                 - Nova Docs
  - Nova Edit Slides                    - Nova Slides
```

One document engine. One slide engine. Two interfaces with different depth,
permissions, and audiences.

The purpose of the split is that a Creator producing a livestream should not
need editorial authority, and an editorial Contributor writing a research paper
should not need StudioFlow production access. Both should use the same
underlying technology so content can move between them.

---

## 2. StudioFlow Nova Edit

**StudioFlow Nova Edit** is the **streamlined production edition of Nova**. It
is where the existing StudioFlow Notes workspace is going, and it is more than a
rename: Notes becomes the document half of a small production authoring suite.

Nova Edit lives inside StudioFlow and is available to Creators. It must **not**
require Education Center editorial authority.

### 2.1 Nova Edit Documents

Production-oriented writing for:

- scripts,
- show notes,
- podcast notes,
- webinar scripts,
- livestream scripts,
- recording scripts,
- talking points,
- production planning,
- research notes,
- class outlines,
- episode planning.

It builds on the completed Notes infrastructure rather than replacing it:
folders, collections, search, autosave, version history, projects, rich text,
and organization are already shipped and remain the foundation.

### 2.2 Nova Edit Slides

Creators must be able to author presentations for their own productions. A
Creator producing **Ghost Hunting 101** should be able to open
`StudioFlow → Nova Edit → New Presentation` and build slides for a webinar, a
livestream, or a recording.

Expected direction for the streamlined editor:

- presentation creation,
- basic templates,
- slide thumbnails,
- slide canvas,
- text,
- images,
- shapes,
- layouts,
- backgrounds,
- basic typography,
- alignment,
- speaker notes,
- duplicate / reorder,
- presentation preview,
- PPTX import and export where technically practical,
- PDF export.

Nova Edit Slides is deliberately smaller than Nova Slides. It exists to get a
production on screen, not to produce a conference deck.

---

## 3. Nova Edit → StudioFlow integration

The intended production workflow:

```
Nova Edit Presentation  →  Add to Production  →  Webinar | Livestream | Recording
```

A presentation should eventually become a first-class StudioFlow production
resource, conceptually alongside:

- Scene
- Teleprompter
- Video
- Music
- Timer
- **Presentation**

A Creator builds slides and then presents them directly during a StudioFlow
production, without exporting a file and re-uploading it.

This is the integration that makes Nova Edit worth having inside StudioFlow. It
is sequenced late because it depends on the Nova Core presentation model
existing first.

---

## 4. Nova Editorial Workspace

**Nova Editorial Workspace** is the **full professional edition of Nova**.

Primary intended users:

- Contributors,
- editorial members,
- Dual / All-Access members,
- authorized TPI staff,
- administrators.

It shares the same underlying Nova technology as Nova Edit. It must not become
an unrelated editor with its own document model. The difference between the two
products is interface depth and permissions, not the format.

---

## 5. Nova Docs

**Nova Docs** is the advanced professional document editor inside Nova Editorial
Workspace.

Primary use cases:

- research papers,
- Education Center articles,
- Ghostology material,
- course material,
- lessons,
- investigation reports,
- publications,
- professional community content,
- reference documents,
- webinar supporting documents.

The goal is a genuine professional word-processing experience. Planned
direction:

- fonts and font sizing,
- paragraph formatting,
- headings,
- document outline,
- lists,
- tables,
- images,
- captions,
- links,
- quotations,
- page breaks,
- alignment,
- indentation,
- spacing,
- citations and references,
- find / replace,
- undo / redo,
- word count,
- autosave,
- version history,
- templates,
- comments and review capability,
- DOCX import,
- DOCX export,
- print-quality output.

The published research-paper rules still apply to submitted papers: the rejected
headings listed in [`../../../TPI_NEXT_BUILD_TASKS.md`](../../../TPI_NEXT_BUILD_TASKS.md)
must not be reintroduced by the editor's templates.

---

## 6. Nova Slides

**Nova Slides** is the professional presentation editor inside Nova Editorial
Workspace, and the full counterpart to Nova Edit Slides.

Expected long-term capability:

- blank presentations,
- professional templates,
- slide thumbnails,
- slide canvas,
- text boxes,
- images,
- shapes,
- backgrounds,
- themes,
- typography,
- alignment guides,
- object ordering,
- multiple selection,
- speaker notes,
- reorder / duplicate,
- presentation preview,
- PPTX import,
- editing imported PPTX,
- PPTX export,
- PDF export.

---

## 7. PDF policy

**Recorded decision:** Nova does **not** require a standalone PDF editor.

PDF support is **export-only** — an output capability, never an editor:

- `Nova Docs → Export as PDF`
- `Nova Slides → Export as PDF`

Advanced PDF editing is **not** on the active roadmap. It may be reconsidered
later if a genuine use case appears. It must not be added to Nova as a
side-quest.

---

## 8. Nova AI policy

**AI is not required for Nova's initial development.**

Users may use external AI tools and:

- copy and paste content,
- import documents,
- import presentations.

Nova must be a strong editor **without** AI. Potential AI assistance may be
considered later, but it must never delay:

- Nova Edit,
- Nova Docs,
- Nova Slides,
- Education Center workflow.

---

## 9. GenOffice as an architectural reference

GenOffice (`https://github.com/genspark-ai/genoffice`) has been identified as a
**potentially valuable architectural and component reference** for the future
evaluation phase. It is a reference to evaluate, not a decision to adopt.

Relevant areas to evaluate later:

### Docs

- Tiptap,
- ProseMirror,
- DOCX architecture,
- document rendering,
- formatting systems,
- import / export,
- reusable React components.

### Slides

- React,
- Konva / react-konva,
- PPTX parsing and rendering,
- slide canvas,
- element positioning,
- text and image handling,
- presentation model,
- import / export.

Also evaluate the shared foundation rather than the two apps separately:
`packages/*`, editor architecture, rendering, undo/redo patterns, and testing
patterns.

Constraints:

- GenOffice's main code is **Apache 2.0**; any reused or adapted code must
  preserve the applicable licensing and NOTICE requirements, and
  `THIRD-PARTY-NOTICES.md` must be updated before any code is merged.
- The `ee/` directory is **not** Apache 2.0. Everything under `ee/` is covered
  by the separate **GenOffice Enterprise License**; production use, hosted-
  service use, or distribution of that Enterprise Software requires a valid
  enterprise agreement. TPI must never reuse `ee/` code in production unless
  separately licensed and explicitly authorized. Inspecting `ee/` to
  understand a concept is acceptable; copying it is not.
- Do **not** use GenOffice or Genspark trademarks or branding.
- Do **not** assume the whole desktop/Electron product can be embedded in TPI.
  The evaluation must determine what is usable inside TPI's web architecture.
- GenOffice **Sheets**, GenOffice **AI**, the full **PDF editor**, and the
  **desktop shell** are currently **not required**.

The evaluation is a roadmap phase (§11, step 5), not a task under this record.

---

## 10. Education Center workflow

The full Nova Editorial Workspace will eventually integrate with the Education
Center:

```
Create → Write → Format → Preview → Choose Destination → Metadata → Submit / Review / Publish
```

Contributors should never need to understand:

- internal routes,
- HTML paths,
- repository paths,
- database IDs,
- deployment mechanics.

Nova handles those details. The contributor chooses a destination and supplies
metadata; the platform does the rest.

### 10.1 Permission separation

**Nova access and publishing authority are not identical.** Potential permission
layers:

| Layer | Capability |
|---|---|
| Author | can create professional content |
| Submitter | can submit material for Education Center consideration |
| Editor | can review and edit authorized educational content |
| Publisher | can publish / unpublish official Education Center material |
| Administrator | can manage broader editorial permissions and configuration |

A Dual / All-Access member receives Creator **and** Contributor capabilities.
That does **not** automatically grant unrestricted administrative authority over
every live Education Center item. Membership entitlement and publishing
authority remain separate concerns.

---

## 11. Interoperability

A presentation created in `Nova Editorial Workspace → Nova Slides` should
eventually be usable in StudioFlow. A Creator can alternatively create the
presentation directly in `StudioFlow → Nova Edit → Slides`.

Both must ultimately use **compatible underlying Nova formats and models**.

Avoid building two unrelated slide engines. Avoid building two unrelated
document engines. If the two experiences need to diverge later, they diverge at
the interface layer, not at the file format.

---

## 12. Access model

| Membership | Receives |
|---|---|
| Creator | Creator capabilities, StudioFlow access, StudioFlow Nova Edit, production-oriented document creation, production-oriented presentation creation |
| Contributor / Editorial member | Nova Editorial Workspace, professional document capabilities, professional presentation capabilities, Education Center workflow appropriate to editorial permissions |
| Dual / All-Access | both of the above through one account: StudioFlow, StudioFlow Nova Edit, Nova Editorial Workspace, Nova Docs, Nova Slides, applicable Education Center workflow |

**Cumulative entitlements are a permanent requirement.** A Dual account must
hold both sets simultaneously. One membership must never overwrite another, and
combining Creator and Contributor must not silently drop either capability set.
This becomes a permanent regression requirement for the Creator Incentive
directive.

---

## 13. Product intent — the two example workflows

### 13.1 Creator — "Ghost Hunting 101"

A Creator opens:

```
StudioFlow → Nova Edit → New Presentation
```

They build:

- title slide,
- equipment slides,
- investigation-process slides,
- evidence-example slides,
- closing slide.

They write a script / talking points with `Nova Edit → Document`, then add the
presentation to a **Recording**, **Livestream**, or **Webinar**.

**No Education Center editorial permission is required.**

### 13.2 Contributor — research paper

A Contributor opens `Nova Editorial Workspace → Nova Docs` and:

- formats a research paper,
- creates citations,
- exports DOCX,
- exports PDF,
- submits to the Education Center.

They can build a companion presentation in **Nova Slides** and later send it to
StudioFlow **if** they also hold Creator or Dual access.

---

## 14. Strategic principle

A **Creator** should be able to:

```
write → create slides → produce → record → livestream → present
```

without Education Center editorial authority.

A **Contributor** should be able to:

```
research → write → format → create presentations → submit / edit educational content
```

without necessarily holding StudioFlow production access.

A **Dual** member should be able to do both.

**Nova connects those workflows through one shared creation platform.**

---

## 15. Roadmap position

The canonical sequence is maintained in
[`../../planning/TPI-DOCS-001_MASTER_STATUS.md`](../../planning/TPI-DOCS-001_MASTER_STATUS.md).
The Nova-relevant phases are:

| Step | Phase | Nova relevance |
|---|---|---|
| 1 | TPI-OPS-005 | complete — release engineering, not product |
| 2 | **Creator Incentive + Dual-Member Permissions** | **next**; defines the entitlements Nova depends on |
| 3 | StudioFlow Nova Edit architecture | Nova Core integration with the existing Notes system |
| 4 | Nova Edit Documents + Slides | the streamlined Creator workstation |
| 5 | Nova Editorial Workspace architecture / GenOffice evaluation | establishes the full system and the reusable core |
| 6 | Nova Docs professional editor | professional document authoring |
| 7 | Education Center publishing workflow | create → write → format → submit → publish |
| 8 | Nova Slides professional editor | the advanced presentation environment |
| 9 | Shared Nova → StudioFlow presentation integration | presentations as a production resource |

Steps 10–13 (Founding Membership, Help & Learning Center, Guest / Invite,
Livestream Destinations) are recorded in the master status document.

---

## 16. What this record does not do

- It does not rename Notes in the application.
- It does not implement Nova Edit, Nova Docs, or Nova Slides.
- It does not change Creator or Contributor permissions.
- It does not change Education Center publishing.
- It does not modify StudioFlow.
- It does not add a dependency, a library, or a vendor.
- It does not deploy anything.

It exists so the decisions survive the conversation that produced them.

---

## 17. Shared Nova Core architecture (TPI-NOVA-001C)

**Status:** AUTHORIZED — ARCHITECTURE / DOCUMENTATION ONLY.
Code changes, database changes, dependency installation, production changes
and deployment are **not authorized** by this section.

This section is the authoritative implementation architecture. It builds on
the evidence of TPI-NOVA-001A, 001A1 and 001B:

- StudioFlow Notes (`web-137/src/NotesView.tsx`) is a `contentEditable` editor
  driven by `document.execCommand`, with an HTML body sanitised by a split
  DOMParser/regex path (`NotesView.tsx` line 67; `projectExport.ts` line 153).
- `window.confirm` and `window.prompt` are used throughout `App.tsx`, which is
  about 16,033 lines long.
- StudioFlow uses React 18.3.1, Vite 5.4.11 and TypeScript 5.6.3.
- GenOffice `apps/docs` uses TipTap 3.31.0, React 19.2.4, Vite 7.3.7,
  TypeScript 5.9.3 and Electron 43.x. `apps/slides` uses Konva ^9.3.20 and
  react-konva ^19.0.10.

### 17.1 Primary architecture decision

> **Nova is a separate web application surface with a shared Nova Core. It is
> not built inside the StudioFlow `App.tsx` editor architecture.**

Reasons:

- StudioFlow Core is stable and must not be destabilised by a professional
  editor.
- StudioFlow is on React 18 / Vite 5. Nova must not force a framework upgrade
  onto StudioFlow.
- `App.tsx` is about 16,000 lines and tightly coupled. A professional editor
  inside it would compound that coupling.
- Nova Edit and the Nova Editorial Workspace need the same engines. Those
  engines belong in a shared core, not in one host application.
- StudioFlow integrates with Nova through explicit contracts only (§17.12).

No repository evidence showed that a separate surface is impossible, so the
separate surface is the default.

### 17.2 Product layers

| Layer | Scope |
|---|---|
| **Nova Core** | Shared technical foundation for every Nova product. |
| **Nova Edit** | Creator-facing streamlined editor: Nova Edit Documents and Nova Edit Slides. |
| **Nova Editorial Workspace** | Contributor-facing professional workspace: Nova Docs and Nova Slides. |
| **Integration Layer** | StudioFlow, Education Center, entitlements, storage, and profiles/workspaces where applicable. |

### 17.3 Nova Core responsibilities

Nova Core is shared infrastructure. Its eventual responsibilities are:

- document identity and metadata;
- folder and collection organisation;
- ownership and permissions (§12, and the entitlement layers in
  TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md);
- revision history, autosave, version-guarded writes and draft recovery;
- attachments and asset references;
- undo/redo routing;
- export and import service boundaries;
- templates, typography and media handling;
- document lifecycle, including trash and restore;
- search and entitlement hooks.

Nova Core contains **no** Creator-only or Contributor-only business logic. Those
rules live in the product layers and the entitlement checks.

### 17.4 Notes reuse boundary

**Reuse as infrastructure precedent:**

- owner-scoped APIs;
- version-guarded writes (`expectedVersion`);
- autosave and local draft recovery;
- bounded revision history;
- collection/folder tree;
- attachment handling;
- archive, trash and restore lifecycle;
- the same-origin, private access model.

The persistence history is real: migrations `0055_studioflow_notes.sql`,
`0056_studioflow_note_automatic_titles.sql` and
`0057_studioflow_note_trash_metadata.sql`.

**Do not reuse as the Nova editor foundation:**

- `document.execCommand`;
- raw `contentEditable` as the source of truth;
- an HTML-only document source model;
- `window.prompt` and `window.confirm`;
- the split DOMParser/regex sanitiser.

Notes is the UI-shell and infrastructure precedent. It is not the professional
editor engine.

### 17.5 Nova Documents model

Nova Documents use a **structured document model**. The canonical document is
not unsanitised browser HTML.

Preferred direction: **TipTap / ProseMirror**. Its schema-driven, transactional
model gives validated structure, controlled marks and node types, and reliable
undo/redo. The Notes HTML model lacks those properties: an HTML body is only as
safe as its sanitiser, and only as consistent as the browser's `contentEditable`
behaviour.

The schema should support paragraphs, headings, text marks, lists, links,
images, tables, blockquotes, horizontal rules and page breaks where required,
with room for future comments, revisions, headers, footers and document styles.

### 17.6 TipTap decision status

**TipTap / ProseMirror — PREFERRED CANDIDATE, IMPLEMENTATION GATE REQUIRED.**

Before any implementation, the Nova-002 spike must confirm:

- browser build and runtime in Firefox Developer Edition and Chromium;
- the selected React and Vite versions;
- TypeScript compatibility;
- a basic schema;
- table and image support;
- undo/redo;
- serialization round-trip;
- acceptable bundle size.

Nothing is installed under 001C.

### 17.7 Nova Slides model

Nova Slides use a **structured presentation model**, separate from the canvas
renderer:

```
Presentation → Slides → Elements
```

Elements may include text, images, shapes, lines and connectors, groups and
backgrounds, and later tables and charts. The stored data is the model. Konva
nodes are not the stored data model.

### 17.8 Slide rendering and React-Konva

Preferred canvas technology: **Konva**. The rendering pipeline keeps three layers
separate, following the useful GenOffice separation:

**presentation model → render representation → canvas adapter**

**React-Konva** is an **implementation compatibility gate**. Current React-Konva
releases track React 19, and GenOffice uses them. Do not force StudioFlow to
React 19. Nova may select framework versions compatible with its own application.
That choice belongs to the Nova-002 spike.

### 17.9 Nova as an independent web application

Suggested boundary: **`/nova/`**. The repository already serves `/studio/` as a
static route and keeps `functions/` for the `api` directory, so `/nova/` follows
the same convention. Confirm the route against Worker routing before Nova-002.

Nova owns its application entry, component tree, editor state, styling scope
and tests, and builds behind its own boundary where practical. It may share
authentication and APIs with the TPI website.

Nova must not become a second copy of StudioFlow, a second 16,000-line
component, a rename of Notes, or an Electron port of GenOffice.

### 17.10 Module boundaries

These describe responsibilities only. Names may follow repository conventions,
and no files are created by this section.

- `nova-core`: identity, lifecycle, revisions, autosave, concurrency.
- `nova-documents`: document schema, editor integration, document commands.
- `nova-slides`: presentation model, slide and element operations, canvas adapter.
- `nova-storage`: server persistence (§17.11).
- `nova-assets`: asset references and private media handling (§17.16).
- `nova-export` and `nova-import`: file-format adapters (§17.17).
- `nova-permissions`: entitlement and role checks (§17.18).
- `nova-studioflow-bridge`: the StudioFlow contract (§17.12).
- `nova-education-bridge`: the Education Center contract (§10, §17.18).

### 17.11 Persistence architecture

Nova gets **intentional Nova storage**. Nova-specific tables are preferred over
generalising or overloading `studio_notes`.

- Notes is a single-user note model. Nova Documents and Slides have richer
  structured content and different lifecycle needs.
- Overloading `studio_notes` would make it an accidental universal document
  database.
- Nova still reuses Notes' owner-scoped, versioned API patterns.

No migrations are written under 001C. Final SQL belongs to Nova-003.

### 17.12 StudioFlow bridge

Nova must not be added directly to the current local `ScenePanelItemKind`
implementation as the long-term design. The bridge is a **reference contract**:

```
Nova item → Add to Production → StudioFlow production reference
```

StudioFlow receives a stable reference to the Nova item. It does not own the
whole editor document.

**Add to Production** targets:

- Documents: scripts, show notes, research notes, teleprompter source and
  production references;
- Slides: webinar slides, livestream presentations and recording presentations.

The bridge is not implemented under 001C.

**Technical debt, recorded as a requirement:** StudioFlow production items live
inside the very large `App.tsx` with no shared registry or plugin abstraction. A
shared production-item contract must be introduced and scoped separately before
Nova adds production item types. Nova integration must not worsen this.

### 17.13 Document record and content

Document metadata is kept separate from document content where that helps.

**Document record (conceptual, not final SQL):** id, owner, type, title,
collection/folder, status, version, created, updated, deleted, and template or
source metadata.

**Document content:** structured JSON, stored separately from the record. Revision
snapshots are stored separately from current content. Attachments are referenced,
not embedded. Import provenance is recorded as metadata.

The Notes HTML precedent does not settle the physical storage.

### 17.14 Slide storage and revisions

Nova Slides persist the **presentation model**: deck metadata, slide order, slide
properties, element data, speaker notes where supported, theme and template
references, and asset references.

Transient canvas state is **not** canonical presentation data. That covers current
selection, drag guides, zoom and active handles. None of it is persisted unless a
specific requirement makes that necessary.

Revisions reuse the Notes principle: versioned writes with `expectedVersion`,
conflict detection and bounded revision history. Nova improves on it. A conflict
gets explicit handling, not a generic failed save.

### 17.15 Assets and import / export

**Assets.** Covers images, document attachments, slide images and, later, audio or
video references. Nova reuses the existing TPI private R2 and media patterns where
they fit. Binaries are never duplicated inside document JSON; documents and slides
reference assets by id.

**Import and export.** The editor model is separate from the file-format adapters:

```
Nova model ↕ DOCX adapter
Nova model ↕ PPTX adapter
Nova model → PDF export
```

DOCX and PPTX are **not** Nova's native storage formats.

- *DOCX, initial Nova:* structured native documents, editor, save and PDF export.
  Basic file export and import follow only when separately authorised.
- *DOCX, advanced:* a possible GenOffice-derived evaluation of parsing,
  round-trip fidelity and paragraph-patch save. Perfect Word fidelity is not a
  prerequisite for initial Nova Edit.
- *PPTX, initial Nova Slides:* native presentation model and editor.
- *PPTX, advanced:* evaluate `pptx-engine`, `pptx-render` and `pptx-ops` for import,
  rendering and patch-based save or export. Full PowerPoint fidelity is not a
  prerequisite for the first working Nova Slides editor.

### 17.16 GenOffice reuse boundary

GenOffice is a valuable architectural reference and a possible source of reviewed
code. Concepts that may inform Nova: TipTap / ProseMirror structured editing;
model and render separation; patch-based Office file operations; render-tree
architecture; journaled operations; centralised undo/redo routing; off-thread
parsing; visible-thumbnail rendering; injected I/O boundaries.

**Do not copy large GenOffice application files wholesale.**

Package candidates for a later, separate evaluation: `packages/docx-engine`,
`packages/pptx-engine`, `packages/pptx-render` and `packages/pptx-ops`. Reusing any
of them requires a source compatibility audit, browser audit, Node API audit,
dependency audit, licence and NOTICE audit, and tests inside TPI. None is reused
under 001C.

**Excluded from the Nova web architecture:** the Electron shell, main processes,
preload/IPC bridges, native filesystem orchestration, updater, desktop packaging,
native file associations, system-font enumeration architecture, and GenOffice's
AI and agent system unless separately authorised.

**`ee/` is excluded.** No TPI production reuse without a separate Enterprise
agreement and explicit authorisation. Inspecting it to understand a concept is
acceptable; copying it is not.

### 17.17 Nova Edit and Nova Editorial Workspace separation

**Nova Edit** is the streamlined Creator product. It exposes what production work
needs: scripts, show notes, episode planning, research notes, presentation creation
and webinar and livestream decks. It avoids professional editorial complexity.

**Nova Editorial Workspace** is the advanced Contributor product. It adds professional
formatting, research papers, articles, educational material, editorial review,
comments and revisions where implemented, publication metadata, Education Center
workflows and advanced presentation work.

Both share **Nova Core and the same editor engines**. They diverge at the interface
layer and in entitlements, not in the file format or the engine. No second
independent editor engine is created.

### 17.18 Entitlements, Education Center and testing

**Feature gating.** The existing entitlement direction is preserved, and feature
availability stays **false** until the products exist.

| Entitlement | Surface |
|---|---|
| Creator / Founding Creator | Nova Edit |
| Contributor / Founding Contributor | Nova Editorial Workspace |
| Founding All-Access | both |

**Education Center.** The bridges follow the access model in §12 and the workflow in
§10, and respect the separation of entitlement from publishing authority (§10.1).
Contributor entitlement does not equal Publisher authority.

**Testing.** Nova requires automated tests from the start: unit tests, editor-model
and serialisation tests, API tests, revision and conflict tests, browser tests,
import and export fixture tests, Firefox Developer Edition acceptance and Chromium
compatibility checks. Manual browser testing alone is not sufficient.

**Firefox.** Firefox Developer Edition is the **authoritative** visual and browser
acceptance environment. Any browser-dependent editor technology must work there.
GenOffice's Chromium and Electron assumptions must not produce a Chromium-only
editor.

### 17.19 Implementation phases

Each phase is small. Numbering may be adjusted to the directive conventions.

| Phase | Scope |
|---|---|
| **Nova-002** | Technology compatibility spike: TipTap, Konva and react-konva, with browser and build proof in Firefox Developer Edition and Chromium. |
| **Nova-003** | Nova Core storage and API foundation. |
| **Nova-004** | Nova Edit Documents minimum editor. |
| **Nova-005** | Document lifecycle: folders, revisions, attachments, trash, autosave. |
| **Nova-006** | Nova Edit Slides minimum editor. |
| **Nova-007** | Slide lifecycle, templates and assets. |
| **Nova-008** | StudioFlow Add to Production contract. |
| **Nova-009** | Nova Editorial Workspace expansion. |
| **Nova-010** | Education Center integration. |

Initial Nova does **not** require AI, PDF editing, perfect Word or PowerPoint
fidelity, mail merge, 3D models, narration, spreadsheets or every GenOffice feature.
It must establish a robust, professional editing foundation.

### 17.20 Unresolved technical gates

| Gate | Owner phase | Status |
|---|---|---|
| TipTap / ProseMirror compatibility, bundle size and schema | Nova-002 | Open |
| Konva and React-Konva compatibility with the chosen React | Nova-002 | Open |
| `/nova/` route confirmed against Worker routing | Nova-002 | Open |
| Final Nova SQL schema and storage model | Nova-003 | Open |
| Entitlement enforcement for Nova surfaces | before Nova-004 | Open |
| StudioFlow production-item contract | before Nova-008 | Open |
| DOCX and PPTX interoperability evaluation | after Nova-007 | Open |
| GenOffice package reuse audit | before any reuse | Open |

### 17.21 Documentation status

TPI-NOVA-001C is documentation only. It records the architecture. It does not
implement Nova, change StudioFlow, add a dependency, add a migration, or deploy
anything.

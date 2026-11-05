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
| TipTap / ProseMirror compatibility, bundle size and schema | Nova-002 | Closed — PASS (§18.7) |
| Konva and React-Konva compatibility with the chosen React | Nova-002 | Closed — PASS (§18.7) |
| `/nova/` route confirmed against Worker routing | before Nova-004 | Open — the Nova-002 spike ran on a Vite dev/build output, not through the Worker (§18.8) |
| Final Nova SQL schema and storage model | Nova-003 | Open |
| Entitlement enforcement for Nova surfaces | before Nova-004 | Open |
| StudioFlow production-item contract | before Nova-008 | Open |
| DOCX and PPTX interoperability evaluation | after Nova-007 | Open |
| GenOffice package reuse audit | before any reuse | Open |

### 17.21 Documentation status

TPI-NOVA-001C is documentation only. It records the architecture. It does not
implement Nova, change StudioFlow, add a dependency, add a migration, or deploy
anything.

## 18. Technology compatibility spike results (TPI-NOVA-002)

**Status:** COMPLETE — PASS. Isolated development spike. Nothing was deployed.

### 18.1 Scope and isolation

The spike lives in `experiments/nova-spike/` as a self-contained application with
its own `package.json`, lockfile, TypeScript configuration and Vite build. It has
no import of, or dependency on, the StudioFlow application, and it did not touch
StudioFlow `App.tsx`, StudioFlow Notes, StudioFlow production behaviour, Worker
authentication, D1 migrations, production APIs, Founding Memberships,
Creator/Contributor entitlements or the Education Center.

Because the root `wrangler.toml` Worker serves static assets from the repository
root with `run_worker_first = true`, the spike directory is explicitly excluded
from asset upload in `.assetsignore` (`experiments`, `experiments/**`), and its
build output is gitignored. The spike could therefore not become part of any
deployed Worker, and the official StudioFlow local environment on
`http://127.0.0.1:8787/studio/` was left untouched. The spike was exercised on its
own Vite dev server on port 5180.

No GenOffice code was copied. No `extensions.ts`, `SlideCanvas.tsx`, renderer,
DOCX, PPTX or `ee/` source was reused; the spike uses upstream TipTap, ProseMirror,
Konva and React-Konva directly.

### 18.2 Versions tested

The spike chose versions appropriate for a new Nova application rather than
inheriting StudioFlow's React 18.3.1 / Vite 5.4.11 / TypeScript 5.6.3 stack, which
was not upgraded.

| Component | Version |
|---|---|
| Node / npm | v25.9.0 / 11.12.1 |
| React / React DOM | 19.3.1 / 19.3.1 |
| TypeScript | 5.9.3 |
| Vite | 8.3.5 |
| `@vitejs/plugin-react` | 6.2.1 |
| TipTap (core, pm, react, starter-kit, image, link, table) | 3.32.2 |
| ProseMirror | as resolved by TipTap 3.32.2 |
| Konva | 10.9.1 |
| React-Konva | 19.3.2 |
| Vitest / jsdom (dev only) | 3.2.4 / 29.1.1 |
| Firefox Developer Edition | 160.0 (authoritative) |
| Chromium (compatibility) | Playwright 1.64.1 build already present in the repository |

### 18.3 Documents

Implementations proven: paragraph, heading, bold, italic, bulleted list,
numbered list, link, image node, table with header row, undo and redo.

The canonical document source is structured JSON with a versioned envelope,
`{ format: "nova-document", version: 1, doc }`, where `doc` is the ProseMirror
document tree. HTML is only ever an editor-render output and is never stored,
and no `document.execCommand` path exists. Formatting, list structure, table
structure and marks survive save → reload; the reload path reconstructs the same
document from JSON alone.

Undo and redo are ProseMirror history transactions: selection plus `toggleBold`
produced 14/14 bold text nodes, undo returned the document to its pre-command
state, and redo restored the formatting.

### 18.4 Slides

Implementations proven: two-slide presentation, text, rectangle, image placeholder
and per-slide background, with selection, drag, transformer resize, slide reorder,
slide duplicate and slide delete.

The presentation model is plain data — `{ format: "nova-presentation", version: 1,
presentation }`, where `presentation.slides[].elements[]` carry only geometry and
content. Selection, drag state, transformer attachment, guides and zoom live in
React component state and are provably absent from the serialized output: the
saved/reloaded presentation contains no view state. Canvas nodes are derived from
the model on every render; dragging writes `x`/`y` back into the model (drag of
+50/+30 screen pixels at 0.5 scale produced model `x=180, y=240`) and a transformer
resize wrote `w≈336, h≈207` into the model, so the model is never a copy of Konva's
internal node state.

### 18.5 Browser acceptance

| Browser | Role | Result |
|---|---|---|
| Firefox Developer Edition 160.0 | Authoritative | 23/23 checks PASS, zero console errors |
| Chromium (Playwright build) | Compatibility | 22/22 checks PASS, zero console errors |

Both runs used real WebDriver/CDP input: typing, select-all and formatting, table
row insertion, undo/redo, save/reload, canvas pixel assertions (480×270 stage,
129,600 non-transparent pixels), click-select, drag, transformer resize, slide
switch, duplicate, reorder, delete and presentation save/reload. Firefox (real
window, `scripts/firefox-screenshot.mjs`) was also inspected visually: the
document renders heading, bold, italic, link, both list types, the image
placeholder and a two-column table; the slide surface renders background, text,
rectangle and image placeholder correctly.

Layout was confirmed at desktop (1280 px and 1009 px viewport) and tablet-like
(820 px and 805 px viewport) widths with no horizontal page overflow. No responsive
implementation was attempted.

Three defects were found by these runs and fixed inside the spike: a React `key`
warning caused by spreading a props object containing `key` into a Konva node, a
selection step missing before transformer resize, and two incorrect test
expectations. No defect required changing a library choice.

### 18.6 Build, bundle and tests

`npm install` completed cleanly (131 packages, later 39 for the jsdom test
environment) with no peer-dependency errors, which also settles the React 19 /
React-Konva 19.3.2 / Konva 10.9.1 peer combination. TypeScript typecheck is clean
and the production build succeeds: 148 modules, one JavaScript chunk of
1,018.62 kB minified (316.20 kB gzip), build time ≈180 ms.

Attribution measured during the spike by splitting vendor chunks:

| Group | Minified | Gzip |
|---|---|---|
| TipTap + ProseMirror | 470.26 kB | 148.02 kB |
| Konva + React-Konva | 333.65 kB | 102.06 kB |
| React + React DOM | 203.26 kB | 63.59 kB |
| Spike application code | 9.99 kB | 3.52 kB |

Vite warns that a chunk exceeds 500 kB. That warning is expected here because the
spike deliberately imports both editor stacks into one page; it is not evidence
that either stack is unusable.

Eleven automated tests pass (`tests/document.test.ts` 5, `tests/slides.test.ts` 6):
document JSON round trip, schema validity, editor command behaviour, presentation
round trip, slide reorder, duplicate/delete and element update. Document command
tests require a DOM environment (jsdom) because an unmounted TipTap editor has no
ProseMirror view and therefore no history commands — a test-infrastructure detail,
not a product constraint.

### 18.7 Gate results

| Gate | Requirement | Result |
|---|---|---|
| TipTap / ProseMirror | clean build, structured JSON, formatting round trip, undo/redo, Firefox PASS, Chromium PASS | **PASS** |
| Konva | clean build, model separate from canvas, basic manipulation, JSON round trip, Firefox PASS, Chromium PASS | **PASS** |
| React-Konva | works with the Nova-selected React without peer errors | **PASS** |
| Overall Nova technology | both editor foundations viable without changing StudioFlow's React/Vite stack | **PASS** |

### 18.8 Unresolved issues carried forward

- **Single 1.0 MB chunk.** Nova Documents and Nova Slides must be separate routes
  with dynamic imports and their own vendor chunks; the combined figure above is a
  ceiling for a page that loads both, not the expected weight of either product
  surface. Re-measure per surface in Nova-004 and Nova-006.
- **Image elements are placeholders.** No asset pipeline, upload, R2 binding or
  sizing rules were tested; that belongs with Nova storage.
- **`/nova/` Worker routing is still unproven.** The spike ran on Vite output, so
  the route must be confirmed against the real Worker before the first Nova
  front-end release.
- **Firefox Developer Edition 160.0 is a moving target.** Re-run the Firefox
  acceptance script at each Nova milestone rather than assuming the result holds.
- **No persistence, revisions, permissions, DOCX/PPTX or PDF work exists**, by
  directive. Nova Core storage and API work is the next phase.

### 18.9 Documentation status

TPI-NOVA-002 is a development spike plus this record. It adds an isolated
experiment and its evidence; it does not implement Nova, change StudioFlow, add a
migration, add a production dependency or deploy anything.

## 19. Nova Core storage and API foundation (TPI-NOVA-003)

**Status:** COMPLETE — PASS against the isolated local Worker. Nothing was
deployed, no production migration was applied, and no product UI exists yet.

### 19.1 Scope and isolation

Nova Core is one owner-scoped persistence layer shared by Nova Edit and the Nova
Editorial Workspace; product identity never forks storage. The implementation is
`lib/nova.js` (handlers, routing, validation), `lib/nova-limits.js` (documented
limits), one additive migration and one dispatch line in
`functions/api/[[path]].js`. The Nova-002 spike remains untouched under
`experiments/nova-spike/` and is still excluded from Worker assets.

StudioFlow, StudioFlow Notes, the Education Center, entitlements, GenOffice code
and every import/export path were left unchanged. There is no editor UI, no
StudioFlow bridge and no Nova asset pipeline.

### 19.2 Storage model

Migration `migrations/0059_nova_core.sql` adds three tables. `studio_notes` is
never overloaded.

| Table | Responsibility |
|---|---|
| `nova_items` | Item identity and metadata: `id`, `owner_id`, `type`, `title`, `collection_id`, `status`, `format_version`, `content_json`, `content_bytes`, `version`, optional `template_key`/`source_kind`/`source_ref`, `trash_collection_id`, `created_at`, `updated_at`, `deleted_at` |
| `nova_collections` | Owner-scoped nested folders: `id`, `owner_id`, `parent_id`, `name`, timestamps |
| `nova_revisions` | Content snapshots: `id`, `item_id`, `owner_id`, `revision_number`, `title`, `format_version`, `content_json`, `content_bytes`, `restored_from_revision`, `created_at`, unique on `(item_id, revision_number)` |

Constraints: `type` is restricted to the two Nova formats, `status` to
`active`/`archived`/`trash`, versions and byte counts must be positive, and every
row cascades from its owning contributor. Item deletions cascade to revisions.
Collection deletion is deliberate: items are never deleted, only unfiled.

Indexes: `idx_nova_collections_owner_parent`,
`idx_nova_items_owner_status_updated`,
`idx_nova_items_owner_type_status_updated`,
`idx_nova_items_owner_collection_status`, `idx_nova_items_owner_title`,
`idx_nova_revisions_item_number`, `idx_nova_revisions_owner_created`. No seed
data and no fixture accounts exist in the migration.

### 19.3 Content envelope rules

Only the versioned structured envelopes from Nova-002 are accepted:

- `{ format: "nova-document", version: 1, doc }`
- `{ format: "nova-presentation", version: 1, presentation }`

HTML is never canonical content and rendered Konva nodes are never stored; both
surfaces serialize their own structured model into the envelope. The server
derives the item `type` from the envelope `format`, so a client cannot create or
retitle an item with a contradictory type; an existing item cannot change type.

### 19.4 Two versions, never overloaded

| Field | Meaning |
|---|---|
| `format_version` / envelope `version` | Shape of the structured content (`nova-document v1`) |
| `version` | Record concurrency counter for optimistic writes |

Every item mutation (`PATCH`, archive, trash, restore, permanent delete,
revision restore) requires `expectedVersion`. The write is a conditional
`UPDATE ... WHERE version = expected`, so a stale writer gets `409` with the
current item and can never overwrite newer content. Metadata-only edits still
bump the record version; they do not create a content revision.

### 19.5 API namespace

All routes live under `/api/nova/...`, are gated by the existing Studio access
check (owner/admin, or an active Creator capability), and return
`Cache-Control: private, no-store`. Mutations reject a mismatched `Origin`
(`403 cross_origin_forbidden`). Ownership is always taken from the session; no
request field can set `owner_id`, and another owner's ID returns `404` for fetch,
update, lifecycle, revision and collection operations.

| Method and path | Purpose |
|---|---|
| `GET /api/nova/items` | Owner listing; `type`, `status`, `collectionId` (or `unfiled`), `search`, `limit` |
| `POST /api/nova/items` | Create with envelope, title, optional collection/template/source metadata |
| `GET /api/nova/items/:id` | Fetch with content |
| `PATCH /api/nova/items/:id` | Update content and/or title and/or collection |
| `POST /api/nova/items/:id/archive` | Archive |
| `POST /api/nova/items/:id/trash` | Move to Trash |
| `POST /api/nova/items/:id/restore` | Restore from Trash or archive |
| `POST /api/nova/items/:id/permanent-delete` | Irreversible delete, Trash only, requires `confirmation: "DELETE PERMANENTLY"` |
| `GET /api/nova/items/:id/revisions` | Revision list, newest first, with snapshots |
| `POST /api/nova/items/:id/revisions/:revisionId/restore` | Restore a snapshot as a new current version |
| `GET /api/nova/collections` | Owner collection tree with active item counts |
| `POST /api/nova/collections` | Create, optional `parentId` |
| `PATCH /api/nova/collections/:id` | Rename and/or move |
| `POST /api/nova/collections/:id/delete` | Safe delete |

Listing is intentionally simple: indexed owner filters plus a `LIKE` title
search. No full-text index, no tag/facet system and no editor endpoints exist.

### 19.6 Collections

Collections nest without depth limit, use the same cycle validation as Notes,
and cannot reference another owner's parent (or any non-Nova folder). Deleting a
collection never deletes content: its items return to Unfiled, child collections
are re-parented under the deleted collection's parent (root when it had none),
and Trash items keep their restoration target through `trash_collection_id`.

### 19.7 Revisions

A revision is written whenever content changes, at the record version that
resulted from the change (`revision_number` = `version`). Retention is the latest
**50** content versions per item; older rows are pruned on write. Restoring a
revision writes a new current version, inserts a new revision that records
`restored_from_revision`, and never rewrites historical rows — the unique
`(item_id, revision_number)` constraint enforces that.

### 19.8 Lifecycle

`active → archived → active`, `active/archived → trash → active`, and
`trash → permanent delete` only; restore from Trash always returns the item to
active. Trashed items are read-only until
restored. Restoring returns an item to the collection it was trashed from, or to
Unfiled with a notice if that collection has since been deleted. Permanent
deletion requires both Trash status and the exact confirmation string; one click
cannot destroy content.

### 19.9 Limits

| Limit | Value | Reason |
|---|---|---|
| Document content | 512 KiB | Matches the existing StudioFlow Notes ceiling; rich-text JSON rarely approaches it |
| Presentation content | 1 MiB | Slide geometry and node trees are heavier, still inside D1 row/string practicality |
| Request body | 1 MiB + 16 KiB | Envelope plus metadata headroom above the largest content type |
| Revision retention | 50 per item | Bounded growth; Notes retains 100 smaller HTML revisions |
| Title / collection name | 200 / 120 characters | Presentation safety |
| Listing page | 100 default, 200 maximum | Bounded responses |

Errors are explicit: `413 nova_content_too_large`, `413 nova_request_too_large`,
`400 invalid_nova_format`, `400 unsupported_nova_format_version`,
`400 invalid_nova_shape`, `400 nova_content_required`,
`400 expected_version_required`, `409 nova_item_conflict`,
`409 nova_item_in_trash`, `409 nova_item_not_in_trash`, `400 confirmation_required`.
A storage environment without the migration answers `503 nova_schema_unsupported`
rather than granting access.

### 19.10 Entitlement boundary

Nova Core APIs reuse the existing Studio access gate. No membership class gained
capability, no Nova flag became globally available, no production policy changed
and both product surfaces share the same tables, so Creator → Nova Edit,
Contributor → Nova Editorial Workspace, Founding variants and Founding All-Access
require no duplicate storage. A Nova-specific enablement decision remains future
work.

### 19.11 Verification result

`npm run verify:nova-003` (`scripts/verify/tpi-nova-003-foundation.mjs`) starts an
isolated Worker on port 8791 against a throwaway `--persist-to` directory, seeds
synthetic accounts there only, and applies all migrations including 0059.

**105 assertions — 105 passed, 0 failed**, across schema (16), authentication and
ownership (12), document lifecycle (11), validation (7), listing and filters (17),
presentation lifecycle (8), collections (16), revisions (12) and isolation (2).
Coverage includes CHECK/unique/cascade constraints, 401/403/404/409/413 paths,
cross-origin rejection, client ownership override, both document and
presentation CRUD with conflicts, nested collections with cycle rejection and
safe delete, revision provenance plus retention pruning at 50, and the
permanently-deleted item leaving no revisions.

The official StudioFlow local environment (`http://127.0.0.1:8787/studio/`) and
`.local-dev/state/v3` were not used, migrated or contacted. No production
migration or deployment occurred.

### 19.12 Deferred

- Editor surfaces (TipTap documents, Konva slides) and their lazy-loaded routes.
- `/nova/` production Worker routing remains unproven.
- Nova asset linkage and upload/import/export pipelines (DOCX/PPTX/PDF).
- StudioFlow handoff (Add to Production, teleprompter, slide assets).
- Education Center editorial workflow and Nova feature enablement policy.
- Shared/team ownership. Nova items are single-owner until an explicit sharing
  model is approved.

## 20. Nova Edit Documents minimum editor (TPI-NOVA-004)

**Status:** COMPLETE — PASS in Firefox Developer Edition (authoritative) and
Chromium against an isolated local Worker. Nothing was deployed, no production
migration was applied and no entitlement policy changed.

### 20.1 Application boundary

Nova Edit is its own application, not a StudioFlow view:

| Concern | Location |
|---|---|
| Source | `nova-app/` (React + TypeScript + Vite + TipTap), excluded from Worker assets by `.assetsignore` |
| Published assets | `nova/` (committed build output, `base: "/nova/"`) |
| Route | `/nova/` with hash routing: `#/documents`, `#/documents/:id` |
| Worker | `worker.js` serves `/nova` and `/nova/*` through `cleanUrlAssetPath`, reusing the existing Studio access check behind a Nova-branded 403 gate |
| Scripts | `npm run build:nova`, `npm run verify:nova-003`, `npm run verify:nova-004` |

The editor surface is a `React.lazy` chunk, so the Nova shell stays small and
TipTap is only fetched when a document is opened. Vendor code is split into
react and tiptap chunks by the Vite `manualChunks` map.

### 20.2 Documents editor features

Documents support create, open, rename, save and delete-confirmation. Editing
uses TipTap over the structured `nova-document v1` envelope: headings,
bold/italic/underline, bulleted and numbered lists, blockquotes, horizontal
rules, tables (insert, add row, add column, delete column, in-cell editing) and
links, with undo/redo, an autosave indicator and a version readout. Trashed and
archived documents open read-only with an explicit banner. HTML is never stored:
the canonical content is the structured JSON document.

### 20.3 Persistence, autosave and conflict behavior

- Edits autosave after a short idle delay and on blur/title change; the
  indicator reports `Saving…`, `Saved`, `Unsaved changes`, `Conflict` and
  `Read-only`.
- Saves send `expectedVersion`. On `409` the editor surfaces the conflict,
  pauses saving, keeps the local body intact, fetches the newer server copy and
  offers explicit reload-or-restore choices; it never overwrites the newer
  version.
- A local draft (`tpi:nova:draft:v1:<itemId>` in `localStorage`) protects typed
  work between saves. It is Nova-namespaced, never shared with StudioFlow Notes,
  and is cleared once the content reaches the server. After a reload the saved
  server copy opens first, a recovery banner offers the draft, and accepting it
  saves the draft as the next version.
- Opening a stored document no longer reports false unsaved changes: an editor
  mount that emits an update with unchanged content and title is ignored instead
  of spending a document version on a no-op save.

### 20.4 Folders, lifecycle and revisions

The collection tree creates, renames, nests, selects and deletes folders; a
document can be filed from the editor and re-filtered from the list. Archive,
trash, restore and permanent delete follow the Nova-003 contracts, including the
`DELETE PERMANENTLY` confirmation dialog that refuses a mismatched string. The
revisions panel lists stored revisions and restores one as a new current version
through the API, leaving the editor usable afterwards.

### 20.5 Verification result

`npm run verify:nova-004` (`scripts/verify/tpi-nova-004-editor.mjs`) copies the
committed `nova/` build into a throwaway directory, generates an isolated
Wrangler config, applies migrations to a temporary `--persist-to` state and runs
the Worker on port 8792 with synthetic accounts seeded there only. It never
contacts `http://127.0.0.1:8787/studio/` or `.local-dev/state/v3`.

**134 checks — 134 passed, 0 failed.**

| Section | Passed |
|---|---|
| Isolated environment | 4 |
| Build artifacts | 10 |
| Worker gate (`/nova/`, `/nova`, assets, signed-out 403) | 9 |
| Structured storage and versioning (API) | 11 |
| Collections and lifecycle (API) | 8 |
| Firefox Developer Edition acceptance | 80 |
| Responsive acceptance | 5 |
| Chromium smoke | 7 |

Firefox Developer Edition carried the authoritative acceptance: sign-in gate,
shell, lazy Documents surface, folder create/rename/select, document create and
routing, typing, heading, bold/italic/underline, both list types, blockquote,
horizontal rule, the full table workflow, link selection/dialog/apply, undo,
redo, autosave, stored JSON envelope and node types, HTML-free canonical content,
reload persistence of text/marks/heading/lists/table/blockquote/rule, version
increment, conflict preservation, local draft recovery, revision list and
restore, folder move, archive/trash/restore, permanent delete confirmation and
the console-error check. Chromium repeated the shell, editing, autosave, reload,
title and tablet-width smoke path. Desktop (1280 px) and tablet (900 px) widths
were checked for destructive horizontal overflow, and the editor remains usable
at tablet width.

### 20.6 Build output

| Asset | Size | gzip |
|---|---|---|
| `nova/index.html` | 0.79 kB | 0.42 kB |
| `index-*.css` | 18.44 kB | 4.32 kB |
| `rolldown-runtime-*.js` | 0.59 kB | 0.36 kB |
| `index-*.js` (shell) | 4.72 kB | 2.01 kB |
| `DocumentsSurface-*.js` (lazy editor) | 37.26 kB | 9.97 kB |
| `nova-vendor-react-*.js` | 218.75 kB | 68.27 kB |
| `nova-vendor-tiptap-*.js` | 447.97 kB | 141.45 kB |

`npm --prefix nova-app run typecheck` passes, `npm run build:nova` succeeds, and
`npm run verify:nova-003` still reports 105/105, so Nova Core is unregressed.

### 20.7 Deferred

- Nova-004A icon/ribbon redesign; the toolbar keeps plain labelled controls.
- Nova-005 document lifecycle expansion and professional editing depth.
- Slides, Add to Production, StudioFlow handoff and Nova AI.
- DOCX/PDF/Markdown/HTML import and export; Nova remains structured-JSON only.
- Nova-specific entitlement policy; the existing Studio access check still gates
  `/nova/` and `/api/nova/*`.
- Production routing: `/nova/` is proven on an isolated Worker and the official
  local Worker answers the Nova gate, but no production deployment or migration
  has been performed.

## 21. Nova Edit professional interface pass (TPI-NOVA-004B)

**Status:** IMPLEMENTATION COMPLETE — AUTOMATED ACCEPTANCE PASSED — AWAITING OWNER
VISUAL ACCEPTANCE. Presentation-only pass over the Nova-004 editor. No deployment,
database, API contract, editor data model or StudioFlow change. Nova Slides is not
started.

### 21.1 Direction

Nova Edit is presented as a TPI professional editor: dark TPI chrome, restrained
green/mint Nova accents, a compact top bar (identity, title, save state), and a
subdued workspace with a centred, readable page surface. The GenOffice Docs
screenshot was used only as a density and hierarchy reference; no layout, colour,
branding or pixel content was copied.

### 21.2 Icon system

- Library: `lucide-react`, pinned exactly to `1.67.0` in `nova-app/package.json`.
- Every icon control has an accessible name (`aria-label` or visible text), a
  `title` tooltip, native keyboard focus, and a visible `:focus-visible` ring.
- Formatting controls (bold, italic, underline, bulleted and numbered lists,
  quote, link) expose `aria-pressed` and reflect the active editor state.
- Text labels remain where an icon alone would be ambiguous (Archive, Move to
  Trash, Delete permanently, History).

### 21.3 Ribbon and category structure

The Home ribbon is the only editing ribbon. No category tabs are shown, and no empty decorative
tabs were added.

| Group | Controls |
|---|---|
| History | Undo, Redo |
| Style | Paragraph / Heading 1–3 select |
| Text | Bold, Italic, Underline |
| Paragraph | Bulleted list, Numbered list, Quote |
| Insert | Link (dialog), Table, Divider |
| Table (contextual) | Add row, add column, delete row, delete column |

Insert, Review and View categories are reserved for later phases, when they contain real features.

### 21.4 Document canvas

A subdued workspace surrounds a distinct page surface (816 px maximum, 72 px
side margins on desktop). No pagination, headers, footers or print layout were
added.

### 21.5 Navigation and save state

The left navigation uses icons for folders, the all-documents view, rename and
new folder. The save state remains a compact status pill in the editor header,
not a button.

### 21.6 Responsive result

At 900 px and narrower the toolbar wraps instead of scrolling horizontally and the
page surface uses the full available width with reduced padding.

### 21.7 Verification

- `npm --prefix nova-app run typecheck`: pass.
- `npm run build:nova`: pass. CSS 18.44 → 19.76 kB; the navigation chunk grew
  37.26 → 46.37 kB because the lucide icons are bundled into it. React vendor and
  TipTap vendor sizes are unchanged.
- `npm run verify:nova-003`: 105/105.
- `npm run verify:nova-004`: 134/134 (Firefox Developer Edition 80/80,
  responsive 5/5, Chromium smoke 7/7).
- `git diff --check`: clean.

### 21.8 Remaining professional editor features (Nova-005)

Fonts and font sizes, text colour and highlight, comments and tracked changes,
headers and footers, page numbers and real pagination, images, export, templates,
Review and View categories, and advanced table tools.

### 21.9 Owner visual acceptance

Owner visual acceptance of this pass is pending. Local review URL:
`http://127.0.0.1:8787/nova/`.

### 21.10 TPI-NOVA-004R2 Content Editor safety baseline

- **Ownership defect corrected.** `POST /api/articles` no longer lets a
  Contributor overwrite another account's article by submitting its id. An
  existing id may be changed only by its `created_by` owner, and `created_by`
  is never reassigned. Regression coverage:
  `scripts/verify/tpi-nova-004r2-article-ownership.mjs`.
- **Destination validation (read-only).** All 18 Content Editor destination
  values resolve to existing pages that load `includes.js`, and the card loader
  matches by exact filename. No dead destination was found. Destinations were
  not renamed.
- **Template relationship.** Only the TPI Video template forces a destination
  (`tpi-videos.html`, selector disabled). Other templates do not set or
  recommend a destination or department.
- **Publishing separation (future migration requirement).** Contributor access
  does not automatically grant Education Center publishing authority. The Nova
  Editorial Workspace must separate Contributor creation/submission, review or
  editor authority, publishing authority and administrative authority. This is
  recorded only; the legacy direct-publish behaviour remains until the controlled
  migration phase.

### 21.11 TPI-NOVA-004R5 structured document persistence linked to existing articles

Production has not received the 0059/0060 Nova Editorial Workspace persistence
work under this milestone.

Nova documents persist locally through `0059_nova_core.sql`. A nullable
`articles.nova_item_id` link (`0060_article_nova_link.sql`) connects an existing
article to one Nova document (Option A). The article row remains the publication
record; the Nova document is the working source. Contributors use article-scoped
routes. Standalone `/api/nova/*` stays Creator Studio-gated. Conversion runs in
the browser, and the server refuses empty conversions of non-empty legacy
articles. Autosave uses `expectedVersion` with 409 on conflict and no
last-write-wins. Recovery is keyed per Nova item. Revisions live in
`nova_revisions`. Archive, trash and article delete keep the two records
separate. Publication writes HTML through the existing path only.

Verified: the server verifier passes 67/67. Firefox Developer Edition passes 30
browser-observed checks (11 + 19) as a Contributor without Studio access,
covering conversion, unsupported-markup reporting, empty-conversion refusals,
autosave, reload, stale-save conflict, per-item recovery, live preview, publish
snapshot, public rendering and TPI Video. Chromium passes 27 browser-observed
checks (11 + 16), including duplicate-link prevention. Firefox remains
authoritative.

Deferred Editorial Workspace UI: Contributor-facing revision history and
Contributor-facing archive/trash/restore controls. Revision persistence is
operational in Nova Core; Contributor-facing revision-history controls are
deferred to a later Editorial Workspace milestone. Nova lifecycle separation is
verified at the persistence/API layer. Contributor-facing archive/trash/restore
controls are deferred. These are product-surface enhancements, not blockers for
structured document persistence.

Production has not received migrations 0059/0060 or the 004R5 application changes.

### 21.12 TPI-NOVA-004R6A editorial submission, review and publishing authority (architecture only)

The editorial workflow architecture is recorded in
[`TPI-NOVA-EDITORIAL-SUBMISSION-REVIEW-PUBLISHING-ARCHITECTURE.md`](TPI-NOVA-EDITORIAL-SUBMISSION-REVIEW-PUBLISHING-ARCHITECTURE.md).
It is documentation only. No migrations, application changes or production work
are included. Implementation is not complete.

### 21.13 TPI-NOVA-004R6B editorial workflow foundation (server-side only)

The foundation described in 21.12 now exists in the codebase, with no user-facing
surface yet:

- Capabilities `EDITORIAL_REVIEW` and `EDITORIAL_PUBLISH` (`lib/membership-entitlements.js`),
  assignable independently and implied by no membership tier or legacy role.
- Additive schema in `migrations/0061_article_editorial_workflow.sql`:
  `articles.editorial_status` (default `legacy`), `article_editorial_submissions`,
  and append-only `article_editorial_events`. `articles.status` still governs
  publication visibility.
- One transition engine, `lib/editorial-workflow.js`, that owns the legal
transition matrix, authority checks, Nova ownership/version verification,
approval-version equality, and reviewed-metadata-drift detection.

Not yet built: contributor submission UI, admin review UI, publication through
editorial approval, and retirement of the legacy direct-publish paths. Production
is untouched.

Next: the contributor submission workflow, per the phase sequence in the 004R6A architecture record.

### 21.15 TPI-NOVA-004R6C3 Final acceptance and milestone close

R6C is complete as the Contributor side of the editorial workflow, local-only; production has not received R6C. Accepted: the published-revision snapshot test, zero Firefox console errors, public regression on 8787, and a scoped local-only fixture cleanup that restored the append-only event triggers from the exact 0061 definitions. Not implemented: the Editorial Review queue, Request Changes reviewer controls, the Approval UI and the Publisher UI.

### 21.17 TPI-NOVA-004R6D Editorial Review Queue and reviewer actions (implemented)

The reviewer side now exists as the Editorial Review section of the existing React
Administration Center (`admin-center-app/`, served at `/admin-panel`): no new app,
route or shell. The default queue holds `submitted` and `in_review` submissions and
optionally filters Changes Requested and Approved; published rows, legacy articles
and TPI Video are excluded. Review requires `EDITORIAL_REVIEW` from the entitlement
ledger, never ordinary Admin or `requireAdmin`, and does not require
`EDITORIAL_PUBLISH`.

Reviewers inspect a read-only rendering of the exact pinned `submitted_nova_version`,
start review (recording reviewer ownership for the round), request changes with a
required note stored in `article_editorial_events`, or approve. One reviewer owns a
round and cannot be silently replaced. Approval enforces approver ≠ submitter, no
reviewed-metadata drift, no version drift, a resolvable pinned version, and records
`approved_nova_version = submitted_nova_version`. Contributors see the feedback and
timestamp beside the workflow controls while `changes_requested`, keep the R6C
unlocked editor and Resubmit path, and see Approved — Awaiting Publication locked
after approval.

`migrations/0062_editorial_capabilities.sql` widens the entitlement capability check
so editorial capabilities can be granted. Review and approval never change
`articles.status` or the public snapshot, so publishing remains R6E. Local-only;
production has not received R6D.

### 21.14 TPI-NOVA-004R6C2 Contributor submission workflow (implemented)

Contributors can now Submit for Review (legacy enrollment through draft to submitted), Withdraw before review starts, and Resubmit after changes are requested. The server pins the submitted Nova version, locks linked Nova items in submitted, in-review and approved states, and refuses crafted direct publication of enrolled articles. Published public snapshots are preserved during revision. TPI Video is excluded. Not yet built: the Editorial Review queue, Reviewer actions UI, Publisher UI and retirement of legacy direct publication (R6E).

### 21.16 TPI-NOVA-004R6D0 Current naming statement

This statement governs current user-facing naming. Earlier sections use the names that were current when they were written; they are not rewritten.

- **Nova Editorial Workspace** is the Contributor/editorial product. It is the existing `/paper-editor.html` surface, formerly called Content Editor. The route and filename are unchanged. Member navigation labels it Nova Editorial Workspace.
- **Nova Edit** is the Creator-facing product inside StudioFlow, the evolution of the StudioFlow Notes tab. The internal `Notes` state key is kept, so behavior and storage are unchanged.
- **Nova Core** is shared underlying technology used by Nova Edit and Nova Editorial Workspace. It is not a user-facing product and does not appear in ordinary navigation.
- **`/nova/`** is temporary development and reference infrastructure. It is not member navigation, not the Contributor destination, and not a third permanent product. It is not deleted by this statement.
- The legacy editor, where a user must still choose it during migration, is labelled Legacy Editor. It is not a separate permanent product.

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

PDF is an **export/output capability only**:

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

GenOffice (`genspark-ai/genoffice`) has been identified as a **potentially
valuable architectural and component reference** for the future evaluation
phase. It is a reference to evaluate, not a decision to adopt.

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

Constraints:

- GenOffice's main code is **Apache 2.0**; any reused or adapted code must
  preserve the applicable licensing and NOTICE requirements, and
  `THIRD-PARTY-NOTICES.md` must be updated before any code is merged.
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

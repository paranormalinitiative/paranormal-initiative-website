# TPI-STUDIOFLOW-122F.2B — Individual Image Removal in Notes

Status: PARTIAL / AUTHORITATIVE LOCAL DEVELOPMENT ONLY / NOT DEPLOYED  
Date: 2026-10-31

## Objective

Allow a creator to select one embedded photograph in a Note and remove only
that photograph without deleting the Note, surrounding content, other images,
attachments, or stored attachment objects.

## Existing implementation findings

- Images are inserted as `figure[data-note-attachment-id]` elements containing
  an `img` and editable `figcaption`.
- The figure's attachment ID is also retained in the Note's attachment ID list
  used by autosave and revisions.
- Existing figure resizing and caption editing are CSS/contenteditable
  behavior; no second image-management model was introduced.
- The editor already uses the browser editing/undo stack through
  `document.execCommand`.
- Existing attachment upload and storage routes were not changed.

## Implemented correction

- Clicking an embedded image selects the exact containing figure by its
  `data-note-attachment-id`.
- A small contextual toolbar appears only for the selected image.
- The toolbar uses the existing Lucide `Trash2` icon and exposes
  `aria-label="Delete Image"` and a `Delete Image` tooltip.
- Delete Image selects only that figure and invokes the browser's existing
  `execCommand("delete")` editing path. If the browser reports the command as
  unsupported, the figure is removed as a safe fallback.
- Delete and Backspace are handled for an image selection while caption focus
  and ordinary text editing are excluded.
- The editor remains focused after removal and the document is marked dirty for
  the existing autosave/revision pipeline.
- No attachment ID is removed from the saved attachment list and no R2 delete
  request is introduced. Historical revision references therefore remain
  protected.

## Source and staged assets

- StudioFlow source worktree: `/Users/toddknipple/Documents/StudioFlow/web-122`
- Source branch: `codex/studioflow-122-notes`
- Source commit: `a9f0207876944b37c234e16b73d9e6a6863a9c8a`
- Authoritative local URL: `http://127.0.0.1:8787/studio/`
- JavaScript: `index-iWHM28jf.js`
- JavaScript SHA-256: `a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`
- CSS: `index-Py1pkkT-.css`
- CSS SHA-256: `11e1a67b3cd18447de5691edaca14b5a103df2c3e7151260ec542c78de98c4a2`
- Integrated entry-point SHA-256: `28a72bc9e339ae7c5204c8b74c80c6b66ac04a84773be083b44e7f28b6d2c7a7`

## Acceptance matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Selected image exposes Delete Image | PASS | Real Firefox Selenium pointer interaction |
| Only selected image is removed | PASS | Second of two disposable figures removed; first and surrounding text remained |
| Caption is removed with its image | PASS | Real document state check |
| Other images remain | PASS | Real document state check |
| Undo restores image and caption | PASS | Firefox browser editing undo command |
| Redo removes image again | PASS | Firefox browser editing redo command |
| Existing editor focus/caret preserved | PASS | Existing focused Notes checks |
| Existing toolbar, attachments, resize and captions preserved | PASS | Source and maintained regression checks |
| Delete/Backspace trusted-key interaction | UNVERIFIED | Handler implemented; separate trusted keyboard action was not completed |
| Image-specific autosave and refresh persistence | UNVERIFIED | Full Notes harness encountered repeated disposable note/folder hydration failures |
| Native uploaded photograph retention | UNVERIFIED | Native file chooser and real uploaded bytes were not exercised |
| Stored R2 object is not deleted | PASS by source inspection | No storage-delete call or attachment-ID removal was added |
| Maintained Firefox StudioFlow regression | PASS | 64/64 |
| Release safety | PASS | 21/21 |
| Reproducible source/build/staging provenance | PASS | Exact source identity and staged asset hashes |
| Production deployment | NOT AUTHORIZED | No production command run |

## Verification limitation

The image-specific browser checks passed. The maintained full Notes verifier was
extended with those checks, but repeated runs encountered an existing
disposable-fixture hydration/timing failure in note creation, refresh, and
folder assertions. Because that prevented a clean end-to-end image autosave and
refresh assertion, this record remains PARTIAL rather than claiming complete
Notes acceptance. No owner data was used or modified.

## Preservation

- Original mixed StudioFlow checkout was not modified.
- Existing Notes, images, attachments, revisions, local D1/R2 state, Studios,
  and recordings were not reset, migrated, or deleted.
- The authoritative Worker remained local-only on port 8787.
- Production remained unchanged and no deployment was attempted.

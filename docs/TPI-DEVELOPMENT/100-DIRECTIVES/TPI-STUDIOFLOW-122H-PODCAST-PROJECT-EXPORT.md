# TPI-STUDIOFLOW-122H — Podcast Project Files, Export, and Operating System Access

Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED**  
Date: 2026-10-31

## Result

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now exposes
`View Project Files` and `Download Project` actions for existing podcast
project collections in the Notes organization tree. Download is a read-only
browser operation that creates a standard ZIP archive; it does not synchronize
future changes and does not modify StudioFlow data.

The final Firefox Developer Edition acceptance created disposable project,
episode, and note records, downloaded a ZIP, listed and inspected its contents
with the operating system `unzip` utility, and cleaned up the disposable
records. The archive contained project metadata, episode metadata, an offline
readable note HTML file, and a manifest. The manifest explicitly documented
resource categories that cannot currently be safely associated with a Notes
podcast project.

## Architecture findings

- Podcast projects, episodes, folders, and research collections are owner-scoped
  `studio_note_collections` records in local D1. They use existing collection
  identifiers, `collection_type`, and `parent_id` relationships.
- Notes are owner-scoped `studio_notes` records with HTML/text bodies,
  collection associations, revisions, automatic/manual titles, and private
  attachment references.
- Note attachments are private R2 objects represented by
  `studio_note_attachments`; the existing authenticated attachment endpoint is
  used for export. Existing limits remain unchanged: images 32 MB, documents
  50 MB, audio 50 MB, and text 10 MB.
- Teleprompter scripts are stored in browser localStorage by Studio ID.
- Recordings, backstage recordings, uploaded media, and some artwork are in
  StudioFlow browser-local library/IndexedDB records keyed by Studio or
  broadcast identifiers.
- Guest information and production scenes are Studio/room scoped.

The last four categories do not have a verified podcast-project or episode
association in the current model. They are therefore not guessed into an
archive. Each omission and its reason is recorded in `project-manifest.json`.

## Export structure

The archive uses a sanitized project root and includes only existing authorized
resources:

```text
<Podcast Project>/
├── Project Information/project-manifest.json
├── Episodes/<Episode>/Episode Information/collection.json
├── Episodes/<Episode>/Notes/<Note>.html
├── Episodes/<Episode>/Notes/Attachments/<file>
└── Unassigned Project Files/Notes/<Note>.html
```

Notes are standalone HTML documents. Supported private attachment URLs are
rewritten to relative archive paths when the corresponding attachment is
successfully downloaded. Failed or unavailable attachments are omitted from
the document mapping and reported in the manifest rather than leaving a broken
authenticated URL. Original StudioFlow note content is not changed.

The manifest contains the project identifier/title, export timestamp, format
version, included paths, file sizes, SHA-256 checksums, note metadata, explicit
omissions, and bounded-export limitations. It contains no tokens, credentials,
signed URLs, or session identifiers.

## Safety and limits

Export verifies the authenticated owner through the existing Notes APIs and
fetches attachments through same-origin authenticated requests. Names are
sanitized to prevent path traversal and collisions are suffixed rather than
overwritten. The browser export is bounded to 50 MB per resource and 512 MB
total. The interface reports preparation progress and failures; duplicate
background export jobs are not created by the implementation.

The operation is read-only: no D1/R2 migration, deletion, ownership change,
scene change, publishing, or production operation occurs.

## Verification

| Requirement | Result | Evidence |
| --- | --- | --- |
| Project Files action | PASS | Authenticated Firefox interaction on 8787 |
| Authorized project/episode/note association | PASS | Disposable D1 fixtures |
| Download Project ZIP | PASS | Browser download completed |
| Standard archive structure | PASS | `unzip -Z1` listing |
| Offline note HTML | PASS | Note HTML present; no authenticated application URL required |
| Episode metadata | PASS | `Episode Information/collection.json` present |
| Manifest accuracy/omissions | PASS | Manifest inspected after extraction |
| Ownership boundary | PASS | Existing authenticated Notes API and disposable owner-scoped records |
| Storage preservation | PASS | Export is read-only; disposable fixtures cleaned up |
| Large-file bounds | PASS | 50 MB/resource and 512 MB/total guards implemented |
| macOS Finder native extraction | UNVERIFIED | Archive is standard ZIP; native Finder test not run separately |
| Windows File Explorer native extraction | UNVERIFIED | Archive is standard ZIP; Windows unavailable in this environment |
| Linux file manager native extraction | UNVERIFIED | Archive is standard ZIP; native GUI test not run separately |
| Maintained Firefox regression | PASS | 64/64 |
| Release safety | PASS | 21/21 |
| Production deployment | NOT PERFORMED | Prohibited by D122H |

## Source and staging provenance

- StudioFlow source worktree: `/Users/toddknipple/Documents/StudioFlow/web-122`
- Source branch: `codex/studioflow-122-notes`
- Final source commit: `56f8ad7cc403560e22388e907b2000ee9f49c0db`
- Website branch: `codex/tpi-development`
- JavaScript: `index-D_rpm-10.js`
  - SHA-256: `c029b5099fa67fff2220e823544b19b4ea816679088817244d1de796525cc349`
- CSS: `index-kIGdvrxS.css`
  - SHA-256: `9506b740f488255323852f2e43e95c463b81b66b155cd38d5a32105704cfaee8`
- Staging workflow: `stage-studioflow-authoritative.mjs --apply`, exact clean
  source identity, reproducible builds, and staged asset comparison passed.
- Backend correction: owner-scoped attachment lookup is chunked at 80 note IDs
  per D1 query so large existing Notes libraries do not exceed D1 variable
  limits and return a false 503.
- Production: unchanged; no deployment performed.

## Remaining limitations

Scripts, recordings, media, artwork, guest information, and scenes remain
explicitly omitted until the data model provides verified project/episode
associations. This directive does not introduce synchronization, filesystem
permissions, new infrastructure, or a project-to-Studio migration.

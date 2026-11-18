# Nova Editorial Workspace Content Controls

**Date:** 2026-11-18  
**Scope:** Nova Editorial Workspace articles and research papers  
**Protected applications changed:** None. StudioFlow and the Creator Studio application were not modified.  
**Status:** Deployed and live verified.

## User-facing requirement

Members who create an article or paper must be able to edit it and remove it
from public view. The Owner, Executive, Full Administrator, and Administrator
roles must be able to manage any article or paper when their effective server-
side staff appointment grants that authority. This includes removing
derogatory content while preserving an accountable record.

## Repair applied

- The workspace now resolves editorial-manager access from the effective staff
  appointment instead of trusting a browser-supplied title or base role.
- Contributors continue to see and edit their own content only.
- Authorized editorial managers can review all article records from the
  protected content library, edit content that is not locked in the editorial
  workflow, and remove any article through the protected admin endpoint.
- Author and manager removal now uses a recoverable `status = 'deleted'`
  transition. It removes the article from public lists without hard-deleting
  the article row, linked Nova document, or revision history.
- Removal and elevated edits are written to the existing administrative audit
  log with the actor, target article, previous state, and owner-preservation
  metadata.
- A removed article is separated into a Removed section in the workspace and
  is not offered as an editable draft.
- The active `paper-editor.html` surface now exposes **Move to Trash** from the
  document's More menu, returns to the document list after removal, and keeps
  removed items available under a dedicated Removed filter.
- Linked Nova documents remain owned by their author when an authorized manager
  edits them. Revisions continue to use the author's Nova owner identity, and
  locked submitted/in-review/approved documents remain read-only until the
  protected editorial workflow allows changes.
- The login response now carries the server-resolved staff identity so an
  authorized administrator is not incorrectly denied by the editor's client
  gate.

## Authorization boundary

The manager set is intentionally limited to `owner`, `executive`,
`full_administrator`, and `administrator`. Moderators retain moderation
authority but do not receive blanket editorial ownership or deletion rights.
The server rechecks this boundary on every protected request.

“Delete” in the member workspace means remove from public view and preserve
history. Permanent deletion is not exposed through this article control, so a
mistake can be investigated and recovered through authorized administration.

Workflow-native public content cannot be edited by a direct body write while it
is locked for review. It must continue through the protected Editorial Review
publication boundary.

## Verification

### Source checks

- `node --check functions/api/[[path]].js`
- `node --check paper-editor.js`
- `node --check api-client.js`
- `node --check lib/nova.js`
- `git diff --check`
- `npm run verify:nova-editorial-content-controls`
- `node scripts/qa/tpi-dev-011-admin-functional.mjs`

### Release evidence

- Source commit: `ee214c494aad4da0ae18332de593326385b5703f`
- GitHub parity: pushed to `origin/codex/tpi-development`
- Release impact profile: `full` (the active editor surface and its protected
  content-control regression contract were changed; protected StudioFlow
  source was not modified)
- Preflight result: certified; 40/40 full-platform release gates passed
- Production release: `rel-ee214c494aad-62bb06506c39`
- Production Worker version: `8878cf38-3e9e-4b1d-9680-9f8870ed0eb3`
- Live anonymous production smoke: 10/10 passed
- Firefox Developer Edition production acceptance: passed with the disposable
  `production_qa` account; the owner profile was not accessed
- Rollback reference: `7472d005-6ba9-4eca-9502-42431ac3e3c3`

The release guard also exercised the protected application boundary. The
direct live Firefox run confirmed that the deployed site can still authenticate
the disposable QA account and load the existing StudioFlow application with
all 65 controls and persistence checks passing.


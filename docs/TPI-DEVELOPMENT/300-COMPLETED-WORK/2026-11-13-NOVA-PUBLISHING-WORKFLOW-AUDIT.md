# Nova Publishing Workflow Audit — 2026-11-13

## Outcome

The Nova publishing workflow implementation is present in the current production
code and its editorial submission/event tables are present in production. Local
workflow behavior is covered by passing automated checks. Production review and
publication are **not operational yet**: the production entitlement table does
not accept the reviewer and publisher capabilities needed to grant those roles.

No production article was created or edited. No production database schema or
rows were changed during this audit.

## Scope checked

- Nova editing, save/restore behavior, and version persistence.
- Editorial submission, withdrawal, resubmission, review, feedback, approval,
  publication, and starting a new revision.
- Education destination handling and the Nova/Content Editor surfaces.
- Production schema and permission capability constraints using read-only
  inspection.

## Repair completed

Restoring a server snapshot in either Nova document surface emitted an editor
update. That update could trigger an unintended autosave and an extra version
after a restore. Server snapshot hydration now suppresses that update event;
the browser regression verifies that restore creates exactly one new version
containing the selected snapshot. The Nova Core verifier also now selects an
ephemeral Inspector port, avoiding a collision with the official local Worker.

## Verification

All counts below are local automated verification, using isolated or in-memory
data where applicable:

| Area | Result |
| --- | ---: |
| Nova Core browser/Worker foundation | 105/105 |
| Nova editor, Firefox and Chromium | 134/134 |
| Shared Content Editor | 14/14 |
| Nova persistence | 67/67 |
| Nova Slides | 23/23 |
| Editor parity | 11/11 |
| Nova workstation | 9/9 |
| Editorial workflow R6B | 47/47 |
| Editorial workflow R6C | 23/23 |
| Editorial workflow R6D | 47/47 |
| Editorial workflow R6E | 60/60 |
| Editorial workflow R6F | 26/26 |
| Education destinations | 37/37 |
| Production schema static contract | 12/12 |

Content Editor, standalone Nova, and Administration Center builds succeeded.
The Administration Center build reports its existing large-chunk warning; it
does not fail the build.

## Production findings

Read-only inspection found the editorial submission and event tables, their
append-only triggers, and the `revision_started` event in production. The
production `member_entitlements.capability` CHECK still permits only
`creator` and `contributor`; it rejects `editorial_review` and
`editorial_publish`. Without those grants, staff cannot receive the reviewer
and publisher authority required by the workflow. The production ledger has
six active membership grants and no editorial grants.

Migration `0062_editorial_capabilities.sql` changes the CHECK by creating a
replacement entitlement table, copying existing rows, and dropping the old
table. It is not applied. The repository's agent authority requires separate
owner approval for destructive production data operations and migrations with
irreversible effects. Before that migration can be run, prepare a pre-change
export and explicit row-preservation comparison, then apply the migration and
verify the resulting grants and workflow in production.

## Files changed for this audit

- `nova-app/src/documents/DocumentEditor.tsx` — suppress update emission when
  hydrating the server snapshot.
- `scripts/verify/tpi-nova-003-foundation.mjs` — use an ephemeral Inspector
  port for the isolated Worker.
- `scripts/verify/tpi-nova-004-editor.mjs` — report restore mismatches clearly
  and assert exactly one version increment.
- Generated Nova and Content Editor bundles — rebuilt from the repaired source.
- `TPI-CURRENT-DEVELOPMENT-STATUS.md` and
  `TPI-FUTURE-WORK-REGISTER.md` — synchronize current workflow status.

## Next action

Obtain the owner's explicit approval for the production entitlement-table
rebuild in migration `0062_editorial_capabilities.sql`. After approval, take
and compare the pre-change export, execute the migration through the guarded
production procedure, then create a controlled editorial test article and
verify submission through publication and revision without leaving test content
in the public catalog.

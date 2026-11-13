# Nova Publishing Workflow Audit — 2026-11-13

## Outcome

The Nova publishing workflow implementation is present in the current production
code and its editorial submission/event tables are present in production. Local
workflow behavior is covered by passing automated checks. Production review and
publication are **not operational yet**: although the schema accepts the
reviewer and publisher capabilities, no grants exist. The owner-only grant
interface is deployed and live verified; production review and publication
still require owner-selected capability assignments.

No production article was created or edited. The owner-approved entitlement
schema migration is documented below; all existing entitlement rows were
preserved exactly.

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

## Production findings and approved schema repair

Read-only inspection found the editorial submission and event tables, their
append-only triggers, and the `revision_started` event in production. Before
the approved migration, production's `member_entitlements.capability` CHECK
accepted only `creator` and `contributor`. The owner explicitly approved
migration `0062_editorial_capabilities.sql` on 2026-11-13. That migration alone
was applied directly; the stale production migration ledger was not replayed or
rewritten.

Before applying it, Wrangler exported the complete `member_entitlements` table
to `.local-dev/production-backups/member-entitlements-pre-0062-20261113.sql`
with file mode 0600. SHA-256:
`bce85597fd77a23c9e6dbd82723fd5df7b83019ce11fcbbc3f6fdf33bc9918c4`.
The post-migration scoped export has the same six INSERT rows and the same
canonical data SHA-256 as the pre-migration export. Production checks confirm
both editorial capability strings in the table constraint, both expected
indexes, and no foreign-key violations. All six existing entitlement rows
remain unchanged. No editorial grants were added.

The production `d1_migrations` table still has only its two pre-existing rows.
It is known to be stale against the physical schema; no claim is made that
migrations before 0062 were applied in order. The focused file was applied
because its exact prerequisite schema was verified, rather than using a
blanket `wrangler d1 migrations apply`.

The source now includes an owner-only Nova editorial grant and revocation
control in Administration Center → Creators → Founding Memberships →
Capability inspection. It requires an active inspected account, asks for
confirmation, records the administrative action, and keeps editorial grants
independent from account role and membership. The server rejects admin-only
grant or revoke attempts. Local verifier coverage passed 165/165 and the
Administration Center production build passed. Release
`rel-2126b93a5d67-4b68e0bf8f4e` deployed source commit
`2126b93a5d671d5c4e5e07f8af8667aec1a26de1` as Worker version
`47082bce-2eac-4790-a5c6-c9f7c93ec75e`; anonymous production smoke passed
10/10, isolated Firefox acceptance passed 65/65, and the version holds 100%
of traffic. No editorial grant or article was created or changed.

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

Assign capabilities only to explicitly selected accounts. Then run a controlled
author → review → publication acceptance without leaving test content in the
public catalog. The schema migration and release are complete; no further
schema change is needed for these two capabilities.

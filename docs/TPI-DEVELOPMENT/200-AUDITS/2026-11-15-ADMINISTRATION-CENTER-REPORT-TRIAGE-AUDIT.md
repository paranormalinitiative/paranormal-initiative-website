# Administration Center Report Intake and Triage Audit

Date: 2026-11-15  
Scope: Protected Administration Center Reports & Moderation queue  
Status: Deployed and live verified; protected evidence boundary preserved

## Objective

Complete the first operational moderation step after the role matrix: give
authorized staff one bounded queue for member-submitted video reports,
messenger reports, and member bug reports. The workflow must support review
without exposing private evidence or silently applying a member restriction.

## Current report sources

| Source | Queue status | Detail boundary | Triage contract |
| --- | --- | --- | --- |
| `video_reports` | Included | Video metadata only; private media and credentials excluded | Open, reviewed, dismissed, actioned |
| `messenger_reports` | Included | Reporter/reported identity metadata only; conversation body and conversation ID excluded | Pending, reviewed, dismissed, actioned |
| `member_bug_reports` | Included | Submission metadata, page, title, and description | Open, reviewed, dismissed, actioned |

All three sources remain in their existing tables. No migration, production data
rewrite, or new evidence store was introduced.

## Workflow

1. The server resolves the signed-in account's effective staff appointment and
   allowlists the `/admin/reports` route.
2. The queue provides bounded search, report type, status, date, sort, and
   pagination filters.
3. Staff open a metadata-only detail record and see the report's protected
   privacy boundary before deciding.
4. A supported status may be selected. Reopening to `open` or `pending` clears
   review ownership and timestamp.
5. `reviewed`, `dismissed`, and `actioned` decisions require a concise triage
   note. The server refuses the transition when the note is missing, even if a
   client is modified.
6. The status update records the prior status, new status, actor, and triage
   note in `admin_audit_logs`.
7. The queue refreshes from the server. Report triage does not delete content,
   browse private messages, or apply a member restriction.

## Role boundary

Owner, Executive, Full Administrator, and Administrator may use the protected
Administration Center report route according to the current role allowlist.
Moderators remain on the focused `/moderation` surface; Members remain outside
the Administration Center. The report handler still rechecks authorization on
every request.

## Safeguards

- The API, not the React interface, enforces report type, status, and required
  triage-note rules.
- Private messenger evidence remains excluded from both list and detail
  responses.
- Audit writes identify the actor and report target without copying private
  message bodies or credentials.
- Status changes are confirmation-backed in the interface.
- Triage is intentionally separate from warnings, temporary restrictions,
  appeals, staff suspension, and content deletion. Those are later workflows.
- The release must preserve StudioFlow, Creator Studio, Nova Editor Workspace,
  private media, Crossroads of the Unknown, and owner data.

## Verification plan

- Admin Center preview/source contract must cover all three report sources,
  bug-report detail/status routes, metadata-only responses, the required-note
  server guard, and audit history.
- Admin Center TypeScript/Vite build must pass.
- Worker/API syntax checks must pass.
- Full guarded preflight must pass before production.
- Live anonymous smoke must continue to deny admin APIs.
- Live Firefox acceptance must pass using the disposable synthetic account;
  no owner browser storage or private data is used.

## Release evidence

The exact certified candidate `rel-33a090f8a72c-497b729bbec3` was deployed as
Worker version `771c0fbc-27a8-4af0-8d6a-1e994d0aa9ad` at 100% production
traffic. The shared-API release profile passed its **13/13** certified gates;
production anonymous smoke passed **10/10**. The local authentication
lifecycle passed **38/38**, the Admin Center contract passed **82/82**, the
Help Center separation check passed **21/21**, and the protected-application
integrity guard remained clean. No production migration or report-data rewrite
was performed.

## Not included in this phase

- member warnings or temporary restrictions;
- appeals intake and response;
- staff suspension;
- private conversation browsing;
- automatic content deletion;
- NOVA internal retrieval.

See [Administration Center Role and Action Matrix Audit](2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md)
and the [Internal Help Desk](../TPI-INTERNAL-HELP-DESK.md).

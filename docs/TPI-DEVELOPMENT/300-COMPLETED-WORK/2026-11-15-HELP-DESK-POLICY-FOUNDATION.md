# Internal Help Desk and Policy Foundation

**Date:** 2026-11-15  
**Scope:** Protected Administration Center Help Desk and internal policy
reference  
**Status:** Implemented in source; release verification pending

## Request

Begin the Administration Center roadmap with item 1: make the internal Help
Desk and policy foundation complete enough to support later staff permissions,
moderation, member administration, content management, and NOVA planning.

## What was found

The internal Help Desk already had a protected route, expandable topic groups,
and core procedures. It did not yet have one dedicated policy source or a
consistent record format for the recurring Bug / Repair and release history.
The Administration Center audit also needed to distinguish implemented
workflows from future report, appeal, restriction, and staff-directory work.

## Changes made

- Added `docs/TPI-DEVELOPMENT/TPI-INTERNAL-POLICIES.md` as the active internal
  policy companion to the Help Desk.
- Defined a source-of-truth hierarchy: server authorization, current approved
  interface, active policy/Help Desk, historical records, then future work.
- Documented access and least-privilege rules, member privacy, moderation and
  viewpoint-neutral conduct, report/appeal limitations, account actions,
  editorial publishing, security incidents, and documentation maintenance.
- Added explicit protected-application rules for StudioFlow, Creator Studio,
  Nova Editor Workspace, and other stable applications.
- Expanded the protected Help Desk data with:
  - Internal policy index and source-of-truth rules;
  - staff access quick check;
  - report status and appeal limitations;
  - complete Bug / Repair and release-record procedure; and
  - stable-application release boundary.
- Updated the internal Help Desk Markdown, Administration Center audit, current
  status, and the Problems/Fixes/Featured Products reference.

## Safety boundaries

This work is documentation and protected Help Desk content. It does not:

- connect NOVA to internal sources;
- expose Help Desk content to Mystic or the public Member Help Center;
- grant, revoke, or reinterpret staff permissions;
- implement report triage, appeals, warnings, temporary restrictions, staff
  suspension, or a full staff directory;
- modify StudioFlow, Creator Studio, Nova Editor Workspace, private media, D1,
  R2, or Crossroads of the Unknown; or
- authorize a direct database or production-data change.

## Verification required

Before release, run:

```sh
node --check internal-help-center-data.js
npm run verify:help-center-separation
npm run update:markdown-reference
npm run verify:markdown-reference
```

The guarded release must preserve the existing internal audience gate and
protected application byte guard. The public Mystic knowledge boundary must
remain public-only.

## Remaining work after item 1

The next item is reconciliation of the server role/capability matrix with each
proposed Administration Center action. Later work can then address complete
report triage, appeals, restrictions, staff directory/capability inspection,
content mutations, and finally the separately authorized NOVA retrieval
boundary.

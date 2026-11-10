# TPI-GOVERNANCE-006 — Production Release Record

Date: 2026-11-09/10
Status: COMPLETE — DEPLOYED AND LIVE VERIFIED

## Release identity

- Source and website branch: `codex/tpi-development`
- Source/website commit: `f1c2b2c02c8883eedd69f7abd4c689225530834b`
- GitHub parity: verified before deployment; no unrelated files included
- Release ID: `rel-f1c2b2c02c88-c6acf327c5ce`
- Production Worker: `theparanormalinitiative`
- New Worker version: `6e552552-9458-4506-ab8f-48fd8e4b45fc`
- Rollback Worker: `a8184f43-8d53-437b-9a8f-bc88cef485f8`
- Traffic: 100%
- Production data: preserved; no creator Studio, recording, Note, script, or
  shared storage object was deleted or rewritten

## Included work

- Rank-safe Leadership role catalog with server-derived Gold/Silver/Bronze
  medallions.
- Board Member badge and role/domain appointment workflow with governed ranks.
- Additive production migrations 0067 and 0068, applied in order.
- Shared 18-destination Education Center subject catalog.
- Published contributor subject index, including Steve Glanz's Ethics paper and
  the legacy Water & Steam ITC reference shelf.
- Production asset and documentation updates required by the above workflows.

## Verification

- Release certification: 30/30 gates, PASS.
- Production schema readiness: PASS; all required tables and columns present,
  no pending migrations.
- Anonymous production smoke: 10/10, PASS.
- Live isolated Firefox Developer Edition acceptance: 65/65, PASS.
- Release candidate build: reproducible, PASS.
- Existing production data: preserved, PASS.

The live read-only article API confirmed the record titled “ITC Ethics:
Curiosity Must Be Matched by Responsibility,” authored by Steve Glanz, with
destination `education-area-ethics-professional-standards.html` and published
status. It is therefore available to the deployed subject index.

## Acceptance boundary

The release did not use the owner's Firefox profile or owner credentials. Live
anonymous access to protected Admin Center APIs remains denied as intended.
The actual assignment of Todd Wayne's or Sol's Gold distinction, or any Board
appointment for a named person, remains an explicit authenticated
Administration Center action; the release provides the governed controls and
does not infer or silently assign identities.

## Rollback

If a critical production regression appears, restore Worker version
`a8184f43-8d53-437b-9a8f-bc88cef485f8` using the guarded release rollback
procedure, then rerun production smoke and Firefox acceptance.

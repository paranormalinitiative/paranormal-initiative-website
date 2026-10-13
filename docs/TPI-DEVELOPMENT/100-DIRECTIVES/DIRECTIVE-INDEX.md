# TPI Directive Index

Statuses are evidence-based and refer to the available repository records, not to an assumption that every historical requirement is complete.

| Directive | Title / feature | Status | Evidence or dependency |
| --- | --- | --- | --- |
| TPI-DEV-001 | Development environment standardization | IN PROGRESS / BLOCKED | This documentation set; safe Cloudflare development is blocked by shared Worker and production bindings |
| TPI-DEV-002 | Cloudflare development/production separation audit and migration plan | COMPLETE / BLOCKED FOR EXECUTION | Read-only audit in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-002-CLOUDFLARE-SEPARATION-AUDIT.md`; plan in `docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-DEV-002-MIGRATION-PLAN.md`; no infrastructure changes authorized |
| TPI-DEV-003 | Development workflow verification and setup | COMPLETE / AWAITING OWNER APPROVAL | Read-only workspace verification in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-003-WORKFLOW-VERIFICATION.md`; proposed workflow in `docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-DEV-003-WORKFLOW-PROPOSAL.md`; no setup changes performed |
| TPI-DEV-004 | Official development workflow and documentation | COMPLETE / DOCUMENTATION ONLY | Official workflow README and onboarding updates in `docs/TPI-DEVELOPMENT/`; no branches, application code, Cloudflare resources, deployments, or production changes performed |
| TPI-DEV-005 | Build and deploy isolated development website | COMPLETE WITH OWNER ACCEPTANCE PENDING | Development branch, Worker, D1, R2, sanitized deployment preflight, dev accounts, and runtime verification recorded in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-005-IMPLEMENTATION.md`; production promotion remains prohibited |
| TPI-DEV-007 | Production/development content parity audit and repair | PARTIAL / OWNER ACCEPTANCE PENDING | Development-only synthetic content repair and runtime evidence in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-007-CONTENT-PARITY.md`; broader parity remains limited by missing sanitized fixtures and the local Wrangler `spawn EBADF` E2E runner issue |
| TPI-DEV-008 | Development deployment integrity and source reconciliation | COMPLETE WITH LIMITATIONS | Fail-closed preflight and recovery controls remain in place; source reconciliation and the development-only deployment are recorded in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-009-PRODUCTION-BASELINE-MIGRATION.md` |
| TPI-DEV-009 | Production baseline migration and development parity | COMPLETE WITH LIMITATIONS / OWNER ACCEPTANCE PENDING | Production baseline files were reconciled, the missing development StudioFlow relay schema was applied only to development, and development deployment `a6dded19-2f63-4a98-88c4-30ed3d02ca1b` passed smoke and protection checks; authenticated owner acceptance remains pending in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-009-PRODUCTION-BASELINE-MIGRATION.md` |
| TPI-DEV-010 | Member Login visual repair and authentication navigation audit | PARTIAL COMPLETION / OWNER ACCEPTANCE PENDING | Production and development were compared read-only; development visual/navigation repair deployed as `77f8e9e1-4fdc-4b99-86ca-4b43d8f1d276`; smoke and focused regressions passed, while the local multi-user E2E remains blocked by Wrangler/esbuild `spawn EBADF`; see `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-010-MEMBER-LOGIN-VISUAL-AUDIT.md` |
| TPI-ADMIN-010 | Administration Center functional completion | COMPLETE WITH LIMITATIONS | docs/audits/TPI-ADMIN-010/ and protected preview deployment record |
| TPI-ADMIN-010B | Administration Center follow-up integration | COMPLETE WITH LIMITATIONS | docs/audits/TPI-ADMIN-010B/ and protected preview deployment record |
| TPI-ADMIN-009 | Isolated preview and functional integration | HISTORICAL / SEE AUDIT | docs/audits/TPI-ADMIN-009/ |
| TPI-ADMIN-008A | Production admin deployment request | HISTORICAL / PRESERVED | docs/audits/TPI-ADMIN-008A/ where present; production protection remains controlling |
| TPI-ADMIN-007A | Administrative panel isolation | HISTORICAL / SEE AUDIT | docs/audits/TPI-ADMIN-007A/ where present |
| TPI-STUDIOFLOW-* | Creator Studio directives | HISTORICAL / SEE AUDIT | StudioFlow documents and audits under repository docs and root Markdown |
| TPI-VIDEOS-* | Video and navigation directives | HISTORICAL / SEE AUDIT | Existing directive and audit records |

When a directive has no matching local file, retain this index entry and document the missing source rather than fabricating a completion status.

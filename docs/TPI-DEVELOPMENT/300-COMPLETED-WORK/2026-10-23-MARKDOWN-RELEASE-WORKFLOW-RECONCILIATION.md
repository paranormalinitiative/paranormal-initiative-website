# Markdown Release Workflow Reconciliation

Date: 2026-10-23

Status: COMPLETE / DOCUMENTATION ONLY

## Audit scope

The repository contains 718 tracked Markdown files. A repository-wide search
found 269 files containing release-related terms such as local site, source,
commit, push, deploy, or production. Historical directives, audits, completion
reports, and future proposals were preserved as evidence rather than rewritten
to pretend they were current instructions.

The active operational documentation was reconciled around one source-to-live
chain. Directory index files now state clearly that historical records are not
current deployment commands.

## Canonical result

`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` now defines:

1. The separate authoritative StudioFlow source repository.
2. The deployable TPI website repository and maintained bridge layer.
3. The difference between local website, isolated development Worker, GitHub,
   and live production.
4. The exact source staging, commit, push, preflight, production deployment,
   Firefox acceptance, and documentation sequence.
5. The rule that source saves, local tests, Git pushes, and development-Worker
   deployments do not automatically update production.
6. The current verified application commit, source commit, Worker version, and
   rollback reference.

## Historical preservation

Old directive-specific restrictions and old version records remain valid
evidence for their original executions. The active authority, mandatory
runbook, canonical StudioFlow workflow, README, onboarding, and handoff now
identify where current instructions live so an agent does not follow a stale
record.

## Deployment status

No application code or production asset changed. This documentation-only
reconciliation is committed and pushed, but it must not create a no-op
Cloudflare Worker deployment.

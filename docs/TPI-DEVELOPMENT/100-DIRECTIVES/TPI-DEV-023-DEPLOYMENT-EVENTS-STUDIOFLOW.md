# TPI-DEV-023 — Deployment, Events, and StudioFlow Reconciliation

Date: 2026-10-14
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch: `codex/tpi-development`

## Scope

This directive reconciled the existing development worktree, checkpointed only
verified TPI development changes, deployed the guarded sanitized payload to the
development Worker, verified the repaired Events workflow, reran the relevant
authorization and regression suites, and assessed StudioFlow against the
current repository implementation.

Production, the Desktop research checkout, Tavily, external scraping, database
imports, Founding 50 activation, and production deployment were out of scope.

## Authorization boundary

- Development deployment: authorized and completed.
- Local development checkpoint commit: authorized and completed.
- Push, merge, or force-push: not performed.
- Production deployment or mutation: not performed.
- Development D1/R2: synthetic QA fixtures only.
- Founding 50 activation: remained disabled and was not performed.
- New StudioFlow project architecture: not implemented.

## Outcome

`PARTIALLY COMPLETE / DEVELOPMENT DEPLOYED / EVENTS VERIFIED / STUDIOFLOW PROJECT PERSISTENCE REMAINS OUT OF SCOPE`

The live development deployment and focused Events/media/search checks passed.
The current StudioFlow website integration is coherent for its room and
browser-local recording-library boundary, but it does not provide persisted
project/workspace CRUD. That gap remains a separate implementation decision.

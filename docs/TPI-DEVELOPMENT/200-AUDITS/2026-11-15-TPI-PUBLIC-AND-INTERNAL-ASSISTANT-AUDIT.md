# TPI Public and Internal Assistant Audit

**Date:** 2026-11-15
**Scope:** Member Help Center, protected Internal Help Desk, Mystic, Nova, and
knowledge-source boundaries
**Status:** Audit complete; production release verification remains part of the
current directive

## Current architecture

| Assistant | Audience | Knowledge | Access |
| --- | --- | --- | --- |
| Mystic | Public visitors and members | Public paranormal catalog, Education Center, repository, books, Ghostology, haunted locations, and public Help Center guidance | Public; never internal |
| Nova public mode | Public visitors and members | Public Member Help Center plus public TPI retrieval | Public; never internal |
| Nova internal mode | Owner, Executive, Full Administrator, Administrator, Moderator, and other active authorized staff | Protected Help Desk, policies, Administration Center procedures, release records, and approved internal product documentation | Server-side protected route |

## Findings and disposition

1. **Public knowledge boundary — protected.** Public pages load only public
   Help Center and Mystic data. Internal Help Desk data is not included in
   public HTML pages, the public assistant, or the public retrieval source.
2. **Internal knowledge boundary — protected.** The internal assistant is
   mounted only on protected Help Desk routes and the API requires an active
   authorized staff role.
3. **Mystic/Nova identity — separated.** Mystic answers paranormal questions;
   Nova explains TPI operations and support. Nova routes paranormal questions
   toward Mystic instead of competing with the research assistant.
4. **Knowledge retrieval — provisioned.** The private R2 source and
   `tpi-nova-internal` AI Search instance are separate from `tpi-mystic-public`.
5. **Action authority — fail closed.** Nova is informational. It cannot grant
   roles, modify members, delete records, inspect private messages, or deploy
   releases.
6. **Fallback behavior — present.** Curated local article matching is used
   before model retrieval and remains available when the retrieval service is
   unavailable.

## Remaining release gates

- Run the repository's syntax and separation checks.
- Run local authentication lifecycle and protected Help Desk access checks.
- Run the complete guarded preflight and deploy the exact certified candidate.
- Verify public Nova and protected internal Nova in isolated Firefox Developer
  Edition sessions.
- Record the Worker version, release ID, live result, and rollback reference in
  the completion record and current status.

## Protected products

StudioFlow, Creator Studio, and Nova Editor Workspace were not modified. Any
future work on those applications must be explicitly classified as application
work and use the source-to-live workflow for that application.

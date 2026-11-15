# TPI Administration Center Command Center Audit

**Date:** 2026-11-15 15:54 EST  
**Scope:** Authenticated Administration Center preview and its existing protected API contracts  
**Status:** Audit completed; command-center presentation improved in preview; promotion to the legacy production route remains gated

## Owner request

The Administration Center should be the protected operational home for TPI staff. It should be easy to understand at a glance, show the health of the site, expose the work that needs attention, and eventually provide the authorized administrative actions from one place. The center should use real, authoritative data; it must not display invented uptime, fabricated counts, or controls that the server cannot enforce.

NOVA is intentionally not connected in this phase. The public Mystic assistant remains separate while the internal Help Desk, policy inventory, staff permissions, and documentation are completed.

## Current architecture

There are two administration surfaces:

| Surface | Current role | Decision |
| --- | --- | --- |
| `/admin-panel` and related legacy routes | Existing production Administration Center | Preserve as the current production surface until parity and authenticated owner acceptance are complete. |
| `/admin-center-preview/` | Refine/shadcn reactive preview | Continue as the safe integration surface; do not silently replace the legacy center. |

The preview already uses the protected server-side administration gate. It reads existing APIs for overview metrics, analytics, members, community moderation, reports metadata, notifications metadata, audit history, content queues, provider runs, and other bounded resources. Owner/admin authorization remains server-side; client navigation is not an authority source.

## What is working in the preview

- Reactive overview with range selection, refresh, authoritative D1 metric cards, and navigation into the relevant resource.
- Analytics with member, community, creator, moderation, content, and membership charts where data exists.
- Read-only Platform Health with provider capability states and completed scraper/provider run history.
- Member directory and detail activity with bounded server pagination.
- Community posts, comments, status filters, metadata-only reports, moderation history, and audit logs.
- Protected settings, notifications, channels, teams, education, video, creator, founding, editorial, and event integrations with explicit limits.
- Responsive desktop/mobile shell and TPI theme tokens.
- Owner/admin protection remains separate from public members and editorial-only sessions.
- New Command Center summary blocks: live API reporting state, relative operational queues, readiness gates, protected boundaries, and direct links to Platform Health and Security.

## What is not complete

The following items are not represented as complete merely because a navigation item exists:

- Full staff directory and expanded per-capability inspection.
- Staff suspension, warning, temporary restriction, appeals, and complete report triage workflows.
- Complete member administration and entitlement lifecycle from the preview.
- Complete creator, Founding Membership, Studio access, event, settings, and publishing mutations in one surface.
- A finished internal Help Desk knowledge base and policy inventory.
- An authenticated NOVA retrieval boundary that can safely read internal Help Desk material.
- Final parity review between the preview and the legacy production Administration Center.
- Authenticated owner browser acceptance of the preview on the approved development runtime.

## Command Center design

The dashboard is now organized around four questions:

1. **Is the protected administrative data source responding?**  The snapshot reports whether the overview API is reporting, checking, or unavailable. It does not claim complete infrastructure uptime.
2. **What needs attention?**  Queue bars show relative counts for content review, moderation, creator review, and open report metadata. The bars are deliberately labeled as relative workload, not percentages or service-level targets.
3. **What is blocking NOVA?**  The dashboard calls out incomplete policies, Help Desk documentation, staff capabilities, appeals, and restriction workflows.
4. **What must stay protected?**  The dashboard explicitly preserves owner/admin authorization, Creator Studio, StudioFlow, Nova, private media, and the separation from the legacy production route.

This keeps the initial screen useful without pretending that “site health” is a single number. Detailed provider and run health remains under Platform Health; security boundaries remain under Security; record-level work remains in its own queues.

## Proposed streamlined navigation

The final center should follow this operational order:

1. **Command Center** — health signals, alerts, workload queues, recent activity, and high-value shortcuts.
2. **Members** — directory, member detail, roles/capabilities, restrictions, and account history.
3. **Community & Moderation** — posts, comments, reactions, reports, appeals, moderation history, and standards enforcement.
4. **Content & Publishing** — Education Center, editorial review, approved publication, TPI Videos, comments, events, and teams.
5. **Creators & Membership** — creator directory, Founding 50, memberships, entitlements, channels, and Studio access.
6. **Governance & Permissions** — leadership, board, staff appointments, role inspection, oath acknowledgment, and authority history.
7. **System Health & Security** — platform health, provider runs, authentication/session signals, settings, and security boundaries.
8. **Audit & Help Desk** — audit logs, bug/repair records, policy references, internal procedures, and eventually NOVA.

The preview currently contains most of these resources but still presents some as bounded integrations or read-only views. Navigation should only be consolidated after the underlying permission and mutation contracts are complete.

## Safety requirements for future implementation

- Keep all authorization and capability decisions on the server; never infer authority from a badge, route, or browser state.
- Do not fabricate health, traffic, storage, moderation, or member values. Show “Unavailable” with a reason when no authoritative source exists.
- Every mutation must have an explicit server contract, confirmation where appropriate, actor identity, reason, and append-only audit record.
- Preserve private message bodies, private evidence, recordings, stream keys, and protected application data boundaries.
- Keep StudioFlow, Creator Studio, Nova Editor Workspace, and other stable applications outside unrelated Administration Center changes.
- Classify an Administration Center-only change separately from a full release;
  a shared `worker.js`, authentication, migration, dependency, release-tool, or
  ambiguous change must still escalate to full certification.
- Compare protected application bytes for every release profile and fail closed
  when generated StudioFlow, Nova, or Administration Center assets change
  without matching source paths.
- Keep the preview separate from `/admin-panel` until feature parity, role-matrix testing, authenticated owner acceptance, and rollback verification pass.
- Do not connect NOVA to internal sources until the Help Desk and policy inventory are complete and the internal retrieval boundary is tested.

## Next implementation phase

The next phase should complete the public-facing Administration Center foundation in this order:

1. Inventory and finish the member-facing Help Center, internal Help Desk, policy, bug/repair, and operational Markdown sources.
2. Reconcile the server role/capability matrix with every proposed Administration Center action.
3. Complete the Command Center with recent audit activity and real alert/queue links using existing protected APIs.
4. Finish report triage, appeals, restrictions, and staff directory contracts before exposing mutation controls.
5. Run authenticated owner acceptance on the approved development runtime, then compare parity with `/admin-panel`.
6. Only after those gates pass, define NOVA's internal sources and separate authorization boundary.

## Verification record

- Source inspection confirmed that the preview already contains live overview metrics, SVG charts, and read-only Platform Health.
- The new dashboard summary uses only existing overview data and explicit unavailable states.
- The maintained local launcher now watches `admin-center-preview/` and its generated assets, so a rebuild is promoted into the running local Worker without a manual asset-copy step. Protected StudioFlow/Nova directories remain outside that general-site refresh list.
- The local protected route now uses the maintained clean-URL fallback; `/admin-center-preview/`, `/admin-advanced-settings`, `/admin-events`, and `/teams/admin` returned HTTP 200 for the local administrator fixture, while member and contributor access returned HTTP 403.
- Isolated local browser acceptance passed **56/56**, including all 31 Administration Center resource items, member/contributor denial, no failed local requests, and no significant console errors. Source preview checks passed **82/82**.
- The API smoke fixture passed the shared administrator reads but correctly received HTTP 403 on ten owner/executive-only resources because `local_admin` is intentionally an `admin`, not an Owner fixture. Those routes require a separate authenticated Owner acceptance; no permission bypass was added.
- The exact candidate `rel-86907c5696de-6323c630311d` passed the full 38-gate certification and 10/10 anonymous production smoke. The guarded live Firefox gate then timed out during unrelated StudioFlow recording setup, so the release runner automatically restored Worker `7d6b3674-5396-463d-a4ef-247858b0c849`. The candidate is not live; no StudioFlow source was changed and no certification gate was bypassed.
- No database migration, production data operation, credential change, protected-application change, or legacy route replacement was performed by this audit.
- Documentation-only and preview-source changes require the repository's normal build and QA checks before commit. No production deployment is claimed by this document.
- Follow-up promotion: after the impact-aware release guard passed full tooling certification, the candidate was promoted through release `rel-e5ada60ef448-6f27f390f5ab` as Worker `5bd6d0c9-53cd-4d4d-9021-a57804512b7a`. Anonymous production smoke passed **10/10**, traffic reached 100%, and `/admin-panel`, `/admin-center-preview/`, and `/api/admin/members` remained HTTP 403 without a session. Owner-authenticated browser acceptance remains for the owner; no StudioFlow source or data was changed.


# TPI-DOCS-001 — Master Documentation Status

## TPI-GOVERNANCE-003A — Core Membership & Access Architecture — November 3, 2026

Status: **DOCUMENTATION COMPLETE. NO APPLICATION, DATABASE, OR DEPLOYMENT CHANGE.**

The authoritative model for Free membership, Paid membership, Creator and
Contributor professional access, combined access, and the Founding classes is now
recorded in
[TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md](../TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md).
It is the policy foundation for subscriptions, entitlements, professional
applications, Education Center access, StudioFlow, Nova, achievements, profiles,
honors, and Administration Center management.

What is now policy:

- Membership, payment, professional capability, Founding identity, organizational
  role, achievement, honor, and authority are separate layers that coexist and
  never silently replace one another.
- Paid membership does not include StudioFlow or Nova; Creator and Contributor are
  optional professional families, and Creator + Contributor resolves to the union
  of both with no last-role-wins behavior.
- Purchasing professional access never creates Founding status. Founding
  memberships are conferred, complimentary, lifetime, capped at 50 per class, and
  never recycled.
- Access resolves server-side from the union of valid entitlement sources; a
  cancelled paid plan never erases a Founding capability.

Still open and deliberately unresolved: the paid-plan marketing name, all pricing,
combined-plan packaging, term options, trial policy, the premium-member feature
list, billing provider, cancellation/refund policy, and public commercial terms.

Production state recorded at the same time: the Founding foundation from
TPI-CREATOR-INCENTIVE-001/001B/001R is live and owner-accepted under 001RA, the
registry is empty, and `FAA-001` remains unissued.

The next governance section is **TPI-GOVERNANCE-003B — Operational Roles:
Moderators & Administrators**; it is not defined here.

## TPI-CREATOR-INCENTIVE-001 — Founding Membership foundation — November 2, 2026

Status: **IMPLEMENTED AND TESTED LOCALLY / DEVELOPMENT ONLY. PRODUCTION NOT
DEPLOYED (NOT AUTHORIZED BY THIS DIRECTIVE).**

The membership, entitlement, registry, numbering, administrative, and Creator
Incentive eligibility foundation is now implemented in source and verified
locally. [Directive record](../TPI-DEVELOPMENT/100-DIRECTIVES/TPI-CREATOR-INCENTIVE-001.md)
and [registry specification](../TPI-DEVELOPMENT/TPI-FOUNDING-MEMBERSHIP-REGISTRY.md).

What is now true:

- Founding Creator `FC-001`–`FC-050`, Founding Contributor `FCT-001`–`FCT-050`,
  and Founding All-Access `FAA-001`–`FAA-050` are permanent,
  administrator-assigned identities with non-recycled numbers and a 50-per-class
  lifetime limit.
- Creator and Contributor are **cumulative capabilities**, not mutually
  exclusive roles. All-Access is the union of both capability sets.
- Creator Incentive eligibility is derived from the Creator capability and is
  implemented; **all financial incentive policy remains unresolved owner
  decision**.
- Nova entitlements have a clean contract. **Nothing in the Nova product family
  is built, active, or released.**

What is deliberately not done: production migration, production deployment,
Nova UI, Education Center publishing changes, StudioFlow behavior changes, badge
artwork changes.

Production remains Worker `daa5aee1-304f-4e96-89a8-86aac2df98e9`. The next
production step requires a dedicated release directive under OPS-005.

### Updated sequence position

1. **TPI-OPS-005 — COMPLETE.**
2. **Creator Incentive System + Dual-Member Permissions — FOUNDATION COMPLETE
   LOCALLY.** Remaining: owner policy decisions (incentive financial rules,
   transition policy) and the separate production release directive.
3. **StudioFlow Nova Edit architecture** — not started; entitlement hook exists.
4. **Nova Edit Documents + Slides** — not started.
5. **Nova Editorial Workspace architecture / GenOffice evaluation** — not
   started.
6. **Nova Docs professional editor** — not started.
7. **Education Center publishing workflow** — unchanged.

### Recorded future quality requirements (must stay visible until complete)

These two items are permanently tracked in the roadmap. They are not optional
polish and they are not part of 001A.

- **TPI Administration Center — Complete Quality & Functional Audit.** The
  Administration Center is becoming a critical operational system for community,
  Creator, Contributor, Founding Membership, Creator Incentive, permission,
  moderation, publishing, and future Nova / Education Center administration. A
  dedicated Admin Panel directive must verify every navigation item, form,
  control, server-side authorization path, account-isolation boundary,
  responsive layout, Firefox Developer Edition and Chrome behavior, visual
  consistency, accessibility, error handling, loading and empty states,
  confirmation behavior, audit behavior, deep links, refresh persistence, data
  integrity, and production safety. Goal: *complete, consistent, secure, and
  flawless for normal administrative use.*
- **Founding Membership Badge Integration & Community Display.** **Partially
  complete (001B):** masters are version-controlled, only derivatives are
  published, and badges now render in the Administration Center (class cards,
  registry, capability inspection), the member's own profile, and the public
  contributor profile. **Remaining:** community feed author identity, which has
  no per-author badge field in the feed projection.
- **TPI Society / Leadership Badge System.** Gold, Silver, and Bronze masters are
  preserved in `assets/society-leadership/masters/` as a separate family from
  Founding Membership. The system itself is not implemented: qualification rules,
  assignment authority, audit history, profile/community/leadership display,
  interaction with Founding Membership badges, revocation and status handling,
  and server-side authority mapping all remain **UNRESOLVED — OWNER DECISION
  REQUIRED**. Nothing may be assigned automatically until policy exists.

## TPI-DOCS-ROADMAP-001 — Authoritative roadmap update — November 2, 2026

Documentation only. No application code, permission, membership, Education
Center, StudioFlow, database, or production change was made or deployed.

This section records the current authoritative development sequence and the
Nova product-family decision. It supersedes the October 11 planning order below,
which is retained as historical evidence.

- **TPI-OPS-005 — COMPLETE — CERTIFIED IMMUTABLE RELEASE WORKFLOW VERIFIED.**
  The operations optimization track is **closed**. A release now certifies one
  immutable candidate once and deploys those exact bytes; `release:production`
  no longer repeats the full certification suite. Modelled release sequence
  improved from ~13:46.5 to ~7:12.6 (−47.7% versus the immediately previous
  workflow, −52.0% versus the original). Production was not deployed under that
  directive and remained Worker `daa5aee1-304f-4e96-89a8-86aac2df98e9`.
  [Completion record](../TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-005-CERTIFIED-IMMUTABLE-RELEASE-CANDIDATE.md).
- **StudioFlow Core is stable and in maintenance mode** after the verified
  TPI-STUDIOFLOW-137R production Notes release. StudioFlow is no longer the
  primary development track.
- **Next primary development track: Creator Incentive System + Dual-Member
  Permissions.**
- **Nova product family established** as an architectural decision:
  [TPI Nova architecture record](../TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md).

### Current development sequence

This is the canonical order. A later phase is not authorized merely because it
appears here; each still needs its own directive.

1. **TPI-OPS-005 — COMPLETE.** Operations optimization track closed.
2. **Creator Incentive System + Dual-Member Permissions — NEXT / ACTIVE
   PRIORITY.** A real dual-access member exists and needs correct combined
   capabilities. Cumulative entitlements are mandatory: one membership must
   never overwrite another.
3. **StudioFlow Nova Edit architecture.** Define Nova Core integration with the
existing Notes system.
4. **Nova Edit Documents + Slides.** Build the streamlined Creator workstation
   (documents plus presentations, no editorial authority required).
5. **Nova Editorial Workspace architecture / GenOffice evaluation.** Establish
   the full professional system and the reusable Nova Core.
6. **Nova Docs professional editor.** Professional document authoring.
7. **Education Center publishing workflow.** Create → write → format → preview →
   destination → metadata → submit / review / publish.
8. **Nova Slides professional editor.** The advanced presentation environment.
9. **Shared Nova → StudioFlow presentation integration.** Presentation as a
   production resource for webinar, livestream, and recording.
10. **Founding Membership System.** Founding Creator, Founding Contributor,
    Founding All-Access; permanent numbering, entitlement mapping, registry,
    audit, badges.
11. **TPI Help & Learning Center + Mystic.** Central documentation and help
    system.
12. **Future StudioFlow Guest / Invite Connected Studio. Deferred.**
13. **Future StudioFlow Livestream Destination Connections. Deferred.**

Deferred StudioFlow phases (12 and 13) cover, respectively: invitation, guest
connection, guest Studio/session, permissions, isolation, participation,
disconnect/reconnect, completion; and external destination authentication,
account linking, destination management, connection status, errors, security,
and broadcast routing.

Nova, and the Creator/Contributor/Dual access model it depends on, are recorded
in the Nova architecture record linked above. Do not invent directive numbers
for Nova phases: they are planned phases, not issued directives.

### Release workflow — current normal path

The maintained sequence is now two steps, not three runs of the same suite:

1. `npm run release:certify` (alias `npm run release:preflight`) — certifies one
   immutable candidate; expect **CERTIFIED**.
2. Owner authorizes production.
3. `TPI_PRODUCTION_DEPLOY=approved npm run release:production` — verifies the
   existing certification, verifies the exact candidate, verifies
   production-time requirements, deploys the certified bytes, and performs
   production-only acceptance.

It must not rerun the entire certification suite while the certification
remains valid, and it refuses rather than recertifying when source, dependency,
tooling, configuration, or any deployable byte has drifted.

## TPI-UI-002 — Administration and Settings layout refinement — October 11, 2026

The TPI-UI-002 runtime refinement is complete and deployed. Commits `8e8c0e9`
and `450b446` are pushed to `origin/main`; the final Cloudflare Worker version
is `ddddbb45-d518-46fa-b1e6-4c3f0d530f71`. The first deployment's stale
unversioned asset behavior was corrected by versioning the workspace CSS and
Member Shell requests. Production boundary smoke passed 10/10, including
`/studio/` denial and `/live-video` Coming Soon, and the deployed versioned
assets contain the final layout rules. No production data or unrelated systems
were changed. Authenticated owner/member visual review remains required before
the batch is considered visually accepted.

## TPI-UI-003 — Unified workspace navigation and header corrections — October 11, 2026

The current TPI-UI-003 batch is a scoped frontend repair. Settings now uses the
Administration sidebar's approved outer positioning and flexible content grid;
the existing account/Messenger control has reserved header space on both
workspace routes; and Administration dashboard sections share the available
main-column width. No authentication, authorization, database, R2, recording,
membership, entitlement, role, livestream, or StudioFlow behavior changed.

Focused source/API checks passed, browser visual acceptance remains blocked
without an authorized session. Runtime commit `6e9bf1e` was pushed and deployed
as Cloudflare version `659bdc39-233e-477c-afb1-d6fef00ed791`; production smoke
passed 10/10 on both production endpoints. Stop for owner visual approval.

**Status:** Superseded by TPI-DOCS-002 documentation synchronization — October 11, 2026
**Scope:** Documentation only. No runtime, configuration, migration,
authentication, Cloudflare, database, R2, or StudioFlow source changes were
authorized by this directive.

## Authority and source boundaries

This document and the current top-level sections of
[`MASTER_BUILD_PLAN.md`](../../MASTER_BUILD_PLAN.md) are the current TPI
roadmap references. They consolidate status; they do not replace or delete
historical audit reports.

- TPI live source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- StudioFlow canonical source: `/Users/toddknipple/Documents/StudioFlow/web`
- StudioFlow documentation: `/Users/toddknipple/Documents/StudioFlow`
- Generated TPI `studio/` assets are promotion output, not StudioFlow source.
- Historical plans and audit reports remain evidence and must not be treated
  as a new implementation queue when their status conflicts with this record.

The repository was inspected before editing. Existing unrelated dirty files
were preserved. This synchronization does not modify production systems.

## Superseded development order (October 11, 2026 — historical)

> **Superseded on November 2, 2026 by TPI-DOCS-ROADMAP-001.** The sequence below
> is retained as evidence of the October 11 planning order. It is not the
> current work order. The current sequence is recorded at the top of this
> document.

The order as recorded on October 11 was not to be restarted or reordered:

1. **TPI-VIDEOS-009A** — four-column desktop grid and compact cards. This
   work is implemented through **TPI-MEDIA-001** and remains pending only for
   any explicitly listed owner-acceptance items.
2. **TPI-VIDEOS-010 / 010B** — final TPI Videos and Creator Studio
   integration acceptance. The implementation batch and documented 010B
   acceptance batch are complete; the overall media platform remains READY
   WITH LIMITATIONS pending the explicit open items in the media register.
3. **TPI-SOCIAL-003** — next social-network batch after owner review of the
   remaining 010/010B acceptance limitations.
4. **TPI-ADMIN-001 / TPI-ADMIN-002** — Administration and Network Operations
   Center. Owner authorization was granted on 2026-10-11; the foundation and
   implementation batches are recorded in `docs/audits/2026-10-11/tpi-admin/`.
5. **TPI-FINAL-001** — full website audit.
6. **TPI-FINAL-002** — HTML Help Center, legal/privacy review, and email
   verification.
7. **TPI-FINAL-003** — independent final regression, release, and owner
   acceptance.

No later phase is authorized merely because a planning document exists.
StudioFlow remains feature-frozen except for verified bug, security,
reliability, accessibility, integration, and compatibility repairs.

The completed roadmap records are TPI-MEDIA-001, TPI-DOCS-001,
TPI-VIDEOS-010, TPI-VIDEOS-010B, TPI-SOCIAL-001, TPI-SOCIAL-002, and the
current TPI-SOCIAL-003 audit/repair batch. TPI-ADMIN-001 and TPI-ADMIN-002 are
recorded as completed development batches; Creator Partnership and Founding 50
activation remain gated behind owner review. TPI-FINAL-001 remains queued until
this admin batch is reviewed.

## Completed evidence carried forward

### TPI-MEDIA-001

- Runtime commit: `0e23ff2`.
- Documentation-sync commit: `c0a2601`.
- Runtime Cloudflare deployment: `27d917cd-dff2-4744-9694-0a8c1eab6d35`.
- Documentation-sync Cloudflare deployment: `b29b1c9c-5651-414e-ba4b-48b3a6c6cf75`.
- Responsive catalog result: 4 columns at 1440px, 3 at 1024px, 2 at
  800px, and 1 at 390px, with no horizontal overflow.
- Local API suite: **213/213**. StudioFlow build, room syntax, RTMP syntax,
  and read-only production smoke: **PASS**. Production smoke: **10/10**.
- Anonymous `/studio/` remains denied; public `/live-video` remains Coming
  Soon. No production D1, R2, recording-storage, authentication, or unrelated
  files were changed by the media repair.
- Current classification: **READY WITH LIMITATIONS**. Physical devices,
  long-duration recording, authenticated production publication, public
  playback of creator-owned StudioFlow recordings, and a complete authorized
  creator-publish/playback path remain open.

The detailed evidence remains in
[`docs/audits/2026-10-11/tpi-videos/`](../audits/2026-10-11/tpi-videos/).

### TPI-ADMIN-003 acceptance audit

The existing Administration Center was acceptance-reviewed without a rebuild.
Live anonymous browser checks confirmed the server-side admin restriction, the
protected Creator Studio Coming Soon state, and public `/live-video` Coming
Soon state. The required authenticated owner/admin browser review remains
**BLOCKED** because no already-authorized browser session was available. A
fresh local API rerun was also **BLOCKED** before assertions by Wrangler
`spawn EBADF`; ADMIN-002's prior 225/225 result is preserved as historical
evidence and is not re-counted. No runtime, production data, D1, R2,
recording, membership, entitlement, or deployment changes were made. Full
reports and per-area classifications are in
[`docs/audits/2026-10-11/tpi-admin/TPI-ADMIN-003/`](../audits/2026-10-11/tpi-admin/TPI-ADMIN-003/).

Per the owner review gate, TPI-FINAL-001, Founding 50 activation, production
Creator Studio entitlement grants, public Creator Studio launch, and Help
Center development remain paused.

### TPI-ADMIN-004 authenticated browser continuation

TPI-ADMIN-004 was opened specifically to resolve the ADMIN-003 authenticated
browser gap. No authorized administrator session, Playwright fixture, or
approved isolated authenticated environment was available in this run. The
authenticated portion therefore remains **BLOCKED — AUTHORIZED SESSION
REQUIRED**. No credentials were invented, authentication was bypassed, or
production state was changed. The required continuation reports are in
[`docs/audits/2026-10-11/tpi-admin/TPI-ADMIN-004/`](../audits/2026-10-11/tpi-admin/TPI-ADMIN-004/).

No runtime deployment is required. Await an approved session for the browser
matrix, then stop for owner review again; do not activate Founding 50,
Creator Studio entitlements, public Creator Studio, `/live-video`, or
TPI-FINAL-001.

### TPI-VIDEOS-010B acceptance batch

The bounded local browser acceptance created and finalized a 14-second Program
recording from an isolated `?testMedia=1` session. The saved Library video
reported 13.965 seconds, 1920×1080, and readyState 4. Existing browser-generated
checkpoint/recovery evidence remains authoritative for 8-second and 15-second
sessions, cleanup, Discard, and failed-final-save retention. StudioFlow build,
room, and RTMP checks remain passing, and the prior production boundary smoke
remains 10/10.

The documentation batch is **COMPLETE**. Overall classification remains
**READY WITH LIMITATIONS**. Physical device/native
storage workflows, long-duration reliability, a fresh export-file path,
authenticated creator publication, authorized production playback, and full
Feed integration remain unverified. The full API E2E runner hung before
assertions and is not counted as a pass. No StudioFlow source, production data,
R2, or Cloudflare runtime was changed by this documentation continuation.
The detailed 010B matrix and release report are in the TPI Videos audit folder.

The remaining media acceptance register is maintained in
[`TPI-VIDEOS-010B_TEST_MATRIX.md`](../audits/2026-10-11/tpi-videos/TPI-VIDEOS-010B_TEST_MATRIX.md)
and must be reviewed before Social-003 implementation.

### TPI-SOCIAL-002

The documented runtime commit is `aa6f049`, the documentation commit is
`60135f9`, and the Cloudflare deployment is
`d55c3a01-974c-409c-ab8b-d55d230096cc`. The focused preview, API, browser
link-preview, Messenger-security, and 10/10 production-boundary results are
preserved in the existing audit reports. Full creator publishing into public
playback remains unclaimed without an authorized browser-accessible source.

### TPI-SOCIAL-003

The existing social network was audited and the local multi-user suite passed
213/213. One confirmed Settings defect was repaired: six Content Ownership
cards were being coerced to `NaN` by accidental unary `+` operators. The
focused Settings regression, Settings API/SQLite checks, Messenger media
security, link-preview, video-player, navigation, and syntax checks passed.
The signed-in browser Settings matrix remains blocked because Playwright is not
installed. Data export, account deletion, general Friends relationships,
physical-device, external-provider, and authenticated production mutation
capabilities remain unimplemented or unverified as documented. Production
boundary smoke and the release identifiers are recorded in the Social-003
release report after deployment.

### Founding 50 decision

The owner decision is recorded in the active admin audit: reserve 50
complimentary lifetime Creator memberships, each including free lifetime TPI
Creator Studio access. The Administration Center displays the program as not
activated; no accounts were auto-awarded, no placeholder accounts were created,
and no entitlement records were added. Activation requires a separate owner
release decision.

## Product and access decisions that remain in force

- Navigation uses **TPI Creator Studio** and preserves `/studio/`.
- Creator Studio remains available only to the owner and explicitly
  authorized testers. Anonymous and unauthorized visitors must be denied;
  public launch is not approved.
- Creator recordings are creator-owned. Local browser storage and creator
  device/external storage are the approved defaults. Recording, saving,
  scheduling, or synchronization is not publication.
- TPI-managed cloud recording storage and automatic recording uploads to R2
  are not approved. Existing unrelated Cloudflare infrastructure remains
  protected.
- `/live-video` remains **Coming Soon**; no public livestream launch is
  implied by local or owner-only testing.
- External catalog entries open through their original provider. The native
  TPI player is reserved for explicitly published Creator Studio videos with
  an authorized playback source.

## Help, legal, and email readiness

TPI-FINAL-002 is future work. The eventual Help Center must use existing
branding and accurately document only implemented behavior, including search,
categories, responsive/accessibility behavior, helpful errors, related
articles, maintenance, and links. Terms, Privacy, and related policy pages
must be reviewed for accuracy without inventing guarantees or duplicating
policy collections; professional review should be flagged where appropriate.

The repository's Resend setup file is retained as historical/setup reference,
not delivery proof. TPI's current provider, domain, sender, environment,
templates, workflows, actual mailbox delivery, token expiry, and single-use
behavior remain a future audit item. Resend selection for the separate
Cauldron project does not authorize replacing or copying TPI email
configuration.

## Completion method and limitations

Every future phase must distinguish simulated, local integration, production
endpoint, authenticated production, external-provider, and physical-device
evidence. A build or DOM assertion alone is not a pipeline or accessibility
pass. Unavailable owner credentials, physical devices, external providers,
long-duration windows, or an authorized playback source must be recorded as
**UNVERIFIED**, **PARTIAL**, or **BLOCKED**, never inferred as passing.

This record is the synchronization checkpoint. No code work, Cloudflare
deployment, migration, push to production, or new feature phase was started
by TPI-DOCS-001.

### TPI-ADMIN-006 — integrated Administration Center preview batch

On 2026-10-12, the isolated ADMIN-005 preview was refined in place with the
required Administration navigation, live dashboard/analytics, member
management, Community Feed moderation, classic comment moderation, and audit
views. Incomplete resources remain explicitly bounded and `/admin-panel`
remains the production destination. The current evidence and owner checklist
are maintained in `docs/audits/TPI-ADMIN-006/`; authenticated owner review is
not implied by a successful local build.
### TPI-UI-001 — dedicated workspace shell correction

On 2026-10-11, the confirmed duplicate public/member shell on the protected
Administration and Settings workspaces was corrected with route-scoped CSS and
dedicated headers. Existing auth, role gating, admin/settings logic, and
ordinary member pages were preserved. Focused source regressions pass;
authenticated visual acceptance and release identifiers are recorded in
[`docs/audits/2026-10-11/tpi-ui/TPI-UI-001/`](../audits/2026-10-11/tpi-ui/TPI-UI-001/).

The verified release commit is `89e8bff`; Cloudflare Worker version
`68ad3a56-459c-4ceb-80f2-6cef9f1887db` is live. Anonymous production smoke
passed 10/10. The remaining authenticated visual owner review is not implied by
the anonymous smoke result.
### TPI-UI-002 — workspace layout refinement

TPI-UI-002 is a targeted frontend refinement of the TPI-UI-001 dedicated
Administration and Settings workspaces. It preserves authentication,
authorization, admin/settings logic, Messenger, themes, and all production data
boundaries while correcting workspace header docking, grid width, card density,
and responsive reflow. Focused checks pass; authenticated rendered visual
acceptance remains an explicit owner-review gate. Evidence is in
[`docs/audits/2026-10-11/tpi-ui/TPI-UI-002/`](../audits/2026-10-11/tpi-ui/TPI-UI-002/).

### TPI-ADMIN-007 — Batch A member activity and content-management continuation

On 2026-10-12, the protected Administration Center preview added bounded,
real member reactions, report metadata, member-targeted moderation history,
and safe member-detail activity tabs. Private conversation/message bodies are
not exposed by the expanded activity response. The full ADMIN-007 directive
remains incomplete; evidence and limitations are recorded in
`docs/audits/TPI-ADMIN-007/`.

ADMIN-007A subsequently isolated the legacy Administration Center's Contributor
Invites, Paranormal Teams, and Education Center article-comment resources and
aligned the Refine preview navigation. The repair passed the 13/13 isolation
suite and is pending owner-authenticated visual acceptance.
ADMIN-007B then applied the established six-theme TPI design system to the
protected Refine/shadcn preview without replacing `/admin-panel`. Theme tokens,
semantic shadcn mappings, responsive states, and focus treatment are documented
in `docs/audits/TPI-ADMIN-007/TPI_DESIGN_SYSTEM.md`; owner visual acceptance is
still pending.

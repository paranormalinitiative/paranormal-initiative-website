# TPI-DOCS-001 — Master Documentation Status

**Status:** Documentation synchronization complete — October 11, 2026
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

## Locked development order

The owner-approved order is not being restarted or reordered:

1. **TPI-VIDEOS-009A** — four-column desktop grid and compact cards. This
   work is implemented through **TPI-MEDIA-001** and remains pending only for
   any explicitly listed owner-acceptance items.
2. **TPI-VIDEOS-010 / 010B** — final TPI Videos and Creator Studio
   integration acceptance. The 010B continuation is active but not complete;
   do not start Social-003 until its remaining acceptance items are closed.
3. **TPI-SOCIAL-003** — next social-network batch after the 010 acceptance
   gate.
4. **TPI-ADMIN-001** — Administration and Network Operations Center after
   the preceding gates.
5. **TPI-FINAL-001** — full website audit.
6. **TPI-FINAL-002** — HTML Help Center, legal/privacy review, and email
   verification.
7. **TPI-FINAL-003** — independent final regression, release, and owner
   acceptance.

No later phase is authorized merely because a planning document exists.
StudioFlow remains feature-frozen except for verified bug, security,
reliability, accessibility, integration, and compatibility repairs.

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

### TPI-VIDEOS-010B continuation

The bounded local browser acceptance created and finalized a 14-second Program
recording from an isolated `?testMedia=1` session. The saved Library video
reported 13.965 seconds, 1920×1080, and readyState 4. Existing browser-generated
checkpoint/recovery evidence remains authoritative for 8-second and 15-second
sessions, cleanup, Discard, and failed-final-save retention. StudioFlow build,
room, and RTMP checks remain passing, and the prior production boundary smoke
remains 10/10.

Current classification is **READY WITH LIMITATIONS**. Physical device/native
storage workflows, long-duration reliability, a fresh export-file path,
authenticated creator publication, authorized production playback, and full
Feed integration remain unverified. The full API E2E runner hung before
assertions and is not counted as a pass. No StudioFlow source, production data,
R2, or Cloudflare runtime was changed by this documentation continuation.
The detailed 010B matrix and release report are in the TPI Videos audit folder.

### TPI-SOCIAL-002

The documented runtime commit is `aa6f049`, the documentation commit is
`60135f9`, and the Cloudflare deployment is
`d55c3a01-974c-409c-ab8b-d55d230096cc`. The focused preview, API, browser
link-preview, Messenger-security, and 10/10 production-boundary results are
preserved in the existing audit reports. Full creator publishing into public
playback remains unclaimed without an authorized browser-accessible source.

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

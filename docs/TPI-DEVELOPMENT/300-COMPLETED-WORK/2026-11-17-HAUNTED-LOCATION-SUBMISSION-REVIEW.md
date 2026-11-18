# Haunted Location Submission and Verification Workflow

Date: 2026-11-17
Status: **DEPLOYED AND LIVE VERIFIED.**

## Purpose

Members can now suggest a haunted location for TPI research review from the
public Haunted Locations area. A submission is a private research candidate,
not a published directory entry and not a claim that paranormal activity has
been proven.

The submitter-facing experience follows the existing TPI member shell and the
directory’s visual language. It asks for the information needed to turn a lead
into a complete, investigation-ready location card.

## Required submission information

- Location name.
- State, city or named area, and county.
- Full address or a precise physical reference such as a park entrance,
  bridge, trailhead, lighthouse, cemetery, or landmark.
- Coordinates when known.
- Access status, including public hours, permission requirements, closure, or
  other safety and trespass context.
- A description of why the site is considered haunted.
- Relevant historical context.
- Specific reported activity tied to a place or area.
- Rooms, floors, outdoor sections, trails, or other meaningful investigation
  zones.
- Sources and references.
- Optional submitter notes.
- Consent confirming that the submission does not contain private addresses,
  uninvolved personal information, trespassing instructions, or material the
  member does not have permission to share.

## TPI verification standard

The review follows `TPI_Research_System_v8.md` in the States HTML research
reference. A lead is not ready for the public directory unless it can support
a full card with a traceable location, historical context, specific reported
claims, meaningful zones, access information, and sources.

Reviewers must:

1. Confirm the site identity and location from authoritative public sources.
2. Separate documented history from reported, folkloric, or investigative
   claims.
3. Check that reported activity is specific and tied to rooms, zones, or
   meaningful outdoor areas rather than a generic “haunted” label.
4. Check access, privacy, safety, and operator-permission concerns.
5. Reject vague regions, private residences, unsupported rumors, fictional or
   entertainment-only attractions, and entries without enough investigation
   value.
6. Add the location to the appropriate state directory only after verification
   and a deliberate content change.

## Administration Center boundary

Submissions are stored in the additive `haunted_location_submissions` table and
appear in the authorized Administration Center Reports & Moderation queue as
`Haunted location submissions`. The detail view exposes the submitted research
fields to authorized reviewers and records triage decisions in the existing
admin audit log.

The queue does not publish, edit, or automatically create a directory entry.
Marking a submission reviewed, dismissed, or actioned changes only its review
state. Public publication remains a separate, verified directory edit.

## Protected behavior

- The submission endpoint requires an authenticated member session.
- Server-side validation repeats the required field and consent checks; client
  form validation is not trusted by itself.
- The submission table is private and not included in public directory APIs.
- Administration Center access continues through the existing owner/admin
  authorization gate.
- Location submissions use the existing report triage and audit boundary and
  do not expose private messages or unrelated moderation evidence.
- The release impact classifier treats the migration, Worker API, and Admin
  Center changes as a protected shared release profile.

## Files

- `haunted-location-submit.html`
- `haunted-locations.html`
- `haunted-location-directory/index.html`
- `functions/api/[[path]].js`
- `migrations/0074_haunted_location_submissions.sql`
- `admin-center-app/src/app.tsx`
- `admin-center-app/src/lib/api.ts`
- `scripts/local-application-schema.mjs`

## Verification record

The local schema/API regression passed **7/7**, the Administration Center
source contract passed **95/95**, the community workstation contract passed
**21/21**, the release-safety contract passed **38/38**, and the Administration
Center production build passed. The maintained local schema verifier applied
0074 successfully and the live production schema check passed with all required
tables and columns present and no pending schema requirements.

The guarded release preflight classified this as Tier 1 / full shared release
and certified the exact source commit `ac809c7bb58bf042dd738f573ce1865d9625522e`
with **40 gates passed** in **7m 10.428s**. The immutable candidate was
`rel-ac809c7bb58b-4e1e1c314d42` with manifest digest
`b7525c72d54f79aaffeec8d68c2a1e848106a71ac1e69f723edcaeb7cafd5d9b`.

The reviewed additive migration was applied individually to production; no
blanket migration replay was used. The exact certified candidate then deployed
and was live-verified at 100% traffic as Worker version
`18efd9db-31a5-40e0-ab0a-db46f3510535`, with rollback target
`ec48d535-7e8a-4bf6-a208-b5cda0e4c3be`. Production smoke passed **10/10** and
isolated Firefox Developer Edition acceptance passed **65/65**. No protected
application was rebuilt or modified by this website/Admin Center change.

### Follow-up visual alignment — 2026-11-17

The member submission page was brought into the shared TPI design system after
owner review showed insufficient side padding and native browser form controls.
It now uses the active TPI theme tokens, the same card and control surfaces as
the member site, consistent button treatment, readable internal spacing, and a
responsive one-column layout on narrow screens. The focused community
workstation contract passed **22/22**. CSS-aligned release
`rel-ca3c4f688af3-81b1df3d77f4` deployed source commit
`ca3c4f688af39f84f3271ed4de3d14607d4d7f9f` as Worker
`7459531a-e4d6-4274-a304-ed7397de0850` at 100% traffic; production smoke
passed **10/10** and rollback target is
`18efd9db-31a5-40e0-ab0a-db46f3510535`. StudioFlow, Nova Workspace, Creator
Studio, and unrelated data were not modified.

The follow-up page-frame correction removed the ordinary member-sidebar
offset from this dedicated form and added balanced top, bottom, left, and right
viewport padding, with a separate mobile frame rule. The focused contract
remained **22/22**. Release `rel-f6fdb91df9a0-9d3a9965821e` deployed source
commit `f6fdb91df9a0735b2025b0aa29d75c3c6273759e` as Worker
`036e8a3c-13d8-4dc4-b63e-6d706f8488f2` at 100% traffic; production smoke
passed **10/10** and rollback target is
`7459531a-e4d6-4274-a304-ed7397de0850`.

Owner review then identified that the form was still being laid out beneath
the visible member sidebar and that the shared automatic `Hello, Todd` heading
was redundant. The final correction restored the normal desktop sidebar offset,
added the tablet breakpoint, keeps zero sidebar offset only on mobile where the
sidebar is hidden, and suppresses the duplicate page heading on this dedicated
form. Release `rel-5b4564dd52ac-04290b2ba2fb` deployed source commit
`5b4564dd52acc7615ae636be23c2ae9a0ce0e249` as Worker
`1500b0a3-c7db-4050-95a7-e38dffbb4fd0` at 100% traffic; production smoke
passed **10/10** and rollback target is
`036e8a3c-13d8-4dc4-b63e-6d706f8488f2`.

The next live visual review found the remaining cause of the edge-to-edge
content: the shared member stylesheet intentionally resets generic section
padding to zero. The form card’s original class selector therefore lost the
cascade, even though its padding was present in the page source. The permanent
repair scopes the card rule under `body.member-mode`, giving the TPI submission
card higher, page-specific specificity without changing the shared member
reset. Release `rel-5e8c3d5a4110-8b1a03db45a4` deployed source commit
`5e8c3d5a411097c658951414a4ca4ede98527caa` as Worker
`9b5a8be5-7ce8-407b-8fa8-1a8c6e734aed` at 100% traffic; production smoke
passed **10/10** and rollback target is
`1500b0a3-c7db-4050-95a7-e38dffbb4fd0`.

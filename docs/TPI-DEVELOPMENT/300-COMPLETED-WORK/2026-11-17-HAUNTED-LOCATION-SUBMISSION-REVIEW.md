# Haunted Location Submission and Verification Workflow

Date: 2026-11-17
Status: Implemented; guarded release and live acceptance pending.

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

The final record must include the local schema/API checks, Admin Center build,
Markdown-reference verification, guarded preflight, production deployment, and
Firefox Developer Edition acceptance for the public submission page and the
authorized review queue. No protected application should be rebuilt or
modified by this website/Admin Center change.

# Mystic and Nova — Identity, Sitewide Coverage, and Knowledge Boundaries

Date/time: **2026-11-16 14:41 EST**
Status: **DEPLOYED AND LIVE VERIFIED**

## Owner request

The owner asked for a clear distinction between Mystic and Nova so members do
not confuse a paranormal research assistant with the TPI Help Center and Help
Desk assistant. The owner also asked for the public Help Center and public
knowledge coverage to continue, for Nova to be reachable throughout the site,
and for the protected Administration Center and internal Help Desk to link
directly to Nova.

## Identity contract

### Mystic — paranormal research assistant

Mystic is the public TPI companion for paranormal subjects: ghosts,
Ghostology, haunted locations, equipment, weather and environmental effects,
intake, walkthroughs, baselines, evidence review, books, and public research.
Mystic uses public TPI sources only and separates reported experiences from
verified conclusions.

### Nova — TPI Help Center and Help Desk assistant

Nova explains how The Paranormal Initiative works: accounts, profiles,
Community Feed, Messenger, notifications, media, policies, reporting, public
apps, StudioFlow guidance, Creator Studio guidance, and Nova Editorial
Workspace guidance. On protected internal surfaces, Nova explains approved
Administration Center, moderation, security, policy, release, and operational
procedures for authorized staff.

Nova cannot grant access, change roles, ban members, delete data, inspect
private messages, deploy releases, or bypass server authorization.

## What changed

- Added a visible assistant directory to the public Help Center so visitors can
  choose Mystic for paranormal research or Nova for using TPI.
- Distinctly labeled both launchers, panels, role descriptions, prompts, and
  handoff links.
- Added deterministic public Mystic answers for ghost definitions, MEL/EMF
  meters, weather effects, case intake, and investigation walkthroughs, each
  linked to a public TPI source.
- Added a shared, non-blocking sitewide assistant loader through `includes.js`.
  Public pages load only public Help Center and Mystic knowledge. Internal
  pages load the protected Help Desk data and Nova only.
- Added the Help Center / Ask Nova link to the shared site header and an Ask
  Nova · Help Desk link to the protected reactive Administration Center.
- Kept the existing protected internal Help Desk route and server-side Nova
  authorization unchanged.
- Advanced shared asset cache versions so browsers and the maintained local
  Worker receive the current assistant assets.

## Safeguards

- `internal-help-center-data.js` is loaded only on the internal assistant
  branch and is never loaded by the public branch.
- Mystic never loads internal Help Desk data or internal retrieval endpoints.
- Internal Nova retrieval remains server-authorized and fails closed for
  anonymous and ordinary member sessions.
- The sitewide loader is asynchronous and decorative; it does not block page
  rendering or alter protected application directories.
- StudioFlow, Creator Studio, Nova Editor Workspace, private media, D1, R2,
  and owner data are outside this change.
- New source-contract checks cover identities, sitewide loading, public/internal
  data separation, and Administration Center linking.

## Verification plan

- JavaScript syntax checks for the changed assistant, include, and knowledge
  files.
- Help Center separation and public/internal boundary checks.
- Public direct-answer checks for Mystic's five documented question families.
- Administration Center build and protected link check.
- Full maintained release preflight, guarded production deployment, anonymous
  smoke, and isolated Firefox Developer Edition acceptance.

The focused Firefox profile/feed acceptance passed **55/55** after the
acceptance harness was aligned with the new Nova profile-help boundary and a
bounded retry was added for a transient profile-shell bootstrap race. The
production Help Center separation probe passed **31/31** against
`https://paranormalinitiative.com`; anonymous `/help-center.html` returned
200 and anonymous `/internal-help-center.html` returned 403.

## Release record

- Website commit: `9bbfd62591d3f2d7f940f61a441699849a8b813e`
- Release ID: `rel-9bbfd62591d3-5da81729f15f`
- Worker version: `797a0c7f-91bd-4bb1-b195-582750d85b41`
- Rollback reference: `36cffaa9-1ac6-4dc1-93c4-a7f767cac648`
- Certification: Tier 1 website profile; 13 gates passed; manifest digest
  `fe326ab505a7dc73fbee67d157329266accb7ed1c08484f5b94378acad7bee5c`
- Production smoke: **10/10**
- Local focused Firefox profile/feed acceptance: **55/55**
- Production Help Center separation probe: **31/31**
- Intentional behavior change: Mystic is now clearly reserved for public
  paranormal research and education; Nova is the clearly labeled TPI support
  assistant and the protected internal Help Desk assistant. Internal Help Desk
  knowledge is never loaded into public pages.

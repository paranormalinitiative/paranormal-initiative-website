# TPI-STUDIOFLOW-122E — Home navigation and dialog usability corrections

Date: 2026-10-31  
Environment: Authoritative local development Worker only  
URL: `http://127.0.0.1:8787/studio/`  
Status: COMPLETE / DEVELOPMENT ONLY / NOT DEPLOYED

## Scope

D122E corrected three owner-facing usability issues without changing the
production Worker, persistent data, recording behavior, or deletion authority:

1. Added a Home Create card for the existing Notes workspace immediately before
   Teleprompter.
2. Separated the selected Studio identity from the displayed application route.
   Explicitly exiting a Studio now persists Home; the Worker bridge still
   hydrates the selected Studio configuration but no longer rewrites Home or
   Notes into the Studio route during startup.
3. Added a viewport-bounded, vertically scrollable class to the permanent
   deletion dialog. The existing permanent-deletion gate remains disabled.

## Root cause

The React exit handler only called `setRoute("home")`, while the maintained
`studio/workspace-bridge.js` startup refresh treated any remembered workspace
as a command to rewrite `studioflow.route` to `studio`. The bridge therefore
restored the correct Studio data and the wrong visible page after refresh.

The repair persists `home` at the explicit exit boundary and changes bridge
startup hydration to preserve the saved page route. It does not clear
`studioflow.activeBroadcastId`, the selected Studio, or its configuration.

## Source and integration changes

StudioFlow source commit:
`046ae3aaeebf9945597ce7373f5a9ada8a00cd37`

Source worktree:
`/Users/toddknipple/Documents/StudioFlow/web-122`

- `src/App.tsx`: Notes Home card and route-persisting Notes navigation; explicit
  Studio exit persists Home; deletion dialog receives the scoped scrolling class.
- `src/styles.css`: `.studio-delete-modal` uses a `90dvh`/viewport maximum,
  vertical overflow, overscroll containment and stable scrollbar space.
- `studio/workspace-bridge.js`: startup hydration preserves Home/Notes/library
  routes and only replays the React Studio view when the persisted route is
  already `studio`.
- `scripts/verify/tpi-studioflow-122e-home-navigation.mjs`: focused Firefox
  acceptance for this directive.
- `scripts/verify/tpi-studioflow-122-notes.mjs`: test setup explicitly enters a
  disposable Studio and uses the accessible Notes rail control.

## Build and provenance

The isolated source build passed TypeScript and Vite production build. The
provenance-controlled staging workflow built the approved commit twice and
staged matching assets on 8787:

- JavaScript: `index-CAngUv37.js` — SHA-256
  `e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`
- CSS: `index-CxtEcOJP.css` — SHA-256
  `c4a34d03e42c981b2168e6287e232552ba1cdcb0676b2067ff33cbe573487254`

`node scripts/stage-studioflow-authoritative.mjs --apply` reported `STAGED`,
reproducible builds, matching baseline assets, and matching staged assets. The
Worker remained the existing local `workerd` at port 8787.

## Acceptance evidence

| Check | Result |
| --- | --- |
| Home Create card order: Live stream, Recording, On-Air webinar, Notes, Teleprompter | PASS |
| Notes card opens the existing Notes workspace | PASS |
| Explicit Studio exit persists Home | PASS |
| Selected Studio identity remains persisted after exit | PASS |
| Refresh after exit remains Home | PASS |
| Notes destination survives refresh | PASS |
| Archived deletion dialog opens at reduced viewport | PASS |
| Dialog has bounded height and vertical scrolling | PASS |
| Confirmation input reaches the scrollable bottom | PASS |
| Cancel closes without mutation | PASS |
| Permanent deletion remains disabled | PASS |
| Focused D122E Firefox checks | 22/22 PASS |
| Maintained Notes Firefox acceptance | 57/57 PASS |
| Maintained StudioFlow Firefox regression | 64/64 PASS |
| Release-safety contract | 21/21 PASS |
| Production deployment/data changes | NONE |

The browser runs used disposable Firefox profiles and disposable test account
data. The archived-dialog test restored its temporary archived Studio after
verification. Existing owner Studios, recordings, scripts and preferences were
not used as disposable fixtures.

## Deletion safety

`permanentStudioDeletionAvailable()` remains `false`; the React confirmation
button and Worker bridge remain fail-closed. D122E changes layout access only.
No Studio, recording, media object, D1 database, R2 object, or production
configuration was deleted or migrated.

## Release status

The candidate is ready for owner review on the authoritative local URL. It is
not a production release. Production remains unchanged.

Website implementation/documentation commit: recorded in the final Git handoff
after commit and push.

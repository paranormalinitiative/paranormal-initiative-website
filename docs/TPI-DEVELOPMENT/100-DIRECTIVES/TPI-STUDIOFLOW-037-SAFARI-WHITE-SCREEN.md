# TPI-STUDIOFLOW-037 — Safari White-Screen Investigation & Repair

## Scope

Local development only. The objective was to repair Safari rendering for the clean
`localhost:8787` Member Home and StudioFlow routes without changing authentication,
browser storage, D1, or owner Studio data.

## Investigation result

The Worker served the explicit documents successfully, but its direct asset handler
did not consistently resolve clean URLs to the existing static files:

- `/member-home` did not fall back to `member-home.html`.
- `/studio/` did not fall back to `studio/index.html`.
- `/` did not fall back to `index.html`.

Safari therefore received an empty 404 document for the clean routes. Direct
`.html`/`index.html` navigation rendered the complete application in Safari, which
distinguished the routing defect from Safari JavaScript, authentication, IndexedDB,
or media compatibility.

## Authorized repair

`worker.js` now uses a narrow `servePageAsset` fallback. It first preserves the
existing asset response and only maps a 404 clean page request to its corresponding
`.html` or `index.html` asset. The existing local Creator Studio authentication gate
remains in place; unauthenticated `/studio/` continues to return the intentional 403
boundary.

## Verification

- Safari directly rendered authenticated `/member-home?username=todd_wayne`.
- Safari directly rendered authenticated `/studio/`.
- Safari authenticated `/` redirected to `/member-home` and rendered.
- Chrome reached the local Member Login route in the separate verification tab;
  existing unrelated Chrome tabs were not changed.
- Focused Safari-route checks: 7/7.
- Authentication regression: 27/27.
- TPI-017: 14/14; TPI-023: 14/14; TPI-030: 13/13; TPI-031: 12/12;
  TPI-032: 11/11; TPI-034: 10/10.
- JavaScript syntax checks and `git diff --check` passed.

Browser console inspection was not exposed by the available native automation, but
direct Safari rendering plus HTTP and source evidence identified the failure and
verified the repair.

## Data protection

No browser storage, cookies, IndexedDB records, media, recordings, D1 records, or
credentials were cleared or changed. The protected Crossroads workspace was read-only
verified as active with its expected workspace and broadcast IDs, title, and current
version 160. No production resource, deployment, commit, or push was used.

## Remaining limitations

Safari-specific filesystem backup capability and room/guest service availability were
not changed by this repair. They remain separate verification concerns.

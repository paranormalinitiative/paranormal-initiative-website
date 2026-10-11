# TPI-VIDEOS-005 Release Report

Implementation was released through the established workflow. Canonical StudioFlow source changed in `Documents/StudioFlow/web/src/App.tsx` and `src/styles.css`; the TPI worker/API and generated `/studio/` assets changed in this repository.

Local evidence: StudioFlow production build PASS; TPI API E2E PASS 207/207; generated asset dry-run matches StudioFlow `dist` except for the preserved TPI theme bridge wrapper in `studio/index.html`.

Release identifiers:

- StudioFlow local source commit: `8437b07` (no configured remote in that workspace).
- TPI GitHub commit: `d743a67`, pushed to `origin/main`.
- Cloudflare Version ID: `fced668f-8949-4e5e-8153-663462702084`.

Production boundary verification passed for anonymous public/API behavior. Authenticated owner/contributor browser mutations, notification inbox delivery, external provider playback, and physical offline behavior remain explicitly unverified and are listed for owner acceptance.

## TPI-VIDEOS-005-A — Navigation branding

The member/sidebar and injected mobile navigation labels were updated from
`Creator Studio` to `TPI Creator Studio`. Both surfaces preserve the existing
`/studio/` destination and the protected StudioFlow access boundary. The
focused navigation regression passed; no StudioFlow source or generated
StudioFlow functionality was changed.

Release identifiers for this addendum:

- TPI GitHub commit: `e1ddab2`, pushed to `origin/main`.
- Cloudflare runtime Version ID: `3626c893-7043-4cb5-9dbb-7e8011bf7fde`.
- Cloudflare documentation-sync Version ID that published this release record:
  `24edd085-67ae-4522-b2c5-de2086902828`.

Production verification passed on 2026-10-11:

- `/member-sidebar.html` returned 200 and contains `TPI Creator Studio` with
  the unchanged `/studio/` link.
- `/member-shell.js` returned 200 and contains the matching mobile label,
  accessible name, and unchanged `/studio/` link.
- Anonymous `/studio/` returned 403 with the existing Coming Soon gate.
- Public `/live-video` returned 200 with the existing Coming Soon message.
- No database, R2, recording-storage, authentication, or StudioFlow bundle
  change was made.

The focused static regression and JavaScript syntax check passed. The existing
member-settings test passed its isolated API/SQLite portion, but its browser
portion was not run because Playwright is not installed in this checkout.

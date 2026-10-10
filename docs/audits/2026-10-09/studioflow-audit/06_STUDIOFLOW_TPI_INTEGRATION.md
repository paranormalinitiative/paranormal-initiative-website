# StudioFlow TPI Integration

## TPI repository

TPI checkout:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Current TPI HEAD:

`9779af29d37406da8af69ebcb4cdbd69ea61847e` — `Restore worker asset exclusions`

The checkout has pre-existing changes in `education-center.html`, `index.html`, `scripts/build-sitemap.js`, `sitemap.xml`, an untracked competitive audit, and `docs/`. None were altered by this directive.

## Route behavior

`worker.js` handles StudioFlow as follows:

- `/studio/guest/*` is handled before the host gate for guest invite links.
- `/studio/assets/*` is publicly served so the app bundle can load.
- Host `/studio` and `/studio/*` requires a session user whose role is `owner` or `admin`.
- Unauthorized host requests receive a 403 private-build gate.
- `/live-video` and its HTML entry point present the StudioFlow launch surface with “Coming Soon” messaging and a `/studio/?mode=live` link.

This preserves the current private-build boundary. The directive did not modify `worker.js`, navigation, permissions, or production behavior.

## Bundle integration

The generated StudioFlow entry references `/studio/assets/index-BnVhfqg-.js` and `/studio/assets/index-BdUF5pZO.css`. The TPI `studio/index.html` includes Google API scripts and an additional TPI site-theme bridge that applies the selected member theme through CSS variables. The generated JS/CSS/image assets match the isolated candidate and canonical `dist` output.

## Compatibility findings

- The `/studio/` Vite base path is compatible with TPI static asset serving.
- The private host gate is outside the React bundle and remains intact.
- Guest assets are intentionally public, while the host page is gated.
- Local development room/RTMP services are not TPI production services.
- The frontend contains production-oriented same-origin API paths, but runtime API, room, guest, and livestream behavior was not exercised in this directive.
- A TPI-specific `index.html` wrapper means promotion must preserve the theme bridge rather than blindly replacing it with raw Vite output.

## Integration acceptance

Before any future promotion, verify anonymous host blocking, owner/admin access, guest-link behavior if in scope, asset loading, theme application, `/live-video` messaging, and unrelated TPI pages. No production deployment or permission change was performed here.


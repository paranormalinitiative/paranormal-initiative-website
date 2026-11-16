# Research & Investigation Studio — Source to Live

The Research & Investigation Studio is maintained in the separate source
repository:

`/Users/toddknipple/Documents/GitHub/TPI-Research-and-Investigation-`

Its Markdown project documents define the feature requirements, parity notes,
completion reports, and remaining work. The website repository contains only
the reviewed, generated promotion under:

`/apps/paranormal-initiative/`

## Promotion sequence

The reviewed WEB-021B candidate is the default source checkout for staging:

```sh
npm run stage:research-investigation
npm run dev:local:refresh
```

The staging script builds the source with the website base path, copies the
production build into the website asset tree, and scopes the app manifest and
service worker to `/apps/paranormal-initiative/`. It does not modify the source
repository, local D1/R2 state, or owner data.

The official development URL is:

`http://127.0.0.1:8787/apps/paranormal-initiative/`

Port `8790` is retired for current work. Do not start or use the separate
Research Studio Vite server; it is not an owner-facing environment and must
not become a competing local application. All current development, browser
acceptance, and owner review use the canonical Worker on port `8787`.

After the generated tree and website links pass local verification, the
canonical website runbook applies:

```sh
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

Production URL:

`https://paranormalinitiative.com/apps/paranormal-initiative/`

## Current release position

- WEB-021B implementation and Firefox reliability work: complete.
- Owner visual acceptance: pending.
- Case Package Export & Import: not implemented; scheduled as WEB-022.
- The Apps detail page therefore presents this as a browser beta, not a final
  completed product release.

The website Apps card remains the public directory entry. Its visual treatment
is unchanged; the detail page now provides the browser-beta launch link.

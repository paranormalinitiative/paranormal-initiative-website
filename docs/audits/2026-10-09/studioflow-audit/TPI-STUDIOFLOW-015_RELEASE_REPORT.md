# TPI-STUDIOFLOW-015 / 015A — Release Report

Date: 2026-10-10

## Scope

This release promotes the verified StudioFlow Destinations redesign and the
015A platform-capability audit. It does not add OAuth, provider tokens,
credential infrastructure, database migrations, R2 changes, recording-storage
changes, or authentication changes.

## Source and GitHub commits

- Canonical StudioFlow source: `/Users/toddknipple/Documents/StudioFlow/web`
- Canonical source commit: `2123594` — `Add visual destination selector and platform status`
- TPI generated integration commit: `5ae330a` — `Promote StudioFlow destination selector`
- GitHub remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`
- Branch: `main`
- Push: **SUCCESS**; `origin/main` matched `5ae330a`.

The canonical source repository has no configured remote, so its commit is
local history. The pushed production artifact is the generated `studio/`
bundle in the TPI repository.

## Verification before deployment

- `npx tsc --noEmit`: **PASS**.
- `npm run build`: **PASS**; existing large-main-bundle warning only.
- `git diff --check`: **PASS**.
- TPI `node --check worker.js`: **PASS**.
- Generated candidate parity: all `web/dist` payload files matched TPI
  `studio/assets`; intentional differences were limited to the TPI HTML theme
  bridge and the pre-existing `.DS_Store`.
- Local browser verification: visual platform selector, manual RTMP fallback,
  unsupported-provider state without fake OAuth controls, saved destination
  preservation, hidden stream keys, confirmation removal, and Create Live
  Stream catalog reuse all passed.

## Cloudflare deployment

- Worker: `theparanormalinitiative`
- Account: `221ea5479876fd303ddc87002b9e892d`
- Cloudflare Worker Version ID: `62eb6e2c-ae38-45c8-8bcd-a91c2833d6b8`
- Deployment source: clean archive of pushed commit `5ae330a`.
- Uploaded assets: `/studio/index.html`,
  `/studio/assets/index-CI5wW6U1.js`, and
  `/studio/assets/index-D0zLTSHK.css`.
- Existing `TPI_DB`, `TPI_MEDIA`, asset routing, scheduled trigger, and
  authentication code were preserved.

## Production verification

- `https://paranormalinitiative.com/`: HTTP **200**.
- `https://paranormalinitiative.com/live-video`: HTTP **200**, existing
  Coming Soon surface preserved.
- `https://paranormalinitiative.com/studio/`: HTTP **403**, Creator Studio
  Coming Soon/private access gate preserved.
- Direct new JavaScript asset: HTTP **403** when unauthenticated.
- Direct new CSS asset: HTTP **403** when unauthenticated.
- Browser inspection of public `/studio/` showed “Creator Studio — Coming
  Soon” and the message that authorized owner/test access remains protected.

Authenticated owner interaction with the live selector was not claimed because
the verification browser had no signed-in owner/admin session. The public
access boundary and direct-asset protection were verified successfully.

## Final status

**DEPLOYED with protected production access and partial live verification.**
The completed visual destination changes are live for authorized access, while
members and visitors continue to receive Coming Soon. Automatic provider
connections remain unimplemented and are documented as such.


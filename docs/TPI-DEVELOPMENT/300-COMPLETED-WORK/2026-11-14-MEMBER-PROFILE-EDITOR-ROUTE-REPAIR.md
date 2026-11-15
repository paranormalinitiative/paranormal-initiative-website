# Member Profile Editor Route Repair

## Incident record

- **Date:** 2026-11-14
- **Time reported:** 14:51:38 ET, shown in the supplied Messenger screenshot
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Member Profile, avatar upload, background/banner upload, production routing
- **Scope:** Site-wide member experience; applies to every signed-in member
- **Sitewide marker:** **YES — the direct editor route and profile-media path are shared production behavior.**
- **Protected applications changed:** None. StudioFlow, Nova Workspace, and
  Creator Studio were not modified.

## What happened

Members were still reporting that avatars and profile backgrounds could not be
loaded or updated. The upload permissions and storage paths from the earlier
profile-media repair were present, but the production **Update Profile** route
did not open the editor form. A direct request for
`/member-profile.html#profile-editor` was redirected to `/member-profile`,
which is the public profile shell and does not contain the editor form.

This made the member-facing experience look like an upload or permission
failure even though the upload code itself was healthy. Local acceptance did
not catch it because the local Worker configuration already disabled the
automatic HTML canonicalization that was still active in production.

## Confirmed root cause

Cloudflare Assets automatically canonicalized the `.html` document route in the
production Worker because `wrangler.toml` did not explicitly set
`html_handling`. The Worker owns the extensionless clean routes, and its
`/member-profile` route is intentionally the public profile page. The automatic
redirect therefore sent the editor URL to the wrong page before the profile
form could load.

## Repair applied

- Set `html_handling = "none"` in the production `[assets]` configuration so
  direct `.html` editor documents remain available.
- Kept the Worker-owned extensionless route fallback for clean public URLs.
- Added a source guard requiring the production HTML handling setting and the
  profile editor anchor together.
- Preserved the existing member permission boundary, image validation, upload
  storage, profile save, cache-busting, and media readback behavior.
- Added this incident to the searchable problems/fixes reference.

## Verification record

- Local member interaction contracts: **20/20 passed**.
- Local member profile/feed API checks: **47/47 passed**.
- Local Firefox profile/feed acceptance: **53/53 passed** after transient
  browser-startup retries.
- StudioFlow lifecycle rerun after a disposable-state interruption: **29/29
  passed**.
- Full guarded preflight: **CERTIFIED**, **37 gates passed** in **7m 22s**.
- Production anonymous smoke: **10/10 passed**.
- Live Firefox acceptance: **65/65 passed**.
- Live direct editor route: `https://paranormalinitiative.com/member-profile.html`
  returned **200** instead of a redirect.
- Disposable production profile-media round trip:
  - avatar upload: **200**;
  - background/banner upload: **200**;
  - avatar media readback: **200 image/png**;
  - banner media readback: **200 image/png**;
  - rendered avatar and banner: **both loaded successfully**;
  - original synthetic profile values: **restored**.

## Release record

- **Source branch:** `codex/tpi-development`
- **Source commit:** `de293dae52fa21d6bf4ffeac43ce170b654021f4`
- **Certified release:** `rel-de293dae52fa-8172f58c5e28`
- **Production Worker version:** `4049b58d-9410-42cc-b649-7d3a117f5010`
- **Rollback version:** `e2291e3f-d354-4f77-b18f-505128dd5cdd`
- **Production status:** **Deployed and live verified**.
- **Deployment duration:** **44.3 seconds after certification**.
- **Release profile:** Tier 1 full/shared routing. The protected-application
  integrity guard passed; no StudioFlow, Nova, or Creator Studio source was
  changed.

## Refresh rule for future updates

The local Worker can reuse a staged general-site asset directory. Before
reusing it after any website update, run:

```sh
npm run dev:local:refresh
```

The maintained refresh updates the general-site files in place and leaves the
protected application directories (`studio/`, `nova/`, and
`content-editor-nova/`) untouched. `npm run dev:local` also uses this maintained
freshness path when it reuses the Worker. A browser acceptance run should begin
only after the refresh reports completion.

This local refresh issue is separate from the production route failure recorded
here: the production defect was Cloudflare HTML canonicalization, not a stale
browser cache. Both are now covered by explicit checks so a future update does
not silently serve the wrong profile surface.

## Reusable lesson

Profile media must be verified end to end: the member can reach the editor,
permissions allow the upload, storage returns readable media, the profile save
persists both URLs, and the member-facing render displays both images. A local
test that passes while production routing differs is not sufficient; production
asset behavior must be represented in the source contract and exercised after
deployment.

## Source references

- [`wrangler.toml`](../../../wrangler.toml) — production asset HTML handling
- [`member-profile.html`](../../../member-profile.html) — editor document
- [`member-login.js`](../../../member-login.js) — upload and save flow
- [`functions/api/[[path]].js`](../../../functions/api/[[path]].js) — upload and profile API
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — route source guard
- [`tpi-member-profile-feed-firefox.mjs`](../../../scripts/verify/tpi-member-profile-feed-firefox.mjs) — browser regression
- [`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`](../TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md) — guarded release path
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference

# TPI-STUDIOFLOW-009 — Storage Indicator Audit and Correction

Date: 2026-10-10  
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`  
Integration workspace: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`  
Directive: `THE PARANORMAL INITIATIVE STUDIOFLOW DIRECTIVE 009`

## Scope and safety boundary

This batch corrected the existing StudioFlow sidebar storage indicator. It did not rebuild StudioFlow, reset browser storage, delete IndexedDB records, delete recordings, alter checkpoints, change settings or libraries, modify production databases, or modify unrelated website files. The generated TPI bundle was updated only after the canonical source build and isolated browser check passed.

The displayed allowance is browser-managed origin storage. It is not a measurement of free Mac disk space and the UI no longer presents browser quota as if it were remaining space.

## Root cause

The prior implementation already called `navigator.storage.estimate()`, but its sidebar rendered `usage` as the first number and rendered the raw `quota` with the text `of ... available`. It therefore reported the total allowance as available capacity instead of calculating the remaining allowance. It also used a fixed 30-second polling loop rather than refreshing when the app changed local media or became visible again.

## Correction

The existing indicator now displays:

- `LOCAL BROWSER STORAGE`
- `Used: <actual browser estimate>`
- `Estimated available: <max(0, quota - usage)>`

The existing `formatStorageBytes` formatter is retained. The remaining value uses nonnegative `quota - usage` arithmetic with consistent binary units. When the Storage Estimate API is unavailable or fails, the indicator honestly shows `Unavailable` rather than a fabricated value. The tooltip says:

> StudioFlow stores recordings and other local data in your browser. This storage allowance is managed by your browser and is different from your Mac's available disk space.

Refreshes occur on app open, storage-change events emitted after the existing IndexedDB save/delete/checkpoint operations, window focus, `pageshow`, and a return to visible page state. The fixed polling interval was removed. No storage contents are changed by measurement.

## Verification

### Canonical source checks

- `git diff --check` — passed.
- `npm run check:room` — passed.
- `npm run check:rtmp` — passed.
- `npm run build` — passed (`tsc` and Vite production build). Vite emitted only its existing large-chunk advisory.
- `node --check worker.js` in the TPI integration checkout — passed.
- Canonical source commit: `47839cadf913341d5e792ff0208f1ddd9a3237d3`.

### Isolated browser check

Local URL: `http://127.0.0.1:5179/?testMedia=1&storage009=1`

The rendered sidebar showed actual environment values:

- `LOCAL BROWSER STORAGE`
- `Used: 5.6 MB`
- `Estimated available: 10.0 GB`

The exact browser-versus-Mac tooltip was present. The browser console contained no errors or warnings. The visible values are runtime estimates from the isolated browser, not hardcoded examples. The unsupported-API branch is covered by the guarded source path and production build; it was not forced by mutating the browser's storage API during this pass.

### Public boundary check

- `https://paranormalinitiative.com/` — HTTP 200.
- `https://paranormalinitiative.com/live-video` — HTTP 200 and existing Coming Soon surface retained.
- `https://paranormalinitiative.com/studio/` — HTTP 403 for an unauthenticated request; the existing Private Build Testing gate remains intact.
- Deployed `/studio/assets/index-DTrOaQz2.js` — HTTP 200 and contains the storage-indicator markers.
- Deployed `/studio/assets/index-CI52K-VJ.css` — HTTP 200.

An authenticated interactive production StudioFlow session was not available in the isolated browser, so owner-device storage behavior and signed-in production UI interaction remain open for acceptance. No camera or microphone permission was requested.

## Integration and deployment

The fresh canonical bundle was byte-identical to the promoted TPI JavaScript and CSS assets. The existing TPI theme bridge in `studio/index.html` was preserved. The generated integration commit was:

- TPI commit: `39bb853089ca3bbb654308da30264c06a996d688`
- GitHub: pushed to `origin/main`.
- Cloudflare Worker: `theparanormalinitiative`.
- Cloudflare Version ID: `fef6624b-75c4-4892-8666-69b88becb203`.

The deployment was created from a clean archive of the pushed commit. Existing D1/R2/assets bindings and the scheduled trigger were retained. Unrelated dirty or untracked website work was not staged or included.

## Remaining verification and next steps

- Owner Mac/browser acceptance of the corrected indicator.
- Authenticated live StudioFlow interaction after sign-in.
- Longer recording-session storage changes and checkpoint retention remain governed by the earlier recording-verification evidence boundary.
- Live video broadcasting and webinars remain **NOT YET VERIFIED**.

This batch is complete for the storage-indicator audit and correction. Existing owner verification remains distinct from automated/local testing: camera, microphone, and creation of a local video recording are **OWNER VERIFIED — WORKING**; recording export/recovery, live broadcasting, and webinars are not promoted by this report unless separately evidenced.

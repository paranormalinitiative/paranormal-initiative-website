# TPI-STUDIOFLOW-RELEASE-001 — Release Report

Date: 2026-10-10
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`
TPI integration source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Release scope: accepted StudioFlow directives TPI-STUDIOFLOW-001 through TPI-STUDIOFLOW-008D

## Executive status

| Evidence class | Status | Evidence boundary |
| --- | --- | --- |
| IMPLEMENTED | **YES** | The existing StudioFlow application contains the accepted feature batches through 008D. No rebuild or replacement was performed. |
| AUTOMATED VERIFIED | **PARTIAL** | Static checks, local browser UI checks, prior isolated recording/recovery evidence, and prior local synthetic RTMP evidence passed as listed below. |
| DEPLOYED | **YES** | Cloudflare Worker `theparanormalinitiative`, Version ID `16b8f785-abe9-4f88-b430-4603a1c292d5`. |
| LIVE VERIFIED | **PARTIAL** | Public site boundary, private StudioFlow gate, generated JS/CSS, `/live-video`, bindings, and trigger were checked. Signed-in interactive StudioFlow behavior was not claimed. |
| OWNER VERIFIED | **YES — LIMITED** | Owner verification remains limited to camera functionality, microphone functionality, and creation of a local video recording. This is separate from automated testing. |
| NOT VERIFIED | **YES** | Public live broadcasting, webinars, authenticated live StudioFlow interaction, and ticker/Style/background-music/uploaded-sound inclusion in recorded or RTMP output remain unverified. |
| BLOCKED | **PARTIAL** | The isolated browser had no safe capture source for a new ticker/Style recording or RTMP run, and the live route requires a signed-in owner/admin session not present in the isolated browser. |

## Source and integration audit

- Canonical source remained `/Users/toddknipple/Documents/StudioFlow/web`.
- The source release commit is `72df3af` (`Complete StudioFlow release feature batch`). This repository has no configured remote, so the commit is local history only.
- The TPI integration commit is `f4304c2b` (`Promote StudioFlow release candidate to TPI`).
- Only the reviewed StudioFlow integration files were staged in the TPI commit. Unrelated TPI page, sitemap, competitive-audit, and Desktop playground changes were left outside the commit.
- The fresh `web/dist` payload was promoted into TPI `studio/`. The existing TPI theme-bridge script was preserved in `studio/index.html`; only its hashed JS/CSS references changed. Obsolete bundle files were removed, and the PDF worker was added.
- No production database migration, D1 write, R2 content change, DNS change, or unrelated Worker change was performed.

## Build and static verification

Passed in the canonical source:

- `npm run check:room`
- `npm run check:rtmp`
- `npm run build` (`tsc` plus Vite production build)
- `git diff --check` for the canonical source

The Vite build emitted the existing large-bundle warning for the main JavaScript bundle; it did not fail.

Passed in the TPI integration source:

- `node --check worker.js`
- Fresh generated bundle parity inspection: source `dist` and TPI `studio/` matched for all generated payload files other than the intentional TPI wrapper and the preserved `.DS_Store`.
- `git diff --check` for the changed integration files. Historical Markdown reports retain their existing Markdown hard-break whitespace.

## Local browser verification

The isolated local browser opened the fresh candidate at `http://127.0.0.1:5179/?testMedia=1&release001=1`.

Passed:

- Program view loaded with Scenes, Program controls, Recording, Go Live, Media Assets, Banners, and Style sections.
- **Scroll Across Ticker** remained available in the existing Banners interface.
- With an active banner, the ticker geometry was `left: 0`, `right: 0`, `bottom: 0`, `overflow: hidden`, and full Program width.
- Ticker disable removed the ticker element; the active banner path remained available.
- Style exposed Brand Presets, HEX color inputs, Bubble/Classic/Minimal/Block themes, name styles, text sizes, bundled fonts, Default Camera fallback choices, Rounded corners, display-name control, and headline control.
- The local browser reported no warning or error console logs during this pass.

Previously accepted isolated tests remain separate evidence:

- Browser-generated WebM recording and recovery: playback, checkpoint cleanup, Discard, controlled failed-save retention, fallback download, and repaired committed-chunk reload recovery for Program and Backstage.
- Local synthetic browser/ffmpeg receiver: Program video/audio, clean stop, recording while live, and bounded receiver restart/reconnect recovery.
- Sounds and Background Music UI/persistence checks: catalog simplification, supported upload validation, metadata persistence, playback/stop where conclusively observed, and empty-state guidance.

These automated/local results do not replace physical owner-device testing.

## GitHub push

- Remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`
- Branch: `main`
- Push result: **SUCCESS**
- Local `HEAD`: `f4304c2b143114dce0647a15f66e67138d09fc7`
- `origin/main`: `f4304c2b143114dce0647a15f66e67138d09fc7`
- Local and remote HEADs matched after the push.

## Cloudflare deployment

- Existing workflow: `wrangler deploy` using `wrangler.toml`.
- Worker: `theparanormalinitiative`
- Account selected: Paranormal Initiative account `221ea5479876fd303ddc87002b9e892d`
- Version ID: `16b8f785-abe9-4f88-b430-4603a1c292d5`
- Live worker URL: [theparanormalinitiative.paranormalsomerset.workers.dev](https://theparanormalinitiative.paranormalsomerset.workers.dev)
- Public site URL: [https://paranormalinitiative.com](https://paranormalinitiative.com)
- Bindings reported by Wrangler: `TPI_DB` → `tpi_contributor_portal`, `TPI_MEDIA` → `tpi-contributor-media`, and `ASSETS`.
- Existing scheduled trigger remained `0 */6 * * *`.

The deployment was performed from a clean archive of pushed commit `f4304c2`, not from the dirty shared checkout. This prevented unrelated unstaged changes from entering the production Worker.

## Live verification

Passed:

- `https://paranormalinitiative.com/` returned HTTP 200 and retained the public TPI navigation/landing surface.
- `https://paranormalinitiative.com/live-video` returned HTTP 200 and retained **Coming Soon** messaging plus the StudioFlow launch route.
- `https://paranormalinitiative.com/studio/` returned HTTP 403 with the expected **StudioFlow — Private Build Testing** gate for an unauthenticated request.
- The deployed StudioFlow JavaScript asset returned HTTP 200 and contained the ticker, Brand Presets, Background Music, Recording, and Go Live feature markers.
- The deployed StudioFlow CSS asset returned HTTP 200.
- Cloudflare deployment listing showed Version ID `16b8f785-abe9-4f88-b430-4603a1c292d5` at 100%.

Not claimed:

- Authenticated owner/admin StudioFlow route load in production; the isolated browser did not have a signed-in owner session.
- Browser console/network checks inside the authenticated production StudioFlow application.
- Production recording playback/download, ticker/style output capture, uploaded sound/music capture, guest-inclusive output, or live destination delivery.

## Owner acceptance checklist

The owner must test on Mac and iPhone before acceptance:

- [ ] Sign in as the owner/admin and open the exact live URL: `https://paranormalinitiative.com/studio/`.
- [ ] Confirm camera and microphone access still work; these remain **OWNER VERIFIED — WORKING** from the prior owner report.
- [ ] Create a local recording and confirm the Program preview, Library playback, and download/export.
- [ ] Confirm the existing Banners interface with ticker disabled, then enable **Scroll Across Ticker** and verify full-width smooth motion.
- [ ] Confirm ticker behavior through a real recorded Program output.
- [ ] Exercise representative Style presets, color, font, text size, camera fallback, and rounded-corner controls.
- [ ] Confirm Background Music and creator Sounds behavior in the intended output path.
- [ ] Test responsive behavior on Mac, iPhone, and any intended tablet width.
- [ ] Treat live video broadcasting and webinars as **NOT YET VERIFIED** until separately tested with the required infrastructure.

## Known limitations and next steps

- The local RTMP bridge remains development infrastructure; Cloudflare Workers do not provide persistent RTMP ingest by themselves.
- Public RTMP/RTMPS delivery, destination credentials, remote guests/TURN, webinars, physical dual-camera output, long-duration recording, native save-picker behavior, cloud persistence, and final recording/export parity remain open.
- Ticker and Style rendering were verified in the local Program preview and compositor code path, but their inclusion in a fresh recorded file and RTMP output was not verified in this release pass because the isolated browser had no safe capture source.
- The owner’s physical Mac/iPhone acceptance is required before calling this release owner-accepted.

## Final classification

This release is **DEPLOYED with PARTIAL LIVE VERIFICATION**. It is not an owner-accepted production livestream/webinar release. Existing working systems were preserved, and the remaining limitations are documented rather than marked verified.

# Messenger Media Upload and Clipboard Repair

## Incident record

- **Date:** 2026-11-14
- **Time reported:** 15:02:18–15:02:37 ET, shown in the supplied Chrome screenshots
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Site-wide Messenger and Community Feed composer
- **Scope:** Every signed-in member using Messenger, posts, comments, or post editing
- **Protected applications changed:** None. StudioFlow, Nova Workspace, and Creator Studio were not modified.

## What happened

Messenger MP4 and ZIP attachments appeared to upload, but opening the saved MP4
returned a 500 Internal Server Error / Cloudflare Worker Error 1101. ZIP files
were not offered by the Messenger file picker. The same release also needed
reliable browser copy-and-paste behavior in Messenger and the Community Feed.

## Confirmed root cause

The Messenger media authorization check searched the JSON attachment column
with a SQLite `LIKE` pattern built from the entire media URL. The local Worker
reproduced the production failure with the D1 error `LIKE or GLOB pattern too
complex`, so the request failed before R2 could return the object. Chrome can
also report ZIP as `application/x-zip-compressed` or MP4 as a generic binary
type, while the server previously trusted that label. The Messenger file
picker did not include ZIP formats.

## Repair applied

- Replaced the URL `LIKE` authorization query with safe JSON parsing and exact
  URL comparison after loading non-deleted message attachments.
- Added a fallback content type inferred from the stored media extension when
  an older R2 object's metadata is incomplete or malformed.
- Normalized generic and Chrome-specific upload MIME labels from filenames,
  including MP4 → `video/mp4` and ZIP → `application/zip`.
- Added ZIP support to the Messenger document picker and improved its label.
- Added MP4/M4V/MOV/WebM extension handling to Messenger and Community Feed
  selection so browsers that omit a video MIME still classify the file correctly.
- Added a shared plain-text paste path for the Messenger composer, Community
  Feed post composer, comments, and post editing. Copy remains native browser
  behavior; paste inserts at the active selection and dispatches the normal
  input event so validation and button state stay synchronized.
- Added a disposable local MP4/ZIP upload → message attachment → authenticated
  media readback regression, with test messages removed after each run.
- Added the Messenger browser and media round-trip checks to the guarded
  release path whenever Messenger/media code changes.

## Verification record

- Member interaction source contracts: **27/27 passed**.
- Focused Firefox Messenger acceptance: **22/22 passed**, including MP4/ZIP
  picker state and paste into Messenger and Community Feed.
- Local disposable media round trip: **12/12 checks passed**; MP4 and ZIP
  responses returned `200` with `video/mp4` and `application/zip`.
- Local authentication lifecycle: **38/38 passed**.
- Guarded full preflight: **CERTIFIED**, **37 gates passed** in **6m 35s**;
  protected application integrity passed.
- Production anonymous smoke: **10/10 passed**.
- Live isolated Firefox acceptance: **65/65 passed**.
- No StudioFlow, Nova Workspace, or Creator Studio source or deployed asset
  was changed by this repair.

## Release record

- **Source branch:** `codex/tpi-development`
- **Source commit:** `d6e0fc532d0dd3c286399e68c0e62cb8c4428bb5`
- **Certified release:** `rel-d6e0fc532d0d-f12b5d924453`
- **Production Worker version:** `1e4d4af2-47a5-409e-8f3b-fde72193460a`
- **Rollback version:** `48af4946-75e1-4624-a522-b6202928ba27`
- **Production status:** **Deployed and live verified**.
- **Deployment duration:** **42.2 seconds** including live smoke and Firefox acceptance.
- **Release profile:** Full/Tier 1 because the release protection tooling changed.

## Permanent protection

Future Messenger/media changes now run the focused browser regression and the
local MP4/ZIP authenticated media round trip before certification. The source
contracts also fail if ZIP support, MIME normalization, safe media authorization,
or plain-text paste support is removed. The release candidate remains sealed,
and the protected-application byte guard continues to prevent unrelated changes
from replacing StudioFlow, Nova Workspace, or Creator Studio artifacts.

## Reusable lesson

Media authorization should compare structured attachment data, not interpolate
user-controlled URLs into wildcard SQL. Upload support must be tested end to
end: picker, browser MIME, server normalization, storage, message attachment,
authenticated readback, and cleanup. Text controls should preserve ordinary
copy/paste behavior across the shared member surfaces.

## Source references

- [`functions/api/[[path]].js`](../../../functions/api/[[path]].js) — upload, authorization, and media response handling
- [`member-shell.js`](../../../member-shell.js) — Messenger pickers and paste handling
- [`member-home.html`](../../../member-home.html) — Feed file selection and paste handling
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — source contracts
- [`tpi-member-messenger.mjs`](../../../scripts/verify/tpi-member-messenger.mjs) — Firefox Messenger regression
- [`tpi-messenger-media-roundtrip.mjs`](../../../scripts/qa/tpi-messenger-media-roundtrip.mjs) — local end-to-end media regression
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference

# TPI-NOVA-010 — Regular Editor Caret and Community Feed Refresh

Date: 2026-11-08

## Scope

This focused correction addresses two owner-reported behaviors:

1. Nova's regular Content Editor surface was still using the full-width host
   override, and the insertion caret did not have an explicit visible color.
2. Community Feed cards had been expanded to full bodies, while the **Open
   post** action did not provide a reliable full-post reading path.

No document, post, account, or production data was changed by this correction.

## Corrections

- The Content Editor's shared document surface is now centered within the
  regular editor, with a readable bounded writing surface.
- The editor uses an explicit native `caret-color` and retains the browser's
  native blinking caret and keyboard editing behavior. No fake cursor or global
  focus suppression was added.
- Normal community-feed cards use a compact, safe 400-character preview.
- An **Open post** link preserves the canonical `post=<id>#post-<id>` target.
  The targeted card loads from the feed API even when it is beyond the first
  page, scrolls into view, and renders the complete post body.
- Every five minutes, while the feed page is visible and focused, the client
  checks for a newer community post. If one is detected it shows **Refresh now**
  without replacing the post currently being read. Refresh is explicit.

## Verification

- `npm run verify:nova-006-editor-parity` — 11/11 PASS
- `npm run verify:nova-006-slides` — 23/23 PASS
- `npm run verify:nova-007-workstation` — 9/9 PASS
- `npm run verify:nova-008-studioflow` — 13/13 PASS
- `node scripts/qa/tpi-ops-011-member-home.mjs` — 44/44 PASS
- `npm run verify:release-safety` — 27/27 PASS
- `npm run build:nova` — PASS
- `npm run build:content-editor-nova` — PASS

The official loopback Worker on port 8787 served the updated member-home,
regular-editor host CSS, and rebuilt Nova bundles. Firefox production visual
acceptance remains part of the guarded release verification; no production
deployment is claimed by this development record until that process completes.

## Files

- `member-home.html`
- `style.css`
- `nova-app/src/styles.css`
- `scripts/qa/tpi-ops-011-member-home.mjs`
- `scripts/verify/tpi-nova-006-editor-parity.mjs`
- `scripts/verify/tpi-nova-008-studioflow-nova-edit.mjs`
- Generated `nova/` and `content-editor-nova/` assets

## Known behavior

The full post view is intentionally a canonical member-home target rather than
a second post system. If the stored post body contains intentional spaces, the
caret remains after those stored characters; the editor does not rewrite user
content while correcting caret visibility.

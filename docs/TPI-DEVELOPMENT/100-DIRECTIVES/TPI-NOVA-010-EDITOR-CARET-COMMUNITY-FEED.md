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

## Production release closure

Status: **COMPLETE — DEPLOYED AND VERIFIED.**

The guarded release candidate was certified and deployed without changing the
application data model or owner browser data.

- Release ID: `rel-f3a91b7d13e6-3b622c5b1134`
- Website/source integration commit: `f3a91b7d13e6f6e277ca145adf06e1e78857466b`
- Integrated StudioFlow source commit: `0061dc692b07d571f9b1e022ef3949d9a50f4bf2`
- Deployed Worker version: `cd4a233c-8d05-4fcc-b244-b1fc01dd20dc`
- Rollback Worker: `ae0e5d09-543a-4979-974d-b28174088c42`
- Production traffic: 100%
- Certification manifest digest: `1f6c202b81ac01ca08b944b0305a5c5b1a12c59e8135a8f665e006c3383e34c3`
- Deployment timestamp: `2026-11-09T04:12:51.204Z`

Release verification passed:

- Certification and release gates: 30/30
- Focused Nova parity: 11/11; Slides parity: 23/23; workstation: 9/9;
  StudioFlow parity: 13/13
- Community Feed focused QA: 44/44
- Release safety: 27/27
- Production smoke: 10/10
- Live isolated Firefox Developer Edition acceptance: 65/65

Relevant deployed asset hashes:

| Asset | SHA-256 |
| --- | --- |
| `nova/assets/index-B7tgv28H.js` | `ad59c89e7287d98ec442020c9abc8b823d3e08e80f86afec6955b74755e1be4f` |
| `nova/assets/index-BuYuxzMn.css` | `e2ac5cad555b5de08c0ff61ee2fae717ef8c841aa291b73c0a102238add99e32` |
| `content-editor-nova/assets/content-editor-C6ABjka3.js` | `6b8071842a19ddcbf1816c4e6ce235cc7b903720f27f9c30e02f9b6a5ac9653b` |
| `content-editor-nova/assets/content-editor-BuYuxzMn.css` | `e2ac5cad555b5de08c0ff61ee2fae717ef8c841aa291b73c0a102238add99e32` |
| `style.css` | `745486287df76b6b4e512668e962a1be01379f31b7296c670a1a0dc520545732` |
| `member-home.html` | `2c79d551a387887947134c0b1520280d3d5b1d10bbfe6b88f0d07c5e3ea2d728` |

The deployed Content Editor Nova JavaScript and CSS were fetched from the live
production URLs and matched these hashes. Protected `/paper-editor`, `/nova/`,
and `/studio/` entrypoints correctly return `403` without authentication and
`Cache-Control: no-store`; live authenticated browser acceptance is the source
of truth for those routes. The unauthed member-home document contains the new
refresh-notice and full-post markers.

The release preflight used the documented sibling-lineage override because the
dedicated approved StudioFlow release branch is a deliberate port of the
previous baseline. Its staged assets were reproducible and the continuity guard
passed with that written justification.

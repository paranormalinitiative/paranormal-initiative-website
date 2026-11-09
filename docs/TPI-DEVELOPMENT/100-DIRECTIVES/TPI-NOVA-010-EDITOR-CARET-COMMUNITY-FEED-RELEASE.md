# TPI-NOVA-010 — Production Release Record

Date: 2026-11-09

## Result

**DEPLOYED AND VERIFIED.** The regular Nova Content Editor caret correction and
the compact Community Feed/full-post refresh behavior are live in production.

## Release identity

- Website/source integration commit: `f3a91b7d13e6f6e277ca145adf06e1e78857466b`
- Integrated StudioFlow source commit: `0061dc692b07d571f9b1e022ef3949d9a50f4bf2`
- Release ID: `rel-f3a91b7d13e6-3b622c5b1134`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `cd4a233c-8d05-4fcc-b244-b1fc01dd20dc`
- Previous/rollback Worker: `ae0e5d09-543a-4979-974d-b28174088c42`
- Production traffic: 100%
- Deployment timestamp: `2026-11-09T04:12:51.204Z`
- Certification manifest digest: `1f6c202b81ac01ca08b944b0305a5c5b1a12c59e8135a8f665e006c3383e34c3`

## Release gates

| Gate | Result |
| --- | --- |
| Certification/release gates | 30/30 PASS |
| Nova editor parity | 11/11 PASS |
| Nova Slides parity | 23/23 PASS |
| Nova workstation checks | 9/9 PASS |
| StudioFlow Nova Edit checks | 13/13 PASS |
| Community Feed focused QA | 44/44 PASS |
| Release safety | 27/27 PASS |
| Production smoke | 10/10 PASS |
| Live isolated Firefox Developer Edition acceptance | 65/65 PASS |
| Production data preservation | PASS |

The release also passed the complete guarded StudioFlow lifecycle, ownership,
deletion, deletion-safety, production-item, persistence, Notes restoration,
Notes visual, home-layout, and mobile acceptance suites during preflight. The
owner Firefox profile was not accessed.

## Live checks

The deployed Content Editor Nova assets were fetched from production and their
bytes matched the certified local assets:

| Asset | SHA-256 |
| --- | --- |
| `nova/assets/index-B7tgv28H.js` | `ad59c89e7287d98ec442020c9abc8b823d3e08e80f86afec6955b74755e1be4f` |
| `nova/assets/index-BuYuxzMn.css` | `e2ac5cad555b5de08c0ff61ee2fae717ef8c841aa291b73c0a102238add99e32` |
| `content-editor-nova/assets/content-editor-C6ABjka3.js` | `6b8071842a19ddcbf1816c4e6ce235cc7b903720f27f9c30e02f9b6a5ac9653b` |
| `content-editor-nova/assets/content-editor-BuYuxzMn.css` | `e2ac5cad555b5de08c0ff61ee2fae717ef8c841aa291b73c0a102238add99e32` |
| `style.css` | `745486287df76b6b4e512668e962a1be01379f31b7296c670a1a0dc520545732` |
| `member-home.html` | `2c79d551a387887947134c0b1520280d3d5b1d10bbfe6b88f0d07c5e3ea2d728` |

Production returned the updated `content-editor-nova` JavaScript and CSS with
matching hashes. The protected Nova and StudioFlow entrypoints returned the
expected unauthenticated `403` plus `Cache-Control: no-store`; the authenticated
isolated Firefox acceptance passed. The public member-home shell contained the
refresh-notice and full-post markers.

An additional read-only authenticated check with the isolated production QA
account returned `200` for `/nova/` and
`/content-editor-nova/content-editor.html`, each referencing the expected
hashed bundles. `/paper-editor` returned `403` for that QA account because it is
not contributor-authorized; no authorization was broadened for this release.

## Scope and preservation

- No production database migration was run.
- No creator Studio, Note, recording, script, media object, or account data was
  created, deleted, or modified.
- No owner Firefox profile, cookies, IndexedDB, or local browser storage was
  accessed.
- No unrelated feature or worktree was cleaned.

## Known behavior

The Community Feed refresh is advisory: when the visible, focused page detects
a newer item after five minutes, it presents **Refresh now** and does not
replace the post currently being read. The full post is a canonical member-home
target, not a second post system. The editor caret is the browser-native,
blinking insertion caret and remains available to keyboard users.

## Repository status

The application release commit is pushed to `origin/codex/tpi-development` and
was at exact GitHub parity during deployment. This record and the status update
are documentation-only follow-up changes and will be committed separately from
the deployed application commit; the deployed release identity above remains
unchanged.

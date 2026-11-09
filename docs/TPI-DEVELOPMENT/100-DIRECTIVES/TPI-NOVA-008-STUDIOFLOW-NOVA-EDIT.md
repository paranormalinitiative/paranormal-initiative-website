# TPI-NOVA-008 — StudioFlow Nova Edit Documents, Slides, and Brand Fonts

Date: 2026-11-08
Status: **DEPLOYED AND VERIFIED IN PRODUCTION**

## Outcome

StudioFlow now exposes Nova Edit as an in-workspace authoring surface. Documents
and Slides are the shared Nova engine used by the flagship Editorial Workspace,
but are presented inside StudioFlow through a focused Nova Edit hub and embedded
workspace. The browser stays on `/studio/`; opening Documents or Slides no longer
requires leaving the StudioFlow application.

The selected Nova Edit surface survives a full Firefox refresh. The outer
StudioFlow route and the selected Documents/Slides surface are persisted locally
so a creator returns to the work area they were using.

## Implemented scope

- Added Nova Edit Documents and Nova Edit Slides cards to StudioFlow.
- Embedded the shared `/nova/` Documents and Slides application with
  `mode=studioflow&embedded=1`.
- Added a StudioFlow-specific Nova Edit presentation label and return controls.
- Preserved the full shared Documents ribbon, Slides ribbon, Presenter mode,
  speaker notes, templates, imagery, and existing lifecycle controls.
- Added a shared private Brand fonts library to Documents and Slides.
- Added the same Brand fonts library to the flagship Content Editor mount.
- Supported font files: WOFF2, WOFF, TTF, and OTF.
- Stored font bytes in browser-local IndexedDB and installed them with the
  browser FontFace API.
- Added custom font families to the Documents and Slides font selectors.
- Preserved custom font-family marks in document formatting and slide element
  data.
- Added refresh-safe StudioFlow Nova Edit route and surface persistence.

## Verification

Actual Firefox Developer Edition verification used the maintained owner-facing
local Worker at `http://127.0.0.1:8787/studio/` without clearing browser data.

- Nova Edit hub rendered inside StudioFlow: PASS.
- Documents embedded inside StudioFlow: PASS.
- Documents full ribbon rendered: PASS.
- Documents Brand fonts dialog rendered: PASS.
- Slides embedded inside StudioFlow: PASS.
- Slides full ribbon rendered: PASS.
- Slides selected-text formatting and Brand fonts control rendered: PASS.
- Presenter entry point and existing deck list remained available: PASS.
- Slides returned to Slides after Firefox refresh: PASS.
- StudioFlow remained the outer route after refresh: PASS.

Focused automated checks:

- `verify:nova-008-studioflow`: **13/13 PASS**
- `verify:nova-007-workstation`: **9/9 PASS**
- `verify:nova-006-editor-parity`: **9/9 PASS**
- `verify:nova-006-slides`: **23/23 PASS**
- `verify:release-safety`: **27/27 PASS**
- Source TypeScript/Vite build: PASS.
- Authoritative source staging: PASS; reproducible builds matched.
- `git diff --check`: PASS.

The actual upload of a new user-supplied font file was not performed in the
owner profile during this pass. The upload dialog, supported formats, IndexedDB
storage path, FontFace installation, and both ribbon integrations were verified.

## Baseline and assets

Authoritative StudioFlow source repository:

- Latest source commit: `c42bad300bc516756d7738e32f6bb201c7fc007b`
- Previous embedded-workspace commit: `efe59a7402bb75002c9ad50f7d502bfbd713c465`
- StudioFlow JavaScript: `index-Bj1VLcW4.js`
- StudioFlow JavaScript SHA-256: `4844d55113cf9bb4f97275f8268a7df04dd0abf730878ede3843380abea47af4`
- StudioFlow CSS: `index-DtqNaHu6.css`
- StudioFlow CSS SHA-256: `1e4cae07240dafe0152bc944f71073163845d08ab348c0e86d3e7e21821a6a29`

Shared Nova website assets staged locally:

- `nova/assets/index-SVZK6erJ.js` — `bdabd1e67e806bcd6f4762a545b94de41d95bee93614e78baf548c0c9294bf9a`
- `nova/assets/index-DxJAbMPh.css` — `4191c6f416319e827e10be0d2d22927a947b9eb98e371534e53bd48403d875f2`
- `content-editor-nova/assets/content-editor-JgQ0wXKS.js` — `6b8071842a19ddcbf1816c4e6ce235cc7b903720f27f9c30e02f9b6a5ac9653b`
- `content-editor-nova/assets/content-editor-DxJAbMPh.css` — `4191c6f416319e827e10be0d2d22927a947b9eb98e371534e53bd48403d875f2`

Staged entrypoints:

- `studio/index.html` — `fc2a5db28094313a62f10a7df0312775c96e5106a762f9da2456f32a08ae248e`
- `nova/index.html` — `39693e71ca20625573d4f9610487df169f2bd021b6b8ae9e82cf99ca91d20aa3`
- `content-editor-nova/content-editor.html` — `931b5bf87100b1a7822a76ca5593ce1b14b18f96a531e6fe68d0f26329e63bb9`

## Storage limitation

Brand fonts are intentionally private to the browser/device in this tranche.
They are not yet server-synchronized or shared across devices. A future
server-backed brand-font library can be added separately without changing the
document or slide formatting model.

## Final production release

The visible Nova Edit rail/panel label correction was integrated on top of the
complete approved StudioFlow lineage and deployed through the guarded release
workflow. The underlying Notes state key remains `Notes`; only the user-facing
label is `Nova Edit`, preserving existing Notes data and behavior.

- Website release commit: `6a9dbc3bf4ac45be1de692032515b2ffc8203e24`
- StudioFlow source commit: `2c7c651f34839b0115596d632f1009214e4cd63d`
- Release: `rel-6a9dbc3bf4ac-9e05557aea4b`
- Production Worker version: `b40bd498-5b70-43e5-be33-c6a312964eae`
- Rollback Worker: `13805918-374e-471a-adc9-01beb98c6e13`
- Traffic: 100%
- JavaScript: `studio/assets/index-BAUieVoD.js`
- JavaScript SHA-256: `06315f104af7ddef7637d4f2001556d50a1770fc9b21e354ffaa60ab946bfb0b`
- CSS: `studio/assets/index-V2mQ_DP8.css`
- CSS SHA-256: `6e68faa590fb4a116d57b71bb768835e6b901c8ffdd903eee75267d4fad9899b`
- Entrypoint SHA-256: `98f050274c7855e0f74ee74d10951564715269a4557bb99d8ae959dae1dd49d2`
- Certification: 30/30 release gates passed; reproducible staging matched.
- Live anonymous smoke: 10/10 PASS.
- Live isolated Firefox Developer Edition acceptance: 65/65 PASS.

The deployed candidate preserves the complete Documents and Slides engine,
full ribbons, Presenter mode, speaker notes, templates, imagery, lifecycle
controls, and the browser-local Brand fonts library. Custom fonts remain
device-local in this tranche; server synchronization is intentionally deferred.

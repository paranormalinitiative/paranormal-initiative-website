# TPI Development Agent Handoff

## TPI-STUDIOFLOW-126 — FINAL PRODUCTION BASELINE (2026-11-01)

[Production release record](100-DIRECTIVES/TPI-STUDIOFLOW-126-FINAL-PRODUCTION-RELEASE.md).

StudioFlow's approved release is **DEPLOYED AND VERIFIED IN PRODUCTION**. The
website branch is `codex/tpi-development` at
`a025889a7e0361ddbd1867c2f66c83c0ebbe1e43`; the authoritative StudioFlow
source is `e2363fb877d3984c938f0703fe62446ad9f17c4f`. Production Worker
`theparanormalinitiative` is
`584f29db-1568-4ff4-a99e-b32b3b63a23e` at 100%; rollback is
`4108a0d7-5833-435f-8a0b-f6be8c1c8b27`. Canonical assets are
`index-C7n2E6kz.js` SHA-256
`94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc` and
`index-SDxcWQji.css` SHA-256
`0b2b18de7f6308a19116e539d2ac10de54bd9241f300b8d7229577c5eca302b7`.

The guarded deployment passed production smoke 10/10 and isolated Firefox
acceptance 64/64. Continue to preserve the accepted Notes Trash behavior and
TPI-125 Teleprompter/My Scenes integration. Do not represent the excluded
122H.1–122H.2 native local-folder work as released. Native screen-picker
automation and external livestream delivery remain documented limitations.

## TPI-STUDIOFLOW-125 — TELEPROMPTER SCENE INTEGRATION (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-125-TELEPROMPTER-SCENE-INTEGRATION.md).

The development candidate is staged on the authoritative local Worker at
`http://127.0.0.1:8787/studio/` from StudioFlow source commit
`e2363fb877d3984c938f0703fe62446ad9f17c4f`, isolated source branch
`codex/studioflow-122-notes`. The My Scenes production-item list now includes
stable references to the existing Teleprompter script library, a Teleprompter
Script Add-item path, script-library drag/drop, centralized item colors, and
private manual script playback. The focused Firefox suite is 21/21; maintained
Scenes is 20/20, recording/storage 33/33, screen-sharing panel 13/13, and
release safety 21/21.

The integration is **COMPLETE** for this development directive. Native
screen-picker capture remains explicitly outside the automated boundary; the
screen-sharing panel and reader-isolation checks pass. Do not deploy this
candidate under this directive.
Use the archived Firefox evidence under
`100-DIRECTIVES/evidence/TPI-STUDIOFLOW-125/`. Preserve the original mixed
StudioFlow checkout and unrelated untracked website bundles.

## TPI-STUDIOFLOW-122F.5 — NOTES TRASH BASELINE CLOSED (2026-10-31)

[Closure record](100-DIRECTIVES/TPI-STUDIOFLOW-122F5-NOTES-TRASH-CLOSURE.md).

The Notes Trash sequence 122F.4A–122F.4C is **VERIFIED COMPLETE** in local
development. Continue from source commit
`9703b087e91e85e0f791f618a90f9b2c4eeb5160` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The final Firefox evidence is preserved in
`100-DIRECTIVES/evidence/TPI-STUDIOFLOW-122F4C/`. Do not reopen the accepted
Trash implementation or introduce R2 cleanup; retained R2 bytes remain a known
documented limitation. Production is unchanged and no deployment is authorized
under this closure directive.

## TPI-STUDIOFLOW-122F.4A — NOTES TRASH CORRECTION (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F4A-NOTES-TRASH-COMPLETION.md).

Continue from source commit `9703b087e91e85e0f791f618a90f9b2c4eeb5160` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The local Worker is staged with
`index-2zeoh76e.js` SHA-256
`bbe0e82636bf2c80d9fd5a720590343f32895d2d79ddede86c432d684ead2912` and
`index-Y3KKfVMj.css` SHA-256
`b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`.

Attachment-bearing permanent deletion now uses owner/version/Trash guards,
reference auditing, a D1 batch for the selected note's records, and
fail-closed shared-reference handling. R2 bytes are retained deliberately
until an atomic/reference-counted cleanup system is separately approved.
Maintained Notes regression and release safety pass. The browser-visible
missing-folder notice remains unverified because the isolated Firefox
interaction harness has not reliably selected the disposable Trash card;
do not call this directive complete until that rendered Firefox check passes.
Production is unchanged. Preserve the original mixed checkout and all
unrelated worktrees.

## TPI-STUDIOFLOW-122F.4 — NOTES TRASH COMPLETE (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F4-NOTES-TRASH.md).

Continue from source commit `ddc8eed4321510a86da35d7a1bb35f0cf8b8a50e` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-C7r7gqow.js` SHA-256
`5c5ba8b78bc638b0258b2f1fa1d5c85fcdcd934d4e51c424d8e318074b38982a` and
`index-Y3KKfVMj.css` SHA-256
`b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`.

Trash soft-delete metadata, restore, read-only state, explicit permanent
deletion, ownership guards, and attachment fail-safe behavior are integrated.
The maintained Notes and release-safety suites pass. The focused browser
harness verifies the core workflow; its visible missing-folder notice check is
unverified even though the server fallback to All Notes passes. Do not deploy
under 122F.4. Preserve the original mixed checkout and unrelated worktrees.

## TPI-STUDIOFLOW-122F.3 — ORGANIZE PANEL SIZING COMPLETE (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F3-ORGANIZE-PANEL-SIZING.md).

Continue from StudioFlow source commit
`7f3a3e37850163d78a97e97fce05693fdf48ea84` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-HFCjseSC.js` (SHA-256
`89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`) and
`index-CIEmHEyE.css` (SHA-256
`a0e6c7c29f3f72eb3d5ad58110f5d8cc352216ea5efd12766b2c7c7d1761aca8`).

The Notes organization panel now uses bounded automatic sizing, wraps long
project/folder names, reserves an action-menu slot, and switches to the
existing stacked layout when the Notes container is narrow. Real Firefox Notes
acceptance passes, maintained Firefox is 64/64, release safety is 21/21, and
provenance/staging is reproducible. Production remains unchanged. Do not reset
the original mixed checkout or unrelated historical worktrees.

## TPI-STUDIOFLOW-122F.2D — NOTES PADDING COMPLETE (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2D-NOTES-EDITOR-PADDING.md).

Continue from StudioFlow source commit
`6af7b1089fbe38fb85a72590c0017086ff65f6b1` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-DMqbydAn.js` (SHA-256
`89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`) and
`index-CeIVL89B.css` (SHA-256
`35f10a284e564ea006e9bf44831618cc3b6bf38754a6868239cadd253b104f2c`).

The Notes document surface now has responsive internal padding of 22px desktop,
18px medium, and 14px narrow. Firefox computed-padding and full Notes checks
pass; maintained Firefox is 64/64 and release safety is 21/21. Production is
unchanged. Do not reset the original mixed checkout or unrelated historical
worktrees.

## TPI-STUDIOFLOW-127 — PARTIAL / PRESERVED, PUSHED, AND DEPLOYED (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-127-PRESERVE-PUSH-DEPLOY-CLEAN.md).

The canonical release is deployed and verified. Continue the website from
`codex/tpi-development` at the post-release documentation commit, with the
production Worker at `4108a0d7-5833-435f-8a0b-f6be8c1c8b27` and rollback target
`a8709be8-6cec-4e99-a904-0f0e8877f00f`. The approved StudioFlow source remains
`ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` in
`/Users/toddknipple/Documents/StudioFlow/web-122` on
`codex/studioflow-122-notes`; that source repository has no configured remote.
The deployed assets are `index-CZ1q5Q9d.js` SHA-256
`89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3` and
`index-DtHLNYVn.css` SHA-256
`720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`.

The canonical release worktrees are clean, but the directive remains PARTIAL:
do not reset, clean, prune, or delete the original mixed StudioFlow checkout or
the historical dirty WIP worktrees listed in the execution record. The source
repository has no configured remote, so independent source-branch GitHub parity
is not asserted. The 122H.2 native local-folder filesystem test remains
PARTIAL and must not be called passed.

## TPI-STUDIOFLOW-122H — PODCAST PROJECT EXPORT VERIFIED (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122H-PODCAST-PROJECT-EXPORT.md).

Continue from source commit `56f8ad7cc403560e22388e907b2000ee9f49c0db` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-D_rpm-10.js` (`c029b5099fa67fff2220e823544b19b4ea816679088817244d1de796525cc349`)
and `index-kIGdvrxS.css`
(`9506b740f488255323852f2e43e95c463b81b66b155cd38d5a32105704cfaee8`).

Podcast project collections now expose read-only Project Files and Download
Project actions. The browser export creates a bounded standard ZIP with
offline note HTML, episode metadata, private attachments where fetchable, and
a manifest containing checksums and explicit omissions. Teleprompter scripts,
recordings/media, artwork, guest information, and scenes are not guessed into
projects because their current Studio/browser-local records lack verified
podcast associations. Firefox export acceptance passes; maintained Firefox is
64/64 and release safety is 21/21. Production remains unchanged.

The website Notes list now chunks attachment lookups into 80-ID D1 queries to
avoid a false 503 when an owner has a large existing Notes library. Preserve
the original mixed StudioFlow checkout and do not deploy D122H to production.

## TPI-STUDIOFLOW-122F.2C — FINAL NOTES FOCUS STYLING CORRECTION (2026-10-31)

Continue from StudioFlow source commit
`eb6d09d991d851d8f92853e60a2ecb8c0f934e87` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-BZJV5-la.js`
(`a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`) and
`index-CfXSYfAg.css`
(`ca4a20d0bbf23696f0baad2bdbe2c7f6f1961f1190b654457eccc4adcd33f415`).

The remaining green editor bottom line was the scoped
`.notes-rich-editor:focus-visible` inset shadow. It is removed; focus now uses
only a subtle shared-token surface tint and keeps the caret and keyboard
accessibility. Live Firefox computed-style verification passes with no shadow,
bottom border, or outline and a non-transparent caret color. Maintained Firefox
passes 64/64, release safety passes 21/21, and provenance/staging passes.

The full disposable Notes harness stalled before producing a result; do not
claim the broader Notes acceptance as passed. The inherited D122F.2B
attachment/image persistence gaps remain separate and unresolved. Production
remains unchanged; do not deploy under D122F.2C.

## TPI-STUDIOFLOW-122F.2B — INDIVIDUAL IMAGE REMOVAL PARTIAL (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2B-NOTES-IMAGE-REMOVAL.md).

Continue from StudioFlow source commit
`a9f0207876944b37c234e16b73d9e6a6863a9c8a` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-iWHM28jf.js`
(`a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`) and
`index-Py1pkkT-.css`
(`11e1a67b3cd18447de5691edaca14b5a103df2c3e7151260ec542c78de98c4a2`).

The Notes editor now shows a contextual Delete Image control for the selected
embedded figure, removes only that figure, and preserves browser undo/redo,
other images, text, captions and stored attachment references. Real Firefox
image interaction passes. Maintained Firefox passes 64/64, release safety
passes 21/21 and provenance passes. The repeated full Notes harness has a
disposable fixture hydration failure; image autosave/refresh, trusted keyboard
input and native uploaded-image bytes remain unverified. Production remains
unchanged; do not deploy under D122F.2B.

## TPI-STUDIOFLOW-122F.2A — NOTES EDITOR DOCUMENT-STYLE APPEARANCE COMPLETE (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2A-NOTES-EDITOR-DOCUMENT-STYLE.md).

Continue from StudioFlow source commit
`95fc46baae987dee0d7035e6032822330a709c32` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-DbEHpRbI.js`
(`ff618245fa0a77811673fab77632914fd6239f1a57a596ae3114da2a477e39e9`) and
`index-Diqa40JX.css`
(`e4abe1d372de5f21dbecdd97c2dc9f0fef053e7c0e37fa2f36431d82bfd8794a`).

The Notes editor no longer uses the full perimeter `box-shadow` focus box. It
keeps automatic focus and the blinking caret, applies a subtle shared-token
document tint, and provides a thin `:focus-visible` bottom cue for keyboard
users. Focused Notes acceptance passes, D122F.1 rail checks pass 13/13,
maintained Firefox passes 64/64, release safety passes 21/21, and provenance
passes. Production remains unchanged; do not deploy under D122F.2A.

## TPI-STUDIOFLOW-122F.2 Addendum — NOTES EDITOR WRITING FOCUS COMPLETE (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2-ADDENDUM-EDITOR-FOCUS.md).

Continue from StudioFlow source commit
`4caa882c4d13de283265d5204e2431370f825e70` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-c4ihiW_I.js`
(`ff618245fa0a77811673fab77632914fd6239f1a57a596ae3114da2a477e39e9`) and
`index-Dm22zsyB.css`
(`ef516f605e43d7e7437da49f9cedb439944d111e43b67e1e1f834bc215242975`).

The existing rich editor now focuses after note hydration, places an initial
caret in an empty note, places the caret at the end of existing content, and
uses a CSS-only `Start writing…` placeholder that is not saved. Focused Notes
acceptance passes, D122F.1 rail checks pass 13/13, maintained Firefox passes
64/64, release safety passes 21/21, and source/staging provenance passes.
Production remains unchanged; do not deploy under this development-only
addendum.

## TPI-STUDIOFLOW-122F.2 — NOTES ATTACHMENT CONTROLS COMPLETE (2026-10-31)

[Directive 122F.2 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2-NOTES-ATTACHMENT-CONTROLS.md).

Continue from StudioFlow source commit
`009211f13a1dd8ef6c7caed7fa94840eba7337b1` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-52sL-vjB.js`
(`6c7d5871f41bc1d3e30d56648e73d39a372e3acf1f90df507c266e4a34a641e5`) and
`index-ChghdUBo.css`
(`b7d6b2e0c427c3a79857268926ceeb2613fa4edd0eb140934e460aace57e8e2d`).

The Notes editor retains the toolbar Insert photograph and Attach file
controls. The duplicate above-toolbar Attach files chooser and permanent
footer chooser are removed. Editor drag/drop and clipboard handling remain
available; the empty-editor footer uses a contextual hint, and existing
attachments display as private filename/size links. Focused Notes acceptance,
rail checks, maintained Firefox, release safety, and provenance all pass.
Native file chooser and real clipboard/drag media bytes remain part of the
broader D122 attachment/recovery gap and are not newly claimed as executed.
Production remains unchanged.

## TPI-STUDIOFLOW-122F.1 — NOTES ORGANIZATION RAIL COMPLETE (2026-10-31)

[Directive 122F.1 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F1-NOTES-ORGANIZATION-RAIL.md).

Continue from source commit
`b9a7772fec70ceb4143deaa03963b89072a56564` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-lCAgDCwK.js`
(`240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48`) and
`index-D9akxKCz.css`
(`bc541f62a96352584b811fdc308bf4f4b71888fd7d586b4285887fbc2839f980`).
Website integration/documentation commit is
`3ec0888a3e7b144473ede7284122c2aef8e5b416`.

The collapsed organization state uses a dedicated narrow rail grid column; the
expand control is inside the rail and does not overlap the Note Library. The
expanded collapse control remains beside `Organize`. Focused geometry checks
pass 13/13, maintained Firefox passes 64/64, release safety passes 21/21 and
provenance verification passes. Production remains unchanged; do not deploy
under D122F.1.

## TPI-STUDIOFLOW-122F — NOTES COMPLETION CANDIDATE PARTIAL (2026-10-31)

[Directive 122F execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F-NOTES-COMPLETION.md).

Continue from StudioFlow source commit
`ef2377f8b92b278bdab67c18d51a44c5a63c3dd9` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-B0cx-IId.js`
(`240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48`) and
`index-DNQBejED.css`
(`75f2a65407810b92b9baea6fb0694bb3f5f802b67154e1044dbc3b9d8d7a3261`).
Website parity/documentation commit is
`54771c4c3834304636f95e4c38eb38897226c19e` and matches
`origin/codex/tpi-development`.

D122F leaves one Notes organization panel with the collapse control beside
`Organize`, an accessible reopen control when collapsed, and project/episode/
folder actions under Projects and folders. The redundant global/far-right
controls are gone. A sanitized structured research-reference block action is
available from the editor toolbar, and attachment IDs are carried into note
revisions. No migration was required.

Focused D122F Firefox is 11/11, maintained Notes acceptance passes, maintained
Firefox is 64/64, release safety is 21/21, and source/staging provenance is
verified. Keep this candidate PARTIAL: native attachment/recovery, fault-
injected and multi-tab autosave, full revision-restore, all-theme,
Chrome/Safari and tablet/mobile coverage remain unverified. Do not deploy to
production under D122F. Preserve owner data, the D121 production baseline and
the original mixed StudioFlow checkout.

## TPI-STUDIOFLOW-122E.1 — HOME CREATE LAYOUT COMPLETE (2026-10-31)

[Directive 122E.1 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122E1-HOME-CREATE-LAYOUT.md).

Continue from StudioFlow source commit
`1e08da2b651136ea19a654ad03b97ddd45ca4457` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-DmaCJVhN.js`
(`e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`) and
`index-DLIu5icU.css`
(`e09191f0e7f94bacea4e63876cf3d5e407c9b7076d7f4ab35203e71992e0ea13`).

D122E.1 replaces the Home `.create-grid` auto-fit minimum that wrapped
Teleprompter with a wide five-column layout and responsive 3/2/1 breakpoints.
It also adds only the responsive containment needed to prevent existing Home
menus, detail rows, and the dashboard grid from creating document-wide
horizontal overflow. The five card actions and required order are unchanged.
Focused Firefox acceptance is 19/19, maintained Firefox is 64/64, and release
safety is 21/21. Production remains unchanged; do not deploy under D122E.1.

## TPI-STUDIOFLOW-122E — HOME NAVIGATION AND DIALOG COMPLETE (2026-10-31)

[Directive 122E execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122E-HOME-NAVIGATION-DIALOG-USABILITY.md).

Continue from StudioFlow source commit
`046ae3aaeebf9945597ce7373f5a9ada8a00cd37` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-CAngUv37.js`
(`e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`) and
`index-CxtEcOJP.css`
(`c4a34d03e42c981b2168e6287e232552ba1cdcb0676b2067ff33cbe573487254`).

D122E adds the Home Notes card, preserves Home/Notes route intent across Worker
startup hydration, and makes the disabled permanent-deletion dialog scrollable
at reduced viewport heights. It does not clear the selected Studio or its
configuration and does not enable deletion. Focused D122E Firefox is 22/22,
maintained Notes is 57/57, maintained Firefox is 64/64 and release safety is
21/21. Production remains on the D121 baseline and was not modified.

## TPI-STUDIOFLOW-122D — USER FOLDERS COMPLETE (2026-10-31)

[Directive 122D execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122D-USER-CREATED-FOLDERS.md).

Continue from StudioFlow source commit
`bf93bb58a72eb0f5b0e47f401af0ebd97daa77ef` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-BjXZX1EX.js`
(`3568f459649e1b5f9ec01faa1440bb273121cedfaded88f6d32ff600750d7e47`) and
`index-CbVCorKW.css`
(`fafd2c34bac71f309a2656d959892cbff992535be9d5327387d070b43e89cbf9`).

The existing collection model supports nested folders through `parent_id`; no
migration was needed. The UI now has visible New Folder controls, persisted
tree expansion/selection, subfolder/rename/delete actions, folder filtering and
note movement. Backend parent ownership and cycle checks are enforced. Real
Firefox acceptance passes 57/57. Production remains unchanged and no
production deployment is authorized under D122D.

## TPI-STUDIOFLOW-122B — AUTOMATIC NOTE TITLES COMPLETE (2026-10-31)

[Directive 122B execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122B-AUTOMATIC-NOTE-TITLES.md).

Continue from StudioFlow source commit
`8a68c677fa8c29cd2dffe3fc7edb29ef1a9919a5` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves
`index-BkV9BhfI.js`
(`140141d76481fa3288fea1560ba564e59887e7e0c9a0c93952b7b0624adc6040`) and
`index-DCzHEnai.css`
(`c0a544549f0d440a3c017a3c4098158e62610b8cc36d7222b71cbeaaba9ece2c`).

Automatic naming is complete for this refinement: `New Note` is the empty
automatic title, the first meaningful rendered line updates the title through
autosave, direct title editing establishes manual mode, and More editing tools
can restore automatic mode. Existing note rows are preserved as manual by
additive migration 0056. Real Firefox acceptance passes 40/40, maintained
Firefox passes 64/64, and release-safety passes 21/21. Production remains on
the D121 baseline and must not be deployed under D122B.

## TPI-STUDIOFLOW-122A — CONNECTED NOTES REFINEMENT PARTIAL (2026-10-31)

[Directive 122A execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122A-CONNECTED-NOTES-WORKSPACE.md).

Continue from StudioFlow source commit
`fd4d2758f689f4731516055887cbac4df5c1f3dd` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. Website implementation commit `3207013` stages
`index-6-25XtSS.js`
(`70d7b5124a134765e606b493710f06316410157ef790702a38d8bd85004e4b2e`) and
`index-DCzHEnai.css`
(`c0a544549f0d440a3c017a3c4098158e62610b8cc36d7222b71cbeaaba9ece2c`) on
the authoritative 8787 Worker.

The real disposable Firefox acceptance passes 33/33, including connected
layout, collapse/restore, keyboard resize persistence, Focus Mode,
icon/ARIA/tooltip coverage, heading menu, find/replace, active formatting and
responsive overflow. Native file-selection uploads, pointer-drag execution,
all-theme checks and Chrome/Safari/device coverage remain open. Do not report
those as passed. Production remains on the D121 baseline and must not be
deployed under D122A.

## TPI-STUDIOFLOW-122 — NOTES CANDIDATE PARTIAL (2026-10-31)

[Directive 122 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122-FEATURE-RICH-NOTES.md).

Continue from StudioFlow source commit
`96e28a3de4129fb248a32fe0a7f0e0527409ebc9` in isolated worktree
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`. The authoritative 8787 Worker serves the D122
candidate assets `index-C48-jDnZ.js`
(`2b24c5295c7457f948fdf0109a5453c760cd103b7d6a642c4d69676d19a96314`) and
`index-D6SZajag.css`
(`340a54faf4f643d668dbecffe2d26883d94b9983616f7d195d9551a6feb2765c`).

The focused D122 Firefox check is 18/18, maintained Firefox is 64/64,
release-safety is 21/21, and reproducible source/staging provenance passes.
The website branch contains the additive Notes API/schema, manifest, staged
assets and focused verifier in website commit `d8abc8a`. No production command
is authorized for D122.

The implementation is deliberately handed off as PARTIAL. Remaining work is
full attachment upload/recovery UX, structured research-reference blocks,
revision restore and network/concurrency acceptance, all-theme/device/browser
coverage, and broader authenticated lifecycle testing. Do not report those
areas as passed merely because the core Notes path works. Preserve the D121
production baseline and do not reset owner data or the original mixed checkout.

## TPI-STUDIOFLOW-121 — PRODUCTION BASELINE ESTABLISHED (2026-10-31)

[Directive 121 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-121-CONTROLLED-PRODUCTION-DEPLOYMENT.md).

The owner-approved Enhanced Screen Sharing release is live and verified through
the guarded production workflow. Use StudioFlow source commit
`a8a7d11759905ae4bf8043005e0c2259b1fd6a81` and website release/baseline commit
`cbf652d5c5546f1c1b7e1c2e0fc9b8d25b3fe023`. Production Worker
`a8709be8-6cec-4e99-a904-0f0e8877f00f` is active at 100%; rollback is the
verified previous Worker `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2`.

The live D120 assets are `index-CgmAxo34.js`
(`f4bd273c8fe8f60ef6025389b0738b03f392a9d3d618fe3433b819083e1a3595`) and
`index-DpwwYG6_.css`
(`869e46025ce505491069a596af277bdacdd9df6a3493ac1e8db0c03a58a6b619`).
Preflight passed, anonymous production smoke passed 10/10, and isolated Firefox
production acceptance passed 64/64. Production data and authentication were
preserved; no rollback was required.

The owner confirmed Chrome screen sharing. Do not represent shared video/audio
in saved recordings, complete browser compatibility, or full end-to-end
screen-sharing recording as verified until the final StudioFlow acceptance
phase completes those deferred tests. Continue from this production baseline;
do not deploy unrelated unfinished work or enable permanent Studio deletion.

## TPI-STUDIOFLOW-120 — SCREEN-SHARING CANDIDATE BLOCKED PENDING NATIVE CAPTURE (2026-10-31)

[Directive 120 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-120-ENHANCED-SCREEN-SHARING.md).

Continue from StudioFlow source commit
`a8a7d11759905ae4bf8043005e0c2259b1fd6a81` in isolated worktree
`/Users/toddknipple/Documents/StudioFlow/web-120`, branch
`codex/studioflow-120-screen-share`. The authoritative local Worker at
`http://127.0.0.1:8787/studio/` serves the staged D120 candidate. Candidate
assets are `index-CgmAxo34.js`
(`f4bd273c8fe8f60ef6025389b0738b03f392a9d3d618fe3433b819083e1a3595`) and
`index-DpwwYG6_.css`
(`869e46025ce505491069a596af277bdacdd9df6a3493ac1e8db0c03a58a6b619`).

Source checks pass 10/10 for screen sharing and the real 8787 disposable
Firefox regression passes 64/64. The focused Firefox panel check passes 13/13
but deliberately does not automate the native permission picker. Do not claim
tab/window/display capture, shared audio, or saved captured-media recording
until a visible Chrome or Firefox session selects real disposable sources and
the output is decoded. Safari is not tested. Do not deploy production under
D120. Preserve the D119 production baseline, port 8787, owner data, and the
retired 5192 rule.

Directive 120A attempted the real Chrome native boundary on macOS 27.0 using a
disposable profile and controlled local tab. The request reached
`getDisplayMedia`, but System Events returned assistive-access error `-25211`,
so no native picker source was selected. Chrome tab/window/display capture,
shared audio, actual saved captured-media recording, Firefox native capture
and Safari capture remain unverified. Do not bypass the picker or use the
owner's existing Chrome profile. The next safe step is visible owner/manual
acceptance on port 8787 with disposable sources.

## TPI-STUDIOFLOW-119 — PRODUCTION BASELINE ESTABLISHED (2026-10-30)

[Directive 119 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-119-CONTROLLED-PRODUCTION-DEPLOYMENT.md).

The owner-approved Teleprompter 092 release is live and verified. Use
StudioFlow source commit `244993beab7f9fbba7ee89376a3b3dea616fa62a` and the
website release candidate `6d4c062ce0c3b647f39d3b5e3004531d692f62ba` as the
release provenance. Production Worker
`f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` is active at 100% traffic. The immediate
rollback Worker is `91a8460e-1db1-440c-9643-a85b6e178fba`; use the guarded
Wrangler rollback path and rerun authentication, Studio access, smoke and
Firefox acceptance checks if rollback is required.

The live approved assets are `index-DG-_pPI_.js`
(`66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560`) and
`index-28KfU4BI.css`
(`48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`). The
guarded preflight, production smoke 10/10, and isolated Firefox production
acceptance 64/64 passed. Do not add unrelated unfinished work, enable
permanent Studio deletion, alter production data, or deploy a different source
without a new reviewed release candidate. Continue development from this
known-good baseline and keep the original mixed StudioFlow checkout preserved.

## TPI-STUDIOFLOW-118 — CORRECT TELEPROMPTER SIDEBAR AND SCRIPT ORDER (2026-10-30)

[Directive 118 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-118-CORRECT-TELEPROMPTER-SIDEBAR.md).

Source commit `244993beab7f9fbba7ee89376a3b3dea616fa62a` corrects the D117
right-rail handler: clicking Teleprompter now activates only the sidebar and
does not open the full workstation. The sidebar uses the existing script store,
filters to the active Studio, and sorts by stable creation metadata oldest-first.
Legacy scripts without timestamps retain stored order. New and duplicated
scripts receive monotonic `createdAt` values; editing does not change order.

The sidebar's `Open Teleprompter` button still opens the shared workstation,
and selecting a script still opens the private transparent stage reader. Real
8787 Firefox acceptance passed 36/36, including all right-sidebar panels,
three UI-created scripts, creation-order persistence, Studio isolation, saved
non-silent recording audio, playable video and decoded-frame privacy. Production
was not changed or deployed. Owner acceptance remains pending.

## TPI-STUDIOFLOW-117 — PRIVATE STAGE READER AND SAVED SCRIPT SELECTION (2026-10-30)

[Directive 117 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-117-PRIVATE-STAGE-TELEPROMPTER-OVERLAY.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` serves the
D117 source candidate `3530140afefee9659947626db3f23524a25c3a80`. The right
Teleprompter rail lists scripts filtered to the active Studio and selecting one
opens the existing private presenter reader over the stage. The reader is
transparent, bounded, draggable, and uses the existing Studio-specific reader
state. The Home workstation and right-rail full workstation remain the single
shared script library/editor; the removed bottom-toolbar entry must not be
restored.

The real 8787 disposable Firefox acceptance run passed 24/24, including saved
non-silent VP8/Opus recording, control interaction, Studio A/B isolation,
reader positioning and decoded-frame privacy. Source focused checks are 38/38;
build, Voice FX, recording-audio and release-safety checks pass. Candidate
assets are JS `index-BTdN-mf4.js` (`b7cdf1c214f3d389d1b778a5790d2a0946e965ed14d78fb5a8ad5a435cb54aa9`)
and CSS `index-28KfU4BI.css`
(`48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`).

The website integration commit is `6e4c957`, pushed on `codex/tpi-development`,
and is ready for
owner acceptance and production release review, but no production deployment
is authorized or performed. The source repository has no remote; preserve the
local source commit and do not modify the original mixed checkout. Rollback is
the D116 website candidate commit `12b5ec1a74a13e82e9bb85d1e9f1e4b0b8b6bd51`
and its recorded assets, followed by local Worker rehydration and Firefox
smoke testing. Do not alter local D1/R2 state.

## TPI-STUDIOFLOW-116 — TELEPROMPTER WORKSTATION CONSOLIDATED (2026-10-30)

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now serves
the verified consolidation from StudioFlow source commit
`cf4afb9362fef8e4ec2d9ef82cafb3355805c611`. The Home Teleprompter remains the
complete workstation. The recording bottom-toolbar entry is removed, and the
right-sidebar entry opens that same workstation as a private full-screen
overlay. Back to Studio returns to the existing session. Do not recreate the
old limited modal or add a second script library.

Firefox Developer Edition acceptance on the real `8787` Worker passed 19/19
with disposable browser-local Studios A/B, including Studio-scoped script and
reader-state persistence, recording with the private canary visible, saved
VP8/Opus media decoding and OCR privacy inspection. Owner acceptance remains
pending. Production was not changed or deployed.

When continuing this work, preserve the source worktree
`/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, the source commit above, and the original
mixed checkout. Use only `npm run dev:local` and port 8787 for owner-facing
verification. Do not use or recreate port 5192, clear local data, migrate
Studios, enable permanent deletion, or deploy without a new explicit release
decision.

## TPI-STUDIOFLOW-115 — AUTHORITATIVE LOCAL DEVELOPMENT POLICY (2026-10-29)

[Directive 115 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-115-STANDARDIZE-AUTHORITATIVE-LOCAL-DEVELOPMENT-DOCUMENTATION.md).

Use only `http://127.0.0.1:8787/studio/` for owner-facing StudioFlow
development and acceptance. It is the local `workerd` Cloudflare Worker,
started with `npm run dev:local`, with local D1/R2 persistence at
`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3`.

StudioFlow source lives in `/Users/toddknipple/Documents/StudioFlow/web`; the
website repository contains the Worker integration and runtime. These are
separate from local persistent data. A different localhost port creates a
different browser-storage origin and does not automatically contain the
owner's Studios, recordings, scripts or preferences.

Temporary isolated environments are permitted only for automated engineering
verification. They are not authoritative, must not replace or become a
competing port-8787 server, and must not be presented as the owner's primary
application. Port 5192 is retired historical Directive 113 infrastructure.

Teleprompter 092 remains implemented and engineering-verified at commit
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`, with the verified audio repair
integrated, but it is not integrated into the current 8787 Video Setup 091
frontend. Owner acceptance is pending; production release is not authorized.

## TPI-STUDIOFLOW-114 — AUTHORITATIVE LOCALHOST VERIFIED (2026-10-29)

Use `http://127.0.0.1:8787/studio/` for the owner's existing StudioFlow
development environment. It is the maintained local Cloudflare Worker from
the website repository on `codex/tpi-development`, launched with
`npm run dev:local`, using local-only D1/R2 state in
`.local-dev/state/v3`. Preserve that browser origin, its authenticated session,
and its existing Studio/browser storage. Do not clear or migrate data.

The 5192 process from Directive 113 was only a Vite preview of detached
Teleprompter commit `05a9aa5...`; it had no Worker backend or owner data. It has
been stopped safely and its clean generated staging worktree was removed under
the mandatory amendment. The approved commit and D113 evidence remain
preserved. Brand 1 on that preview is not a source-age indicator; it is the
feature's default label on a separate browser origin.

The active 8787 asset remains the approved 091 bundle and does not contain the
092-specific Studio-scoped reader state or presenter-only markers. Do not say
Teleprompter 092 is on 8787. A future integration must update a separate
development candidate through the source-provenance workflow, verify the exact
feature assets, and test against preserved owner state without changing the
production baseline.

Every future StudioFlow handoff must identify URL/port, process and working
directory, repository/branch/commit, runtime type, backend bindings, browser
origin, storage locations and environment class (authoritative local,
temporary isolated, remote development or production) before staging.

See [Directive 114 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-114-RESTORE-AUTHORITATIVE-LOCALHOST.md).

## TPI-STUDIOFLOW-113 — DEVELOPMENT PREVIEW STAGED / OWNER ACCEPTANCE PENDING (2026-10-29)

Historical execution record only. The 5192 preview and its staging worktree
were retired under Directive 114; do not use this URL as a current development
or owner-acceptance path.

Directive 113 historically staged the approved feature commit
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` in
`/Users/toddknipple/Documents/StudioFlow/web-113-staging` and served it at
`http://127.0.0.1:5192/studio/` from reproducible generated `dist/` output.
Preview Firefox acceptance passed Teleprompter/two-Studio 39/39, focused checks
23/23, recording decode/privacy, loopback RTMP privacy, screen-share 9/9 and
Video Setup 091 9/9. Reused isolated backend regressions passed lifecycle
29/29, ownership 40/40, recording/storage 33/33, deletion 31/31, deletion
safety 32/32 and direct Worker 23/23. Directive 114 retired the preview and
removed the staging worktree after preserving its evidence. The URL was
local-only and owner approval remained pending. No Worker or production state
changed. See [Directive 113 staging record](100-DIRECTIVES/TPI-STUDIOFLOW-113-DEVELOPMENT-STAGING.md).

## TPI-STUDIOFLOW-112 — COMPLETE / INTEGRATED FEATURE COMMITTED / NOT DEPLOYED (2026-10-29)

Directive 111's verified audio repair is integrated into the preserved
Teleprompter 092 worktree at
`/Users/toddknipple/Documents/StudioFlow/web-109` on
`codex/studioflow-109-teleprompter`. The completed feature commit is
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`; the branch is clean and the
pre-existing Directive 110 evidence remains locally preserved and excluded.
The integrated build, default/explicit/invalid/blank microphone preferences,
decoded saved audio/video, Voice FX modes, Teleprompter browser acceptance
39/39, focused checks 23/23, two-Studio isolation, screen-share 9/9, recording
privacy, isolated RTMP privacy, Video Setup 091 9/9 and authenticated Worker
regressions all pass. The isolated lifecycle fixture passed 29/29, ownership
40/40, recording/storage 33/33, deletion 31/31, deletion safety 32/32 and
direct Worker 23/23. Permanent deletion remains disabled. Do not merge or
deploy automatically; any future promotion must follow the authoritative
source-to-live workflow and separate release authorization. See [Directive 112
record](100-DIRECTIVES/TPI-STUDIOFLOW-112-INTEGRATE-AUDIO-TELEPROMPTER-ACCEPTANCE.md).

## TPI-STUDIOFLOW-111 — RECORDING AUDIO REPAIRED / INTEGRATION REQUIRED / NOT DEPLOYED (2026-10-29)

The shared recording defect is repaired and verified in isolated source worktree
`/Users/toddknipple/Documents/StudioFlow/web-111`, branch
`codex/studioflow-111-recording-audio`, based on approved commit `6b9c3c4`.
Absent or blank `studioflow.micVolume` was converted to zero by
`Number(localStorage.getItem(...))`, muting the microphone gain before the
program recording destination. The focused repair restores fallback `1` and
does not alter the recording architecture, Voice FX placement, compositor or
Teleprompter implementation.

Fresh Firefox recordings now contain live recorder audio, non-silent decoded
48 kHz Opus at approximately 440 Hz, and playable VP8 video. Disabled,
enabled, changed and bypassed Voice FX all pass; Video Setup 091 is 9/9;
Teleprompter acceptance is 39/39; focused Teleprompter checks are 23/23; and
screen-share privacy is 9/9. The original mixed checkout and `web-109` remain
untouched and uncommitted. Do not merge automatically. The next directive must
review and integrate the isolated commit into `web-109`, then repeat combined
acceptance. Production remains unchanged and no deployment was performed.
See [Directive 111 record](100-DIRECTIVES/TPI-STUDIOFLOW-111-RECORDING-AUDIO.md).

## TPI-STUDIOFLOW-110 — TELEPROMPTER 092 ACCEPTANCE BLOCKED / NOT DEPLOYED (2026-10-29)

Continue only in `/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, based on `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
Directive 109 work remains uncommitted and was snapshotted as
`.directive110-evidence/directive109-source-recoverable.patch` (SHA-256
`6ae6d1a7ff879819feca8e1b4142d973ef4f6f109dd5155419a74079d8b7ec45`). Browser
acceptance 39/39, screen-share 9/9, local RTMP output canary check, Video Setup
091 9/9, Voice FX readiness, build, focused checks 23/23 and website release
safety 21/21 pass. Play/Pause/Resume/Close were confirmed during active recording
with both A/V tracks live; reopen-during-recording remains inconclusive. The saved
1080p video is playable/canary-free, but app program audio measured 0.0 RMS even
though a generated source measured ~0.087 RMS, and the saved Opus decodes as silent
with malformed packets. The program audio mix/capture path is therefore blocked.
Independent Firefox tone/mic control recording was non-silent (-23 dB). Studio
lifecycle/ownership/archive suites were not run because no isolated authenticated
Worker fixture/account is available. Do not commit until the program audio path is
verified with non-silent decodable output and isolated Worker-backed lifecycle
regressions pass. Original mixed source changes remain
preserved; website production baseline untouched; no production endpoint or
deployment used. Full evidence and exact results are in
`/Users/toddknipple/Documents/StudioFlow/web-109/.directive110-evidence/` and the
[Directive 110 record](100-DIRECTIVES/TPI-STUDIOFLOW-110-TELEPROMPTER-ACCEPTANCE.md).

## TPI-STUDIOFLOW-109 — TELEPROMPTER 092 DEVELOPMENT / ACCEPTANCE PARTIAL / NOT DEPLOYED (2026-10-28)

Feature source is isolated in `/Users/toddknipple/Documents/StudioFlow/web-109`
on branch `codex/studioflow-109-teleprompter`, based on approved Video Setup
source `6b9c3c4`. Existing Teleprompter editor/script functionality was reused;
new work adds Studio ownership/assignment, reader controls and per-Studio
selection/settings/scroll persistence, presenter overlay, host screen-share
close-before-capture guard and dedicated regression source checks (23/23).
Build and Voice FX architecture check pass. Browser loaded the local app and
verified script create/edit/save, but the preview harness stalled while entering
recording setup, so no live recording, device or livestream test is claimed.
Compositor source inspection establishes recording/RTMP video comes from the
separate canvas path and excludes presenter DOM; supported screen-share safety
is enforced by closing before host capture, but the actual captured output was
not empirically tested. The directive requires browser acceptance of the reader
and actual capture privacy; the preview stalled after entering the temporary
recording setup and no browser automation package is available in the isolated
source project. The feature is intentionally left uncommitted until those gates
can be exercised, rather than recording a false complete state. Production
unchanged; no deployment. See [Directive 109 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-109-TELEPROMPTER-092.md).

## TPI-STUDIOFLOW-108 — SOURCE-PROVENANCE WORKFLOW INTEGRATED AND PUSHED (2026-10-28)

Directive 107's staging correction (`3b55fe9`) is now on the authorized branch:
fast-forwarded `codex/tpi-development` from `b5cd1b7` and pushed with exact origin
parity. The maintained preflight staging check now builds only the baseline-approved
source commit (`6b9c3c4` recorded in `scripts/studioflow-release-baseline.json`)
from an isolated clean worktree. Verification: 107 suite 20/20, 025 12/12,
055 17/17; production assets byte-identical (`4eed57a4…`/`850186…`); Worker and
`studio/` application code unchanged. The 107 note "not pushed" is superseded by
this integration. Preserved development intact. Nothing deployed; production
unchanged. The next source release still updates the baseline commit + hashes in
its release commit before verifying/applying.
[Directive 108 record](100-DIRECTIVES/TPI-STUDIOFLOW-108-INTEGRATE-SOURCE-PROVENANCE-WORKFLOW.md).

## TPI-STUDIOFLOW-107 — SOURCE PROVENANCE FIXED / TOOLING ONLY (2026-10-28)

The 106 known gap is closed: authoritative staging no longer compiles the mixed
development tree. `scripts/stage-studioflow-authoritative.mjs` resolves its source
identity from `scripts/studioflow-release-baseline.json` (repository + exact
approved commit + known-good asset hashes) and builds exactly that commit from an
isolated clean worktree. It rejects dirty worktrees, wrong/missing commits, foreign
worktrees, unauthorized source paths and unauthorized staging surfaces; there are
no bypass flags. Verify-only never writes; `--apply` stages and re-verifies. Future
source releases update the baseline (commit + hashes) in their release commit
before verifying/applying. Regression: `npm run verify:studioflow-107-provenance`
(20/20). Work is committed on `codex/studioflow-107-source-provenance` and not
pushed per the directive; nothing deployed; production unchanged. The mixed
checkout keeps the unfinished 091/092 work and remains development-only.
[Directive 107 record](100-DIRECTIVES/TPI-STUDIOFLOW-107-SOURCE-PROVENANCE-AND-REPRODUCIBILITY.md).

## TPI-STUDIOFLOW-106 — DEPLOYED_AND_VERIFIED (2026-10-27)

The verified Video Setup 091 candidate is live at `https://paranormalinitiative.com/studio/`
on Worker `91a8460e-1db1-440c-9643-a85b6e178fba` (100% traffic); rollback is
`17b9f9d5-717e-42a9-92d1-14b0dd717ef6`. Release commit `9b3f033` (application
byte-identical to `81a234a`; JS `4eed57a4…`, CSS `850186…`); source `6b9c3c4`.
The 105 auth blocker is resolved: development preserved to `fc6fe45` on
`codex/studioflow-105-preserved-development`, and the canonical checkout now runs
clean `codex/tpi-development`, so the managed Worker/verification serves the candidate.
Do not switch the canonical checkout away from `codex/tpi-development` without first
preserving any new work. Auth lifecycle PASS, preflight READY, live smoke 10/10,
Firefox acceptance 64/0, Video Setup 091 9/0. Both permanent deletion modes remain
unavailable; 101–102 deletion-safety work stays on its branches, undeployed.
Known gap: authoritative staging builds the mixed source tree, not the clean candidate
commit — retarget it before the next source release. Physical-device/owner acceptance
of the live interface remains pending owner action. No credentials are in this handoff.
[Directive 106 deployment record](100-DIRECTIVES/TPI-STUDIOFLOW-106-RESOLVE-AUTH-GATE-AND-PRODUCTION-DEPLOY.md).

## TPI-STUDIOFLOW-105 — RELEASE STOPPED AT MANDATORY AUTH GATE (2026-10-26)

Authorized branch is now in `.local-dev/worktrees/website-105`, with candidate and
104 acceptance commit `20eba92` pushed fast-forward and origin parity verified.
Original website dirty checkout remains at `6c48b45` on renamed branch
`codex/studioflow-105-preserved-development`; its file bytes/status are preserved.
Original StudioFlow and existing 091/source-103 worktrees untouched. No application
changes or asset rebuild: exact JS/CSS hashes and 103 application parity pass.
Mandatory auth lifecycle failed immediately because the isolated release worktree
lacks its protected credential file/local state. Per 105, stopped before deployment;
full preflight and live verification not run. No new authorization is needed merely
because older 104 records required it, but all safety gates still must pass.
Next: establish maintained isolated auth/service ownership and exact clean source
provenance without building mixed originals or bypassing release scripts. Then rerun
mandatory auth lifecycle/full preflight. Both permanent deletion modes stay unavailable.
[Directive 105 traceability and exact failure](100-DIRECTIVES/TPI-STUDIOFLOW-105-PRODUCTION-RELEASE.md).

## TPI-STUDIOFLOW-104 — LOCAL ACCEPTANCE PASSED / GUARDED RELEASE BLOCKED (2026-10-26)

Continue from `.local-dev/worktrees/website-104`, branch
`codex/studioflow-104-release-acceptance`; application remains website `81a234a2`
and source `6b9c3c4b`. Acceptance harness/documentation changes are uncommitted.
Disposable credentials/state are ignored within that worktree; never print or commit them.
Lifecycle 29/29, 035 33/33, 087 40/40, 088 31/31, 089 32/32,
authenticated 091 9/9, Worker integration 23/23 PASS. Asset hashes unchanged.
Both permanent deletion modes remain unavailable; 088/089 successful-deletion
scenarios are explicitly excluded/replaced by rejection and preservation checks.
Release safety contract 21/21 and local-config dry-run PASS, but guarded preflight
stops at `release branch must be codex/tpi-development`; not READY.
Do not merge/push/deploy without explicit authorization. Preserve dirty originals;
reconcile authoritative clean source and release branch, establish origin parity,
then run maintained auth lifecycle/full preflight. No source/asset repair needed.
Physical-device and production/owner acceptance remain unverified.
[Directive 104 detailed handoff and evidence](100-DIRECTIVES/TPI-STUDIOFLOW-104-RELEASE-ACCEPTANCE.md).

## TPI-STUDIOFLOW-103 — SOURCE INTEGRATED / RELEASE BLOCKED (2026-10-26)

New isolated source branch `codex/studioflow-103-video-setup-release`, commit
`6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`; website branch
`codex/studioflow-103-website-release`. 091 integrated; both permanent deletion
modes intentionally disabled in UI/handler/bridge and authenticated server purge route.
Worklet BASE_URL compatibility fixed after exact staged Firefox failure; rerun 9/9 PASS.
Reproducible staged builds, Voice FX architecture, 101 22/22, 102 8/8, 093 and
website static guards PASS. Lifecycle/035/087/088/089 acceptance BLOCKED by missing
isolated QA credentials. Preflight rejects non-release branch; origin parity and
full Worker acceptance pending. Originals hash-verified unchanged; 092 excluded.
No push, merge, deployment or owner acceptance. See
[Directive 103 candidate evidence](100-DIRECTIVES/TPI-STUDIOFLOW-103-VIDEO-SETUP-RELEASE-CANDIDATE.md).

## TPI-STUDIOFLOW-102 — BLOCKED (2026-10-26)

Real disposable Firefox tests reproduce a legacy tab writing ownership metadata while
another tab holds an exclusive Web Lock. Current-writer locks cannot exclude older tabs;
localStorage ownership and IndexedDB cleanup have no shared transaction. Explicit stop
condition reached; content deletion remains blocked. Source stays clean at `0a104519`.
Browser boundary/storage/helper-recovery checks 8/8, existing local fixtures 22/22,
TypeScript, production build and unchanged 093 regression pass. Full application
concurrent completion/switching and interrupted cleanup acceptance remain unverified.
No source/server repair, 091/092 import, original-tree edit, push, merge or deployment.
[Directive 102 evidence and writer inventory](100-DIRECTIVES/TPI-STUDIOFLOW-102-CROSS-TAB-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-101 — BLOCKED (2026-10-26)

Partial local deletion repairs committed in isolated source `0a10451997e19a09ef2aae94bb9b25395603bfac`.
Local injected fixture tests 22/22, TypeScript, production build and unchanged 093 VM regression pass.
Existing ownership writers and older tabs do not coordinate with deletion locks; a last-moment
localStorage read is not atomic with IndexedDB deletion. **Content deletion now fails closed
before any mutation**; Studio-only retains blobs. This is an intentional blocked-development
behavior change, not safety completion or release readiness. Actual browser/IndexedDB and
cross-tab acceptance remain unverified. No 091/092 code, original-tree edits, push, merge or deployment.
Resolve all-writer coordination and old-tab handling before enabling cleanup. See
[Directive 101 evidence](100-DIRECTIVES/TPI-STUDIOFLOW-101-LOCAL-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-100 — SOURCE ISOLATED (2026-10-26)

Deletion source is isolated on `codex/studioflow-100-deletion-isolation`, source commit
`8b72de811cf1623ac7d6caa5642a43e418d69924`. Paired website server branch:
`codex/studioflow-100-deletion-server`. The website commit is the commit introducing
[the Directive 100 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-100-DELETION-ISOLATION.md).
Both worktrees are under the original website checkout's ignored `.local-dev/worktrees/`.
Original development file bytes and statuses were fingerprinted and verified unchanged.
TypeScript/build/isolation checks and 093 VM purge regression passed. 088 and 089 were
attempted but blocked before browser launch by missing isolated `test_admin` credentials.
No generated website assets, push, merge, deployment, or production mutation occurred.
No 091 or 092 code is included. This is not implementation-complete, safety-verified,
deployed, or owner-accepted. Preserve browser-local recordings; no new ownership DB.
The existing browser bridge already constructs local/shared blob lists; earlier claims
that the server must return them omitted that layer. Local error swallowing, reference
ambiguity, cross-tab races and dialog overflow remain for subsequent implementation.
See the execution record for exact files, build hashes, evidence and next actions.


Last verified: 2026-10-26
Current controlling directive: TPI MASTER — Standing Autonomous Agent Authority

## Mandatory authority update

Read `100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`. Agents now have
standing authority to investigate, repair, test, commit, push, perform guarded
production deployment, verify live, and roll back. Do not stop for a routine
repairable blocker or require a fresh owner directive for each lifecycle step.
Historical restrictions below describe prior executions and do not override
the controlling directive.

## TPI-STUDIOFLOW-088 Deletion & Archive — Production Verification — 2026-10-26

`LIVE VERIFIED — OWNER ACCEPTANCE PENDING`. Production verification of the
deletion suite reproduced two production-only defects, both repaired and
re-verified live: background Studio activations (boot replay, identity
convergence) no longer navigate the owner out of the view they chose —
activations carry a `background` flag and the first pointer/keyboard/click
input arms the guard — and Studio archive/restore now retry once with the
fresh version from a `workspace_conflict` (409) response and report failures
in the panel status instead of swallowing them. `deleteStudio` compares every
Studio identity before selecting the safe Home destination. Regression: 088
suite 39/39 including the new Test 11 view-guard checks, on authenticated
production with disposable QA Studios and locally; 087 40/40, lifecycle
29/29, auth lifecycle 64/64. Source `9f85f9d` (StudioFlow repo, local-only);
website commits `5e206a7`, `6d9facb`, `7da1fb5` (pushed); live Worker
`fb9ffdb9-137f-4e9e-b5a3-6c5c5fe1e91b`, rollback `5ee8b6d2` (earlier
checkpoints `25f3d4ea`, `d0dc37a5` preserved). See
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-088-DELETION-PRODUCTION-VERIFICATION.md`.

## TPI-STUDIOFLOW-087 Independent Studios & Dashboards — 2026-10-26

`LIVE VERIFIED — OWNER ACCEPTANCE PENDING`. The homepage/My Studios identity
mismatch (Broadcast records vs Studio identities) is repaired: the Home page
now renders My Studios cards from the same authorized Studio collection as
the My Studios selector, each Studio has its own dashboard with its own
productions and recordings, Studio vs production creation are separate with
an Owning Studio selector, and productions are stamped with their Studio's
stable host key at creation. Rename/Archive/Restore round trip (the missing
server restore route was added). Permanent deletion is deferred for owner
approval; unowned historical productions stay preserved and unassigned.
087 suite 40/40 local and 40/40 on authenticated production (isolated QA
account). Source `db3aab4`; integration `37803f3` + `815fb85` (pushed);
production Worker `b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf`, rollback
`6bbdae3d`. `release:preflight` now runs the 087 suite too, enforced by the
release-safety contract. See
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS.md`.

## Emergency Live Production Repair 001 — 2026-10-25/26

`DEPLOYED AND AGENT-VERIFIED — OWNER ACCEPTANCE PENDING`. Studio switching
and browser-local recovery were repaired in `studio/workspace-bridge.js`:
malformed/corrupt snapshot records are preserved under
`studioflow.tpiLocalStudioSnapshots.recovery.v1` before replacement, the
My Studios menu refreshes on open, stale selections explain themselves, and a
title conflict no longer disarms the save integrity gate (a blocked switch
stays put and explains the failure). Testing 123
(`a75afc38-c7a6-452d-9460-5d746712d411`) was reset to the clean four-item
default under explicit owner approval and verified in the database and live
interface. Lifecycle suite 29/29 local and 29/29 production; deployed Worker
`6bbdae3d-f424-4373-87ff-84030df50a49`, rollback `9d3aa40c`, source `af7fbc0`.
"Browser Only Crossroads" is browser-local-only; a read-only owner diagnostic
is in the completion record (section J):
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`.

## Owner Verification 001 — 2026-10-25

`AGENT VERIFIED — OWNER ACCEPTANCE PENDING`. The Studio lifecycle recovery was
re-verified on authenticated production with the isolated QA account (lifecycle
suite 25/25 production, 25/25 local; active Worker `9d3aa40c`, rollback
`7bddac9c`; live assets byte-identical to the website integration). Read-only
D1 inspection: the owner's "Testing 123" (`a75afc38-c7a6-452d-9460-5d746712d411`)
saved state retains the historically inherited eight-item Crossroads-like
configuration from the pre-repair build (created 16:37Z, repair deployed
22:16Z); remediation is proposed in the completion record and awaits explicit
owner authorization — nothing was modified. "Browser Only Crossroads" has no
server record (browser-local only) and cannot be inspected server-side.
`release:preflight` now runs `verify:studioflow-studio-lifecycle` (enforced by
a release-safety contract check). The five static-contract suite failures
(048/049/dev-024/dev-037/022) and the flaky 030 rapid-upload step remain open
and documented. See
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md`.

## Current Studio lifecycle recovery release

The Studio Creation, Switching & Workspace Isolation Recovery is deployed and
live-verified; owner acceptance remains pending. Source commit `44f9478`
(StudioFlow canonical repository, local-only), website application commit
`161d03d` (pushed to `codex/tpi-development`). Production Worker
`9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` is active with rollback checkpoint
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`; the live application serves
`/studio/assets/index-Drm85nEM.js` and `/studio/assets/index-8wAEEeJ8.css`.
Guarded release preflight passed and `DEPLOYED_AND_VERIFIED` ran 64/64 live
acceptance checks. The maintained `npm run verify:studioflow-studio-lifecycle`
suite (Directive Tests 1–10 plus owner-flow checks) passes locally and
against production with the isolated QA account. See
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`.

## Previous integrated recovery release

The integrated StudioFlow management and Scenes recovery is deployed and
visually verified in production; owner acceptance remains pending. Source
commit `657f80e`, website application/verification commit `e83b732`, and
documentation checkpoint `bae6ce0` are recorded in the completion record.
Production Worker `7bddac9c-bda3-41c1-95d2-13aacc09cb28` is active at 100%
traffic with rollback `871c0ae7-33c5-46ae-b635-19ec3100c989`. Guarded release
preflight passed, anonymous production smoke passed 10/10, and isolated live
Firefox Developer Edition acceptance passed 64/64 with a disposable synthetic
production QA account. The live application loaded the verified bundles
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`.

## Workspace

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Last fully verified workflow baseline: `b1c21a085be679eb156c1c83277119c861068921` (application) / `8fdabf4` (source)
- Active production Worker version: `d58d7e1e-5f86-4c87-93b3-110999d200a9`
- Recorded rollback target: `4b44e41d-7fb1-43a8-b9d9-510a90672cb0`
- Local website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`
- Worker ownership: launchd-owned by `com.tpi.local-development`

## Integrated recovery checkpoint — 2026-10-25

The current repair is committed as source `657f80e` and website application
`e83b732`. It corrects the Studio lifecycle and Scenes integration
as one path: new Studios use a clean independent configuration, creation
activates the returned workspace, Studio switching is generation-guarded,
scene menus are fixed-position viewport-safe overlays, legacy Move Up/Move Down
commands are removed, and scene/panel changes emit one meaningful autosave
signal only when their serialized value changes.

The maintained integrated Firefox suite passes 21/21. TPI-027, 028, 030, 031,
033, 034, 035 (33/33), 036, 037, Addendum D, and Addendum E pass locally. The
035 run exposed and verified the fix for a denied production reservation that
left the browser lock marked active and blocked later Studio switching.
The guarded release and live acceptance are complete; the release status is
`DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING`.

## TPI-STUDIOFLOW-037 production recovery — current handoff

The live Addendum E acceptance failure was traced to menu visibility, not stale
source: `.scene-item-context-menu` was positioned at `right: -204px` and was
clipped by the Studio grid's `overflow: hidden`. The source repair is
`eff6b69`; the website application/test commit is `877efb3`; the active
production Worker is `871c0ae7-33c5-46ae-b635-19ec3100c989`; rollback is
`d58d7e1e-5f86-4c87-93b3-110999d200a9`.

The maintained Addendum E test now uses a real Firefox element click and fails
unless the menu has a non-zero, in-viewport bounding rectangle. Local and live
focused runs passed 20/20, including context-menu visibility, right-click,
rename persistence, non-destructive removal, and Intro preview stop isolation.
Live resources loaded `/studio/assets/index-BfmRc0ua.js` and
`/studio/assets/index-DB0QL1ns.css`. Owner acceptance remains pending.

## TPI-STUDIOFLOW-037 Addendum E current handoff

Addendum E is repaired, deployed, and live-verified. The
confirmed defects were durable shortcut recreation after removal, missing
shared context-menu coverage for Background Music, and preview lifecycle
state being mistaken for a production scene transition. New Studios now use
Intro Video → Scene 1 → Scene 2 → Outro Video; `Remove from Scenes` removes
only the panel shortcut; new scenes use the next available sequential name;
and deleting a saved scene layout remains confirmation-backed. Individual
Intro preview stop does not start After Intro music, while natural completion
and sequence rehearsal preserve the production handoff.

The maintained Firefox Addendum E suite passed 20/20. The source commit is
`8fdabf4` in `/Users/toddknipple/Documents/StudioFlow/web`; the website
application commit is `b1c21a085be679eb156c1c83277119c861068921`. Production
Worker `d58d7e1e-5f86-4c87-93b3-110999d200a9` is live with rollback
`4b44e41d-7fb1-43a8-b9d9-510a90672cb0`. Guarded live smoke passed 10/10 and
isolated Firefox acceptance passed 64/64. The focused Addendum E suite passed
20/20 against production with the disposable synthetic production QA account;
its workspace was archived after verification. Owner acceptance remains
pending until the owner confirms the corrected interface.

## TPI-STUDIOFLOW-037 current handoff

Addendum D is deployed and live-verified. Playable production shortcuts use
independent first-click play/second-click stop behavior through the existing
timer, Video Clips, and Background Music engines. Play Sequence is now a
visible Play Sequence/Stop Sequence rehearsal toggle with cancellation tokens
and timeout cleanup. The context menu's `Remove from Scenes` action removes a
panel shortcut without deleting its underlying asset. The focused Addendum D
regression passed 10/10. Source commit is `5186e28`, website application/test
commit is `8d46a45`, production Worker is
`3a9b090f-78b5-43d6-bb11-17a1ba54d41b`, and rollback is
`5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`. Local/live isolated Firefox
acceptance passed 64/64 and production smoke passed 10/10. Owner acceptance
remains pending. See
`300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md`.

The Scenes panel redesign, Addenda A/B uniformity corrections, the reactive
drag-and-drop repair, and the Addendum C visual-consistency and drag
interaction corrections are deployed and live-verified. Source commit is
`d6b8f03`; website application commit is `8a954ad` (test commit `dd22fc5`).
The maintained Firefox suites `npm run verify:studioflow-037-scenes-panel`
(20/20) and the Addendum C acceptance suite (26/26) pass. The panel uses
uniform stable shortcut items for Intro Video, Countdown Timer, Production
Scene, Video Clip, and Outro Video with single-line labels and full-name
tooltips, per-Studio ordering, skip flags, context actions, rehearsal-only
Play Sequence, the same drag handle on every movable item, a live `Move here`
gap with surrounding rows visibly repositioning as the pointer moves, Escape
cancellation, edge auto-scroll, Background Music SmartPad color indicators,
and existing workspace autosave. Dragging does not preview media. Existing
timer, Video Clips, and Background Music engines (including After Intro
Background Music and Background Music Stop) remain authoritative; TPI-031
remains passing.

The active production Worker is `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`; the
rollback reference is `1c752f3f-8af3-461f-8082-3dd8a447fd3d`. Production smoke
passed 10/10, isolated Firefox live acceptance passed 64/64, and the Addendum
C suite passed 26/26 against the deployed interface with the synthetic
production QA account. Owner acceptance of the corrected interface is
pending.

The authoritative StudioFlow source is the separate repository:
`/Users/toddknipple/Documents/StudioFlow/web`. The website `studio/` directory
is an integrated generated copy plus maintained TPI bridge files. Use
`node scripts/stage-studioflow-authoritative.mjs` in verification-only mode to
build twice and compare the candidate before any reviewed `--apply` operation.
The complete commit/push/deploy distinction is documented in
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`; use it instead of inferring current
procedure from historical directive or completion records.

Preserve unrelated tracked and untracked changes. Focused commits and pushes to
`codex/tpi-development` are authorized after the applicable checks pass. Do not
reset, clean, stash, force-push, or rewrite history as a routine shortcut.

## TPI-STUDIOFLOW-036 current handoff

TPI-STUDIOFLOW-036 is deployed and live-verified. The nine approved silent
timer themes are available in the existing Video Timers section: Classic
Countdown, Stargate Portal, Alien Transmission, Haunted Clock, Spirit
Manifestation, EVP Signal, ITC Communication, Paranormal Energy Vortex, and
Ghostly Countdown. They share one countdown engine and program-output path;
the four existing durations remain 10, 20, 30, and 60 seconds.

The source revision is `37c6598` in
`/Users/toddknipple/Documents/StudioFlow/web`. The deployable website
checkpoint is `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`, and production Worker
`076c9614-9251-4efd-b047-0e7033f4ad9c` is active at 100% traffic. Immediate
rollback is `aa9bff15-6252-4ae5-9422-17d63b99ab5a`.

The maintained `npm run verify:studioflow-036-video-timers` test passed 28/28.
Local and live isolated Firefox acceptance passed 64/64, production smoke
passed 10/10, and the complete guarded preflight passed. One initial disposable
API gate attempt hit a transient isolated migration startup failure; the
isolated migration was verified independently and the clean retry passed.

The implementation uses `src/videoTimerThemes.ts`, the existing React timer
engine in `src/App.tsx`, the existing workspace configuration bridge, and the
API normalizer. A startup hydration race and a stale duplicate React-owned
timer grid were corrected during validation. No separate timer player,
browser-only persistence system, audio path, or owner-data mutation was added.

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`
- `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`

## TPI-STUDIOFLOW-035 current handoff

The right-navigation cleanup, Teleprompter placement, and Recording & Storage
consolidation are deployed and live-verified. The maintained regression
`npm run verify:studioflow-035-recording-storage` passed 33/33 against the
local Worker in disposable Firefox with fake media devices
(`media.navigator.streams.fake`, `media.navigator.audio.fake`,
`media.navigator.permission.disabled`). It covers the three rail removals,
Teleprompter beneath Notes reusing the existing reader, the seven
consolidated sections, both Settings redirects, connected/persisted
recording settings, the confirmed save lifecycle with the actual destination
reported, destination-fallback decline (awaiting-action) and approval, and
per-studio preference isolation across real Studio switching.

Authoritative StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`.
The workspace bridge recording-settings save/hydrate mapping was repaired in
`studio/workspace-bridge.js` and the activation re-read in `src/App.tsx` —
see the completion record for the four documented defects and the settings
inventory.

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`

Production Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a` is active at 100%
traffic; the immediate rollback is `5c8e78b5-f920-4335-940f-a5e4d6df0e49`.
Guarded live Firefox acceptance passed 63/63 and anonymous smoke passed; the
standalone acceptance runner refuses production targets outside the guarded
release. Cloud storage destinations remain unimplemented and are presented
only as "Not connected"; implementing one requires owner direction and
registered OAuth credentials.

## Prior handoff — TPI-STUDIOFLOW-033

The configuration persistence repair is deployed and live-verified. The focused regression
`npm run verify:studioflow-033-roundtrip` passed 26/26 against the local Worker
with disposable Firefox Studios. It covers `videoClipSlots`, validated slot
positions, scalar `programOrientation`, existing Background Music fields,
stale-save rejection, Studio A/B switching, isolation, and refresh restoration.

Authoritative StudioFlow source commit: `53bf8dc` in
`/Users/toddknipple/Documents/StudioFlow/web`. The completion record and field
inventory are:

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`

Production Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49` is active at 100%
traffic. The immediate rollback is `0c0a8660-21cf-47e1-ac66-98c91b26972c`.
The live non-destructive release acceptance passed 64/64 and anonymous smoke
passed 10/10. The new 033 disposable server round-trip remains local evidence;
live acceptance did not mutate production Studio configuration.

## Latest verified production release

The latest release is TPI-STUDIOFLOW-035: application commit `d0b1f70`, source
commit `60af530`, Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a`, rollback
`5c8e78b5-f920-4335-940f-a5e4d6df0e49`. It is `DEPLOYED / LIVE VERIFIED`.
The 035 suite passed 33/33; guarded live smoke and Firefox acceptance passed
and the deployed bundle serves the new Recording & Storage and Teleprompter
panels. Full evidence is in the TPI-035 completion record.

Prior release TPI-STUDIOFLOW-033: application commit `cb38061`, Worker
`5c8e78b5-f920-4335-940f-a5e4d6df0e49`, rollback
`0c0a8660-21cf-47e1-ac66-98c91b26972c`. It is `DEPLOYED / LIVE VERIFIED`.
The configuration normalizer and hydration repair passed the focused 26/26
local round-trip; guarded live smoke and Firefox acceptance passed 10/10 and
64/64. The prior TPI-034 mutation repair remains in the deployed baseline.
Full evidence is in the TPI-033 completion record.

Deployment commit `6a1f8ad77649f1ef175a5191396d55a45141764c`
(TPI-STUDIOFLOW-032 — Background Music and Sound Effects icon replacement;
feature commit `02056c1`) was deployed to Worker `theparanormalinitiative`
as version `7029c6c5-3994-42a1-9570-d6119a5792f3` at 100% traffic on
2026-10-24. The release passed the 021 browser suite 31/31 (two
consecutive runs), 028 browser 33/33 (twice), the 030 sound-effects suite
25/25 (twice), the 031 music-pad suite 34/34 (twice), 021 static
contracts 86/86, 020 playback 14/14, 020 video clips 13/13, 027 contracts
12/12, 031 overlays 12/12, release safety 17/17, the complete local auth
lifecycle (isolated Firefox 64/64), complete preflight, the guarded
Wrangler dry-run, and the guarded live acceptance against production
64/64 (`DEPLOYED_AND_VERIFIED`). Both pad artwork files were verified
serving byte-identical on production. Crossroads, D1, R2, and owner
browser storage were not modified. The current approved StudioFlow playback
contract and regression history are in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.

## Latest StudioFlow repair

The deployed change is documented in
`300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`.
The API now preserves Video Clips assignments, validated slot positions, and
scalar program orientation through server round-trips and Studio activation.
The focused disposable API/Firefox regression passed 26/26. The prior
TPI-032 pad-artwork behavior remains in the deployed baseline.
The audio pads now show the owner-approved per-category artwork inside the
unchanged circular icon container — Waveform on Background Music pads,
Microphone on Sound Effects pads (`studio/Waveform.png` and
`studio/Microphone.png`, byte-identical to the owner's Desktop originals,
which were left untouched). The artwork is proportion-preserving and
pointer-transparent; pad layout, playback, drag-and-drop, context menus,
and the TPI-030/031 interfaces are unchanged. The 021 browser suite's
obsolete home-screen entry was repaired (each run seeds a fresh
browser-local recording broadcast — the same empty-state studio the home
"Record without going live" flow creates — with all assertions unchanged),
which also ends the disposable test-account studio pollution recorded as
TPI-030 finding 3. The TPI-033 normalizer gaps are resolved, and the TPI-034
bridge mutation storm repair remains in the deployed baseline. The 028 scene playback
workflow
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`,
including its Addendum A section), the TPI-030 Sound Effects work
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`),
and the TPI-031 Background Music work
(`300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`)
remain untouched in the deployed baseline.
Use the disposable Firefox acceptance profile for future checks; do not use
the owner profile for destructive testing.

The automated production acceptance gate must use the disposable Firefox
window titled `TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE`. After that gate
passes, StudioFlow's final user-facing acceptance target is the authenticated
live production page. When the owner has authorized live verification, the
existing production tab may be used non-destructively to confirm the exact
visible behavior; do not alter stored studios, media, recordings, or settings.

## Current browser workflow

- Firefox Developer Edition is the default browser for local and production
  TPI acceptance.
- StudioFlow completion is judged against the live production site. Local
  checks remain safety gates but are not substitutes for live acceptance.
- Automated acceptance uses isolated disposable profiles and never closes or
  repurposes the owner's existing local or production tabs.
- Chromium is used only for an explicit compatibility requirement.

The latest retained browser evidence is 278 PASS, 6 expected limitations, 0
FAIL across 284 routes, with 54/54 focused checks passing and zero external
requests. Synthetic local roles are `local_admin`, `local_member`, and
`local_contributor`; credentials must never be printed or copied into reports.

## Recent verified changes

- OPS-018 changed shared fragment URLs in `includes.js` to root-relative paths
  and restaged local assets; the Worker was not restarted.
- The existing browser harness is `scripts/e2e/tpi-ops-016-browser.mjs`.
- Repository-scoped Playwright tooling uses the locally available package and
  installed Chrome without a browser download.
- OPS-019 policy and result records document Codex/FreeBuff/Opera boundaries.

## Last successful checks

- OPS-002 traffic protection: 11/11
- OPS-007 local foundation: 10/10
- OPS-009 authentication: 27/27
- OPS-011 member home: 37/37
- OPS-012 StudioFlow/ParaTube: 26/26
- OPS-014 local service: 20/20
- OPS-015 admin/API QA: 62/62
- `node --check includes.js`: passed
- `node --check scripts/e2e/tpi-ops-016-browser.mjs`: passed
- `git diff --check`: passed

## Safe continuation

Open the affected route in an isolated Firefox Developer Edition profile,
inspect console and local request activity, and run the smallest applicable
test followed by the required regressions. Agents may control the maintained
LaunchAgent services, commit, push, and deploy through `scripts/tpi-release.mjs`
when required. Do not interrupt unrelated services, expose credentials, or use
owner Studios for destructive testing.

No credentials, tokens, private payloads, or secrets are included in this
handoff.

## TPI-STUDIOFLOW-122H.1 local-folder handoff

The 122H.1 candidate is staged only on port 8787. Use the existing Project
Files dialog to choose a browser-authorized local directory and then explicitly
run `Sync Project to Local Folder`; there is no background or bidirectional
synchronization. `Download Project` remains the fallback for Firefox and other
browsers without File System Access API support. The implementation preserves
unrelated local files and writes conflict copies when an exported file was
changed outside StudioFlow.

Source `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` is clean and staged with JS
`index-CZ1q5Q9d.js` SHA-256
`89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3` and CSS
`index-DtHLNYVn.css` SHA-256
`720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`.
Automated build/staging, ZIP fallback 17/17, Firefox regression 64/64, and
release safety 21/21 pass. Native Chrome folder selection and independent
real-filesystem inspection remain unverified; do not report this directive
complete until a visible supported browser completes that gate.

## TPI-STUDIOFLOW-122H.2 verification handoff

Execution record: `100-DIRECTIVES/TPI-STUDIOFLOW-122H2-LOCAL-FOLDER-VERIFICATION.md`.

The real 8787 Project Files dialog and disposable-project setup were verified
in isolated Chrome, but the native macOS directory picker did not complete in
the available automation session. No local files were written or claimed.
The ZIP fallback passed 17/17, maintained Firefox passed 64/64, and release
safety passed 21/21. Treat 122H.2 as **PARTIAL** until a supported browser
completes native folder selection, real filesystem inspection, repeated sync,
and external-file conflict protection.

## Documentation synchronization

Every completed TPI directive must update the affected Markdown records before
its status is marked complete. Record changed source files, executed evidence,
known limitations, development status, and the directive-index entry. Do not
describe a feature as production-ready from local tests alone.

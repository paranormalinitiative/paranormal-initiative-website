# TPI-STUDIOFLOW-133 — Floating Studio Actions Menu Positioning

Date: 2026-11-01
Priority: Medium
Classification: UI correction
Status: **DEPLOYED AND VERIFIED — owner acceptance pending**

## 1. Reported behavior

TPI-STUDIOFLOW-132R resolved permanent Studio deletion; the owner confirmed the
`Delete Studio Permanently` button now activates and has deleted the unwanted
Studios. The remaining Studio, **Crossroads of the Unknown**, must be preserved.

A separate defect remained on the StudioFlow Home page: clicking **More Actions**
on a Studio card displayed the floating menu near the top-right corner of the
browser viewport instead of beside the Studio card that opened it.

## 2. Root cause

The menu was rendered as a native `<details>`/`<summary>` disclosure whose menu
panel used fixed page offsets:

```css
.context-menu { position: absolute; right: -74px; top: 44px; z-index: 3; }
```

An absolutely positioned element resolves against its nearest **positioned**
ancestor. Every ancestor between the menu and the document — `.studio-card-more`
(the `<details>`), `.studio-card-actions`, `.studio-card`, `.studio-card-grid`,
and `.home-page` — was `position: static`. The menu therefore resolved against
the initial containing block, i.e. the page/viewport itself, and its
`right: -74px; top: 44px` offsets placed it past the right edge of the document
at the top of the page: the reported top-right-corner menu.

Nothing in the maintained TPI bridge layer positioned or moved the menu; the
defect was entirely in the generated application's own markup and CSS. It was
resolution-independent, which is why it appeared at every window size.

## 3. Correction

The menu now anchors to the button that opened it, using the live geometry of
that button rather than document coordinates.

- `src/App.tsx` introduces `StudioMoreActions`, the card's actions menu. It
  keeps the existing `<details class="studio-card-more">` / `<summary>More
  Actions</summary>` / `.context-menu` structure and the three unchanged
  actions, so nothing else that interacts with the menu had to change.
- On open (and on every resize and scroll while open) it measures the summary's
  viewport rect and its own box, then converts them into the button's offset
  parent. No fixed pixel coordinates and no cached page positions are used, so
  the menu follows its own card instead of the page.
- Preferred placement is directly beneath the button with the right edges
  aligned. If the menu does not fit below the button, it flips above it. The
  result is clamped into the visible viewport with a 12 px margin, and its
  `max-width` is capped at the viewport width so it can never extend past either
  edge.
- `src/styles.css` gives `.studio-card-more` `position: relative` (the anchor and
  its stacking context), replaces the fixed `right: -74px; top: 44px` offsets
  with pre-measurement defaults (`top: calc(100% + 6px); right: 0`), adds a
  viewport-relative `max-width`, a menu shadow, and a `:focus-visible` indicator
  for the actions. The Studio card is never moved or resized.
- Closing behaviors: the button toggles the menu, a click outside closes it,
  Escape closes it and returns focus to the button, selecting an action closes
  it, and opening one card's menu closes any other open menu (announced through
  a `tpi:studio-menu-open` window event, so it holds even when the second menu is
  opened without a pointer event).
- Keyboard access: `aria-haspopup`/`aria-expanded` on the button,
  `role="menu"`/`role="menuitem"` on the panel, ArrowDown/ArrowUp on the button
  opens the menu and moves focus into it, Arrow/Home/End move between actions,
  and Tab closes it without trapping focus.

## 4. What did not change

Studio creation, switching, persistence, renaming, archiving, permanent deletion
(including both deletion modes, the typed-name confirmation, the pre-deletion
inventory, shared-media retention and every server authorization and safety
guard from TPI-STUDIOFLOW-088/089/132R), recovery snapshots, recording and
livestream safeguards, Studio permissions and ownership, and all Studio data.
No route, storage key, API or bridge contract was touched, and the StudioFlow
generated bundle remains the only application artifact that changed.

## 5. Verification

New suite `scripts/verify/tpi-studioflow-133-floating-studio-menu.mjs`, wired
into `release:preflight` as "Floating Studio actions menu positioning
regression". It runs in an isolated disposable Firefox Developer Edition profile
against the authoritative local Worker (`http://127.0.0.1:8787/studio/`), creates
only synthetic `TPI-133 ` fixtures, purges any server fixture it creates, and
performs no permanent deletion. 39 checks:

| Area | Checks |
| --- | --- |
| Anchored to the correct card (below, right-aligned, inside the card column, above surrounding content, card unmoved, three actions intact) | S1a–S1e |
| No longer at the viewport's top-right corner; not page-positioned | S2, S2b |
| Flips above the button when the viewport bottom is reached | S3 |
| Fits a real 390 px phone viewport, stays anchored, keeps all three actions, paints above the card, adds no horizontal overflow, never past the right edge, one menu only | S4a–S4h |
| Follows the button after scrolling and after resizing | S5, S5b, S6 |
| Multiple cards: one menu, bound to the clicked card | S7a, S7b |
| Outside click, Escape, and repeat click close the menu | S8, S9, S10 |
| Keyboard open, arrow navigation, visible focus, Escape restores focus | S11a–S11e |
| Rename Studio still works (opens the Studio's settings, renames the card) | S12a, S12b |
| Delete Studio still opens the guarded confirmation for that Studio, still requires the exact name, cancel deletes nothing | S13a–S13c |
| Archive Studio still moves the card to Archived Studios | S14a, S14b |
| Tablet (820×1180) and phone (390×780) placement, touch-sized controls | S15 (4 checks) |
| Positioning interactions never write Studio records or change server identity/storage classification; fixtures and the owner's Studio untouched | S16a, S16a2, S16b, S16c |

Result: **44/44 PASS** against the authoritative local Worker.

The phone-width checks in S4 run the real bundle in a same-origin 390 px
iframe, because Firefox clamps a driven window to roughly 500 CSS pixels on
macOS and no narrower window viewport can be produced (a
`layout.css.devPixelsPerPx` override does not change `window.innerWidth`).
Inside the iframe `window.innerWidth` is genuinely 390, which is exactly what
the placement code reads, so the clamp and edge behavior are exercised at phone
width rather than at a 500 px desktop minimum.

## 6. Release

The corrected StudioFlow source is committed at
`e608ca9414d27f96058503c53865a8b03993ab7a` on the StudioFlow `codex/tpi-133`
branch, which descends from the previously approved release baseline
`fb95c43ce79dd0dfcf3f880eb34555d746c5c8ce`. The website release baseline
(`scripts/studioflow-release-baseline.json`) now records that commit and its
rebuilt assets:

- JavaScript `index-mYnRoDcA.js` —
  `03802154c34011f58bd5313af24d6bcebda1cf0c413f7c91ff699ad36fe2522f`
- CSS `index-B-jk8V4i.css` —
  `c64c8f9d996c6632af4e067b088abe3d9db6ba9f4d31128165f1a24139a17d65`

The authoritative staging workflow rebuilt the approved commit twice in clean
conditions, produced identical artifacts, matched the recorded baseline, and
staged them into `studio/` while preserving every maintained bridge file.

### Release result

- Implementation commit: `f182bc5` (website repository, `codex/tpi-development`)
- Documentation commit: `b2868f6` (directive record, status and source-to-live
  baseline; implemented and documented together, pushed, then deployed)
- Release-record commit: the follow-up `docs(studioflow): record TPI-133
  production release`, which only adds these verified production results and
  changes no deployed file
- Previous production Worker: `cd37afb8-cc82-406a-9e15-e84b3dffa234` (rollback)
- Active production Worker: `71a5293d-fef4-4643-bf50-e9dfc7327eb5` at 100% traffic
- Live JavaScript `/studio/assets/index-mYnRoDcA.js` —
  `03802154c34011f58bd5313af24d6bcebda1cf0c413f7c91ff699ad36fe2522f`
- Live CSS `/studio/assets/index-B-jk8V4i.css` —
  `c64c8f9d996c6632af4e067b088abe3d9db6ba9f4d31128165f1a24139a17d65`
- Live `studio/workspace-bridge.js` unchanged —
  `9e69ee7064a9314be1026646f3d6d34ff1e123695ff996e3edd208d2911ac573`
- No stale bundle reference remains in the served document; no migration, SQL,
  bridge or server-code file changed, and no owner Studio was touched.

Production gates: local authentication lifecycle PASS (64 checks), preflight
READY (release safety, staging baseline match, reproducible builds,
deletion/archive 32/32, deletion safety 26/26, Studio lifecycle 29/29, ownership
40/40, release acceptance 64/64, the new floating menu regression, staging
verification and guarded Wrangler dry-run), live anonymous smoke 10/10, and live
isolated Firefox acceptance 64/64. A focused non-destructive production
acceptance then passed 16/16 in Firefox Developer Edition against
`https://paranormalinitiative.com`: the menu opens beneath and right-aligned to
its own More Actions button, is not at the viewport corner, stays inside the
viewport, only one card menu is open at a time, Escape and outside click close
it, it flips above near the bottom edge, and it adds no horizontal overflow.
The regression was then strengthened to 44/44 with the genuine 390 px phone
viewport coverage described above; that change touches only the test suite and
documentation, leaving the deployed bundle byte-identical.

Post-release strengthening commit: `9d0d827` (test + documentation).
`release:preflight` was re-run against it and reported **READY** with the 133
regression at **44/44**, `rollbackVersion` `71a5293d-fef4-4643-bf50-e9dfc7327eb5`
(the live Worker). Because `studio/assets/index-mYnRoDcA.js`
(`03802154…`) and `studio/assets/index-B-jk8V4i.css` (`c64c8f9d…`) are
unchanged, no further deployment was made and the live site still serves the
`b2868f6` release; a no-op Worker release is not part of the maintained path.

## 7. Remaining limitations

- The menu is anchored with JavaScript geometry rather than CSS anchor
  positioning, because CSS anchor positioning is not dependable in the
  Firefox Developer Edition build used for acceptance. Placement is recalculated
  on open, scroll and resize; if an ancestor ever became a scroll container that
  does not fire window scroll events, the menu would keep its last placement
  until the next resize.
- The Home page itself can scroll horizontally at phone widths because of
  existing content unrelated to this menu (measured before the menu opens); the
  menu adds no overflow of its own and never leaves the viewport. That
  pre-existing page overflow is out of scope for this directive.
- Owner acceptance of the production placement is still required.

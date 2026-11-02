# TPI-STUDIOFLOW-137A — Complete Notes Workspace Visual Restoration

Status: **VISUAL RESTORATION AND LOCAL ACCEPTANCE COMPLETE — PRODUCTION
DEPLOYMENT NOT AUTHORIZED.**

Date: 2026-11-02
Classification: Visual regression correction / original design recovery
Environment: isolated local development, authoritative Worker at
`http://127.0.0.1:8787`
Browser: Firefox Developer Edition, disposable profiles

## 1. Objective and scope

TPI-STUDIOFLOW-137 restored the complete Notes workspace from the approved
TPI-STUDIOFLOW-122 implementation. Owner inspection of the running workspace
showed the interface functioning but presented inconsistently with StudioFlow.
This directive corrects the presentation without redesigning the workspace,
changing its behaviour, or touching Notes data.

Nothing was deployed. No production database operation was performed. Migrations
`0055`–`0057` remain unauthorized and unapplied.

## 2. What was actually wrong

The defect was not a design difference. It was **CSS that never reached the
browser**, in three distinct ways.

### 2.1 Rules lost to the line-based extraction

The TPI-137 port selected rules by class name, line by line, and then rewrote
each surviving block. The approved TPI-122 stylesheet is minified in places, so a
single line can hold several unrelated rule blocks. Every block that shared a
line with another matching block was silently dropped.

The evidence is the disappearance of four rules that belong to one minified line
in the source while six of that line's neighbours survived:

```
.notes-nav-item { display:flex; ... border:1px solid transparent; background:transparent }
.notes-nav-item:hover            { background:var(--button); color:var(--text) }
.notes-nav-item.selected         { border-color:#3f6298; background:#172a48 }
.notes-nav-item span:last-child  { margin-left:auto; font-size:11px }
```

With `.notes-nav-item` unstyled, every organization control rendered as an
unstyled `<button>`: 2px grey `rgb(148,146,151)` border, `rgb(43,42,51)`
background, 26px tall. That is exactly the "prominent gray rectangular outlines"
the owner reported.

### 2.2 Two orphaned comment terminators

The extraction also lost the opening `/*` of two comments while keeping their
trailing text. Each left a fragment such as:

```
resizable panels and icon toolbar. */
.notes-workspace-page { max-width:1800px }
```

A stylesheet parser treats that prelude as an invalid selector and discards the
**entire following rule**. The two discarded rules were:

| Lost rule | Consequence |
| --- | --- |
| `.notes-workspace-page { max-width:1800px }` | the approved page width |
| `.notes-workspace-page { container: notes-workspace / inline-size }` | every `@container notes-workspace` rule was dead |

The second is the most damaging. The approved implementation switches the three
panel workspace to a single column and collapses the library at 960px **of
workspace width**, and it cannot do that without a container. Without it the wide
three-column grid applied at every size, which is why the workspace overflowed
narrow viewports while the `@media (max-width:850px)` fallback could not help.

### 2.3 Two layout rules that never held

These behave identically in the approved source, so they are compatibility
adaptations rather than lost rules, but they break the layout as soon as a note
title is long:

1. `.notes-library-list` is `display:grid` with an implicit `auto` column, which
   sizes to **max-content**. One long title stretched every card to 617px inside
   a 291px panel and made the library scroll sideways.
2. `.notes-library-card-title` is a grid item, so it could not shrink below its
   content. Titles overran the card by 24px and were clipped by the panel edge
   instead of using the ellipsis the approved rule already declares.

## 3. Original-design evidence

The approved design was established from the source of record rather than from
impression:

- Historical source: `/Users/toddknipple/Documents/StudioFlow/web-122`, branch
  `codex/studioflow-122-notes`, commit `a6784cf` (verified present).
- Reference file: `a6784cf:src/styles.css`, exported read-only for comparison.
- A rule-level parity audit parsed both stylesheets into
  `(media/container context, selector, declarations)` triples and compared them
  selector by selector. That is stronger than screenshot comparison: it accounts
  for every approved Notes rule, including rules that a given viewport never
  exercises.

**The historical application was not launched.** Serving it would have required
pointing the TPI-122 build at an API, which means connecting it to the current
Notes database — prohibited by §13. The stylesheet comparison and the historical
commit's own markup were used instead, so parity here is verified from source,
not inferred from a screenshot.

### Parity result

| Measure | Before 137A | After 137A |
| --- | --- | --- |
| Approved Notes selectors in source | 284 | 284 |
| Selectors present and identical | 276 | 280 |
| Selectors with different declarations | 1 | 0 |
| Selectors present only in the port | 2 | 0 |

Four approved selectors remain unported by design:
`.notes-global-folder-action`, its `.notes-header-icon` child, and its `:hover`
and `:focus-visible` variants. `git grep` at `a6784cf` shows these selectors
appear **only in `src/styles.css`** — no component in the approved commit
referenced them, and no component references them now. They are dead rules for a
header variant that never shipped, and porting them would add unreferenced CSS.

## 4. Corrections applied

All corrections are inside the TPI-137 Notes section of `src/styles.css`.

| # | Change | Justification |
| --- | --- | --- |
| 1 | Restored `.notes-nav-item` base, `:hover`, `.selected` and `span:last-child` verbatim from `a6784cf` | lost to line-based extraction; cause of the grey control outlines |
| 2 | Restored `.notes-nav-item` in the `@media (max-width:850px)` and `@container notes-workspace` `min-width:0` groups | lost group members |
| 3 | Restored the `/* TPI-STUDIOFLOW-122A: connected Notes workspace, resizable panels and icon toolbar. */` comment opener | recovered `max-width:1800px` |
| 4 | Restored the `/* Use the available Notes workspace width, not only the browser viewport. */` comment opener | recovered `container: notes-workspace / inline-size` |
| 5 | `.notes-library-list { grid-template-columns: minmax(0,1fr) }` | adaptation (§7): bounds the max-content column so cards fit the panel |
| 6 | `.notes-library-card-title { min-width:0 }` | adaptation (§7): lets the approved title ellipsis apply inside the card |

Rules intentionally left unchanged: the toolbar wrapping (`flex-wrap: wrap` is
the approved declaration), the non-sticky editor footer, the selected-card border
weight, and the panel widths.

## 5. Measured before and after

Firefox Developer Edition, synthetic account, real Worker, same conditions.

| Property | Before | After |
| --- | --- | --- |
| `.notes-nav-item` border | `2px rgb(148,146,151)` | `1px transparent` (`#3f6298` when selected) |
| `.notes-nav-item` background | `rgb(43,42,51)` | `transparent` (`#172a48` when selected) |
| `.notes-nav-item` height / radius | `26px`, UA default | `34px`, `6px` — the approved values |
| Workspace container | `container-type: normal` | `notes-workspace / inline-size` |
| 1280 viewport scroll width | `1360` vs `1280` | `1265` vs `1280` |
| 1024 viewport scroll width | `1076` vs `1024` | `1009` vs `1024` |
| 834 viewport scroll width | `1076` vs `834` | `819` vs `834` |
| Library card width | `617px` in a `291px` list | fills the panel |
| Long title overrun | `+24px` past the card | `0`, ellipsized |

## 6. Responsive verification

Firefox Developer Edition, measured and photographed at each size.

| Viewport | Overflow | Clipping | Notes navigation | Save reachable | Toolbar |
| --- | --- | --- | --- | --- | --- |
| 1920 × 1080 | none | none | present | yes | usable |
| 1440 × 900 | none | none | present | yes | usable |
| 1280 × 800 | none | none | present | yes | usable |
| 1024 × 768 | none | none | present | yes | usable |
| 834 × 1194 | none | none | present | yes | usable |
| 390 × 844 | none | none | present | yes | usable |
| 375 × 812 | none | none | present | yes | usable |

At 1024 and below the workspace collapses to the approved single column with the
organization panel in two columns, the library resizer hidden and the library
capped at 260px, driven by the restored `@container` rule rather than a viewport
media query. The 390/375 entries were measured at Firefox's minimum headless
window width of 500 CSS pixels; horizontal overflow was absent there too.

## 7. Save controls

The approved `.notes-editor-footer` is a plain flex row with `margin-top` and a
top border — it is **not** sticky, and the approved `NotesView` renders it after
the editor body. The save control therefore sits at the end of the note, which
for a long note is below the fold. That is the original arrangement, so it was
preserved rather than redesigned (§9).

The workspace is not dependent on reaching it: autosave runs continuously and the
header exposes the saved state ("All changes saved"), plus the editor's own save
indicator. The suite verifies at every viewport that the footer's Save control
becomes visible once scrolled into view, and that it is never clipped
horizontally.

## 8. Toolbar

The approved declaration is `display:flex; flex-wrap:wrap`. Wrapping is therefore
the intended behaviour, not a defect, and no control was removed to make it fit.
The suite instead verifies what matters: every control is labelled for assistive
technology, keeps a hit area of at least 26px, stays inside the editor panel at
every viewport, and the toolbar keeps a usable height.

## 9. Theme

No theme change was made and none was needed. The workspace inherits the
StudioFlow token set; the suite asserts the dark surface, the primary text
contrast (≥ 4.5:1) and secondary copy contrast at runtime. The green cast in the
captured screenshots is the synthetic QA account's Studio brand accent; the
owner's own profile renders its own accent. Confirmed by capturing the same
account before and after the CSS fix — identical palette, so the fix did not
alter theming.

## 10. Functional safety

No behavioural code changed. This directive touches `src/styles.css` only.

Preserved and re-verified: note creation and editing, rich-text formatting,
autosave and explicit save, search, sorting, favorites, collections, folders,
podcast projects and episodes, archive, trash, restore, revisions, export, local
folder sync behaviour and account-backed persistence.

The legacy right-side Studio Notes scratchpad remains a separate, independent
utility and was not touched.

## 11. Data safety

- Owner note `Crosroads of the Unknown` (`1dc30880-0918-467f-a926-2e7b935b9a49`,
  owner `local_admin`) still exists, is `active`, and is at revision 30. Its text
  is the owner's own sentence ending "…Right in Studio Flow. we". Revision 29,
  which ends "…Right in Studio Flow.", is retained and restorable from Version
  history. Revision 30 is dated `2026-11-02T02:42:41Z` and contains the same
  " we" ending visible in the owner's own screenshot, so it reflects the owner's
  edit rather than any agent action.
- No agent run in this directive authenticated as `local_admin`, the owner of
  that note. Every TPI-137A suite uses the synthetic `test_admin` account, whose
  library does not contain the owner note (confirmed in the captured evidence),
  and the maintained `local_admin` acceptance suite does not reference Notes at
  all (`grep -c notes` → 0).
- No note, collection, revision or attachment was created, renamed or deleted by
  this directive.
- Local database read-only counts at completion: 228 notes, 20 collections, 510
  revisions, 0 attachments. The increase over the TPI-137 counts is the test
  records the synthetic QA suites own.
- Local state directory `.local-dev/state/v3` was not reset or recreated. The
  audit used a copied snapshot, not the live files.

## 12. Acceptance results

| Suite | Result |
| --- | --- |
| TPI-STUDIOFLOW-137A Notes visual acceptance (Firefox Developer Edition) | **67/67 PASS** |
| TPI-STUDIOFLOW-137 Notes restoration and persistence | 36/36 PASS |
| Maintained Firefox release acceptance | PASS (in preflight) |
| TPI-STUDIOFLOW-133 floating Studio actions menu | 44/44 PASS |
| TPI-STUDIOFLOW-134 colours, Scene drag, Teleprompter | 43/43 PASS |
| TPI-STUDIOFLOW-135 Scene persistence | 30/30 PASS |
| TPI-STUDIOFLOW-087 Studio ownership | 40 PASS |
| TPI-STUDIOFLOW-088 Studio deletion | 32 PASS |
| TPI-STUDIOFLOW-089 deletion safety | 26 PASS, 0 failed |
| TPI-STUDIOFLOW-137 continuity and lineage guard | PASS |
| Guarded release preflight | see §14 |

The visual suite is now a release gate
(`scripts/verify/tpi-studioflow-137a-notes-visual.mjs`, run by
`release:preflight` after the TPI-137 acceptance). It fails if a future build
stops shipping the approved nav rules, the container declaration, the page
width, the card bounds or the title ellipsis, and it compares the parsed
stylesheet rather than the source text — so a reintroduced comment/selector
fault is caught even though the file still "contains" the rule.

## 13. Source control

StudioFlow source worktree `/Users/toddknipple/Documents/StudioFlow/web-137`,
branch `codex/tpi-137-notes-restoration`:

| Commit | Change |
| --- | --- |
| `5d557d2` | restore the lost Notes CSS blocks and the workspace container |
| `57effec` | bound the library column so cards fit the panel |
| `9113baf` | let the card title row shrink so titles ellipsize |

Staged through the authoritative provenance workflow: both builds of the
approved commit were byte-identical, the generated assets matched the integrated
candidate, no obsolete bundle references remained and all eleven maintained
bridge files were preserved.

| Asset | SHA-256 |
| --- | --- |
| `studio/assets/index-PJlxxK5f.js` | `7e7406463a7ba7ff52966e3aa0a001e0990f63d69d3febdbfe3fdedfe67a3e82` |
| `studio/assets/index-7UmKFnSB.css` | `9a815d2b7cc8c63894a21c5b6e436cb4e3b11c3cdb3293874de1752b4563698e` |

The JavaScript bytes are identical to the TPI-137 build — the delivered
JavaScript did not change, only the stylesheet. The entry file name changed
because Vite derives it from the module graph, which includes the stylesheet.

Protected owner work in `/Users/toddknipple/Documents/StudioFlow/web` is
byte-identical to its pre-directive state: `src/App.tsx`
`543f467145b8fc…`, `src/styles.css` `190be155e1aa30…`, `main` still at
`9f85f9d`.

## 14. Release readiness

`npm run release:preflight` completed every gate and reported **`status: READY`
with exit 0** at website commit `05a8382`, with
`rollbackVersion` `3082475b-80ad-4557-82d6-32618e3f7079` — the Worker still
serving production. The run included the new visual gate (**67/67 PASS**), the
TPI-137 acceptance gate (36/36 PASS), the authoritative staging verification and
the continuity/lineage guard, and finished with the guarded Wrangler dry-run.
Nothing was deployed.

The production Notes schema blocker from TPI-137 is unchanged and still enforced
by `scripts/verify/tpi-studioflow-137-production-schema.mjs`. A successful
preflight does not authorize deployment, and the production schema gate was not
weakened.

## 15. Remaining limitations

- The historical TPI-122 application was not launched (see §3), so the reference
  is a rule-level stylesheet comparison plus the historical commit, not a live
  side-by-side screenshot of the old build.
- Mobile verification is bounded by Firefox's minimum headless window width of
  500 CSS pixels; 390 and 375 were approximated at that floor.
- Local folder synchronization is Chromium-only by design and was not exercised
  in Firefox.
- The editor footer is deliberately not sticky, per the approved design (§7).
- Production remains blocked on unauthorized migrations `0055`–`0057`.

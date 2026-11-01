# TPI-STUDIOFLOW-134 Addendum — Scene Teleprompter Live Playback

Date: 2026-11-01
Parent directive: [TPI-STUDIOFLOW-134](TPI-STUDIOFLOW-134-SCENE-DRAG-AND-PRODUCTION-COLORS.md)
Environment: local Cloudflare Worker, `http://127.0.0.1:8787/studio/`
Production deployment: **NOT AUTHORIZED — production is unchanged.**

## 1. Result

The Scene-to-live-Teleprompter workflow is complete and verified in Firefox
Developer Edition. A Teleprompter script placed in My Scenes is now an
actionable production item: selecting it resolves its script by the persisted
identifier, loads it into the **existing live presenter teleprompter** on the
stage, rewinds it to the beginning of the script, and leaves it paused. Play,
Pause, Reset, speed and text-size controls are the released controls, unchanged.

The parent directive previously reported the drag and the purple production item
as restored and verified. This addendum covers the missing second half — what
happens when the item is selected.

## 2. Root cause of the missing click-to-load behavior

**Implemented, but wired to the wrong surface — not missing, not overwritten.**

The TPI-125 port on the released lineage ended in:

```ts
setPrompterScriptId(item.teleprompterScriptId);
setTeleprompterOpen(true);
```

`setTeleprompterOpen` opens `StudioTeleprompterModal`, the Studio's reader
**dialog**. That dialog is a backdrop that covers the Studio and requires a
separate "Show on stage" action before anything is live. The released lineage's
live surface is the presenter teleprompter portalled onto the stage and gated by
`prompterOverlayOpen`, which this handler never touched. So a Scene script could
be read in a blocking dialog but never reached the live teleprompter the creator
is actually reading during a broadcast.

Evidence from the recorded pre-change probe (disposable Studio, script dropped
into My Scenes, card clicked): `dialogOpen: true`, `overlayOpen: false`,
`selectValue: <script id>`, reader at the top, paused. The script resolved
correctly and the reader dialog contained it; the live presenter teleprompter
was never prepared.

The approved TPI-125 behavior on the divergent `codex/studioflow-122-notes`
lineage (`a6784cf`, `openTeleprompterReader`) also opened a *reader* surface
rather than a management dialog, with the same semantics this addendum
implements: selected script by id, `scrollTop: 0`, playback state `ready`
(paused), reader opened. Its reader component is the unreleased private one that
must not be imported, so the released lineage's own live presenter teleprompter
is used instead, as the addendum requires.

## 3. Playback integration implemented

One behavioral change, in the released lineage's own teleprompter:

- `previewScenePanelItem` for `teleprompter-script` items now sets the script,
  bumps a cue token, and opens the existing live presenter teleprompter
  (`setPrompterOverlayOpen(true)`) instead of the blocking reader dialog.
- A `prompterCueToken` counter is passed to `StudioTeleprompterModal`. A new
  effect on that token stops playback, clears any countdown, resets the stored
  scroll position, and scrolls both reader surfaces to the top. This makes the
  behavior deterministic even when the same script is cued again while it is
  already selected, which a selection-change effect alone cannot do.
- No second playback engine, no new component, and no change to the live
  teleprompter's layout, controls, styles, keyboard behavior or persistence.
- Missing or deleted scripts keep the existing guard: the card renders
  `Script unavailable`, is disabled, and the handler reports it instead of
  failing silently.

## 4. Files modified

- StudioFlow `src/App.tsx` — `previewScenePanelItem`,
  `prompterCueToken`/`setPrompterCueToken`, the `cueToken` prop, and the cue
  effect inside `StudioTeleprompterModal`. Nothing else in the Studio was
  touched; `src/styles.css` is unchanged, which is why the CSS bundle hash did
  not move.
- Website `scripts/studioflow-release-baseline.json` — approved commit
  `f44f3a0…`, JavaScript `index-D9yljEwa.js`.
- Website `studio/index.html`, `studio/assets/index-D9yljEwa.js` — staged
  through the provenance workflow.
- Website `scripts/verify/tpi-studioflow-134-firefox.mjs` — new sections 12–16
  covering the workflow, plus two durability fixes described below.
- Website `scripts/verify/tpi-studioflow-107-source-provenance.mjs` — read the
  approved commit and known-good hashes from the baseline instead of stale
  hardcoded copies.
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/evidence/TPI-STUDIOFLOW-134/` — five
  screenshots, including `scene-script-cued-in-live-teleprompter.png`.

## 5. Verification environment and method

Firefox Developer Edition, launched by `geckodriver` against a brand-new
disposable profile (`mkdtempSync`) and a disposable Studio in local storage. The
owner's profile and Crossroads of the Unknown were never opened. The run proves
a real document reload before asserting persistence, because
`navigate().refresh()` can otherwise resolve against the pre-reload DOM and make
a persistence check pass without testing anything.

## 6. Firefox acceptance results — 43/43 PASS

The maintained gate `npm run verify:studioflow-134-firefox` now covers the whole
workflow. New checks, all passing in a real Firefox session:

| Check | Result |
| --- | --- |
| Clicking a Scene script opens the live presenter teleprompter | PASS |
| The live teleprompter displays the complete cued script | PASS |
| The script is cued at the beginning of the script | PASS |
| Playing has not started automatically | PASS |
| The Scene script no longer opens the blocking reader dialog | PASS |
| The existing playback controls scroll the cued script | PASS |
| The Play control becomes Pause while the script runs | PASS |
| Pause halts scrolling and keeps the position | PASS |
| Reset stops the script and returns it to the beginning | PASS |
| The second Scene script drag publishes its own script payload | PASS |
| Selecting another Scene script loads that script | PASS |
| The switched script is cued at the beginning and paused | PASS |
| Cueing creates no duplicate scripts and leaves the originals unchanged | PASS |
| A Scene script reference survives refresh and still cues the live teleprompter | PASS |
| A deleted script is reported as unavailable and never cues the teleprompter | PASS |

The 28 pre-existing color and drag checks still pass, for 43/43 total.

Acceptance test mapping (owner's numbered list): 1–4 exercised by sections 2 and
12, 5–6 by section 12, 7–8 by section 13, 9 by section 13, 10 by section 13, 11
by section 14, 12 by section 16, plus duplicate/immutability and graceful
missing-script coverage in sections 15–16.

## 7. Regression results

| Suite | Result |
| --- | --- |
| `verify:studioflow-134-firefox` | **PASS — 43/43** |
| Firefox Developer Edition release acceptance | **PASS — 64/64** |
| `verify:studioflow-037-scenes-panel` | **PASS** |
| `verify:studioflow-107-provenance` | **PASS — 20/20** |
| `verify:release-safety` | **PASS** |
| Authoritative StudioFlow staging verification | **PASSED** — reproducible builds, 29/29 files, baseline hashes match |
| `verify:studioflow-035-recording-storage` | **PRE-EXISTING FAIL** — asserts the unreleased private teleprompter reader; not caused by and not fixable within this directive |

Two test defects found and corrected during this work, both of which would have
produced false confidence:

1. The gate hardcoded the previous bundle name, so a new approved build failed a
   correct release. It now reads the expected assets from the release baseline.
2. `tpi-studioflow-107` hardcoded an obsolete approved commit
   (`6b9c3c4…`) and two obsolete asset hashes, so it failed for any current
   baseline. It now reads all three from the baseline. This was a pre-existing
   failure, not a regression introduced here.

Three harness defects were also found and fixed while building the new coverage:
selector text captured from a shadowed `arguments` object (silently clicking
nothing), DOM-index card identification (a dropped script inserts above the
existing row), and a refresh that could resolve before the new document loaded.

## 8. Commits and synchronization

- StudioFlow source: `f44f3a08cfc0efa271385125c6780557aaa85fb9` on `codex/tpi-134`
  (built from the released lineage `e608ca9`; that repository has no configured
  remote)
- Website: committed on `codex/tpi-development` and pushed to
  `origin/codex/tpi-development` with verified parity before every preflight run
- Baseline JavaScript: `index-D9yljEwa.js` —
  `e317fc071f4968e375f8b11970d862692a3fe28fa1cc55140d3471d884f55246`
- Baseline CSS: `index-D6ZhUVW1.css` (unchanged) —
  `1baa338c09f29395f292cf1fed415baa700c1544e79b0d723c4c60988e6b3cb6`

## 9. Production deployment status

**NOT DEPLOYED.** Production remains Worker
`71a5293d-fef4-4643-bf50-e9dfc7327eb5` on the TPI-133 bundle. Deploying
requires separate authorization and the maintained sequence:

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

## 10. Safety statement

Studio deletion, archive and typed-name safeguards are untouched. The floating
Studio actions menu is untouched. Recording, storage and backup paths are
untouched. All eleven maintained bridge files are preserved and verified by the
staging workflow. No Studio data, script, recording or owner Studio was created,
modified or deleted outside the disposable acceptance Studio. No production
deployment was performed.

## 11. Remaining limitations

1. **Owner acceptance in Firefox Developer Edition is still pending** on
   `http://127.0.0.1:8787/studio/`.
2. **Production is unchanged**, so the reported symptoms persist on the live
   site until an authorized release is run.
3. **Cueing is idempotent and rewinds.** Selecting the same Scene script again
   while it is playing restarts it from the beginning, paused, rather than
   resuming. That is the addendum's "prepare at the beginning, paused" rule
   applied consistently; it is an intentional behavior change from plain
   selection-change semantics and is recorded here.
4. **`verify:studioflow-035` cannot pass** on the released lineage until the
   private Teleprompter reader is restored or that suite is reconciled.
5. **Production asset hashes remain unverifiable anonymously** — live StudioFlow
   assets are session-gated and return `403`.
6. **Native pointer drag initiation is not automated**; drag payload and handlers
   are asserted with real `DragEvent`/`DataTransfer` objects, and the playback
   controls are exercised through their real click handlers.
7. **The larger lineage loss still needs an owner decision** — Notes, podcast
   project export, folder sync, recording-audio work and the private stage
   Teleprompter reader remain absent from the released lineage.

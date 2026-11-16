# Community Feed Composer Shape Repair

## Outcome

The shared Community Feed composer no longer presents the member's message
box as a pill or the attachment controls as circular chips. The same source
rules now apply at desktop and narrow mobile widths in every browser that
loads the shared Member Home surface.

## What happened

On a narrow viewport, the composer textarea had a `999px` border radius. The
Photo, Video, File, Link, and Emoji controls used the same pill treatment, and
pending attachments—including the visible LINK preview—were rendered as
circular 80px tiles. The rounded geometry made the message area look like a
single-line control, clipped the user's reading area, and made the attachment
types harder to distinguish.

## Root cause

These were shared `member-home.html` rules, not a Firefox-only or mobile-only
browser defect. The fixed pill/circle radii were applied before the responsive
layout wrapped the controls, so the same visual problem could appear anywhere
the Community Feed composer was used.

## Fix

- Changed the composer textarea to a normal 12px-corner box with explicit
  `box-sizing`, readable line height, and scrollable overflow.
- Changed Photo, Video, File, Link, and Emoji controls to compact rectangular
  controls with 8px corners.
- Changed the link-entry field and Add/Cancel controls to the same rectangular
  language.
- Changed pending photo/video/file/link previews to 148×88px rectangular cards
  with 12px corners so a LINK attachment is readable instead of circular.
- Changed saved feed link chips to the same 10px-corner rectangular treatment.
- Left avatars and the small attachment-remove badge circular because those
  shapes communicate identity and dismissal rather than input type.

## Protection

1. The shared source contract checks the intended radii and preview dimensions.
2. Firefox acceptance measures the computed desktop styles directly.
3. The same acceptance suite sets a 390px viewport and verifies the composer
   has no horizontal overflow while retaining the same rectangular styles.
4. The fix is limited to shared Community Feed composer/link presentation;
   StudioFlow, Creator Studio, Nova Workspace, private media, and owner data
   are outside the change.
5. The maintained local asset refresh is used before acceptance so the browser
   cannot validate stale staged markup.

## Verification

| Check | Result |
| --- | ---: |
| Member interaction source contracts | **34/34** |
| Local Firefox profile/feed acceptance | **57/57** |
| Desktop computed composer geometry | **PASS** — textarea 12px, controls 8px, previews 12px / 148×88px |
| Mobile computed composer geometry | **PASS** — 390px viewport, no horizontal overflow |
| Local staged asset refresh | **PASS** |
| Guarded production preflight | **PASS** — certified website candidate; full safety contract, staging, protected-byte, and release gates passed |
| Production smoke | **10/10** |
| Live production Firefox acceptance | **PASS** — authenticated disposable QA member at 390×844; visible composer, 367px textarea, 12px/8px/12px radii, no horizontal overflow |

## Release record

The exact certified candidate was promoted and live acceptance passed. The
source change and its regression protection are included together so future
edits cannot silently remove the responsive shape contract.

- Release: `rel-5cd6b06c78f3-9ee36bce394e`
- Source commit: `5cd6b06c78f37b327cf02939716aa914c38aa849`
- Production Worker version: `c1ff12bd-7830-4a3e-a479-3ee602efff39`
- Rollback version: `617e1f7a-647c-4d45-9b1d-dbf828ed29e5`
- Traffic: **100%** on the new Worker
- Certification manifest digest: `742a6f9d0a7ccdc137cc3a40a605935849bb5202f9e0ee0198c295d0953c58c7`

## Files

- `member-home.html` — shared composer and attachment presentation rules.
- `scripts/verify/tpi-member-interactions.mjs` — source-level shape contract.
- `scripts/verify/tpi-member-profile-feed-firefox.mjs` — desktop/mobile
  computed-style and overflow acceptance.
- `docs/TPI-DEVELOPMENT/TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md` — symptom
  lookup and incident record.

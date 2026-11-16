# Assistant Launcher Order and Nova Artwork

Date/time: **2026-11-16 15:14 EST**
Status: **DEPLOYED AND LIVE VERIFIED**

## Owner request

The owner asked for the assistant controls to be visually ordered with Mystic
on top and Nova on the bottom. The owner supplied the Nova artwork at
`/Users/toddknipple/Desktop/Nova.png` and asked that it become Nova's visible
icon.

## Change

- Mystic now occupies the upper launcher position.
- Nova now occupies the lower launcher position.
- The provided Nova artwork is stored as `assets/nova-help-center.png` and is
  used in Nova's launcher, panel avatar, and Help Center assistant card.
- Nova's CSS and JavaScript cache versions advanced to `v3` so browsers and the
  maintained local Worker receive the new order and icon.
- The public/internal knowledge and authorization boundaries are unchanged.

## Safeguards

- Mystic remains public paranormal research and education only.
- Nova remains public TPI support and protected internal Help Desk support.
- Internal Help Desk data is still never loaded into public pages.
- Stable applications and owner data remain outside this change.
- A source-contract check now asserts Mystic-before-Nova order, Nova artwork,
  and launcher positions.

## Verification plan

- JavaScript syntax checks.
- Help Center separation and internal-boundary checks.
- Full guarded preflight and production smoke.
- Live production Help Center separation probe.

Local and production Help Center separation checks passed **32/32**. The live
production asset probe returned HTTP 200 for the Help Center, Nova artwork,
Nova v3 CSS/JavaScript, and Mystic CSS. Production anonymous smoke passed
**10/10**.

## Release record

- Website commit: `8fc6abb5499670845cf65e1e93480065a8841b55`
- Release ID: `rel-8fc6abb54996-0797f31bc261`
- Worker version: `4a4cd164-fec4-4149-985c-8348b42b012e`
- Rollback reference: `797a0c7f-91bd-4bb1-b195-582750d85b41`
- Certification: Tier 1 website profile; 11 gates passed; manifest digest
  `71b962891d0e8f19776c0ebbe85e1225d3645ef9d60f8c4ec8f5a943121b110b`
- Production smoke: **10/10**
- Production Help Center separation: **32/32**

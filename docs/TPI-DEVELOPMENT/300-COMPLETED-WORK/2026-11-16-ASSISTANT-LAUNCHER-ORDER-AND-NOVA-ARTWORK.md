# Assistant Launcher Order and Nova Artwork

Date/time: **2026-11-16 15:14 EST**
Status: **IMPLEMENTED; guarded release pending**

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

## Release record

To be completed after the exact certified candidate is deployed and live
verification passes.

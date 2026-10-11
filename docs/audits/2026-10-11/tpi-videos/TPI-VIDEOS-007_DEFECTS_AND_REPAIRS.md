# TPI-VIDEOS-007 Defects and Repairs

## Repaired: thumbnail presented as player

Cause: the watch page rendered a static thumbnail whenever no embed URL was
present. This made a non-playable record look playable.

Repair: added `tpi-video-player.js` and changed `tpi-video.html` to render a
native player only for a strict direct-media classification; otherwise it shows
an embed, external fallback, private-local explanation, or unavailable state.

Regression: `scripts/qa/tpi-video-player-regression.mjs` and the actual browser
fixture both pass.

## Repaired: gated external-link exposure

Cause: the old watch-page branch could show `videoUrl` even when `canWatch` was
false.

Repair: external links are now emitted only for an authorized viewer and only
after the approved-provider resolver accepts the source.

## Remaining limitations

No production creator-authored playback source exists to verify the full
Creator Studio publication path. External-provider playback, physical-device
behavior, and long-duration playback remain unverified.

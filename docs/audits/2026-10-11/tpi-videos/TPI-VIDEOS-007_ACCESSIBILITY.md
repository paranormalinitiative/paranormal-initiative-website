# TPI-VIDEOS-007 Accessibility

The native player uses the browser's accessible controls with `controls` and
`playsinline`, carries a descriptive `aria-label`, and reports state through a
`role="status"` live region. Unavailable states use a status role and readable
text rather than a disabled-looking fake player.

The controlled browser fixture exposed a play button, time scrubber, volume and
fullscreen controls, metadata status, and playing status through the browser
accessibility tree.

Full screen-reader and keyboard acceptance remains PARTIAL because Playwright
is not installed in the canonical checkout. Manual keyboard/screen-reader
acceptance remains an owner test.

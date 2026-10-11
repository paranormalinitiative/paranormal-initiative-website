# TPI-MEDIA-001 Video Grid Repair

## Confirmed defect

At a 1440px browser viewport, the shared rule `body.member-mode .video-grid` in `member-shell.css` overrode the TPI Videos page's less-specific four-column rule. The rendered catalog therefore showed three columns.

## Repair

`tpi-videos.html` now applies the existing intended breakpoints with the same member-mode specificity:

- 4 columns at wide desktop.
- 3 columns at 801–1120px.
- 2 columns at 561–800px.
- 1 column at 560px and below.

## Browser evidence

Authenticated isolated local browser with six disposable published fixtures:

- 1440px: 4 cards in the first row; 250.5px equal card columns; no overflow.
- 1024px: 3 cards in the first row; no overflow.
- 800px: 2 cards in the first row; no overflow.
- 390px: 1 card in the first row; no overflow.

# TPI-STUDIOFLOW-019 — Intro and Outro Video Full-Stage Display

## Scope

Correct local StudioFlow rendering for prerecorded intro and outro clips. A
properly formatted 16:9 clip must occupy the complete 16:9 production stage
without cropping, distortion, or implementation-created padding. Non-16:9
clips must remain proportional.

This directive is development-only. It does not authorize deployment, database
changes, media replacement, commits, pushes, recording, or livestreaming.

## Existing rendering path

The compiled StudioFlow application renders the selected intro/outro clip as a
direct child of `.program-stage` with the `stage-video contain` classes. The
base StudioFlow stylesheet positions stage media at all four edges and uses
`object-fit: contain`. The stage itself declares `aspect-ratio: 16 / 9`.

The persisted clip record stores a browser-local `blobKey` and metadata. The
browser recreates a preview object URL from the stored media and the video
element uses its native media dimensions for proportional rendering; uploaded
bytes are not rewritten.

## Correction

`studio/studioflow-012-overrides.css` now adds a direct selector for
`.program-stage > video.stage-video.contain`. It explicitly resets display,
inset, width, height, maximum dimensions, margin, padding, border, object-fit,
and object-position. This protects the intro/outro program frame from generic
replaced-element or future stylesheet rules while preserving `contain` for
4:3 and 9:16 media.

The correction is universal because it targets the shared stage renderer, not a
studio name, workspace ID, or individual media asset.

## Verification boundary

The local browser stage measured 855 × 480.9375 pixels, an exact 16:9 ratio.
The owner’s `/Users/toddknipple/Desktop/COTU INTRO.mp4` was inspected without
alteration: H.264, 1920 × 1080, 30 fps, BT.709, and 90.1 seconds. Sampled
active frames did not show a uniform embedded pillarbox; dark forest regions
are source imagery rather than a StudioFlow-generated border.

A temporary browser-local copy was loaded into synthetic Studio 10 to measure
the real runtime path, then removed after verification. The video reported
1920 × 1080 and rendered at 855 × 480.9375 with `contain`, no margins,
padding, borders, or console errors. The desktop source file and existing
Studio data were not modified. No separate Outro fixture was available, so
actual Outro playback remains pending; the shared Intro/Outro renderer and
full-stage CSS contract are covered by focused static checks. Recording,
livestream, and audio-sync verification remain owner-controlled tests.

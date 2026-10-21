# TPI-STUDIOFLOW-031 — Remove Unwanted Video Overlay Controls

## Scope

Local StudioFlow production-preview video elements only. Crossroads of the
Unknown remains protected; no Studio configuration, media bytes, browser
storage, room server, guest gateway, recording, or livestream was changed.

## Investigation

The compiled StudioFlow render path creates the production background as a
muted, inline, looping `<video class="stage-background-video">` and creates
Intro/Outro and shared-media stage clips as `<video class="stage-video">`.
Those stage elements do not request native HTML video controls, and the
application bundle contains no matching custom pop-out or skip/next overlay
buttons in the production-stage render path. In Opera, the two reported icons
were visible inside the video surface but were not exposed as StudioFlow page
buttons by the available accessibility surface. This identifies them as
browser-native video/Picture-in-Picture media affordances rather than normal
StudioFlow production controls.

The existing `stage-background-video` and `stage-video` rules preserve the
video's playback and looping behavior. No video file or media reference was
modified.

## Correction

`studio/video-playback-reset-bridge.js` now applies a narrow stage-only policy
to every video under `.program-stage`:

- `controls = false`
- `disablePictureInPicture = true`
- `disableRemotePlayback = true`
- `controlsList="nodownload noremoteplayback noplaybackrate"`

The bridge still retains the existing Intro/Outro Play/Stop toggle, fresh-start
reset, natural-completion reset, and scene-switch behavior. The background
video remains `loop`, `muted`, `autoplay`, and `playsInline` in the compiled
render path.

Opera's browser-level overlay is not suppressible by page CSS or the standard
video attributes alone. The bridge therefore creates a canvas surface for only
the production background and direct Intro/Outro stage videos, draws each frame
from the same mounted video element, and hides the browser-visible video
surface. The underlying video remains mounted so audio, looping, playback
events, Intro/Outro completion, recording compositor behavior, and media
references are preserved. Participant and guest video elements are outside this
mirror scope.

The bridge URL is cache-busted in `studio/index.html` with
`tpi031=video-overlay-v1` so the local Worker serves the correction to Opera.

## Verification plan and limitation

The focused source check passes 12/12 and confirms the stage-only policy,
PiP/remote-playback suppression, canvas mirroring, preserved looping, preserved
Intro/Outro rendering, and no media-file replacement. The complete focused
regression set passes 103/103 checks. Opera visual verification remains
blocked: after the authorized Worker restart and tab navigation, the existing
Opera tab remains in a loading state while retaining the pre-change render and
its overlays; the direct cache-busted bridge request returns the site access
gate rather than the bridge. The required initial-playback, three-loop, scene,
Intro, Outro, and return-to-normal-scene checks therefore cannot be credited.
No recording or livestream is required or authorized for this directive.

The available Opera automation surface does not expose browser console or
network inspection. The browser-level origin was independently confirmed from
Opera's documented Video Popout and Video Skip features. The canvas mirror is
the application-scoped workaround; it does not change Opera-wide settings.

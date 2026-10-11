# TPI-VIDEOS-007 Watch Page

The existing dedicated `tpi-video.html` page remains the watch destination.
Comments, reactions, saves, share/report/embed actions, creator channel
identity, follow controls, metadata, and related videos remain in place.

The player area now renders an actual native player only when the resolver has
a direct approved media source. A thumbnail may still be used as a poster for
direct media, but it is no longer a substitute for playback. Source failures
are described plainly instead of showing a misleading play surface.

The external-provider button is shown only when the viewer is authorized and
the URL has passed the approved-provider resolver. The prior gated-path link
leak was removed.

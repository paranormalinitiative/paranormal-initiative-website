# TPI-VIDEOS-006 Playback Reliability

## Verified

- Supported-provider URL validation rejects unsupported hosts and unsafe
  schemes in the local API suite.
- Unverified playback metadata is not exposed as verified public playback.
- An isolated StudioFlow test generated synthetic audio/video, transmitted it
  through a local RTMP receiver, and decoded the capture with FFprobe.
- Captured media: H.264 video, AAC audio, 640×360, 6.037 seconds.

## Not verified

Real YouTube/Rumble/Odysee playback frames, audio decoding in an external
provider player, deleted media behavior, and provider-side watch destinations
were not tested. A responding HTTP page is not counted as media playback.

Current classification: **READY WITH LIMITATIONS** for metadata validation and
local capture; **NOT VERIFIED** for real external-provider playback.

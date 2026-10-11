# TPI-VIDEOS-008 Odysee Policy

Odysee is an intentional external-viewing provider for TPI Videos.

When a valid Odysee source URL is present:

1. The TPI player does not render an iframe or native video element.
2. The watch page says `Watch this video on Odysee`.
3. The action is labelled `WATCH ON ODYSEE`.
4. The action opens the original Odysee URL in a new tab with
   `noopener noreferrer`.
5. The catalog action uses the same provider URL and safe attributes.

This is not an error and must not be presented as `Playback unavailable here`.
The TPI site does not proxy, cache, download, or claim ownership of Odysee
media.

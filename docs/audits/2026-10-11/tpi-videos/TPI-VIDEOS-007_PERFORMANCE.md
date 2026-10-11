# TPI-VIDEOS-007 Performance

The page does not add polling, media transcoding, proxying, or upload work.
Provider iframes remain lazy-loaded. Native direct media uses browser metadata
preload and one event-wiring pass per rendered player. The helper has no
animation loop and no duplicate network fetch.

Local controlled fixture: 4.000 seconds, H.264 video at 320×180/24 fps, AAC
mono audio at 48 kHz, 68,473 bytes. The browser reached `readyState=4` and
advanced to approximately 1.997 seconds while playing. No long-duration or
production bandwidth claim is made.

# StreamYard Functional Comparison

StreamYard is used here as a capability benchmark, not as a visual or branding target. StudioFlow should retain its own TPI identity, information architecture decisions, and product priorities.

## Benchmark capabilities

StreamYard publicly documents browser-based live production and recording, destinations, studio creation, branding, local recordings, guest invitations, audio controls, Go Live, custom RTMP, optional webinars, library/export, scenes, reusable studios, and multi-streaming. Its guest model uses a lobby and host admission; guests can participate and share a screen but do not control the broadcast or graphics. See [StreamYard First Steps](https://support.streamyard.com/hc/en-us/articles/360043291252-First-Steps), [guest invitations](https://support.streamyard.com/hc/en-us/articles/4405100913428-How-do-I-invite-guests-to-my-stream), [guest instructions](https://support.streamyard.com/hc/en-us/articles/360043291612-Guest-instructions), [Scenes](https://support.streamyard.com/hc/en-us/articles/35584990192404/How-to-use-Scenes), and [Multi-stream](https://support.streamyard.com/hc/en-us/articles/360045622851-How-to-Multi-stream).

## Capability comparison

| Capability | StudioFlow current state | Gap to a production benchmark |
|---|---|---|
| Browser studio and local capture | Broad local implementation | Physical browser/device verification needed |
| Scenes/layouts/branding | Rich compositor and scene state | Verify every layout, resize, output, and persistence path |
| Guests | WebRTC prototype plus D1 signaling relay | RealtimeKit or equivalent production transport, TURN, reconnect and two-network tests |
| Guest screen share | Source controls exist | Verify admission, stage behavior, and failure handling |
| Audio | Mic processing, meters, mix graph, music/SFX | Validate routing, latency, device changes, echo, and final program audio |
| Recording | Program/backstage MediaRecorder and local library | Chunk durability, crash recovery, long sessions, export acceptance |
| Destinations | Local RTMP bridge and multi-output work in dirty server source | Production egress, secret handling, destination adapters, status/retry |
| Reusable studios | Local browser state | Cloud persistence, account ownership, cross-device recovery |
| Chat/comments | Local comments/private chat prototypes | Remote audience ingestion, moderation, durable state |
| Scenes as operational presets | Scene CRUD/order and compositor switching | Test save/reopen, output transition correctness, cloud persistence |
| Webinar/pre-recorded workflows | UI/prototype hints | Explicit product design and implementation required |

## Product conclusion

StudioFlow has a credible local host-studio foundation and a distinctive compositor-oriented direction. It is not yet functionally comparable to a production StreamYard workflow because the largest gaps are not cosmetic: production guest transport, broadcast egress, destination reliability, durable recording, cloud persistence, and verified recovery are still open.

